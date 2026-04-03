const DEFAULT_SETTINGS = {
  homeRegion: "US",
  preferredLanguage: "English",
  hideHomeRegion: true
};

async function getSettings() {
  return chrome.storage.local.get(DEFAULT_SETTINGS);
}

async function getPosts() {
  const response = await fetch(chrome.runtime.getURL("data/posts.json"));
  return response.json();
}

function formatRegion(region) {
  if (region === "US") {
    return "United States";
  }

  return region;
}

function renderSummary(settings, posts) {
  const totalForeign = posts.filter((post) => post.region !== settings.homeRegion).length;
  document.getElementById("summaryRegion").textContent = formatRegion(settings.homeRegion);
  document.getElementById("summaryText").textContent = settings.hideHomeRegion
    ? `Showing ${totalForeign} posts from outside your region and hiding local posts.`
    : `Highlighting posts from outside your region while keeping local posts visible.`;
}

function createPost(post, settings, template) {
  const node = template.content.firstElementChild.cloneNode(true);
  node.dataset.style = post.imageStyle;

  if (post.region !== settings.homeRegion) {
    node.classList.add("is-foreign");
  }

  if (settings.hideHomeRegion && post.region === settings.homeRegion) {
    node.classList.add("is-hidden");
  }

  node.querySelector(".username").textContent = `@${post.username}`;
  node.querySelector(".location").textContent = `${post.region} · ${post.language}`;
  node.querySelector(".topic-pill").textContent = post.topic;
  node.querySelector(".original-caption").textContent = post.originalCaption;
  node.querySelector(".language-pill").textContent = settings.preferredLanguage;
  node.querySelector(".translated-caption").textContent = post.translatedCaption;

  const contextButton = node.querySelector(".context-button");
  const contextNote = node.querySelector(".context-note");
  contextNote.textContent = post.contextNote;

  contextButton.addEventListener("click", () => {
    contextNote.hidden = !contextNote.hidden;
    contextButton.textContent = contextNote.hidden ? "Why this vibe?" : "Hide context";
  });

  return node;
}

async function boot() {
  const [settings, posts] = await Promise.all([getSettings(), getPosts()]);
  const template = document.getElementById("post-template");
  const feed = document.getElementById("feed");

  renderSummary(settings, posts);
  posts.forEach((post) => {
    feed.appendChild(createPost(post, settings, template));
  });
}

boot().catch((error) => {
  console.error("vibestranslator demo failed to load", error);
});
