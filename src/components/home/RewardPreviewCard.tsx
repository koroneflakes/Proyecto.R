import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { HomeData } from '@/hooks/useHomeData';
import type { Reward } from '@/types/progression';
import { theme } from '@/theme';

const REWARD_ICONS = {
  recognition: 'medal-outline',
  'unlock-mission': 'lock-open-variant-outline',
  'unlock-rank': 'arrow-up-bold-circle-outline',
  'profile-upgrade': 'account-star-outline',
  'tool-access': 'tools',
  'collaboration-access': 'account-group-outline',
} as const satisfies Record<Reward['type'], keyof typeof MaterialCommunityIcons.glyphMap>;

function RewardRow({ reward }: { reward: Reward }) {
  return (
    <View className="min-h-11 flex-row items-center gap-3">
      <View
        className="items-center justify-center rounded-full"
        style={{
          width: theme.home.dimensions.rewardIcon,
          height: theme.home.dimensions.rewardIcon,
          backgroundColor: `${theme.home.colors.accent}1F`,
        }}
      >
        <MaterialCommunityIcons
          name={REWARD_ICONS[reward.type]}
          size={20}
          color={theme.home.colors.accent}
        />
      </View>
      <View className="flex-1 gap-0.5">
        <Text
          style={{
            color: theme.home.colors.text,
            fontSize: theme.home.typography.body,
            lineHeight: theme.home.typography.rewardTitleLine,
            fontWeight: '600',
          }}
        >
          {reward.title}
        </Text>
        <Text
          numberOfLines={2}
          style={{
            color: theme.home.colors.textSecondary,
            fontSize: theme.home.typography.secondary,
            lineHeight: theme.home.typography.secondaryLine,
          }}
        >
          {reward.description}
        </Text>
      </View>
    </View>
  );
}

function RewardGroup({
  title,
  rewards,
}: {
  title: string;
  rewards: readonly Reward[];
}) {
  if (rewards.length === 0) {
    return null;
  }

  return (
    <View className="gap-3">
      <Text
        style={{
          color: theme.home.colors.textSecondary,
          fontSize: theme.home.typography.secondary,
          lineHeight: theme.home.typography.secondaryLine,
          fontWeight: '600',
        }}
      >
        {title}
      </Text>
      {rewards.map((reward, index) => (
        <RewardRow key={`${reward.type}-${reward.title}-${index}`} reward={reward} />
      ))}
    </View>
  );
}

export function RewardPreviewCard({ home }: { home: HomeData }) {
  if (!home.featuredMission) {
    return null;
  }

  return (
    <View className="gap-3">
      <Text
        style={{
          color: theme.home.colors.text,
          fontSize: theme.home.typography.sectionTitle,
          lineHeight: theme.home.typography.sectionTitleLine,
          fontWeight: '600',
        }}
      >
        Recompensas a la vista
      </Text>
      <View
        className="gap-4"
        style={{
          padding: theme.home.spacing.card,
          borderRadius: theme.home.radii.card,
          borderWidth: theme.home.dimensions.outline,
          borderColor: theme.home.colors.border,
          backgroundColor: theme.home.colors.surface,
          ...theme.home.shadow,
        }}
      >
        <RewardGroup
          title={`Al completar «${home.featuredMission.title}»`}
          rewards={home.missionRewards}
        />
        {home.nextLevel ? (
          <RewardGroup
            title={`Al llegar a ${home.nextLevel.name}`}
            rewards={home.nextLevelRewards}
          />
        ) : null}
      </View>
    </View>
  );
}
