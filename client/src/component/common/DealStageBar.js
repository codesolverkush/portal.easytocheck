import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { X, Clipboard } from "lucide-react";

// AddNoteModal component for adding notes
const AddNoteModal = ({ isOpen, onClose, dealId, username, onNoteAdded }) => {
  const [noteContent, setNoteContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const noteTitle = `Added by ${username}`;
      const response = await axios.post(
        `${process.env.REACT_APP_APP_API}/related/createnote/Deals/${dealId}`,
        {
          Note_Title: noteTitle,
          Note_Content: noteContent,
        }
      );

      if (response?.status === 200) {
        const newNote = {
          id: response?.data?.data?.data[0]?.details.id,
          Created_Time: new Date().toISOString(),
          Note_Title: noteTitle,
          Note_Content: noteContent,
        };
        onNoteAdded(newNote);
      }

      setNoteContent("");
      onClose();
    } catch (error) {
      toast.error("Failed to add note");
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
            <label
              htmlFor="noteTitle"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
            <label
              htmlFor="noteContent"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {isSubmitting ? "Adding..." : "Add Note"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add this new component to render the deal stages
const DealStageBar = ({
  fields,
  data,
  currentStage,
  onStageClick,
  accessScore,
  username,
}) => {
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);
  const [pendingStageChange, setPendingStageChange] = useState(null);

  // Find the Stage field from the fields array
  const stageField = fields.find((field) => field.api_name === "Stage");

  // Extract stage options from the picklist values if available
  const stageOptions = stageField?.pick_list_values || [];

  // Create stages array from the picklist values or use default stages
  const stages =
    stageOptions.length > 0
      ? stageOptions.map((option) => ({
          id: option.actual_value || option.display_value,
          label: option.display_value || option.actual_value,
        }))
      : [
          { id: "qualification", label: "Qualification" },
          { id: "valueProposition", label: "Value Proposition" },
          { id: "sampleDevelopment", label: "Sample Development" },
          { id: "proposalPriceQuote", label: "Proposal/Price Quote" },
          { id: "negotiationReview", label: "Negotiation/Review" },
          { id: "closedWon", label: "Closed Won" },
          { id: "closedLost", label: "Closed Lost" },
        ];

  // Function to determine if a stage is active
  const isStageActive = (stageId) => {
    return currentStage === stageId;
  };

  const changeStage = async (stageName) => {
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_APP_API}/deal/updatedeal`,
        {
          id: data?.data[0]?.id,
          Stage: stageName,
        }
      );

      // toast.success("Stage updated successfully");
      return true;
    } catch (error) {
      toast.error(
        error?.response?.data?.error?.data[0]?.message || "Something went wrong"
      );
      return false;
    }
  };

  // Function to get stage status (completed, active, upcoming)
  const getStageStatus = (index) => {
    const currentIndex = stages.findIndex((stage) => stage.id === currentStage);
    if (index < currentIndex) return "completed";
    if (index === currentIndex) return "active";
    return "upcoming";
  };

  // Function to handle stage click
  const handleStageClick = (stageId) => {
    if (accessScore >= 3) {
      // Find the stage object to get the label
      const clickedStage = stages.find((stage) => stage.id === stageId);
      if (clickedStage) {
        // Store the pending stage change
        setPendingStageChange(clickedStage);
        // Open the note modal
        setSelectedStage(clickedStage);
        setIsNoteModalOpen(true);
      }
    }
  };

  const handleNoteAdded = async (newNote) => {
    if (pendingStageChange) {
      // Only change the stage after the note is successfully added
      const success = await changeStage(pendingStageChange.label);
      if (success) {
        // Call the parent component's onStageClick only after successful stage change
        onStageClick(pendingStageChange.id);
      } else {
        // If stage change failed, show error
        toast.error("Failed to update stage");
      }
      // Clear the pending stage change
      setPendingStageChange(null);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="bg-white p-4 border-b border-gray-200">
      <div className="flex flex-col space-y-2">
        {/* Date information row */}
        <div className="flex justify-between text-xs text-gray-500 px-2">
          <div>
            START
            <div className="font-medium text-gray-700">
              {formatDate(data.data[0]?.Created_Time)}
            </div>
          </div>
          <div className="text-right">
            CLOSING
            <div className="flex items-center font-medium text-gray-700">
              <span className="mr-1">
                {formatDate(data.data[0]?.Closing_Date)}
              </span>
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
            </div>
          </div>
        </div>

        {/* Stage progression bar */}
        <div className="flex items-center">
          {stages.map((stage, index) => (
            <div
              key={stage.id}
              className="flex-1 relative group"
              onClick={() => handleStageClick(stage.id)}
            >
              {/* Connecting line */}
              {index < stages.length - 1 && (
                <div
                  className={`absolute top-1/2 right-0 w-full h-0.5 ${
                    getStageStatus(index) === "completed"
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  }`}
                ></div>
              )}

              {/* Button part */}
              <div
                className={`flex flex-col items-center cursor-pointer ${
                  accessScore < 3 ? "opacity-80" : ""
                }`}
              >
                {/* Icon/Number part */}
                <div
                  className={`z-10 w-8 h-8 rounded-md flex items-center justify-center mb-1
                  ${
                    isStageActive(stage.id)
                      ? "bg-blue-500 text-white"
                      : getStageStatus(index) === "completed"
                      ? "bg-blue-100 text-blue-500 border border-blue-500"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {getStageStatus(index) === "completed" ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>

                {/* Label part - hidden on smaller screens */}
                <span
                  className={`text-xs font-medium whitespace-nowrap hidden sm:block
                  ${
                    isStageActive(stage.id) ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {stage.label}
                </span>

                {/* Tooltip for mobile screens */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none sm:hidden whitespace-nowrap z-20">
                  {stage.label}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-800"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={isNoteModalOpen}
        onClose={() => setIsNoteModalOpen(false)}
        dealId={data?.data[0]?.id}
        username={username}
        onNoteAdded={handleNoteAdded}
      />
    </div>
  );
};

export default DealStageBar;
