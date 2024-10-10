import { FolderOpen, Folder, ChevronRight } from 'lucide-react'
import React, { useEffect } from 'react'
import { LinkItem } from './LinkItem'

export const FolderItem = ({
  folder,
  refreshData,
  openFolders,
  toggleFolder,
  links,
  subFolders,
  renderFolder,
  isDarkMode,
  loadLinksForFolder,
}) => {
  const isOpen = openFolders.has(folder.id)
  const sortedLinks = [...links].sort((a, b) => a.name.localeCompare(b.name))

  useEffect(() => {
    if (isOpen && links.length === 0) {
      loadLinksForFolder(folder.id)
    }
  }, [isOpen, folder.id, links.length, loadLinksForFolder])

  return (
    <div className="mb-2">
      <div
        className={`flex items-center p-2 rounded-md cursor-pointer ${
          isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-100'
        }`}
        onClick={() => toggleFolder(folder.id)}
      >
        {isOpen ? (
          <FolderOpen size={20} className="mr-2 text-blue-500" />
        ) : (
          <Folder size={20} className="mr-2 text-blue-500" />
        )}
        <span className="flex-grow">{folder.name}</span>
        <ChevronRight
          size={20}
          className={`text-gray-400 transform transition-transform ${isOpen ? 'rotate-90' : ''}`}
        />
      </div>
      {isOpen && (
        <div className="ml-6 mt-2">
          {subFolders.map(renderFolder)}
          {sortedLinks.map((link) => (
            <LinkItem
              key={link.id}
              link={link}
              refreshData={() => loadLinksForFolder(folder.id)}
              isDarkMode={isDarkMode}
            />
          ))}
        </div>
      )}
    </div>
  )
}
