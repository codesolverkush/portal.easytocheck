import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Paperclip, Edit, Send, MoreHorizontal, Phone, Mail, Clock, Calendar, Globe, MapPin, User, Briefcase, Tag, Bell, Menu, X, Clipboard, Save, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

import Navbar from '../common/Navbar';

import toast from 'react-hot-toast';
import TaskDetailsPage from './TaskDetailsPage';
import ShowAttachment from './ShowAttachment';
import AttachFilePage from './AttachFilePage';
import NotesUi from '../ui/NotesUi';
import ShimmerPage from '../ui/ContactFormShimmer';
import DetailsShimmer from '../ui/DetailsShimmer';

const statusColors = {
  Contacted: "bg-green-200 text-green-700",
  "Contact in Future": "bg-purple-200 text-purple-700",
  "Fresh Lead": "bg-blue-200 text-blue-700",
  New: "bg-gray-200 text-gray-700",
  "Junk Lead": "bg-red-200 text-red-700",
  "Not Qualified": "bg-orange-200 text-orange-700"
};

const CACHE_NAME = "crm-cache";

// Utility function to safely render values that might be objects
const safeRenderValue = (value) => {
  if (value === null || value === undefined) return "—";
  if (typeof value === 'object') {
    // If it's an object that might have name/id/email properties
    if (value.name) return value.name;
    // Convert objects to JSON string for display
    return JSON.stringify(value);
  }
  // Return the value directly if it's already a string or number
  return value;
};

// Helper function to determine input type based on field data type
const getInputType = (field) => {
  switch (field.data_type) {
    case 'email':
      return 'email';
    case 'phone':
      return 'tel';
    case 'date':
      return 'date';
    case 'url':
      return 'url';
    case 'number':
    case 'integer':
    case 'decimal':
      return 'number';
    default:
      return 'text';
  }
};


const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};

const NotesCard = ({ note }) => {
  // Convert timestamp to a more readable format


  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          {note.Note_Title && (
            <h3 className="text-sm font-semibold text-gray-800 mb-1">
              {note.Note_Title}
            </h3>
          )}
          <p className="text-xs text-gray-500">
            {formatDate(note.Created_Time)}
          </p>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <Clipboard className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-gray-700">
        {note.Note_Content}
      </p>
    </div>
  );
};

