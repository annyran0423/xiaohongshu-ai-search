// 环境变量配置
export const env = {
  dashscope: {
    apiKey: process.env.DASHSCOPE_API_KEY,
    endpoint: process.env.DASHSCOPE_ENDPOINT || 'dashscope.aliyuncs.com',
  },
  dashvector: {
    apiKey: process.env.DASHVECTOR_API_KEY,
    endpoint: process.env.DASHVECTOR_ENDPOINT,
  },
} as const;

// 验证环境变量
export function validateEnv() {
  const missing = [];

  if (!env.dashscope.apiKey) missing.push('DASHSCOPE_API_KEY');
  if (!env.dashvector.apiKey) missing.push('DASHVECTOR_API_KEY');
  if (!env.dashvector.endpoint) missing.push('DASHVECTOR_ENDPOINT');

  if (missing.length > 0) {
    throw new Error(`缺少必要的环境变量: ${missing.join(', ')}`);
  }
}
