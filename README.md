# AccessiLens 🔍♿

**AI-Powered Accessibility Layer for Any Website**

Transform any educational website into an accessible learning experience using AI-powered adaptations. Works on existing content without requiring publishers to change anything.

![AccessiLens Demo](https://img.shields.io/badge/Version-2.0.0-blue) ![Chrome Extension](https://img.shields.io/badge/Platform-Chrome-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🎨 Visual Accessibility (No AI Required)
- **Dyslexia-Friendly Font** - OpenDyslexic with optimized spacing
- **High Contrast Mode** - Black background with white text
- **Reading Mode** - Focus on main content, dim distractions
- **Reading Ruler** - Visual guide that follows your cursor

### 🤖 AI-Powered Features
- **Text Simplification** - Rewrite complex text in simpler language
- **Concept Explanations** - Get instant explanations for difficult concepts
- **Word Definitions** - Click any word for an accessible definition
- **Page Summarization** - Generate bullet-point summaries
- **Quiz Simplification** - Simplify quiz questions while preserving meaning
- **Step-by-Step Breakdowns** - Break complex concepts into simple steps
- **Visual Content Descriptions** - AI-generated descriptions for charts and diagrams

### 🔊 Text-to-Speech
- Built-in speech synthesis
- Read selected text or entire pages
- No external service required

### 🖐️ Motor Impairment Support
- **Voice Commands** - Hands-free control with 20+ voice commands
- **Enlarged Click Targets** - Bigger buttons and links for easier clicking
- **Dwell-Click** - Hover over elements to click without pressing buttons
- **Reduce Motion** - Pause all animations and transitions

### 🎬 Interactive Content Support
- **Quiz Detection** - Automatically finds and enhances quiz elements
- **Video Controls** - Pause, slow down, and get transcripts from videos
- **Animation Control** - Stop distracting animations instantly

### 🎯 Quick Profiles
- **Dyslexia** - Optimized for reading difficulties
- **Low Vision** - High contrast and enlarged elements
- **Motor Support** - Voice commands and enlarged targets
- **Cognitive** - Reduced distractions and simplified content

## 🚀 Quick Start

### 1. Download the Extension
```bash
git clone https://github.com/YOUR_USERNAME/AccessiLens.git
cd AccessiLens
```

### 2. Configure API (Optional)
Edit `config.js` or use the Settings page:

```javascript
API_KEY: 'YOUR_API_KEY_HERE',
API_ENDPOINT: 'https://api.tokenfactory.nebius.com/v1/',
MODEL: 'moonshotai/Kimi-K2-Instruct',
```

**Supported Providers:**
- [Nebius Token Factory](https://nebius.com) - Default
- [OpenAI](https://platform.openai.com)
- [OpenRouter](https://openrouter.ai)
- Local LLMs (Ollama, LM Studio)

### 3. Load in Chrome
1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `AccessiLens` folder

### 4. Start Using!
- Click the **floating purple button** on any page
- Or use keyboard shortcut: `Alt+A`

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+A` | Toggle AccessiLens panel |
| `Alt+S` | Simplify selected text |
| `Alt+R` | Read selected text aloud |
| `Escape` | Close panel/modal |

## 📁 Project Structure

```
AccessiLens/
├── manifest.json        # Extension manifest v3
├── config.js           # API configuration
├── content.js          # Main content script
├── accessibility.css   # Visual styles
├── background.js       # Service worker
├── popup.html/js       # Popup interface
├── options.html        # Settings page
├── icons/              # Extension icons
└── README.md           # This file
```

## 🔧 Configuration

### Using config.js (Development)
Edit the `config.js` file directly:

```javascript
const ACCESSILENS_CONFIG = {
  API_KEY: 'your-api-key',
  API_ENDPOINT: 'https://api.tokenfactory.nebius.com/v1/',
  MODEL: 'moonshotai/Kimi-K2-Instruct',
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7
};
```

### Using Settings Page (Recommended)
1. Right-click the extension icon
2. Select "Options"
3. Enter your API details
4. Click "Save Configuration"

### Demo Mode (No API Key)
The extension works without an API key! AI features will return mock responses for demonstration purposes.

## 🎯 Demo Sites

Test AccessiLens on these educational sites:
- [Khan Academy](https://www.khanacademy.org/)
- [Wikipedia](https://en.wikipedia.org/)
- [Coursera](https://www.coursera.org/)
- [MIT OpenCourseWare](https://ocw.mit.edu/)

## 🛠️ Development

### Prerequisites
- Google Chrome
- Text editor (VS Code recommended)

### Testing Changes
1. Make your changes
2. Go to `chrome://extensions/`
3. Click the refresh icon on AccessiLens
4. Reload the target page

### Building for Production
No build step required! The extension runs directly from source.

## 📊 Stats Tracking

AccessiLens tracks usage statistics locally:
- Pages enhanced
- AI requests made
- Estimated time saved

View stats in the popup or settings page.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [OpenDyslexic Font](https://opendyslexic.org/)
- [Nebius AI](https://nebius.com/) for AI API
- All accessibility advocates and educators

---

**Made with ❤️ for accessible education**

*AccessiLens - Making the web accessible for everyone*
