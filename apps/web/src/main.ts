import { DEFAULT_TOKENS as STANDARDS_DEFAULT_TOKENS, init as initStandardsUI } from 'standards-ui';
import * as DataStarCore from '@data-star/core';
import * as DataStarRouter from '@data-star/router';
import * as DataStarStore from '@data-star/store';

const APP_TAG = 'canon-app';
let appInitialized = false;

type DataStarModule = {
  init?: (config?: Record<string, unknown>) => unknown;
  initialize?: (config?: Record<string, unknown>) => unknown;
  start?: (config?: Record<string, unknown>) => unknown;
};

type StandardsUIModule = {
  DEFAULT_TOKENS?: Record<string, unknown>;
  init?: (tokens?: Record<string, unknown>) => void;
};

function initializeDataStar(): void {
  const moduleRef = DataStarCore as unknown as DataStarModule;
  const config = {
    router: DataStarRouter,
    store: DataStarStore,
  };

  if (typeof moduleRef?.init === 'function') {
    moduleRef.init(config);
  } else if (typeof moduleRef?.initialize === 'function') {
    moduleRef.initialize(config);
  } else if (typeof moduleRef?.start === 'function') {
    moduleRef.start(config);
  }
}

function initializeStandardsUI(): void {
  try {
    const moduleTokens = STANDARDS_DEFAULT_TOKENS as Record<string, unknown> | undefined;
    const moduleInit = initStandardsUI as ((tokens?: Record<string, unknown>) => void) | undefined;
    const windowModule = (window as unknown as { StandardsUI?: StandardsUIModule }).StandardsUI;
    const tokens = moduleTokens ?? windowModule?.DEFAULT_TOKENS ?? {};
    const init = moduleInit ?? windowModule?.init;

    if (typeof init === 'function') {
      init(tokens as Record<string, unknown>);
    }
  } catch (error) {
    console.error('Failed to initialize Standards UI', error);
  }
}

function bootstrap(): void {
  if (appInitialized) {
    return;
  }

  appInitialized = true;

  initializeDataStar();
  initializeStandardsUI();

  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        setupApplication();
      },
      { once: true }
    );
  } else {
    setupApplication();
  }
}

class CanonApp extends HTMLElement {
  connectedCallback(): void {
    bootstrap();
  }
}

if (!customElements.get(APP_TAG)) {
  customElements.define(APP_TAG, CanonApp);
}

bootstrap();

// URL Routing Functions
function updateURL(path, state, options = {}) {
  const { replace = false } = options;
  if (!history.pushState) {
    return;
  }

  if (replace) {
    history.replaceState(state, "", path);
  } else {
    history.pushState(state, "", path);
  }
}

function parseURL() {
  const path = window.location.pathname;
  const segments = path.split("/").filter((segment) => segment);

  if (segments.length === 0) {
    return { view: "home" };
  }

  if (segments[0] === "universes") {
    return { view: "universe-list" };
  }

  if (segments[0] === "queue") {
    return { view: "queue" };
  }

  if (segments[0] === "universe" && segments[1]) {
    if (segments[2] === "category" && segments[3]) {
      return {
        view: "category",
        universeId: segments[1],
        categoryName: decodeURIComponent(segments[3]),
      };
    }

    return {
      view: "universe",
      universeId: segments[1],
    };
  }

  if (segments[0] === "page" && segments[1]) {
    return {
      view: "page",
      pageId: segments[1],
    };
  }

  return { view: "home" };
}

function handleRoute(route, options = {}) {
  const { skipHistory = false, replace = false } = options;
  const historyOptions = { skipHistory, replace };

  switch (route?.view) {
    case "home":
      showHomepage(historyOptions);
      break;
    case "universe-list":
      showUniverseList(historyOptions);
      break;
    case "queue":
      showQueue(historyOptions);
      break;
    case "universe":
      showUniverse(route.universeId, historyOptions);
      break;
    case "category":
      showUniverse(route.universeId, historyOptions);
      loadCategory(route.universeId, route.categoryName, historyOptions);
      break;
    case "page":
      loadPage(route.pageId, historyOptions);
      break;
    default:
      showHomepage(historyOptions);
      break;
  }
}

