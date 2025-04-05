document.getElementById("summarize-btn").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractHighlightedText,
        });
    }
});

function extractHighlightedText() {
    let selectedText = window.getSelection().toString().trim();
    chrome.runtime.sendMessage({ action: "displaySummary", summary: selectedText });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "displaySummary") {
        document.getElementById("summary").value = request.summary || "No text selected.";
    }
});

chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true
  }).catch((error) => console.error(error));


  document.addEventListener("DOMContentLoaded", function () {
    // Chat functionality
    const userInputField = document.getElementById("user-input");
    const chatBox = document.querySelector(".tab3-content .flex-grow");
    const chatBtn = document.getElementById("chat-btn");
  
    // Chat button handler
    if (chatBtn) {
      chatBtn.addEventListener("click", function () {
        sendChatMessage();
      });
    }
  
    // Enter key handler for chat input
    if (userInputField) {
      userInputField.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
          event.preventDefault();
          sendChatMessage();
        }
      });
    }
  
    // Function to send chat messages
    function sendChatMessage() {
      if (!userInputField) return;
      
      const userMessage = userInputField.value.trim();
      if (!userMessage) return;
  
      // Append user's message
      appendMessage("user", userMessage);
      userInputField.value = "";
  
      // Send message to backend
      fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage })
      })
      .then(response => response.json())
      .then(data => {
        appendMessage("bot", data.response);
      })
      .catch(error => {
        appendMessage("bot", "Sorry, I couldn't connect to the server. Please try again later.");
        console.error("Error:", error);
      });
    }
  
    // Improved function to append chat messages with better UI
    function appendMessage(sender, message) {
      const isUser = sender === "user";
      
      // Create the message container
      const messageContainer = document.createElement("div");
      messageContainer.className = "flex items-start mb-4 " + (isUser ? "justify-end" : "");
      
      if (isUser) {
        // User message styling
        messageContainer.innerHTML = `
          <div class="chat-bubble p-3.5 rounded-xl max-w-3/4" style="background: linear-gradient(135deg, rgba(140, 82, 255, 0.8) 0%, rgba(255, 126, 185, 0.8) 100%); border: none; margin-left: 20px;">
            <p class="text-white text-sm">${message}</p>
          </div>
        `;
      } else {
        // Bot message styling
        messageContainer.innerHTML = `
          <div class="ai-avatar rounded-full p-2 flex-shrink-0 mr-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4V4C8.13401 4 5 7.13401 5 11V16.5C5 17.3284 5.67157 18 6.5 18H17.5C18.3284 18 19 17.3284 19 16.5V11C19 7.13401 15.866 4 12 4Z" stroke="white" stroke-width="2" />
              <path d="M12 18V20" stroke="white" stroke-width="2" stroke-linecap="round" />
              <path d="M9 22H15" stroke="white" stroke-width="2" stroke-linecap="round" />
            </svg>
          </div>
          <div class="chat-bubble p-3.5 rounded-xl max-w-3/4">
            <p class="text-gray-300 text-sm">${message}</p>
          </div>
        `;
      }
      
      chatBox.appendChild(messageContainer);
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  });

 // Function to send prompts to Ollama backend
async function sendPromptToAI(prompt) {
  const response = await fetch("http://127.0.0.1:8000/generate", {
      method: "POST",
      headers: {
          "Content-Type": "application/json",
          "x-api-key": "secretkey" 
      },
      body: JSON.stringify({ prompt: prompt })
  });

  if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Something went wrong!");
  }

  const data = await response.json();
  return data.response;
}

