import { appStore } from '../state/app-store';
import type { AppState } from '../state/app-store';

class CanonUniverseModal extends HTMLElement {
  private unsubscribe?: () => void;
  private state: AppState | null = null;
  private nameValue = '';
  private wasOpen = false;

  connectedCallback(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    this.unsubscribe = appStore.subscribe((state) => {
      this.state = state;
      this.syncNameState();
      this.render();
    });
  }

  disconnectedCallback(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = undefined;
    }
  }

  private syncNameState(): void {
    const isOpen = this.state?.modal.open ?? false;
    if (!isOpen && this.wasOpen) {
      this.nameValue = '';
    }
    this.wasOpen = isOpen;
  }

  private render(): void {
    if (!this.shadowRoot || !this.state) {
      return;
    }

    const { modal } = this.state;
    const open = modal.open;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(6px);
          display: ${open ? 'flex' : 'none'};
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 24px;
        }

        .dialog {
          background: #ffffff;
          border-radius: 18px;
          padding: 32px;
          width: min(480px, 100%);
          box-shadow: 0 24px 60px rgba(15, 23, 42, 0.18);
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        h2 {
          margin: 0;
          font-size: 24px;
        }

        form {
          display: grid;
          gap: 16px;
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .error {
          color: #861616;
          background: rgba(215, 51, 51, 0.12);
          border-radius: 10px;
          padding: 12px;
          font-size: 14px;
        }
      </style>
      <div class="overlay" part="overlay">
        <div class="dialog" role="dialog" aria-modal="true">
          <h2>Create a new universe</h2>
          <p>Give your universe a name and Canon will scaffold categories and placeholder pages.</p>
          ${modal.error ? `<div class="error">${modal.error}</div>` : ''}
          <form id="universe-form">
            <ds-text-input
              id="universe-name"
              name="universe-name"
              placeholder="The Aether Archives"
              value="${this.nameValue.replace(/"/g, '&quot;')}"
              ${modal.submitting ? 'disabled' : ''}
              required
            ></ds-text-input>
            <div class="actions">
              <ds-button type="button" id="cancel-btn" variant="secondary" ${modal.submitting ? 'disabled' : ''}>
                Cancel
              </ds-button>
              <ds-button type="submit" variant="primary" ${modal.submitting ? 'disabled' : ''}>
                ${modal.submitting ? 'Creating…' : 'Create universe'}
              </ds-button>
            </div>
          </form>
        </div>
      </div>
    `;

    if (!open) {
      return;
    }

    const overlay = this.shadowRoot.querySelector<HTMLDivElement>('.overlay');
    if (overlay) {
      overlay.onclick = (event) => {
        if (event.target === overlay && !modal.submitting) {
          appStore.closeUniverseModal();
        }
      };
    }

    const cancelButton = this.shadowRoot.querySelector<HTMLButtonElement>('#cancel-btn');
    if (cancelButton) {
      cancelButton.onclick = () => {
        if (!modal.submitting) {
          appStore.closeUniverseModal();
        }
      };
    }

    const form = this.shadowRoot.querySelector<HTMLFormElement>('#universe-form');
    if (form) {
      form.onsubmit = (event) => {
        event.preventDefault();
        const input = this.shadowRoot?.querySelector<HTMLElement & { value?: string }>(
          '#universe-name'
        );
        const value = input?.value ?? this.nameValue;
        void appStore.submitUniverse(value ?? '');
      };
    }

    const input = this.shadowRoot.querySelector<HTMLElement & { value?: string }>(
      '#universe-name'
    );
    if (input) {
      input.addEventListener('input', (event: Event) => {
        const target = event.target as HTMLElement & { value?: string };
        this.nameValue = target?.value ?? '';
      });
    }
  }
}

if (!customElements.get('canon-universe-modal')) {
  customElements.define('canon-universe-modal', CanonUniverseModal);
}