// Load universes on page load
function setupApplication() {
  // Handle initial URL and seed history state
  const initialRoute = window.history.state || parseURL();
  handleRoute(initialRoute, { replace: true });

  // Add form submission handler
  const universeForm = document.getElementById("universe-form");
  if (universeForm) {
    universeForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const formData = new FormData(event.target);
      const universeName = formData.get("name");

      createNewUniverse(
        typeof universeName === "string" ? universeName : ""
      );
    });
  }

  // Add click outside modal to close functionality
  const modal = document.getElementById("universe-modal");
  if (modal) {
    modal.addEventListener("click", function (event) {
      if (event.target === modal) {
        hideUniverseModal();
      }
    });
  }

  // Add escape key to close modal
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      const modal = document.getElementById("universe-modal");
      if (modal && modal.classList.contains("show")) {
        hideUniverseModal();
      }
    }
  });

  loadUniverses();
}

// Handle browser back/forward buttons
window.addEventListener("popstate", function (event) {
  const route = event.state || parseURL();
  handleRoute(route, { skipHistory: true });
});

function loadUniverses() {
  fetch("http://localhost:3000/universes")
    .then((response) => response.text())
    .then((html) => {
      // Find the ds-col wrapper and update its content
      const dsCol = document.querySelector("#universe-list ds-col");
      if (dsCol) {
        dsCol.innerHTML = html;
      } else {
        // Fallback: wrap the content in ds-col
        document.getElementById("universe-list").innerHTML =
          `<ds-col gap="24px">${html}</ds-col>`;
      }

      // Event listeners are handled by document-level click handler
      console.log(
        "Universe items loaded, event handling via document listener"
      );
    })
    .catch((error) => {
      console.error("Error loading universes:", error);
      const dsCol = document.querySelector("#universe-list ds-col");
      if (dsCol) {
        dsCol.innerHTML =
          '<li class="error">Error loading universes</li>';
      } else {
        document.getElementById("universe-list").innerHTML =
          '<ds-col gap="24px"><li class="error">Error loading universes</li></ds-col>';
      }
    });
}

function showUniverse(universeId, options = {}) {
  const { skipHistory = false, replace = false } = options;
  console.log("showUniverse called with ID:", universeId);

  // Stop queue polling when navigating away
  stopQueuePolling();

  // Update URL
  if (!skipHistory) {
    updateURL(
      `/universe/${universeId}`,
      { view: "universe", universeId },
      { replace }
    );
  }

  // Clear main content and show loading
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.innerHTML = `
      <section id="universe-content" class="wiki-article" style="display: block;" data-universe-id="${universeId}">
        <div class="wiki-loading">Loading universe content...</div>
      </section>
    `;
  } else {
    console.error("Main content element not found");
    return;
  }

  // Load universe content and update sidebar with categories
  console.log(
    "Fetching universe content from:",
    `http://localhost:3000/universes/${universeId}`
  );
  fetch(`http://localhost:3000/universes/${universeId}`)
    .then((response) => {
      console.log("Fetch response status:", response.status);
      return response.text();
    })
    .then((html) => {
      console.log("Universe content received, length:", html.length);

      // Get the universe content element (it might have been created above)
      const currentUniverseContent =
        document.getElementById("universe-content");
      if (currentUniverseContent) {
        currentUniverseContent.innerHTML = html;
        console.log("Universe content loaded successfully");
        // Load categories for sidebar
        loadUniverseCategories(universeId);
      } else {
        console.error(
          "Universe content element still not found after creation"
        );
      }
    })
    .catch((error) => {
      console.error("Error loading universe:", error);
      const currentUniverseContent =
        document.getElementById("universe-content");
      if (currentUniverseContent) {
        currentUniverseContent.innerHTML =
          '<div class="wiki-error">Error loading universe content: ' +
          error.message +
          "</div>";
      }
    });
}

