// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ShowAttachment = ({ leadId, onClose, cachedData, setCachedData, dataLoaded }) => {
//   const [attachments, setAttachments] = useState(cachedData || []);
//   const [loading, setLoading] = useState(!dataLoaded);
//   const [error, setError] = useState(null);

//   const getAttachments = async () => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/getattach/${leadId}`);
      
//       if (response.data.success && response.data.data.data) {
//         setAttachments(response.data.data.data);
//         // Update the parent component's cached data
//         if (setCachedData) {
//           setCachedData(response.data.data.data);
//         }
//       } else {
//         setAttachments([]);
//         if (setCachedData) {
//           setCachedData([]);
//         }
//       }
//       setLoading(false);
//     } catch (err) {
//       console.error('Error fetching attachments:', err);
//       setError('Failed to fetch attachments. Please try again.');
//       setLoading(false);
//     }
//   };


//   useEffect(() => {
//     // Only fetch if not already loaded or explicitly refreshing
//     if (!dataLoaded && !cachedData.length) {
//       getAttachments();
//     } else {
//       // Make sure we're using the cached data
//       setAttachments(cachedData);
//       setLoading(false);
//     }
//     // We run this effect only once or when leadId changes
//   }, [leadId, dataLoaded]);

// // Fetch attachments when component mounts, but only if data isn't already loaded
// //   useEffect(() => {
// //     if (!dataLoaded ||  !cachedData.length) {
// //       getAttachments();
// //     } else {
// //       // Make sure we're using the cached data
// //       setAttachments(cachedData);
// //       setLoading(false);
// //     }
// //   }, [leadId, dataLoaded, cachedData]);

//   const handleDownload = async (attachmentId, fileName) => {
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/downloadattach/${leadId}/${attachmentId}`, {
//         responseType: 'blob'
//       });
      
//       // Create a download link and trigger the download
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', fileName);
//       document.body.appendChild(link);
//       link.click();
      
//       // Clean up
//       link.parentNode.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error('Error downloading attachment:', err);
//       setError('Failed to download the attachment. Please try again.');
//     }
//   };

//   // Make the refresh button also update the cached data
//   const handleRefresh = () => {
//     getAttachments();
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-lg font-medium text-gray-800">Lead Attachments</h3>
//         {onClose && (
//           <button
//             className="text-gray-500 hover:text-gray-700"
//             onClick={onClose}
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
//             </svg>
//           </button>
//         )}
//       </div>

//       {loading ? (
//         <div className="flex justify-center items-center py-8">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//         </div>
//       ) : error ? (
//         <div className="text-center py-6 text-red-500">{error}</div>
//       ) : attachments.length === 0 ? (
//         <div className="text-center py-6 text-gray-500">
//           No attachments found for this lead.
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//           {attachments.map((attachment) => (
//             <div
//               key={attachment.id}
//               className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
//             >
//               <div className="p-4">
//                 <div className="flex items-center mb-2">
//                   <div className="w-10 h-10 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
//                     <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
//                     </svg>
//                   </div>
//                   <div className="truncate flex-1">
//                     <p className="text-sm font-medium text-gray-800 truncate" title={attachment.File_Name}>
//                       {attachment.File_Name}
//                     </p>
//                     <p className="text-xs text-gray-500">
//                       {new Date(attachment.Created_Time).toLocaleString('en-US', {
//                         month: 'short',
//                         day: 'numeric',
//                         year: 'numeric'
//                       })}
//                     </p>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
//                 <button
//                   className="w-full flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 font-medium"
//                   onClick={() => handleDownload(attachment.id, attachment.File_Name)}
//                 >
//                   <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
//                   </svg>
//                   Download
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       <div className="flex justify-center mt-4">
//         <button
//           className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
//           onClick={handleRefresh}
//         >
//           Show Attachments
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ShowAttachment;




// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// const ShowAttachment = ({ leadId, onClose, cachedData, setCachedData }) => {
//   const [attachments, setAttachments] = useState(cachedData || []);
//   const [loading, setLoading] = useState(!cachedData?.length);
//   const [error, setError] = useState(null);

//   const getAttachments = async () => {
//     if (cachedData?.length) return; // Avoid fetching if cached data exists
    
//     setLoading(true);
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/getattach/${leadId}`);
//       if (response.data.success && response.data.data.data) {
//         const fetchedAttachments = response.data.data.data;
//         setAttachments(fetchedAttachments);
//         setCachedData?.(fetchedAttachments); // Update cache if function exists
//       } else {
//         setAttachments([]);
//         setCachedData?.([]);
//       }
//     } catch (err) {
//       console.error('Error fetching attachments:', err);
//       setError('Failed to fetch attachments. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getAttachments(); // Fetch only once when component mounts or leadId changes
//   }, [leadId]);

