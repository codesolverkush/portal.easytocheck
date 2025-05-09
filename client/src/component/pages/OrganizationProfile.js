// import React, { useEffect, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import axios from "axios";
// import { useDispatch } from "react-redux";
// import toast from "react-hot-toast";

// // Icons
// import { 
//   FaBuilding, 
//   FaGlobe, 
//   FaMapMarkerAlt, 
//   FaCheckCircle, 
//   FaUserShield,
//   FaRegCalendarAlt,
//   FaEnvelope,
//   FaExternalLinkAlt
// } from "react-icons/fa";

// // Reducers
// import { setLicenseStatus } from "../../redux/reducers/auth";

// // Components
// import Navbar from "../common/Navbar";

// const OrganizationProfile = () => {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const orgId = location.state?.orgId;

//   const [profileData, setProfileData] = useState(null);
//   const [domain, setDomain] = useState("in");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isAuthorized, setIsAuthorized] = useState(false);
//   const [role, setRole] = useState("appUser");
//   const [authLoading, setAuthLoading] = useState(true);

//   const CACHE_NAME = "crm-cache";

//   const fetchProfileData = async () => {
//     try {
//       setLoading(true);
//       let response;
      
//       if (orgId) {
//         response = await axios.get(
//           `${process.env.REACT_APP_APP_API}/org/getorg/${orgId}`
//         );
//       } else {
//         response = await axios.post(
//           `${process.env.REACT_APP_APP_API}/org/getdetails`
//         );
//       }

//       if (response.data?.data?.length > 0) {
//         const organization = response.data.data[0].Organization;
//         const active = organization?.isactive;
//         dispatch(setLicenseStatus(active));
//         setProfileData(organization);
//         setDomain(organization?.crmdomain);

//         const cache = await caches.open(CACHE_NAME);
//         const zohoDomain = organization?.crmdomain;
//         if (zohoDomain) {
//           await cache.put("/zohoDomain", new Response(zohoDomain));
//         }

