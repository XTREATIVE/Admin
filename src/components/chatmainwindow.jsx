import React, { useState, useRef, useEffect } from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import {
  BiSmile,
  BiPaperclip,
  BiVideo,
  BiSend,
  BiDotsVerticalRounded,
  BiCheck,
  BiCheckDouble,
  BiX,
  BiUser
} from 'react-icons/bi';
import EmojiPicker from 'emoji-picker-react';
import ChatUserModal from '../modals/chatuser_modal';

const isEmojiOnly = (text) => {
  const emojiRegex = /^[\p{Emoji_Presentation}\p{Emoji}\uFE0F]+$/u;
  return emojiRegex.test(text.trim());
};

export default function ChatMainWindow({
  messages = [],
  setMessages,
  input,
  setInput,
  replyTo,
  setReplyTo,
  hoveredMessage,
  setHoveredMessage,
  menuOpenFor,
  setMenuOpenFor,
  handleSend,
  handleAttach,
  handleAttachVideo,
  handleAction,
  current = {},
  fileInputRef,
  videoInputRef,
}) {
  const menuRef = useRef(null);
  const smileBtnRef = useRef(null);
  const pickerRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showEmojiPicker &&
        pickerRef.current &&
        !pickerRef.current.contains(e.target) &&
        smileBtnRef.current &&
        !smileBtnRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showEmojiPicker]);

  const onEmojiClick = (emojiObject) => {
    setInput((prev) => prev + emojiObject.emoji);
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    });
  };

  const renderReplyPreview = () => {
    if (!replyTo) return null;
    const { from, text, images, attachments } = replyTo;
    let preview;
    if (text) {
      preview = <span className="break-all whitespace-pre-wrap text-[12px]">{text}</span>;
    } else if (images) {
      preview = <img src={images[0]} className="w-8 h-8 object-cover rounded" alt="" />;
    } else if (attachments) {
      preview = <span className="break-all whitespace-pre-wrap text-[12px]">{attachments[0].name}</span>;
    } else {
      preview = <span>Media</span>;
    }
    return (
      <div className="border-l-4 border-[#f9622c] bg-[#f0f0f0] p-2 mb-2 rounded-lg flex items-center">
        <div className="flex-1">
          <div className="font-semibold text-[10px] text-[#333]">
            Replying to {from === 'me' ? 'You' : (current.name || 'Unknown')}
          </div>
          <div className="mt-1 text-gray-600">{preview}</div>
        </div>
        <BiX className="cursor-pointer text-gray-500 ml-2" onClick={() => setReplyTo(null)} />
      </div>
    );
  };

  const initials = current.name
    ? current.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    : '';
  const displayName = current.name || '';

  return (
    <>
      <main className="flex-1 flex flex-col bg-gray-50 relative">
        {/* Header */}
        <div className="px-6 py-4 bg-white flex items-center justify-between border-b">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-400 text-white font-semibold text-[11px]">
              {initials}
            </div>
            <div className="ml-3">
              <h3 className="font-medium text-[12px]">{displayName}</h3>
              {current.typing && <span className="text-green-500 text-[11px] italic">typing...</span>}
            </div>
          </div>
          <div className="flex space-x-4 text-gray-600">
            <BiUser
              className="text-2xl cursor-pointer"
              onClick={() => setShowUserModal(true)}
            />
            <BiDotsVerticalRounded className="text-2xl cursor-pointer" />
          </div>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-[12px] thin-scrollbar">
          {messages.map((m) => {
            const isSent = m.from === 'me';
            const onlyEmoji = m.text && isEmojiOnly(m.text);

            // Deleted message
            if (m.deleted) {
              return (
                <div
                  key={m.id}
                  className={`relative flex flex-col ${isSent ? 'items-end' : 'items-start'}`}
                >
                  <div className="relative p-3 max-w-xs rounded-xl bg-gray-100 text-gray-500 italic text-[11px]">
                    🚫 You deleted this message
                  </div>
                  <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                    <span>{m.time}</span>
                    {isSent && (m.read ? <BiCheckDouble /> : <BiCheck />)}
                  </div>
                </div>
              );
            }

            const original = m.replyTo && messages.find(x => x.id === m.replyTo);

            return (
              <div
                key={m.id}
                className={`relative flex flex-col ${isSent ? 'items-end' : 'items-start'}`}
                onMouseEnter={() => setHoveredMessage(m.id)}
                onMouseLeave={() => setHoveredMessage(null)}
              >
                {original && (
                  <div className="border-l-4 border-[#f9622c] bg-[#f0f0f0] p-2 mb-1 rounded-lg max-w-xs">
                    <div className="font-semibold text-[10px] text-[#333] mb-1">
                      {original.from === 'me' ? 'You' : (current.name || 'Unknown')}
                    </div>
                    <div className="text-[10px] truncate">
                      {original.text || original.attachments?.[0]?.name || 'Media'}
                    </div>
                  </div>
                )}

                {m.text && (
                  <div
                    className={`relative p-3 max-w-xs rounded-xl break-words whitespace-pre-wrap ${
                      isSent ? 'bg-[#f9622c] text-white' : 'bg-white text-gray-800'
                    } ${onlyEmoji ? 'text-3xl leading-snug' : ''}`}
                  >
                    {m.text}
                  </div>
                )}

                {m.images && (
                  <div className="mt-2 flex space-x-2">
                    {m.images.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        className="w-32 h-24 object-cover rounded-md shadow-sm border"
                        alt=""
                      />
                    ))}
                  </div>
                )}

                {m.attachments && (
                  <div className="mt-2 flex flex-col space-y-2 max-w-xs">
                    {m.attachments.map((att, i) => {
                      const ext = att.name.split('.').pop().toLowerCase();
                      const icon = ext === 'pdf'
                        ? '📄'
                        : ['jpg','jpeg','png','gif'].includes(ext)
                          ? '🖼️'
                          : '📁';
                      return (
                        <div
                          key={i}
                          className="flex items-center bg-gray-100 rounded-lg p-2 shadow-sm space-x-3"
                        >
                          <div className="text-3xl">{icon}</div>
                          <div className="flex-1">
                            <div className="text-[12px] font-medium break-all">
                              {att.name}
                            </div>
                            <div className="flex space-x-2 mt-1">
                              <a
                                href={att.data}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 text-[11px] underline"
                              >
                                Open
                              </a>
                              <a
                                href={att.data}
                                download={att.name}
                                className="text-blue-600 text-[11px] underline"
                              >
                                Save As
                              </a>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {m.video && (
                  <video
                    src={m.video}
                    controls
                    className="w-48 rounded-xl mt-2 shadow-md"
                  />
                )}

                {hoveredMessage === m.id && (
                  <div
                    className={`absolute ${
                      isSent ? 'top-0 right-0' : 'top-0 left-0'
                    } mt-[-6px] mx-1 text-gray-500 cursor-pointer`}
                    onClick={() =>
                      setMenuOpenFor(menuOpenFor === m.id ? null : m.id)
                    }
                  >
                    <BiDotsVerticalRounded />
                  </div>
                )}

                {menuOpenFor === m.id && (
                  <div
                    ref={menuRef}
                    className={`absolute z-20 bg-white rounded-md shadow-lg text-[10px] ${
                      isSent ? 'right-0' : 'left-0'
                    } mt-5`}
                    onMouseLeave={() => setMenuOpenFor(null)}
                  >
                    <ul className="divide-y">
                      {['Reply', 'Copy', 'Delete'].map(a => (
                        <li
                          key={a}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            if (a === 'Copy') {
                              handleCopy(m.text || '');
                            } else {
                              handleAction(a, m);
                            }
                          }}
                        >
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
                  <span>{m.time}</span>
                  {isSent && (m.read ? <BiCheckDouble /> : <BiCheck />)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="px-6 py-4 bg-white border-t relative">
          {renderReplyPreview()}
          <div className="flex items-center space-x-4">
            <BiSmile
              ref={smileBtnRef}
              className="text-2xl text-gray-500 cursor-pointer"
              onClick={() => setShowEmojiPicker(v => !v)}
            />
            <TextareaAutosize
              minRows={1}
              maxRows={4}
              placeholder="Enter your message"
              className="flex-1 border rounded-full px-4 py-2 focus:outline-none text-[12px] resize-none overflow-hidden"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            {showEmojiPicker && (
              <div
                ref={pickerRef}
                className="absolute bottom-16 left-16 z-30 bg-white p-2 rounded-lg shadow-lg"
              >
                <EmojiPicker onEmojiClick={onEmojiClick} />
              </div>
            )}
            <BiPaperclip
              className="text-2xl text-gray-500 cursor-pointer"
              onClick={() => fileInputRef.current.click()}
            />
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              onChange={handleAttach}
            />
            <BiVideo
              className="text-2xl text-gray-500 cursor-pointer"
              onClick={() => videoInputRef.current.click()}
            />
            <input
              type="file"
              ref={videoInputRef}
              className="hidden"
              accept="video/*"
              onChange={handleAttachVideo}
            />
            <button
              onClick={handleSend}
              className="bg-[#f9622c] p-3 rounded-full text-white"
            >
              <BiSend />
            </button>
          </div>
        </div>

        {/* Toast Notification */}
        {showToast && (
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 bg-[#280300] bg-opacity-50 text-white text-xs px-4 py-2 rounded-full shadow-lg z-50">
            Message copied
          </div>
        )}
      </main>

      {/* Chat User Modal */}
      {showUserModal && (
        <ChatUserModal
          user={current}
          onClose={() => setShowUserModal(false)}
        />
      )}
    </>
  );
}
