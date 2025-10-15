import { QuoteService } from "@boostlly/core";
import { StorageService } from "@boostlly/platform-extension";

const storage = new StorageService();
const quoteService = new QuoteService(storage);

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Boostlly extension installed");

  // Set up daily alarm for quotes
  chrome.alarms.create("daily-quote", {
    delayInMinutes: 1, // First alarm in 1 minute
    periodInMinutes: 1440, // Then every 24 hours
  });
});

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "daily-quote") {
    const quote = quoteService.getRandomQuote();

    // Show notification
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icon-48.png",
      title: "Boostlly - Daily Motivation",
      message: quote.text,
    });
  }
});

// Handle messages from popup/content scripts
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.type === "GET_QUOTE") {
    const quote = quoteService.getRandomQuote();
    sendResponse({ quote });
  }
});
