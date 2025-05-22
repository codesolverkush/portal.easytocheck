import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../common/Navbar";
import { useNavigate } from "react-router-dom";
import { Search, ArrowUp, ArrowDown, X, Plus, Calendar } from "lucide-react";
import toast from "react-hot-toast";

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
          <div key={index} className="h-20 bg-gray-200 my-2 rounded w-full"></div>
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
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDateRangeActive, setIsDateRangeActive] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    Subject: "",
    Status: "New",
    Due_Date: "",
    Priority: "Medium"
  });


  const navigate = useNavigate();

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
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/lead/gettaskdetails`);
      if (response.status === 200) {
        const data = response.data.data || [];
        setTask(data);

        // Store the fetched data in Cache Storage
        const newResponse = new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
        // FIXED: Changed "/task" to "/tasks" to maintain consistency
        await cache.put("/tasks", newResponse);
      }
    } catch (error) {
      toast.error("Error fetching tasks!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const hardSync = async () => {
    setLoading(true);
    try {
      // Fetch the latest task details from the API
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/lead/gettaskdetails`);
      if (response.status === 200) {
        const data = response.data.data || [];
        setTask(data);

        // Open Cache Storage and update with new data
        const cache = await caches.open(CACHE_NAME);
        const newResponse = new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
        await cache.put("/tasks", newResponse);
      }
    } catch (error) {
      toast.error("Error fetching tasks!");
    } finally {
      setLoading(false);
    }
  };

  const getEachRecordHandler = (taskId) => {
    navigate('/app/taskprofile', { state: { taskId } });
  };

  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
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
      filteredTasks = filteredTasks.filter(task =>
        (task.Subject && task.Subject.toLowerCase().includes(term)) ||
        (task.Status && task.Status.toLowerCase().includes(term)) ||
        (task.Priority && task.Priority.toLowerCase().includes(term))
      );
    }

    if (isDateRangeActive) {
      filteredTasks = filteredTasks.filter(task => isDateInRange(task.Due_Date));
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
      setNewTask(newTask);
      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/lead/createTask`,
        newTask
      );
      if (response?.status === 200) {
        toast.success("Task Created Successfully!");
      }
    } catch (error) {
      toast.error(error?.response?.data?.error?.data[0]?.message || "Error Creating Contact!");
    }

    setIsCreateModalOpen(false);
    fetchTasks();
    setNewTask({
      Subject: "",
      Status: "New",
      Due_Date: "",
      Priority: "Medium"
    })
  };

  if (loading) {
    return <Shimmer />;
  }

  const filteredTasks = filterTasks();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
           <div className="flex flex-col sm:flex-row w-full justify-between mb-4 md:mb-0 mr-5">
                  <h1 className="text-2xl font-bold text-gray-800 mb-3 sm:mb-0">Task Management</h1>
                  <div className="flex flex-wrap gap-2 sm:gap-4">
                    <button 
                      onClick={hardSync} 
                      className="flex-1 sm:flex-none bg-blue-500 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center hover:bg-blue-600 transition-colors text-sm md:text-base"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 md:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Sync Now
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

        {/* Desktop view */}
        <div className="hidden md:block bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <th className="p-4 cursor-pointer" onClick={() => handleSort("id")}>
                  <div className="flex items-center">
                    TID
                    {sortField === "id" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort("Subject")}>
                  <div className="flex items-center">
                    Subject
                    {sortField === "Subject" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th className="p-4">Status</th>
                <th className="p-4 cursor-pointer" onClick={() => handleSort("Due_Date")}>
                  <div className="flex items-center">
                    Due Date
                    {sortField === "Due_Date" && (
                      <span className="ml-1">
                        {sortDirection === "asc" ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
                      </span>
                    )}
                  </div>
                </th>
                <th className="p-4">Priority</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task, index) => (
                  <tr
                    key={index}
                    className="border-t hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => getEachRecordHandler(task.id)}
                  >
                    <td className="p-4 text-sm">{task.id}</td>
                    <td className="p-4 text-sm font-medium text-gray-700">{task.Subject}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.Status] || "bg-gray-200 text-gray-700"}`}>
                        {task.Status}
                      </span>
                    </td>
                    <td className="p-4 text-sm">{task.Due_Date}</td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.Priority] || "bg-gray-200 text-gray-700"}`}>
                        {task.Priority}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No tasks available. {searchTerm && 'Try a different search term.'} {isDateRangeActive && 'No tasks in the selected date range.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile view */}
        <div className="md:hidden">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task, index) => (
              <div
                key={index}
                className="bg-white shadow rounded-lg p-4 mb-4 border-l-4 border-blue-500"
                onClick={() => viewTaskDetails(task)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium text-gray-800">{task.Subject}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.Status] || "bg-gray-200 text-gray-700"}`}>
                    {task.Status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className="font-medium mr-1">Due Date:</span> {task.Due_Date}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className="font-medium mr-1">Priority:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.Priority] || "bg-gray-200 text-gray-700"}`}>
                      {task.Priority}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
              No tasks available. {searchTerm && 'Try a different search term.'} {isDateRangeActive && 'No tasks in the selected date range.'}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Create New Task</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={newTask.Subject}
                    onChange={(e) => setNewTask({ ...newTask, Subject: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newTask.Status}
                    onChange={(e) => setNewTask({ ...newTask, Status: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="New">New</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.Due_Date}
                    onChange={(e) => setNewTask({ ...newTask, Due_Date: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={newTask.Priority}
                    onChange={(e) => setNewTask({ ...newTask, Priority: e.target.value })}
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
                  <span className="block text-xs font-medium text-gray-500">SUBJECT</span>
                  <span className="block text-sm">{selectedTask.Subject}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500">STATUS</span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColors[selectedTask.Status] || "bg-gray-200 text-gray-700"}`}>
                    {selectedTask.Status}
                  </span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500">DUE DATE</span>
                  <span className="block text-sm">{selectedTask.Due_Date}</span>
                </div>
                <div>
                  <span className="block text-xs font-medium text-gray-500">PRIORITY</span>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${priorityColors[selectedTask.Priority] || "bg-gray-200 text-gray-700"}`}>
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

    </div>
  );
};

export default TaskView;




