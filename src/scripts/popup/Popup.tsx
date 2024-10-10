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
    Sun
} from 'lucide-react'

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
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            if (tabs[0] && tabs[0].url) {
                setCurrentUrl(tabs[0].url)
            }
        })
    }, [])

    const openAddLinkModal = useCallback(() => {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            if (tabs[0] && tabs[0].url) {
                chrome.runtime.sendMessage({ action: 'getFolders' }, foldersResponse => {
                    if (foldersResponse) {
                        const uncategorized = foldersResponse.find(
                            folder => folder.name === 'Unorganized'
                        )
                        setNewLink({
                            url: tabs[0].url,
                            name: tabs[0].title || '',
                            collectionId: uncategorized ? uncategorized.id : '',
                            tagIds: []
                        })
                    }
                })
            }
        })
        chrome.runtime.sendMessage({ action: 'getTags' }, response => {
            setAllTags(response)
        })
        setIsAddLinkModalOpen(true)
    }, [])

    const loadOpenFolders = () => {
        chrome.storage.local.get('openFolders', result => {
            if (result.openFolders) {
                setOpenFolders(new Set(result.openFolders))
            }
        })
    }

    const saveOpenFolders = useCallback(() => {
        chrome.storage.local.set({ openFolders: Array.from(openFolders) })
    }, [openFolders])

    const checkOptions = () => {
        chrome.runtime.sendMessage({ action: 'checkOptions' }, optionsSet => {
            if (optionsSet) {
                refreshData()
            }
        })
    }

    const refreshData = () => {
        chrome.runtime.sendMessage({ action: 'getFolders' }, response => {
            if (response) {
                setFolders(response)
            }
        })
    }

    const toggleFolder = (folderId: string) => {
        setOpenFolders(prevOpenFolders => {
            const newOpenFolders = new Set(prevOpenFolders)
            if (newOpenFolders.has(folderId)) {
                newOpenFolders.delete(folderId)
            } else {
                newOpenFolders.add(folderId)
                loadLinksForFolder(folderId)
            }
            return newOpenFolders
        })
    }

    const loadLinksForFolder = (folderId: string) => {
        chrome.runtime.sendMessage({ action: 'getLinks', collectionId: folderId }, response => {
            if (response) {
                setLinksByFolder(prev => ({
                    ...prev,
                    [folderId]: response
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
            (link: { name: string; url: string; tags: { name: string }[] }) =>
                link.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                link.url.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (link.tags &&
                    link.tags.some(tag =>
                        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ))
        )

    const closeAddLinkModal = () => {
        setIsAddLinkModalOpen(false)
    }

    const handleNewLinkChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setNewLink({ ...newLink, [e.target.name]: e.target.value })
    }

    const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedTags = Array.from(e.target.selectedOptions, option => option.value)
        setNewLink({ ...newLink, tagIds: selectedTags })
    }

    const saveNewLink = (e: React.FormEvent) => {
        e.preventDefault()
        chrome.runtime.sendMessage({ action: 'saveLink', link: newLink }, response => {
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
        <div
            className={`w-96 p-4 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}
        >
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
                        isDarkMode
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-blue-500 hover:bg-blue-600'
                    } text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                    <Plus size={20} />
                </button>
                <button
                    onClick={openSettings}
                    className={`ml-2 p-2 rounded-md ${
                        isDarkMode
                            ? 'bg-gray-800 hover:bg-gray-700'
                            : 'bg-gray-200 hover:bg-gray-300'
                    } focus:outline-none focus:ring-2 focus:ring-gray-500`}
                >
                    <Settings size={20} className={isDarkMode ? 'text-white' : 'text-gray-700'} />
                </button>
                <button
                    onClick={toggleDarkMode}
                    className={`ml-2 p-2 rounded-md ${
                        isDarkMode
                            ? 'bg-gray-800 hover:bg-gray-700'
                            : 'bg-gray-200 hover:bg-gray-300'
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
                    <SearchResults
                        links={filteredLinks}
                        refreshData={refreshData}
                        isDarkMode={isDarkMode}
                    />
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

const SearchResults = ({ links, refreshData, isDarkMode }) => {
    const sortedLinks = [...links].sort((a, b) => a.name.localeCompare(b.name))

    return (
        <div>
            {sortedLinks.map(link => (
                <LinkItem
                    key={link.id}
                    link={link}
                    refreshData={refreshData}
                    isDarkMode={isDarkMode}
                />
            ))}
        </div>
    )
}

const FolderStructure = ({
    folders,
    refreshData,
    openFolders,
    toggleFolder,
    linksByFolder,
    isDarkMode,
    loadLinksForFolder
}) => {
    const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name))
    const rootFolders = sortedFolders.filter(folder => !folder.parentId)

    const renderFolder = folder => (
        <FolderItem
            key={folder.id}
            folder={folder}
            openFolders={openFolders}
            toggleFolder={toggleFolder}
            links={linksByFolder[folder.id] || []}
            subFolders={sortedFolders.filter(f => f.parentId === folder.id)}
            renderFolder={renderFolder}
            refreshData={refreshData}
            isDarkMode={isDarkMode}
            loadLinksForFolder={loadLinksForFolder}
        />
    )

    return <div>{rootFolders.map(renderFolder)}</div>
}

const FolderItem = ({
    folder,
    refreshData,
    openFolders,
    toggleFolder,
    links,
    subFolders,
    renderFolder,
    isDarkMode,
    loadLinksForFolder
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
                    {sortedLinks.map(link => (
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

const LinkItem = ({ link, refreshData, isDarkMode }) => {
    const [showConfirmDelete, setShowConfirmDelete] = useState(false)

    const handleDelete = () => {
        setShowConfirmDelete(true)
    }

    const confirmDelete = () => {
        chrome.runtime.sendMessage({ action: 'deleteLink', id: link.id }, response => {
            if (response.success) {
                refreshData()
            } else {
                alert('Error deleting link. Please try again.')
            }
        })
        setShowConfirmDelete(false)
    }

    const cancelDelete = () => {
        setShowConfirmDelete(false)
    }
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
                        {link.tags.map(tag => tag.name).join(', ')}
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
    )
}

const AddLinkModal = ({
    newLink,
    allTags,
    folders,
    handleNewLinkChange,
    handleTagChange,
    saveNewLink,
    closeAddLinkModal,
    isDarkMode
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
                                .map(r => ({
                                    ...r,
                                    name: r.parent ? r.parent.name + ' / ' + r.name : r.name
                                }))
                                .sort((a, b) => a.name.localeCompare(b.name))
                                .map(folder => (
                                    <option key={folder.id} value={folder.id}>
                                        {folder.parent
                                            ? folder.parent.name + ' / ' + folder.name
                                            : folder.name}
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
                            {allTags.map(tag => (
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

export default Popup
