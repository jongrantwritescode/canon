class CanonHelp extends HTMLElement {
  connectedCallback(): void {
    if (!this.shadowRoot) {
      this.attachShadow({ mode: 'open' });
    }

    this.render();
  }

  private render(): void {
    if (!this.shadowRoot) {
      return;
    }

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        section {
          display: grid;
          gap: 24px;
        }

        article {
          background: #ffffff;
          border-radius: 16px;
          border: 1px solid rgba(162, 169, 177, 0.26);
          padding: 28px;
          box-shadow: 0 16px 38px rgba(18, 23, 40, 0.08);
        }

        h1 {
          margin: 0 0 12px 0;
          font-size: 30px;
        }

        h2 {
          margin: 0 0 12px 0;
          font-size: 20px;
        }

        p {
          margin: 0 0 12px 0;
          line-height: 1.7;
          color: rgba(32, 33, 34, 0.72);
        }

        ul {
          margin: 0;
          padding-left: 20px;
          color: rgba(32, 33, 34, 0.72);
        }

        li + li {
          margin-top: 8px;
        }
      </style>
      <section>
        <article>
          <h1>Help & architecture notes</h1>
          <p>
            Canon now boots as a Standards UI + DataStar-style application shell. A shared store
            coordinates routing, universe data, and queue polling so that each web component can
            stay declarative.
          </p>
        </article>
        <article>
          <h2>Component responsibilities</h2>
          <ul>
            <li><strong>&lt;canon-app&gt;</strong> — orchestrates layout, navigation, and modal portals.</li>
            <li><strong>&lt;canon-universe-list&gt;</strong> — renders the universe catalog.</li>
            <li><strong>&lt;canon-universe-detail&gt;</strong> — shows hero content plus categories.</li>
            <li><strong>&lt;canon-category-panel&gt;</strong> — lists pages inside a category.</li>
            <li><strong>&lt;canon-page-viewer&gt;</strong> — presents markdown fragments and handles internal anchors.</li>
            <li><strong>&lt;canon-queue-dashboard&gt;</strong> — polls the job queue with Standards UI cards.</li>
            <li><strong>&lt;canon-universe-modal&gt;</strong> — wraps the creation flow in a reusable dialog.</li>
          </ul>
        </article>
        <article>
          <h2>Design token overrides</h2>
          <p>
            Tokens live in <code>src/design-system/tokens.ts</code>. They remap Standards UI variants to
            Canon’s encyclopedia palette so that buttons use <code>variant="primary"</code> and backgrounds
            inherit the shared theme without custom classes.
          </p>
        </article>
        <article>
          <h2>Routing & data flow</h2>
          <p>
            Routes map directly to store actions. Each navigation call updates browser history,
            requests data from <code>/api</code> endpoints, and re-renders subscribed components.
          </p>
          <p>
            The queue dashboard starts polling automatically when its route is active and stops when
            users leave the view.
          </p>
        </article>
      </section>
    `;
  }
}

if (!customElements.get('canon-help')) {
  customElements.define('canon-help', CanonHelp);
}
