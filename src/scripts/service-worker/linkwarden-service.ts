import { browser } from 'webextension-polyfill-ts';
export class LinkwardenService {
  host: string;
  token: string;
  refreshInterval = 0;
  constructor(host: string, token: string) {
    this.host = host;
    this.token = token;
    this.init();
  }
  init() {
    browser.storage.sync
      .get(['host', 'token', 'refreshInterval'])
      .then((result) => {
        this.host = result.host;
        this.token = result.token;
        if (result.refreshInterval) {
          browser.alarms.create('refreshData', {
            periodInMinutes: parseInt(result.refreshInterval),
          });
        }
      });
  }

  async fetchFolders() {
    try {
      const response = await fetch(`${this.host}/api/v1/collections`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json();
      browser.storage.local.set({ folders: data.response });
      return data.response;
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  }

  async fetchLinks(collectionId: string) {
    try {
      const response = await fetch(
        `${this.host}/api/v1/links?collectionId=${collectionId}`,
        {
          headers: {
            Authorization: `Bearer ${this.token}`,
          },
        },
      );
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  }

  async fetchTags() {
    try {
      const response = await fetch(`${this.host}/api/v1/tags`, {
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  }

  async saveLink(link: {
    title: string;
    url: string;
    collectionId: string;
    tags: string[];
  }) {
    try {
      const response = await fetch(`${this.host}/api/v1/links`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(link),
      });
      const data = await response.json();
      return { success: true, data: data.response };
    } catch (error) {
      console.error('Error saving link:', error);
      return { success: false, error: error.message };
    }
  }

  async deleteLink(linkId: string) {
    try {
      const response = await fetch(`${this.host}/api/v1/links/${linkId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
      const data = await response.json();
      return { success: true, data: data.response };
    } catch (error) {
      console.error('Error deleting link:', error);
      return { success: false, error: error.message };
    }
  }

  async updateLink(
    id: string,
    link: {
      title: string;
      url: string;
      collectionId: string;
      tags: string[];
    },
  ) {
    try {
      const response = await fetch(`${this.host}/api/v1/links/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(link),
      });
      const data = await response.json();
      return { success: true, data: data.response };
    } catch (error) {
      console.error('Error updating link:', error);
      return { success: false, error: error.message };
    }
  }

  async fetchAllLinks() {
    try {
      const response = await fetch(`${this.host}/api/v1/links`, {
        headers: { Authorization: `Bearer ${this.token}` },
      });
      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error fetching links:', error);
    }
  }

  async fetchAllLinksFromFolders() {
    const folders = await this.fetchFolders();
    const links = await Promise.all(
      folders.map((folder) => this.fetchLinks(folder.id)),
    );
    return links.flat();
  }
}
