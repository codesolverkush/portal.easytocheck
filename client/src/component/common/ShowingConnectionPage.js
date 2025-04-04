import React from 'react'
import { useNavigate } from 'react-router-dom'

const ShowingConnectionPage = () => {
    const navigate = useNavigate();

    const clickHandler = ()=>{
        navigate('/app/connection');
    }
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-16 w-16 text-red-500 mx-auto mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
              <h2 className="text-xl font-semibold mb-2">Connection Required</h2>
              <p className="text-gray-600 mb-6">Your organization is not authorized. Please set up a connection to continue.</p>
              <button 
                onClick={clickHandler}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Connect Now
              </button>
            </div>
          </div>
        );
      }
      

export default ShowingConnectionPage