'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface SearchResult {
  url: string;
  id: string;
  score: number;
  title: string;
  content: string;
  noteId: string;
}

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  query: string;
  summary?: string; // AI 生成的总结
}

export default function SearchResults({ results, isLoading, query, summary }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">AI 正在分析您的搜索请求...</p>
          <p className="text-sm text-gray-500 mt-2">这可能需要几秒钟</p>
        </div>
      </div>
    );
  }


  return results?.length > 0 ? (
    <div className="space-y-4">
      {/* 搜索结果统计 */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            搜索结果
          </h2>
          <span className="text-sm text-gray-500">
            找到 {results.length} 条相关攻略
          </span>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          关于 &ldquo;<span className="font-medium text-blue-600">{query}</span>&rdquo; 的搜索结果
        </p>
      </div>

      {/* AI 总结区域 */}
      {summary && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg shadow-sm p-6 mb-4">
          <div className="flex items-center mb-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🤖</span>
              <h3 className="text-lg font-semibold text-gray-900">
                AI 智能总结
              </h3>
            </div>
            <div className="ml-auto flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                通义千问生成
              </span>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-gray-700">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              // components={{
              //   h1: ({ children }) => (
              //     <h1 className="text-xl font-bold text-gray-900 mb-3 mt-4 first:mt-0">
              //       {children}
              //     </h1>
              //   ),
              //   h2: ({ children }) => (
              //     <h2 className="text-lg font-semibold text-gray-900 mb-2 mt-3">
              //       {children}
              //     </h2>
              //   ),
              //   h3: ({ children }) => (
              //     <h3 className="text-base font-medium text-gray-900 mb-2 mt-3">
              //       {children}
              //     </h3>
              //   ),
              //   p: ({ children }) => (
              //     <p className="mb-3 leading-relaxed text-gray-700">
              //       {children}
              //     </p>
              //   ),
              //   ul: ({ children }) => (
              //     <ul className="mb-3 ml-4 list-disc text-gray-700">
              //       {children}
              //     </ul>
              //   ),
              //   ol: ({ children }) => (
              //     <ol className="mb-3 ml-4 list-decimal text-gray-700">
              //       {children}
              //     </ol>
              //   ),
              //   li: ({ children }) => (
              //     <li className="mb-1 leading-relaxed">
              //       {children}
              //     </li>
              //   ),
              //   strong: ({ children }) => (
              //     <strong className="font-semibold text-gray-900">
              //       {children}
              //     </strong>
              //   ),
              //   em: ({ children }) => (
              //     <em className="italic text-gray-700">
              //       {children}
              //     </em>
              //   ),
              //   blockquote: ({ children }) => (
              //     <blockquote className="border-l-4 border-purple-200 pl-4 italic text-gray-600 mb-3">
              //       {children}
              //     </blockquote>
              //   ),
              //   code: ({ children }) => (
              //     <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">
              //       {children}
              //     </code>
              //   ),
              //   pre: ({ children }) => (
              //     <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-3 text-sm">
              //       {children}
              //     </pre>
              //   ),
              // }}
            >
              {/* 处理可能的代码块包裹问题 */}
              {(() => {
                let processedSummary = summary;

                // 移除可能的代码块包裹
                if (processedSummary.startsWith('```markdown') && processedSummary.endsWith('```')) {
                  processedSummary = processedSummary.slice(11, -3).trim();
                } else if (processedSummary.startsWith('```') && processedSummary.endsWith('```')) {
                  processedSummary = processedSummary.slice(3, -3).trim();
                }

                return processedSummary;
              })()}
            </ReactMarkdown>
          </div>

          {/* 总结操作按钮 */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-purple-200">
            <div className="flex space-x-2">
              <button className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors duration-200">
                📋 复制总结
              </button>
              <button className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors duration-200">
                💬 继续对话
              </button>
            </div>
            <div className="text-xs text-gray-500">
              基于 {results.length} 条搜索结果生成
            </div>
          </div>
        </div>
      )}

      {/* 搜索结果列表 */}
      <div className="space-y-3">
        {results.map((result, index) => (
          <div
            key={result.id}
            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6"
          >
            {/* 相似度评分 */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  #{index + 1}
                </span>
                <span className="text-sm text-gray-500">
                  相似度: {(result.score * 100).toFixed(1)}%
                </span>
              </div>
              <div className="text-xs text-gray-400">
                ID: {result.noteId}
              </div>
            </div>

            {/* 标题 */}
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {result.title}
            </h3>

            {/* 内容预览 */}
            <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
              {result.content}
            </p>

            {/* 操作按钮 */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
              <div className="flex space-x-2">
                <button className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200" onClick={() => window.open(result.url || '', '_blank')}>
                  📖 阅读全文
                </button>
                <button className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors duration-200">
                  ⭐ 收藏
                </button>
              </div>
              <div className="text-xs text-gray-400">
                AI 推荐
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 底部提示 */}
      <div className="bg-blue-50 rounded-lg p-4 text-center">
        <p className="text-sm text-blue-600">
          💡 提示：AI 会根据语义相似度为您推荐最相关的攻略，不仅仅是关键词匹配
        </p>
      </div>
    </div>
  ) : (<></>);
}
