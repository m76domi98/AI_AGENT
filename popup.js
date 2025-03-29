document.getElementById("summarize-btn").addEventListener("click", async () => {
    let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: extractText
    });
});

function extractText() {
    let text = document.body.innerText;
    chrome.runtime.sendMessage({ action: "summarize", text: text });
}
