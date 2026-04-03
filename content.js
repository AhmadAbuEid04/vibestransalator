const VT_DEFAULT_SETTINGS = {
  homeRegion: "US",
  preferredLanguage: "English",
  hideHomeRegion: true
};

const INJECTION_MARKER = "data-vt-enhanced";
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY_HERE"; // Replace with your actual OpenAI API key

async function getSettings() {
  return chrome.storage.local.get(VT_DEFAULT_SETTINGS);
}

function getCaptionText(article) {
  const captionCandidates = [
    'h1',
    'span[dir="auto"]',
    'div[role="button"] span',
    'ul li span'
  ];

  for (const selector of captionCandidates) {
    const nodes = Array.from(article.querySelectorAll(selector));
    const textNode = nodes.find((node) => {
      const text = node.textContent?.trim();
      return text && text.length > 20;
    });

    if (textNode) {
      return textNode.textContent.trim();
    }
  }

  return "";
}

async function translateAndExplain(caption, preferredLanguage) {
  const prompt = `
Translate this Instagram caption into ${preferredLanguage}. Then explain any slang, cultural reference, or local context in one short sentence.

Return valid JSON only in this format:
{
  "translation": "translated text",
  "context": "short context explanation"
}

If context is unclear, use:
"No special context detected."

Caption:
${caption}
  `.trim();

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.3
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);

  }

  const data = await response.json();
  const raw = data.choices?.[0]?.message?.content || "{}";
  return JSON.parse(raw);
}

function createCard(article, settings) {
  const realCaption = getCaptionText(article);

  const card = document.createElement("aside");
  card.className = "vt-card";

  const pills = document.createElement("div");
  pills.className = "vt-pill-row";
  pills.innerHTML = `
    <span class="vt-pill">Live post</span>
    <span class="vt-pill">${settings.preferredLanguage}</span>
  `;

  const original = document.createElement("p");
  original.className = "vt-title";
  original.innerHTML = `<strong>Original:</strong> ${realCaption || "No caption detected."}`;

  const translated = document.createElement("p");
  translated.className = "vt-title";
  translated.innerHTML = `<strong>Translated:</strong> Click the button to generate.`;

  const actions = document.createElement("div");
  actions.className = "vt-actions";

  const button = document.createElement("button");
  button.className = "vt-button";
  button.type = "button";
  button.textContent = "Translate + explain";

  const context = document.createElement("p");
  context.className = "vt-context";
  context.hidden = true;
  context.textContent = "";

  button.addEventListener("click", async () => {
    if (!realCaption) {
      translated.innerHTML = "<strong>Translated:</strong> No caption detected.";
      context.hidden = false;
      context.textContent = "No special context detected.";
      return;
    }

    button.disabled = true;
    button.textContent = "Loading...";
    translated.innerHTML = "<strong>Translated:</strong> Generating...";
    context.hidden = false;
    context.textContent = "Analyzing context...";

    try {
      const result = await translateAndExplain(realCaption, settings.preferredLanguage);
      translated.innerHTML = `<strong>Translated:</strong> ${result.translation}`;
      context.textContent = result.context;
      button.textContent = "Regenerate";
    } catch (error) {
      translated.innerHTML = "<strong>Translated:</strong> Request failed.";
      context.textContent = "Could not generate context right now.";
      button.textContent = "Try again";
      console.error(error);
    } finally {
      button.disabled = false;
    }
  });

  actions.appendChild(button);
  card.append(pills, original, translated, actions, context);
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
      vibestranslator is running. Click "Translate + explain" on a post to generate live translation and context.
    </p>
  `;

  document.body.appendChild(banner);
}

function enhanceArticles(settings) {
  const articles = Array.from(document.querySelectorAll("article"));
  if (!articles.length) {
    showBanner();
    return;
  }

  articles.forEach((article) => {
    if (article.hasAttribute(INJECTION_MARKER)) {
      return;
    }

    article.setAttribute(INJECTION_MARKER, "true");
    article.classList.add("vt-post-anchor");
    article.classList.add("vt-foreign-focus");
    article.appendChild(createCard(article, settings));
  });
}

async function boot() {
  if (!location.hostname.includes("instagram.com")) {
    return;
  }

  try {
    const settings = await getSettings();
    enhanceArticles(settings);
    showBanner();

    const observer = new MutationObserver(() => enhanceArticles(settings));
    observer.observe(document.body, { childList: true, subtree: true });
  } catch (error) {
    showBanner();
    console.error("vibestranslator failed to load", error);
  }
}

boot();

