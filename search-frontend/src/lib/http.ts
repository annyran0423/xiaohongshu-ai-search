// HTTP客户端工厂 - 优雅的axios实例管理
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface HttpClientConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
  auth?: {
    token?: string;
    apiKey?: string;
    bearer?: string;
  };
}

// HTTP客户端类
export class HttpClient {
  private instance: AxiosInstance;

  constructor(config: HttpClientConfig) {
    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });

    // 设置认证头
    if (config.auth) {
      this.setupAuth(config.auth);
    }

    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 可以在这里添加请求日志或其他处理
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        // 可以在这里统一处理错误
        return Promise.reject(error);
      }
    );
  }

  // 设置认证
  private setupAuth(auth: HttpClientConfig['auth']): void {
    if (auth?.bearer) {
      this.instance.defaults.headers.common[
        'Authorization'
      ] = `Bearer ${auth.bearer}`;
    } else if (auth?.token) {
      this.instance.defaults.headers.common[
        'Authorization'
      ] = `Token ${auth.token}`;
    } else if (auth?.apiKey) {
      this.instance.defaults.headers.common['Authorization'] = auth.apiKey;
    }
  }

  // GET请求
  async get<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.get<T>(url, config);
  }

  // POST请求
  async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.post<T>(url, data, config);
  }

  // PUT请求
  async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.put<T>(url, data, config);
  }

  // DELETE请求
  async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.delete<T>(url, config);
  }

  // PATCH请求
  async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.instance.patch<T>(url, data, config);
  }

  // 获取原始axios实例（如果需要更多控制）
  getAxiosInstance(): AxiosInstance {
    return this.instance;
  }
}

// HTTP客户端工厂
export class HttpClientFactory {
  private static clients: Map<string, HttpClient> = new Map();

  // 创建DashScope客户端
  static createDashScopeClient(apiKey: string, endpoint: string): HttpClient {
    const clientKey = `dashscope-${endpoint}`;

    if (!this.clients.has(clientKey)) {
      const client = new HttpClient({
        baseURL: `https://${endpoint}`,
        timeout: 30000,
        auth: {
          bearer: apiKey,
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      this.clients.set(clientKey, client);
    }

    return this.clients.get(clientKey)!;
  }

  // 创建DashVector客户端
  static createDashVectorClient(apiKey: string, endpoint: string): HttpClient {
    const clientKey = `dashvector-${endpoint}`;

    if (!this.clients.has(clientKey)) {
      const client = new HttpClient({
        baseURL: `https://${endpoint}`,
        timeout: 30000,
        headers: {
          'dashvector-auth-token': apiKey,
          'Content-Type': 'application/json',
        },
      });
      this.clients.set(clientKey, client);
    }

    return this.clients.get(clientKey)!;
  }

  // 创建通用HTTP客户端
  static createClient(config: HttpClientConfig): HttpClient {
    const clientKey = `generic-${config.baseURL}`;

    if (!this.clients.has(clientKey)) {
      const client = new HttpClient(config);
      this.clients.set(clientKey, client);
    }

    return this.clients.get(clientKey)!;
  }

  // 清理所有客户端
  static clearAll(): void {
    this.clients.clear();
  }
}
