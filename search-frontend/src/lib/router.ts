// API路由管理器 - 统一管理所有API路由
import { NextRequest, NextResponse } from 'next/server';
import { BaseApiHandler } from './handlers/base';
import { ApiHandler, ApiHandlerConfig, ApiRouteConfig } from './types/api';

export class ApiRouter {
  private routes: Map<string, Map<string, ApiRouteConfig>> = new Map();

  // 注册路由
  register<TRequest = any, TResponse = any>(
    method: string,
    path: string,
    handler:
      | BaseApiHandler<TRequest, TResponse>
      | ApiHandler<TRequest, TResponse>,
    config?: ApiHandlerConfig
  ): void {
    if (!this.routes.has(method)) {
      this.routes.set(method, new Map());
    }

    const methodRoutes = this.routes.get(method)!;
    methodRoutes.set(path, {
      method: method as any,
      path,
      handler: handler as ApiHandler,
      config: {
        requireAuth: false,
        validateEnv: true,
        enableLogging: true,
        timeout: 30000,
        ...config,
      },
    });
  }

  // 创建路由处理函数
  createHandler(method: string, path: string) {
    return async (request: NextRequest) => {
      try {
        const routeConfig = this.getRouteConfig(method, path);
        if (!routeConfig) {
          return NextResponse.json(
            { error: 'Route not found' },
            { status: 404 }
          );
        }

        const requestId = `req_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        // 解析请求数据
        let data: Record<string, unknown>;
        if (method === 'GET') {
          const url = new URL(request.url);
          data = Object.fromEntries(url.searchParams);
        } else {
          data = await request.json();
        }

        // 创建上下文
        const context = {
          request: request as any,
          config: routeConfig.config || {},
          requestId,
        };

        // 处理请求
        const response = await routeConfig.handler.handle(context, data);

        // 返回响应
        return NextResponse.json(response, {
          status: response.success ? 200 : 400,
        });
      } catch (error: any) {
        console.error('Router 错误:', error);
        return NextResponse.json(
          {
            success: false,
            error: { error: 'INTERNAL_ERROR', details: error.message },
            timestamp: Date.now(),
          },
          { status: 500 }
        );
      }
    };
  }

  // 获取路由配置
  private getRouteConfig(
    method: string,
    path: string
  ): ApiRouteConfig | undefined {
    const methodRoutes = this.routes.get(method);
    if (!methodRoutes) return undefined;

    return methodRoutes.get(path);
  }

  // 获取所有路由
  getRoutes(): Array<{ method: string; path: string; config: ApiRouteConfig }> {
    const allRoutes: Array<{
      method: string;
      path: string;
      config: ApiRouteConfig;
    }> = [];

    for (const [method, methodRoutes] of this.routes.entries()) {
      for (const [path, config] of methodRoutes.entries()) {
        allRoutes.push({ method, path, config });
      }
    }

    return allRoutes;
  }

  // 批量注册路由
  registerRoutes(
    routes: Array<{
      method: string;
      path: string;
      handler: BaseApiHandler | ApiHandler;
      config?: ApiHandlerConfig;
    }>
  ): void {
    routes.forEach((route) => {
      this.register(route.method, route.path, route.handler, route.config);
    });
  }
}

// 创建全局路由实例
export const apiRouter = new ApiRouter();

// 便捷注册函数
export function registerApiRoute<TRequest = any, TResponse = any>(
  method: string,
  path: string,
  handler: BaseApiHandler<TRequest, TResponse>,
  config?: ApiHandlerConfig
) {
  apiRouter.register(method, path, handler, config);
}

// 便捷路由创建函数
export function createApiHandler(method: string, path: string) {
  return apiRouter.createHandler(method, path);
}
