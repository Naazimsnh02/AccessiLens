// AccessiLens Popup Script

// Load current settings
chrome.storage.sync.get(['settings', 'stats'], (result) => {
  const settings = result.settings || {};
  const stats = result.stats || { pages: 0, simplifications: 0, timeSaved: 0 };
  
  // Set toggle states
  document.getElementById('dyslexia-toggle').checked = settings.dyslexiaFont || false;
  document.getElementById('contrast-toggle').checked = settings.highContrast || false;
  document.getElementById('reading-toggle').checked = settings.readingMode || false;
  
  // Display stats
  document.getElementById('pages-count').textContent = stats.pages;
  document.getElementById('simplify-count').textContent = stats.simplifications;
  document.getElementById('time-saved').textContent = stats.timeSaved;
});

// Toggle handlers
document.getElementById('dyslexia-toggle').addEventListener('change', (e) => {
  toggleFeature('dyslexiaFont', e.target.checked);
});

document.getElementById('contrast-toggle').addEventListener('change', (e) => {
  toggleFeature('highContrast', e.target.checked);
});

document.getElementById('reading-toggle').addEventListener('change', (e) => {
  toggleFeature('readingMode', e.target.checked);
});

// Action buttons
document.getElementById('simplify-btn').addEventListener('click', () => {
  sendCommandToContentScript('simplifyPage');
});

document.getElementById('speak-btn').addEventListener('click', () => {
  sendCommandToContentScript('readAloud');
});

function toggleFeature(feature, enabled) {
  chrome.storage.sync.get(['settings'], (result) => {
    const settings = result.settings || {};
    settings[feature] = enabled;
    
    chrome.storage.sync.set({ settings }, () => {
      // Send message to content script to apply changes
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: 'TOGGLE_FEATURE',
          feature,
          enabled
        });
      });
    });
  });
}

function sendCommandToContentScript(command) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.tabs.sendMessage(tabs[0].id, {
      type: 'EXECUTE_COMMAND',
      command
    });
  });
}

// Settings link
document.getElementById('settings-link').addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});