//         if (organization?.ROWID || orgId) {
//           fetchAuthorizationStatus(organization.ROWID || orgId);
//         } else {
//           setAuthLoading(false);
//         }
//       } else {
//         throw new Error("No data found.");
//       }
//     } catch (err) {
//       setError("Failed to fetch profile data.");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkRole = async () => {
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_APP_API}/users/check-role`
//       );

//       if (response.status === 200) {
//         setRole(response?.data?.role || "appUser");
//       } else {
//         throw new Error("No data found.");
//       }
//     } catch (err) {
//       console.error("Role check error:", err);
//     }
//   };

//   const fetchAuthorizationStatus = async (orgId) => {
//     try {
//       const authResponse = await axios.get(
//         `${process.env.REACT_APP_APP_API}/org/check-authorization/${orgId}`
//       );
//       setIsAuthorized(authResponse.data.authorized);
//     } catch (error) {
//       toast.error("Authorization check failed!");
//       console.error(error);
//     } finally {
//       setAuthLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProfileData();
//     checkRole();
//   }, []);

//   if (loading || authLoading) {
//     return (
//       <div className="min-h-screen flex flex-col bg-gray-50 justify-center items-center">
//         <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
//         <p className="text-blue-800 mt-4 text-lg font-medium">
//           Loading organization data...
//         </p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex justify-center items-center bg-gray-50">
//         <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
//           <div className="flex items-center justify-center mb-6 text-red-500">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//             </svg>
//           </div>
//           <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
//             Error Loading Profile
//           </h2>
//           <p className="text-red-500 text-center">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-300 font-medium"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-gray-50 min-h-screen">
//       <Navbar />
      
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
//         {/* Organization Header */}
//         <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
//           <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-8">
//             <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
//               <div className="flex items-center mb-4 md:mb-0">
//                 <div className="bg-white rounded-full p-3 shadow-md mr-4">
//                   <FaBuilding className="text-blue-700 text-xl" />
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold text-white">{profileData.displayname}</h1>
//                   <div className="flex items-center text-blue-100 mt-1">
//                     <FaGlobe className="mr-2 text-sm" />
//                     <span className="text-sm">{profileData.domain}</span>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <div className="flex items-center">
//                   {isAuthorized ? (
//                     <div className="bg-green-100 text-green-700 rounded-md px-4 py-2 flex items-center">
//                       <FaCheckCircle className="mr-2" />
//                       <span className="font-medium">Authorized</span>
//                     </div>
//                   ) : (
//                     <Link
//                       to="/app/connection"
//                       state={{
//                         orgId: orgId || profileData.ROWID,
//                         domain: domain,
//                       }}
//                       className="bg-white text-blue-700 rounded-md px-4 py-2 font-medium hover:bg-blue-50 transition duration-300 flex items-center"
//                     >
//                       <span>Connect to Zoho Crm</span>
//                       <FaExternalLinkAlt className="ml-2 text-xs" />
//                     </Link>
//                   )}
//                 </div>
                
//                 {isAuthorized && (
//                   <Link 
//                     to="/app/webtab"
//                     className="bg-blue-800 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-900 transition-all font-medium flex items-center"
//                   >
//                     <FaUserShield className="mr-2" />
//                     Admin Portal
//                   </Link>
//                 )}
//               </div>
//             </div>
//           </div>
          
//           {/* Organization Status */}
//           <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
//             <div className="flex items-center">
//               <div className={`w-3 h-3 rounded-full ${profileData.isactive ? "bg-green-500" : "bg-red-500"} mr-3`}></div>
//               <span className={`font-medium ${profileData.isactive ? "text-green-700" : "text-red-700"}`}>
//                 {profileData.isactive ? "Active License" : "Inactive License"}
//               </span>
//               <div className="ml-auto flex items-center text-gray-500">
//                 <FaRegCalendarAlt className="mr-2" />
//                 <span>Valid until: {profileData.activationEndDate}</span>
//               </div>
//             </div>
//           </div>
//         </div>
        
//         {/* Main Content */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           {/* Organization Details */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//               <div className="px-6 py-5 border-b border-gray-200">
//                 <h2 className="text-lg font-semibold text-gray-800">Organization Details</h2>
//               </div>
              
//               <div className="p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
//                   {/* Basic Information */}
//                   <div>
//                     <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
//                       Basic Information
//                     </h3>
                    
//                     <div className="space-y-4">
//                       <div className="flex">
//                         <div className="flex-shrink-0">
//                           <FaBuilding className="mt-1 text-blue-600 w-5 h-5" />
//                         </div>
//                         <div className="ml-3">
//                           <p className="text-sm font-medium text-gray-900">Organization Name</p>
//                           <p className="text-sm text-gray-700">{profileData.orgname}</p>
//                         </div>
//                       </div>
                      
//                       <div className="flex">
//                         <div className="flex-shrink-0">
//                           <FaGlobe className="mt-1 text-blue-600 w-5 h-5" />
//                         </div>
//                         <div className="ml-3">
//                           <p className="text-sm font-medium text-gray-900">CRM Domain</p>
//                           <p className="text-sm text-gray-700">{profileData.crmdomain}</p>
//                         </div>
//                       </div>
                      
//                       <div className="flex">
//                         <div className="flex-shrink-0">
//                           <FaEnvelope className="mt-1 text-blue-600 w-5 h-5" />
//                         </div>
//                         <div className="ml-3">
//                           <p className="text-sm font-medium text-gray-900">Super Admin Email</p>
//                           <p className="text-sm text-gray-700">{profileData.superadminEmail}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
                  
//                   {/* Address Information */}
//                   <div>
//                     <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">
//                       Address Information
//                     </h3>
                    
//                     <div className="space-y-4">
//                       <div className="flex">
//                         <div className="flex-shrink-0">
//                           <FaMapMarkerAlt className="mt-1 text-blue-600 w-5 h-5" />
//                         </div>
//                         <div className="ml-3">
//                           <p className="text-sm font-medium text-gray-900">Address</p>
//                           <p className="text-sm text-gray-700">
//                             {`${profileData.street || ""}`}
//                             {profileData.street && <br />}
//                             {`${profileData.city}${profileData.city && profileData.state ? ", " : ""}${profileData.state}`}
//                             {(profileData.city || profileData.state) && <br />}
//                             {`${profileData.country}${profileData.country && profileData.zip ? " - " : ""}${profileData.zip}`}
//                           </p>
//                         </div>
//                       </div>
                      
//                       <div className="flex">
//                         <div className="flex-shrink-0">
//                           <FaEnvelope className="mt-1 text-blue-600 w-5 h-5" />
//                         </div>
//                         <div className="ml-3">
//                           <p className="text-sm font-medium text-gray-900">Test Contact</p>
//                           <p className="text-sm text-gray-700">{profileData.test || "Not specified"}</p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* License Information */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//               <div className="px-6 py-5 border-b border-gray-200">
//                 <h2 className="text-lg font-semibold text-gray-800">License Information</h2>
//               </div>
              
//               <div className="p-6">
//                 <div className="space-y-5">
//                   <div className={`p-4 rounded-lg ${profileData.isactive ? "bg-green-50" : "bg-red-50"}`}>
//                     <div className="flex items-center">
//                       <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                         profileData.isactive ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
//                       }`}>
//                         {profileData.isactive ? (
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                           </svg>
//                         ) : (
//                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                           </svg>
//                         )}
//                       </div>
//                       <div className="ml-4">
//                         <p className={`text-sm font-medium ${
//                           profileData.isactive ? "text-green-800" : "text-red-800"
//                         }`}>
//                           {profileData.isactive ? "Active" : "Inactive"}
//                         </p>
//                         <p className={`text-xs ${
//                           profileData.isactive ? "text-green-700" : "text-red-700"
//                         }`}>
//                           License Status
//                         </p>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <div className="flex items-center">
//                       <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
//                         <FaRegCalendarAlt className="h-5 w-5" />
//                       </div>
//                       <div className="ml-4">
//                         <p className="text-sm font-medium text-gray-900">Activation Date</p>
//                         <p className="text-sm text-gray-700">{profileData.activationdate}</p>
//                       </div>
//                     </div>
//                   </div>
                  
