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

  
