import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../common/Navbar";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";
import moment from "moment";

const priorityColors = {
  High: "bg-red-200 text-red-700",
  Highest: "bg-red-300 text-red-800",
  Medium: "bg-yellow-200 text-yellow-700",
  Low: "bg-green-200 text-green-700",
};

const statusColors = {
  Completed: "bg-green-200 text-green-700",
  "In Progress": "bg-blue-200 text-blue-700",
  Pending: "bg-yellow-200 text-yellow-700",
  New: "bg-gray-200 text-gray-700",
};

const Shimmer = () => {
  return (
    <div className="animate-pulse">
      <Navbar />
      <div className="p-4">
        <div className="h-10 bg-gray-200 rounded w-full mb-4"></div>
        {[...Array(5)].map((_, index) => (
          <div
            key={index}
            className="h-20 bg-gray-200 my-2 rounded w-full"
          ></div>
        ))}
      </div>
    </div>
  );
};

const TaskView = () => {
  const [task, setTask] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Date Filter
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDateRangeActive, setIsDateRangeActive] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(10);
  const [isItemsPerPageOpen, setIsItemsPerPageOpen] = useState(false);

  // setting the error
  const [error, setError] = useState(null);

  const [newTask, setNewTask] = useState({
    Subject: "",
    Status: "New",
    Due_Date: "",
    Priority: "Medium",
  });
  // Managed Column variable

  const [showColumnModal, setShowColumnModal] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState({
    Subject: true,
    Status: true,
    Due_Date: true,
    Priority: true,
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
    localStorage.setItem("crm-task-columns", JSON.stringify(selectedColumns));
    setShowColumnModal(false);
  };

  // Add this useEffect to load saved column preferences on component mount
  useEffect(() => {
    const savedColumns = localStorage.getItem("crm-task-columns");
    if (savedColumns) {
      setSelectedColumns(JSON.parse(savedColumns));
    }
  }, []);

  const ColumnManagementModal = () => {
    if (!showColumnModal) return null;

    const columnOptions = [
      { key: "Subject", label: "Subject" },
      { key: "Status", label: "Status" },
      { key: "Due_Date", label: "Due_Date" },
      { key: "Priority", label: "Priority" },
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

  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Open Cache Storage
      const cache = await caches.open(CACHE_NAME);

      // Check if data is present in cache
      const cachedResponse = await cache.match("/tasks");

      if (cachedResponse) {
        const data = await cachedResponse.json();
        setTask(data);
        setLoading(false);

        return;
      }

      // If no cached data, fetch from API
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/get/task`
      );
      if (response.status === 200) {
        const data = response.data.data || [];
        setTask(data);

        // Store the fetched data in Cache Storage
        const newResponse = new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
        await cache.put("/tasks", newResponse);
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.code === "ORG_NOT_AUTHORIZED"
      ) {
        setError({ code: "ORG_NOT_AUTHORIZED" });
        // Optional: You can add a timeout before redirecting to show the error page
        setTimeout(() => {
          navigate("/app/connection");
        }, 3000); // Redirect after 3 seconds
      } else {
        setError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    // Reset to first page when changing items per page
    setCurrentPage(1);
  }, [tasksPerPage]);

  const hardSync = async () => {
    setLoading(true);
    try {
      // Fetch the latest task details from the API
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/get/task`
      );
      if (response.status === 200) {
        const data = response.data.data || [];
        setTask(data);

        // Open Cache Storage and update with new data
        const cache = await caches.open(CACHE_NAME);
        const newResponse = new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
        await cache.put("/tasks", newResponse);
      }
    } catch (error) {
      toast.error("Error fetching task!");
    } finally {
      setLoading(false);
    }
  };

  const getEachRecordHandler = (taskId) => {
    navigate("/app/taskprofile", { state: { taskId } });
  };

  const handleSort = (field) => {
    const newDirection =
      sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Date filter login here...

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

    const taskDate = new Date(dateStr);

    // If only start date is provided
    if (startDate && !endDate) {
      const start = new Date(startDate);
      return taskDate >= start;
    }

    // If only end date is provided
    if (!startDate && endDate) {
      const end = new Date(endDate);
      return taskDate <= end;
    }

    // If both dates are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return taskDate >= start && taskDate <= end;
    }

    return true;
  };

  const filterTasks = () => {
    if (!task?.data) return [];

    let filteredTasks = [...task.data];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredTasks = filteredTasks.filter(
        (task) =>
          (task.Subject && task.Subject.toLowerCase().includes(term)) ||
          (task.Status && task.Status.toLowerCase().includes(term)) ||
          (task.Priority && task.Priority.toLowerCase().includes(term))
      );
    }

    if (isDateRangeActive) {
      filteredTasks = filteredTasks.filter((task) =>
        isDateInRange(task.Due_Date)
      );
    }

    if (sortField) {
      filteredTasks.sort((a, b) => {
        const aValue = a[sortField] || "";
        const bValue = b[sortField] || "";

        if (sortDirection === "asc") {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      });
    }

    return filteredTasks;
  };

  const viewTaskDetails = (task) => {
    setSelectedTask(task);
  };

  const closeTaskDetails = () => {
    setSelectedTask(null);
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/create/createdata/Tasks`,
        newTask
      );
      if (response?.status === 200) {
        toast.success("Task Created Successfully!");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.data[0]?.message || "Error creating task!"
      );
    } finally {
      setIsSubmitting(false);
      setIsCreateModalOpen(false);
      fetchTasks();
      setNewTask({
        Subject: "",
        Status: "New",
        Due_Date: "",
        Priority: "Medium",
      });
    }
  };

  // Pagination calculations
  const filteredTasks = filterTasks();
  const totalTasks = filteredTasks.length;
  const totalPages = Math.ceil(totalTasks / tasksPerPage);
  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleTasksPerPageChange = (value) => {
    setTasksPerPage(Number(value));
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

  if (loading) {
    return <Shimmer />;
  }

  // Add this check for organization authorization
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
          <p className="text-gray-600 mb-6">
            Your organization is not authorized. Please set up a connection to
            continue.
          </p>
          <button
            onClick={() => navigate("/app/connection")}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Connect Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="flex flex-col sm:flex-row w-full justify-between mb-4 md:mb-0 mr-5">
            <h1 className="text-2xl font-bold text-gray-800 mb-3 sm:mb-0">
              Task Management
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
                <span className="hidden sm:inline">Create Task</span>
                <span className="sm:hidden">Create</span>
              </button>
            </div>
          </div>
          <div className="w-full md:w-auto flex flex-col md:flex-row gap-3">
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={16}
              />
            </div>

            <div className="relative w-full md:w-auto">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="w-full md:w-auto px-4 py-2 border rounded-lg flex items-center justify-center bg-white hover:bg-gray-50 transition-colors"
              >
                <Calendar size={16} className="mr-2 text-gray-500" />
                <span className="text-gray-700">Date Filter</span>
                {isDateRangeActive && (
                  <span className="ml-1 h-2 w-2 bg-blue-500 rounded-full"></span>
                )}
              </button>

              {isFilterOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-10 p-4 border">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={handleStartDateChange}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
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
            <span className="text-blue-700 font-medium">
              Date range filter:
            </span>
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
                {tasksPerPage}
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
                  ></path>
                </svg>
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {totalTasks > 0
                ? `${indexOfFirstTask + 1}-${Math.min(
                    indexOfLastTask,
                    totalTasks
                  )} of ${totalTasks}`
                : `0 tasks`}
            </div>
          </div>

          {isItemsPerPageOpen && (
            <div className="absolute left-0 right-0 mt-1 bg-white border rounded-lg shadow-lg z-10">
              {[10, 20, 30, 50, 100].map((value) => (
                <button
                  key={value}
                  onClick={() => handleTasksPerPageChange(value)}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    tasksPerPage === value
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
            <label
              htmlFor="tasksPerPage"
              className="mr-2 text-sm text-gray-600"
            >
              Show:
            </label>
            <select
              id="tasksPerPage"
              value={tasksPerPage}
              onChange={(e) => handleTasksPerPageChange(e.target.value)}
              className="border rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="ml-2 text-sm text-gray-600">tasks per page</span>
          </div>

          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-4">
              {totalTasks > 0
                ? `Showing ${indexOfFirstTask + 1} to ${Math.min(
                    indexOfLastTask,
                    totalTasks
                  )} of ${totalTasks} tasks`
                : `0 tasks found`}
            </span>
            <div className="flex">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-1 mx-1 rounded ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-500 hover:bg-blue-100"
                }`}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`p-1 mx-1 rounded ${
                  currentPage === totalPages || totalPages === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-500 hover:bg-blue-100"
                }`}
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
                {selectedColumns["Subject"] && (
                  <th
                    className="p-4 cursor-pointer"
                    onClick={() => handleSort("Subject")}
                  >
                    <div className="flex items-center">
                      Lead Name
                      {sortField === "Subject" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                )}
                {selectedColumns["Status"] && (
                  <th
                    className="p-4 cursor-pointer"
                    onClick={() => handleSort("Status")}
                  >
                    <div className="flex items-center">
                      Status
                      {sortField === "Staus" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                )}
                {selectedColumns["Due_Date"] && (
                  <th className="p-4">Due Date</th>
                )}
                {selectedColumns["Priority"] && (
                  <th className="p-4">Priority</th>
                )}
                {selectedColumns["Created_Time"] && (
                  <th
                    className="p-4 cursor-pointer"
                    onClick={() => handleSort("Created_Time")}
                  >
                    <div className="flex items-center">
                      Created Time
                      {sortField === "Created_Time" && (
                        <span className="ml-1">
                          {sortDirection === "asc" ? (
                            <ArrowUp size={14} />
                          ) : (
                            <ArrowDown size={14} />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {currentTasks.length > 0 ? (
                currentTasks.map((task, index) => (
                  <tr
                    key={index}
                    className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => getEachRecordHandler(task.id)}
                  >
                    {selectedColumns["Subject"] && (
                      <td className="p-4 text-sm font-medium text-gray-700">
                        {task.Subject || "-"}
                      </td>
                    )}

                    {selectedColumns["Status"] && (
                      <td className="p-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[task.Status] ||
                            "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {task.Status}
                        </span>
                      </td>
                    )}

                    {selectedColumns["Due_Date"] && (
                      <td className="p-4 text-sm">{task.Due_Date}</td>
                    )}

                    {selectedColumns["Priority"] && (
                      <td className="p-4 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            priorityColors[task.Priority] ||
                            "bg-gray-200 text-gray-700"
                          }`}
                        >
                          {task.Priority}
                        </span>
                      </td>
                    )}

                    {selectedColumns["Created_Time"] && (
                      <td className="p-4 text-sm">
                        {moment(task.Created_Time).format("DD-MM-YY HH:mm") ||
                          "-"}
                      </td>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No tasks available.{" "}
                    {searchTerm && "Try a different search term."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          {currentTasks.length > 0 ? (
            currentTasks.map((task, index) => (
              <div
                key={index}
                className="bg-white shadow rounded-lg p-4 mb-4 border-l-4 border-blue-500"
                onClick={() => viewTaskDetails(task)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">{task.Subject}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[task.Status] || "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {task.Status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className="font-medium mr-1">Due Date:</span>{" "}
                    {task.Due_Date}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className="font-medium mr-1">Priority:</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        priorityColors[task.Priority] ||
                        "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {task.Priority}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
              No tasks available. {searchTerm && "Try a different search term."}
            </div>
          )}
        </div>

        {/* Mobile Pagination Controls - Bottom */}
        {totalTasks > 0 && (
          <div className="md:hidden flex justify-between items-center mt-4 pt-4 border-t">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className={`p-2 rounded-lg ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <ChevronLeft size={20} />
            </button>

            <span className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`p-2 rounded-lg ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Desktop Pagination Controls - Bottom */}
        {totalTasks > 0 && (
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
                className={`px-3 py-1 mx-1 rounded text-sm ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                First
              </button>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 mx-1 rounded text-sm ${
                  currentPage === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
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
                        className={`w-8 h-8 mx-1 rounded-full ${
                          currentPage === pageNum
                            ? "bg-blue-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
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
                className={`px-3 py-1 mx-1 rounded text-sm ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                Next
              </button>
              <button
                onClick={() => paginate(totalPages)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 mx-1 rounded text-sm ${
                  currentPage === totalPages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Create New Task</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newTask.Subject}
                    onChange={(e) =>
                      setNewTask({ ...newTask, Subject: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newTask.Status}
                    onChange={(e) =>
                      setNewTask({ ...newTask, Status: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newTask.Due_Date}
                    onChange={(e) =>
                      setNewTask({ ...newTask, Due_Date: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.Priority}
                    onChange={(e) =>
                      setNewTask({ ...newTask, Priority: e.target.value })
                    }
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  disabled={isSubmitting}
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 md:hidden">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Task Details</h2>
              <button onClick={closeTaskDetails} className="text-gray-500">
                <X size={20} />
              </button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <span className="block text-xs font-medium text-gray-500">
                    SUBJECT
                  </span>
                  <span className="block text-sm">{selectedTask.Subject}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500">
                    STATUS
                  </span>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      statusColors[selectedTask.Status] ||
                      "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {selectedTask.Status}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500">
                    DUE DATE
                  </span>
                  <span className="block text-sm">{selectedTask.Due_Date}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500">
                    PRIORITY
                  </span>
                  <span
                    className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                      priorityColors[selectedTask.Priority] ||
                      "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {selectedTask.Priority}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  closeTaskDetails();
                  getEachRecordHandler(selectedTask.id);
                }}
                className="w-full mt-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                View Full Details
              </button>
            </div>
          </div>
        </div>
      )}

      <ColumnManagementModal />
    </div>
  );
};

export default TaskView;
