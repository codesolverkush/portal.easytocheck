// {/* <div className="flex min-h-screen bg-gray-50 relative">
// {/* Main Content Area */}
// <div className="flex-1 flex flex-col">
//   {/* Top Navigation Bar */}
//   <header className="bg-white shadow-sm border-b border-gray-200">
//     <div className="flex items-center px-2 sm:px-4 py-2">
//       {/* Desktop back button (hidden on mobile) */}
//       <button
//         className="p-2 mr-2 rounded-full hover:bg-gray-100 hidden lg:block"
//         onClick={() => navigate("/app/leadview")}
//       >
//         <ArrowLeft className="w-5 h-5 text-gray-600" />
//       </button>

//       {/* Mobile back button (visible only on small screens) */}
//       <button
//         className="py-1 px-2 mr-2 text-xs rounded-md bg-gray-100 hover:bg-gray-200 flex items-center lg:hidden"
//         onClick={() => navigate("/app/leadview")}
//       >
//         <ArrowLeft className="w-4 h-4 mr-1 text-gray-600" />
//       </button>

//       <div className="flex items-center">
//         <div className="bg-red-500 text-white rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
//           {lead?.First_Name ? lead.First_Name.charAt(0) : 'K'}
//         </div>
//         <div className="overflow-hidden">
//           <h1 className="text-base sm:text-lg font-medium truncate">
//             {safeRenderValue(lead?.Full_Name) || 'Mr. Kushal Pratap Singh'}
//           </h1>
//           <p className="text-xs sm:text-sm text-gray-500 truncate">
//             {safeRenderValue(lead?.Company) || 'Coding Ninjas'}
//           </p>
//         </div>
//       </div>

//       <div className="ml-auto flex space-x-1 sm:space-x-2">
//         {isEditing ? (
//           <>
//             <button
//               className="border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-gray-50 text-sm sm:text-base"
//               onClick={toggleEditMode}
//               disabled={isSaving}
//             >
//               <span className="hidden sm:inline">Cancel</span>
//               <X className="w-4 h-4 inline sm:hidden" />
//             </button>
//             <button
//               className="border border-blue-500 bg-blue-500 text-white px-2 sm:px-4 py-1 sm:py-2 rounded-md hover:bg-blue-600 text-sm sm:text-base"
//               onClick={saveLead}
//               disabled={isSaving}
//             >
//               {isSaving ? (
//                 <span className="hidden sm:inline">Saving...</span>
//               ) : (
//                 <>
//                   <span className="hidden sm:inline">Save</span>
//                   <Save className="w-4 h-4 inline sm:hidden" />
//                 </>
//               )}
//             </button>
//           </>
//         ) : (
//           <button
//             className={`border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base
//               ${accessScore < 3 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
//             onClick={toggleEditMode}
//             disabled={accessScore < 3} // Disable button if accessScore is less than 3
//           >
//             <span className="hidden sm:inline">Edit</span>
//             <Edit className="w-4 h-4 inline sm:hidden" />
//           </button>
//         )}
//       </div>
//     </div>
//   </header>

//   {/* Tabs */}
//   <div className="border-b border-gray-200 bg-white">
//     <div className="px-3 sm:px-6 py-2">
//       <div className="flex space-x-4 sm:space-x-8 overflow-x-auto">
//         <button
//           className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'overview'
//               ? 'border-b-2 border-blue-500 text-blue-600'
//               : 'text-gray-500 hover:text-gray-700'
//             }`}
//           onClick={() => handleTabSwitch('overview')}
//         >
//           Overview
//         </button>
//         <button
//           className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'notes'
//               ? 'border-b-2 border-blue-500 text-blue-600'
//               : 'text-gray-500 hover:text-gray-700'
//             }`}
//           onClick={() => handleTabSwitch('notes')}
//         >
//           Notes
//         </button>
//         <button
//           className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'attachments'
//               ? 'border-b-2 border-blue-500 text-blue-600'
//               : 'text-gray-500 hover:text-gray-700'
//             }`}
//           onClick={() => handleTabSwitch('attachments')}
//         >
//           Attachments
//         </button>
//         <button
//           className={`px-2 sm:px-3 py-2 text-sm font-medium whitespace-nowrap ${activeTab === 'openActivity' ? 'border-b-2 border-blue-500 text-blue-600'
//               : 'text-gray-500 hover:text-gray-700'
//             }`}
//           onClick={() => handleTabSwitch('openActivity')}
//         >
//           Activities
//         </button>
//       </div>
//     </div>
//   </div>

