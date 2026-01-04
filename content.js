/**
 * AccessiLens - Content Script  
 * Main accessibility logic that runs on every page
 */

(function () {
  'use strict';

  // Prevent multiple injections
  if (window.accessiLensInitialized) return;
  window.accessiLensInitialized = true;

  // ===========================================
  // STATE
  // ===========================================

  let panelVisible = false;
  let selectedText = '';
  let tooltipTimeout = null;
  let isSpeaking = false;
  let currentUtterance = null;

  // ===========================================
  // ICONS (SVG)
  // ===========================================

  const ICONS = {
    accessibility: `<svg viewBox="0 0 24 24"><path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/></svg>`,
    close: `<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    dyslexia: `<svg viewBox="0 0 24 24"><path d="M9 4v3h5v12h3V7h5V4H9zm-6 8h3v7h3v-7h3V9H3v3z"/></svg>`,
    contrast: `<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18V4c4.41 0 8 3.59 8 8s-3.59 8-8 8z"/></svg>`,
    reading: `<svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>`,
    simplify: `<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`,
    explain: `<svg viewBox="0 0 24 24"><path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/></svg>`,
    define: `<svg viewBox="0 0 24 24"><path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5  1.2 0 2.4.15 3.5.5v11.5z"/></svg>`,
    speak: `<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`,
    ruler: `<svg viewBox="0 0 24 24"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4z"/></svg>`,
    copy: `<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>`,
    replace: `<svg viewBox="0 0 24 24"><path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/></svg>`,
    sparkle: `<svg viewBox="0 0 24 24"><path d="M12 2L9.19 7.53 3 8.51l4.5 4.37L6.38 19 12 16.1 17.62 19l-1.12-6.12L21 8.51l-6.19-.98L12 2z"/></svg>`
  };

  // ===========================================
  // CREATE UI ELEMENTS
  // ===========================================

  function createFAB() {
    const fab = document.createElement('button');
    fab.className = 'accessilens-fab';
    fab.setAttribute('aria-label', 'Open AccessiLens accessibility panel');
    fab.setAttribute('title', 'AccessiLens - Press Alt+A');
    fab.innerHTML = ICONS.accessibility;
    fab.addEventListener('click', togglePanel);
    document.body.appendChild(fab);
    return fab;
  }

  function createPanel() {
    const panel = document.createElement('div');
    panel.className = 'accessilens-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'AccessiLens accessibility controls');

    panel.innerHTML = `
      <div class="accessilens-panel-header">
        <div class="accessilens-panel-title">
          ${ICONS.accessibility}
          AccessiLens
        </div>
        <button class="accessilens-panel-close" aria-label="Close panel">
          ${ICONS.close}
        </button>
      </div>
      <div class="accessilens-panel-content">
        <div class="accessilens-section">
          <div class="accessilens-section-title">Display Settings</div>
          
          <div class="accessilens-toggle-item">
            <div class="accessilens-toggle-label">
              <div class="accessilens-toggle-icon" style="background: linear-gradient(135deg, #fef3c7, #fcd34d);">
                📖
              </div>
              <span class="accessilens-toggle-text">Dyslexia-Friendly Font</span>
            </div>
            <label class="accessilens-toggle-switch">
              <input type="checkbox" id="accessilens-dyslexia" />
              <span class="accessilens-toggle-slider"></span>
            </label>
          </div>
          
          <div class="accessilens-toggle-item">
            <div class="accessilens-toggle-label">
              <div class="accessilens-toggle-icon" style="background: linear-gradient(135deg, #1e293b, #334155);">
                🌓
              </div>
              <span class="accessilens-toggle-text">High Contrast</span>
            </div>
            <label class="accessilens-toggle-switch">
              <input type="checkbox" id="accessilens-contrast" />
              <span class="accessilens-toggle-slider"></span>
            </label>
          </div>
          
          <div class="accessilens-toggle-item">
            <div class="accessilens-toggle-label">
              <div class="accessilens-toggle-icon" style="background: linear-gradient(135deg, #dbeafe, #93c5fd);">
                👁️
              </div>
              <span class="accessilens-toggle-text">Reading Mode</span>
            </div>
            <label class="accessilens-toggle-switch">
              <input type="checkbox" id="accessilens-reading" />
              <span class="accessilens-toggle-slider"></span>
            </label>
          </div>
          
          <div class="accessilens-toggle-item">
            <div class="accessilens-toggle-label">
              <div class="accessilens-toggle-icon" style="background: linear-gradient(135deg, #fce7f3, #f9a8d4);">
                📏
              </div>
              <span class="accessilens-toggle-text">Reading Ruler</span>
            </div>
            <label class="accessilens-toggle-switch">
              <input type="checkbox" id="accessilens-ruler" />
              <span class="accessilens-toggle-slider"></span>
            </label>
          </div>
        </div>
        
        <div class="accessilens-section">
          <div class="accessilens-section-title">Quick Actions</div>
          <div class="accessilens-action-buttons">
            <button class="accessilens-action-btn" id="accessilens-simplify-page">
              ${ICONS.simplify}
              <span>Simplify Page</span>
            </button>
            <button class="accessilens-action-btn" id="accessilens-read-aloud">
              ${ICONS.speak}
              <span>Read Aloud</span>
            </button>
            <button class="accessilens-action-btn" id="accessilens-summarize">
              ${ICONS.sparkle}
              <span>Summarize</span>
            </button>
            <button class="accessilens-action-btn" id="accessilens-stop-speech">
              ${ICONS.close}
              <span>Stop Speech</span>
            </button>
          </div>
        </div>
        
        <div class="accessilens-section" style="font-size: 12px; color: #64748b; text-align: center;">
          <strong>Tip:</strong> Select text on the page for AI-powered options
          <div class="accessilens-shortcut" style="margin-top: 8px; justify-content: center;">
            <span class="accessilens-kbd">Alt</span>+<span class="accessilens-kbd">A</span> Toggle Panel
          </div>
        </div>
      </div>
    `;

    // Event listeners
    panel.querySelector('.accessilens-panel-close').addEventListener('click', togglePanel);

    // Toggle listeners
    panel.querySelector('#accessilens-dyslexia').addEventListener('change', (e) => {
      toggleFeature('dyslexia', e.target.checked);
    });
    panel.querySelector('#accessilens-contrast').addEventListener('change', (e) => {
      toggleFeature('highContrast', e.target.checked);
    });
    panel.querySelector('#accessilens-reading').addEventListener('change', (e) => {
      toggleFeature('readingMode', e.target.checked);
    });
    panel.querySelector('#accessilens-ruler').addEventListener('change', (e) => {
      toggleFeature('readingRuler', e.target.checked);
    });

    // Action button listeners
    panel.querySelector('#accessilens-simplify-page').addEventListener('click', simplifyPage);
    panel.querySelector('#accessilens-read-aloud').addEventListener('click', readPageAloud);
    panel.querySelector('#accessilens-summarize').addEventListener('click', summarizePage);
    panel.querySelector('#accessilens-stop-speech').addEventListener('click', stopSpeech);

    document.body.appendChild(panel);
    return panel;
  }

  function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'accessilens-tooltip';
    tooltip.innerHTML = `
      <button class="accessilens-tooltip-btn" data-action="simplify">
        ${ICONS.simplify}
        Simplify
      </button>
      <button class="accessilens-tooltip-btn" data-action="explain">
        ${ICONS.explain}
        Explain
      </button>
      <button class="accessilens-tooltip-btn" data-action="define">
        ${ICONS.define}
        Define
      </button>
      <button class="accessilens-tooltip-btn" data-action="speak">
        ${ICONS.speak}
        Speak
      </button>
      <button class="accessilens-tooltip-btn" data-action="stop">
        ${ICONS.close}
        Stop
      </button>
    `;

    tooltip.querySelectorAll('.accessilens-tooltip-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        handleTooltipAction(action);
      });
    });

    document.body.appendChild(tooltip);
    return tooltip;
  }

  function createReadingRuler() {
    const ruler = document.createElement('div');
    ruler.className = 'accessilens-reading-ruler';
    document.body.appendChild(ruler);
    return ruler;
  }

  function createModal() {
    const overlay = document.createElement('div');
    overlay.className = 'accessilens-modal-overlay';
    overlay.innerHTML = `
      <div class="accessilens-modal">
        <div class="accessilens-modal-header">
          <div class="accessilens-modal-title">
            ${ICONS.sparkle}
            <span id="accessilens-modal-title-text">AI Response</span>
          </div>
          <button class="accessilens-modal-close" aria-label="Close modal">
            ${ICONS.close}
          </button>
        </div>
        <div class="accessilens-modal-body">
          <div class="accessilens-ai-response">
            <div class="accessilens-ai-label">
              ${ICONS.sparkle}
              <span id="accessilens-ai-label-text">AI Response</span>
            </div>
            <div class="accessilens-ai-content" id="accessilens-ai-content">
              <div class="accessilens-loading">
                <div class="accessilens-spinner"></div>
                <span>Processing with AI...</span>
              </div>
            </div>
          </div>
          <div class="accessilens-original-text">
            <div class="accessilens-original-label">Your Selected Text</div>
            <div class="accessilens-original-content" id="accessilens-original-content"></div>
          </div>
        </div>
        <div class="accessilens-modal-footer" id="accessilens-modal-footer">
          <button class="accessilens-modal-btn accessilens-modal-btn-secondary" id="accessilens-speak-btn">
            ${ICONS.speak}
            <span>Read Aloud</span>
          </button>
          <button class="accessilens-modal-btn accessilens-modal-btn-secondary" id="accessilens-copy-btn">
            ${ICONS.copy}
            <span>Copy</span>
          </button>
        </div>
      </div>
    `;

    overlay.querySelector('.accessilens-modal-close').addEventListener('click', closeModal);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal();
    });
    overlay.querySelector('#accessilens-copy-btn').addEventListener('click', copyResponse);
    overlay.querySelector('#accessilens-speak-btn').addEventListener('click', toggleSpeakResponse);

    document.body.appendChild(overlay);
    return overlay;
  }

  // ===========================================
  // UI INTERACTIONS
  // ===========================================

  function togglePanel() {
    panelVisible = !panelVisible;
    elements.panel.classList.toggle('active', panelVisible);

    if (panelVisible) {
      loadSettings();
    }
  }

  function closeModal() {
    elements.modal.classList.remove('active');
    stopSpeech(); // Stop speech when closing modal
  }

  function showModal(title, originalText, aiContent) {
    document.getElementById('accessilens-modal-title-text').textContent = title;
    document.getElementById('accessilens-original-content').textContent = originalText;
    document.getElementById('accessilens-ai-content').innerHTML = aiContent;
    elements.modal.classList.add('active');

    // Reset speak button state
    const speakBtn = document.getElementById('accessilens-speak-btn');
    if (speakBtn) {
      speakBtn.className = 'accessilens-modal-btn accessilens-modal-btn-secondary';
      speakBtn.innerHTML = `${ICONS.speak}<span>Read Aloud</span>`;
    }
  }

  function showLoading() {
    document.getElementById('accessilens-ai-content').innerHTML = `
      <div class="accessilens-loading">
        <div class="accessilens-spinner"></div>
        <span>Processing with AI...</span>
      </div>
    `;
  }

  // ===========================================
  // FEATURE TOGGLES
  // ===========================================

  function toggleFeature(feature, enabled) {
    const classMap = {
      dyslexia: 'accessilens-dyslexia',
      highContrast: 'accessilens-high-contrast',
      readingMode: 'accessilens-reading-mode',
      readingRuler: 'accessilens-ruler-active'
    };

    const className = classMap[feature];
    if (className) {
      document.body.classList.toggle(className, enabled);
    }

    // Save to storage
    saveFeatureState(feature, enabled);

    // Update stats
    if (enabled) {
      updateStats('featuresUsed');
    }
  }

  function saveFeatureState(feature, enabled) {
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings || {};
      settings[feature] = enabled;
      chrome.storage.sync.set({ settings });
    });
  }

  function loadSettings() {
    chrome.storage.sync.get(['settings'], (result) => {
      const settings = result.settings || {};

      // Update toggles
      const dyslexiaToggle = document.getElementById('accessilens-dyslexia');
      const contrastToggle = document.getElementById('accessilens-contrast');
      const readingToggle = document.getElementById('accessilens-reading');
      const rulerToggle = document.getElementById('accessilens-ruler');

      if (dyslexiaToggle) dyslexiaToggle.checked = settings.dyslexia || false;
      if (contrastToggle) contrastToggle.checked = settings.highContrast || false;
      if (readingToggle) readingToggle.checked = settings.readingMode || false;
      if (rulerToggle) rulerToggle.checked = settings.readingRuler || false;

      // Apply settings
      if (settings.dyslexia) document.body.classList.add('accessilens-dyslexia');
      if (settings.highContrast) document.body.classList.add('accessilens-high-contrast');
      if (settings.readingMode) document.body.classList.add('accessilens-reading-mode');
      if (settings.readingRuler) document.body.classList.add('accessilens-ruler-active');
    });
  }

  // ===========================================
  // TEXT SELECTION
  // ===========================================

  function handleTextSelection() {
    const selection = window.getSelection();
    const text = selection.toString().trim();

    if (text.length > 0 && text.length < 5000) {
      selectedText = text;
      showTooltip(selection);
    } else {
      hideTooltip();
    }
  }

  function showTooltip(selection) {
    clearTimeout(tooltipTimeout);

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const tooltip = elements.tooltip;
    tooltip.style.left = `${rect.left + window.scrollX}px`;
    tooltip.style.top = `${rect.top + window.scrollY - 50}px`;

    tooltipTimeout = setTimeout(() => {
      tooltip.classList.add('active');
    }, 200);
  }

  function hideTooltip() {
    clearTimeout(tooltipTimeout);
    elements.tooltip.classList.remove('active');
    selectedText = '';
  }

  // ===========================================
  // TOOLTIP ACTIONS
  // ===========================================

  function handleTooltipAction(action) {
    if (!selectedText) return;

    // Store the selected text before hiding tooltip to prevent it from being cleared
    const textToProcess = selectedText;
    hideTooltip();

    switch (action) {
      case 'simplify':
        callAI('simplify', textToProcess, 'Simplified Text');
        break;
      case 'explain':
        callAI('explain', textToProcess, 'Explanation');
        break;
      case 'define':
        callAI('define', textToProcess, 'Definition');
        break;
      case 'speak':
        speakText(textToProcess);
        break;
      case 'stop':
        stopSpeech();
        break;
    }
  }

  // ===========================================
  // AI INTEGRATION
  // ===========================================

  async function callAI(action, text, title) {
    showModal(title, text, '');
    showLoading();

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'AI_REQUEST',
        action: action,
        text: text
      });

      if (response.error) {
        document.getElementById('accessilens-ai-content').innerHTML = `
          <div style="color: #ef4444;">
            <strong>Error:</strong> ${response.error}
          </div>
        `;
      } else {
        document.getElementById('accessilens-ai-content').innerHTML = `
          <div style="white-space: pre-wrap;">${escapeHtml(response.result)}</div>
        `;
        updateStats('aiRequests');
      }
    } catch (error) {
      document.getElementById('accessilens-ai-content').innerHTML = `
        <div style="color: #ef4444;">
          <strong>Error:</strong> ${error.message}
        </div>
      `;
    }
  }

  // ===========================================
  // PAGE ACTIONS
  // ===========================================

  function simplifyPage() {
    const mainContent = document.querySelector('main, article, [role="main"], .content, .article-content');
    const text = mainContent ? mainContent.innerText.slice(0, 3000) : document.body.innerText.slice(0, 3000);

    if (text.trim()) {
      callAI('simplify', text, 'Page Simplified');
    }
  }

  function summarizePage() {
    const mainContent = document.querySelector('main, article, [role="main"], .content, .article-content');
    const text = mainContent ? mainContent.innerText.slice(0, 4000) : document.body.innerText.slice(0, 4000);

    if (text.trim()) {
      callAI('summarize', text, 'Page Summary');
    }
  }

  function readPageAloud() {
    const mainContent = document.querySelector('main, article, [role="main"], .content, .article-content');
    const text = mainContent ? mainContent.innerText : document.body.innerText;

    if (text.trim()) {
      speakText(text.slice(0, 10000));
    }
  }

  // ===========================================
  // TEXT-TO-SPEECH
  // ===========================================

  function speakText(text) {
    if ('speechSynthesis' in window) {
      // Stop any current speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Try to use a natural voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Natural')) ||
        voices.find(v => v.lang.startsWith('en'));
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Track speaking state
      currentUtterance = utterance;
      isSpeaking = true;

      utterance.onend = () => {
        isSpeaking = false;
        currentUtterance = null;
      };

      utterance.onerror = () => {
        isSpeaking = false;
        currentUtterance = null;
      };

      window.speechSynthesis.speak(utterance);
      updateStats('timeSaved', 0.5); // Estimate 0.5 min saved per read
    } else {
      alert('Text-to-speech is not supported in this browser.');
    }
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      isSpeaking = false;
      currentUtterance = null;
    }
  }

  function toggleSpeakResponse() {
    const speakBtn = document.getElementById('accessilens-speak-btn');

    if (isSpeaking) {
      stopSpeech();
      speakBtn.className = 'accessilens-modal-btn accessilens-modal-btn-secondary';
      speakBtn.innerHTML = `${ICONS.speak}<span>Read Aloud</span>`;
    } else {
      const content = document.getElementById('accessilens-ai-content').textContent;
      if (content && !content.includes('Processing')) {
        speakText(content);
        speakBtn.className = 'accessilens-modal-btn accessilens-modal-btn-stop';
        speakBtn.innerHTML = `${ICONS.close}<span>Stop Reading</span>`;
      }
    }
  }

  // ===========================================
  // READING RULER
  // ===========================================

  function handleMouseMove(e) {
    if (document.body.classList.contains('accessilens-ruler-active')) {
      elements.ruler.style.top = `${e.clientY - 20}px`;
    }
  }

  // ===========================================
  // UTILITIES
  // ===========================================

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function copyResponse() {
    const content = document.getElementById('accessilens-ai-content').textContent;
    navigator.clipboard.writeText(content).then(() => {
      const btn = document.getElementById('accessilens-copy-btn');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = `${ICONS.copy}<span>Copied!</span>`;
      setTimeout(() => {
        btn.innerHTML = originalHTML;
      }, 2000);
    });
  }

  let lastSelectedElement = null;

  function replaceWithResponse() {
    // This would replace the original text with the AI response
    // For safety, we just close the modal in the MVP
    closeModal();
  }

  function updateStats(key, value = 1) {
    chrome.storage.sync.get(['stats'], (result) => {
      const stats = result.stats || { pages: 0, aiRequests: 0, featuresUsed: 0, timeSaved: 0 };

      if (key === 'timeSaved') {
        stats.timeSaved = (stats.timeSaved || 0) + value;
      } else {
        stats[key] = (stats[key] || 0) + value;
      }

      chrome.storage.sync.set({ stats });
    });
  }

  // ===========================================
  // CONTENT CLEANING UTILITIES FOR AI
  // ===========================================

  /**
   * Clean text content for AI processing
   * Removes HTML artifacts, normalizes whitespace, strips metadata
   */
  function cleanTextForAI(element) {
    if (!element) return '';

    let text = element.innerText || element.textContent || '';

    // Remove question numbers and metadata
    text = text.replace(/^(Question\s+\d+|Q\.?\s*\d+|#\d+|Chapter\s+\d+)[:\.\)]\s*/gmi, '');
    text = text.replace(/^(\d+\.\s+|\(\d+\)\s+|\d+\)\s+)/gm, ''); // Remove list numbers

    // Normalize whitespace
    text = text.replace(/\s+/g, ' '); // Multiple spaces to single
    text = text.replace(/\n{3,}/g, '\n\n'); // Max 2 newlines
    text = text.trim();

    // Remove common UI artifacts
    text = text.replace(/^(Skip to content|Menu|Navigation|Share|Like|Comment|Subscribe)/gmi, '');

    // Limit length to avoid token overload
    const maxLength = 2000;
    if (text.length > maxLength) {
      text = text.slice(0, maxLength) + '...';
    }

    return text;
  }

  /**
   * Check if element contains educational content
   */
  function isEducationalElement(element) {
    if (!element) return false;

    const tagName = element.tagName.toLowerCase();

    // Exclude non-educational elements
    const excludeTags = ['nav', 'header', 'footer', 'aside', 'button', 'input', 'select'];
    if (excludeTags.includes(tagName)) return false;

    // Exclude by role
    const role = element.getAttribute('role');
    const excludeRoles = ['navigation', 'banner', 'contentinfo', 'complementary', 'search'];
    if (role && excludeRoles.includes(role)) return false;

    // Exclude ads and navigation
    const className = element.className || '';
    const excludeClasses = ['ad', 'advertisement', 'nav', 'menu', 'sidebar', 'promo'];
    if (excludeClasses.some(cls => className.toLowerCase().includes(cls))) return false;

    // Include educational elements
    const eduTags = ['p', 'article', 'section', 'main', 'li', 'figcaption', 'blockquote', 'dd', 'dt'];
    return eduTags.includes(tagName);
  }

  /**
   * Extract educational context around an element
   */
  function getEducationalContext(element, maxChars = 300) {
    const context = [];

    // Get parent context (for nested elements)
    let parent = element.parentElement;
    while (parent && context.join(' ').length < maxChars) {
      const tag = parent.tagName.toLowerCase();
      if (['article', 'section', 'main', 'figure'].includes(tag)) {
        // Get heading if exists
        const heading = parent.querySelector('h1, h2, h3, h4');
        if (heading) {
          context.unshift(heading.innerText.trim());
        }
        break;
      }
      parent = parent.parentElement;
    }

    // Get preceding sibling context
    let prevSibling = element.previousElementSibling;
    if (prevSibling && isEducationalElement(prevSibling)) {
      const text = cleanTextForAI(prevSibling).slice(0, 150);
      if (text.length > 20) {
        context.push(text);
      }
    }

    // Get following sibling context
    let nextSibling = element.nextElementSibling;
    if (nextSibling && isEducationalElement(nextSibling)) {
      const text = cleanTextForAI(nextSibling).slice(0, 150);
      if (text.length > 20) {
        context.push(text);
      }
    }

    return context.join(' ').slice(0, maxChars);
  }

  /**
   * Extract alt text and captions from visual elements
   */
  function extractVisualMetadata(element) {
    const metadata = {
      alt: '',
      caption: '',
      title: '',
      ariaLabel: ''
    };

    // Get alt text
    metadata.alt = element.getAttribute('alt') || '';

    // Get title
    metadata.title = element.getAttribute('title') || '';

    // Get aria-label
    metadata.ariaLabel = element.getAttribute('aria-label') || '';

    // Get caption (figcaption)
    const figure = element.closest('figure');
    if (figure) {
      const figcaption = figure.querySelector('figcaption');
      if (figcaption) {
        metadata.caption = cleanTextForAI(figcaption);
      }
    }

    // Look for caption in nearby elements
    const nextSib = element.nextElementSibling;
    if (nextSib && nextSib.classList.contains('caption')) {
      metadata.caption = cleanTextForAI(nextSib);
    }

    return metadata;
  }

  // ===========================================
  // KEYBOARD SHORTCUTS
  // ===========================================

  function handleKeydown(e) {
    // Alt+A - Toggle panel
    if (e.altKey && e.key.toLowerCase() === 'a') {
      e.preventDefault();
      togglePanel();
    }

    // Alt+S - Simplify selection
    if (e.altKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      const selection = window.getSelection().toString().trim();
      if (selection) {
        selectedText = selection;
        callAI('simplify', selection, 'Simplified Text');
      }
    }

    // Alt+R - Read selection aloud
    if (e.altKey && (e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      const selection = window.getSelection().toString().trim();
      if (selection) {
        selectedText = selection;
        speakText(selection);
      } else {
        readPageAloud();
      }
    }

    // Escape - Close panel/modal
    if (e.key === 'Escape') {
      if (elements.modal.classList.contains('active')) {
        closeModal();
      } else if (panelVisible) {
        togglePanel();
      }
      hideTooltip();
    }
  }

  // ===========================================
  // INTERACTIVE CONTENT DETECTION
  // ===========================================

  function detectInteractiveContent() {
    const results = {
      quizzes: [],
      videos: [],
      animations: [],
      forms: [],
      diagrams: []
    };

    // ===========================================
    // QUIZ DETECTION - Broad selectors for all sites
    // ===========================================

    // 1. Detect forms with radio/checkbox inputs (likely quizzes)
    const formElements = document.querySelectorAll('form, [role="form"]');
    formElements.forEach(el => {
      if (el.querySelectorAll('input[type="radio"], input[type="checkbox"]').length > 0) {
        if (!results.quizzes.includes(el)) {
          results.quizzes.push(el);
          el.classList.add('accessilens-quiz-detected');
        }
      } else {
        results.forms.push(el);
      }
    });

    // 2. Detect quiz-like containers by class names (broad matching)
    const quizSelectors = [
      '.quiz', '.test', '.assessment', '.question', '.exam',
      '[data-quiz]', '[data-test]', '[data-question]',
      '.multiple-choice', '.mcq', '.question-container',
      '[data-question-type]', '.answer-choice', '.quiz-container',
      '.trivia', '.poll', '.survey',
      // Common quiz platform selectors
      '[class*="quiz"]', '[class*="question"]', '[class*="answer"]',
      '[id*="quiz"]', '[id*="question"]',
      // Fieldsets with legends (often used for quiz questions)
      'fieldset:has(input[type="radio"])', 'fieldset:has(input[type="checkbox"])'
    ].join(', ');

    try {
      const quizElements = document.querySelectorAll(quizSelectors);
      quizElements.forEach(el => {
        if (!results.quizzes.includes(el) && !el.closest('.accessilens-quiz-detected')) {
          results.quizzes.push(el);
          el.classList.add('accessilens-quiz-detected');
        }
      });
    } catch (e) {
      // Some selectors like :has() may not be supported in older browsers
      console.log('AccessiLens: Some advanced quiz selectors not supported');
    }

    // 3. Find any container with multiple radio buttons (likely a quiz question)
    const radioGroups = document.querySelectorAll('div, section, article, li');
    radioGroups.forEach(el => {
      const radioCount = el.querySelectorAll('input[type="radio"]').length;
      if (radioCount >= 2 && radioCount <= 10 && !el.closest('.accessilens-quiz-detected')) {
        // This looks like a quiz question with multiple choice answers
        if (!results.quizzes.includes(el)) {
          results.quizzes.push(el);
          el.classList.add('accessilens-quiz-detected');
        }
      }
    });

    // ===========================================
    // VIDEO DETECTION - Broad selectors for all sites
    // ===========================================

    const videoSelectors = [
      // Native HTML5 video
      'video',
      // YouTube (embedded and native)
      'iframe[src*="youtube"]', 'iframe[src*="youtu.be"]',
      '#movie_player', '.html5-video-player', '.ytp-player',
      '[class*="youtube-player"]', '#player', '.video-stream',
      // Vimeo
      'iframe[src*="vimeo"]', '.vimeo-player',
      // General video embeds
      'iframe[src*="embed"]', 'iframe[src*="video"]', 'iframe[src*="player"]',
      // Common video player classes
      '.video-player', '.video-container', '.video-wrapper',
      '[data-video]', '[data-video-id]', '[data-youtube]',
      '[class*="video-player"]', '[class*="video-container"]',
      '[id*="video-player"]', '[id*="player"]',
      // Media players
      '.jwplayer', '.video-js', '.plyr', '.mejs-container',
      // Streaming platforms
      'iframe[src*="twitch"]', 'iframe[src*="dailymotion"]',
      'iframe[src*="wistia"]', 'iframe[src*="brightcove"]'
    ].join(', ');

    const videoElements = document.querySelectorAll(videoSelectors);
    videoElements.forEach(el => {
      if (!results.videos.includes(el)) {
        results.videos.push(el);
        el.classList.add('accessilens-video-detected');
      }
    });

    // ===========================================
    // ANIMATION DETECTION
    // ===========================================

    const animatedElements = document.querySelectorAll('[class*="animate"], [class*="animation"], canvas, svg[class*="animated"], .lottie');
    animatedElements.forEach(el => {
      results.animations.push(el);
    });

    // ===========================================
    // DIAGRAM/CHART DETECTION
    // ===========================================

    const diagramElements = document.querySelectorAll('svg, canvas, .chart, .diagram, .graph, [role="img"], figure img');
    diagramElements.forEach(el => {
      results.diagrams.push(el);
    });

    console.log(`🔍 AccessiLens detected: ${results.videos.length} videos, ${results.quizzes.length} quizzes, ${results.diagrams.length} diagrams`);
    return results;
  }

  // Auto-detect and enhance content on page load
  function autoDetectContent() {
    console.log('🔍 AccessiLens: Auto-scanning for interactive content...');
    const content = detectInteractiveContent();

    if (content.videos.length > 0) {
      enhanceVideos(content.videos);
      console.log(`📹 AccessiLens: Enhanced ${content.videos.length} video(s)`);
    }

    if (content.quizzes.length > 0) {
      enhanceQuizzes(content.quizzes);
      console.log(`🎓 AccessiLens: Enhanced ${content.quizzes.length} quiz element(s)`);
    }

    // Show a subtle notification if content was found
    if (content.videos.length > 0 || content.quizzes.length > 0) {
      showContentNotification(content);
    }
  }

  // Show a subtle notification when content is detected
  function showContentNotification(content) {
    const notification = document.createElement('div');
    notification.className = 'accessilens-content-notification';
    notification.innerHTML = `
      <div class="accessilens-notif-icon">🔍</div>
      <div class="accessilens-notif-text">
        <strong>AccessiLens detected:</strong>
        ${content.videos.length > 0 ? `📹 ${content.videos.length} video(s)` : ''}
        ${content.quizzes.length > 0 ? `🎓 ${content.quizzes.length} quiz(es)` : ''}
      </div>
      <button class="accessilens-notif-close">×</button>
    `;

    notification.querySelector('.accessilens-notif-close').addEventListener('click', () => {
      notification.remove();
    });

    document.body.appendChild(notification);

    // Auto-hide after 5 seconds
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
      }
    }, 5000);
  }

  function enhanceQuizzes(quizzes) {
    quizzes.forEach(quiz => {
      if (quiz.dataset.accessilensEnhanced) return;
      quiz.dataset.accessilensEnhanced = 'true';

      // Create quiz helper button
      const helper = document.createElement('button');
      helper.className = 'accessilens-quiz-helper';
      helper.innerHTML = '🎓 Need Help?';
      helper.title = 'Get accessibility help for this quiz';
      helper.addEventListener('click', () => {
        const questionText = quiz.innerText.slice(0, 2000);
        callAI('simplifyQuiz', questionText, 'Simplified Quiz Question');
      });

      // Insert helper at the start of quiz
      quiz.insertBefore(helper, quiz.firstChild);
    });
  }
  // ===========================================
  // EDUCATIONAL CONTENT ENHANCEMENTS
  // Add these functions to content.js after enhanceQuizzes()
  // ===========================================

  // DIAGRAM & CHART ENHANCEMENT
  function enhanceDiagrams(diagrams) {
    diagrams.forEach(diagram => {
      if (diagram.dataset.accessilensEnhanced) return;
      diagram.dataset.accessilensEnhanced = 'true';

      const helper = document.createElement('button');
      helper.className = 'accessilens-diagram-helper';
      helper.innerHTML = '🔍 Describe';
      helper.title = 'Get AI description of this diagram/chart';
      helper.addEventListener('click', () => {
        describeDiagram(diagram);
      });

      const parent = diagram.parentElement;
      if (parent && !parent.querySelector('.accessilens-diagram-helper')) {
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.position === 'static') {
          parent.style.position = 'relative';
        }
        parent.appendChild(helper);
      }
    });
  }

  async function describeDiagram(diagram) {
    const metadata = extractVisualMetadata(diagram);
    const context = getEducationalContext(diagram);

    const parts = [];
    if (metadata.alt) parts.push(`Alt text: ${metadata.alt}`);
    if (metadata.caption) parts.push(`Caption: ${metadata.caption}`);
    if (metadata.title) parts.push(`Title: ${metadata.title}`);
    if (context) parts.push(`Context: ${context}`);

    const diagramInfo = parts.length > 0
      ? parts.join('\n')
      : 'Visual element on an educational page.';

    const prompt = `You are helping a student with learning difficulties understand this educational diagram/chart.

${diagramInfo}

Provide:
1. What this diagram/chart shows
2. Key elements and relationships
3. What the student should learn
4. Simple explanation of complex parts`;

    showModal('Diagram Description', 'Analyzing...', '');

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'AI_REQUEST',
        action: 'describeVisual',
        text: prompt
      });

      if (!response.error) {
        document.getElementById('accessilens-ai-content').innerHTML =
          `<div style="white-space: pre-wrap;">${escapeHtml(response.result)}</div>`;
        trackAIRequest('diagram', context.slice(0, 50) || 'diagram');
      }
    } catch (error) {
      console.error('Diagram description error:', error);
    }
  }

  // MATH EQUATION SUPPORT
  function detectMathContent() {
    const mathElements = [];

    // MathML
    document.querySelectorAll('math, .math, [class*="math"]').forEach(el =>
      mathElements.push({ element: el, type: 'mathml' }));

    // LaTeX patterns
    document.querySelectorAll('p, li, dd, span, div').forEach(el => {
      const text = el.textContent;
      if (text.match(/\$.*\$|\\\(.*\\\)|\\frac|\\sqrt|=.*[+\-*/]/)) {
        if (!el.closest('.accessilens-math-detected')) {
          mathElements.push({ element: el, type: 'latex' });
        }
      }
    });

    return mathElements;
  }

  function enhanceMathEquations(mathElements) {
    mathElements.forEach(({ element, type }) => {
      if (element.dataset.accessilensEnhanced) return;
      element.dataset.accessilensEnhanced = 'true';
      element.classList.add('accessilens-math-detected');

      const helper = document.createElement('button');
      helper.className = 'accessilens-math-helper';
      helper.innerHTML = '🔢';
      helper.title = 'Explain this equation';
      helper.addEventListener('click', () => explainMathEquation(element, type));

      element.style.position = 'relative';
      element.appendChild(helper);
    });
  }

  async function explainMathEquation(element, type) {
    const equationText = cleanTextForAI(element);
    const context = getEducationalContext(element);

    const prompt = `Explain this math equation step-by-step for a student with learning difficulties:

Equation: ${equationText}
Context: ${context || 'Educational lesson'}

Provide:
1. What the equation means simply
2. Step-by-step solution
3. What symbols mean
4. Real-world example`;

    showModal('Math Explanation', equationText, '');

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'AI_REQUEST',
        action: 'stepByStep',
        text: prompt
      });

      if (!response.error) {
        document.getElementById('accessilens-ai-content').innerHTML =
          `<div style="white-space: pre-wrap;">${escapeHtml(response.result)}</div>`;
        trackAIRequest('math', equationText.slice(0, 50));
      }
    } catch (error) {
      console.error('Math explanation error:', error);
    }
  }

  // PROGRESS TRACKING
  let sessionStartTime = Date.now();
  let currentSessionData = {
    url: window.location.href,
    duration: 0,
    aiRequests: [],
    featuresUsed: new Set()
  };

  function trackAIRequest(type, topic) {
    currentSessionData.aiRequests.push({
      type,
      topic: topic.slice(0, 100),
      timestamp: Date.now()
    });
    saveSessionData();
    updateStats('aiRequests');
  }

  function trackFeatureUse(feature) {
    currentSessionData.featuresUsed.add(feature);
    saveSessionData();
    updateStats('featuresUsed');
  }

  function saveSessionData() {
    currentSessionData.duration = Math.floor((Date.now() - sessionStartTime) / 1000);

    chrome.storage.local.get(['sessions'], (result) => {
      const sessions = result.sessions || [];
      const sessionToSave = {
        ...currentSessionData,
        featuresUsed: Array.from(currentSessionData.featuresUsed),
        timestamp: sessionStartTime
      };

      const existingIndex = sessions.findIndex(s =>
        s.url === currentSessionData.url && s.timestamp === sessionStartTime);

      if (existingIndex >= 0) {
        sessions[existingIndex] = sessionToSave;
      } else {
        sessions.push(sessionToSave);
        if (sessions.length > 50) sessions.shift();
      }

      chrome.storage.local.set({ sessions });
    });
  }

  async function generateLearningInsights() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['sessions'], (result) => {
        const sessions = result.sessions || [];

        if (sessions.length === 0) {
          resolve({
            totalSessions: 0,
            totalTime: 0,
            mostUsedFeature: 'None yet',
            strugglingTopics: [],
            aiRequestsByType: {}
          });
          return;
        }

        const insights = {
          totalSessions: sessions.length,
          totalTime: sessions.reduce((sum, s) => sum + s.duration, 0),
          mostUsedFeature: 'None',
          strugglingTopics: [],
          aiRequestsByType: {}
        };

        // Most used feature
        const featureCounts = {};
        sessions.forEach(s =>
          (s.featuresUsed || []).forEach(f => featureCounts[f] = (featureCounts[f] || 0) + 1));

        let maxCount = 0;
        Object.entries(featureCounts).forEach(([f, count]) => {
          if (count > maxCount) {
            maxCount = count;
            insights.mostUsedFeature = f;
          }
        });

        // AI requests by type
        sessions.forEach(s => {
          (s.aiRequests || []).forEach(req => {
            insights.aiRequestsByType[req.type] = (insights.aiRequestsByType[req.type] || 0) + 1;

            const topicCount = sessions.reduce((count, sess) =>
              count + (sess.aiRequests || []).filter(r => r.topic === req.topic).length, 0);

            if (topicCount >= 3 && !insights.strugglingTopics.includes(req.topic)) {
              insights.strugglingTopics.push(req.topic);
            }
          });
        });

        resolve(insights);
      });
    });
  }

  async function showProgressDashboard() {
    const insights = await generateLearningInsights();
    const hours = Math.floor(insights.totalTime / 3600);
    const minutes = Math.floor((insights.totalTime % 3600) / 60);
    const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    const aiTypesHTML = Object.entries(insights.aiRequestsByType)
      .map(([type, count]) => `<li><strong>${type}:</strong> ${count} times</li>`).join('');

    const strugglingHTML = insights.strugglingTopics.length > 0
      ? `<ul>${insights.strugglingTopics.slice(0, 5).map(t => `<li>${t}</li>`).join('')}</ul>`
      : '<p>Great! No struggling topics detected.</p>';

    showModal('📊 Learning Progress', '', `
    <div style="padding: 16px;">
      <h3>Your Learning Journey</h3>
      <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin: 16px 0;">
        <strong>Study Time:</strong> ${timeStr} (${insights.totalSessions} sessions)<br>
        <strong>Most Used:</strong> ${insights.mostUsedFeature}
      </div>
      <strong>AI Assistance:</strong>
      <ul>${aiTypesHTML || '<li>No requests yet</li>'}</ul>
      <strong>Topics Needing Help:</strong>
      ${strugglingHTML}
    </div>
  `);
  }

  function enhanceVideos(videos) {
    videos.forEach(video => {
      if (video.dataset.accessilensEnhanced) return;
      video.dataset.accessilensEnhanced = 'true';

      // Create floating video control buttons
      const overlay = document.createElement('div');
      overlay.className = 'accessilens-video-controls';

      // Different controls for HTML5 video vs iframe
      const isHTML5Video = video.tagName === 'VIDEO';

      if (isHTML5Video) {
        // For HTML5 videos, we can control playback
        overlay.innerHTML = `
          <button class="accessilens-video-btn" data-action="slow" title="Toggle Slow Playback (0.5x/1x)">🐢</button>
          <button class="accessilens-video-btn" data-action="transcript" title="Extract & Simplify Captions">�</button>
        `;
      } else {
        // For iframes (YouTube, Vimeo, etc.), focus on transcript extraction
        overlay.innerHTML = `
          <button class="accessilens-video-btn" data-action="transcript" title="Extract Video Transcript/Captions">📝</button>
          <button class="accessilens-video-btn" data-action="help" title="Accessibility Tips">❓</button>
        `;
      }

      overlay.querySelectorAll('.accessilens-video-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          handleVideoAction(video, btn.dataset.action);
        });
      });

      // Position the overlay relative to the video WITHOUT wrapping it
      const parent = video.parentElement;
      if (parent && !parent.querySelector('.accessilens-video-controls')) {
        const parentStyle = window.getComputedStyle(parent);
        if (parentStyle.position === 'static') {
          parent.style.position = 'relative';
        }
        parent.appendChild(overlay);
      }
    });
  }

  // Helper to escape HTML for display in modal
  function escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function (m) { return map[m]; });
  }

  // Placeholder for showLoading - assuming it shows/hides a loading indicator
  function showLoading() {
    // Implement your loading indicator logic here
    // For now, we'll just log it.
    console.log('AccessiLens: Showing loading indicator...');
    // A simple way to show a loading state in the modal might be:
    // const modalContent = document.getElementById('accessilens-ai-content');
    // if (modalContent) modalContent.innerHTML = '<div style="text-align: center; padding: 20px;">Loading...</div>';
  }

  // Try to extract YouTube transcript from the page
  async function extractYouTubeTranscript() {
    try {
      // YouTube doesn't expose transcript directly, but we can try to find it
      // Look for the transcript button and panel
      const transcriptButton = document.querySelector('[aria-label*="transcript" i], [aria-label*="Show transcript" i]');

      if (transcriptButton) {
        // Click to open transcript panel if not already open
        const panel = document.querySelector('ytd-engagement-panel-section-list-renderer[target-id="engagement-panel-searchable-transcript"]');
        if (!panel || !panel.hasAttribute('visibility')) {
          transcriptButton.click();
          // Wait for panel to load
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Extract transcript segments
        const segments = document.querySelectorAll('ytd-transcript-segment-renderer');
        if (segments.length > 0) {
          const transcriptText = Array.from(segments)
            .map(seg => seg.querySelector('.segment-text')?.textContent?.trim())
            .filter(Boolean)
            .join(' ');

          return transcriptText;
        }
      }

      return null;
    } catch (error) {
      console.log('AccessiLens: Could not extract YouTube transcript:', error);
      return null;
    }
  }

  // Try to extract HTML5 video captions
  function extractHTML5Captions(video) {
    try {
      const tracks = video.querySelectorAll('track[kind="captions"], track[kind="subtitles"]');
      if (tracks.length === 0) return null;

      // Get the first available track
      const track = tracks[0];
      const trackElement = video.textTracks[0];

      if (trackElement && trackElement.cues) {
        const captions = Array.from(trackElement.cues)
          .map(cue => cue.text)
          .join(' ');
        return captions;
      }

      return null;
    } catch (error) {
      console.log('AccessiLens: Could not extract HTML5 captions:', error);
      return null;
    }
  }

  // Search for transcript text on the page
  function findTranscriptOnPage() {
    // Look for common transcript containers
    const selectors = [
      '[class*="transcript"]',
      '[id*="transcript"]',
      '[data-transcript]',
      '.captions',
      '.subtitles'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.length > 100) {
        return element.textContent.trim();
      }
    }

    return null;
  }

  async function handleVideoAction(video, action) {
    const pageTitle = document.title;
    const isYouTube = window.location.hostname.includes('youtube.com');
    const isHTML5Video = video.tagName === 'VIDEO';

    switch (action) {
      case 'slow':
        if (isHTML5Video) {
          const newRate = video.playbackRate === 1 ? 0.5 : 1;
          video.playbackRate = newRate;
          const rate = newRate === 1 ? 'Normal speed' : 'Half speed (0.5x)';
          showModal('Playback Speed', 'Speed Changed',
            `Video playback speed set to: ${rate}\n\nClick the button again to toggle.`);
        }
        break;

      case 'transcript':
        showLoading();
        showModal('Extracting Transcript', '', '');

        let transcript = null;
        let source = '';

        // Try different methods to get transcript
        if (isYouTube) {
          transcript = await extractYouTubeTranscript();
          source = 'YouTube captions';
        } else if (isHTML5Video) {
          transcript = extractHTML5Captions(video);
          source = 'Video captions';
        }

        // Fallback: look for transcript on the page
        if (!transcript) {
          transcript = findTranscriptOnPage();
          source = 'Page transcript';
        }

        if (transcript && transcript.length > 50) {
          // We found a real transcript! Now simplify it
          const simplifyPrompt = `Please simplify this video transcript to make it easier to understand for someone with learning difficulties:

${transcript.slice(0, 3000)}

Make it:
- Use simpler words
- Shorter sentences
- Clear paragraph breaks
- Highlight key concepts in **bold**

Keep the main ideas but make it more accessible.`;

          try {
            const response = await chrome.runtime.sendMessage({
              type: 'AI_REQUEST',
              action: 'enhanceTranscript',
              text: simplifyPrompt
            });

            if (response.error) {
              // Show original transcript if AI fails
              document.getElementById('accessilens-ai-content').innerHTML = `
                <div><strong>Original Transcript (${source}):</strong></div>
                <div style="white-space: pre-wrap; margin-top: 12px;">${escapeHtml(transcript.slice(0, 2000))}</div>
                ${transcript.length > 2000 ? '<div style="margin-top: 8px; color: #666;">(Transcript truncated - showing first 2000 characters)</div>' : ''}
              `;
            } else {
              document.getElementById('accessilens-ai-content').innerHTML = `
                <div style="white-space: pre-wrap;">${escapeHtml(response.result)}</div>
                <hr style="margin: 16px 0; border: none; border-top: 1px solid #e5e7eb;">
                <div style="font-size: 12px; color: #666;">Source: ${source}</div>
              `;
            }
          } catch (error) {
            document.getElementById('accessilens-ai-content').innerHTML = `
              <div><strong>Original Transcript (${source}):</strong></div>
              <div style="white-space: pre-wrap; margin-top: 12px;">${escapeHtml(transcript.slice(0, 2000))}</div>
            `;
          }
        } else {
          // No transcript found
          const videoTitle = video.getAttribute('title') ||
            document.querySelector('h1')?.textContent?.trim() ||
            pageTitle;

          document.getElementById('accessilens-ai-content').innerHTML = `
            <div style="color: #ef4444; margin-bottom: 16px;">
              <strong>⚠️ No transcript available</strong>
            </div>
            <div style="margin-bottom: 12px;">
              We couldn't find captions or a transcript for this video.
            </div>
            <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin-top: 16px;">
              <strong>Suggestions:</strong>
              <ul style="margin: 8px 0; padding-left: 20px;">
                ${isYouTube ? '<li>Try enabling YouTube captions (CC button on player)</li>' : ''}
                <li>Search for: "${videoTitle} transcript" on Google</li>
                <li>Search for: "${videoTitle} summary" for a written explanation</li>
                <li>Check if the video has a description with key points</li>
              </ul>
            </div>
          `;
        }
        break;

      case 'help':
        showModal('Video Accessibility Help', 'Tips for This Video', `
          <strong>Built-in Player Controls:</strong>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li><strong>Pause/Play:</strong> Click the video or press Spacebar</li>
            <li><strong>Slow Down:</strong> Click settings (⚙️) → Playback speed → Choose 0.5x or 0.75x</li>
            <li><strong>Captions:</strong> Click CC button to enable subtitles</li>
            <li><strong>Skip:</strong> Press arrow keys to jump forward/backward</li>
          </ul>
          
          <strong style="display: block; margin-top: 16px;">Accessibility Tips:</strong>
          <ul style="margin: 8px 0; padding-left: 20px;">
            <li>Watch in small segments - pause after each concept</li>
            <li>Take notes of key points as you watch</li>
            <li>Rewind and rewatch difficult sections</li>
            <li>Use 0.75x speed if information is too fast</li>
          </ul>
        `);
        break;
    }
  }

  // ===========================================
  // VOICE COMMANDS
  // ===========================================

  let voiceRecognition = null;
  let voiceCommandsActive = false;

  function initVoiceCommands() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.log('Voice recognition not supported');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    voiceRecognition = new SpeechRecognition();
    voiceRecognition.continuous = true;
    voiceRecognition.interimResults = false;
    voiceRecognition.lang = 'en-US';

    voiceRecognition.onresult = (event) => {
      const last = event.results.length - 1;
      const command = event.results[last][0].transcript.toLowerCase().trim();
      processVoiceCommand(command);
    };

    voiceRecognition.onerror = (event) => {
      console.log('Voice recognition error:', event.error);
      if (event.error === 'not-allowed') {
        showVoiceStatus('Microphone access denied', 'error');
      }
    };

    voiceRecognition.onend = () => {
      if (voiceCommandsActive) {
        voiceRecognition.start(); // Restart if still active
      }
    };

    return true;
  }

  function toggleVoiceCommands(enabled) {
    if (enabled) {
      if (!voiceRecognition && !initVoiceCommands()) {
        return;
      }
      voiceCommandsActive = true;
      voiceRecognition.start();
      showVoiceStatus('🎤 Listening for commands...', 'active');
      document.body.classList.add('accessilens-voice-active');
    } else {
      voiceCommandsActive = false;
      if (voiceRecognition) {
        voiceRecognition.stop();
      }
      hideVoiceStatus();
      document.body.classList.remove('accessilens-voice-active');
    }
  }

  function processVoiceCommand(command) {
    showVoiceStatus(`Heard: "${command}"`, 'processing');

    // Define command mappings
    const commands = {
      'simplify': () => simplifyPage(),
      'simplify page': () => simplifyPage(),
      'read': () => readPageAloud(),
      'read page': () => readPageAloud(),
      'read aloud': () => readPageAloud(),
      'stop': () => stopSpeech(),
      'stop reading': () => stopSpeech(),
      'summarize': () => summarizePage(),
      'summary': () => summarizePage(),
      'dyslexia mode': () => toggleFeature('dyslexia', true),
      'dyslexia on': () => toggleFeature('dyslexia', true),
      'dyslexia off': () => toggleFeature('dyslexia', false),
      'high contrast': () => toggleFeature('highContrast', true),
      'contrast on': () => toggleFeature('highContrast', true),
      'contrast off': () => toggleFeature('highContrast', false),
      'reading mode': () => toggleFeature('readingMode', true),
      'focus mode': () => toggleFeature('readingMode', true),
      'reading ruler': () => toggleFeature('readingRuler', true),
      'ruler on': () => toggleFeature('readingRuler', true),
      'ruler off': () => toggleFeature('readingRuler', false),
      'open panel': () => { if (!panelVisible) togglePanel(); },
      'close panel': () => { if (panelVisible) togglePanel(); },
      'help': () => showVoiceHelp(),
      'scroll down': () => window.scrollBy(0, 300),
      'scroll up': () => window.scrollBy(0, -300),
      'next': () => window.scrollBy(0, window.innerHeight * 0.8),
      'back': () => window.scrollBy(0, -window.innerHeight * 0.8)
    };

    // Find matching command
    for (const [phrase, action] of Object.entries(commands)) {
      if (command.includes(phrase)) {
        action();
        showVoiceStatus(`✅ ${phrase}`, 'success');
        return;
      }
    }

    showVoiceStatus('Command not recognized. Say "help" for options.', 'error');
  }

  function showVoiceStatus(message, type) {
    let status = document.querySelector('.accessilens-voice-status');
    if (!status) {
      status = document.createElement('div');
      status.className = 'accessilens-voice-status';
      document.body.appendChild(status);
    }
    status.textContent = message;
    status.className = `accessilens-voice-status ${type}`;
    status.style.display = 'block';

    if (type !== 'active' && type !== 'processing') {
      setTimeout(() => {
        status.style.display = 'none';
      }, 3000);
    }
  }

  function hideVoiceStatus() {
    const status = document.querySelector('.accessilens-voice-status');
    if (status) status.style.display = 'none';
  }

  function showVoiceHelp() {
    const helpText = `Voice Commands Available:
• "Simplify" or "Simplify page" - Simplify content
• "Read" or "Read aloud" - Read page content
• "Stop" - Stop reading
• "Summarize" - Get page summary
• "Dyslexia on/off" - Toggle dyslexia font
• "High contrast" - Toggle high contrast
• "Reading mode" - Toggle focus mode
• "Reading ruler" - Toggle reading ruler
• "Scroll up/down" - Navigate page
• "Open/Close panel" - Toggle AccessiLens panel`;

    showModal('Voice Commands Help', 'Say any of these commands:', helpText);
  }

  // ===========================================
  // MOTOR IMPAIRMENT SUPPORT
  // ===========================================

  let dwellClickEnabled = false;
  let dwellTimeout = null;
  let dwellTarget = null;
  let dwellIndicator = null;
  const DWELL_TIME = 1500; // 1.5 seconds

  function toggleEnlargedTargets(enabled) {
    document.body.classList.toggle('accessilens-enlarged-targets', enabled);
    saveFeatureState('enlargedTargets', enabled);
  }

  function toggleDwellClick(enabled) {
    dwellClickEnabled = enabled;
    document.body.classList.toggle('accessilens-dwell-active', enabled);
    saveFeatureState('dwellClick', enabled);

    if (enabled) {
      createDwellIndicator();
      document.addEventListener('mousemove', handleDwellMove);
    } else {
      if (dwellIndicator) dwellIndicator.remove();
      document.removeEventListener('mousemove', handleDwellMove);
    }
  }

  function createDwellIndicator() {
    if (dwellIndicator) return;
    dwellIndicator = document.createElement('div');
    dwellIndicator.className = 'accessilens-dwell-indicator';
    dwellIndicator.innerHTML = '<div class="accessilens-dwell-progress"></div>';
    document.body.appendChild(dwellIndicator);
  }

  function handleDwellMove(e) {
    if (!dwellClickEnabled) return;

    const target = e.target;
    const isClickable = target.matches('a, button, input, select, textarea, [role="button"], [tabindex], [onclick]');

    if (isClickable && target !== dwellTarget) {
      // New clickable target
      clearTimeout(dwellTimeout);
      dwellTarget = target;

      // Position indicator
      const rect = target.getBoundingClientRect();
      dwellIndicator.style.left = `${rect.left + rect.width / 2}px`;
      dwellIndicator.style.top = `${rect.top - 40}px`;
      dwellIndicator.classList.add('active');

      // Start dwell timer
      dwellTimeout = setTimeout(() => {
        target.click();
        dwellIndicator.classList.remove('active');
        dwellTarget = null;
      }, DWELL_TIME);
    } else if (!isClickable) {
      // Not on clickable element
      clearTimeout(dwellTimeout);
      dwellIndicator.classList.remove('active');
      dwellTarget = null;
    }
  }

  // ===========================================
  // ANIMATION & MOTION CONTROL
  // ===========================================

  function toggleReduceMotion(enabled) {
    document.body.classList.toggle('accessilens-reduce-motion', enabled);
    saveFeatureState('reduceMotion', enabled);

    if (enabled) {
      // Pause all videos
      document.querySelectorAll('video').forEach(v => v.pause());

      // Stop CSS animations
      const style = document.createElement('style');
      style.id = 'accessilens-no-motion';
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      const style = document.getElementById('accessilens-no-motion');
      if (style) style.remove();
    }
  }

  function pauseAllMedia() {
    document.querySelectorAll('video, audio').forEach(el => el.pause());
  }

  // ===========================================
  // USER PROFILES
  // ===========================================

  const accessibilityProfiles = {
    dyslexia: {
      name: 'Dyslexia Friendly',
      icon: '📖',
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
      icon: '👁️',
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
      icon: '🖐️',
      settings: {
        dyslexia: false,
        readingRuler: false,
        readingMode: false,
        highContrast: false,
        enlargedTargets: true,
        reduceMotion: true,
        dwellClick: true
      }
    },
    cognitive: {
      name: 'Cognitive Support',
      icon: '🧠',
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

    // Save active profile
    chrome.storage.sync.set({ activeProfile: profileName });

    // Show confirmation
    showModal('Profile Applied', `${profile.icon} ${profile.name}`,
      'Your accessibility settings have been updated based on this profile.');
  }

  function createProfileSelector() {
    const selector = document.createElement('div');
    selector.className = 'accessilens-profile-selector';
    selector.innerHTML = `
      <div class="accessilens-profile-title">Quick Profiles</div>
      <div class="accessilens-profile-buttons">
        ${Object.entries(accessibilityProfiles).map(([key, profile]) => `
          <button class="accessilens-profile-btn" data-profile="${key}">
            <span class="profile-icon">${profile.icon}</span>
            <span class="profile-name">${profile.name}</span>
          </button>
        `).join('')}
      </div>
    `;

    selector.querySelectorAll('.accessilens-profile-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyProfile(btn.dataset.profile);
      });
    });

    return selector;
  }

  // ===========================================
  // ENHANCED PANEL WITH NEW FEATURES
  // ===========================================

  function createEnhancedPanel() {
    const panel = document.createElement('div');
    panel.className = 'accessilens-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'AccessiLens accessibility controls');

    panel.innerHTML = `
      <div class="accessilens-panel-header">
        <div class="accessilens-panel-title">
          ${ICONS.accessibility}
          AccessiLens
        </div>
        <button class="accessilens-panel-close" aria-label="Close panel">
          ${ICONS.close}
        </button>
      </div>
      <div class="accessilens-panel-content">
        <!-- Quick Profiles Section -->
        <div class="accessilens-section">
          <div class="accessilens-section-title">🎯 Quick Profiles</div>
          <div class="accessilens-profile-buttons">
            <button class="accessilens-profile-btn" data-profile="dyslexia">
              <span>📖</span> Dyslexia
            </button>
            <button class="accessilens-profile-btn" data-profile="lowVision">
              <span>👁️</span> Low Vision
            </button>
            <button class="accessilens-profile-btn" data-profile="motorImpairment">
              <span>🖐️</span> Motor
            </button>
            <button class="accessilens-profile-btn" data-profile="cognitive">
              <span>🧠</span> Cognitive
            </button>
          </div>
        </div>

        <!-- Display Settings -->
        <div class="accessilens-section">
          <div class="accessilens-section-title">Display Settings</div>
          
          <div class="accessilens-toggle-item">
            <div class="accessilens-toggle-label">
              <div class="accessilens-toggle-icon" style="background: linear-gradient(135deg, #fef3c7, #fcd34d);">
                📖
              </div>
              <span class="accessilens-toggle-text">Dyslexia-Friendly Font</span>
            </div>
            <label class="accessilens-toggle-switch">
              <input type="checkbox" id="accessilens-dyslexia" />
              <span class="accessilens-toggle-slider"></span>
            </label>
          </div>
          
          <div class="accessilens-toggle-item">
            <div class="accessilens-toggle-label">
              <div class="accessilens-toggle-icon" style="background: linear-gradient(135deg, #1e293b, #334155);">
                🌓
              </div>
              <span class="accessilens-toggle-text">High Contrast</span>
            </div>
            <label class="accessilens-toggle-switch">
              <input type="checkbox" id="accessilens-contrast" />
              <span class="accessilens-toggle-slider"></span>
            </label>
          </div>
          
          <div class="accessilens-toggle-item">
            <div class="accessilens-toggle-label">
              <div class="accessilens-toggle-icon" style="background: linear-gradient(135deg, #dbeafe, #93c5fd);">
                👁️
              </div>
              <span class="accessilens-toggle-text">Reading Mode</span>
            </div>
            <label class="accessilens-toggle-switch">
              <input type="checkbox" id="accessilens-reading" />
              <span class="accessilens-toggle-slider"></span>
            </label>
          </div>
          
          <div class="accessilens-toggle-item">
            <div class="accessilens-toggle-label">
              <div class="accessilens-toggle-icon" style="background: linear-gradient(135deg, #fce7f3, #f9a8d4);">
                📏
              </div>
              <span class="accessilens-toggle-text">Reading Ruler</span>
            </div>
            <label class="accessilens-toggle-switch">
              <input type="checkbox" id="accessilens-ruler" />
              <span class="accessilens-toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Motor Impairment Section -->
        <div class="accessilens-section">
          <div class="accessilens-section-title">🖐️ Motor Support</div>
          
          <div class="accessilens-toggle-item">
            <div class="accessilens-toggle-label">
              <div class="accessilens-toggle-icon" style="background: linear-gradient(135deg, #dcfce7, #86efac);">
                🔍
              </div>
              <span class="accessilens-toggle-text">Enlarged Click Targets</span>
            </div>
            <label class="accessilens-toggle-switch">
              <input type="checkbox" id="accessilens-enlarged" />
              <span class="accessilens-toggle-slider"></span>
            </label>
          </div>
          
          <div class="accessilens-toggle-item">
            <div class="accessilens-toggle-label">
              <div class="accessilens-toggle-icon" style="background: linear-gradient(135deg, #e0e7ff, #a5b4fc);">
                🎯
              </div>
              <span class="accessilens-toggle-text">Dwell Click (Hover to Click)</span>
            </div>
            <label class="accessilens-toggle-switch">
              <input type="checkbox" id="accessilens-dwell" />
              <span class="accessilens-toggle-slider"></span>
            </label>
          </div>

          <div class="accessilens-toggle-item">
            <div class="accessilens-toggle-label">
              <div class="accessilens-toggle-icon" style="background: linear-gradient(135deg, #fef9c3, #fde047);">
                🎤
              </div>
              <span class="accessilens-toggle-text">Voice Commands</span>
            </div>
            <label class="accessilens-toggle-switch">
              <input type="checkbox" id="accessilens-voice" />
              <span class="accessilens-toggle-slider"></span>
            </label>
          </div>
        </div>

        <!-- Animation & Media Section -->
        <div class="accessilens-section">
          <div class="accessilens-section-title">🎬 Animation & Media</div>
          
          <div class="accessilens-toggle-item">
            <div class="accessilens-toggle-label">
              <div class="accessilens-toggle-icon" style="background: linear-gradient(135deg, #fee2e2, #fca5a5);">
                ⏸️
              </div>
              <span class="accessilens-toggle-text">Reduce Motion</span>
            </div>
            <label class="accessilens-toggle-switch">
              <input type="checkbox" id="accessilens-motion" />
              <span class="accessilens-toggle-slider"></span>
            </label>
          </div>
          
          <button class="accessilens-action-btn-full" id="accessilens-pause-media">
            ⏹️ Pause All Media
          </button>
        </div>
        
        <!-- Quick Actions -->
        <div class="accessilens-section">
          <div class="accessilens-section-title">Quick Actions</div>
          <div class="accessilens-action-buttons">
            <button class="accessilens-action-btn" id="accessilens-simplify-page">
              ${ICONS.simplify}
              <span>Simplify Page</span>
            </button>
            <button class="accessilens-action-btn" id="accessilens-read-aloud">
              ${ICONS.speak}
              <span>Read Aloud</span>
            </button>
            <button class="accessilens-action-btn" id="accessilens-summarize">
              ${ICONS.sparkle}
              <span>Summarize</span>
            </button>
            <button class="accessilens-action-btn" id="accessilens-stop-speech">
              ${ICONS.close}
              <span>Stop Speech</span>
            </button>
          </div>
        </div>

        <!-- Interactive Content Section -->
        <div class="accessilens-section">
          <div class="accessilens-section-title">📚 Interactive Content</div>
          <button class="accessilens-action-btn-full" id="accessilens-scan-content">
            🔍 Scan & Enhance Page Content
          </button>
        </div>
        
        <div class="accessilens-section" style="font-size: 12px; color: #64748b; text-align: center;">
          <strong>Tip:</strong> Select text on the page for AI-powered options
          <div class="accessilens-shortcut" style="margin-top: 8px; justify-content: center;">
            <span class="accessilens-kbd">Alt</span>+<span class="accessilens-kbd">A</span> Toggle Panel
          </div>
        </div>
      </div>
    `;

    // Event listeners
    panel.querySelector('.accessilens-panel-close').addEventListener('click', togglePanel);

    // Profile buttons
    panel.querySelectorAll('.accessilens-profile-btn').forEach(btn => {
      btn.addEventListener('click', () => applyProfile(btn.dataset.profile));
    });

    // Display toggles
    panel.querySelector('#accessilens-dyslexia').addEventListener('change', (e) => {
      toggleFeature('dyslexia', e.target.checked);
    });
    panel.querySelector('#accessilens-contrast').addEventListener('change', (e) => {
      toggleFeature('highContrast', e.target.checked);
    });
    panel.querySelector('#accessilens-reading').addEventListener('change', (e) => {
      toggleFeature('readingMode', e.target.checked);
    });
    panel.querySelector('#accessilens-ruler').addEventListener('change', (e) => {
      toggleFeature('readingRuler', e.target.checked);
    });

    // Motor support toggles
    panel.querySelector('#accessilens-enlarged').addEventListener('change', (e) => {
      toggleEnlargedTargets(e.target.checked);
    });
    panel.querySelector('#accessilens-dwell').addEventListener('change', (e) => {
      toggleDwellClick(e.target.checked);
    });
    panel.querySelector('#accessilens-voice').addEventListener('change', (e) => {
      toggleVoiceCommands(e.target.checked);
    });

    // Animation controls
    panel.querySelector('#accessilens-motion').addEventListener('change', (e) => {
      toggleReduceMotion(e.target.checked);
    });
    panel.querySelector('#accessilens-pause-media').addEventListener('click', pauseAllMedia);

    // Action buttons
    panel.querySelector('#accessilens-simplify-page').addEventListener('click', simplifyPage);
    panel.querySelector('#accessilens-read-aloud').addEventListener('click', readPageAloud);
    panel.querySelector('#accessilens-summarize').addEventListener('click', summarizePage);
    panel.querySelector('#accessilens-stop-speech').addEventListener('click', stopSpeech);

    // Scan content button
    panel.querySelector('#accessilens-scan-content').addEventListener('click', () => {
      const content = detectInteractiveContent();
      enhanceQuizzes(content.quizzes);
      enhanceVideos(content.videos);
      showModal('Content Enhanced', 'Interactive elements detected:',
        `• ${content.quizzes.length} quizzes/forms enhanced\n• ${content.videos.length} videos enhanced\n• ${content.diagrams.length} diagrams detected`);
    });

    document.body.appendChild(panel);
    return panel;
  }

  // Override the original createPanel
  const originalCreatePanel = createPanel;
  createPanel = createEnhancedPanel;

  // ===========================================
  // MESSAGE HANDLING
  // ===========================================

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case 'TOGGLE_FEATURE':
        toggleFeature(message.feature, message.enabled);
        // Update UI toggle
        const toggleMap = {
          dyslexiaFont: 'accessilens-dyslexia',
          highContrast: 'accessilens-contrast',
          readingMode: 'accessilens-reading'
        };
        const toggleId = toggleMap[message.feature];
        if (toggleId) {
          const toggle = document.getElementById(toggleId);
          if (toggle) toggle.checked = message.enabled;
        }
        break;

      case 'EXECUTE_COMMAND':
        if (message.command === 'simplifyPage') {
          simplifyPage();
        } else if (message.command === 'readAloud') {
          readPageAloud();
        } else if (message.command === 'scanContent') {
          const content = detectInteractiveContent();
          enhanceQuizzes(content.quizzes);
          enhanceVideos(content.videos);
        }
        break;

      case 'TOGGLE_PANEL':
        togglePanel();
        break;

      case 'APPLY_PROFILE':
        applyProfile(message.profile);
        break;
    }
    return true;
  });

  // ===========================================
  // INITIALIZATION
  // ===========================================

  let elements = {};
  ;

  function init() {
    // Create UI elements
    elements.fab = createFAB();
    elements.panel = createPanel();
    elements.tooltip = createTooltip();
    elements.ruler = createReadingRuler();
    elements.modal = createModal();

    // Event listeners
    document.addEventListener('mouseup', () => {
      setTimeout(handleTextSelection, 10);
    });
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', (e) => {
      if (!elements.tooltip.contains(e.target)) {
        hideTooltip();
      }
    });

    // Load saved settings
    loadSettings();

    // Track page visit
    updateStats('pages');

    // Load voices for speech synthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }

    // AUTO-DETECT interactive content on page load
    // Use a delay to wait for dynamic content to load
    setTimeout(() => {
      autoDetectContent();
    }, 2000);

    // Also detect when page becomes fully loaded (for SPAs)
    window.addEventListener('load', () => {
      setTimeout(autoDetectContent, 1000);
    });

    console.log('🔍 AccessiLens initialized successfully!');
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
