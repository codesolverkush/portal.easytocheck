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
import Authorized from "../errorPages/AuthorizedPage";

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
  const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
  const [role, setRole] = useState("appUser");
  const [authLoading, setAuthLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updatedOrgData, setUpdatedOrgData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

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
          checkExtensionStatus();
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

  const checkExtensionStatus = async () => {
    try {
      const extensionResponse = await axios.get(
        `${process.env.REACT_APP_APP_API}/org/checkForExtension`
      );
      
      // Check if data exists and is not empty
      if (extensionResponse.data.success && extensionResponse.data.data) {
        setIsExtensionInstalled(true);
      } else {
        setIsExtensionInstalled(false);
      }
    } catch (error) {
      setIsExtensionInstalled(false);
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
      // toast.success("Welcome to Organization Profile!");
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

  const fetchUpdateData = async () => {
    try {
      setIsUpdating(true);
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/org/getcrmorg`
      );
      
      if (response.status === 200 && response.data?.success) {
        setUpdatedOrgData(response.data.data.org[0]);
        setShowUpdateModal(true);
      } else {
        toast.error("Failed to fetch updated organization data");
      }
    } catch (error) {
      toast.error("Failed to check for updates");
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmUpdate = async () => {
    try {
      setIsUpdating(true);
      console.log("Updated Org Data:", updatedOrgData);
      
      const response = await axios.put(
        `${process.env.REACT_APP_APP_API}/org/updateorgdetails`,
        { orgData: updatedOrgData }
      );
      
      if (response.status === 200) {
        toast.success("Organization details updated successfully!");
        setShowUpdateModal(false);
        // Refresh data after update
        fetchProfileData();
      } else {
        toast.error("Failed to update organization details");
      }
    } catch (error) {
      toast.error("Update failed. Please try again later.");
    } finally {
      setIsUpdating(false);
    }
  };

  const cancelUpdate = () => {
    setShowUpdateModal(false);
    setUpdatedOrgData(null);
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

  return role !== "superadmin" ? <Authorized/> : (
    <div>
      <Navbar />
      {/* Update Confirmation Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Update Organization Details</h3>
              <button 
                onClick={cancelUpdate} 
                className="text-gray-500 hover:text-gray-700"
              >
                <IoMdClose className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mt-4 border-t border-b border-gray-200 py-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Company Name:</span>
                  <span className="font-medium text-gray-800">{updatedOrgData?.company_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">City:</span>
                  <span className="font-medium text-gray-800">{updatedOrgData?.city}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">State:</span>
                  <span className="font-medium text-gray-800">{updatedOrgData?.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Country:</span>
                  <span className="font-medium text-gray-800">{updatedOrgData?.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Zip Code:</span>
                  <span className="font-medium text-gray-800">{updatedOrgData?.zip}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">crmorgid:</span>
                  <span className="font-medium text-gray-800">{updatedOrgData?.zgid}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-6 text-gray-600">
              <p>Are you sure you want to update your organization details with the latest information from Zoho CRM?</p>
            </div>
            
            <div className="mt-6 flex space-x-3 justify-end">
              <button
                onClick={cancelUpdate}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmUpdate}
                disabled={isUpdating}
                className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors flex items-center ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Updating...
                  </>
                ) : (
                  'Confirm Update'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

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
                      <>
                      <Link 
                        to={isExtensionInstalled ? "/app/webtab" : "#"}
                        className={`${
                          isExtensionInstalled 
                            ? "bg-blue-800 text-white hover:bg-blue-900" 
                            : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        } px-4 py-2 rounded-md shadow-sm transition-all font-medium flex items-center`}
                        onClick={(e) => !isExtensionInstalled && e.preventDefault()}
                      >
                        <FaUserShield className="mr-2" />
                        Admin Portal
                        {!isExtensionInstalled && (
                          <span className="ml-2 text-xs">(Extension Required)</span>
                        )}
                      </Link>
                      <button 
                        onClick={fetchUpdateData} 
                        disabled={isUpdating}
                        className={`bg-blue-800 text-white hover:bg-blue-900 px-4 py-2 rounded-md shadow-sm transition-all font-medium flex items-center ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                      >
                        {isUpdating ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Loading...
                          </>
                        ) : (
                          'Update Details'
                        )}
                      </button>
                      </>
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
                          <p className="text-gray-800">
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

                <div className="flex items-start">
                        <IoMdMail className="mt-1 mr-3 text-indigo-500 w-5 h-5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500">Crm OrgId</p>
                          <p className="text-gray-800 semi-bold">{profileData.crmorgid}</p>
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


// import React, { useEffect, useState } from "react";
// import { Link, useLocation } from "react-router-dom";
// import axios from "axios";
// import {
//   FaCheckCircle,
//   FaBuilding,
//   FaGlobe,
//   FaMapMarkerAlt,
//   FaUserShield,
//   FaExternalLinkAlt,
// } from "react-icons/fa";
// import { IoMdClose, IoMdMail, IoMdCalendar } from "react-icons/io";
// import Navbar from "../common/Navbar";
// import { setLicenseStatus } from "../../redux/reducers/auth";
// import { useDispatch } from "react-redux";
// import toast from "react-hot-toast";
// import { MdOutlineAdminPanelSettings } from "react-icons/md";
// import Authorized from "../errorPages/AuthorizedPage";

// const OrganizationProfile = () => {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const orgId = location.state?.orgId;

//   const [profileData, setProfileData] = useState(null);
//   const [domain, setDomain] = useState("in");
//   const [loading, setLoading] = useState(true);
//   const [control, setControl] = useState(false);
//   const [error, setError] = useState(null);
//   const [isAuthorized, setIsAuthorized] = useState(false);
//   const [isExtensionInstalled, setIsExtensionInstalled] = useState(false);
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

//         setControl(true);
//         if (organization?.ROWID || orgId) {
//           fetchAuthorizationStatus(organization.ROWID || orgId);
//           checkExtensionStatus();
//         } else {
//           setAuthLoading(false);
//         }
//       } else {
//         throw new Error("No data found.");
//       }
//     } catch (err) {
//       setError("Failed to fetch profile data.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const checkExtensionStatus = async () => {
//     try {
//       const extensionResponse = await axios.get(
//         `${process.env.REACT_APP_APP_API}/org/checkForExtension`
//       );
      
//       // Check if data exists and is not empty
//       if (extensionResponse.data.success && extensionResponse.data.data) {
//         setIsExtensionInstalled(true);
//       } else {
//         setIsExtensionInstalled(false);
//       }
//     } catch (error) {
//       console.error("Extension check failed:", error);
//       setIsExtensionInstalled(false);
//     }
//   };

//   const checkRole = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(
//         `${process.env.REACT_APP_APP_API}/users/check-role`
//       );

//       if (response.status === 200) {
//         setRole(response?.data?.role || "appUser");
//       } else {
//         throw new Error("No data found.");
//       }
//     } catch (err) {
//     //   toast.success("Welcome to Organization Profile!");
//     } 
//   };

//   useEffect(() => {
//     fetchProfileData();
//     checkRole();
//   }, [control]);

//   const fetchAuthorizationStatus = async (orgId) => {
//     try {
//       const authResponse = await axios.get(
//         `${process.env.REACT_APP_APP_API}/org/check-authorization/${orgId}`
//       );
//       setIsAuthorized(authResponse.data.authorized);
//     } catch (error) {
//       toast.error("Authorization check failed!");
//     } finally {
//       setAuthLoading(false);
//     }
//   };

//   const updateHandler = async () => {
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_APP_API}/org/getcrmorg`
//       );
//       if (response.status === 200) {
//         console.log(response);
        
//         toast.success("Profile updated successfully!");
//         // setTimeout(() => {
//         //   window.location.reload();
//         // }, 2000);
//       }
//     } catch (error) {
      
//     }
//   }




//   if (loading || authLoading) {
//     return (
//       <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-indigo-50 to-blue-50">
//         <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
//         <p className="text-indigo-800 mt-4 text-lg font-medium">
//           Loading profile data...
//         </p>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen flex justify-center items-center bg-gradient-to-r from-indigo-50 to-blue-50">
//         <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
//           <div className="flex items-center justify-center mb-6 text-red-500">
//             <IoMdClose className="w-16 h-16" />
//           </div>
//           <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
//             Error Loading Profile
//           </h2>
//           <p className="text-red-500 text-center">{error}</p>
//           <button
//             onClick={() => window.location.reload()}
//             className="mt-6 w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition duration-300 font-medium"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return role !== "superadmin" ? <Authorized/> : (
//     <div>
//       <Navbar />
//       <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
//         <div className="max-w-4xl mx-auto">
//           {/* Profile Card */}
//           <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

// <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
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
                
//                 {isAuthorized && role === "superadmin" && (
//                   <>
//                   <Link 
//                     to={isExtensionInstalled ? "/app/webtab" : "#"}
//                     className={`${
//                       isExtensionInstalled 
//                         ? "bg-blue-800 text-white hover:bg-blue-900" 
//                         : "bg-gray-400 text-gray-200 cursor-not-allowed"
//                     } px-4 py-2 rounded-md shadow-sm transition-all font-medium flex items-center`}
//                     onClick={(e) => !isExtensionInstalled && e.preventDefault()}
//                   >
//                     <FaUserShield className="mr-2" />
//                     Admin Portal
//                     {!isExtensionInstalled && (
//                       <span className="ml-2 text-xs">(Extension Required)</span>
//                     )}
//                   </Link>
//                   <button onClick={updateHandler} className="bg-blue-800 text-white hover:bg-blue-900 px-4 py-2 rounded-md shadow-sm transition-all font-medium flex items-center">Update Details</button>
//                   </>
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
            
//             </div>
//           </div>
//         </div>


//             {/* Profile Details */}
//             <div className="px-6 py-8 md:px-10">
//               <h2 className="text-2xl font-bold text-gray-800 mb-6">
//                 Organization Details
//               </h2>

//               <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
//                 {/* Organization Info */}
//                 <div className="space-y-6">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-700 mb-4">
//                       Basic Information
//                     </h3>
//                     <div className="space-y-4">
//                       <div className="flex items-start">
//                         <FaBuilding className="mt-1 mr-3 text-indigo-500 w-5 h-5 flex-shrink-0" />
//                         <div>
//                           <p className="text-sm text-gray-500">
//                             Organization Name
//                           </p>
//                           <p className="text-gray-800 font-medium">
//                             {profileData.orgname}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="flex items-start">
//                         <FaMapMarkerAlt className="mt-1 mr-3 text-indigo-500 w-5 h-5 flex-shrink-0" />
//                         <div>
//                           <p className="text-sm text-gray-500">Address</p>
//                           <p className="text-gray-800">{`${profileData.street}, ${profileData.city}, ${profileData.state}, ${profileData.country}, ${profileData.zip}`}</p>
//                         </div>
//                       </div>

//                       <div className="flex items-start">
//                         <FaGlobe className="mt-1 mr-3 text-indigo-500 w-5 h-5 flex-shrink-0" />
//                         <div>
//                           <p className="text-sm text-gray-500">CRM Domain</p>
//                           <p className="text-gray-800">
//                             {profileData.crmdomain}
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Contact & Status */}
//                 <div className="space-y-6">
//                   <div>
//                     <h3 className="text-lg font-semibold text-gray-700 mb-4">
//                       Contact & Status
//                     </h3>
//                     <div className="space-y-4">
//                       <div className="flex items-start">
//                         <IoMdMail className="mt-1 mr-3 text-indigo-500 w-5 h-5 flex-shrink-0" />
//                         <div>
//                           <p className="text-sm text-gray-500">
//                             Super Admin Email
//                           </p>
//                           <p className="text-gray-800">
//                             {profileData.superadminEmail}
//                           </p>
//                         </div>
//                       </div>

//                       <div className="flex items-start">
//                         <IoMdMail className="mt-1 mr-3 text-indigo-500 w-5 h-5 flex-shrink-0" />
//                         <div>
//                           <p className="text-sm text-gray-500">Test Contact</p>
//                           <p className="text-gray-800">{profileData.test}</p>
//                         </div>
//                       </div>

//                       <div className="flex items-start">
//                         <div
//                           className={`mt-1 mr-3 w-5 h-5 flex-shrink-0 rounded-full ${
//                             profileData.isactive ? "bg-green-500" : "bg-red-500"
//                           }`}
//                         ></div>
//                         <div>
//                           <p className="text-sm text-gray-500">Active Status</p>
//                           <p
//                             className={`font-medium ${
//                               profileData.isactive
//                                 ? "text-green-600"
//                                 : "text-red-600"
//                             }`}
//                           >
//                             {profileData.isactive ? "Active" : "Inactive"}
//                           </p>
                          
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="space-y-6">
//                     <div>
//                           <p className="text-sm text-gray-500">crmorgid</p>
//                           <p
//                             className={`font-medium ${
//                               profileData.isactive
//                                 ? "text-green-600"
//                                 : "text-red-600"
//                             }`}
//                           >
//                             {profileData.crmorgid || "Not Available"}
//                           </p>
                          
//                         </div>
//                 </div>
//               </div>

//               {/* Activation Dates */}
//               <div className="mt-8 pt-6 border-t border-gray-200">
//                 <h3 className="text-lg font-semibold text-gray-700 mb-4">
//                   Activation Information
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="bg-indigo-50 rounded-lg p-4">
//                     <div className="flex">
//                       <IoMdCalendar className="text-indigo-500 w-5 h-5 mt-1 mr-3" />
//                       <div>
//                         <p className="text-sm text-indigo-700 font-medium">
//                           Activation Date
//                         </p>
//                         <p className="text-gray-800">
//                           {profileData.activationdate}
//                         </p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="bg-indigo-50 rounded-lg p-4">
//                     <div className="flex">
//                       <IoMdCalendar className="text-indigo-500 w-5 h-5 mt-1 mr-3" />
//                       <div>
//                         <p className="text-sm text-indigo-700 font-medium">
//                           Activation End Date
//                         </p>
//                         <p className="text-gray-800">
//                           {profileData.activationEndDate}
//                         </p>
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