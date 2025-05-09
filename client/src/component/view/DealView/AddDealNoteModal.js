import axios from 'axios';
import { X } from 'lucide-react';
import { useState } from 'react';
import { bgColors, focus, hoverColors } from '../../../config/colors';

const AddDealNoteModal = ({ isOpen, onClose, dealId, username, onNoteAdded }) => {


    const [noteContent, setNoteContent] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
  
      try {
        const noteTitle = `Added by ${username}`;
        const response = await axios.post(`${process.env.REACT_APP_APP_API}/related/createnote/Deals/${dealId}`, {
          Note_Title: noteTitle,
          Note_Content: noteContent
        });
          
        // Adding the note to the list currently
  
        if (response?.status === 200) {
          const newNote = {
            id: response?.data?.data?.data[0]?.details.id,
            Created_Time: new Date().toISOString(),
            Note_Title: noteTitle,
            Note_Content: noteContent
          }
          
          onNoteAdded(newNote);
        }
  
        // Reset form and close modal
        setNoteContent('');
        onClose();
      } catch (error) {
        console.error('Error adding note:', error);
        // Optionally show error toast
      } finally {
        setIsSubmitting(false);
      }
    };
  
    if (!isOpen) return null;
  
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
              <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-700 mb-1">
                Note Title
              </label>
              <input
                id="noteTitle"
                type="text"
                value={`Added by ${username}`}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="noteContent" className="block text-sm font-medium text-gray-700 mb-1">
                Note Content
              </label>
              <textarea
                id="noteContent"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Enter note details"
                rows="4"
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
                className={`px-4 py-2 text-sm font-medium text-white ${bgColors.primary} rounded-md ${hoverColors.primary} focus:outline-none focus:ring-2 ${focus.ring} focus:ring-offset-2`}
              >
                {isSubmitting ? 'Adding...' : 'Add Note'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  export default AddDealNoteModal;