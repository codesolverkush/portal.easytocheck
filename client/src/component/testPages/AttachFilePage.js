import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function AttachFilePage({leadId}) {
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
        `${process.env.REACT_APP_APP_API}/related/attach/Leads/${leadId}`,
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



// import React, { useState, useCallback } from "react";
// import axios from "axios";
// import toast from "react-hot-toast";
// import { Upload, X } from "lucide-react";

// export default function AttachFilePage() {
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [dragActive, setDragActive] = useState(false);

//   const handleDrag = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     if (e.type === "dragenter" || e.type === "dragover") {
//       setDragActive(true);
//     } else if (e.type === "dragleave") {
//       setDragActive(false);
//     }
//   }, []);

//   const handleDrop = useCallback((e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setDragActive(false);
    
//     const file = e.dataTransfer.files[0];
//     if (file) {
//       setSelectedFile(file);
//     }
//   }, []);

//   function handleFileChange(event) {
//     const file = event.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//     }
//   }

//   function removeFile() {
//     setSelectedFile(null);
//   }

//   async function handleFileUpload(event) {
//     event.preventDefault();
//     if (!selectedFile) {
//       toast.error("Please select a file to upload!");
//       return;
//     }

//     setLoading(true);
//     try {
//       const fileData = new FormData();
//       fileData.append("file", selectedFile);

//       const response = await axios.post(
//         `${process.env.REACT_APP_APP_API}/lead/attach`,
//         fileData,
//         {
//           withCredentials: true,
//         }
//       );

//       if (response?.data?.success) {
//         toast.success("File Attached Successfully!");
//         setSelectedFile(null);
//       } else {
//         toast.error(response?.data?.message || "File Upload Failed!");
//       }
//     } catch (error) {
//       console.error("Error uploading file:", error);
//       toast.error("Failed to upload file!");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
//       <div className="w-full max-w-xl p-8 bg-white shadow-xl rounded-2xl m-4">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-gray-800 mb-2">Attach a File</h2>
//           <p className="text-gray-600">Drag and drop your file or click to browse</p>
//         </div>

//         <form onSubmit={handleFileUpload} className="space-y-6">
//           <div
//             className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ease-in-out ${
//               dragActive
//                 ? "border-blue-500 bg-blue-50"
//                 : "border-gray-300 hover:border-gray-400"
//             }`}
//             onDragEnter={handleDrag}
//             onDragLeave={handleDrag}
//             onDragOver={handleDrag}
//             onDrop={handleDrop}
//           >
//             <input
//               type="file"
//               onChange={handleFileChange}
//               className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//               title="Choose a file"
//             />
            
//             <div className="text-center">
//               <Upload
//                 className="mx-auto h-12 w-12 text-gray-400 mb-4"
//                 strokeWidth={1.5}
//               />
              
//               {selectedFile ? (
//                 <div className="mt-4">
//                   <div className="flex items-center justify-center space-x-2 bg-blue-50 p-3 rounded-lg">
//                     <span className="text-sm font-medium text-gray-900">
//                       {selectedFile.name}
//                     </span>
//                     <button
//                       type="button"
//                       onClick={removeFile}
//                       className="text-gray-500 hover:text-gray-700"
//                     >
//                       <X className="h-5 w-5" />
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="text-gray-600">
//                   <span className="font-medium">Click to upload</span> or drag and
//                   drop
//                 </div>
//               )}
//             </div>
//           </div>

//           <button
//             type="submit"
//             className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all duration-200 ${
//               loading
//                 ? "bg-gray-400 cursor-not-allowed"
//                 : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
//             }`}
//             disabled={loading || !selectedFile}
//           >
//             <div className="flex items-center justify-center space-x-2">
//               {loading ? (
//                 <>
//                   <div className="w-5 h-5 border-t-2 border-white border-solid rounded-full animate-spin"></div>
//                   <span>Uploading...</span>
//                 </>
//               ) : (
//                 <>
//                   <Upload className="h-5 w-5" />
//                   <span>Upload File</span>
//                 </>
//               )}
//             </div>
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }