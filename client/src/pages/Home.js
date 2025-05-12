import React, { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import "chart.js/auto";
import Navbar from "../component/common/Navbar";
import { Link, useNavigate } from "react-router-dom";
import { Calendar, Users, CheckSquare, TrendingUp, Plus, Paperclip, Clock, UserPlus, FilePlus, ClipboardCheck, UserCheck, LogOut, Contact } from "lucide-react";
import toast from "react-hot-toast";
import axios from 'axios';
import CreateTaskForm from "../component/forms/CreateTaskForm";
import CreateContactForm from "../component/forms/CreateContactForm";
import { DateTime } from "luxon";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";
import UnauthorizedModal from "../component/errorPages/UnauthorizedModal";
import { openSupportPopup } from "../utils/supportTrigger";
import { gradient } from "../config/colors";
import ChangesDone from "../component/confirmbox/ChangesDone";

const recentLeads = [
  { name: "John Smith", company: "ABC Corp", value: "$12,500", date: "2025-02-15" },
  { name: "Sarah Johnson", company: "XYZ Ltd", value: "$8,900", date: "2025-02-14" },
  { name: "Michael Brown", company: "123 Industries", value: "$15,300", date: "2025-02-13" },
];

const upcomingTasks = [
  { title: "Follow up with John", due: "Today", priority: "High" },
  { title: "Prepare proposal for XYZ", due: "Tomorrow", priority: "Medium" },
  { title: "Schedule demo with 123 Industries", due: "Feb 20", priority: "Low" },
];

const priorityColors = {
  High: "bg-red-200 text-red-700",
  Highest: "bg-red-300 text-red-800",
  Medium: "bg-yellow-200 text-yellow-700",
  Low: "bg-green-200 text-green-700",
};

const HomePage = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isContactModelOpen, setIsContactModalOpen] = useState(false);
  const [leads, setLeads] = useState(recentLeads);
  const [task, setTask] = useState(upcomingTasks);
  const [accessData, setAccessData] = useState({});
  // Connection variable
  const [isUnauthorizedModalOpen, setIsUnauthorizedModalOpen] = useState(false);
  const [showFeaturePopup, setShowFeaturePopup] = useState(false);

  const [changesDone,setChangesDone] = useState(false);
  const [isConfirmTrobleShoot, setIsConfirmTrobleShoot] = useState(false);



  const navigate = useNavigate();



  // Dashboard Componet for the data view!

  const [metrics, setMetrics] = useState({
    leads: 0,
    tasks: 0,
    contacts: 0,
    deals: 0,
    isLoading: false,
    loadingLeads: false,
    loadingTasks: false,
    loadingContacts: false,
    loadingDeals: false,
  });

  // Helper function to check and retrieve cache
  const getFromCache = async (key) => {
    try {
      const cache = await caches.open('dashboard-cache');
      const cachedResponse = await cache.match(key);

      if (cachedResponse) {
        const cachedData = await cachedResponse.json();
        // Check if cache is valid (less than 60 minutes old)
        if (Date.now() - cachedData.timestamp < 60 * 60 * 1000) {
          return cachedData.data;
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  // Helper function to save to cache
  const saveToCache = async (key, data) => {
    try {
      const cache = await caches.open('dashboard-cache');
      const cacheData = {
        data,
        timestamp: Date.now()
      };

      // Create a new Response object with the data
      const response = new Response(JSON.stringify(cacheData), {
        headers: { 'Content-Type': 'application/json' }
      });

      await cache.put(key, response);
    } catch (error) {
      toast.error("Something went wrong!");
    }
  };

  // Fetch leads data
  const fetchLeads = async (skipCache = false) => {
    setMetrics(prev => ({ ...prev, loadingLeads: true }));

    try {
      let leadsCount;
      
        const cachedLeads = await getFromCache('/api/leads');
        const cachedLeadsDetails = await getFromCache('/api/leaddetails');

        if (cachedLeads !== null && cachedLeadsDetails !== null) {
          leadsCount = cachedLeads;
          setLeads(cachedLeadsDetails);
          setMetrics(prev => ({ ...prev, leads: leadsCount, loadingLeads: false }));
          return;
        }
      

      const leadsResponse = await axios.get(`${process.env.REACT_APP_APP_API}/get/leaddetails`);
    
      if(leadsResponse.status === 200){
      leadsCount = leadsResponse?.data?.data?.info?.count || 0;
      const leadData = leadsResponse?.data?.data?.data || recentLeads;
      setLeads(leadData);
      await saveToCache('/api/leads', leadsCount);
      await saveToCache('/api/leaddetails', leadData);

      setMetrics(prev => ({ ...prev, leads: leadsCount, loadingLeads: false }));
      }
    } catch (error) {
      if (error?.response?.data?.code === 'ORG_NOT_AUTHORIZED') {
        setIsUnauthorizedModalOpen(true);
      }
      setMetrics(prev => ({ ...prev, loadingLeads: false }));
    }
  };
  // Fetch tasks data (revenue)
  const fetchTasks = async (skipCache = false) => {
    setMetrics(prev => ({ ...prev, loadingTasks: true }));

    try {
      let tasksCount;
      
        const cachedTasks = await getFromCache('/api/tasks');
        const cachedTaskData = await getFromCache('/api/taskdetails');
        if (cachedTasks !== null && cachedTaskData !== null) {
          tasksCount = cachedTasks;
          setTask(cachedTaskData);
          setMetrics(prev => ({ ...prev, tasks: tasksCount, loadingTasks: false }));
          return;
        }
      

      const tasksResponse = await axios.get(`${process.env.REACT_APP_APP_API}/get/task`);
      tasksCount = tasksResponse?.data?.data?.info?.count || 0;
      const taskData = tasksResponse?.data?.data?.data || upcomingTasks;
      setTask(taskData);
      await saveToCache('/api/tasks', tasksCount);
      await saveToCache('/api/taskdetails', taskData);


      setMetrics(prev => ({ ...prev, tasks: tasksCount, loadingTasks: false }));
    } catch (error) {
      setMetrics(prev => ({ ...prev, loadingTasks: false }));
    }
  };
  // Fetch contacts data (closing orders)
  const fetchContacts = async (skipCache = false) => {
    setMetrics(prev => ({ ...prev, loadingContacts: true }));

    try {
      let contactsCount;
      
        const cachedContacts = await getFromCache('/api/contacts');
        if (cachedContacts !== null) {
          contactsCount = cachedContacts;
          setMetrics(prev => ({ ...prev, contacts: contactsCount, loadingContacts: false }));
          return;
        }
      

      const contactsResponse = await axios.get(`${process.env.REACT_APP_APP_API}/get/meetings`);
      contactsCount = contactsResponse?.data?.data?.info?.count || 0;
      await saveToCache('/api/contacts', contactsCount);


      setMetrics(prev => ({ ...prev, contacts: contactsCount, loadingContacts: false }));
    } catch (error) {
      setMetrics(prev => ({ ...prev, loadingContacts: false }));
    }
  };
  const fetchDeals = async (skipCache = false) => {
    // Check if the function is called
    setMetrics(prev => ({ ...prev, loadingDeals: true }));
    try {
      let dealsCount;
      
        const cachedDeals = await getFromCache('/api/deals');
        if (cachedDeals !== null) {
          dealsCount = cachedDeals;
          setMetrics(prev => ({ ...prev, deals: dealsCount, loadingDeals: false }));
          return;
        }
      

      const dealsResponse = await axios.get(`${process.env.REACT_APP_APP_API}/get/dealdetails`);
      dealsCount = dealsResponse?.data?.data?.info?.count || 0;
      await saveToCache('/api/deals', dealsCount);


      setMetrics(prev => ({ ...prev, deals: dealsCount, loadingDeals: false }));
    } catch (error) {
      setMetrics(prev => ({ ...prev, loadingDeals: false }));
    }
  };
  // Fetch all data
  const fetchAllData = async (skipCache = false) => {
    setMetrics(prev => ({ ...prev, isLoading: true }));

    try {
      // Fetch all data in parallel
      await Promise.all([
        fetchLeads(true),
        fetchTasks(true),
        fetchContacts(true),
        fetchDeals(true),
      ]);

      setMetrics(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setMetrics(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Refresh individual component data forcefully
  const refreshComponent = async (component) => {
    try {
      // Clear specific component cache
      const cache = await caches.open('dashboard-cache');
      await cache.delete(`/api/${component}`);

      // Fetch fresh data for the specific component
      if (component === 'leads') {
        fetchLeads(true);
      } else if (component === 'tasks') {
        fetchTasks(true);
      } else if (component === 'contacts') {
        fetchContacts(true);
      } else if (component === 'deals') {
        fetchDeals(true);
      }
    } catch (error) {
      toast.error(`Error refreshing ${component}:`, error);
    }
  };

  // useEffect(() => {
  //   async function fetchData() {
  //     const response = await axios.get(`${process.env.REACT_APP_APP_API}/special/fetching`);
  //     if (response.status === 200) {
  //       setAccessData({ Leads: response?.data?.user?.Leads || 4, Contacts: response?.data?.user?.Contacts || 4, Deals: response?.data?.user?.Deals || 4 });
  //       setChangesDone(response?.data?.user?.changesDone);
  //     } else {
  //       setAccessData({ Leads: 4, Contacts: 4, Deals: 4 });
  //     }
  //   }
  //   fetchAllData();
  //   fetchData();
  // }, []);


  // Connection function for checking...

  
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await axios.get(`${process.env.REACT_APP_APP_API}/special/fetching`);
        if (response.status === 200) {
          const userData = {
            Leads: response?.data?.user?.Leads || 4, 
            Contacts: response?.data?.user?.Contacts || 4, 
            Deals: response?.data?.user?.Deals || 4
          };
          setAccessData(userData);
          
          // Check changesDone and update state only if it's different
          const newChangesDone = response?.data?.user?.changesDone || false;
          if (newChangesDone !== changesDone) {
            setChangesDone(newChangesDone);
            
            // If changesDone is true, open TroubleShoot
            if (newChangesDone) {
              setIsConfirmTrobleShoot(true);
            }
          }
        } else {
          setAccessData({ Leads: 4, Contacts: 4, Deals: 4 });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        setAccessData({ Leads: 4, Contacts: 4, Deals: 4 });
      }
    }

    fetchAllData();
    fetchData();
  }, []);

  const handleConnectOrganization = () => {
    // Navigate to organization connection page or open connection modal
    navigate('/app/connection');
    setIsUnauthorizedModalOpen(false);
  };

  const openConfirmPopup = () => {
    setIsConfirmTrobleShoot(true);
  };


  const salesData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "Sales 2025",
        data: [50, 75, 100, 85, 110, 130],
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 2,
      },
      {
        label: "Sales 2024",
        data: [40, 60, 80, 70, 90, 110],
        backgroundColor: "rgba(156, 163, 175, 0.5)",
        borderColor: "rgba(156, 163, 175, 1)",
        borderWidth: 2,
      },
    ],
  };

  const leadsData = {
    labels: ["January", "February", "March", "April", "May", "June"],
    datasets: [
      {
        label: "New Leads",
        data: [25, 40, 30, 45, 55, 60],
        borderColor: "rgba(16, 185, 129, 1)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
      }
    ],
  };

  // Secret key for encryption (should match the one used in authSlice)

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

  const getLocation = async () => {
    try {
      return await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, (error) => {
          toast.error("Unable to retrieve location. Please enable location services.");
          reject(error);
        });
      });
    } catch (error) {
      toast.error("Failed to fetch the location!");
      return null;
    }
  };

  // const handleCheckIn = async () => {
  //   try {
  //     const currentDateTime = DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm:ss");
  //     const date = DateTime.now().toFormat("yyyy-MM-dd");

  //     // Get user's location
  //     const position = await getLocation();
  //     if (!position) return;

  //     const { latitude, longitude } = position.coords;
  //     const Check_in_Address = `${latitude},${longitude}`;

  //     // Get user details from cookies
  //     const user = getUserDetails();
  //     if (!user) return;

  //     const { user_id, first_name, last_name } = user;

  //     const requestBody = {
  //       Name: `${first_name} ${last_name}/${date}`,
  //       EMP_Id: `${user_id}/${date}`,
  //       First_Check_in: currentDateTime,
  //       Check_in_Address: Check_in_Address,
  //     };

  //     // Send the POST request
  //     const response = await axios.post(
  //       `${process.env.REACT_APP_APP_API}/attendance/checkin`,
  //       requestBody,
  //       {
  //         headers: { "Content-Type": "application/json" },
  //       }
  //     );

  //     if (response.data.success) {
  //       toast.success("Check-in successful!");
  //     } else {
  //       toast.error(response.data.message || "Check-in failed. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error during check-in:", error);
  //     toast.error(
  //       error?.response?.data?.message || "An error occurred during check-in. Please try again."
  //     );
  //   }
  // };

  // const handleCheckOut = async () => {
  //   try {
  //     const currentDateTime = DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm:ss");
  //     const date = DateTime.now().toFormat("yyyy-MM-dd");

  //     // Get user's location
  //     const position = await getLocation();
  //     if (!position) return;

  //     const { latitude, longitude } = position.coords;
  //     const Check_out_Address = `${latitude},${longitude}`;

  //     // Get user details from cookies
  //     const user = getUserDetails();
  //     if (!user) return;

  //     const { user_id, first_name, last_name } = user;

  //     const requestBody = {
  //       Name: `${first_name} ${last_name}/${date}`,
  //       EMP_Id: `${user_id}/${date}`,
  //       Last_Check_out: currentDateTime,
  //       Check_out_Address: Check_out_Address,
  //     };

  //     // Send the POST request
  //     const response = await axios.post(
  //       `${process.env.REACT_APP_APP_API}/attendance/checkOut`,
  //       requestBody,
  //       {
  //         headers: { "Content-Type": "application/json" },
  //       }
  //     );

  //     if (response.data.success) {
  //       toast.success("Check-out successful!");
  //     } else {
  //       toast.error(response.data.message || "Check-out failed. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error during check-out:", error);
  //     toast.error(
  //       error?.response?.data?.message || "An error occurred during check-out. Please try again."
  //     );
  //   }
  // };

