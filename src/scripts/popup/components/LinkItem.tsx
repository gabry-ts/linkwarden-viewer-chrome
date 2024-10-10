import { LinkIcon, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

export const LinkItem = ({ link, refreshData, isDarkMode }) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleDelete = () => {
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    chrome.runtime.sendMessage(
      { action: 'deleteLink', id: link.id },
      (response) => {
        if (response.success) {
          refreshData();
        } else {
          alert('Error deleting link. Please try again.');
        }
      },
    );
    setShowConfirmDelete(false);
  };

  const cancelDelete = () => {
    setShowConfirmDelete(false);
  };
  return (
    <div
      className={`flex flex-col p-2 rounded-md mb-2 relative group ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <div className="flex items-center">
        <LinkIcon size={16} className="mr-2 text-blue-500 flex-shrink-0" />
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`hover:underline flex-grow truncate ${
            isDarkMode ? 'text-blue-400' : 'text-blue-600'
          }`}
        >
          {link.name}
        </a>
        <button
          onClick={handleDelete}
          className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-2"
          title="Delete link"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span className="truncate max-w-[60%]">{link.url}</span>
        {link.tags && link.tags.length > 0 && (
          <span className="truncate max-w-[40%] text-right">
            {link.tags.map((tag) => tag.name).join(', ')}
          </span>
        )}
      </div>
      {showConfirmDelete && (
        <div
          className={`absolute inset-0 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } bg-opacity-90 flex items-center justify-center`}
        >
          <div className="text-center">
            <p className="mb-2">Are you sure you want to delete this link?</p>
            <button
              onClick={confirmDelete}
              className="px-3 py-1 bg-red-500 text-white rounded-md mr-2 hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={cancelDelete}
              className={`px-3 py-1 rounded-md ${
                isDarkMode
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
