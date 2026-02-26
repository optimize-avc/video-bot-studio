'use client';
import { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const WEBHOOK_URL = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '';

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages]);

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: 'New Video Project',
      messages: [],
      createdAt: new Date(),
    };
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !activeSessionId) return;
    const userMsg: Message = { id: uuidv4(), role: 'user', content: input.trim(), timestamp: new Date() };
    const currentInput = input;
    setInput('');
    setSessions(prev => prev.map(s => s.id === activeSessionId
      ? { ...s, messages: [...s.messages, userMsg], title: s.messages.length === 0 ? currentInput.slice(0, 40) : s.title }
      : s
    ));
    setIsLoading(true);
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sendMessage', sessionId: activeSessionId, chatInput: currentInput }),
      });
      const data = await res.json();
      const botText = data.output || data.text || data.response || JSON.stringify(data);
      const botMsg: Message = { id: uuidv4(), role: 'assistant', content: botText, timestamp: new Date() };
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, botMsg] } : s));
    } catch (err) {
      const errMsg: Message = { id: uuidv4(), role: 'assistant', content: 'Connection error. Make sure your n8n workflow is active and the webhook URL is correct.', timestamp: new Date() };
      setSessions(prev => prev.map(s => s.id === activeSessionId ? { ...s, messages: [...s.messages, errMsg] } : s));
    }
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const detectMedia = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+\.(mp4|webm|mov|gif|png|jpg|jpeg|mp3|wav))/gi;
    return text.match(urlRegex) || [];
  };

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 bg-[#111118] border-r border-gray-800 flex flex-col overflow-hidden`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg">&#9654;</div>
            <div><h1 className="font-bold text-lg">Video Bot</h1><p className="text-xs text-gray-500">Studio</p></div>
          </div>
          <button onClick={createNewSession} className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-xl font-medium transition-all text-sm">+ New Project</button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {sessions.map(s => (
            <button key={s.id} onClick={() => setActiveSessionId(s.id)} className={`w-full text-left p-3 rounded-xl mb-1 text-sm transition-all ${s.id === activeSessionId ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30' : 'hover:bg-gray-800/50 text-gray-400'}`}>
              <div className="truncate font-medium">{s.title}</div>
              <div className="text-xs text-gray-600 mt-1">{s.messages.length} messages</div>
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-gray-800 text-xs text-gray-600">Powered by n8n + GPT-4o</div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-14 border-b border-gray-800 flex items-center px-4 gap-3 bg-[#0d0d14]">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">&#9776;</button>
          <div className="flex-1"><span className="font-medium">{activeSession?.title || 'Video Bot Studio'}</span></div>
          {activeSession && <span className="text-xs px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Active</span>}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {!activeSession ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl mb-6">&#127916;</div>
              <h2 className="text-2xl font-bold mb-3">Video Bot Studio</h2>
              <p className="text-gray-500 max-w-md mb-8">Create stunning videos with AI. Generate scripts, visuals, voiceovers, and render complete videos through natural conversation.</p>
              <button onClick={createNewSession} className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium hover:from-purple-500 hover:to-pink-500 transition-all">Start Your First Project</button>
              <div className="grid grid-cols-3 gap-4 mt-10 max-w-lg">
                <div className="p-4 bg-[#111118] rounded-xl border border-gray-800"><div className="text-2xl mb-2">&#128221;</div><div className="text-xs text-gray-400">Script Generation</div></div>
                <div className="p-4 bg-[#111118] rounded-xl border border-gray-800"><div className="text-2xl mb-2">&#127912;</div><div className="text-xs text-gray-400">AI Visuals</div></div>
                <div className="p-4 bg-[#111118] rounded-xl border border-gray-800"><div className="text-2xl mb-2">&#127908;</div><div className="text-xs text-gray-400">Voiceover</div></div>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto p-4 space-y-6">
              {activeSession.messages.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-xs">AI</div>}
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-purple-600/30 border border-purple-500/20' : 'bg-[#16161f] border border-gray-800'}`}>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
                    {detectMedia(msg.content).map((url, i) => (
                      url.match(/\.(mp4|webm|mov)$/i)
                        ? <video key={i} src={url} controls className="mt-3 rounded-xl max-w-full" />
                        : url.match(/\.(mp3|wav)$/i)
                        ? <audio key={i} src={url} controls className="mt-3 w-full" />
                        : <img key={i} src={url} alt="Generated" className="mt-3 rounded-xl max-w-full" />
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex-shrink-0 flex items-center justify-center text-xs">AI</div>
                  <div className="bg-[#16161f] border border-gray-800 rounded-2xl px-4 py-3"><div className="flex gap-1.5"><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" /><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'0.15s'}} /><div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay:'0.3s'}} /></div></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        {activeSession && (
          <div className="p-4 border-t border-gray-800 bg-[#0d0d14]">
            <div className="max-w-3xl mx-auto flex gap-3">
              <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Describe the video you want to create..."
                className="flex-1 bg-[#16161f] border border-gray-700 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 placeholder-gray-600"
                rows={1} />
              <button onClick={sendMessage} disabled={!input.trim() || isLoading}
                className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl font-medium disabled:opacity-30 hover:from-purple-500 hover:to-pink-500 transition-all text-sm">
                Send
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
