// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import CryptoJS from "crypto-js";

// const WebTab2 = () => {
//   const [email, setEmail] = useState(''); 
//   const [crmOrgId, setCrmOrgId] = useState('4340000000151022');
//   const [key,setKey] = useState('');
//   const [sourceDetails, setSourceDetails] = useState({});
//   const [orgDetails, setOrgDetails] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isAuthorized, setIsAuthorized] = useState(true);

//   const navigate = useNavigate();


//   const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;
  
//   const encryptData = (data) => {
//     const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
//     return ciphertext;
//   }; 

//   useEffect(() => {
//     const allowedDomains = ['crm.zoho.in', 'crm.zoho.com', 'crm.zoho.us', 'crm.zoho.com.au'];

//     const isIframe = window.self !== window.top;

//     let parentUrl = '';
//     try {
//       parentUrl = window.top.location.href;
//     } catch (e) {
//       parentUrl = document.referrer; // Cross-origin iframe fallback
//     }

//     const urlToCheck = parentUrl || document.referrer;
//     let host = '';
//     try {
//       const urlObj = new URL(urlToCheck);
//       host = urlObj.hostname;
//     } catch (e) {
//       host = '';
//     }

//     const isFromZohoCRM = allowedDomains.some(domain => host.endsWith(domain));

//     // Only set unauthorized if we're sure it's not from an allowed domain
//     if (!isIframe || !isFromZohoCRM) {
//       setIsAuthorized(false);
//     }

//     // For Debug Info Panel
//     const details = {
//       currentUrl: window.location.href,
//       referrer: document.referrer,
//       isInIframe: isIframe,
//       parentUrl: parentUrl || 'Cross-origin iframe detected - cannot access parent URL',
//     };
//     setSourceDetails(details);

//     // Get Email & OrgId from URL
//     const getUrlParameter = (name) => {
//       const fullUrl = window.location.href;
//       const hashPart = fullUrl.split('#')[1] || '';
//       if (hashPart.includes('?')) {
//         const queryString = hashPart.split('?')[1] || '';
//         const urlParams = new URLSearchParams(queryString);
//         return urlParams.get(name);
//       }
//       const urlParams = new URLSearchParams(window.location.search);
//       return urlParams.get(name);
//     };

//     const emailParam = getUrlParameter('email');
//     if (emailParam) setEmail(emailParam);

//     // Keep the hardcoded orgID, but still check for URL parameter
//     const orgIdParam = getUrlParameter('orgid');
//     if (orgIdParam) setCrmOrgId(orgIdParam);
//     const keyParam = getUrlParameter('key');
//     if (keyParam) {
//       const encryptedKey = encryptData(keyParam);
//       setKey(encryptedKey);    
//     }
//   }, []);

//   useEffect(() => {
//     const fetchOrgDetails = async () => {
//       // Remove the isAuthorized check to ensure API call is made
//       if (!crmOrgId) return;

//       setLoading(true);
//       setError(null);

//       try {
//         const response = await axios.get(`${process.env.REACT_APP_APP_API}/webtab/getdetails`, {
//           params: {
//             crmorgid: crmOrgId,
//             email: email,
//             key: key,
//           },
//         });

//         if (response.data.success) {
//           setOrgDetails(response.data.data?.Organization);
          
//           // Only navigate after waiting for the API response
//           // setTimeout(() => {
//           //   navigate("/app/adminpanel", { 
//           //     state: { orgid: crmOrgId, email: email } 
//           //   });
//           // }, 2000); // Give user time to see the data before navigating
//             navigate("/app/adminpanel", { 
//               state: { orgid: crmOrgId, email: email,key } 
//             });

//         } else {
//           setError('Failed to fetch organization details');
//           navigate("/app/unauthorized");
//         }
//       } catch (err) {
//         setError(err.response?.data?.message || 'An error occurred while fetching organization details');
//       } finally {
//         setLoading(false);
//       }
//     };

//     // Execute the API call when both email and orgID are available
//     if (email && crmOrgId) {
//       fetchOrgDetails();
//     }
//   }, [email, crmOrgId, navigate]);

//   return (
//     <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md space-y-6">
//       <h1 className="text-2xl font-bold text-gray-800">Organization Details</h1>

