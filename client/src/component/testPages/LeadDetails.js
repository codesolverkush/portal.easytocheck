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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
              {isSubmitting ? "Adding..." : "Add Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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

  // Function to save edited lead data
  // const convertLeadHandler = async () => {
  //   setIsSaving(true);
  //    // Example values (replace these with actual state or props if needed)
  //   const email = lead.Email || 'test@example.com';
  //   const phone = lead.Phone || '9876543210';
  //   try {

  //     const response = await axios.get(
  //       `${process.env.REACT_APP_APP_API}/lead/searchrecords`,
  //       {
  //         params: {
  //           email,
  //           phone,
  //         },
  //       }

  //     );
  //     console.log("leadres",response);
  //     if(response.success){
  //       setContacts(response?.data?.data?.data[0]);
  //       setIsSupportOpen(true);
  //     }
  //     else {
  //       toast.error("Failed to update lead. Please try again.");
  //     }
  //   } catch (error) {
  //     console.error("Error updating lead:", error);
  //     toast.error(
  //       error?.response?.data?.error?.data[0]?.message || "Something went wrong"
  //     );
  //   } finally {
  //     setIsSaving(false);
  //   }
  // };

  // Function to handle lead conversion
  const convertLeadHandler = async () => {
    setIsSaving(true); // Start loading state
    // Example values (replace these with actual state or props if needed)
    const email = lead.Email || "test@example.com";
    const phone = lead.Phone || "9876543210";
    const company = lead.Company ;

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/lead/searchrecords`,
        {
          params: {
            email,
            phone,
            company
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
      <span className={`text-sm sm:text-base font-medium ${specialClass}`}>
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
                    {lead?.First_Name ? lead.First_Name.charAt(0) : "K"}
                  </div>
                  <div className="overflow-hidden">
                    <h1 className="text-base sm:text-lg font-medium truncate">
                      {safeRenderValue(lead?.Full_Name) ||
                        "Mr. Kushal Pratap Singh"}
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-500 truncate">
                      {safeRenderValue(lead?.Company) || "Coding Ninjas"}
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
                    <div className="flex gap-10">
                      <button
                        className={`border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base
  ${accessScore < 3 ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}`}
                        onClick={() => {
                          convertLeadHandler(); // Just call this function directly
                        }}
                        disabled={accessScore < 3 || isSaving} // Disable when loading or insufficient access
                      >
                        {isSaving ? (
                          <span className="flex items-center">
                            <svg
                              className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700"
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
                          <span className="hidden sm:inline">Convert Lead</span>
                        )}
                        <Edit
                          className={`w-4 h-4 ${
                            isSaving ? "hidden" : "inline sm:hidden"
                          }`}
                        />
                      </button>
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
                    </div>
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
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
              {activeTab === "overview" && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="p-3 sm:p-6 overflow-auto">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-4">
                      <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-4 justify-center items-center">
                        <button
                          onClick={() => handleClick("Contacted")}
                          className="group relative px-6 py-3 text-sm font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            <span className="mr-2">✓</span>
                            Contacted
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>

                        <button
                          onClick={() => handleClick("Not Contacted")}
                          className="group relative px-6 py-3 text-sm font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 shadow-lg hover:shadow-xl"
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            Not Contacted
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>

                        <button
                          onClick={() => handleClick("Junk Lead")}
                          className="group relative px-6 py-3 text-sm font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-lg hover:shadow-xl"
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            <span className="mr-2">⚠</span>
                            Junk Lead
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-rose-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>

                        <button
                          onClick={() => handleClick("Not Qualified")}
                          className="group relative px-6 py-3 text-sm font-semibold text-white rounded-lg overflow-hidden transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg hover:shadow-xl"
                        >
                          <span className="relative z-10 flex items-center justify-center">
                            <span className="mr-2">!</span>
                            Not Qualified
                          </span>
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-base sm:text-lg font-medium text-gray-800">
                      Lead Information
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
                                renderFormField(field, field)
                              ) : field.api_name === "Mobile" ||
                                field.api_name === "Phone" ? (
                                <div className="flex items-center">
                                  <span className="bg-green-100 rounded-full p-1 mr-2">
                                    <Phone className="w-3 h-3 text-green-600" />
                                  </span>
                                  {renderFieldDisplay(field.api_name)}
                                </div>
                              ) : field.api_name === "Email" ||
                                field.api_name === "Secondary_Email" ? (
                                renderFieldDisplay(
                                  field.api_name,
                                  "text-blue-600"
                                )
                              ) : (
                                renderFieldDisplay(field.api_name)
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
          />
        </div>
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
