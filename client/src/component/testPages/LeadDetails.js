import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Paperclip,
  Edit,
  Send,
  MoreHorizontal,
  Phone,
  Mail,
  Clock,
  Calendar,
  Globe,
  MapPin,
  User,
  Briefcase,
  Tag,
  Bell,
  Menu,
  X,
  Clipboard,
  Save,
  ArrowRight,
  CheckCircle, XCircle, AlertTriangle, AlertCircle
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import Navbar from "../common/Navbar";

import toast from "react-hot-toast";
import TaskDetailsPage from "./TaskDetailsPage";
import ShowAttachment from "./ShowAttachment";
import AttachFilePage from "./AttachFilePage";
import NotesUi from "../ui/NotesUi";
import ShimmerPage from "../ui/ContactFormShimmer";
import DetailsShimmer from "../ui/DetailsShimmer";
import ConvertLead from "../forms/ConvertLead";
import CheckInModal from "../confirmbox/CheckInModal";
import {bgColors, focus, hoverColors} from '../../config/colors';

const statusColors = {
  Contacted: "bg-green-200 text-green-700",
  "Contact in Future": "bg-purple-200 text-purple-700",
  "Fresh Lead": "bg-blue-200 text-blue-700",
  New: "bg-gray-200 text-gray-700",
  "Junk Lead": "bg-red-200 text-red-700",
  "Not Qualified": "bg-orange-200 text-orange-700",
};

const CACHE_NAME = "crm-cache";

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

