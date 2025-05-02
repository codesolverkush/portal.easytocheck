import { useState } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';


const CheckInModal  = ({ location, onClose,id,module,username,onNoteAdded}) => {
  const [noteContent, setNoteContent] = useState(() => {
    return location ? `lat: ${location.latitude}, long: ${location.longitude}` : "";
  });
    const [isSubmitting, setIsSubmitting] = useState(false);

  const loc = `lat: ${location?.latitude}, long: ${location?.longitude}`

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const noteTitle = `${username} checked in via portal`;
      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/related/createnote/${module}/${id}`,
        {
          Note_Title: noteTitle,
          Note_Content: noteContent,
        }
      );

      // Adding the note to the list currently

      if (response?.status === 200) {
        const newNote = {
          id:
            response?.data?.data?.data[0]?.details.id || Date.now().toString(),
          Created_Time: new Date().toISOString(),
          Note_Title: noteTitle,
          Note_Content: noteContent,
        };

        onNoteAdded(newNote);
      }

      // Reset form and close modal
      setNoteContent("");
      onClose();
    } catch (error) {
      console.error("Error adding note:", error);
      // Optionally show error toast
    } finally {
      setIsSubmitting(false);
    }
  };

  // if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Add a Note</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label
              htmlFor="noteTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Note Title
            </label>
            <input
              id="noteTitle"
              type="text"
              value={`${username} Checked in via portal`}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="noteContent"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Current Location
            </label>
            <input
              id="noteContent"
              value={noteContent}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? "CheckIn..." : "Check In"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckInModal;