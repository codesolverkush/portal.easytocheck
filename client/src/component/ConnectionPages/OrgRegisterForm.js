
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import toast from "react-hot-toast";
import Cookies from 'js-cookie';
import CryptoJS from "crypto-js";
import { useDispatch } from "react-redux";
import { setCookies, setOrgId } from "../../redux/reducers/auth";
import { FaExternalLinkAlt } from "react-icons/fa";
import { bgColors, hoverColors, textColors } from "../../config/colors";

const OrgRegisterForm = ({ orgDetails, connections, selectedDomain }) => {
  const [formData, setFormData] = useState({
    domain: '',
    orgName: '',
    street: '',
    city: '',
    state: '',
    country: '',
    zip: '',
    displayname: '',
    crmorgid: '',
    activationdate: new Date().toISOString().split('T')[0],
    activationEndDate: new Date(new Date().getTime() + 15*24*60*60*1000).toISOString().split('T')[0],
    superadminEmail: ''
  });

  const [isLoadingPincode, setIsLoadingPincode] = useState(false);
  const [existingOrgId, setExistingOrgId] = useState(null);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Auto-fill form with orgDetails when available
  useEffect(() => {
    if (orgDetails) {
      setFormData(prev => ({
        ...prev,
        domain: orgDetails.primary_email.split("@")[1] || '',
        orgName: orgDetails.company_name || '',
        street: orgDetails.street || '',
        city: orgDetails.city || '',
        state: orgDetails.state || '',
        country: orgDetails.country || '',
        zip: orgDetails.zip || '',
        displayname: orgDetails.company_name || '',
        crmorgid: orgDetails.zgid || '',
        superadminEmail: orgDetails.primary_email || ''
      }));
    }
  }, [orgDetails]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchAddressDetails = async (pincode) => {
    setIsLoadingPincode(true);
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      
      if (response.data[0].Status === "Success" && response.data[0].PostOffice?.length > 0) {
        const addressData = response.data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          city: addressData.District,
          state: addressData.State,
          country: addressData.Country
        }));
      } else {
        toast.error("Data not found, so please fill it manually!");
      }
    } catch (error) {
      toast.error("Error fetching address details");
    } finally {
      setIsLoadingPincode(false);
    }
  };

  const handlePincodeBlur = (e) => {
    const pincode = e.target.value;
    if (pincode) {
      fetchAddressDetails(pincode);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    
    try {
      const response = await axios.post(`${process.env.REACT_APP_APP_API}/org/register`, {
        ...formData, ...connections, crmdomain: selectedDomain
      });
      
      if (response.status === 200) {
        const orgId = response.data?.data[0]?.Organization.ROWID;

        if(orgId){
          dispatch(setCookies(orgId));
          dispatch(setOrgId(orgId)); // Store orgId in Redux
        }
      
        navigate('/app/orgProfile', { state: { orgId } });
        toast.success('Organization registered successfully!');
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Some internal error";
      toast.error(message);
    }
  };

  useEffect(() => {    
    const cookieOrgId = Cookies.get("orgRowId");
    if (!cookieOrgId) {
      setExistingOrgId(null);
      return;
    }
  
    const org_id = decryptData(cookieOrgId);
    
    if (org_id) {
      setExistingOrgId(org_id);
    } else {
      setExistingOrgId(null); // Explicitly set to null if decryption fails
    }
  }, []);
 
  const SECRET_KEY = process.env.REACT_APP_CRYPTO_API;
  
  const decryptData = (ciphertext) => {
    try {
      // Make sure SECRET_KEY is defined and not undefined
      if (!SECRET_KEY) {
        toast.error("Something is missing!");
        return null;
      }
      
      // Properly decrypt the data using the key
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      
      // Verify we have valid text before trying to parse JSON
      if (!decryptedText) {
        toast.error("Failed to decrypt data");
        return null;
      }
      
      // Try to parse as JSON
      return JSON.parse(decryptedText);
    } catch (error) {
      toast.error("Error decrypting data");
      return null;
    }
  };

  if (existingOrgId) {
    navigate('/app/orgProfile', { state: { existingOrgId } });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
              <h2 className={`text-2xl font-semibold ${textColors.primary} text-center sm:text-left mb-4 sm:mb-0`}>
                Organization Registration
              </h2>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={submitHandler} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Domain <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.domain}
                      onChange={(e) => handleInputChange('domain', e.target.value)}
                      placeholder="Enter domain"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Organization Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.orgName}
                      onChange={(e) => handleInputChange('orgName', e.target.value)}
                      placeholder="Enter organization name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.displayname}
                      onChange={(e) => handleInputChange('displayname', e.target.value)}
                      placeholder="Enter display name"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CRM Organization ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.crmorgid}
                      readOnly
                      placeholder="Enter CRM Organization ID"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                    />
                  </div>

                
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => handleInputChange('street', e.target.value)}
                      placeholder="Enter street address"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ZIP Code <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.zip}
                        onChange={(e) => handleInputChange('zip', e.target.value)}
                        onBlur={handlePincodeBlur}
                        placeholder="Enter PIN code"
                        maxLength={6}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {isLoadingPincode && <span className="text-xs text-blue-500">Fetching address...</span>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="City"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="State"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Country <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.country}
                        onChange={(e) => handleInputChange('country', e.target.value)}
                        placeholder="Country"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                    <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activation Date
                      </label>
                      <input
                        type="date"
                        value={formData.activationdate}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Activation End Date
                      </label>
                      <input
                        type="date"
                        value={formData.activationEndDate}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className={`w-full ${bgColors.primary} text-white py-2 px-4 rounded-md ${hoverColors.primary} focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 transition-colors`}
              >
                Register Organization
              </button>
            </form>
          </div>
        </div>

        <div className="mt-6 bg-white p-4 rounded-lg shadow text-center">
          <p className="text-gray-600">
            Need help? Contact us at{" "}
            <a href="mailto:portal@easytocheck.com" className="text-blue-600 hover:underline">
              portal@easytocheck.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrgRegisterForm;


