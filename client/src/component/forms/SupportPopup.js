
import { useState, useEffect } from 'react';
import { Send, ChevronDown, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

function SupportPopup({ isOpen, setIsOpen, userData }) {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const subjects = [
    'Leads',
    'Contacts',
    'Deals',
    'Meetings',
    'Tasks',
    'Dashboard',
    'Related List',
    'Other'
  ];

  // Pre-fill form with user data when available
  useEffect(() => {
    if (userData && isOpen) {
      setFormData(prev => ({
        ...prev,
        fullname: userData.name || '',
        email: userData.email || ''
      }));
    }
  }, [userData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const selectSubject = (subject) => {
    setFormData(prev => ({ ...prev, subject }));
    setIsDropdownOpen(false);
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/support/createticket`,
        {
          ...formData,
          userId: userData?.userId
        }
      );
      
      toast.success("Support request submitted successfully!");
      setIsSubmitted(true);
      
      // Reset form after 3 seconds and close popup
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ fullname: '', email: '', subject: '', message: '' });
        setIsOpen(false);
      }, 3000);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to submit support request");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center md:justify-end md:items-start md:pt-20 p-4">
      {/* Popup Container */}
      <div 
        id="support-popup"
        className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 md:mr-8 md:ml-0 overflow-hidden transform transition-all duration-300 translate-y-0 opacity-100 scale-100"
        style={{animation: 'fadeIn 0.3s ease-out'}}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white">Customer Support</h1>
            <p className="text-indigo-200 mt-1">We're here to help you</p>
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
              <p className="text-gray-600">Your support request has been submitted successfully. We'll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="fullname"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
                  placeholder="Enter your email"
                />
              </div>
              
              {/* Subject Selection */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-white px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <span className={`block truncate ${!formData.subject ? 'text-gray-400' : 'text-gray-900'}`}>
                      {formData.subject || 'Select a subject'}
                    </span>
                    <ChevronDown className="text-gray-400" size={18} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto">
                      {subjects.map((subject) => (
                        <div
                          key={subject}
                          onClick={() => selectSubject(subject)}
                          className="cursor-pointer px-4 py-2 hover:bg-indigo-50 text-gray-900"
                        >
                          {subject || 'Select a subject'}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
                           
              {/* Message Field */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out resize-none"
                  placeholder="Please describe your issue in detail..."
                />
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out shadow-sm hover:shadow-lg"
                disabled={!formData.fullname || !formData.email || !formData.subject || !formData.message}
              >
                <Send size={18} className="mr-2" />
                Submit Request
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

export default SupportPopup;

// import { useState, useEffect } from 'react';
// import { Send, ChevronDown, CheckCircle, X } from 'lucide-react';
// import axios from 'axios';
// import Cookies from "js-cookie";
// import CryptoJS from "crypto-js";
// import toast from 'react-hot-toast';

// function SupportPopup({ isOpen, setIsOpen }) {
//   const [formData, setFormData] = useState({
//     fullname: '',
//     email: '',
//     subject:'',
//     message: '',
//   });
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);

//   const subjects = [
//     '',
//     'Billing & Payments',
//     'Technical Support',
//     'Product Inquiries',
//     'Feature Requests',
//     'Other'
//   ];

//   const SECRET_KEY = process.env.REACT_APP_CRYPTO_API;
//   const decryptData = (ciphertext) => {
//     try {
//       const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
//       return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
//     } catch (error) {
//       toast.error("Something went wrong!");
//       return null;
//     }
//   };

//   const getUserDetails = () => {
//     try {
//       const encryptedUser = Cookies.get("user");
//       if (!encryptedUser) throw new Error("User not found in cookies");
//       const user = decryptData(encryptedUser);
//       if (!user || !user.user_id || !user.first_name || !user.last_name) {
//         throw new Error("User details are incomplete");
//       }
//       return user;
//     } catch (error) {
//       // toast.error(error.message || "Failed to retrieve user data.");
//       return null;
//     }
//   };
// // console.log(userData)
  

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const selectSubject = (subject) => {
//     setFormData(prev => ({ ...prev, subject}));
//     setIsDropdownOpen(false);
//   };

//   const handleSubmit = async(e) => {
//     e.preventDefault();
//     console.log('Form submitted:', formData);
//     const response = await axios.post(`${process.env.REACT_APP_APP_API}/support/createticket`,{...formData,...userData});

//     setIsSubmitted(true);
    
//     // Reset form after 3 seconds and close popup
//     setTimeout(() => {
//       setIsSubmitted(false);
//       setFormData({ fullname: '', email: '', message: '' });
//       setIsOpen(false);
//     }, 3000);
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
//   }, [isOpen]);

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

//   useEffect(() => {
//     const user = getUserDetails();
//     if (user) {
//       setUserData({
//         userId: user.user_id,
//         name: `${user.first_name}${user.last_name}`,
//         email: user.email_id || "Not provided",
//         plan: user.subscription_plan || "ZOHO ONE",
//         isActive: user.is_active !== undefined ? user.is_active : true,
//         profileImage: user.profile_image || null
//       });
//     }
//   }, []); // ✅ run only once on mount
  

//   // If not open, don't render anything
//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//       {/* Popup Container */}
//       <div 
//         id="support-popup"
//         className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
//         style={{animation: 'fadeIn 0.3s ease-out'}}
//       >
//         {/* Header */}
//         <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center">
//           <div>
//             <h1 className="text-xl font-bold text-white">Customer Support</h1>
//             <p className="text-indigo-200 mt-1">We're here to help you</p>
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
//               <p className="text-gray-600">Your support request has been submitted successfully. We'll get back to you soon.</p>
//             </div>
//           ) : (
//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Subject Field */}
//               <div>
//                 <label htmlFor="fullname" className="block text-sm font-medium text-gray-700 mb-1">
//                   Name
//                 </label>
//                 <input
//                   type="text"
//                   id="fullname"
//                   name="fullname"
//                   value={formData.fullname}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                   placeholder="Enter your name"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                   Email
//                 </label>
//                 <input
//                   type="email"
//                   id="email"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   required
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
//                   placeholder="Enter your email"
//                 />
//               </div>
//                  {/* Subject Selection */}
//                  <div>
//                 <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
//                   Module
//                 </label>
//                 <div className="relative">
//                   <button
//                     type="button"
//                     onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                     className="w-full bg-white px-4 py-2 border border-gray-300 rounded-lg flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
//                   >
//                     <span className={`block truncate ${!formData.subject ? 'text-gray-400' : 'text-gray-900'}`}>
//                       {formData.subject || 'Select a subject'}
//                     </span>
//                     <ChevronDown className="text-gray-400" size={18} />
//                   </button>
                  
//                   {isDropdownOpen && (
//                     <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 max-h-60 overflow-auto">
//                       {subjects.map((subject) => (
//                         <div
//                           key={subject}
//                           onClick={() => selectSubject(subject)}
//                           className="cursor-pointer px-4 py-2 hover:bg-indigo-50 text-gray-900"
//                         >
//                           {subject}
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
                           
//               {/* Message Field */}
//               <div>
//                 <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
//                   Message
//                 </label>
//                 <textarea
//                   id="message"
//                   name="message"
//                   value={formData.message}
//                   onChange={handleChange}
//                   required
//                   rows={4}
//                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out resize-none"
//                   placeholder="Please describe your issue in detail..."
//                 />
//               </div>
              
//               {/* Submit Button */}
//               <button
//                 type="submit"
//                 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition duration-150 ease-in-out"
//                 disabled={!formData.fullname || !formData.email || !formData.subject || !formData.message}
//               >
//                 <Send size={18} className="mr-2" />
//                 Submit Request
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

// export default SupportPopup;