function loadUniverseCategories(universeId) {
  console.log("loadUniverseCategories called with ID:", universeId);

  // Update sidebar to show categories instead of universes
  const sidebar = document.querySelector("#wiki-sidebar");
  if (!sidebar) {
    console.error("Sidebar element not found");
    return;
  }

  sidebar.innerHTML = `
    <ds-col gap="24px">
      <header>
        <h2>Navigation</h2>
      </header>
      <nav>
        <ul class="category-list" id="category-list">
          <ds-col gap="24px">
            <li class="loading">Loading categories...</li>
          </ds-col>
        </ul>
      </nav>
    </ds-col>
  `;

  // Load categories from universe content
  fetch(`http://localhost:3000/universes/${universeId}`)
    .then((response) => response.text())
    .then((html) => {
      // Extract categories from the universe page
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const categoryCards = tempDiv.querySelectorAll(".category-card");

      const categories = Array.from(categoryCards)
        .map((card) => {
          const onclick = card.getAttribute("onclick");
          const match = onclick.match(
            /loadCategory\('([^']+)',\s*'([^']+)'\)/
          );
          return match ? { id: match[1], name: match[2] } : null;
        })
        .filter(Boolean);

      // Update category list
      const categoryList = document.getElementById("category-list");
      const dsCol = categoryList.querySelector("ds-col");
      if (dsCol) {
        dsCol.innerHTML = categories
          .map(
            (cat) => `
          <li class="category-item" onclick="loadCategory('${cat.id}', '${cat.name}')">
            <strong>${cat.name}</strong>
          </li>
        `
          )
          .join("");
      }
    })
    .catch((error) => {
      console.error("Error loading categories:", error);
      const dsCol = document.querySelector("#category-list ds-col");
      if (dsCol) {
        dsCol.innerHTML =
          '<li class="error">Error loading categories</li>';
      }
    });
}

function loadCategory(universeId, categoryName, options = {}) {
  const { skipHistory = false, replace = false } = options;
  const encodedCategory = encodeURIComponent(categoryName);

  // Update URL
  if (!skipHistory) {
    updateURL(
      `/universe/${universeId}/category/${encodedCategory}`,
      { view: "category", universeId, categoryName },
      { replace }
    );
  }

  // Load category content
  fetch(
    `http://localhost:3000/universes/${universeId}/category/${encodedCategory}`
  )
    .then((response) => response.text())
    .then((html) => {
      // Update main content with category content
      const mainContent = document.getElementById("main-content");
      mainContent.innerHTML = html;

      // Update sidebar to show items in this category
      updateCategorySidebar(universeId, categoryName);
    })
    .catch((error) => {
      console.error("Error loading category:", error);
      document.getElementById("main-content").innerHTML =
        '<div class="error">Error loading category</div>';
    });
}

