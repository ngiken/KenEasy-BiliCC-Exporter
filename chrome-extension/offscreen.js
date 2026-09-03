/**
 * Offscreen document script for KenEasy BiliCC Exporter.
 * Retrieves buffered media from IndexedDB, creates Object URLs, and triggers download in DOM context.
 */
(function initOffscreen() {
  const DB_NAME = 'KenEasyMediaStore';
  const DB_VERSION = 1;
  const STORE_NAME = 'buffers';

  function openMediaDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
    });
  }

  async function getAndDeleteBuffer(id) {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => {
        const data = req.result ? req.result.buffer : null;
        store.delete(id);
        try { db.close(); } catch (_) {}
        resolve(data);
      };
      req.onerror = () => {
        try { db.close(); } catch (_) {}
        reject(req.error || new Error('IndexedDB get failed'));
      };
    });
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'OFFSCREEN_SAVE_BUFFER') {
      (async () => {
        const buffer = await getAndDeleteBuffer(request.id);
        if (!buffer) throw new Error('Buffer not found in media storage.');

        const blob = new Blob([buffer], { type: request.mime || 'video/mp4' });
        const objectUrl = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = objectUrl;
        a.download = request.filename || 'download.mp4';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // Keep URL alive briefly so browser download manager captures it
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
        return { success: true, downloadId: 1 };
      })()
        .then((data) => sendResponse({ success: true, ...data }))
        .catch((error) => sendResponse({ success: false, error: error.message || String(error) }));
      return true;
    }
    return false;
  });
})();
