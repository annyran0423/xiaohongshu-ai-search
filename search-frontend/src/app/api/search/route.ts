import {
  SearchApiHandler,
  createApiHandler,
  createApiRoute,
  enhancedLoggingMiddleware,
  performanceMiddleware,
  rateLimitMiddleware,
  requestValidationMiddleware,
  responseFormatter,
} from '../../../lib';

// 🎯 方法1: 使用默认中间件链 (简单场景推荐)
// const searchHandler = new SearchApiHandler();
// export const POST = createApiRoute(searchHandler, {
//   validateEnv: true,
//   enableLogging: true,
//   timeout: 30000,
// });

// 🎯 方法2: 使用createApiHandler添加自定义中间件 (复杂场景推荐 - 已启用)
const apiHandler = createApiHandler(SearchApiHandler, {
  validateEnv: true,
  enableLogging: true,
  timeout: 30000,
});

// 添加自定义中间件链 - 类似Express的app.use()
apiHandler
  .use(requestValidationMiddleware) // 🔍 请求验证
  .use(rateLimitMiddleware) // 🚦 限流
  .use(performanceMiddleware) // 📊 性能监控
  .use(enhancedLoggingMiddleware) // 📝 增强日志
  .use(responseFormatter); // 🎨 响应格式化 (必须在最后)

// 使用带完整中间件链的处理器
export const POST = createApiRoute(apiHandler.handler);

// 处理预检请求
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