//   const handleDownload = async (attachmentId, fileName) => {
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/downloadattach/${leadId}/${attachmentId}`, {
//         responseType: 'blob'
//       });
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', fileName);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (err) {
//       console.error('Error downloading attachment:', err);
//       setError('Failed to download the attachment. Please try again.');
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <div className="flex justify-between items-center mb-4">
//         <h3 className="text-lg font-medium text-gray-800"></h3>
//         {onClose && (
//           <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         )}
//       </div>

//       {loading ? (
//         <div className="flex justify-center items-center py-8">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
//         </div>
//       ) : error ? (
//         <div className="text-center py-6 text-red-500">{error}</div>
//       ) : attachments.length === 0 ? (
//         <div className="text-center py-6 text-gray-500">No attachments found for this lead.</div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//           {attachments.map((attachment) => (
//             <div key={attachment.id} className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
//               <div className="p-4">
//                 <div className="flex items-center mb-2">
//                   <div className="w-10 h-10 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
//                     <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                   </div>
//                   <div className="truncate flex-1">
//                     <p className="text-sm font-medium text-gray-800 truncate" title={attachment.File_Name}>{attachment.File_Name}</p>
//                     <p className="text-xs text-gray-500">
//                       {new Date(attachment.Created_Time).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
//                     </p>
//                   </div>
//                 </div>
//               </div>
              
//               <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
//                 <button className="w-full flex items-center justify-center text-sm text-blue-600 hover:text-blue-800 font-medium" onClick={() => handleDownload(attachment.id, attachment.File_Name)}>
//                   <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
//                   </svg>
//                   Download
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ShowAttachment;


import React, { useState, useEffect } from 'react';
import { FileText, Filter, Plus, X, Download, MoreHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import EnhancedTaskLoading from '../ui/EnhancedTaskLoading';

const AttachmentCard = ({ attachment }) => {
  const handleDownload = async (attachmentId, fileName) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/downloadattach/Leads/${attachment.leadId}/${attachmentId}`, {
        responseType: 'blob',
        withCredentials: true // Ensure credentials are sent with request
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading attachment:', err);
      toast.error('Failed to download the attachment. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Invalid date format:', dateString);
      return 'Invalid date';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div className="flex items-start space-x-3">
          <div className="bg-blue-100 rounded-full p-2">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{attachment.File_Name}</h3>
            <div className="flex items-center mt-2 space-x-4">
              <div className="flex items-center text-xs text-gray-600">
                <span>Uploaded: {formatDate(attachment.Created_Time)}</span>
              </div>
              {attachment.Size && (
                <div className="text-xs text-gray-600">
                  Size: {formatFileSize(attachment.Size)}
                </div>
              )}
            </div>
            {attachment.Created_By && (
              <div className="mt-2 text-xs text-gray-600">
                Created by: {attachment.Created_By}
              </div>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
            onClick={() => handleDownload(attachment.id, attachment.File_Name)}
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </button>
          <button className="text-gray-400 hover:text-gray-600">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const formatFileSize = (bytes) => {
  if (!bytes) return 'Unknown';
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Byte';
  const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
};

const ShowAttachment = ({ leadId, cachedData, setCachedData, dataLoaded }) => {
  const [attachments, setAttachments] = useState(cachedData || []);
  const [isLoading, setIsLoading] = useState(!dataLoaded);
  const [filter, setFilter] = useState('all');
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchAttachments = async () => {
      if (cachedData?.length > 0) {
        // Use cached data if available, but enhance with leadId
        const enhancedCache = cachedData.map(attachment => ({
          ...attachment,
          leadId: leadId
        }));
        setAttachments(enhancedCache);
        return;
      }
  
      setIsLoading(true);
      setError(null);
  
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_APP_API}/related/getattach/Leads/${leadId}`,
          { withCredentials: true }
        );
      
  
        // If response data is empty, return immediately
        if (response?.data?.success && response?.data?.data === "") {
          return;
        }
  
        if (response?.data?.success && Array.isArray(response?.data?.data?.data)) {
          const fetchedAttachments = response.data.data.data;
  
          // Add leadId to each attachment for download functionality
          const attachmentsWithLeadId = fetchedAttachments.map(attachment => ({
            ...attachment,
            leadId: leadId
          })); 
  
          setAttachments(attachmentsWithLeadId);
          if (setCachedData) setCachedData(attachmentsWithLeadId);
        } else {
          setAttachments([]);
          if (setCachedData) setCachedData([]);
        }
      } catch (error) {
        console.error("Error fetching attachments:", error);
        setError("Failed to fetch attachments. Please try again.");
        setAttachments([]);
        if (setCachedData) setCachedData([]);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchAttachments();
  }, [leadId, setCachedData, cachedData]);
  

  // useEffect(() => {
  //   const fetchAttachments = async () => {

  //     if (cachedData?.length > 0) {
  //       // Use cached data if available, but enhance with leadId
  //       const enhancedCache = cachedData.map(attachment => ({
  //         ...attachment,
  //         leadId: leadId
  //       }));
  //       setAttachments(enhancedCache);
  //       return;
  //     }
  
  //     setIsLoading(true);
  //     setError(null);
      
  //     try {
  //       const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/getattach/${leadId}`, {
  //         withCredentials: true // Ensure credentials are sent
  //       });
  //       console.log(response);
        
  //       if (response?.data?.success && response?.data?.data?.data) {
  //         const fetchedAttachments = response.data.data.data;
          
  //         // Add leadId to each attachment for download functionality
  //         const attachmentsWithLeadId = fetchedAttachments.map(attachment => ({
  //           ...attachment,
  //           leadId: leadId
  //         }));
          
  //         setAttachments(attachmentsWithLeadId);
  //         if (setCachedData) setCachedData(attachmentsWithLeadId);
  //       } else {
  //         setAttachments([]);
  //         if (setCachedData) setCachedData([]);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching attachments:', error);
  //       setError('Failed to fetch attachments. Please try again.');
  //       setAttachments([]);
  //       if (setCachedData) setCachedData([]);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  
  //   fetchAttachments();
  // }, [leadId, setCachedData, cachedData]);
  
  const filteredAttachments = attachments.filter(attachment => {
    if (filter === 'all') return true;
    if (filter === 'pdf') return attachment.File_Name.toLowerCase().endsWith('.pdf');
    if (filter === 'doc') return attachment.File_Name.toLowerCase().endsWith('.doc') || attachment.File_Name.toLowerCase().endsWith('.docx');
    if (filter === 'image') {
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
      return imageExtensions.some(ext => attachment.File_Name.toLowerCase().endsWith(ext));
    }
    if (filter === 'other') {
      const commonExtensions = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.bmp'];
      return !commonExtensions.some(ext => attachment.File_Name.toLowerCase().endsWith(ext));
    }
    return true;
  });

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      toast.error("Please select a file to upload!");
      return;
    }

    setUploadLoading(true);
    try {
      const fileData = new FormData();
      fileData.append("file", selectedFile);

      // Use the correct endpoint from AttachFilePage
      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/related/attach/Leads/${leadId}`,
        fileData,
        {
          withCredentials: true
        }
      );

      if (response?.data?.success) {
        toast.success("File Attached Successfully!");
        
        // Add the new file to the attachments list
        const newAttachment = {
          id: response?.data?.data?.id || Date.now(), // Use response ID or fallback
          File_Name: selectedFile.name,
          Created_Time: new Date().toISOString(),
          Size: selectedFile.size,
          leadId: leadId
        };
        
        const updatedAttachments = [...attachments, newAttachment];
        setAttachments(updatedAttachments);
        if (setCachedData) setCachedData(updatedAttachments);
        
        // Reset and close modal
        setSelectedFile(null);
        setIsUploadModalOpen(false);
      } else {
        toast.error(response?.data?.message || "File Upload Failed!");
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file!");
    } finally {
      setUploadLoading(false);
    }
  };

  // Toggle filter menu
  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  // Apply filter and close menu
  const applyFilter = (filterValue) => {
    setFilter(filterValue);
    setShowFilterMenu(false);
  };

  // Refresh attachments list
  const refreshAttachments = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/related/getattach/Leads/${leadId}`, {
        withCredentials: true
      });
      
      if (response?.data?.success && response?.data?.data?.data) {
        const fetchedAttachments = response.data.data.data.map(attachment => ({
          ...attachment,
          leadId: leadId
        }));
        
        setAttachments(fetchedAttachments);
        if (setCachedData) setCachedData(fetchedAttachments);
      } else {
        setAttachments([]);
        if (setCachedData) setCachedData([]);
      }
    } catch (error) {
      console.error('Error refreshing attachments:', error);
      setError('Failed to refresh attachments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-base sm:text-lg font-medium text-gray-800">
            Attachments ({filteredAttachments.length})
          </h2>
          <div className="flex space-x-3">
            <div className="relative">
              <button 
                className="flex items-center px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                onClick={toggleFilterMenu}
              >
                <Filter className="w-4 h-4 mr-2" />
                <span>
                  {filter === 'all' ? 'All Files' : 
                   filter === 'pdf' ? 'PDF Files' : 
                   filter === 'doc' ? 'Documents' : 
                   filter === 'image' ? 'Images' : 
                   filter === 'other' ? 'Other Files' : 'Filter'}
                </span>
              </button>
              {showFilterMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                  <button 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applyFilter('all')}
                  >
                    All Files
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applyFilter('pdf')}
                  >
                    PDF Files
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applyFilter('doc')}
                  >
                    Documents
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applyFilter('image')}
                  >
                    Images
                  </button>
                  <button 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => applyFilter('other')}
                  >
                    Other Files
                  </button>
                </div>
              )}
            </div>
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span>Upload File</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center text-gray-500 py-8">
             <EnhancedTaskLoading/>
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={refreshAttachments}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : filteredAttachments.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p className="mb-4">
              {attachments.length === 0 
                ? "No attachments found for this lead." 
                : `No ${filter !== 'all' ? filter : ''} attachments found.`}
            </p>
            <button 
              onClick={() => setIsUploadModalOpen(true)} 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Upload New File
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAttachments.map((attachment) => (
              <AttachmentCard key={attachment.id || attachment._id} attachment={attachment} />
            ))}
          </div>
        )}
      </div>

      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Upload New File</h2>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-500">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleFileUpload} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                {selectedFile && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm font-medium">Selected file:</p>
                    <p className="text-sm text-gray-600">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">Size: {formatFileSize(selectedFile.size)}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                  disabled={uploadLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                  disabled={!selectedFile || uploadLoading}
                >
                  {uploadLoading ? "Uploading..." : "Upload File"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShowAttachment;