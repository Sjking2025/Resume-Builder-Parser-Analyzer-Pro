import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaTimes, FaCoins, FaRedo, FaCrown } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../config/api';

const PaidConsentModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [errorDetails, setErrorDetails] = useState(null);
  const [models, setModels] = useState([]);
  const [selectedPaidModel, setSelectedPaidModel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handlePaidConsent = (e) => {
      setErrorDetails(e.detail);
      setIsOpen(true);
      fetchModels();
    };

    window.addEventListener('paid_consent_required', handlePaidConsent);
    return () => window.removeEventListener('paid_consent_required', handlePaidConsent);
  }, []);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.models);
      if (res.ok) {
        const data = await res.json();
        const paid = (data.models || []).filter(m => !m.is_free);
        setModels(paid);
        if (paid.length > 0) {
          setSelectedPaidModel(paid[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch models for consent modal', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetryFree = () => {
    // Retry usually means closing this and letting the user trigger the action again,
    // or resetting the specific model selection to "auto".
    sessionStorage.removeItem('customAiModel');
    setIsOpen(false);
    // Ideally we would retry the exact same request, but for simplicity we ask the user to click the button again.
    alert('Model selection reset to Auto. Please try your action again.');
  };

  const handleUsePaid = () => {
    if (!selectedPaidModel) return;
    
    // Set the specific paid model in session storage
    sessionStorage.setItem('customAiModel', selectedPaidModel);
    setIsOpen(false);
    
    alert(`Switched to ${selectedPaidModel}. Please try your action again.`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slide-up border border-amber-200">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-5 flex justify-between items-center text-white">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaExclamationTriangle /> Paid Model Consent
          </h2>
          <button onClick={() => setIsOpen(false)} className="text-amber-100 hover:text-white transition-colors">
            <FaTimes size={18} />
          </button>
        </div>
        
        <div className="p-6">
          <p className="text-sm text-gray-700 mb-5 leading-relaxed font-medium">
            All compatible <strong className="text-green-600">free models</strong> are currently exhausted, rate-limited, or unavailable. 
          </p>
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            Would you like to switch to a premium model to continue? This may incur charges on your API key.
          </p>

          {loading ? (
            <div className="py-4 text-center text-sm text-gray-500">Loading premium options...</div>
          ) : models.length > 0 ? (
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaCrown className="inline text-amber-500 mr-1" /> Select Premium Model
              </label>
              <select
                value={selectedPaidModel}
                onChange={(e) => setSelectedPaidModel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-amber-300 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors text-sm bg-amber-50"
              >
                {models.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.display_name} (${m.input_price_per_million}/M in)
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm mb-6">
              No premium models available in the current configuration.
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleUsePaid}
              disabled={!selectedPaidModel || models.length === 0}
              className="w-full py-3 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaCoins /> Use Paid Model
            </button>
            <button
              onClick={handleRetryFree}
              className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <FaRedo /> Reset & Retry Free Models
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaidConsentModal;