//   {/* Main Content */}
//   <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
//     {activeTab === 'overview' && (
//       fields.length <= 0 ? (<ShimmerPage/>): (
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
//         <div className="p-3 sm:p-6 overflow-auto">
//           <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden p-4">
//             <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-4 justify-center items-center">
//               <button
//                 onClick={() => handleClick("Contacted")}
//                 className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
//               >
//                 Contacted
//               </button>

//               <button onClick={() => handleClick("Not Contacted")} className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md shadow transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
//                 Not Contacted
//               </button>
//               <button onClick={() => handleClick("Junk Lead")} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
//                 Junk Lead
//               </button>
//               <button onClick={() => handleClick("Not Qualified")} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md shadow transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">
//                 Not Qualified
//               </button>
//             </div>
//           </div>
//         </div>
//         <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex justify-between items-center">
//           <h2 className="text-base sm:text-lg font-medium text-gray-800">Lead Information</h2>
//           <button
//             className="text-blue-600 text-xs sm:text-sm hover:underline"
//             onClick={toggleDetails}
//           >
//             {showDetails ? 'Hide Details' : 'Show Details'}
//           </button>
//         </div>

//         {/* Details content - conditionally rendered based on showDetails state */}
//         {showDetails && (
//           <>
//             <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-4 sm:gap-y-6">
//               {/* Display all fields without filtering */}
//               {fields.map((field, index) => (
//                 <div key={field.api_name} className="flex items-start">
//                   <div className="w-28 sm:w-36 text-xs sm:text-sm text-gray-500">{field.display_label || field.api_name}</div>
//                   <div className="flex-1">
//                     {isEditing && field.api_name !== 'id' && field.data_type !== "lookup" && field.data_type !== "ownerlookup"? (
//                       renderFormField(field.api_name, field)
//                     ) : (
//                       field.api_name === 'Mobile' || field.api_name === 'Phone' ? (
//                         <div className="flex items-center">
//                           <span className="bg-green-100 rounded-full p-1 mr-2">
//                             <Phone className="w-3 h-3 text-green-600" />
//                           </span>
//                           {renderFieldDisplay(field.api_name)}
//                         </div>
//                       ) : field.api_name === 'Email' || field.api_name === 'Secondary_Email' ? (
//                         renderFieldDisplay(field.api_name, 'text-blue-600')
//                       ) : (
//                         renderFieldDisplay(field.api_name)
//                       )
//                     )}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </>
//         )}

//         {/* Display a message when details are hidden */}
//         {!showDetails && (
//           <div className="p-6 text-center text-gray-500">
//             Details are hidden. Click "Show Details" to view lead information.
//           </div>
//         )}
//       </div>
//       ) 
//     )}

//     {activeTab === 'notes' && (
//       <div className="space-y-4">
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-base sm:text-lg font-medium text-gray-800">
//               Notes ({notes?.length || 0})
//             </h2>
//             <button className="text-blue-600 text-sm hover:underline" onClick={() => setIsAddNoteModalOpen(true)}>
//               Add Note
//             </button>
//           </div>

