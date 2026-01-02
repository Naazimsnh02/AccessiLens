/**
 * AccessiLens - Background Service Worker
 * Handles API calls and message passing
 */

// Default configuration
let CONFIG = {
    API_KEY: 'YOUR_API_KEY_HERE',
    API_ENDPOINT: 'https://api.tokenfactory.nebius.com/v1/',
    MODEL: 'moonshotai/Kimi-K2-Instruct',
    MAX_TOKENS: 500,
    TEMPERATURE: 0.7,
    ENABLE_CACHE: true,
    CACHE_DURATION: 3600000,
    USE_MOCK_RESPONSES: false,
    PROMPTS: {
        simplify: `You are an accessibility assistant. Simplify the following text to make it easier to understand for someone with reading difficulties or learning disabilities. Use simple words, short sentences, and clear structure. Preserve the key information.

Text to simplify:
{TEXT}

Respond with ONLY the simplified text, no explanations or prefixes.`,

        explain: `You are an accessibility assistant. Explain the following concept in simple terms that a student with learning difficulties can understand. Use analogies, examples, and break down complex ideas.

Concept to explain:
{TEXT}

Respond with ONLY the explanation, no prefixes.`,

        define: `You are an accessibility assistant. Define this word/term in simple language that someone with reading difficulties can understand. Include:
1. A simple definition (1-2 sentences)
2. An example of how it's used
3. A simpler word that means the same thing (if applicable)

Word/Term: {TEXT}

Respond with ONLY the definition, formatted clearly.`,

        summarize: `You are an accessibility assistant. Create a brief summary of the following content. Use bullet points and simple language.

Content to summarize:
{TEXT}

Respond with ONLY the summary, no prefixes.`,

        // NEW: Quiz-specific simplification
        simplifyQuiz: `You are an accessibility assistant helping students with learning disabilities understand quiz questions. Simplify the following quiz question while preserving its meaning and all answer options.

Rules:
- Keep the question format (multiple choice, true/false, etc.)
- Simplify the language but don't change the correct answer
- Keep all answer options but simplify their wording
- Highlight key words that are important for answering

Quiz Question:
{TEXT}

Respond with the simplified question and options, formatted clearly.`,

        // NEW: Step-by-step breakdown
        stepByStep: `You are an accessibility assistant. Break down this concept or problem into simple, numbered steps that a student with learning difficulties can follow.

Content to break down:
{TEXT}

Respond with clear numbered steps, using simple language. Each step should be one simple action or idea.`,

        // NEW: Visual content description
        describeVisual: `You are an accessibility assistant. Provide a detailed but clear description of this visual content (chart, diagram, image) for someone who cannot see it or has difficulty processing visual information.

Visual content description/context:
{TEXT}

Provide:
1. What the visual shows overall
2. Key elements and their relationships
3. The main takeaway or message
4. Any important data points or labels

Use simple, clear language.`,

        // NEW: Video transcript enhancement
        enhanceTranscript: `You are an accessibility assistant. Improve this video transcript to make it more accessible and easier to follow for someone with learning difficulties.

Original transcript:
{TEXT}

Improve by:
1. Adding clear paragraph breaks
2. Identifying speakers if multiple
3. Adding descriptions of important visual elements [in brackets]
4. Simplifying complex sentences
5. Highlighting key terms

Respond with the enhanced transcript.`,

        // NEW: Interactive element guidance
        interactionHelp: `You are an accessibility assistant. Explain how to use this interactive element (quiz, form, game, simulation) in simple step-by-step instructions.

Interactive element description:
{TEXT}

Provide:
1. What this element does
2. How to interact with it (click, type, drag, etc.)
3. What to expect when you interact
4. Tips for completing it successfully

Use simple, encouraging language suitable for someone who may be anxious about interactive content.`
    }
};

// Response cache
const responseCache = new Map();

// Load config from storage on startup
async function loadConfig() {
    try {
        // First try to load from storage
        const result = await chrome.storage.sync.get(['apiConfig']);
        if (result.apiConfig && result.apiConfig.API_KEY && result.apiConfig.API_KEY !== 'YOUR_API_KEY_HERE') {
            CONFIG = { ...CONFIG, ...result.apiConfig };
            console.log('AccessiLens: Loaded config from storage');
        }
        console.log('AccessiLens: Config loaded, API_KEY set:', CONFIG.API_KEY !== 'YOUR_API_KEY_HERE');
    } catch (error) {
        console.error('AccessiLens: Error loading config:', error);
    }
}

// Initialize config on load
loadConfig();

// ===========================================
// MESSAGE HANDLER
// ===========================================

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AI_REQUEST') {
        console.log('AccessiLens: AI_REQUEST received for action:', message.action);
        console.log('AccessiLens: Using API endpoint:', CONFIG.API_ENDPOINT);
        console.log('AccessiLens: API key configured:', CONFIG.API_KEY !== 'YOUR_API_KEY_HERE');

        handleAIRequest(message.action, message.text)
            .then(result => {
                console.log('AccessiLens: AI request successful');
                sendResponse({ result });
            })
            .catch(error => {
                console.error('AccessiLens: AI request failed:', error);
                sendResponse({ error: error.message });
            });
        return true; // Keep channel open for async response
    }

    if (message.type === 'UPDATE_CONFIG') {
        console.log('AccessiLens: Updating config...');
        CONFIG = { ...CONFIG, ...message.config };
        chrome.storage.sync.set({ apiConfig: message.config }, () => {
            console.log('AccessiLens: Config saved to storage');
            console.log('AccessiLens: New API endpoint:', CONFIG.API_ENDPOINT);
            console.log('AccessiLens: API key set:', CONFIG.API_KEY !== 'YOUR_API_KEY_HERE');
        });
        sendResponse({ success: true });
        return true;
    }

    if (message.type === 'GET_CONFIG') {
        // Reload config from storage before returning
        chrome.storage.sync.get(['apiConfig'], (result) => {
            if (result.apiConfig) {
                CONFIG = { ...CONFIG, ...result.apiConfig };
            }
            sendResponse({ config: CONFIG });
        });
        return true;
    }
});

