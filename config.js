/**
 * AccessiLens Configuration
 * 
 * This file contains the configuration for the AI API.
 * Edit this file to add your API key and customize settings.
 * 
 * SUPPORTED PROVIDERS (OpenAI-compatible):
 * - Nebius Token Factory: https://api.tokenfactory.nebius.com/v1/
 * - OpenAI: https://api.openai.com/v1/
 * - OpenRouter: https://openrouter.ai/api/v1/
 * - Local LLM (Ollama, LM Studio): http://localhost:11434/v1/
 * - Any OpenAI-compatible endpoint
 */

const ACCESSILENS_CONFIG = {
    // ===========================================
    // API CONFIGURATION - EDIT THESE VALUES
    // ===========================================

    /**
     * Your API key for the AI service
     * Get your key from your provider's dashboard
     */
    API_KEY: 'YOUR_API_KEY_HERE',

    /**
     * API endpoint URL (OpenAI-compatible format)
     * Must end with /v1/ or /v1
     */
    API_ENDPOINT: 'https://api.tokenfactory.nebius.com/v1/',

    /**
     * Model to use for AI features
     * Examples:
     * - Nebius: 'moonshotai/Kimi-K2-Instruct'
     * - OpenAI: 'gpt-4o-mini', 'gpt-4o'
     * - OpenRouter: 'anthropic/claude-3-haiku'
     */
    MODEL: 'moonshotai/Kimi-K2-Instruct',

    // ===========================================
    // OPTIONAL SETTINGS
    // ===========================================

    /**
     * Maximum tokens for AI responses
     * Higher values allow longer responses but cost more
     */
    MAX_TOKENS: 500,

    /**
     * Temperature for AI responses (0-2)
     * Lower = more focused, Higher = more creative
     */
    TEMPERATURE: 0.7,

    /**
     * Enable response caching to reduce API calls
     */
    ENABLE_CACHE: true,

    /**
     * Cache duration in milliseconds (default: 1 hour)
     */
    CACHE_DURATION: 3600000,

    /**
     * Enable mock responses for demo without API key
     * Set to true if you don't have an API key yet
     */
    USE_MOCK_RESPONSES: false,

    // ===========================================
    // ACCESSIBILITY DEFAULTS
    // ===========================================

    /**
     * Default accessibility settings for new users
     */
    DEFAULTS: {
        dyslexiaFont: false,
        highContrast: false,
        readingMode: false,
        fontSize: 100, // percentage
        lineHeight: 1.6,
        letterSpacing: 0,
        wordSpacing: 0,
        readingRuler: false,
        autoSimplify: false
    },

    // ===========================================
    // PROMPTS FOR AI FEATURES
    // ===========================================

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

Respond with ONLY the summary, no prefixes.`
    }
};

// Make config available globally
if (typeof window !== 'undefined') {
    window.ACCESSILENS_CONFIG = ACCESSILENS_CONFIG;
}

// For ES module support
if (typeof exports !== 'undefined') {
    exports.ACCESSILENS_CONFIG = ACCESSILENS_CONFIG;
}
