document.getElementById("summarize-btn").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab) {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: extractHighlightedText,
        });
    }
});

async function extractHighlightedText() {
    let selectedText = window.getSelection().toString().trim();

        const response = await fetch("http://localhost:8000/summarize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                selectedText: selectedText  
            })
        });

        const data = await response.json();

        chrome.runtime.sendMessage({ action: "displaySummary", summary: data.response });
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