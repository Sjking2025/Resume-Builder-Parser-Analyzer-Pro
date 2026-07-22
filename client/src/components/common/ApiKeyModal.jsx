import React, { useState, useEffect } from 'react';
import { FaCog, FaKey, FaTimes } from 'react-icons/fa';

const ApiKeyModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-1.5-pro');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('customApiKey');
    if (stored) setApiKey(stored);
    
    const storedModel = sessionStorage.getItem('customAiModel');
    if (storedModel) setModel(storedModel);
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      sessionStorage.setItem('customApiKey', apiKey.trim());
    } else {
      sessionStorage.removeItem('customApiKey');
    }
    
    sessionStorage.setItem('customAiModel', model);
    
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsOpen(false);
    }, 1000);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gray-900 text-white p-4 rounded-full shadow-2xl hover:bg-gray-800 hover:scale-110 transition-all z-50 flex items-center justify-center group"
        title="AI Settings"
      >
        <FaCog className="text-xl group-hover:rotate-90 transition-transform duration-500" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-6 flex justify-between items-center text-white">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <FaKey className="text-primary-400" /> AI API Settings
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <FaTimes size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Provide your own API key to power the AI features. This key is stored securely in your browser's current session and is <strong>never</strong> saved to our servers.
              </p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Google Gemini or OpenRouter API Key
                  </label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="sk-or-... or AIza..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Starts with <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">sk-or-</code> for OpenRouter or <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">AIza</code> for Google Gemini.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    AI Model
                  </label>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-sm bg-white"
                  >
                    <optgroup label="Google Gemini">
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                    </optgroup>
                    <optgroup label="OpenAI (via OpenRouter)">
                      <option value="openai/gpt-4o">GPT-4o</option>
                      <option value="openai/gpt-4o-mini">GPT-4o Mini</option>
                    </optgroup>
                    <optgroup label="Anthropic (via OpenRouter)">
                      <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                      <option value="anthropic/claude-3-haiku">Claude 3 Haiku</option>
                    </optgroup>
                  </select>
                </div>
                
                <button
                  onClick={handleSave}
                  className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                    saved 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-primary-600 hover:bg-primary-700'
                  }`}
                >
                  {saved ? '✓ Saved for this session' : 'Save API Key'}
                </button>
                
                {apiKey && (
                  <button
                    onClick={() => {
                      setApiKey('');
                      setModel('gemini-1.5-pro');
                      sessionStorage.removeItem('customApiKey');
                      sessionStorage.removeItem('customAiModel');
                      setSaved(true);
                      setTimeout(() => { setSaved(false); setIsOpen(false); }, 1000);
                    }}
                    className="w-full py-2 text-sm text-red-500 hover:text-red-600 font-semibold"
                  >
                    Clear Key
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApiKeyModal;
