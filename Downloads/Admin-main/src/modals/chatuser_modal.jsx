import React from 'react';
import { BiX, BiMailSend } from 'react-icons/bi';
import Sweater from "../assets/sweater.jpg";
import Bag from "../assets/Bag.jpg";

/**
 * ChatUserModal displays user profile details in a compact slide-in panel.
 * Includes email field and a Send Email action.
 * Uses defaultProps for demo data if no user prop is provided.
 */
export default function ChatUserModal({
  user = ChatUserModal.defaultProps.user,
  onClose = ChatUserModal.defaultProps.onClose
}) {
  const data = user;
  const initials = data.name
    ? data.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    : '';

  const handleSendEmail = () => {
    window.location.href = `mailto:${data.email}`;
  };

  return (
    <div className="fixed inset-0 z-30 flex items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-30"
        onClick={onClose}
      />

      {/* Side Modal Panel */}
      <div className="relative ml-auto w-64 bg-white h-3/4 shadow-lg overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b">
          <h2 className="text-xs font-semibold">Profile</h2>
          <BiX className="cursor-pointer text-lg" onClick={onClose} />
        </div>

        {/* Content */}
        <div className="p-3 space-y-4 text-sm">
          {/* User Info */}
          <div className="flex items-center space-x-2">
            {data.avatar ? (
              <img
                src={data.avatar}
                alt={data.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-semibold text-xs">
                {initials}
              </div>
            )}
            <div>
              <h3 className="text-sm font-semibold">{data.name}</h3>
              {data.clientType && (
                <p className="text-[10px] text-gray-500">{data.clientType}</p>
              )}
              {data.lastInteraction && (
                <p className="text-[10px] text-gray-500">Last: {data.lastInteraction}</p>
              )}
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-2">
            <div>
              <h4 className="text-[10px] font-semibold text-gray-700">Email:</h4>
              <p className="text-[11px] text-gray-900">{data.email}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-semibold text-gray-700">Phone:</h4>
              <p className="text-[11px] text-gray-900">{data.phone}</p>
            </div>
            <div>
              <h4 className="text-[10px] font-semibold text-gray-700">Location:</h4>
              <p className="text-[11px] text-gray-900">{data.location}</p>
            </div>
          </div>

          {/* Shared Media */}
          {data.sharedMedia && data.sharedMedia.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold text-gray-700">Shared Media:</h4>
              <div className="mt-1 flex space-x-1 overflow-x-auto">
                {data.sharedMedia.map((media, i) =>
                  media.type.startsWith('image') ? (
                    <img
                      key={i}
                      src={media.url}
                      className="w-12 h-12 object-cover rounded"
                      alt="shared"
                    />
                  ) : (
                    <a
                      key={i}
                      href={media.url}
                      download
                      className="text-xs underline text-blue-600"
                    >
                      {media.name || 'File'}
                    </a>
                  )
                )}
              </div>
            </div>
          )}

          {/* Send Email Button */}
          <button
            onClick={handleSendEmail}
            className="w-full flex items-center justify-center p-2 border rounded-md hover:bg-gray-100 text-[12px] space-x-1"
          >
            <BiMailSend className="text-lg" />
            <span>Send Email</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Default props with dummy data
ChatUserModal.defaultProps = {
  user: {
    name: 'Gilbert Smith',
    clientType: 'Vendor',
    lastInteraction: '2025-05-04',
    email: 'gilbert.smith@example.com',
    avatar: Sweater,
    phone: '+256 774788071',
    location: 'California, USA',
    sharedMedia: [
      { type: 'image/jpg', url: Bag },
      { type: 'image/jpg', url: Sweater }
    ]
  },
  onClose: () => {}
};
