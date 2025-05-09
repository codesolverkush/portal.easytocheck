import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from "react-hot-toast";
import { useState } from "react";

const MakeConnection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const orgId = location.state?.orgId;
  const domain = location.state?.domain;

  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Function to extract code from URL
  const extractCodeFromUrl = (url) => {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('code');
  };

  const handleConnectToZoho = async (e) => {
    e.preventDefault();
    
    if (!clientId || !clientSecret) {
      toast.error('Client ID and Client Secret are required');
      return;
    }
    
    setIsAuthenticating(true);
    
    try {
      // Prepare the authorization URL with correct scope for creating leads in Zoho CRM
      // const redirectUri = encodeURIComponent('https://easyportal-704392036.development.catalystserverless.com/app');
      const redirectUri = encodeURIComponent('http://localhost:3000/app');
      // const redirectUri = encodeURIComponent("https://portal.easytocheck.com");
      const scope = encodeURIComponent('ZohoCRM.modules.ALL,ZohoCRM.settings.ALL,ZohoCRM.coql.READ');
      
      // Create the authorization URL
      const authUrl = `https://accounts.zoho.${domain}/oauth/v2/auth?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&access_type=offline`;
      
      // Open popup window
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      
      const popupWindow = window.open(
        authUrl,
        'zohoAuthWindow',
        `width=${width},height=${height},left=${left},top=${top}`
      );
      
      // Monitor the popup
      const popupCheckInterval = setInterval(() => {
        if (!popupWindow || popupWindow.closed) {
          clearInterval(popupCheckInterval);
          setIsAuthenticating(false);
          return;
        }

        try {
          // Check if the popup URL contains the redirect URI
          const currentUrl = popupWindow.location.href;
          
          if (currentUrl.includes('code=')) {
            // Extract the code
            const authCode = extractCodeFromUrl(currentUrl);
            
            // Close the popup and clear interval
            popupWindow.close();
            clearInterval(popupCheckInterval);
            
            // If code is available, continue with Zoho connection
            if (authCode) {
              completeZohoConnection(authCode);
            }
          }
        } catch (e) {
          // This error is expected due to Same-Origin Policy when popup is on another domain
        }
      }, 500);
    } catch (error) {
      toast.error('Failed to start authentication process');
      setIsAuthenticating(false);
    }
  };

  const completeZohoConnection = async (authCode) => {
    setIsLoading(true);
    setIsAuthenticating(false);
    
    try {
      // Make request to your backend
      const response = await axios.post(`${process.env.REACT_APP_APP_API}/org/requestRefreshToken`, {
        orgId,
        clientId, 
        clientSecret,
        authCode
      });

      if (response.status === 200) {
        toast.success('Connected to Zoho successfully!');
        navigate('/app/orgProfile', { state: { orgId } });
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to connect to Zoho";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col justify-between">
      <div className="container mx-auto max-w-md p-6">
        <div className="flex justify-center mb-8 pt-6">
          <img
            className="w-16 h-16"
            src="https://cdn-icons-png.flaticon.com/512/295/295128.png"
            alt="Zoho Logo"
          />
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
              <p className="mt-6 text-lg font-medium text-blue-800">Connecting to Zoho CRM...</p>
            </div>
          ) : (
            <div>
              <form onSubmit={handleConnectToZoho}>
                <h2 className="text-2xl font-bold mb-4 text-blue-900">Connect to Zoho CRM</h2>
                <p className="mb-6 text-gray-600">
                  Enter your Zoho API credentials below. We'll handle the authorization process for you automatically.
                </p>
                
                <div className="mb-6">
                  <label htmlFor="clientId" className="block text-sm font-medium text-blue-800 mb-1">
                    Client ID
                  </label>
                  <input 
                    id="clientId"
                    className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-200 w-full text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                    required 
                    type="text" 
                    placeholder="Enter your Zoho Client ID" 
                    value={clientId} 
                    onChange={(e) => setClientId(e.target.value)} 
                  />
                </div>

                <div className="mb-8">
                  <label htmlFor="clientSecret" className="block text-sm font-medium text-blue-800 mb-1">
                    Client Secret
                  </label>
                  <input 
                    id="clientSecret"
                    className="bg-blue-50 rounded-lg px-4 py-3 border border-blue-200 w-full text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition" 
                    required 
                    type="password" 
                    placeholder="Enter your Zoho Client Secret" 
                    value={clientSecret} 
                    onChange={(e) => setClientSecret(e.target.value)} 
                  />
                </div>
                
                <button 
                  type="submit"
                  disabled={isAuthenticating}
                  className={`rounded-lg py-3 font-medium w-full text-white text-base transition-all duration-200 flex justify-center items-center ${isAuthenticating ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                  {isAuthenticating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                      Authenticating with Zoho...
                    </>
                  ) : (
                    "Connect to Zoho"
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="mt-10 text-center text-sm text-gray-600">
            <p>
          Already connected?{" "}
          <span
            className="text-blue-600 hover:underline cursor-pointer"
            onClick={() => navigate("/app/home")}
          >
            Return to dashboard
          </span>
        </p>      
        </div>
      </div>

      <div className="container mx-auto max-w-md p-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
          <p className="text-gray-700 text-center font-medium">
            Need help? Contact our support team at{" "}
            <a href="mailto:aditya@easytocheck.com" className="text-blue-600 hover:underline">
              aditya@easytocheck.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MakeConnection;
