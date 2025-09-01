'use client';

interface SearchResult {
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
}

export default function SearchResults({ results, isLoading, query }: SearchResultsProps) {
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

  // if (!query) {
  //   return (
  //     <div className="bg-white rounded-lg shadow-lg p-8">
  //       <div className="text-center text-gray-500">
  //         <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  //         </svg>
  //         <p>输入搜索关键词，开始 AI 智能搜索</p>
  //       </div>
  //     </div>
  //   );
  // }


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
                <button className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-200">
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