const AddNoteModal = ({ isOpen, onClose, leadId, username, onNoteAdded }) => {

  const [noteContent, setNoteContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const noteTitle = `Added by ${username}`;
      const response = await axios.post(`${process.env.REACT_APP_APP_API}/related/createnote/Leads/${leadId}`, {
        Note_Title: noteTitle,
        Note_Content: noteContent
      });

      // Adding the note to the list currently

      if (response?.status === 200) {
        const newNote = {
          id: response?.data?.data?.data[0]?.details.id || Date.now().toString(),
          Created_Time: new Date().toISOString(),
          Note_Title: noteTitle,
          Note_Content: noteContent
        }
       

        onNoteAdded(newNote);
      }

      // Reset form and close modal
      setNoteContent('');
      onClose();
    } catch (error) {
      console.error('Error adding note:', error);
      // Optionally show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Add a Note</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Note Title
            </label>
            <input
              id="noteTitle"
              type="text"
              value={`Added by ${username}`}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700 mb-1">
              Note Content
            </label>
            <textarea
              id="noteContent"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter note details"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


const AddReasonModal = ({ isOpen, onClose, leadId, username, leadStatus, buttonName, onLeadStatusUpdated }) => {
  const [noteContent, setNoteContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const noteTitle = `Added by ${username}`;
      const response = await axios.post(`${process.env.REACT_APP_APP_API}/related/createnote/${leadId}`, {
        Note_Title: noteTitle,
        Note_Content: noteContent
      });

      // If note was created successfully, update the lead status
      if (response?.status === 200) {
        try {
          const updateResponse = await axios.put(`${process.env.REACT_APP_APP_API}/lead/updatelead`, {
            id: leadId, // Added missing Lead_ID parameter
            Lead_Status: buttonName
          });

          if (updateResponse.data.success) {
            toast.success('Lead Status changed Successfully!');
            onLeadStatusUpdated(buttonName);
          } else {
            toast.error('Failed to update lead. Please try again.');
          }
        } catch (error) {
          console.error('Error updating lead:', error);
          toast.error(error?.response?.data?.error?.data[0]?.message || "Something went wrong");
        }
      }

      // Reset form and close modal
      setNoteContent('');
      onClose();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <div className="flex items-center flex-grow">
            <div className="text-lg font-semibold text-gray-700 px-3 py-2 bg-gray-100 rounded-md">
              {leadStatus}
            </div>

            <ArrowRight className="mx-4 text-blue-500" size={24} />

            <div className="text-lg font-semibold text-white px-3 py-2 bg-blue-600 rounded-md">
              {buttonName}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700 mb-1">
              Note Title
            </label>
            <input
              id="noteTitle"
              type="text"
              value={`Added by ${username}`}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700 mb-1">
              Reason:
            </label>
            <textarea
              id="noteContent"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Enter note details"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? 'Adding...' : 'Add Note'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LeadInformationPage = ({ data, leadId, username, accessScore }) => {
  const lead = data?.data[0]; // Take the first lead from the array

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(true); // State to control details visibility


  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState([]);

  const [tasks, setTasks] = useState([]);

  // Edit variable
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState({});
  const [isSaving, setIsSaving] = useState(false);


  const navigate = useNavigate();

  // Lead Status changed
  const [currentLeadStatus, setCurrentLeadStatus] = useState(lead?.Lead_Status || "");

  const sidebarRef = useRef(null);

  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isAddReasonModalOpen,setIsAddReasonModalOpen] = useState(false);

  // const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);

  const [showAttachmentsPage, setShowAttachmentsPage] = useState(true);
  const [showAddAttachment, setShowAddAttachment] = useState(false);


  // Button name variable

  const [selectedButton, setSelectedButton] = useState("");


  const [dataLoaded, setDataLoaded] = useState({
    notes: false,
    attachments: false,
    tasks: false
  });

  const [attachments, setAttachments] = useState([]);




  useEffect(() => {
    fetchCRMFields();
  }, []);

  // Initialize editedLead with lead data when component mounts or lead data changes
  useEffect(() => {
    if (lead && fields.length > 0) {
      // Create an object with all form fields initialized from lead data
      const initialEditedLead = fields.reduce((acc, field) => {
        // Use the API name to get the value from the lead object
        const fieldValue = lead[field.api_name] !== undefined ? lead[field.api_name] : '';
        acc[field.api_name] = fieldValue;
        return acc;
      }, {});

      setEditedLead(initialEditedLead);

      // Set current lead status from lead data if available
      if (lead.Lead_Status) {
        setCurrentLeadStatus(lead.Lead_Status);
      }
    }
  }, [lead, fields]);


  async function fetchCRMFields() {
    try {
      setLoading(true);

      // Try to get data from cache first
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match("/lead-form-fields");

      if (cachedResponse) {
        const data = await cachedResponse.json();
        processFieldData(data);
        return;
      }

      // If no cached data, fetch from API
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/lead/getLead`
      );

      const fieldData = response?.data?.data?.fields || [];

      // Store the fetched data in Cache Storage
      const newResponse = new Response(JSON.stringify(fieldData),
        { headers: { "Content-Type": "application/json" } });
      await cache.put("/lead-form-fields", newResponse);

      processFieldData(fieldData);
    } catch (error) {
      console.error("Error fetching CRM fields:", error);
      toast.error(error?.response?.data?.message || "Failed to load form fields!");
    } finally {
      setLoading(false);
    }
  }

  function processFieldData(fieldData) {
    // Filter fields based on view_type.create
    const filteredFields = fieldData.filter(
      (field) => field.view_type?.create !== false || ["Created_By", "Created_Time", "Modified_Time", "Modified_By"].includes(field.api_name)
    );

    // add created time and by field in end 

    


    setFields(filteredFields);

    // Initialize formData with default values
    setFormData(
      filteredFields.reduce((acc,field) => {
        acc[field.api_name] = field.data_type === "boolean" ? false : "";
        return acc;
      }, {})
    );
   }

  // Function to handle input changes when editing
  const handleInputChange = (field, value) => {
    setEditedLead(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If canceling edit, reset to original values
      if (lead && fields.length > 0) {
        const resetEditedLead = fields.reduce((acc, field) => {
          const fieldValue = lead[field.api_name] !== undefined ? lead[field.api_name] : '';
          acc[field.api_name] = fieldValue;
          return acc;
        }, {});

        setEditedLead(resetEditedLead);
      }
    }
    setIsEditing(!isEditing);
  };



  // Function to save edited lead data
  const saveLead = async () => {
    setIsSaving(true);
    try {
      const response = await axios.put(`${process.env.REACT_APP_APP_API}/lead/updatelead`, {
        id: leadId,
        ...editedLead
      });

      if (response.data.success) {
        // Update the local lead data with the edited values
        const updatedLead = { ...lead, ...editedLead };
        data.data[0] = updatedLead;

        // Update the current lead status if it was changed
        if (editedLead.Lead_Status) {
          setCurrentLeadStatus(editedLead.Lead_Status);
        }

        // Exit edit mode
        setIsEditing(false);

        toast.success('Lead updated successfully!');
      } else {
        toast.error('Failed to update lead. Please try again.');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      toast.error(error?.response?.data?.error?.data[0]?.message || "Something went wrong");
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle details visibility
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // Function to handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const fieldValue = type === "checkbox" ? checked : value;

    // Update formData for non-edit mode
    setFormData(prevData => ({
      ...prevData,
      [name]: fieldValue
    }));

    // Also update editedLead for edit mode
    setEditedLead(prev => ({
      ...prev,
      [name]: fieldValue
    }));
  };

  // Function to render form field based on its type
  const renderFormField = (fieldKey, field) => {
    // Find the field definition
    const fieldDef = fields.find(f => f.api_name === fieldKey);

    if (!fieldDef) return null;

    // Get the value from editedLead or fall back to lead data
    const rawFieldValue = editedLead[fieldKey] !== undefined ? editedLead[fieldKey] : (lead?.[fieldKey] || '');

    // Handle case where the value is an object
    let fieldValue = rawFieldValue;
    if (typeof rawFieldValue === 'object' && rawFieldValue !== null) {
      // If it's an object with a 'name' property (common in CRMs), use that
      if (rawFieldValue.name) {
        fieldValue = rawFieldValue.name;
      } else if (rawFieldValue.id) {
        // Or if it has an ID, use a reasonable string representation
        fieldValue = `${rawFieldValue.id}`;
      } else {
        // Last resort: stringify but clean it up
        fieldValue = JSON.stringify(rawFieldValue);
      }
    }

    // Enhanced field rendering based on data_type
    if (fieldDef.data_type === "picklist" && fieldDef.pick_list_values && fieldDef.pick_list_values.length > 0) {
      // Use the correct options list based on field key
      let options = [];
      // if (fieldKey === 'Lead_Status') {
      //   options = leadStatusOptions;
      // } else if (fieldKey === 'Lead_Source') {
      //   options = leadSourceOptions;
      // } else if (fieldDef.pick_list_values) {
      //   // Use the pick_list_values from the field definition if available
      //   options = fieldDef.pick_list_values.map(option => 
      //     option.display_value || option.actual_value || option
      //   );
      // }
      if (fieldDef.pick_list_values) {
        // Use the pick_list_values from the field definition if available
        options = fieldDef.pick_list_values.map(option =>
          option.display_value || option.actual_value || option
        );
      }



      return (
        <select
          name={fieldKey}
          value={fieldValue || ''}
          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
          className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select {fieldDef.display_label || fieldDef.display_name}</option>
          {options.map((option) => {
            // Handle both string options and object options
            const optionValue = typeof option === 'object' ? (option.actual_value || option.display_value) : option;
            const displayValue = typeof option === 'object' ? option.display_value : option;

            return (
              <option key={optionValue} value={optionValue}>
                {displayValue}
              </option>
            );
          })}
        </select>
      );
    } else if (fieldDef.data_type === "boolean") {
      // Render checkbox for boolean fields
      return (
        <input
          type="checkbox"
          name={fieldKey}
          checked={fieldValue || false}
          onChange={(e) => handleInputChange(fieldKey, e.target.checked)}
          className="w-5 h-5"
        />
      );
    } else {
      // For all other field types, use the appropriate input type
      return (
        <input
          type={getInputType(fieldDef)}
          name={fieldKey}
          value={fieldValue || ''}
          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
          className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }
  };

  // Function to render field display (non-edit mode)
  const renderFieldDisplay = (fieldKey, specialClass = "") => {
    // Find the field value from lead data
    const fieldValue = lead?.[fieldKey];

    // Special handling for Lead_Status
    if (fieldKey === 'Lead_Status' && fieldValue) {
      return (
        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 inline-block rounded-full text-xs sm:text-sm font-medium ${statusColors[fieldValue] || "bg-gray-200 text-gray-700"}`}>
          {safeRenderValue(fieldValue)}
        </span>
      );
    }

    // Special handling for email fields
    if (fieldKey === 'Email' || fieldKey === 'Secondary_Email') {
      return (
        <span className={`text-sm sm:text-base font-medium text-blue-600 break-all ${specialClass}`}>
          {safeRenderValue(fieldValue)}
        </span>
      );
    }

    

    // Default display
    return (
      <span className={`text-sm sm:text-base font-medium ${specialClass}`}>
        {safeRenderValue(fieldValue)}
      </span>
    );
  };


  // Modified fetchNotes function with proper loading state handling
  const fetchNotes = async () => {
    // First, set the active tab to 'notes' to show this tab
    setActiveTab('notes');

    // If notes are already loaded, don't fetch them again
    if (dataLoaded.notes) {
      setIsLoading(false); // Make sure loading is false even when using cached data
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/notes/${"Leads"}/${leadId}`);
      setNotes(response?.data?.data?.data);

      // Mark notes as loaded
      setDataLoaded(prev => ({
        ...prev,
        notes: true
      }));
    } catch (error) {
      console.error('Error fetching notes:', error);
      // Optionally show an error toast or message
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch the tasks

  const fetchTasks = async () => {
    // First, set the active tab to 'openActivity' to show this tab
    setActiveTab('openActivity');

    // If tasks are already loaded, don't fetch them again
    if (dataLoaded.tasks) {
      setIsLoading(false);
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/openactivities`,
        { params: {
          $se_module: "Leads",
          What_Id: leadId,
          Who_Id: null
        }}
      );
      setTasks(response?.data?.data?.data || []);

      // Mark tasks as loaded
      setDataLoaded(prev => ({
        ...prev,
        tasks: true
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      // Optionally show an error toast or message
    } finally {
      setIsLoading(false);
    }
  };

  const handleNoteAdded = (newNote) => {
    // Update notes list when a new note is added
    // setNotes([newNote, ...notes]);
    setNotes([newNote, ...(notes || [])]);

  };

  const handleLeadStatusUpdated = (newStatus) => {
    setCurrentLeadStatus(newStatus);
  };


  // Handle tab switching
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);

    // Reset loading state when switching tabs
    setIsLoading(true);

    // Fetch data for the selected tab if not already loaded
    if (tab === 'notes') {
      // If notes already loaded, set loading to false immediately
      if (dataLoaded.notes) {
        setIsLoading(false);
      } else {
        fetchNotes();
      }
    }


    if (tab === 'openActivity') {
      // If tasks already loaded, set loading to false immediately
      if (dataLoaded.tasks) {
        setIsLoading(false);
      } else {
        fetchTasks();
      }
    }


    // You can add similar logic for attachments tab if needed
    if (tab === 'attachments') {
      setShowAttachmentsPage(true);
      setShowAddAttachment(false);

      // If attachments already loaded, set loading to false immediately
      if (dataLoaded.attachments) {
        setIsLoading(false);
      } else {
        // Mark attachments as being loaded - this helps prevent multiple API calls
        setDataLoaded(prev => ({
          ...prev,
          attachments: true
        }));
      }
    }
  };


  // Create a new cached version of ShowAttachment
  const CachedShowAttachment = ({ leadId, onClose }) => {
    return (
      <ShowAttachment
        leadId={leadId}
        onClose={onClose}
        cachedData={attachments}
        setCachedData={setAttachments}
        dataLoaded={dataLoaded.attachments}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    );
  };

  // Create a cached version of TaskDetailsPage
  const CachedTaskDetailsPage = () => {
    return (
      <TaskDetailsPage
        leadId={leadId}
        cachedData={tasks}
        setCachedData={setTasks}
        dataLoaded={dataLoaded.tasks}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    );
  };

  // // Toggle details visibility
  // const toggleDetails = () => {
  //   setShowDetails(!showDetails);
  // };


  // Status change functionality

  const handleClick = (status) => {
    setSelectedButton(status);
    setIsAddNoteModalOpen(true)
  };

//   return (
//     <>
//       <Navbar/>
//       <div className="min-h-screen bg-gray-50">
//         {/* Sleek Top Navigation Bar */}
      
//         {/* Main Content */}
//         <div className="pt-4 pb-6">
//           {/* Back button and header */}
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
//             <button 
//               onClick={() => navigate("/app/leadview")}
//               className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//             >
//               <svg className="-ml-0.5 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                 <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
//               </svg>
//               Back to Leads
//             </button>
//           </div>
  
//           {/* Lead Profile */}
//           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//             <div className="bg-white shadow-sm rounded-lg overflow-hidden">
//               <div className="p-6">
//                 <div className="md:flex md:items-center md:justify-between">
//                   <div className="flex-1 min-w-0 flex items-center">
//                     <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
//                       {lead?.First_Name ? lead.First_Name.charAt(0) : 'V'}
//                     </div>
//                     <div className="ml-5">
//                       <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
//                         {safeRenderValue(lead?.Full_Name) || 'Vikram Rathore'}
//                       </h1>
//                       <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-8">
//                         <div className="mt-2 flex items-center text-sm text-gray-500">
//                           <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                             <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
//                             <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
//                           </svg>
//                           {safeRenderValue(lead?.Designation) || 'SDE 2'}
//                         </div>
//                         <div className="mt-2 flex items-center text-sm text-gray-500">
//                           <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                             <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 01-1.581.814l-4.419-2.391-4.419 2.391A1 1 0 014 16V4zm2-1a1 1 0 00-1 1v10.586l3.419-1.849a1 1 0 01.962 0l3.419 1.849V4a1 1 0 00-1-1H6z" clipRule="evenodd" />
//                           </svg>
//                           {safeRenderValue(lead?.Company) || 'Company Name'}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="mt-5 flex space-x-3 md:mt-0 md:ml-4">
//                     {isEditing ? (
//                       <>
//                         <button
//                           className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                           onClick={toggleEditMode}
//                           disabled={isSaving}
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                           onClick={saveLead}
//                           disabled={isSaving}
//                         >
//                           {isSaving ? 'Saving...' : 'Save Changes'}
//                         </button>
//                       </>
//                     ) : (
//                       <button
//                         className={`inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
//                           ${accessScore < 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
//                         onClick={toggleEditMode}
//                         disabled={accessScore < 3}
//                       >
//                         <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                           <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                         </svg>
//                         Edit Lead
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
  
//               {/* Status Action Cards */}
//               <div className="px-6 py-5 bg-gray-50 border-t border-b border-gray-200">
//                 <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                   <button
//                     onClick={() => handleClick("Contacted")}
//                     className="relative inline-flex items-center justify-center px-4 py-3 rounded-lg shadow-sm text-white bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all"
//                   >
//                     <span className="absolute left-0 inset-y-0 flex items-center pl-3">
//                       <svg className="h-5 w-5 text-green-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
//                       </svg>
//                     </span>
//                     <span className="font-medium">Contacted</span>
//                   </button>
  
//                   <button
//                     onClick={() => handleClick("Not Contacted")}
//                     className="relative inline-flex items-center justify-center px-4 py-3 rounded-lg shadow-sm text-white bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all"
//                   >
//                     <span className="absolute left-0 inset-y-0 flex items-center pl-3">
//                       <svg className="h-5 w-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M4 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm2-2a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2H6z" clipRule="evenodd" />
//                         <path d="M9 3a1 1 0 000 2h2a1 1 0 000-2H9z" />
//                       </svg>
//                     </span>
//                     <span className="font-medium">Not Contacted</span>
//                   </button>
  
//                   <button
//                     onClick={() => handleClick("Junk Lead")}
//                     className="relative inline-flex items-center justify-center px-4 py-3 rounded-lg shadow-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
//                   >
//                     <span className="absolute left-0 inset-y-0 flex items-center pl-3">
//                       <svg className="h-5 w-5 text-red-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//                       </svg>
//                     </span>
//                     <span className="font-medium">Junk Lead</span>
//                   </button>
  
//                   <button
//                     onClick={() => handleClick("Not Qualified")}
//                     className="relative inline-flex items-center justify-center px-4 py-3 rounded-lg shadow-sm text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all"
//                   >
//                     <span className="absolute left-0 inset-y-0 flex items-center pl-3">
//                       <svg className="h-5 w-5 text-red-200" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
//                       </svg>
//                     </span>
//                     <span className="font-medium">Not Qualified</span>
//                   </button>
//                 </div>
//               </div>
  
//               {/* Tabs */}
//               <div className="border-b border-gray-200">
//                 <nav className="flex -mb-px px-6" aria-label="Tabs">
//                   <button
//                     onClick={() => handleTabSwitch('overview')}
//                     className={`${
//                       activeTab === 'overview'
//                         ? 'border-blue-500 text-blue-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm`}
//                   >
//                     Overview
//                   </button>
//                   <button
//                     onClick={() => handleTabSwitch('notes')}
//                     className={`${
//                       activeTab === 'notes'
//                         ? 'border-blue-500 text-blue-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ml-8`}
//                   >
//                     Notes
//                   </button>
//                   <button
//                     onClick={() => handleTabSwitch('attachments')}
//                     className={`${
//                       activeTab === 'attachments'
//                         ? 'border-blue-500 text-blue-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ml-8`}
//                   >
//                     Attachments
//                   </button>
//                   <button
//                     onClick={() => handleTabSwitch('openActivity')}
//                     className={`${
//                       activeTab === 'openActivity'
//                         ? 'border-blue-500 text-blue-600'
//                         : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
//                     } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm ml-8`}
//                   >
//                     Activities
//                   </button>
//                 </nav>
//               </div>
  
//               {/* Tab Content */}
//               <div className="px-6 py-6">
//                 {activeTab === 'overview' && (
//                   <div>
//                     <div className="flex justify-between items-center mb-5">
//                       <h2 className="text-lg font-medium text-gray-900">Lead Information</h2>
//                       <button
//                         className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center"
//                         onClick={toggleDetails}
//                       >
//                         {showDetails ? (
//                           <>
//                             <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                               <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
//                             </svg>
//                             Hide Details
//                           </>
//                         ) : (
//                           <>
//                             <svg className="h-5 w-5 mr-1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                               <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
//                             </svg>
//                             Show Details
//                           </>
//                         )}
//                       </button>
//                     </div>
  
//                     {showDetails ? (
//                       <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//                         <div className="grid grid-cols-1 md:grid-cols-2 divide-y divide-gray-200 md:divide-y-0 md:divide-x">
//                           <div className="px-6 py-5 space-y-6">
//                             {fields.slice(0, Math.ceil(fields.length / 2)).map((field) => (
//                               <div key={field.api_name} className="flex items-start">
//                                 <div className="w-36 flex-shrink-0">
//                                   <span className="text-sm font-medium text-gray-500">{field.display_label || field.api_name}</span>
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                   {isEditing && field.api_name !== 'id' && field.data_type !== "lookup" && field.data_type !== "ownerlookup" ? (
//                                     renderFormField(field.api_name, field)
//                                   ) : (
//                                     <div className="text-sm text-gray-900">
//                                       {field.api_name === 'Mobile' || field.api_name === 'Phone' ? (
//                                         <div className="flex items-center">
//                                           <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 mr-2">
//                                             <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                                               <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
//                                             </svg>
//                                           </span>
//                                           {renderFieldDisplay(field.api_name)}
//                                         </div>
//                                       ) : field.api_name === 'Email' || field.api_name === 'Secondary_Email' ? (
//                                         <div className="flex items-center">
//                                           <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 mr-2">
//                                             <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                                               <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                                               <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                                             </svg>
//                                           </span>
//                                           {renderFieldDisplay(field.api_name, 'text-blue-600')}
//                                         </div>
//                                       ) : (
//                                         renderFieldDisplay(field.api_name)
//                                       )}
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                           <div className="px-6 py-5 space-y-6">
//                             {fields.slice(Math.ceil(fields.length / 2)).map((field) => (
//                               <div key={field.api_name} className="flex items-start">
//                                 <div className="w-36 flex-shrink-0">
//                                   <span className="text-sm font-medium text-gray-500">{field.display_label || field.api_name}</span>
//                                 </div>
//                                 <div className="flex-1 min-w-0">
//                                   {isEditing && field.api_name !== 'id' && field.data_type !== "lookup" && field.data_type !== "ownerlookup" ? (
//                                     renderFormField(field.api_name, field)
//                                   ) : (
//                                     <div className="text-sm text-gray-900">
//                                       {field.api_name === 'Mobile' || field.api_name === 'Phone' ? (
//                                         <div className="flex items-center">
//                                           <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 text-green-600 mr-2">
//                                             <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                                               <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
//                                             </svg>
//                                           </span>
//                                           {renderFieldDisplay(field.api_name)}
//                                         </div>
//                                       ) : field.api_name === 'Email' || field.api_name === 'Secondary_Email' ? (
//                                         <div className="flex items-center">
//                                           <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 mr-2">
//                                             <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
//                                               <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
//                                               <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
//                                             </svg>
//                                           </span>
//                                           {renderFieldDisplay(field.api_name, 'text-blue-600')}
//                                         </div>
//                                       ) : (
//                                         renderFieldDisplay(field.api_name)
//                                       )}
//                                     </div>
//                                   )}
//                                 </div>
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       </div>
//                     ) : (
//                       <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
//                         <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
//                         </svg>
//                         <h3 className="mt-2 text-sm font-medium text-gray-900">No details visible</h3>
//                         <p className="mt-1 text-sm text-gray-500">Click "Show Details" to view lead information.</p>
//                       </div>
//                     )}
//                   </div>
//                )}
//                {activeTab === 'notes' && (
//               <div className="space-y-4">
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
//                   <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-base sm:text-lg font-medium text-gray-800">
//                       Notes ({notes?.length || 0})
//                     </h2>
//                     <button className="text-blue-600 text-sm hover:underline" onClick={() => setIsAddNoteModalOpen(true)}>
//                       Add Note
//                     </button>
//                   </div>

//                    {isLoading ? (
//                      <div className="text-center text-gray-500 py-6">
//                       <NotesUi />
//                     </div>
//                   ) : !notes || notes.length === 0 ? (
//                     <div className="text-center text-gray-500 py-6">
//                       No notes found for this lead.
//                     </div>
//                   ) : (
//                     <div className="space-y-4">
//                       {notes.map((note) => (
//                         <NotesCard key={note.id} note={note} />
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {activeTab === 'attachments' && (
//               <div className="space-y-4">
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
//                   <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-base sm:text-lg font-medium text-gray-800">
//                       Attachments
//                     </h2>
//                      <div className="flex space-x-3">
//                       <button 
//                         className="text-blue-600 text-sm hover:underline" 
//                         onClick={() => {
//                           setShowAttachmentsPage(true);
//                           setShowAddAttachment(false);
//                         }}
//                       >
//                         Show All Attachments
//                       </button>
//                       <button 
//                         className="text-blue-600 text-sm hover:underline" 
//                         onClick={() => {
//                           setShowAddAttachment(true);
//                           setShowAttachmentsPage(false);
//                         }}
//                       >
//                         Add New Attachment
//                       </button>
//                     </div> 
//                   </div>

//                  {showAttachmentsPage ? (
//                     <CachedShowAttachment leadId={lead?.id} onClose={() => setShowAttachmentsPage(false)} />
//                   ) : showAddAttachment ? (
//                     <AttachFilePage leadId={lead?.id} onClose={() => setShowAddAttachment(false)} />
//                   ) : (
//                     <div className="text-center text-gray-500 py-6">
//                       Click "Show All Attachments" to view files or "Add New Attachment" to upload files.
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//              {activeTab === 'openActivity' && (
//               <CachedTaskDetailsPage />
//             )} 
//                </div>
//              </div>
//            </div>
//          </div>
//        </div>
//        </>
// )
                
  


  return (
    <>
      <Navbar />
      {
      fields.length <= 0 ? (<DetailsShimmer/>): (
      <div className="flex min-h-screen bg-gray-50 relative">
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center px-2 sm:px-4 py-2">
              {/* Desktop back button (hidden on mobile) */}
              <button
                className="p-2 mr-2 rounded-full hover:bg-gray-100 hidden lg:block"
                onClick={() => navigate("/app/leadview")}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              {/* Mobile back button (visible only on small screens) */}
              <button
                className="py-1 px-2 mr-2 text-xs rounded-md bg-gray-100 hover:bg-gray-200 flex items-center lg:hidden"
                onClick={() => navigate("/app/leadview")}
              >
                <ArrowLeft className="w-4 h-4 mr-1 text-gray-600" />
              </button>

              <div className="flex items-center">
                <div className="bg-red-500 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  {lead?.First_Name ? lead.First_Name.charAt(0) : 'K'}
                </div>
                <div className="overflow-hidden">
                  <h1 className="text-base sm:text-lg font-medium truncate">
                    {safeRenderValue(lead?.Full_Name) || 'Mr. Kushal Pratap Singh'}
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">
                    {safeRenderValue(lead?.Company) || 'Coding Ninjas'}
                  </p>
                </div>
              </div>

              <div className="ml-auto flex space-x-1 sm:space-x-2">
                {isEditing ? (
                  <>
                    <button
                      className="border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-gray-50 text-sm sm:text-base"
                      onClick={toggleEditMode}
                      disabled={isSaving}
                    >
                      <span className="hidden sm:inline">Cancel</span>
                      <X className="w-4 h-4 inline sm:hidden" />
                    </button>
                    <button
                      className="border border-blue-500 bg-blue-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-blue-600 text-sm sm:text-base"
                      onClick={saveLead}
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <span className="hidden sm:inline">Saving...</span>
                      ) : (
                        <>
                          <span className="hidden sm:inline">Save</span>
                          <Save className="w-4 h-4 inline sm:hidden" />
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <button
                    className={`border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base
                      ${accessScore < 3 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                    onClick={toggleEditMode}
                    disabled={accessScore < 3} // Disable button if accessScore is less than 3
                  >
                    <span className="hidden sm:inline">Edit</span>
                    <Edit className="w-4 h-4 inline sm:hidden" />
                  </button>
                )}
              </div>
            </div>
          </header>

          {/* Tabs */}
          <div className="border-b border-gray-200 bg-white">
            <div className="px-3 sm:px-6 py-2">
              <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
                <button
                  className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'overview'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => handleTabSwitch('overview')}
                >
                  Overview
                </button>
                <button
                  className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'notes'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => handleTabSwitch('notes')}
                >
                  Notes
                </button>
                <button
                  className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'attachments'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => handleTabSwitch('attachments')}
                >
                  Attachments
                </button>
                <button
                  className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'openActivity' ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                    }`}
                  onClick={() => handleTabSwitch('openActivity')}
                >
                  Activities
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
            {activeTab === 'overview' && (
              
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-3 sm:p-6 overflow-auto">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-4">
                    <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-4 justify-center items-center">
                      <button
                        onClick={() => handleClick("Contacted")}
                        className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                      >
                        Contacted
                      </button>

                      <button onClick={() => handleClick("Not Contacted")} className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md shadow transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
                        Not Contacted
                      </button>
                      <button onClick={() => handleClick("Junk Lead")} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
                        Junk Lead
                      </button>
                      <button onClick={() => handleClick("Not Qualified")} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
                        Not Qualified
                      </button>
                    </div>
                  </div>
                </div>
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-base sm:text-lg font-medium text-gray-800">Lead Information</h2>
                  <button
                    className="text-blue-600 text-xs sm:text-sm hover:underline"
                    onClick={toggleDetails}
                  >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>

                {/* Details content - conditionally rendered based on showDetails state */}
                {showDetails && (
                  <>
                    <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
                      {/* Display all fields without filtering */}
                      {fields.map((field, index) => (
                        <div key={field.api_name} className="flex items-start">
                          <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">{field.display_label || field.api_name}</div>
                          <div className="flex-1">
                            {isEditing && field.api_name !== 'id' && field.data_type !== "lookup" && field.data_type !== "ownerlookup"? (
                              renderFormField(field.api_name, field)
                            ) : (
                              field.api_name === 'Mobile' || field.api_name === 'Phone' ? (
                                <div className="flex items-center">
                                  <span className="bg-green-100 rounded-full p-1 mr-2">
                                    <Phone className="w-3 h-3 text-green-600" />
                                  </span>
                                  {renderFieldDisplay(field.api_name)}
                                </div>
                              ) : field.api_name === 'Email' || field.api_name === 'Secondary_Email' ? (
                                renderFieldDisplay(field.api_name, 'text-blue-600')
                              ) : (
                                renderFieldDisplay(field.api_name)
                              )
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* Display a message when details are hidden */}
                {!showDetails && (
                  <div className="p-6 text-center text-gray-500">
                    Details are hidden. Click "Show Details" to view lead information.
                  </div>
                )}
              </div>
              
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base sm:text-lg font-medium text-gray-800">
                      Notes ({notes?.length || 0})
                    </h2>
                    <button className="text-blue-600 text-sm hover:underline" onClick={() => setIsAddNoteModalOpen(true)}>
                      Add Note
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="text-center text-gray-500 py-6">
                      <NotesUi />
                    </div>
                  ) : !notes || notes.length === 0 ? (
                    <div className="text-center text-gray-500 py-6">
                      No notes found for this lead.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {notes.map((note) => (
                        <NotesCard key={note.id} note={note} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'attachments' && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base sm:text-lg font-medium text-gray-800">
                      Attachments
                    </h2>
                    {/* <div className="flex space-x-3">
                      <button 
                        className="text-blue-600 text-sm hover:underline" 
                        onClick={() => {
                          setShowAttachmentsPage(true);
                          setShowAddAttachment(false);
                        }}
                      >
                        Show All Attachments
                      </button>
                      <button 
                        className="text-blue-600 text-sm hover:underline" 
                        onClick={() => {
                          setShowAddAttachment(true);
                          setShowAttachmentsPage(false);
                        }}
                      >
                        Add New Attachment
                      </button>
                    </div> */}
                  </div>

                  {showAttachmentsPage ? (
                    <CachedShowAttachment leadId={lead?.id} onClose={() => setShowAttachmentsPage(false)} />
                  ) : showAddAttachment ? (
                    <AttachFilePage leadId={lead?.id} onClose={() => setShowAddAttachment(false)} />
                  ) : (
                    <div className="text-center text-gray-500 py-6">
                      Click "Show All Attachments" to view files or "Add New Attachment" to upload files.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'openActivity' && (
              <CachedTaskDetailsPage />
            )}

          </div>
        </div>
        <AddNoteModal
          isOpen={isAddNoteModalOpen}
          onClose={() => setIsAddNoteModalOpen(false)}
          leadId={leadId}
          username={username}
          onNoteAdded={handleNoteAdded}
        />
        <AddReasonModal
          isOpen={isAddReasonModalOpen}
          onClose={() => setIsAddReasonModalOpen(false)}
          leadId={leadId}
          username={username}
          leadStatus={lead?.Lead_Status || undefined}
          buttonName={selectedButton}
          onLeadStatusUpdated={handleLeadStatusUpdated}
        />
      </div>
      )
    }
    </>
  );
};

export default LeadInformationPage;