//                   <div className="bg-gray-50 rounded-lg p-4">
//                     <div className="flex items-center">
//                       <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
//                         <FaRegCalendarAlt className="h-5 w-5" />
//                       </div>
//                       <div className="ml-4">
//                         <p className="text-sm font-medium text-gray-900">Expiration Date</p>
//                         <p className="text-sm text-gray-700">{profileData.activationEndDate}</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default OrganizationProfile;

import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import {
  FaCheckCircle,
  FaBuilding,
  FaGlobe,
  FaMapMarkerAlt,
  FaUserShield,
  FaExternalLinkAlt,
} from "react-icons/fa";
import { IoMdClose, IoMdMail, IoMdCalendar } from "react-icons/io";
import Navbar from "../common/Navbar";
import { setLicenseStatus } from "../../redux/reducers/auth";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { MdOutlineAdminPanelSettings } from "react-icons/md";

const OrganizationProfile = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const orgId = location.state?.orgId;

  const [profileData, setProfileData] = useState(null);
  const [domain, setDomain] = useState("in");
  const [loading, setLoading] = useState(true);
  const [control, setControl] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [role, setRole] = useState("appUser");
  const [authLoading, setAuthLoading] = useState(true);

  const CACHE_NAME = "crm-cache";

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      let response;
      if (orgId) {
        response = await axios.get(
          `${process.env.REACT_APP_APP_API}/org/getorg/${orgId}`
        );
      } else {
        response = await axios.post(
          `${process.env.REACT_APP_APP_API}/org/getdetails`
        );
      }

      if (response.data?.data?.length > 0) {
        const organization = response.data.data[0].Organization;
        const active = organization?.isactive;
        dispatch(setLicenseStatus(active));
        setProfileData(organization);
        setDomain(organization?.crmdomain);

        const cache = await caches.open(CACHE_NAME);

        const zohoDomain = organization?.crmdomain;
        if (zohoDomain) {
          await cache.put("/zohoDomain", new Response(zohoDomain));
        }

        setControl(true);
        if (organization?.ROWID || orgId) {
          fetchAuthorizationStatus(organization.ROWID || orgId);
        } else {
          setAuthLoading(false);
        }
      } else {
        throw new Error("No data found.");
      }
    } catch (err) {
      setError("Failed to fetch profile data.");
    } finally {
      setLoading(false);
    }
  };

  const checkRole = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/users/check-role`
      );

      if (response.status === 200) {
        setRole(response?.data?.role || "appUser");
      } else {
        throw new Error("No data found.");
      }
    } catch (err) {
    //   toast.success("Welcome to Organization Profile!");
    } 
  };

  useEffect(() => {
    fetchProfileData();
    checkRole();
  }, [control]);

  const fetchAuthorizationStatus = async (orgId) => {
    try {
      const authResponse = await axios.get(
        `${process.env.REACT_APP_APP_API}/org/check-authorization/${orgId}`
      );
      setIsAuthorized(authResponse.data.authorized);
    } catch (error) {
      toast.error("Authorization check failed!");
    } finally {
      setAuthLoading(false);
    }
  };


  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-indigo-800 mt-4 text-lg font-medium">
          Loading profile data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center justify-center mb-6 text-red-500">
            <IoMdClose className="w-16 h-16" />
          </div>
          <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Error Loading Profile
          </h2>
          <p className="text-red-500 text-center">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition duration-300 font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            {/* Header */}
            {/* <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 md:px-10">
              <div className="flex gap-6 flex-wrap md:flex-row justify-between items-start md:items-center">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {profileData.displayname}
                  </h1>
                  <div className="flex items-center text-indigo-100">
                    <FaGlobe className="mr-2" />
                    <span>{profileData.domain}</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  {isAuthorized ? (
                    <div className="bg-green-100 text-green-800 rounded-lg px-4 py-2 flex items-center">
                      <FaCheckCircle className="mr-2" />
                      <span className="font-medium">Authorized</span>
                    </div>
                  ) : (
                    <Link
                      to="/app/connection"
                      state={{
                        orgId: orgId || profileData.ROWID,
                        domain: domain,
                      }}
                      className="bg-white text-indigo-700 rounded-lg px-4 py-2 font-medium hover:bg-indigo-50 transition duration-300"
                    >
                      Make Connection
                    </Link>
                  )}
                </div>
              </div>
            </div> */}

<div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-700 to-blue-900 px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-white rounded-full p-3 shadow-md mr-4">
                  <FaBuilding className="text-blue-700 text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{profileData.displayname}</h1>
                  <div className="flex items-center text-blue-100 mt-1">
                    <FaGlobe className="mr-2 text-sm" />
                    <span className="text-sm">{profileData.domain}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center">
                  {isAuthorized ? (
                    <div className="bg-green-100 text-green-700 rounded-md px-4 py-2 flex items-center">
                      <FaCheckCircle className="mr-2" />
                      <span className="font-medium">Authorized</span>
                    </div>
                  ) : (
                    <Link
                      to="/app/connection"
                      state={{
                        orgId: orgId || profileData.ROWID,
                        domain: domain,
                      }}
                      className="bg-white text-blue-700 rounded-md px-4 py-2 font-medium hover:bg-blue-50 transition duration-300 flex items-center"
                    >
                      <span>Connect to Zoho Crm</span>
                      <FaExternalLinkAlt className="ml-2 text-xs" />
                    </Link>
                  )}
                </div>
                
                {isAuthorized && role === "superadmin" && (
                  <Link 
                    to="/app/webtab"
                    className="bg-blue-800 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-900 transition-all font-medium flex items-center"
                  >
                    <FaUserShield className="mr-2" />
                    Admin Portal
                  </Link>
                )}
              </div>
            </div>
          </div>
          
          {/* Organization Status */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${profileData.isactive ? "bg-green-500" : "bg-red-500"} mr-3`}></div>
              <span className={`font-medium ${profileData.isactive ? "text-green-700" : "text-red-700"}`}>
                {profileData.isactive ? "Active License" : "Inactive License"}
              </span>
            
            </div>
          </div>
        </div>


            {/* Profile Details */}
            <div className="px-6 py-8 md:px-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Organization Details
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                {/* Organization Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      Basic Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <FaBuilding className="mt-1 mr-3 text-indigo-500 w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">
                            Organization Name
                          </p>
                          <p className="text-gray-800 font-medium">
                            {profileData.orgname}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <FaMapMarkerAlt className="mt-1 mr-3 text-indigo-500 w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Address</p>
                          <p className="text-gray-800">{`${profileData.street}, ${profileData.city}, ${profileData.state}, ${profileData.country}, ${profileData.zip}`}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <FaGlobe className="mt-1 mr-3 text-indigo-500 w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">CRM Domain</p>
                          <p className="text-gray-800">
                            {profileData.crmdomain}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact & Status */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">
                      Contact & Status
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <IoMdMail className="mt-1 mr-3 text-indigo-500 w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">
                            Super Admin Email
                          </p>
                          <p className="text-gray-800">
                            {profileData.superadminEmail}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <IoMdMail className="mt-1 mr-3 text-indigo-500 w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Test Contact</p>
                          <p className="text-gray-800">{profileData.test}</p>
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div
                          className={`mt-1 mr-3 w-5 h-5 flex-shrink-0 rounded-full ${
                            profileData.isactive ? "bg-green-500" : "bg-red-500"
                          }`}
                        ></div>
                        <div>
                          <p className="text-sm text-gray-500">Active Status</p>
                          <p
                            className={`font-medium ${
                              profileData.isactive
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {profileData.isactive ? "Active" : "Inactive"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activation Dates */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">
                  Activation Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="flex">
                      <IoMdCalendar className="text-indigo-500 w-5 h-5 mt-1 mr-3" />
                      <div>
                        <p className="text-sm text-indigo-700 font-medium">
                          Activation Date
                        </p>
                        <p className="text-gray-800">
                          {profileData.activationdate}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 rounded-lg p-4">
                    <div className="flex">
                      <IoMdCalendar className="text-indigo-500 w-5 h-5 mt-1 mr-3" />
                      <div>
                        <p className="text-sm text-indigo-700 font-medium">
                          Activation End Date
                        </p>
                        <p className="text-gray-800">
                          {profileData.activationEndDate}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
};

export default OrganizationProfile;
