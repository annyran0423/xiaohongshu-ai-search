// API 相关类型定义

export interface SearchRequest {
  query: string;
  topK?: number;
  withSummary?: boolean; // 是否需要AI总结
  customPrompt?: string; // 自定义总结提示词
  summaryOptions?: {
    max_tokens?: number;
    temperature?: number;
    model?: string;
  };
}

export interface SearchResult {
  url: string;
  id: string;
  score: number;
  title: string;
  content: string;
  noteId: string;
}

export interface SearchResponse {
  success: boolean;
  query: string;
  totalResults: number;
  results: SearchResult[];
  summary?: string; // AI生成的总结（可选）
}

export interface ApiError {
  error: string;
  details?: string;
}

// 统一的错误类型
export class ApiException extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;

  constructor(
    code: string,
    message: string,
    statusCode: number = 500,
    details?: any
  ) {
    super(message);
    this.name = 'ApiException';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

// 网络错误类型
export class NetworkError extends ApiException {
  constructor(message: string, details?: any) {
    super('NETWORK_ERROR', message, 503, details);
    this.name = 'NetworkError';
  }
}

// 验证错误类型
export class ValidationError extends ApiException {
  constructor(message: string, details?: any) {
    super('VALIDATION_ERROR', message, 400, details);
    this.name = 'ValidationError';
  }
}

// 服务错误类型
export class ServiceError extends ApiException {
  constructor(message: string, details?: any) {
    super('SERVICE_ERROR', message, 502, details);
    this.name = 'ServiceError';
  }
}

// DashScope API 类型
export interface EmbeddingRequest {
  model: string;
  input: string;
  encoding_format: string;
}

export interface EmbeddingResponse {
  data: Array<{
    embedding: number[];
  }>;
}

// DashVector API 类型
export interface VectorSearchRequest {
  vector: number[];
  topk: number;
  include_vector: boolean;
  include_fields: boolean;
}

export interface VectorSearchResponse {
  code: number;
  message?: string;
  output?: Array<{
    id: string;
    score: number;
    fields: {
      title?: string;
      content?: string;
      noteId?: string;
    };
  }>;
}

// DashVector搜索结果项类型
export interface VectorSearchResultItem {
  id: string;
  score: number;
  fields?: {
    title?: string;
    content?: string;
    noteId?: string;
    url?: string;
  };
}

// 统一的API处理器架构
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: number;
  requestId?: string;
}

export interface ApiHandlerConfig {
  requireAuth?: boolean;
  validateEnv?: boolean;
  enableLogging?: boolean;
  timeout?: number;
  enableCaching?: boolean;
}

export interface ApiContext {
  request: Request;
  params?: Record<string, string>;
  config: ApiHandlerConfig;
  requestId: string;
}

export interface ApiHandler<TRequest = any, TResponse = any> {
  handle(context: ApiContext, data: TRequest): Promise<unknown>;
}

// HTTP 方法类型
export type HttpMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTIONS';

// 参数验证器接口
export interface ParameterValidator {
  required?: boolean;
  type?: 'string' | 'number' | 'boolean';
  min?: number;
  max?: number;
  pattern?: RegExp;
}

// 参数验证模式
export interface ValidationSchema {
  [key: string]: ParameterValidator;
}

// API 路由配置
export interface ApiRouteConfig {
  method: HttpMethod;
  path: string;
  handler: ApiHandler;
  config?: ApiHandlerConfig;
}