function updateCategorySidebar(universeId, categoryName) {
  // Update sidebar to show items in the selected category
  const sidebar = document.querySelector("#wiki-sidebar");
  if (!sidebar) {
    console.error("Sidebar element not found");
    return;
  }
  const encodedCategory = encodeURIComponent(categoryName);
  sidebar.innerHTML = `
    <ds-col gap="24px">
      <header>
        <h2>${categoryName}</h2>
        <ds-button variant="secondary" onclick="showUniverse('${universeId}')" class="back-btn">
          ← Back to Universe
        </ds-button>
      </header>
      <nav>
        <ul class="item-list" id="item-list">
          <ds-col gap="24px">
            <li class="loading">Loading items...</li>
          </ds-col>
        </ul>
      </nav>
      <ds-button variant="primary" onclick="createContent('${categoryName.toLowerCase()}')" class="create-btn">
        Create New ${categoryName.slice(0, -1)}
      </ds-button>
    </ds-col>
  `;

  // Load items for this category
  fetch(
    `http://localhost:3000/universes/${universeId}/category/${encodedCategory}`
  )
    .then((response) => response.text())
    .then((html) => {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = html;
      const contentItems = tempDiv.querySelectorAll(".content-item");

      const items = Array.from(contentItems)
        .map((item) => {
          const onclick = item.getAttribute("onclick");
          const match = onclick.match(/loadPage\('([^']+)'\)/);
          return match
            ? {
                id: match[1],
                title: item.querySelector("h3").textContent,
              }
            : null;
        })
        .filter(Boolean);

      // Update item list
      const itemList = document.getElementById("item-list");
      const dsCol = itemList.querySelector("ds-col");
      if (dsCol) {
        dsCol.innerHTML = items
          .map(
            (item) => `
          <li class="item-item" onclick="loadPage('${item.id}')">
            <strong>${item.title}</strong>
          </li>
        `
          )
          .join("");
      }
    })
    .catch((error) => {
      console.error("Error loading items:", error);
      const dsCol = document.querySelector("#item-list ds-col");
      if (dsCol) {
        dsCol.innerHTML = '<li class="error">Error loading items</li>';
      }
    });
}

function loadPage(pageId, options = {}) {
  const { skipHistory = false, replace = false } = options;
  const encodedPageId = encodeURIComponent(pageId);

  // Update URL
  if (!skipHistory) {
    updateURL(
      `/page/${encodedPageId}`,
      { view: "page", pageId },
      {
        replace,
      }
    );
  }

  // Load individual page content
  fetch(`http://localhost:3000/universes/page/${encodedPageId}/fragment`)
    .then((response) => response.text())
    .then((html) => {
      // Update main content with page content
      const mainContent = document.getElementById("main-content");
      mainContent.innerHTML = html;

      // Process markdown links to enable anchor navigation
      processWikiLinks();
    })
    .catch((error) => {
      console.error("Error loading page:", error);
      document.getElementById("main-content").innerHTML =
        '<div class="error">Error loading page</div>';
    });
}

function processWikiLinks() {
  // Process markdown links to enable anchor navigation within the page
  const markdownContent = document.querySelector(".markdown-content");
  if (!markdownContent) return;

  // Find all internal links (links that start with #)
  const links = markdownContent.querySelectorAll('a[href^="#"]');
  links.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    });
  });
}

function getCurrentUniverseId() {
  // Try to get universe ID from URL hash
  const hash = window.location.hash;
  if (hash && hash.startsWith("#universe/")) {
    return hash.replace("#universe/", "");
  }

  // Try to get from current page context
  const universeContent = document.getElementById("universe-content");
  if (universeContent && universeContent.dataset.universeId) {
    return universeContent.dataset.universeId;
  }

  // Try to get from active universe item
  const activeUniverse = document.querySelector(".universe-item.active");
  if (activeUniverse && activeUniverse.dataset.universeId) {
    return activeUniverse.dataset.universeId;
  }

  return null;
}

