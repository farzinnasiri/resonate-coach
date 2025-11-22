import React, { useState } from 'react';
import { Key, ArrowRight } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { toast } from 'sonner';
// Removed list models utility import

interface TokenSetupProps {
  onComplete?: () => void;
}

export const TokenSetup: React.FC<TokenSetupProps> = ({ onComplete }) => {
  const [apiKey, setApiKey] = useState('');
  const [openaiKey, setOpenaiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Removed list models state
  const { setApiToken, setOpenAIToken } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey.trim() && !openaiKey.trim()) {
      toast.error('Please enter at least one API key');
      return;
    }

    setIsLoading(true);

    try {
      // Test Google key
      const response = apiKey.trim() ? await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Hello'
            }]
          }]
        })
      }) : null;

      if (response) {
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          const message = payload?.error?.message || 'Invalid Google API key or access denied';
          throw new Error(message);
        }
      }

      // Optionally test OpenAI key
      if (openaiKey.trim()) {
        const oaiResp = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'gpt-5.1-chat-latest',
            messages: [{ role: 'user', content: 'Hello' }],
            max_completion_tokens: 8,
          }),
        });
        const oaiPayload = await oaiResp.json().catch(() => null);
        if (!oaiResp.ok) {
          const message = oaiPayload?.error?.message || 'Invalid OpenAI API key';
          throw new Error(message);
        }
      }

      // Save keys
      if (apiKey.trim()) setApiToken(apiKey.trim());
      if (openaiKey.trim()) setOpenAIToken?.(openaiKey.trim());
      toast.success('API key saved successfully!');
      onComplete?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to validate API key';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    toast.info('You can configure your API key later in settings');
    onComplete?.();
  };

  // Removed list models handler

  return (
    <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <Key className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Resonate Coach
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Get started by configuring your Google Gemini and OpenAI API keys
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Google Gemini API Key
              </label>
              <input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            <div>
              <label htmlFor="openaiKey" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                OpenAI API Key
              </label>
              <input
                id="openaiKey"
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder="Enter your OpenAI API key"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                disabled={isLoading}
              />
            </div>

            {/* Removed Gemini tooltip/help panel per request */}

            <button
              type="submit"
              disabled={isLoading || (!apiKey.trim() && !openaiKey.trim())}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Validating...</span>
                </>
              ) : (
                <>
                  <span>Save API Key</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <button
            onClick={handleSkip}
            className="w-full mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm font-medium py-2 transition-colors duration-200"
          >
            Skip for now
          </button>

          {/* Removed List available models button */}
        </div>
      </div>
    </div>
  );
};