const AddNoteModal = ({ isOpen, onClose, leadId, username, onNoteAdded }) => {
  const [noteContent, setNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const noteTitle = `Added by ${username}`;
      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/related/createnote/Leads/${leadId}`,
        {
          Note_Title: noteTitle,
          Note_Content: noteContent,
        }
      );

      // Adding the note to the list currently

      if (response?.status === 200) {
        const newNote = {
          id:
            response?.data?.data?.data[0]?.details.id || Date.now().toString(),
          Created_Time: new Date().toISOString(),
          Note_Title: noteTitle,
          Note_Content: noteContent,
        };

        onNoteAdded(newNote);
      }

      // Reset form and close modal
      setNoteContent("");
      onClose();
    } catch (error) {
      console.error("Error adding note:", error);
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
            <label
              htmlFor="noteTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
            <label
              htmlFor="noteContent"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
              className={`px-4 py-2 text-sm font-medium text-white ${bgColors.primary} rounded-md ${hoverColors.primary} focus:outline-none focus:ring-2 ${focus.ring} focus:ring-offset-2`}
            >
              {isSubmitting ? "Adding..." : "Add Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddReasonModal = ({
  isOpen,
  onClose,
  leadId,
  username,
  leadStatus,
  buttonName,
  onLeadStatusUpdated,
  onChangeStatus
}) => {
  const [noteContent, setNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const noteTitle = `Added by ${username}`;
      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/related/createnote/Leads/${leadId}`,
        {
          Note_Title: noteTitle,
          Note_Content: noteContent,
        }
      );

      // If note was created successfully, update the lead status
      if (response?.status === 200) {
        try {
          const updateResponse = await axios.put(
            `${process.env.REACT_APP_APP_API}/update/updatemoduledata/Leads`,
            {
              id: leadId, // Added missing Lead_ID parameter
              Lead_Status: buttonName,
            }
          );

          if (updateResponse.data.success) {
            toast.success("Lead Status changed Successfully!");
            onLeadStatusUpdated(buttonName);
            onChangeStatus(buttonName);
          } else {
            toast.error("Failed to update lead. Please try again.");
          }
        } catch (error) {
          console.error("Error updating lead:", error);
          toast.error(
            error?.response?.data?.error?.data[0]?.message ||
              error?.response?.data?.message ||
              "Something went wrong"
          );
        }
      }

      // Reset form and close modal
      setNoteContent("");
      onClose();
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
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
            <label
              htmlFor="noteTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
            <label
              htmlFor="noteContent"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
              {isSubmitting ? "Changing..." : "Change Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Field priority enums
const PRIORITY = Object.freeze({
  // General Information priorities
  OWNER: 1,
  CLUSER: 2,
  COMPANY: 3,
  SALUTATION: 4,
  FIRST_NAME: 5,
  LAST_NAME: 6,
  DESIGNATION: 7,
  LEAD_STATUS: 8,
  LEAD_SOURCE: 9,
  EMAIL: 10,
  PHONE: 11,
  MOBILE: 12,

  // Address priorities
  STREET: 1,
  ADDRESS: 2,
  CITY: 3,
  STATE: 4,
  ZIP: 5,
  COUNTRY: 6,

  // Default priority
  DEFAULT: 100,
});

// Category order enum
const CATEGORY_ORDER = Object.freeze({
  GENERAL: "General Information",
  COMPANY: "Company Information",
  ADDRESS: "Address Information",
  OTHER: "Other Information",
});

const LeadInformationPage = ({ data, leadId, username, accessScore }) => {
  const lead = data?.data[0]; // Take the first lead from the array

  console.log(lead);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(true); // State to control details visibility

  const [activeTab, setActiveTab] = useState("overview");
  const [notes, setNotes] = useState([]);

  const [tasks, setTasks] = useState([]);

  // Edit variable
  const [isEditing, setIsEditing] = useState(false);
  const [editedLead, setEditedLead] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();

  // Lead Status changed
  const [currentLeadStatus, setCurrentLeadStatus] = useState(
    lead?.Lead_Status || ""
  );

  const sidebarRef = useRef(null);

  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [isAddReasonModalOpen, setIsAddReasonModalOpen] = useState(false);

  // const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);

  const [showAttachmentsPage, setShowAttachmentsPage] = useState(true);
  const [showAddAttachment, setShowAddAttachment] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);

  // Button name variable

  const [selectedButton, setSelectedButton] = useState("");

  const [dataLoaded, setDataLoaded] = useState({
    notes: false,
    attachments: false,
    tasks: false,
  });

  const [attachments, setAttachments] = useState([]);
  // for conversion of lead
  const [contact, setContacts] = useState([]);

  // location variable for the checkIn purpose
  const [location, setLocation] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [activeStatus, setActiveStatus] = useState(lead?.Lead_Status || "");

    const [leadStatusOptions, setLeadStatusOptions] = useState([]);
  

  useEffect(() => {
    fetchCRMFields();
  }, []);

  // Initialize editedLead with lead data when component mounts or lead data changes
  useEffect(() => {
    if (lead && fields.length > 0) {
      // Create an object with all form fields initialized from lead data
      const initialEditedLead = fields.reduce((acc, field) => {
        // Use the API name to get the value from the lead object
        const fieldValue =
          lead[field.api_name] !== undefined ? lead[field.api_name] : "";
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
        `${process.env.REACT_APP_APP_API}/gets/getfields/Leads`
      );

      const fieldData = response?.data?.data?.fields || [];

      // Store the fetched data in Cache Storage
      const newResponse = new Response(JSON.stringify(fieldData), {
        headers: { "Content-Type": "application/json" },
      });
      await cache.put("/lead-form-fields", newResponse);

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


      // Extract Lead Status picklist values for dynamic buttons
      const leadStatusField = filteredFields.find(field => field.api_name === "Lead_Status");
      if (leadStatusField && leadStatusField.pick_list_values) {
        const leadStatusValues = leadStatusField.pick_list_values
          .map(option => option.display_value || option.actual_value || option)
          .filter(
            v => v && v !== "-None-" && v !== "Select Lead Status"
          );
        setLeadStatusOptions(leadStatusValues);
      } else {
        setLeadStatusOptions([]);
      }

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
    setEditedLead((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function to toggle edit mode
  const toggleEditMode = () => {
    if (isEditing) {
      // If canceling edit, reset to original values
      if (lead && fields.length > 0) {
        const resetEditedLead = fields.reduce((acc, field) => {
          const fieldValue =
            lead[field.api_name] !== undefined ? lead[field.api_name] : "";
          acc[field.api_name] = fieldValue;
          return acc;
        }, {});

        setEditedLead(resetEditedLead);
      }
    }
    setIsEditing(!isEditing);
  };

  const toggleCheckIn = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude });
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
        `${process.env.REACT_APP_APP_API}/update/updatemoduledata/Leads`,
        {
          id: leadId,
          ...editedLead,
        }
      );

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

        toast.success("Lead updated successfully!");
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

  // Function to handle lead conversion
  const convertLeadHandler = async () => {
    setIsSaving(true); // Start loading state
    // Example values (replace these with actual state or props if needed)
    const email = lead.Email || "test@example.com";
    const phone = lead.Phone || "9876543210";
    const company = lead.Company;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/lead/searchrecords`,
        {
          params: {
            email,
            phone,
            company,
          },
        }
      );

      if (response.data.success) {
        // Set contacts data correctly
        setContacts(response.data.data);
        // Open the support popup
        setIsSupportOpen(true);
      } else {
        toast.error("Failed to find matching records. Please try again.");
      }
    } catch (error) {
      console.error("Error searching lead records:", error);
      toast.error(
        error?.response?.data?.error?.data?.[0]?.message ||
          error?.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setIsSaving(false); // End loading state
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
    setFormData((prevData) => ({
      ...prevData,
      [name]: fieldValue,
    }));

    // Also update editedLead for edit mode
    setEditedLead((prev) => ({
      ...prev,
      [name]: fieldValue,
    }));
  };

  // Function to render form field based on its type
  const renderFormField = (field, fieldDef) => {
    // Get the value from editedLead or fall back to lead data

    const rawFieldValue =
      editedLead[field.api_name] !== undefined
        ? editedLead[field.api_name]
        : lead?.[field.api_name] || "";

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
      if (fieldDef.pick_list_values) {
        // Use the pick_list_values from the field definition if available
        options = fieldDef.pick_list_values.map(
          (option) => option.display_value || option.actual_value || option
        );
      }

      return (
        <select
          name={field.api_name}
          value={fieldValue || ""}
          onChange={(e) => handleInputChange(field.api_name, e.target.value)}
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
          name={field.api_name}
          checked={fieldValue || false}
          onChange={(e) => handleInputChange(field.api_name, e.target.checked)}
          className="w-5 h-5"
        />
      );
    } else {
      // For all other field types, use the appropriate input type
      return (
        <input
          type={getInputType(field)}
          name={field.api_name}
          value={fieldValue || ""}
          onChange={(e) => handleInputChange(field.api_name, e.target.value)}
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
    if (fieldKey === "Lead_Status" && fieldValue) {
      return (
        <span
          className={`px-2 sm:px-3 py-0.5 sm:py-1 inline-block rounded-full text-xs sm:text-sm font-medium ${
            statusColors[fieldValue] || "bg-gray-200 text-gray-700"
          }`}
        >
          {safeRenderValue(fieldValue)}
        </span>
      );
    }

    // Special handling for email fields
    if (fieldKey === "Email" || fieldKey === "Secondary_Email") {
      return (
        <span
          className={`text-sm sm:text-base font-medium text-blue-600 break-all ${specialClass}`}
        >
          {safeRenderValue(fieldValue)}
        </span>
      );
    }

    if (fieldKey === "Modified_Time" || fieldKey === "Created_Time") {
      return formatDate(fieldValue);
    }
    // Default display
    return (
      <span className={`text-sm sm:text-base text-gray-700 font-medium ${specialClass}`}>
        {safeRenderValue(fieldValue)}
      </span>
    );
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
        `${process.env.REACT_APP_APP_API}/related/notes/${"Leads"}/${leadId}`
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
            $se_module: "Leads",
            What_Id: leadId,
            Who_Id: null,
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
      console.error("Error fetching tasks:", error);
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

  const handleButtonStatus = (status)=>{
    console.log("Status",status);
    setActiveStatus(status);
  }

  const handleLeadStatusUpdated = (newStatus) => {
    setCurrentLeadStatus(newStatus);
    // Update the lead data with the new status
    if (data?.data?.[0]) {
      data.data[0].Lead_Status = newStatus;
    }
  };

  // Handle tab switching
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);

    // Reset loading state when switching tabs
    setIsLoading(true);

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

  // Make the priority...
  // Define field priority for each category using enums
  const getFieldPriority = (fieldName) => {
    const lowerName = fieldName.toLowerCase();

    // General contact information priorities

    if (lowerName.includes("salu")) return PRIORITY.SALUTATION;
    if (lowerName.includes("first_name")) return PRIORITY.FIRST_NAME;
    if (lowerName.includes("last_name")) return PRIORITY.LAST_NAME;
    if (lowerName.includes("desig")) return PRIORITY.DESIGNATION;
    if (lowerName.includes("lead_status")) return PRIORITY.LEAD_STATUS;
    if (lowerName.includes("lead_source")) return PRIORITY.LEAD_SOURCE;
    if (lowerName.includes("email")) return PRIORITY.EMAIL;
    if (lowerName.includes("phone")) return PRIORITY.PHONE;
    if (lowerName.includes("mobile")) return PRIORITY.MOBILE;
    if (lowerName.includes("company")) return PRIORITY.COMPANY;
    if (lowerName.includes("owner")) return PRIORITY.OWNER;
    if (lowerName.includes("easy")) return PRIORITY.CLUSER;

    // Address information priorities
    if (lowerName.includes("street")) return PRIORITY.STREET;
    if (lowerName.includes("address")) return PRIORITY.ADDRESS;
    if (lowerName.includes("city")) return PRIORITY.CITY;
    if (lowerName.includes("state")) return PRIORITY.STATE;
    if (lowerName.includes("zip")) return PRIORITY.ZIP;
    if (lowerName.includes("country")) return PRIORITY.COUNTRY;

    // Default priority
    return PRIORITY.DEFAULT;
  };

  // Replace your existing renderFormFields function with this:
  function renderFormFields() {
    const categoryOrder = [
      CATEGORY_ORDER.GENERAL,
      CATEGORY_ORDER.COMPANY,
      CATEGORY_ORDER.ADDRESS,
      CATEGORY_ORDER.OTHER,
    ];

    const groupedFields = {};

    // Group fields by category
    fields.forEach((field) => {
      let category = CATEGORY_ORDER.OTHER;

      const fieldName = field.api_name.toLowerCase();

      if (
        fieldName.includes("owner") ||
        fieldName.includes("easy") ||
        fieldName.includes("salu") ||
        fieldName.includes("last_name") ||
        fieldName.includes("first_name") ||
        fieldName.includes("lead_source") ||
        fieldName.includes("lead_status") ||
        fieldName.includes("email") ||
        fieldName.includes("phone") ||
        fieldName.includes("mobile") ||
        fieldName.includes("contact") ||
        fieldName.includes("company") ||
        fieldName.includes("desig")
      ) {
        category = CATEGORY_ORDER.GENERAL;
      } else if (
        fieldName.includes("organization") ||
        fieldName.includes("business") ||
        fieldName.includes("industry") ||
        fieldName.includes("annual") ||
        fieldName.includes("revenue")
      ) {
        category = CATEGORY_ORDER.COMPANY;
      } else if (
        fieldName.includes("address") ||
        fieldName.includes("street") ||
        fieldName.includes("city") ||
        fieldName.includes("state") ||
        fieldName.includes("country") ||
        fieldName.includes("zip") ||
        fieldName.includes("postal")
      ) {
        category = CATEGORY_ORDER.ADDRESS;
      }

      if (!groupedFields[category]) {
        groupedFields[category] = [];
      }

      groupedFields[category].push(field);
    });

    // Sort fields within each category based on priority
    Object.keys(groupedFields).forEach((category) => {
      groupedFields[category].sort((a, b) => {
        const priorityA = getFieldPriority(a.api_name);
        const priorityB = getFieldPriority(b.api_name);

        // First sort by priority
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }

        // If same priority, sort alphabetically by display label
        const labelA = a.display_label || a.api_name;
        const labelB = b.display_label || b.api_name;
        return labelA.localeCompare(labelB);
      });
    });

    // Render categories in proper order
    return categoryOrder.map((category) => {
      if (!groupedFields[category] || groupedFields[category].length === 0) {
        return null;
      }

      return (
        <div
          key={category}
          className="mb-12 rounded-lg shadow-md bg-white p-6 transition-all duration-300 hover:shadow-lg"
        >
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6 flex items-center">
            <span className="mr-2 font-bold">{category}</span>
            {isEditing && (
              <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">
                Editing
              </span>
            )}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {groupedFields[category].map((field) => (
              <div
                key={field.api_name}
                className={`flex flex-col sm:flex-row items-center justify-between p-3 rounded-lg gap-2 ${
                  isEditing &&
                  field.api_name !== "id" &&
                  field.data_type !== "lookup" &&
                  field.data_type !== "ownerlookup"
                    ? "hover:bg-gray-50"
                    : "hover:bg-gray-50"
                } transition-colors duration-200`}
              >
                                {/* className={`flex flex-row items-start p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200`} */}

                <div className="w-full sm:w-1/3 font-semibold text-black mb-1 sm:mb-0">
                  {field.display_label || field.api_name}
                </div>

                <div className="flex-1 w-full sm:w-2/3">
                  {isEditing &&
                  field.api_name !== "id" &&
                  field.data_type !== "lookup" &&
                  field.data_type !== "ownerlookup" && field.api_name !== "Modified_Time" && field.api_name !== "Created_Time" ? (
                    <div className="w-full focus-within:ring-2 focus-within:ring-blue-300 rounded transition-all duration-200">
                      {renderFormField(field, field)}
                    </div>
                  ) : field.api_name === "Mobile" ||
                    field.api_name === "Phone" ? (
                    <div className="flex items-center group">
                      <span className="bg-green-100 rounded-full p-1.5 mr-2 group-hover:bg-green-200 transition-colors duration-200">
                        <Phone className="w-4 h-4 text-green-600" />
                      </span>
                      <div className="font-medium">
                        {renderFieldDisplay(field.api_name)}
                      </div>
                    </div>
                  ) : field.api_name === "Email" ||
                    field.api_name === "Secondary_Email" ? (
                    <div className="text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200">
                      {renderFieldDisplay(field.api_name, "text-blue-600")}
                    </div>
                  ) : (
                    <div className="text-gray-800 font-medium">
                      {renderFieldDisplay(field.api_name)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    });
  }

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
    setIsAddReasonModalOpen(true);
  };

  return (
    <>
      <Navbar />
      {fields.length <= 0 ? (
        <DetailsShimmer />
      ) : (
        <div className="flex min-h-screen bg-gray-50 relative">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {/* Top Navigation Bar */}
            <header className="bg-white  border-gray-200 sticky top-0 z-30">
  <div className="flex items-center px-3 sm:px-6 py-3">
    {/* Desktop back button with improved hover effect */}
    <button
      className="p-2 mr-2 rounded-full text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 hidden lg:flex items-center justify-center"
      onClick={() => navigate("/app/leadview")}
    >
      <ArrowLeft className="w-5 h-5" />
    </button>

    {/* Mobile back button with better styling */}
    <button
      className="py-1.5 px-2.5 mr-2 text-xs rounded-md bg-gray-50 hover:bg-gray-100 flex items-center shadow-sm transition-all duration-200 lg:hidden"
      onClick={() => navigate("/app/leadview")}
    >
      <ArrowLeft className="w-4 h-4 mr-1 text-blue-800" />
    </button>

    {/* Lead avatar and info with improved spacing and styling */}
    <div className="flex items-center">
      <div className="relative">
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 shadow-md">
          {lead?.First_Name ? lead.First_Name.charAt(0) : "K"}
        </div>
        {/* Status indicator dot */}
        <div className="absolute bottom-0 right-2 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      </div>
      <div className="overflow-hidden">
        <h1 className="text-base sm:text-xl font-bold truncate text-blue-800">
          {safeRenderValue(lead?.Full_Name) ||
            "_"}
        </h1>
        <div className="flex items-center text-xs sm:text-sm text-gray-500">
          <span className="truncate">
            {safeRenderValue(lead?.Company) || "Easytocheck Software Solutions"}
          </span>
          <span className="mx-1.5 text-gray-400">•</span>
          <span className="text-blue-800 font-medium">Lead</span>
        </div>
      </div>
    </div>

    {/* Actions section with improved styling */}
    <div className="ml-auto flex items-center gap-2 sm:gap-3">
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
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Check-in button with enhanced styling */}
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

          {/* Convert Lead button with improved visual design */}
          <button 
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${accessScore < 3 || isSaving
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
                : "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 active:from-green-700 active:to-emerald-700 text-white shadow-sm"
              }`}
            onClick={() => { 
              convertLeadHandler(); 
            }} 
            disabled={accessScore < 3 || isSaving}
          >
            {isSaving ? ( 
              <span className="flex items-center"> 
                <svg 
                  className="animate-spin mr-2 h-4 w-4 text-white" 
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
                Converting... 
              </span> 
            ) : ( 
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Convert Lead</span>
              </>
            )}
          </button>

          {/* Edit button with improved styling */}
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
              ${accessScore < 3
                ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
                : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 hover:border-blue-300 active:bg-blue-100 shadow-sm"
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
                 
                 <div className="p-3 sm:p-6 overflow-auto">
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-3 sm:grid-cols-8 gap-0.5 p-1">
          {leadStatusOptions.map((status) => {
            let icon = null;
            let btnClass = "";
            // Choose icon and color based on status
            if (status === "Contacted") {
              icon = <CheckCircle className={`w-4 h-4 mr-2 ${activeStatus === status ? "text-white" : "text-green-500"}`} />;
              btnClass = activeStatus === status
                ? "bg-gradient-to-br from-green-400 to-emerald-600 text-white"
                : "bg-white text-green-600 hover:bg-green-50";
            } else if (status === "Not Contacted") {
              icon = <XCircle className={`w-4 h-4 mr-2 ${activeStatus === status ? "text-white" : "text-gray-500"}`} />;
              btnClass = activeStatus === status
                ? "bg-gradient-to-br from-gray-500 to-slate-700 text-white"
                : "bg-white text-gray-600 hover:bg-gray-50";
            } else if (status === "Junk Lead") {
              icon = <AlertTriangle className={`w-4 h-4 mr-2 ${activeStatus === status ? "text-white" : "text-red-500"}`} />;
              btnClass = activeStatus === status
                ? "bg-gradient-to-br from-red-400 to-rose-600 text-white"
                : "bg-white text-red-600 hover:bg-red-50";
            } else if (status === "Not Qualified") {
              icon = <AlertCircle className={`w-4 h-4 mr-2 ${activeStatus === status ? "text-white" : "text-orange-500"}`} />;
              btnClass = activeStatus === status
                ? "bg-gradient-to-br from-orange-400 to-amber-600 text-white"
                : "bg-white text-orange-600 hover:bg-orange-50";
            } else {
              // Default icon and color for other statuses
              icon = <Tag className={`w-4 h-4 mr-2 ${activeStatus === status ? "text-white" : "text-gray-400"}`} />;
              btnClass = activeStatus === status
                ? "bg-gradient-to-br from-blue-400 to-blue-700 text-white"
                : "bg-white text-gray-700 hover:bg-gray-50";
            }
            return (
              <button
                key={status}
                onClick={() => handleClick(status)}
                className={`relative group flex items-center justify-center px-4 py-3 text-sm font-medium transition-all duration-300 ease-out hover:transform hover:scale-105 active:scale-95 rounded-lg ${btnClass}`}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 rounded-lg transition-opacity"></div>
                {icon}
                <span className="font-bold">{status}</span>
                {activeStatus === status && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl text-blue-800 font-bold">
                      Lead Information
                    </h2>
                    <button
                      className="text-blue-800 text-xs font-bold sm:text-sm hover:underline"
                      onClick={toggleDetails}
                    >
                      {showDetails ? "Hide Details" : "Show Details"}
                    </button>
                  </div>

                  {/* Details content - conditionally rendered based on showDetails state */}
                  {showDetails && (
                    <>
                      <div className="p-4 sm:p-6 grid grid-cols-1 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
                        {renderFormFields()}
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
                        className="text-blue-800 text-sm hover:underline"
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
                    </div>
                    {showAttachmentsPage ? (
                      <CachedShowAttachment
                        leadId={lead?.id}
                        onClose={() => setShowAttachmentsPage(false)}
                      />
                    ) : showAddAttachment ? (
                      <AttachFilePage
                        leadId={lead?.id}
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
            leadStatus={currentLeadStatus}
            buttonName={selectedButton}
            onLeadStatusUpdated={handleLeadStatusUpdated}
            onNoteAdded={handleNoteAdded}
            onChangeStatus={handleButtonStatus}
          />
        </div>
      )}

      {modalOpen && (
        <CheckInModal
          location={location}
          onClose={() => setModalOpen(false)}
          username={username}
          module={"Leads"}
          id={leadId}
          onNoteAdded={handleNoteAdded}
        />
      )}

      <ConvertLead
        isOpen={isSupportOpen}
        lead={lead}
        setIsOpen={setIsSupportOpen}
        data={contact}
        leadId={leadId}
      />
    </>
  );
};

export default LeadInformationPage;


// import React, { useState, useEffect, useRef } from "react";
// import {
//   ArrowLeft,
//   Paperclip,
//   Edit,
//   Send,
//   MoreHorizontal,
//   Phone,
//   Mail,
//   Clock,
//   Calendar,
//   Globe,
//   MapPin,
//   User,
//   Briefcase,
//   Tag,
//   Bell,
//   Menu,
//   X,
//   Clipboard,
//   Save,
//   ArrowRight,
// } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";
// import axios from "axios";

// import Navbar from "../common/Navbar";

// import toast from "react-hot-toast";
// import TaskDetailsPage from "./TaskDetailsPage";
// import ShowAttachment from "./ShowAttachment";
// import AttachFilePage from "./AttachFilePage";
// import NotesUi from "../ui/NotesUi";
// import ShimmerPage from "../ui/ContactFormShimmer";
// import DetailsShimmer from "../ui/DetailsShimmer";
// import ConvertLead from "../forms/ConvertLead";
// import CheckInModal from "../confirmbox/CheckInModal";

// const statusColors = {
//   Contacted: "bg-green-200 text-green-700",
//   "Contact in Future": "bg-purple-200 text-purple-700",
//   "Fresh Lead": "bg-blue-200 text-blue-700",
//   New: "bg-gray-200 text-gray-700",
//   "Junk Lead": "bg-red-200 text-red-700",
//   "Not Qualified": "bg-orange-200 text-orange-700",
// };

// const CACHE_NAME = "crm-cache";

// // Utility function to safely render values that might be objects
// const safeRenderValue = (value) => {
//   if (value === null || value === undefined) return "—";
//   if (typeof value === "object") {
//     // If it's an object that might have name/id/email properties
//     if (value.name) return value.name;
//     // Convert objects to JSON string for display
//     return JSON.stringify(value);
//   }
//   // Return the value directly if it's already a string or number
//   return value;
// };

// // Helper function to determine input type based on field data type
// const getInputType = (field) => {
//   switch (field.data_type) {
//     case "email":
//       return "email";
//     case "phone":
//       return "tel";
//     case "date":
//       return "date";
//     case "url":
//       return "url";
//     case "number":
//     case "integer":
//     case "decimal":
//       return "number";
//     default:
//       return "text";
//   }
// };

// const formatDate = (timestamp) => {
//   return new Date(timestamp).toLocaleString("en-US", {
//     year: "numeric",
//     month: "short",
//     day: "numeric",
//     hour: "2-digit",
//     minute: "2-digit",
//     hour12: true,
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
//       <p className="text-sm text-gray-700">{note.Note_Content}</p>
//     </div>
//   );
// };

// const AddNoteModal = ({ isOpen, onClose, leadId, username, onNoteAdded }) => {
//   const [noteContent, setNoteContent] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const noteTitle = `Added by ${username}`;
//       const response = await axios.post(
//         `${process.env.REACT_APP_APP_API}/related/createnote/Leads/${leadId}`,
//         {
//           Note_Title: noteTitle,
//           Note_Content: noteContent,
//         }
//       );

//       // Adding the note to the list currently

//       if (response?.status === 200) {
//         const newNote = {
//           id:
//             response?.data?.data?.data[0]?.details.id || Date.now().toString(),
//           Created_Time: new Date().toISOString(),
//           Note_Title: noteTitle,
//           Note_Content: noteContent,
//         };

//         onNoteAdded(newNote);
//       }

//       // Reset form and close modal
//       setNoteContent("");
//       onClose();
//     } catch (error) {
//       console.error("Error adding note:", error);
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
//             <label
//               htmlFor="noteTitle"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
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
//             <label
//               htmlFor="noteContent"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
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
//               {isSubmitting ? "Adding..." : "Add Note"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// const AddReasonModal = ({
//   isOpen,
//   onClose,
//   leadId,
//   username,
//   leadStatus,
//   buttonName,
//   onLeadStatusUpdated,
// }) => {
//   const [noteContent, setNoteContent] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsSubmitting(true);

//     try {
//       const noteTitle = `Added by ${username}`;
//       const response = await axios.post(
//         `${process.env.REACT_APP_APP_API}/related/createnote/Leads/${leadId}`,
//         {
//           Note_Title: noteTitle,
//           Note_Content: noteContent,
//         }
//       );

//       // If note was created successfully, update the lead status
//       if (response?.status === 200) {
//         try {
//           const updateResponse = await axios.put(
//             `${process.env.REACT_APP_APP_API}/update/updatemoduledata/Leads`,
//             {
//               id: leadId, // Added missing Lead_ID parameter
//               Lead_Status: buttonName,
//             }
//           );

//           if (updateResponse.data.success) {
//             toast.success("Lead Status changed Successfully!");
//             onLeadStatusUpdated(buttonName);
//           } else {
//             toast.error("Failed to update lead. Please try again.");
//           }
//         } catch (error) {
//           console.error("Error updating lead:", error);
//           toast.error(
//             error?.response?.data?.error?.data[0]?.message ||
//               error?.response?.data?.message ||
//               "Something went wrong"
//           );
//         }
//       }

//       // Reset form and close modal
//       setNoteContent("");
//       onClose();
//     } catch (error) {
//       console.error("Error adding note:", error);
//       toast.error("Failed to add note");
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
//             <label
//               htmlFor="noteTitle"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
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
//             <label
//               htmlFor="noteContent"
//               className="block text-sm font-medium text-gray-700 mb-1"
//             >
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
//               {isSubmitting ? "Changing..." : "Change Status"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Field priority enums
// const PRIORITY = Object.freeze({
//   // General Information priorities
//   OWNER: 1,
//   CLUSER: 2,
//   COMPANY: 3,
//   SALUTATION: 4,
//   FIRST_NAME: 5,
//   LAST_NAME: 6,
//   DESIGNATION: 7,
//   LEAD_STATUS: 8,
//   LEAD_SOURCE: 9,
//   EMAIL: 10,
//   PHONE: 11,
//   MOBILE: 12,

//   // Address priorities
//   STREET: 1,
//   ADDRESS: 2,
//   CITY: 3,
//   STATE: 4,
//   ZIP: 5,
//   COUNTRY: 6,

//   // Default priority
//   DEFAULT: 100,
// });

// // Category order enum
// const CATEGORY_ORDER = Object.freeze({
//   GENERAL: "General Information",
//   COMPANY: "Company Information",
//   ADDRESS: "Address Information",
//   OTHER: "Other Information",
// });

// const LeadInformationPage = ({ data, leadId, username, accessScore }) => {
//   const lead = data?.data[0]; // Take the first lead from the array

//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [showDetails, setShowDetails] = useState(true); // State to control details visibility

//   const [activeTab, setActiveTab] = useState("overview");
//   const [notes, setNotes] = useState([]);

//   const [tasks, setTasks] = useState([]);

//   // Edit variable
//   const [isEditing, setIsEditing] = useState(false);
//   const [editedLead, setEditedLead] = useState({});
//   const [isSaving, setIsSaving] = useState(false);

//   const navigate = useNavigate();

//   // Lead Status changed
//   const [currentLeadStatus, setCurrentLeadStatus] = useState(
//     lead?.Lead_Status || ""
//   );

//   const sidebarRef = useRef(null);

//   const [fields, setFields] = useState([]);
//   const [formData, setFormData] = useState({});
//   const [loading, setLoading] = useState(true);

//   // Add loading state
//   const [isLoading, setIsLoading] = useState(false);

//   const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
//   const [isAddReasonModalOpen, setIsAddReasonModalOpen] = useState(false);

//   // const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);

//   const [showAttachmentsPage, setShowAttachmentsPage] = useState(true);
//   const [showAddAttachment, setShowAddAttachment] = useState(false);
//   const [isSupportOpen, setIsSupportOpen] = useState(false);

//   // Button name variable

//   const [selectedButton, setSelectedButton] = useState("");

//   const [dataLoaded, setDataLoaded] = useState({
//     notes: false,
//     attachments: false,
//     tasks: false,
//   });

//   const [attachments, setAttachments] = useState([]);
//   // for conversion of lead
//   const [contact, setContacts] = useState([]);

//   // location variable for the checkIn purpose
//   const [location, setLocation] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);

//   useEffect(() => {
//     fetchCRMFields();
//   }, []);

//   // Initialize editedLead with lead data when component mounts or lead data changes
//   useEffect(() => {
//     if (lead && fields.length > 0) {
//       // Create an object with all form fields initialized from lead data
//       const initialEditedLead = fields.reduce((acc, field) => {
//         // Use the API name to get the value from the lead object
//         const fieldValue =
//           lead[field.api_name] !== undefined ? lead[field.api_name] : "";
//         acc[field.api_name] = fieldValue;
//         return acc;
//       }, {});

//       setEditedLead(initialEditedLead);

//       // Set current lead status from lead data if available
//       if (lead.Lead_Status) {
//         setCurrentLeadStatus(lead.Lead_Status);
//       }
//     }
//   }, [lead, fields]);

//   async function fetchCRMFields() {
//     try {
//       setLoading(true);

//       // Try to get data from cache first
//       const cache = await caches.open(CACHE_NAME);
//       const cachedResponse = await cache.match("/lead-form-fields");

//       if (cachedResponse) {
//         const data = await cachedResponse.json();
//         processFieldData(data);
//         return;
//       }

//       // If no cached data, fetch from API
//       const response = await axios.get(
//         `${process.env.REACT_APP_APP_API}/gets/getfields/Leads`
//       );

//       const fieldData = response?.data?.data?.fields || [];

//       // Store the fetched data in Cache Storage
//       const newResponse = new Response(JSON.stringify(fieldData), {
//         headers: { "Content-Type": "application/json" },
//       });
//       await cache.put("/lead-form-fields", newResponse);

//       processFieldData(fieldData);
//     } catch (error) {
//       console.error("Error fetching CRM fields:", error);
//       toast.error(
//         error?.response?.data?.message || "Failed to load form fields!"
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   function processFieldData(fieldData) {
//     // Filter fields based on view_type.create
//     const filteredFields = fieldData.filter(
//       (field) =>
//         field.view_type?.create !== false ||
//         ["Created_By", "Created_Time", "Modified_Time", "Modified_By"].includes(
//           field.api_name
//         )
//     );

//     // add created time and by field in end

//     setFields(filteredFields);

//     // Initialize formData with default values
//     setFormData(
//       filteredFields.reduce((acc, field) => {
//         acc[field.api_name] = field.data_type === "boolean" ? false : "";
//         return acc;
//       }, {})
//     );
//   }

//   // Function to handle input changes when editing
//   const handleInputChange = (field, value) => {
//     setEditedLead((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   // Function to toggle edit mode
//   const toggleEditMode = () => {
//     if (isEditing) {
//       // If canceling edit, reset to original values
//       if (lead && fields.length > 0) {
//         const resetEditedLead = fields.reduce((acc, field) => {
//           const fieldValue =
//             lead[field.api_name] !== undefined ? lead[field.api_name] : "";
//           acc[field.api_name] = fieldValue;
//           return acc;
//         }, {});

//         setEditedLead(resetEditedLead);
//       }
//     }
//     setIsEditing(!isEditing);
//   };

//   const toggleCheckIn = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (position) => {
//           const { latitude, longitude } = position.coords;
//           setLocation({ latitude, longitude });
//           setModalOpen(true); // open modal after getting location
//         },
//         (error) => {
//           console.error("Error fetching location:", error);
//           alert("Failed to get location. Please allow location access.");
//         }
//       );
//     } else {
//       alert("Geolocation is not supported by this browser.");
//     }
//   };

//   // Function to save edited lead data
//   const saveLead = async () => {
//     setIsSaving(true);
//     try {
//       const response = await axios.put(
//         `${process.env.REACT_APP_APP_API}/update/updatemoduledata/Leads`,
//         {
//           id: leadId,
//           ...editedLead,
//         }
//       );

//       if (response.data.success) {
//         // Update the local lead data with the edited values
//         const updatedLead = { ...lead, ...editedLead };
//         data.data[0] = updatedLead;

//         // Update the current lead status if it was changed
//         if (editedLead.Lead_Status) {
//           setCurrentLeadStatus(editedLead.Lead_Status);
//         }

//         // Exit edit mode
//         setIsEditing(false);

//         toast.success("Lead updated successfully!");
//       } else {
//         toast.error("Failed to update lead. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error updating lead:", error);
//       toast.error(
//         error?.response?.data?.error?.data[0]?.message || "Something went wrong"
//       );
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   // Function to handle lead conversion
//   const convertLeadHandler = async () => {
//     setIsSaving(true); // Start loading state
//     // Example values (replace these with actual state or props if needed)
//     const email = lead.Email || "test@example.com";
//     const phone = lead.Phone || "9876543210";
//     const company = lead.Company;

//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_APP_API}/lead/searchrecords`,
//         {
//           params: {
//             email,
//             phone,
//             company,
//           },
//         }
//       );

//       if (response.data.success) {
//         // Set contacts data correctly
//         setContacts(response.data.data);
//         // Open the support popup
//         setIsSupportOpen(true);
//       } else {
//         toast.error("Failed to find matching records. Please try again.");
//       }
//     } catch (error) {
//       console.error("Error searching lead records:", error);
//       toast.error(
//         error?.response?.data?.error?.data?.[0]?.message ||
//           error?.response?.data?.message ||
//           "Something went wrong"
//       );
//     } finally {
//       setIsSaving(false); // End loading state
//     }
//   };

//   // Toggle details visibility
//   const toggleDetails = () => {
//     setShowDetails(!showDetails);
//   };

//   // Function to handle form field changes
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     const fieldValue = type === "checkbox" ? checked : value;

//     // Update formData for non-edit mode
//     setFormData((prevData) => ({
//       ...prevData,
//       [name]: fieldValue,
//     }));

//     // Also update editedLead for edit mode
//     setEditedLead((prev) => ({
//       ...prev,
//       [name]: fieldValue,
//     }));
//   };

//   // Function to render form field based on its type
//   const renderFormField = (field, fieldDef) => {
//     // Get the value from editedLead or fall back to lead data

//     const rawFieldValue =
//       editedLead[field.api_name] !== undefined
//         ? editedLead[field.api_name]
//         : lead?.[field.api_name] || "";

//     // Handle case where the value is an object
//     let fieldValue = rawFieldValue;
//     if (typeof rawFieldValue === "object" && rawFieldValue !== null) {
//       // If it's an object with a 'name' property (common in CRMs), use that
//       if (rawFieldValue.name) {
//         fieldValue = rawFieldValue.name;
//       } else if (rawFieldValue.id) {
//         // Or if it has an ID, use a reasonable string representation
//         fieldValue = `${rawFieldValue.id}`;
//       } else {
//         // Last resort: stringify but clean it up
//         fieldValue = JSON.stringify(rawFieldValue);
//       }
//     }

//     // Enhanced field rendering based on data_type
//     if (
//       fieldDef.data_type === "picklist" &&
//       fieldDef.pick_list_values &&
//       fieldDef.pick_list_values.length > 0
//     ) {
//       // Use the correct options list based on field key
//       let options = [];
//       if (fieldDef.pick_list_values) {
//         // Use the pick_list_values from the field definition if available
//         options = fieldDef.pick_list_values.map(
//           (option) => option.display_value || option.actual_value || option
//         );
//       }

//       return (
//         <select
//           name={field.api_name}
//           value={fieldValue || ""}
//           onChange={(e) => handleInputChange(field.api_name, e.target.value)}
//           className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//         >
//           <option value="">
//             Select {fieldDef.display_label || fieldDef.display_name}
//           </option>
//           {options.map((option) => {
//             // Handle both string options and object options
//             const optionValue =
//               typeof option === "object"
//                 ? option.actual_value || option.display_value
//                 : option;
//             const displayValue =
//               typeof option === "object" ? option.display_value : option;

//             return (
//               <option key={optionValue} value={optionValue}>
//                 {displayValue}
//               </option>
//             );
//           })}
//         </select>
//       );
//     } else if (fieldDef.data_type === "boolean") {
//       // Render checkbox for boolean fields
//       return (
//         <input
//           type="checkbox"
//           name={field.api_name}
//           checked={fieldValue || false}
//           onChange={(e) => handleInputChange(field.api_name, e.target.checked)}
//           className="w-5 h-5"
//         />
//       );
//     } else {
//       // For all other field types, use the appropriate input type
//       return (
//         <input
//           type={getInputType(field)}
//           name={field.api_name}
//           value={fieldValue || ""}
//           onChange={(e) => handleInputChange(field.api_name, e.target.value)}
//           className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
//         />
//       );
//     }
//   };

//   // Function to render field display (non-edit mode)
//   const renderFieldDisplay = (fieldKey, specialClass = "") => {
//     // Find the field value from lead data
//     const fieldValue = lead?.[fieldKey];

//     // Special handling for Lead_Status
//     if (fieldKey === "Lead_Status" && fieldValue) {
//       return (
//         <span
//           className={`px-2 sm:px-3 py-0.5 sm:py-1 inline-block rounded-full text-xs sm:text-sm font-medium ${
//             statusColors[fieldValue] || "bg-gray-200 text-gray-700"
//           }`}
//         >
//           {safeRenderValue(fieldValue)}
//         </span>
//       );
//     }

//     // Special handling for email fields
//     if (fieldKey === "Email" || fieldKey === "Secondary_Email") {
//       return (
//         <span
//           className={`text-sm sm:text-base font-medium text-blue-600 break-all ${specialClass}`}
//         >
//           {safeRenderValue(fieldValue)}
//         </span>
//       );
//     }

//     if (fieldKey === "Modified_Time" || fieldKey === "Created_Time") {
//       return formatDate(fieldValue);
//     }
//     // Default display
//     return (
//       <span className={`text-sm sm:text-base font-medium ${specialClass}`}>
//         {safeRenderValue(fieldValue)}
//       </span>
//     );
//   };

//   // Modified fetchNotes function with proper loading state handling
//   const fetchNotes = async () => {
//     // First, set the active tab to 'notes' to show this tab
//     setActiveTab("notes");

//     // If notes are already loaded, don't fetch them again
//     if (dataLoaded.notes) {
//       setIsLoading(false); // Make sure loading is false even when using cached data
//       return;
//     }

//     // Set loading state
//     setIsLoading(true);

//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_APP_API}/related/notes/${"Leads"}/${leadId}`
//       );
//       setNotes(response?.data?.data?.data);

//       // Mark notes as loaded
//       setDataLoaded((prev) => ({
//         ...prev,
//         notes: true,
//       }));
//     } catch (error) {
//       console.error("Error fetching notes:", error);
//       // Optionally show an error toast or message
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // Fetch the tasks

//   const fetchTasks = async () => {
//     // First, set the active tab to 'openActivity' to show this tab
//     setActiveTab("openActivity");

//     // If tasks are already loaded, don't fetch them again
//     if (dataLoaded.tasks) {
//       setIsLoading(false);
//       return;
//     }

//     // Set loading state
//     setIsLoading(true);

//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_APP_API}/related/openactivities`,
//         {
//           params: {
//             $se_module: "Leads",
//             What_Id: leadId,
//             Who_Id: null,
//           },
//         }
//       );
//       setTasks(response?.data?.data?.data || []);

//       // Mark tasks as loaded
//       setDataLoaded((prev) => ({
//         ...prev,
//         tasks: true,
//       }));
//     } catch (error) {
//       console.error("Error fetching tasks:", error);
//       // Optionally show an error toast or message
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleNoteAdded = (newNote) => {
//     // Update notes list when a new note is added
//     // setNotes([newNote, ...notes]);
//     setNotes([newNote, ...(notes || [])]);
//   };

//   const handleLeadStatusUpdated = (newStatus) => {
//     setCurrentLeadStatus(newStatus);
//     // Update the lead data with the new status
//     if (data?.data?.[0]) {
//       data.data[0].Lead_Status = newStatus;
//     }
//   };

//   // Handle tab switching
//   const handleTabSwitch = (tab) => {
//     setActiveTab(tab);

//     // Reset loading state when switching tabs
//     setIsLoading(true);

//     // Fetch data for the selected tab if not already loaded
//     if (tab === "notes") {
//       // If notes already loaded, set loading to false immediately
//       if (dataLoaded.notes) {
//         setIsLoading(false);
//       } else {
//         fetchNotes();
//       }
//     }

//     if (tab === "openActivity") {
//       // If tasks already loaded, set loading to false immediately
//       if (dataLoaded.tasks) {
//         setIsLoading(false);
//       } else {
//         fetchTasks();
//       }
//     }

//     // You can add similar logic for attachments tab if needed
//     if (tab === "attachments") {
//       setShowAttachmentsPage(true);
//       setShowAddAttachment(false);

//       // If attachments already loaded, set loading to false immediately
//       if (dataLoaded.attachments) {
//         setIsLoading(false);
//       } else {
//         // Mark attachments as being loaded - this helps prevent multiple API calls
//         setDataLoaded((prev) => ({
//           ...prev,
//           attachments: true,
//         }));
//       }
//     }
//   };

//   // Make the priority...
//   // Define field priority for each category using enums
//   const getFieldPriority = (fieldName) => {
//     const lowerName = fieldName.toLowerCase();

//     // General contact information priorities

//     if (lowerName.includes("salu")) return PRIORITY.SALUTATION;
//     if (lowerName.includes("first_name")) return PRIORITY.FIRST_NAME;
//     if (lowerName.includes("last_name")) return PRIORITY.LAST_NAME;
//     if (lowerName.includes("desig")) return PRIORITY.DESIGNATION;
//     if (lowerName.includes("lead_status")) return PRIORITY.LEAD_STATUS;
//     if (lowerName.includes("lead_source")) return PRIORITY.LEAD_SOURCE;
//     if (lowerName.includes("email")) return PRIORITY.EMAIL;
//     if (lowerName.includes("phone")) return PRIORITY.PHONE;
//     if (lowerName.includes("mobile")) return PRIORITY.MOBILE;
//     if (lowerName.includes("company")) return PRIORITY.COMPANY;
//     if (lowerName.includes("owner")) return PRIORITY.OWNER;
//     if (lowerName.includes("easy")) return PRIORITY.CLUSER;

//     // Address information priorities
//     if (lowerName.includes("street")) return PRIORITY.STREET;
//     if (lowerName.includes("address")) return PRIORITY.ADDRESS;
//     if (lowerName.includes("city")) return PRIORITY.CITY;
//     if (lowerName.includes("state")) return PRIORITY.STATE;
//     if (lowerName.includes("zip")) return PRIORITY.ZIP;
//     if (lowerName.includes("country")) return PRIORITY.COUNTRY;

//     // Default priority
//     return PRIORITY.DEFAULT;
//   };

//   // Replace your existing renderFormFields function with this:
//   function renderFormFields() {
//     const categoryOrder = [
//       CATEGORY_ORDER.GENERAL,
//       CATEGORY_ORDER.COMPANY,
//       CATEGORY_ORDER.ADDRESS,
//       CATEGORY_ORDER.OTHER,
//     ];

//     const groupedFields = {};

//     // Group fields by category
//     fields.forEach((field) => {
//       let category = CATEGORY_ORDER.OTHER;

//       const fieldName = field.api_name.toLowerCase();

//       if (
//         fieldName.includes("owner") ||
//         fieldName.includes("easy") ||
//         fieldName.includes("salu") ||
//         fieldName.includes("last_name") ||
//         fieldName.includes("first_name") ||
//         fieldName.includes("lead_source") ||
//         fieldName.includes("lead_status") ||
//         fieldName.includes("email") ||
//         fieldName.includes("phone") ||
//         fieldName.includes("mobile") ||
//         fieldName.includes("contact") ||
//         fieldName.includes("company") ||
//         fieldName.includes("desig")
//       ) {
//         category = CATEGORY_ORDER.GENERAL;
//       } else if (
//         fieldName.includes("organization") ||
//         fieldName.includes("business") ||
//         fieldName.includes("industry") ||
//         fieldName.includes("annual") ||
//         fieldName.includes("revenue")
//       ) {
//         category = CATEGORY_ORDER.COMPANY;
//       } else if (
//         fieldName.includes("address") ||
//         fieldName.includes("street") ||
//         fieldName.includes("city") ||
//         fieldName.includes("state") ||
//         fieldName.includes("country") ||
//         fieldName.includes("zip") ||
//         fieldName.includes("postal")
//       ) {
//         category = CATEGORY_ORDER.ADDRESS;
//       }

//       if (!groupedFields[category]) {
//         groupedFields[category] = [];
//       }

//       groupedFields[category].push(field);
//     });

//     // Sort fields within each category based on priority
//     Object.keys(groupedFields).forEach((category) => {
//       groupedFields[category].sort((a, b) => {
//         const priorityA = getFieldPriority(a.api_name);
//         const priorityB = getFieldPriority(b.api_name);

//         // First sort by priority
//         if (priorityA !== priorityB) {
//           return priorityA - priorityB;
//         }

//         // If same priority, sort alphabetically by display label
//         const labelA = a.display_label || a.api_name;
//         const labelB = b.display_label || b.api_name;
//         return labelA.localeCompare(labelB);
//       });
//     });

//     // Render categories in proper order
//     return categoryOrder.map((category) => {
//       if (!groupedFields[category] || groupedFields[category].length === 0) {
//         return null;
//       }

//       return (
//         // <div key={category} className="mb-8">
//         //   <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2 mb-4">
//         //     {category}
//         //   </h3>
//         //   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
//         //     {groupedFields[category].map((field) => (
//         //       <div key={field.api_name} className="flex items-start">
//         //         <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">
//         //           {field.display_label || field.api_name}
//         //         </div>
//         //         <div className="flex-1">
//         //           {isEditing &&
//         //           field.api_name !== "id" &&
//         //           field.data_type !== "lookup" &&
//         //           field.data_type !== "ownerlookup" ? (
//         //             renderFormField(field, field)
//         //           ) : field.api_name === "Mobile" ||
//         //             field.api_name === "Phone" ? (
//         //             <div className="flex items-center">
//         //               <span className="bg-green-100 rounded-full p-1 mr-2">
//         //                 <Phone className="w-3 h-3 text-green-600" />
//         //               </span>
//         //               {renderFieldDisplay(field.api_name)}
//         //             </div>
//         //           ) : field.api_name === "Email" ||
//         //             field.api_name === "Secondary_Email" ? (
//         //             renderFieldDisplay(
//         //               field.api_name,
//         //               "text-blue-600"
//         //             )
//         //           ) : (
//         //             renderFieldDisplay(field.api_name)
//         //           )}
//         //         </div>
//         //       </div>
//         //     ))}
//         //   </div>
//         // </div>
//         <div
//           key={category}
//           className="mb-12 rounded-lg shadow-md bg-white p-6 transition-all duration-300 hover:shadow-lg"
//         >
//           <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-3 mb-6 flex items-center">
//             <span className="mr-2">{category}</span>
//             {isEditing && (
//               <span className="bg-blue-100 text-blue-600 text-xs font-medium px-2.5 py-0.5 rounded-full ml-2">
//                 Editing
//               </span>
//             )}
//           </h3>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             {groupedFields[category].map((field) => (
//               <div
//                 key={field.api_name}
//                 className={`flex flex-col sm:flex-row items-start p-3 rounded-lg ${
//                   isEditing &&
//                   field.api_name !== "id" &&
//                   field.data_type !== "lookup" &&
//                   field.data_type !== "ownerlookup"
//                     ? "bg-blue-50 border border-blue-100"
//                     : "hover:bg-gray-50"
//                 } transition-colors duration-200`}
//               >
//                 <div className="w-full sm:w-36 text-sm font-medium text-gray-600 mb-1 sm:mb-0">
//                   {field.display_label || field.api_name}
//                 </div>

//                 <div className="flex-1 w-full">
//                   {isEditing &&
//                   field.api_name !== "id" &&
//                   field.data_type !== "lookup" &&
//                   field.data_type !== "ownerlookup" ? (
//                     <div className="w-full focus-within:ring-2 focus-within:ring-blue-300 rounded transition-all duration-200">
//                       {renderFormField(field, field)}
//                     </div>
//                   ) : field.api_name === "Mobile" ||
//                     field.api_name === "Phone" ? (
//                     <div className="flex items-center group">
//                       <span className="bg-green-100 rounded-full p-1.5 mr-2 group-hover:bg-green-200 transition-colors duration-200">
//                         <Phone className="w-4 h-4 text-green-600" />
//                       </span>
//                       <div className="font-medium">
//                         {renderFieldDisplay(field.api_name)}
//                       </div>
//                     </div>
//                   ) : field.api_name === "Email" ||
//                     field.api_name === "Secondary_Email" ? (
//                     <div className="text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200">
//                       {renderFieldDisplay(field.api_name, "text-blue-600")}
//                     </div>
//                   ) : (
//                     <div className="text-gray-800 font-medium">
//                       {renderFieldDisplay(field.api_name)}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       );
//     });
//   }

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

//   // Create a cached version of TaskDetailsPage
//   const CachedTaskDetailsPage = () => {
//     return (
//       <TaskDetailsPage
//         leadId={leadId}
//         cachedData={tasks}
//         setCachedData={setTasks}
//         dataLoaded={dataLoaded.tasks}
//         isLoading={isLoading}
//         setIsLoading={setIsLoading}
//       />
//     );
//   };

//   // // Toggle details visibility
//   // const toggleDetails = () => {
//   //   setShowDetails(!showDetails);
//   // };

//   // Status change functionality

//   const handleClick = (status) => {
//     setSelectedButton(status);
//     setIsAddReasonModalOpen(true);
//   };

//   return (
//     <>
//       <Navbar />
//       {fields.length <= 0 ? (
//         <DetailsShimmer />
//       ) : (
//         <div className="flex min-h-screen bg-gray-50 relative">
//           {/* Main Content Area */}
//           <div className="flex-1 flex flex-col">
//             {/* Top Navigation Bar */}
//             <header className="bg-white shadow-sm border-b border-gray-200">
//               <div className="flex items-center px-2 sm:px-4 py-2">
//                 {/* Desktop back button (hidden on mobile) */}
//                 <button
//                   className="p-2 mr-2 rounded-full hover:bg-gray-100 hidden lg:block"
//                   onClick={() => navigate("/app/leadview")}
//                 >
//                   <ArrowLeft className="w-5 h-5 text-gray-600" />
//                 </button>

//                 {/* Mobile back button (visible only on small screens) */}
//                 <button
//                   className="py-1 px-2 mr-2 text-xs rounded-md bg-gray-100 hover:bg-gray-200 flex items-center lg:hidden"
//                   onClick={() => navigate("/app/leadview")}
//                 >
//                   <ArrowLeft className="w-4 h-4 mr-1 text-gray-600" />
//                 </button>

//                 <div className="flex items-center">
//                   <div className="bg-red-500 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
//                     {lead?.First_Name ? lead.First_Name.charAt(0) : "K"}
//                   </div>
//                   <div className="overflow-hidden">
//                     <h1 className="text-base sm:text-lg font-medium truncate">
//                       {safeRenderValue(lead?.Full_Name) ||
//                         "Mr. Kushal Pratap Singh"}
//                     </h1>
//                     <p className="text-xs sm:text-sm text-gray-500 truncate">
//                       {safeRenderValue(lead?.Company) || "Coding Ninjas"}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="ml-auto flex space-x-1 sm:space-x-2">
//                   {isEditing ? (
//                     <>
//                       <button
//                         className="border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-gray-50 text-sm sm:text-base"
//                         onClick={toggleEditMode}
//                         disabled={isSaving}
//                       >
//                         <span className="hidden sm:inline">Cancel</span>
//                         <X className="w-4 h-4 inline sm:hidden" />
//                       </button>
//                       <button
//                         className="border border-blue-500 bg-blue-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-blue-600 text-sm sm:text-base"
//                         onClick={saveLead}
//                         disabled={isSaving}
//                       >
//                         {isSaving ? (
//                           <span className="hidden sm:inline">Saving...</span>
//                         ) : (
//                           <>
//                             <span className="hidden sm:inline">Save</span>
//                             <Save className="w-4 h-4 inline sm:hidden" />
//                           </>
//                         )}
//                       </button>
//                     </>
//                   ) : (
//                     <div className="flex items-center gap-3">
//                       <button
//   className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
//     ${accessScore < 3
//       ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
//       : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100"
//     }`}
//   onClick={toggleCheckIn}
//   disabled={accessScore < 3}
// >
//   <div className="relative h-4 w-4 flex-shrink-0">
//     {/* Location pin with checkmark icon */}
//     <svg 
//       xmlns="http://www.w3.org/2000/svg" 
//       className="h-4 w-4" 
//       viewBox="0 0 24 24" 
//       fill="none"
//     >
//       <path 
//         d="M12 21C12 21 19 14.5 19 9C19 5.13401 15.866 2 12 2C8.13401 2 5 5.13401 5 9C5 14.5 12 21 12 21Z" 
//         fill={accessScore < 3 ? "#D1D5DB" : "#E63946"} 
//         stroke="none"
//       />
//       <path 
//         d="M9 9L11 11L15 7" 
//         stroke="white" 
//         strokeWidth="2" 
//         strokeLinecap="round" 
//         strokeLinejoin="round"
//       />
//     </svg>
//   </div>
//   <span className="hidden sm:inline">CheckIn</span>
// </button>

//                       {/* <button
//                         className={`border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base
//   ${accessScore < 3 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
//                         onClick={() => {
//                           convertLeadHandler(); // Just call this function directly
//                         }}
//                         disabled={accessScore < 3 || isSaving} // Disable when loading or insufficient access
//                       >
//                         {isSaving ? (
//                           <span className="flex items-center">
//                             <svg
//                               className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
//                               xmlns="http://www.w3.org/2000/svg"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                             >
//                               <circle
//                                 className="opacity-25"
//                                 cx="12"
//                                 cy="12"
//                                 r="10"
//                                 stroke="currentColor"
//                                 strokeWidth="4"
//                               ></circle>
//                               <path
//                                 className="opacity-75"
//                                 fill="currentColor"
//                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
//                               ></path>
//                             </svg>
//                             Converting...
//                           </span>
//                         ) : (
//                           <span className="hidden sm:inline">Convert Lead</span>
//                         )}
//                         <Edit
//                           className={`w-4 h-4 ${
//                             isSaving ? "hidden" : "inline sm:hidden"
//                           }`}
//                         />
//                       </button> */}

// <button 
//   className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
//     ${accessScore < 3 || isSaving
//       ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200" 
//       : "bg-white text-green-600 border border-green-200 hover:bg-green-50 hover:border-green-300 active:bg-green-100"
//     }`}
//   onClick={() => { 
//     convertLeadHandler(); // Just call this function directly 
//   }} 
//   disabled={accessScore < 3 || isSaving} // Disable when loading or insufficient access 
// >
//   {isSaving ? ( 
//     <span className="flex items-center"> 
//       <svg 
//         className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" 
//         xmlns="http://www.w3.org/2000/svg" 
//         fill="none" 
//         viewBox="0 0 24 24" 
//       > 
//         <circle 
//           className="opacity-25" 
//           cx="12" 
//           cy="12" 
//           r="10" 
//           stroke="currentColor" 
//           strokeWidth="4" 
//         ></circle> 
//         <path 
//           className="opacity-75" 
//           fill="currentColor" 
//           d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" 
//         ></path> 
//       </svg> 
//       Converting... 
//     </span> 
//   ) : ( 
//     <>
//       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
//         <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
//       </svg>
//       <span className="hidden sm:inline">Convert Lead</span>
//     </>
//   )}
// </button>

//                       <button
//                         className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
//       ${
//         accessScore < 3
//           ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200"
//           : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100"
//       }`}
//                         onClick={toggleEditMode}
//                         disabled={accessScore < 3}
//                       >
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           className="h-4 w-4"
//                           viewBox="0 0 20 20"
//                           fill="currentColor"
//                         >
//                           <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
//                         </svg>
//                         <span className="hidden sm:inline">Edit</span>
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </header>

//             {/* Tabs */}
//             <div className="border-b border-gray-200 bg-white">
//               <div className="px-3 sm:px-6 py-2">
//                 <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
//                   <button
//                     className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
//                       activeTab === "overview"
//                         ? "border-b-2 border-blue-500 text-blue-600"
//                         : "text-gray-500 hover:text-gray-700"
//                     }`}
//                     onClick={() => handleTabSwitch("overview")}
//                   >
//                     Overview
//                   </button>
//                   <button
//                     className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
//                       activeTab === "notes"
//                         ? "border-b-2 border-blue-500 text-blue-600"
//                         : "text-gray-500 hover:text-gray-700"
//                     }`}
//                     onClick={() => handleTabSwitch("notes")}
//                   >
//                     Notes
//                   </button>
//                   <button
//                     className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
//                       activeTab === "attachments"
//                         ? "border-b-2 border-blue-500 text-blue-600"
//                         : "text-gray-500 hover:text-gray-700"
//                     }`}
//                     onClick={() => handleTabSwitch("attachments")}
//                   >
//                     Attachments
//                   </button>
//                   <button
//                     className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
//                       activeTab === "openActivity"
//                         ? "border-b-2 border-blue-500 text-blue-600"
//                         : "text-gray-500 hover:text-gray-700"
//                     }`}
//                     onClick={() => handleTabSwitch("openActivity")}
//                   >
//                     Activities
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Main Content */}
//             <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
//               {activeTab === "overview" && (
//                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//                   <div className="p-3 sm:p-6 overflow-auto">
//                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-4">
//                       <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-4 justify-center items-center">
//                         <button
//                           onClick={() => handleClick("Contacted")}
//                           className="group relative px-6 py-3 text-sm font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
//                         >
//                           <span className="relative z-10 flex items-center justify-center">
//                             <span className="mr-2">✓</span>
//                             Contacted
//                           </span>
//                           <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                         </button>

//                         <button
//                           onClick={() => handleClick("Not Contacted")}
//                           className="group relative px-6 py-3 text-sm font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl"
//                         >
//                           <span className="relative z-10 flex items-center justify-center">
//                             Not Contacted
//                           </span>
//                           <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                         </button>

//                         <button
//                           onClick={() => handleClick("Junk Lead")}
//                           className="group relative px-6 py-3 text-sm font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-xl"
//                         >
//                           <span className="relative z-10 flex items-center justify-center">
//                             <span className="mr-2">⚠</span>
//                             Junk Lead
//                           </span>
//                           <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                         </button>

//                         <button
//                           onClick={() => handleClick("Not Qualified")}
//                           className="group relative px-6 py-3 text-sm font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg hover:shadow-xl"
//                         >
//                           <span className="relative z-10 flex items-center justify-center">
//                             <span className="mr-2">!</span>
//                             Not Qualified
//                           </span>
//                           <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
//                     <h2 className="text-base sm:text-lg font-medium text-gray-800">
//                       Lead Information
//                     </h2>
//                     <button
//                       className="text-blue-600 text-xs sm:text-sm hover:underline"
//                       onClick={toggleDetails}
//                     >
//                       {showDetails ? "Hide Details" : "Show Details"}
//                     </button>
//                   </div>

//                   {/* Details content - conditionally rendered based on showDetails state */}
//                   {showDetails && (
//                     <>
//                       <div className="p-4 sm:p-6 grid grid-cols-1 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
//                         {renderFormFields()}
//                         {/* Display all fields without filtering */}
//                         {/* {fields.map((field, index) => (
//                           <div
//                             key={field.api_name}
//                             className="flex items-start"
//                           >
//                             <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">
//                               {field.display_label || field.api_name}
//                             </div>
//                             <div className="flex-1">
//                               {isEditing &&
//                               field.api_name !== "id" &&
//                               field.data_type !== "lookup" &&
//                               field.data_type !== "ownerlookup" ? (
//                                 renderFormField(field, field)
//                               ) : field.api_name === "Mobile" ||
//                                 field.api_name === "Phone" ? (
//                                 <div className="flex items-center">
//                                   <span className="bg-green-100 rounded-full p-1 mr-2">
//                                     <Phone className="w-3 h-3 text-green-600" />
//                                   </span>
//                                   {renderFieldDisplay(field.api_name)}
//                                 </div>
//                               ) : field.api_name === "Email" ||
//                                 field.api_name === "Secondary_Email" ? (
//                                 renderFieldDisplay(
//                                   field.api_name,
//                                   "text-blue-600"
//                                 )
//                               ) : (
//                                 renderFieldDisplay(field.api_name)
//                               )}
//                             </div>
//                           </div>
//                         ))} */}
//                       </div>
//                     </>
//                   )}

//                   {/* Display a message when details are hidden */}
//                   {!showDetails && (
//                     <div className="p-6 text-center text-gray-500">
//                       Details are hidden. Click "Show Details" to view lead
//                       information.
//                     </div>
//                   )}
//                 </div>
//               )}

//               {activeTab === "notes" && (
//                 <div className="space-y-4">
//                   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
//                     <div className="flex justify-between items-center mb-4">
//                       <h2 className="text-base sm:text-lg font-medium text-gray-800">
//                         Notes ({notes?.length || 0})
//                       </h2>
//                       <button
//                         className="text-blue-600 text-sm hover:underline"
//                         onClick={() => setIsAddNoteModalOpen(true)}
//                       >
//                         Add Note
//                       </button>
//                     </div>

//                     {isLoading ? (
//                       <div className="text-center text-gray-500 py-6">
//                         <NotesUi />
//                       </div>
//                     ) : !notes || notes.length === 0 ? (
//                       <div className="text-center text-gray-500 py-6">
//                         No notes found for this lead.
//                       </div>
//                     ) : (
//                       <div className="space-y-4">
//                         {notes.map((note) => (
//                           <NotesCard key={note.id} note={note} />
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {activeTab === "attachments" && (
//                 <div className="space-y-4">
//                   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
//                     <div className="flex justify-between items-center mb-4">
//                       <h2 className="text-base sm:text-lg font-medium text-gray-800">
//                         Attachments
//                       </h2>
//                     </div>
//                     {showAttachmentsPage ? (
//                       <CachedShowAttachment
//                         leadId={lead?.id}
//                         onClose={() => setShowAttachmentsPage(false)}
//                       />
//                     ) : showAddAttachment ? (
//                       <AttachFilePage
//                         leadId={lead?.id}
//                         onClose={() => setShowAddAttachment(false)}
//                       />
//                     ) : (
//                       <div className="text-center text-gray-500 py-6">
//                         Click "Show All Attachments" to view files or "Add New
//                         Attachment" to upload files.
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               )}

//               {activeTab === "openActivity" && <CachedTaskDetailsPage />}
//             </div>
//           </div>
//           <AddNoteModal
//             isOpen={isAddNoteModalOpen}
//             onClose={() => setIsAddNoteModalOpen(false)}
//             leadId={leadId}
//             username={username}
//             onNoteAdded={handleNoteAdded}
//           />
//           <AddReasonModal
//             isOpen={isAddReasonModalOpen}
//             onClose={() => setIsAddReasonModalOpen(false)}
//             leadId={leadId}
//             username={username}
//             leadStatus={currentLeadStatus}
//             buttonName={selectedButton}
//             onLeadStatusUpdated={handleLeadStatusUpdated}
//             onNoteAdded={handleNoteAdded}
//           />
//         </div>
//       )}

//       {modalOpen && (
//         <CheckInModal
//           location={location}
//           onClose={() => setModalOpen(false)}
//           username={username}
//           module={"Leads"}
//           id={leadId}
//           onNoteAdded={handleNoteAdded}
//         />
//       )}

//       <ConvertLead
//         isOpen={isSupportOpen}
//         lead={lead}
//         setIsOpen={setIsSupportOpen}
//         data={contact}
//         leadId={leadId}
//       />
//     </>
//   );
// };

// export default LeadInformationPage;

// // import React, { useState, useEffect, useRef } from "react";
// // import {
// //   ArrowLeft,
// //   Paperclip,
// //   Edit,
// //   Send,
// //   MoreHorizontal,
// //   Phone,
// //   Mail,
// //   Clock,
// //   Calendar,
// //   Globe,
// //   MapPin,
// //   User,
// //   Briefcase,
// //   Tag,
// //   Bell,
// //   Menu,
// //   X,
// //   Clipboard,
// //   Save,
// //   ArrowRight,
// // } from "lucide-react";
// // import { Link, useNavigate } from "react-router-dom";
// // import axios from "axios";

// // import Navbar from "../common/Navbar";

// // import toast from "react-hot-toast";
// // import TaskDetailsPage from "./TaskDetailsPage";
// // import ShowAttachment from "./ShowAttachment";
// // import AttachFilePage from "./AttachFilePage";
// // import NotesUi from "../ui/NotesUi";
// // import ShimmerPage from "../ui/ContactFormShimmer";
// // import DetailsShimmer from "../ui/DetailsShimmer";
// // import ConvertLead from "../forms/ConvertLead";

// // const statusColors = {
// //   Contacted: "bg-green-200 text-green-700",
// //   "Contact in Future": "bg-purple-200 text-purple-700",
// //   "Fresh Lead": "bg-blue-200 text-blue-700",
// //   New: "bg-gray-200 text-gray-700",
// //   "Junk Lead": "bg-red-200 text-red-700",
// //   "Not Qualified": "bg-orange-200 text-orange-700",
// // };

// // const CACHE_NAME = "crm-cache";

// // // Utility function to safely render values that might be objects
// // const safeRenderValue = (value) => {
// //   if (value === null || value === undefined) return "—";
// //   if (typeof value === "object") {
// //     // If it's an object that might have name/id/email properties
// //     if (value.name) return value.name;
// //     // Convert objects to JSON string for display
// //     return JSON.stringify(value);
// //   }
// //   // Return the value directly if it's already a string or number
// //   return value;
// // };

// // // Helper function to determine input type based on field data type
// // const getInputType = (field) => {
// //   switch (field.data_type) {
// //     case "email":
// //       return "email";
// //     case "phone":
// //       return "tel";
// //     case "date":
// //       return "date";
// //     case "url":
// //       return "url";
// //     case "number":
// //     case "integer":
// //     case "decimal":
// //       return "number";
// //     default:
// //       return "text";
// //   }
// // };

// // const formatDate = (timestamp) => {
// //   return new Date(timestamp).toLocaleString("en-US", {
// //     year: "numeric",
// //     month: "short",
// //     day: "numeric",
// //     hour: "2-digit",
// //     minute: "2-digit",
// //     hour12: true,
// //   });
// // };

// // const NotesCard = ({ note }) => {
// //   // Convert timestamp to a more readable format

// //   return (
// //     <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
// //       <div className="flex justify-between items-start mb-2">
// //         <div>
// //           {note.Note_Title && (
// //             <h3 className="text-sm font-semibold text-gray-800 mb-1">
// //               {note.Note_Title}
// //             </h3>
// //           )}
// //           <p className="text-xs text-gray-500">
// //             {formatDate(note.Created_Time)}
// //           </p>
// //         </div>
// //         <button className="text-gray-500 hover:text-gray-700">
// //           <Clipboard className="w-4 h-4" />
// //         </button>
// //       </div>
// //       <p className="text-sm text-gray-700">{note.Note_Content}</p>
// //     </div>
// //   );
// // };

// // const AddNoteModal = ({ isOpen, onClose, leadId, username, onNoteAdded }) => {
// //   const [noteContent, setNoteContent] = useState("");
// //   const [isSubmitting, setIsSubmitting] = useState(false);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setIsSubmitting(true);

// //     try {
// //       const noteTitle = `Added by ${username}`;
// //       const response = await axios.post(
// //         `${process.env.REACT_APP_APP_API}/related/createnote/Leads/${leadId}`,
// //         {
// //           Note_Title: noteTitle,
// //           Note_Content: noteContent,
// //         }
// //       );

// //       // Adding the note to the list currently

// //       if (response?.status === 200) {
// //         const newNote = {
// //           id:
// //             response?.data?.data?.data[0]?.details.id || Date.now().toString(),
// //           Created_Time: new Date().toISOString(),
// //           Note_Title: noteTitle,
// //           Note_Content: noteContent,
// //         };

// //         onNoteAdded(newNote);
// //       }

// //       // Reset form and close modal
// //       setNoteContent("");
// //       onClose();
// //     } catch (error) {
// //       console.error("Error adding note:", error);
// //       // Optionally show error toast
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   if (!isOpen) return null;

// //   return (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
// //       <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
// //         <div className="p-4 border-b border-gray-200 flex justify-between items-center">
// //           <h2 className="text-lg font-semibold text-gray-800">Add a Note</h2>
// //           <button
// //             onClick={onClose}
// //             className="text-gray-500 hover:text-gray-700"
// //           >
// //             <X className="w-5 h-5" />
// //           </button>
// //         </div>
// //         <form onSubmit={handleSubmit} className="p-4 space-y-4">
// //           <div>
// //             <label
// //               htmlFor="noteTitle"
// //               className="block text-sm font-medium text-gray-700 mb-1"
// //             >
// //               Note Title
// //             </label>
// //             <input
// //               id="noteTitle"
// //               type="text"
// //               value={`Added by ${username}`}
// //               readOnly
// //               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label
// //               htmlFor="noteContent"
// //               className="block text-sm font-medium text-gray-700 mb-1"
// //             >
// //               Note Content
// //             </label>
// //             <textarea
// //               id="noteContent"
// //               value={noteContent}
// //               onChange={(e) => setNoteContent(e.target.value)}
// //               placeholder="Enter note details"
// //               rows="4"
// //               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// //               required
// //             />
// //           </div>
// //           <div className="flex justify-end space-x-2">
// //             <button
// //               type="button"
// //               onClick={onClose}
// //               className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
// //             >
// //               Cancel
// //             </button>
// //             <button
// //               type="submit"
// //               disabled={isSubmitting}
// //               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
// //             >
// //               {isSubmitting ? "Adding..." : "Add Note"}
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // const AddReasonModal = ({
// //   isOpen,
// //   onClose,
// //   leadId,
// //   username,
// //   leadStatus,
// //   buttonName,
// //   onLeadStatusUpdated,
// // }) => {
// //   const [noteContent, setNoteContent] = useState("");
// //   const [isSubmitting, setIsSubmitting] = useState(false);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setIsSubmitting(true);

// //     try {
// //       const noteTitle = `Added by ${username}`;
// //       const response = await axios.post(
// //         `${process.env.REACT_APP_APP_API}/related/createnote/Leads/${leadId}`,
// //         {
// //           Note_Title: noteTitle,
// //           Note_Content: noteContent,
// //         }
// //       );

// //       // If note was created successfully, update the lead status
// //       if (response?.status === 200) {
// //         try {
// //           const updateResponse = await axios.put(
// //             `${process.env.REACT_APP_APP_API}/update/updatemoduledata/Leads`,
// //             {
// //               id: leadId, // Added missing Lead_ID parameter
// //               Lead_Status: buttonName,
// //             }
// //           );

// //           if (updateResponse.data.success) {
// //             toast.success("Lead Status changed Successfully!");
// //             onLeadStatusUpdated(buttonName);
// //           } else {
// //             toast.error("Failed to update lead. Please try again.");
// //           }
// //         } catch (error) {
// //           console.error("Error updating lead:", error);
// //           toast.error(
// //             error?.response?.data?.error?.data[0]?.message ||
// //               error?.response?.data?.message ||
// //               "Something went wrong"
// //           );
// //         }
// //       }

// //       // Reset form and close modal
// //       setNoteContent("");
// //       onClose();
// //     } catch (error) {
// //       console.error("Error adding note:", error);
// //       toast.error("Failed to add note");
// //     } finally {
// //       setIsSubmitting(false);
// //     }
// //   };

// //   if (!isOpen) return null;

// //   return (
// //     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
// //       <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
// //         <div className="p-4 border-b border-gray-200 flex justify-between items-center">
// //           <div className="flex items-center flex-grow">
// //             <div className="text-lg font-semibold text-gray-700 px-3 py-2 bg-gray-100 rounded-md">
// //               {leadStatus}
// //             </div>

// //             <ArrowRight className="mx-4 text-blue-500" size={24} />

// //             <div className="text-lg font-semibold text-white px-3 py-2 bg-blue-600 rounded-md">
// //               {buttonName}
// //             </div>
// //           </div>
// //           <button
// //             onClick={onClose}
// //             className="text-gray-500 hover:text-gray-700 ml-2"
// //           >
// //             <X className="w-5 h-5" />
// //           </button>
// //         </div>
// //         <form onSubmit={handleSubmit} className="p-4 space-y-4">
// //           <div>
// //             <label
// //               htmlFor="noteTitle"
// //               className="block text-sm font-medium text-gray-700 mb-1"
// //             >
// //               Note Title
// //             </label>
// //             <input
// //               id="noteTitle"
// //               type="text"
// //               value={`Added by ${username}`}
// //               readOnly
// //               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// //               required
// //             />
// //           </div>
// //           <div>
// //             <label
// //               htmlFor="noteContent"
// //               className="block text-sm font-medium text-gray-700 mb-1"
// //             >
// //               Reason:
// //             </label>
// //             <textarea
// //               id="noteContent"
// //               value={noteContent}
// //               onChange={(e) => setNoteContent(e.target.value)}
// //               placeholder="Enter note details"
// //               rows="4"
// //               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
// //               required
// //             />
// //           </div>
// //           <div className="flex justify-end space-x-2">
// //             <button
// //               type="button"
// //               onClick={onClose}
// //               className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
// //             >
// //               Cancel
// //             </button>
// //             <button
// //               type="submit"
// //               disabled={isSubmitting}
// //               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
// //             >
// //               {isSubmitting ? "Adding..." : "Add Note"}
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // const LeadInformationPage = ({ data, leadId, username, accessScore }) => {
// //   const lead = data?.data[0]; // Take the first lead from the array
// //   console.log(lead);

// //   const [sidebarOpen, setSidebarOpen] = useState(false);
// //   const [showDetails, setShowDetails] = useState(true); // State to control details visibility

// //   const [activeTab, setActiveTab] = useState("overview");
// //   const [notes, setNotes] = useState([]);

// //   const [tasks, setTasks] = useState([]);

// //   // Edit variable
// //   const [isEditing, setIsEditing] = useState(false);
// //   const [editedLead, setEditedLead] = useState({});
// //   const [isSaving, setIsSaving] = useState(false);

// //   const navigate = useNavigate();

// //   // Lead Status changed
// //   const [currentLeadStatus, setCurrentLeadStatus] = useState(
// //     lead?.Lead_Status || ""
// //   );

// //   const sidebarRef = useRef(null);

// //   const [fields, setFields] = useState([]);
// //   const [formData, setFormData] = useState({});
// //   const [loading, setLoading] = useState(true);

// //   // Add loading state
// //   const [isLoading, setIsLoading] = useState(false);

// //   const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
// //   const [isAddReasonModalOpen, setIsAddReasonModalOpen] = useState(false);

// //   // const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);

// //   const [showAttachmentsPage, setShowAttachmentsPage] = useState(true);
// //   const [showAddAttachment, setShowAddAttachment] = useState(false);
// //   const [isSupportOpen, setIsSupportOpen] = useState(false);

// //   // Button name variable

// //   const [selectedButton, setSelectedButton] = useState("");

// //   const [dataLoaded, setDataLoaded] = useState({
// //     notes: false,
// //     attachments: false,
// //     tasks: false,
// //   });

// //   const [attachments, setAttachments] = useState([]);
// //   // for conversion of lead
// //   const [contact, setContacts] = useState([]);

// //   useEffect(() => {
// //     fetchCRMFields();
// //   }, []);

// //   // Initialize editedLead with lead data when component mounts or lead data changes
// //   useEffect(() => {
// //     if (lead && fields.length > 0) {
// //       // Create an object with all form fields initialized from lead data
// //       const initialEditedLead = fields.reduce((acc, field) => {
// //         // Use the API name to get the value from the lead object
// //         const fieldValue =
// //           lead[field.api_name] !== undefined ? lead[field.api_name] : "";
// //         acc[field.api_name] = fieldValue;
// //         return acc;
// //       }, {});

// //       setEditedLead(initialEditedLead);

// //       // Set current lead status from lead data if available
// //       if (lead.Lead_Status) {
// //         setCurrentLeadStatus(lead.Lead_Status);
// //       }
// //     }
// //   }, [lead, fields]);

// //   async function fetchCRMFields() {
// //     try {
// //       setLoading(true);

// //       // Try to get data from cache first
// //       const cache = await caches.open(CACHE_NAME);
// //       const cachedResponse = await cache.match("/lead-form-fields");

// //       if (cachedResponse) {
// //         const data = await cachedResponse.json();
// //         processFieldData(data);
// //         return;
// //       }

// //       // If no cached data, fetch from API
// //       const response = await axios.get(
// //         `${process.env.REACT_APP_APP_API}/gets/getfields/Leads`
// //       );

// //       const fieldData = response?.data?.data?.fields || [];

// //       // Store the fetched data in Cache Storage
// //       const newResponse = new Response(JSON.stringify(fieldData), {
// //         headers: { "Content-Type": "application/json" },
// //       });
// //       await cache.put("/lead-form-fields", newResponse);

// //       processFieldData(fieldData);
// //     } catch (error) {
// //       console.error("Error fetching CRM fields:", error);
// //       toast.error(
// //         error?.response?.data?.message || "Failed to load form fields!"
// //       );
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   function processFieldData(fieldData) {
// //     // Filter fields based on view_type.create
// //     const filteredFields = fieldData.filter(
// //       (field) =>
// //         field.view_type?.create !== false ||
// //         ["Created_By", "Created_Time", "Modified_Time", "Modified_By"].includes(
// //           field.api_name
// //         )
// //     );

// //     // add created time and by field in end

// //     setFields(filteredFields);

// //     // Initialize formData with default values
// //     setFormData(
// //       filteredFields.reduce((acc, field) => {
// //         acc[field.api_name] = field.data_type === "boolean" ? false : "";
// //         return acc;
// //       }, {})
// //     );
// //   }

// //   // Function to handle input changes when editing
// //   const handleInputChange = (field, value) => {
// //     setEditedLead((prev) => ({
// //       ...prev,
// //       [field]: value,
// //     }));
// //   };

// //   // Function to toggle edit mode
// //   const toggleEditMode = () => {
// //     if (isEditing) {
// //       // If canceling edit, reset to original values
// //       if (lead && fields.length > 0) {
// //         const resetEditedLead = fields.reduce((acc, field) => {
// //           const fieldValue =
// //             lead[field.api_name] !== undefined ? lead[field.api_name] : "";
// //           acc[field.api_name] = fieldValue;
// //           return acc;
// //         }, {});

// //         setEditedLead(resetEditedLead);
// //       }
// //     }
// //     setIsEditing(!isEditing);
// //   };

// //   // Function to save edited lead data
// //   const saveLead = async () => {
// //     setIsSaving(true);
// //     try {
// //       const response = await axios.put(
// //         `${process.env.REACT_APP_APP_API}/update/updatemoduledata/Leads`,
// //         {
// //           id: leadId,
// //           ...editedLead,
// //         }
// //       );

// //       if (response.data.success) {
// //         // Update the local lead data with the edited values
// //         const updatedLead = { ...lead, ...editedLead };
// //         data.data[0] = updatedLead;

// //         // Update the current lead status if it was changed
// //         if (editedLead.Lead_Status) {
// //           setCurrentLeadStatus(editedLead.Lead_Status);
// //         }

// //         // Exit edit mode
// //         setIsEditing(false);

// //         toast.success("Lead updated successfully!");
// //       } else {
// //         toast.error("Failed to update lead. Please try again.");
// //       }
// //     } catch (error) {
// //       console.error("Error updating lead:", error);
// //       toast.error(
// //         error?.response?.data?.error?.data[0]?.message || "Something went wrong"
// //       );
// //     } finally {
// //       setIsSaving(false);
// //     }
// //   };

// //   // Function to handle lead conversion
// //   const convertLeadHandler = async () => {
// //     setIsSaving(true); // Start loading state
// //     // Example values (replace these with actual state or props if needed)
// //     const email = lead.Email || "test@example.com";
// //     const phone = lead.Phone || "9876543210";
// //     const company = lead.Company ;

// //     try {
// //       const response = await axios.get(
// //         `${process.env.REACT_APP_APP_API}/lead/searchrecords`,
// //         {
// //           params: {
// //             email,
// //             phone,
// //             company
// //           },
// //         }
// //       );

// //       if (response.data.success) {
// //         // Set contacts data correctly
// //         setContacts(response.data.data);
// //         // Open the support popup
// //         setIsSupportOpen(true);
// //       } else {
// //         toast.error("Failed to find matching records. Please try again.");
// //       }
// //     } catch (error) {
// //       console.error("Error searching lead records:", error);
// //       toast.error(
// //         error?.response?.data?.error?.data?.[0]?.message ||
// //           error?.response?.data?.message ||
// //           "Something went wrong"
// //       );
// //     } finally {
// //       setIsSaving(false); // End loading state
// //     }
// //   };

// //   // Toggle details visibility
// //   const toggleDetails = () => {
// //     setShowDetails(!showDetails);
// //   };

// //   // Function to handle form field changes
// //   const handleChange = (e) => {
// //     const { name, value, type, checked } = e.target;
// //     const fieldValue = type === "checkbox" ? checked : value;

// //     // Update formData for non-edit mode
// //     setFormData((prevData) => ({
// //       ...prevData,
// //       [name]: fieldValue,
// //     }));

// //     // Also update editedLead for edit mode
// //     setEditedLead((prev) => ({
// //       ...prev,
// //       [name]: fieldValue,
// //     }));
// //   };

// //   // Function to render form field based on its type
// //   const renderFormField = (field, fieldDef) => {
// //     // Get the value from editedLead or fall back to lead data
// //     const rawFieldValue =
// //       editedLead[field.api_name] !== undefined
// //         ? editedLead[field.api_name]
// //         : lead?.[field.api_name] || "";

// //     // Handle case where the value is an object
// //     let fieldValue = rawFieldValue;
// //     if (typeof rawFieldValue === "object" && rawFieldValue !== null) {
// //       // If it's an object with a 'name' property (common in CRMs), use that
// //       if (rawFieldValue.name) {
// //         fieldValue = rawFieldValue.name;
// //       } else if (rawFieldValue.id) {
// //         // Or if it has an ID, use a reasonable string representation
// //         fieldValue = `${rawFieldValue.id}`;
// //       } else {
// //         // Last resort: stringify but clean it up
// //         fieldValue = JSON.stringify(rawFieldValue);
// //       }
// //     }

// //     // Enhanced field rendering based on data_type
// //     if (
// //       fieldDef.data_type === "picklist" &&
// //       fieldDef.pick_list_values &&
// //       fieldDef.pick_list_values.length > 0
// //     ) {
// //       // Use the correct options list based on field key
// //       let options = [];
// //       if (fieldDef.pick_list_values) {
// //         // Use the pick_list_values from the field definition if available
// //         options = fieldDef.pick_list_values.map(
// //           (option) => option.display_value || option.actual_value || option
// //         );
// //       }

// //       return (
// //         <select
// //           name={field.api_name}
// //           value={fieldValue || ""}
// //           onChange={(e) => handleInputChange(field.api_name, e.target.value)}
// //           className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
// //         >
// //           <option value="">
// //             Select {fieldDef.display_label || fieldDef.display_name}
// //           </option>
// //           {options.map((option) => {
// //             // Handle both string options and object options
// //             const optionValue =
// //               typeof option === "object"
// //                 ? option.actual_value || option.display_value
// //                 : option;
// //             const displayValue =
// //               typeof option === "object" ? option.display_value : option;

// //             return (
// //               <option key={optionValue} value={optionValue}>
// //                 {displayValue}
// //               </option>
// //             );
// //           })}
// //         </select>
// //       );
// //     } else if (fieldDef.data_type === "boolean") {
// //       // Render checkbox for boolean fields
// //       return (
// //         <input
// //           type="checkbox"
// //           name={field.api_name}
// //           checked={fieldValue || false}
// //           onChange={(e) => handleInputChange(field.api_name, e.target.checked)}
// //           className="w-5 h-5"
// //         />
// //       );
// //     } else {
// //       // For all other field types, use the appropriate input type
// //       return (
// //         <input
// //           type={getInputType(field)}
// //           name={field.api_name}
// //           value={fieldValue || ""}
// //           onChange={(e) => handleInputChange(field.api_name, e.target.value)}
// //           className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
// //         />
// //       );
// //     }
// //   };

// //   // Function to render field display (non-edit mode)
// //   const renderFieldDisplay = (fieldKey, specialClass = "") => {
// //     // Find the field value from lead data
// //     const fieldValue = lead?.[fieldKey];

// //     // Special handling for Lead_Status
// //     if (fieldKey === "Lead_Status" && fieldValue) {
// //       return (
// //         <span
// //           className={`px-2 sm:px-3 py-0.5 sm:py-1 inline-block rounded-full text-xs sm:text-sm font-medium ${
// //             statusColors[fieldValue] || "bg-gray-200 text-gray-700"
// //           }`}
// //         >
// //           {safeRenderValue(fieldValue)}
// //         </span>
// //       );
// //     }

// //     // Special handling for email fields
// //     if (fieldKey === "Email" || fieldKey === "Secondary_Email") {
// //       return (
// //         <span
// //           className={`text-sm sm:text-base font-medium text-blue-600 break-all ${specialClass}`}
// //         >
// //           {safeRenderValue(fieldValue)}
// //         </span>
// //       );
// //     }

// //     if (fieldKey === "Modified_Time" || fieldKey === "Created_Time") {
// //       return formatDate(fieldValue);
// //     }
// //     // Default display
// //     return (
// //       <span className={`text-sm sm:text-base font-medium ${specialClass}`}>
// //         {safeRenderValue(fieldValue)}
// //       </span>
// //     );
// //   };

// //   // Modified fetchNotes function with proper loading state handling
// //   const fetchNotes = async () => {
// //     // First, set the active tab to 'notes' to show this tab
// //     setActiveTab("notes");

// //     // If notes are already loaded, don't fetch them again
// //     if (dataLoaded.notes) {
// //       setIsLoading(false); // Make sure loading is false even when using cached data
// //       return;
// //     }

// //     // Set loading state
// //     setIsLoading(true);

// //     try {
// //       const response = await axios.get(
// //         `${process.env.REACT_APP_APP_API}/related/notes/${"Leads"}/${leadId}`
// //       );
// //       setNotes(response?.data?.data?.data);

// //       // Mark notes as loaded
// //       setDataLoaded((prev) => ({
// //         ...prev,
// //         notes: true,
// //       }));
// //     } catch (error) {
// //       console.error("Error fetching notes:", error);
// //       // Optionally show an error toast or message
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // Fetch the tasks

// //   const fetchTasks = async () => {
// //     // First, set the active tab to 'openActivity' to show this tab
// //     setActiveTab("openActivity");

// //     // If tasks are already loaded, don't fetch them again
// //     if (dataLoaded.tasks) {
// //       setIsLoading(false);
// //       return;
// //     }

// //     // Set loading state
// //     setIsLoading(true);

// //     try {
// //       const response = await axios.get(
// //         `${process.env.REACT_APP_APP_API}/related/openactivities`,
// //         {
// //           params: {
// //             $se_module: "Leads",
// //             What_Id: leadId,
// //             Who_Id: null,
// //           },
// //         }
// //       );
// //       setTasks(response?.data?.data?.data || []);

// //       // Mark tasks as loaded
// //       setDataLoaded((prev) => ({
// //         ...prev,
// //         tasks: true,
// //       }));
// //     } catch (error) {
// //       console.error("Error fetching tasks:", error);
// //       // Optionally show an error toast or message
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const handleNoteAdded = (newNote) => {
// //     // Update notes list when a new note is added
// //     // setNotes([newNote, ...notes]);
// //     setNotes([newNote, ...(notes || [])]);
// //   };

// //   const handleLeadStatusUpdated = (newStatus) => {
// //     setCurrentLeadStatus(newStatus);
// //     // Update the lead data with the new status
// //     if (data?.data?.[0]) {
// //       data.data[0].Lead_Status = newStatus;
// //     }
// //   };

// //   // Handle tab switching
// //   const handleTabSwitch = (tab) => {
// //     setActiveTab(tab);

// //     // Reset loading state when switching tabs
// //     setIsLoading(true);

// //     // Fetch data for the selected tab if not already loaded
// //     if (tab === "notes") {
// //       // If notes already loaded, set loading to false immediately
// //       if (dataLoaded.notes) {
// //         setIsLoading(false);
// //       } else {
// //         fetchNotes();
// //       }
// //     }

// //     if (tab === "openActivity") {
// //       // If tasks already loaded, set loading to false immediately
// //       if (dataLoaded.tasks) {
// //         setIsLoading(false);
// //       } else {
// //         fetchTasks();
// //       }
// //     }

// //     // You can add similar logic for attachments tab if needed
// //     if (tab === "attachments") {
// //       setShowAttachmentsPage(true);
// //       setShowAddAttachment(false);

// //       // If attachments already loaded, set loading to false immediately
// //       if (dataLoaded.attachments) {
// //         setIsLoading(false);
// //       } else {
// //         // Mark attachments as being loaded - this helps prevent multiple API calls
// //         setDataLoaded((prev) => ({
// //           ...prev,
// //           attachments: true,
// //         }));
// //       }
// //     }
// //   };

// //   // Create a new cached version of ShowAttachment
// //   const CachedShowAttachment = ({ leadId, onClose }) => {
// //     return (
// //       <ShowAttachment
// //         leadId={leadId}
// //         onClose={onClose}
// //         cachedData={attachments}
// //         setCachedData={setAttachments}
// //         dataLoaded={dataLoaded.attachments}
// //         isLoading={isLoading}
// //         setIsLoading={setIsLoading}
// //       />
// //     );
// //   };

// //   // Create a cached version of TaskDetailsPage
// //   const CachedTaskDetailsPage = () => {
// //     return (
// //       <TaskDetailsPage
// //         leadId={leadId}
// //         cachedData={tasks}
// //         setCachedData={setTasks}
// //         dataLoaded={dataLoaded.tasks}
// //         isLoading={isLoading}
// //         setIsLoading={setIsLoading}
// //       />
// //     );
// //   };

// //   // // Toggle details visibility
// //   // const toggleDetails = () => {
// //   //   setShowDetails(!showDetails);
// //   // };

// //   // Status change functionality

// //   const handleClick = (status) => {
// //     setSelectedButton(status);
// //     setIsAddReasonModalOpen(true);
// //   };

// //   return (
// //     <>
// //       <Navbar />
// //       {fields.length <= 0 ? (
// //         <DetailsShimmer />
// //       ) : (
// //         <div className="flex min-h-screen bg-gray-50 relative">
// //           {/* Main Content Area */}
// //           <div className="flex-1 flex flex-col">
// //             {/* Top Navigation Bar */}
// //             <header className="bg-white shadow-sm border-b border-gray-200">
// //               <div className="flex items-center px-2 sm:px-4 py-2">
// //                 {/* Desktop back button (hidden on mobile) */}
// //                 <button
// //                   className="p-2 mr-2 rounded-full hover:bg-gray-100 hidden lg:block"
// //                   onClick={() => navigate("/app/leadview")}
// //                 >
// //                   <ArrowLeft className="w-5 h-5 text-gray-600" />
// //                 </button>

// //                 {/* Mobile back button (visible only on small screens) */}
// //                 <button
// //                   className="py-1 px-2 mr-2 text-xs rounded-md bg-gray-100 hover:bg-gray-200 flex items-center lg:hidden"
// //                   onClick={() => navigate("/app/leadview")}
// //                 >
// //                   <ArrowLeft className="w-4 h-4 mr-1 text-gray-600" />
// //                 </button>

// //                 <div className="flex items-center">
// //                   <div className="bg-red-500 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
// //                     {lead?.First_Name ? lead.First_Name.charAt(0) : "K"}
// //                   </div>
// //                   <div className="overflow-hidden">
// //                     <h1 className="text-base sm:text-lg font-medium truncate">
// //                       {safeRenderValue(lead?.Full_Name) ||
// //                         "Mr. Kushal Pratap Singh"}
// //                     </h1>
// //                     <p className="text-xs sm:text-sm text-gray-500 truncate">
// //                       {safeRenderValue(lead?.Company) || "Coding Ninjas"}
// //                     </p>
// //                   </div>
// //                 </div>

// //                 <div className="ml-auto flex space-x-1 sm:space-x-2">
// //                   {isEditing ? (
// //                     <>
// //                       <button
// //                         className="border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-gray-50 text-sm sm:text-base"
// //                         onClick={toggleEditMode}
// //                         disabled={isSaving}
// //                       >
// //                         <span className="hidden sm:inline">Cancel</span>
// //                         <X className="w-4 h-4 inline sm:hidden" />
// //                       </button>
// //                       <button
// //                         className="border border-blue-500 bg-blue-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-blue-600 text-sm sm:text-base"
// //                         onClick={saveLead}
// //                         disabled={isSaving}
// //                       >
// //                         {isSaving ? (
// //                           <span className="hidden sm:inline">Saving...</span>
// //                         ) : (
// //                           <>
// //                             <span className="hidden sm:inline">Save</span>
// //                             <Save className="w-4 h-4 inline sm:hidden" />
// //                           </>
// //                         )}
// //                       </button>
// //                     </>
// //                   ) : (
// //                     <div className="flex gap-10">
// //                       <button
// //                         className={`border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base
// //   ${accessScore < 3 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
// //                         onClick={() => {
// //                           convertLeadHandler(); // Just call this function directly
// //                         }}
// //                         disabled={accessScore < 3 || isSaving} // Disable when loading or insufficient access
// //                       >
// //                         {isSaving ? (
// //                           <span className="flex items-center">
// //                             <svg
// //                               className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
// //                               xmlns="http://www.w3.org/2000/svg"
// //                               fill="none"
// //                               viewBox="0 0 24 24"
// //                             >
// //                               <circle
// //                                 className="opacity-25"
// //                                 cx="12"
// //                                 cy="12"
// //                                 r="10"
// //                                 stroke="currentColor"
// //                                 strokeWidth="4"
// //                               ></circle>
// //                               <path
// //                                 className="opacity-75"
// //                                 fill="currentColor"
// //                                 d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
// //                               ></path>
// //                             </svg>
// //                             Converting...
// //                           </span>
// //                         ) : (
// //                           <span className="hidden sm:inline">Convert Lead</span>
// //                         )}
// //                         <Edit
// //                           className={`w-4 h-4 ${
// //                             isSaving ? "hidden" : "inline sm:hidden"
// //                           }`}
// //                         />
// //                       </button>
// //                       <button
// //                         className={`border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base
// //                       ${
// //                         accessScore < 3
// //                           ? "opacity-50 cursor-not-allowed"
// //                           : "hover:bg-gray-50"
// //                       }`}
// //                         onClick={toggleEditMode}
// //                         disabled={accessScore < 3} // Disable button if accessScore is less than 3
// //                       >
// //                         <span className="hidden sm:inline">Edit</span>
// //                         <Edit className="w-4 h-4 inline sm:hidden" />
// //                       </button>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>
// //             </header>

// //             {/* Tabs */}
// //             <div className="border-b border-gray-200 bg-white">
// //               <div className="px-3 sm:px-6 py-2">
// //                 <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
// //                   <button
// //                     className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
// //                       activeTab === "overview"
// //                         ? "border-b-2 border-blue-500 text-blue-600"
// //                         : "text-gray-500 hover:text-gray-700"
// //                     }`}
// //                     onClick={() => handleTabSwitch("overview")}
// //                   >
// //                     Overview
// //                   </button>
// //                   <button
// //                     className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
// //                       activeTab === "notes"
// //                         ? "border-b-2 border-blue-500 text-blue-600"
// //                         : "text-gray-500 hover:text-gray-700"
// //                     }`}
// //                     onClick={() => handleTabSwitch("notes")}
// //                   >
// //                     Notes
// //                   </button>
// //                   <button
// //                     className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
// //                       activeTab === "attachments"
// //                         ? "border-b-2 border-blue-500 text-blue-600"
// //                         : "text-gray-500 hover:text-gray-700"
// //                     }`}
// //                     onClick={() => handleTabSwitch("attachments")}
// //                   >
// //                     Attachments
// //                   </button>
// //                   <button
// //                     className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${
// //                       activeTab === "openActivity"
// //                         ? "border-b-2 border-blue-500 text-blue-600"
// //                         : "text-gray-500 hover:text-gray-700"
// //                     }`}
// //                     onClick={() => handleTabSwitch("openActivity")}
// //                   >
// //                     Activities
// //                   </button>
// //                 </div>
// //               </div>
// //             </div>

// //             {/* Main Content */}
// //             <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
// //               {activeTab === "overview" && (
// //                 <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
// //                   <div className="p-3 sm:p-6 overflow-auto">
// //                     <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-4">
// //                       <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-4 justify-center items-center">
// //                         <button
// //                           onClick={() => handleClick("Contacted")}
// //                           className="group relative px-6 py-3 text-sm font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
// //                         >
// //                           <span className="relative z-10 flex items-center justify-center">
// //                             <span className="mr-2">✓</span>
// //                             Contacted
// //                           </span>
// //                           <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
// //                         </button>

// //                         <button
// //                           onClick={() => handleClick("Not Contacted")}
// //                           className="group relative px-6 py-3 text-sm font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl"
// //                         >
// //                           <span className="relative z-10 flex items-center justify-center">
// //                             Not Contacted
// //                           </span>
// //                           <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
// //                         </button>

// //                         <button
// //                           onClick={() => handleClick("Junk Lead")}
// //                           className="group relative px-6 py-3 text-sm font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-xl"
// //                         >
// //                           <span className="relative z-10 flex items-center justify-center">
// //                             <span className="mr-2">⚠</span>
// //                             Junk Lead
// //                           </span>
// //                           <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
// //                         </button>

// //                         <button
// //                           onClick={() => handleClick("Not Qualified")}
// //                           className="group relative px-6 py-3 text-sm font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg hover:shadow-xl"
// //                         >
// //                           <span className="relative z-10 flex items-center justify-center">
// //                             <span className="mr-2">!</span>
// //                             Not Qualified
// //                           </span>
// //                           <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
// //                         </button>
// //                       </div>
// //                     </div>
// //                   </div>
// //                   <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
// //                     <h2 className="text-base sm:text-lg font-medium text-gray-800">
// //                       Lead Information
// //                     </h2>
// //                     <button
// //                       className="text-blue-600 text-xs sm:text-sm hover:underline"
// //                       onClick={toggleDetails}
// //                     >
// //                       {showDetails ? "Hide Details" : "Show Details"}
// //                     </button>
// //                   </div>

// //                   {/* Details content - conditionally rendered based on showDetails state */}
// //                   {showDetails && (
// //                     <>
// //                       <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
// //                         {/* Display all fields without filtering */}
// //                         {fields.map((field, index) => (
// //                           <div
// //                             key={field.api_name}
// //                             className="flex items-start"
// //                           >
// //                             <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">
// //                               {field.display_label || field.api_name}
// //                             </div>
// //                             <div className="flex-1">
// //                               {isEditing &&
// //                               field.api_name !== "id" &&
// //                               field.data_type !== "lookup" &&
// //                               field.data_type !== "ownerlookup" ? (
// //                                 renderFormField(field, field)
// //                               ) : field.api_name === "Mobile" ||
// //                                 field.api_name === "Phone" ? (
// //                                 <div className="flex items-center">
// //                                   <span className="bg-green-100 rounded-full p-1 mr-2">
// //                                     <Phone className="w-3 h-3 text-green-600" />
// //                                   </span>
// //                                   {renderFieldDisplay(field.api_name)}
// //                                 </div>
// //                               ) : field.api_name === "Email" ||
// //                                 field.api_name === "Secondary_Email" ? (
// //                                 renderFieldDisplay(
// //                                   field.api_name,
// //                                   "text-blue-600"
// //                                 )
// //                               ) : (
// //                                 renderFieldDisplay(field.api_name)
// //                               )}
// //                             </div>
// //                           </div>
// //                         ))}
// //                       </div>
// //                     </>
// //                   )}

// //                   {/* Display a message when details are hidden */}
// //                   {!showDetails && (
// //                     <div className="p-6 text-center text-gray-500">
// //                       Details are hidden. Click "Show Details" to view lead
// //                       information.
// //                     </div>
// //                   )}
// //                 </div>
// //               )}

// //               {activeTab === "notes" && (
// //                 <div className="space-y-4">
// //                   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
// //                     <div className="flex justify-between items-center mb-4">
// //                       <h2 className="text-base sm:text-lg font-medium text-gray-800">
// //                         Notes ({notes?.length || 0})
// //                       </h2>
// //                       <button
// //                         className="text-blue-600 text-sm hover:underline"
// //                         onClick={() => setIsAddNoteModalOpen(true)}
// //                       >
// //                         Add Note
// //                       </button>
// //                     </div>

// //                     {isLoading ? (
// //                       <div className="text-center text-gray-500 py-6">
// //                         <NotesUi />
// //                       </div>
// //                     ) : !notes || notes.length === 0 ? (
// //                       <div className="text-center text-gray-500 py-6">
// //                         No notes found for this lead.
// //                       </div>
// //                     ) : (
// //                       <div className="space-y-4">
// //                         {notes.map((note) => (
// //                           <NotesCard key={note.id} note={note} />
// //                         ))}
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>
// //               )}

// //               {activeTab === "attachments" && (
// //                 <div className="space-y-4">
// //                   <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
// //                     <div className="flex justify-between items-center mb-4">
// //                       <h2 className="text-base sm:text-lg font-medium text-gray-800">
// //                         Attachments
// //                       </h2>
// //                     </div>
// //                     {showAttachmentsPage ? (
// //                       <CachedShowAttachment
// //                         leadId={lead?.id}
// //                         onClose={() => setShowAttachmentsPage(false)}
// //                       />
// //                     ) : showAddAttachment ? (
// //                       <AttachFilePage
// //                         leadId={lead?.id}
// //                         onClose={() => setShowAddAttachment(false)}
// //                       />
// //                     ) : (
// //                       <div className="text-center text-gray-500 py-6">
// //                         Click "Show All Attachments" to view files or "Add New
// //                         Attachment" to upload files.
// //                       </div>
// //                     )}
// //                   </div>
// //                 </div>
// //               )}

// //               {activeTab === "openActivity" && <CachedTaskDetailsPage />}
// //             </div>
// //           </div>
// //           <AddNoteModal
// //             isOpen={isAddNoteModalOpen}
// //             onClose={() => setIsAddNoteModalOpen(false)}
// //             leadId={leadId}
// //             username={username}
// //             onNoteAdded={handleNoteAdded}
// //           />
// //           <AddReasonModal
// //             isOpen={isAddReasonModalOpen}
// //             onClose={() => setIsAddReasonModalOpen(false)}
// //             leadId={leadId}
// //             username={username}
// //             leadStatus={currentLeadStatus}
// //             buttonName={selectedButton}
// //             onLeadStatusUpdated={handleLeadStatusUpdated}
// //           />
// //         </div>
// //       )}

// //       <ConvertLead
// //         isOpen={isSupportOpen}
// //         lead={lead}
// //         setIsOpen={setIsSupportOpen}
// //         data={contact}
// //         leadId={leadId}
// //       />
// //     </>
// //   );
// // };

// // export default LeadInformationPage;

