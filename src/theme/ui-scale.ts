const referenceWidth = 390;
const sizeReduction = 0.7;
const baseScale = 0.84 * sizeReduction;
const minimumResponsiveScale = 0.85;
const maximumResponsiveScale = 1.15;

export function getUiScale(width: number) {
  const responsiveScale = Math.sqrt(Math.max(width, 1) / referenceWidth);
  const boundedResponsiveScale = Math.min(
    maximumResponsiveScale,
    Math.max(minimumResponsiveScale, responsiveScale)
  );

  return Math.min(
    1,
    Math.max(
      baseScale * minimumResponsiveScale,
      baseScale * boundedResponsiveScale
    )
  );
}

export function scaleUiValue(value: number, factor: number, floor = 0) {
  return Math.max(floor, Math.round(value * factor * 2) / 2);
}

const baseSizes = {
  effects: {
    starMin: 12,
    ringLarge: 88,
    ringSmall: 62,
    ringLargeStroke: 3,
    ringSmallStroke: 2,
    ringShadow: 10,
    starShadow: 8,
    burstLabel: 20,
    burstLabelOffset: 14,
    burstLabelTravel: 82,
    burstLabelShadow: 14,
    particle: 18,
    particleDistance: 48,
    particleDistanceVariation: 34,
    blushHeight: 24,
    blushWidth: 56,
  },
  header: {
    sideInset: 28,
    topPosition: 12,
    gap: 16,
    horizontalPadding: 32,
    verticalPadding: 14,
    borderWidth: 1,
    statusDot: 16,
    statusDotShadow: 12,
    title: 22,
    titleTracking: 1,
  },
  bubble: {
    topPosition: 74,
    maxWidth: 520,
    shadowVertical: 12,
    shadowBlur: 35,
    glowBlur: 18,
    gap: 12,
    radius: 26,
    borderWidth: 3,
    horizontalPadding: 16,
    verticalPadding: 24,
    icon: 48,
    title: 32,
    subtitle: 20,
    tailOffset: 13,
    tailSize: 24,
    tailBorderWidth: 3,
    tailCenterOffset: 12,
    hintTopGap: 26,
    hintGap: 12,
    hintHorizontalPadding: 20,
    hintVerticalPadding: 3,
    hintIcon: 22,
    hintText: 18,
    hintBorderWidth: 1,
  },
  nose: {
    target: 64,
    aura: 48,
    auraBorderWidth: 2,
    marker: 36,
    markerBorderWidth: 2,
    icon: 12,
  },
  footer: {
    sideInset: 28,
    gap: 12,
    inspirationMaxWidth: 320,
    inspirationWidth: "47%",
    inspirationRadius: 20,
    cardBorderWidth: 1,
    horizontalPadding: 16,
    verticalPadding: 19,
    caption: 14,
    captionTracking: 0.5,
    contentTopGap: 4,
    contentGap: 8,
    inspirationIcon: 28,
    inspirationText: 18,
    creationsMaxWidth: 260,
    creationsWidth: "35.5%",
    creationsMinWidth: 112,
    counterHorizontalPadding: 12,
    outerRadius: 25,
    outerBorderWidth: 3,
    outerPadding: 4,
    innerRadius: 19,
    innerBorderWidth: 1,
    counterVerticalPadding: 22,
    counterCaption: 14,
    counterCaptionTracking: 0.5,
    counterIcon: 26,
    counterValue: 46,
    counterShadow: 8,
    shadowVertical: 10,
    shadowBlur: 30,
  },
  interaction: {
    hitSlop: 8,
    pressRetention: 12,
    bottomInset: 12,
  },
} as const;

const scalePercent = (value: string, multiplier = 1): `${number}%` =>
  `${Number.parseFloat(value) * sizeReduction * multiplier}%` as `${number}%`;

