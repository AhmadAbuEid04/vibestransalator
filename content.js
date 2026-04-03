const VT_DEFAULT_SETTINGS = {
  homeRegion: "US",
  preferredLanguage: "English",
  hideHomeRegion: true
};

const INJECTION_MARKER = "data-vt-enhanced";

async function getSettings() {
  return chrome.storage.local.get(VT_DEFAULT_SETTINGS);
}

async function getPosts() {
  const response = await fetch(chrome.runtime.getURL("data/posts.json"));
  return response.json();
}

function createCard(post) {
  const card = document.createElement("aside");
  card.className = "vt-card";

  const pills = document.createElement("div");
  pills.className = "vt-pill-row";
  pills.innerHTML = `
    <span class="vt-pill">${post.region}</span>
    <span class="vt-pill">${post.language}</span>
    <span class="vt-pill">${post.topic}</span>
  `;

  const title = document.createElement("p");
  title.className = "vt-title";
  title.innerHTML = `<strong>Translated:</strong> ${post.translatedCaption}`;

  const actions = document.createElement("div");
  actions.className = "vt-actions";

  const button = document.createElement("button");
  button.className = "vt-button";
  button.type = "button";
  button.textContent = "Explain context";

  const context = document.createElement("p");
  context.className = "vt-context";
  context.hidden = true;
  context.textContent = post.contextNote;

  button.addEventListener("click", () => {
    context.hidden = !context.hidden;
    button.textContent = context.hidden ? "Explain context" : "Hide context";
  });

  actions.appendChild(button);
  card.append(pills, title, actions, context);
  return card;
}

function showBanner() {
  if (document.querySelector(".vt-banner")) {
    return;
  }

  const banner = document.createElement("div");
  banner.className = "vt-banner";
  banner.innerHTML = `
    <p>
      vibestranslator is running. For the most reliable hackathon demo,
      open the extension popup and launch the built-in demo feed.
    </p>
  `;

  document.body.appendChild(banner);
}

function pickPost(posts, index) {
  return posts[index % posts.length];
}

function enhanceArticles(posts, settings) {
  const articles = Array.from(document.querySelectorAll("article"));
  if (!articles.length) {
    showBanner();
    return;
  }

  articles.forEach((article, index) => {
    if (article.hasAttribute(INJECTION_MARKER)) {
      return;
    }

    const post = pickPost(posts, index);
    article.setAttribute(INJECTION_MARKER, "true");
    article.classList.add("vt-post-anchor");

    if (settings.hideHomeRegion && post.region === settings.homeRegion) {
      article.classList.add("vt-home-hidden");
    } else if (post.region !== settings.homeRegion) {
      article.classList.add("vt-foreign-focus");
    }

    article.appendChild(createCard(post));
  });
}

async function boot() {
  if (!location.hostname.includes("instagram.com")) {
    return;
  }

  try {
    const [settings, posts] = await Promise.all([getSettings(), getPosts()]);
    enhanceArticles(posts, settings);
    showBanner();

    const observer = new MutationObserver(() => enhanceArticles(posts, settings));
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (error) {
    showBanner();
    console.error("vibestranslator failed to load", error);
  }
}

boot();
