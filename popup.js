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
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const chatOutput = document.getElementById("chat-output");

    sendBtn.addEventListener("click", async function () {
        const userMessage = chatInput.value.trim();
        if (userMessage === "") return;

        // Display user message in chat window
        chatOutput.innerHTML += `<p><strong>You:</strong> ${userMessage}</p>`;

        // Send message to Fetch.ai agent
        const agentResponse = await sendMessageToAgent(userMessage);

        // Display agent's response
        chatOutput.innerHTML += `<p><strong>Agent:</strong> ${agentResponse}</p>`;

        // Clear input field
        chatInput.value = "";
    });

    async function sendMessageToAgent(message) {
        try {
            const response = await fetch("https://agentverse.ai/api/agent_endpoint", { // Replace with your agent's endpoint
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            return data.reply || "No response from the agent.";
        } catch (error) {
            console.error("Error communicating with the AI agent:", error);
            return "Error: Unable to connect to the agent.";
        }
    }
});
