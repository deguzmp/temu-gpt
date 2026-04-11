// Configuration: The backend now proxies requests to LM Studio
const PROXY_URL = "/api/chat"; 

// --- Theme Toggling ---
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Load saved theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);

function appendMessage(role, text) {
    const chatHistory = document.getElementById('chatHistory');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'bubble';
    bubbleDiv.textContent = text;
    
    messageDiv.appendChild(bubbleDiv);
    chatHistory.appendChild(messageDiv);
    
    // Auto-scroll to bottom
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function showTypingIndicator() {
    const chatHistory = document.getElementById('chatHistory');
    const indicator = document.createElement('div');
    indicator.id = 'typingIndicator';
    indicator.className = 'message assistant';
    indicator.innerHTML = `
        <div class="bubble typing">
            <span></span><span></span><span></span>
        </div>
    `;
    chatHistory.appendChild(indicator);
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

async function sendPrompt() {
    const promptInput = document.getElementById('promptInput');
    const sendBtn = document.getElementById('sendBtn');

    const userPrompt = promptInput.value.trim();
    const modelName = 'google/gemma-4-e4b';

    if (!userPrompt) return;

    // Clear input and disable button
    promptInput.value = '';
    promptInput.disabled = true;
    sendBtn.disabled = true;

    // Append user message
    appendMessage('user', userPrompt);
    
    // Show typing indicator
    showTypingIndicator();

    try {
        const response = await fetch(PROXY_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: modelName,
                messages: [
                    { role: "user", content: userPrompt }
                ],
                stream: false, 
            })
        });

        removeTypingIndicator();

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Proxy API Error (${response.status}): ${errorText}`);
        }

        const data = await response.json();
        
        if (data && data.choices && data.choices.length > 0) {
            const modelResponse = data.choices[0].message.content;
            appendMessage('assistant', modelResponse || "Empty response.");
        } else {
            throw new Error("Invalid response format.");
        }

    } catch (error) {
        removeTypingIndicator();
        console.error("Error:", error);
        appendMessage('assistant', `🔴 Error: ${error.message}`);
    } finally {
        promptInput.disabled = false;
        sendBtn.disabled = false;
        promptInput.focus();
    }
}

// Allow Enter key to send (Shift+Enter for new line)
document.getElementById('promptInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendPrompt();
    }
});

