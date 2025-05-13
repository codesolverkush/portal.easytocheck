import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaUserPlus, FaCheckCircle, FaTrash, FaUsers, FaLock, FaExclamationTriangle, FaEdit } from 'react-icons/fa';
import { IoMdClose } from 'react-icons/io';
import { toast, Toaster } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { Edit, Home } from 'lucide-react';

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

// Add this component above the Webtab component
const OrganizationPersonalizationPanel = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [domain, setDomain] = useState("");
  const [orgId, setOrgId] = useState("");
  const [widgets, setWidgets] = useState([
    { name: "", url: "" },
    { name: "", url: "" },
    { name: "", url: "" }
  ]);

  // Handle domain change
  const handleDomainChange = (e) => {
    setDomain(e.target.value);
  };

  // Handle org ID change
  const handleOrgIdChange = (e) => {
    setOrgId(e.target.value);
  };

  // Handle widget changes
  const handleWidgetChange = (index, field, value) => {
    const updatedWidgets = [...widgets];
    updatedWidgets[index] = {
      ...updatedWidgets[index],
      [field]: value
    };
    setWidgets(updatedWidgets);
  };

  // Save organization details
  const saveOrganizationDetails = async () => {
    setIsLoading(true);
    
    try {
      // Filter out empty widgets
      const activeWidgets = widgets.filter(widget => widget.name && widget.url);
      
      const orgDetails = {
        domain,
        orgId,
        widgets: activeWidgets
      };
      
      const response = await axios.post(`${process.env.REACT_APP_APP_API}/edit/orgdetails`, orgDetails);
      
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
        const response = await axios.post(`${process.env.REACT_APP_APP_API}/org/getdetails`);
        
        if (response.status === 200) {
          const data = response.data;
                
         
          setOrgId(data.data[0]?.Organization?.ROWID|| "");
          
          // Set widgets if available
          if (data.widgets && data.widgets.length > 0) {
            // Create a new array with 3 slots
            const newWidgets = [
              { name: "", url: "" },
              { name: "", url: "" },
              { name: "", url: "" }
            ];
            
            // Fill with existing widget data
            data.widgets.forEach((widget, index) => {
              if (index < 3) {
                newWidgets[index] = widget;
              }
            });
            
            setWidgets(newWidgets);
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
            <h3 className="text-md font-medium text-gray-700 mb-3">CRM OrgId</h3>
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
                className="flex-1 px-4 py-2 rounded-md"
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              This ID is used for integration with other services
            </p>
          </div>
          
          {/* Widget Configuration */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="text-md font-medium text-gray-700 mb-3">Widget Configuration</h3>
            <p className="text-sm text-gray-500 mb-4">
              Configure up to 3 external widgets that will be available in your CRM dashboard
            </p>
            
            {widgets.map((widget, index) => (
              <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-700 mb-3">Widget {index + 1}</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label htmlFor={`widget-name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Widget Name
                    </label>
                    <input
                      type="text"
                      id={`widget-name-${index}`}
                      value={widget.name}
                      onChange={(e) => handleWidgetChange(index, 'name', e.target.value)}
                      placeholder="Enter widget name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label htmlFor={`widget-url-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
                      Widget URL
                    </label>
                    <input
                      type="text"
                      id={`widget-url-${index}`}
                      value={widget.url}
                      onChange={(e) => handleWidgetChange(index, 'url', e.target.value)}
                      placeholder="https://example.com/widget"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            ))}
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
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);
  
  // Confirmation Modal State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

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
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/admin/webtab`);
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
  const handleRemoveUser = async (id) => {
    // Immediately show loading state for specific row
    setDeleteLoadingId(id);

    try {
      const response = await axios.delete(`${process.env.REACT_APP_APP_API}/admin/removeuser/${id}`);
      
      if(response.status === 200){
        const crmresponse = await axios.post(`${process.env.REACT_APP_APP_API}/admin/crmupdate/${id}`)
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
  // Submit New User
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);

  //   try {
  //     const response = await axios.post(`${process.env.REACT_APP_APP_API}/test/adduser`, formData);
  //     if(response.status === 200){
  //       // easyportal__User_Id:response.data.data.user_id,
  //       console.log(response);
  //        // Optimistic Update: Add new user to local state
  //     const crmresponse = await axios.post(`${process.env.REACT_APP_APP_API}/create/createnewuser/easyportal__Portal_Users`,{
  //       crmuserid: response.data.data.user_id,
  //       easyportal__User_Email: formData.email_id,
  //       Name: `${formData.first_name} ${formData.last_name}`,
  //       easyportal__Status: "Active"
  //     })

  //     console.log(crmresponse);
  //       if(crmresponse.status === 200){
  //         const newUser = {
  //           usermanagement: {
  //             userid: response.data.data.user_id, // Assuming API returns new user ID
  //             username: `${formData.first_name} ${formData.last_name}`,
  //             email: formData.email_id
  //           }
  //         };

  //         console.log("New User added",newUser);
    
  //         setUserDetails([...userDetails, newUser]);
    
  //         // Reset form and show success
  //         setFormData({
  //           email_id: "",
  //           first_name: "",
  //           last_name: ""
  //         });
  //         setShowModal(false);
    
  //         // Refresh overall data to update license counts
  //         fetchUserDetails();
    
  //         toast.success('User added successfully');
  //       }
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error.response?.data?.message || "Failed to add user");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      const regResponse = await axios.post(`${process.env.REACT_APP_APP_API}/test/adduser`, formData);
  
      if (regResponse.status === 200) {
        const crmresponse = await axios.post(`${process.env.REACT_APP_APP_API}/create/createnewuser/easyportal__Portal_Users`, {
          crmuserid: regResponse.data.data.user_id,
          easyportal__User_Email: formData.email_id,
          Name: `${formData.first_name} ${formData.last_name}`,
          easyportal__Status: "Active",
          orgId: regResponse.data.data.orgId,
          licenseRollback: regResponse.data.data.licenseRollback
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
         <Link 
         to="/app/home"
    className="flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition bg-blue-600 hover:bg-blue-700 text-white"
  >
    <Home className="w-5 h-5" />
    <span className="hidden sm:inline">Home</span>
  </Link>
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
      {/* <div className="mb-6 border-b border-gray-200">
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
          <button
            onClick={() => setActiveTab('personalized')}
            className={`
                    py-3 px-4 flex items-center 
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
      </div> */}

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
            <OrganizationPersonalizationPanel />
          )}
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
                  onClick={() => handleRemoveUser(userToDelete.usermanagement.userid)}
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

export default Webtab;