// import React, { useEffect, useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import axios from 'axios';
// import toast from "react-hot-toast";
// import Cookies from 'js-cookie';
// import CryptoJS from "crypto-js";
// import { useDispatch } from "react-redux";
// import { setCookies, setOrgId } from "../../redux/reducers/auth";
// import { FaExternalLinkAlt } from "react-icons/fa";
// import { bgColors, hoverColors, textColors } from "../../config/colors";

// const OrgRegisterForm = ({orgDetails,connections,selectedDomain}) => {
//     console.log(selectedDomain);
// //   const location = useLocation();
// //   const orgDetails = location.state?.orgDetails;
// //   const connections = location.state?.connections;
// //   console.log(connections);
   
//   const [formData, setFormData] = useState({
//     domain: '',
//     orgName: '',
//     street: '',
//     city: '',
//     state: '',
//     country: '',
//     zip: '',
//     displayname: '',
//     crmorgid: '',
//     activationdate: new Date().toISOString().split('T')[0],
//     activationEndDate: new Date(new Date().getTime() + 15*24*60*60*1000).toISOString().split('T')[0],
//     superadminEmail: ''
//   });

//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isLoadingPincode, setIsLoadingPincode] = useState(false);
//   const [selectedDomainLabel, setSelectedDomainLabel] = useState('');
//   const [existingOrgId, setExistingOrgId] = useState(null);

//   const navigate = useNavigate();
//   const dispatch = useDispatch();

// //   const crmDomains = [
// //     { value: 'com', label: 'zoho.com' },
// //     { value: 'in', label: 'zoho.in' },
// //     { value: 'cn', label: 'zoho.cn' },
// //     { value: 'co.au', label: 'zoho.co.au' }
// //   ];

//   // Auto-fill form with orgDetails when available
//   useEffect(() => {
//     if (orgDetails) {
//       setFormData(prev => ({
//         ...prev,
//         domain: orgDetails.primary_email.split("@")[1] || '',
//         orgName: orgDetails.company_name || '',
//         street: orgDetails.street || '',
//         city: orgDetails.city || '',
//         state: orgDetails.state || '',
//         country: orgDetails.country || '',
//         zip: orgDetails.zip || '',
//         displayname: orgDetails.company_name || '',
//         crmorgid: orgDetails.zgid || '',
//         superadminEmail: orgDetails.primary_email || ''
//       }));
//     }
//   }, [orgDetails]);

//   const handleInputChange = (field, value) => {
//     setFormData(prev => ({
//       ...prev,
//       [field]: value
//     }));
//   };

// //   const handleDomainSelection = (domain) => {
// //     setFormData(prev => ({
// //       ...prev,
// //       crmdomain: domain.value
// //     }));
// //     setSelectedDomainLabel(domain.label);
// //     setIsDropdownOpen(false);
// //   };

//   const fetchAddressDetails = async (pincode) => {
//     setIsLoadingPincode(true);
//     try {
//       const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);
      
//       if (response.data[0].Status === "Success" && response.data[0].PostOffice?.length > 0) {
//         const addressData = response.data[0].PostOffice[0];
//         setFormData(prev => ({
//           ...prev,
//           city: addressData.District,
//           state: addressData.State,
//           country: addressData.Country
//         }));
//       } else {
//         toast.error("Data not found, so please fill it manually!");
//       }
//     } catch (error) {
//       toast.error("Error fetching address details");
//     } finally {
//       setIsLoadingPincode(false);
//     }
//   };

//   const handlePincodeBlur = (e) => {
//     const pincode = e.target.value;
//     if (pincode) {
//       fetchAddressDetails(pincode);
//     }
//   };

//   const submitHandler = async (e) => {
//     e.preventDefault();
    
//     try {
//       const response = await axios.post(`${process.env.REACT_APP_APP_API}/org/register`, {
//         ...formData,...connections,crmdomain:selectedDomain
//       });
      
//       if (response.status === 200) {
//         const orgId = response.data?.data[0]?.Organization.ROWID;

//         if(orgId){
//           dispatch(setCookies(orgId));
//           dispatch(setOrgId(orgId)); // Store orgId in Redux
//         }
      
//         navigate('/app/orgProfile', { state: { orgId } });
//         toast.success('Organization registered successfully!');
//       }
//     } catch (error) {
//       const message = error?.response?.data?.message || "Some internal error";
//       toast.error(message);
//     }
//   };

//   useEffect(() => {    
//     const cookieOrgId = Cookies.get("orgRowId");
//     if (!cookieOrgId) {
//       setExistingOrgId(null);
//       return;
//     }
  
//     const org_id = decryptData(cookieOrgId);
    
//     if (org_id) {
//       setExistingOrgId(org_id);
//     } else {
//       setExistingOrgId(null); // Explicitly set to null if decryption fails
//     }
//   }, []);
 
//   const SECRET_KEY = process.env.REACT_APP_CRYPTO_API;
  
//   const decryptData = (ciphertext) => {
//     try {
//       // Make sure SECRET_KEY is defined and not undefined
//       if (!SECRET_KEY) {
//         toast.error("Something is missing!");
//         return null;
//       }
      
//       // Properly decrypt the data using the key
//       const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
//       const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      
//       // Verify we have valid text before trying to parse JSON
//       if (!decryptedText) {
//         toast.error("Failed to decrypt data");
//         return null;
//       }
      
//       // Try to parse as JSON
//       return JSON.parse(decryptedText);
//     } catch (error) {
//       toast.error("Error decrypting data");
//       return null;
//     }
//   };

//   if (existingOrgId) {
//     navigate('/app/orgProfile', { state: { existingOrgId } });
//   }

//   return (
//     <>
//       <div className="min-h-screen bg-gray-50 p-6">
//         <div className="max-w-4xl mx-auto">
//           <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//             <div className="p-6 border-b border-gray-200">
//               <h2 className={`text-2xl font-semibold text-center ${textColors.primary}`}>Organization Registration</h2>
//             </div>
//             <div className="p-6">
//               <form onSubmit={submitHandler} className="space-y-6">
//                 <div className="grid grid-cols-2 gap-6">
//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Domain <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.domain}
//                         onChange={(e) => handleInputChange('domain', e.target.value)}
//                         placeholder="Enter domain"
//                         required
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>
                    
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Organization Name <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.orgName}
//                         onChange={(e) => handleInputChange('orgName', e.target.value)}
//                         placeholder="Enter organization name"
//                         required
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Display Name <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.displayname}
//                         onChange={(e) => handleInputChange('displayname', e.target.value)}
//                         placeholder="Enter display name"
//                         required
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Activation Date
//                         </label>
//                         <input
//                           type="date"
//                           value={formData.activationdate}
//                           readOnly
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Activation End Date
//                         </label>
//                         <input
//                           type="date"
//                           value={formData.activationEndDate}
//                           readOnly
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
//                         />
//                       </div>
//                     </div>

//                   </div>

//                   <div className="space-y-4">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         Street Address <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.street}
//                         onChange={(e) => handleInputChange('street', e.target.value)}
//                         placeholder="Enter street address"
//                         required
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           ZIP Code <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="text"
//                           value={formData.zip}
//                           onChange={(e) => handleInputChange('zip', e.target.value)}
//                           onBlur={handlePincodeBlur}
//                           placeholder="Enter PIN code"
//                           maxLength={6}
//                           required
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           City <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="text"
//                           value={formData.city}
//                           onChange={(e) => handleInputChange('city', e.target.value)}
//                           placeholder="City"
//                           required
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         />
//                       </div>
//                     </div>

//                     <div className="grid grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           State <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="text"
//                           value={formData.state}
//                           onChange={(e) => handleInputChange('state', e.target.value)}
//                           placeholder="State"
//                           required
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         />
//                       </div>
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-1">
//                           Country <span className="text-red-500">*</span>
//                         </label>
//                         <input
//                           type="text"
//                           value={formData.country}
//                           onChange={(e) => handleInputChange('country', e.target.value)}
//                           placeholder="Country"
//                           required
//                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                         />
//                       </div>
//                     </div>

//                      <div className="space-y-4">
//                       <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                         CRM Organization ID <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         value={formData.crmorgid}
//                         readOnly
//                         placeholder="Enter CRM Organization ID"
//                         required
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                       />
//                     </div>
//                   </div>
//                   </div>
//                 </div>

              

//                 <button
//                   type="submit"
//                   className={`w-full ${bgColors.primary} text-white py-2 px-4 rounded-md ${hoverColors.primary} focus:outline-none focus:ring-2 focus:ring-blue-800 focus:ring-offset-2 transition-colors`}
//                 >
//                   Register Organization
//                 </button>
//               </form>
//             </div>
//           </div>

//           <div className="mt-6 bg-white p-4 rounded-lg shadow text-center">
//             <p className="text-gray-600">
//               Need help? Contact us at{" "}
//               <a href="mailto:portal@easytocheck.com" className="text-blue-600 hover:underline">
//                 portal@easytocheck.com
//               </a>
//             </p>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default OrgRegisterForm;
