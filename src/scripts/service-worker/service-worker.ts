import { LinkwardenService } from './linkwarden-service';
import { browser } from 'webextension-polyfill-ts';

let host: string;
let token: string;

console.log('Background Service Worker Loaded');

browser.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed');
});

browser.action.setBadgeText({ text: 'ON' });

browser.action.onClicked.addListener(() => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const activeTab = tabs[0];
    browser.tabs.sendMessage(activeTab.id!, {
      message: 'clicked_browser_action',
    });
  });
});

browser.commands.onCommand.addListener((command) => {
  console.log(`Command: ${command}`);

  if (command === 'refresh_extension') {
    browser.runtime.reload();
  }
});

browser.storage.sync
  .get(['host', 'token', 'refreshInterval'])
  .then(function (result) {
    host = result.host;
    token = result.token;

    if (result.refreshInterval) {
      browser.alarms.create('refreshData', {
        periodInMinutes: parseInt(result.refreshInterval),
      });
    }
  });

browser.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === 'refreshData') {
    const service = new LinkwardenService(host, token);
    service.fetchFolders();
  }
});

browser.runtime.onMessage.addListener(async (request, sender): Promise<any> => {
  const service = new LinkwardenService(host, token);

  console.log('Message received:', request);
  if (request.action === 'checkOptions') {
    return !!host && !!token;
  } else if (request.action === 'getFolders') {
    const folders = await browser.storage.local.get('folders');
    if (folders && folders.folders) return folders.folders;
    return await service.fetchFolders();
    return true;
  } else if (request.action === 'getLinks') {
    return await service.fetchLinks(request.collectionId);
  } else if (request.action === 'refreshData') {
    return await service.fetchFolders();
  } else if (request.action === 'getTags') {
    return await service.fetchTags();
  } else if (request.action === 'saveLink') {
    return await service.saveLink(request.link);
  } else if (request.action === 'getAllLinks') {
    return await service.fetchAllLinksFromFolders();
  } else if (request.action === 'updateLink') {
    return await service.updateLink(request.id, request.data);
  } else if (request.action === 'deleteLink') {
    return await service.deleteLink(request.id);
  }
});

export {};
