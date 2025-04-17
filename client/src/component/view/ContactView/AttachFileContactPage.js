import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const  AttachFileContactPage = ({contactId}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleFileChange(event) {
    setSelectedFile(event.target.files[0]);
  }

  async function handleFileUpload(event) {
    event.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload!");
      return;
    }

    setLoading(true);
    try {
      const fileData = new FormData();
      fileData.append("file", selectedFile);

      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/related/attach/Contacts/${contactId}`,
         fileData,
        {
          withCredentials: true, // Ensures cookies (e.g., auth tokens) are sent
        }
      );
      
      if (response?.data?.success) {
        toast.success("File Attached Successfully!");
      } else {
        toast.error(response?.data?.message || "File Upload Failed!");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center">Attach a File</h2>
        <form onSubmit={handleFileUpload} className="space-y-4">
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              Select File
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Uploading..." : "Upload File"}
          </button>
        </form>
      </div>
    </div>
  );
}


export default AttachFileContactPage;