//           {isLoading ? (
//             <div className="text-center text-gray-500 py-6">
//               <NotesUi />
//             </div>
//           ) : !notes || notes.length === 0 ? (
//             <div className="text-center text-gray-500 py-6">
//               No notes found for this lead.
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {notes.map((note) => (
//                 <NotesCard key={note.id} note={note} />
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     )}

//     {activeTab === 'attachments' && (
//       <div className="space-y-4">
//         <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-base sm:text-lg font-medium text-gray-800">
//               Attachments
//             </h2>
//             {/* <div className="flex space-x-3">
//               <button 
//                 className="text-blue-600 text-sm hover:underline" 
//                 onClick={() => {
//                   setShowAttachmentsPage(true);
//                   setShowAddAttachment(false);
//                 }}
//               >
//                 Show All Attachments
//               </button>
//               <button 
//                 className="text-blue-600 text-sm hover:underline" 
//                 onClick={() => {
//                   setShowAddAttachment(true);
//                   setShowAttachmentsPage(false);
//                 }}
//               >
//                 Add New Attachment
//               </button>
//             </div> */}
//           </div>

//           {showAttachmentsPage ? (
//             <CachedShowAttachment leadId={lead?.id} onClose={() => setShowAttachmentsPage(false)} />
//           ) : showAddAttachment ? (
//             <AttachFilePage leadId={lead?.id} onClose={() => setShowAddAttachment(false)} />
//           ) : (
//             <div className="text-center text-gray-500 py-6">
//               Click "Show All Attachments" to view files or "Add New Attachment" to upload files.
//             </div>
//           )}
//         </div>
//       </div>
//     )}

//     {activeTab === 'openActivity' && (
//       <CachedTaskDetailsPage />
//     )}

//   </div>
// </div>
// <AddNoteModal
//   isOpen={isAddNoteModalOpen}
//   onClose={() => setIsAddNoteModalOpen(false)}
//   leadId={leadId}
//   username={username}
//   onNoteAdded={handleNoteAdded}
// />
// <AddReasonModal
//   isOpen={isAddReasonModalOpen}
//   onClose={() => setIsAddReasonModalOpen(false)}
//   leadId={leadId}
//   username={username}
//   leadStatus={lead?.Lead_Status || undefined}
//   buttonName={selectedButton}
//   onLeadStatusUpdated={handleLeadStatusUpdated}
// />
// </div> */}




//  import React, { useState, useEffect } from 'react';
// import { Phone, User, Mail, Calendar, Clock, ArrowLeft, Search, Plus, X, MapPin, MessageCircle } from 'lucide-react';
// import axios from 'axios';
// import Navbar from '../../common/Navbar';
// import { useLocation, useNavigate } from 'react-router-dom';
// import toast from 'react-hot-toast';

// const leadSourceColors = {
//   "External Referral": "bg-purple-200 text-purple-700",
//   "Internal Referral": "bg-blue-200 text-blue-700",
//   "Web Download": "bg-green-200 text-green-700",
//   "Trade Show": "bg-yellow-200 text-yellow-700",
//   "Other": "bg-gray-200 text-gray-700"
// };

// const Shimmer = () => {
//   return (
//     <div className="w-full max-w-3xl mx-auto">
//       {/* Card header shimmer */}
//       <div className="flex items-center gap-4 mb-6">
//         <div className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
//         <div className="flex-1">
//           <div className="h-5 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse mb-2"></div>
//           <div className="h-4 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
//         </div>
//       </div>
      
//       {/* Main content shimmer */}
//       <div className="bg-white rounded-xl shadow-md overflow-hidden p-4 mb-6">
//         {/* Hero section */}
//         <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse mb-6 relative overflow-hidden">
//           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent shimmer-wave"></div>
//         </div>
        
//         {/* Content sections */}
//         <div className="space-y-6">
//           {/* Section 1 */}
//           <div>
//             <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/3 mb-4"></div>
//             <div className="space-y-3">
//               <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
//               <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-5/6"></div>
//               <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-4/5"></div>
//             </div>
//           </div>
          
//           {/* Section 2 */}
//           <div>
//             <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/4 mb-4"></div>
//             <div className="grid grid-cols-2 gap-4">
//               {[...Array(4)].map((_, i) => (
//                 <div key={i} className="h-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse"></div>
//               ))}
//             </div>
//           </div>
          
//           {/* Section 3 */}
//           <div>
//             <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-2/5 mb-4"></div>
//             <div className="flex space-x-2">
//               {[...Array(5)].map((_, i) => (
//                 <div key={i} className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-20"></div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Footer shimmer */}
//       <div className="flex justify-between items-center">
//         <div className="h-10 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-pulse"></div>
//         <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
//       </div>
      
//       <style jsx>{`
//         @keyframes shimmerEffect {
//           0% {
//             transform: translateX(-100%);
//           }
//           100% {
//             transform: translateX(100%);
//           }
//         }
//         .shimmer-wave {
//           animation: shimmerEffect 1.5s infinite;
//         }
//       `}</style>
//     </div>
//   );
// };

// const ContactDetails = ({accessScore}) => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const initialContactId = location?.state?.contactId;
  
//   const [selectedContactId, setSelectedContactId] = useState(initialContactId);
//   const [contactList, setContactList] = useState([]);
//   const [selectedContact, setSelectedContact] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [sortField, setSortField] = useState(null);
//   const [sortDirection, setSortDirection] = useState("asc");
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
//   const [newContact, setNewContact] = useState({
//     First_Name: "",
//     Last_Name: "",
//     Email: "",
//     Phone: "",
//     Lead_Source: "External Referral",
//     Description: ""
//   });
//   const [isEditModalOpen,setIsEditModalOpen] = useState(false); 
//   const [editContact, setEditContact] = useState({
//     First_Name: "",
//     Last_Name: "",
//     Email: "",
//     Phone: "",
//     Lead_Source: "External Referral",
//     Description: ""
//   });

//   useEffect(() => {
//     fetchContacts();
//   }, []);

//   useEffect(() => {
//     if (selectedContactId) {
//       fetchContactDetails(selectedContactId);
//       setIsMobileSidebarOpen(false);
//     }
//   }, [selectedContactId]);

//   const fetchContacts = async () => {
//     try {

//       const CACHE_NAME = "crm-cache";
//       const cache = await caches.open(CACHE_NAME);

//       // Check if data is present in cache
//       const cachedResponse = await cache.match("/contacts-free");
//       if (cachedResponse) {
//         const data = await cachedResponse.json();
//         setContactList(data);
//         setLoading(false);
      
//         return;
//       }


//       const response = await axios.get(`${process.env.REACT_APP_APP_API}/get/contactdetails`);
//       console.log(response);
//       if (response.status === 200) {
//         setContactList(response.data?.data || []);

//         const newResponse = new Response(JSON.stringify(response.data?.data), { headers: { "Content-Type": "application/json" } });
//         await cache.put("/contacts-free", newResponse);
//       }
//     } catch (error) {
//       console.error("Error fetching contacts", error);
//     }
//   };

//   const fetchContactDetails = async (contactId) => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${process.env.REACT_APP_APP_API}/lead/getcontactbyid/${contactId}`);
//       setSelectedContact(response?.data?.data);
//     } catch (error) {
//       console.error("Error fetching contact details", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateContact = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_APP_API}/lead/createContact`,
//         newContact
//       );
//       if (response?.status === 200) {
//         toast.success("Contact Created Successfully!");
//         fetchContacts();
//       }
//     } catch (error) {
//       console.error("Error creating contact:", error);
//       toast.error(error?.response?.data?.error?.data[0]?.message);
//     }
//     setIsCreateModalOpen(false);
//     setNewContact({
//       First_Name: "",
//       Last_Name: "",
//       Email: "",
//       Phone: "",
//       Lead_Source: "External Referral",
//       Description: ""
//     });
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   const handleEditClick = ()=>{
//     if(selectedContact?.data && selectedContact.data.length > 0){
//       const contact = selectedContact.data[0];
//       setEditContact({
//         id: contact.id,
//         First_Name: contact.First_Name,
//         Last_Name: contact.Last_Name,
//         Email: contact.Email,
//         Phone: contact.Phone,
//         Lead_Source: contact.Lead_Source,
//         Description: contact.Description || ""
//       });
//         setIsEditModalOpen(true);
//     }
//   }

//   const handleEditContact = async(e)=>{
//     e.preventDefault();
//     try{
//       const response = await axios.put(
//         `${process.env.REACT_APP_APP_API}/lead/updatecontact`,
//         editContact
//       );
//       if(response?.status === 200){
//         toast.success("Task Updated Successfully!");
//         // fetchContacts();
//         fetchContactDetails(editContact.id);
//       }
//     } catch(error){
//       console.log("Error updating contact: ",error);
//       toast.error(error?.response?.data?.message || "Error updating contact");
//     }
//     setIsEditModalOpen(false);
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <Navbar />
      
//       <div className="flex flex-col lg:flex-row h-[calc(100vh-64px)]">
//         {/* Desktop Contact List */}
//         <div className="hidden lg:flex lg:w-1/3 xl:w-1/4 flex-col border-r border-gray-200 bg-white">
//           <div className="p-4 border-b">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold text-gray-800">Contacts</h2>
//               <button
//                 onClick={() => setIsCreateModalOpen(true)}
//                 className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center text-sm hover:bg-blue-600"
//               >
//                 <Plus size={16} className="mr-1" />
//                 New Contact
//               </button>
//             </div>
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search contacts..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
//             </div>
//           </div>
//           <div className="overflow-y-auto flex-1">
//             {contactList?.data?.map((contact) => (
//               <div
//                 key={contact.id}
//                 onClick={() => setSelectedContactId(contact.id)}
//                 className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
//                   selectedContactId === contact.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
//                 }`}
//               >
//                 <div className="flex justify-between items-start mb-2">
//                   <h3 className="font-medium text-gray-800">{contact.Full_Name}</h3>
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${leadSourceColors[contact.Lead_Source]}`}>
//                     {contact.Lead_Source}
//                   </span>
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   <div>{contact.Email}</div>
//                   <div>{contact.Phone}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Main Content Area */}
//         {/* <div className="flex-1 overflow-y-auto bg-white">
//           {loading ? (
//             <div className="p-8">
//               <Shimmer />
//             </div>
//           ) : selectedContact?.data ? (
//             <div className="p-8">
//               <div className="max-w-4xl mx-auto">
//                 <div className="bg-white rounded-lg shadow-lg">
//                   <div className="border-b p-6">
//                     <div className="flex justify-between items-center">
//                       <h1 className="text-2xl font-bold text-gray-800">
//                         {selectedContact.data[0].Full_Name}
//                       </h1>
//                       <div className="flex gap-2">
//                       <button
//                         onClick={handleEditClick}
//                         className={`border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base
//                           ${accessScore < 3 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
//                         disabled={accessScore < 3} 
//                       >
//                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
//                           <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
//                           <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
//                         </svg>
//                         Edit
//                       </button>
//                         <button
//                           onClick={() => setIsMobileSidebarOpen(true)}
//                           className="lg:hidden px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
//                         >
//                           <ArrowLeft size={20} />
//                         </button>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="p-6 space-y-6">
//                     <div className="flex gap-4 flex-wrap">
//                       <span className={`px-3 py-1 rounded-full text-sm ${leadSourceColors[selectedContact.data[0].Lead_Source]}`}>
//                         Source: {selectedContact.data[0].Lead_Source}
//                       </span>
//                     </div>

//                     <div className="grid md:grid-cols-2 gap-6">
//                       <div className="space-y-4">
//                         <div className="flex items-center gap-2 text-gray-700">
//                           <Phone className="h-5 w-5 text-blue-600" />
//                           <div>
//                             <p className="text-sm font-medium">Phone</p>
//                             <p>{selectedContact.data[0].Phone}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-2 text-gray-700">
//                           <Mail className="h-5 w-5 text-blue-600" />
//                           <div>
//                             <p className="text-sm font-medium">Email</p>
//                             <p className="text-blue-600">{selectedContact.data[0].Email}</p>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="space-y-4">
//                         <div className="flex items-center gap-2 text-gray-700">
//                           <User className="h-5 w-5 text-blue-600" />
//                           <div>
//                             <p className="text-sm font-medium">Owner</p>
//                             <p>{selectedContact.data[0].Owner?.name}</p>
//                           </div>
//                         </div>
//                         <div className="flex items-center gap-2 text-gray-700">
//                           <Clock className="h-5 w-5 text-blue-600" />
//                           <div>
//                             <p className="text-sm font-medium">Created</p>
//                             <p>{formatDate(selectedContact.data[0].Created_Time)}</p>
//                           </div>
//                         </div>
//                       </div>
//                     </div>

//                     {selectedContact.data[0].Description && (
//                       <div className="mt-6">
//                         <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
//                         <p className="text-gray-600">{selectedContact.data[0].Description}</p>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             <div className="p-8 text-center text-gray-500">
//               Select a contact to view details
//             </div>
//           )}
//         </div> */}

// <div className="flex-1 overflow-y-auto bg-white">
//   {loading ? (
//     <div className="p-8">
//       <Shimmer />
//     </div>
//   ) : selectedContact?.data ? (
//     <div className="p-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="bg-white rounded-lg shadow-lg">
//           <div className="border-b p-6">
//             <div className="flex justify-between items-center">
//               <h1 className="text-2xl font-bold text-gray-800">
//                 {selectedContact.data[0].Full_Name}
//               </h1>
//               <div className="flex gap-2">
//                 <button
//                   onClick={handleEditClick}
//                   className={`border border-gray-300 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm sm:text-base
//                     ${accessScore < 3 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
//                   disabled={accessScore < 3} 
//                 >
//                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 inline">
//                     <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
//                     <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
//                   </svg>
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => setIsMobileSidebarOpen(true)}
//                   className="lg:hidden px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
//                 >
//                   <ArrowLeft size={20} />
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="p-6 space-y-6">
//             <div className="flex gap-4 flex-wrap">
//               <span className={`px-3 py-1 rounded-full text-sm ${leadSourceColors[selectedContact.data[0].Lead_Source]}`}>
//                 Source: {selectedContact.data[0].Lead_Source}
//               </span>
//             </div>

//             {/* Contact Information Section */}
//             <div>
//               <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h3>
//               <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 <div className="flex items-center gap-2 text-gray-700">
//                   <Phone className="h-5 w-5 text-blue-600" />
//                   <div>
//                     <p className="text-sm font-medium">Primary Phone</p>
//                     <p>{selectedContact.data[0].Phone || "—"}</p>
//                   </div>
//                 </div>
                
//                 <div className="flex items-center gap-2 text-gray-700">
//                   <Phone className="h-5 w-5 text-blue-600" />
//                   <div>
//                     <p className="text-sm font-medium">Other Phone</p>
//                     <p>{selectedContact.data[0].Other_Phone || "—"}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2 text-gray-700">
//                   <Mail className="h-5 w-5 text-blue-600" />
//                   <div>
//                     <p className="text-sm font-medium">Primary Email</p>
//                     <p className="text-blue-600">{selectedContact.data[0].Email || "—"}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2 text-gray-700">
//                   <Mail className="h-5 w-5 text-blue-600" />
//                   <div>
//                     <p className="text-sm font-medium">Secondary Email</p>
//                     <p className="text-blue-600">{selectedContact.data[0].Secondary_Email || "—"}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2 text-gray-700">
//                   <MessageCircle className="h-5 w-5 text-blue-600" />
//                   <div>
//                     <p className="text-sm font-medium">Skype ID</p>
//                     <p>{selectedContact.data[0].Skype_ID || "—"}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-2 text-gray-700">
//                   <Calendar className="h-5 w-5 text-blue-600" />
//                   <div>
//                     <p className="text-sm font-medium">Date of Birth</p>
//                     <p>{selectedContact.data[0].Date_of_Birth ? formatDate(selectedContact.data[0].Date_of_Birth) : "—"}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Address Section */}
//             <div>
//               <h3 className="text-lg font-semibold text-gray-800 mb-4">Address</h3>
//               <div className="bg-gray-50 p-4 rounded-lg">
//                 <div className="flex items-start gap-2">
//                   <MapPin className="h-5 w-5 text-blue-600 mt-1" />
//                   <div>
//                     <p className="font-medium text-gray-800">Mailing Address</p>
//                     <p className="text-gray-700">
//                       {selectedContact.data[0].Mailing_Street || "—"}
//                       {selectedContact.data[0].Mailing_Street && <br />}
//                       {[
//                         selectedContact.data[0].Mailing_City,
//                         selectedContact.data[0].Mailing_State,
//                         selectedContact.data[0].Mailing_Zip
//                       ].filter(Boolean).join(", ")}
//                       {selectedContact.data[0].Mailing_Country && (
//                         <span>, {selectedContact.data[0].Mailing_Country}</span>
//                       )}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* System Information Section */}
//             <div>
//               <h3 className="text-lg font-semibold text-gray-800 mb-4">System Information</h3>
//               <div className="grid md:grid-cols-2 gap-6">
//                 <div className="flex items-center gap-2 text-gray-700">
//                   <User className="h-5 w-5 text-blue-600" />
//                   <div>
//                     <p className="text-sm font-medium">Owner</p>
//                     <p>{selectedContact.data[0].Owner?.name || "—"}</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-2 text-gray-700">
//                   <Clock className="h-5 w-5 text-blue-600" />
//                   <div>
//                     <p className="text-sm font-medium">Created</p>
//                     <p>{formatDate(selectedContact.data[0].Created_Time)}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Description Section */}
//             {selectedContact.data[0].Description && (
//               <div className="mt-6">
//                 <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
//                 <div className="bg-gray-50 p-4 rounded-lg">
//                   <p className="text-gray-600">{selectedContact.data[0].Description}</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   ) : (
//     <div className="p-8 text-center text-gray-500">
//       Select a contact to view details
//     </div>
//   )}
// </div>


//       </div>

//       {/* Mobile Sliding Sidebar */}
//       <div
//         className={`lg:hidden fixed inset-y-0 left-0 z-50 w-full sm:w-80 bg-white transform transition-transform duration-300 ease-in-out ${
//           isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
//         }`}
//       >
//         <div className="h-full flex flex-col">
//           <div className="p-4 border-b">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-xl font-bold text-gray-800">Contacts</h2>
//               <button
//                 onClick={() => setIsCreateModalOpen(true)}
//                 className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center text-sm hover:bg-blue-600"
//               >
//                 <Plus size={16} className="mr-1" />
//                 New Contact
//               </button>
//             </div>
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search contacts..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//               <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
//             </div>
//           </div>
          
//           <div className="overflow-y-auto flex-1">
//             {contactList?.data?.map((contact) => (
//               <div
//                 key={contact.id}
//                 onClick={() => setSelectedContactId(contact.id)}
//                 className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
//                   selectedContactId === contact.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
//                 }`}
//               >
//                 <div className="flex justify-between items-start mb-2">
//                   <h3 className="font-medium text-gray-800">{contact.Full_Name}</h3>
//                   <span className={`px-2 py-1 rounded-full text-xs font-medium ${leadSourceColors[contact.Lead_Source]}`}>
//                     {contact.Lead_Source}
//                   </span>
//                 </div>
//                 <div className="text-sm text-gray-600">
//                   <div>{contact.Email}</div>
//                   <div>{contact.Phone}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Overlay for mobile sidebar */}
//       {isMobileSidebarOpen && (
//         <div
//           className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
//           onClick={() => setIsMobileSidebarOpen(false)}
//         />
//       )}

//       {/* Create Contact Modal */}
//       {isCreateModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-lg w-full max-w-md">
//             <div className="flex justify-between items-center p-4 border-b">
//               <h2 className="text-lg font-bold">Create New Contact</h2>
//               <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500">
//                 <X size={20} />
//               </button>
//             </div>
//             <form onSubmit={handleCreateContact} className="p-4">
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
//                   <input
//                     type="text"
//                     value={newContact.First_Name}
//                     onChange={(e) => setNewContact({...newContact, First_Name: e.target.value})}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
//                   <input
//                     type="text"
//                     value={newContact.Last_Name}
//                     onChange={(e) => setNewContact({...newContact, Last_Name: e.target.value})}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//                   <input
//                     type="email"
//                     value={newContact.Email}
//                     onChange={(e) => setNewContact({...newContact, Email: e.target.value})}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//                   <input
//                     type="tel"
//                     value={newContact.Phone}
//                     onChange={(e) => setNewContact({...newContact, Phone: e.target.value})}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                     required
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
//                   <select
//                     value={newContact.Lead_Source}
//                     onChange={(e) => setNewContact({...newContact, Lead_Source: e.target.value})}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   >
//                     <option value="External Referral">External Referral</option>
//                     <option value="Internal Referral">Internal Referral</option>
//                     <option value="Web Download">Web Download</option>
//                     <option value="Trade Show">Trade Show</option>
//                     <option value="Other">Other</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//                   <textarea
//                     value={newContact.Description}
//                     onChange={(e) => setNewContact({...newContact, Description: e.target.value})}
//                     className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
//                     placeholder="Enter contact description..."
//                   />
//                 </div>
//               </div>
//               <div className="mt-6 flex justify-end space-x-3">
//                 <button
//                   type="button"
//                   onClick={() => setIsCreateModalOpen(false)}
//                   className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//                 >
//                   Create Contact
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

// {isEditModalOpen && (
//   <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
//     <div className="bg-white rounded-lg w-full max-w-md">
//       <div className="flex justify-between items-center p-4 border-b">
//         <h2 className="text-lg font-bold">Edit Lead</h2>
//         <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500">
//           <X size={20} />
//         </button>
//       </div>
//       <form onSubmit={handleEditContact} className="p-4">
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
//             <input
//               type="text"
//               value={editContact.First_Name}
//               onChange={(e) => setEditContact({ ...editContact, First_Name: e.target.value })}
//               className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
//             <input
//               type="text"
//               value={editContact.Last_Name}
//               onChange={(e) => setEditContact({ ...editContact, Last_Name: e.target.value })}
//               className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
//             <input
//               type="email"
//               value={editContact.Email}
//               onChange={(e) => setEditContact({ ...editContact, Email: e.target.value })}
//               className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//             <input
//               type="tel"
//               value={editContact.Phone}
//               onChange={(e) => setEditContact({ ...editContact, Phone: e.target.value })}
//               className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
//             <select
//               value={editContact.Lead_Source}
//               onChange={(e) => setEditContact({ ...editContact, Lead_Source: e.target.value })}
//               className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             >
//               <option value="External Referral">External Referral</option>
//               <option value="Web Form">Web Form</option>
//               <option value="Cold Call">Cold Call</option>
//               <option value="Social Media">Social Media</option>
//               <option value="Trade Show">Trade Show</option>
//               <option value="Other">Other</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
//             <textarea
//               value={editContact.Description}
//               onChange={(e) => setEditContact({ ...editContact, Description: e.target.value })}
//               className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
//               placeholder="Enter lead details..."
//             />
//           </div>
//         </div>
//         <div className="mt-6 flex justify-end space-x-3">
//           <button
//             type="button"
//             onClick={() => setIsEditModalOpen(false)}
//             className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
//           >
//             Update Contact
//           </button>
//         </div>
//       </form>
//     </div>
//   </div>
// )}
//     </div>
//   );
// };

// export default ContactDetails;