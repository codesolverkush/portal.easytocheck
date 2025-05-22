import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

const EventForm = () => {
  const [formData, setFormData] = useState({
    eventTitle: "",
    startDateTime: "",
    allDay: false,
    endDateTime: "",
    description: "",
  });

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const convertToUTCFormat = (dateTime) => {
        if (!dateTime) return "";
        const date = new Date(dateTime);
        
        // Extract required parts
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, "0");
        const day = String(date.getUTCDate()).padStart(2, "0");
        const hours = String(date.getUTCHours()).padStart(2, "0");
        const minutes = String(date.getUTCMinutes()).padStart(2, "0");
        const seconds = String(date.getUTCSeconds()).padStart(2, "0");
    
        // Return formatted string without milliseconds
        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}+00:00`;
    };

    // Data format same as `leadCreate`
    const eventData = {
      data: [
        {
            Event_Title: formData.eventTitle,
            Start_DateTime: convertToUTCFormat(formData.startDateTime),
            All_day: formData.allDay,
            End_DateTime: convertToUTCFormat(formData.endDateTime),
            Description: formData.description,
        },
      ],
    };

    try {
      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/lead/checkin`,
        eventData
      );
      if (response?.status === 200) {
        toast.success("Event Created Successfully!");
        setFormData({
          eventTitle: "",
          startDateTime: "",
          allDay: false,
          endDateTime: "",
          description: "",
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.error?.data[0]?.message || "Something went wrong!");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Create an Event</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Event Title */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              Event Title
            </label>
            <input
              type="text"
              name="eventTitle"
              value={formData.eventTitle}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Enter event title"
            />
          </div>

          {/* Start Date & Time */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              Start Date & Time
            </label>
            <input
              type="datetime-local"
              name="startDateTime"
              value={formData.startDateTime}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* End Date & Time */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              End Date & Time
            </label>
            <input
              type="datetime-local"
              name="endDateTime"
              value={formData.endDateTime}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg"
            />
          </div>

          {/* All Day Event Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="allDay"
              checked={formData.allDay}
              onChange={handleChange}
              className="w-5 h-5 mr-2"
            />
            <label className="text-gray-700 text-sm font-semibold">All Day Event</label>
          </div>

          {/* Description */}
          <div>
            <label className="block text-gray-700 text-sm font-semibold mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg resize-none"
              placeholder="Enter event description"
            ></textarea>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventForm;



// import React, { useState, useEffect } from "react";
// import toast from "react-hot-toast";
// import axios from "axios";

// const EventForm = () => {
//   const [formData, setFormData] = useState({
//     eventTitle: "",
//     startDateTime: "",
//     allDay: false,
//     endDateTime: "",
//     description: "",
//   });

//   const [location, setLocation] = useState({
//     latitude: null,
//     longitude: null,
//     address: "",
//   });

//   const [error, setError] = useState(null);

//   // Fetch Location and Address
//   const fetchLocation = () => {
//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         async (position) => {
//           const lat = position.coords.latitude;
//           const lon = position.coords.longitude;

//           setLocation({
//             latitude: lat,
//             longitude: lon,
//             address: "Fetching address...",
//           });

//           try {
//             const response = await fetch(
//               `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
//             );
//             const data = await response.json();

//             if (data.error) {
//               setError("Unable to fetch address.");
//             } else {
//               const address = data.display_name || "Unknown Location";
//               setLocation((prevLocation) => ({
//                 ...prevLocation,
//                 address,
//               }));

//               // Append the address to the description
//               setFormData((prevFormData) => ({
//                 ...prevFormData,
//                 description: `${prevFormData.description}\nLocation: ${address}`,
//               }));
//             }
//           } catch (err) {
//             setError("Error fetching address.");
//           }
//         },
//         (err) => {
//           setError(err.message);
//         }
//       );
//     } else {
//       setError("Geolocation is not supported by this browser.");
//     }
//   };

//   useEffect(() => {
//     fetchLocation();
//   }, []);

//   // Handle input change
//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value,
//     });
//   };

//   const convertToUTCFormat = (dateTime) => {
//     if (!dateTime) return "";
//     const date = new Date(dateTime);

//     return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}T${String(date.getUTCHours()).padStart(2, "0")}:${String(date.getUTCMinutes()).padStart(2, "0")}:${String(date.getUTCSeconds()).padStart(2, "0")}+00:00`;
//   };

//   // Handle form submit
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const eventData = {
//       data: [
//         {
//           Event_Title: formData.eventTitle,
//           Start_DateTime: convertToUTCFormat(formData.startDateTime),
//           All_day: formData.allDay,
//           End_DateTime: convertToUTCFormat(formData.endDateTime),
//           Description: formData.description,
//         },
//       ],
//     };

//     try {
//       const response = await axios.post(
//         `${process.env.REACT_APP_APP_API}/lead/checkin`,
//         eventData
//       );
//       if (response?.status === 200) {
//         toast.success("Event Created Successfully!");
//         setFormData({
//           eventTitle: "",
//           startDateTime: "",
//           allDay: false,
//           endDateTime: "",
//           description: "",
//         });
//       }
//     } catch (error) {
//       console.error("Error creating event:", error);
//       toast.error(error?.response?.data?.error?.data[0]?.message || "Something went wrong!");
//     }
//   };

//     return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100">
//       <div className="w-full max-w-lg p-6 bg-white shadow-lg rounded-lg">
//         <h2 className="text-2xl font-bold text-center mb-4">Create an Event</h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {/* Event Title */}
//           <div>
//             <label className="block text-gray-700 text-sm font-semibold mb-1">
//               Event Title
//             </label>
//             <input
//               type="text"
//               name="eventTitle"
//               value={formData.eventTitle}
//               onChange={handleChange}
//               required
//               className="w-full p-2 border border-gray-300 rounded-lg"
//               placeholder="Enter event title"
//             />
//           </div>

//           {/* Start Date & Time */}
//           <div>
//             <label className="block text-gray-700 text-sm font-semibold mb-1">
//               Start Date & Time
//             </label>
//             <input
//               type="datetime-local"
//               name="startDateTime"
//               value={formData.startDateTime}
//               onChange={handleChange}
//               required
//               className="w-full p-2 border border-gray-300 rounded-lg"
//             />
//           </div>

//           {/* End Date & Time */}
//           <div>
//             <label className="block text-gray-700 text-sm font-semibold mb-1">
//               End Date & Time
//             </label>
//             <input
//               type="datetime-local"
//               name="endDateTime"
//               value={formData.endDateTime}
//               onChange={handleChange}
//               required
//               className="w-full p-2 border border-gray-300 rounded-lg"
//             />
//           </div>

//           {/* All Day Event Checkbox */}
//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               name="allDay"
//               checked={formData.allDay}
//               onChange={handleChange}
//               className="w-5 h-5 mr-2"
//             />
//             <label className="text-gray-700 text-sm font-semibold">All Day Event</label>
//           </div>

//           {/* Description */}
//           <div>
//             <label className="block text-gray-700 text-sm font-semibold mb-1">
//               Description
//             </label>
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               required
//               className="w-full p-2 border border-gray-300 rounded-lg resize-none"
//               placeholder="Enter event description"
//             ></textarea>
//           </div>

//           {/* Submit Button */}
//           <button
//             type="submit"
//             className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
//           >
//             Submit
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EventForm;