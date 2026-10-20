import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { SectionHeader } from '@/components/home/SectionHeader';
import type { HomeData } from '@/hooks/useHomeData';
import { theme } from '@/theme';

type HomeVein = HomeData['veins'][number];

export function VeinCard({ item }: { item: HomeVein }) {
  const colors = theme.home.colors;
  const veinColor = colors[item.colorKey];
  const currentRankName =
    item.started && item.currentRank ? item.currentRank.name : null;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${item.vein.name}, ${currentRankName ?? 'Sin iniciar'}. Abrir Árbol.`}
      onPress={() => router.push('/development-tree')}
      className="overflow-hidden"
      style={{
        width: theme.home.dimensions.veinCardWidth,
        borderRadius: theme.home.radii.card,
        borderWidth: theme.home.dimensions.outline,
        borderColor: colors.border,
        backgroundColor: colors.surface,
        ...theme.home.shadow,
      }}
    >
      <View style={{ height: theme.home.dimensions.veinCoverHeight }}>
        <Image
          source={item.cover}
          contentFit="cover"
          transition={theme.home.motion.veinCoverTransitionMs}
          style={{ width: '100%', height: '100%' }}
          accessibilityLabel={`Imagen de ${item.vein.name}`}
        />
        <View
          className="absolute bottom-0 left-3 items-center justify-center rounded-full"
          style={{
            width: theme.home.dimensions.veinIconBadge,
            height: theme.home.dimensions.veinIconBadge,
            backgroundColor: veinColor,
            transform: [{ translateY: theme.home.dimensions.veinIconBadge / 2 }],
          }}
        >
          <MaterialCommunityIcons name={item.icon} size={20} color={colors.text} />
        </View>
      </View>
      <View
        className="gap-1.5"
        style={{
          padding: theme.home.spacing.carouselContent,
          paddingTop: theme.home.spacing.carouselContentTop,
        }}
      >
        <Text
          numberOfLines={2}
          style={{
            minHeight: theme.home.dimensions.veinCardTitleMinHeight,
            color: colors.text,
            fontSize: theme.home.typography.body,
            lineHeight: theme.home.typography.veinTitleLine,
            fontWeight: '600',
          }}
        >
          {item.vein.name}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            color: currentRankName ? colors.text : colors.textSecondary,
            fontSize: theme.home.typography.secondary,
            lineHeight: theme.home.typography.secondaryLine,
          }}
        >
          {currentRankName ?? 'Sin iniciar'}
        </Text>
        {item.nextRank ? (
          <Text
            numberOfLines={2}
            style={{
              color: colors.textSecondary,
              fontSize: theme.home.typography.label,
              lineHeight: theme.home.typography.veinNextRankLine,
            }}
          >
            Siguiente: {item.nextRank.name}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export function VeinCarousel({ items }: { items: readonly HomeVein[] }) {
  return (
    <View className="gap-3">
      <SectionHeader title="Tus venas" subtitle="Tu avance en cada camino" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={theme.home.dimensions.veinCardWidth + theme.home.dimensions.cardGap}
        decelerationRate="fast"
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={{
          gap: theme.home.dimensions.cardGap,
          paddingHorizontal: theme.home.spacing.horizontal,
        }}
        style={{ marginHorizontal: -theme.home.spacing.horizontal }}
      >
        {items.map((item) => (
          <VeinCard key={item.vein.id} item={item} />
        ))}
      </ScrollView>
    </View>
  );
}
