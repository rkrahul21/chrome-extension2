



/* global chrome */
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === 'startEngagement') {
    chrome.storage.local.set({ 
      likeCount: request.likeCount, 
      commentCount: request.commentCount 
    });
    
    // Get the active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].url.includes('linkedin.com/feed')) {
        chrome.tabs.reload(tabs[0].id);
      } else {
        chrome.tabs.create({ url: 'https://www.linkedin.com/feed/' });
      }
    });
  }
});