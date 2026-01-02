/**
 * AccessiLens - Options Page Script
 * Handles settings page functionality
 */

// Presets
const presets = {
    nebius: {
        endpoint: 'https://api.tokenfactory.nebius.com/v1/',
        model: 'moonshotai/Kimi-K2-Instruct'
    },
    openai: {
        endpoint: 'https://api.openai.com/v1/',
        model: 'gpt-4o-mini'
    },
    openrouter: {
        endpoint: 'https://openrouter.ai/api/v1/',
        model: 'anthropic/claude-3-haiku'
    },
    local: {
        endpoint: 'http://localhost:11434/v1/',
        model: 'llama3'
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCurrentConfig();
    setupEventListeners();
});

// Load current config
function loadCurrentConfig() {
    chrome.storage.sync.get(['apiConfig'], (result) => {
        if (result.apiConfig) {
            document.getElementById('api-endpoint').value = result.apiConfig.API_ENDPOINT || '';
            document.getElementById('api-key').value = result.apiConfig.API_KEY || '';
            document.getElementById('model').value = result.apiConfig.MODEL || '';
            document.getElementById('max-tokens').value = result.apiConfig.MAX_TOKENS || '500';
            document.getElementById('temperature').value = result.apiConfig.TEMPERATURE || '0.7';
        }
    });
}

// Setup event listeners
function setupEventListeners() {
    // Preset buttons
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const preset = presets[btn.dataset.preset];
            if (preset) {
                document.getElementById('api-endpoint').value = preset.endpoint;
                document.getElementById('model').value = preset.model;

                // Update active state
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            }
        });
    });

    // Toggle visibility button
    document.getElementById('toggle-visibility').addEventListener('click', toggleKeyVisibility);

    // Save button
    document.getElementById('save-btn').addEventListener('click', saveConfig);

    // Test button
    document.getElementById('test-btn').addEventListener('click', testConnection);
}

function toggleKeyVisibility() {
    const input = document.getElementById('api-key');
    input.type = input.type === 'password' ? 'text' : 'password';
}

function showStatus(message, type) {
    const status = document.getElementById('status');
    status.textContent = message;
    status.className = 'status ' + type;
}

function saveConfig() {
    const config = {
        API_ENDPOINT: document.getElementById('api-endpoint').value,
        API_KEY: document.getElementById('api-key').value,
        MODEL: document.getElementById('model').value,
        MAX_TOKENS: parseInt(document.getElementById('max-tokens').value) || 500,
        TEMPERATURE: parseFloat(document.getElementById('temperature').value) || 0.7
    };

    chrome.storage.sync.set({ apiConfig: config }, () => {
        chrome.runtime.sendMessage({ type: 'UPDATE_CONFIG', config }, (response) => {
            if (chrome.runtime.lastError) {
                showStatus('❌ Error saving: ' + chrome.runtime.lastError.message, 'error');
            } else {
                showStatus('✅ Configuration saved successfully!', 'success');
            }
        });
    });
}

async function testConnection() {
    showStatus('Testing connection...', 'info');

    const endpoint = document.getElementById('api-endpoint').value;
    const apiKey = document.getElementById('api-key').value;
    const model = document.getElementById('model').value;

    if (!endpoint || !apiKey) {
        showStatus('❌ Please enter both endpoint and API key', 'error');
        return;
    }

    try {
        const url = endpoint.endsWith('/') ? endpoint + 'chat/completions' : endpoint + '/chat/completions';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: 'Say "Hello" in one word.' }],
                max_tokens: 10
            })
        });

        if (response.ok) {
            const data = await response.json();
            showStatus('✅ Connection successful! Response: ' + (data.choices?.[0]?.message?.content || 'OK'), 'success');
        } else {
            const error = await response.json().catch(() => ({}));
            showStatus('❌ Error: ' + (error.error?.message || response.statusText), 'error');
        }
    } catch (error) {
        showStatus('❌ Connection failed: ' + error.message, 'error');
    }
}
