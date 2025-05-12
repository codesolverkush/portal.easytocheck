import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

// Custom Toast Component
const CustomToast = ({ message, type, onClose }) => {
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    const timer = setTimeout(() => onClose(), 3000);
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.max(prev - 1, 0));
    }, 30);
    
    return () => {
      clearTimeout(timer);
      clearInterval(progressInterval);
    };
  }, [onClose]);
  
  const icons = {
    success: <CheckCircle className="text-green-500" size={20} />,
    error: <AlertCircle className="text-red-500" size={20} />,
    loading: <RefreshCw className="text-blue-500 animate-spin" size={20} />
  };
  
  const bgColors = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    loading: 'bg-blue-50 border-blue-200'
  };
  
  return (
    <div className={`fixed top-4 right-4 max-w-sm w-full p-4 rounded-lg shadow-lg border ${bgColors[type]} transition-all duration-300 ease-in-out transform z-50`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {icons[type]}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-800">{message}</p>
        </div>
        <button onClick={onClose} className="ml-4 text-gray-400 hover:text-gray-500">
          <X size={16} />
        </button>
      </div>
      <div className="h-1 mt-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

// ToastManager to handle multiple toasts
const ToastManager = () => {
  const [toasts, setToasts] = useState([]);

  // Function to add a toast
  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    return id;
  };

  // Function to remove a toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  return {
    toasts,
    renderToasts: () => (
      <div className="toast-container">
        {toasts.map(toast => (
          <CustomToast 
            key={toast.id} 
            message={toast.message} 
            type={toast.type} 
            onClose={() => removeToast(toast.id)}  
          />
        ))}
      </div>
    ),
    success: (message) => addToast(message, 'success'),
    error: (message) => addToast(message, 'error'),
    loading: (message) => addToast(message, 'loading')
  };
};

function ChangesDone({ 
  isOpen, 
  setIsOpen, 
  userData, 
  actionMessage, 
  changedFields = [], 
  superadminName = 'Superadmin' 
}) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toastManager = ToastManager();

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const popup = document.getElementById('confirmation-popup');
      if (isOpen && popup && !popup.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  // Prevent body scrolling when popup is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  const handleConfirm = async() => {
    try {
      setIsLoading(true);
      toastManager.loading("Processing changes...");
      
      // Simulating API call with timeout
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({ status: 200 });
        }, 1500);
      });
      
      if (response?.status === 200) {
        try {
          await caches.delete("crm-cache");
          await caches.delete("dashboard-cache");
          await caches.delete("meta-data");
          
          toastManager.success("Changes applied successfully!");
        } catch (cacheError) {
          toastManager.error("Cache clearing failed!");
        }
      }
      
      setIsLoading(false);
      setIsSubmitted(true);
      
      // Reset and close popup after 2 seconds
      setTimeout(() => {
        setIsSubmitted(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      toastManager.error(error?.response?.data?.message || "Failed to process request");
    }
  };

  // If not open, don't render anything
  if (!isOpen) return null;

  // Format changed fields for display
  const formattedChanges = changedFields.length > 0 
    ? changedFields.map(field => 
        `${field.fieldName}: ${field.oldValue} → ${field.newValue}`
      ).join(', ')
    : 'No specific changes detected';

  return (
    <>
      {toastManager.renderToasts()}
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
        {/* Confirmation Box */}
        <div 
          id="confirmation-popup"
          className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden transform transition-all duration-300 ease-in-out"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">Confirmation</h1>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition duration-200 rounded-full p-1 hover:bg-white hover:bg-opacity-20"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-8">
            {isSubmitted ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="bg-green-100 rounded-full p-3 mb-4">
                  <CheckCircle className="text-green-500" size={32} />
                </div>
                <p className="text-gray-800 text-lg font-medium">Changes applied successfully!</p>
                <p className="text-gray-500 mt-2">The system has been updated.</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="text-center">
                  <AlertCircle className="mx-auto text-amber-500 mb-4" size={40} />
                  <p className="text-gray-800 text-lg font-medium mb-2">
                    {actionMessage || "Confirm System Changes"}
                  </p>
                  <div className="text-gray-500 text-sm space-y-2">
                    <p>Changes made by: {superadminName}</p>
                    <p className="font-medium">Changes include:</p>
                    <p className="bg-gray-100 p-2 rounded-md text-xs overflow-x-auto">
                      {formattedChanges}
                    </p>
                  </div>
                </div>
                
                {/* Confirm Button */}
                <div className="flex justify-between gap-4">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-lg transition duration-200 ease-in-out font-medium"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConfirm}
                    disabled={isLoading}
                    className={`flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-3 px-6 rounded-lg transition duration-200 ease-in-out font-medium flex items-center justify-center ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      "Confirm"
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ChangesDone;