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
