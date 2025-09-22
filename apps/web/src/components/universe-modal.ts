import { appStore } from "../state/app-store";
import { escapeHtml } from "../utils/dom";

class UniverseModal extends HTMLElement {
  private unsubscribe?: () => void;

  private readonly handleClick = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!target) {
      return;
    }

    const actionEl = target.closest<HTMLElement>("[data-action]");
    if (!actionEl) {
      return;
    }

    if (actionEl.dataset.action === "close-universe-modal") {
      if (actionEl.classList.contains("modal-overlay") && actionEl !== target) {
        return;
      }
      event.preventDefault();
      appStore.actions.closeUniverseModal();
    }
  };

  private readonly handleSubmit = (event: Event) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = String(formData.get("universe-name") || "").trim();
    if (name) {
      void appStore.actions.createUniverse(name);
    }
  };

  connectedCallback() {
    this.unsubscribe = appStore.subscribe(() => this.render());
    this.render();
    this.addEventListener("click", this.handleClick);
    this.addEventListener("submit", this.handleSubmit);
  }

  disconnectedCallback() {
    this.unsubscribe?.();
    this.removeEventListener("click", this.handleClick);
    this.removeEventListener("submit", this.handleSubmit);
  }

  private render() {
    const state = appStore.getState();
    if (!state.modal.createUniverse) {
      this.innerHTML = "";
      return;
    }

    const error = state.errors.createUniverse
      ? `<div class=\"wiki-error\">${escapeHtml(state.errors.createUniverse)}</div>`
      : "";
    const loadingMessage = state.loading.createUniverse
      ? '<div class="wiki-loading">Creating universe...</div>'
      : "";

    this.innerHTML = `
      <div class="modal-overlay show" data-action="close-universe-modal">
        <div class="modal" role="dialog" aria-modal="true">
          <button class="modal-close" data-action="close-universe-modal" aria-label="Close">×</button>
          <h2>Create New Universe</h2>
          <form class="modal-form">
            <label for="universe-name">Universe Name</label>
            <input id="universe-name" name="universe-name" type="text" placeholder="Enter a name" required />
            ${error}
            ${loadingMessage}
            <div class="modal-actions">
              <button type="submit" class="wiki-btn wiki-btn-primary" ${
                state.loading.createUniverse ? "disabled" : ""
              }>Create</button>
              <button type="button" class="wiki-btn" data-action="close-universe-modal">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    queueMicrotask(() => {
      const input = this.querySelector<HTMLInputElement>("#universe-name");
      input?.focus();
    });
  }
}

if (!customElements.get("universe-modal")) {
  customElements.define("universe-modal", UniverseModal);
}
