import { useLocation, useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from "react-hot-toast";
import { useState } from "react";
import OrgRegisterForm from "./OrgRegisterForm";

const MakeConnection2 = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // const orgId = location.state?.orgId;
  // const initialDomain = location.state?.domain || '';

  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showDomainSelection, setShowDomainSelection] = useState(true);
  const [selectedDomain, setSelectedDomain] = useState();


  const [showOrgForm, setShowOrgForm] = useState(false);
  const [orgFormData, setOrgFormData] = useState(null);


  const crmDomains = [
    { value: 'com', label: 'zoho.com' },
    { value: 'in', label: 'zoho.in' },
    { value: 'cn', label: 'zoho.cn' },
    { value: 'co.au', label: 'zoho.co.au' }
  ];

  // Function to extract code from URL
  const extractCodeFromUrl = (url) => {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('code');
  };

  const handleDomainSelect = (domain) => {
    setSelectedDomain(domain);
    setShowDomainSelection(false);
  };

  const handleBack = () => {
    setShowDomainSelection(true);
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
      const scope = encodeURIComponent('ZohoCRM.modules.ALL,ZohoCRM.settings.ALL,ZohoCRM.coql.READ,ZohoCRM.org.READ,ZohoCRM.settings.profiles.ALL');
      
      // Create the authorization URL using the selected domain
      const authUrl = `https://accounts.zoho.${selectedDomain}/oauth/v2/auth?response_type=code&client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}&access_type=offline`;
      
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
      // Make request to your backend, include the selected domain
      const response = await axios.post(`${process.env.REACT_APP_APP_API}/org/requestRefreshToken2`, {
        clientId, 
        clientSecret,
        authCode,
        domain: selectedDomain
      });

      if (response.status === 200) {
        // toast.success('Connected to Zoho successfully!');
        // console.log(response);
        // <OrgRegisterForm orgDetails = {response.data?.data?.orgDetails?.org[0]}/>
        const orgDetails = response.data?.data?.orgDetails?.org[0];
        const connections = response.data?.data?.connections;
        // navigate('/app/orgRegisterForm', { state: {orgDetails,connections} });
        setOrgFormData({ orgDetails, connections,selectedDomain });
        setShowOrgForm(true);
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to connect to Zoho";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return showOrgForm ? (
  <OrgRegisterForm
    orgDetails={orgFormData.orgDetails} 
    connections={orgFormData.connections} 
    selectedDomain={orgFormData.selectedDomain}
  />
) : (
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
          ) : showDomainSelection ? (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-blue-900">Select Zoho CRM Domain</h2>
              <p className="mb-6 text-gray-600">
                Please select the domain of your Zoho CRM account.
              </p>
              
              <div className="space-y-3 mb-6">
                {crmDomains.map((domain) => (
                  <button
                    key={domain.value}
                    onClick={() => handleDomainSelect(domain.value)}
                    className="w-full py-3 px-4 border border-blue-200 rounded-lg text-left hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 flex items-center"
                  >
                    <span className="text-blue-800 font-medium">{domain.label}</span>
                    <span className="ml-auto text-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                  </button>
                ))}
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
          ) : (
            <div>
              <div className="flex items-center mb-6">
                <button 
                  onClick={handleBack}
                  className="mr-4 text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1">Back</span>
                </button>
                <h2 className="text-2xl font-bold text-blue-900">Connect to Zoho CRM</h2>
              </div>
              
              <div className="mb-4 flex items-center bg-blue-50 p-3 rounded-lg">
                <span className="text-blue-700 mr-2">Selected domain:</span>
                <span className="text-blue-900 font-medium">zoho.{selectedDomain}</span>
              </div>

              <form onSubmit={handleConnectToZoho}>
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

        {!showDomainSelection && (
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
        )}
      </div>

      <div className="container mx-auto max-w-md p-6">
        <div className="bg-white p-6 rounded-xl shadow-md border border-blue-100">
          <p className="text-gray-700 text-center font-medium">
            Need help? Contact our support team at{" "}
            <a href="mailto:portal@easytocheck.com" className="text-blue-600 hover:underline">
              portal@easytocheck.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default MakeConnection2;