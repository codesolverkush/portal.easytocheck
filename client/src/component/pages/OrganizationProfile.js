import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { FaCheckCircle, FaBuilding, FaGlobe, FaMapMarkerAlt, FaUserPlus } from "react-icons/fa";
import { IoMdClose, IoMdMail, IoMdCalendar } from "react-icons/io";
import Navbar from "../common/Navbar";
import { setLicenseStatus } from "../../redux/reducers/auth";
import { useDispatch } from "react-redux";

const OrganizationProfile = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const orgId = location.state?.orgId;

    const [profileData, setProfileData] = useState(null);
    const [domain,setDomain] = useState("in");
    const [loading, setLoading] = useState(true);
    const [control, setControl] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [authLoading, setAuthLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        email_id: "",
        first_name: "",
        last_name: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: "", message: "" });

    const CACHE_NAME = "crm-cache";


    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                let response;
                if (orgId) {
                    response = await axios.get(`${process.env.REACT_APP_APP_API}/org/getorg/${orgId}`);
                    
                } else {
                    response = await axios.post(`${process.env.REACT_APP_APP_API}/org/getdetails`);
                    console.log(response);
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

        fetchProfileData();
    }, [control]);

    const fetchAuthorizationStatus = async (orgId) => {
        try {
            const authResponse = await axios.get(`${process.env.REACT_APP_APP_API}/org/check-authorization/${orgId}`);
            setIsAuthorized(authResponse.data.authorized);
        } catch (error) {
            console.error("Authorization check failed", error);
        } finally {
            setAuthLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus({ type: "", message: "" });

        try {
            const response = await axios.post(`${process.env.REACT_APP_APP_API}/test/adduser`, formData);
            setSubmitStatus({ 
                type: "success", 
                message: "User added successfully!" 
            });
            // Reset form after successful submission
            setFormData({
                email_id: "",
                first_name: "",
                last_name: ""
            });
            
            // Close modal after a short delay
            setTimeout(() => {
                setShowModal(false);
                setSubmitStatus({ type: "", message: "" });
            }, 2000);
            
        } catch (error) {
            setSubmitStatus({ 
                type: "error", 
                message: error.response?.data?.message || "Failed to add user. Please try again." 
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-indigo-50 to-blue-50">
                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-800 mt-4 text-lg font-medium">Loading profile data...</p>
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
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">Error Loading Profile</h2>
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
            <Navbar/>
            <div className="min-h-screen bg-gradient-to-r from-indigo-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {/* Profile Card */}
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-8 md:px-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                                <div>
                                    <h1 className="text-3xl font-bold text-white mb-2">{profileData.displayname}</h1>
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
                                                domain: domain
                                              }}
                                            className="bg-white text-indigo-700 rounded-lg px-4 py-2 font-medium hover:bg-indigo-50 transition duration-300"
                                        >
                                            Make Connection
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        {isAuthorized && (
                            <div className="bg-indigo-50 px-6 py-4 md:px-10 border-b border-indigo-100">
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button 
                                        onClick={() => setShowModal(true)}
                                        className="bg-indigo-600 text-white px-5 py-3 rounded-lg shadow-md hover:bg-indigo-700 transition-all flex-1 text-center font-medium flex items-center justify-center"
                                    >
                                        <FaUserPlus className="mr-2" />
                                        Add User
                                    </button>
                                    <Link 
                                        to="/app/home" 
                                        className="bg-white text-indigo-600 border border-indigo-300 px-5 py-3 rounded-lg shadow-sm hover:bg-indigo-50 transition-all flex-1 text-center font-medium"
                                    >
                                        Go to Home
                                    </Link>
                                </div>
                            </div>
                        )}

                        {/* Profile Details */}
                        <div className="px-6 py-8 md:px-10">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Organization Details</h2>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
                                {/* Organization Info */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Basic Information</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <FaBuilding className="mt-1 mr-3 text-indigo-500 w-5 h-5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Organization Name</p>
                                                    <p className="text-gray-800 font-medium">{profileData.orgname}</p>
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
                                                    <p className="text-gray-800">{profileData.crmdomain}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Contact & Status */}
                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Contact & Status</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <IoMdMail className="mt-1 mr-3 text-indigo-500 w-5 h-5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm text-gray-500">Super Admin Email</p>
                                                    <p className="text-gray-800">{profileData.superadminEmail}</p>
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
                                                <div className={`mt-1 mr-3 w-5 h-5 flex-shrink-0 rounded-full ${profileData.isactive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Active Status</p>
                                                    <p className={`font-medium ${profileData.isactive ? 'text-green-600' : 'text-red-600'}`}>
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
                                <h3 className="text-lg font-semibold text-gray-700 mb-4">Activation Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-indigo-50 rounded-lg p-4">
                                        <div className="flex">
                                            <IoMdCalendar className="text-indigo-500 w-5 h-5 mt-1 mr-3" />
                                            <div>
                                                <p className="text-sm text-indigo-700 font-medium">Activation Date</p>
                                                <p className="text-gray-800">{profileData.activationdate}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-indigo-50 rounded-lg p-4">
                                        <div className="flex">
                                            <IoMdCalendar className="text-indigo-500 w-5 h-5 mt-1 mr-3" />
                                            <div>
                                                <p className="text-sm text-indigo-700 font-medium">Activation End Date</p>
                                                <p className="text-gray-800">{profileData.activationEndDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
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
                            {submitStatus.type && (
                                <div className={`mb-4 p-3 rounded-lg ${
                                    submitStatus.type === "success" 
                                        ? "bg-green-100 text-green-800 border border-green-200" 
                                        : "bg-red-100 text-red-800 border border-red-200"
                                }`}>
                                    {submitStatus.type === "success" && <FaCheckCircle className="inline mr-2" />}
                                    {submitStatus.type === "error" && <IoMdClose className="inline mr-2" />}
                                    {submitStatus.message}
                                </div>
                            )}
                            
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
                                        className={`w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition duration-300 font-medium flex items-center justify-center ${
                                            isSubmitting ? "opacity-75 cursor-not-allowed" : ""
                                        }`}
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

export default OrganizationProfile;