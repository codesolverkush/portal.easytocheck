import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const WebTabOrgDetails = () => {
  const [email, setEmail] = useState('');
  const [crmOrgId, setCrmOrgId] = useState('4340000000130002');
  const [sourceDetails, setSourceDetails] = useState({});
  const [orgDetails, setOrgDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
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
    // if (orgIdParam) setCrmOrgId(orgIdParam);

    const details = {
      currentUrl: window.location.href,
      referrer: document.referrer,
      isInIframe: window.self !== window.top,
    };

    try {
      details.parentUrl = window.top.location.href;
    } catch (e) {
      details.parentUrl = 'Cross-origin iframe detected - cannot access parent URL';
    }

    setSourceDetails(details);
  }, []);

  // ✅ API call now depends on email & crmOrgId
  useEffect(() => {
    const fetchOrgDetails = async () => {
      if (!crmOrgId || !isAuthorized) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.get(`${process.env.REACT_APP_APP_API}/webtab/getdetails`, {
          params: {
            crmorgid: crmOrgId,
            email: email,
          },
        });

        if (response.data.success) {
          setOrgDetails(response.data.data?.Organization);
          console.log("email is exist", email);
          navigate("/app/adminpanel", { state: { orgid: crmOrgId, email: email } });
        } else {
          setError('Failed to fetch organization details');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while fetching organization details');
      } finally {
        setLoading(false);
      }
    };

    if (email && crmOrgId) {
      fetchOrgDetails();
    }
  }, [email, crmOrgId, isAuthorized]);

  if (!isAuthorized) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
        <p className="text-gray-700">This WebTab is only accessible within Zoho CRM.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Organization Details</h1>

      <div className="space-y-4">
        {email ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-gray-700">
              Email: <span className="font-semibold">{email}</span>
            </p>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-gray-700">No email parameter found in URL.</p>
            <p className="text-sm text-gray-500 mt-2">Add "?email=example@domain.com" to the URL to display an email.</p>
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
            <p className="text-sm text-gray-500 mt-2">Add "?orgid=your-org-id" to the URL to display an organization ID.</p>
          </div>
        )}
      </div>

      {crmOrgId && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
          <h2 className="font-semibold text-gray-700 mb-3">Organization Details</h2>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-gray-600">Loading...</span>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>
          )}

          {orgDetails && !loading && (
            <div className="space-y-2">
              {Object.entries(orgDetails).map(([key, value]) => (
                <div key={key} className="grid grid-cols-3 gap-2">
                  <span className="font-medium text-gray-600">{key}:</span>
                  <span className="col-span-2 text-gray-800">{value !== null ? value.toString() : 'N/A'}</span>
                </div>
              ))}
            </div>
          )}

          {!loading && !error && !orgDetails && (
            <p className="text-gray-600">No organization details found.</p>
          )}
        </div>
      )}

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-2">
        <h2 className="font-semibold text-gray-700">Source Details</h2>
        <p>
          <strong>Current URL:</strong> {sourceDetails.currentUrl}
        </p>
        <p>
          <strong>Referrer:</strong> {sourceDetails.referrer || 'None'}
        </p>
        <p>
          <strong>Is in Iframe:</strong> {sourceDetails.isInIframe ? 'Yes' : 'No'}
        </p>
        <p>
          <strong>Parent URL:</strong> {sourceDetails.parentUrl}
        </p>
      </div>
    </div>
  );
};

export default WebTabOrgDetails;


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';

// const WebTabOrgDetails = () => {
//   const [email, setEmail] = useState('');
//   const [crmOrgId, setCrmOrgId] = useState('4340000000130002');
//   const [sourceDetails, setSourceDetails] = useState({});
//   const [orgDetails, setOrgDetails] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isAuthorized, setIsAuthorized] = useState(true); // Protect WebTab by domain check
//   const navigate = useNavigate();

//   console.log("Email", email);

//   console.log("OrgDetails", orgDetails);

//   useEffect(() => {
//     // Domain Protection: Only allow *.zoho.com as parent, referrer or current domain
//     const isFromZohoCRM = () => {
//       const currentUrl = window.location.href;
//       const referrer = document.referrer;
//       let parentUrl = '';