function checkJobStatus(jobId) {
  console.log(`Checking status for job: ${jobId}`);

  const loadingIndicator = document.getElementById("loading-indicator");
  if (loadingIndicator) {
    loadingIndicator.style.display = "block";
  }

  fetch(`http://localhost:3000/job/${jobId}/status`)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then((status) => {
      console.log("Job status:", status);
      if (loadingIndicator) {
        loadingIndicator.style.display = "none";
      }

      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        let statusHtml = `
          <section class="wiki-article job-status">
            <h2>Job Status</h2>
            <p><strong>Job ID:</strong> ${status.jobId}</p>
            <p><strong>Status:</strong> ${status.status}</p>
            <p><strong>Progress:</strong> ${status.progress || 0}%</p>
        `;

        if (status.status === "completed") {
          statusHtml += `
            <div class="success-message">
              <h3>Content Generated Successfully!</h3>
              <p>Your ${status.data?.type || "content"} has been created and added to the universe.</p>
              <button class="ds-button ds-button-primary" onclick="refreshUniverseContent()">
                Refresh Universe
              </button>
            </div>
          `;
        } else if (status.status === "failed") {
          statusHtml += `
            <div class="error-message">
              <h3>Content Generation Failed</h3>
              <p>Error: ${status.error || "Unknown error occurred"}</p>
              <button class="ds-button ds-button-secondary" onclick="createContent('${status.data?.type || "world"}')">
                Try Again
              </button>
            </div>
          `;
        } else {
          statusHtml += `
            <div class="pending-message">
              <p>Content is still being generated. This may take a few minutes.</p>
              <button class="ds-button ds-button-secondary" onclick="checkJobStatus('${jobId}')">
                Check Again
              </button>
            </div>
          `;
        }

        statusHtml += `</section>`;
        mainContent.innerHTML = statusHtml;
      }
    })
    .catch((error) => {
      console.error("Error checking job status:", error);
      if (loadingIndicator) {
        loadingIndicator.style.display = "none";
      }

      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.innerHTML = `
          <section class="wiki-article">
            <div class="wiki-error">
              Failed to check job status. ${error.message}
            </div>
          </section>
        `;
      }
    });
}

function refreshUniverseContent() {
  const universeId = getCurrentUniverseId();
  if (universeId) {
    showUniverse(universeId);
  } else {
    showUniverseList();
  }
}

function createContent(type) {
  console.log(`Creating new ${type}`);

  // Get current universe ID from URL or context
  const currentUniverseId = getCurrentUniverseId();
  if (!currentUniverseId) {
    alert("Please select a universe first");
    return;
  }

  // Show loading indicator
  const loadingIndicator = document.getElementById("loading-indicator");
  if (loadingIndicator) {
    loadingIndicator.style.display = "block";
  }

  // Make API call to create content
  fetch("http://localhost:3000/content/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      universeId: currentUniverseId,
      type: type,
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.text(); // Get HTML response
    })
    .then((html) => {
      console.log(`${type} creation queued`);
      if (loadingIndicator) {
        loadingIndicator.style.display = "none";
      }

      // Update main content with queued message
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.innerHTML = html;
      }
    })
    .catch((error) => {
      console.error(`Error creating ${type}:`, error);
      if (loadingIndicator) {
        loadingIndicator.style.display = "none";
      }

      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.innerHTML = `
          <section class="wiki-article">
            <div class="wiki-error">
              Failed to create ${type}. ${error.message}
            </div>
          </section>
        `;
      }
    });
}

function createNewUniverse(universeName) {
  if (!universeName) {
    showUniverseModal();
    return;
  }

  const trimmedName = universeName.trim();
  if (!trimmedName) {
    alert("Please enter a universe name");
    showUniverseModal();
    return;
  }

  hideUniverseModal();

  const loadingIndicator = document.getElementById("loading-indicator");
  if (loadingIndicator) {
    loadingIndicator.style.display = "block";
  }

  const homepage = document.getElementById("homepage");
  if (homepage) {
    homepage.style.display = "none";
  }

  const universeContent = document.getElementById("universe-content");
  if (universeContent) {
    universeContent.style.display = "none";
    universeContent.classList.remove("active");
  }

  fetch("http://localhost:3000/new", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: trimmedName,
      description: "A newly created universe",
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      return response.json();
    })
    .then((data) => {
      console.log("Universe created:", data);
      if (loadingIndicator) {
        loadingIndicator.style.display = "none";
      }

      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        const universeId = data?.universe?.id || data?.universeId || "";
        const statusBlock = document.createElement("section");
        statusBlock.className = "wiki-article creation-result";
        statusBlock.innerHTML = `
          <h2>Universe Created!</h2>
          <p>${data?.message || "Universe created successfully."}</p>
          <p><strong>Status:</strong> ${data?.status || "created"}</p>
          ${
            universeId
              ? `<p><strong>Universe ID:</strong> ${universeId}</p>`
              : ""
          }
          <div class="creation-actions">
            ${
              universeId
                ? `<ds-button variant="primary" onclick="showUniverse('${universeId}')">
                    Explore Universe
                  </ds-button>`
                : ""
            }
            <ds-button variant="secondary" onclick="showUniverseList()">
              View All Universes
            </ds-button>
          </div>
        `;
        mainContent.innerHTML = "";
        mainContent.appendChild(statusBlock);
      }

      loadUniverses();
    })
    .catch((error) => {
      console.error("Error creating universe:", error);
      if (loadingIndicator) {
        loadingIndicator.style.display = "none";
      }

      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.innerHTML = `
          <section class="wiki-article">
            <div class="wiki-error">
              Failed to create universe. ${error.message}
            </div>
          </section>
        `;
      }
    });
}

