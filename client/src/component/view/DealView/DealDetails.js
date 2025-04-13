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
// import AddContactNoteModal from "./AddContactNoteModal";
// import ShowAttachment from "../../testPages/ShowAttachment";
// import AttachFileContactPage from "./AttachFileContactPage";
// import ShowContactAttachement from "./ShowContactAttachment";
// import TaskDetailsContactPage from "./TaskDetailsContactPage";
import DetailsShimmer from "../../ui/DetailsShimmer";
import DealStageBar from "../../common/DealStageBar";
import AddDealNoteModal from "./AddDealNoteModal";
import AttachFileDealPage from "./AttachFileDealPage";
import ShowDealAttachement from "./ShowDealAttachment";
import TaskDetailsContactPage from "../ContactView/TaskDetailsContactPage";

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

const DealDetails = ({ accessScore, data, username }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialDealId = location?.state?.dealId;

  const [selectedDealId, setSelectedDealId] = useState(initialDealId);
  console.log(selectedDealId);
  const [dealList, setDealList] = useState([]);
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState("asc");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Deal field variables...

  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});

  //   console.log(fields);

  // Edit variable

  const [editedDeal, setEditedDeal] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [currentStage, setCurrentStage] = useState("qualification"); // Default stage

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

  async function fetchDealsFields() {
    try {
      setLoading(true);

      // Try to get data from cache first
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match("/deal-fields");

      if (cachedResponse) {
        const data = await cachedResponse.json();
        console.log(data);
        processFieldData(data);
        return;
      }

      // If no cached data, fetch from API
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/gets/getfields/Deals`
      );

      const fieldData = response?.data?.data?.fields || [];

      // Store the fetched data in Cache Storage
      const newResponse = new Response(JSON.stringify(fieldData), {
        headers: { "Content-Type": "application/json" },
      });
      await cache.put("/deal-fields", newResponse);

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
    setEditedDeal((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStageChange = async (newStage) => {
    if (accessScore < 3) {
      toast.error("You don't have permission to change the stage");
      return;
    }

    try {
      setIsLoading(true);

      // Update the selectedDeal state to reflect the new stage
      if (selectedDeal && selectedDeal.data && selectedDeal.data.length > 0) {
        const updatedDeal = JSON.parse(JSON.stringify(selectedDeal));
        updatedDeal.data[0].Stage = newStage;
        setSelectedDeal(updatedDeal);
      }

      // Update the currentStage state
      setCurrentStage(newStage);

      toast.success(`Deal stage updated to ${newStage}`);
    } catch (error) {
      console.error("Error updating deal stage:", error);
      toast.error("Failed to update deal stage");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If canceling edit, reset to original values
      if (selectedDeal && fields.length > 0) {
        const resetEditedDeal = fields.reduce((acc, field) => {
          const fieldValue =
            selectedDeal[field.api_name] !== undefined
              ? selectedDeal[field.api_name]
              : "";
          acc[field.api_name] = fieldValue;
          return acc;
        }, {});

        setEditedDeal(resetEditedDeal);
      }
    }
    setIsEditing(!isEditing);
  };
  console.log("Hello ji", selectedDeal?.data[0]?.id);
  // Function to save edited lead data
  const saveLead = async () => {
    setIsSaving(true);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_APP_API}/update/updatemoduledata/Deals`,
        {
          id: selectedDeal?.data[0]?.id,
          ...editedDeal,
        }
      );

      if (response.data.success) {
        // Create a deep copy of the selectedDeal to avoid reference issues
        const updatedDeal = JSON.parse(JSON.stringify(selectedDeal));

        // Update the data array with the edited values
        if (updatedDeal.data && updatedDeal.data.length > 0) {
          updatedDeal.data[0] = {
            ...updatedDeal.data[0],
            ...editedDeal,
          };
        }

        setSelectedDeal(updatedDeal);

        // Exit edit mode
        setIsEditing(false);

        toast.success("Deal updated successfully!");
      } else {
        toast.error("Failed to update deal. Please try again.");
      }
    } catch (error) {
      console.error("Error updating Deal:", error);
      toast.error(
        error?.response?.data?.error?.data[0]?.message || error?.response?.data?.message || "Something went wrong"
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
      editedDeal[fieldKey] !== undefined
        ? editedDeal[fieldKey]
        : selectedDeal?.data[0]?.[fieldKey] || "";

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
    const fieldValue = selectedDeal?.data[0]?.[fieldApiName];

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
    fetchDealsFields();
  }, []);

  useEffect(() => {
    if (selectedDealId) {
      fetchDealDetails(selectedDealId);
      setIsMobileSidebarOpen(false);

      // Set the stage from the data if available
      if (data?.data?.[0]?.Stage) {
        setCurrentStage(data.data[0].Stage);
      }
    }
  }, [selectedDealId, data]);

  const fetchDealDetails = () => {
    setSelectedDeal(data);
    console.log("Hello data", data);
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
        `${process.env.REACT_APP_APP_API}/related/notes/Deals/${selectedDeal?.data[0]?.id}`
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

  const handleNoteAdded = (newNote) => {
    // Update notes list when a new note is added
    // setNotes([newNote, ...notes]);
    setNotes([newNote, ...(notes || [])]);
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
            $se_module:"Deals",
            Who_Id: null,
            What_Id: selectedDeal?.data[0]?.id,
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

    if (tab === "openActivity") {
      // If tasks already loaded, set loading to false immediately
      if (dataLoaded.tasks) {
        setIsLoading(false);
      } else {
        fetchTasks();
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
  const CachedShowAttachment = ({ dealId, onClose }) => {
    return (
      <ShowDealAttachement
        dealId={dealId}
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
          dealId={selectedDealId}
          cachedData={tasks}
          setCachedData={setTasks}
          dataLoaded={dataLoaded.tasks}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />
      );
    };

  return (
    <>
      <Navbar />
      {fields.length <= 0 ? (
        <DetailsShimmer />
      ) : (
        <div className="flex min-h-screen bg-gray-50 relative">
          <div className="flex-1 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-white shadow-sm border-b border-gray-200">
              <div className="flex items-center px-2 sm:px-4 py-2">
                {/* Desktop back button (hidden on mobile) */}
                <button
                  className="p-2 mr-2 rounded-full hover:bg-gray-100 hidden lg:block"
                  onClick={() => navigate("/app/dealView")}
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>

                {/* Mobile back button (visible only on small screens) */}
                <button
                  className="py-1 px-2 mr-2 text-xs rounded-md bg-gray-100 hover:bg-gray-200 flex items-center lg:hidden"
                  onClick={() => navigate("/app/dealView")}
                >
                  <ArrowLeft className="w-4 h-4 mr-1 text-gray-600" />
                </button>

                <div className="flex items-center">
                  <div className="bg-red-500 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                    {selectedDeal?.data[0]?.Deal_Name
                      ? selectedDeal?.data[0]?.Deal_Name.charAt(0)
                      : "K"}
                  </div>
                  <div className="overflow-hidden">
                    <h1 className="text-base sm:text-lg font-medium truncate">
                      {safeRenderValue(selectedDeal?.data[0]?.Deal_Name) ||
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

            {/* Stage Bar component */}

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
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
              {activeTab === "overview" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <DealStageBar
                    fields={fields}
                    data={selectedDeal}
                    currentStage={selectedDeal?.data[0]?.Stage}
                    onStageClick={handleStageChange}
                    accessScore={accessScore}
                    username={username}
                  />
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-base sm:text-lg font-medium text-gray-800">
                      Deal Information
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
                          <div
                            key={field.api_name}
                            className="flex items-start"
                          >
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
                      Details are hidden. Click "Show Details" to view deal
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
                        No notes found for this deal.
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
                    </div>
                    {showAttachmentsPage ? (
                      <CachedShowAttachment
                       dealId={selectedDealId}
                        onClose={() => setShowAttachmentsPage(false)}
                      />
                    ) : showAddAttachment ? (
                      <AttachFileDealPage
                         dealId={selectedDealId}
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
            </div>
          </div>

          <AddDealNoteModal
            isOpen={isAddNoteModalOpen}
            onClose={() => setIsAddNoteModalOpen(false)}
            dealId={selectedDealId}
            username={username}
            onNoteAdded={handleNoteAdded}
          />
        </div>
      )}
    </>
  );
};

export default DealDetails;
