import { useEffect, useRef, useState } from "react";
import {
  Image,
  Pressable,
  Text,
  View,
  useWindowDimensions,
  type GestureResponderEvent,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  cancelAnimation,
  Easing,
  interpolate,
  interpolateColor,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from "react-native-reanimated";

import { images } from "@/constants/images";
import { colors, getMagicHomeSizing } from "@/theme";

type Celebration = {
  id: number;
  x: number;
  y: number;
};

const STAR_SYMBOLS = ["✦", "✧", "⋆", "✷", "·"] as const;
const STAR_COLORS = [
  colors.crema,
  colors.miel,
  colors.ocre,
  colors.bruma,
  colors.arcilla,
  colors.blanco,
] as const;
const CELEBRATION_SYMBOLS = ["✦", "✧", "✷", "⋆"] as const;
const CELEBRATION_TEXTS = ["+1 MAGIA", "¡Boop! +1", "✦ +1", "+1 ✨"] as const;
const STAR_COUNT = 14;
const BURST_PARTICLE_COUNT = 12;

function FallingStar({
  index,
  height,
  effects,
  reducedMotion,
}: {
  index: number;
  height: number;
  effects: ReturnType<typeof getMagicHomeSizing>["effects"];
  reducedMotion: boolean;
}) {
  const progress = useSharedValue(0);
  const duration = 5200 + (index % 6) * 520;
  const delay = index * 170;

  useEffect(() => {
    if (reducedMotion) return;

    progress.set(
      withDelay(
        delay,
        withRepeat(
          withTiming(1, { duration, easing: Easing.linear, reduceMotion: ReduceMotion.System }),
          -1,
          false
        )
      )
    );

    return () => cancelAnimation(progress);
  }, [delay, duration, progress, reducedMotion]);

  const animatedStyle = useAnimatedStyle(() => {
    const value = progress.get();
    return {
      opacity: interpolate(value, [0, 0.15, 0.85, 1], [0, 0.9, 0.9, 0]),
      transform: [
        { translateY: interpolate(value, [0, 1], [-32, height + 40]) },
        { translateX: interpolate(value, [0, 0.5, 1], [0, 14, -10]) },
        { rotate: `${interpolate(value, [0, 1], [0, 360])}deg` },
      ],
    };
  });

  return (
    <Animated.Text
      accessible={false}
      className="absolute top-0 font-display"
      style={[
        animatedStyle,
        {
          left: `${(index * 37 + 7) % 100}%`,
          color: STAR_COLORS[index % STAR_COLORS.length],
          fontSize: effects.starFont(index),
          textShadowColor: STAR_COLORS[index % STAR_COLORS.length],
          textShadowRadius: effects.starShadow,
        },
      ]}
      maxFontSizeMultiplier={effects.maxFontSizeMultiplier}
    >
      {STAR_SYMBOLS[index % STAR_SYMBOLS.length]}
    </Animated.Text>
  );
}

function CelebrationBurst({
  celebration,
  effects,
}: {
  celebration: Celebration;
  effects: ReturnType<typeof getMagicHomeSizing>["effects"];
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.set(
      withTiming(1, {
        duration: 850,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      })
    );

    return () => cancelAnimation(progress);
  }, [progress]);

  const ringStyle = useAnimatedStyle(() => {
    const value = progress.get();
    return {
      opacity: interpolate(value, [0, 0.7, 1], [0.9, 0.55, 0]),
      transform: [
        { scale: interpolate(value, [0, 1], [0.2, 1.75]) },
      ],
    };
  });

  const delayedRingStyle = useAnimatedStyle(() => {
    const value = progress.get();
    return {
      opacity: interpolate(value, [0.12, 0.8, 1], [0, 0.7, 0]),
      transform: [{ scale: interpolate(value, [0, 1], [0.15, 1.35]) }],
    };
  });

  const labelStyle = useAnimatedStyle(() => {
    const value = progress.get();
    return {
      opacity: interpolate(value, [0, 0.16, 0.75, 1], [0, 1, 1, 0]),
      transform: [
        {
          translateY: interpolate(
            value,
            [0, 1],
            [-effects.burstLabelOffset, -effects.burstLabelTravel]
          ),
        },
        { scale: interpolate(value, [0, 0.2, 1], [0.75, 1.1, 0.95]) },
      ],
    };
  });

  return (
    <View
      pointerEvents="none"
      className="absolute z-50 items-center justify-center"
      style={{ left: celebration.x, top: celebration.y }}
    >
      <Animated.View
        className="absolute rounded-full border-dorado-claro"
        style={[
          ringStyle,
          {
            width: effects.ringLarge,
            height: effects.ringLarge,
            borderWidth: effects.ringLargeStroke,
          },
        ]}
      />
      <Animated.View
        className="absolute rounded-full border-dorado"
        style={[
          delayedRingStyle,
          {
            width: effects.ringSmall,
            height: effects.ringSmall,
            borderWidth: effects.ringSmallStroke,
          },
        ]}
      />
      <Animated.Text
        className="absolute font-display text-dorado-claro"
        style={[
          labelStyle,
          {
            fontSize: effects.burstLabel,
            textShadowColor: colors.dorado,
            textShadowRadius: effects.burstLabelShadow,
          },
        ]}
        maxFontSizeMultiplier={effects.maxFontSizeMultiplier}
      >
        {CELEBRATION_TEXTS[celebration.id % CELEBRATION_TEXTS.length]}
      </Animated.Text>
      {Array.from({ length: BURST_PARTICLE_COUNT }, (_, index) => {
        return (
          <BurstParticle
            key={`${celebration.id}-${index}`}
            index={index}
            progress={progress}
            effects={effects}
          />
        );
      })}
    </View>
  );
}

