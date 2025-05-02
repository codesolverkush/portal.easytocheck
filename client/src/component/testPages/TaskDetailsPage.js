import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle, AlertCircle, Plus, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import EnhancedTaskLoading from '../ui/EnhancedTaskLoading';

// Confirmation Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6 shadow-xl">
        <h3 className="text-lg font-medium text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ task, onTaskUpdate }) => {
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  const getPriorityBadge = (priority) => {
    const colors = {
      'High': 'bg-red-100 text-red-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Low': 'bg-green-100 text-green-700',
      'Normal': 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    if (status === 'Completed') {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (status === 'In Progress') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    } else {
      return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };
  
  const getStatusBadge = (status) => {
    const colors = {
      'Completed': 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Pending': 'bg-yellow-100 text-yellow-800',
      'Overdue': 'bg-red-100 text-red-800',
      'New': 'bg-purple-100 text-purple-800'
    };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Invalid date format:', dateString);
      return 'Invalid date';
    }
  };

  // Open the confirmation modal
  const handleMarkAsCompletedClick = () => {
    setShowConfirmation(true);
  };
  
  // Close the confirmation modal
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
  };
  
  // Handle actual task completion after confirmation
  const handleConfirmCompletion = async () => {
    try {
      await onTaskUpdate(task.id, "Completed");
      toast.success("Task marked as completed!");
      setShowConfirmation(false);
    } catch (error) {
      console.error("Error updating task status:", error);
      toast.error("Failed to update task status");
      setShowConfirmation(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className="bg-gray-100 rounded-full p-2">
            {getStatusIcon(task.Status)}
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{task.Subject}</h3>
            <p className="text-sm text-gray-500 mt-1">{task.Description}</p>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center text-xs text-gray-600">
                <Calendar className="w-3.5 h-3.5 mr-1" />
                <span>Due: {formatDate(task.Due_Date)}</span>
              </div>
              {task.Status && (
                <div>{getStatusBadge(task.Status)}</div>
              )}
              {task.Priority && (
                <div>{getPriorityBadge(task.Priority)}</div>
              )}
            </div>
            {task.assigned_to && (
              <div className="mt-2 text-xs text-gray-600">
                Assigned to: {task.assigned_to}
              </div>
            )}
          </div>
        </div>
        {task.Status !== 'Completed' && (
          <button 
            onClick={handleMarkAsCompletedClick}
            className="text-gray-400 hover:text-green-600 transition-colors"
            title="Mark as completed"
          >
            <CheckCircle className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmCompletion}
        title="Complete Task"
        message={`Are you sure you want to mark "${task.Subject}" as completed?`}
      />
    </div>
  );
};

const TaskDetailsPage = ({ leadId, cachedData, setCachedData, dataLoaded }) => {
  const [tasks, setTasks] = useState(cachedData || []);
  const [isLoading, setIsLoading] = useState(!dataLoaded);
  const [filter, setFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    Subject: "",
    Status: "New",
    Due_Date: "",
    Priority: "Medium"
  });

   
  useEffect(() => {
    const fetchTasks = async () => {
      if (cachedData !== undefined) return; // Prevent unnecessary API calls if data is already cached
  
      setIsLoading(true);
      
      try {
        const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/openactivities`,  
         { params: {
          $se_module: "Leads",
          What_Id: leadId,
          Who_Id: null
        }});
        const fetchedTasks = response?.data?.data?.data || [];
  
        if (fetchedTasks.length === 0) {
          setTasks([]); // Store an empty array instead of relying on sample data
          if (setCachedData) setCachedData([]); // Cache empty result to prevent refetch
        } else {
          setTasks(fetchedTasks);
          if (setCachedData) setCachedData(fetchedTasks);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setTasks([]); // If API fails, treat it as no data (to prevent infinite calls)
        if (setCachedData) setCachedData([]);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchTasks();
  }, [leadId, setCachedData, cachedData]);
  
  
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'not-started') return task.Status === 'New';
    if (filter === 'in-progress') return task.Status === 'In Progress';
    if (filter === 'completed') return task.Status === 'Completed';
    if (filter === 'deferred') return task.Status === 'Deferred';
    if (filter === 'waiting') return task.Status === 'Waiting for input';
    return true;
  });

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_APP_API}/related/updateTask`,
        {
          id: taskId,
          Status: newStatus
        }
      );
      
      if (response?.status === 200) {
        // Update the local task list
        const updatedTasks = tasks.map(task => 
          task.id === taskId ? { ...task, Status: newStatus } : task
        );
        setTasks(updatedTasks);
        if (setCachedData) setCachedData(updatedTasks);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {

      const taskPayload = {
        ...newTask,
        $se_module: "Leads",
        Who_Id: null,
        What_Id: leadId
      };  

      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/related/createTask`,
        taskPayload
      );
      if (response?.status === 200) {
        toast.success("Task Created Successfully!");
          const newTaskAdded = {
          id: response?.data?.data?.data[0]?.details.id || Date.now(), // Use response ID or fallback
          Subject: taskPayload.Subject,
          Status: taskPayload?.Status,
          Due_Date: taskPayload?.Due_Date,
          Priority: taskPayload?.Priority
        };

        const updatedTasks = [...tasks, newTaskAdded];
        setTasks(updatedTasks);
        if (setCachedData) setCachedData(updatedTasks);
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast.error(error?.response?.data?.error?.data[0]?.message);
    }
    setIsCreateModalOpen(false);
    setNewTask({
      Subject: "",
      Status: "New",
      Due_Date: "",
      Priority: "Medium"
    });
  };


  // Toggle filter menu
  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  // Apply filter and close menu
  const applyFilter = (filterValue) => {
    setFilter(filterValue);
    setShowFilterMenu(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base sm:text-lg font-medium text-gray-800">
            Total Activities ({filteredTasks.length})
          </h2>
          <div className="flex space-x-3">
            <div className="relative">
              <button 
                className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                onClick={toggleFilterMenu}
              >
                <Filter className="w-4 h-4 mr-2" />
                <span>
                  {filter === 'all' ? 'All' : 
                   filter === 'not-started' ? 'Not Started' : 
                   filter === 'in-progress' ? 'In Progress' : 
                   filter === 'completed' ? 'Completed' : 
                   filter === 'deferred' ? 'Deferred' : 
                   filter === 'waiting' ? 'Waiting for input' : 'Filter'}
                </span>
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applyFilter('all')}
                  >
                    All
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applyFilter('not-started')}
                  >
                    Not Started
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applyFilter('in-progress')}
                  >
                    In Progress
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applyFilter('completed')}
                  >
                    Completed
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applyFilter('deferred')}
                  >
                    Deferred
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applyFilter('waiting')}
                  >
                    Waiting for input
                  </button>
                </div>
              )}
            </div>
            <button onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Add Task</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500 py-8">
             <EnhancedTaskLoading/>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-4">
              {tasks.length === 0 
                ? "No activities found for this lead." 
                : `No ${filter !== 'all' ? filter : ''} activities found.`}
            </p>
            <button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Create New Task
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <TaskCard 
                key={task.id || task._id} 
                task={task} 
                onTaskUpdate={updateTaskStatus}
              />
            ))}
          </div>
        )}
      </div>

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
    </div>
  );
};

export default TaskDetailsPage;

// import React, { useState, useEffect } from 'react';
// import { Calendar, Clock, CheckCircle, AlertCircle, Plus, Filter, X } from 'lucide-react';
// import toast from 'react-hot-toast';
// import axios from 'axios';
// import EnhancedTaskLoading from '../ui/EnhancedTaskLoading';


// const TaskCard = ({ task, onTaskUpdate }) => {
//   console.log(task)
//   const getPriorityBadge = (priority) => {
//     const colors = {
//       'High': 'bg-red-100 text-red-800',
//       'Medium': 'bg-yellow-100 text-yellow-800',
//       'Low': 'bg-green-100 text-green-700',
//       'Normal': 'bg-blue-100 text-blue-800'
//     };
    
//     return (
//       <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority] || 'bg-gray-100 text-gray-800'}`}>
//         {priority}
//       </span>
//     );
//   };

//   const getStatusIcon = (status) => {
//     if (status === 'Completed') {
//       return <CheckCircle className="w-4 h-4 text-green-500" />;
//     } else if (status === 'In Progress') {
//       return <AlertCircle className="w-4 h-4 text-red-500" />;
//     } else {
//       return <Clock className="w-4 h-4 text-blue-500" />;
//     }
//   };
  
//   const getStatusBadge = (status) => {
//     const colors = {
//       'Completed': 'bg-green-100 text-green-800',
//       'In Progress': 'bg-blue-100 text-blue-800',
//       'Pending': 'bg-yellow-100 text-yellow-800',
//       'Overdue': 'bg-red-100 text-red-800',
//       'New': 'bg-purple-100 text-purple-800'
//     };
    
//     return (
//       <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
//         {status}
//       </span>
//     );
//   };

//   const formatDate = (dateString) => {
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric'
//       });
//     } catch (error) {
//       console.error('Invalid date format:', dateString);
//       return 'Invalid date';
//     }
//   };

//   // Handle marking task as completed
//   const handleMarkAsCompleted = async () => {
//     // console.log("TaskID",task.id);
//     try {
//       await onTaskUpdate(task.id, "Completed");
//       toast.success("Task marked as completed!");
//     } catch (error) {
//       console.error("Error updating task status:", error);
//       toast.error("Failed to update task status");
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow">
//       <div className="flex justify-between items-start">
//         <div className="flex items-start space-x-3">
//           <div className="bg-gray-100 rounded-full p-2">
//             {getStatusIcon(task.Status)}
//           </div>
//           <div>
//             <h3 className="font-medium text-gray-900">{task.Subject}</h3>
//             <p className="text-sm text-gray-500 mt-1">{task.Description}</p>
//             <div className="flex items-center mt-2 space-x-4">
//               <div className="flex items-center text-xs text-gray-600">
//                 <Calendar className="w-3.5 h-3.5 mr-1" />
//                 <span>Due: {formatDate(task.Due_Date)}</span>
//               </div>
//               {task.Status && (
//                 <div>{getStatusBadge(task.Status)}</div>
//               )}
//               {task.Priority && (
//                 <div>{getPriorityBadge(task.Priority)}</div>
//               )}
//             </div>
//             {task.assigned_to && (
//               <div className="mt-2 text-xs text-gray-600">
//                 Assigned to: {task.assigned_to}
//               </div>
//             )}
//           </div>
//         </div>
//         {task.Status !== 'Completed' && (
//           <button 
//             onClick={handleMarkAsCompleted}
//             className="text-gray-400 hover:text-green-600 transition-colors"
//             title="Mark as completed"
//           >
//             <CheckCircle className="w-5 h-5" />
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };

// const TaskDetailsPage = ({ leadId, cachedData, setCachedData, dataLoaded }) => {
//   const [tasks, setTasks] = useState(cachedData || []);
//   const [isLoading, setIsLoading] = useState(!dataLoaded);
//   const [filter, setFilter] = useState('all');
//   const [showFilterMenu, setShowFilterMenu] = useState(false);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [newTask, setNewTask] = useState({
//     Subject: "",
//     Status: "New",
//     Due_Date: "",
//     Priority: "Medium"
//   });

   
//   useEffect(() => {
//     const fetchTasks = async () => {
//       if (cachedData !== undefined) return; // Prevent unnecessary API calls if data is already cached
  
//       setIsLoading(true);
      
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/openactivities`,  
//          { params: {
//           $se_module: "Leads",
//           What_Id: leadId,
//           Who_Id: null
//         }});
//         const fetchedTasks = response?.data?.data?.data || [];
  
//         if (fetchedTasks.length === 0) {
//           setTasks([]); // Store an empty array instead of relying on sample data
//           if (setCachedData) setCachedData([]); // Cache empty result to prevent refetch
//         } else {
//           setTasks(fetchedTasks);
//           if (setCachedData) setCachedData(fetchedTasks);
//         }
//       } catch (error) {
//         console.error('Error fetching tasks:', error);
//         setTasks([]); // If API fails, treat it as no data (to prevent infinite calls)
//         if (setCachedData) setCachedData([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };
  
//     fetchTasks();
//   }, [leadId, setCachedData, cachedData]);
  
  
//   const filteredTasks = tasks.filter(task => {
//     if (filter === 'all') return true;
//     if (filter === 'not-started') return task.Status === 'New';
//     if (filter === 'in-progress') return task.Status === 'In Progress';
//     if (filter === 'completed') return task.Status === 'Completed';
//     if (filter === 'deferred') return task.Status === 'Deferred';
//     if (filter === 'waiting') return task.Status === 'Waiting for input';
//     return true;
//   });

//   const updateTaskStatus = async (taskId, newStatus) => {
//     console.log(taskId,newStatus)
//     try {
//       const response = await axios.put(
//         `${process.env.REACT_APP_APP_API}/related/updateTask`,
//         {
//           id: taskId,
//           Status: newStatus
//         }
//       );
      
//       if (response?.status === 200) {
//         // Update the local task list
//         const updatedTasks = tasks.map(task => 
//           task.id === taskId ? { ...task, Status: newStatus } : task
//         );
//         setTasks(updatedTasks);
//         if (setCachedData) setCachedData(updatedTasks);
//         return true;
//       }
//       return false;
//     } catch (error) {
//       console.error('Error updating task:', error);
//       throw error;
//     }
//   };

//   const handleCreateTask = async (e) => {
//     e.preventDefault();
//     try {

//       const taskPayload = {
//         ...newTask,
//         $se_module: "Leads",
//         Who_Id: null,
//         What_Id: leadId
//       };
  

//       const response = await axios.post(
//         `${process.env.REACT_APP_APP_API}/related/createTask`,
//         taskPayload
//       );
//       if (response?.status === 200) {
//         toast.success("Task Created Successfully!");
//           const newTaskAdded = {
//           id: response?.data?.data?.data[0]?.details.id || Date.now(), // Use response ID or fallback
//           Subject: taskPayload.Subject,
//           Status: taskPayload?.Status,
//           Due_Date: taskPayload?.Due_Date,
//           Priority: taskPayload?.Priority
//         };

//         const updatedTasks = [...tasks, newTaskAdded];
//         setTasks(updatedTasks);
//         if (setCachedData) setCachedData(updatedTasks);
//       }
//     } catch (error) {
//       console.error("Error creating task:", error);
//       toast.error(error?.response?.data?.error?.data[0]?.message);
//     }
//     setIsCreateModalOpen(false);
//     setNewTask({
//       Subject: "",
//       Status: "New",
//       Due_Date: "",
//       Priority: "Medium"
//     });
//   };


//   // Toggle filter menu
//   const toggleFilterMenu = () => {
//     setShowFilterMenu(!showFilterMenu);
//   };

//   // Apply filter and close menu
//   const applyFilter = (filterValue) => {
//     setFilter(filterValue);
//     setShowFilterMenu(false);
//   };

//   return (
//     <div className="space-y-4">
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-base sm:text-lg font-medium text-gray-800">
//             Total Activities ({filteredTasks.length})
//           </h2>
//           <div className="flex space-x-3">
//             <div className="relative">
//               <button 
//                 className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50"
//                 onClick={toggleFilterMenu}
//               >
//                 <Filter className="w-4 h-4 mr-2" />
//                 <span>
//                   {filter === 'all' ? 'All' : 
//                    filter === 'not-started' ? 'Not Started' : 
//                    filter === 'in-progress' ? 'In Progress' : 
//                    filter === 'completed' ? 'Completed' : 
//                    filter === 'deferred' ? 'Deferred' : 
//                    filter === 'waiting' ? 'Waiting for input' : 'Filter'}
//                 </span>
//               </button>
//               {showFilterMenu && (
//                 <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//                   <button 
//                     className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                     onClick={() => applyFilter('all')}
//                   >
//                     All
//                   </button>
//                   <button 
//                     className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                     onClick={() => applyFilter('not-started')}
//                   >
//                     Not Started
//                   </button>
//                   <button 
//                     className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                     onClick={() => applyFilter('in-progress')}
//                   >
//                     In Progress
//                   </button>
//                   <button 
//                     className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                     onClick={() => applyFilter('completed')}
//                   >
//                     Completed
//                   </button>
//                   <button 
//                     className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                     onClick={() => applyFilter('deferred')}
//                   >
//                     Deferred
//                   </button>
//                   <button 
//                     className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                     onClick={() => applyFilter('waiting')}
//                   >
//                     Waiting for input
//                   </button>
//                 </div>
//               )}
//             </div>
//             <button onClick={() => setIsCreateModalOpen(true)}
//             className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
//             >
//               <Plus className="w-4 h-4 mr-2" />
//               <span>Add Task</span>
//             </button>
//           </div>
//         </div>

//         {isLoading ? (
//           <div className="text-center text-gray-500 py-8">
//              <EnhancedTaskLoading/>
//           </div>
//         ) : filteredTasks.length === 0 ? (
//           <div className="text-center text-gray-500 py-8">
//             <p className="mb-4">
//               {tasks.length === 0 
//                 ? "No activities found for this lead." 
//                 : `No ${filter !== 'all' ? filter : ''} activities found.`}
//             </p>
//             <button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
//               Create New Task
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredTasks.map((task) => (
//               <TaskCard 
//                 key={task.id || task._id} 
//                 task={task} 
//                 onTaskUpdate={updateTaskStatus}
//               />
//             ))}
//           </div>
//         )}
//       </div>

//       {isCreateModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg w-full max-w-md">
//             <div className="flex justify-between items-center p-4 border-b">
//               <h2 className="text-lg font-bold">Create New Task</h2>
//               <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500">
//                 <X size={20} />
//               </button>
//             </div>
//             <form onSubmit={handleCreateTask} className="p-4">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
//                   <input
//                     type="text"
//                     value={newTask.Subject}
//                     onChange={(e) => setNewTask({ ...newTask, Subject: e.target.value })}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                   <select
//                     value={newTask.Status}
//                     onChange={(e) => setNewTask({ ...newTask, Status: e.target.value })}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="New">New</option>
//                     <option value="In Progress">In Progress</option>
//                     <option value="Completed">Completed</option>
//                     <option value="Pending">Pending</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
//                   <input
//                     type="date"
//                     value={newTask.Due_Date}
//                     onChange={(e) => setNewTask({ ...newTask, Due_Date: e.target.value })}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
//                   <select
//                     value={newTask.Priority}
//                     onChange={(e) => setNewTask({ ...newTask, Priority: e.target.value })}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="Low">Low</option>
//                     <option value="Medium">Medium</option>
//                     <option value="High">High</option>
//                     <option value="Highest">Highest</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                   <textarea
//                     value={newTask.Description}
//                     onChange={(e) => setNewTask({ ...newTask, Description: e.target.value })}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
//                     placeholder="Enter task description..."
//                   />
//                 </div>
//               </div>
//               <div className="mt-6 flex justify-end space-x-3">
//                 <button
//                   type="button"
//                   onClick={() => setIsCreateModalOpen(false)}
//                   className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                 >
//                   Create Task
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default TaskDetailsPage;


// import React, { useState, useEffect } from 'react';
// import { Calendar, Clock, CheckCircle, AlertCircle, MoreHorizontal, Plus, Filter, X } from 'lucide-react';
// import toast from 'react-hot-toast';
// import axios from 'axios';
// import EnhancedTaskLoading from '../ui/EnhancedTaskLoading';


// const TaskCard = ({ task }) => {
//   const getPriorityBadge = (priority) => {
//     const colors = {
//       'High': 'bg-red-100 text-red-800',
//       'Medium': 'bg-yellow-100 text-yellow-800',
//       'Low': 'bg-green-100 text-green-700',
//       'Normal': 'bg-blue-100 text-blue-800'
//     };
    
//     return (
//       <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority] || 'bg-gray-100 text-gray-800'}`}>
//         {priority}
//       </span>
//     );
//   };

//   const getStatusIcon = (status) => {
//     if (status === 'Completed') {
//       return <CheckCircle className="w-4 h-4 text-green-500" />;
//     } else if (status === 'In Progress') {
//       return <AlertCircle className="w-4 h-4 text-red-500" />;
//     } else {
//       return <Clock className="w-4 h-4 text-blue-500" />;
//     }
//   };
  
//   const getStatusBadge = (status) => {
//     const colors = {
//       'Completed': 'bg-green-100 text-green-800',
//       'In Progress': 'bg-blue-100 text-blue-800',
//       'Pending': 'bg-yellow-100 text-yellow-800',
//       'Overdue': 'bg-red-100 text-red-800',
//       'New': 'bg-purple-100 text-purple-800'
//     };
    
//     return (
//       <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
//         {status}
//       </span>
//     );
//   };

//   const formatDate = (dateString) => {
//     try {
//       return new Date(dateString).toLocaleDateString('en-US', {
//         month: 'short',
//         day: 'numeric',
//         year: 'numeric'
//       });
//     } catch (error) {
//       console.error('Invalid date format:', dateString);
//       return 'Invalid date';
//     }
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow">
//       <div className="flex justify-between items-start">
//         <div className="flex items-start space-x-3">
//           <div className="bg-gray-100 rounded-full p-2">
//             {getStatusIcon(task.Status)}
//           </div>
//           <div>
//             <h3 className="font-medium text-gray-900">{task.Subject}</h3>
//             <p className="text-sm text-gray-500 mt-1">{task.Description}</p>
//             <div className="flex items-center mt-2 space-x-4">
//               <div className="flex items-center text-xs text-gray-600">
//                 <Calendar className="w-3.5 h-3.5 mr-1" />
//                 <span>Due: {formatDate(task.Due_Date)}</span>
//               </div>
//               {task.Status && (
//                 <div>{getStatusBadge(task.Status)}</div>
//               )}
//               {task.Priority && (
//                 <div>{getPriorityBadge(task.Priority)}</div>
//               )}
//             </div>
//             {task.assigned_to && (
//               <div className="mt-2 text-xs text-gray-600">
//                 Assigned to: {task.assigned_to}
//               </div>
//             )}
//           </div>
//         </div>
//         <button className="text-gray-400 hover:text-gray-600">
//           <MoreHorizontal className="w-5 h-5" />
//         </button>
//       </div>
//     </div>
//   );
// };

// const TaskDetailsPage = ({ leadId, cachedData, setCachedData, dataLoaded }) => {
//   const [tasks, setTasks] = useState(cachedData || []);
//   const [isLoading, setIsLoading] = useState(!dataLoaded);
//   const [filter, setFilter] = useState('all');
//   const [showFilterMenu, setShowFilterMenu] = useState(false);
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [newTask, setNewTask] = useState({
//     Subject: "",
//     Status: "New",
//     Due_Date: "",
//     Priority: "Medium"
//   });

   
//   useEffect(() => {
//     const fetchTasks = async () => {
//       if (cachedData !== undefined) return; // Prevent unnecessary API calls if data is already cached
  
//       setIsLoading(true);
      
//       try {
//         const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/openactivities`,  
//          { params: {
//           $se_module: "Leads",
//           What_Id: leadId,
//           Who_Id: null
//         }});
//         const fetchedTasks = response?.data?.data?.data || [];
  
//         if (fetchedTasks.length === 0) {
//           setTasks([]); // Store an empty array instead of relying on sample data
//           if (setCachedData) setCachedData([]); // Cache empty result to prevent refetch
//         } else {
//           setTasks(fetchedTasks);
//           if (setCachedData) setCachedData(fetchedTasks);
//         }
//       } catch (error) {
//         console.error('Error fetching tasks:', error);
//         setTasks([]); // If API fails, treat it as no data (to prevent infinite calls)
//         if (setCachedData) setCachedData([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };
  
//     fetchTasks();
//   }, [leadId, setCachedData, cachedData]);
  
  
//   const filteredTasks = tasks.filter(task => {
//     if (filter === 'all') return true;
//     if (filter === 'not-started') return task.Status === 'New';
//     if (filter === 'in-progress') return task.Status === 'In Progress';
//     if (filter === 'completed') return task.Status === 'Completed';
//     if (filter === 'deferred') return task.Status === 'Deferred';
//     if (filter === 'waiting') return task.Status === 'Waiting for input';
//     return true;
//   });


//   const handleCreateTask = async (e) => {
//     e.preventDefault();
//     try {

//       const taskPayload = {
//         ...newTask,
//         $se_module: "Leads",
//         Who_Id: null,
//         What_Id: leadId
//       };
  

//       const response = await axios.post(
//         `${process.env.REACT_APP_APP_API}/related/createTask`,
//         taskPayload
//       );
//       if (response?.status === 200) {
//         toast.success("Task Created Successfully!");
//           const newTaskAdded = {
//           id: response?.data?.data?.data[0]?.details.id || Date.now(), // Use response ID or fallback
//           Subject: taskPayload.Subject,
//           Status: taskPayload?.Status,
//           Due_Date: taskPayload?.Due_Date,
//           Priority: taskPayload?.Priority
//         };

//         const updatedTasks = [...tasks, newTaskAdded];
//         setTasks(updatedTasks);
//         if (setCachedData) setCachedData(updatedTasks);
//       }
//     } catch (error) {
//       console.error("Error creating task:", error);
//       toast.error(error?.response?.data?.error?.data[0]?.message);
//     }
//     setIsCreateModalOpen(false);
//     setNewTask({
//       Subject: "",
//       Status: "New",
//       Due_Date: "",
//       Priority: "Medium"
//     });
//   };


//   // Toggle filter menu
//   const toggleFilterMenu = () => {
//     setShowFilterMenu(!showFilterMenu);
//   };

//   // Apply filter and close menu
//   const applyFilter = (filterValue) => {
//     setFilter(filterValue);
//     setShowFilterMenu(false);
//   };

//   return (
//     <div className="space-y-4">
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-base sm:text-lg font-medium text-gray-800">
//             Total Activities ({filteredTasks.length})
//           </h2>
//           <div className="flex space-x-3">
//             <div className="relative">
//               <button 
//                 className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50"
//                 onClick={toggleFilterMenu}
//               >
//                 <Filter className="w-4 h-4 mr-2" />
//                 <span>
//                   {filter === 'all' ? 'All' : 
//                    filter === 'not-started' ? 'Not Started' : 
//                    filter === 'in-progress' ? 'In Progress' : 
//                    filter === 'completed' ? 'Completed' : 
//                    filter === 'deferred' ? 'Deferred' : 
//                    filter === 'waiting' ? 'Waiting for input' : 'Filter'}
//                 </span>
//               </button>
//               {showFilterMenu && (
//                 <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
//                   <button 
//                     className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                     onClick={() => applyFilter('all')}
//                   >
//                     All
//                   </button>
//                   <button 
//                     className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                     onClick={() => applyFilter('not-started')}
//                   >
//                     Not Started
//                   </button>
//                   <button 
//                     className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                     onClick={() => applyFilter('in-progress')}
//                   >
//                     In Progress
//                   </button>
//                   <button 
//                     className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                     onClick={() => applyFilter('completed')}
//                   >
//                     Completed
//                   </button>
//                   <button 
//                     className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                     onClick={() => applyFilter('deferred')}
//                   >
//                     Deferred
//                   </button>
//                   <button 
//                     className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
//                     onClick={() => applyFilter('waiting')}
//                   >
//                     Waiting for input
//                   </button>
//                 </div>
//               )}
//             </div>
//             <button onClick={() => setIsCreateModalOpen(true)}
//             className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
//             >
//               <Plus className="w-4 h-4 mr-2" />
//               <span>Add Task</span>
//             </button>
//           </div>
//         </div>

//         {isLoading ? (
//           <div className="text-center text-gray-500 py-8">
//              <EnhancedTaskLoading/>
//           </div>
//         ) : filteredTasks.length === 0 ? (
//           <div className="text-center text-gray-500 py-8">
//             <p className="mb-4">
//               {tasks.length === 0 
//                 ? "No activities found for this lead." 
//                 : `No ${filter !== 'all' ? filter : ''} activities found.`}
//             </p>
//             <button onClick={() => setIsCreateModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
//               Create New Task
//             </button>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             {filteredTasks.map((task) => (
//               <TaskCard key={task.id || task._id} task={task} />
//             ))}
//           </div>
//         )}
//       </div>

//       {isCreateModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg w-full max-w-md">
//             <div className="flex justify-between items-center p-4 border-b">
//               <h2 className="text-lg font-bold">Create New Task</h2>
//               <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500">
//                 <X size={20} />
//               </button>
//             </div>
//             <form onSubmit={handleCreateTask} className="p-4">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
//                   <input
//                     type="text"
//                     value={newTask.Subject}
//                     onChange={(e) => setNewTask({ ...newTask, Subject: e.target.value })}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
//                   <select
//                     value={newTask.Status}
//                     onChange={(e) => setNewTask({ ...newTask, Status: e.target.value })}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="New">New</option>
//                     <option value="In Progress">In Progress</option>
//                     <option value="Completed">Completed</option>
//                     <option value="Pending">Pending</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
//                   <input
//                     type="date"
//                     value={newTask.Due_Date}
//                     onChange={(e) => setNewTask({ ...newTask, Due_Date: e.target.value })}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
//                   <select
//                     value={newTask.Priority}
//                     onChange={(e) => setNewTask({ ...newTask, Priority: e.target.value })}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="Low">Low</option>
//                     <option value="Medium">Medium</option>
//                     <option value="High">High</option>
//                     <option value="Highest">Highest</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                   <textarea
//                     value={newTask.Description}
//                     onChange={(e) => setNewTask({ ...newTask, Description: e.target.value })}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
//                     placeholder="Enter task description..."
//                   />
//                 </div>
//               </div>
//               <div className="mt-6 flex justify-end space-x-3">
//                 <button
//                   type="button"
//                   onClick={() => setIsCreateModalOpen(false)}
//                   className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                 >
//                   Create Task
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default TaskDetailsPage;