import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserPlus, FaTrash, FaUsers, FaLock, FaExclamationTriangle, FaEdit } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { toast, Toaster } from 'react-hot-toast';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Edit, Home, Key } from 'lucide-react';

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
  1: 'View',
  2: 'View/Create',
  3: 'View/Create/Edit',
  4: 'Full Access/All'
};

const OrganizationPersonalizationPanel = ({orgid,licenseKey}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [domain, setDomain] = useState("");
  const [orgId, setOrgId] = useState("");
  const [widgetName, setWidgetName] = useState("");
  const [widgetUrl, setWidgetUrl] = useState("");


  // Handle domain change
  const handleDomainChange = (e) => {
    setDomain(e.target.value);
  };

  // Handle widget name change
  const handleWidgetNameChange = (e) => {
    setWidgetName(e.target.value);
  };

  // Handle widget URL change
  const handleWidgetUrlChange = (e) => {
    setWidgetUrl(e.target.value);
  };

  // Save organization details
  const saveOrganizationDetails = async () => {
    setIsLoading(true);
    
    try {
      // Create a single widget object
      const widget = {
        name: widgetName,
        url: widgetUrl
      };
      
      const orgDetails = {
        domain,
        key:licenseKey,
        orgId,
        widget: widget.url  // Send a single widget object
      };
      
      const response = await axios.put(`${process.env.REACT_APP_APP_API}/webtab/editorgdetails`, orgDetails);
      
      if (response.status === 200) {
        toast.success("Organization details updated successfully");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to update organization details");
    } finally {
      setIsLoading(false);
    }
  };


  // Fetch organization details on component mount
  useEffect(() => {
    const fetchOrgDetails = async () => {
      setIsLoading(true); 
      try {
        const response = await axios.post(`${process.env.REACT_APP_APP_API}/webtab/getdetails`,{orgId:orgid,key:licenseKey});
        
        if (response.status === 200) {
          const data = response.data;
          
          setOrgId(data.data[0]?.Organization?.ROWID || "");
          setDomain(data.data[0]?.Organization?.domain || "");
          
          // Handle the single widget data
          const widget = data.data[0]?.Organization?.widget;

          if (widget) {
            setWidgetName("Widget 1" || "");
            setWidgetUrl(widget || "");
          }
        }
      } catch (error) {
        toast.error("Failed to load organization details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrgDetails();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-6">Organization Personalization</h2>
      
      {isLoading ? (
        <div className="space-y-6">
          <Shimmer height="60px" />
          <Shimmer height="60px" />
          <Shimmer height="200px" />
        </div>
      ) : (
        <>
          {/* CRM Domain */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-md font-medium text-gray-700 mb-3">CRM Domain</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={domain}
                onChange={handleDomainChange}
                placeholder="Enter your custom domain"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Your CRM will be accessible at: {domain || 'your-domain'}
            </p>
          </div>
          
          {/* Organization ID */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-md font-medium text-gray-700 mb-3">Organization ID</h3>
            <div className="flex space-x-2">
              <input
                type="text"
                value={orgId}
                readOnly
                placeholder="Enter your organization ID"
                className="flex-1 px-4 py-2 border border-gray-200 bg-gray-50 rounded-md"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              This ID is used for integration with other services
            </p>
          </div>
          
          {/* Single Widget Configuration */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-md font-medium text-gray-700 mb-3">Widget Configuration</h3>
            <p className="text-sm text-gray-500 mb-4">
              Configure an external widget that will be available in your CRM dashboard
            </p>
            
            <div className="mb-4 p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium text-gray-700 mb-3">Widget</h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label htmlFor="widget-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Widget Name
                  </label>
                  <input
                    type="text"
                    id="widget-name"
                    value={widgetName}
                    onChange={handleWidgetNameChange}
                    placeholder="Enter widget name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label htmlFor="widget-url" className="block text-sm font-medium text-gray-700 mb-1">
                    Widget URL
                  </label>
                  <input
                    type="text"
                    id="widget-url"
                    value={widgetUrl}
                    onChange={handleWidgetUrlChange}
                    placeholder="https://example.com/widget"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={saveOrganizationDetails}
              disabled={isLoading}
              className={`
                px-6 py-2 
                bg-indigo-600 
                text-white 
                rounded-md 
                hover:bg-indigo-700 
                transition
                ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
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
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};


const AdminPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { orgid, email, key } = location.state || {};

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
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  
  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  // User Access State
  const [userAccessData, setUserAccessData] = useState([]);

  // For handling which user creation method to use
const [addUserMethod, setAddUserMethod] = useState('email');

// For contact search functionality
const [contactSearchEmail, setContactSearchEmail] = useState('');
const [isSearching, setIsSearching] = useState(false);
const [contactSearchStatus, setContactSearchStatus] = useState(''); // 'found'


// Add these new state variables to the AdminPage component
const [contactSuggestions, setContactSuggestions] = useState([]);
const [isShowingSuggestions, setIsShowingSuggestions] = useState(false);



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
      await axios.post(`${process.env.REACT_APP_APP_API}/webtab/update-user-access`, {
        userId,
        section,
        accessLevel: level,
        key:key
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
        {Object.entries(ACCESS_LEVELS).map(([key, level]) => (
          <option key={key} value={key}>
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
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/webtab/adminview`, {
        params: {
            orgid: orgid,
            email: email,
            key:key
            }
        }
      );
      if (response?.status === 200) {
        setData(response?.data?.data[0]?.Organization);

        // Set User Details
        const users = response?.data?.users[0];
        setUserDetails(users);

        // Set User Access Data 
        const userAccessInfo = users.map(user => ({
          userid: user.usermanagement.userid,
          email: user.usermanagement.email,
          username: user.usermanagement.username,
          access: {
            Leads: user.usermanagement.Leads || 4,
            Tasks: user.usermanagement.Tasks || 4,
            Meetings: user.usermanagement.Meetings || 4,
            Contacts: user.usermanagement.Contacts || 4,
            Deals: user.usermanagement.Deals || 4
          }
        }));
        setUserAccessData(userAccessInfo);
      }
      setIsLoading(false);
    } catch (error) {
      if (error?.response?.status === 401) {
        navigate("/app/unauth")
      }
      toast.error("You cannot access this page!");
      setIsLoading(false);
    }
  };

  // Open Confirmation Modal
  const openConfirmModal = (user) => {
    setUserToDelete(user);
    setShowConfirmModal(true);
  };

  // Close Confirmation Modal
  const closeConfirmModal = () => {
    setShowConfirmModal(false);
    setUserToDelete(null);
  };

  // Remove User with Optimistic Update
  const handleRemoveUser = async (id,useremail) => {
    // Immediately show loading state for specific row
    setDeleteLoadingId(id);

    try {
        const response = await axios.delete(
        `${process.env.REACT_APP_APP_API}/webtab/removeuser/${id}`,
        {
            params: {
            orgId: orgid, 
            email: useremail,
            key:key
            }
        }
        );      
      if(response.status === 200){
        const crmresponse = await axios.post(`${process.env.REACT_APP_APP_API}/webtab/crmupdate/${id}`,{orgId:orgid,key:key})
         // Optimistic Update: Remove user from local state
      const updatedUsers = userDetails.filter(user =>
        user?.usermanagement?.userid !== id
      );
      setUserDetails(updatedUsers);
      toast.success('User successfully removed');

      // Refresh overall data to update license counts
      fetchUserDetails();
      }


     
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove user");
    } finally {
      setDeleteLoadingId(null);
      closeConfirmModal();
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const regResponse = await axios.post(`${process.env.REACT_APP_APP_API}/webtab/adduser`, {...formData, orgid: orgid,key:key});
  
      if (regResponse.status === 200) {
        const crmresponse = await axios.post(`${process.env.REACT_APP_APP_API}/webtab/createnewuser/easyportal__Portal_Users`, {
          crmuserid: regResponse.data.data.user_id,
          easyportal__User_Email: formData.email_id,
          domain:regResponse.data.data.domain,
          Name: `${formData.first_name} ${formData.last_name}`,
          easyportal__Status: "Active",
          orgId: regResponse.data.data.orgId,
          licenseRollback: regResponse.data.data.licenseRollback,
          key:key
        });
        
  
        if (crmresponse.status === 200) {
          toast.success("User added successfully");
  
          const newUser = {
            usermanagement: {
              userid: regResponse.data.data.user_id,
              username: `${formData.first_name} ${formData.last_name}`,
              email: formData.email_id
            }
          };
  
          setUserDetails(prev => [...prev, newUser]);
          setFormData({ email_id: "", first_name: "", last_name: "" });
          setShowModal(false);
          fetchUserDetails();
        } else {
          throw new Error(crmresponse.data.message || "CRM update failed");
        }
      } else {
        throw new Error(regResponse.data.message || "User registration failed");
      }
    } catch (error) {
      toast.error(error.response.data.message || "User could not be added!");
    } finally {
      setIsSubmitting(false);
    } 
  };


// Updated handleSelectSuggestion function
const handleSelectSuggestion = (contact) => {
  setFormData({
    email_id: contact.Email || contactSearchEmail,
    first_name: contact.First_Name || '',
    last_name: contact.Last_Name || ''
  });
  setContactSearchEmail(contact.Email || '');
  setContactSearchStatus('found');
  setIsShowingSuggestions(false);
  setContactSuggestions([]); // Clear suggestions
};

// Updated handleSearchInputChange to make suggestions more responsive
const handleSearchInputChange = (e) => {
  const value = e.target.value;
  setContactSearchEmail(value);
  
  // Clear suggestions if input is empty
  if (!value) {
    setIsShowingSuggestions(false);
    setContactSuggestions([]);
    setContactSearchStatus('');
  } else if (contactSuggestions.length > 0) {
    // Show suggestions again if we have them and user is typing
    setIsShowingSuggestions(true);
  }
};

// Updated searchContactByEmail function with better error handling
const searchContactByEmail = async () => {
  if (!contactSearchEmail) return;

  if(contactSearchEmail.length < 4) {
    toast.error("Please enter atleast 3 charactor for search");
    return;
  }
  
  setIsSearching(true);
  setContactSearchStatus('');
  
  try {
    const response = await axios.get(`${process.env.REACT_APP_APP_API}/webtab/searchcontact`, {
      params: {
        email: contactSearchEmail,
        orgId: orgid,
        searchType: 'partial',
        key:key
      }
    });

    console.log(response);
    
    if (response.status === 200 && response.data.success) {
      if (response.data.data.data && response.data.data.data.length > 0) {
        const contacts = response.data.data.data;
        
        if (contacts.length === 1) {
          // Only one contact found, auto-fill the form
          const contactData = contacts[0];
          setFormData({
            email_id: contactData.Email || contactSearchEmail,
            first_name: contactData.First_Name || '',
            last_name: contactData.Last_Name || ''
          });
          setContactSearchStatus('found');
          setContactSuggestions([]);
          setIsShowingSuggestions(false);
        } else {
          // Multiple contacts found, show suggestions
          setContactSuggestions(contacts);
          setIsShowingSuggestions(true);
          setContactSearchStatus('suggestions');
        }
      } else {
        // No contacts found
        setContactSearchStatus('not_found');
        toast.error("No contact found!");
        setContactSuggestions([]);
        setIsShowingSuggestions(false);
      }
    } else {
      // API call successful but no results
      setContactSearchStatus('not_found');
      setContactSuggestions([]);
      setIsShowingSuggestions(false);
    }
  } catch (error) {
    toast.error("Failed to search for contact");
    console.log(error)
    setContactSearchStatus('not_found');
    setContactSuggestions([]);
    setIsShowingSuggestions(false);
  } finally {
    setIsSearching(false);
  }
};

// Add this function to highlight matching text in suggestions
const highlightMatch = (text, query) => {
  if (!query || !text) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) => 
    regex.test(part) ? 
      <span key={index} className="bg-yellow-200 font-medium">{part}</span> : 
      <span key={index}>{part}</span>
  );
};


// Make sure to handle clicks outside the suggestions dropdown
useEffect(() => {
  const handleClickOutside = (event) => {
    const suggestionsContainer = document.getElementById('suggestions-container');
    if (suggestionsContainer && !suggestionsContainer.contains(event.target)) {
      setIsShowingSuggestions(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);
// Add this helper function to highlight matching text in suggestions

// Add this function to handle the submit when using the contact form
const handleContactSubmit = async (e) => {
  e.preventDefault();
  // You can use the same handleSubmit function since the formData structure is the same
  handleSubmit(e);
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
      <div className="mb-6 flex justify-between">
         <div>
         <h1 className="text-2xl font-bold text-gray-800">User Management Dashboard</h1>
         <p className="text-gray-600">Manage your users and license</p>
         </div>
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

      {/* Tabs - Horizontally Scrollable */}
<div className="mb-6 border-b border-gray-200">
  <div className="overflow-x-auto scrollbar-hide">
    <nav className="-mb-px flex space-x-4 whitespace-nowrap py-1 px-1">
      <button
        onClick={() => setActiveTab('userDetails')}
        className={`
          py-3 px-4 flex-shrink-0 flex items-center 
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
          py-3 px-4 flex-shrink-0 flex items-center 
          ${activeTab === 'scopesPermissions'
            ? 'border-b-2 border-indigo-600 text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'}
          font-medium text-sm transition-colors
        `}
      >
        <FaLock className="mr-2" />
        Scopes & Permissions
      </button>
      <button
        onClick={() => setActiveTab('personalized')}
        className={`
          py-3 px-4 flex-shrink-0 flex items-center 
          ${activeTab === 'personalized'
            ? 'border-b-2 border-indigo-600 text-indigo-600'
            : 'text-gray-500 hover:text-gray-700'}
          font-medium text-sm transition-colors
        `}
      >
        <FaEdit className="mr-2" />
        Personalization
      </button>
    </nav>
  </div>
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
                        onClick={() => openConfirmModal(user)}
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
      
      {activeTab === 'personalized' && (
        <div>
          {isLoading ? (
            <div className="space-y-6">
                 <Shimmer height="200px" />
            </div>
          ) : (
            <OrganizationPersonalizationPanel orgid = {orgid} licenseKey={key}/>
          )}
        </div>
      )}
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

      {/* Toggle Buttons */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setAddUserMethod('email')}
          className={`flex-1 py-3 px-4 text-center ${
            addUserMethod === 'email'
              ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Add By Email
        </button>
        <button
          onClick={() => {
            setAddUserMethod('contact');
            setContactSearchStatus('');
          }}
          className={`flex-1 py-3 px-4 text-center ${
            addUserMethod === 'contact'
              ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Add From Contacts
        </button>
      </div>

      {/* Modal Body */}
      <div className="px-6 py-5">
        {addUserMethod === 'email' && (
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
        )}

        {addUserMethod === 'contact' && (
          <>
            <div className="mb-6 relative">
              <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
                Search Contact by Email or Name
              </label>
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <div className="relative">
                    <input
                      type="text"
                      id="contact_email"
                      value={contactSearchEmail}
                      onChange={handleSearchInputChange}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                      placeholder="Enter contact email or name"
                      autoComplete="off"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={searchContactByEmail}
                  disabled={isSearching || !contactSearchEmail}
                  className={`
                    px-4 py-3
                    bg-indigo-600 
                    text-white 
                    rounded-lg 
                    hover:bg-indigo-700 
                    transition-colors
                    flex items-center justify-center min-w-24
                    ${(isSearching || !contactSearchEmail) ? 'opacity-70 cursor-not-allowed' : ''}
                  `}
                >
                  {isSearching ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    "Search"
                  )}
                </button>
              </div>
              
              <p className="mt-2 text-xs text-gray-500">
                Search by email, first name, or last name to find existing contacts
              </p>
            </div>

            {/* Improved Contact Suggestions Dropdown - Key changes here */}
            {isShowingSuggestions && contactSuggestions.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg shadow-lg mb-6 overflow-hidden">
                <div className="py-2">
                  <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50">
                    Matching Contacts ({contactSuggestions.length})
                  </h3>
                  
                  <div className="max-h-64 overflow-y-auto">
                    {contactSuggestions.map((contact, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectSuggestion(contact)}
                        className="cursor-pointer hover:bg-indigo-50 transition-colors py-3 px-4 border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                            <span className="text-indigo-600 font-medium">
                              {(contact.First_Name?.[0] || '') + (contact.Last_Name?.[0] || '')}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {highlightMatch(contact.First_Name || '', contactSearchEmail)} {highlightMatch(contact.Last_Name || '', contactSearchEmail)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {highlightMatch(contact.Email || '', contactSearchEmail)}
                            </div>
                            {contact.Account_Name && (
                              <div className="text-xs text-gray-500 mt-1 flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
                                </svg>
                                {contact.Account_Name.Name}
                              </div>
                            )}
                          </div>
                          <div className="flex-shrink-0">
                            <button className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-full transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {contactSearchStatus === 'found' && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm leading-5 font-medium text-green-800">
                      Contact found!
                    </h3>
                    <div className="mt-1 text-sm leading-5 text-green-700">
                      {formData.first_name} {formData.last_name} ({formData.email_id})
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Always show the form when contact is found */}
            {contactSearchStatus === 'found' && (
              <form onSubmit={handleContactSubmit}>
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
            )}
          </>
        )}    
      </div>
    </div>
  </div>
)}

      {/* Confirmation Modal */}
      {showConfirmModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={closeConfirmModal}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white flex items-center">
                  <FaExclamationTriangle className="mr-2" />
                  Confirm User Removal
                </h3>
                <button
                  onClick={closeConfirmModal}
                  className="text-white hover:text-red-200 transition-colors"
                >
                  <IoMdClose className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <div className="text-center mb-6">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <FaExclamationTriangle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Are you sure you want to remove this user?</h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. The user will lose access to the system.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex items-center mb-2">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                    <span className="text-indigo-600 font-medium">
                      {userToDelete?.usermanagement?.username?.charAt(0).toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{userToDelete.usermanagement.username || ""}</p>
                    <p className="text-sm text-gray-500">{userToDelete.usermanagement.email || ""}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  <span className="font-medium">User ID:</span> {userToDelete.usermanagement.userid}
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={closeConfirmModal}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRemoveUser(userToDelete.usermanagement.userid,userToDelete.usermanagement.email)}
                  disabled={deleteLoadingId === userToDelete.usermanagement.userid}
                  className={`
                    flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors
                    ${deleteLoadingId === userToDelete.usermanagement.userid ? 'opacity-75 cursor-not-allowed' : ''}
                  `}
                >
                  {deleteLoadingId === userToDelete.usermanagement.userid ? (
                    <div className="flex items-center justify-center">
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
                      Removing...
                    </div>
                  ) : (
                    "Remove User"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPage;


// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import { FaUserPlus, FaTrash, FaUsers, FaLock, FaExclamationTriangle, FaEdit } from 'react-icons/fa';
// import { IoMdClose } from 'react-icons/io';
// import { toast, Toaster } from 'react-hot-toast';
// import { Link, useLocation, useNavigate } from 'react-router-dom';
// import { Edit, Home } from 'lucide-react';

// // Shimmer Component for Loading States

// const Shimmer = ({
//   width = "100%",
//   height = "20px",
//   borderRadius = "4px",
//   className = ""
// }) => {
//   return (
//     <div
//       className={`
//         relative 
//         overflow-hidden 
//         bg-gray-200 
//         animate-pulse 
//         ${className}
//       `}
//       style={{
//         width,
//         height,
//         borderRadius
//       }}
//     >
//       <div
//         className="
//           absolute 
//           top-0 
//           left-0 
//           right-0 
//           bottom-0 
//           bg-gradient-to-r 
//           from-gray-200 
//           via-gray-300 
//           to-gray-200
//         "
//         style={{
//           backgroundSize: '200% 100%',
//           animation: 'shimmer 1.5s infinite linear',
//           transformOrigin: 'center center'
//         }}
//       />
//     </div>
//   );
// };

// // Access Level Constants...
// const ACCESS_LEVELS = {
//   1: 'View',
//   2: 'View/Create',
//   3: 'View/Create/Edit',
//   4: 'Full Access/All'
// };

// // Add this component above the Webtab component
// const OrganizationPersonalizationPanel = () => {
//   const [isLoading, setIsLoading] = useState(false);
//   const [domain, setDomain] = useState("");
//   const [orgId, setOrgId] = useState("");
//   const [widgets, setWidgets] = useState([
//     { name: "", url: "" },
//     { name: "", url: "" },
//     { name: "", url: "" }
//   ]);

//   // Handle domain change
//   const handleDomainChange = (e) => {
//     setDomain(e.target.value);
//   };

//   // Handle org ID change
//   const handleOrgIdChange = (e) => {
//     setOrgId(e.target.value);
//   };

//   // Handle widget changes
//   const handleWidgetChange = (index, field, value) => {
//     const updatedWidgets = [...widgets];
//     updatedWidgets[index] = {
//       ...updatedWidgets[index],
//       [field]: value
//     };
//     setWidgets(updatedWidgets);
//   };

//   // Save organization details
//   const saveOrganizationDetails = async () => {
//     setIsLoading(true);
    
//     try {
//       // Filter out empty widgets
//       const activeWidgets = widgets.filter(widget => widget.name && widget.url);
      
//       const orgDetails = {
//         domain,
//         orgId,
//         widgets: activeWidgets
//       };
      
//       const response = await axios.post(`${process.env.REACT_APP_APP_API}/edit/orgdetails`, orgDetails);
      
//       if (response.status === 200) {
//         toast.success("Organization details updated successfully");
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Failed to update organization details");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch organization details on component mount
//   useEffect(() => {
//     const fetchOrgDetails = async () => {
//       setIsLoading(true); 
//       try {
//         const response = await axios.post(`${process.env.REACT_APP_APP_API}/org/getdetails`);
        
//         if (response.status === 200) {
//           const data = response.data;
                
         
//           setOrgId(data.data[0]?.Organization?.ROWID|| "");
          
//           // Set widgets if available
//           if (data.widgets && data.widgets.length > 0) {
//             // Create a new array with 3 slots
//             const newWidgets = [
//               { name: "", url: "" },
//               { name: "", url: "" },
//               { name: "", url: "" }
//             ];
            
//             // Fill with existing widget data
//             data.widgets.forEach((widget, index) => {
//               if (index < 3) {
//                 newWidgets[index] = widget;
//               }
//             });
            
//             setWidgets(newWidgets);
//           }
//         }
//       } catch (error) {
//         toast.error("Failed to load organization details");
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchOrgDetails();
//   }, []);

//   return (
//     <div className="bg-white rounded-lg shadow p-6">
//       <h2 className="text-lg font-semibold text-gray-800 mb-6">Organization Personalization</h2>
      
//       {isLoading ? (
//         <div className="space-y-6">
//           <Shimmer height="60px" />
//           <Shimmer height="60px" />
//           <Shimmer height="200px" />
//         </div>
//       ) : (
//         <>
//           {/* CRM Domain */}
//           <div className="mb-6 pb-6 border-b border-gray-200">
//             <h3 className="text-md font-medium text-gray-700 mb-3">CRM OrgId</h3>
//             <div className="flex space-x-2">
//               <input
//                 type="text"
//                 value={domain}
//                 onChange={handleDomainChange}
//                 placeholder="Enter your custom domain"
//                 className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//               />
//             </div>
//             <p className="mt-2 text-sm text-gray-500">
//               Your CRM will be accessible at: {domain || 'your-domain'}
//             </p>
//           </div>
          
//           {/* Organization ID */}
//           <div className="mb-6 pb-6 border-b border-gray-200">
//             <h3 className="text-md font-medium text-gray-700 mb-3">Organization ID</h3>
//             <div className="flex space-x-2">
//               <input
//                 type="text"
//                 value={orgId}
//                 readOnly
//                 placeholder="Enter your organization ID"
//                 className="flex-1 px-4 py-2 rounded-md"
//               />
//             </div>
//             <p className="mt-2 text-sm text-gray-500">
//               This ID is used for integration with other services
//             </p>
//           </div>
          
//           {/* Widget Configuration */}
//           <div className="mb-6 pb-6 border-b border-gray-200">
//             <h3 className="text-md font-medium text-gray-700 mb-3">Widget Configuration</h3>
//             <p className="text-sm text-gray-500 mb-4">
//               Configure up to 3 external widgets that will be available in your CRM dashboard
//             </p>
            
//             {widgets.map((widget, index) => (
//               <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
//                 <h4 className="font-medium text-gray-700 mb-3">Widget {index + 1}</h4>
//                 <div className="grid grid-cols-1 gap-4">
//                   <div>
//                     <label htmlFor={`widget-name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
//                       Widget Name
//                     </label>
//                     <input
//                       type="text"
//                       id={`widget-name-${index}`}
//                       value={widget.name}
//                       onChange={(e) => handleWidgetChange(index, 'name', e.target.value)}
//                       placeholder="Enter widget name"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//                     />
//                   </div>
//                   <div>
//                     <label htmlFor={`widget-url-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
//                       Widget URL
//                     </label>
//                     <input
//                       type="text"
//                       id={`widget-url-${index}`}
//                       value={widget.url}
//                       onChange={(e) => handleWidgetChange(index, 'url', e.target.value)}
//                       placeholder="https://example.com/widget"
//                       className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
//                     />
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
          
//           {/* Save Button */}
//           <div className="flex justify-end">
//             <button
//               onClick={saveOrganizationDetails}
//               disabled={isLoading}
//               className={`
//                 px-6 py-2 
//                 bg-indigo-600 
//                 text-white 
//                 rounded-md 
//                 hover:bg-indigo-700 
//                 transition
//                 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
//               `}
//             >
//               {isLoading ? (
//                 <div className="flex items-center">
//                   <svg
//                     className="animate-spin h-4 w-4 mr-2"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                   >
//                     <circle
//                       className="opacity-25"
//                       cx="12"
//                       cy="12"
//                       r="10"
//                       stroke="currentColor"
//                       strokeWidth="4"
//                     ></circle>
//                     <path
//                       className="opacity-75"
//                       fill="currentColor"
//                       d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                     ></path>
//                   </svg>
//                   Saving...
//                 </div>
//               ) : (
//                 "Save Changes"
//               )}
//             </button>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };



// const AdminPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   console.log(location.state)
//   const { orgid, email } = location.state || {};
//   console.log("Org ID:", orgid);
//     console.log("Email:", email);
//   // State Management
//   const [showModal, setShowModal] = useState(false);
//   const [activeTab, setActiveTab] = useState('userDetails');
//   const [formData, setFormData] = useState({
//     email_id: "",
//     first_name: "",
//     last_name: ""
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [data, setData] = useState(null);
//   const [userDetails, setUserDetails] = useState([]);
//   const [daysLeft, setDaysLeft] = useState(0);
//   const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  
//   // Confirmation Modal State
//   const [showConfirmModal, setShowConfirmModal] = useState(false);
//   const [userToDelete, setUserToDelete] = useState(null);

//   // User Access State
//   const [userAccessData, setUserAccessData] = useState([]);

//   // For handling which user creation method to use
// const [addUserMethod, setAddUserMethod] = useState('email');

// // For contact search functionality
// const [contactSearchEmail, setContactSearchEmail] = useState('');
// const [isSearching, setIsSearching] = useState(false);
// const [contactSearchStatus, setContactSearchStatus] = useState(''); // 'found'


// // Add these new state variables to the AdminPage component
// const [contactSuggestions, setContactSuggestions] = useState([]);
// const [isShowingSuggestions, setIsShowingSuggestions] = useState(false);



//   // Utility Functions
//   const getDaysLeft = (endDate) => {
//     const end = new Date(endDate);
//     const today = new Date();
//     const diffTime = end - today;
//     return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//   };

//   const formatDate = (dateStr) => {
//     return new Date(dateStr).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//     });
//   };


//   // Update User Access Function
//   const updateUserAccess = async (userId, section, level) => {
//     try {
//       // Optimistic Update
//       setUserAccessData(prevData =>
//         prevData.map(user =>
//           user.userid === userId
//             ? {
//               ...user,
//               access: {
//                 ...user.access,
//                 [section]: level
//               }
//             }
//             : user
//         )
//       );

//       // API Call to Save Access
//       await axios.post(`${process.env.REACT_APP_APP_API}/webtab/update-user-access`, {
//         userId,
//         section,
//         accessLevel: level
//       });

//       toast.success('User access updated successfully');
//     } catch (error) {
//       toast.error("Failed to update user access");

//       // Revert optimistic update on error
//       setUserAccessData(prevData => [...prevData]);
//     }
//   };

//   // Access Control Dropdown Component
//   const AccessControlDropdown = ({
//     userId,
//     section,
//     currentLevel
//   }) => {
//     return (
//       <select
//         value={currentLevel}
//         onChange={(e) => updateUserAccess(userId, section, e.target.value)}
//         className="w-full p-2 border rounded text-sm"
//       >
//         {Object.entries(ACCESS_LEVELS).map(([key, level]) => (
//           <option key={key} value={key}>
//             {level}
//           </option>
//         ))}

//       </select>
//     );
//   };

//   // Handle Form Input Changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prevData => ({
//       ...prevData,
//       [name]: value
//     }));
//   };

//   // Fetch User Details
//   const fetchUserDetails = async () => {
//     setIsLoading(true);
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_APP_API}/webtab/adminview`, {
//         params: {
//             orgid: orgid,
//             email: email
//             }
//         }
//       );
//       if (response?.status === 200) {
//         setData(response?.data?.data[0]?.Organization);

//         // Set User Details
//         const users = response?.data?.users[0];
//         setUserDetails(users);

//         // Set User Access Data 
//         const userAccessInfo = users.map(user => ({
//           userid: user.usermanagement.userid,
//           email: user.usermanagement.email,
//           username: user.usermanagement.username,
//           access: {
//             Leads: user.usermanagement.Leads || 4,
//             Tasks: user.usermanagement.Tasks || 4,
//             Meetings: user.usermanagement.Meetings || 4,
//             Contacts: user.usermanagement.Contacts || 4,
//             Deals: user.usermanagement.Deals || 4
//           }
//         }));
//         setUserAccessData(userAccessInfo);
//       }
//       setIsLoading(false);
//     } catch (error) {
//       if (error?.response?.status === 401) {
//         navigate("/app/unauth")
//       }
//       toast.error("You cannot access this page!");
//       setIsLoading(false);
//     }
//   };

//   // Open Confirmation Modal
//   const openConfirmModal = (user) => {
//     setUserToDelete(user);
//     setShowConfirmModal(true);
//   };

//   // Close Confirmation Modal
//   const closeConfirmModal = () => {
//     setShowConfirmModal(false);
//     setUserToDelete(null);
//   };

//   // Remove User with Optimistic Update
//   const handleRemoveUser = async (id,useremail) => {
//     // Immediately show loading state for specific row
//     setDeleteLoadingId(id);

//     try {
//         const response = await axios.delete(
//         `${process.env.REACT_APP_APP_API}/webtab/removeuser/${id}`,
//         {
//             params: {
//             orgId: orgid, 
//             email: useremail
//             }
//         }
//         );      
//       if(response.status === 200){
//         const crmresponse = await axios.post(`${process.env.REACT_APP_APP_API}/webtab/crmupdate/${id}`,{orgId:orgid})
//          // Optimistic Update: Remove user from local state
//       const updatedUsers = userDetails.filter(user =>
//         user?.usermanagement?.userid !== id
//       );
//       setUserDetails(updatedUsers);
//       toast.success('User successfully removed');

//       // Refresh overall data to update license counts
//       fetchUserDetails();
//       }


     
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Failed to remove user");
//     } finally {
//       setDeleteLoadingId(null);
//       closeConfirmModal();
//     }
//   };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);
  
//     try {
//       const regResponse = await axios.post(`${process.env.REACT_APP_APP_API}/webtab/adduser`, {...formData, orgid: orgid});
  
//       if (regResponse.status === 200) {
//         const crmresponse = await axios.post(`${process.env.REACT_APP_APP_API}/webtab/createnewuser/easyportal__Portal_Users`, {
//           crmuserid: regResponse.data.data.user_id,
//           easyportal__User_Email: formData.email_id,
//           domain:regResponse.data.data.domain,
//           Name: `${formData.first_name} ${formData.last_name}`,
//           easyportal__Status: "Active",
//           orgId: regResponse.data.data.orgId,
//           licenseRollback: regResponse.data.data.licenseRollback
//         });
        
  
//         if (crmresponse.status === 200) {
//           toast.success("User added successfully");
  
//           const newUser = {
//             usermanagement: {
//               userid: regResponse.data.data.user_id,
//               username: `${formData.first_name} ${formData.last_name}`,
//               email: formData.email_id
//             }
//           };
  
//           setUserDetails(prev => [...prev, newUser]);
//           setFormData({ email_id: "", first_name: "", last_name: "" });
//           setShowModal(false);
//           fetchUserDetails();
//         } else {
//           throw new Error(crmresponse.data.message || "CRM update failed");
//         }
//       } else {
//         throw new Error(regResponse.data.message || "User registration failed");
//       }
//     } catch (error) {
//       toast.error(error.response.data.message || "User could not be added!");
//     } finally {
//       setIsSubmitting(false);
//     } 
//   };




// // Replace the existing searchContactByEmail function with this enhanced version
// const searchContactByEmail = async () => {
//   if (!contactSearchEmail) return;
  
//   setIsSearching(true);
//   setContactSearchStatus('');
//   setContactSuggestions([]);
  
//   try {
//     const response = await axios.get(`${process.env.REACT_APP_APP_API}/webtab/searchcontact`, {
//       params: {
//         email: contactSearchEmail,
//         orgId: orgid,
//         searchType: 'partial' // Add this parameter to get partial matches
//       }
//     });
    
//     if (response.status === 200 && response.data.success) {
//       // Check if we have multiple suggestions
//       if (response.data.data.data && response.data.data.data.length > 0) {
//         const contacts = response.data.data.data;
        
//         if (contacts.length === 1) {
//           // Only one contact found, auto-fill the form
//           const contactData = contacts[0];
//           setFormData({
//             email_id: contactData.Email || contactSearchEmail,
//             first_name: contactData.First_Name || '',
//             last_name: contactData.Last_Name || ''
//           });
//           setContactSearchStatus('found');
//           setIsShowingSuggestions(false);
//         } else {
//           // Multiple contacts found, show suggestions
//           setContactSuggestions(contacts);
//           setIsShowingSuggestions(true);
//           setContactSearchStatus('suggestions');
//         }
//       } else {
//         // No contacts found
//         setContactSearchStatus('not_found');
//         setIsShowingSuggestions(false);
//       }
//     } else {
//       // API call successful but no results
//       setContactSearchStatus('not_found');
//       setIsShowingSuggestions(false);
//     }
//   } catch (error) {
//     console.error("Error searching contact:", error);
//     toast.error("Failed to search for contact");
//     setContactSearchStatus('not_found');
//     setIsShowingSuggestions(false);
//   } finally {
//     setIsSearching(false);
//   }
// };

// // Add this new function to handle suggestion selection
// const handleSelectSuggestion = (contact) => {
//   setFormData({
//     email_id: contact.Email || contactSearchEmail,
//     first_name: contact.First_Name || '',
//     last_name: contact.Last_Name || ''
//   });
//   setContactSearchEmail(contact.Email || '');
//   setContactSearchStatus('found');
//   setIsShowingSuggestions(false);
// };

// // Add this function to handle input changes for the search field
// const handleSearchInputChange = (e) => {
//   setContactSearchEmail(e.target.value);
  
//   // Clear suggestions if input is empty
//   if (!e.target.value) {
//     setIsShowingSuggestions(false);
//     setContactSuggestions([]);
//     setContactSearchStatus('');
//   }
// };

// // Add this function to close the suggestions dropdown
// const closeSuggestions = () => {
//   setIsShowingSuggestions(false);
// };

// // Add this useEffect to handle clicks outside the suggestions dropdown
// useEffect(() => {
//   const handleClickOutside = (event) => {
//     const suggestionsContainer = document.getElementById('suggestions-container');
//     if (suggestionsContainer && !suggestionsContainer.contains(event.target)) {
//       setIsShowingSuggestions(false);
//     }
//   };

//   document.addEventListener('mousedown', handleClickOutside);
//   return () => {
//     document.removeEventListener('mousedown', handleClickOutside);
//   };
// }, []);

// // Add this helper function to highlight matching text in suggestions
// const highlightMatch = (text, query) => {
//   if (!query || !text) return text;
  
//   const regex = new RegExp(`(${query})`, 'gi');
//   const parts = text.split(regex);
  
//   return parts.map((part, index) => 
//     regex.test(part) ? 
//       <span key={index} className="bg-yellow-200 font-medium">{part}</span> : 
//       <span key={index}>{part}</span>
//   );
// };

// // Add this function to handle the submit when using the contact form
// const handleContactSubmit = async (e) => {
//   e.preventDefault();
//   // You can use the same handleSubmit function since the formData structure is the same
//   handleSubmit(e);
// };
  

//   // Initial Data Fetch
//   useEffect(() => {
//     fetchUserDetails();
//   }, []);

//   // Calculate Days Left
//   useEffect(() => {
//     if (data?.activationEndDate) {
//       setDaysLeft(getDaysLeft(data.activationEndDate));
//     }
//   }, [data]);

//   return (
//     <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-lg">

//       {/* Header */}
//       <div className="mb-6 flex justify-between">
//          <div>
//          <h1 className="text-2xl font-bold text-gray-800">User Management Dashboard</h1>
//          <p className="text-gray-600">Manage your users and license</p>
//          </div>
//       </div>




//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//         {isLoading ? (
//           <>
//             <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
//               <h2 className="text-lg font-semibold text-blue-800 mb-2">Active Users</h2>
//               <Shimmer />
//             </div>
//             <div className="bg-green-50 p-4 rounded-lg shadow border border-green-100">
//               <h2 className="text-lg font-semibold text-green-800 mb-2">Total Users</h2>
//               <Shimmer />
//             </div>
//             <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-100">
//               <h2 className="text-lg font-semibold text-purple-800 mb-2">Available Seats</h2>
//               <Shimmer />
//             </div>
//           </>
//         ) : (
//           <>
//             <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
//               <h2 className="text-lg font-semibold text-blue-800">Active Users</h2>
//               <p className="text-3xl font-bold text-blue-600">{data?.activeLicense}</p>
//             </div>
//             <div className="bg-green-50 p-4 rounded-lg shadow border border-green-100">
//               <h2 className="text-lg font-semibold text-green-800">Total Users</h2>
//               <p className="text-3xl font-bold text-green-600">{data?.totalLicenses}</p>
//             </div>
//             <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-100">
//               <h2 className="text-lg font-semibold text-purple-800">Available Seats</h2>
//               <p className="text-3xl font-bold text-purple-600">{data?.totalLicenses - data?.activeLicense}</p>
//             </div>
//           </>
//         )}
//       </div>

//       {/* License Information */}
//       <div className="mb-8 bg-gray-50 p-4 rounded-lg border border-gray-200">
//         <div className="flex justify-between">
//           <h2 className="inline-block text-lg font-semibold mb-3 text-gray-800">
//             License Information
//           </h2>
//           {isLoading ? (
//             <Shimmer width="100px" height="24px" />
//           ) : (
//             <h2
//               className={`inline-block text-lg font-semibold mb-3 ${daysLeft > 3 ? "text-gray-600" : "text-red-600"}`}
//             >
//               {daysLeft} {daysLeft === 1 || daysLeft === -1 ? "day" : "days"} to go
//             </h2>
//           )}
//         </div>
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           {isLoading ? (
//             <>
//               <div>
//                 <p className="text-sm font-medium text-gray-500 mb-2">License Key</p>
//                 <Shimmer />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-500 mb-2">Activation Date</p>
//                 <Shimmer />
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-red-400 mb-2">Expiry Date</p>
//                 <Shimmer />
//               </div>
//             </>
//           ) : (
//             <>
//               <div>
//                 <p className="text-sm font-medium text-gray-500">License Key</p>
//                 <p className="font-mono text-gray-800">{data?.licenseKey}</p>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-gray-500">Activation Date</p>
//                 <p className="text-gray-800">{formatDate(data?.activationdate)}</p>
//               </div>
//               <div>
//                 <p className="text-sm font-medium text-red-400">Expiry Date</p>
//                 <p className="text-gray-800">{formatDate(data?.activationEndDate)}</p>
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="flex flex-wrap gap-4 mb-6">
//         <button
//           onClick={() => setShowModal(true)}
//           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
//           disabled={(data?.totalLicenses - data?.activeLicense) <= 0}
//         >
//           <FaUserPlus className="mr-2" />
//           Add User
//         </button>
//       </div>

//       {/* Tabs - Horizontally Scrollable */}
// <div className="mb-6 border-b border-gray-200">
//   <div className="overflow-x-auto scrollbar-hide">
//     <nav className="-mb-px flex space-x-4 whitespace-nowrap py-1 px-1">
//       <button
//         onClick={() => setActiveTab('userDetails')}
//         className={`
//           py-3 px-4 flex-shrink-0 flex items-center 
//           ${activeTab === 'userDetails'
//             ? 'border-b-2 border-indigo-600 text-indigo-600'
//             : 'text-gray-500 hover:text-gray-700'}
//           font-medium text-sm transition-colors
//         `}
//       >
//         <FaUsers className="mr-2" />
//         User Details
//       </button>
//       <button
//         onClick={() => setActiveTab('scopesPermissions')}
//         className={`
//           py-3 px-4 flex-shrink-0 flex items-center 
//           ${activeTab === 'scopesPermissions'
//             ? 'border-b-2 border-indigo-600 text-indigo-600'
//             : 'text-gray-500 hover:text-gray-700'}
//           font-medium text-sm transition-colors
//         `}
//       >
//         <FaLock className="mr-2" />
//         Scopes & Permissions
//       </button>
//       <button
//         onClick={() => setActiveTab('personalized')}
//         className={`
//           py-3 px-4 flex-shrink-0 flex items-center 
//           ${activeTab === 'personalized'
//             ? 'border-b-2 border-indigo-600 text-indigo-600'
//             : 'text-gray-500 hover:text-gray-700'}
//           font-medium text-sm transition-colors
//         `}
//       >
//         <FaEdit className="mr-2" />
//         Personalization
//       </button>
//     </nav>
//   </div>
// </div>

//       {/* Users Table */}
//       {activeTab === 'userDetails' && (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200 rounded-lg">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
//                 <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
//                 <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                 <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {isLoading ? (
//                 [1, 2, 3, 4].map((_, index) => (
//                   <tr key={index} className="hover:bg-gray-50">
//                     {[1, 2, 3, 4, 5, 6].map((cell) => (
//                       <td key={cell} className="py-3 px-4">
//                         <Shimmer height="16px" width="100%" />
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : (
//                 userDetails.map((user) => (
//                   <tr key={user.usermanagement.userid} className="hover:bg-gray-50">
//                     <td className="py-3 px-4 text-sm font-mono text-gray-900">
//                       {user.usermanagement.userid}
//                     </td>
//                     <td className="py-3 px-4 text-sm text-gray-900">
//                       {user.usermanagement.username}
//                     </td>
//                     <td className="py-3 px-4 text-sm text-gray-500">
//                       {user.usermanagement.email}
//                     </td>
//                     <td className="py-3 px-4 text-sm text-right flex justify-center space-x-2">
//                       <button
//                         onClick={() => openConfirmModal(user)}
//                         disabled={deleteLoadingId === user.usermanagement.userid}
//                         className={`
//                         px-3 py-1 
//                         bg-red-100 text-red-700 
//                         rounded-md text-xs 
//                         hover:bg-red-200 
//                         flex items-center
//                         ${deleteLoadingId === user.usermanagement.userid ? 'opacity-50 cursor-not-allowed' : ''}
//                       `}
//                       >
//                         {deleteLoadingId === user.usermanagement.userid ? (
//                           <div className="flex items-center">
//                             <svg
//                               className="animate-spin h-4 w-4 mr-1"
//                               xmlns="http://www.w3.org/2000/svg"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                             >
//                               <circle
//                                 className="opacity-25"
//                                 cx="12"
//                                 cy="12"
//                                 r="10"
//                                 stroke="currentColor"
//                                 strokeWidth="4"
//                               ></circle>
//                               <path
//                                 className="opacity-75"
//                                 fill="currentColor"
//                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                               ></path>
//                             </svg>
//                             Removing
//                           </div>
//                         ) : (
//                           <>
//                             <FaTrash className="mr-1" /> Remove
//                           </>
//                         )}
//                       </button>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>

//       )}

//       {activeTab === 'scopesPermissions' && (
//         <div className="overflow-x-auto">
//           <table className="min-w-full bg-white border border-gray-200 rounded-lg">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
//                 <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
//                 <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Leads</th>
//                 <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Tasks</th>
//                 <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Meetings</th>
//                 <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Contacts</th>
//                 <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Deals</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {isLoading ? (
//                 [1, 2, 3, 4].map((_, index) => (
//                   <tr key={index} className="hover:bg-gray-50">
//                     {[1, 2, 3, 4, 5, 6, 7, 8].map((cell) => (
//                       <td key={cell} className="py-3 px-4">
//                         <Shimmer height="16px" width="100%" />
//                       </td>
//                     ))}
//                   </tr>
//                 ))
//               ) : (
//                 userAccessData.map((user) => (
//                   <tr key={user.userid} className="hover:bg-gray-50">
//                     <td className="py-3 px-4 text-sm font-mono text-gray-900">
//                       {user.userid}
//                     </td>
//                     <td className="py-3 px-4 text-sm text-gray-500">
//                       {user.email}
//                     </td>
//                     <td className="py-3 px-4">
//                       <AccessControlDropdown
//                         userId={user.userid}
//                         section="Leads"
//                         currentLevel={user.access.Leads}
//                       />
//                     </td>
//                     <td className="py-3 px-4">
//                       <AccessControlDropdown
//                         userId={user.userid}
//                         section="Tasks"
//                         currentLevel={user.access.Tasks}
//                       />
//                     </td>
//                     <td className="py-3 px-4">
//                       <AccessControlDropdown
//                         userId={user.userid}
//                         section="Meetings"
//                         currentLevel={user.access.Meetings}
//                       />
//                     </td>
//                     <td className="py-3 px-4">
//                       <AccessControlDropdown
//                         userId={user.userid}
//                         section="Contacts"
//                         currentLevel={user.access.Contacts}
//                       />
//                     </td>
//                     <td className="py-3 px-4">
//                       <AccessControlDropdown
//                         userId={user.userid}
//                         section="Deals"
//                         currentLevel={user.access.Deals}
//                       />
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       )}
      
//       {activeTab === 'personalized' && (
//         <div>
//           {isLoading ? (
//             <div className="space-y-6">
//                  <Shimmer height="200px" />
//             </div>
//           ) : (
//             <OrganizationPersonalizationPanel />
//           )}
//         </div>
//       )}

// {showModal && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center">
//     <div
//       className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
//       onClick={() => setShowModal(false)}
//     ></div>
//     <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
//       {/* Modal Header */}
//       <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
//         <div className="flex justify-between items-center">
//           <h3 className="text-xl font-bold text-white flex items-center">
//             <FaUserPlus className="mr-2" />
//             Add New User
//           </h3>
//           <button
//             onClick={() => setShowModal(false)}
//             className="text-white hover:text-indigo-200 transition-colors"
//           >
//             <IoMdClose className="w-6 h-6" />
//           </button>
//         </div>
//       </div>

//       {/* Toggle Buttons */}
//       <div className="flex border-b border-gray-200">
//         <button
//           onClick={() => setAddUserMethod('email')}
//           className={`flex-1 py-3 px-4 text-center ${
//             addUserMethod === 'email'
//               ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium'
//               : 'text-gray-500 hover:text-gray-700'
//           }`}
//         >
//           Add By Email
//         </button>
//         <button
//           onClick={() => {
//             setAddUserMethod('contact');
//             setContactSearchStatus('');
//           }}
//           className={`flex-1 py-3 px-4 text-center ${
//             addUserMethod === 'contact'
//               ? 'text-indigo-600 border-b-2 border-indigo-600 font-medium'
//               : 'text-gray-500 hover:text-gray-700'
//           }`}
//         >
//           Add From Contacts
//         </button>
//       </div>

//       {/* Modal Body */}
//       <div className="px-6 py-5">
//         {addUserMethod === 'email' ? (
//           <form onSubmit={handleSubmit}>
//             <div className="space-y-4">
//               <div>
//                 <label htmlFor="email_id" className="block text-sm font-medium text-gray-700 mb-1">
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   id="email_id"
//                   name="email_id"
//                   value={formData.email_id}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                   placeholder="Enter email address"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
//                   First Name
//                 </label>
//                 <input
//                   type="text"
//                   id="first_name"
//                   name="first_name"
//                   value={formData.first_name}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                   placeholder="Enter first name"
//                 />
//               </div>

//               <div>
//                 <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
//                   Last Name
//                 </label>
//                 <input
//                   type="text"
//                   id="last_name"
//                   name="last_name"
//                   value={formData.last_name}
//                   onChange={handleInputChange}
//                   required
//                   className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//                   placeholder="Enter last name"
//                 />
//               </div>
//             </div>

//             <div className="mt-6">
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className={`
//                   w-full 
//                   bg-indigo-600 
//                   hover:bg-indigo-700 
//                   text-white 
//                   py-3 
//                   rounded-lg 
//                   transition 
//                   duration-300 
//                   font-medium 
//                   flex 
//                   items-center 
//                   justify-center 
//                   ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}
//                 `}
//               >
//                 {isSubmitting ? (
//                   <>
//                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//                     Processing...
//                   </>
//                 ) : (
//                   "Add User"
//                 )}
//               </button>
//             </div>
//           </form>
//         ) : (
//           <div className="mb-6 relative" id="suggestions-container">
//   <label htmlFor="contact_email" className="block text-sm font-medium text-gray-700 mb-1">
//     Search Contact by Email or Name
//   </label>
//   <div className="flex space-x-2">
//     <div className="flex-1 relative">
//       <input
//         type="text"
//         id="contact_email"
//         value={contactSearchEmail}
//         onChange={handleSearchInputChange}
//         className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//         placeholder="Enter contact email or name"
//         autoComplete="off"
//       />
      
//       {/* Suggestions Dropdown */}
//       {isShowingSuggestions && contactSuggestions.length > 0 && (
//         <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
//           {contactSuggestions.map((contact, index) => (
//             <div
//               key={index}
//               onClick={() => handleSelectSuggestion(contact)}
//               className="cursor-pointer hover:bg-indigo-50 py-2 px-4 border-b border-gray-100 last:border-b-0"
//             >
//               <div className="font-medium text-gray-900">
//                 {highlightMatch(contact.First_Name || '', contactSearchEmail)} {highlightMatch(contact.Last_Name || '', contactSearchEmail)}
//               </div>
//               <div className="text-sm text-gray-500">
//                 {highlightMatch(contact.Email || '', contactSearchEmail)}
//               </div>
//               {contact.Account_Name && (
//                 <div className="text-xs text-gray-400 mt-1">
//                   Company: {contact.Account_Name}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//     <button
//       type="button"
//       onClick={searchContactByEmail}
//       disabled={isSearching || !contactSearchEmail}
//       className={`
//         px-4 py-2 
//         bg-indigo-600 
//         text-white 
//         rounded-lg 
//         hover:bg-indigo-700 
//         transition-colors
//         ${(isSearching || !contactSearchEmail) ? 'opacity-70 cursor-not-allowed' : ''}
//       `}
//     >
//       {isSearching ? (
//         <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
//       ) : (
//         "Search"
//       )}
//     </button>
//   </div>
  
//   <p className="mt-2 text-xs text-gray-500">
//     Search by email, first name, or last name to find existing contacts
//   </p>
// </div>

//         )}
        
// {contactSearchStatus === 'not_found' && (
//   <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
//     <p className="text-yellow-700 text-sm flex items-center">
//       <FaExclamationTriangle className="mr-2" />
//       No contacts found matching your search.
//     </p>
//   </div>
// )}

// {contactSearchStatus === 'suggestions' && (
//   <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
//     <p className="text-blue-700 text-sm flex items-center">
//       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//       </svg>
//       Multiple contacts found. Select one from the dropdown or refine your search.
//     </p>
//   </div>
// )}

// {contactSearchStatus === 'found' && (
//   <>
//     <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
//       <p className="text-green-700 text-sm flex items-center mb-2">
//         <FaUsers className="mr-2" />
//         Contact found! Review details below.
//       </p>
//     </div>

//     <form onSubmit={handleContactSubmit}>
//       <div className="space-y-4">
//         <div>
//           <label htmlFor="contact_email_id" className="block text-sm font-medium text-gray-700 mb-1">
//             Email Address
//           </label>
//           <input
//             type="email"
//             id="contact_email_id"
//             name="email_id"
//             value={formData.email_id}
//             onChange={handleInputChange}
//             required
//             className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-gray-50"
//           />
//         </div>

//         <div>
//           <label htmlFor="contact_first_name" className="block text-sm font-medium text-gray-700 mb-1">
//             First Name
//           </label>
//           <input
//             type="text"
//             id="contact_first_name"
//             name="first_name"
//             value={formData.first_name}
//             onChange={handleInputChange}
//             required
//             className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//           />
//         </div>

//         <div>
//           <label htmlFor="contact_last_name" className="block text-sm font-medium text-gray-700 mb-1">
//             Last Name
//           </label>
//           <input
//             type="text"
//             id="contact_last_name"
//             name="last_name"
//             value={formData.last_name}
//             onChange={handleInputChange}
//             required
//             className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
//           />
//         </div>
//       </div>

//       <div className="mt-6">
//         <button
//           type="submit"
//           disabled={isSubmitting}
//           className={`
//             w-full 
//             bg-indigo-600 
//             hover:bg-indigo-700 
//             text-white 
//             py-3 
//             rounded-lg 
//             transition 
//             duration-300 
//             font-medium 
//             flex 
//             items-center 
//             justify-center 
//             ${isSubmitting ? "opacity-75 cursor-not-allowed" : ""}
//           `}
//         >
//           {isSubmitting ? (
//             <>
//               <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
//               Processing...
//             </>
//           ) : (
//             "Add User"
//           )}
//         </button>
//       </div>
//     </form>
//   </>
// )}
//       </div>
//     </div>
//   </div>
// )}

//       {/* Confirmation Modal */}
//       {showConfirmModal && userToDelete && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center">
//           <div
//             className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
//             onClick={closeConfirmModal}
//           ></div>
//           <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden transform transition-all">
//             {/* Modal Header */}
//             <div className="bg-gradient-to-r from-red-600 to-red-500 px-6 py-4">
//               <div className="flex justify-between items-center">
//                 <h3 className="text-xl font-bold text-white flex items-center">
//                   <FaExclamationTriangle className="mr-2" />
//                   Confirm User Removal
//                 </h3>
//                 <button
//                   onClick={closeConfirmModal}
//                   className="text-white hover:text-red-200 transition-colors"
//                 >
//                   <IoMdClose className="w-6 h-6" />
//                 </button>
//               </div>
//             </div>

//             {/* Modal Body */}
//             <div className="px-6 py-5">
//               <div className="text-center mb-6">
//                 <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
//                   <FaExclamationTriangle className="h-6 w-6 text-red-600" />
//                 </div>
//                 <h3 className="text-lg font-medium text-gray-900 mb-2">Are you sure you want to remove this user?</h3>
//                 <p className="text-sm text-gray-500">
//                   This action cannot be undone. The user will lose access to the system.
//                 </p>
//               </div>

//               <div className="bg-gray-50 p-4 rounded-lg mb-6">
//                 <div className="flex items-center mb-2">
//                   <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
//                     <span className="text-indigo-600 font-medium">
//                       {userToDelete?.usermanagement?.username?.charAt(0).toUpperCase() || "U"}
//                     </span>
//                   </div>
//                   <div>
//                     <p className="font-medium text-gray-900">{userToDelete.usermanagement.username || ""}</p>
//                     <p className="text-sm text-gray-500">{userToDelete.usermanagement.email || ""}</p>
//                   </div>
//                 </div>
//                 <div className="text-xs text-gray-500 mt-2">
//                   <span className="font-medium">User ID:</span> {userToDelete.usermanagement.userid}
//                 </div>
//               </div>

//               <div className="flex space-x-3">
//                 <button
//                   onClick={closeConfirmModal}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={() => handleRemoveUser(userToDelete.usermanagement.userid,userToDelete.usermanagement.email)}
//                   disabled={deleteLoadingId === userToDelete.usermanagement.userid}
//                   className={`
//                     flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors
//                     ${deleteLoadingId === userToDelete.usermanagement.userid ? 'opacity-75 cursor-not-allowed' : ''}
//                   `}
//                 >
//                   {deleteLoadingId === userToDelete.usermanagement.userid ? (
//                     <div className="flex items-center justify-center">
//                       <svg
//                         className="animate-spin h-4 w-4 mr-1"
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 24 24"
//                       >
//                         <circle
//                           className="opacity-25"
//                           cx="12"
//                           cy="12"
//                           r="10"
//                           stroke="currentColor"
//                           strokeWidth="4"
//                         ></circle>
//                         <path
//                           className="opacity-75"
//                           fill="currentColor"
//                           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                         ></path>
//                       </svg>
//                       Removing...
//                     </div>
//                   ) : (
//                     "Remove User"
//                   )}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default AdminPage;



