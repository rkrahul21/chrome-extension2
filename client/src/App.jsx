import React, { useState } from 'react';
import ReactDOM from 'react-dom';

/* global chrome */

function App() {
  const [urls, setUrls] = useState(["", "", ""]);
  const [status, setStatus] = useState('');

  const handleChange = (idx, val) => {
    const a = [...urls]; a[idx] = val; setUrls(a);
  };

  const handleRun = async () => {
    const validUrls = urls.filter(u => u.trim());
    if (validUrls.length < 3) { 
      setStatus('Please enter at least 3 URLs'); 
      return; 
    }
    
    setStatus('Starting scraping...');
    
    try {
      await chrome.storage.local.set({ profileUrls: validUrls });
      
      for (let i = 0; i < validUrls.length; i++) {
        setStatus(`Processing profile ${i + 1} of ${validUrls.length}...`);
        
        // Create new tab for each URL
        const tab = await chrome.tabs.create({ url: validUrls[i] });
        
        // Wait for tab to load
        await new Promise(resolve => {
          chrome.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === tab.id && info.status === 'complete') {
              chrome.tabs.onUpdated.removeListener(listener);
              resolve();
            }
          });
        });
        
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: scrapeLinkedInProfile
        });
        
        const profileData = results[0].result;
        
        if (profileData) {
          // Send data to backend
          await saveToDatabase(profileData);
          setStatus(`Profile ${i + 1} scraped and saved successfully`);
        }
        
    
        await chrome.tabs.remove(tab.id);
        
        // Add delay between requests to avoid rate limiting
        if (i < validUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }
      
      setStatus('All profiles scraped successfully!');
    } catch (error) {
      console.error('Error during scraping:', error);
      setStatus(`Error: ${error.message}`);
    }
  };

  const scrapeLinkedInProfile = () => {
    try {
      const name = document.querySelector('h1')?.textContent?.trim() || '';
      const headline = document.querySelector('.text-body-medium')?.textContent?.trim() || '';
      const location = document.querySelector('.text-body-small.inline.t-black--light.break-words')?.textContent?.trim() || '';
      const about = document.querySelector('#about')?.parentElement?.querySelector('.display-flex.full-width')?.textContent?.trim() || '';
      
 
      const experienceElements = document.querySelectorAll('#experience ~ .pvs-list__paged-list-item');
      const experience = Array.from(experienceElements).slice(0, 3).map(exp => {
        const title = exp.querySelector('.mr1.t-bold')?.textContent?.trim() || '';
        const company = exp.querySelector('.t-14.t-normal')?.textContent?.trim() || '';
        const duration = exp.querySelector('.t-14.t-normal.t-black--light')?.textContent?.trim() || '';
        return { title, company, duration };
      });

      return {
        name,
        headline,
        location,
        about,
        experience,
        profileUrl: window.location.href,
        scrapedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Scraping error:', error);
      return null;
    }
  };

  // Function to save data to backend
  const saveToDatabase = async (profileData) => {
    try {
      const response = await fetch('http://localhost:16266/api/profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Profile saved:', result);
    } catch (error) {
      console.error('Error saving to database:', error);
      throw error;
    }
  };

  return (
    <div className="bg-slate-100 w-96 gap-2 rounded-md   flex flex-col p-4 items-center">
      <h1 className="text-xl font-bold flex flex-col">LinkedIn Scraper</h1>
      {urls.map((u, i) => (
        <input
          key={i}
          type="text"
          placeholder="LinkedIn profile URL"
          className="w-full border p-2 rounded-md"
          value={u}
          onChange={e => handleChange(i, e.target.value)}
        />
      ))}
      <button 
        className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400" 
        onClick={handleRun}
        disabled={status.includes('Processing') || status.includes('Starting')}
      >
        Scrape profiles
      </button>
      {status && <p className="text-gray-700">{status}</p>}
    </div>
  );
}

export default App;