//       try {
//         parentUrl = window.top.location.href;
//       } catch (e) {
//         parentUrl = 'Cross-origin iframe detected';
//       }

//       const matchesZohoDomain = (url) => {
//         try {
//           const hostname = new URL(url).hostname;
//           console.log("Checked Hostname:", hostname);
//           return hostname.endsWith('zoho.com');
//         } catch {
//           return false;
//         }
//       };

//       if (matchesZohoDomain(currentUrl) || matchesZohoDomain(referrer) || matchesZohoDomain(parentUrl)) {
//         return true;
//       }

//       return false;
//     };

//     // if (!isFromZohoCRM()) {
//     //   console.warn('Unauthorized access: This WebTab only works inside Zoho CRM.');
//     //   setIsAuthorized(false);
//     //   return;
//     // }

//     // Proceed if authorized
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

//     const orgIdParam = getUrlParameter('orgid');
//     if (orgIdParam) setCrmOrgId(orgIdParam);

//     const details = {
//       currentUrl: window.location.href,
//       referrer: document.referrer,
//       isInIframe: window.self !== window.top,
//     };

//     try {
//       details.parentUrl = window.top.location.href;
//     } catch (e) {
//       details.parentUrl = 'Cross-origin iframe detected - cannot access parent URL';
//     }

//     console.log('Source Details:', details);
//     setSourceDetails(details);
//   }, []);

//   // Fetch organization details when crmOrgId is available
//   useEffect(() => {
//     const fetchOrgDetails = async () => {
//       if (!crmOrgId || !isAuthorized) return;

//       setLoading(true);
//       setError(null);

//       try {
//         const response = await axios.get(`${process.env.REACT_APP_APP_API}/webtab/getdetails`, {
//           params: {
//             crmorgid: crmOrgId,
//             email: email,
//           },
//         });

//         if (response.data.success) {
//           setOrgDetails(response.data.data?.Organization);
//           // navigate("/app/adminpanel", { state: { orgid: crmOrgId, email: email } });
//           console.log("email is exist", email);
          
//         } else {
//           setError('Failed to fetch organization details');
//         }
//       } catch (err) {
//         console.error('Error fetching org details:', err);
//         setError(err.response?.data?.message || 'An error occurred while fetching organization details');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchOrgDetails();
//   }, []);

//   if (!isAuthorized) {
//     return (
//       <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md space-y-4 text-center">
//         <h1 className="text-2xl font-bold text-red-600">Unauthorized Access</h1>
//         <p className="text-gray-700">This WebTab is only accessible within Zoho CRM.</p>
//       </div>
//     );
//   }

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

//       {/* Organization Details Section */}
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
//             <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">{error}</div>
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

// export default WebTabOrgDetails;


// // import React, { useEffect, useState } from 'react';
// // import axios from 'axios';

// // const WebTabOrgDetails = () => {
// //   const [email, setEmail] = useState('');
// //   const [crmOrgId, setCrmOrgId] = useState('');
// //   const [sourceDetails, setSourceDetails] = useState({});
// //   const [orgDetails, setOrgDetails] = useState(null);
// //   const [loading, setLoading] = useState(false);
// //   const [error, setError] = useState(null);

// //   console.log("OrgDetails",orgDetails);

// //   useEffect(() => {
// //     // Function to get URL parameters that works with hash router
// //     const getUrlParameter = (name) => {
// //       const fullUrl = window.location.href;
// //       const hashPart = fullUrl.split('#')[1] || '';

// //       if (hashPart.includes('?')) {
// //         const queryString = hashPart.split('?')[1] || '';
// //         const urlParams = new URLSearchParams(queryString);
// //         return urlParams.get(name);
// //       }

// //       const urlParams = new URLSearchParams(window.location.search);
// //       return urlParams.get(name);
// //     };

// //     // Get email parameter from URL
// //     const emailParam = getUrlParameter('email');
// //     if (emailParam) {
// //       setEmail(emailParam);
// //     } else {
// //       console.log('No email parameter found. URL:', window.location.href);
// //     }

// //     // Get orgid parameter from URL
// //     const orgIdParam = getUrlParameter('orgid');
// //     if (orgIdParam) {
// //       setCrmOrgId(orgIdParam);
// //     } else {
// //       console.log('No orgid parameter found. URL:', window.location.href);
// //     }

