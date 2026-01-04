# AccessiLens QA Testing Guide

This document outlines a comprehensive testing strategy for the AccessiLens Chrome Extension. It covers every functionality, button, and option available in the application.

**Version Tested:** 1.0.0
**Date:** 2026-01-02
**Environment:** Antigravity Browser (Verified Injection)

---

## 🧪 1. Installation & Setup
| ID | Feature | Test Steps | Expected Result | Status |
|----|---------|------------|-----------------|--------|
| 1.1 | Load Unpacked | 1. Open `chrome://extensions/`<br>2. Enable Dev Mode<br>3. Load `AccessiLens` folder | Extension loads without errors. Icon appears in toolbar. | [x] |
| 1.2 | Permissions | Check extension details | Permissions for `activeTab`, `storage`, `scripting`, `tts` are listed. | [x] |
| 1.3 | Service Worker | Check `background.js` status | Service worker defaults to "Active". | [x] |

---

## ⚙️ 2. Configuration (Options Page)
*Access via Right-click Extension Icon > Options*

| ID | Feature | Test Steps | Expected Result | Status |
|----|---------|------------|-----------------|--------|
| 2.1 | UI Layout | Open Options page | Header, Logo, Presets, and Form fields render correctly. | [ ] |
| 2.2 | Nebius Preset | Click "Nebius" button | Endpoint: `...nebius.com...`, Model: `moonshotai/Kimi-K2-Instruct` populate. | [ ] |
| 2.3 | OpenAI Preset | Click "OpenAI" button | Endpoint: `...openai.com...`, Model: `gpt-4o-mini` populate. | [ ] |
| 2.4 | Local Preset | Click "Local LLM" button | Endpoint: `localhost:11434`, Model: `llama3` populate. | [ ] |
| 2.5 | API Key Visibility | Click Eye icon in API Key field | Toggles between disguised (password) and visible text. | [ ] |
| 2.6 | Test Connection (Fail) | Leave Key empty, click "Test Connection" | Error message: "Please enter both endpoint and API key". | [ ] |
| 2.7 | Test Connection (Success) | Enter valid Key/Endpoint, click "Test" | Success message: "✅ Connection successful!". | [ ] |
| 2.8 | Save Config | Enter details, click "Save Configuration" | Message "✅ Configuration saved". key persists after reload. | [ ] |
| 2.9 | Advanced Settings | Edit Max Tokens/Temp, Save, Reload | Values persist (e.g., Temp 0.8). | [ ] |

---

## 🧩 3. Popup Menu (Toolbar)
*Click AccessiLens icon in Chrome Toolbar*

| ID | Feature | Test Steps | Expected Result | Status |
|----|---------|------------|-----------------|--------|
| 3.1 | Stats Display | Open Popup | Shows Pages, AI Uses, Min Saved counts (default 0). | [ ] |
| 3.2 | Dyslexia Profile | Click "📖 Dyslexia" | Toggles: Dyslexia Font ON, Reading Ruler ON. | [ ] |
| 3.3 | Low Vision Profile | Click "👁️ Low Vision" | Toggles: High Contrast ON, Enlarged Targets ON. | [ ] |
| 3.4 | Motor Profile | Click "🖐️ Motor" | Toggles: Voice Commands ON, Enlarged Targets ON. | [ ] |
| 3.5 | Toggle: Dyslexia Font | Switch "Dyslexia Font" ON/OFF | Page font changes to OpenDyslexic immediately. | [x] |
| 3.6 | Toggle: High Contrast | Switch "High Contrast" ON/OFF | Page background black, text white immediately. | [x] |
| 3.7 | Toggle: Reading Mode | Switch "Reading Mode" ON/OFF | Non-essential content dims/hides. | [x] |
| 3.8 | Motor: Enlarged Targets | Switch "Enlarged Targets" ON | Links/Buttons become larger/padded. | [ ] |
| 3.9 | Motor: Reduce Motion | Switch "Reduce Motion" ON | CSS animations pause/stop. | [ ] |
| 3.10 | Action: Simplify Page | Click "Simplify Page" | AI Modal opens, processes page text. | [ ] |
| 3.11 | Action: Read Aloud | Click "Read Aloud" | Browser speaks page content. Icon changes to Stop. | [ ] |
| 3.12 | Action: Summarize | Click "Summarize" | AI Modal opens with bulleted summary. | [ ] |
| 3.13 | Action: Scan Content | Click "Scan Content" | Highlights quizzes/videos on page. | [ ] |
| 3.14 | Settings Link | Click "Settings" in footer | Opens Options page. | [ ] |

