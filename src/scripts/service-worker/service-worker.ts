import { LinkwardenService } from './service'

let host: string
let token: string

console.log('Background Service Worker Loaded')

chrome.runtime.onInstalled.addListener(async () => {
    console.log('Extension installed')
})

chrome.action.setBadgeText({ text: 'ON' })

chrome.action.onClicked.addListener(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const activeTab = tabs[0]
        chrome.tabs.sendMessage(activeTab.id!, { message: 'clicked_browser_action' })
    })
})

chrome.commands.onCommand.addListener(command => {
    console.log(`Command: ${command}`)

    if (command === 'refresh_extension') {
        chrome.runtime.reload()
    }
})

chrome.storage.sync.get(['host', 'token', 'refreshInterval'], function (result) {
    host = result.host
    token = result.token

    if (result.refreshInterval) {
        chrome.alarms.create('refreshData', {
            periodInMinutes: parseInt(result.refreshInterval)
        })
    }
})

chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === 'refreshData') {
        const service = new LinkwardenService(host, token)
        service.fetchFolders()
    }
})

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    const service = new LinkwardenService(host, token)

    console.log('Message received:', request)
    if (request.action === 'checkOptions') {
        sendResponse(!!host && !!token)
    } else if (request.action === 'getFolders') {
        chrome.storage.local.get('folders', function (result) {
            if (result.folders) {
                sendResponse(result.folders)
            } else {
                service.fetchFolders().then(sendResponse)
            }
        })
        return true
    } else if (request.action === 'getLinks') {
        service.fetchLinks(request.collectionId).then(sendResponse)
        return true
    } else if (request.action === 'refreshData') {
        service.fetchFolders().then(sendResponse)
        return true
    } else if (request.action === 'getTags') {
        service.fetchTags().then(sendResponse)
        return true
    } else if (request.action === 'saveLink') {
        service.saveLink(request.link).then(sendResponse)
        return true
    } else if (request.action === 'getAllLinks') {
        service.fetchAllLinks().then(sendResponse)
        return true
    } else if (request.action === 'deleteLink') {
        service.deleteLink(request.id).then(sendResponse)
        return true
    }
})

export {}
