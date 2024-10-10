import React, { useState, useEffect } from 'react'
import { Eye, EyeOff, Save, RefreshCw } from 'lucide-react'

const Options = () => {
    const [host, setHost] = useState('')
    const [token, setToken] = useState('')
    const [refreshInterval, setRefreshInterval] = useState(30)
    const [status, setStatus] = useState('')
    const [isDarkMode, setIsDarkMode] = useState(false)
    const [showToken, setShowToken] = useState(false)

    useEffect(() => {
        chrome.storage.sync.get(['host', 'token', 'refreshInterval'], function (items) {
            setHost(items.host || '')
            setToken(items.token || '')
            setRefreshInterval(items.refreshInterval || 30)
        })

        const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        setIsDarkMode(darkModeMediaQuery.matches)

        const listener = e => setIsDarkMode(e.matches)
        darkModeMediaQuery.addListener(listener)

        return () => darkModeMediaQuery.removeListener(listener)
    }, [])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        chrome.storage.sync.set({ host, token, refreshInterval }, function () {
            setStatus('Options saved successfully.')
            setTimeout(() => setStatus(''), 3000)
            chrome.alarms.create('refreshData', { periodInMinutes: refreshInterval })
        })
    }

    const handleRefresh = () => {
        setStatus('Refreshing data...')
        chrome.runtime.sendMessage({ action: 'refreshData' }, function (response) {
            if (response) {
                setStatus('Data refreshed successfully.')
            } else {
                setStatus('Error refreshing data. Please check your settings.')
            }
            setTimeout(() => setStatus(''), 3000)
        })
    }

    const toggleShowToken = () => setShowToken(!showToken)

    const inputClass = `mt-1 block w-full px-3 py-2 text-sm rounded-md shadow-sm transition duration-150 ease-in-out
        ${
            isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white focus:border-blue-400 focus:ring focus:ring-blue-400 focus:ring-opacity-50'
                : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50'
        }`

    return (
        <div
            className={`min-h-screen py-12 px-4 sm:px-6 lg:px-8 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}
        >
            <div
                className={`max-w-lg mx-auto ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg overflow-hidden`}
            >
                <div className="px-8 py-10">
                    <h1
                        className={`text-3xl font-bold text-center mb-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
                    >
                        Linkwarden Reader Options
                    </h1>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="host"
                                className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                                Host
                            </label>
                            <input
                                type="text"
                                id="host"
                                value={host}
                                onChange={e => setHost(e.target.value)}
                                required
                                className={inputClass}
                                placeholder="https://your-linkwarden-host.com"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="token"
                                className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                                API Token
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    type={showToken ? 'text' : 'password'}
                                    id="token"
                                    value={token}
                                    onChange={e => setToken(e.target.value)}
                                    required
                                    className={`${inputClass} pr-10`}
                                    placeholder="Your API token"
                                />
                                <button
                                    type="button"
                                    onClick={toggleShowToken}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    {showToken ? (
                                        <EyeOff
                                            className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                        />
                                    ) : (
                                        <Eye
                                            className={`h-5 w-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                                        />
                                    )}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label
                                htmlFor="refreshInterval"
                                className={`block text-sm font-medium mb-1 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                            >
                                Refresh Interval (minutes)
                            </label>
                            <input
                                type="number"
                                id="refreshInterval"
                                value={refreshInterval}
                                onChange={e => setRefreshInterval(Number(e.target.value))}
                                min="1"
                                required
                                className={inputClass}
                            />
                        </div>
                        <div className="flex space-x-4 pt-4">
                            <button
                                type="submit"
                                className={`flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    isDarkMode
                                        ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                                }`}
                            >
                                <Save className="mr-2 h-4 w-4" />
                                Save
                            </button>
                            <button
                                type="button"
                                onClick={handleRefresh}
                                className={`flex-1 flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    isDarkMode
                                        ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                        : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                                }`}
                            >
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Refresh Data
                            </button>
                        </div>
                    </form>
                    {status && (
                        <div
                            className={`mt-6 p-3 rounded-md text-center text-sm ${
                                isDarkMode
                                    ? 'bg-blue-900 text-blue-200'
                                    : 'bg-blue-100 text-blue-800'
                            }`}
                        >
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Options
