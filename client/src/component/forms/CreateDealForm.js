import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';
import { bgColors, focus, gradient, hoverColors } from "../../config/colors";

const CACHE_NAME = "crm-cache";

// Field priority enums
const PRIORITY = Object.freeze({
  // Deal Information priorities
  OWNER: 1,
  DEAL_NAME: 2,
  ACCOUNT_NAME: 3,
  CONTACT_NAME: 4,
  AMOUNT: 5,
  CLOSING_DATE: 6,
  STAGE: 7,
  LEAD_SOURCE: 8,
  PRODUCT: 9,
  MOQ: 10,
  SAMPLE_QTY: 11,
  
  // Description Information priorities
  DESCRIPTION: 1,
  DEVELOPMENT_DATE: 2,
  SAMPLE_RECEIVED_DATE: 3,
  SAMPLE_RECEIVED_STATUS: 4,
  REASON_FOR_LOSS: 5,
  
  // Default priority
  DEFAULT: 100,
});

// Category order enum
const CATEGORY_ORDER = Object.freeze({
  DEAL: "Deal Information",
  DESCRIPTION: "Description Information",
});

export default function CreateDealForm() {
  const [fields, setFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [contactSuggestions, setContactSuggestions] = useState([]);
  const [accountSuggestions, setAccountSuggestions] = useState([]);
  const [showContactSuggestions, setShowContactSuggestions] = useState(false);
  const [showAccountSuggestions, setShowAccountSuggestions] = useState(false);
  const [searchingContacts, setSearchingContacts] = useState(false);
  const [searchingAccounts, setSearchingAccounts] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchCRMFields();
  }, []);

  async function fetchCRMFields() {
    try {
      setLoading(true);
      
      // Try to get data from cache first
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match("/deal-form-fields");
      
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
      const newResponse = new Response(JSON.stringify(fieldData), 
        { headers: { "Content-Type": "application/json" } });
      await cache.put("/deal-form-fields", newResponse);
      
      processFieldData(fieldData);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load form fields!");
    } finally {
      setLoading(false);
    }
  }
  
  function processFieldData(fieldData) {
    // Filter fields based on view_type.create
    const filteredFields = fieldData.filter((field) => field.view_type?.create !== false &&  !field.data_type.toLowerCase().includes("upload") &&
    !field.data_type.toLowerCase().includes("image"));
    
    setFields(filteredFields);
    setFormData(
      filteredFields.reduce((acc, field) => {
        acc[field.api_name] = field.data_type === "boolean" ? false : "";
        return acc;
      }, {})
    );
  }

  async function searchContacts(query) {
    if (!query || query.length < 2) {
      setContactSuggestions([]);
      setShowContactSuggestions(false);
      return;
    }
    
    try {
      setSearchingContacts(true);
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/lookup/fetchcontacts?query=${query}`
      );
      const contacts = response?.data?.data || [];
      setContactSuggestions(contacts?.data || []);
      setShowContactSuggestions(true);
    } catch (error) {
      toast.error("Failed to fetch contacts");
    } finally {
      setSearchingContacts(false);
    }
  }

  async function searchAccounts(query) {
    if (!query || query.length < 2) {
      setAccountSuggestions([]);
      setShowAccountSuggestions(false);
      return;
    }
    
    try {
      setSearchingAccounts(true);
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/lookup/fetchaccounts?query=${query}`
      );
      const accounts = response?.data?.data || [];
      setAccountSuggestions(accounts?.data || []);
      setShowAccountSuggestions(true);
    } catch (error) {
      toast.error("Failed to fetch accounts");
    } finally {
      setSearchingAccounts(false);
    }
  }

  function handleInputChange(event) {
    const { name, value, type, checked } = event.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }
  
  function handleSearchClick(fieldType) {
    if (fieldType === 'contact') {
      const contactQuery = formData['Contact_Name'];
      if (contactQuery && contactQuery.length >= 2) {
        searchContacts(contactQuery);
      } else {
        toast.error("Please enter at least 2 characters to search");
      }
    } else if (fieldType === 'account') {
      const accountQuery = formData['Account_Name'];
      if (accountQuery && accountQuery.length >= 2) {
        searchAccounts(accountQuery);
      } else {
        toast.error("Please enter at least 2 characters to search");
      }
    }
  }

  function handleContactSelect(contact) {
    setFormData(prev => ({
      ...prev,
      Contact_Name: contact.Full_Name,
      contact_id: contact.id
    }));
    setShowContactSuggestions(false);
  }

  function handleAccountSelect(account) {
    setFormData(prev => ({
      ...prev,
      Account_name: account.Account_Name,
      account_id: account.id
    }));
    setShowAccountSuggestions(false);
  }
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (showContactSuggestions || showAccountSuggestions) {
        // Close suggestions only if clicking outside the suggestion area
        if (!event.target.closest('.suggestions-container')) {
          setShowContactSuggestions(false);
          setShowAccountSuggestions(false);
        }
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showContactSuggestions, showAccountSuggestions]);

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
        }
        formattedData[field.api_name] = value;
      });
            
      // Also add the IDs for contact and account if available
      if (formData.contact_id) {
        formattedData.Contact_Name = formData.contact_id;
      }
      
      if (formData.account_id) {
        formattedData.Account_Name = formData.account_id;
      }

      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/create/createdata/Deals`,
        formattedData
      );
      if (response?.status === 200) {
        toast.success("Deal Created Successfully!");
        const cache = await caches.open(CACHE_NAME);
        await cache.delete("/deals");
        navigate("/app/dealview");
      }
    } catch (error) {
      toast.error(error?.response?.data?.error?.data[0]?.message || "Something went wrong!");
    } 
  }

  function getInputType(field) {
    switch (field.data_type) {
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
      case "date":
        return "date";
      case "text":
      default:
        return "text";
    }
  }

  // Define field priority for each category using enums
  const getFieldPriority = (fieldName) => {
    const lowerName = fieldName.toLowerCase();

    // Deal Information priorities
    if (lowerName.includes("owner")) return PRIORITY.OWNER;
    if (lowerName.includes("deal_name")) return PRIORITY.DEAL_NAME;
    if (lowerName.includes("account_name")) return PRIORITY.ACCOUNT_NAME;
    if (lowerName.includes("contact_name")) return PRIORITY.CONTACT_NAME;
    if (lowerName.includes("amount")) return PRIORITY.AMOUNT;
    if (lowerName.includes("closing_date")) return PRIORITY.CLOSING_DATE;
    if (lowerName.includes("stage")) return PRIORITY.STAGE;
    if (lowerName.includes("lead_source")) return PRIORITY.LEAD_SOURCE;
    if (lowerName.includes("product")) return PRIORITY.PRODUCT;
    if (lowerName.includes("moq")) return PRIORITY.MOQ;
    if (lowerName.includes("sample_qty")) return PRIORITY.SAMPLE_QTY;

    // Description Information priorities
    if (lowerName.includes("description")) return PRIORITY.DESCRIPTION;
    if (lowerName.includes("development_date")) return PRIORITY.DEVELOPMENT_DATE;
    if (lowerName.includes("sample_received_date")) return PRIORITY.SAMPLE_RECEIVED_DATE;
    if (lowerName.includes("sample_received_status")) return PRIORITY.SAMPLE_RECEIVED_STATUS;
    if (lowerName.includes("reason_for_loss")) return PRIORITY.REASON_FOR_LOSS;

    // Default priority
    return PRIORITY.DEFAULT;
  };

  // Custom field renderer for contact and account name lookups with search button
  function renderLookupField(field) {
    const fieldName = field.display_label || field.api_name.replace(/_/g, " ");
    const isRequired = field.required === true;
    const isContactField = field.api_name.toLowerCase().includes('contact_name');
    const isAccountField = field.api_name.toLowerCase().includes('account_name');
    
    if (isContactField || isAccountField) {
      const suggestions = isContactField ? contactSuggestions : accountSuggestions;
      const showSuggestions = isContactField ? showContactSuggestions : showAccountSuggestions;
      const isSearching = isContactField ? searchingContacts : searchingAccounts;
      const handleSelect = isContactField ? handleContactSelect : handleAccountSelect;
      const fieldType = isContactField ? 'contact' : 'account';
      
      return (
        <div key={field.api_name} className="mb-3 relative suggestions-container">
          <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
            {fieldName}
            {isRequired && <span className="text-red-500 ml-1">*</span>}
          </label>
          <div className="flex">
            <input
              type="text"
              name={field.api_name}
              value={formData[field.api_name] || ""}
              onChange={handleInputChange}
              required={isRequired}
              placeholder={`Enter ${fieldName}...`}
              className={`w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-2 ${focus.border} ${focus.ring}`}
            />
            <button
              type="button"
              onClick={() => handleSearchClick(fieldType)}
              className={`px-3 py-2 ${bgColors.primary} text-white rounded-r-md ${hoverColors.primary} focus:outline-none focus:ring-2 ${focus.ring}`}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
            </button>
          </div>
          
        {/* Suggestions dropdown */}

        {showSuggestions && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
            {isSearching ? (
              <div className="text-center py-2 text-gray-500">Loading...</div>
            ) : suggestions.length > 0 ? (
              suggestions.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="cursor-pointer hover:bg-gray-100 px-4 py-2"
                >
                  {isContactField ? (
                    // Display for contacts
                    <>
                      <div className="font-medium">{item.Full_Name}</div>
                      {item.Email && <div className="text-xs text-gray-500">{item.Email}</div>}
                    </>
                  ) : (
                    // Display for accounts
                    <div className="font-medium">{item.Account_Name}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-2 text-gray-500">No results found</div>
            )}
          </div>
        )}
          
          {/* Show selected ID information if available */}
          {isContactField && formData.contact_id && (
            <div className="text-xs text-gray-500 mt-1">
              Selected Contact ID: {formData.contact_id}
            </div>
          )}
          {isAccountField && formData.account_id && (
            <div className="text-xs text-gray-500 mt-1">
              Selected Account ID: {formData.account_id}
            </div>
          )}
        </div>
      );
    }
    
    return null;
  }

  // Group fields into sections for better organization with proper ordering
  function renderFormFields() {
    const categoryOrder = [
      CATEGORY_ORDER.DEAL,
      CATEGORY_ORDER.DESCRIPTION,
    ];

    const groupedFields = {};

    // Group fields by category
    fields.forEach((field) => {
      let category = CATEGORY_ORDER.DEAL;
      
      // Description section fields
      if (
        field.api_name.toLowerCase().includes("description") ||
        field.api_name.toLowerCase().includes("development_date") ||
        field.api_name.toLowerCase().includes("sample_received") ||
        field.api_name.toLowerCase().includes("reason_for_loss")
      ) {
        category = CATEGORY_ORDER.DESCRIPTION;
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
            {groupedFields[category].map((field) => {
              // Check if this is a contact or account field for special handling
              const isContactField = field.api_name.toLowerCase().includes('contact_name');
              const isAccountField = field.api_name.toLowerCase().includes('account_name');
              
              if (isContactField || isAccountField) {
                return renderLookupField(field);
              } else {
                return renderField(field);
              }
            })}
          </div>
        </div>
      );
    });
  }

  function renderField(field) {
    const fieldName = field.display_label || field.api_name.replace(/_/g, " ");
    const isRequired = field.required === true;

    // Special handling for description field to make it full width
    const isDescriptionField = field.api_name.toLowerCase().includes("description");
    const fieldColSpan = isDescriptionField ? "col-span-1 md:col-span-2" : "";

    return (
      <div key={field.api_name} className={`mb-3 ${fieldColSpan}`}>
        <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
          {fieldName}
          {isRequired && <span className="text-red-500 ml-1">*</span>}
        </label>

        {field.data_type === "picklist" && field.pick_list_values?.length > 0 ? (
          <select
            name={field.api_name}
            value={formData[field.api_name] || ""}
            onChange={handleInputChange}
            required={isRequired}
            className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500` }
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
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label htmlFor={field.api_name} className="ml-2 block text-sm text-gray-700">
              Yes
            </label>
          </div>
        ) : field.data_type === "textarea" || isDescriptionField ? (
          <textarea
            name={field.api_name}
            value={formData[field.api_name] || ""}
            onChange={handleInputChange}
            required={isRequired}
            rows={4}
            placeholder={`Enter ${fieldName}`}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 ${focus.ring} ${focus.border}`}
          />
        ) : field.data_type === "fileupload" || field.api_name.toLowerCase().includes("image_upload") ? (
          <input
            type="file"
            name={field.api_name}
            onChange={handleInputChange}
            required={isRequired}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 ${focus.ring} ${focus.border}`}
          />
        ) : (
          <input
            type={getInputType(field)}
            name={field.api_name}
            value={formData[field.api_name] || ""}
            onChange={handleInputChange}
            required={isRequired}
            placeholder={`Enter ${fieldName}`}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 ${focus.ring} ${focus.border}`}
          />
        )}
      </div>
    );
  }

  // Custom loader component
  const LoadingSpinner = () => (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-indigo-50 to-blue-50">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-800 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-b-indigo-800 rounded-full animate-ping opacity-50"></div>
      </div>
      <p className={`${focus.text} mt-4 text-lg font-medium`}>Loading Deal Form...</p>
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
              <div className={`bg-gradient-to-r ${gradient.formGradient} px-6 py-4`}>
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
                  Create New Deal
                </h2>
                <p className="text-indigo-100 mt-1">
                  Enter the deal details below to add to your CRM
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
                      onClick={() => navigate("/app/dealview")}
                      className={`px-5 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 ${focus.ring}`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className={`px-5 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${bgColors.primary} ${hoverColors.primary} focus:outline-none focus:ring-2 focus:ring-offset-2 ${focus.ring} flex items-center`}
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
                      Create Deal
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