function showUniverseModal() {
  const modal = document.getElementById("universe-modal");
  const nameInput = document.getElementById("universe-name");

  modal.classList.add("show");
  // Focus on the name input
  setTimeout(() => {
    nameInput.focus();
  }, 100);
}

function hideUniverseModal() {
  const modal = document.getElementById("universe-modal");
  const form = document.getElementById("universe-form");

  modal.classList.remove("show");
  // Reset form
  form.reset();
}

// Queue management variables
let queuePollingInterval = null;
let queueDebounceTimeout = null;

function showQueue(options = {}) {
  const { skipHistory = false, replace = false } = options;

  // Update URL
  if (!skipHistory) {
    updateURL("/queue", { view: "queue" }, { replace });
  }

  // Hide other content
  document.getElementById("homepage").style.display = "none";
  document.getElementById("universe-content").style.display = "none";

  // Show queue content
  const mainContent = document.getElementById("main-content");
  mainContent.innerHTML = `
    <div class="wiki-article">
      <h1>Build Queue</h1>
      <p>Monitor the current status of content generation jobs.</p>

      <div id="queue-stats" class="queue-stats">
        <div class="wiki-loading">Loading queue status...</div>
      </div>

      <div id="queue-jobs" class="queue-jobs">
        <!-- Job details will be loaded here -->
      </div>

      <div class="queue-controls">
        <button class="wiki-btn" onclick="refreshQueueData()">Refresh</button>
        <button class="wiki-btn wiki-btn-secondary" onclick="toggleQueuePolling()" id="polling-toggle">
          Start Auto-Refresh
        </button>
      </div>
    </div>
  `;

  // Load initial queue data
  loadQueueData();
}

function loadQueueData() {
  fetch("http://localhost:3000/queue/stats")
    .then((response) => response.json())
    .then((stats) => {
      updateQueueDisplay(stats);
    })
    .catch((error) => {
      console.error("Error loading queue data:", error);
      document.getElementById("queue-stats").innerHTML = `
        <div class="wiki-error">Error loading queue status: ${error.message}</div>
      `;
    });
}

function updateQueueDisplay(stats) {
  const queueStatsElement = document.getElementById("queue-stats");
  if (!queueStatsElement) return;

  const totalJobs = stats.total || 0;
  const waitingJobs = stats.waiting || 0;
  const activeJobs = stats.active || 0;
  const completedJobs = stats.completed || 0;
  const failedJobs = stats.failed || 0;

  queueStatsElement.innerHTML = `
    <div class="queue-summary">
      <h2>Queue Summary</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-number">${totalJobs}</div>
          <div class="stat-label">Total Jobs</div>
        </div>
        <div class="stat-card waiting">
          <div class="stat-number">${waitingJobs}</div>
          <div class="stat-label">Waiting</div>
        </div>
        <div class="stat-card active">
          <div class="stat-number">${activeJobs}</div>
          <div class="stat-label">Active</div>
        </div>
        <div class="stat-card completed">
          <div class="stat-number">${completedJobs}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card failed">
          <div class="stat-number">${failedJobs}</div>
          <div class="stat-label">Failed</div>
        </div>
      </div>
    </div>
  `;

  // Update polling toggle button text
  const pollingToggle = document.getElementById("polling-toggle");
  if (pollingToggle) {
    pollingToggle.textContent = queuePollingInterval
      ? "Stop Auto-Refresh"
      : "Start Auto-Refresh";
  }
}

