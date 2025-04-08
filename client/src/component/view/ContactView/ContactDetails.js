import React, { useState, useEffect } from "react";
import {
  Phone,
  User,
  Mail,
  Calendar,
  Clock,
  ArrowLeft,
  Search,
  Plus,
  X,
  MapPin,
  MessageCircle,
  UserSquare,
  Edit,
  Save,
  Clipboard,
} from "lucide-react";
import axios from "axios";
import Navbar from "../../common/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import NotesUi from "../../ui/NotesUi";
import AddContactNoteModal from "./AddContactNoteModal";
import ShowAttachment from "../../testPages/ShowAttachment";
import AttachFileContactPage from "./AttachFileContactPage";
import ShowContactAttachement from "./ShowContactAttachment";
import TaskDetailsContactPage from "./TaskDetailsContactPage";
import DetailsShimmer from "../../ui/DetailsShimmer";
import AssociatedDealWithContact from "./AssociatedDealWithContact";

const leadSourceColors = {
  "External Referral": "bg-purple-200 text-purple-700",
  "Internal Referral": "bg-blue-200 text-blue-700",
  "Web Download": "bg-green-200 text-green-700",
  "Trade Show": "bg-yellow-200 text-yellow-700",
  Other: "bg-gray-200 text-gray-700",
};



// Utility function to safely render values that might be objects
const safeRenderValue = (value) => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") {
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
    case "email":
      return "email";
    case "phone":
      return "tel";
    case "date":
      return "date";
    case "url":
      return "url";
    case "number":
    case "integer":
    case "decimal":
      return "number";
    default:
      return "text";
  }
};

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const CACHE_NAME = "crm-cache";

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
      <p className="text-sm text-gray-700">{note.Note_Content}</p>
    </div>
  );
};