// ===========================================
// AI API HANDLER
// ===========================================

async function handleAIRequest(action, text) {
    // Reload config from storage to ensure we have latest
    const result = await chrome.storage.sync.get(['apiConfig']);
    if (result.apiConfig && result.apiConfig.API_KEY) {
        CONFIG = { ...CONFIG, ...result.apiConfig };
    }

    console.log('AccessiLens: handleAIRequest called');
    console.log('AccessiLens: Action:', action);
    console.log('AccessiLens: API Key present:', CONFIG.API_KEY && CONFIG.API_KEY !== 'YOUR_API_KEY_HERE');

    // Check cache first
    if (CONFIG.ENABLE_CACHE) {
        const cacheKey = `${action}:${hashText(text)}`;
        const cached = responseCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < CONFIG.CACHE_DURATION) {
            console.log('AccessiLens: Returning cached response');
            return cached.response;
        }
    }

    // Use mock responses if enabled or no API key
    if (CONFIG.USE_MOCK_RESPONSES || !CONFIG.API_KEY || CONFIG.API_KEY === 'YOUR_API_KEY_HERE') {
        console.log('AccessiLens: Using mock response (no valid API key)');
        return getMockResponse(action, text);
    }

    console.log('AccessiLens: Calling real API...');
    // Call real API
    const response = await callOpenAICompatibleAPI(action, text);

    // Cache response
    if (CONFIG.ENABLE_CACHE) {
        const cacheKey = `${action}:${hashText(text)}`;
        responseCache.set(cacheKey, {
            response,
            timestamp: Date.now()
        });
    }

    return response;
}

async function callOpenAICompatibleAPI(action, text) {
    const prompt = CONFIG.PROMPTS[action].replace('{TEXT}', text);

    // Ensure endpoint ends correctly
    let endpoint = CONFIG.API_ENDPOINT;
    if (!endpoint.endsWith('/')) {
        endpoint += '/';
    }
    if (!endpoint.endsWith('v1/')) {
        endpoint += 'v1/';
    }

    const url = `${endpoint}chat/completions`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${CONFIG.API_KEY}`
            },
            body: JSON.stringify({
                model: CONFIG.MODEL,
                messages: [
                    {
                        role: 'system',
                        content: 'You are an accessibility assistant that helps make content easier to understand for people with learning difficulties.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: CONFIG.MAX_TOKENS,
                temperature: CONFIG.TEMPERATURE
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content.trim();
        }

        throw new Error('Unexpected API response format');

    } catch (error) {
        console.error('AccessiLens API Error:', error);
        throw error;
    }
}

// ===========================================
// MOCK RESPONSES (For demo without API key)
// ===========================================

function getMockResponse(action, text) {
    return new Promise((resolve) => {
        setTimeout(() => {
            const mockResponses = {
                simplify: generateMockSimplification(text),
                explain: generateMockExplanation(text),
                define: generateMockDefinition(text),
                summarize: generateMockSummary(text)
            };
            resolve(mockResponses[action] || 'Response generated.');
        }, 1000);
    });
}

function generateMockSimplification(text) {
    // Simple mock that shortens sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const simplified = sentences.slice(0, Math.ceil(sentences.length * 0.7))
        .map(s => s.trim().split(' ').slice(0, 15).join(' '))
        .join('. ');

    return `Here's a simpler version:\n\n${simplified}.\n\n(This is a mock response. Add your API key in config.js for real AI-powered simplification.)`;
}

function generateMockExplanation(text) {
    return `Let me explain this in simple terms:\n\nThis text talks about "${text.slice(0, 50)}..."\n\nThink of it like this: The main idea is broken down into smaller, easier parts.\n\n(This is a mock response. Add your API key for real explanations.)`;
}

function generateMockDefinition(text) {
    const word = text.split(' ')[0];
    return `📖 ${word}\n\nDefinition: This is a word that means something specific in this context.\n\nExample: "I used ${word} in a sentence."\n\nSimpler word: (Similar concept)\n\n(This is a mock response. Add your API key for real definitions.)`;
}

function generateMockSummary(text) {
    const words = text.split(' ');
    return `📝 Summary:\n\n• This content has ${words.length} words\n• Main topic: ${words.slice(0, 5).join(' ')}...\n• Key points are highlighted above\n\n(This is a mock response. Add your API key for real summaries.)`;
}

// ===========================================
// UTILITIES
// ===========================================

function hashText(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

// ===========================================
// COMMAND HANDLING
// ===========================================

chrome.commands.onCommand.addListener((command) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
            switch (command) {
                case 'toggle-panel':
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'TOGGLE_PANEL' });
                    break;
                case 'simplify-selection':
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'EXECUTE_COMMAND', command: 'simplifySelection' });
                    break;
                case 'read-aloud':
                    chrome.tabs.sendMessage(tabs[0].id, { type: 'EXECUTE_COMMAND', command: 'readAloud' });
                    break;
            }
        }
    });
});

// ===========================================
// INSTALLATION HANDLER
// ===========================================

chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Initialize default settings
        chrome.storage.sync.set({
            settings: {
                dyslexia: false,
                highContrast: false,
                readingMode: false,
                readingRuler: false
            },
            stats: {
                pages: 0,
                aiRequests: 0,
                featuresUsed: 0,
                timeSaved: 0
            }
        });

        console.log('AccessiLens installed successfully!');
    }
});

console.log('AccessiLens background service worker loaded.');