//       <div className="space-y-4">
//         {email ? (
//           <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
//             <p className="text-gray-700">
//               Email: <span className="font-semibold">{email}</span>
//             </p>
//           </div>
//         ) : (
//           <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
//             <p className="text-gray-700">No email parameter found in URL.</p>
//             <p className="text-sm text-gray-500 mt-2">Add "?email=example@domain.com" to the URL to display an email.</p>
//           </div>
//         )}

//         {crmOrgId ? (
//           <div className="p-4 bg-green-50 border border-green-200 rounded-md">
//             <p className="text-gray-700">
//               Organization ID: <span className="font-semibold">{crmOrgId}</span>
//             </p>
//           </div>
//         ) : (
//           <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
//             <p className="text-gray-700">No orgid parameter found in URL.</p>
//             <p className="text-sm text-gray-500 mt-2">Add "?orgid=your-org-id" to the URL to display an organization ID.</p>
//           </div>
//         )}
//       </div>

//       {crmOrgId && (
//         <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
//           <h2 className="font-semibold text-gray-700 mb-3">Organization Details</h2>

//           {loading && (
//             <div className="flex items-center justify-center py-4">
//               <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
//               <span className="ml-2 text-gray-600">Loading...</span>
//             </div>
//           )}

//           {error && (
//             <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
//               {error}
//               <p className="mt-2 text-sm">Check console for more details.</p>
//             </div>
//           )}

//           {orgDetails && !loading && (
//             <div className="space-y-2">
//               {Object.entries(orgDetails).map(([key, value]) => (
//                 <div key={key} className="grid grid-cols-3 gap-2">
//                   <span className="font-medium text-gray-600">{key}:</span>
//                   <span className="col-span-2 text-gray-800">{value !== null ? value.toString() : 'N/A'}</span>
//                 </div>
//               ))}
//             </div>
//           )}

//           {!loading && !error && !orgDetails && (
//             <p className="text-gray-600">No organization details found.</p>
//           )}
//         </div>
//       )}

//       <div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-2">
//         <h2 className="font-semibold text-gray-700">Source Details</h2>
//         <p>
//           <strong>Current URL:</strong> {sourceDetails.currentUrl}
//         </p>
//         <p>
//           <strong>Referrer:</strong> {sourceDetails.referrer || 'None'}
//         </p>
//         <p>
//           <strong>Is in Iframe:</strong> {sourceDetails.isInIframe ? 'Yes' : 'No'}
//         </p>
//         <p>
//           <strong>Parent URL:</strong> {sourceDetails.parentUrl}
//         </p>
//       </div>
//     </div>
//   );
// };

// export default WebTab2;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import CryptoJS from "crypto-js";
import CrmLoader from '../common/CrmLoader';

