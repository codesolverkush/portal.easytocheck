import React, { useEffect, useRef, useState } from "react";
import { FaTimes, FaUserCircle, FaCrown, FaChevronRight } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { userNotExists } from "../../redux/reducers/auth";
import toast from "react-hot-toast";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

const UserProfile = ({ onClose, anchorEl }) => {
  const profileRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const SECRET_KEY = process.env.REACT_APP_CRYPTO_API;
  const decryptData = (ciphertext) => {
    try {
      const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      toast.error("Something went wrong!");
      return null;
    }
  };

  const getUserDetails = () => {
    try {
      const encryptedUser = Cookies.get("user");
      if (!encryptedUser) throw new Error("User not found in cookies");
      const user = decryptData(encryptedUser);
      if (!user || !user.user_id || !user.first_name || !user.last_name) {
        throw new Error("User details are incomplete");
      }
      return user;
    } catch (error) {
      toast.error(error.message || "Failed to retrieve user data.");
      return null;
    }
  };

  useEffect(() => {
    // Simulate loading with a slight delay to show shimmer effect
    setLoading(true);
    
    setTimeout(() => {
      const user = getUserDetails();
      if (user) {
        setUserData({
          userId: user.user_id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email_id || "Not provided",
          plan: user.subscription_plan || "ZOHO ONE",
          isActive: user.is_active !== undefined ? user.is_active : true,
          profileImage: user.profile_image || null
        });
      }
      setLoading(false);
    }, 800);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  const CACHE_NAME = "crm-cache";
  const logoutHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/users/logout`);
      if (response?.status === 200) {
        try {
          await caches.delete(CACHE_NAME);
         
          // Also remove the user cookie on logout
          Cookies.remove("user");
        } catch (cacheError) {
          toast.error("Something went wrong!");
        }
        
        toast.success("Logout Successfully!");
        dispatch(userNotExists());
        navigate("/app/signup");
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Some internal error";
      toast.error(message);
    }
  };

  // Shimmer effect component
  const Shimmer = ({ className }) => (
    <div className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded ${className}`}></div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay with blur effect */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-25 backdrop-blur-sm transition-opacity" aria-hidden="true"></div>

        {/* Profile card */}
        <div 
          ref={profileRef}
          className="absolute right-2 top-16 sm:right-4 w-full max-w-sm transform overflow-hidden rounded-lg bg-white shadow-xl transition-all"
        >
          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 px-4 pt-5 pb-16 sm:p-6 sm:pb-16">
            <button 
              onClick={onClose}
              className="absolute top-3 right-3 rounded-full p-1.5 text-white hover:bg-white/20 transition-colors"
              aria-label="Close profile"
            >
              <FaTimes className="h-4 w-4" />
            </button>
            
            <div className="flex flex-col items-center">
              {loading ? (
                <>
                  <Shimmer className="w-24 h-24 rounded-full" />
                  <Shimmer className="mt-4 h-6 w-48" />
                  <Shimmer className="mt-2 h-4 w-32" />
                </>
              ) : (
                <>
                  {userData?.profileImage ? (
                    <img 
                      src={userData.profileImage} 
                      alt="Profile" 
                      className="w-24 h-24 object-cover rounded-full ring-4 ring-white/30 shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-white/20 rounded-full ring-4 ring-white/30 flex items-center justify-center">
                      <FaUserCircle className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <h2 className="mt-3 text-xl font-bold text-white">{userData?.name || "User Name"}</h2>
                  <p className="text-sm text-white/80">User ID: {userData?.userId || "xxxxxxxx"}</p>
                </>
              )}
            </div>
          </div>

          {/* Profile Avatar Overlap */}
          <div className="relative -mt-8 mx-auto">
            <div className="flex justify-center">
              <div className="bg-white px-6 py-2 rounded-full shadow-md">
                {loading ? (
                  <Shimmer className="h-5 w-24" />
                ) : (
                  <span className="flex items-center text-sm font-semibold text-indigo-700">
                    <FaCrown className="mr-1 text-yellow-500" /> 
                    {userData?.plan || "ZOHO ONE"}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Account Options */}
          <div className="bg-white px-6 py-5 sm:p-6">
            {loading ? (
              <div className="space-y-4">
                <Shimmer className="h-5 w-full" />
                <Shimmer className="h-12 w-full" />
                <Shimmer className="h-5 w-3/4" />
                <div className="pt-4 mt-6 border-t border-gray-200">
                  <Shimmer className="h-6 w-1/2 mb-4" />
                  {[...Array(5)].map((_, i) => (
                    <Shimmer key={i} className="h-10 w-full my-3" />
                  ))}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">Account Details</h3>
                  <p className="text-sm text-gray-500">{userData?.email || "user@example.com"}</p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 flex justify-between items-center">
                  <div>
                    <span className="font-medium text-gray-900">Subscription</span>
                    <p className="text-sm text-gray-500">
                      {userData?.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1 text-sm font-medium text-white shadow-sm">
                    {userData?.plan || "ZOHO ONE"}
                  </span>
                </div>

                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center">
                  Manage Subscription <FaChevronRight className="ml-1 w-3 h-3" />
                </button>

                {/* Help & Support */}
                <div className="mt-6 border-t border-gray-200 pt-4">
                  <button className="text-lg font-medium text-gray-900 mb-3">Need Help?</button>
                  <ul className="space-y-2">
                    {[
                      { icon: '💬', text: 'Chat with us', badge: null },
                      { icon: '📞', text: 'Talk with us', badge: null },
                      { icon: '✉️', text: 'Write to us', badge: null },
                    ].map((item, index) => (
                      <li key={index}>
                        <button className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-indigo-600 transition-colors flex items-center justify-between group">
                          <div className="flex items-center">
                            <span className="mr-3 text-lg">{item.icon}</span>
                            <span className="font-medium">{item.text}</span>
                          </div>
                          <div className="flex items-center">
                            {item.badge && (
                              <span className="mr-2 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                            <FaChevronRight className="w-3 h-3 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                          </div>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Logout Button */}
                <div className="mt-6">
                  <button
                    onClick={logoutHandler}
                    className="w-full flex justify-center rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-red-600 hover:to-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-all"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;


