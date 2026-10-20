import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { SectionHeader } from '@/components/home/SectionHeader';
import type { HomeData } from '@/hooks/useHomeData';
import { theme } from '@/theme';

type FeaturedMissionCardProps = {
  home: HomeData;
};

export function FeaturedMissionCard({ home }: FeaturedMissionCardProps) {
  const mission = home.featuredMission;
  if (!mission || !home.featuredMissionStatus) {
    return null;
  }

  const vein = home.veins.find((item) => item.vein.id === mission.veinId);
  if (!vein) {
    return null;
  }

  const veinColor = theme.home.colors[vein.colorKey];
  const entries = home.progress.missions[mission.id]?.entries.length ?? 0;
  const targetCount = mission.objective.targetCount;
  const progressWidth: `${number}%` =
    targetCount === null ? '0%' : `${Math.min((entries / targetCount) * 100, 100)}%`;

  return (
    <View className="gap-3">
      <SectionHeader title="Tu siguiente paso" />
      <View
        className="gap-3"
        style={{
          padding: theme.home.spacing.compactCard,
          borderRadius: theme.home.radii.card,
          borderWidth: theme.home.dimensions.outline,
          borderLeftWidth: 4,
          borderColor: theme.home.colors.border,
          borderLeftColor: veinColor,
          backgroundColor: theme.home.colors.surface,
          ...theme.home.shadow,
        }}
      >
        <View className="flex-row items-center justify-between gap-2">
          <Text
            className="rounded-full px-3 py-1"
            style={{
              color: theme.home.colors.text,
              backgroundColor: `${veinColor}1F`,
              fontSize: theme.home.typography.label,
              lineHeight: theme.home.typography.statusPillLine,
              fontWeight: '600',
            }}
          >
            {vein.vein.name}
          </Text>
          <Text
            className="rounded-full px-3 py-1"
            style={{
              color: theme.home.colors.textSecondary,
              backgroundColor: theme.home.colors.missionStatusBackground,
              fontSize: theme.home.typography.label,
              lineHeight: theme.home.typography.statusPillLine,
            }}
          >
            {home.featuredMissionStatus === 'in-progress' ? 'En curso' : 'Disponible'}
          </Text>
        </View>
        <Text
          style={{
            color: theme.home.colors.text,
            fontSize: theme.home.typography.missionTitle,
            lineHeight: theme.home.typography.missionTitleLine,
            fontWeight: '600',
          }}
        >
          {mission.title}
        </Text>
        <Text
          numberOfLines={3}
          style={{
            color: theme.home.colors.textSecondary,
            fontSize: theme.home.typography.missionSummary,
            lineHeight: theme.home.typography.missionSummaryLine,
          }}
        >
          {mission.summary}
        </Text>

        {targetCount !== null ? (
          <View className="gap-1.5">
            <View
              className="overflow-hidden rounded-full"
              style={{
                height: theme.home.dimensions.missionProgressHeight,
                backgroundColor: theme.home.colors.progressTrack,
              }}
            >
              <View
                className="h-full rounded-full"
                style={{ width: progressWidth, backgroundColor: veinColor }}
              />
            </View>
            <Text
              style={{
                color: theme.home.colors.textSecondary,
                fontSize: theme.home.typography.secondary,
                lineHeight: theme.home.typography.secondaryLine,
              }}
            >
              {entries} de {targetCount}
            </Text>
          </View>
        ) : null}

        {mission.completionStatement ? (
          <View className="gap-1">
            <Text
              style={{
                color: theme.home.colors.textSecondary,
                fontSize: theme.home.typography.label,
                lineHeight: theme.home.typography.labelLine,
                letterSpacing: theme.home.typography.metadataLetterSpacing,
                fontWeight: '600',
              }}
            >
              AL TERMINAR PODRÁS DECIR
            </Text>
            <Text
              style={{
                color: theme.home.colors.text,
                fontSize: theme.home.typography.completion,
                lineHeight: theme.home.typography.completionLine,
                fontStyle: 'italic',
              }}
            >
              “{mission.completionStatement}”
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Ver misión: ${mission.title}`}
          onPress={() => router.push('/missions')}
          className="min-h-12 items-center justify-center"
          style={{
            minHeight: theme.home.dimensions.buttonHeight,
            borderRadius: theme.home.radii.button,
            backgroundColor: theme.home.colors.accent,
          }}
        >
          <Text
            style={{
              color: theme.home.colors.accentText,
              fontSize: theme.home.typography.body,
              fontWeight: '600',
            }}
          >
            Ver misión
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
