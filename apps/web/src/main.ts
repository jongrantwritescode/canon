import "./styles/canon.css";
import "./components/canon-app";
import "./components/universe-sidebar";
import "./components/main-view";
import "./components/universe-modal";
import { appStore } from "./state/app-store";
import { initRouter } from "./router";

async function startApp() {
  await appStore.actions.initialize();
  initRouter();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    void startApp();
  });
} else {
  void startApp();
}
