// Simple background script for Chrome extension
// This avoids import issues with service workers

const quotes = [
  "The only way to do great work is to love what you do.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Believe you can and you're halfway there.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Don't watch the clock; do what it does. Keep going.",
  "The only limit to our realization of tomorrow is our doubts of today.",
  "It always seems impossible until it's done.",
  "The way to get started is to quit talking and begin doing.",
  "Your time is limited, don't waste it living someone else's life.",
  "The greatest glory in living lies not in never falling, but in rising every time we fall.",
];

function getRandomQuote() {
  return {
    text: quotes[Math.floor(Math.random() * quotes.length)],
    author: "Unknown",
  };
}

const SETTINGS_KEY = "notificationSettings";
const ALARM_NAME = "daily-quote";

function computeNextTriggerTime(hour: number, minute: number): number {
  const now = new Date();
  const next = new Date();
  next.setHours(hour, minute, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }
  return next.getTime();
}

async function getSettings(): Promise<{
  enabled: boolean;
  hour: number;
  minute: number;
}> {
  return new Promise((resolve) => {
    chrome.storage.local.get([SETTINGS_KEY], (result) => {
      const defaults = { enabled: true, hour: 9, minute: 0 };
      const settings = result[SETTINGS_KEY] || defaults;
      resolve({ ...defaults, ...settings });
    });
  });
}

function setSettings(settings: {
  enabled: boolean;
  hour: number;
  minute: number;
}): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [SETTINGS_KEY]: settings }, () => resolve());
  });
}

async function scheduleDailyAlarm(): Promise<void> {
  const { enabled, hour, minute } = await getSettings();
  await new Promise<void>((resolve) =>
    chrome.alarms.clear(ALARM_NAME, () => resolve()),
  );
  if (!enabled) return;
  const when = computeNextTriggerTime(hour, minute);
  chrome.alarms.create(ALARM_NAME, { when, periodInMinutes: 1440 });
}

// Handle extension installation / update
chrome.runtime.onInstalled.addListener(async () => {
  await scheduleDailyAlarm();
});

// React to storage changes (reschedule when user updates settings)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "local") return;
  if (changes[SETTINGS_KEY]) {
    scheduleDailyAlarm();
  }
});

// Handle alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    const quote = getRandomQuote();
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
    const quote = getRandomQuote();
    sendResponse({ quote });
  } else if (request.type === "FETCH_QUOTE") {
    // Handle external API fetching from background worker (no CORS restrictions)
    const { url, options } = request;
    fetch(url, options || {})
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        return response.text();
      })
      .then((text) => {
        try {
          const json = JSON.parse(text);
          sendResponse({ success: true, data: json });
        } catch {
          sendResponse({ success: true, data: text });
        }
      })
      .catch((error) => {
        sendResponse({
          success: false,
          error: error.message || String(error),
        });
      });
    return true; // Required for async response
  } else if (request.type === "SET_NOTIFICATION_SETTINGS") {
    const { enabled, hour, minute } = request;
    setSettings({ enabled, hour, minute }).then(() => {
      scheduleDailyAlarm();
      sendResponse({ ok: true });
    });
    return true;
  } else if (request.type === "GET_NOTIFICATION_SETTINGS") {
    getSettings().then((settings) => sendResponse(settings));
    return true;
  }
});