const ContactDetails = ({ accessScore,data,username }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialContactId = location?.state?.contactId;

  const [selectedContactId, setSelectedContactId] = useState(initialContactId);
  const [contactList, setContactList] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [newContact, setNewContact] = useState({
    First_Name: "",
    Last_Name: "",
    Email: "",
    Phone: "",
    Lead_Source: "External Referral",
    Description: "",
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editContact, setEditContact] = useState({
    First_Name: "",
    Last_Name: "",
    Email: "",
    Phone: "",
    Lead_Source: "External Referral",
    Description: "",
  });

  // Contact field variables...

  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});

  // Edit variable

  const [editedContact, setEditedContact] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showDetails, setShowDetails] = useState(true); // State to control details visibility
  const [isLoading, setIsLoading] = useState(false);
  const [notes, setNotes] = useState([]);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);

  const [showAttachmentsPage, setShowAttachmentsPage] = useState(true);
  const [showAddAttachment, setShowAddAttachment] = useState(false);

  const [dataLoaded, setDataLoaded] = useState({
    notes: false,
    attachments: false,
    tasks: false,
  });

  const [attachments, setAttachments] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [deals,setDeals] = useState([]);

  async function fetchContactsFields() {
    try {
      setLoading(true);

      // Try to get data from cache first
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match("/contact-fields");

      if (cachedResponse) {
        const data = await cachedResponse.json();
        processFieldData(data);
        return;
      }

      // If no cached data, fetch from API
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/lead/contactfield`
      );

      const fieldData = response?.data?.data?.fields || [];

      // Store the fetched data in Cache Storage
      const newResponse = new Response(JSON.stringify(fieldData), {
        headers: { "Content-Type": "application/json" },
      });
      await cache.put("/contact-fields", newResponse);

      processFieldData(fieldData);
    } catch (error) {
      console.error("Error fetching CRM fields:", error);
      toast.error(
        error?.response?.data?.message || "Failed to load form fields!"
      );
    } finally {
      setLoading(false);
    }
  }

  function processFieldData(fieldData) {
    // Filter fields based on view_type.create
    const filteredFields = fieldData.filter(
      (field) =>
        field.view_type?.create !== false ||
        ["Created_By", "Created_Time", "Modified_Time", "Modified_By"].includes(
          field.api_name
        )
    );

    // add created time and by field in end

    setFields(filteredFields);

    // Initialize formData with default values
    setFormData(
      filteredFields.reduce((acc, field) => {
        acc[field.api_name] = field.data_type === "boolean" ? false : "";
        return acc;
      }, {})
    );
  }

  // Function to handle input changes when editing
  const handleInputChange = (field, value) => {
    setEditedContact((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If canceling edit, reset to original values
      if (selectedContact && fields.length > 0) {
        const resetEditedContact = fields.reduce((acc, field) => {
          const fieldValue =
            selectedContact[field.api_name] !== undefined
              ? selectedContact[field.api_name]
              : "";
          acc[field.api_name] = fieldValue;
          return acc;
        }, {});

        setEditedContact(resetEditedContact);
      }
    }
    setIsEditing(!isEditing);
  };

  // Function to save edited lead data
  const saveLead = async () => {
    setIsSaving(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_APP_API}/lead/updatecontact`,
        {
          id: selectedContact?.data[0]?.id,
          ...editedContact,
        }
      );

      if (response.data.success) {
        // Update the local lead data with the edited values
        // const updatedContact = { ...selectedContact, ...editedContact };
        // setSelectedContact(updatedContact);

        const updatedContact = JSON.parse(JSON.stringify(selectedContact));
      
      // Update the data array with the edited values
      if (updatedContact.data && updatedContact.data.length > 0) {
        updatedContact.data[0] = {
          ...updatedContact.data[0],
          ...editedContact
        };
      }
      
      setSelectedContact(updatedContact);

        // Exit edit mode
        setIsEditing(false);

        toast.success("Contact updated successfully!");
      } else {
        toast.error("Failed to update lead. Please try again.");
      }
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error(
        error?.response?.data?.error?.data[0]?.message || "Something went wrong"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // // Function to render form field based on its type
  const renderFormField = (fieldKey, field) => {
    // Find the field definition
    const fieldDef = fields.find((f) => f.api_name === fieldKey);

    if (!fieldDef) return null;

    // Get the value from editedLead or fall back to lead data
    const rawFieldValue =
      editedContact[fieldKey] !== undefined
        ? editedContact[fieldKey]
        : selectedContact?.data[0]?.[fieldKey] || "";

    // Handle case where the value is an object
    let fieldValue = rawFieldValue;
    if (typeof rawFieldValue === "object" && rawFieldValue !== null) {
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
    if (
      fieldDef.data_type === "picklist" &&
      fieldDef.pick_list_values &&
      fieldDef.pick_list_values.length > 0
    ) {
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
        options = fieldDef.pick_list_values.map(
          (option) => option.display_value || option.actual_value || option
        );
      }

      return (
        <select
          name={fieldKey}
          value={fieldValue || ""}
          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
          className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">
            Select {fieldDef.display_label || fieldDef.display_name}
          </option>
          {options.map((option) => {
            // Handle both string options and object options
            const optionValue =
              typeof option === "object"
                ? option.actual_value || option.display_value
                : option;
            const displayValue =
              typeof option === "object" ? option.display_value : option;

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
          value={fieldValue || ""}
          onChange={(e) => handleInputChange(fieldKey, e.target.value)}
          className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      );
    }
  };

  // Function to render field display (non-edit mode)
  const renderFieldDisplay = (fieldKey, specialClass = "") => {
    const fieldApiName = fieldKey.api_name;
    // Find the field value from lead data
    const fieldValue = selectedContact?.data[0]?.[fieldApiName];

    // Special handling for Lead_Status
    if (fieldApiName === "Lead_Status" && fieldValue) {
      return (
        <span
          className={`px-2 sm:px-3 py-0.5 sm:py-1 inline-block rounded-full text-xs sm:text-sm font-medium ${
            leadSourceColors[fieldValue] || "bg-gray-200 text-gray-700"
          }`}
        >
          {safeRenderValue(fieldValue)}
        </span>
      );
    }

    // Special handling for email fields
    if (fieldApiName === "Email" || fieldApiName === "Secondary_Email") {
      return (
        <span
          className={`text-sm sm:text-base font-medium text-blue-600 break-all ${specialClass}`}
        >
          {safeRenderValue(fieldValue)}
        </span>
      );
    }

    if (fieldKey.data_type === "datetime") {
      return (
        <span className={`text-sm sm:text-base font-bold break-all`}>
          {formatDate(fieldValue)}
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

  useEffect(() => {
    fetchContacts();
    fetchContactsFields();
  }, []);

  useEffect(() => {
    if (selectedContactId) {
      fetchContactDetails(selectedContactId);
      setIsMobileSidebarOpen(false);
    }
  }, [selectedContactId]);

  const fetchContacts = async () => {
    try {
      const CACHE_NAME = "crm-cache";
      const cache = await caches.open(CACHE_NAME);

      // Check if data is present in cache
      const cachedResponse = await cache.match("/contacts-free");
      if (cachedResponse) {
        const data = await cachedResponse.json();
        setContactList(data);
        setLoading(false);

        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/get/contactdetails`
      );
      if (response.status === 200) {
        setContactList(response.data?.data || []);

        const newResponse = new Response(JSON.stringify(response.data?.data), {
          headers: { "Content-Type": "application/json" },
        });
        await cache.put("/contacts-free", newResponse);
      }
    } catch (error) {
      console.error("Error fetching contacts", error);
    }
  };

  const fetchContactDetails = () => {
    setSelectedContact(data);
  };

  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/lead/createContact`,
        newContact
      );
      if (response?.status === 200) {
        toast.success("Contact Created Successfully!");
        fetchContacts();
      }
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error(error?.response?.data?.error?.data[0]?.message);
    }
    setIsCreateModalOpen(false);
    setNewContact({
      First_Name: "",
      Last_Name: "",
      Email: "",
      Phone: "",
      Lead_Source: "External Referral",
      Description: "",
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Modified fetchNotes function with proper loading state handling
  const fetchNotes = async () => {
    // First, set the active tab to 'notes' to show this tab
    setActiveTab("notes");

    // If notes are already loaded, don't fetch them again
    if (dataLoaded.notes) {
      setIsLoading(false); // Make sure loading is false even when using cached data
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/related/notes/${"Contacts"}/${
          selectedContact?.data[0]?.id
        }`
      );
      setNotes(response?.data?.data?.data);

      // Mark notes as loaded
      setDataLoaded((prev) => ({
        ...prev,
        notes: true,
      }));
    } catch (error) {
      console.error("Error fetching notes:", error);
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
        {
          params:{
            $se_module:"Contacts",
            Who_Id: selectedContact?.data[0]?.id,
            What_Id: null
          }
        }
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


  const fetchAssociatedDeals = async ()=>{
    setActiveTab('deals');

    // If tasks are already loaded, don't fetch them again
    if (dataLoaded.deals) {
      setIsLoading(false);
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/deal/associateddeal/${selectedContact?.data[0]?.id}`);
      setDeals(response?.data?.data?.data || []);

      // Mark tasks as loaded
      setDataLoaded(prev => ({
        ...prev,
        deals: true
      }));
    } catch (error) {
      console.error('Error fetching deals:', error);
      // Optionally show an error toast or message
    } finally {
      setIsLoading(false);
    }
  }

  const handleNoteAdded = (newNote) => {
    // Update notes list when a new note is added
    // setNotes([newNote, ...notes]);
    setNotes([newNote, ...(notes || [])]);
  };


  console.log('dealdata',deals);
  
  // Handle tab switching
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);

    // // Reset loading state when switching tabs
    // setIsLoading(true);

    // Fetch data for the selected tab if not already loaded
    if (tab === "notes") {
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

    if(tab === 'deals'){
      if(dataLoaded.deals){
        setIsLoading(false);
      }else{
        fetchAssociatedDeals();
      }
    }

    // You can add similar logic for attachments tab if needed
    if (tab === "attachments") {
      setShowAttachmentsPage(true);
      setShowAddAttachment(false);

      // If attachments already loaded, set loading to false immediately
      if (dataLoaded.attachments) {
        setIsLoading(false);
      } else {
        // Mark attachments as being loaded - this helps prevent multiple API calls
        setDataLoaded((prev) => ({
          ...prev,
          attachments: true,
        }));
      }
    }
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  // Create a new cached version of ShowAttachment
  const CachedShowAttachment = ({ contactId, onClose }) => {
    return (
      <ShowContactAttachement
        contactId={contactId}
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
      <TaskDetailsContactPage
        contactId={selectedContactId}
        cachedData={tasks}
        setCachedData={setTasks}
        dataLoaded={dataLoaded.tasks}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    );
  };

  // Create a cached version of associatedeal
  const CachedDealWithContact = () => {
    return (
      <AssociatedDealWithContact
        deals={deals}
        loading={isLoading}
      />
    );
  };

  return (
    <>
      <Navbar />
      {
      fields.length <= 0 ? (<DetailsShimmer/>): (
      <div className="flex min-h-screen bg-gray-50 relative">
        <div className="flex-1 flex flex-col">
          {/* Top Navigation Bar */}
          <header className="bg-white shadow-sm border-b border-gray-200">
            <div className="flex items-center px-2 sm:px-4 py-2">
              {/* Desktop back button (hidden on mobile) */}
              <button
                className="p-2 mr-2 rounded-full hover:bg-gray-100 hidden lg:block"
                onClick={() => navigate("/app/contactview")}
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>

              {/* Mobile back button (visible only on small screens) */}
              <button
                className="py-1 px-2 mr-2 text-xs rounded-md bg-gray-100 hover:bg-gray-200 flex items-center lg:hidden"
                onClick={() => navigate("/app/contactview")}
              >
                <ArrowLeft className="w-4 h-4 mr-1 text-gray-600" />
              </button>

              <div className="flex items-center">
                <div className="bg-red-500 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                  {selectedContact?.First_Name
                    ? selectedContact.First_Name.charAt(0)
                    : "K"}
                </div>
                <div className="overflow-hidden">
                  <h1 className="text-base sm:text-lg font-medium truncate">
                    {safeRenderValue(selectedContact?.data[0]?.Full_Name) ||
                      "Mr. Kushal Pratap Singh"}
                  </h1>
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
                      ${
                        accessScore < 3
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-gray-50"
                      }`}
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
                  className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === "overview"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabSwitch("overview")}
                >
                  Overview
                </button>
                <button
                  className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === "notes"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabSwitch("notes")}
                >
                  Notes
                </button>
                <button
                  className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === "attachments"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabSwitch("attachments")}
                >
                  Attachments
                </button>
                <button
                  className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === "openActivity"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabSwitch("openActivity")}
                >
                  Activities
                </button>

                <button
                  className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
                    activeTab === "deals"
                      ? "border-b-2 border-blue-500 text-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => handleTabSwitch("deals")}
                >
                  Deals
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
            {activeTab === "overview" && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-base sm:text-lg font-medium text-gray-800">
                    Contact Information
                  </h2>
                  <button
                    className="text-blue-600 text-xs sm:text-sm hover:underline"
                    onClick={toggleDetails}
                  >
                    {showDetails ? "Hide Details" : "Show Details"}
                  </button>
                </div>

                {/* Details content - conditionally rendered based on showDetails state */}
                {showDetails && (
                  <>
                    <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
                      {/* Display all fields without filtering */}
                      {fields.map((field, index) => (
                        <div key={field.api_name} className="flex items-start">
                          <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">
                            {field.display_label || field.api_name}
                          </div>
                          <div className="flex-1">
                            {isEditing &&
                            field.api_name !== "id" &&
                            field.data_type !== "lookup" &&
                            field.data_type !== "ownerlookup" ? (
                              renderFormField(field.api_name, field)
                            ) : field.api_name === "Mobile" ||
                              field.api_name === "Phone" ? (
                              <div className="flex items-center">
                                <span className="bg-green-100 rounded-full p-1 mr-2">
                                  <Phone className="w-3 h-3 text-green-600" />
                                </span>
                                {renderFieldDisplay(field)}
                              </div>
                            ) : field.api_name === "Email" ||
                              field.api_name === "Secondary_Email" ? (
                              renderFieldDisplay(field, "text-blue-600")
                            ) : (
                              renderFieldDisplay(field)
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
                    Details are hidden. Click "Show Details" to view lead
                    information.
                  </div>
                )}
              </div>
            )}

            {activeTab === "notes" && (
              <div className="space-y-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-base sm:text-lg font-medium text-gray-800">
                      Notes ({notes?.length || 0})
                    </h2>
                    <button
                      className="text-blue-600 text-sm hover:underline"
                      onClick={() => setIsAddNoteModalOpen(true)}
                    >
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

            {activeTab === "attachments" && (
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
                    <CachedShowAttachment
                      contactId={selectedContactId}
                      onClose={() => setShowAttachmentsPage(false)}
                    />
                  ) : showAddAttachment ? (
                    <AttachFileContactPage
                      contactId={selectedContactId}
                      onClose={() => setShowAddAttachment(false)}
                    />
                  ) : (
                    <div className="text-center text-gray-500 py-6">
                      Click "Show All Attachments" to view files or "Add New
                      Attachment" to upload files.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'openActivity' && (
              <CachedTaskDetailsPage />
            )}
            {activeTab === 'deals' && (
              <CachedDealWithContact />
            )}
           
            
          </div>
        </div>

        <AddContactNoteModal
          isOpen={isAddNoteModalOpen}
          onClose={() => setIsAddNoteModalOpen(false)}
          contactId={selectedContactId}
          username={username}
          onNoteAdded={handleNoteAdded}
        />
      </div>
      )}
    </>
  );
};

export default ContactDetails;
