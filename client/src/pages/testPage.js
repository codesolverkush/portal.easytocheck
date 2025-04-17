
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserPlus, FaCheckCircle, FaTrash, FaUsers, FaLock } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { toast, Toaster } from 'react-hot-toast';
import {useNavigate} from 'react-router-dom';

// Shimmer Component for Loading States
const Shimmer = ({
  width = "100%",
  height = "20px",
  borderRadius = "4px",
  className = ""
}) => {
  return (
    <div
      className={`
        relative 
        overflow-hidden 
        bg-gray-200 
        animate-pulse 
        ${className}
      `}
      style={{
        width,
        height,
        borderRadius
      }}
    >
      <div
        className="
          absolute 
          top-0 
          left-0 
          right-0 
          bottom-0 
          bg-gradient-to-r 
          from-gray-200 
          via-gray-300 
          to-gray-200
        "
        style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite linear',
          transformOrigin: 'center center'
        }}
      />
    </div>
  );
};

// Access Level Constants...
const ACCESS_LEVELS = {
  NONE: 'NONE',
  VIEW: 'VIEW',
  EDIT: 'EDIT',
  FULL: 'FULL'
};


const Webtab = () => {
  const navigate = useNavigate();
  // State Management
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('userDetails');
  const [formData, setFormData] = useState({
    email_id: "",
    first_name: "",
    last_name: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);
  const [userDetails, setUserDetails] = useState([]);
  const [daysLeft, setDaysLeft] = useState(0);
  const [deleteLoadingId, setDeleteLoadingId] = useState("7823784");

  // User Access State
  const [userAccessData, setUserAccessData] = useState([]);
  
  // Utility Functions
  const getDaysLeft = (endDate) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };


   // Update User Access Function
   const updateUserAccess = async (userId, section, level) => {
    try {
      // Optimistic Update
      setUserAccessData(prevData => 
        prevData.map(user => 
          user.userid === userId 
            ? {
                ...user, 
                access: {
                  ...user.access,
                  [section]: level
                }
              }
            : user
        )
      );

      // API Call to Save Access
      await axios.post(`${process.env.REACT_APP_APP_API}/admin/update-user-access`, {
        userId,
        section,
        accessLevel: level
      });

      toast.success('User access updated successfully');
    } catch (error) {
      toast.error("Failed to update user access");
      
      // Revert optimistic update on error
      setUserAccessData(prevData => [...prevData]);
    }
  };

  // Access Control Dropdown Component
  const AccessControlDropdown = ({ 
    userId, 
    section, 
    currentLevel 
  }) => {
    return (
      <select
        value={currentLevel}
        onChange={(e) => updateUserAccess(userId, section, e.target.value)}
        className="w-full p-2 border rounded text-sm"
      >
        {Object.values(ACCESS_LEVELS).map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
    );
  };

  // Handle Form Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

    // Fetch User Details
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${process.env.REACT_APP_APP_API}/admin/webtab`);
        if(response?.status === 200){
          setData(response?.data?.data[0]?.Organization);
          
          // Set User Details
          const users = response?.data?.users[0];
          setUserDetails(users);
  
          // Set User Access Data 
          const userAccessInfo = users.map(user => ({
            userid: user.usermanagement.userid,
            email: user.usermanagement.email,
            username: `${user.usermanagement.first_name || ''} ${user.usermanagement.last_name || ''}`.trim(),
            access: {
              Leads: ACCESS_LEVELS.NONE,
              Tasks: ACCESS_LEVELS.NONE,
              Meetings: ACCESS_LEVELS.NONE,
              Contacts: ACCESS_LEVELS.NONE,
              Deals: ACCESS_LEVELS.NONE
            }
          }));
          setUserAccessData(userAccessInfo);
        }
        setIsLoading(false);
      } catch (error) {
        if(error?.response?.status === 401){
          navigate("/app/unauth")
        }
        toast.error("You cannot access this page!");
        setIsLoading(false);
      }
    };
    
  

  // Remove User with Optimistic Update
  const handleRemoveUser = async (id) => {
    // Immediately show loading state for specific row
    setDeleteLoadingId(id);
    
    try {
      await axios.delete(`${process.env.REACT_APP_APP_API}/admin/removeuser/${id}`);
      
      // Optimistic Update: Remove user from local state
      const updatedUsers = userDetails.filter(user => 
        user?.usermanagement?.userid !== id
      );
      
      setUserDetails(updatedUsers);
      toast.success('User successfully removed');
      
      // Refresh overall data to update license counts
      fetchUserDetails();
    } catch (error) {
      toast.error("Failed to remove user");
    } finally {
      setDeleteLoadingId(null);
    }
  };
  // Submit New User
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post(`${process.env.REACT_APP_APP_API}/test/adduser`, formData);
      
      // Optimistic Update: Add new user to local state
      const newUser = {
        usermanagement: {
          userid: response.data.userId, // Assuming API returns new user ID
          username: `${formData.first_name} ${formData.last_name}`,
          email: formData.email_id
        }
      };
      
      setUserDetails([...userDetails, newUser]);
      
      // Reset form and show success
      setFormData({
        email_id: "",
        first_name: "",
        last_name: ""
      });
      setShowModal(false);
      
      // Refresh overall data to update license counts
      fetchUserDetails();
      
      toast.success('User added successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add user");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initial Data Fetch
  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Calculate Days Left
  useEffect(() => {
    if (data?.activationEndDate) {
      setDaysLeft(getDaysLeft(data.activationEndDate));
    }
  }, [data]);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
  
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">User Management Dashboard</h1>
        <p className="text-gray-600">Manage your users and license</p>
      </div>

    

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {isLoading ? (
          <>
            <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">Active Users</h2>
              <Shimmer />
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow border border-green-100">
              <h2 className="text-lg font-semibold text-green-800 mb-2">Total Users</h2>
              <Shimmer />
            </div>
            <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-100">
              <h2 className="text-lg font-semibold text-purple-800 mb-2">Available Seats</h2>
              <Shimmer />
            </div>
          </>
        ) : (
          <>
            <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
              <h2 className="text-lg font-semibold text-blue-800">Active Users</h2>
              <p className="text-3xl font-bold text-blue-600">{data?.activeLicense}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg shadow border border-green-100">
              <h2 className="text-lg font-semibold text-green-800">Total Users</h2>
              <p className="text-3xl font-bold text-green-600">{data?.totalLicenses}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-100">
              <h2 className="text-lg font-semibold text-purple-800">Available Seats</h2>
              <p className="text-3xl font-bold text-purple-600">{data?.totalLicenses - data?.activeLicense}</p>
            </div>
          </>
        )}
      </div>

      {/* License Information */}
      <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex justify-between">
          <h2 className="inline-block text-lg font-semibold mb-3 text-gray-800">
            License Information
          </h2>
          {isLoading ? (
            <Shimmer width="100px" height="24px" />
          ) : (
            <h2
              className={`inline-block text-lg font-semibold mb-3 ${daysLeft > 3 ? "text-gray-600" : "text-red-600"}`}
            >
              {daysLeft} {daysLeft === 1 || daysLeft === -1 ? "day" : "days"} to go
            </h2>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoading ? (
            <>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">License Key</p>
                <Shimmer />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Activation Date</p>
                <Shimmer />
              </div>
              <div>
                <p className="text-sm font-medium text-red-400 mb-2">Expiry Date</p>
                <Shimmer />
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-medium text-gray-500">License Key</p>
                <p className="font-mono text-gray-800">{data?.licenseKey}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Activation Date</p>
                <p className="text-gray-800">{formatDate(data?.activationdate)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-red-400">Expiry Date</p>
                <p className="text-gray-800">{formatDate(data?.activationEndDate)}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          disabled={(data?.totalLicenses - data?.activeLicense) <= 0}
        >
          <FaUserPlus className="mr-2" />
          Add User
        </button>
      </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
              <nav className="-mb-px flex space-x-4">
                <button
                  onClick={() => setActiveTab('userDetails')}
                  className={`
                    py-3 px-4 flex items-center 
                    ${activeTab === 'userDetails' 
                      ? 'border-b-2 border-indigo-600 text-indigo-600' 
                      : 'text-gray-500 hover:text-gray-700'}
                    font-medium text-sm transition-colors
                  `}
                >
                  <FaUsers className="mr-2" />
                  User Details
                </button>
                <button
                  onClick={() => setActiveTab('scopesPermissions')}
                  className={`
                    py-3 px-4 flex items-center 
                    ${activeTab === 'scopesPermissions' 
                      ? 'border-b-2 border-indigo-600 text-indigo-600' 
                      : 'text-gray-500 hover:text-gray-700'}
                    font-medium text-sm transition-colors
                  `}
                >
                  <FaLock className="mr-2" />
                  Scopes & Permissions
                </button>
              </nav>
            </div>

      {/* Users Table */}
      {activeTab === 'userDetails' && (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {isLoading ? (
              [1, 2, 3, 4].map((_, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {[1, 2, 3, 4, 5, 6].map((cell) => (
                    <td key={cell} className="py-3 px-4">
                      <Shimmer height="16px" width="100%" />
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              userDetails.map((user) => (
                <tr key={user.usermanagement.userid} className="hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-mono text-gray-900">
                    {user.usermanagement.userid}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {user.usermanagement.username}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {user.usermanagement.email}
                  </td>
                  <td className="py-3 px-4 text-sm text-right flex justify-center space-x-2">
                    <button
                      onClick={() => handleRemoveUser(user.usermanagement.userid)}
                      disabled={deleteLoadingId === user.usermanagement.userid}
                      className={`
                        px-3 py-1 
                        bg-red-100 text-red-700 
                        rounded-md text-xs 
                        hover:bg-red-200 
                        flex items-center
                        ${deleteLoadingId === user.usermanagement.userid ? 'opacity-50 cursor-not-allowed' : ''}
                      `}
                    >
                      {deleteLoadingId === user.usermanagement.userid ? (
                        <div className="flex items-center">
                          <svg 
                            className="animate-spin h-4 w-4 mr-1" 
                            xmlns="http://www.w3.org/2000/svg" 
                            fill="none" 
                            viewBox="0 0 24 24"
                          >
                            <circle 
                              className="opacity-25" 
                              cx="12" 
                              cy="12" 
                              r="10" 
                              stroke="currentColor" 
                              strokeWidth="4"
                            ></circle>
                            <path 
                              className="opacity-75" 
                              fill="currentColor" 
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Removing
                        </div>
                      ) : (
                        <>
                          <FaTrash className="mr-1" /> Remove
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      )}

{activeTab === 'scopesPermissions' && (
  <div className="overflow-x-auto">
    <table className="min-w-full bg-white border border-gray-200 rounded-lg">
      <thead className="bg-gray-50">
        <tr>
          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
          <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
          <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
          <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
          <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Meetings</th>
          <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Contacts</th>
          <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Deals</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {isLoading ? (
          [1, 2, 3, 4].map((_, index) => (
            <tr key={index} className="hover:bg-gray-50">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
                <td key={cell} className="py-3 px-4">
                  <Shimmer height="16px" width="100%" />
                </td>
              ))}
            </tr>
          ))
        ) : (
          userAccessData.map((user) => (
            <tr key={user.userid} className="hover:bg-gray-50">
              <td className="py-3 px-4 text-sm font-mono text-gray-900">
                {user.userid}
              </td>
              <td className="py-3 px-4 text-sm text-gray-500">
                {user.email}
              </td>
              <td className="py-3 px-4 text-sm text-gray-900">
                {user.username}
              </td>
              <td className="py-3 px-4">
                <AccessControlDropdown 
                  userId={user.userid}
                  section="Leads"
                  currentLevel={user.access.Leads}
                />
              </td>
              <td className="py-3 px-4">
                <AccessControlDropdown 
                  userId={user.userid}
                  section="Tasks"
                  currentLevel={user.access.Tasks}
                />
              </td>
              <td className="py-3 px-4">
                <AccessControlDropdown 
                  userId={user.userid}
                  section="Meetings"
                  currentLevel={user.access.Meetings}
                />
              </td>
              <td className="py-3 px-4">
                <AccessControlDropdown 
                  userId={user.userid}
                  section="Contacts"
                  currentLevel={user.access.Contacts}
                />
              </td>
              <td className="py-3 px-4">
                <AccessControlDropdown 
                  userId={user.userid}
                  section="Deals"
                  currentLevel={user.access.Deals}
                />
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)}


      {/* Add User Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" 
            onClick={() => setShowModal(false)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <FaUserPlus className="mr-2" />
                  Add New User
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-white hover:text-indigo-200 transition-colors"
                >
                  <IoMdClose className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email_id"
                      name="email_id"
                      value={formData.email_id}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Enter email address"
                    />
                  </div>

                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Enter first name"
                    />
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`
                      w-full 
                      bg-indigo-600 
                      hover:bg-indigo-700 
                      text-white 
                      py-3 
                      rounded-lg 
                      transition 
                      duration-300 
                      font-medium 
                      flex 
                      items-center 
                      justify-center 
                      ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}
                    `}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      "Add User"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Webtab;
