// 🎯 自定义中间件示例
import { ApiMiddleware } from './handlers/base';

// 🔐 认证中间件
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

  // 这里可以添加JWT验证逻辑
  console.log(`[${context.requestId}] 认证通过`);
  return next();
};

// 🚦 限流中间件 (简化版)
export const rateLimitMiddleware: ApiMiddleware = async (context, next) => {
  // 这里可以添加Redis限流逻辑
  console.log(`[${context.requestId}] 限流检查通过`);
  return next();
};

// 📝 增强日志中间件
export const enhancedLoggingMiddleware: ApiMiddleware = async (
  context,
  next
) => {
  const start = Date.now();
  const method = context.request.method;
  const url = context.request.url;

  console.log(`[${context.requestId}] 🚀 请求开始: ${method} ${url}`);

  try {
    const result = await next();

    const duration = Date.now() - start;
    const status = result.success ? '✅' : '❌';
    console.log(`[${context.requestId}] ${status} 请求完成: ${duration}ms`);

    return result;
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[${context.requestId}] 💥 请求异常: ${duration}ms`, error);
    throw error;
  }
};

// 🔍 请求验证中间件
export const requestValidationMiddleware: ApiMiddleware = async (
  context,
  next
) => {
  const contentType = context.request.headers.get('Content-Type');

  if (
    context.request.method === 'POST' &&
    !contentType?.includes('application/json')
  ) {
    return {
      success: false,
      error: {
        error: 'INVALID_CONTENT_TYPE',
        details: 'Content-Type必须是application/json',
      },
      timestamp: Date.now(),
      requestId: context.requestId,
    };
  }

  console.log(`[${context.requestId}] 请求验证通过`);
  return next();
};

// 📊 性能监控中间件
export const performanceMiddleware: ApiMiddleware = async (context, next) => {
  const start = process.hrtime.bigint();

  const result = await next();

  const end = process.hrtime.bigint();
  const durationMs = Number(end - start) / 1_000_000; // 转换为毫秒

  if (durationMs > 5000) {
    // 如果超过1秒
    console.warn(
      `[${context.requestId}] ⚠️ 慢请求警告: ${durationMs.toFixed(2)}ms`
    );
  }

  return result;
};
