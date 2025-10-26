"use client";

import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  TrendingUp,
  Users,
  Target,
  Zap,
  BarChart3,
  MessageSquare,
  Key,
  CheckCircle2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type MessageRole = 'user' | 'assistant';

interface Message {
  role: MessageRole;
  content: string;
  timestamp: Date;
}

interface GeminiAPIResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
}

const GEMINI_MODEL = 'gemini-2.5-pro';

const FEATURE_PILLS: Array<{ icon: LucideIcon; label: string }> = [
  { icon: Target, label: 'Campaigns' },
  { icon: MessageSquare, label: 'Content' },
  { icon: Users, label: 'Audience' },
  { icon: TrendingUp, label: 'Strategy' },
  { icon: Zap, label: 'Multi-channel' },
  { icon: BarChart3, label: 'Optimize' },
];

const QUICK_PROMPTS: string[] = [
  'Generate a campaign for my SaaS product',
  'Write LinkedIn post about AI marketing',
  'Create buyer persona for B2B sales',
  'Give me a content strategy',
  'Plan multi-channel campaign',
  'Optimize my email open rates',
];

const AIMarketingWizard: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>('');
  const [showApiInput, setShowApiInput] = useState<boolean>(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSetApiKey = () => {
    if (!apiKey.trim()) {
      return;
    }

    setShowApiInput(false);
    const greetingMessage: Message = {
      role: 'assistant',
      content:
        "👋 Hello! I'm your AI Marketing Wizard powered by Google Gemini. I can help you with:\n\n🎯 Campaign Generation\n✍️ Content Creation\n👥 Audience Analysis\n💡 Strategy Advisory\n📱 Multi-channel Planning\n📊 Performance Optimization\n\nWhat would you like to work on today?",
      timestamp: new Date(),
    };
    setMessages([greetingMessage]);
  };

  const systemPrompt = `You are an expert AI Marketing Wizard. You help users with:

1. CAMPAIGN GENERATION: Create comprehensive marketing campaigns with phases, channels, budgets, and expected results
2. CONTENT CREATION: Write engaging copy for ads, emails, social media posts, landing pages, etc.
3. AUDIENCE ANALYSIS: Build detailed buyer personas, segment audiences, identify pain points
4. STRATEGY ADVISORY: Provide strategic marketing recommendations based on goals and resources
5. MULTI-CHANNEL PLANNING: Coordinate campaigns across multiple marketing channels
6. PERFORMANCE OPTIMIZATION: Analyze metrics and suggest improvements

Always be:
- Specific and actionable
- Data-driven when possible
- Creative and strategic
- Concise but thorough
- Professional yet friendly

Format responses with clear sections using markdown. Use emojis sparingly for visual organization.`;

  const callGeminiAPI = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${systemPrompt}\n\nUser: ${userMessage}\n\nAssistant:`,
            }],
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      const data: GeminiAPIResponse = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      return text ?? '⚠️ Error: Received empty response from Gemini API.';
    } catch (error) {
      console.error('Gemini API Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const modelHint = errorMessage.includes('not found')
        ? `\n\nTip: Make sure the model name "${GEMINI_MODEL}" is available for your API key. See the supported models here: https://ai.google.dev/gemini-api/docs/models`
        : '';
      return `⚠️ Error: ${errorMessage}${modelHint}\n\nPlease check your API key and try again. Get your free API key at: https://ai.google.dev/`;
    }
  };

  const handleSend = async () => {
    if (!input.trim()) {
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponse = await callGeminiAPI(input);
      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const fallbackMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorMessage: Message = {
        role: 'assistant',
        content: `⚠️ An error occurred: ${fallbackMessage}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (showApiInput) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-950 text-white p-6">
        <div className="bg-neutral-900 border border-white/10 rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="flex items-center justify-center mb-6">
            <div className="border border-white/15 p-3 rounded-xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-center mb-2 tracking-tight">AI Marketing Wizard</h2>
          <p className="text-sm text-neutral-400 text-center mb-6">Powered by Google Gemini</p>

          <div className="mb-6">
            <label className="block text-xs uppercase tracking-[0.2em] text-neutral-500 mb-3">
              Enter your Gemini API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
              <input
                type="password"
                value={apiKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setApiKey(e.target.value)}
                onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    handleSetApiKey();
                  }
                }}
                placeholder="AIzaSy..."
                className="w-full bg-neutral-950 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:ring-1 focus:ring-white/30"
              />
            </div>
          </div>

          <button
            onClick={handleSetApiKey}
            disabled={!apiKey.trim()}
            className="w-full bg-white text-black py-3 rounded-lg font-medium tracking-wide uppercase text-xs hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Start Marketing Wizard
          </button>

          <div className="mt-6 p-4 border border-white/10 rounded-lg">
            <p className="text-xs text-neutral-400 mb-2">📝 Don't have an API key?</p>
            <a
              href="https://ai.google.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white underline underline-offset-4 hover:text-neutral-300"
            >
              Get your free API key from Google AI Studio →
            </a>
          </div>

          <p className="text-xs text-neutral-500 text-center mt-4">
            Your API key stays in this session only
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-neutral-950/70 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="border border-white/15 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">AI Marketing Wizard</h1>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500">Powered by Google Gemini</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-neutral-500">
              <CheckCircle2 className="w-4 h-4" />
              <span>API Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Pills */}
      <div className="border-b border-white/10">
        <div className="max-w-5xl mx-auto px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {FEATURE_PILLS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-full text-xs uppercase tracking-[0.2em] text-neutral-300">
                <Icon className="w-3 h-3" />
                <span>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {messages.length === 0 && (
            <div className="text-center py-12 border border-dashed border-white/10 rounded-2xl">
              <h3 className="text-lg font-medium text-white mb-4">Start with a brief</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {QUICK_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(prompt)}
                    className="p-4 border border-white/10 rounded-xl text-left text-sm text-neutral-200 hover:bg-white/5 transition"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div key={index} className={`mb-6 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
              <div className={`max-w-3xl ${message.role === 'user' ? 'bg-white text-black rounded-2xl rounded-tr-sm border border-white/10' : 'bg-neutral-900 border border-white/10 rounded-2xl rounded-tl-sm'} p-5 shadow-lg shadow-black/20`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed tracking-wide">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="mb-6">
              <div className="max-w-3xl bg-neutral-900 border border-white/10 rounded-2xl rounded-tl-sm p-4">
                <div className="flex gap-2 items-center text-neutral-500">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.3em]">Gemini is thinking…</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-neutral-950/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 border border-white/10 rounded-2xl p-3 bg-neutral-900/70">
              <textarea
                value={input}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Outline your brief, goals, or channel mix…"
                className="w-full bg-transparent border-none outline-none resize-none text-sm text-neutral-100 placeholder-neutral-600"
                rows={2}
              />
            </div>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="bg-white text-black p-3 rounded-xl hover:bg-neutral-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-neutral-500 mt-3 text-center">
            Powered by Google Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIMarketingWizard;
