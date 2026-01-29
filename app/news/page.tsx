'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { fetchNews, NewsArticle } from '@/lib/api';

const NEWS_CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'latest_blogs', label: 'Latest on Blogs' },
  { value: 'news_updates', label: 'News and Updates' },
  { value: 'parliament', label: 'Parliament News' },
  { value: 'governance', label: 'Governance' },
  { value: 'accountability', label: 'Accountability' },
];

export default function NewsPage() {
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      const filters: { category?: string; search?: string } = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();

      const data = await fetchNews(1, 12, filters);
      setNewsArticles(data.results);
      setHasMore(data.next !== null);
      setPage(1);
      setError(null);
    } catch (err) {
      setError('Failed to load news articles. Please try again later.');
      console.error('Error fetching news:', err);
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [debouncedSearch, selectedCategory]);

  // Load news when filters change
  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const loadMore = async () => {
    if (loadingMore) return;

    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      const filters: { category?: string; search?: string } = {};
      if (selectedCategory) filters.category = selectedCategory;
      if (debouncedSearch.trim()) filters.search = debouncedSearch.trim();

      const data = await fetchNews(nextPage, 12, filters);
      setNewsArticles([...newsArticles, ...data.results]);
      setHasMore(data.next !== null);
      setPage(nextPage);
    } catch (err) {
      setError('Failed to load more articles.');
      console.error('Error fetching more news:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Show full page loading only on initial load
  if (initialLoad && loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8]">
        <main className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <p className="text-gray-600">Loading news articles...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && newsArticles.length === 0 && !initialLoad) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8]">
        <main className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] py-12">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
                If it happened in Parliament, it&apos;s right here
              </h1>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-8 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search news articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:border-transparent text-gray-800 bg-white shadow-sm"
                    />
                    <svg
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Category Filter */}
                <div className="md:w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:border-transparent text-gray-800 bg-white cursor-pointer shadow-sm"
                  >
                    {NEWS_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 shadow-sm inline-block mb-4">
                <p className="font-medium">{error}</p>
              </div>
              <button
                onClick={loadNews}
                className="bg-[#2d5016] text-white px-6 py-2 rounded-lg hover:bg-[#1b3d26] transition-colors shadow-sm hover:shadow-md"
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8]">
      <main className="bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              If it happened in Parliament, it&apos;s right here
            </h1>
          </div>

          {/* Search and Filter Section */}
          <div className="mb-8 bg-gradient-to-br from-[#fafaf8] to-[#f5f0e8] rounded-xl shadow-md border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search news articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:border-transparent text-gray-800 bg-white shadow-sm"
                  />
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:w-64">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2d5016] focus:border-transparent text-gray-800 bg-white cursor-pointer shadow-sm"
                >
                  {NEWS_CATEGORIES.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5016]"></div>
              <p className="text-gray-600 mt-4">Loading news articles...</p>
            </div>
          ) : newsArticles.length === 0 ? (
            <div className="text-center text-gray-600 py-12 bg-white rounded-xl shadow-md border border-gray-200">
              <p className="text-lg mb-2 font-medium">
                {debouncedSearch || selectedCategory
                  ? 'No news articles found matching your criteria.'
                  : 'No news articles available at the moment.'}
              </p>
              {(debouncedSearch || selectedCategory) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('');
                  }}
                  className="mt-4 text-[#2d5016] hover:text-[#1b3d26] font-medium hover:underline transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {newsArticles.map((article, index) => (
                  <Link
                    key={article.id}
                    href={`/news/${article.slug}`}
                    className="relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer h-full min-h-[300px] flex flex-col hover:scale-[1.02] hover:-translate-y-1 animate-fade-in-up group"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
                  >
                    <img
                      src={article.image 
                        ? (article.image.startsWith('http') ? article.image : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:8000'}${article.image}`)
                        : '/images/default-news.jpg'
                      }
                      alt={article.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Dark gradient overlay at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    {/* Content overlay */}
                    <div className="relative mt-auto p-4 z-10">
                      <h3 className="font-bold text-white text-sm mb-3 line-clamp-3">
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-white/90 mb-2">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span>{formatDate(article.published_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-white/90">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span>{article.author}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="bg-[#2d5016] text-white px-8 py-3 rounded-lg hover:bg-[#1b3d26] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading...
                      </span>
                    ) : (
                      'Load More Articles'
                    )}
                  </button>
                </div>
              )}
            </>
          )}

          {error && newsArticles.length > 0 && (
            <div className="mt-4 text-center">
              <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 shadow-sm inline-block">
                <p className="font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}