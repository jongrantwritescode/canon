import "standards-ui/dist/styles.css";
import * as StandardsUI from "standards-ui";
import type { DesignTokens } from "standards-ui";

import tokens from "./design-system/tokens";

function mergeWithDefaults(
  defaults: DesignTokens | undefined,
  overrides: DesignTokens
): DesignTokens {
  const base = defaults ?? ({} as DesignTokens);

  const merged: DesignTokens = {
    ...base,
    ...overrides,
    color: {
      ...base?.color,
      ...overrides.color,
    },
    spacing: {
      ...base?.spacing,
      ...overrides.spacing,
    },
    typography: {
      ...base?.typography,
      ...overrides.typography,
    },
    layout: {
      ...base?.layout,
      ...overrides.layout,
    },
    components: {
      ...base?.components,
      ...overrides.components,
      button: {
        ...base?.components?.button,
        ...overrides.components?.button,
        variants: {
          ...base?.components?.button?.variants,
          ...overrides.components?.button?.variants,
          primary: {
            ...base?.components?.button?.variants?.primary,
            ...overrides.components?.button?.variants?.primary,
            states: {
              ...base?.components?.button?.variants?.primary?.states,
              ...overrides.components?.button?.variants?.primary?.states,
            },
          },
          secondary: {
            ...base?.components?.button?.variants?.secondary,
            ...overrides.components?.button?.variants?.secondary,
            states: {
              ...base?.components?.button?.variants?.secondary?.states,
              ...overrides.components?.button?.variants?.secondary?.states,
            },
          },
          danger: {
            ...base?.components?.button?.variants?.danger,
            ...overrides.components?.button?.variants?.danger,
            states: {
              ...base?.components?.button?.variants?.danger?.states,
              ...overrides.components?.button?.variants?.danger?.states,
            },
          },
        },
      },
    },
  };

  return merged;
}

const mergedTokens = mergeWithDefaults(StandardsUI.DEFAULT_TOKENS, tokens);
const initResult = StandardsUI.init(mergedTokens);

if (!initResult.success) {
  console.error("Failed to initialize Standards UI", initResult.errors);
}
