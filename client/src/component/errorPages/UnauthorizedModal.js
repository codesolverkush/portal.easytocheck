import React from 'react';
import { Shield, AlertTriangle, X } from 'lucide-react';

const UnauthorizedModal = ({ isOpen, onClose, onConnect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl border-2 border-red-100 w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex flex-col items-center space-y-4 pt-8 px-6">
          <div className="bg-red-50 p-4 rounded-full">
            <Shield className="text-red-500 w-12 h-12" />
          </div>
          
          {/* Close Button */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <h2 className="text-2xl font-bold text-gray-800 text-center">
            Organization Not Authorized
          </h2>

          <div className="text-center text-gray-600 space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <AlertTriangle className="text-yellow-500 w-5 h-5" />
              <p>Your organization lacks access to this resource.</p>
            </div>
            <p className="text-sm">Please connect your organization or contact support.</p>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex space-x-4 p-6 bg-gray-50 border-t">
          {/* <button 
            onClick={onClose}
            className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cance
          </button> */}
          <button 
            onClick={onConnect}
            className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Connect Organization
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedModal;