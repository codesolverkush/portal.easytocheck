import { useState, useEffect } from 'react';
import { Send, ChevronDown, CheckCircle, X, Calendar } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ConvertLead = ({ isOpen, setIsOpen,lead, data, leadId, isLoading }) => {
  // const lead = data?.Contact?.data[0];
  const navigate = useNavigate();
  let contactData;
  let accountData;
  
  if(data.Contact !== ''){
    contactData = data.Contact?.data[0];
  }
  if(data.Account !== ''){
    accountData = data.Account?.data[0];
  }

  
  const [formData, setFormData] = useState({
    fullname: '',
    dealName: '',
    closingDate: '',
    amount: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  // Pre-fill form with user data when available
  useEffect(() => {
    if (data && isOpen && !isLoading) {
      setFormData(prev => ({
        ...prev,
        fullname: contactData?.Full_Name || '',
        email: lead?.Email || '',
        // Suggest a deal name based on lead's name and company if available
        dealName: lead?.Company 
          ? `${lead.Company} - Deal` 
          : `${lead?.Full_Name || 'New'} Deal`,
        closingDate: getDefaultClosingDate()
      }));
    }
  }, [lead, isOpen, isLoading, data, contactData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.dealName || !formData.closingDate || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }
    setIsSubmitting(true);
    
    try {
      // Make sure we have a valid leadId
      if (!leadId) {
        throw new Error("Lead ID is missing");
      }
      
      const apiUrl = process.env.REACT_APP_APP_API;
      if (!apiUrl) {
        throw new Error("API URL is not configured");
      }
      
      const response = await axios.post(
        `${apiUrl}/lead/convertlead`,
        {
          ...formData,
          contactId: contactData?.id || null,
          accountId: accountData?.id || null,
          leadId: leadId
        }
      );
      if(response.status === 200){
        
      const cache = await caches.open("crm-cache");
      await cache.delete("/leads");
      // navigate("/app/leadview");
      const dealId = response?.data?.data?.data[0]?.details?.Deals?.id;
      if(dealId !== undefined || dealId !== null){
        const accessscore = 2;
        navigate('/app/dealprofile', { state: { dealId, accessscore } });
        setIsSubmitted(true);
      }
      else{
        navigate("/app/leadview");
      }
      
      // Reset form after 3 seconds and close popup
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ 
          fullname: '', 
          email: '', 
          subject: '', 
          message: '', 
          dealName: '',
          closingDate: '',
          amount: ''
        });
        setIsOpen(false);
      }, 2000);
      }
    } catch (error) {
      console.error("Error converting lead:", error);
      toast.error(error?.response?.data?.error?.data[0]?.message || "Failed to convert lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const popup = document.getElementById('support-popup');
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

  // If not open, don't render anything
  if (!isOpen) return null;

  // Shimmer effect component
  const ShimmerItem = ({ height = "h-6", width = "w-full" }) => (
    <div className={`animate-pulse ${height} ${width} bg-gray-200 rounded-md`}></div>
  );

  // Format date to YYYY-MM-DD for the date input
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Set default closing date to 30 days from today
  const getDefaultClosingDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 30);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:justify-end md:items-start md:pt-20 p-4">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsOpen(false)}></div>
      
      {/* Popup Container */}
      <div 
        id="support-popup"
        className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 md:mr-8 md:ml-0 overflow-hidden transform transition-all duration-300 translate-y-0 opacity-100 scale-100 relative z-10"
        style={{animation: 'fadeIn 0.3s ease-out'}}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">Convert Lead</h1>
            <p className="text-indigo-200 mt-1">Create contact, account and deal</p>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-indigo-200 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Form */}
        <div className="p-6">
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="bg-green-100 rounded-full p-3 mb-4">
                <CheckCircle className="text-green-500" size={32} />
              </div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Thank You!</h2>
              <p className="text-gray-600">Your lead has been converted successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-medium text-gray-800 mb-3">Contact Information</h3>
                
                {isLoading ? (
                  <div className="space-y-3">
                    <ShimmerItem />
                    <ShimmerItem />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 w-24">Contact:</span>
                      <span className="font-medium">{lead?.Full_Name || ""}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 w-24">Account:</span>
                      <span className="font-medium">{lead?.Company || ""}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Deal Information */}
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">Deal Information</h3>
                
                {isLoading ? (
                  <div className="space-y-3">
                    <ShimmerItem />
                    <ShimmerItem />
                    <ShimmerItem />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Deal Name Field */}
                    <div>
                      <label htmlFor="dealName" className="block text-sm font-medium text-gray-700 mb-1">
                        Deal Name
                      </label>
                      <input
                        type="text"
                        id="dealName"
                        name="dealName"
                        value={formData.dealName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                        placeholder="Enter deal name"
                      />
                    </div>

                    {/* Closing Date Field */}
                    <div>
                      <label htmlFor="closingDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Closing Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="closingDate"
                          name="closingDate"
                          value={formData.closingDate}
                          onChange={handleChange}
                          required
                          min={getTodayDate()}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                        />
                        <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
                      </div>
                    </div>

                    {/* Amount Field */}
                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5 text-gray-500">{lead?.$currency_symbol || "$"}</span>
                        <input
                          type="number"
                          id="amount"
                          name="amount"
                          value={formData.amount}
                          onChange={handleChange}
                          required
                          className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                          placeholder="Enter amount"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-sm hover:shadow-lg font-medium"
                disabled={isLoading || isSubmitting || !formData.dealName || !formData.closingDate || !formData.amount}
              >
                {isLoading || isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    {isSubmitting ? "Converting..." : "Loading..."}
                  </>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Convert Lead
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* CSS for animation */}
      <style jsx="true">{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export default ConvertLead;



// import { useState, useEffect } from 'react';
// import { Send, ChevronDown, CheckCircle, X, Calendar } from 'lucide-react';
// import axios from 'axios';
// import toast from 'react-hot-toast';
// import { useNavigate } from 'react-router-dom';

// const ConvertLead = ({ isOpen, setIsOpen,lead, data, leadId, isLoading }) => {
//   // console.log("lead",leadId)
//   // const lead = data?.Contact?.data[0];
//   const navigate = useNavigate();
//   let contactData;
//   let accountData;
  
//   if(data.Contact !== ''){
//     contactData = data.Contact?.data[0];
//   }
//   if(data.Account !== ''){
//     accountData = data.Account?.data[0];
//   }

//   console.log("contact",contactData);
//   console.log("account",accountData);
  
//   const [formData, setFormData] = useState({
//     fullname: '',
//     dealName: '',
//     closingDate: '',
//     amount: '',
//   });
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Pre-fill form with user data when available
//   useEffect(() => {
//     if (data && isOpen && !isLoading) {
//       setFormData(prev => ({
//         ...prev,
//         fullname: contactData?.Full_Name || '',
//         email: lead?.Email || '',
//         // Suggest a deal name based on lead's name and company if available
//         dealName: lead?.Company 
//           ? `${lead.Company} - Deal` 
//           : `${lead?.Full_Name || 'New'} Deal`,
//         closingDate: getDefaultClosingDate()
//       }));
//     }
//   }, [lead, isOpen, isLoading, data, contactData]);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     // Validate required fields
//     if (!formData.dealName || !formData.closingDate || !formData.amount) {
//       toast.error("Please fill in all required fields");
//       return;
//     }
//     console.log(leadId);
//     setIsSubmitting(true);
    
//     try {
//       // Make sure we have a valid leadId
//       if (!leadId) {
//         throw new Error("Lead ID is missing");
//       }
      
//       const apiUrl = process.env.REACT_APP_APP_API;
//       if (!apiUrl) {
//         throw new Error("API URL is not configured");
//       }
      
//       const response = await axios.post(
//         `${apiUrl}/lead/convertlead`,
//         {
//           ...formData,
//           contactId: contactData?.id || null,
//           accountId: accountData?.id || null,
//           leadId: leadId
//         }
//       );
//       if(response.status === 200){
        
//       console.log(response);
//       const cache = await caches.open("crm-cache");
//       await cache.delete("/leads");
//       navigate("/app/leadview");
//       setIsSubmitted(true);
      
//       // Reset form after 3 seconds and close popup
//       setTimeout(() => {
//         setIsSubmitted(false);
//         setFormData({ 
//           fullname: '', 
//           email: '', 
//           subject: '', 
//           message: '', 
//           dealName: '',
//           closingDate: '',
//           amount: ''
//         });
//         setIsOpen(false);
//       }, 2000);
//       }
//     } catch (error) {
//       console.error("Error converting lead:", error);
//       toast.error(error?.response?.data?.error?.data[0]?.message || "Failed to convert lead");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Close popup when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       const popup = document.getElementById('support-popup');
//       if (isOpen && popup && !popup.contains(e.target)) {
//         setIsOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [isOpen, setIsOpen]);

//   // Prevent body scrolling when popup is open
//   useEffect(() => {
//     if (isOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'auto';
//     }
//     return () => {
//       document.body.style.overflow = 'auto';
//     };
//   }, [isOpen]);

//   // If not open, don't render anything
//   if (!isOpen) return null;

//   // Shimmer effect component
//   const ShimmerItem = ({ height = "h-6", width = "w-full" }) => (
//     <div className={`animate-pulse ${height} ${width} bg-gray-200 rounded-md`}></div>
//   );

//   // Format date to YYYY-MM-DD for the date input
//   const getTodayDate = () => {
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, '0');
//     const day = String(today.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   };

//   // Set default closing date to 30 days from today
//   const getDefaultClosingDate = () => {
//     const today = new Date();
//     today.setDate(today.getDate() + 30);
//     const year = today.getFullYear();
//     const month = String(today.getMonth() + 1).padStart(2, '0');
//     const day = String(today.getDate()).padStart(2, '0');
//     return `${year}-${month}-${day}`;
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center md:justify-end md:items-start md:pt-20 p-4">
//       {/* Overlay */}
//       <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsOpen(false)}></div>
      
//       {/* Popup Container */}
//       <div 
//         id="support-popup"
//         className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 md:mr-8 md:ml-0 overflow-hidden transform transition-all duration-300 translate-y-0 opacity-100 scale-100 relative z-10"
//         style={{animation: 'fadeIn 0.3s ease-out'}}
//       >
//         {/* Header */}
//         <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
//           <div>
//             <h1 className="text-xl font-bold text-white">Convert Lead</h1>
//             <p className="text-indigo-200 mt-1">Create contact, account and deal</p>
//           </div>
//           <button 
//             onClick={() => setIsOpen(false)}
//             className="text-indigo-200 hover:text-white transition-colors"
//           >
//             <X size={24} />
//           </button>
//         </div>
        
//         {/* Form */}
//         <div className="p-6">
//           {isSubmitted ? (
//             <div className="flex flex-col items-center justify-center py-10 text-center">
//               <div className="bg-green-100 rounded-full p-3 mb-4">
//                 <CheckCircle className="text-green-500" size={32} />
//               </div>
//               <h2 className="text-xl font-semibold text-gray-800 mb-2">Thank You!</h2>
//               <p className="text-gray-600">Your lead has been converted successfully.</p>
//             </div>
//           ) : (
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Contact Information */}
//               <div className="border rounded-lg p-4 bg-gray-50">
//                 <h3 className="font-medium text-gray-800 mb-3">Contact Information</h3>
                
//                 {isLoading ? (
//                   <div className="space-y-3">
//                     <ShimmerItem />
//                     <ShimmerItem />
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     <div className="flex items-center">
//                       <span className="text-sm text-gray-600 w-24">Contact:</span>
//                       <span className="font-medium">{lead?.Full_Name || ""}</span>
//                     </div>
//                     <div className="flex items-center">
//                       <span className="text-sm text-gray-600 w-24">Account:</span>
//                       <span className="font-medium">{lead?.Company || ""}</span>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Deal Information */}
//               <div className="border rounded-lg p-4">
//                 <h3 className="font-medium text-gray-800 mb-3">Deal Information</h3>
                
//                 {isLoading ? (
//                   <div className="space-y-3">
//                     <ShimmerItem />
//                     <ShimmerItem />
//                     <ShimmerItem />
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {/* Deal Name Field */}
//                     <div>
//                       <label htmlFor="dealName" className="block text-sm font-medium text-gray-700 mb-1">
//                         Deal Name
//                       </label>
//                       <input
//                         type="text"
//                         id="dealName"
//                         name="dealName"
//                         value={formData.dealName}
//                         onChange={handleChange}
//                         required
//                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                         placeholder="Enter deal name"
//                       />
//                     </div>

//                     {/* Closing Date Field */}
//                     <div>
//                       <label htmlFor="closingDate" className="block text-sm font-medium text-gray-700 mb-1">
//                         Closing Date
//                       </label>
//                       <div className="relative">
//                         <input
//                           type="date"
//                           id="closingDate"
//                           name="closingDate"
//                           value={formData.closingDate}
//                           onChange={handleChange}
//                           required
//                           min={getTodayDate()}
//                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                         />
//                         <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
//                       </div>
//                     </div>

//                     {/* Amount Field */}
//                     <div>
//                       <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
//                         Amount
//                       </label>
//                       <div className="relative">
//                         <span className="absolute left-3 top-2.5 text-gray-500">{lead?.$currency_symbol || "$"}</span>
//                         <input
//                           type="number"
//                           id="amount"
//                           name="amount"
//                           value={formData.amount}
//                           onChange={handleChange}
//                           required
//                           className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                           placeholder="Enter amount"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
              
//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-sm hover:shadow-lg font-medium"
//                 disabled={isLoading || isSubmitting || !formData.dealName || !formData.closingDate || !formData.amount}
//               >
//                 {isLoading || isSubmitting ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                     {isSubmitting ? "Converting..." : "Loading..."}
//                   </>
//                 ) : (
//                   <>
//                     <Send size={18} className="mr-2" />
//                     Convert Lead
//                   </>
//                 )}
//               </button>
//             </form>
//           )}
//         </div>
//       </div>

//       {/* CSS for animation */}
//       <style jsx="true">{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: scale(0.9); }
//           to { opacity: 1; transform: scale(1); }
//         }
//       `}</style>
//     </div>
//   );
// }

// export default ConvertLead;

// // import { useState, useEffect } from 'react';
// // import { Send, ChevronDown, CheckCircle, X, Calendar } from 'lucide-react';
// // import axios from 'axios';
// // import toast from 'react-hot-toast';

// // const ConvertLead = ({ isOpen, setIsOpen, data,leadId, isLoading }) => {
// //  const lead = data?.Contact?.data[0];
// //  let contactData;
// //  let accountData;
  
// //  if(data.Contact !== ''){
// //     contactData = data.Contact?.data[0];
// //  }
// //  if(data.Account !== ''){
// //     accountData = data.Account?.data[0];
// //  }
  
// //   const [formData, setFormData] = useState({
// //     contactId: contactData?.id || null,
// //     accountId: accountData?.id || null,
// //     fullname: '',
// //     dealName: '',
// //     closingDate: '',
// //     amount: '',
// //   });
// //   const [isSubmitted, setIsSubmitted] = useState(false);

 
// //   // Pre-fill form with user data when available
// //   useEffect(() => {
// //     if (data && isOpen && !isLoading) {
// //       setFormData(prev => ({
// //         ...prev,
// //         fullname: contactData.Full_Name || '',
// //         email: lead.Email || '',
// //         // Suggest a deal name based on lead's name and company if available
// //         dealName: lead.Company 
// //           ? `${lead.Company} - Deal` 
// //           : `${lead.Full_Name || 'New'}`,
// //       }));
// //     }
// //   }, [lead, isOpen, isLoading]);

// //   const handleChange = (e) => {
// //     const { name, value } = e.target;
// //     setFormData(prev => ({ ...prev, [name]: value }));
// //   };

 

// //   const handleSubmit = async(e) => {
// //     toast.success("Coming Soon...");
// //     e.preventDefault();
// //     try {
// //       const response = await axios.post(
// //         `${process.env.REACT_APP_APP_API}/lead/convertlead`,
// //         {
// //           ...formData,
// //           leadID: leadId
// //         }
// //       );
      
// //       toast.success("Lead converted successfully!");
// //       setIsSubmitted(true);
      
// //       // Reset form after 3 seconds and close popup
// //       setTimeout(() => {
// //         setIsSubmitted(false);
// //         setFormData({ 
// //           fullname: '', 
// //           email: '', 
// //           subject: '', 
// //           message: '', 
// //           dealName: '',
// //           closingDate: '',
// //           amount: ''
// //         });
// //         setIsOpen(false);
// //       }, 3000);
// //     } catch (error) {
// //       toast.error(error?.response?.data?.message || "Failed to convert lead");
// //     }
// //   };

// //   console.log(formData);

// //   // Close popup when clicking outside
// //   useEffect(() => {
// //     const handleClickOutside = (e) => {
// //       const popup = document.getElementById('support-popup');
// //       if (isOpen && popup && !popup.contains(e.target)) {
// //         setIsOpen(false);
// //       }
// //     };

// //     document.addEventListener('mousedown', handleClickOutside);
// //     return () => {
// //       document.removeEventListener('mousedown', handleClickOutside);
// //     };
// //   }, [isOpen, setIsOpen]);

// //   // Prevent body scrolling when popup is open
// //   useEffect(() => {
// //     if (isOpen) {
// //       document.body.style.overflow = 'hidden';
// //     } else {
// //       document.body.style.overflow = 'auto';
// //     }
// //     return () => {
// //       document.body.style.overflow = 'auto';
// //     };
// //   }, [isOpen]);

// //   // If not open, don't render anything
// //   if (!isOpen) return null;

// //   // Shimmer effect component
// //   const ShimmerItem = ({ height = "h-6", width = "w-full" }) => (
// //     <div className={`animate-pulse ${height} ${width} bg-gray-200 rounded-md`}></div>
// //   );

// //   // Format date to YYYY-MM-DD for the date input
// //   const getTodayDate = () => {
// //     const today = new Date();
// //     const year = today.getFullYear();
// //     const month = String(today.getMonth() + 1).padStart(2, '0');
// //     const day = String(today.getDate()).padStart(2, '0');
// //     return `${year}-${month}-${day}`;
// //   };

// //   // Set default closing date to 30 days from today
// //   const getDefaultClosingDate = () => {
// //     const today = new Date();
// //     today.setDate(today.getDate() + 30);
// //     const year = today.getFullYear();
// //     const month = String(today.getMonth() + 1).padStart(2, '0');
// //     const day = String(today.getDate()).padStart(2, '0');
// //     return `${year}-${month}-${day}`;
// //   };

// //   return (
// //     <div className="fixed inset-0 z-50 flex items-center justify-center md:justify-end md:items-start md:pt-20 p-4">
// //       {/* Overlay */}
// //       <div className="fixed inset-0 bg-black bg-opacity-30" onClick={() => setIsOpen(false)}></div>
      
// //       {/* Popup Container */}
// //       <div 
// //         id="support-popup"
// //         className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 md:mr-8 md:ml-0 overflow-hidden transform transition-all duration-300 translate-y-0 opacity-100 scale-100 relative z-10"
// //         style={{animation: 'fadeIn 0.3s ease-out'}}
// //       >
// //         {/* Header */}
// //         <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
// //           <div>
// //             <h1 className="text-xl font-bold text-white">Convert Lead</h1>
// //             <p className="text-indigo-200 mt-1">Create contact, account and deal</p>
// //           </div>
// //           <button 
// //             onClick={() => setIsOpen(false)}
// //             className="text-indigo-200 hover:text-white transition-colors"
// //           >
// //             <X size={24} />
// //           </button>
// //         </div>
        
// //         {/* Form */}
// //         <div className="p-6">
// //           {isSubmitted ? (
// //             <div className="flex flex-col items-center justify-center py-10 text-center">
// //               <div className="bg-green-100 rounded-full p-3 mb-4">
// //                 <CheckCircle className="text-green-500" size={32} />
// //               </div>
// //               <h2 className="text-xl font-semibold text-gray-800 mb-2">Thank You!</h2>
// //               <p className="text-gray-600">Your lead has been converted successfully.</p>
// //             </div>
// //           ) : (
// //             <form onSubmit={handleSubmit} className="space-y-6">
// //               {/* Contact Information */}
// //               <div className="border rounded-lg p-4 bg-gray-50">
// //                 <h3 className="font-medium text-gray-800 mb-3">Contact Information</h3>
                
// //                 {isLoading ? (
// //                   <div className="space-y-3">
// //                     <ShimmerItem />
// //                     <ShimmerItem />
// //                   </div>
// //                 ) : (
// //                   <div className="space-y-2">
// //                     <div className="flex items-center">
// //                       <span className="text-sm text-gray-600 w-24">Contact:</span>
// //                       <span className="font-medium">{lead?.Full_Name || "Will be created"}</span>
// //                     </div>
// //                     <div className="flex items-center">
// //                       <span className="text-sm text-gray-600 w-24">Account:</span>
// //                       <span className="font-medium">{lead?.Company || "Will be created"}</span>
// //                     </div>
// //                   </div>
// //                 )}
// //               </div>

// //               {/* Deal Information */}
// //               <div className="border rounded-lg p-4">
// //                 <h3 className="font-medium text-gray-800 mb-3">Deal Information</h3>
                
// //                 {isLoading ? (
// //                   <div className="space-y-3">
// //                     <ShimmerItem />
// //                     <ShimmerItem />
// //                     <ShimmerItem />
// //                   </div>
// //                 ) : (
// //                   <div className="space-y-4">
// //                     {/* Deal Name Field */}
// //                     <div>
// //                       <label htmlFor="dealName" className="block text-sm font-medium text-gray-700 mb-1">
// //                         Deal Name
// //                       </label>
// //                       <input
// //                         type="text"
// //                         id="dealName"
// //                         name="dealName"
// //                         value={formData.dealName}
// //                         onChange={handleChange}
// //                         required
// //                         className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
// //                         placeholder="Enter deal name"
// //                       />
// //                     </div>

// //                     {/* Closing Date Field */}
// //                     <div>
// //                       <label htmlFor="closingDate" className="block text-sm font-medium text-gray-700 mb-1">
// //                         Closing Date
// //                       </label>
// //                       <div className="relative">
// //                         <input
// //                           type="date"
// //                           id="closingDate"
// //                           name="closingDate"
// //                           value={formData.closingDate || getDefaultClosingDate()}
// //                           onChange={handleChange}
// //                           required
// //                           min={getTodayDate()}
// //                           className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
// //                         />
// //                         <Calendar className="absolute right-3 top-2.5 text-gray-400" size={18} />
// //                       </div>
// //                     </div>

// //                     {/* Amount Field */}
// //                     <div>
// //                       <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
// //                         Amount
// //                       </label>
// //                       <div className="relative">
// //                         <span className="absolute left-3 top-2.5 text-gray-500">{lead?.$currency_symbol || "$"}</span>
// //                         <input
// //                           type="number"
// //                           id="amount"
// //                           name="amount"
// //                           value={formData.amount}
// //                           onChange={handleChange}
// //                           required
// //                           className="w-full pl-8 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
// //                           placeholder="Enter amount"
// //                         />
// //                       </div>
// //                     </div>
// //                   </div>
// //                 )}
// //               </div>
              
// //               {/* Submit Button */}
// //               <button
// //                 type="submit"
// //                 className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-sm hover:shadow-lg font-medium"
// //                 disabled={isLoading || !formData.dealName || !formData.closingDate || !formData.amount}
// //               >
// //                 {isLoading ? (
// //                   <>
// //                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
// //                     Converting...
// //                   </>
// //                 ) : (
// //                   <>
// //                     <Send size={18} className="mr-2" />
// //                     Convert Lead
// //                   </>
// //                 )}
// //               </button>
// //             </form>
// //           )}
// //         </div>
// //       </div>

// //       {/* CSS for animation */}
// //       <style jsx="true">{`
// //         @keyframes fadeIn {
// //           from { opacity: 0; transform: scale(0.9); }
// //           to { opacity: 1; transform: scale(1); }
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }

// // export default ConvertLead;