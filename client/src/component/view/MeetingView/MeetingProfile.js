import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Mail, MapPin, ArrowLeft, Edit, X } from 'lucide-react';
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
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse"></div>
        <div className="flex-1">
          <div className="h-4 w-28 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse mb-2"></div>
          <div className="h-3 w-40 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
      
      {/* Main content shimmer */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden p-3 mb-4">
        {/* Hero section */}
        <div className="h-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse mb-4"></div>
        
        {/* Content sections */}
        <div className="space-y-4">
          {/* Section 1 */}
          <div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/3 mb-3"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-5/6"></div>
              <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-4/5"></div>
            </div>
          </div>
          
          {/* Section 2 */}
          <div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-1/4 mb-3"></div>
            <div className="grid grid-cols-2 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
          
          {/* Section 3 */}
          <div>
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded animate-pulse w-2/5 mb-3"></div>
            <div className="flex space-x-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-16"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer shimmer */}
      <div className="flex justify-between items-center">
        <div className="h-8 w-28 bg-gradient-to-r from-gray-200 to-gray-300 rounded-md animate-pulse"></div>
        <div className="h-8 w-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
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

const MeetingProfile = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get meeting ID from location state or URL params
  const meetingId = location?.state?.meetingId || 
                   location.pathname.split('/').pop();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState({
    Event_Title: "",
    Start_DateTime: "",
    End_DateTime: "",
    Venue: "",
    Description: ""
  });

  // Fetch meeting data when component mounts or meetingId changes
  useEffect(() => {
    if (meetingId) {
      fetchMeetingDetails(meetingId);
    } else {
      setLoading(false);
    }
  }, [meetingId]);

  const fetchMeetingDetails = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_APP_API}/gets/getbyid/Events/${id}`);
      if (response?.data?.data) {
        setMeeting(response.data.data);
      } else {
        toast.error("No meeting data found");
      }
    } catch (error) {
      console.error("Error fetching meeting details:", error);
      toast.error(error?.response?.data?.message || "Failed to load meeting details");
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    if (meeting?.data && meeting.data.length > 0) {
      const meetingData = meeting.data[0];
      setEditingMeeting({
        id: meetingData.id,
        Event_Title: meetingData.Event_Title || "",
        Start_DateTime: meetingData.Start_DateTime ? new Date(meetingData.Start_DateTime).toISOString().slice(0, 16) : "",
        End_DateTime: meetingData.End_DateTime ? new Date(meetingData.End_DateTime).toISOString().slice(0, 16) : "",
        Venue: meetingData.Venue || "",
        Description: meetingData.Description || ""
      });
      setIsEditModalOpen(true);
    }
  };

  const handleEditMeeting = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_APP_API}/update/updatemoduledata/Events`,
       {id: meetingId, ...editingMeeting}
      );
      
      if (response?.status === 200) {
        toast.success("Meeting updated successfully!");
        fetchMeetingDetails(editingMeeting.id);
        setIsEditModalOpen(false);
      }
    } catch (error) {
      console.error("Error updating meeting:", error);
      toast.error(error?.response?.data?.message || "Error updating meeting");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  // Check if meeting data exists and has items
  const meetingData = meeting?.data?.[0];
  const hasMeetingData = !!meetingData;

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
          ) : hasMeetingData ? (
            <div className="bg-white rounded-lg shadow-lg">
              <div className="border-b p-6">
                <div className="flex justify-between items-center">
                  <h1 className="text-2xl font-bold text-gray-800">
                    {meetingData.Event_Title}
                  </h1>
                  <button
                    onClick={handleEditClick}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                </div>
                {meetingData.What_Id && (
                  <p className="text-blue-600 mt-2">
                    {meetingData.What_Id.name}
                  </p>
                )}
              </div>

              <div className="p-6 space-y-6">
                <div className="flex gap-4 flex-wrap">
                  {meetingData.Check_In_Status && (
                    <span className={`px-3 py-1 rounded-full text-sm ${statusColors[meetingData.Check_In_Status] || "bg-gray-200 text-gray-700"}`}>
                      Status: {meetingData.Check_In_Status}
                    </span>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Date</p>
                        <p>{formatDate(meetingData.Start_DateTime)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium">Time</p>
                        <p>{formatTime(meetingData.Start_DateTime)} - {formatTime(meetingData.End_DateTime)}</p>
                      </div>
                    </div>
                    {meetingData.Venue && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Venue</p>
                          <p>{meetingData.Venue}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {meetingData.Owner && (
                      <>
                        <div className="flex items-center gap-2 text-gray-700">
                          <User className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">Owner</p>
                            <p>{meetingData.Owner.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gray-700">
                          <Mail className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-blue-600">{meetingData.Owner.email}</p>
                          </div>
                        </div>
                      </>
                    )}
                    {meetingData.Created_Time && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Created</p>
                          <p>{formatDate(meetingData.Created_Time)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {meetingData.Description && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
                    <p className="text-gray-600">{meetingData.Description}</p>
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
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
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

export default MeetingProfile;