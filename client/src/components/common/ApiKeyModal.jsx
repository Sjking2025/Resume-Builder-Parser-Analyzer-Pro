import React, { useState, useEffect, useMemo } from 'react';
import { FaCog, FaKey, FaTimes, FaCheck, FaBolt, FaCrown, FaRobot, FaEye, FaBrain, FaWifi, FaExclamationTriangle } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';

/**
 * AI Settings Modal — Dynamic Model Selection
 * 
 * Fetches the model catalog from the backend and presents
 * models grouped by provider with free/paid badges, capabilities,
 * and context window information.
 */
const ApiKeyModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [saved, setSaved] = useState(false);
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load saved values on mount
  useEffect(() => {
    const stored = sessionStorage.getItem('customApiKey');
    if (stored) setApiKey(stored);
    
    const storedModel = sessionStorage.getItem('customAiModel');
    if (storedModel) setModel(storedModel);
  }, []);

  // Fetch model catalog when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    const fetchModels = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_ENDPOINTS.models);
        if (!res.ok) throw new Error('Failed to fetch models');
        const data = await res.json();
        setModels(data.models || []);
      } catch (err) {
        console.warn('Could not fetch model catalog, using fallback:', err.message);
        setError('Could not load model catalog from server. Using built-in list.');
        // Fallback static list
        setModels(FALLBACK_MODELS);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, [isOpen]);

  // Group models by provider
  const groupedModels = useMemo(() => {
    const groups = {};
    models.forEach(m => {
      const provider = m.provider || 'other';
      if (!groups[provider]) groups[provider] = [];
      groups[provider].push(m);
    });
    // Sort: free models first within each group
    Object.values(groups).forEach(list => {
      list.sort((a, b) => (a.is_free === b.is_free ? 0 : a.is_free ? -1 : 1));
    });
    return groups;
  }, [models]);

  const providerLabels = {
    google: { name: 'Google AI', icon: '🔵' },
    openrouter: { name: 'OpenRouter', icon: '🟣' },
  };

  const handleSave = () => {
    if (apiKey.trim()) {
      sessionStorage.setItem('customApiKey', apiKey.trim());
    } else {
      sessionStorage.removeItem('customApiKey');
    }
    
    if (model) {
      sessionStorage.setItem('customAiModel', model);
    } else {
      sessionStorage.removeItem('customAiModel');
    }
    
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setIsOpen(false);
    }, 1000);
  };

  const handleClear = () => {
    setApiKey('');
    setModel('');
    sessionStorage.removeItem('customApiKey');
    sessionStorage.removeItem('customAiModel');
    setSaved(true);
    setTimeout(() => { setSaved(false); setIsOpen(false); }, 1000);
  };

  const selectedModel = models.find(m => m.id === model);

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
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slide-up max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-5 flex justify-between items-center text-white shrink-0">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <FaRobot className="text-blue-400" /> AI Model Settings
              </h2>
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <FaTimes size={18} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 space-y-5">
              {/* API Key Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <FaKey className="inline mr-1 text-xs" /> API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-or-... or AIza..."
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1.5">
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">sk-or-</code> for OpenRouter · <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-700">AIza</code> for Google Gemini
                </p>
              </div>

              {/* Model Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <FaBrain className="inline mr-1 text-xs" /> AI Model
                </label>

                {loading ? (
                  <div className="flex items-center gap-2 py-3 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    Loading models...
                  </div>
                ) : (
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm bg-white"
                  >
                    <option value="">Auto (Best Free Model)</option>
                    {Object.entries(groupedModels).map(([provider, providerModels]) => (
                      <optgroup
                        key={provider}
                        label={`${providerLabels[provider]?.icon || '⚪'} ${providerLabels[provider]?.name || provider}`}
                      >
                        {providerModels.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.is_free ? '🟢' : '🟡'} {m.display_name}
                            {m.context_window ? ` · ${Math.round(m.context_window / 1024)}K ctx` : ''}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                )}

                {error && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <FaExclamationTriangle className="text-[10px]" /> {error}
                  </p>
                )}
              </div>

              {/* Selected Model Info Card */}
              {selectedModel && (
                <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-sm text-gray-800">{selectedModel.display_name}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      selectedModel.is_free 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {selectedModel.is_free ? '🟢 FREE' : `🟡 $${selectedModel.input_price_per_million}/M in`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedModel.capabilities?.reasoning && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        <FaBrain className="text-[9px]" /> Reasoning
                      </span>
                    )}
                    {selectedModel.capabilities?.vision && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        <FaEye className="text-[9px]" /> Vision
                      </span>
                    )}
                    {selectedModel.capabilities?.tool_calling && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                        <FaBolt className="text-[9px]" /> Tools
                      </span>
                    )}
                    {selectedModel.capabilities?.streaming && (
                      <span className="inline-flex items-center gap-1 text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        <FaWifi className="text-[9px]" /> Stream
                      </span>
                    )}
                    <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {Math.round(selectedModel.context_window / 1024)}K context
                    </span>
                    <span className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                      {selectedModel.speed} speed
                    </span>
                  </div>
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1">🟢 Free</span>
                <span className="flex items-center gap-1">🟡 Paid</span>
                <span className="text-gray-400">·</span>
                <span>Auto-failover between free models</span>
              </div>
              
              {/* Save Button */}
              <button
                onClick={handleSave}
                className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
                  saved 
                    ? 'bg-green-500 hover:bg-green-600' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {saved ? (
                  <span className="flex items-center justify-center gap-2">
                    <FaCheck /> Saved for this session
                  </span>
                ) : 'Save Settings'}
              </button>
              
              {apiKey && (
                <button
                  onClick={handleClear}
                  className="w-full py-2 text-sm text-red-500 hover:text-red-600 font-semibold"
                >
                  Clear Key & Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};


/**
 * Fallback model list used when the backend /models endpoint is unreachable.
 * Matches the structure of model_registry.json.
 */
const FALLBACK_MODELS = [
  {
    id: 'google/gemini-2.5-flash',
    provider: 'google',
    display_name: 'Gemini 2.5 Flash',
    is_free: true,
    context_window: 1048576,
    capabilities: { vision: true, reasoning: true, streaming: true, tool_calling: true },
    category: 'general',
    speed: 'fast',
    quality: 'high',
    input_price_per_million: 0,
    output_price_per_million: 0,
  },
  {
    id: 'google/gemini-1.5-flash',
    provider: 'google',
    display_name: 'Gemini 1.5 Flash',
    is_free: true,
    context_window: 1048576,
    capabilities: { vision: true, reasoning: false, streaming: true, tool_calling: true },
    category: 'general',
    speed: 'very_fast',
    quality: 'good',
    input_price_per_million: 0,
    output_price_per_million: 0,
  },
  {
    id: 'deepseek/deepseek-r1:free',
    provider: 'openrouter',
    display_name: 'DeepSeek R1',
    is_free: true,
    context_window: 163840,
    capabilities: { reasoning: true, streaming: true },
    category: 'reasoning',
    speed: 'medium',
    quality: 'very_high',
    input_price_per_million: 0,
    output_price_per_million: 0,
  },
  {
    id: 'meta-llama/llama-4-scout:free',
    provider: 'openrouter',
    display_name: 'Llama 4 Scout',
    is_free: true,
    context_window: 512000,
    capabilities: { vision: true, streaming: true, tool_calling: true },
    category: 'general',
    speed: 'fast',
    quality: 'high',
    input_price_per_million: 0,
    output_price_per_million: 0,
  },
  {
    id: 'openai/gpt-4o',
    provider: 'openrouter',
    display_name: 'GPT-4o',
    is_free: false,
    context_window: 128000,
    capabilities: { vision: true, streaming: true, tool_calling: true },
    category: 'general',
    speed: 'fast',
    quality: 'very_high',
    input_price_per_million: 2.5,
    output_price_per_million: 10.0,
  },
  {
    id: 'anthropic/claude-sonnet-4',
    provider: 'openrouter',
    display_name: 'Claude Sonnet 4',
    is_free: false,
    context_window: 200000,
    capabilities: { vision: true, reasoning: true, streaming: true, tool_calling: true },
    category: 'reasoning',
    speed: 'medium',
    quality: 'very_high',
    input_price_per_million: 3.0,
    output_price_per_million: 15.0,
  },
];


export default ApiKeyModal;
