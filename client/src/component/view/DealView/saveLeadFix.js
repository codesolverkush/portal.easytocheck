// Function to save edited lead data
const saveLead = async () => {
  setIsSaving(true);
  try {
    const response = await axios.put(
      `${process.env.REACT_APP_APP_API}/deal/updatedeal`,
      {
        id: selectedContact?.data[0]?.id,
        ...editedContact,
      }
    );

    if (response.data.success) {
      // Create a deep copy of the selectedContact to avoid reference issues
      const updatedContact = JSON.parse(JSON.stringify(selectedContact));
      
      // Update the data array with the edited values
      if (updatedContact.data && updatedContact.data.length > 0) {
        updatedContact.data[0] = {
          ...updatedContact.data[0],
          ...editedContact
        };
      }
      
      setSelectedContact(updatedContact);

      // Exit edit mode
      setIsEditing(false);

      toast.success("Lead updated successfully!");
    } else {
      toast.error("Failed to update lead. Please try again.");
    }
  } catch (error) {
    console.error("Error updating lead:", error);
    toast.error(
      error?.response?.data?.error?.data[0]?.message || "Something went wrong"
    );
  } finally {
    setIsSaving(false);
  }
}; 