export function getMagicHomeSizing(width: number) {
  const factor = getUiScale(width);
  const maxFontSizeMultiplier = 1.2;
  const size = (value: number, floor = 0) => scaleUiValue(value, factor, floor);

  return {
    factor,
    maxFontSizeMultiplier,
    effects: {
      maxFontSizeMultiplier,
      starMin: size(baseSizes.effects.starMin),
      starShadow: size(baseSizes.effects.starShadow),
      starFont: (index: number) =>
        size(baseSizes.effects.starMin + ((index * 7) % 13)),
      ringLarge: size(baseSizes.effects.ringLarge),
      ringSmall: size(baseSizes.effects.ringSmall),
      ringLargeStroke: size(baseSizes.effects.ringLargeStroke, 1),
      ringSmallStroke: size(baseSizes.effects.ringSmallStroke, 1),
      ringShadow: size(baseSizes.effects.ringShadow),
      burstLabel: size(baseSizes.effects.burstLabel, 12),
      burstLabelOffset: size(baseSizes.effects.burstLabelOffset),
      burstLabelTravel: size(baseSizes.effects.burstLabelTravel),
      burstLabelShadow: size(baseSizes.effects.burstLabelShadow),
      particle: size(baseSizes.effects.particle),
      particleDistanceForIndex: (index: number) =>
        size(
          baseSizes.effects.particleDistance +
            ((index * 19) % baseSizes.effects.particleDistanceVariation)
        ),
      blushHeight: size(baseSizes.effects.blushHeight),
      blushWidth: size(baseSizes.effects.blushWidth),
    },
    header: {
      sideInset: size(baseSizes.header.sideInset),
      topPosition: baseSizes.header.topPosition,
      gap: size(baseSizes.header.gap),
      horizontalPadding: size(baseSizes.header.horizontalPadding),
      verticalPadding: size(baseSizes.header.verticalPadding),
      borderWidth: size(baseSizes.header.borderWidth, 1),
      statusDot: size(baseSizes.header.statusDot, 16),
      statusDotShadow: size(baseSizes.header.statusDotShadow),
      title: size(baseSizes.header.title, 12),
      titleTracking: size(baseSizes.header.titleTracking),
    },
    bubble: {
      topPosition: baseSizes.bubble.topPosition,
      width: scalePercent("100%"),
      maxWidth: baseSizes.bubble.maxWidth * sizeReduction,
      shadowVertical: size(baseSizes.bubble.shadowVertical),
      shadowBlur: size(baseSizes.bubble.shadowBlur),
      glowBlur: size(baseSizes.bubble.glowBlur),
      gap: size(baseSizes.bubble.gap),
      radius: size(baseSizes.bubble.radius),
      borderWidth: size(baseSizes.bubble.borderWidth, 1),
      horizontalPadding: size(baseSizes.bubble.horizontalPadding),
      verticalPadding: size(baseSizes.bubble.verticalPadding),
      icon: size(baseSizes.bubble.icon, 16),
      title: size(baseSizes.bubble.title, 18),
      subtitle: size(baseSizes.bubble.subtitle, 12),
      tailOffset: size(baseSizes.bubble.tailOffset),
      tailSize: size(baseSizes.bubble.tailSize),
      tailBorderWidth: size(baseSizes.bubble.tailBorderWidth, 1),
      tailCenterOffset: size(baseSizes.bubble.tailCenterOffset),
      hintTopGap: size(baseSizes.bubble.hintTopGap),
      hintGap: size(baseSizes.bubble.hintGap),
      hintHorizontalPadding: size(baseSizes.bubble.hintHorizontalPadding),
      hintVerticalPadding: size(baseSizes.bubble.hintVerticalPadding),
      hintIcon: size(baseSizes.bubble.hintIcon, 16),
      hintText: size(baseSizes.bubble.hintText, 12),
      hintBorderWidth: size(baseSizes.bubble.hintBorderWidth, 1),
    },
    nose: {
      target: size(baseSizes.nose.target, 48),
      aura: size(baseSizes.nose.aura),
      auraBorderWidth: size(baseSizes.nose.auraBorderWidth, 1),
      marker: size(baseSizes.nose.marker),
      markerBorderWidth: size(baseSizes.nose.markerBorderWidth, 1),
      icon: size(baseSizes.nose.icon, 16),
    },
    footer: {
      sideInset: size(baseSizes.footer.sideInset),
      gap: size(baseSizes.footer.gap),
      inspirationMaxWidth: size(baseSizes.footer.inspirationMaxWidth),
      inspirationWidth: scalePercent(baseSizes.footer.inspirationWidth, 1.3),
      inspirationRadius: size(baseSizes.footer.inspirationRadius),
      cardBorderWidth: size(baseSizes.footer.cardBorderWidth, 1),
      horizontalPadding: size(baseSizes.footer.horizontalPadding),
      verticalPadding: size(baseSizes.footer.verticalPadding),
      caption: size(baseSizes.footer.caption, 11),
      captionTracking: size(baseSizes.footer.captionTracking),
      contentTopGap: size(baseSizes.footer.contentTopGap),
      contentGap: size(baseSizes.footer.contentGap),
      inspirationIcon: size(baseSizes.footer.inspirationIcon, 16),
      inspirationText: size(baseSizes.footer.inspirationText, 12),
      creationsMaxWidth: size(baseSizes.footer.creationsMaxWidth),
      creationsWidth: scalePercent(baseSizes.footer.creationsWidth),
      creationsMinWidth: size(baseSizes.footer.creationsMinWidth, 120),
      counterHorizontalPadding: size(
        baseSizes.footer.counterHorizontalPadding
      ),
      outerRadius: size(baseSizes.footer.outerRadius),
      outerBorderWidth: size(baseSizes.footer.outerBorderWidth, 1),
      outerPadding: size(baseSizes.footer.outerPadding),
      innerRadius: size(baseSizes.footer.innerRadius),
      innerBorderWidth: size(baseSizes.footer.innerBorderWidth, 1),
      counterVerticalPadding: size(baseSizes.footer.counterVerticalPadding),
      counterCaption: size(baseSizes.footer.counterCaption, 11),
      counterCaptionTracking: size(baseSizes.footer.counterCaptionTracking),
      counterIcon: size(baseSizes.footer.counterIcon, 16),
      counterValue: size(baseSizes.footer.counterValue, 24),
      counterShadow: size(baseSizes.footer.counterShadow),
      shadowVertical: size(baseSizes.footer.shadowVertical),
      shadowBlur: size(baseSizes.footer.shadowBlur),
    },
    interaction: {
      hitSlop: size(baseSizes.interaction.hitSlop),
      pressRetention: size(baseSizes.interaction.pressRetention),
      bottomInset: size(baseSizes.interaction.bottomInset),
    },
  };
}
