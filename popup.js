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

  //chat

  // Get elements
const chatbotBtn = document.getElementById("chatbot-btn");
const userInput = document.getElementById("user-input");
const chatBox = document.getElementById("chat-box");

// Chatbot button click event listener
chatbotBtn.addEventListener("click", async () => {
    const message = userInput.value.trim();
    if (!message) return;  // If no message, do nothing

    // Append user's message to the chat
    addMessage("user", message);
    userInput.value = "";

    // Send the message to your backend and wait for the AI response
    const botReply = await getBotResponse(message);
    addMessage("bot", botReply);
});

// Function to append messages to the chat interface
function addMessage(sender, text) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("flex", "items-start", "space-x-3");

    const avatarDiv = document.createElement("div");
    avatarDiv.className = "ai-avatar rounded-full p-2 flex-shrink-0";
    avatarDiv.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 4V4C8.13401 4 5 7.13401 5 11V16.5C5 17.3284 5.67157 18 6.5 18H17.5C18.3284 18 19 17.3284 19 16.5V11C19 7.13401 15.866 4 12 4Z" stroke="white" stroke-width="2"/>
        <path d="M12 18V20" stroke="white" stroke-width="2" stroke-linecap="round"/>
        <path d="M9 22H15" stroke="white" stroke-width="2" stroke-linecap="round"/>
      </svg>
    `;

    const bubble = document.createElement("div");
    bubble.classList.add("chat-bubble", "p-4", "flex-grow");
    bubble.innerHTML = `
      <div class="text-xs text-purple-300 mb-2 font-medium">${sender === "user" ? "You" : "Summus AI"}</div>
      <div class="text-gray-200">${text}</div>
    `;

    messageDiv.appendChild(avatarDiv);
    messageDiv.appendChild(bubble);
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Async function to get the bot's response from the backend
async function getBotResponse(message) {
    const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message })
    });

    const data = await response.json();

    // Check if response is valid, return the AI's response or an error message
    if (data && data.response) {
        console.log("AI response:", data.response);
        chrome.runtime.sendMessage({ action: "displayChatResponse", response: data.response });
        return data.response;
    } else {
        console.log("Error: No valid response from AI.");
        return "I could not understand that.";
    }
}
