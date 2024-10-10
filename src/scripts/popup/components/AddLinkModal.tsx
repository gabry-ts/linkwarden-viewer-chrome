import React from 'react'

export const AddLinkModal = ({
  newLink,
  allTags,
  folders,
  handleNewLinkChange,
  handleTagChange,
  saveNewLink,
  closeAddLinkModal,
  isDarkMode,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-1">
    <div
      className={`rounded-lg w-full max-w-md ${
        isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'
      }`}
    >
      <form onSubmit={saveNewLink} className="p-1">
        <div className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-xs font-medium mb-1">
              URL
            </label>
            <input
              type="url"
              id="url"
              name="url"
              value={newLink.url}
              onChange={handleNewLinkChange}
              required
              className={`w-full px-1 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-black'
              }`}
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={newLink.name}
              onChange={handleNewLinkChange}
              className={`w-full px-1 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-black'
              }`}
              placeholder="Link Title"
            />
          </div>
          <div>
            <label htmlFor="collectionId" className="block text-xs font-medium mb-1">
              Folder
            </label>
            <select
              id="collectionId"
              name="collectionId"
              value={newLink.collectionId}
              onChange={handleNewLinkChange}
              required
              className={`w-full px-1 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-black'
              }`}
            >
              <option value="">Select a folder</option>
              {folders
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    {folder.parent ? folder.parent.name + ' / ' + folder.name : folder.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label htmlFor="tagIds" className="block text-xs font-medium mb-1">
              Tags
            </label>
            <select
              id="tagIds"
              name="tagIds"
              multiple
              value={newLink.tagIds}
              onChange={handleTagChange}
              className={`w-full px-1 py-1 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-white'
                  : 'bg-white border-gray-300 text-black'
              }`}
            >
              {allTags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-1 flex justify-end space-x-3">
          <button
            type="button"
            onClick={closeAddLinkModal}
            className={`px-1 py-1 border rounded-md text-sm font-medium ${
              isDarkMode
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-1 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
)
