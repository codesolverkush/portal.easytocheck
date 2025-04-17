import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, CheckCircle, ArrowLeft, Search, ArrowUp, ArrowDown, Plus, X } from 'lucide-react';
import axios from 'axios';
import Navbar from '../../common/Navbar';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
      <div className="h-48 bg-gray-200 rounded w-full mb-4"></div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-200 rounded w-full"></div>
        ))}
      </div>
    </div>
  );
};

const TaskDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialTaskId = location?.state?.taskId;

  const [selectedTaskId, setSelectedTaskId] = useState(initialTaskId);
  const [taskList, setTaskList] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    Subject: "",
    Status: "New",
    Due_Date: "",
    Priority: "Medium"
  });

  // Update task variables
  
const [isEditModalOpen, setIsEditModalOpen] = useState(false);
const [editingTask, setEditingTask] = useState({
  Subject: "",
  Status: "",
  Due_Date: "",
  Priority: "",
  Description: ""
});

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    if (selectedTaskId) {
      fetchTaskDetails(selectedTaskId);
      setIsMobileSidebarOpen(false);
    }
  }, [selectedTaskId]);

  const fetchTasks = async () => {
    try {

      const CACHE_NAME = "crm-cache";
      const cache = await caches.open(CACHE_NAME);

      // Check if data is present in cache
      const cachedResponse = await cache.match("/tasks-free");
      if (cachedResponse) {
        const data = await cachedResponse.json();
        setTaskList(data);
        setLoading(false);
      
        return;
      }

      const response = await axios.get(`${process.env.REACT_APP_APP_API}/get/task`);
      if (response.status === 200) {
        setTaskList(response.data?.data || []);
        const newResponse = new Response(JSON.stringify(response.data?.data), { headers: { "Content-Type": "application/json" } });
        await cache.put("/tasks-free", newResponse);
      }
    } catch (error) {
     toast.error("Something went wrong!");
    }
  };

  const fetchTaskDetails = async (taskId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/gets/getbyid/Tasks/${taskId}`);
      setSelectedTask(response?.data?.data);
    } catch (error) {
      toast.error("Error fetching task details");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/create/createdata/Tasks`,
        newTask
      );
      if (response?.status === 200) {
        toast.success("Task Created Successfully!");
        fetchTasks();
      }
    } catch (error) {
      toast.error(error?.response?.data?.error?.data[0]?.message || "Error creating task!");
    }
    setIsCreateModalOpen(false);
    setNewTask({
      Subject: "",
      Status: "New",
      Due_Date: "",
      Priority: "Medium"
    });
  };

  const handleSort = (field) => {
    const newDirection = sortField === field && sortDirection === "asc" ? "desc" : "asc";
    setSortField(field);
    setSortDirection(newDirection);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

// Update task functionality is started

// Add this function to handle opening the edit modal
const handleEditClick = () => {
  if (selectedTask?.data && selectedTask.data.length > 0) {
    const task = selectedTask.data[0];
    setEditingTask({
      id: task.id,
      Subject: task.Subject,
      Status: task.Status,
      Due_Date: task.Due_Date ? task.Due_Date.split('T')[0] : "",
      Priority: task.Priority,
      Description: task.Description || ""
    });
    setIsEditModalOpen(true);
  }
};

// Add this function to handle the edit form submission
const handleEditTask = async (e) => {
  e.preventDefault();
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_APP_API}/update/updatemoduledata/Tasks`,
      editingTask
    );
    if (response?.status === 200) {
      toast.success("Task Updated Successfully!");
      fetchTasks();
      fetchTaskDetails(editingTask.id);
    }
  } catch (error) {
    toast.error(error?.response?.data?.message || "Error updating task");
  }
  setIsEditModalOpen(false);
};

// Update task functionality is ended

return (
  <div className="min-h-screen bg-gray-50">
    <Navbar />

    <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
      {/* Desktop Task List */}
      <div className="hidden lg:flex lg:w-1/3 xl:w-1/4 flex-col border-r border-gray-200 bg-white">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Tasks</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center text-sm hover:bg-blue-600"
            >
              <Plus size={16} className="mr-1" />
              New Task
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>
        <div className="overflow-y-auto flex-1">
          {taskList?.data?.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedTaskId === task.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-800">{task.Subject}</h3>
                <span className="text-xs text-gray-500">
                  {new Date(task.Due_Date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.Status]}`}>
                  {task.Status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.Priority]}`}>
                  {task.Priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        {loading ? (
          <div className="p-8">
            <Shimmer />
          </div>
        ) : selectedTask?.data ? (
          <div className="p-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow-lg">
                <div className="border-b p-6">
                  <div className="flex justify-between items-center">
                    <Link
                      to="#"
                      className="text-blue-600 hover:text-blue-800 text-xl"
                      onClick={(e) => e.preventDefault()}
                    >
                      {selectedTask.data[0].What_Id !== null ? selectedTask.data[0].What_Id.name : "Not Associated"}
                    </Link>
                    <h1 className="text-2xl font-bold text-gray-800">
                      {selectedTask.data[0].Subject}
                    </h1>
                    <div className="flex gap-2">
                      <button
                        onClick={handleEditClick}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => setIsMobileSidebarOpen(true)}
                        className="lg:hidden px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                      >
                        <ArrowLeft size={20} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex gap-4 flex-wrap">
                    <span className={`px-3 py-1 rounded-full text-sm ${statusColors[selectedTask.data[0].Status]}`}>
                      Status: {selectedTask.data[0].Status}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm ${priorityColors[selectedTask.data[0].Priority]}`}>
                      Priority: {selectedTask.data[0].Priority}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Due Date</p>
                          <p>{formatDate(selectedTask.data[0].Due_Date)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Created</p>
                          <p>{formatDate(selectedTask.data[0].Created_Time)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <User className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Owner</p>
                          <p>{selectedTask.data[0].Owner?.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Email</p>
                          <p className="text-blue-600">{selectedTask.data[0].Owner?.email}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedTask.data[0].Description && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                      <p className="text-gray-600">{selectedTask.data[0].Description}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Select a task to view details
          </div>
        )}
      </div>
    </div>

    {/* Mobile Sliding Sidebar */}
    <div
      className={`lg:hidden fixed inset-y-0 left-0 z-50 w-full sm:w-80 bg-white transform transition-transform duration-300 ease-in-out ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Tasks</h2>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center text-sm hover:bg-blue-600"
            >
              <Plus size={16} className="mr-1" />
              New Task
            </button>
          </div>
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        <div className="overflow-y-auto flex-1">
          {taskList?.data?.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTaskId(task.id)}
              className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedTaskId === task.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-800">{task.Subject}</h3>
                <span className="text-xs text-gray-500">
                  {new Date(task.Due_Date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.Status]}`}>
                  {task.Status}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[task.Priority]}`}>
                  {task.Priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Overlay for mobile sidebar */}
    {isMobileSidebarOpen && (
      <div
        className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => setIsMobileSidebarOpen(false)}
      />
    )}

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
                  <option value="Pending">Pending</option>
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
                  <option value="Highest">Highest</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.Description}
                  onChange={(e) => setNewTask({ ...newTask, Description: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Enter task description..."
                />
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
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Edit Task Modal */}
    {isEditModalOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md">
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-bold">Edit Task</h2>
            <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleEditTask} className="p-4">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <input
                  type="text"
                  value={editingTask.Subject}
                  onChange={(e) => setEditingTask({ ...editingTask, Subject: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingTask.Status}
                  onChange={(e) => setEditingTask({ ...editingTask, Status: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="New">New</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={editingTask.Due_Date}
                  onChange={(e) => setEditingTask({ ...editingTask, Due_Date: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={editingTask.Priority}
                  onChange={(e) => setEditingTask({ ...editingTask, Priority: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Highest">Highest</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingTask.Description}
                  onChange={(e) => setEditingTask({ ...editingTask, Description: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Enter task description..."
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Update Task
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </div>
);
};

export default TaskDetails;
