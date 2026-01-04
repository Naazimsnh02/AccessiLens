# AccessiLens 🔍♿

**AI-Powered Accessibility Layer for Educational Websites**

Transform any educational website into an accessible learning experience using AI-powered adaptations and real-time content enhancement. Works on existing content without requiring publishers to change anything.

![AccessiLens Demo](https://img.shields.io/badge/Version-3.0.0-blue) ![Chrome Extension](https://img.shields.io/badge/Platform-Chrome-green) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🎨 Visual Accessibility (No AI Required)
- **Dyslexia-Friendly Font** - OpenDyslexic with optimized spacing and increased line height
- **High Contrast Mode** - Black background with white text, perfect for low vision
- **Reading Mode** - Focus on main content, hide distractions and navigation
- **Reading Ruler** - Visual guide that follows your cursor for easier reading
- **Enlarged Click Targets** - Bigger buttons and links for motor impairments

### 🤖 AI-Powered Features

#### Text Processing
- **Text Simplification** - Rewrite complex text in simpler, clearer language
- **Concept Explanations** - Get instant explanations for difficult concepts
- **Word Definitions** - Context-aware definitions with examples
- **Page Summarization** - Generate bullet-point summaries of long content
- **Step-by-Step Breakdowns** - Break complex concepts into numbered steps

#### Educational Content Enhancement ⭐ NEW
- **Diagram AI Descriptions** - Get detailed explanations of charts, graphs, and diagrams
  - Extracts alt text, captions, and surrounding context
  - Explains key elements and relationships
  - Provides educational insights
- **Math Equation Support** - Step-by-step explanations for mathematical content
  - Detects MathML, LaTeX, and equation images
  - Explains what equations mean in simple terms
  - Provides real-world examples
- **Quiz Question Helpers** - Individual question assistance
  - Simplifies quiz questions while preserving meaning
  - Breaks down multi-part questions
  - Helps understand answer choices
- **Progress Tracking & Analytics** - Understand your learning journey
  - Track study time and sessions
  - Identify topics needing extra help
  - See most-used accessibility features
  - Monitor learning patterns

### 🎬 Interactive Content Support

#### Video Enhancement
- **Real Transcript Extraction** - Extracts actual captions from videos
  - YouTube transcript extraction (clicks transcript button programmatically)
  - HTML5 video caption reading
  - Page transcript detection
- **AI Transcript Simplification** - Makes transcripts easier to understand
- **Playback Controls** - For HTML5 videos (slow speed toggle)
- **Accessibility Tips** - Built-in player control guidance

#### Quiz Detection & Enhancement
- **Automatic Detection** - Finds quizzes, tests, and assessments automatically
- **Per-Question Helpers** - Individual "Need Help?" buttons for each question
- **Smart Context Cleaning** - Sends only relevant content to AI (no UI noise)
- **Answer Choice Highlighting** - Visual improvements for quiz responses

### 🔊 Text-to-Speech
- Built-in speech synthesis
- Read selected text or entire pages
- Adjustable speed and voice
- No external service required

### 🖐️ Motor Impairment Support
- **Voice Commands** - Hands-free control with 20+ voice commands
  - "Simplify page", "Read aloud", "Stop reading"
  - "Dyslexia on/off", "High contrast", "Scroll down"
- **Dwell-Click** - Hover over elements to click without pressing mouse
- **Reduce Motion** - Pause all animations and transitions
- **Keyboard Shortcuts** - Full keyboard navigation support

### 🎯 Quick Accessibility Profiles
- **Dyslexia** - Optimized for reading difficulties
- **Low Vision** - High contrast and enlarged elements
- **Motor Support** - Voice commands and enlarged targets
- **Cognitive** - Reduced distractions and simplified content

### 🧹 Clean AI Context
- **Smart Content Cleaning** - Removes HTML tags, navigation, ads
- **Educational Element Detection** - Focuses on actual learning content
- **Context-Aware Extraction** - Gets relevant surrounding information
- **Token Optimization** - Limits content length to avoid API overload

## 🚀 Quick Start

### 1. Download the Extension
```bash
git clone https://github.com/naazimsnh02/AccessiLens.git
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
- [Nebius Token Factory](https://nebius.com) - Default (recommended)
- [OpenAI](https://platform.openai.com) - GPT models
- [OpenRouter](https://openrouter.ai) - Multiple model access
- Local LLMs (Ollama, LM Studio) - Privacy-focused

### 3. Load in Chrome
1. Open Chrome → `chrome://extensions/`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `AccessiLens` folder

### 4. Start Using!
- Click the **floating purple button** on any page
- Or use keyboard shortcut: `Alt+A`
- Visit educational sites with videos, quizzes, or diagrams

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt+A` | Toggle AccessiLens panel |
| `Alt+S` | Simplify selected text |
| `Alt+R` | Read selected text aloud |
| `Escape` | Close panel/modal |

## 🎤 Voice Commands

Enable via AccessiLens panel, then say:
- **"Simplify page"** - Simplify main content
- **"Read aloud"** - Read page content
- **"Stop reading"** - Stop text-to-speech
- **"Summarize"** - Get page summary
- **"Dyslexia on/off"** - Toggle dyslexia font
- **"High contrast"** - Toggle high contrast mode
- **"Scroll down/up"** - Navigate page hands-free

## 📁 Project Structure

```
AccessiLens/
├── manifest.json        # Extension manifest v3
├── config.js           # API configuration
├── content.js          # Main content script (2500+ lines)
│   ├── Visual accessibility features
│   ├── AI integration & content cleaning
│   ├── Video transcript extraction
│   ├── Diagram AI descriptions
│   ├── Math equation support
│   ├── Progress tracking & analytics
│   └── Voice commands & motor support
├── accessibility.css   # Visual styles & overlays
├── background.js       # Service worker & API handler
├── popup.html/js       # Popup interface
├── options.html        # Settings page
├── icons/              # Extension icons
└── README.md           # This file
```

## 🔧 Configuration

### Using Settings Page (Recommended)
1. Right-click the extension icon
2. Select "Options"
3. Enter your API details
4. Click "Save Configuration"

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

### Demo Mode (No API Key)
The extension works without an API key! AI features will return mock responses for demonstration purposes.

## 🎯 Best Demo Sites

Test AccessiLens on these educational platforms:

**Videos & Transcripts:**
- [YouTube](https://www.youtube.com/watch?v=5MgBikgcWnY) - TED talks, educational videos
- [Khan Academy](https://www.khanacademy.org/) - Video lessons with transcripts
- [Coursera](https://www.coursera.org/) - Online courses

**Quizzes & Assessments:**
- [W3Schools](https://www.w3schools.com/quiztest/) - Programming quizzes
- [Quizlet](https://quizlet.com/) - Study flashcards and tests

**Diagrams & Math:**
- [Wikipedia Math](https://en.wikipedia.org/wiki/Mathematics) - Equations and diagrams
- [MIT OpenCourseWare](https://ocw.mit.edu/) - STEM content with diagrams

## 📊 Progress Tracking

AccessiLens now tracks your learning journey:
- **Study time** - Total time spent learning
- **AI assistance usage** - What help you've requested
- **Struggling topics** - Content you've simplified multiple times
- **Feature usage** - Which accessibility features you use most

View your progress by clicking "📊 My Progress" in the AccessiLens panel.

## 🛠️ Development

### Prerequisites
- Google Chrome
- Text editor (VS Code recommended)
- API key (optional, for AI features)

### Testing Changes
1. Make your changes to `content.js`, `accessibility.css`, etc.
2. Go to `chrome://extensions/`
3. Click the refresh icon on AccessiLens
4. Reload the target page (hard refresh: `Ctrl+Shift+R`)

### Testing Specific Features
- **Diagrams**: Visit Wikipedia articles with charts/graphs
- **Math**: Visit Khan Academy math lessons
- **Quizzes**: Try W3Schools quizzes
- **Videos**: Test on YouTube with captions enabled
- **Progress**: Use the extension for 30+ minutes, then check analytics

### Building for Production
No build step required! The extension runs directly from source.

## 🎓 Use Cases

### For Students
- Simplify complex textbook explanations
- Get step-by-step help with math problems
- Understand diagrams and charts in science lessons
- Extract and simplify video transcripts
- Track learning progress and identify struggling topics

### For Educators
- Make existing content accessible without republishing
- Understand which topics students find difficult
- Provide alternative explanations automatically
- Support students with diverse learning needs

### For Content Creators
- Test your content's accessibility
- See how AI interprets your diagrams and charts
- Understand readability from various perspectives

## 🤝 Contributing

Contributions are welcome! Areas needing improvement:
- Additional math notation support (more LaTeX patterns)
- Better diagram analysis (integrate vision APIs)
- More voice commands
- Additional language support
- Performance optimizations

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [OpenDyslexic Font](https://opendyslexic.org/) - Accessible font for dyslexia
- [Nebius AI](https://nebius.com/) - AI API provider
- All accessibility advocates, educators, and students who inspire this work

## 🚧 Roadmap

- [ ] Multi-language support
- [ ] Offline mode for core features
- [ ] Integration with learning management systems (LMS)
- [ ] Browser extension for Firefox and Edge
- [ ] Mobile app version
- [ ] Advanced vision AI for diagram analysis

---

**Made with ❤️ for accessible education**

*AccessiLens - Making interactive digital content accessible for every learner*

**Version 3.0** - Now with diagram descriptions, math support, and learning analytics
