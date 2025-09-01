// 基础API处理器 - 处理通用逻辑
import { NextRequest, NextResponse } from 'next/server';
import { validateEnv } from '../config/env';
import {
  ApiContext,
  ApiError,
  ApiException,
  ApiHandler,
  ApiHandlerConfig,
  ApiResponse,
  ParameterValidator,
  ValidationError,
} from '../types/api';

// Next.js风格的API Middleware - 洋葱模型
export type ApiMiddleware = (
  context: ApiContext,
  next: () => Promise<ApiResponse<unknown>>
) => Promise<ApiResponse<unknown>>;

// 内置中间件
export const responseFormatter: ApiMiddleware = async (context, next) => {
  try {
    const result = await next();

    // 统一响应格式 - 只包装业务数据
    return {
      success: true,
      data: result,
      timestamp: Date.now(),
      requestId: context.requestId,
    };
  } catch (error: unknown) {
    // 业务错误处理
    const apiError =
      error instanceof ApiException
        ? { error: error.code, details: error.message }
        : {
            error: 'BUSINESS_ERROR',
            details: error instanceof Error ? error.message : '业务处理失败',
          };

    return {
      success: false,
      error: apiError,
      timestamp: Date.now(),
      requestId: context.requestId,
    };
  }
};

export const errorHandler: ApiMiddleware = async (context, next) => {
  try {
    return await next();
  } catch (error: unknown) {
    console.error(`[${context.requestId}] 系统错误:`, error);

    return {
      success: false,
      error: {
        error: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : '系统内部错误',
      },
      timestamp: Date.now(),
      requestId: context.requestId,
    };
  }
};

