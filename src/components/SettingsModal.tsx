import React, { useState, useEffect } from 'react';
import { X, Key, Settings, Info, Check } from 'lucide-react';
import { ApiKeys } from '@/utils/ai';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keys: ApiKeys) => void;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
  const [provider, setProvider] = useState<'openai' | 'gemini' | 'groq' | 'cerebras'>('openai');
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [groqKey, setGroqKey] = useState('');
  const [cerebrasKey, setCerebrasKey] = useState('');
  const [openaiModel, setOpenaiModel] = useState('gpt-4o-mini');
  const [geminiModel, setGeminiModel] = useState('gemini-3.5-flash');
  const [groqModel, setGroqModel] = useState('llama-3.3-70b-versatile');
  const [cerebrasModel, setCerebrasModel] = useState('gpt-oss-120b');
  const [isCustomCerebras, setIsCustomCerebras] = useState(false);
  const [customCerebrasModel, setCustomCerebrasModel] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load keys from localStorage on mount
    const savedProvider = localStorage.getItem('cs_ai_provider') as 'openai' | 'gemini' | 'groq' | 'cerebras' | null;
    const savedOpenaiKey = localStorage.getItem('cs_openai_key') || '';
    const savedGeminiKey = localStorage.getItem('cs_gemini_key') || '';
    const savedGroqKey = localStorage.getItem('cs_groq_key') || '';
    const savedCerebrasKey = localStorage.getItem('cs_cerebras_key') || '';
    const savedOpenaiModel = localStorage.getItem('cs_openai_model') || 'gpt-4o-mini';
    const savedGeminiModel = localStorage.getItem('cs_gemini_model') || 'gemini-3.5-flash';
    const savedGroqModel = localStorage.getItem('cs_groq_model') || 'llama-3.3-70b-versatile';
    const savedCerebrasModel = localStorage.getItem('cs_cerebras_model') || 'gpt-oss-120b';

    if (savedProvider) setProvider(savedProvider);
    setOpenaiKey(savedOpenaiKey);
    setGeminiKey(savedGeminiKey);
    setGroqKey(savedGroqKey);
    setCerebrasKey(savedCerebrasKey);
    setOpenaiModel(savedOpenaiModel);
    setGeminiModel(savedGeminiModel);
    setGroqModel(savedGroqModel);
    
    if (savedCerebrasModel !== 'gpt-oss-120b' && savedCerebrasModel !== 'zai-glm-4.7') {
      setIsCustomCerebras(true);
      setCustomCerebrasModel(savedCerebrasModel);
      setCerebrasModel('custom');
    } else {
      setIsCustomCerebras(false);
      setCerebrasModel(savedCerebrasModel);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    const activeCerebrasModel = cerebrasModel === 'custom' ? customCerebrasModel.trim() : cerebrasModel;

    const keys: ApiKeys = {
      provider,
      openaiKey: openaiKey.trim(),
      geminiKey: geminiKey.trim(),
      groqKey: groqKey.trim(),
      cerebrasKey: cerebrasKey.trim(),
      openaiModel,
      geminiModel,
      groqModel,
      cerebrasModel: activeCerebrasModel,
    };

    // Save to localStorage
    localStorage.setItem('cs_ai_provider', provider);
    localStorage.setItem('cs_openai_key', openaiKey.trim());
    localStorage.setItem('cs_gemini_key', geminiKey.trim());
    localStorage.setItem('cs_groq_key', groqKey.trim());
    localStorage.setItem('cs_cerebras_key', cerebrasKey.trim());
    localStorage.setItem('cs_openai_model', openaiModel);
    localStorage.setItem('cs_gemini_model', geminiModel);
    localStorage.setItem('cs_groq_model', groqModel);
    localStorage.setItem('cs_cerebras_model', activeCerebrasModel);

    onSave(keys);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const handleClear = () => {
    localStorage.removeItem('cs_ai_provider');
    localStorage.removeItem('cs_openai_key');
    localStorage.removeItem('cs_gemini_key');
    localStorage.removeItem('cs_groq_key');
    localStorage.removeItem('cs_cerebras_key');
    localStorage.removeItem('cs_openai_model');
    localStorage.removeItem('cs_gemini_model');
    localStorage.removeItem('cs_groq_model');
    localStorage.removeItem('cs_cerebras_model');
    setOpenaiKey('');
    setGeminiKey('');
    setGroqKey('');
    setCerebrasKey('');
    setOpenaiModel('gpt-4o-mini');
    setGeminiModel('gemini-3.5-flash');
    setGroqModel('llama-3.3-70b-versatile');
    setCerebrasModel('gpt-oss-120b');
    setCustomCerebrasModel('');
    setIsCustomCerebras(false);
    onSave({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md glass-panel glass-panel-glow rounded-2xl overflow-hidden border-zinc-700/60 shadow-2xl bg-zinc-950/95 border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
          <div className="flex items-center gap-2 text-zinc-100 font-semibold">
            <Settings className="w-5 h-5 text-brand-violet" />
            <span>AI Provider Settings</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-1 hover:bg-zinc-800/85 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 flex gap-3 text-zinc-350 text-xs">
            <Info className="w-5 h-5 text-brand-cyan shrink-0 mt-0.5" />
            <p>
              Your API keys are stored **locally in your browser** and are only sent directly to selected inference APIs. If left blank, the app runs in **Demo Mode** using high-fidelity mock scoring.
            </p>
          </div>

          {/* Provider selector */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">AI Model Provider</label>
            <div className="grid grid-cols-4 gap-1 bg-zinc-900/60 p-1 rounded-xl border border-zinc-800">
              <button
                type="button"
                onClick={() => setProvider('openai')}
                className={`py-2 px-1 rounded-lg text-[10px] font-semibold transition-all ${
                  provider === 'openai'
                    ? 'bg-brand-violet text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
                }`}
              >
                OpenAI
              </button>
              <button
                type="button"
                onClick={() => setProvider('gemini')}
                className={`py-2 px-1 rounded-lg text-[10px] font-semibold transition-all ${
                  provider === 'gemini'
                    ? 'bg-brand-violet text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
                }`}
              >
                Gemini
              </button>
              <button
                type="button"
                onClick={() => setProvider('groq')}
                className={`py-2 px-1 rounded-lg text-[10px] font-semibold transition-all ${
                  provider === 'groq'
                    ? 'bg-brand-violet text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
                }`}
              >
                Groq
              </button>
              <button
                type="button"
                onClick={() => setProvider('cerebras')}
                className={`py-2 px-1 rounded-lg text-[10px] font-semibold transition-all ${
                  provider === 'cerebras'
                    ? 'bg-brand-violet text-white shadow-md'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850/50'
                }`}
              >
                Cerebras
              </button>
            </div>
          </div>

          {/* API Key inputs */}
          <div className="space-y-4">
            {provider === 'openai' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-zinc-355 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-brand-violet" />
                      OpenAI API Key
                    </label>
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-cyan hover:underline"
                    >
                      Get Key
                    </a>
                  </div>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-4 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-brand-violet placeholder-zinc-650 transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Model Selection</label>
                  <select
                    value={openaiModel}
                    onChange={(e) => setOpenaiModel(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-brand-violet"
                  >
                    <option value="gpt-4o-mini">gpt-4o-mini (Default)</option>
                    <option value="gpt-4o">gpt-4o (Flagship)</option>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                  </select>
                </div>
              </div>
            )}

            {provider === 'gemini' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-zinc-355 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-brand-violet" />
                      Gemini API Key
                    </label>
                    <a
                      href="https://aistudio.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-cyan hover:underline"
                    >
                      Get Key
                    </a>
                  </div>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="AIzaSy..."
                    className="w-full px-4 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-brand-violet placeholder-zinc-650 transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Model Selection</label>
                  <select
                    value={geminiModel}
                    onChange={(e) => setGeminiModel(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-brand-violet"
                  >
                    <option value="gemini-3.5-flash">gemini-3.5-flash (Default)</option>
                    <option value="gemini-2.5-flash-lite">gemini-2.5-flash-lite (Flash Lite)</option>
                    <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Cost-efficient)</option>
                    <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Reasoning)</option>
                  </select>
                </div>
              </div>
            )}

            {provider === 'groq' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-zinc-350 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-brand-violet" />
                      Groq API Key
                    </label>
                    <a
                      href="https://console.groq.com/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-cyan hover:underline"
                    >
                      Get Key
                    </a>
                  </div>
                  <input
                    type="password"
                    value={groqKey}
                    onChange={(e) => setGroqKey(e.target.value)}
                    placeholder="gsk_..."
                    className="w-full px-4 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-brand-violet placeholder-zinc-650 transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Model Selection</label>
                  <select
                    value={groqModel}
                    onChange={(e) => setGroqModel(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-brand-violet"
                  >
                    <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Default)</option>
                    <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fast)</option>
                  </select>
                </div>
              </div>
            )}

            {provider === 'cerebras' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-zinc-355 flex items-center gap-1.5">
                      <Key className="w-4 h-4 text-brand-violet" />
                      Cerebras API Key
                    </label>
                    <a
                      href="https://cloud.cerebras.ai"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-brand-cyan hover:underline"
                    >
                      Get Key
                    </a>
                  </div>
                  <input
                    type="password"
                    value={cerebrasKey}
                    onChange={(e) => setCerebrasKey(e.target.value)}
                    placeholder="csk-..."
                    className="w-full px-4 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-200 text-sm focus:outline-none focus:border-brand-violet placeholder-zinc-650 transition-all font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Model Selection</label>
                  <select
                    value={cerebrasModel}
                    onChange={(e) => {
                      const val = e.target.value;
                      setCerebrasModel(val);
                      if (val === 'custom') {
                        setIsCustomCerebras(true);
                      } else {
                        setIsCustomCerebras(false);
                      }
                    }}
                    className="w-full px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-brand-violet"
                  >
                    <option value="gpt-oss-120b">gpt-oss-120b (Default)</option>
                    <option value="zai-glm-4.7">zai-glm-4.7 (Preview)</option>
                    <option value="custom">Custom Endpoint Model ID</option>
                  </select>
                </div>

                {isCustomCerebras && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Custom Model ID / Endpoint</label>
                    <input
                      type="text"
                      value={customCerebrasModel}
                      onChange={(e) => setCustomCerebrasModel(e.target.value)}
                      placeholder="e.g. llama-3.3-70b"
                      className="w-full px-4 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-zinc-250 text-sm focus:outline-none focus:border-brand-violet placeholder-zinc-650 transition-all font-mono"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/40 border-t border-zinc-800">
          <button
            type="button"
            onClick={handleClear}
            className="text-xs text-rose-400 hover:underline"
          >
            Clear Stored Keys
          </button>
          
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className={`px-4 py-2 text-sm font-medium rounded-xl flex items-center gap-1.5 transition-all ${
                isSaved
                  ? 'bg-brand-emerald text-white'
                  : 'bg-brand-violet hover:bg-brand-violet/90 text-white shadow-lg shadow-brand-violet/20'
              }`}
            >
              {isSaved ? (
                <>
                  <Check className="w-4 h-4 animate-scale" />
                  Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