function BurstParticle({
  index,
  progress,
  effects,
}: {
  index: number;
  progress: SharedValue<number>;
  effects: ReturnType<typeof getMagicHomeSizing>["effects"];
}) {
  const angle = (index / BURST_PARTICLE_COUNT) * Math.PI * 2;
  const distance = effects.particleDistanceForIndex(index);
  const deltaX = Math.cos(angle) * distance;
  const deltaY = Math.sin(angle) * distance;
  const color = STAR_COLORS[index % STAR_COLORS.length];
  const animatedStyle = useAnimatedStyle(() => {
    const value = progress.get();
    return {
      opacity: interpolate(value, [0, 0.15, 1], [0, 1, 0]),
      transform: [
        { translateX: interpolate(value, [0, 1], [0, deltaX]) },
        { translateY: interpolate(value, [0, 1], [0, deltaY]) },
        { rotate: `${interpolate(value, [0, 1], [0, index % 2 ? 180 : -180])}deg` },
        { scale: interpolate(value, [0, 0.2, 1], [0.7, 1.15, 0.85]) },
      ],
    };
  });

  return (
    <Animated.Text
      accessible={false}
      className="absolute font-display"
      style={[
        animatedStyle,
        {
          color,
          fontSize: effects.particle,
          textShadowColor: color,
          textShadowRadius: effects.ringShadow,
        },
      ]}
      maxFontSizeMultiplier={effects.maxFontSizeMultiplier}
    >
      {CELEBRATION_SYMBOLS[index % CELEBRATION_SYMBOLS.length]}
    </Animated.Text>
  );
}

function getEventCenter(event: GestureResponderEvent) {
  return {
    x: event.nativeEvent.pageX,
    y: event.nativeEvent.pageY,
  };
}