// //     // Detect origin & referrer details
// //     const details = {
// //       currentUrl: window.location.href,
// //       referrer: document.referrer,
// //       isInIframe: window.self !== window.top,
// //     };

// //     try {
// //       details.parentUrl = window.top.location.href;
// //     } catch (e) {
// //       details.parentUrl = 'Cross-origin iframe detected - cannot access parent URL';
// //     }

// //     console.log('Source Details:', details);
// //     setSourceDetails(details);

// //   }, []);

// //   // Fetch organization details when crmOrgId is available
// //   useEffect(() => {
// //     const fetchOrgDetails = async () => {
// //       if (!crmOrgId) return;
      
// //       setLoading(true);
// //       setError(null);
      
// //       try {
// //         const response = await axios.get(`${process.env.REACT_APP_APP_API}/webtab/getdetails`, {
// //           params: {
// //             crmorgid: crmOrgId,
// //             email: email
// //           }
// //         });
        
// //         if (response.data.success) {
// //           setOrgDetails(response.data.data);
// //         } else {
// //           setError('Failed to fetch organization details');
// //         }
// //       } catch (err) {
// //         console.error('Error fetching org details:', err);
// //         setError(err.response?.data?.message || 'An error occurred while fetching organization details');
// //       } finally {
// //         setLoading(false);
// //       }
// //     };

// //     fetchOrgDetails();
// //   }, [crmOrgId, email]);

// //   return (
// //     <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md space-y-6">
// //       <h1 className="text-2xl font-bold text-gray-800">Organization Details</h1>

// //       <div className="space-y-4">
// //         {email ? (
// //           <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
// //             <p className="text-gray-700">Email: <span className="font-semibold">{email}</span></p>
// //           </div>
// //         ) : (
// //           <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
// //             <p className="text-gray-700">No email parameter found in URL.</p>
// //             <p className="text-sm text-gray-500 mt-2">Add "?email=example@domain.com" to the URL to display an email.</p>
// //           </div>
// //         )}

// //         {crmOrgId ? (
// //           <div className="p-4 bg-green-50 border border-green-200 rounded-md">
// //             <p className="text-gray-700">Organization ID: <span className="font-semibold">{crmOrgId}</span></p>
// //           </div>
// //         ) : (
// //           <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
// //             <p className="text-gray-700">No orgid parameter found in URL.</p>
// //             <p className="text-sm text-gray-500 mt-2">Add "?orgid=your-org-id" to the URL to display an organization ID.</p>
// //           </div>
// //         )}
// //       </div>

// //       {/* Organization Details Section */}
// //       {crmOrgId && (
// //         <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
// //           <h2 className="font-semibold text-gray-700 mb-3">Organization Details</h2>
          
// //           {loading && (
// //             <div className="flex items-center justify-center py-4">
// //               <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
// //               <span className="ml-2 text-gray-600">Loading...</span>
// //             </div>
// //           )}
          
// //           {error && (
// //             <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
// //               {error}
// //             </div>
// //           )}
          
// //           {orgDetails && !loading && (
// //             <div className="space-y-2">
// //               {Object.entries(orgDetails).map(([key, value]) => (
// //                 <div key={key} className="grid grid-cols-3 gap-2">
// //                   <span className="font-medium text-gray-600">{key}:</span>
// //                   <span className="col-span-2 text-gray-800">{value !== null ? value.toString() : 'N/A'}</span>
// //                 </div>
// //               ))}
// //             </div>
// //           )}
          
// //           {!loading && !error && !orgDetails && (
// //             <p className="text-gray-600">No organization details found.</p>
// //           )}
// //         </div>
// //       )}

// //       <div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-2">
// //         <h2 className="font-semibold text-gray-700">Source Details</h2>
// //         <p><strong>Current URL:</strong> {sourceDetails.currentUrl}</p>
// //         <p><strong>Referrer:</strong> {sourceDetails.referrer || 'None'}</p>
// //         <p><strong>Is in Iframe:</strong> {sourceDetails.isInIframe ? 'Yes' : 'No'}</p>
// //         <p><strong>Parent URL:</strong> {sourceDetails.parentUrl}</p>
// //       </div>
// //     </div>
// //   );
// // };

// // export default WebTabOrgDetails;