const WebTab2 = () => {
  const [email, setEmail] = useState('');
  const [crmOrgId, setCrmOrgId] = useState('4340000000151022');
  const [key, setKey] = useState('');
  const [sourceDetails, setSourceDetails] = useState({});
  const [orgDetails, setOrgDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true);

  const navigate = useNavigate();
  const SECRET_KEY = process.env.REACT_APP_SECRET_KEY;

  const encryptData = (data) => {
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
    return ciphertext;
  };

  useEffect(() => {
    const allowedDomains = ['crm.zoho.in', 'crm.zoho.com', 'crm.zoho.us', 'crm.zoho.com.au'];

    const isIframe = window.self !== window.top;

    let parentUrl = '';
    try {
      parentUrl = window.top.location.href;
    } catch (e) {
      parentUrl = document.referrer; // Fallback for cross-origin
    }

    const urlToCheck = parentUrl || document.referrer;
    let host = '';
    try {
      const urlObj = new URL(urlToCheck);
      host = urlObj.hostname;
    } catch (e) {
      host = '';
    }

    const isFromZohoCRM = allowedDomains.some(domain => host.endsWith(domain));
    const isValidEnvironment = isIframe && isFromZohoCRM;

    // For Debug Info Panel
    const details = {
      currentUrl: window.location.href,
      referrer: document.referrer,
      isInIframe: isIframe,
      parentUrl: parentUrl || 'Cross-origin iframe detected - cannot access parent URL',
      isFromZohoCRM,
    };
    setSourceDetails(details);

    if (!isValidEnvironment) {
      setIsAuthorized(false);
      navigate("/app/unauthorized");
      return;
    }

    const getUrlParameter = (name) => {
      const fullUrl = window.location.href;
      const hashPart = fullUrl.split('#')[1] || '';
      if (hashPart.includes('?')) {
        const queryString = hashPart.split('?')[1] || '';
        const urlParams = new URLSearchParams(queryString);
        return urlParams.get(name);
      }
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    };

    const emailParam = getUrlParameter('email');
    if (emailParam) setEmail(emailParam);

    const orgIdParam = getUrlParameter('orgid');
    if (orgIdParam) setCrmOrgId(orgIdParam);

    const keyParam = getUrlParameter('key');
    if (keyParam) {
      const encryptedKey = encryptData(keyParam);
      setKey(encryptedKey);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchOrgDetails = async () => {
      if (!crmOrgId || !isAuthorized) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${process.env.REACT_APP_APP_API}/webtab/getdetails`, {
          params: {
            crmorgid: crmOrgId,
            email,
            key,
          },
        });

        if (response.data.success) {
          setOrgDetails(response.data.data?.Organization);
          navigate("/app/adminpanel", {
            state: { orgid: crmOrgId, email, key }
          });
        } else {
          setError('Failed to fetch organization details');
          navigate("/app/unauthorized");
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching organization details');
        navigate("/app/unauthorized");
      } finally {
        setLoading(false);
      }
    };

    if (email && crmOrgId && isAuthorized) {
      fetchOrgDetails();
    }
  }, [email, crmOrgId, isAuthorized, key, navigate]);

  if (!isAuthorized) {
    return (
      <div className="p-6 text-red-600 text-center">
        Unauthorized Access: This application is only available inside Zoho CRM.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md space-y-6">
      {/* <h1 className="text-2xl font-bold text-gray-800">Organization Details</h1> */}

      {/* <div className="space-y-4">
        {email ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-gray-700">
              Email: <span className="font-semibold">{email}</span>
            </p>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-gray-700">No email parameter found in URL.</p>
            <p className="text-sm text-gray-500 mt-2">Add "?email=example@domain.com" to the URL.</p>
          </div>
        )}

        {crmOrgId ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-gray-700">
              Organization ID: <span className="font-semibold">{crmOrgId}</span>
            </p>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-gray-700">No orgid parameter found in URL.</p>
          </div>
        )}
      </div> */}

      {crmOrgId && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          {/* <h2 className="font-semibold text-gray-700 mb-3">Organization Details</h2> */}

          {loading && (
            // <div className="flex items-center justify-center py-4">
            //   <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            //   <span className="ml-2 text-gray-600">Loading...</span>
            // </div>
            <CrmLoader/>
          )}

          {/* {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
              {error}
              <p className="mt-2 text-sm">Check console for more details.</p>
            </div>
          )} */}

          {/* {orgDetails && !loading && (
            <div className="space-y-2">
              {Object.entries(orgDetails).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-2">
                  <span className="font-medium text-gray-600">{key}:</span>
                  <span className="col-span-2 text-gray-800">{value !== null ? value.toString() : 'N/A'}</span>
                </div>
              ))}
            </div>
          )} */}

          {/* {!loading && !error && !orgDetails && (
            <p className="text-gray-600">No organization details found.</p>
          )} */}
        </div>
      )}

      {/* <div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-2">
        <h2 className="font-semibold text-gray-700">Source Details</h2>
        <p><strong>Current URL:</strong> {sourceDetails.currentUrl}</p>
        <p><strong>Referrer:</strong> {sourceDetails.referrer || 'None'}</p>
        <p><strong>Is in Iframe:</strong> {sourceDetails.isInIframe ? 'Yes' : 'No'}</p>
        <p><strong>Parent URL:</strong> {sourceDetails.parentUrl}</p>
        <p><strong>Is from Zoho CRM:</strong> {sourceDetails.isFromZohoCRM ? 'Yes' : 'No'}</p>
      </div> */}
    </div>
  );
};

export default WebTab2;