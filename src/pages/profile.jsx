// src/pages/Profile.jsx
import React, { useState } from 'react';
import { User } from 'lucide-react';

const Profile = () => {
  const [editing, setEditing] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [profileData, setProfileData] = useState({
    name: 'Ahereza Vivian',
    role: 'Administrator',
    joined: 'January 2024',
    phone: '+256 700 000 000',
    email: 'creatives@xtreative.com',
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    if (window.confirm("Are you sure you want to remove your profile picture?")) {
      setProfilePic(null);
    }
  };

  const handleChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    setEditing(false);
    // Optional: Save to backend or localStorage
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        {!editing ? (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">My Profile</h1>
            <div className="flex flex-col items-center relative mb-4">
              {profilePic ? (
                <div className="relative">
                  <img
                    src={profilePic}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-orange-500 object-cover"
                  />
                  <button
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center hover:bg-red-600"
                    title="Remove photo"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-orange-500 flex items-center justify-center bg-orange-50">
                    <User className="text-orange-500 w-10 h-10" />
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-2 text-sm text-gray-600"
              />
              <p className="text-gray-700 font-semibold mt-4">Name:</p>
              <p className="text-gray-500 text-sm mb-4">{profileData.name}</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium text-gray-800">{profileData.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Joined:</span>
                <span className="font-medium text-gray-800">{profileData.joined}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium text-gray-800">{profileData.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-800">{profileData.email}</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => setEditing(true)}
                className="bg-orange-500 text-white px-6 py-2 rounded hover:bg-orange-600"
              >
                Edit Profile
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Edit Profile</h1>
            <div className="space-y-4">
              <input
                type="text"
                name="name"
                value={profileData.name}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Name"
              />
              <input
                type="text"
                name="phone"
                value={profileData.phone}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Phone"
              />
              <input
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="Email"
              />
              <div className="flex justify-between mt-6">
                <button
                  onClick={handleSave}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
