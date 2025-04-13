import React, { useState } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const CreateContactForm = ({ isOpen, onClose, onContactCreated }) => {
  const [newContact, setNewContact] = useState({
      First_Name: "",
      Last_Name: "",
      Email: "",
      Phone: "",
      Lead_Source: "External Referral"
    });

  const handleCreateContact = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/create/createdata/Contacts`,
        newContact
      );
      if (response?.status === 200) {
        toast.success("Contact Created Successfully!");
        onContactCreated?.(); // Callback to refresh task list
        handleClose();
      }
    } catch (error) {
      console.error("Error creating:", error);
      toast.error(error?.response?.data?.message || "Something went wrong");
    }
  };

  const handleClose = () => {
    setNewContact({
        First_Name: "",
        Last_Name: "",
        Email: "",
        Phone: "",
        Lead_Source: "External Referral",
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-bold">Create New Contact</h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
         <form onSubmit={handleCreateContact} className="p-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                          <input
                            type="text"
                            value={newContact.First_Name}
                            onChange={(e) => setNewContact({...newContact, First_Name: e.target.value})}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                          <input
                            type="text"
                            value={newContact.Last_Name}
                            onChange={(e) => setNewContact({...newContact, Last_Name: e.target.value})}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={newContact.Email}
                            onChange={(e) => setNewContact({...newContact, Email: e.target.value})}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={newContact.Phone}
                            onChange={(e) => setNewContact({...newContact, Phone: e.target.value})}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
                          <select
                            value={newContact.Lead_Source}
                            onChange={(e) => setNewContact({...newContact, Lead_Source: e.target.value})}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="External Referral">External Referral</option>
                            <option value="Internal Referral">Internal Referral</option>
                            <option value="Web Download">Web Download</option>
                            <option value="Trade Show">Trade Show</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        {/* <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={newContact.Description}
                            onChange={(e) => setNewContact({...newContact, Description: e.target.value})}
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                            placeholder="Enter contact description..."
                          />
                        </div> */}
                      </div>
                      <div className="mt-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                          Create Contact
                        </button>
                      </div>
            </form>
      </div>
    </div>
  );
};

export default CreateContactForm;