export function MagicHomeScreen() {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const sizing = getMagicHomeSizing(width);
  const { effects, header, bubble, nose, footer } = sizing;
  const reducedMotion = useReducedMotion();
  const [creations, setCreations] = useState(0);
  const [celebrations, setCelebrations] = useState<Celebration[]>([]);
  const nextCelebrationId = useRef(0);
  const cleanupTimers = useRef(new Set<ReturnType<typeof setTimeout>>());

  const avatarReaction = useSharedValue(0);
  const bubbleMotion = useSharedValue(0);
  const bubbleShimmer = useSharedValue(0);
  const noseAura = useSharedValue(0);
  const cheekBlush = useSharedValue(0);
  const counterPulse = useSharedValue(0);

  useEffect(() => {
    if (reducedMotion) return;

    bubbleMotion.set(
      withRepeat(
        withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    bubbleShimmer.set(
      withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );
    noseAura.set(
      withRepeat(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        -1,
        true
      )
    );

    return () => {
      cancelAnimation(bubbleMotion);
      cancelAnimation(bubbleShimmer);
      cancelAnimation(noseAura);
    };
  }, [bubbleMotion, bubbleShimmer, noseAura, reducedMotion]);

  useEffect(
    () => () => {
      cleanupTimers.current.forEach(clearTimeout);
      cleanupTimers.current.clear();
    },
    []
  );

  const avatarStyle = useAnimatedStyle(() => {
    const value = avatarReaction.get();
    return {
      transform: [
        { translateY: interpolate(value, [0, 0.35, 0.7, 1], [0, -7, 2, 0]) },
        { scale: interpolate(value, [0, 0.35, 0.7, 1], [1, 1.025, 0.99, 1]) },
      ],
    };
  });

  const bubbleStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(bubbleMotion.get(), [0, 1], [0, -5]) }],
    borderColor: interpolateColor(
      bubbleShimmer.get(),
      [0, 1],
      ["rgba(251, 191, 36, 0.8)", "rgba(254, 240, 138, 1)"]
    ),
  }));

  const auraStyle = useAnimatedStyle(() => {
    const value = noseAura.get();
    return {
      opacity: interpolate(value, [0, 1], [0.75, 0.08]),
      transform: [{ scale: interpolate(value, [0, 1], [0.8, 1.25]) }],
    };
  });

  const blushStyle = useAnimatedStyle(() => ({
    opacity: interpolate(cheekBlush.get(), [0, 1], [0, 0.48]),
  }));

  const counterStyle = useAnimatedStyle(() => {
    const value = counterPulse.get();
    return {
      transform: [{ scale: interpolate(value, [0, 0.3, 0.65, 1], [1, 1.08, 0.96, 1]) }],
    };
  });

  const countStyle = useAnimatedStyle(() => {
    const value = counterPulse.get();
    return {
      transform: [{ scale: interpolate(value, [0, 0.3, 1], [1, 1.24, 1]) }],
      color: interpolateColor(value, [0, 0.35, 1], [colors.doradoClaro, colors.blanco, colors.doradoClaro]),
    };
  });

  const bumpCounter = () => {
    counterPulse.set(
      withSequence(
        withTiming(0.3, { duration: 130, easing: Easing.out(Easing.cubic) }),
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withTiming(0, { duration: 170, easing: Easing.out(Easing.cubic) })
      )
    );
  };

  const celebrate = (event: GestureResponderEvent) => {
    const center = getEventCenter(event);
    const id = nextCelebrationId.current++;
    setCreations((value) => value + 1);
    setCelebrations((current) => [...current.slice(-2), { id, ...center }]);
    avatarReaction.set(
      withSequence(
        withTiming(0.35, { duration: 130, easing: Easing.out(Easing.cubic) }),
        withTiming(0.7, { duration: 120, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 130, easing: Easing.out(Easing.cubic) })
      )
    );
    cheekBlush.set(
      withSequence(
        withTiming(1, { duration: 130 }),
        withDelay(560, withTiming(0, { duration: 180 }))
      )
    );
    bumpCounter();

    const timer = setTimeout(() => {
      setCelebrations((current) => current.filter((item) => item.id !== id));
      cleanupTimers.current.delete(timer);
    }, 1000);
    cleanupTimers.current.add(timer);
  };

  const bottomInset = Math.max(
    insets.bottom + sizing.interaction.bottomInset,
    height * 0.134
  );

  return (
    <View className="relative flex-1 overflow-hidden bg-noche">
      <StatusBar hidden />
      <Animated.View
        pointerEvents="none"
        className="absolute inset-0"
        style={avatarStyle}
      >
        <Image
          source={images.roxyBackground}
          accessibilityLabel="Roxy, la mascota de Proyecto.R"
          style={{ position: "absolute", width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      </Animated.View>
      <View pointerEvents="none" className="absolute inset-0 bg-black/45" />

      <View pointerEvents="none" className="absolute inset-0 z-10">
        {Array.from({ length: STAR_COUNT }, (_, index) => (
          <FallingStar
            key={index}
            index={index}
            height={height}
            effects={effects}
            reducedMotion={reducedMotion}
          />
        ))}
      </View>

      <Animated.View
        pointerEvents="none"
        className="absolute left-[27%] top-[55.08%] z-20 rounded-full bg-rosa"
        style={[
          { height: effects.blushHeight, width: effects.blushWidth },
          blushStyle,
        ]}
      />
      <Animated.View
        pointerEvents="none"
        className="absolute right-[27%] top-[55.08%] z-20 rounded-full bg-rosa"
        style={[
          { height: effects.blushHeight, width: effects.blushWidth },
          blushStyle,
        ]}
      />

      <View
        className="absolute z-30 flex-row items-center justify-center"
        style={{
          top: insets.top + header.topPosition,
          left: header.sideInset,
          right: header.sideInset,
          gap: header.gap,
        }}
      >
        <View
          className="flex-row items-center rounded-full border border-white/25 bg-panel/90"
          style={{
            gap: header.gap,
            paddingHorizontal: header.horizontalPadding,
            paddingVertical: header.verticalPadding,
            borderWidth: header.borderWidth,
            flexShrink: 1,
          }}
        >
          <View
            className="rounded-full bg-verde-magico"
            style={{
              width: header.statusDot,
              height: header.statusDot,
              boxShadow: `0 0 ${header.statusDotShadow}px #34d399`,
            }}
          />
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            className="font-body font-bold uppercase text-dorado-claro"
            style={{
              fontSize: header.title,
              letterSpacing: header.titleTracking,
              flexShrink: 1,
            }}
            maxFontSizeMultiplier={sizing.maxFontSizeMultiplier}
          >
            Testeando
          </Text>
        </View>
      </View>

      <View
        pointerEvents="box-none"
        className="absolute inset-x-0 z-30 items-center"
        style={{
          top: insets.top + bubble.topPosition,
          paddingHorizontal: bubble.horizontalPadding,
        }}
      >
        <Animated.View
          className="relative flex-row items-center border bg-marfil"
          style={[
            bubbleStyle,
            {
              width: bubble.width,
              maxWidth: bubble.maxWidth,
              gap: bubble.gap,
              borderRadius: bubble.radius,
              borderWidth: bubble.borderWidth,
              paddingHorizontal: bubble.horizontalPadding,
              paddingVertical: bubble.verticalPadding,
              boxShadow: `0 ${bubble.shadowVertical}px ${bubble.shadowBlur}px rgba(0,0,0,0.55), 0 0 ${bubble.glowBlur}px rgba(251,191,36,0.28)`,
            },
          ]}
        >
          <Text
            accessible={false}
            className="font-display text-dorado"
            style={{ fontSize: bubble.icon }}
            maxFontSizeMultiplier={sizing.maxFontSizeMultiplier}
          >
            ✦
          </Text>
          <View className="flex-1 items-center">
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              className="text-center font-display text-marron"
              style={{ fontSize: bubble.title }}
              maxFontSizeMultiplier={sizing.maxFontSizeMultiplier}
            >
              ¡Bienvenido artesano!
            </Text>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              className="text-center font-body text-marron-claro"
              style={{ fontSize: bubble.subtitle }}
              maxFontSizeMultiplier={sizing.maxFontSizeMultiplier}
            >
              ¡Toca mi nariz para Pip Pip!
            </Text>
          </View>
          <View
            pointerEvents="none"
            className="absolute rotate-45 border-dorado bg-marfil"
            style={{
              bottom: -bubble.tailOffset,
              left: "50%",
              width: bubble.tailSize,
              height: bubble.tailSize,
              marginLeft: -bubble.tailCenterOffset,
              borderBottomWidth: bubble.tailBorderWidth,
              borderRightWidth: bubble.tailBorderWidth,
            }}
          />
        </Animated.View>

        <View
          className="flex-row items-center rounded-full border border-white/20 bg-panel/90"
          style={{
            marginTop: bubble.hintTopGap,
            gap: bubble.hintGap,
            paddingHorizontal: bubble.hintHorizontalPadding,
            paddingVertical: bubble.hintVerticalPadding,
            borderWidth: bubble.hintBorderWidth,
          }}
        >
          <Text
            accessible={false}
            className="font-body text-dorado"
            style={{ fontSize: bubble.hintIcon }}
            maxFontSizeMultiplier={sizing.maxFontSizeMultiplier}
          >
            👃
          </Text>
          <Text
            className="font-body text-marfil"
            style={{ fontSize: bubble.hintText }}
            maxFontSizeMultiplier={sizing.maxFontSizeMultiplier}
          >
            Toca la nariz de Roxy
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Tocar la nariz de Roxy para crear magia"
        hitSlop={sizing.interaction.hitSlop}
        onPress={celebrate}
        pressRetentionOffset={sizing.interaction.pressRetention}
        className="absolute left-1/2 top-[53%] z-40 items-center justify-center rounded-full"
        style={{
          width: nose.target,
          height: nose.target,
          marginLeft: -nose.target / 2,
          marginTop: -nose.target / 2,
        }}
      >
        <Animated.View
          pointerEvents="none"
          className="absolute rounded-full border-dorado/60 bg-dorado/20"
          style={[
            auraStyle,
            {
              width: nose.aura,
              height: nose.aura,
              borderWidth: nose.auraBorderWidth,
            },
          ]}
        />
        <View
          pointerEvents="none"
          className="items-center justify-center rounded-full border-dorado/60 bg-dorado/20"
          style={{
            width: nose.marker,
            height: nose.marker,
            borderWidth: nose.markerBorderWidth,
          }}
        >
          <Text
            accessible={false}
            className="font-display text-marfil"
            style={{ fontSize: nose.icon }}
            maxFontSizeMultiplier={sizing.maxFontSizeMultiplier}
          >
            ✧
          </Text>
        </View>
      </Pressable>

      {celebrations.map((celebration) => (
        <CelebrationBurst
          key={celebration.id}
          celebration={celebration}
          effects={effects}
        />
      ))}

      <View
        className="absolute z-30 flex-row items-end justify-between"
        style={{
          left: footer.sideInset,
          right: footer.sideInset,
          bottom: bottomInset,
          gap: footer.gap,
        }}
      >
        <View
          className="flex-none border border-white/20 bg-black/55"
          style={{
            width: footer.inspirationWidth,
            maxWidth: footer.inspirationMaxWidth,
            borderRadius: footer.inspirationRadius,
            borderWidth: footer.cardBorderWidth,
            paddingHorizontal: footer.horizontalPadding,
            paddingVertical: footer.verticalPadding,
          }}
        >
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}
            className="font-body font-bold uppercase text-dorado-claro/80"
            style={{
              fontSize: footer.caption,
              letterSpacing: footer.captionTracking,
            }}
            maxFontSizeMultiplier={sizing.maxFontSizeMultiplier}
          >
            Proyecto.R
          </Text>
          <View
            className="flex-row items-center"
            style={{
              marginTop: footer.contentTopGap,
              gap: footer.contentGap,
            }}
          >
            <Text
              accessible={false}
              className="font-display text-dorado"
              style={{ fontSize: footer.inspirationIcon }}
              maxFontSizeMultiplier={sizing.maxFontSizeMultiplier}
            >
              ✹
            </Text>
            <Text
              numberOfLines={2}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              className="font-display text-dorado-claro"
              style={{ fontSize: footer.inspirationText, flexShrink: 1 }}
              maxFontSizeMultiplier={sizing.maxFontSizeMultiplier}
            >
              Roxy uwu
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Pip Pip: ${creations}. Tocar para animar el contador`}
          onPress={bumpCounter}
          pressRetentionOffset={sizing.interaction.pressRetention}
          className="flex-none border-dorado bg-naranja"
          style={({ pressed }) => ({
            width: footer.creationsWidth,
            minWidth: footer.creationsMinWidth,
            minHeight: 48,
            maxWidth: footer.creationsMaxWidth,
            borderRadius: footer.outerRadius,
            borderWidth: footer.outerBorderWidth,
            padding: footer.outerPadding,
            opacity: pressed ? 0.88 : 1,
          })}
        >
          <Animated.View
            className="items-center border border-dorado/30 bg-panel"
            style={[
              counterStyle,
              {
                borderRadius: footer.innerRadius,
                borderWidth: footer.innerBorderWidth,
                paddingHorizontal: footer.counterHorizontalPadding,
                paddingVertical: footer.counterVerticalPadding,
                boxShadow: `0 ${footer.shadowVertical}px ${footer.shadowBlur}px rgba(245,158,11,0.4)`,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}
              className="font-body font-bold uppercase text-dorado"
              style={{
                fontSize: footer.counterCaption,
                letterSpacing: footer.counterCaptionTracking,
              }}
              maxFontSizeMultiplier={sizing.maxFontSizeMultiplier}
            >
              Pip Pip
            </Text>
            <View
              className="flex-row items-center"
              style={{
                marginTop: footer.contentTopGap,
                gap: footer.contentGap,
              }}
            >
              <Text
                accessible={false}
                className="font-body text-dorado"
                style={{ fontSize: footer.counterIcon }}
                maxFontSizeMultiplier={sizing.maxFontSizeMultiplier}
              >
                😭
              </Text>
              <Animated.Text
                accessibilityLiveRegion="polite"
                className="font-display text-dorado-claro"
                style={[
                  countStyle,
                  {
                    fontSize: footer.counterValue,
                    fontVariant: ["tabular-nums"],
                    textShadowColor: colors.dorado,
                    textShadowRadius: footer.counterShadow,
                  },
                ]}
                maxFontSizeMultiplier={sizing.maxFontSizeMultiplier}
              >
                {creations}
              </Animated.Text>
            </View>
          </Animated.View>
        </Pressable>
      </View>
    </View>
  );
}
