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
import DetailsShimmer from "../../ui/DetailsShimmer";
import DealStageBar from "../../common/DealStageBar";
import AddDealNoteModal from "./AddDealNoteModal";
import AttachFileDealPage from "./AttachFileDealPage";
import ShowDealAttachement from "./ShowDealAttachment";
// import TaskDetailsContactPage from "../ContactView/TaskDetailsContactPage";
import TaskDetailsDealPage from './TaskDetailsDealPage';
import CheckInModal from "../../confirmbox/CheckInModal";
import { textColors } from "../../../config/colors";

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

// Category order enum

const DealDetails = ({ accessScore, data, username }) => {

  const location = useLocation();
  const navigate = useNavigate();
  const initialDealId = location?.state?.dealId;

  const [selectedDealId, setSelectedDealId] = useState(initialDealId);
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

  // location variable for the checkIn purpose
  const [address, setAddress] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function fetchDealsFields() {
    try {
      setLoading(true);

      // Try to get data from cache first
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match("/deal-fields");

      if (cachedResponse) {
        const data = await cachedResponse.json();
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

  // set priority for some field's
  const getOrderedFields = () => {
    // Create a copy of fields to avoid mutating the original
    const orderedFields = [...fields];

    // Find portal user field - try multiple possible field names
    const portalUserIndex = orderedFields.findIndex(
      (field) => field.api_name === "easytocheckeasyportal__Portal_User"
    );

    // Find potential owner field - try multiple possible field names
    const potentialOwnerIndex = orderedFields.findIndex(
      (field) =>
        field.api_name === "Potential_Owner" ||
        field.display_label === "Potential Owner" ||
        field.api_name === "Owner"
    );


    // If both fields exist
    if (portalUserIndex !== -1 && potentialOwnerIndex !== -1) {
      // Remove portal user from its current position
      const portalUserField = orderedFields.splice(portalUserIndex, 1)[0];

      // Insert it right after potential owner
      orderedFields.splice(potentialOwnerIndex + 1, 0, portalUserField);
    }

    return orderedFields;
  };

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

  const toggleCheckIn = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setAddress({ latitude, longitude });
          setModalOpen(true); // open modal after getting location
        },
        (error) => {
          console.error("Error fetching location:", error);
          alert("Failed to get location. Please allow location access.");
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

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
      toast.error(
        error?.response?.data?.error?.data[0]?.message ||
          error?.response?.data?.message ||
          "Something went wrong"
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

    // Special handling for Contact_Name - make it clickable
    if (fieldApiName === "Contact_Name" && fieldValue) {
      const contactId =
        selectedDeal?.data[0]?.Contact_Name?.id ||
        (typeof fieldValue === "object" && fieldValue.id) ||
        null;

      if (contactId) {
        return (
          <span
            className={`text-sm sm:text-base font-medium text-blue-600 cursor-pointer hover:underline ${specialClass}`}
            onClick={() =>
              navigate("/app/contactprofile", { state: { contactId } })
            }
          >
            {safeRenderValue(fieldValue)}
          </span>
        );
      }
    }

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
        <span className={`text-sm sm:text-base font-bold text-gray-700 break-all`}>
          {formatDate(fieldValue)}
        </span>
      );
    }

    // Default display
    return (
      <span className={`text-sm sm:text-base text-gray-700 font-medium ${specialClass}`}>
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
      toast.error("Error fetching notes!");
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
    setActiveTab("openActivity");

    // If tasks are already loaded, don't fetch them again
    if (dataLoaded.tasks) {
      setIsLoading(false);
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/related/openactivities`,
        {
          params: {
            $se_module: "Deals",
            Who_Id: null,
            What_Id: selectedDeal?.data[0]?.id,
          },
        }
      );
      setTasks(response?.data?.data?.data || []);

      // Mark tasks as loaded
      setDataLoaded((prev) => ({
        ...prev,
        tasks: true,
      }));
    } catch (error) {
      toast.error("Error fetching tasks!");
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
      <TaskDetailsDealPage
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
                  <ArrowLeft className="w-4 h-4 mr-1 text-blue-800" />
                </button>

                <div className="flex items-center">
                  <div className="bg-red-500 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                    {selectedDeal?.data[0]?.Deal_Name
                      ? selectedDeal?.data[0]?.Deal_Name.charAt(0)
                      : "K"}
                  </div>
                  <div className="overflow-hidden">
                    <h1 className="text-base sm:text-lg font-bold text-blue-800 truncate">
                      {safeRenderValue(selectedDeal?.data[0]?.Deal_Name) ||
                        "-"}
                    </h1>
                  </div>
                </div>

                <div className="ml-auto flex space-x-1 sm:space-x-2">
                  {isEditing ? (
                   <>
                   <button
                     className="border border-gray-300 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:bg-gray-50 text-sm transition-colors duration-200 flex items-center gap-1.5"
                     onClick={toggleEditMode}
                     disabled={isSaving}
                   >
                     <X className="w-4 h-4" />
                     <span className="hidden sm:inline">Cancel</span>
                   </button>
                   <button
                     className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-md hover:from-blue-600 hover:to-blue-700 text-sm transition-all duration-200 flex items-center gap-1.5 shadow-sm"
                     onClick={saveLead}
                     disabled={isSaving}
                   >
                     {isSaving ? (
                       <>
                         <svg
                           className="animate-spin h-4 w-4 text-white"
                           xmlns="http://www.w3.org/2000/svg"
                           fill="none"
                           viewBox="0 0 24 24"
                         >
                           <circle
                             className="opacity-25"
                             cx="12"
                             cy="12"
                             r="10"
                             stroke="currentColor"
                             strokeWidth="4"
                           ></circle>
                           <path
                             className="opacity-75"
                             fill="currentColor"
                             d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                           ></path>
                         </svg>
                         <span className="hidden sm:inline">Saving...</span>
                       </>
                     ) : (
                       <>
                         <Save className="w-4 h-4" />
                         <span className="hidden sm:inline">Save Changes</span>
                       </>
                     )}
                   </button>
                 </>
                  ) : (
                    // <div className="flex flex-row gap-5">
                    //     <button
                    //   className={`border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base
                    //   ${
                    //     accessScore < 3
                    //       ? "opacity-50 cursor-not-allowed"
                    //       : "hover:bg-gray-50"
                    //   }`}
                    //   onClick={toggleCheckIn}
                    //   disabled={accessScore < 3} // Disable button if accessScore is less than 3
                    // >
                    //   <span className="hidden sm:inline">CheckIn</span>
                    //   <Edit className="w-4 h-4 inline sm:hidden" />
                    // </button>
                    // <button
                    //   className={`border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base
                    //   ${
                    //     accessScore < 3
                    //       ? "opacity-50 cursor-not-allowed"
                    //       : "hover:bg-gray-50"
                    //   }`}
                    //   onClick={toggleEditMode}
                    //   disabled={accessScore < 3} // Disable button if accessScore is less than 3
                    // >
                    //   <span className="hidden sm:inline">Edit</span>
                    //   <Edit className="w-4 h-4 inline sm:hidden" />
                    // </button>
                    // </div>
                    <div className="flex items-center gap-3">
                       <button
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${accessScore < 3
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : "bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:border-red-300 active:bg-red-100 shadow-sm"
              }`}
            onClick={toggleCheckIn}
            disabled={accessScore < 3}
          >
            <div className="relative h-4 w-4 flex-shrink-0">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <path 
                  d="M12 21C12 21 19 14.5 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 14.5 12 21 12 21Z" 
                  fill={accessScore < 3 ? "#D1D5DB" : "#E63946"} 
                  stroke="none"
                />
                <path 
                  d="M9 9L11 11L15 7" 
                  stroke="white" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="hidden sm:inline">CheckIn</span>
          </button>

                      <button
                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                        ${
                          accessScore < 3
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                            : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100"
                        }`}
                        onClick={toggleEditMode}
                        disabled={accessScore < 3}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </header>

            {/* Stage Bar component */}

            {/* Tabs */}
            {/* <div className="border-b border-gray-200 bg-white">
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
            </div> */}

<div className="bg-white border-b border-gray-200">
            <div className="px-4 sm:px-8 pt-1">
              {/* Tab Container with slight shadow */}
              <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-1 scrollbar-hide relative">
                {/* Overview Tab */}
                <button
                  className={`relative px-4 sm:px-5 py-2.5 text-sm font-bold whitespace-nowrap rounded-t-lg transition-all duration-200 group ${
                    activeTab === "overview"
                      ? "text-blue-600 bg-gradient-to-b from-blue-50 to-white"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                  onClick={() => handleTabSwitch("overview")}
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                    <span>Overview</span>
                  </div>
                  {activeTab === "overview" && (
                    <>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600"></span>
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    </>
                  )}
                  {/* Hover effect dot for inactive tabs */}
                  {activeTab !== "overview" && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  )}
                </button>

                {/* Notes Tab */}
                <button
                  className={`relative px-4 sm:px-5 py-2.5 text-sm font-bold whitespace-nowrap rounded-t-lg transition-all duration-200 group ${
                    activeTab === "notes"
                      ? "text-blue-600 bg-gradient-to-b from-blue-50 to-white"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                  onClick={() => handleTabSwitch("notes")}
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    <span>Notes</span>
                  </div>
                  {activeTab === "notes" && (
                    <>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600"></span>
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    </>
                  )}
                  {activeTab !== "notes" && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  )}
                </button>

                {/* Attachments Tab */}
                <button
                  className={`relative px-4 sm:px-5 py-2.5 text-sm font-bold whitespace-nowrap rounded-t-lg transition-all duration-200 group ${
                    activeTab === "attachments"
                      ? "text-blue-600 bg-gradient-to-b from-blue-50 to-white"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                  onClick={() => handleTabSwitch("attachments")}
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                    </svg>
                    <span>Attachments</span>
                  </div>
                  {activeTab === "attachments" && (
                    <>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600"></span>
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    </>
                  )}
                  {activeTab !== "attachments" && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  )}
                </button>

                {/* Activities Tab */}
                <button
                  className={`relative px-4 sm:px-5 py-2.5 text-sm font-bold whitespace-nowrap rounded-t-lg transition-all duration-200 group ${
                    activeTab === "openActivity"
                      ? "text-blue-600 bg-gradient-to-b from-blue-50 to-white"
                      : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                  onClick={() => handleTabSwitch("openActivity")}
                >
                  <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span>Activities</span>
                  </div>
                  {activeTab === "openActivity" && (
                    <>
                      <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600"></span>
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    </>
                  )}
                  {activeTab !== "openActivity" && (
                    <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  )}
                </button>  
              </div>
            </div>
            
            {/* Subtle gradient line for design flair */}
            <div className="h-0.5 bg-gradient-to-r from-blue-100 via-gray-200 to-blue-100"></div>
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
                    <h2 className="text-xl font-bold text-blue-800">
                      Deal Information
                    </h2>
                    <button
                      className="text-blue-800 font-bold text-xs sm:text-sm hover:underline"
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
                        {getOrderedFields().map((field, index) => (
                          <div
                            key={field.api_name}
                            className="flex flex-col sm:flex-row items-center justify-between p-3 rounded-lg gap-2"
                          >
                            <div className="w-full sm:w-1/3 font-semibold text-black mb-1 sm:mb-0">
                              {field.display_label || field.api_name}
                            </div>
                            <div className="flex-1 w-full sm:w-2/3">
                              {isEditing &&
                              field.api_name !== "id" &&
                              field.data_type !== "lookup" &&
                              field.data_type !== "ownerlookup" && field.api_name !== "Modified_Time" && field.api_name !== "Created_Time" ? (
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
                        className={`${textColors.primary} text-sm hover:underline`}
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

              {activeTab === "openActivity" && <CachedTaskDetailsPage />}
            </div>
          </div>

          {modalOpen && (
            <CheckInModal
              location={address}
              onClose={() => setModalOpen(false)}
              username={username}
              module={"Deals"}
              id={selectedDealId}
              onNoteAdded={handleNoteAdded}
            />
          )}

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
