import { appStore } from "../state/app-store";

class CanonApp extends HTMLElement {
  private unsubscribe?: () => void;
  private readonly handleClick = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const actionElement = target.closest<HTMLElement>("[data-action]");
    if (!actionElement) {
      return;
    }

    const action = actionElement.dataset.action;
    if (!action) {
      return;
    }

    event.preventDefault();

    switch (action) {
      case "show-home":
        appStore.actions.showHome();
        break;
      case "show-queue":
        void appStore.actions.showQueue();
        break;
      case "reload-universes":
        void appStore.actions.loadUniverses();
        break;
      default:
        break;
    }
  };

  connectedCallback() {
    this.unsubscribe = appStore.subscribe(() => this.render());
    this.render();
    this.addEventListener("click", this.handleClick);
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.removeEventListener("click", this.handleClick);
  }

  private render() {
    const state = appStore.getState();
    const navView = state.view;

    this.innerHTML = `
      <div class="wiki-app">
        <header class="wiki-header">
          <div class="wiki-header-content">
            <a href="/" class="wiki-logo" data-action="show-home">Canon</a>
            <nav class="wiki-nav">
              <a href="/" data-action="show-home" class="${
                navView === "home" ? "active" : ""
              }">Home</a>
              <a href="/queue" data-action="show-queue" class="${
                navView === "queue" ? "active" : ""
              }">Queue</a>
            </nav>
          </div>
        </header>
        <div class="wiki-container">
          <universe-sidebar></universe-sidebar>
          <main class="wiki-content">
            <main-view></main-view>
          </main>
        </div>
        <universe-modal></universe-modal>
      </div>
    `;
  }
}

if (!customElements.get("canon-app")) {
  customElements.define("canon-app", CanonApp);
}
