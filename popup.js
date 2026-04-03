const DEFAULT_SETTINGS = {
  homeRegion: "US",
  preferredLanguage: "English",
  hideHomeRegion: true
};

const form = document.getElementById("settings-form");
const statusEl = document.getElementById("status");
const openDemoButton = document.getElementById("openDemo");

async function loadSettings() {
  const stored = await chrome.storage.local.get(DEFAULT_SETTINGS);
  document.getElementById("homeRegion").value = stored.homeRegion;
  document.getElementById("preferredLanguage").value = stored.preferredLanguage;
  document.getElementById("hideHomeRegion").checked = stored.hideHomeRegion;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const settings = {
    homeRegion: document.getElementById("homeRegion").value,
    preferredLanguage: document.getElementById("preferredLanguage").value,
    hideHomeRegion: document.getElementById("hideHomeRegion").checked
  };

  await chrome.storage.local.set(settings);
  statusEl.textContent = "Saved. Open the demo feed to preview the new filter.";
});

openDemoButton.addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("demo/feed.html") });
});

loadSettings();
