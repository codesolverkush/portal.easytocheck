import React from 'react'
import { Lock, Home, Shield } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const AuthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl border border-blue-100 overflow-hidden transform transition-all hover:scale-105 duration-300">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 bg-opacity-20 p-8 text-center">
          <div className="relative">
            <Lock 
              className="mx-auto mb-4 text-white bg-blue-500 rounded-full p-3 shadow-lg" 
              size={80} 
              strokeWidth={1.5} 
            />
            <Shield 
              className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-1/4 text-blue-200 opacity-50" 
              size={48} 
            />
          </div>
          <h1 className="text-4xl font-bold text-white drop-shadow-md">Access Denied</h1>
        </div>
        
        <div className="p-8 text-center">
          <p className="text-gray-700 mb-6 text-lg leading-relaxed">
            Oops! It seems you don't have the necessary permissions to view this page. 
            If you believe this is a mistake, please reach out to your Organization administrator.
          </p>
          
          <div className="flex justify-center space-x-4 mt-6">
            <button 
              onClick={() => navigate("/app/home")}
              className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300 shadow-md"
            >
              <Home size={20} />
              <span>Return to Dashboard</span>
            </button>
          </div>
        </div>

        <div className="bg-blue-50 p-4 text-center text-sm text-gray-500 border-t border-blue-100">
          <p>Need help? Contact support at <span className="text-blue-600">support@abc.com</span></p>
        </div>
      </div>
    </div>
  )
}

export default AuthorizedPage