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

//Configures the side panel.
chrome.sidePanel.setOptions({
    // Whether sidepanel is enabled or not. By default it's true. 
    enabled: true,
    
    // html file path
    path: "popup.html",
    
    // the tab in which the sidepanel should appear. If omitted extensions assummes default behaviour.
    // tabId: "tab-id" 
  })

  chrome.sidePanel.setPanelBehavior({
    // Whether clicking the extension's icon will
    // toggle showing the extension's entry 
    // in the side panel. Defaults to false.
    openPanelOnActionClick: true,
 });
