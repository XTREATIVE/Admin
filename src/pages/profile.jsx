// src/pages/Profile.jsx
import React from 'react';

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-800">My Profile</h1>
        
        <div className="flex flex-col items-center">
          <img 
            src="https://via.placeholder.com/100" 
            alt="Profile" 
            className="w-24 h-24 rounded-full mb-4"
          />
          <p className="text-gray-700 font-semibold">Name:</p>
          <p className="text-gray-500 text-sm mb-6">Ahereza Vivian</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-600">Role:</span>
            <span className="font-medium text-gray-800">Administrator</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Joined:</span>
            <span className="font-medium text-gray-800">January 2024</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium text-gray-800">+256 700 000 000</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
