import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../common/Navbar";
import { useNavigate, Link } from "react-router-dom";
import { Search, ArrowUp, ArrowDown, X, Plus, ChevronLeft, ChevronRight, Calendar, Settings } from "lucide-react";
import toast from "react-hot-toast";
import moment from 'moment';

const statusColors = {
  PLANNED: "bg-blue-200 text-blue-700",
  COMPLETED: "bg-green-200 text-green-700",
  CANCELLED: "bg-red-200 text-red-700",
  RESCHEDULED: "bg-yellow-200 text-yellow-700",
};

const Shimmer = () => {
  return (
    <div className="animate-pulse">
      <Navbar />
      <div className="p-4">
        <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        {[...Array(5)].map((_, index) => (
          <div key={index} className="h-20 bg-gray-200 my-2 rounded w-full"></div>
        ))}
      </div>
    </div>
  );
};

const MeetingView = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Date Filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDateRangeActive, setIsDateRangeActive] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [meetingsPerPage, setMeetingsPerPage] = useState(10);
  const [isItemsPerPageOpen, setIsItemsPerPageOpen] = useState(false);

  // setting the error
  const [error, setError] = useState(null);

  const [newMeeting, setNewMeeting] = useState({
    Event_Title: "",
    Start_DateTime: "",
    End_DateTime: "",
    All_day: false,
    Check_In_Status: "PLANNED",
    Description: "",
  });

   const [showColumnModal, setShowColumnModal] = useState(false);
    const [selectedColumns, setSelectedColumns] = useState({
      Event_Title: true,
      Start_DateTime: true,
      End_DateTime: true,
      All_day: true,
      Check_In_Status: true,
      Created_Time: true,
    });
  

  const navigate = useNavigate();



    // Add this function to handle column toggling
    const toggleColumn = (columnName) => {
      setSelectedColumns((prev) => ({
        ...prev,
        [columnName]: !prev[columnName],
      }));
    };
  
    // Add this function to save column settings
    const saveColumnSettings = () => {
      // Optionally save to localStorage to persist user preferences
      localStorage.setItem("crm-meeting-columns", JSON.stringify(selectedColumns));
      setShowColumnModal(false);
    };
  
    // Add this useEffect to load saved column preferences on component mount
    useEffect(() => {
      const savedColumns = localStorage.getItem("crm-meeting-columns");
      if (savedColumns) {
        setSelectedColumns(JSON.parse(savedColumns));
      }
    }, []);
  
    const ColumnManagementModal = () => {
      if (!showColumnModal) return null;
  
      const columnOptions = [
        { key: "Event_Title", label: "Meeting Title" },
        { key: "Start_DateTime", label: "Start Time" },
        { key: "End_DateTime", label: "End Time" },
        { key: "Check_In_Status", label: "Status" },
        { key: "Created_Time", label: "Created Time" },
      ];
  
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Manage Columns</h2>
              <button
                onClick={() => setShowColumnModal(false)}
                className="text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-4">
                Select the columns you want to display in the table.
              </p>
  
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {columnOptions.map((column) => (
                  <div
                    key={column.key}
                    className="flex items-center p-2 hover:bg-gray-50 rounded"
                  >
                    <input
                      type="checkbox"
                      id={`column-${column.key}`}
                      checked={selectedColumns[column.key]}
                      onChange={() => toggleColumn(column.key)}
                      className="mr-3 h-5 w-5 text-blue-500"
                    />
                    <label
                      htmlFor={`column-${column.key}`}
                      className="flex-grow cursor-pointer"
                    >
                      {column.label}
                    </label>
                  </div>
                ))}
              </div>
  
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowColumnModal(false)}
                  className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={saveColumnSettings}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    };
  



  const CACHE_NAME = "crm-cache";

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      // Open Cache Storage
      const cache = await caches.open(CACHE_NAME);

      // Check if data is present in cache
      const cachedResponse = await cache.match("/meetings");

      if (cachedResponse) {
        const data = await cachedResponse.json();
        setMeetings(data);
        setLoading(false);

        return;
      }

      // If no cached data, fetch from API
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/get/meetings`);
      if (response.status === 200) {
        const data = response.data.data || [];
        setMeetings(data);

        // Store the fetched data in Cache Storage
        const newResponse = new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
        await cache.put("/meetings", newResponse);
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.code === "ORG_NOT_AUTHORIZED") {
        setError({ code: "ORG_NOT_AUTHORIZED" });
        setTimeout(() => {
          navigate('/app/connection');
        }, 3000);
      } else {
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, []);

  useEffect(() => {
    // Reset to first page when changing items per page
    setCurrentPage(1);
  }, [meetingsPerPage]);

  const hardSync = async () => {
    setLoading(true);
    try {
      // Fetch the latest meeting details from the API
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/get/meetings`);
      if (response.status === 200) {
        const data = response.data.data || [];
        setMeetings(data);

        // Open Cache Storage and update with new data
        const cache = await caches.open(CACHE_NAME);
        const newResponse = new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
        await cache.put("/meetings", newResponse);
      }
    } catch (error) {
      toast.error("Error fetching meetings");
    } finally {
      setLoading(false);
    }
  };

  const getEachRecordHandler = (meetingId) => {
    navigate('/app/meetingprofile', { state: { meetingId } });
  };

  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  const applyDateRangeFilter = () => {
    if (startDate || endDate) {
      setIsDateRangeActive(true);
    }
    setIsFilterOpen(false);
  };

  const clearDateRangeFilter = () => {
    setStartDate("");
    setEndDate("");
    setIsDateRangeActive(false);
  };

  const isDateInRange = (dateStr) => {
    if (!dateStr) return false;

    const meetingDate = new Date(dateStr);

    // If only start date is provided
    if (startDate && !endDate) {
      const start = new Date(startDate);
      return meetingDate >= start;
    }

    // If only end date is provided
    if (!startDate && endDate) {
      const end = new Date(endDate);
      return meetingDate <= end;
    }

    // If both dates are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return meetingDate >= start && meetingDate <= end;
    }

    return true;
  };

  const filterMeetings = () => {
    if (!meetings?.data) return [];

    let filteredMeetings = [...meetings.data];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredMeetings = filteredMeetings.filter(meeting =>
        (meeting.Event_Title && meeting.Event_Title.toLowerCase().includes(term)) ||
        (meeting.Check_In_Status && meeting.Check_In_Status.toLowerCase().includes(term))
      );
    }

    if (isDateRangeActive) {
      filteredMeetings = filteredMeetings.filter(meeting => isDateInRange(meeting.Start_DateTime));
    }

    if (sortField) {
      filteredMeetings.sort((a, b) => {
        const aValue = a[sortField] || "";
        const bValue = b[sortField] || "";

        if (sortField === "Start_DateTime" || sortField === "End_DateTime" || sortField === "Created_Time" || sortField === "Modified_Time") {
          const dateA = new Date(aValue);
          const dateB = new Date(bValue);
          return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        } else {
          if (sortDirection === "asc") {
            return String(aValue).localeCompare(String(bValue));
          } else {
            return String(bValue).localeCompare(String(aValue));
          }
        }
      });
    }

    return filteredMeetings;
  };

  const viewMeetingDetails = (meeting) => {
    setSelectedMeeting(meeting);
  };

  const closeMeetingDetails = () => {
    setSelectedMeeting(null);
  };

  const handleCreateMeeting = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/create/createdata/Events`,
        newMeeting
      );
      if (response?.status === 200) {
        toast.success("Meeting Created Successfully!");
      }
    } catch (error) {
      toast.error(error?.response?.data?.error?.data[0]?.message || "Error creating meeting!");
    } finally {
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
      fetchMeetings();
      setNewMeeting({
        Event_Title: "",
        Start_DateTime: "",
        End_DateTime: "",
        All_day: false,
        Check_In_Status: "PLANNED",
        Description: ""
      });
    }
  };

  // Pagination calculations
  const filteredMeetings = filterMeetings();
  const totalMeetings = filteredMeetings.length;
  const totalPages = Math.ceil(totalMeetings / meetingsPerPage);
  const indexOfLastMeeting = currentPage * meetingsPerPage;
  const indexOfFirstMeeting = indexOfLastMeeting - meetingsPerPage;
  const currentMeetings = filteredMeetings.slice(indexOfFirstMeeting, indexOfLastMeeting);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleMeetingsPerPageChange = (value) => {
    setMeetingsPerPage(Number(value));
    setIsItemsPerPageOpen(false);
  };

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${startDate} to ${endDate}`;
    } else if (startDate) {
      return `From ${startDate}`;
    } else if (endDate) {
      return `Until ${endDate}`;
    }
    return "";
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "-";
    return moment(dateTimeStr).format("MMM DD, YYYY h:mm A");
  };

  if (loading) {
    return <Shimmer />;
  }

  // Check for organization authorization
  if (error && error.code === "ORG_NOT_AUTHORIZED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-16 w-16 text-red-500 mx-auto mb-4" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
          <h2 className="text-xl font-semibold mb-2">Connection Required</h2>
          <p className="text-gray-600 mb-6">Your organization is not authorized. Please set up a connection to continue.</p>
          <button 
            onClick={() => navigate('/app/connection')}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Connect Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 p-4 max-w-7xl mx-auto w-full flex flex-col">
          {/* Header section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div className="flex flex-col sm:flex-row w-full justify-between mb-4 md:mb-0 mr-5">
              <h1 className="text-2xl font-bold text-gray-800 mb-3 sm:mb-0">
                Meeting Management
              </h1>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <button
                  onClick={hardSync}
                  className="flex-1 sm:flex-none bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors text-sm md:text-base"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1 md:mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Sync Now
                </button>

                <button
                  onClick={() => setShowColumnModal(true)}
                  className="flex-1 sm:flex-none bg-white border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 rounded-lg sm:flex items-center justify-center hidden hover:bg-gray-50 transition-colors text-sm md:text-base"
                >
                  <Settings size={16} className="mr-1 md:mr-2" />
                  <span>Manage Columns</span>
                </button>

                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="flex-1 sm:flex-none bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors text-sm md:text-base"
                >
                  <Plus size={16} className="mr-1 md:mr-2" />
                  <span className="hidden sm:inline">Create Meeting</span>
                  <span className="sm:hidden">Create</span>
                </button>
              </div>
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              </div>

              <div className="relative w-full md:w-auto">
                <button
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className="w-full md:w-auto px-4 py-2 border rounded-lg flex items-center justify-center bg-white hover:bg-gray-50 transition-colors"
                >
                  <Calendar size={16} className="mr-2 text-gray-500" />
                  <span className="text-gray-700">Date Filter</span>
                  {isDateRangeActive && <span className="ml-1 h-2 w-2 bg-blue-500 rounded-full"></span>}
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-10 p-4 border">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex justify-between">
                      <button
                        onClick={clearDateRangeFilter}
                        className="px-3 py-1.5 border rounded-lg text-gray-600 hover:bg-gray-50 text-sm"
                      >
                        Clear
                      </button>
                      <button
                        onClick={applyDateRangeFilter}
                        className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                      >
                        Apply Filter
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isDateRangeActive && (
            <div className="mb-4 flex items-center gap-2 bg-blue-50 p-2 rounded-lg">
              <span className="text-blue-700 font-medium">Date range filter:</span>
              <span className="text-blue-600">{formatDateRange()}</span>
              <button
                onClick={clearDateRangeFilter}
                className="ml-2 text-blue-500 hover:text-blue-700"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* Mobile items per page selector */}
          <div className="md:hidden relative mb-4">
            <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow">
              <div className="flex items-center">
                <span className="text-sm text-gray-600 mr-2">Show:</span>
                <button
                  onClick={() => setIsItemsPerPageOpen(!isItemsPerPageOpen)}
                  className="border rounded px-3 py-1 text-sm flex items-center justify-between w-20"
                >
                  {meetingsPerPage}
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isItemsPerPageOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
              <div className="text-sm text-gray-600">
                {totalMeetings > 0
                  ? `${indexOfFirstMeeting + 1}-${Math.min(
                      indexOfLastMeeting,
                      totalMeetings
                    )} of ${totalMeetings}`
                  : `0 meetings`}
              </div>
            </div>

            {isItemsPerPageOpen && (
              <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
                {[10, 20, 30, 50, 100].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleMeetingsPerPageChange(value)}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      meetingsPerPage === value
                        ? "bg-blue-50 text-blue-600"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pagination Controls - Top */}
          <div className="hidden md:flex justify-between items-center mb-4 bg-white p-2 rounded-lg shadow">
            <div className="flex items-center mb-2 sm:mb-0">
              <label htmlFor="meetingsPerPage" className="mr-2 text-sm text-gray-600">Show:</label>
              <select
                id="meetingsPerPage"
                value={meetingsPerPage}
                onChange={(e) => handleMeetingsPerPageChange(e.target.value)}
                className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="ml-2 text-sm text-gray-600">meetings per page</span>
            </div>

            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-4">
                {totalMeetings > 0
                  ? `Showing ${indexOfFirstMeeting + 1} to ${Math.min(indexOfLastMeeting, totalMeetings)} of ${totalMeetings} meetings`
                  : `0 meetings found`}
              </span>
              <div className="flex">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-1 mx-1 rounded ${currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-100'}`}
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className={`p-1 mx-1 rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 cursor-not-allowed' : 'text-blue-500 hover:bg-blue-100'}`}
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Desktop view */}
          <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {selectedColumns["Event_Title"] && (<th className="p-4 cursor-pointer" onClick={() => handleSort("Event_Title")}>
                    <div className="flex items-center">
                      Meeting Title
                      {sortField === "Event_Title" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                )}
                {selectedColumns["Start_DateTime"] && (
                  <th className="p-4 cursor-pointer" onClick={() => handleSort("Start_DateTime")}>
                    <div className="flex items-center">
                      Start Time
                      {sortField === "Start_DateTime" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                )}
                {selectedColumns["End_DateTime"] && (
                  <th className="p-4 cursor-pointer" onClick={() => handleSort("End_DateTime")}>
                    <div className="flex items-center">
                      End Time
                      {sortField === "End_DateTime" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                )}
                {selectedColumns["Check_In_Status"] && (
                  <th className="p-4 cursor-pointer" onClick={() => handleSort("Check_In_Status")}>
                    <div className="flex items-center">
                      Status
                      {sortField === "Check_In_Status" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                )}
                {selectedColumns["Created_Time"] && (
                  <th className="p-4 cursor-pointer" onClick={() => handleSort("Created_Time")}>
                    <div className="flex items-center">
                      Created Time
                      {sortField === "Created_Time" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                        </span>
                      )}
                    </div>
                  </th>
                )}
                </tr>
              </thead>
              <tbody>
                {currentMeetings.length > 0 ? (
                  currentMeetings.map((meeting, index) => (
                    <tr
                      key={index}
                      className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => getEachRecordHandler(meeting.id)}
                    >
                      {selectedColumns["Event_Title"] && (
                      <td className="p-4 text-sm font-medium text-gray-700">{meeting.Event_Title}</td>
                      )}
                      {selectedColumns["Start_DateTime"] && (
                      <td className="p-4 text-sm">{formatDateTime(meeting.Start_DateTime)}</td>
                      )}
                      {selectedColumns["End_DateTime"] && (
                      <td className="p-4 text-sm">{formatDateTime(meeting.End_DateTime)}</td>
                      )}
                      {selectedColumns["Check_In_Status"] && (
                      <td className="p-4 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[meeting.Check_In_Status] || "bg-gray-200 text-gray-700"}`}>
                          {meeting.Check_In_Status || 'PLANNED'}
                        </span>
                      </td>
                      )}
                      {selectedColumns["Created_Time"] && (
                      <td className="p-4 text-sm">{moment(meeting.Created_Time).format("DD-MM-YY HH:mm") || "-"}</td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">
                      No meetings available. {searchTerm && 'Try a different search term.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile view */}
          <div className="md:hidden">
            {currentMeetings.length > 0 ? (
              currentMeetings.map((meeting, index) => (
                <div
                  key={index}
                  className="bg-white shadow rounded-lg p-4 mb-4 border-l-4 border-blue-500"
                  onClick={() => viewMeetingDetails(meeting)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-gray-800">{meeting.Event_Title}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[meeting.Check_In_Status] || "bg-gray-200 text-gray-700"}`}>
                      {meeting.Check_In_Status || 'PLANNED'}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <div className="text-xs text-gray-500 flex items-center">
                      <span className="font-medium mr-1">Start:</span> {formatDateTime(meeting.Start_DateTime)}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center">
                      <span className="font-medium mr-1">End:</span> {formatDateTime(meeting.End_DateTime)}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
                No meetings available. {searchTerm && 'Try a different search term.'}
              </div>
            )}
          </div>

          {/* Mobile Pagination Controls - Bottom */}
          {totalMeetings > 0 && (
            <div className="md:hidden flex justify-between items-center mt-4 pt-4 border-t">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1 ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${currentPage === totalPages ? 'bg-gray-100 text-gray-400' : 'bg-blue-100 text-blue-600'}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {/* Desktop Pagination Controls - Bottom */}
          {totalMeetings > 0 && (
            <div className="hidden md:flex sm:flex-row justify-between items-center mt-4 pt-4 border-t">
              <div className="flex items-center mb-2 sm:mb-0">
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
              </div>

              <div className="flex items-center">
                <button
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 mx-1 rounded text-sm ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                >
                  First
                </button>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 mx-1 rounded text-sm ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                >
                  Previous
                </button>
                 {/* Page number buttons */}
                 <div className="hidden sm:flex">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    if (pageNum <= totalPages) {
                      return (
                        <button
                          key={i}
                          onClick={() => paginate(pageNum)}
                          className={`w-8 h-8 mx-1 rounded-full ${currentPage === pageNum ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 mx-1 rounded text-sm ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                >
                  Next
                </button>
                <button
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 mx-1 rounded text-sm ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                >
                  Last
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Meeting Details Modal */}
        {selectedMeeting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:hidden">
            <div className="bg-white rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="text-lg font-bold">Meeting Details</h2>
                <button onClick={closeMeetingDetails} className="text-gray-500">
                  <X size={20} />
                </button>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <span className="block text-xs font-medium text-gray-500">TITLE</span>
                    <span className="block text-sm">{selectedMeeting.Event_Title}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500">STATUS</span>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedMeeting.Check_In_Status] || "bg-gray-200 text-gray-700"}`}>
                      {selectedMeeting.Check_In_Status || 'PLANNED'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500">START TIME</span>
                    <span className="block text-sm">{formatDateTime(selectedMeeting.Start_DateTime)}</span>
                  </div>
                  <div>
                    <span className="block text-xs font-medium text-gray-500">END TIME</span>
                    <span className="block text-sm">{formatDateTime(selectedMeeting.End_DateTime)}</span>
                  </div>
                  {selectedMeeting.Description && (
                    <div>
                      <span className="block text-xs font-medium text-gray-500">DESCRIPTION</span>
                      <span className="block text-sm">{selectedMeeting.Description}</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    closeMeetingDetails();
                    getEachRecordHandler(selectedMeeting.id);
                  }}
                  className="w-full mt-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  View Full Details
                </button>
              </div>
            </div>
          </div>
        )}

        <ColumnManagementModal/>

      </div>
    </>
  );
};


export default MeetingView;