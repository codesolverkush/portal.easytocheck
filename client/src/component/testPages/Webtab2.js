// import React, { useEffect, useState } from 'react';

// const Webtab2 = () => {
//   const [email, setEmail] = useState('');
  
//   useEffect(() => {
//     // Function to get URL parameters that works with hash router
//     const getUrlParameter = (name) => {
//       // Handle hash-based routing (#/app/webtab2?email=...)
//       const fullUrl = window.location.href;
//       const hashPart = fullUrl.split('#')[1] || '';
      
//       // Check if there's a query string after the hash
//       if (hashPart.includes('?')) {
//         const queryString = hashPart.split('?')[1] || '';
//         const urlParams = new URLSearchParams(queryString);
//         return urlParams.get(name);
//       }
      
//       // Fallback to regular search params if no hash query found
//       const urlParams = new URLSearchParams(window.location.search);
//       return urlParams.get(name);
//     };
    
//     // Get email parameter from URL
//     const emailParam = getUrlParameter('email');
//     if (emailParam) {
//       setEmail(emailParam);
//     } else {
//       console.log('No email parameter found. URL:', window.location.href);
//     }
//   }, []);
  
//   return (
//     <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md">
//       {email ? (
//         <div className="space-y-4">
//           <h1 className="text-2xl font-bold text-gray-800">Email Information</h1>
//           <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
//             <p className="text-gray-700">Email: <span className="font-semibold">{email}</span></p>
//           </div>
//         </div>
//       ) : (
//         <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
//           <p className="text-gray-700">No email parameter found in URL.</p>
//           <p className="text-sm text-gray-500 mt-2">Add "?email=example@domain.com" to the URL to display an email.</p>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Webtab2;

import React, { useEffect, useState } from 'react';

const Webtab2 = () => {
  const [email, setEmail] = useState('');
  const [sourceDetails, setSourceDetails] = useState({});

  useEffect(() => {
    // Function to get URL parameters that works with hash router
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

    // Get email parameter from URL
    const emailParam = getUrlParameter('email');
    if (emailParam) {
      setEmail(emailParam);
    } else {
      console.log('No email parameter found. URL:', window.location.href);
    }

    // Detect origin & referrer details
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

    console.log('Source Details:', details);
    setSourceDetails(details);

  }, []);

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded-lg shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-gray-800">Page Info</h1>

      {email ? (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-gray-700">Email: <span className="font-semibold">{email}</span></p>
        </div>
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-gray-700">No email parameter found in URL.</p>
          <p className="text-sm text-gray-500 mt-2">Add "?email=example@domain.com" to the URL to display an email.</p>
        </div>
      )}

      <div className="p-4 bg-gray-50 border border-gray-200 rounded-md space-y-2">
        <h2 className="font-semibold text-gray-700">Source Details</h2>
        <p><strong>Current URL:</strong> {sourceDetails.currentUrl}</p>
        <p><strong>Referrer:</strong> {sourceDetails.referrer || 'None'}</p>
        <p><strong>Is in Iframe:</strong> {sourceDetails.isInIframe ? 'Yes' : 'No'}</p>
        <p><strong>Parent URL:</strong> {sourceDetails.parentUrl}</p>
      </div>
    </div>
  );
};

export default Webtab2;
