

/* global chrome */

(async () => {

    function scrapeAndPost() {
    const nameEl = document.querySelector('h1');
    const name = nameEl ? nameEl.innerText.trim() : '';
    const location = document.querySelector('.pv-top-card--list-bullet li')?.innerText.trim() || '';
    const about = document.querySelector('#about ~ section')?.innerText.trim() || '';
    const bioLine = document.querySelector('.pv-rail-card__actor-link')?.innerText.trim() || '';
    const followerCount = parseInt((document.querySelector('.pv-top-card-v2-section__entity-info')?.innerText.match(/[\d,]+/)?.[0] || '0').replace(/,/g, '')) || 0;
    const connectionCount = parseInt((document.querySelector('.t-black--light')?.innerText.match(/[\d,]+/)?.[0] || '0').replace(/,/g, '')) || 0;

    chrome.storage.local.get('profileUrls', async (data) => {
      const urls = data.profileUrls || [];
      const index = urls.indexOf(window.location.href);
      const apiUrl = 'http://localhost:5173/api/profiles';
      const body = { name, url: window.location.href, about, bio: about, location, followerCount, connectionCount, bioLine };
      try {
        await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
      } catch (err) {
        console.error('POST failed', err);
      }
      // open next
      if (index >= 0 && index + 1 < urls.length) {
        chrome.tabs.create({ url: urls[index + 1] });
      } else {
        console.log('Finished all profiles.');
      }
    });
  }

  if (document.readyState === 'complete') {
    scrapeAndPost();
  } else {
    window.addEventListener('load', scrapeAndPost);
  }
})();
