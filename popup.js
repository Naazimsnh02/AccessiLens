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
    addProfileStyles();
});

// ===========================================
// LOAD DATA
// ===========================================

function loadSettings() {
    chrome.storage.sync.get(['settings'], (result) => {
        const settings = result.settings || {};

        // Display settings
        const dyslexiaToggle = document.getElementById('dyslexia-toggle');
        const contrastToggle = document.getElementById('contrast-toggle');
        const readingToggle = document.getElementById('reading-toggle');

        if (dyslexiaToggle) dyslexiaToggle.checked = settings.dyslexia || false;
        if (contrastToggle) contrastToggle.checked = settings.highContrast || false;
        if (readingToggle) readingToggle.checked = settings.readingMode || false;

        // Motor support settings
        const enlargedToggle = document.getElementById('enlarged-toggle');
        const voiceToggle = document.getElementById('voice-toggle');
        const motionToggle = document.getElementById('motion-toggle');

        if (enlargedToggle) enlargedToggle.checked = settings.enlargedTargets || false;
        if (voiceToggle) voiceToggle.checked = settings.voiceCommands || false;
        if (motionToggle) motionToggle.checked = settings.reduceMotion || false;
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
    // Profile buttons
    document.querySelectorAll('.profile-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            applyProfile(btn.dataset.profile);
        });
    });

    // Display toggles
    const dyslexiaToggle = document.getElementById('dyslexia-toggle');
    const contrastToggle = document.getElementById('contrast-toggle');
    const readingToggle = document.getElementById('reading-toggle');

    if (dyslexiaToggle) {
        dyslexiaToggle.addEventListener('change', (e) => {
            toggleFeature('dyslexia', e.target.checked);
        });
    }

    if (contrastToggle) {
        contrastToggle.addEventListener('change', (e) => {
            toggleFeature('highContrast', e.target.checked);
        });
    }

    if (readingToggle) {
        readingToggle.addEventListener('change', (e) => {
            toggleFeature('readingMode', e.target.checked);
        });
    }

    // Motor support toggles
    const enlargedToggle = document.getElementById('enlarged-toggle');
    const voiceToggle = document.getElementById('voice-toggle');
    const motionToggle = document.getElementById('motion-toggle');

    if (enlargedToggle) {
        enlargedToggle.addEventListener('change', (e) => {
            toggleFeature('enlargedTargets', e.target.checked);
        });
    }

    if (voiceToggle) {
        voiceToggle.addEventListener('change', (e) => {
            toggleFeature('voiceCommands', e.target.checked);
        });
    }

    if (motionToggle) {
        motionToggle.addEventListener('change', (e) => {
            toggleFeature('reduceMotion', e.target.checked);
        });
    }

    // Action buttons
    const simplifyBtn = document.getElementById('simplify-btn');
    const speakBtn = document.getElementById('speak-btn');
    const summarizeBtn = document.getElementById('summarize-btn');
    const scanBtn = document.getElementById('scan-btn');

    if (simplifyBtn) {
        simplifyBtn.addEventListener('click', () => {
            sendCommand('simplifyPage');
        });
    }

    if (speakBtn) {
        speakBtn.addEventListener('click', () => {
            sendCommand('readAloud');
        });
    }

    if (summarizeBtn) {
        summarizeBtn.addEventListener('click', () => {
            sendCommand('summarizePage');
        });
    }

    if (scanBtn) {
        scanBtn.addEventListener('click', () => {
            sendCommand('scanContent');
        });
    }

    // Settings link
    const settingsLink = document.getElementById('settings-link');
    if (settingsLink) {
        settingsLink.addEventListener('click', (e) => {
            e.preventDefault();
            chrome.tabs.create({ url: 'options.html' });
        });
    }
}

// ===========================================
// PROFILE MANAGEMENT
// ===========================================

const accessibilityProfiles = {
    dyslexia: {
        name: 'Dyslexia Friendly',
        settings: {
            dyslexia: true,
            readingRuler: true,
            readingMode: false,
            highContrast: false,
            enlargedTargets: false,
            reduceMotion: false
        }
    },
    lowVision: {
        name: 'Low Vision',
        settings: {
            dyslexia: false,
            readingRuler: false,
            readingMode: true,
            highContrast: true,
            enlargedTargets: true,
            reduceMotion: false
        }
    },
    motorImpairment: {
        name: 'Motor Support',
        settings: {
            dyslexia: false,
            readingRuler: false,
            readingMode: false,
            highContrast: false,
            enlargedTargets: true,
            reduceMotion: true,
            voiceCommands: true
        }
    },
    cognitive: {
        name: 'Cognitive Support',
        settings: {
            dyslexia: true,
            readingRuler: true,
            readingMode: true,
            highContrast: false,
            enlargedTargets: false,
            reduceMotion: true
        }
    }
};

function applyProfile(profileName) {
    const profile = accessibilityProfiles[profileName];
    if (!profile) return;

    // Apply all settings from profile
    Object.entries(profile.settings).forEach(([feature, enabled]) => {
        toggleFeature(feature, enabled);
    });

    // Update UI toggles
    loadSettings();

    // Send to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
                type: 'APPLY_PROFILE',
                profile: profileName
            }).catch(() => {
                console.log('Could not reach content script');
            });
        }
    });

    // Visual feedback
    document.querySelectorAll('.profile-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-profile="${profileName}"]`)?.classList.add('active');
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
// ADD STYLES FOR PROFILES
// ===========================================

function addProfileStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .profile-buttons {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
        }
        
        .profile-btn {
            padding: 10px 12px;
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            font-size: 12px;
            font-weight: 500;
            color: #475569;
            cursor: pointer;
            transition: all 0.2s;
        }
        
        .profile-btn:hover {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: transparent;
            transform: translateY(-2px);
        }
        
        .profile-btn.active {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-color: transparent;
        }
    `;
    document.head.appendChild(style);
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

