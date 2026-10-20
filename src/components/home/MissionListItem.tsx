import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import type { HomeData } from '@/hooks/useHomeData';
import { theme } from '@/theme';

type OtherMission = HomeData['otherMissions'][number];

export function MissionListItem({
  mission,
  home,
}: {
  mission: OtherMission;
  home: HomeData;
}) {
  const vein = home.veins.find((item) => item.vein.id === mission.veinId);
  if (!vein) {
    return null;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Ver misión: ${mission.title}`}
      onPress={() => router.push('/missions')}
      className="flex-row items-center gap-3 px-4"
      style={{
        minHeight: theme.home.dimensions.missionRowHeight,
        borderRadius: theme.home.radii.row,
        borderWidth: theme.home.dimensions.outline,
        borderColor: theme.home.colors.border,
        backgroundColor: theme.home.colors.surface,
      }}
    >
      <View
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: theme.home.colors[vein.colorKey] }}
      />
      <Text
        numberOfLines={1}
        className="flex-1"
        style={{
          color: theme.home.colors.text,
          fontSize: theme.home.typography.body,
          lineHeight: theme.home.typography.bodyLine,
        }}
      >
        {mission.title}
      </Text>
      <MaterialCommunityIcons
        name="chevron-right"
        size={theme.home.dimensions.icon}
        color={theme.home.colors.textSecondary}
      />
    </Pressable>
  );
}