function refreshQueueData() {
  // Clear any existing debounce timeout
  if (queueDebounceTimeout) {
    clearTimeout(queueDebounceTimeout);
  }

  // Debounce the refresh to prevent too frequent requests
  queueDebounceTimeout = setTimeout(() => {
    loadQueueData();
  }, 1000);
}

function toggleQueuePolling() {
  if (queuePollingInterval) {
    // Stop polling
    clearInterval(queuePollingInterval);
    queuePollingInterval = null;
    console.log("Queue polling stopped");
  } else {
    // Start polling
    queuePollingInterval = setInterval(() => {
      refreshQueueData();
    }, 2000); // Poll every 2 seconds
    console.log("Queue polling started");
  }

  // Update button text
  const pollingToggle = document.getElementById("polling-toggle");
  if (pollingToggle) {
    pollingToggle.textContent = queuePollingInterval
      ? "Stop Auto-Refresh"
      : "Start Auto-Refresh";
  }
}

// Clean up polling when leaving queue page
function stopQueuePolling() {
  if (queuePollingInterval) {
    clearInterval(queuePollingInterval);
    queuePollingInterval = null;
  }
  if (queueDebounceTimeout) {
    clearTimeout(queueDebounceTimeout);
    queueDebounceTimeout = null;
  }
}

function showUniverseList(options = {}) {
  const { skipHistory = false, replace = false } = options;

  // Stop queue polling when navigating away
  stopQueuePolling();

  // Update URL
  if (!skipHistory) {
    updateURL("/universes", { view: "universe-list" }, { replace });
  }

  // Clear main content and show universe list
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.innerHTML = `
      <div class="wiki-article">
        <h1>All Universes</h1>
        <div class="wiki-content-list">
          <div id="universe-list-container">
            <div class="wiki-loading">Loading universes...</div>
          </div>
        </div>
      </div>
    `;
  }

  // Load universes into the main content
  loadUniversesForList();
}

function loadUniversesForList() {
  fetch("http://localhost:3000/universes")
    .then((response) => response.text())
    .then((html) => {
      // Wrap the content in a proper container
      document.getElementById("universe-list-container").innerHTML = html;

      // Event listeners are handled by document-level click handler
      console.log(
        "Universe list loaded, event handling via document listener"
      );
    })
    .catch((error) => {
      console.error("Error loading universes:", error);
      document.getElementById("universe-list-container").innerHTML =
        '<div class="wiki-error">Error loading universes</div>';
    });
}

