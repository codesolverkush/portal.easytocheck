import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from 'react-router-dom';
import Navbar from '../common/Navbar';

const CACHE_NAME = "crm-cache";

export default function CreateLeadForm() {
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
      const cachedResponse = await cache.match("/lead-form-fields");
      
      if (cachedResponse) {
        const data = await cachedResponse.json();
        processFieldData(data);
        return;
      }
      
      // If no cached data, fetch from API
      const response = await axios.get(
        `${process.env.REACT_APP_APP_API}/lead/getlead`
      );
      const fieldData = response?.data?.data?.fields || [];
      
      // Store the fetched data in Cache Storage
      const newResponse = new Response(JSON.stringify(fieldData), 
        { headers: { "Content-Type": "application/json" } }); //need to check 
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
    const filteredFields = fieldData.filter((field) => field.view_type?.create !== false);
    
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
        }
        formattedData[field.api_name] = value;
      });

      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/create/createdata/Leads`,
        formattedData
      );
      if (response?.status === 200) {
        toast.success("Lead Created Successfully!");
        
        // Clear leads cache to ensure fresh data is fetched next time
        try {
          const cache = await caches.open(CACHE_NAME);
          await cache.delete("/leads");
        } catch (cacheError) {
          console.error("Error clearing leads cache", cacheError);
        }
      }
    } catch (error) {
      console.error("Error creating lead:", error);
      toast.error(error?.response?.data?.message || "Something went wrong!");
    } finally {
      navigate("/app/leadview");
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
      case "text":
      default:
        return "text";
    }
  }

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="w-full max-w-lg p-6 bg-white shadow-lg rounded-lg">
          <h2 className="text-2xl font-bold mb-4 text-center">Create a New Lead</h2>

          {/* Show loading indicator while fetching fields */}
          {loading ? (
            <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-r from-indigo-50 to-blue-50">
              <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-indigo-800 mt-4 text-lg font-medium">Loading Lead Form...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field) => (
                <div key={field.api_name}>
                  <label className="block text-gray-700 text-sm font-semibold mb-1">
                    {field.display_label || field.api_name.replace(/_/g, " ")}
                  </label>
                  {field.data_type === "picklist" && field.pick_list_values.length > 0 ? (
                    <select
                      name={field.api_name}
                      value={formData[field.api_name] || ""}
                      onChange={handleChange}
                      className="w-1/2 p-2 border border-gray-300 rounded-lg min-h-[1rem]"
                    >
                      <option value="">Select an option</option>
                      {field.pick_list_values.map((option) => (
                        <option key={option.id} value={option.actual_value}>
                          {option.display_value}
                        </option>
                      ))}
                    </select>
                  ) : field.data_type === "boolean" ? (
                    <input
                      type="checkbox"
                      name={field.api_name}
                      checked={formData[field.api_name] || false}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                  ) : (
                    <input
                      type={getInputType(field)}
                      name={field.api_name}
                      value={formData[field.api_name] || ""}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  )}
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={loading}
              >
                Submit
              </button>
            </form>
          )}
        </div>
      </div>
    </>
  );
}