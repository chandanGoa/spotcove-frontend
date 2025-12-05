import React, { useState } from 'react';

interface AIGeneratorProps {
  onGenerate: (userInput: string) => Promise<void>;
  loading: boolean;
}

export function AIGenerator({ onGenerate, loading }: AIGeneratorProps) {
  const [input, setInput] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      await onGenerate(input);
      setInput('');
    }
  };

  const suggestedPrompts = [
    'Create a login form',
    'Show a product card',
    'Display a user profile',
  ];

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
          AI Input
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="input" className="block text-sm font-medium text-slate-300 mb-2">
              Describe your UI
            </label>
            <textarea
              id="input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="E.g., Create a login form with email and password fields"
              className="w-full bg-slate-900/50 border border-slate-600/50 rounded-lg p-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-transparent"
              rows={4}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-600 disabled:to-slate-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Generate UI Schema'}
          </button>
        </form>
      </div>

      {/* Suggested Prompts */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-lg p-4">
        <p className="text-xs font-semibold text-slate-400 mb-3">Quick Examples:</p>
        <div className="space-y-2">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={async () => {
                await onGenerate(prompt);
              }}
              disabled={loading}
              className="w-full text-left px-3 py-2 text-sm bg-slate-700/50 hover:bg-slate-600/50 disabled:bg-slate-700/20 disabled:cursor-not-allowed border border-slate-600/30 rounded transition-all duration-200 text-slate-300 truncate"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