function showHomepage(options = {}) {
  const { skipHistory = false, replace = false } = options;

  // Stop queue polling when navigating away
  stopQueuePolling();

  // Update URL
  if (!skipHistory) {
    updateURL("/", { view: "home" }, { replace });
  }

  // Clear main content and show homepage
  const mainContent = document.getElementById("main-content");
  if (mainContent) {
    mainContent.innerHTML = `
      <!-- Homepage -->
      <section id="homepage" class="wiki-homepage">
        <h1>Canon</h1>
        <p class="subtitle">
          An LLM-driven universe builder that creates rich, interconnected
          fictional worlds with geography, flora, fauna, intelligent
          species, cultures, and technologies.
        </p>

        <a href="#" class="wiki-btn" onclick="createNewUniverse()">
          Create Your First Universe
        </a>

        <div class="wiki-cards">
          <div class="wiki-card">
            <h3>🌍 Worlds</h3>
            <p>
              Explore planets, space stations, and other locations with
              detailed geography, climate, and resources.
            </p>
          </div>
          <div class="wiki-card">
            <h3>👥 Characters</h3>
            <p>
              Meet intelligent beings from various species with unique
              backgrounds, personalities, and relationships.
            </p>
          </div>
          <div class="wiki-card">
            <h3>🏛️ Cultures</h3>
            <p>
              Discover societies with their own values, government structures,
              and cultural artifacts.
            </p>
          </div>
          <div class="wiki-card">
            <h3>⚡ Technologies</h3>
            <p>
              Learn about advanced technologies, from FTL drives to alien
              innovations beyond our understanding.
            </p>
          </div>
        </div>
      </section>

      <!-- Loading Indicator -->
      <div id="loading-indicator" class="wiki-loading" style="display: none">
        <p>Creating universe...</p>
      </div>
    `;
  }

  // Reset sidebar to show universes
  const sidebar = document.querySelector("#wiki-sidebar");
  if (!sidebar) {
    console.error("Sidebar element not found");
    return;
  }
  sidebar.innerHTML = `
    <ds-col gap="24px">
      <header>
        <h2>Universes</h2>
      </header>
      <nav>
        <ul class="universe-list" id="universe-list">
          <ds-col gap="24px">
            <li class="loading">Loading universes...</li>
          </ds-col>
        </ul>
      </nav>
      <ds-button
        variant="primary"
        class="create-universe-btn"
        onclick="createNewUniverse()">
        Create New Universe
      </ds-button>
    </ds-col>
  `;

  // Reload universes
  loadUniverses();
}

// Handle universe selection - simplified approach
document.addEventListener("click", function (e) {
  console.log("Document click detected on:", e.target);

  if (
    e.target.classList.contains("universe-item") ||
    e.target.closest(".universe-item")
  ) {
    e.preventDefault();
    e.stopPropagation();

    const universeItem = e.target.classList.contains("universe-item")
      ? e.target
      : e.target.closest(".universe-item");
    const universeId = universeItem.dataset.universeId;

    console.log("Document click handler - universe clicked:", universeId);
    console.log("Universe item element:", universeItem);

    if (universeId) {
      showUniverse(universeId);

      // Update active state
      document.querySelectorAll(".universe-item").forEach((item) => {
        item.classList.remove("active");
      });
      universeItem.classList.add("active");
    } else {
      console.error("No universe ID found on clicked element");
    }
  }
});

// Handle back to homepage
document.addEventListener("click", function (e) {
  console.log(
    "Click detected on:",
    e.target,
    "Classes:",
    e.target.classList
  );
  if (
    e.target.classList.contains("back-to-home") ||
    e.target.closest(".back-to-home")
  ) {
    console.log("Back to home button clicked!");
    e.preventDefault();
    e.stopPropagation();

    // Direct navigation without URL update first
    navigateToHome();
  }
});

function navigateToHome() {
  showHomepage();
}

const globalCanon = {
  updateURL,
  parseURL,
  handleRoute,
  loadUniverses,
  showUniverse,
  loadUniverseCategories,
  loadCategory,
  updateCategorySidebar,
  loadPage,
  processWikiLinks,
  getCurrentUniverseId,
  checkJobStatus,
  refreshUniverseContent,
  createContent,
  createNewUniverse,
  showUniverseModal,
  hideUniverseModal,
  showQueue,
  loadQueueData,
  updateQueueDisplay,
  refreshQueueData,
  toggleQueuePolling,
  stopQueuePolling,
  showUniverseList,
  loadUniversesForList,
  showHomepage,
  navigateToHome,
};

type CanonGlobal = typeof globalCanon;

declare global {
  interface Window extends CanonGlobal {}
}

Object.assign(window as Window, globalCanon);
