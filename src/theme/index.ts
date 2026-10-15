import { colors } from "./colors";
import { typography } from "./typography";

export { colors } from "./colors";
export { fontFamilies, typography } from "./typography";
export { getMagicHomeSizing, getUiScale, scaleUiValue } from "./ui-scale";

export const theme = {
  colors,
  typography,
  radii: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 28,
    full: 999,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
  },
} as const;

export type Theme = typeof theme;
