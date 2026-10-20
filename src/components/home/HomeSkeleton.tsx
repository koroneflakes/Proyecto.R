import { View } from 'react-native';

import { theme } from '@/theme';

function SkeletonBlock({
  height,
  width,
  radius = theme.home.radii.control,
}: {
  height: number;
  width?: number | `${number}%`;
  radius?: number;
}) {
  return (
    <View
      style={{
        height,
        width: width ?? '100%',
        borderRadius: radius,
        backgroundColor: theme.home.colors.skeleton,
      }}
    />
  );
}

export function HomeSkeleton() {
  return (
    <View className="gap-6">
      <View className="min-h-11 flex-row items-center justify-between">
        <View className="flex-1 gap-2">
          <SkeletonBlock height={14} width={46} radius={7} />
          <SkeletonBlock height={32} width={190} radius={10} />
        </View>
        <SkeletonBlock height={44} width={44} radius={22} />
      </View>
      <View
        className="justify-between"
        style={{
          minHeight: theme.home.dimensions.skeletonLevelCardMinHeight,
          padding: theme.home.spacing.card,
          borderRadius: theme.home.radii.card,
          backgroundColor: theme.home.colors.skeleton,
        }}
      >
        <View className="gap-2">
          <SkeletonBlock height={14} width={70} />
          <SkeletonBlock height={28} width="65%" />
        </View>
        <View className="gap-2">
          <SkeletonBlock height={44} />
          <SkeletonBlock height={18} width="75%" />
        </View>
        <View className="gap-2">
          <SkeletonBlock height={8} />
          <SkeletonBlock height={18} width="75%" />
        </View>
      </View>
      <View className="gap-3">
        <SkeletonBlock height={24} width={150} />
        <View className="flex-row gap-3">
          <SkeletonBlock height={210} width={168} radius={theme.home.radii.card} />
          <SkeletonBlock height={210} width={168} radius={theme.home.radii.card} />
        </View>
      </View>
      <View className="gap-3">
        <SkeletonBlock height={24} width={170} />
        <SkeletonBlock height={290} radius={theme.home.radii.card} />
      </View>
      <View className="gap-3">
        <SkeletonBlock height={24} width={140} />
        <SkeletonBlock height={56} radius={theme.home.radii.row} />
        <SkeletonBlock height={56} radius={theme.home.radii.row} />
      </View>
      <View className="gap-3">
        <SkeletonBlock height={24} width={180} />
        <SkeletonBlock height={220} radius={theme.home.radii.card} />
      </View>
    </View>
  );
}
