// 共享服务导出文件
export { validateEnv } from './config/env';
export { DashScopeService } from './services/dashscope';
export { DashVectorService } from './services/dashvector';
export { SearchService } from './services/search';

// HTTP客户端导出
export { HttpClientFactory } from './http';

// API处理器导出
export {
  BaseApiHandler,
  createApiHandler,
  createApiRoute,
  errorHandler,
  responseFormatter,
} from './handlers/base';
export { SearchApiHandler } from './handlers/search';

// 中间件导出
export {
  authMiddleware,
  enhancedLoggingMiddleware,
  performanceMiddleware,
  rateLimitMiddleware,
  requestValidationMiddleware,
} from './middlewares';

// 重新导出类型
export type {
  ApiContext,
  ApiError,
  ApiException,
  ApiHandler,
  ApiHandlerConfig,
  ApiResponse,
  NetworkError,
  ParameterValidator,
  SearchRequest,
  SearchResponse,
  SearchResult,
  ServiceError,
  ValidationError,
  ValidationSchema,
  VectorSearchResultItem,
} from './types/api';
