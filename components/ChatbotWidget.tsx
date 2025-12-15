'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, FileText, ChevronUp, ChevronDown } from 'lucide-react';
import { chatWithBot, ChatbotResponse } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatMessage {
  query: string;
  response: ChatbotResponse;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ChatbotResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Initialize or retrieve session ID from localStorage
  useEffect(() => {
    const storedSessionId = localStorage.getItem('chatbot_session_id');
    if (storedSessionId) {
      setSessionId(storedSessionId);
    }
  }, []);

  // Save session ID to localStorage when it changes
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('chatbot_session_id', sessionId);
    }
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) return;

    const currentQuery = query.trim();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await chatWithBot(currentQuery, sessionId || undefined);
      
      // Update session ID if returned from backend
      if (result.session_id) {
        setSessionId(result.session_id);
      }
      
      // Add to chat history (keep only last 5 pairs)
      const newMessage: ChatMessage = {
        query: currentQuery,
        response: result
      };
      setChatHistory(prev => {
        const updated = [...prev, newMessage];
        // Keep only last 5 message pairs (10 messages total)
        return updated.slice(-5);
      });
      
      setQuery('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response from chatbot');
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (isOpen) {
      setIsMinimized(!isMinimized);
    } else {
      setIsOpen(true);
      setIsMinimized(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setQuery('');
    setResponse(null);
    setError(null);
    // Note: We keep chatHistory and sessionId to maintain conversation continuity
  };

  const clearHistory = () => {
    setChatHistory([]);
    setResponse(null);
    setError(null);
    setSessionId(null);
    localStorage.removeItem('chatbot_session_id');
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-[#085e29] text-white p-4 rounded-full shadow-lg hover:bg-[#064920] transition-all hover:scale-110"
        aria-label="Open chatbot"
      >
        <MessageSquare className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 bg-white rounded-lg shadow-2xl border border-gray-200 transition-all duration-300 ${
      isMinimized ? 'w-80 h-14' : 'w-96 h-[500px]'
    } flex flex-col`}>
      {/* Header */}
      <div className="bg-[#085e29] text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Parliamentary Chatbot</span>
            <span className="text-xs text-white/80 font-normal">Alpha • Q&A Only</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            className="hover:bg-[#064920] p-1 rounded transition-colors"
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleClose}
            className="hover:bg-[#064920] p-1 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Welcome Message */}
            {chatHistory.length === 0 && !response && !error && (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <div className="mb-2">
                  <span className="inline-block bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                    ALPHA VERSION
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Ask me anything about parliamentary proceedings, bills, or documents
                </p>
                <p className="text-xs text-gray-500">
                  Currently supports question and answer only
                </p>
              </div>
            )}

            {/* Chat History - Last 5 message pairs */}
            {chatHistory.length > 0 && (
              <div className="space-y-3">
                {chatHistory.map((item, index) => (
                  <div key={index} className="space-y-2">
                    {/* User Query */}
                    <div className="flex justify-end">
                      <div className="bg-[#e0f2f1] text-gray-900 rounded-lg p-2 max-w-[85%]">
                        <p className="text-xs font-medium mb-1">You:</p>
                        <p className="text-xs whitespace-pre-wrap">{item.query}</p>
                      </div>
                    </div>

                    {/* Bot Response */}
                    <div className="flex justify-start">
                      <div className="bg-blue-50 text-gray-800 rounded-lg p-2 max-w-[85%] space-y-1">
                        <p className="text-xs font-medium mb-1">Bot:</p>
                        <p className="text-xs whitespace-pre-wrap">{item.response.answer}</p>
                        {item.response.document_url && (
                          <a
                            href={item.response.document_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[#085e29] hover:text-[#064920] transition-colors mt-1"
                          >
                            <FileText className="w-3 h-3" />
                            <span className="line-clamp-1">Source: {item.response.document_name}</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Current Response (if not yet in history) */}
            {response && chatHistory.length === 0 && (
              <div className="space-y-2">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{response.answer}</p>
                </div>
                {response.document_url && (
                  <a
                    href={response.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs text-[#085e29] hover:text-[#064920] transition-colors"
                  >
                    <FileText className="w-3 h-3" />
                    <span className="line-clamp-1">Source: {response.document_name}</span>
                  </a>
                )}
              </div>
            )}

            {/* Loading Indicator */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-700 rounded-lg p-2 max-w-[85%] flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <p className="text-xs">Thinking...</p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask a question..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 text-sm text-gray-900 placeholder:text-gray-400"
                disabled={loading}
              />
              <Button
                type="submit"
                disabled={loading || !query.trim()}
                className="bg-[#085e29] hover:bg-[#064920] text-white px-3 py-2"
                size="sm"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </form>
            {chatHistory.length > 0 && (
              <button
                onClick={clearHistory}
                className="mt-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear History
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

