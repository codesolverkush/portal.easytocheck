

import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Paperclip, Edit, Send, MoreHorizontal, Phone, Mail, Clock, Calendar, Globe, MapPin, User, Briefcase, Tag, Bell, Menu, X, Clipboard, Save, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AttachFilePage from './AttachFilePage';
import ShowAttachment from './ShowAttachment';
import Navbar from '../common/Navbar';
import TaskDetailsPage from './TaskDetailsPage';
import NotesUi from '../ui/NotesUi';
import toast from 'react-hot-toast';

const statusColors = {
  Contacted: "bg-green-200 text-green-700",
  "Contact in Future": "bg-purple-200 text-purple-700",
  "Fresh Lead": "bg-blue-200 text-blue-700",
  New: "bg-gray-200 text-gray-700",
  "Junk Lead": "bg-red-200 text-red-700",
  "Not Qualified": "bg-orange-200 text-orange-700"
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
      const response = await axios.post(`${process.env.REACT_APP_APP_API}/related/createnote/${leadId}`, {
        Note_Title: noteTitle,
        Note_Content: noteContent
      });

      // Adding the note to the list currently
      
      if(response?.status === 200){
        const newNote = {
          id: response?.data?.data?.data[0]?.details.id,
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


const AddReasonModal = ({ isOpen, onClose, leadId, username, leadStatus, buttonName,onLeadStatusUpdated }) => {
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


const LeadInformationPage = ({ data, leadId, username,accessScore }) => {
  const lead = data?.data[0]; // Take the first lead from the array

  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(true); // State to control details visibility

  const [activeTab, setActiveTab] = useState('overview');
  const [notes, setNotes] = useState([]);
  const [tasks,setTasks] = useState([]);

   // Edit variable
   const [isEditing, setIsEditing] = useState(false);
   const [editedLead, setEditedLead] = useState({});
   const [isSaving, setIsSaving] = useState(false);

  //  Dropdown variable
  const [leadSourceOptions, setLeadSourceOptions] = useState([]);
  const [leadStatusOptions, setLeadStatusOptions] = useState([]);

  const navigate = useNavigate();
  
  // Add data loading flags
  const [dataLoaded, setDataLoaded] = useState({
    notes: false,
    attachments: false,
    tasks: false
  });
  
  const [attachments, setAttachments] = useState([]);
  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);

  const [showAttachmentsPage, setShowAttachmentsPage] = useState(true);
  const [showAddAttachment, setShowAddAttachment] = useState(false);


  // Button name variable

  const [selectedButton, setSelectedButton] = useState("");

  // Lead Status changed, bluprint touch
  const [currentLeadStatus, setCurrentLeadStatus] = useState(lead?.Lead_Status || "Contacted");



  const filteredLead = Object.fromEntries(
    Object.entries(lead).filter(([key]) => {
      return (
        !key.startsWith('$') && 
        !key.startsWith('Converted') && 
        !key.includes('__')
      );
    })
  );
  // Section 1: Personal and contact information plus address
  const personalAndContactInfo = {
    Salutation: filteredLead.Salutation,
    First_Name: filteredLead.First_Name,
    Last_Name: filteredLead.Last_Name,
    Full_Name: filteredLead.Full_Name,
    Mobile: filteredLead.Mobile,
    Phone: filteredLead.Phone,
    Email: filteredLead.Email,
    Secondary_Email: filteredLead.Secondary_Email,
    Company: filteredLead.Company,
    Lead_Source: filteredLead.Lead_Source,
    // Address related fields
    Street: filteredLead.Street,
    City: filteredLead.City,
    State: filteredLead.State,
    Country: filteredLead.Country,
    Zip_Code: filteredLead.Zip_Code
  };
  
  // Section 3: Audit information (keeping this as section 3 as requested)
  const auditInfo = {
    Created_Time: filteredLead.Created_Time,
    Created_By: filteredLead.Created_By,
    Modified_Time: filteredLead.Modified_Time,
    Modified_By: filteredLead.Modified_By
  };
  
  // Section 2: All remaining fields not in sections 1 or 3
  const excludedKeys = [
    ...Object.keys(personalAndContactInfo),
    ...Object.keys(auditInfo)
  ];
  
  const additionalInfo = Object.fromEntries(
    Object.entries(filteredLead).filter(([key]) => !excludedKeys.includes(key))
  );


  const formatLabel = (key) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };



  const handleLeadStatusUpdated = (newStatus) => {
    setCurrentLeadStatus(newStatus);
  };
  

  const handleNoteAdded = (newNote) => {
    // Update notes list when a new note is added
    setNotes([newNote, ...notes]);
  };

  const sidebarRef = useRef(null);


  // Close sidebar when clicking outside of it (only on mobile and tablet)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth < 1024 &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target) &&
        !event.target.classList.contains('sidebar-toggle')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle window resize to reset sidebar state
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        // Always keep sidebar open on larger screens
        setSidebarOpen(true);
      }
    };

    // Set initial state
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Dropdown function 

  const fetchFormOptions = async () => {
    try {
      // Try to get data from cache first
      const CACHE_NAME = "crm-cache";
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match("/lead-form-fields");
      
      if (cachedResponse) {
        const fieldData = await cachedResponse.json();
        extractDropdownOptions(fieldData);
        return;
      }
      
      // If no cached data, fetch from API
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/lead/getLead`
      );

  
      const fieldData = response?.data?.data?.fields || [];
      extractDropdownOptions(fieldData);

      const newResponse = new Response(JSON.stringify(fieldData), 
        { headers: { "Content-Type": "application/json" } });
      await cache.put("/lead-form-fields", newResponse);
      
    } catch (error) {
      console.error("Error fetching dropdown options:", error);
      // Use default options if there's an error
      setLeadSourceOptions([
        "Advertisement", "Cold Call", "Employee Referral", 
        "External Referral", "Partner", "Public Relations", "Website"
      ]);
      setLeadStatusOptions([
        "New", "Contacted", "Qualified", "Unqualified", "Junk Lead"
      ]);
    }
  };
  
  // Add this function to extract dropdown options
  const extractDropdownOptions = (fieldData) => {
    const sourceField = fieldData.find(field => field.api_name === "Lead_Source");
    const statusField = fieldData.find(field => field.api_name === "Lead_Status");
    
    if (sourceField && sourceField.pick_list_values) {
      setLeadSourceOptions(sourceField.pick_list_values.map(item => item.display_value));
    } else {
      setLeadSourceOptions([
        "Advertisement", "Cold Call", "Employee Referral", 
        "External Referral", "Partner", "Public Relations", "Website"
      ]);
    }
    
    if (statusField && statusField.pick_list_values) {
      setLeadStatusOptions(statusField.pick_list_values.map(item => item.display_value));
    } else {
      setLeadStatusOptions([
        "New", "Contacted", "Qualified", "Unqualified", "Junk Lead"
      ]);
    }
  };

  // End dropdown function


  // Edit Function

    // Initialize editedLead with lead data when component mounts or lead data changes
    useEffect(() => {
      if (lead) {
        setEditedLead({
          Full_Name: lead?.Full_Name || '',
          Designation: lead?.Designation || '',
          Company: lead?.Company || '',
          Mobile: lead?.Mobile || '',
          Phone: lead?.Phone || '',
          Email: lead?.Email || '',
          Secondary_Email: lead?.Secondary_Email || '',
          Website: lead?.Website || '',
          Lead_Status: lead?.Lead_Status || '',
          Lead_Source: lead?.Lead_Source || '',
          Next_Followup_Date: lead?.Next_Followup_Date || lead?.Next_Follow_up_date || '',
        });
      }
    }, [lead]);
    
    // Function to handle input changes
    const handleInputChange = (field, value) => {
      setEditedLead(prev => ({
        ...prev,
        [field]: value
      }));
    };
    
    // Function to toggle edit mode
    const toggleEditMode = () => {
      if (isEditing) {
        // If currently editing, reset to original values when canceling
        if (lead) {
          setEditedLead({
            Full_Name: lead?.Full_Name || '',
            Designation: lead?.Designation || '',
            Company: lead?.Company || '',
            Mobile: lead?.Mobile || '',
            Phone: lead?.Phone || '',
            Email: lead?.Email || '',
            Secondary_Email: lead?.Secondary_Email || '',
            Website: lead?.Website || '',
            Lead_Status: lead?.Lead_Status || '',
            Lead_Source: lead?.Lead_Source || '',
            Next_Followup_Date: lead?.Next_Followup_Date || lead?.Next_Follow_up_date || '',
          });
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
          
          // Exit edit mode
          setIsEditing(false);
          
          // Optional: Show success message
          toast.success('Lead updated successfully!');
        } else {
          // Optional: Show error message
          toast.error('Failed to update lead. Please try again.');
        }
      } catch (error) {
        console.error('Error updating lead:', error);
        toast.error(error?.response?.data?.error?.data[0]?.message || "Something went");
      } finally {
        setIsSaving(false);
      }
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
    const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/notes/${leadId}`);
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
    const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/openactivities/${leadId}`);
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

  // Toggle details visibility
  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };


  // Status change functionality

  const handleClick = (status) => {
    setSelectedButton(status);
    setIsAddNoteModalOpen(true)
  };

  return (
    <>
      <Navbar/>
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
                  <h1 className="text-base sm:text-lg font-medium truncate">{lead?.Full_Name || 'Mr. Kushal Pratap Singh'}</h1>
                  <p className="text-xs sm:text-sm text-gray-500 truncate">{lead?.Company || 'Coding Ninjas'}</p>
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
                    onClick={() => {
                      toggleEditMode();
                      fetchFormOptions();
                    }}
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
                  className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'overview'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => handleTabSwitch('overview')}
                >
                  Overview
                </button>
                <button
                  className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'notes'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => handleTabSwitch('notes')}
                >
                  Notes
                </button>
                <button
                  className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'attachments'
                      ? 'border-b-2 border-blue-500 text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => handleTabSwitch('attachments')}
                >
                  Attachments
                </button>
                <button
                  className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === 'openActivity' ? 'border-b-2 border-blue-500 text-blue-600'
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
                    {/* Left Column */}
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-start">
                        <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Lead Owner</div>
                        <div className="flex-1 text-sm sm:text-base font-medium">
                          {filteredLead?.Owner?.name || "Av"}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Title</div>
                        <div className="flex-1 text-sm sm:text-base font-medium">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedLead.Designation || ''}
                              onChange={(e) => handleInputChange('Designation', e.target.value)}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            lead?.Designation || "Software Developer"
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Mobile</div>
                        <div className="flex-1 text-sm sm:text-base font-medium flex items-center">
                          <span className="bg-green-100 rounded-full p-1 mr-2">
                            <Phone className="w-3 h-3 text-green-600" />
                          </span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedLead.Mobile || ''}
                              onChange={(e) => handleInputChange('Mobile', e.target.value)}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            lead?.Mobile || "(878) 987-7665"
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Phone</div>
                        <div className="flex-1 text-sm sm:text-base font-medium flex items-center">
                          <span className="bg-green-100 rounded-full p-1 mr-2">
                            <Phone className="w-3 h-3 text-green-600" />
                          </span>
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedLead.Phone || ''}
                              onChange={(e) => handleInputChange('Phone', e.target.value)}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            lead?.Phone || "(897) 667-7887"
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">LeadIdCPY</div>
                        <div className="flex-1 text-sm sm:text-base font-medium text-gray-700 break-all">
                          {lead?.id || "5962890000000379001"}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Next Followup</div>
                        <div className="flex-1 text-sm sm:text-base font-medium text-gray-700">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editedLead.Next_Followup_Date || ''}
                              onChange={(e) => handleInputChange('Next_Followup_Date', e.target.value)}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            lead?.Next_Followup_Date || lead?.Next_Follow_up_date || "—"
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4 sm:space-y-6">
                      <div className="flex items-start">
                        <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Company</div>
                        <div className="flex-1 text-sm sm:text-base font-medium">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedLead.Company || ''}
                              onChange={(e) => handleInputChange('Company', e.target.value)}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            lead?.Company || "Coding Ninjas"
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Lead Name</div>
                        <div className="flex-1 text-sm sm:text-base font-medium">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editedLead.Full_Name || ''}
                              onChange={(e) => handleInputChange('Full_Name', e.target.value)}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            lead?.Full_Name || "Mr. Kushal Pratap Singh"
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Lead Status</div>
                        <div className="flex-1">
                          {isEditing ? (
                           <select
                              value={editedLead.Lead_Status || ''}
                              onChange={(e) => handleInputChange('Lead_Status', e.target.value)}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="">Select Status</option>
                              {leadStatusOptions.map((status) => (
                                <option key={status} value={status}>{status}</option>
                              ))}
                            </select>
                          ) : (
                            <span className={`px-2 sm:px-3 py-0.5 sm:py-1 inline-block rounded-full text-xs sm:text-sm font-medium ${statusColors[currentLeadStatus || "Contacted"]}`}>
                              {currentLeadStatus || "Contacted"}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Lead Source</div>
                        <div className="flex-1 text-sm sm:text-base font-medium">
                          {isEditing ? (
                            <select
                            value={editedLead.Lead_Source || ''}
                            onChange={(e) => handleInputChange('Lead_Source', e.target.value)}
                            className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select Source</option>
                            {leadSourceOptions.map((source) => (
                              <option key={source} value={source}>{source}</option>
                            ))}
                          </select>
                          ) : (
                            lead?.Lead_Source || "Advertisement"
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Email</div>
                        <div className="flex-1 text-sm sm:text-base font-medium text-blue-600 break-all">
                          {isEditing ? (
                            <input
                              type="email"
                              value={editedLead.Email || ''}
                              onChange={(e) => handleInputChange('Email', e.target.value)}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            lead?.Email || "kushal@codingninjas.edu.in"
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Secondary Email</div>
                        <div className="flex-1 text-sm sm:text-base font-medium text-gray-700">
                          {isEditing ? (
                            <input
                              type="email"
                              value={editedLead.Secondary_Email || ''}
                              onChange={(e) => handleInputChange('Secondary_Email', e.target.value)}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            lead?.Secondary_Email || "—"
                          )}
                        </div>
                      </div>

                      <div className="flex items-start">
                        <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Website</div>
                        <div className="flex-1 text-sm sm:text-base font-medium text-gray-700">
                          {isEditing ? (
                            <input
                              type="url"
                              value={editedLead.Website || ''}
                              onChange={(e) => handleInputChange('Website', e.target.value)}
                              className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          ) : (
                            lead?.Website || "—"
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                    {/* Additional Information Section */}
                    <div className="border-t border-gray-200 p-4 sm:p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
                        <div className="flex items-start">
                          <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Created By</div>
                          <div className="flex-1">
                            <div className="text-sm sm:text-base font-medium">
                              {lead?.Created_By?.name || "Avinash"}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                              {new Date(lead?.Created_Time || "2025-02-12T15:26:00").toLocaleString('en-US', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Modified By</div>
                          <div className="flex-1">
                            <div className="text-sm sm:text-base font-medium">
                              {lead?.Modified_By?.name || "Avinash"}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500 mt-1">
                              {new Date(lead?.Modified_Time || "2025-02-12T15:26:00").toLocaleString('en-US', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                                hour: 'numeric',
                                minute: 'numeric',
                                hour12: true
                              })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Plain Phone</div>
                          <div className="flex-1 text-sm sm:text-base font-medium">
                            {lead?.smsmagic4__Plain_Phone || lead?.Phone || "8976677887"}
                          </div>
                        </div>
                      </div>
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
                       <NotesUi/>
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
          username = {username}
          onNoteAdded={handleNoteAdded}
        />
        <AddReasonModal
          isOpen={isAddNoteModalOpen}
          onClose={() => setIsAddNoteModalOpen(false)}
          leadId={leadId}
          username = {username}
          leadStatus = {lead?.Lead_Status || undefined}
          buttonName={selectedButton}
          onLeadStatusUpdated={handleLeadStatusUpdated}
        />
      </div>
    </>
  );
};

export default LeadInformationPage;



// import React, { useState, useEffect, useRef } from 'react';
// import { ArrowLeft, Paperclip, Edit, Send, MoreHorizontal, Phone, Mail, Clock, Calendar, Globe, MapPin, User, Briefcase, Tag, Bell, Menu, X, Clipboard, Save, ArrowRight } from 'lucide-react';
// import { Link, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import AttachFilePage from './AttachFilePage';
// import ShowAttachment from './ShowAttachment';
// import Navbar from '../common/Navbar';
// import TaskDetailsPage from './TaskDetailsPage';
// import NotesUi from '../ui/NotesUi';
// import toast from 'react-hot-toast';

// const statusColors = {
//   Contacted: "bg-green-200 text-green-700",
//   "Contact in Future": "bg-purple-200 text-purple-700",
//   "Fresh Lead": "bg-blue-200 text-blue-700",
//   New: "bg-gray-200 text-gray-700",
//   "Junk Lead": "bg-red-200 text-red-700",
//   "Not Qualified": "bg-orange-200 text-orange-700"
// };


// const formatDate = (timestamp) => {
//   return new Date(timestamp).toLocaleString('en-US', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit',
//     hour12: true
//   });
// };

// const NotesCard = ({ note }) => {
//   // Convert timestamp to a more readable format
  

//   return (
//     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
//       <div className="flex justify-between items-start mb-2">
//         <div>
//           {note.Note_Title && (
//             <h3 className="text-sm font-semibold text-gray-800 mb-1">
//               {note.Note_Title}
//             </h3>
//           )}
//           <p className="text-xs text-gray-500">
//             {formatDate(note.Created_Time)}
//           </p>
//         </div>
//         <button className="text-gray-500 hover:text-gray-700">
//           <Clipboard className="w-4 h-4" />
//         </button>
//       </div>
//       <p className="text-sm text-gray-700">
//         {note.Note_Content}
//       </p>
//     </div>
//   );
// };

// const AddNoteModal = ({ isOpen, onClose, leadId, username, onNoteAdded }) => {

//   const [noteContent, setNoteContent] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const noteTitle = `Added by ${username}`; 
//       const response = await axios.post(`${process.env.REACT_APP_APP_API}/related/createnote/${leadId}`, {
//         Note_Title: noteTitle,
//         Note_Content: noteContent
//       });

//       // Adding the note to the list currently
      
//       if(response?.status === 200){
//         const newNote = {
//           id: response?.data?.data?.data[0]?.details.id,
//           Created_Time: new Date().toISOString(),
//           Note_Title: noteTitle,
//           Note_Content: noteContent
//         }
  
//         onNoteAdded(newNote);
//       }
      
//       // Reset form and close modal
//       setNoteContent('');
//       onClose();
//     } catch (error) {
//       console.error('Error adding note:', error);
//       // Optionally show error toast
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
//         <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//           <h2 className="text-lg font-semibold text-gray-800">Add a Note</h2>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>
//         <form onSubmit={handleSubmit} className="p-4 space-y-4">
//           <div>
//             <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700 mb-1">
//               Note Title
//             </label>
//             <input
//               id="noteTitle"
//               type="text"
//               value={`Added by ${username}`}
//               readOnly
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700 mb-1">
//               Note Content
//             </label>
//             <textarea
//               id="noteContent"
//               value={noteContent}
//               onChange={(e) => setNoteContent(e.target.value)}
//               placeholder="Enter note details"
//               rows="4"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div className="flex justify-end space-x-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               {isSubmitting ? 'Adding...' : 'Add Note'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };


// const AddReasonModal = ({ isOpen, onClose, leadId, username, leadStatus, buttonName,onLeadStatusUpdated }) => {
//   const [noteContent, setNoteContent] = useState('');
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const noteTitle = `Added by ${username}`; 
//       const response = await axios.post(`${process.env.REACT_APP_APP_API}/related/createnote/${leadId}`, {
//         Note_Title: noteTitle,
//         Note_Content: noteContent
//       });

//       // If note was created successfully, update the lead status
//       if (response?.status === 200) {
//         try {
//           const updateResponse = await axios.put(`${process.env.REACT_APP_APP_API}/lead/updatelead`, {
//             id: leadId, // Added missing Lead_ID parameter
//             Lead_Status: buttonName
//           });
          
//           if (updateResponse.data.success) {
//             toast.success('Lead Status changed Successfully!');
//             onLeadStatusUpdated(buttonName);
//           } else {
//             toast.error('Failed to update lead. Please try again.');
//           }
//         } catch (error) {
//           console.error('Error updating lead:', error);
//           toast.error(error?.response?.data?.error?.data[0]?.message || "Something went wrong");
//         } 
//       }
      
//       // Reset form and close modal
//       setNoteContent('');
//       onClose();
//     } catch (error) {
//       console.error('Error adding note:', error);
//       toast.error('Failed to add note');
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
//         <div className="p-4 border-b border-gray-200 flex justify-between items-center">
//           <div className="flex items-center flex-grow">
//             <div className="text-lg font-semibold text-gray-700 px-3 py-2 bg-gray-100 rounded-md">
//               {leadStatus}
//             </div>
            
//             <ArrowRight className="mx-4 text-blue-500" size={24} />
            
//             <div className="text-lg font-semibold text-white px-3 py-2 bg-blue-600 rounded-md">
//               {buttonName}
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-500 hover:text-gray-700 ml-2"
//           >
//             <X className="w-5 h-5" />
//           </button>
//         </div>
//         <form onSubmit={handleSubmit} className="p-4 space-y-4">
//           <div>
//             <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700 mb-1">
//               Note Title
//             </label>
//             <input
//               id="noteTitle"
//               type="text"
//               value={`Added by ${username}`}
//               readOnly
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700 mb-1">
//               Reason: 
//             </label>
//             <textarea
//               id="noteContent"
//               value={noteContent}
//               onChange={(e) => setNoteContent(e.target.value)}
//               placeholder="Enter note details"
//               rows="4"
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div className="flex justify-end space-x-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={isSubmitting}
//               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
//             >
//               {isSubmitting ? 'Adding...' : 'Add Note'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };


// const LeadInformationPage = ({ data, leadId, username,accessScore }) => {
//   const lead = data?.data[0]; // Take the first lead from the array


//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [showDetails, setShowDetails] = useState(true); // State to control details visibility

//   const [activeTab, setActiveTab] = useState('overview');
//   const [notes, setNotes] = useState([]);
//   const [tasks,setTasks] = useState([]);

//    // Edit variable
//    const [isEditing, setIsEditing] = useState(false);
//    const [editedLead, setEditedLead] = useState({});
//    const [isSaving, setIsSaving] = useState(false);

//   //  Dropdown variable
//   const [leadSourceOptions, setLeadSourceOptions] = useState([]);
//   const [leadStatusOptions, setLeadStatusOptions] = useState([]);

//   const navigate = useNavigate();
  
//   // Add data loading flags
//   const [dataLoaded, setDataLoaded] = useState({
//     notes: false,
//     attachments: false,
//     tasks: false
//   });
  
//   const [attachments, setAttachments] = useState([]);
//   // Add loading state
//   const [isLoading, setIsLoading] = useState(false);

//   const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

//   const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);

//   const [showAttachmentsPage, setShowAttachmentsPage] = useState(true);
//   const [showAddAttachment, setShowAddAttachment] = useState(false);


//   // Button name variable

//   const [selectedButton, setSelectedButton] = useState("");

//   // Lead Status changed, bluprint touch
//   const [currentLeadStatus, setCurrentLeadStatus] = useState(lead?.Lead_Status || "Contacted");


//   const handleLeadStatusUpdated = (newStatus) => {
//     setCurrentLeadStatus(newStatus);
//   };
  

//   const handleNoteAdded = (newNote) => {
//     // Update notes list when a new note is added
//     setNotes([newNote, ...notes]);
//   };

//   const sidebarRef = useRef(null);


//   // Close sidebar when clicking outside of it (only on mobile and tablet)
//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (window.innerWidth < 1024 &&
//         sidebarRef.current &&
//         !sidebarRef.current.contains(event.target) &&
//         !event.target.classList.contains('sidebar-toggle')) {
//         setSidebarOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   // Handle window resize to reset sidebar state
//   useEffect(() => {
//     const handleResize = () => {
//       if (window.innerWidth >= 1024) {
//         // Always keep sidebar open on larger screens
//         setSidebarOpen(true);
//       }
//     };

//     // Set initial state
//     handleResize();

//     // Add resize listener
//     window.addEventListener('resize', handleResize);
//     return () => {
//       window.removeEventListener('resize', handleResize);
//     };
//   }, []);



//   // Dropdown function 

//   const fetchFormOptions = async () => {
//     try {
//       // Try to get data from cache first
//       const CACHE_NAME = "crm-cache";
//       const cache = await caches.open(CACHE_NAME);
//       const cachedResponse = await cache.match("/lead-form-fields");
      
//       if (cachedResponse) {
//         const fieldData = await cachedResponse.json();
//         extractDropdownOptions(fieldData);
//         return;
//       }
      
//       // If no cached data, fetch from API
//       const response = await axios.get(
//         `${process.env.REACT_APP_APP_API}/lead/getLead`
//       );

  
//       const fieldData = response?.data?.data?.fields || [];
//       extractDropdownOptions(fieldData);

//       const newResponse = new Response(JSON.stringify(fieldData), 
//         { headers: { "Content-Type": "application/json" } });
//       await cache.put("/lead-form-fields", newResponse);
      
//     } catch (error) {
//       console.error("Error fetching dropdown options:", error);
//       // Use default options if there's an error
//       setLeadSourceOptions([
//         "Advertisement", "Cold Call", "Employee Referral", 
//         "External Referral", "Partner", "Public Relations", "Website"
//       ]);
//       setLeadStatusOptions([
//         "New", "Contacted", "Qualified", "Unqualified", "Junk Lead"
//       ]);
//     }
//   };
  
//   // Add this function to extract dropdown options
//   const extractDropdownOptions = (fieldData) => {
//     const sourceField = fieldData.find(field => field.api_name === "Lead_Source");
//     const statusField = fieldData.find(field => field.api_name === "Lead_Status");
    
//     if (sourceField && sourceField.pick_list_values) {
//       setLeadSourceOptions(sourceField.pick_list_values.map(item => item.display_value));
//     } else {
//       setLeadSourceOptions([
//         "Advertisement", "Cold Call", "Employee Referral", 
//         "External Referral", "Partner", "Public Relations", "Website"
//       ]);
//     }
    
//     if (statusField && statusField.pick_list_values) {
//       setLeadStatusOptions(statusField.pick_list_values.map(item => item.display_value));
//     } else {
//       setLeadStatusOptions([
//         "New", "Contacted", "Qualified", "Unqualified", "Junk Lead"
//       ]);
//     }
//   };

//   // End dropdown function


//   // Edit Function

//     // Initialize editedLead with lead data when component mounts or lead data changes
//     useEffect(() => {
//       if (lead) {
//         setEditedLead({
//           Full_Name: lead?.Full_Name || '',
//           Designation: lead?.Designation || '',
//           Company: lead?.Company || '',
//           Mobile: lead?.Mobile || '',
//           Phone: lead?.Phone || '',
//           Email: lead?.Email || '',
//           Secondary_Email: lead?.Secondary_Email || '',
//           Website: lead?.Website || '',
//           Lead_Status: lead?.Lead_Status || '',
//           Lead_Source: lead?.Lead_Source || '',
//           Next_Followup_Date: lead?.Next_Followup_Date || lead?.Next_Follow_up_date || '',
//         });
//       }
//     }, [lead]);
    
//     // Function to handle input changes
//     const handleInputChange = (field, value) => {
//       setEditedLead(prev => ({
//         ...prev,
//         [field]: value
//       }));
//     };
    
//     // Function to toggle edit mode
//     const toggleEditMode = () => {
//       if (isEditing) {
//         // If currently editing, reset to original values when canceling
//         if (lead) {
//           setEditedLead({
//             Full_Name: lead?.Full_Name || '',
//             Designation: lead?.Designation || '',
//             Company: lead?.Company || '',
//             Mobile: lead?.Mobile || '',
//             Phone: lead?.Phone || '',
//             Email: lead?.Email || '',
//             Secondary_Email: lead?.Secondary_Email || '',
//             Website: lead?.Website || '',
//             Lead_Status: lead?.Lead_Status || '',
//             Lead_Source: lead?.Lead_Source || '',
//             Next_Followup_Date: lead?.Next_Followup_Date || lead?.Next_Follow_up_date || '',
//           });
//         }
//       }
//       setIsEditing(!isEditing);
//     };
    
//     // Function to save edited lead data
//     const saveLead = async () => {
//       setIsSaving(true);
//       try {
//         const response = await axios.put(`${process.env.REACT_APP_APP_API}/lead/updatelead`, {
//           id: leadId,
//           ...editedLead
//         });
        
//         if (response.data.success) {
//           // Update the local lead data with the edited values
//           const updatedLead = { ...lead, ...editedLead };
//           data.data[0] = updatedLead;
          
//           // Exit edit mode
//           setIsEditing(false);
          
//           // Optional: Show success message
//           toast.success('Lead updated successfully!');
//         } else {
//           // Optional: Show error message
//           toast.error('Failed to update lead. Please try again.');
//         }
//       } catch (error) {
//         console.error('Error updating lead:', error);
//         toast.error(error?.response?.data?.error?.data[0]?.message || "Something went");
//       } finally {
//         setIsSaving(false);
//       }
//     };

// // Modified fetchNotes function with proper loading state handling
// const fetchNotes = async () => {
//   // First, set the active tab to 'notes' to show this tab
//   setActiveTab('notes');
  
//   // If notes are already loaded, don't fetch them again
//   if (dataLoaded.notes) {
//     setIsLoading(false); // Make sure loading is false even when using cached data
//     return;
//   }
  
//   // Set loading state
//   setIsLoading(true);
  
//   try {
//     const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/notes/${leadId}`);
//     setNotes(response?.data?.data?.data);
    
//     // Mark notes as loaded
//     setDataLoaded(prev => ({
//       ...prev,
//       notes: true
//     }));
//   } catch (error) {
//     console.error('Error fetching notes:', error);
//     // Optionally show an error toast or message
//   } finally {
//     setIsLoading(false);
//   }
// };

// // Fetch the tasks

// const fetchTasks = async () => {
//   // First, set the active tab to 'openActivity' to show this tab
//   setActiveTab('openActivity');
  
//   // If tasks are already loaded, don't fetch them again
//   if (dataLoaded.tasks) {
//     setIsLoading(false);
//     return;
//   }
  
//   // Set loading state
//   setIsLoading(true);
  
//   try {
//     const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/openactivities/${leadId}`);
//     setTasks(response?.data?.data?.data || []);
    
//     // Mark tasks as loaded
//     setDataLoaded(prev => ({
//       ...prev,
//       tasks: true
//     }));
//   } catch (error) {
//     console.error('Error fetching tasks:', error);
//     // Optionally show an error toast or message
//   } finally {
//     setIsLoading(false);
//   }
// };


// // Handle tab switching
// const handleTabSwitch = (tab) => {
//   setActiveTab(tab);
  
//   // Reset loading state when switching tabs
//   setIsLoading(true);
  
//   // Fetch data for the selected tab if not already loaded
//   if (tab === 'notes') {
//     // If notes already loaded, set loading to false immediately
//     if (dataLoaded.notes) {
//       setIsLoading(false);
//     } else {
//       fetchNotes();
//     }
//   }


//   if (tab === 'openActivity') {
//     // If tasks already loaded, set loading to false immediately
//     if (dataLoaded.tasks) {
//       setIsLoading(false);
//     } else {
//       fetchTasks();
//     }
//   }

  
//   // You can add similar logic for attachments tab if needed
//   if (tab === 'attachments') {
//     setShowAttachmentsPage(true);
//     setShowAddAttachment(false);
    
//     // If attachments already loaded, set loading to false immediately
//     if (dataLoaded.attachments) {
//       setIsLoading(false);
//     } else {
//       // Mark attachments as being loaded - this helps prevent multiple API calls
//       setDataLoaded(prev => ({
//         ...prev,
//         attachments: true
//       }));
//     }
//   }
// };


//   // Create a new cached version of ShowAttachment
//   const CachedShowAttachment = ({ leadId, onClose }) => {
//     return (
//       <ShowAttachment 
//         leadId={leadId} 
//         onClose={onClose} 
//         cachedData={attachments}
//         setCachedData={setAttachments}
//         dataLoaded={dataLoaded.attachments}
//         isLoading={isLoading}
//         setIsLoading={setIsLoading}
//       />
//     );
//   };

// // Create a cached version of TaskDetailsPage
// const CachedTaskDetailsPage = () => {
//   return (
//     <TaskDetailsPage 
//       leadId={leadId}
//       cachedData={tasks}
//       setCachedData={setTasks}
//       dataLoaded={dataLoaded.tasks}
//       isLoading={isLoading}
//       setIsLoading={setIsLoading}
//     />
//   );
// };

//   // Toggle details visibility
//   const toggleDetails = () => {
//     setShowDetails(!showDetails);
//   };


//   // Status change functionality

//   const handleClick = (status) => {
//     setSelectedButton(status);
//     setIsAddNoteModalOpen(true)
//   };

//   return (
//     <>
//       <Navbar/>
//       <div className="flex min-h-screen bg-gray-50 relative">
//         {/* Main Content Area */}
//         <div className="flex-1 flex flex-col">
//           {/* Top Navigation Bar */}
//           <header className="bg-white shadow-sm border-b border-gray-200">
//             <div className="flex items-center px-2 sm:px-4 py-2">
//               {/* Desktop back button (hidden on mobile) */}
//               <button
//                 className="p-2 mr-2 rounded-full hover:bg-gray-100 hidden lg:block"
//                 onClick={() => navigate("/app/leadview")}
//               >
//                 <ArrowLeft className="w-5 h-5 text-gray-600" />
//               </button>
              
//               {/* Mobile back button (visible only on small screens) */}
//               <button
//                 className="py-1 px-2 mr-2 text-xs rounded-md bg-gray-100 hover:bg-gray-200 flex items-center lg:hidden"
//                 onClick={() => navigate("/app/leadview")}
//               >
//                 <ArrowLeft className="w-4 h-4 mr-1 text-gray-600" />
//               </button>

//               <div className="flex items-center">
//                 <div className="bg-red-500 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
//                   {lead?.First_Name ? lead.First_Name.charAt(0) : 'K'}
//                 </div>
//                 <div className="overflow-hidden">
//                   <h1 className="text-base sm:text-lg font-medium truncate">{lead?.Full_Name || 'Mr. Kushal Pratap Singh'}</h1>
//                   <p className="text-xs sm:text-sm text-gray-500 truncate">{lead?.Company || 'Coding Ninjas'}</p>
//                 </div>
//               </div>

//               <div className="ml-auto flex space-x-1 sm:space-x-2">
//                 {isEditing ? (
//                   <>
//                     <button 
//                       className="border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-gray-50 text-sm sm:text-base"
//                       onClick={toggleEditMode}
//                       disabled={isSaving}
//                     >
//                       <span className="hidden sm:inline">Cancel</span>
//                       <X className="w-4 h-4 inline sm:hidden" />
//                     </button>
//                     <button 
//                       className="border border-blue-500 bg-blue-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-blue-600 text-sm sm:text-base"
//                       onClick={saveLead}
//                       disabled={isSaving}
//                     >
//                       {isSaving ? (
//                         <span className="hidden sm:inline">Saving...</span>
//                       ) : (
//                         <>
//                           <span className="hidden sm:inline">Save</span>
//                           <Save className="w-4 h-4 inline sm:hidden" />
//                         </>
//                       )}
//                     </button>
//                   </>
//                 ) : (
//                   <button 
//                     className={`border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base
//                       ${accessScore < 3 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
//                     onClick={() => {
//                       toggleEditMode();
//                       fetchFormOptions();
//                     }}
//                     disabled={accessScore < 3} // Disable button if accessScore is less than 3
//                   >
//                     <span className="hidden sm:inline">Edit</span>
//                     <Edit className="w-4 h-4 inline sm:hidden" />
//                 </button>
//                 )}
//               </div>
//             </div>
//           </header>

//           {/* Tabs */}
//           <div className="border-b border-gray-200 bg-white">
//             <div className="px-3 sm:px-6 py-2">
//               <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
//                 <button
//                   className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
//                     activeTab === 'overview'
//                       ? 'border-b-2 border-blue-500 text-blue-600'
//                       : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                   onClick={() => handleTabSwitch('overview')}
//                 >
//                   Overview
//                 </button>
//                 <button
//                   className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
//                     activeTab === 'notes'
//                       ? 'border-b-2 border-blue-500 text-blue-600'
//                       : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                   onClick={() => handleTabSwitch('notes')}
//                 >
//                   Notes
//                 </button>
//                 <button
//                   className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
//                     activeTab === 'attachments'
//                       ? 'border-b-2 border-blue-500 text-blue-600'
//                       : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                   onClick={() => handleTabSwitch('attachments')}
//                 >
//                   Attachments
//                 </button>
//                 <button
//                   className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
//                     activeTab === 'openActivity' ? 'border-b-2 border-blue-500 text-blue-600'
//                     : 'text-gray-500 hover:text-gray-700'
//                   }`}
//                   onClick={() => handleTabSwitch('openActivity')}
//                 >
//                  Activities
//                 </button>
//               </div>
//             </div>
//           </div>

        

//           {/* Main Content */}
//           <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
//           {activeTab === 'overview' && (
//             <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">

//         <div className="p-3 sm:p-6 overflow-auto">
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-4">
//             <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-4 justify-center items-center">
//             <button 
//              onClick={() => handleClick("Contacted")}
//               className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
//             >
//               Contacted
//             </button>

//               <button onClick={() => handleClick("Not Contacted")} className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md shadow transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
//                 Not Contacted
//               </button>
//               <button onClick={() => handleClick("Junk Lead")} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
//                 Junk Lead
//               </button>
//               <button onClick={() => handleClick("Not Qualified")} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
//                 Not Qualified
//               </button>
//             </div>
//           </div>
//         </div>

//               <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
//                 <h2 className="text-base sm:text-lg font-medium text-gray-800">Lead Information</h2>
//                 <button
//                   className="text-blue-600 text-xs sm:text-sm hover:underline"
//                   onClick={toggleDetails}
//                 >
//                   {showDetails ? 'Hide Details' : 'Show Details'}
//                 </button>
//               </div>

//               {/* Details content - conditionally rendered based on showDetails state */}
//               {showDetails && (
//                 <>
//                   <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
//                     {/* Left Column */}
//                     <div className="space-y-4 sm:space-y-6">
//                       <div className="flex items-start">
//                         <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Lead Owner</div>
//                         <div className="flex-1 text-sm sm:text-base font-medium">
//                           {lead?.Owner?.name || "Avinash"}
//                         </div>
//                       </div>

//                       <div className="flex items-start">
//                         <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Title</div>
//                         <div className="flex-1 text-sm sm:text-base font-medium">
//                           {isEditing ? (
//                             <input
//                               type="text"
//                               value={editedLead.Designation || ''}
//                               onChange={(e) => handleInputChange('Designation', e.target.value)}
//                               className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                           ) : (
//                             lead?.Designation || "Software Developer"
//                           )}
//                         </div>
//                       </div>

//                       <div className="flex items-start">
//                         <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Mobile</div>
//                         <div className="flex-1 text-sm sm:text-base font-medium flex items-center">
//                           <span className="bg-green-100 rounded-full p-1 mr-2">
//                             <Phone className="w-3 h-3 text-green-600" />
//                           </span>
//                           {isEditing ? (
//                             <input
//                               type="text"
//                               value={editedLead.Mobile || ''}
//                               onChange={(e) => handleInputChange('Mobile', e.target.value)}
//                               className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                           ) : (
//                             lead?.Mobile || "(878) 987-7665"
//                           )}
//                         </div>
//                       </div>

//                       <div className="flex items-start">
//                         <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Phone</div>
//                         <div className="flex-1 text-sm sm:text-base font-medium flex items-center">
//                           <span className="bg-green-100 rounded-full p-1 mr-2">
//                             <Phone className="w-3 h-3 text-green-600" />
//                           </span>
//                           {isEditing ? (
//                             <input
//                               type="text"
//                               value={editedLead.Phone || ''}
//                               onChange={(e) => handleInputChange('Phone', e.target.value)}
//                               className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                           ) : (
//                             lead?.Phone || "(897) 667-7887"
//                           )}
//                         </div>
//                       </div>

//                       <div className="flex items-start">
//                         <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">LeadIdCPY</div>
//                         <div className="flex-1 text-sm sm:text-base font-medium text-gray-700 break-all">
//                           {lead?.id || "5962890000000379001"}
//                         </div>
//                       </div>

//                       <div className="flex items-start">
//                         <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Next Followup</div>
//                         <div className="flex-1 text-sm sm:text-base font-medium text-gray-700">
//                           {isEditing ? (
//                             <input
//                               type="date"
//                               value={editedLead.Next_Followup_Date || ''}
//                               onChange={(e) => handleInputChange('Next_Followup_Date', e.target.value)}
//                               className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                           ) : (
//                             lead?.Next_Followup_Date || lead?.Next_Follow_up_date || "—"
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     {/* Right Column */}
//                     <div className="space-y-4 sm:space-y-6">
//                       <div className="flex items-start">
//                         <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Company</div>
//                         <div className="flex-1 text-sm sm:text-base font-medium">
//                           {isEditing ? (
//                             <input
//                               type="text"
//                               value={editedLead.Company || ''}
//                               onChange={(e) => handleInputChange('Company', e.target.value)}
//                               className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                           ) : (
//                             lead?.Company || "Coding Ninjas"
//                           )}
//                         </div>
//                       </div>

//                       <div className="flex items-start">
//                         <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Lead Name</div>
//                         <div className="flex-1 text-sm sm:text-base font-medium">
//                           {isEditing ? (
//                             <input
//                               type="text"
//                               value={editedLead.Full_Name || ''}
//                               onChange={(e) => handleInputChange('Full_Name', e.target.value)}
//                               className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                           ) : (
//                             lead?.Full_Name || "Mr. Kushal Pratap Singh"
//                           )}
//                         </div>
//                       </div>

//                       <div className="flex items-start">
//                         <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Lead Status</div>
//                         <div className="flex-1">
//                           {isEditing ? (
//                            <select
//                               value={editedLead.Lead_Status || ''}
//                               onChange={(e) => handleInputChange('Lead_Status', e.target.value)}
//                               className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             >
//                               <option value="">Select Status</option>
//                               {leadStatusOptions.map((status) => (
//                                 <option key={status} value={status}>{status}</option>
//                               ))}
//                             </select>
//                           ) : (
//                             <span className={`px-2 sm:px-3 py-0.5 sm:py-1 inline-block rounded-full text-xs sm:text-sm font-medium ${statusColors[currentLeadStatus || "Contacted"]}`}>
//                               {currentLeadStatus || "Contacted"}
//                             </span>
//                           )}
//                         </div>
//                       </div>

//                       <div className="flex items-start">
//                         <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Lead Source</div>
//                         <div className="flex-1 text-sm sm:text-base font-medium">
//                           {isEditing ? (
//                             <select
//                             value={editedLead.Lead_Source || ''}
//                             onChange={(e) => handleInputChange('Lead_Source', e.target.value)}
//                             className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           >
//                             <option value="">Select Source</option>
//                             {leadSourceOptions.map((source) => (
//                               <option key={source} value={source}>{source}</option>
//                             ))}
//                           </select>
//                           ) : (
//                             lead?.Lead_Source || "Advertisement"
//                           )}
//                         </div>
//                       </div>

//                       <div className="flex items-start">
//                         <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Email</div>
//                         <div className="flex-1 text-sm sm:text-base font-medium text-blue-600 break-all">
//                           {isEditing ? (
//                             <input
//                               type="email"
//                               value={editedLead.Email || ''}
//                               onChange={(e) => handleInputChange('Email', e.target.value)}
//                               className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                           ) : (
//                             lead?.Email || "kushal@codingninjas.edu.in"
//                           )}
//                         </div>
//                       </div>

//                       <div className="flex items-start">
//                         <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Secondary Email</div>
//                         <div className="flex-1 text-sm sm:text-base font-medium text-gray-700">
//                           {isEditing ? (
//                             <input
//                               type="email"
//                               value={editedLead.Secondary_Email || ''}
//                               onChange={(e) => handleInputChange('Secondary_Email', e.target.value)}
//                               className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                           ) : (
//                             lead?.Secondary_Email || "—"
//                           )}
//                         </div>
//                       </div>

//                       <div className="flex items-start">
//                         <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Website</div>
//                         <div className="flex-1 text-sm sm:text-base font-medium text-gray-700">
//                           {isEditing ? (
//                             <input
//                               type="url"
//                               value={editedLead.Website || ''}
//                               onChange={(e) => handleInputChange('Website', e.target.value)}
//                               className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             />
//                           ) : (
//                             lead?.Website || "—"
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                     {/* Additional Information Section */}
//                     <div className="border-t border-gray-200 p-4 sm:p-6">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
//                         <div className="flex items-start">
//                           <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Created By</div>
//                           <div className="flex-1">
//                             <div className="text-sm sm:text-base font-medium">
//                               {lead?.Created_By?.name || "Avinash"}
//                             </div>
//                             <div className="text-xs sm:text-sm text-gray-500 mt-1">
//                               {new Date(lead?.Created_Time || "2025-02-12T15:26:00").toLocaleString('en-US', {
//                                 weekday: 'short',
//                                 day: 'numeric',
//                                 month: 'short',
//                                 year: 'numeric',
//                                 hour: 'numeric',
//                                 minute: 'numeric',
//                                 hour12: true
//                               })}
//                             </div>
//                           </div>
//                         </div>

//                         <div className="flex items-start">
//                           <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Modified By</div>
//                           <div className="flex-1">
//                             <div className="text-sm sm:text-base font-medium">
//                               {lead?.Modified_By?.name || "Avinash"}
//                             </div>
//                             <div className="text-xs sm:text-sm text-gray-500 mt-1">
//                               {new Date(lead?.Modified_Time || "2025-02-12T15:26:00").toLocaleString('en-US', {
//                                 weekday: 'short',
//                                 day: 'numeric',
//                                 month: 'short',
//                                 year: 'numeric',
//                                 hour: 'numeric',
//                                 minute: 'numeric',
//                                 hour12: true
//                               })}
//                             </div>
//                           </div>
//                         </div>

//                         <div className="flex items-start">
//                           <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">Plain Phone</div>
//                           <div className="flex-1 text-sm sm:text-base font-medium">
//                             {lead?.smsmagic4__Plain_Phone || lead?.Phone || "8976677887"}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </>
//                 )}

//                 {/* Display a message when details are hidden */}
//                 {!showDetails && (
//                   <div className="p-6 text-center text-gray-500">
//                     Details are hidden. Click "Show Details" to view lead information.
//                   </div>
//                 )}
//               </div>
//             )}

//             {activeTab === 'notes' && (
//               <div className="space-y-4">
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
//                   <div className="flex justify-between items-center mb-4">
//                     <h2 className="text-base sm:text-lg font-medium text-gray-800">
//                     Notes ({notes?.length || 0})
//                     </h2>
//                     <button className="text-blue-600 text-sm hover:underline" onClick={() => setIsAddNoteModalOpen(true)}>
//                       Add Note
//                     </button>
//                   </div>

//                   {isLoading ? (
//                     <div className="text-center text-gray-500 py-6">
//                        <NotesUi/>
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
//                     {/* <div className="flex space-x-3">
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
//                     </div> */}
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

//            {activeTab === 'openActivity' && (
//               <CachedTaskDetailsPage />
//             )}

//           </div>
//         </div>

//         <AddNoteModal
//           isOpen={isAddNoteModalOpen}
//           onClose={() => setIsAddNoteModalOpen(false)}
//           leadId={leadId}
//           username = {username}
//           onNoteAdded={handleNoteAdded}
//         />
//         <AddReasonModal
//           isOpen={isAddNoteModalOpen}
//           onClose={() => setIsAddNoteModalOpen(false)}
//           leadId={leadId}
//           username = {username}
//           leadStatus = {lead?.Lead_Status || undefined}
//           buttonName={selectedButton}
//           onLeadStatusUpdated={handleLeadStatusUpdated}
//         />
//       </div>
//     </>
//   );
// };

// export default LeadInformationPage;
