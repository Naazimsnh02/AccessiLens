/**
 * AccessiLens - Popup Script
 * Controls the extension popup interface
 */

// ===========================================
// INITIALIZATION
// ===========================================

document.addEventListener('DOMContentLoaded', () => {
    loadSettings();
    loadStats();
    checkAPIStatus();
    setupEventListeners();
});

// ===========================================
// LOAD DATA
// ===========================================

function loadSettings() {
    chrome.storage.sync.get(['settings'], (result) => {
        const settings = result.settings || {};

        document.getElementById('dyslexia-toggle').checked = settings.dyslexia || false;
        document.getElementById('contrast-toggle').checked = settings.highContrast || false;
        document.getElementById('reading-toggle').checked = settings.readingMode || false;
    });
}

function loadStats() {
    chrome.storage.sync.get(['stats'], (result) => {
        const stats = result.stats || { pages: 0, aiRequests: 0, timeSaved: 0 };

        document.getElementById('pages-count').textContent = formatNumber(stats.pages);
        document.getElementById('ai-count').textContent = formatNumber(stats.aiRequests);
        document.getElementById('time-saved').textContent = formatNumber(Math.round(stats.timeSaved));
    });
}

function checkAPIStatus() {
    chrome.runtime.sendMessage({ type: 'GET_CONFIG' }, (response) => {
        const statusEl = document.getElementById('api-status');
        const statusTextEl = document.getElementById('api-status-text');

        if (response && response.config && response.config.API_KEY !== 'YOUR_API_KEY_HERE') {
            statusEl.classList.add('connected');
            statusTextEl.textContent = `Connected to ${getProviderName(response.config.API_ENDPOINT)}`;
        } else {
            statusEl.classList.remove('connected');
            statusTextEl.textContent = 'Demo Mode - Add API key for AI features';
        }
    });
}

function getProviderName(endpoint) {
    if (endpoint.includes('tokenfactory.nebius')) return 'Nebius';
    if (endpoint.includes('openai.com')) return 'OpenAI';
    if (endpoint.includes('openrouter.ai')) return 'OpenRouter';
    if (endpoint.includes('localhost')) return 'Local LLM';
    return 'AI Provider';
}

// ===========================================
// EVENT LISTENERS
// ===========================================

function setupEventListeners() {
    // Toggle handlers
    document.getElementById('dyslexia-toggle').addEventListener('change', (e) => {
        toggleFeature('dyslexia', e.target.checked);
    });

    document.getElementById('contrast-toggle').addEventListener('change', (e) => {
        toggleFeature('highContrast', e.target.checked);
    });

    document.getElementById('reading-toggle').addEventListener('change', (e) => {
        toggleFeature('readingMode', e.target.checked);
    });

    // Action buttons
    document.getElementById('simplify-btn').addEventListener('click', () => {
        sendCommand('simplifyPage');
    });

    document.getElementById('speak-btn').addEventListener('click', () => {
        sendCommand('readAloud');
    });

    document.getElementById('summarize-btn').addEventListener('click', () => {
        sendCommand('summarizePage');
    });

    document.getElementById('stop-btn').addEventListener('click', () => {
        sendCommand('stopSpeech');
    });

    // Settings link
    document.getElementById('settings-link').addEventListener('click', (e) => {
        e.preventDefault();
        // Open options page or config instructions
        chrome.tabs.create({ url: 'options.html' });
    });
}

// ===========================================
// FEATURE CONTROL
// ===========================================

function toggleFeature(feature, enabled) {
    // Save to storage
    chrome.storage.sync.get(['settings'], (result) => {
        const settings = result.settings || {};
        settings[feature] = enabled;
        chrome.storage.sync.set({ settings });
    });

    // Send to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'TOGGLE_FEATURE',
                feature: feature,
                enabled: enabled
            }).catch(() => {
                // Tab might not have content script loaded
                console.log('Could not reach content script');
            });
        }
    });
}

function sendCommand(command) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'EXECUTE_COMMAND',
                command: command
            }).catch(() => {
                console.log('Could not reach content script');
            });
        }
    });

    // Close popup after action
    window.close();
}

// ===========================================
// UTILITIES
// ===========================================

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
}
