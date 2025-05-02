import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MdMenu,
  MdAssignment,
  MdEvent,
  MdBusiness,
  MdLeaderboard,
  MdEmail,
  MdTask,
  MdCalendarMonth,
  MdContacts,
  MdHandshake,
} from "react-icons/md";
import { AiOutlineUser, AiOutlineWhatsApp } from "react-icons/ai";
import { FaTimes, FaUserCircle, FaCrown, FaChevronRight } from "react-icons/fa";
import { userNotExists } from "../../redux/reducers/auth";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import SupportPopup from "../forms/SupportPopup";
import TrobleShoot from "../confirmbox/TrobleShoot";
import { Globe, Handshake } from "lucide-react";
import { CompanyLogo } from "./CompanyLogo";
import "./NavLink.css";

const Navbar = ({ accessData }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isConfirmTrobleShoot, setIsConfirmTrobleShoot] = useState(false);
  const profileRef = useRef(null);
  const profileButtonRef = useRef(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Function to handle opening the support popup
  const openPopup = () => {
    setIsProfileOpen(false);
    setIsSupportOpen(true);
  };

  const openConfirmPopup = () => {
    setIsProfileOpen(false);
    setIsConfirmTrobleShoot(true);
  };

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
    if (isProfileOpen) {
      setLoading(true);
      const user = getUserDetails();
      if (user) {
        setUserData({
          userId: user.user_id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email_id || "Not provided",
          plan: user.subscription_plan || "PREMIUM",
          isActive: user.is_active !== undefined ? user.is_active : true,
          profileImage: user.profile_image || null,
        });
      }
      setLoading(false);
    }
  }, [isProfileOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".sidebar") &&
        !event.target.closest(".menu-button")
      ) {
        setIsSidebarOpen(false);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setIsProfileOpen(false);
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const CACHE_NAME = "crm-cache";
  const logoutHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/users/logout`
      );
      if (response?.status === 200) {
        try {
          await caches.delete(CACHE_NAME);
          await caches.delete("meta-data");
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
    <div
      className={`animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded ${className}`}
    ></div>
  );

  return (
    <>
<nav className="bg-blue-900 border-b shadow-md fixed top-0 left-0 right-0 z-40">
<div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                className="menu-button p-2 hover:bg-gray-100 rounded-lg md:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                <MdMenu className="text-white text-2xl" />
              </button>

              <CompanyLogo color="text-white"/>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <NavLink
                to="/app/leadview"
                icon={<MdLeaderboard />}
                text="Leads"
                state={{ leadAccessScore: accessData?.Leads || 4 }}
                currentPath={location.pathname}
              />
              <NavLink
                to="/app/taskView"
                icon={<MdAssignment />}
                text="Tasks"
                currentPath={location.pathname}
              />
              <NavLink
                to="/app/contactview"
                icon={<MdContacts />}
                text="Contacts"
                currentPath={location.pathname}
              />
              <NavLink
                to="/app/dealView"
                icon={<Handshake />}
                text="Deals"
                currentPath={location.pathname}
              />
              <NavLink
                to="/app/meetingView"
                icon={<MdEvent />}
                text="Meetings"
                currentPath={location.pathname}
              />
              <NavLink
                to="/app/orgProfile"
                icon={<MdBusiness />}
                text="Org Profile"
                currentPath={location.pathname}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:block relative"></div>

              <button
                ref={profileButtonRef}
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="relative w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-purple-200 hover:from-indigo-200 hover:to-purple-300 flex items-center justify-center transition-all duration-300 hover:shadow-lg active:scale-95 group overflow-hidden"
                aria-label="User profile"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -translate-x-full group-hover:translate-x-full" />

                <AiOutlineUser className="text-gray-700 text-2xl transition-transform duration-300 group-hover:scale-110 group-active:scale-95" />

                {isProfileOpen && (
                  <span className="absolute top-0 right-0 w-3 h-3 bg-purple-500 rounded-full border-2 border-white animate-pulse" />
                )}

                <span className="absolute bottom-full mb-2 hidden group-hover:block px-3 py-1 text-sm font-medium text-white bg-gray-800 rounded-lg shadow-sm whitespace-nowrap">
                  Profile Settings
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="h-16"></div>

      <div
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 md:hidden ${
          isSidebarOpen ? "opacity-100 z-50" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`sidebar fixed inset-y-0 left-0 w-3/4 max-w-xs bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <CompanyLogo color="text-blue-600" />
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="py-2">
                <SidebarLink
                  to="/app/leadview"
                  icon={<MdLeaderboard />}
                  text="Leads"
                  currentPath={location.pathname}
                />
                <SidebarLink
                  to="/app/taskView"
                  icon={<MdTask />}
                  text="Tasks"
                  currentPath={location.pathname}
                />
                <SidebarLink
                  to="/app/meetingView"
                  icon={<MdCalendarMonth />}
                  text="Meetings"
                  currentPath={location.pathname}
                />
                <SidebarLink
                  to="/app/contactview"
                  icon={<MdContacts />}
                  text="Contacts"
                  currentPath={location.pathname}
                />
                <SidebarLink
                  to="/app/dealView"
                  icon={<MdHandshake />}
                  text="Deals"
                  currentPath={location.pathname}
                />
                <SidebarLink
                  to="/app/orgProfile"
                  icon={<MdBusiness />}
                  text="Org Profile"
                  currentPath={location.pathname}
                />
                <SidebarLink
                  to="#"
                  icon={<MdEmail />}
                  text="Emails"
                  currentPath={location.pathname}
                />
              </div>

              <div className="border-t px-4 py-2 mt-4">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Links
                </h3>
                <div className="space-y-2">
                  <LinkItem icon={<AiOutlineWhatsApp />} text="whatsapp" />
                  <LinkItem icon={<MdEmail />} text="email" />
                </div>
              </div>
            </div>

            <div className="border-t p-4">
              <button
                onClick={logoutHandler}
                className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className={`fixed inset-0 z-50 flex items-center justify-center md:justify-end md:items-start md:pt-20 overflow-y-auto transition-opacity duration-300 ${
          isProfileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <div
          className={`fixed inset-0 bg-gray-500 bg-opacity-25 backdrop-blur-sm transition-opacity ${
            isProfileOpen ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden="true"
        ></div>

        <div
          ref={profileRef}
          className={`relative w-full max-w-sm mx-4 md:mr-8 md:ml-0 transform overflow-hidden rounded-lg bg-white shadow-xl transition-all duration-300 ${
            isProfileOpen
              ? "translate-y-0 opacity-100 scale-100"
              : "translate-y-4 md:translate-y-0 md:translate-x-4 opacity-0 scale-95"
          }`}
        >
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 px-4 pt-5 pb-16 sm:p-6 sm:pb-16">
            <button
              onClick={() => setIsProfileOpen(false)}
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
                      className="w-24 h-24 object-cover rounded-full ring-4 ring-white/30 shadow-lg animate-fadeIn"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-white/20 rounded-full ring-4 ring-white/30 flex items-center justify-center animate-fadeIn">
                      <FaUserCircle className="h-16 w-16 text-white" />
                    </div>
                  )}
                  <h2 className="mt-3 text-xl font-bold text-white animate-slideUp">
                    {userData?.name || "User Name"}
                  </h2>
                  <p className="text-sm text-white/80 animate-slideUp delay-75">
                    User ID: {userData?.userId || "xxxxxxxx"}
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="relative -mt-8 mx-auto">
            <div className="flex justify-center">
              <div className="bg-white px-6 py-2 rounded-full shadow-md animate-bounce-once">
                {loading ? (
                  <Shimmer className="h-5 w-24" />
                ) : (
                  <span className="flex items-center text-sm font-semibold text-indigo-700">
                    <FaCrown className="mr-1 text-yellow-500" />
                    {userData?.plan || "PREMIUM"}
                  </span>
                )}
              </div>
            </div>
          </div>

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
                <div className="mb-6 animate-fadeIn delay-100">
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    Account Details
                  </h3>
                  <p className="text-sm text-gray-500">
                    {userData?.email || "user@example.com"}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4 flex justify-between items-center animate-slideUp delay-150">
                  <div>
                    <span className="font-medium text-gray-900">
                      Subscription
                    </span>
                    <p className="text-sm text-gray-500">
                      {userData?.isActive ? "Active" : "Inactive"}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1 text-sm font-medium text-white shadow-sm">
                    {userData?.plan || "PREMIUM"}
                  </span>
                </div>

                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center transition hover:translate-x-1 animate-fadeIn delay-200">
                  Manage Subscription{" "}
                  <FaChevronRight className="ml-1 w-3 h-3" />
                </button>

                <div className="flex justify-between mt-6 border-t border-gray-200 pt-4 animate-fadeIn delay-300">
                  <button
                    className="text-lg font-medium text-gray-900 mb-3"
                    onClick={openPopup}
                  >
                    Need Help?
                  </button>
                  <button
                    className="text-lg font-medium text-gray-900 mb-3"
                    onClick={openConfirmPopup}
                  >
                    Troubleshoot
                  </button>
                </div>

                <div className="mt-6 animate-fadeIn delay-500">
                  <button
                    onClick={logoutHandler}
                    className="w-full flex justify-center rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:from-red-600 hover:to-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-all duration-200 hover:shadow-lg active:scale-98"
                  >
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <SupportPopup
        isOpen={isSupportOpen}
        setIsOpen={setIsSupportOpen}
        userData={userData}
      />

      <TrobleShoot
        isOpen={isConfirmTrobleShoot}
        setIsOpen={setIsConfirmTrobleShoot}
      />
    </>
  );
};

const NavLink = ({ to, icon, text, currentPath, state }) => {
  const isActive = currentPath === to;

  return (
    <Link
      to={to}
      state={state}
      className={`nav-link ${isActive ? "active" : ""}`}
    >
      <span className="nav-link-icon">{icon}</span>
      <span className="nav-link-text">{text}</span>
    </Link>
  );
};

const SidebarLink = ({ to, icon, text, count, currentPath }) => {
  const isActive = currentPath === to;

  return (
    <Link
      to={to}
      className={`flex items-center justify-between px-4 py-3 ${
        isActive
          ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <div className="flex items-center">
        <span
          className={`text-xl mr-3 ${
            isActive ? "text-blue-600" : "text-gray-500"
          }`}
        >
          {icon}
        </span>
        <span className={isActive ? "font-medium" : ""}>{text}</span>
      </div>
      {count && (
        <span
          className={`px-2 py-0.5 rounded-full text-sm ${
            isActive ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
};

const LinkItem = ({ icon, text }) => (
  <button className="flex items-center text-blue-600 hover:text-blue-700">
    <span className="text-xl mr-2">{icon}</span>
    <span>{text}</span>
  </button>
);

export default Navbar;
