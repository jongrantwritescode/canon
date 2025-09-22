import { init, DEFAULT_TOKENS } from "standards-ui";
import "standards-ui/styles.css";

import CanonApp from "./components/canon-app";

if (!customElements.get("canon-app")) {
  customElements.define("canon-app", CanonApp);
}

init(DEFAULT_TOKENS);