// Initialize the chatbox functionality
document.addEventListener('DOMContentLoaded', function() {
  // Elements for the regular chatbot tab
  const chatInput = document.getElementById('user-input');
  const chatBtn = document.getElementById('chat-btn');
  const chatBox = document.getElementById('chat-box');
  
  // Elements for the agent tab
  const agentInput = document.getElementById('agent-input');
  const agentBtn = document.getElementById('agent-btn');
  const agentChatBox = document.getElementById('agent-chat-box');
  const agentResults = document.getElementById('agent-results');
  const closeResults = document.querySelector('.close-results');
  const actionButtons = document.querySelectorAll('.action-btn');
  
  // Add event listener for chat send button
  chatBtn.addEventListener('click', () => handleChatSend());
  
  // Add event listener for Enter key in chat input
  chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
          handleChatSend();
      }
  });
  
  // Add event listener for agent send button
  agentBtn.addEventListener('click', () => handleAgentSend());
  
  // Add event listener for Enter key in agent input (Ctrl+Enter for multiline)
  agentInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.ctrlKey) {
          e.preventDefault(); // Prevent default newline
          handleAgentSend();
      }
  });
  
  // Close results panel
  if (closeResults) {
      closeResults.addEventListener('click', () => {
          agentResults.classList.add('hidden');
      });
  }
  
  // Handle action buttons
  actionButtons.forEach(button => {
      button.addEventListener('click', (e) => {
          const actionType = e.target.textContent;
          handleAgentAction(actionType);
      });
  });
  
  // Handle chat send
  async function handleChatSend() {
      const userPrompt = chatInput.value;
      if (!userPrompt.trim()) return;
      
      // Display user message
      addUserMessage(chatBox, userPrompt);
      chatInput.value = "";
      
      // Show typing indicator
      const typingIndicatorId = addTypingIndicator(chatBox);
      
      // Send to AI and get response
      try {
          const aiResponse = await sendPromptToAI(userPrompt);
          // Remove typing indicator
          removeTypingIndicator(typingIndicatorId);
          // Display AI response
          addAIMessage(chatBox, aiResponse);
      } catch (error) {
          // Remove typing indicator
          removeTypingIndicator(typingIndicatorId);
          // Display error
          addErrorMessage(chatBox, error.message);
      }
  }
  
  // Handle agent send
  async function handleAgentSend() {
      const userPrompt = agentInput.value;
      if (!userPrompt.trim()) return;
      
      // Display user message
      addUserMessage(agentChatBox, userPrompt);
      agentInput.value = "";
      
      // Show typing indicator
      const typingIndicatorId = addTypingIndicator(agentChatBox);
      
      // Send to AI and get response
      try {
          // Special handling for agent - include "Analyze:" prefix
          const aiResponse = await sendPromptToAI(`Analyze: ${userPrompt}`);
          // Remove typing indicator
          removeTypingIndicator(typingIndicatorId);
          // Display AI response
          addAIMessage(agentChatBox, aiResponse);
          
          // Simulate showing results with privacy concerns found
          setTimeout(() => {
              agentResults.classList.remove('hidden');
              // Update the results based on the content (simplified example)
              updateAgentResults(userPrompt, aiResponse);
          }, 500);
      } catch (error) {
          // Remove typing indicator
          removeTypingIndicator(typingIndicatorId);
          // Display error
          addErrorMessage(agentChatBox, error.message);
      }
  }
  
  // Handle agent actions
  async function handleAgentAction(actionType) {
      // Display selected action as user message
      addUserMessage(agentChatBox, `I want to ${actionType}`);
      
      // Show typing indicator
      const typingIndicatorId = addTypingIndicator(agentChatBox);
      
      // Send to AI and get response
      try {
          const aiResponse = await sendPromptToAI(`${actionType} request: Please explain how you would help with this action.`);
          // Remove typing indicator
          removeTypingIndicator(typingIndicatorId);
          // Display AI response
          addAIMessage(agentChatBox, aiResponse);
      } catch (error) {
          // Remove typing indicator
          removeTypingIndicator(typingIndicatorId);
          // Display error
          addErrorMessage(agentChatBox, error.message);
      }
  }
  
  // Helper function to add user message
  function addUserMessage(container, message) {
      container.innerHTML += `
          <div class="flex items-start space-x-3 justify-end mb-4">
              <div class="chat-bubble bg-purple-900 bg-opacity-30 p-3 rounded-lg max-w-3/4">
                  <p class="text-gray-300">${escapeHTML(message)}</p>
              </div>
              <div class="user-avatar rounded-full bg-purple-800 p-2 flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" stroke-width="2"/>
                      <path d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21" stroke="white" stroke-width="2"/>
                  </svg>
              </div>
          </div>
      `;
      // Scroll to bottom
      container.scrollTop = container.scrollHeight;
  }
  
  // Helper function to add AI message
  function addAIMessage(container, message) {
      container.innerHTML += `
          <div class="flex items-start space-x-3 mb-4">
              <div class="ai-avatar rounded-full p-2 flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4V4C8.13401 4 5 7.13401 5 11V16.5C5 17.3284 5.67157 18 6.5 18H17.5C18.3284 18 19 17.3284 19 16.5V11C19 7.13401 15.866 4 12 4Z" stroke="white" stroke-width="2"/>
                      <path d="M12 18V20" stroke="white" stroke-width="2" stroke-linecap="round"/>
                      <path d="M9 22H15" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  </svg>
              </div>
              <div class="chat-bubble p-3 bg-gray-800 rounded-lg max-w-3/4">
                  <p class="text-gray-300">${formatMessage(message)}</p>
              </div>
          </div>
      `;
      // Scroll to bottom
      container.scrollTop = container.scrollHeight;
  }
  
  // Helper function to add error message
  function addErrorMessage(container, errorMsg) {
      container.innerHTML += `
          <div class="flex items-center justify-center mb-4">
              <div class="error-message p-3 bg-red-900 bg-opacity-30 rounded-lg text-red-300 text-sm">
                  <p>Error: ${escapeHTML(errorMsg)}</p>
              </div>
          </div>
      `;
      // Scroll to bottom
      container.scrollTop = container.scrollHeight;
  }
  
  // Add typing indicator (returns id for removal)
  function addTypingIndicator(container) {
      const id = 'typing-' + Date.now();
      container.innerHTML += `
          <div id="${id}" class="flex items-start space-x-3 mb-4">
              <div class="ai-avatar rounded-full p-2 flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4V4C8.13401 4 5 7.13401 5 11V16.5C5 17.3284 5.67157 18 6.5 18H17.5C18.3284 18 19 17.3284 19 16.5V11C19 7.13401 15.866 4 12 4Z" stroke="white" stroke-width="2"/>
                      <path d="M12 18V20" stroke="white" stroke-width="2" stroke-linecap="round"/>
                      <path d="M9 22H15" stroke="white" stroke-width="2" stroke-linecap="round"/>
                  </svg>
              </div>
              <div class="chat-bubble p-3 bg-gray-800 rounded-lg">
                  <div class="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                  </div>
              </div>
          </div>
      `;
      // Scroll to bottom
      container.scrollTop = container.scrollHeight;
      return id;
  }
  
  // Remove typing indicator
  function removeTypingIndicator(id) {
      const element = document.getElementById(id);
      if (element) element.remove();
  }
  
  // Format message to handle newlines and URLs
  function formatMessage(text) {
      return escapeHTML(text)
          .replace(/\n/g, '<br>')
          .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" class="text-purple-400 hover:text-purple-300">$1</a>');
  }
  
  // Escape HTML to prevent XSS
  function escapeHTML(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
  }
  
  // Update agent results based on analysis
  function updateAgentResults(prompt, response) {
      // Here you would implement actual parsing of the AI response
      // This is a simplified example that looks for keywords
      
      const lowercaseResponse = response.toLowerCase();
      const resultsContent = document.querySelector('.results-content');
      
      resultsContent.innerHTML = '';
      
      let score = 50; // Default score
      
      // Check for data sharing mentions
      if (lowercaseResponse.includes('data sharing') || lowercaseResponse.includes('third party') || 
          lowercaseResponse.includes('share your information')) {
          resultsContent.innerHTML += createResultItem('Data Sharing', 
              'This policy allows sharing your personal data with third parties.', '#FF7EB9');
          score -= 15;
      }
      
      // Check for data retention mentions
      if (lowercaseResponse.includes('retention') || lowercaseResponse.includes('store your data') || 
          lowercaseResponse.includes('keep your information')) {
          resultsContent.innerHTML += createResultItem('Data Retention', 
              'Your data may be retained for an extended period.', '#8C52FF');
          score -= 10;
      }
      
      // Check for tracking mentions
      if (lowercaseResponse.includes('track') || lowercaseResponse.includes('cookie') || 
          lowercaseResponse.includes('analytics')) {
          resultsContent.innerHTML += createResultItem('Tracking', 
              'This site uses cookies and tracking technologies.', '#FF7EB9');
          score -= 5;
      }
      
      // Update privacy score
      document.querySelector('.privacy-score span:last-child').textContent = `${score}/100`;
      document.querySelector('.privacy-score .bg-red-400, .privacy-score .bg-yellow-400, .privacy-score .bg-green-400')
          .className = score > 70 ? 'bg-green-400 h-2 rounded-full' : 
                      score > 40 ? 'bg-yellow-400 h-2 rounded-full' : 
                                  'bg-red-400 h-2 rounded-full';
      document.querySelector('.privacy-score .bg-red-400, .privacy-score .bg-yellow-400, .privacy-score .bg-green-400')
          .style.width = `${score}%`;
  }
  
  // Create a result item HTML
  function createResultItem(title, description, color) {
      return `
          <div class="result-item mb-3">
              <div class="flex items-center">
                  <div class="item-icon mr-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="${color}" stroke-width="2"/>
                          <path d="M12 16V12" stroke="${color}" stroke-width="2" stroke-linecap="round"/>
                          <circle cx="12" cy="8" r="1" fill="${color}"/>
                      </svg>
                  </div>
                  <h4 class="text-sm font-medium text-purple-300">${title}</h4>
              </div>
              <p class="text-sm text-gray-300 ml-6">${description}</p>
          </div>
      `;
  }
});

// Add styles for typing indicator and chat styling
const styleElement = document.createElement('style');
styleElement.textContent = `
  .typing-indicator {
      display: flex;
      align-items: center;
  }
  
  .typing-indicator span {
      height: 8px;
      width: 8px;
      margin: 0 2px;
      background-color: #8C52FF;
      border-radius: 50%;
      display: inline-block;
      animation: bounce 1.4s infinite ease-in-out both;
  }
  
  .typing-indicator span:nth-child(1) {
      animation-delay: -0.32s;
  }
  
  .typing-indicator span:nth-child(2) {
      animation-delay: -0.16s;
  }
  
  @keyframes bounce {
      0%, 80%, 100% { 
          transform: scale(0);
      } 40% { 
          transform: scale(1.0);
      }
  }
  
  #chat-box, #agent-chat-box {
      min-height: 300px;
      max-height: 400px;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
  }
  
  .chat-bubble {
      border-radius: 12px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.2);
      word-break: break-word;
  }
  
  .user-avatar {
      background-color: #8C52FF;
  }
  
  .ai-avatar {
      background-color: #333333;
  }
`;

document.head.appendChild(styleElement);