'use client';

import SearchForm from '@/components/SearchForm';
import SearchResults from '@/components/SearchResults';
import { useState } from 'react';
import type { SearchResult } from '../lib';

export default function Home() {
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [aiSummary, setAiSummary] = useState<string>('');

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setIsLoading(true);
    setCurrentQuery(query);
    setAiSummary(''); // 清除之前的总结

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, topK: 100, withSummary: true }),
      });

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data?.results || []);
        setAiSummary(data.data?.summary || '');
      } else {
        console.error('搜索失败:', data.error);
        setSearchResults([]);
        setAiSummary('');
      } 
    } catch (error) {
      console.error('网络错误:', error);
      setSearchResults([]);
      setAiSummary('');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 头部标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🌟 AI 小红书搜索
          </h1>
          <p className="text-lg text-gray-600">
            基于向量语义搜索，帮你找到最相关的旅游攻略
          </p>
        </div>

        {/* 搜索表单 */}
        <div className="max-w-4xl mx-auto mb-8">
          <SearchForm onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* 搜索结果 */}
        <div className="max-w-4xl mx-auto">
          <SearchResults
            results={searchResults}
            isLoading={isLoading}
            query={currentQuery}
            summary={aiSummary}
          />
        </div>

        {/* 技术说明 */}
        <div className="max-w-4xl mx-auto mt-12 p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🚀 技术栈
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
            <div className="text-center">
              <div className="font-medium text-blue-600">DashScope</div>
              <div>文本向量化</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-green-600">DashVector</div>
              <div>向量搜索</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-purple-600">Next.js</div>
              <div>前端框架</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-orange-600">MongoDB</div>
              <div>数据存储</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}