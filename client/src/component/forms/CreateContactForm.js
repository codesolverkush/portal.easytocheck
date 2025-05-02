import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Navbar from "../common/Navbar";

const CACHE_NAME = "crm-cache";

// Field priority enums
const PRIORITY = Object.freeze({
  // General Information priorities
  OWNER: 1,
  COMPANY: 2,
  SALUTATION: 3,
  FIRST_NAME: 4,
  LAST_NAME: 5,
  TITLE: 6,
  LEAD_STATUS: 7,
  LEAD_SOURCE: 8,
  EMAIL: 9,
  PHONE: 10,
  MOBILE: 11,

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

export default function CreateContactFrom() {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);


  const navigate = useNavigate();

  useEffect(() => {
    fetchCRMFields();
  }, []);

  async function fetchCRMFields() {
    try {
      setLoading(true);

      // Try to get data from cache first
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match("/contact-form-fields");

      if (cachedResponse) {
        const data = await cachedResponse.json();
        processFieldData(data);
        return;
      }

      // If no cached data, fetch from API
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}//gets/getfields/Contacts`
      );
      const fieldData = response?.data?.data?.fields || [];


      // Store the fetched data in Cache Storage
      const newResponse = new Response(JSON.stringify(fieldData), {
        headers: { "Content-Type": "application/json" },
      }); //need to check
      await cache.put("/contact-form-fields", newResponse);

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
    let filteredFields = fieldData.filter(
      (field) =>
        field.view_type?.create !== false &&
        field.data_type !== "lookup" &&
        field.data_type !== "ownerlookup" &&
        field.data_type !== "multiuserlookup" &&
        !field.data_type.toLowerCase().includes("upload") &&
        !field.data_type.toLowerCase().includes("image") &&
        !field.api_name.toLowerCase().includes("unsubscribed_mode") &&
        !field.api_name.toLowerCase().includes("unsubscribed_time")
    );

    // const filteredFields = filteredFields.filter(
    //   (field) => {
    //     const type = field.data_type.toLowerCase();
    //     const api_name = field.api_name.toLowerCase();
    //     return  !type.includes("upload") && !type.includes("image") && !api_name.includes("unsubscribed_mode") && !api_name.includes("unsubscribed_time");
    //   }
    // );

    setFields(filteredFields);
    setFormData(
      filteredFields.reduce((acc, field) => {
        acc[field.api_name] = field.data_type === "boolean" ? false : "";
        return acc;
      }, {})
    );
  }

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    try {
      const formattedData = {};
      fields.forEach((field) => {
        let value = formData[field.api_name];

        if (field.data_type === "double" || field.data_type === "float") {
          value = parseFloat(value) || 0;
        } else if (field.data_type === "integer") {
          value = parseInt(value) || 0;
        } else if (field.data_type === "boolean") {
          value = Boolean(value);
        } else if (field.data_type === "datetime" && value) {
          // Format datetime fields to match the expected format: "2025-04-21T16:11:24+05:30"
          const date = new Date(value);

          // Get timezone offset in hours and minutes
          const tzOffsetMinutes = date.getTimezoneOffset();
          const tzOffsetHours = Math.abs(Math.floor(tzOffsetMinutes / 60))
            .toString()
            .padStart(2, "0");
          const tzOffsetMins = Math.abs(tzOffsetMinutes % 60)
            .toString()
            .padStart(2, "0");
          const tzSign = tzOffsetMinutes <= 0 ? "+" : "-"; // Note: getTimezoneOffset() returns inverse of what we need

          // Format date in YYYY-MM-DDThh:mm:ss format
          const year = date.getFullYear();
          const month = (date.getMonth() + 1).toString().padStart(2, "0");
          const day = date.getDate().toString().padStart(2, "0");
          const hours = date.getHours().toString().padStart(2, "0");
          const minutes = date.getMinutes().toString().padStart(2, "0");
          const seconds = date.getSeconds().toString().padStart(2, "0");

          // Combine into final format
          value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${tzSign}${tzOffsetHours}:${tzOffsetMins}`;
        }

        formattedData[field.api_name] = value;
      });

      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/create/createdata/Contacts`,
        formattedData
      );
      if (response?.status === 200) {
        toast.success("Contact Created Successfully!");
        const cache = await caches.open(CACHE_NAME);
        await cache.delete("/contact");
        navigate("/app/contactview");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message ||
      error?.response?.data?.error?.message ||
       ( error?.response?.data?.error?.data[0]?.details?.api_name +
          " " +
          error?.response?.data?.error?.data[0]?.message) ||
          "Something went wrong!"
      );
    }
  }
  function getInputType(field) {
    const type = field.data_type?.toLowerCase();

    switch (type) {
      case "email":
        return "email";
      case "double":
      case "float":
      case "currency":
        return "number";
      case "integer":
        return "number";
      case "boolean":
        return "checkbox";
      case "datetime":
        return "datetime-local";
      case "date":
        return "date";
      case "fileupload":
        return "file";
      case "text":
      default:
        return "text";
    }
  }

  // Define field priority for each category using enums
  const getFieldPriority = (fieldName) => {
    const lowerName = fieldName.toLowerCase();

    // General contact information priorities
    if (lowerName.includes("salu")) return PRIORITY.SALUTATION;
    if (lowerName.includes("first_name")) return PRIORITY.FIRST_NAME;
    if (lowerName.includes("last_name")) return PRIORITY.LAST_NAME;
    if (lowerName.includes("title")) return PRIORITY.TITLE;
    if (lowerName.includes("lead_status")) return PRIORITY.LEAD_STATUS;
    if (lowerName.includes("lead_source")) return PRIORITY.LEAD_SOURCE;
    if (lowerName.includes("email")) return PRIORITY.EMAIL;
    if (lowerName.includes("phone")) return PRIORITY.PHONE;
    if (lowerName.includes("mobile")) return PRIORITY.MOBILE;
    if (lowerName.includes("company")) return PRIORITY.COMPANY;
    if (lowerName.includes("owner")) return PRIORITY.OWNER;

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

  // Group fields into sections for better organization with proper ordering
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
        field.api_name.toLowerCase().includes("salu") ||
        field.api_name.toLowerCase().includes("last_name") ||
        field.api_name.toLowerCase().includes("first_name") ||
        field.api_name.toLowerCase().includes("lead_source") ||
        field.api_name.toLowerCase().includes("lead_status") ||
        field.api_name.toLowerCase().includes("email") ||
        field.api_name.toLowerCase().includes("phone") ||
        field.api_name.toLowerCase().includes("mobile") ||
        field.api_name.toLowerCase().includes("contact") ||
        field.api_name.toLowerCase().includes("company") ||
        field.api_name.toLowerCase().includes("title")
      ) {
        category = CATEGORY_ORDER.GENERAL;
      } else if (
        field.api_name.toLowerCase().includes("organization") ||
        field.api_name.toLowerCase().includes("business")
      ) {
        category = CATEGORY_ORDER.COMPANY;
      } else if (
        field.api_name.toLowerCase().includes("address") ||
        field.api_name.toLowerCase().includes("street") ||
        field.api_name.toLowerCase().includes("city") ||
        field.api_name.toLowerCase().includes("state") ||
        field.api_name.toLowerCase().includes("country") ||
        field.api_name.toLowerCase().includes("zip")
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
          <h3 className="text-lg font-medium text-gray-800 border-b border-gray-200 pb-2 mb-4">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {groupedFields[category].map((field) => renderField(field))}
          </div>
        </div>
      );
    });
  }

  function renderField(field) {
    const fieldName = field.display_label || field.api_name.replace(/_/g, " ");
    const isRequired = field.required === true;

    return (
      <div key={field.api_name} className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
          {fieldName}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>

        {field.data_type === "picklist" &&
        field.pick_list_values?.length > 0 ? (
          <select
            name={field.api_name}
            value={formData[field.api_name] || ""}
            onChange={handleChange}
            required={isRequired}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select {fieldName}</option>
            {field.pick_list_values.map((option) => (
              <option key={option.id} value={option.actual_value}>
                {option.display_value}
              </option>
            ))}
          </select>
        ) : field.data_type === "boolean" ? (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={field.api_name}
              name={field.api_name}
              checked={formData[field.api_name] || false}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor={field.api_name}
              className="ml-2 block text-sm text-gray-700"
            >
              Yes
            </label>
          </div>
        ) : (
          <input
            type={getInputType(field)}
            name={field.api_name}
            value={formData[field.api_name] || ""}
            onChange={handleChange}
            required={isRequired}
            placeholder={`Enter ${fieldName}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        )}
      </div>
    );
  }

  // Custom loader component
  const LoadingSpinner = () => (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-indigo-50 to-blue-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-b-indigo-600 rounded-full animate-ping opacity-50"></div>
      </div>
      <p className="text-indigo-800 mt-4 text-lg font-medium">
        Loading Contact Form...
      </p>
    </div>
  );

  return (
    <>
      <Navbar />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-gray-50 min-h-screen pt-16 pb-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4">
                <h2 className="text-2xl font-bold text-white flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Create New Contact
                </h2>
                <p className="text-indigo-100 mt-1">
                  Enter the contact details below to add to your CRM
                </p>
              </div>

              {/* Form */}
              <div className="px-6 py-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  {renderFormFields()}

                  {/* Form Actions */}
                  <div className="flex justify-end space-x-4 mt-8 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={() => navigate("/app/contactview")}
                      className="px-5 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Create Contact
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



// import React, { useState } from 'react';
// import { X } from 'lucide-react';
// import axios from 'axios';
// import toast from 'react-hot-toast';

// const CreateContactForm = ({ isOpen, onClose, onContactCreated }) => {
//   const [newContact, setNewContact] = useState({
//       First_Name: "",
//       Last_Name: "",
//       Email: "",
//       Phone: "",
//       Lead_Source: "External Referral"
//     });

//   const handleCreateContact = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_APP_API}/create/createdata/Contacts`,
//         newContact
//       );
//       if (response?.status === 200) {
//         toast.success("Contact Created Successfully!");
//         onContactCreated?.(); // Callback to refresh task list
//         handleClose();
//       }
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Something went wrong");
//     }
//   };

//   const handleClose = () => {
//     setNewContact({
//         First_Name: "",
//         Last_Name: "",
//         Email: "",
//         Phone: "",
//         Lead_Source: "External Referral",
//     });
//     onClose();
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//       <div className="bg-white rounded-lg w-full max-w-md">
//         <div className="flex justify-between items-center p-4 border-b">
//           <h2 className="text-lg font-bold">Create New Contact</h2>
//           <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
//             <X size={20} />
//           </button>
//         </div>
//          <form onSubmit={handleCreateContact} className="p-4">
//                       <div className="space-y-4">
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
//                           <input
//                             type="text"
//                             value={newContact.First_Name}
//                             onChange={(e) => setNewContact({...newContact, First_Name: e.target.value})}
//                             className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
//                           <input
//                             type="text"
//                             value={newContact.Last_Name}
//                             onChange={(e) => setNewContact({...newContact, Last_Name: e.target.value})}
//                             className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                           <input
//                             type="email"
//                             value={newContact.Email}
//                             onChange={(e) => setNewContact({...newContact, Email: e.target.value})}
//                             className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//                           <input
//                             type="tel"
//                             value={newContact.Phone}
//                             onChange={(e) => setNewContact({...newContact, Phone: e.target.value})}
//                             className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                             required
//                           />
//                         </div>
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
//                           <select
//                             value={newContact.Lead_Source}
//                             onChange={(e) => setNewContact({...newContact, Lead_Source: e.target.value})}
//                             className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                           >
//                             <option value="External Referral">External Referral</option>
//                             <option value="Internal Referral">Internal Referral</option>
//                             <option value="Web Download">Web Download</option>
//                             <option value="Trade Show">Trade Show</option>
//                             <option value="Other">Other</option>
//                           </select>
//                         </div>
//                         {/* <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                           <textarea
//                             value={newContact.Description}
//                             onChange={(e) => setNewContact({...newContact, Description: e.target.value})}
//                             className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
//                             placeholder="Enter contact description..."
//                           />
//                         </div> */}
//                       </div>
//                       <div className="mt-6 flex justify-end space-x-3">
//                         <button
//                           type="button"
//                           onClick={handleClose}
//                           className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           type="submit"
//                           className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                         >
//                           Create Contact
//                         </button>
//                       </div>
//             </form>
//       </div>
//     </div>
//   );
// };

// export default CreateContactForm;