---

## 🖥️ 4. On-Page Interface (Content Script)
*Test on a content-heavy page (e.g., Wikipedia)*

| ID | Feature | Test Steps | Expected Result | Status |
|----|---------|------------|-----------------|--------|
| 4.1 | Floating Button (FAB) | Reload page | Purple Accessibility icon appears (bottom-right/left). | [x] |
| 4.2 | Panel Toggle | Click FAB | Side panel slides in/out. | [x] |
| 4.3 | Panel Sync | Change setting in Panel (e.g. Ruler) | Setting updates in Popup menu too (and vice versa). | [ ] |
| 4.4 | Reading Ruler | Enable Ruler, move mouse | Yellow/High-vis line follows cursor Y-position. | [x] |
| 4.5 | Keyboard Shortcut | Press `Alt+A` | Side panel toggles. | [ ] |

---

## 📝 5. Text Selection Tooltip
*Select a sentence or paragraph on a web page*

| ID | Feature | Test Steps | Expected Result | Status |
|----|---------|------------|-----------------|--------|
| 5.1 | Tooltip Appearance | Select text | Tooltip appears near selection with 4 icons. | [x] |
| 5.2 | Tooltip: Simplify | Click "Simplify" | Modal opens, AI Simplifies selected text. | [ ] |
| 5.3 | Tooltip: Explain | Click "Explain" | Modal opens, AI Explains concept. | [ ] |
| 5.4 | Tooltip: Define | Click "Define" | Modal opens, AI Defines term. | [ ] |
| 5.5 | Tooltip: Speak | Click "Speak" | Browser reads ONLY selected text. | [ ] |
| 5.6 | Keyboard: Simplify | Select text, press `Alt+S` | Trigger Simplify action immediately. | [ ] |
| 5.7 | Keyboard: Read | Select text, press `Alt+R` | Trigger Read Aloud immediately. | [ ] |

---

## 🤖 6. AI & Modal Functionality
*Requires valid API Key or Mock Mode*

| ID | Feature | Test Steps | Expected Result | Status |
|----|---------|------------|-----------------|--------|
| 6.1 | Modal Loading | Trigger any AI action | Shows "Processing with AI..." spinner. | [ ] |
| 6.2 | Mock Response | Remove API Key, Trigger AI | Returns "Mock" response after 1s delay. | [ ] |
| 6.3 | Real Response | Add API Key, Trigger AI | Returns meaningful text from LLM. | [ ] |
| 6.4 | Modal: Read Result | Click "Read Aloud" in Modal | Reads the **AI generated text**, not original. | [ ] |
| 6.5 | Modal: Copy | Click "Copy" | Copies AI text to clipboard. Button says "Copied!". | [ ] |
| 6.6 | Modal: Close | Click X or Overlay | Modal closes. Speech stops (if playing). | [ ] |
| 6.7 | Caching | Trigger same AI request twice | Second request is instant (served from cache). | [ ] |

---

## 🎓 7. Interactive Content Support
*Test on pages with specialized content (e.g., YouTube, Quiz forms)*

| ID | Feature | Test Steps | Expected Result | Status |
|----|---------|------------|-----------------|--------|
| 7.1 | Quiz Detection | Visit page with `<form>`/radio buttons | Quiz highlighted. "🎓 Need Help?" button injected. | [ ] |
| 7.2 | Quiz Help | Click "Need Help?" | AI simplifies the question/options. | [ ] |
| 7.3 | Video Detection | Visit page with `<video>`/YouTube | Video wrapper added. Control overlay appears. | [ ] |
| 7.4 | Video Controls | Click "Slow" (🐢) | Video playback speed reduces to 0.75x or 0.5x. | [ ] |

---

## 🐞 8. Error Handling & Edge Cases

| ID | Feature | Test Steps | Expected Result | Status |
|----|---------|------------|-----------------|--------|
| 8.1 | Offline/Network Error | Disconnect internet, Trigger AI | Modal shows red Error message. | [ ] |
| 8.2 | Empty Selection | Select nothing, press `Alt+S` | No action / notification (should handle gracefully). | [ ] |
| 8.3 | Invalid API Key | Enter "123", Trigger AI | Modal shows API Error (401/Invalid Key). | [ ] |
