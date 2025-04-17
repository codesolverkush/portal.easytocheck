import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, MapPin, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import Navbar from '../../common/Navbar';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const statusColors = {
  "PLANNED": "bg-blue-200 text-blue-700",
  "COMPLETED": "bg-green-200 text-green-700",
  "CANCELED": "bg-red-200 text-red-700",
  "IN_PROGRESS": "bg-yellow-200 text-yellow-700"
};

const Shimmer = () => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Card header shimmer */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
        <div className="flex-1">
          <div className="h-5 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-48 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
      
      {/* Main content shimmer */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-4 mb-6">
        {/* Hero section */}
        <div className="h-48 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent shimmer-wave"></div>
        </div>
        
        {/* Content sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <div>
            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/3 mb-4"></div>
            <div className="space-y-3">
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-4/5"></div>
            </div>
          </div>
          
          {/* Section 2 */}
          <div>
            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/4 mb-4"></div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-20 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
          
          {/* Section 3 */}
          <div>
            <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-2/5 mb-4"></div>
            <div className="flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-20"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer shimmer */}
      <div className="flex justify-between items-center">
        <div className="h-10 w-32 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-pulse"></div>
        <div className="h-10 w-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
      </div>
      
      <style jsx>{`
        @keyframes shimmerEffect {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .shimmer-wave {
          animation: shimmerEffect 1.5s infinite;
        }
      `}</style>
    </div>
  );
};

const MeetingCardView = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialMeetingId = location?.state?.meetingId;

  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState({
    Event_Title: "",
    Start_DateTime: "",
    End_DateTime: "",
    Venue: "",
    Description: ""
  });

  useEffect(() => {
    if (initialMeetingId) {
      fetchMeetingDetails(initialMeetingId);
    }
  }, [initialMeetingId]);

  const fetchMeetingDetails = async (meetingId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/lead/getmeetingbyid/${meetingId}`);
      setSelectedMeeting(response?.data?.data);
    } catch (error) {
      toast.error("Failed to load meeting details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (selectedMeeting?.data && selectedMeeting.data.length > 0) {
      const meeting = selectedMeeting.data[0];
      setEditingMeeting({
        id: meeting.id,
        Event_Title: meeting.Event_Title,
        Start_DateTime: meeting.Start_DateTime ? new Date(meeting.Start_DateTime).toISOString().slice(0, 16) : "",
        End_DateTime: meeting.End_DateTime ? new Date(meeting.End_DateTime).toISOString().slice(0, 16) : "",
        Venue: meeting.Venue || "",
        Description: meeting.Description || ""
      });
      setIsEditModalOpen(true);
    }
  };

  const handleEditMeeting = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_APP_API}/update/updatemoduledata/Events`,
        {id: initialMeetingId,...editingMeeting}
      );
      if (response?.status === 200) {
        toast.success("Meeting Updated Successfully!");
        fetchMeetingDetails(editingMeeting.id);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error updating meeting");
    }
    setIsEditModalOpen(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <button 
            onClick={handleBackClick}
            className="mb-6 flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors font-medium rounded-lg py-2 px-4 bg-white shadow-sm hover:shadow"
          >
            <ArrowLeft size={20} />
            <span>Back to Meetings</span>
          </button>

          {loading ? (
            <Shimmer />
          ) : selectedMeeting?.data ? (
            <div className="bg-white rounded-lg shadow-lg">
              <div className="border-b p-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {selectedMeeting.data[0].Event_Title}
                  </h1>
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    Edit
                  </button>
                </div>
                {selectedMeeting.data[0].What_Id && (
                  <p className="text-blue-600 mt-2">
                    {selectedMeeting.data[0].What_Id.name}
                  </p>
                )}
              </div>

              <div className="p-6 space-y-6">
                <div className="flex gap-4 flex-wrap">
                  {selectedMeeting.data[0].Check_In_Status && (
                    <span className={`px-3 py-1 rounded-full text-sm ${statusColors[selectedMeeting.data[0].Check_In_Status]}`}>
                      Status: {selectedMeeting.data[0].Check_In_Status}
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p>{formatDate(selectedMeeting.data[0].Start_DateTime)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p>{formatTime(selectedMeeting.data[0].Start_DateTime)} - {formatTime(selectedMeeting.data[0].End_DateTime)}</p>
                      </div>
                    </div>
                    {selectedMeeting.data[0].Venue && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Venue</p>
                          <p>{selectedMeeting.data[0].Venue}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <User className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Owner</p>
                        <p>{selectedMeeting.data[0].Owner?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Email</p>
                        <p className="text-blue-600">{selectedMeeting.data[0].Owner?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Created</p>
                        <p>{formatDate(selectedMeeting.data[0].Created_Time)}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedMeeting.data[0].Description && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600">{selectedMeeting.data[0].Description}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 bg-white rounded-lg shadow">
              <p>No meeting details available</p>
              <button 
                onClick={handleBackClick}
                className="mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                Return to meetings list
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Meeting Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-bold">Edit Meeting</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditMeeting} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editingMeeting.Event_Title}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, Event_Title: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    value={editingMeeting.Start_DateTime}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, Start_DateTime: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time</label>
                  <input
                    type="datetime-local"
                    value={editingMeeting.End_DateTime}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, End_DateTime: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                  <input
                    type="text"
                    value={editingMeeting.Venue}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, Venue: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingMeeting.Description}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, Description: e.target.value })}
                    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    placeholder="Enter meeting description..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Update Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MeetingCardView;