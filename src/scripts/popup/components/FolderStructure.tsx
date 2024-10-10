import React from 'react'
import { FolderItem } from './FolderItem'

export const FolderStructure = ({
  folders,
  refreshData,
  openFolders,
  toggleFolder,
  linksByFolder,
  isDarkMode,
  loadLinksForFolder,
}) => {
  const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name))
  const rootFolders = sortedFolders.filter((folder) => !folder.parentId)

  const renderFolder = (folder) => (
    <FolderItem
      key={folder.id}
      folder={folder}
      openFolders={openFolders}
      toggleFolder={toggleFolder}
      links={linksByFolder[folder.id] || []}
      subFolders={sortedFolders.filter((f) => f.parentId === folder.id)}
      renderFolder={renderFolder}
      refreshData={refreshData}
      isDarkMode={isDarkMode}
      loadLinksForFolder={loadLinksForFolder}
    />
  )

  return <div>{rootFolders.map(renderFolder)}</div>
}
