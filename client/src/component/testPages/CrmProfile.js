import React, { useEffect, useState } from 'react';

const CrmProfile = () => {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch profiles on mount
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        // Replace with actual API call
        const response = await fetch(`${process.env.REACT_APP_APP_API}/crm/profile`);
        const result = await response.json();
        setProfiles(result.data.profiles);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  // Handle Clone action
  const handleClone = async (profileId) => {
    const confirmClone = window.confirm("Are you sure you want to clone this profile?");
    if (!confirmClone) return;

    try {
      // Replace with actual clone API
      const res = await fetch(`${process.env.REACT_APP_APP_API}/crm/clone-profile/${profileId}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        alert('Profile cloned successfully!');
      } else {
        alert('Failed to clone profile.');
      }
    } catch (error) {
      alert('Error cloning profile.');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">CRM Profiles</h1>
      {loading ? (
        <p className="text-gray-500">Loading profiles...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="bg-white shadow-md rounded-2xl p-4 border border-gray-200 hover:shadow-lg transition"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">{profile.display_label}</h2>
                <div className="relative">
                  <select
                    className="text-sm px-2 py-1 border border-gray-300 rounded-md"
                    onChange={(e) => {
                      if (e.target.value === 'clone') {
                        handleClone(profile.id);
                        e.target.selectedIndex = 0; // Reset to default
                      }
                    }}
                  >
                    <option value="">Actions</option>
                    <option value="clone">Clone</option>
                  </select>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                {profile.description || 'No description provided.'}
              </p>
              <p className="text-xs text-gray-400">
                Type: {profile.custom ? 'Custom' : 'System'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CrmProfile;