export abstract class BaseApiHandler<TRequest = unknown, TResponse = unknown>
  implements ApiHandler<TRequest, unknown>
{
  protected config: ApiHandlerConfig;

  private middlewares: ApiMiddleware[] = [];

  constructor(config: ApiHandlerConfig = {}) {
    this.config = {
      requireAuth: false,
      validateEnv: true,
      enableLogging: true,
      timeout: 30000,
      enableCaching: false,
      ...config,
    };

    // 默认只添加errorHandler，responseFormatter由使用者控制
    this.use(errorHandler);
  }

  // 添加中间件 - 类似Express的use()
  use(middleware: ApiMiddleware) {
    this.middlewares.push(middleware);
    return this;
  }

  // 执行中间件链
  private async executeMiddlewares(
    context: ApiContext,
    data: TRequest,
    finalHandler: () => Promise<TResponse>
  ): Promise<unknown> {
    let index = -1;

    const dispatch = async (i: number): Promise<unknown> => {
      if (i <= index) {
        throw new Error('next() called multiple times');
      }
      index = i;

      if (i === this.middlewares.length) {
        // 执行最终的业务逻辑 - 直接返回结果，不包装
        // 让responseFormatter中间件来处理响应格式
        return await finalHandler();
      }

      const middleware = this.middlewares[i];
      return middleware(context, () => dispatch(i + 1));
    };

    return dispatch(0);
  }

  // 统一的请求处理入口 - 使用洋葱模型中间件
  async handle(context: ApiContext, data: TRequest): Promise<unknown> {
    const startTime = Date.now();

    // 1. 环境验证
    if (this.config.validateEnv) {
      validateEnv();
    }

    // 2. 请求前处理
    await this.beforeHandle(context, data);

    // 3. 通过中间件链执行业务逻辑
    const result = await this.executeMiddlewares(context, data, async () => {
      const businessResult = await this.process(context, data);
      await this.afterHandle(context, businessResult);
      return businessResult;
    });

    // 4. 记录耗时
    if (this.config.enableLogging) {
      const duration = Date.now() - startTime;
      console.log(`[${context.requestId}] 处理完成 - ${duration}ms`);
    }

    return result;
  }

  // 抽象方法：具体的业务逻辑处理
  protected abstract process(
    context: ApiContext,
    data: TRequest
  ): Promise<TResponse>;

  // 钩子方法：请求前处理
  protected async beforeHandle(
    context: ApiContext,
    data: TRequest
  ): Promise<void> {
    if (this.config.enableLogging) {
      console.log(`[${context.requestId}] 处理请求:`, {
        method: context.request.method,
        url: context.request.url,
        data:
          typeof data === 'object' ? JSON.stringify(data).slice(0, 200) : data,
      });
    }
  }

  // 钩子方法：响应后处理
  /* eslint-disable @typescript-eslint/no-unused-vars */
  protected async afterHandle(
    context: ApiContext,
    result: TResponse
  ): Promise<void> {
    // 子类可以重写此方法进行后处理
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  // 创建成功响应
  protected createSuccessResponse(
    data: TResponse,
    requestId: string
  ): ApiResponse<TResponse> {
    return {
      success: true,
      data,
      timestamp: Date.now(),
      requestId,
    };
  }

  // 错误处理
  protected handleError(
    error: unknown,
    requestId: string
  ): ApiResponse<TResponse> {
    console.error(`[${requestId}] API处理错误:`, error);

    let apiError: ApiError;

    if (error instanceof ApiException) {
      apiError = {
        error: error.code,
        details: error.message,
      };
    } else if (error instanceof Error) {
      // 检查是否是网络相关错误
      if (
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('timeout')
      ) {
        apiError = {
          error: 'SERVICE_UNAVAILABLE',
          details: '外部服务不可用',
        };
      } else {
        apiError = {
          error: 'INTERNAL_ERROR',
          details: error.message,
        };
      }
    } else {
      // 处理非Error类型的异常
      apiError = {
        error: 'UNKNOWN_ERROR',
        details: '未知错误',
      };
    }

    return {
      success: false,
      error: apiError,
      timestamp: Date.now(),
      requestId,
    };
  }

  // 生成请求ID
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // 参数验证
  protected validateParams(
    data: Record<string, unknown>,
    schema: Record<string, ParameterValidator>
  ): void {
    for (const [key, validator] of Object.entries(schema)) {
      if (
        validator.required &&
        (data[key] === undefined || data[key] === null)
      ) {
        throw new ValidationError(`${key} 是必需的参数`);
      }

      if (data[key] !== undefined && validator.type) {
        if (validator.type === 'string' && typeof data[key] !== 'string') {
          throw new ValidationError(`${key} 必须是字符串类型`);
        }
        if (validator.type === 'number' && typeof data[key] !== 'number') {
          throw new ValidationError(`${key} 必须是数字类型`);
        }
      }

      const value = data[key];
      if (typeof value === 'number') {
        if (validator.min !== undefined && value < validator.min) {
          throw new ValidationError(`${key} 不能小于 ${validator.min}`);
        }

        if (validator.max !== undefined && value > validator.max) {
          throw new ValidationError(`${key} 不能大于 ${validator.max}`);
        }
      }
    }
  }
}

// 创建带中间件的API处理器 - 类似Express的use()模式
export function createApiHandler<TRequest = unknown, TResponse = unknown>(
  handlerClass: new (config?: ApiHandlerConfig) => BaseApiHandler<
    TRequest,
    TResponse
  >,
  config?: ApiHandlerConfig
) {
  const handler = new handlerClass(config);

  // 返回配置好的处理器，可以继续添加中间件
  return {
    use: (middleware: ApiMiddleware) => {
      handler.use(middleware);
      return { handler, use: handler.use.bind(handler) };
    },
    handler,
  };
}

// Next.js API Route 适配器 - 支持middleware的洋葱模型
export function createApiRoute<TRequest = unknown, TResponse = unknown>(
  handler: BaseApiHandler<TRequest, TResponse>,
  config?: ApiHandlerConfig
) {
  return async function routeHandler(request: NextRequest) {
    const requestId = `req_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    try {
      // 解析请求数据
      let data: TRequest;
      if (request.method === 'GET') {
        const url = new URL(request.url);
        data = Object.fromEntries(url.searchParams) as TRequest;
      } else {
        data = await request.json();
      }

      // 创建上下文
      const context: ApiContext = {
        request,
        config: { ...config },
        requestId,
      };

      // 处理请求 - 通过完整的middleware链
      const apiResponse = await handler.handle(context, data);

      // 统一响应格式
      return NextResponse.json(apiResponse, {
        status: 200, // HTTP状态码统一为200
      });
    } catch (error: unknown) {
      console.error('API Route 系统错误:', error);

      // 系统级错误处理
      const errorMessage =
        error instanceof Error ? error.message : '系统内部错误';
      const errorResponse: ApiResponse = {
        success: false,
        error: { error: 'INTERNAL_ERROR', details: errorMessage },
        timestamp: Date.now(),
        requestId,
      };

      return NextResponse.json(errorResponse, { status: 500 });
    }
  };
}

/*
// 使用示例 - 类似Express的use()模式：

// 1. 创建基础处理器
const apiHandler = createApiHandler(SearchApiHandler, {
  validateEnv: true,
  enableLogging: true
});

// 2. 添加自定义中间件 (可选)
apiHandler
  .use(authMiddleware)        // 认证中间件
  .use(rateLimitMiddleware)   // 限流中间件
  .use(loggingMiddleware);    // 日志中间件

// 3. 创建API Route
export const POST = createApiRoute(apiHandler.handler);

// 或者使用默认中间件链：
export const POST = createApiRoute(new SearchApiHandler());
*/

// 🎯 设计优势对比

/*
之前的ResponseMiddleware (Class工具模式):
❌ ResponseMiddleware.process() - 不够直观
❌ 缺少middleware链的概念
❌ 只是静态方法调用，不是真正的middleware
❌ 不符合Next.js最佳实践

现在的设计 (函数式洋葱模型):
✅ handler.use(middleware) - 类似Express的app.use()
✅ 真正的middleware执行链，洋葱模型
✅ 函数式编程，易于测试和组合
✅ 类型安全，无any类型
✅ 符合Next.js习惯，可以轻松扩展

使用对比：

// 旧方式 - Class工具
const { response, statusCode } = ResponseMiddleware.process(apiResponse);
return NextResponse.json(response, { status: statusCode });

// 新方式 - 洋葱模型
const apiHandler = createApiHandler(SearchApiHandler);
apiHandler.use(authMiddleware).use(rateLimitMiddleware);
export const POST = createApiRoute(apiHandler.handler);
*/

// 📝 示例中间件 (你可以创建这些中间件)
/*
// 认证中间件示例
export const authMiddleware: ApiMiddleware = async (context, next) => {
  const authHeader = context.request.headers.get('Authorization');
  if (!authHeader) {
    return {
      success: false,
      error: { error: 'UNAUTHORIZED', details: '缺少认证信息' },
      timestamp: Date.now(),
      requestId: context.requestId,
    };
  }
  return next();
};

// 限流中间件示例
export const rateLimitMiddleware: ApiMiddleware = async (context, next) => {
  // 实现限流逻辑...
  console.log(`[${context.requestId}] 限流检查通过`);
  return next();
};

// 日志中间件示例
export const loggingMiddleware: ApiMiddleware = async (context, next) => {
  const start = Date.now();
  console.log(`[${context.requestId}] 请求开始: ${context.request.method}`);

  const result = await next();

  const duration = Date.now() - start;
  console.log(`[${context.requestId}] 请求完成: ${duration}ms`);

  return result;
};
*/
