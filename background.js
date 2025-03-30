chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
      let summarizedText = request.text.slice(0, 200) + "... (summary generated)"; // Placeholder logic
      chrome.runtime.sendMessage({ action: "displaySummary", summary: summarizedText });
  }
});

chrome.action.onClicked.addListener(async (tab) => {    
  await chrome.sidePanel.open({ tabId: tab.id });
  console.log("Side Panel Opened");
});
