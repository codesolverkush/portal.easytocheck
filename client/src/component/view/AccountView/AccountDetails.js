import React, { useState, useEffect } from "react";
import {
  Phone,
  ArrowLeft,
  X,
  Save,
  Handshake,
  Contact2Icon,
} from "lucide-react";
import axios from "axios";
import Navbar from "../../common/Navbar";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DetailsShimmer from "../../ui/DetailsShimmer";
import AssociatedDealWithContact from "../ContactView/AssociatedDealWithContact";
import AssociatedContactWithAccount from "./AssociatedContactWithAccount";

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

// Field priority enums
const PRIORITY = Object.freeze({
  // General Information priorities
  OWNER: 1,
  Account_Name: 2,
  Parent_Account: 3,
  Account_Site: 4,
  Annual_Revenue: 5,

  EMAIL: 6,
  PHONE: 7,
  MOBILE: 8,
  Account_Type: 9,

  // Address priorities
  Billing_STREET: 1,
  Billing_City: 2,
  Billing_State: 3,
  Billing_Country: 4,
  Billing_Code: 5,
  Shipping_Street: 6,
  Shipping_City: 7,
  Shipping_State: 8,
  Shipping_Country: 9,
  Shipping_Code: 10,

 

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

const AccountDetails = ({ accessScore, data, username, accountId }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialContactId = location?.state?.contactId;

  const [selectedContactId, setSelectedContactId] = useState(accountId);
  const [contactList, setContactList] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const [showAttachmentsPage, setShowAttachmentsPage] = useState(true);
  const [showAddAttachment, setShowAddAttachment] = useState(false);

  const [dataLoaded, setDataLoaded] = useState({
    notes: false,
    attachments: false,
    tasks: false,
    contacts:false,
  });

  const [tasks, setTasks] = useState([]);

  const [deals, setDeals] = useState([]);
  const [contacts, setContacts] = useState([]);

  // location variable for the checkIn purpose
  const [address, setAddress] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  async function fetchContactsFields() {
    try {
      setLoading(true);

      // Try to get data from cache first
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match("/account-fields");

      if (cachedResponse) {
        const data = await cachedResponse.json();
        processFieldData(data);
        return;
      }

      // If no cached data, fetch from API
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/gets/getfields/Accounts`
      );

      const fieldData = response?.data?.data?.fields || [];

      // Store the fetched data in Cache Storage
      const newResponse = new Response(JSON.stringify(fieldData), {
        headers: { "Content-Type": "application/json" },
      });
      await cache.put("/account-fields", newResponse);

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
        `${process.env.REACT_APP_APP_API}/update/updatemoduledata/Accounts`,
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
            ...editedContact,
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
      <span
        className={`text-sm sm:text-base text-gray-700 font-medium ${specialClass}`}
      >
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

  const fetchAssociatedDeals = async () => {
    setActiveTab("deals");

    // If tasks are already loaded, don't fetch them again
    if (dataLoaded.deals) {
      setIsLoading(false);
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/deal/associateddealwithaccount`,{
            params: {
                accountid: selectedContactId,
            }
        }
      );
      setDeals(response?.data?.data?.data || []);

      // Mark tasks as loaded
      setDataLoaded((prev) => ({
        ...prev,
        deals: true,
      }));
    } catch (error) {
      console.error("Error fetching deals:", error);
      // Optionally show an error toast or message
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAssociatedContact = async () => {
    setActiveTab("contacts");

    // If tasks are already loaded, don't fetch them again
    if (dataLoaded.contacts) {
      setIsLoading(false);
      return;
    }

    // Set loading state
    setIsLoading(true);

    try {
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/deal/associatedcontactwithaccount`,{
            params: {
                accountid: selectedContactId,
            }
        }
      );
      console.log("response",response);
      setContacts(response?.data?.data?.data || []);

      // Mark tasks as loaded
      setDataLoaded((prev) => ({
        ...prev,
        contacts: true,
      }));
    } catch (error) {
      console.error("Error fetching contacts:", error);
      // Optionally show an error toast or message
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tab switching
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);

    if (tab === "deals") {
      if (dataLoaded.deals) {
        setIsLoading(false);
      } else {
        fetchAssociatedDeals();
      }
    }

    if (tab === "contacts") {
      if (dataLoaded.contacts) {
        setIsLoading(false);
      } else {
        fetchAssociatedContact();
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

  // Define field priority for each category using enums
  const getFieldPriority = (fieldName) => {
    const lowerName = fieldName.toLowerCase();

    // General contact information priorities
    if (lowerName.includes("easy")) return PRIORITY.CLUSER;
    if (lowerName.includes("salu")) return PRIORITY.SALUTATION;
    if (lowerName.includes("account_name")) return PRIORITY.Account_Name;
    if (lowerName.includes("parent_account")) return PRIORITY.Parent_Account;
    if (lowerName.includes("account_site")) return PRIORITY.Account_Site;
    if (lowerName.includes("annual_revenue")) return PRIORITY.Annual_Revenue;
    if (lowerName.includes("account_type")) return PRIORITY.Account_Type;

    if (lowerName.includes("email")) return PRIORITY.EMAIL;
    if (lowerName.includes("phone")) return PRIORITY.PHONE;
    if (lowerName.includes("mobile")) return PRIORITY.MOBILE;
    if (lowerName.includes("owner")) return PRIORITY.OWNER;

    // Address information priorities
    if (lowerName.includes("billing_street")) return PRIORITY.Billing_STREET;
    if (lowerName.includes("billing_city")) return PRIORITY.Billing_City;
    if (lowerName.includes("billing_state")) return PRIORITY.Billing_State;
    if (lowerName.includes("billing_country")) return PRIORITY.Billing_Country;
    if (lowerName.includes("billing_code")) return PRIORITY.Billing_Code;
    if (lowerName.includes("shipping_street")) return PRIORITY.Shipping_Street;
    if (lowerName.includes("shipping_city")) return PRIORITY.Shipping_City;
    if (lowerName.includes("shipping_state")) return PRIORITY.Shipping_State;
    if (lowerName.includes("shipping_country")) return PRIORITY.Shipping_Country;
    if (lowerName.includes("shipping_code")) return PRIORITY.Shipping_Code;

    // Default priority
    return PRIORITY.DEFAULT;
  };

  // Group fields into sections for better organization with proper ordering
  // This function organizes and renders the contact form fields based on category and priority
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

      if (
        field.api_name.toLowerCase().includes("owner") ||
        field.api_name.toLowerCase().includes("easy") ||
        field.api_name.toLowerCase().includes("salu") ||
        field.api_name.toLowerCase().includes("account_name") ||
        field.api_name.toLowerCase().includes("parent_account") ||
        field.api_name.toLowerCase().includes("account_site") ||
        field.api_name.toLowerCase().includes("annual_revenue") ||
        field.api_name.toLowerCase().includes("account_type") ||
        field.api_name.toLowerCase().includes("email") ||
        field.api_name.toLowerCase().includes("phone") ||
        field.api_name.toLowerCase().includes("mobile") ||
        field.api_name.toLowerCase().includes("contact") ||
        field.api_name.toLowerCase().includes("title")
      ) {
        category = CATEGORY_ORDER.GENERAL;
      } else if (
        field.api_name.toLowerCase().includes("organization") ||
        field.api_name.toLowerCase().includes("business")
      ) {
        category = CATEGORY_ORDER.COMPANY;
      } else if (
        field.api_name.toLowerCase().includes("billing_street") ||
        field.api_name.toLowerCase().includes("billing_city") ||
        field.api_name.toLowerCase().includes("billing_state") ||
        field.api_name.toLowerCase().includes("billing_country") ||
        field.api_name.toLowerCase().includes("billing_code") ||
        field.api_name.toLowerCase().includes("shipping_street") ||
        field.api_name.toLowerCase().includes("shipping_city") ||
        field.api_name.toLowerCase().includes("shipping_state") ||
        field.api_name.toLowerCase().includes("shipping_country") ||
        field.api_name.toLowerCase().includes("shipping_code")

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
        <div key={category} className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">
            <span className="mr-2 font-bold">{category}</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {groupedFields[category].map((field) => renderField(field))}
          </div>
        </div>
      );
    });
  }

  // Function to render individual field
  const renderField = (field) => {
    // Skip system fields or fields that shouldn't be displayed
    if (
      field.api_name === "id" ||
      field.api_name === "Created_Time" ||
      field.api_name === "Modified_Time" ||
      field.api_name === "Created_By" ||
      field.api_name === "Modified_By"
    ) {
      return null;
    }

    return (
      <div
        key={field.api_name}
        className="flex flex-col sm:flex-row items-center justify-between p-3 rounded-lg gap-2 hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="w-full sm:w-1/3 font-semibold text-black mb-1 sm:mb-0">
          {field.display_label || field.api_name}
        </div>
        <div className="flex-1 w-full sm:w-2/3">
          {isEditing &&
          field.api_name !== "id" &&
          field.data_type !== "lookup" &&
          field.data_type !== "ownerlookup" ? (
            <div className="w-full focus-within:ring-2 focus-within:ring-blue-300 rounded transition-all duration-200">
              {renderFormField(field.api_name, field)}
            </div>
          ) : field.api_name === "Mobile" || field.api_name === "Phone" ? (
            <div className="flex items-center group">
              <span className="bg-green-100 rounded-full p-1.5 mr-2 group-hover:bg-green-200 transition-colors duration-200">
                <Phone className="w-3 h-3 text-green-600" />
              </span>
              {renderFieldDisplay(field)}
            </div>
          ) : field.api_name === "Email" ||
            field.api_name === "Secondary_Email" ? (
            <div className="text-blue-600 font-medium hover:text-blue-800 transition-colors duration-200">
              {renderFieldDisplay(field, "text-blue-600")}
            </div>
          ) : (
            <div className="text-gray-800 font-medium">
              {renderFieldDisplay(field)}
            </div>
          )}
        </div>
      </div>
    );
  };

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  //   Create a cached version of associatedeal
  const CachedDealWithContact = () => {
    return <AssociatedDealWithContact deals={deals} loading={isLoading} />;
  };

  const CachedContactWithAccount = () => {
    return (
      <AssociatedContactWithAccount contacts={contacts} loading={isLoading} />
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
                  onClick={() => navigate("/app/accountview")}
                >
                  <ArrowLeft className="w-5 h-5 text-gray-600" />
                </button>

                {/* Mobile back button (visible only on small screens) */}
                <button
                  className="py-1 px-2 mr-2 text-xs rounded-md bg-gray-100 hover:bg-gray-200 flex items-center lg:hidden"
                  onClick={() => navigate("/app/accountview")}
                >
                  <ArrowLeft className="w-4 h-4 mr-1 text-gray-600" />
                </button>

                <div className="flex items-center">
                  <div className="bg-blue-800 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                    {selectedContact?.data[0]?.Account_Name
                      ? selectedContact?.data[0].Account_Name.charAt(0)
                      : "-"}
                  </div>
                  <div className="overflow-hidden">
                    <h1 className="text-base sm:text-lg font-bold text-blue-800 truncate">
                      {safeRenderValue(
                        selectedContact?.data[0]?.Account_Name
                      ) || "-"}
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
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

                  <button
                    className={`relative px-4 sm:px-5 py-2.5 text-sm font-bold whitespace-nowrap rounded-t-lg transition-all duration-200 group ${
                      activeTab === "deal"
                        ? "text-blue-600 bg-gradient-to-b from-blue-50 to-white"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                    onClick={() => handleTabSwitch("deals")}
                  >
                    <div className="flex items-center gap-2">
                      {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg> */}

                      <Handshake width={18} />
                      <span>Deals</span>
                    </div>
                    {activeTab === "deals" && (
                      <>
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600"></span>
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      </>
                    )}
                    {/* Hover effect dot for inactive tabs */}
                    {activeTab !== "deals" && (
                      <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    )}
                  </button>

                  <button
                    className={`relative px-4 sm:px-5 py-2.5 text-sm font-bold whitespace-nowrap rounded-t-lg transition-all duration-200 group ${
                      activeTab === "contacts"
                        ? "text-blue-600 bg-gradient-to-b from-blue-50 to-white"
                        : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                    }`}
                    onClick={() => handleTabSwitch("contacts")}
                  >
                    <div className="flex items-center gap-2">
                      <Handshake width={18} />
                      <span>Contacts</span>
                    </div>
                    {activeTab === "contacts" && (
                      <>
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-400 to-blue-600"></span>
                        <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      </>
                    )}
                    {/* Hover effect dot for inactive tabs */}
                    {activeTab !== "contacts" && (
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
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-blue-800">
                      Account Information
                    </h2>
                    <button
                      className="text-blue-800 text-xs sm:text-sm font-bold hover:underline"
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

              {activeTab === "deals" && <CachedDealWithContact />}
              {activeTab === "contacts" && <CachedContactWithAccount />} 

            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccountDetails;

