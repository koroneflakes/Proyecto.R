export const fontFamilies = {
  display: "Gambarino",
  body: "System",
} as const;

export const typography = {
  h1: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: "700",
    letterSpacing: -0.8,
    fontFamily: fontFamilies.display,
  },
  h2: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    letterSpacing: -0.6,
    fontFamily: fontFamilies.display,
  },
  h3: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "600",
    letterSpacing: -0.4,
    fontFamily: fontFamilies.display,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    letterSpacing: 0,
    fontFamily: fontFamilies.body,
  },
  bodyMedium: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "400",
    letterSpacing: 0,
    fontFamily: fontFamilies.body,
  },
  bodySmall: {
    fontSize: 13,
    lineHeight: 20,
    fontWeight: "400",
    letterSpacing: 0,
    fontFamily: fontFamilies.body,
  },
  caption: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "400",
    letterSpacing: 0.2,
    fontFamily: fontFamilies.body,
  },
} as const;