// Add this function
  const handleShowpop = () => {
    setShowFeaturePopup(true);
    setTimeout(() => {
      setShowFeaturePopup(false);
    }, 3000);
  };


 

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar accessData={accessData} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Welcome Banner */}
        <div className={`bg-gradient-to-r ${gradient.formGradient} rounded-xl shadow-xl mb-8 overflow-hidden`}>
          <div className="relative px-6 py-10 sm:px-10">
            <div className="absolute inset-0 opacity-10">
              <svg className="h-full w-full" viewBox="0 0 678 600" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M614.5 137C562.7 76.6 431.1 78.4 394.5 43C358.9 8.6 337.3 -17.8 275.7 12.2C214.1 42.2 202.3 129.4 137.9 175C73.5 220.6 30.7 235.4 11.3 324C-8.1 412.6 42.1 490.2 110.7 542.8C179.3 595.4 288.9 610.2 375.3 580.2C461.7 550.2 424.1 425 526.1 368.6C628.1 312.2 666.3 197.4 614.5 137Z" fill="currentColor" />
              </svg>
            </div>
            <div className="relative z-10">
              <h1 className="text-3xl font-bold text-white mb-3 text-center">Welcome to Your Command Center</h1>
              <p className="text-indigo-100 mb-6 text-center text-lg">Track, manage, and optimize your sales pipeline efficiently.</p>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-8">             

                <Link
                  to="/app/first"
                  title={accessData?.Leads < 2 ? "You do not have enough access to create a lead" : ""}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${accessData?.Leads < 2
                    ? "bg-gray-100 bg-opacity-20 cursor-not-allowed"
                    : "bg-white bg-opacity-20 hover:bg-opacity-30"
                    }`}
                  onClick={(e) => {
                    if (accessData?.Leads < 2) {
                      e.preventDefault();
                      toast.error("Insufficient access rights to create a lead");
                    }
                  }}
                >
                  <UserPlus className="h-6 w-6 text-white mb-2" />
                  <span className="text-white text-sm font-medium">Create Lead</span>
                </Link>

                <Link
                  to="/app/taskform"
                  className="flex flex-col items-center p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsTaskModalOpen(true);
                  }}
                >
                  <FilePlus className="h-6 w-6 text-white mb-2" />
                  <span className="text-white text-sm font-medium">Create Tasks</span>
                </Link>

                <Link
                  to="/app/contactform"
                  title={accessData?.Contacts < 2 ? "You do not have enough access to create a contact" : ""}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${accessData?.Contacts < 2
                    ? "bg-gray-100 bg-opacity-20 cursor-not-allowed"
                    : "bg-white bg-opacity-20 hover:bg-opacity-30"
                    }`}
                    onClick={(e) => {
                      if (accessData?.Contacts < 2) {
                        e.preventDefault();
                        toast.error("Insufficient access rights to create a contact");
                      }
                  }}
                >
                  <FilePlus className="h-6 w-6 text-white mb-2" />
                  <span className="text-white text-sm font-medium">Create Contacts</span>
                </Link>

                <button
                  onClick={handleShowpop}
                  className="flex flex-col items-center p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
                >
                  <UserCheck className="h-6 w-6 text-white mb-2" />
                  <span className="text-white text-sm font-medium">CheckIn Att.</span>
                </button>

                <button
                  onClick={handleShowpop}
                  className="flex flex-col items-center p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
                >
                  <LogOut className="h-6 w-6 text-white mb-2" />
                  <span className="text-white text-sm font-medium">CheckOut Att.</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Lead Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="flex p-6">
              <div className="flex-grow">
                <p className="text-gray-500 text-sm font-medium mb-1">Lead Count</p>
                <h3 className="text-3xl font-bold text-gray-800">{metrics.loadingLeads ? '...' : metrics.leads}</h3>
              </div>
              <div className="bg-blue-500 bg-opacity-10 rounded-lg p-3 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7 text-blue-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-2 group-hover:bg-gray-100 transition-colors duration-300">
              <button
                onClick={() => refreshComponent('leads')}
                className="w-full flex items-center justify-center text-xs text-gray-500 group-hover:text-gray-700"
                disabled={metrics.loadingLeads}
              >
                {metrics.loadingLeads ? (
                  <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh data
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Task Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="flex p-6">
              <div className="flex-grow">
                <p className="text-gray-500 text-sm font-medium mb-1">Open Tasks</p>
                <h3 className="text-3xl font-bold text-gray-800">{metrics.loadingTasks ? '...' : metrics.tasks}</h3>
              </div>
              <div className="bg-green-500 bg-opacity-10 rounded-lg p-3 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7 text-green-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-2 group-hover:bg-gray-100 transition-colors duration-300">
              <button
                onClick={() => refreshComponent('tasks')}
                className="w-full flex items-center justify-center text-xs text-gray-500 group-hover:text-gray-700"
                disabled={metrics.loadingTasks}
              >
                {metrics.loadingTasks ? (
                  <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh data
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Meetings Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="flex p-6">
              <div className="flex-grow">
                <p className="text-gray-500 text-sm font-medium mb-1">Total Meetings</p>
                <h3 className="text-3xl font-bold text-gray-800">{metrics.loadingContacts ? '...' : metrics.contacts}</h3>
              </div>
              <div className="bg-purple-500 bg-opacity-10 rounded-lg p-3 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7 text-purple-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-2 group-hover:bg-gray-100 transition-colors duration-300">
              <button
                onClick={() => refreshComponent('contacts')}
                className="w-full flex items-center justify-center text-xs text-gray-500 group-hover:text-gray-700"
                disabled={metrics.loadingContacts}
              >
                {metrics.loadingContacts ? (
                  <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh data
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Deals Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
            <div className="flex p-6">
              <div className="flex-grow">
                <p className="text-gray-500 text-sm font-medium mb-1">Open Deals</p>
                <h3 className="text-3xl font-bold text-gray-800">{metrics.loadingDeals ? '...' : metrics.deals}</h3>
              </div>
              <div className="bg-amber-500 bg-opacity-10 rounded-lg p-3 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
                <svg className="w-7 h-7 text-amber-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-2 group-hover:bg-gray-100 transition-colors duration-300">
              <button
                onClick={() => refreshComponent('deals')}
                className="w-full flex items-center justify-center text-xs text-gray-500 group-hover:text-gray-700"
                disabled={metrics.loadingDeals}
              >
                {metrics.loadingDeals ? (
                  <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Premium Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "overview"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white hover:bg-opacity-50"
                }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("leads")}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "leads"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white hover:bg-opacity-50"
                }`}
            >
              Leads
            </button>
            <button
              onClick={() => setActiveTab("tasks")}
              className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "tasks"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white hover:bg-opacity-50"
            }`}
          >
            Tasks
          </button>
        </nav>
      </div>
  
      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {activeTab === "overview" && (
            <>
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 w-full">
                <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                  <h3 className="text-xl font-semibold text-gray-800">External Analytics</h3>
                  <select 
                    className="text-sm border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    <option>View 1</option>
                    <option>View 2</option>
                    <option>View 3</option>
                  </select>
                </div>

                <div className="overflow-hidden w-full flex justify-center items-center">
                  <div 
                    className="origin-top-left scale-[0.75] sm:scale-[0.85] md:scale-[0.9] lg:scale-100" 
                    style={{ width: '1000px', height: '500px' }} // fixed size expected by Zoho
                  >
                    <iframe
                      src="https://crm.zoho.com/crm/specific/ViewChartImage?width=1000&height=500&embedDetails=350870214961ec7506e8e2c2e9504fb60b7c4f880b6b74462f8b6f01c3bf35cca1e5a2fc0cde2a401899f16ff7d79e392f88258fa798e528031e24c2decbcccf557e8c42f10b5cf5b05268e3f89c7fb48656669b303f2f18d5d96570a0977d5e13d47176cf2f04220d9783039a67a94d"
                      title="External Chart"
                      className="w-full h-full border-0 rounded-xl shadow"
                      loading="lazy"
                      sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
  
          {activeTab === "leads" && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Lead Management</h3>
                <p className="text-gray-500 text-sm mt-1">Track and manage your sales pipeline efficiently</p>
              </div>
              <div className="p-6">
                <div className="bg-indigo-50 rounded-lg p-4 mb-6 border border-indigo-100">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-indigo-800">Lead Management Dashboard</h3>
                      <div className="mt-2 text-sm text-indigo-700">
                        <p>Create and track leads, monitor conversion rates, and optimize your sales funnel all in one place.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Link
                  to="/app/first"
                  className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add New Lead
                </Link>
              </div>
            </div>
          )}
  
          {activeTab === "tasks" && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900">Task Management</h3>
                <p className="text-gray-500 text-sm mt-1">Organize and prioritize your daily activities</p>
              </div>
              <div className="p-6">
                <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-100">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Task Management Center</h3>
                      <div className="mt-2 text-sm text-green-700">
                        <p>Create, assign, and track tasks to stay on top of your daily activities and improve team productivity.</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Link
                  to="/app/tasks"
                  className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Task
                </Link>
              </div>
            </div>
          )}
        </div>
  
        {/* Right Column: Info Cards */}
        <div className="space-y-6">
          {/* Recent Leads Card */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className={`px-6 py-4 bg-gradient-to-r ${gradient.formGradient} flex justify-between items-center`}>
              <h3 className="text-md font-semibold text-white">Recent Leads</h3>
              <span className="bg-blue-500 text-white text-xs py-1 px-2 rounded-full">{leads.length} total</span>
            </div>
            <div className="divide-y divide-gray-100">
              {leads.slice(0, 3).map((lead, index) => (
                <div key={index} className="p-4 hover:bg-blue-50 transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{lead.Full_Name || lead.name}</h4>
                      <p className="text-xs text-gray-500 mt-1">{lead.company}</p>
                      <p className="text-xs text-gray-400 mt-1">{lead.Email || lead.value}</p>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-medium text-blue-600">{lead.Mobile}</span>
                      <span className="mt-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{lead?.Lead_Status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100">
              <Link
                to="/app/leadview"
                className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                    View all leads →
                  </Link>
                </div>
              </div>
  
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 bg-green-800 border-b border-green-100 flex justify-between items-center">
                  <h3 className="text-md font-medium text-white">Upcoming Tasks</h3>
                  <span className="bg-green-500 text-white text-xs py-1 px-2 rounded-full">{task.length} total</span>
                </div>
                <div className="divide-y divide-gray-200">
                  {task.slice(0, 3).map((task, index) => (
                    <div key={index} className="p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{task.Subject}</h4>
                          <p className="text-xs text-gray-500">Due: {task.Due_Date}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium  ${priorityColors[task.Priority] || "bg-gray-200 text-gray-700"}`}>
                          {task.Priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                  <Link
                    to="/app/taskView"
                    className="text-sm text-green-600 hover:text-green-800 font-medium"
                  >
                    View all tasks →
                  </Link>
                </div>
              </div>
  
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md overflow-hidden text-white">
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                  <p className="mb-6 text-indigo-100">Our support team is available 24/7 to assist you with any questions.</p>
                  <button onClick={openSupportPopup} className="bg-white text-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-indigo-50 transition-colors">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <CreateTaskForm
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onTaskCreated={() => {
            setIsTaskModalOpen(false);
            // Add any refresh logic here if needed
          }}
        />
  
        {/* <CreateContactForm
          isOpen={isContactModelOpen}
          onClose={() => setIsContactModalOpen(false)}
          onTaskCreated={() => {
            setIsContactModalOpen(false);
            // Add any refresh logic here if needed
          }}
        /> */}
  
        <UnauthorizedModal
          isOpen={isUnauthorizedModalOpen}
          onClose={() => setIsUnauthorizedModalOpen(false)}
          onConnect={handleConnectOrganization}
        />
        {showFeaturePopup && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity">
            <div className="bg-white rounded-xl shadow-2xl p-6 transform transition-all duration-300 ease-in-out scale-100 max-w-md w-full animate-bounce-in">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
                  <svg className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Feature Coming Soon!</h3>
                <p className="text-gray-500 mb-4">We're working hard to bring you this exciting new feature. Stay tuned!</p>
                <div className="mt-2">
                  <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full animate-progress-shrink" style={{animationDuration: '3s'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      <ChangesDone
        isOpen={isConfirmTrobleShoot}
        setIsOpen={setIsConfirmTrobleShoot}
      />
      </div>
  );
};

export default HomePage;





// import React, { useEffect, useState } from "react";
// import { Bar, Line } from "react-chartjs-2";
// import "chart.js/auto";
// import Navbar from "../component/common/Navbar";
// import { Link, useNavigate } from "react-router-dom";
// import { Calendar, Users, CheckSquare, TrendingUp, Plus, Paperclip, Clock, UserPlus, FilePlus, ClipboardCheck, UserCheck, LogOut, Contact } from "lucide-react";
// import toast from "react-hot-toast";
// import axios from 'axios';
// import CreateTaskForm from "../component/forms/CreateTaskForm";
// import CreateContactForm from "../component/forms/CreateContactForm";
// import { DateTime } from "luxon";
// import Cookies from "js-cookie";
// import CryptoJS from "crypto-js";
// import UnauthorizedModal from "../component/errorPages/UnauthorizedModal";
// import { openSupportPopup } from "../utils/supportTrigger";
// import { gradient } from "../config/colors";

// const recentLeads = [
//   { name: "John Smith", company: "ABC Corp", value: "$12,500", date: "2025-02-15" },
//   { name: "Sarah Johnson", company: "XYZ Ltd", value: "$8,900", date: "2025-02-14" },
//   { name: "Michael Brown", company: "123 Industries", value: "$15,300", date: "2025-02-13" },
// ];

// const upcomingTasks = [
//   { title: "Follow up with John", due: "Today", priority: "High" },
//   { title: "Prepare proposal for XYZ", due: "Tomorrow", priority: "Medium" },
//   { title: "Schedule demo with 123 Industries", due: "Feb 20", priority: "Low" },
// ];

// const priorityColors = {
//   High: "bg-red-200 text-red-700",
//   Highest: "bg-red-300 text-red-800",
//   Medium: "bg-yellow-200 text-yellow-700",
//   Low: "bg-green-200 text-green-700",
// };

// const HomePage = () => {
//   const [activeTab, setActiveTab] = useState("overview");
//   const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
//   const [isContactModelOpen, setIsContactModalOpen] = useState(false);
//   const [leads, setLeads] = useState(recentLeads);
//   const [task, setTask] = useState(upcomingTasks);
//   const [accessData, setAccessData] = useState({});
//   // Connection variable
//   const [isUnauthorizedModalOpen, setIsUnauthorizedModalOpen] = useState(false);
//   const [showFeaturePopup, setShowFeaturePopup] = useState(false);



//   const navigate = useNavigate();



//   // Dashboard Componet for the data view!

//   const [metrics, setMetrics] = useState({
//     leads: 0,
//     tasks: 0,
//     contacts: 0,
//     deals: 0,
//     isLoading: false,
//     loadingLeads: false,
//     loadingTasks: false,
//     loadingContacts: false,
//     loadingDeals: false,
//   });

//   // Helper function to check and retrieve cache
//   const getFromCache = async (key) => {
//     try {
//       const cache = await caches.open('dashboard-cache');
//       const cachedResponse = await cache.match(key);

//       if (cachedResponse) {
//         const cachedData = await cachedResponse.json();
//         // Check if cache is valid (less than 60 minutes old)
//         if (Date.now() - cachedData.timestamp < 60 * 60 * 1000) {
//           return cachedData.data;
//         }
//       }
//       return null;
//     } catch (error) {
//       return null;
//     }
//   };

//   // Helper function to save to cache
//   const saveToCache = async (key, data) => {
//     try {
//       const cache = await caches.open('dashboard-cache');
//       const cacheData = {
//         data,
//         timestamp: Date.now()
//       };

//       // Create a new Response object with the data
//       const response = new Response(JSON.stringify(cacheData), {
//         headers: { 'Content-Type': 'application/json' }
//       });

//       await cache.put(key, response);
//     } catch (error) {
//       toast.error("Something went wrong!");
//     }
//   };

//   // Fetch leads data
//   const fetchLeads = async (skipCache = false) => {
//     setMetrics(prev => ({ ...prev, loadingLeads: true }));

//     try {
//       let leadsCount;
      
//         const cachedLeads = await getFromCache('/api/leads');
//         const cachedLeadsDetails = await getFromCache('/api/leaddetails');

//         if (cachedLeads !== null && cachedLeadsDetails !== null) {
//           leadsCount = cachedLeads;
//           setLeads(cachedLeadsDetails);
//           setMetrics(prev => ({ ...prev, leads: leadsCount, loadingLeads: false }));
//           return;
//         }
      

//       const leadsResponse = await axios.get(`${process.env.REACT_APP_APP_API}/get/leaddetails`);
    
//       if(leadsResponse.status === 200){
//       leadsCount = leadsResponse?.data?.data?.info?.count || 0;
//       const leadData = leadsResponse?.data?.data?.data || recentLeads;
//       setLeads(leadData);
//       await saveToCache('/api/leads', leadsCount);
//       await saveToCache('/api/leaddetails', leadData);

//       setMetrics(prev => ({ ...prev, leads: leadsCount, loadingLeads: false }));
//       }
//     } catch (error) {
//       if (error?.response?.data?.code === 'ORG_NOT_AUTHORIZED') {
//         setIsUnauthorizedModalOpen(true);
//       }
//       setMetrics(prev => ({ ...prev, loadingLeads: false }));
//     }
//   };
//   // Fetch tasks data (revenue)
//   const fetchTasks = async (skipCache = false) => {
//     setMetrics(prev => ({ ...prev, loadingTasks: true }));

//     try {
//       let tasksCount;
      
//         const cachedTasks = await getFromCache('/api/tasks');
//         const cachedTaskData = await getFromCache('/api/taskdetails');
//         if (cachedTasks !== null && cachedTaskData !== null) {
//           tasksCount = cachedTasks;
//           setTask(cachedTaskData);
//           setMetrics(prev => ({ ...prev, tasks: tasksCount, loadingTasks: false }));
//           return;
//         }
      

//       const tasksResponse = await axios.get(`${process.env.REACT_APP_APP_API}/get/task`);
//       tasksCount = tasksResponse?.data?.data?.info?.count || 0;
//       const taskData = tasksResponse?.data?.data?.data || upcomingTasks;
//       setTask(taskData);
//       await saveToCache('/api/tasks', tasksCount);
//       await saveToCache('/api/taskdetails', taskData);


//       setMetrics(prev => ({ ...prev, tasks: tasksCount, loadingTasks: false }));
//     } catch (error) {
//       setMetrics(prev => ({ ...prev, loadingTasks: false }));
//     }
//   };
//   // Fetch contacts data (closing orders)
//   const fetchContacts = async (skipCache = false) => {
//     setMetrics(prev => ({ ...prev, loadingContacts: true }));

//     try {
//       let contactsCount;
      
//         const cachedContacts = await getFromCache('/api/contacts');
//         if (cachedContacts !== null) {
//           contactsCount = cachedContacts;
//           setMetrics(prev => ({ ...prev, contacts: contactsCount, loadingContacts: false }));
//           return;
//         }
      

//       const contactsResponse = await axios.get(`${process.env.REACT_APP_APP_API}/get/meetings`);
//       contactsCount = contactsResponse?.data?.data?.info?.count || 0;
//       await saveToCache('/api/contacts', contactsCount);


//       setMetrics(prev => ({ ...prev, contacts: contactsCount, loadingContacts: false }));
//     } catch (error) {
//       setMetrics(prev => ({ ...prev, loadingContacts: false }));
//     }
//   };
//   const fetchDeals = async (skipCache = false) => {
//     // Check if the function is called
//     setMetrics(prev => ({ ...prev, loadingDeals: true }));
//     try {
//       let dealsCount;
      
//         const cachedDeals = await getFromCache('/api/deals');
//         if (cachedDeals !== null) {
//           dealsCount = cachedDeals;
//           setMetrics(prev => ({ ...prev, deals: dealsCount, loadingDeals: false }));
//           return;
//         }
      

//       const dealsResponse = await axios.get(`${process.env.REACT_APP_APP_API}/get/dealdetails`);
//       dealsCount = dealsResponse?.data?.data?.info?.count || 0;
//       await saveToCache('/api/deals', dealsCount);


//       setMetrics(prev => ({ ...prev, deals: dealsCount, loadingDeals: false }));
//     } catch (error) {
//       setMetrics(prev => ({ ...prev, loadingDeals: false }));
//     }
//   };
//   // Fetch all data
//   const fetchAllData = async (skipCache = false) => {
//     setMetrics(prev => ({ ...prev, isLoading: true }));

//     try {
//       // Fetch all data in parallel
//       await Promise.all([
//         fetchLeads(true),
//         fetchTasks(true),
//         fetchContacts(true),
//         fetchDeals(true),
//       ]);

//       setMetrics(prev => ({ ...prev, isLoading: false }));
//     } catch (error) {
//       setMetrics(prev => ({ ...prev, isLoading: false }));
//     }
//   };

//   // Refresh individual component data forcefully
//   const refreshComponent = async (component) => {
//     try {
//       // Clear specific component cache
//       const cache = await caches.open('dashboard-cache');
//       await cache.delete(`/api/${component}`);

//       // Fetch fresh data for the specific component
//       if (component === 'leads') {
//         fetchLeads(true);
//       } else if (component === 'tasks') {
//         fetchTasks(true);
//       } else if (component === 'contacts') {
//         fetchContacts(true);
//       } else if (component === 'deals') {
//         fetchDeals(true);
//       }
//     } catch (error) {
//       toast.error(`Error refreshing ${component}:`, error);
//     }
//   };

//   useEffect(() => {
//     async function fetchData() {
//       const response = await axios.get(`${process.env.REACT_APP_APP_API}/special/fetching`);
//       if (response.status === 200) {
//         setAccessData({ Leads: response?.data?.user?.Leads || 4, Contacts: response?.data?.user?.Contacts || 4, Deals: response?.data?.user?.Deals || 4 })
//       } else {
//         setAccessData({ Leads: 4, Contacts: 4, Deals: 4 });
//       }
//     }
//     fetchAllData();
//     fetchData();
//   }, []);


//   // Connection function for checking...

//   const handleConnectOrganization = () => {
//     // Navigate to organization connection page or open connection modal
//     navigate('/app/connection');
//     setIsUnauthorizedModalOpen(false);
//   };



//   const salesData = {
//     labels: ["January", "February", "March", "April", "May", "June"],
//     datasets: [
//       {
//         label: "Sales 2025",
//         data: [50, 75, 100, 85, 110, 130],
//         backgroundColor: "rgba(59, 130, 246, 0.5)",
//         borderColor: "rgba(59, 130, 246, 1)",
//         borderWidth: 2,
//       },
//       {
//         label: "Sales 2024",
//         data: [40, 60, 80, 70, 90, 110],
//         backgroundColor: "rgba(156, 163, 175, 0.5)",
//         borderColor: "rgba(156, 163, 175, 1)",
//         borderWidth: 2,
//       },
//     ],
//   };

//   const leadsData = {
//     labels: ["January", "February", "March", "April", "May", "June"],
//     datasets: [
//       {
//         label: "New Leads",
//         data: [25, 40, 30, 45, 55, 60],
//         borderColor: "rgba(16, 185, 129, 1)",
//         backgroundColor: "rgba(16, 185, 129, 0.1)",
//         tension: 0.4,
//         fill: true,
//       }
//     ],
//   };

//   // Secret key for encryption (should match the one used in authSlice)

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
//       toast.error(error.message || "Failed to retrieve user data.");
//       return null;
//     }
//   };

//   const getLocation = async () => {
//     try {
//       return await new Promise((resolve, reject) => {
//         navigator.geolocation.getCurrentPosition(resolve, (error) => {
//           toast.error("Unable to retrieve location. Please enable location services.");
//           reject(error);
//         });
//       });
//     } catch (error) {
//       toast.error("Failed to fetch the location!");
//       return null;
//     }
//   };

//   // const handleCheckIn = async () => {
//   //   try {
//   //     const currentDateTime = DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm:ss");
//   //     const date = DateTime.now().toFormat("yyyy-MM-dd");

//   //     // Get user's location
//   //     const position = await getLocation();
//   //     if (!position) return;

//   //     const { latitude, longitude } = position.coords;
//   //     const Check_in_Address = `${latitude},${longitude}`;

//   //     // Get user details from cookies
//   //     const user = getUserDetails();
//   //     if (!user) return;

//   //     const { user_id, first_name, last_name } = user;

//   //     const requestBody = {
//   //       Name: `${first_name} ${last_name}/${date}`,
//   //       EMP_Id: `${user_id}/${date}`,
//   //       First_Check_in: currentDateTime,
//   //       Check_in_Address: Check_in_Address,
//   //     };

//   //     // Send the POST request
//   //     const response = await axios.post(
//   //       `${process.env.REACT_APP_APP_API}/attendance/checkin`,
//   //       requestBody,
//   //       {
//   //         headers: { "Content-Type": "application/json" },
//   //       }
//   //     );

//   //     if (response.data.success) {
//   //       toast.success("Check-in successful!");
//   //     } else {
//   //       toast.error(response.data.message || "Check-in failed. Please try again.");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error during check-in:", error);
//   //     toast.error(
//   //       error?.response?.data?.message || "An error occurred during check-in. Please try again."
//   //     );
//   //   }
//   // };

//   // const handleCheckOut = async () => {
//   //   try {
//   //     const currentDateTime = DateTime.now().toFormat("yyyy-MM-dd'T'HH:mm:ss");
//   //     const date = DateTime.now().toFormat("yyyy-MM-dd");

//   //     // Get user's location
//   //     const position = await getLocation();
//   //     if (!position) return;

//   //     const { latitude, longitude } = position.coords;
//   //     const Check_out_Address = `${latitude},${longitude}`;

//   //     // Get user details from cookies
//   //     const user = getUserDetails();
//   //     if (!user) return;

//   //     const { user_id, first_name, last_name } = user;

//   //     const requestBody = {
//   //       Name: `${first_name} ${last_name}/${date}`,
//   //       EMP_Id: `${user_id}/${date}`,
//   //       Last_Check_out: currentDateTime,
//   //       Check_out_Address: Check_out_Address,
//   //     };

//   //     // Send the POST request
//   //     const response = await axios.post(
//   //       `${process.env.REACT_APP_APP_API}/attendance/checkOut`,
//   //       requestBody,
//   //       {
//   //         headers: { "Content-Type": "application/json" },
//   //       }
//   //     );

//   //     if (response.data.success) {
//   //       toast.success("Check-out successful!");
//   //     } else {
//   //       toast.error(response.data.message || "Check-out failed. Please try again.");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error during check-out:", error);
//   //     toast.error(
//   //       error?.response?.data?.message || "An error occurred during check-out. Please try again."
//   //     );
//   //   }
//   // };

// // Add this function
//   const handleShowpop = () => {
//     setShowFeaturePopup(true);
//     setTimeout(() => {
//       setShowFeaturePopup(false);
//     }, 3000);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
//       <Navbar accessData={accessData} />
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//         {/* Premium Welcome Banner */}
//         <div className={`bg-gradient-to-r ${gradient.formGradient} rounded-xl shadow-xl mb-8 overflow-hidden`}>
//           <div className="relative px-6 py-10 sm:px-10">
//             <div className="absolute inset-0 opacity-10">
//               <svg className="h-full w-full" viewBox="0 0 678 600" fill="none" xmlns="http://www.w3.org/2000/svg">
//                 <path d="M614.5 137C562.7 76.6 431.1 78.4 394.5 43C358.9 8.6 337.3 -17.8 275.7 12.2C214.1 42.2 202.3 129.4 137.9 175C73.5 220.6 30.7 235.4 11.3 324C-8.1 412.6 42.1 490.2 110.7 542.8C179.3 595.4 288.9 610.2 375.3 580.2C461.7 550.2 424.1 425 526.1 368.6C628.1 312.2 666.3 197.4 614.5 137Z" fill="currentColor" />
//               </svg>
//             </div>
//             <div className="relative z-10">
//               <h1 className="text-3xl font-bold text-white mb-3 text-center">Welcome to Your Command Center</h1>
//               <p className="text-indigo-100 mb-6 text-center text-lg">Track, manage, and optimize your sales pipeline efficiently.</p>

//               <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-8">             

//                 <Link
//                   to="/app/first"
//                   title={accessData?.Leads < 2 ? "You do not have enough access to create a lead" : ""}
//                   className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${accessData?.Leads < 2
//                     ? "bg-gray-100 bg-opacity-20 cursor-not-allowed"
//                     : "bg-white bg-opacity-20 hover:bg-opacity-30"
//                     }`}
//                   onClick={(e) => {
//                     if (accessData?.Leads < 2) {
//                       e.preventDefault();
//                       toast.error("Insufficient access rights to create a lead");
//                     }
//                   }}
//                 >
//                   <UserPlus className="h-6 w-6 text-white mb-2" />
//                   <span className="text-white text-sm font-medium">Create Lead</span>
//                 </Link>

//                 <Link
//                   to="/app/taskform"
//                   className="flex flex-col items-center p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setIsTaskModalOpen(true);
//                   }}
//                 >
//                   <FilePlus className="h-6 w-6 text-white mb-2" />
//                   <span className="text-white text-sm font-medium">Create Tasks</span>
//                 </Link>

//                 <Link
//                   to="/app/contactform"
//                   title={accessData?.Contacts < 2 ? "You do not have enough access to create a contact" : ""}
//                   className={`flex flex-col items-center p-3 rounded-lg transition-all duration-200 ${accessData?.Contacts < 2
//                     ? "bg-gray-100 bg-opacity-20 cursor-not-allowed"
//                     : "bg-white bg-opacity-20 hover:bg-opacity-30"
//                     }`}
//                     onClick={(e) => {
//                       if (accessData?.Contacts < 2) {
//                         e.preventDefault();
//                         toast.error("Insufficient access rights to create a contact");
//                       }
//                   }}
//                 >
//                   <FilePlus className="h-6 w-6 text-white mb-2" />
//                   <span className="text-white text-sm font-medium">Create Contacts</span>
//                 </Link>

//                 <button
//                   onClick={handleShowpop}
//                   className="flex flex-col items-center p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
//                 >
//                   <UserCheck className="h-6 w-6 text-white mb-2" />
//                   <span className="text-white text-sm font-medium">CheckIn Att.</span>
//                 </button>

//                 <button
//                   onClick={handleShowpop}
//                   className="flex flex-col items-center p-3 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-all duration-200"
//                 >
//                   <LogOut className="h-6 w-6 text-white mb-2" />
//                   <span className="text-white text-sm font-medium">CheckOut Att.</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Dashboard Stats Cards */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//           {/* Lead Card */}
//           <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
//             <div className="flex p-6">
//               <div className="flex-grow">
//                 <p className="text-gray-500 text-sm font-medium mb-1">Lead Count</p>
//                 <h3 className="text-3xl font-bold text-gray-800">{metrics.loadingLeads ? '...' : metrics.leads}</h3>
//               </div>
//               <div className="bg-blue-500 bg-opacity-10 rounded-lg p-3 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
//                 <svg className="w-7 h-7 text-blue-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                 </svg>
//               </div>
//             </div>
//             <div className="bg-gray-50 px-6 py-2 group-hover:bg-gray-100 transition-colors duration-300">
//               <button
//                 onClick={() => refreshComponent('leads')}
//                 className="w-full flex items-center justify-center text-xs text-gray-500 group-hover:text-gray-700"
//                 disabled={metrics.loadingLeads}
//               >
//                 {metrics.loadingLeads ? (
//                   <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                 ) : (
//                   <>
//                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                     </svg>
//                     Refresh data
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Task Card */}
//           <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
//             <div className="flex p-6">
//               <div className="flex-grow">
//                 <p className="text-gray-500 text-sm font-medium mb-1">Open Tasks</p>
//                 <h3 className="text-3xl font-bold text-gray-800">{metrics.loadingTasks ? '...' : metrics.tasks}</h3>
//               </div>
//               <div className="bg-green-500 bg-opacity-10 rounded-lg p-3 flex items-center justify-center group-hover:bg-green-500 group-hover:text-white transition-colors duration-300">
//                 <svg className="w-7 h-7 text-green-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
//                 </svg>
//               </div>
//             </div>
//             <div className="bg-gray-50 px-6 py-2 group-hover:bg-gray-100 transition-colors duration-300">
//               <button
//                 onClick={() => refreshComponent('tasks')}
//                 className="w-full flex items-center justify-center text-xs text-gray-500 group-hover:text-gray-700"
//                 disabled={metrics.loadingTasks}
//               >
//                 {metrics.loadingTasks ? (
//                   <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                 ) : (
//                   <>
//                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                     </svg>
//                     Refresh data
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Meetings Card */}
//           <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
//             <div className="flex p-6">
//               <div className="flex-grow">
//                 <p className="text-gray-500 text-sm font-medium mb-1">Total Meetings</p>
//                 <h3 className="text-3xl font-bold text-gray-800">{metrics.loadingContacts ? '...' : metrics.contacts}</h3>
//               </div>
//               <div className="bg-purple-500 bg-opacity-10 rounded-lg p-3 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors duration-300">
//                 <svg className="w-7 h-7 text-purple-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                 </svg>
//               </div>
//             </div>
//             <div className="bg-gray-50 px-6 py-2 group-hover:bg-gray-100 transition-colors duration-300">
//               <button
//                 onClick={() => refreshComponent('contacts')}
//                 className="w-full flex items-center justify-center text-xs text-gray-500 group-hover:text-gray-700"
//                 disabled={metrics.loadingContacts}
//               >
//                 {metrics.loadingContacts ? (
//                   <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                 ) : (
//                   <>
//                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                     </svg>
//                     Refresh data
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>

//           {/* Deals Card */}
//           <div className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-lg transition-all duration-300">
//             <div className="flex p-6">
//               <div className="flex-grow">
//                 <p className="text-gray-500 text-sm font-medium mb-1">Open Deals</p>
//                 <h3 className="text-3xl font-bold text-gray-800">{metrics.loadingDeals ? '...' : metrics.deals}</h3>
//               </div>
//               <div className="bg-amber-500 bg-opacity-10 rounded-lg p-3 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors duration-300">
//                 <svg className="w-7 h-7 text-amber-500 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               </div>
//             </div>
//             <div className="bg-gray-50 px-6 py-2 group-hover:bg-gray-100 transition-colors duration-300">
//               <button
//                 onClick={() => refreshComponent('deals')}
//                 className="w-full flex items-center justify-center text-xs text-gray-500 group-hover:text-gray-700"
//                 disabled={metrics.loadingDeals}
//               >
//                 {metrics.loadingDeals ? (
//                   <svg className="animate-spin w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                 ) : (
//                   <>
//                     <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                     </svg>
//                     Refresh data
//                   </>
//                 )}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Premium Tabs */}
//         <div className="mb-8">
//           <nav className="flex space-x-1 rounded-lg bg-gray-100 p-1">
//             <button
//               onClick={() => setActiveTab("overview")}
//               className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "overview"
//                 ? "bg-white text-indigo-700 shadow-sm"
//                 : "text-gray-600 hover:text-gray-900 hover:bg-white hover:bg-opacity-50"
//                 }`}
//             >
//               Overview
//             </button>
//             <button
//               onClick={() => setActiveTab("leads")}
//               className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "leads"
//                 ? "bg-white text-indigo-700 shadow-sm"
//                 : "text-gray-600 hover:text-gray-900 hover:bg-white hover:bg-opacity-50"
//                 }`}
//             >
//               Leads
//             </button>
//             <button
//               onClick={() => setActiveTab("tasks")}
//               className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-all duration-200 ${activeTab === "tasks"
//                 ? "bg-white text-indigo-700 shadow-sm"
//                 : "text-gray-600 hover:text-gray-900 hover:bg-white hover:bg-opacity-50"
//             }`}
//           >
//             Tasks
//           </button>
//         </nav>
//       </div>
  
//       {/* Tab Content */}
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         <div className="lg:col-span-2 space-y-8">
//           {activeTab === "overview" && (
//             <>
//               <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 w-full">
//                 <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
//                   <h3 className="text-xl font-semibold text-gray-800">External Analytics</h3>
//                   <select 
//                     className="text-sm border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
//                   >
//                     <option>View 1</option>
//                     <option>View 2</option>
//                     <option>View 3</option>
//                   </select>
//                 </div>

//                 <div className="overflow-hidden w-full flex justify-center items-center">
//                   <div 
//                     className="origin-top-left scale-[0.75] sm:scale-[0.85] md:scale-[0.9] lg:scale-100" 
//                     style={{ width: '1000px', height: '500px' }} // fixed size expected by Zoho
//                   >
//                     <iframe
//                       src="https://crm.zoho.com/crm/specific/ViewChartImage?width=1000&height=500&embedDetails=350870214961ec7506e8e2c2e9504fb60b7c4f880b6b74462f8b6f01c3bf35cca1e5a2fc0cde2a401899f16ff7d79e392f88258fa798e528031e24c2decbcccf557e8c42f10b5cf5b05268e3f89c7fb48656669b303f2f18d5d96570a0977d5e13d47176cf2f04220d9783039a67a94d"
//                       title="External Chart"
//                       className="w-full h-full border-0 rounded-xl shadow"
//                       loading="lazy"
//                       sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
  
//           {activeTab === "leads" && (
//             <div className="bg-white rounded-xl shadow-md overflow-hidden">
//               <div className="p-6 border-b border-gray-100">
//                 <h3 className="text-lg font-semibold text-gray-900">Lead Management</h3>
//                 <p className="text-gray-500 text-sm mt-1">Track and manage your sales pipeline efficiently</p>
//               </div>
//               <div className="p-6">
//                 <div className="bg-indigo-50 rounded-lg p-4 mb-6 border border-indigo-100">
//                   <div className="flex items-start">
//                     <div className="flex-shrink-0">
//                       <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                     </div>
//                     <div className="ml-3">
//                       <h3 className="text-sm font-medium text-indigo-800">Lead Management Dashboard</h3>
//                       <div className="mt-2 text-sm text-indigo-700">
//                         <p>Create and track leads, monitor conversion rates, and optimize your sales funnel all in one place.</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <Link
//                   to="/app/first"
//                   className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
//                 >
//                   <Plus className="w-5 h-5 mr-2" />
//                   Add New Lead
//                 </Link>
//               </div>
//             </div>
//           )}
  
//           {activeTab === "tasks" && (
//             <div className="bg-white rounded-xl shadow-md overflow-hidden">
//               <div className="p-6 border-b border-gray-100">
//                 <h3 className="text-lg font-semibold text-gray-900">Task Management</h3>
//                 <p className="text-gray-500 text-sm mt-1">Organize and prioritize your daily activities</p>
//               </div>
//               <div className="p-6">
//                 <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-100">
//                   <div className="flex items-start">
//                     <div className="flex-shrink-0">
//                       <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
//                       </svg>
//                     </div>
//                     <div className="ml-3">
//                       <h3 className="text-sm font-medium text-green-800">Task Management Center</h3>
//                       <div className="mt-2 text-sm text-green-700">
//                         <p>Create, assign, and track tasks to stay on top of your daily activities and improve team productivity.</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <Link
//                   to="/app/tasks"
//                   className="inline-flex items-center px-5 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
//                 >
//                   <Plus className="w-5 h-5 mr-2" />
//                   Create New Task
//                 </Link>
//               </div>
//             </div>
//           )}
//         </div>
  
//         {/* Right Column: Info Cards */}
//         <div className="space-y-6">
//           {/* Recent Leads Card */}
//           <div className="bg-white rounded-xl shadow-md overflow-hidden">
//             <div className={`px-6 py-4 bg-gradient-to-r ${gradient.formGradient} flex justify-between items-center`}>
//               <h3 className="text-md font-semibold text-white">Recent Leads</h3>
//               <span className="bg-blue-500 text-white text-xs py-1 px-2 rounded-full">{leads.length} total</span>
//             </div>
//             <div className="divide-y divide-gray-100">
//               {leads.slice(0, 3).map((lead, index) => (
//                 <div key={index} className="p-4 hover:bg-blue-50 transition-colors duration-200">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <h4 className="text-sm font-medium text-gray-900">{lead.Full_Name || lead.name}</h4>
//                       <p className="text-xs text-gray-500 mt-1">{lead.company}</p>
//                       <p className="text-xs text-gray-400 mt-1">{lead.Email || lead.value}</p>
//                     </div>
//                     <div className="flex flex-col items-end">
//                       <span className="text-sm font-medium text-blue-600">{lead.Mobile}</span>
//                       <span className="mt-1 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">{lead?.Lead_Status}</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <div className="p-4 bg-gray-50 border-t border-gray-100">
//               <Link
//                 to="/app/leadview"
//                 className="flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 font-medium"
//               >
//                     View all leads →
//                   </Link>
//                 </div>
//               </div>
  
//               <div className="bg-white rounded-lg shadow-md overflow-hidden">
//                 <div className="p-4 bg-green-800 border-b border-green-100 flex justify-between items-center">
//                   <h3 className="text-md font-medium text-white">Upcoming Tasks</h3>
//                   <span className="bg-green-500 text-white text-xs py-1 px-2 rounded-full">{task.length} total</span>
//                 </div>
//                 <div className="divide-y divide-gray-200">
//                   {task.slice(0, 3).map((task, index) => (
//                     <div key={index} className="p-4 hover:bg-gray-50">
//                       <div className="flex justify-between items-start">
//                         <div>
//                           <h4 className="text-sm font-medium text-gray-900">{task.Subject}</h4>
//                           <p className="text-xs text-gray-500">Due: {task.Due_Date}</p>
//                         </div>
//                         <span className={`text-xs px-2 py-1 rounded-full font-medium  ${priorityColors[task.Priority] || "bg-gray-200 text-gray-700"}`}>
//                           {task.Priority}
//                         </span>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <div className="p-4 bg-gray-50 border-t border-gray-100">
//                   <Link
//                     to="/app/taskView"
//                     className="text-sm text-green-600 hover:text-green-800 font-medium"
//                   >
//                     View all tasks →
//                   </Link>
//                 </div>
//               </div>
  
//               <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-md overflow-hidden text-white">
//                 <div className="p-6">
//                   <h3 className="text-xl font-bold mb-4">Need Help?</h3>
//                   <p className="mb-6 text-indigo-100">Our support team is available 24/7 to assist you with any questions.</p>
//                   <button onClick={openSupportPopup} className="bg-white text-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-indigo-50 transition-colors">
//                     Contact Support
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
  
//         <CreateTaskForm
//           isOpen={isTaskModalOpen}
//           onClose={() => setIsTaskModalOpen(false)}
//           onTaskCreated={() => {
//             setIsTaskModalOpen(false);
//             // Add any refresh logic here if needed
//           }}
//         />
  
//         {/* <CreateContactForm
//           isOpen={isContactModelOpen}
//           onClose={() => setIsContactModalOpen(false)}
//           onTaskCreated={() => {
//             setIsContactModalOpen(false);
//             // Add any refresh logic here if needed
//           }}
//         /> */}
  
//         <UnauthorizedModal
//           isOpen={isUnauthorizedModalOpen}
//           onClose={() => setIsUnauthorizedModalOpen(false)}
//           onConnect={handleConnectOrganization}
//         />
//         {showFeaturePopup && (
//           <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 transition-opacity">
//             <div className="bg-white rounded-xl shadow-2xl p-6 transform transition-all duration-300 ease-in-out scale-100 max-w-md w-full animate-bounce-in">
//               <div className="text-center">
//                 <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 mb-4">
//                   <svg className="h-10 w-10 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
//                   </svg>
//                 </div>
//                 <h3 className="text-xl font-bold text-gray-900 mb-2">Feature Coming Soon!</h3>
//                 <p className="text-gray-500 mb-4">We're working hard to bring you this exciting new feature. Stay tuned!</p>
//                 <div className="mt-2">
//                   <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
//                     <div className="h-full bg-indigo-500 rounded-full animate-progress-shrink" style={{animationDuration: '3s'}}></div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>
//   );
// };

// export default HomePage;


