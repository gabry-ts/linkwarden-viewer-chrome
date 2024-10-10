import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Settings,
  Plus,
  ChevronRight,
  FolderOpen,
  Folder,
  Link as LinkIcon,
  Trash2,
  Moon,
  Sun,
} from 'lucide-react'
import { AddLinkModal } from './components/AddLinkModal'
import { FolderStructure } from './components/FolderStructure'
import { SearchResults } from './components/SearchResults'

// Hook personalizzato per la modalità dark
const useDarkMode = () => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode')
    return savedMode ? JSON.parse(savedMode) : false
  })

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode))
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  return [isDarkMode, setIsDarkMode]
}

const Popup = () => {
  const [folders, setFolders] = useState([])
  const [linksByFolder, setLinksByFolder] = useState({})
  const [openFolders, setOpenFolders] = useState(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false)
  const [newLink, setNewLink] = useState({ url: '', name: '', collectionId: '', tagIds: [] })
  const [allTags, setAllTags] = useState([])
  const [currentUrl, setCurrentUrl] = useState('')
  const [isDarkMode, setIsDarkMode] = useDarkMode()

  useEffect(() => {
    console.log('Popup Loaded')
    refreshData()
    loadOpenFolders()
    checkOptions()
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        setCurrentUrl(tabs[0].url)
      }
    })
  }, [])

  const openAddLinkModal = useCallback(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url) {
        chrome.runtime.sendMessage({ action: 'getFolders' }, (foldersResponse) => {
          if (foldersResponse) {
            const uncategorized = foldersResponse.find((folder) => folder.name === 'Unorganized')
            setNewLink({
              url: tabs[0].url,
              name: tabs[0].title || '',
              collectionId: uncategorized ? uncategorized.id : '',
              tagIds: [],
            })
          }
        })
      }
    })
    chrome.runtime.sendMessage({ action: 'getTags' }, (response) => {
      setAllTags(response)
    })
    setIsAddLinkModalOpen(true)
  }, [])

  const loadOpenFolders = () => {
    chrome.storage.local.get('openFolders', (result) => {
      if (result.openFolders) {
        setOpenFolders(new Set(result.openFolders))
        result.openFolders.forEach((folderId) => {
          loadLinksForFolder(folderId)
        })
      }
    })
  }

  const saveOpenFolders = useCallback((newOpenFolders) => {
    chrome.storage.local.set({ openFolders: Array.from(newOpenFolders) })
  }, [])

  const checkOptions = () => {
    chrome.runtime.sendMessage({ action: 'checkOptions' }, (optionsSet) => {
      if (optionsSet) {
        refreshData()
      }
    })
  }

  const refreshData = () => {
    chrome.runtime.sendMessage({ action: 'getFolders' }, (response) => {
      if (response) {
        setFolders(response)
      }
    })
  }

  const toggleFolder = (folderId: string) => {
    setOpenFolders((prevOpenFolders) => {
      const newOpenFolders = new Set(prevOpenFolders)
      if (newOpenFolders.has(folderId)) {
        newOpenFolders.delete(folderId)
      } else {
        newOpenFolders.add(folderId)
        loadLinksForFolder(folderId)
      }
      saveOpenFolders(newOpenFolders)
      return newOpenFolders
    })
  }

  const loadLinksForFolder = (folderId: string) => {
    chrome.runtime.sendMessage({ action: 'getLinks', collectionId: folderId }, (response) => {
      if (response) {
        setLinksByFolder((prev) => ({
          ...prev,
          [folderId]: response,
        }))
      }
    })
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredLinks = Object.values(linksByFolder)
    .flat()
    .filter(
      (link: { name: string; url: string; tags?: { name: string }[] }) =>
        link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (link.tags &&
          link.tags.some((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))),
    )

  const closeAddLinkModal = () => {
    setIsAddLinkModalOpen(false)
  }

  const handleNewLinkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewLink({ ...newLink, [e.target.name]: e.target.value })
  }

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTags = Array.from(e.target.selectedOptions, (option) => option.value)
    setNewLink({ ...newLink, tagIds: selectedTags })
  }

  const saveNewLink = (e: React.FormEvent) => {
    e.preventDefault()
    chrome.runtime.sendMessage({ action: 'saveLink', link: newLink }, (response) => {
      if (response.success) {
        closeAddLinkModal()
        refreshData()
        loadLinksForFolder(newLink.collectionId)
      } else {
        alert('Error saving link. Please try again.')
      }
    })
  }

  const openSettings = () => {
    chrome.runtime.openOptionsPage()
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  return (
    <div className={`w-96 p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
      <div className="flex items-center mb-4">
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search links..."
            value={searchQuery}
            onChange={handleSearch}
            className={`w-full pl-10 pr-4 py-2 rounded-md border ${
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-white'
                : 'bg-white border-gray-300 text-black'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
        </div>
        <button
          onClick={openAddLinkModal}
          className={`ml-2 p-2 rounded-md ${
            isDarkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'
          } text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
        >
          <Plus size={20} />
        </button>
        <button
          onClick={openSettings}
          className={`ml-2 p-2 rounded-md ${
            isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-gray-500`}
        >
          <Settings size={20} className={isDarkMode ? 'text-white' : 'text-gray-700'} />
        </button>
        <button
          onClick={toggleDarkMode}
          className={`ml-2 p-2 rounded-md ${
            isDarkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-gray-500`}
        >
          {isDarkMode ? (
            <Sun size={20} className="text-white" />
          ) : (
            <Moon size={20} className="text-gray-700" />
          )}
        </button>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {searchQuery ? (
          <SearchResults links={filteredLinks} refreshData={refreshData} isDarkMode={isDarkMode} />
        ) : (
          <FolderStructure
            folders={folders}
            openFolders={openFolders}
            toggleFolder={toggleFolder}
            linksByFolder={linksByFolder}
            refreshData={refreshData}
            isDarkMode={isDarkMode}
            loadLinksForFolder={loadLinksForFolder}
          />
        )}
      </div>
      {isAddLinkModalOpen && (
        <AddLinkModal
          newLink={newLink}
          allTags={allTags}
          folders={folders}
          handleNewLinkChange={handleNewLinkChange}
          handleTagChange={handleTagChange}
          saveNewLink={saveNewLink}
          closeAddLinkModal={closeAddLinkModal}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  )
}

export default Popup
