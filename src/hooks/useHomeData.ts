import { useUser } from '@clerk/expo';

import { MISSIONS, VEINS } from '@/data';
import {
  getAvailableMissions,
  getCurrentLevel,
  getCurrentRank,
  getMissionStatus,
  getNextLevel,
  getNextRank,
  getRewardPreview,
} from '@/lib/progression';
import type { ArtisanLevel, ArtisanProgress, Reward, Vein, VeinId, VeinRank } from '@/types/progression';
import type { Mission } from '@/types/missions';
import { useArtisanStore } from '@/stores/artisan-store';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { images } from '@/constants/images';

const VEIN_ICONS = {
  artifice: 'hammer-screwdriver',
  merchant: 'storefront-outline',
  collector: 'basket-outline',
} as const satisfies Record<VeinId, keyof typeof MaterialCommunityIcons.glyphMap>;

type HomeVein = {
  vein: Vein;
  icon: (typeof VEIN_ICONS)[VeinId];
  cover: (typeof images.veinCovers)[VeinId];
  colorKey: VeinId;
  currentRank: VeinRank | null;
  nextRank: VeinRank | null;
  started: boolean;
};

export type HomeData = {
  isReady: boolean;
  firstName: string;
  imageUrl: string | null;
  craftFocus: string;
  setCraftFocus: (text: string) => void;
  progress: ArtisanProgress;
  currentLevel: ArtisanLevel;
  nextLevel: ArtisanLevel | null;
  completedFirstMissions: number;
  requiredFirstMissions: number;
  veins: readonly HomeVein[];
  featuredMission: Mission | null;
  otherMissions: readonly Mission[];
  featuredMissionStatus: 'in-progress' | 'available' | null;
  missionRewards: readonly Reward[];
  nextLevelRewards: readonly Reward[];
};

export function useHomeData(): HomeData {
  const { isLoaded, user } = useUser();
  const progress = useArtisanStore((state) => state.progress);
  const hasHydrated = useArtisanStore((state) => state.hasHydrated);
  const setCraftFocus = useArtisanStore((state) => state.setCraftFocus);
  const isReady = isLoaded && hasHydrated;
  const currentLevel = getCurrentLevel(progress);
  const nextLevel = getNextLevel(progress);
  const firstMissionByVein = new Map(
    MISSIONS.filter((mission) => mission.order === 1).map((mission) => [
      mission.veinId,
      mission.id,
    ]),
  );
  const completedFirstMissions = VEINS.filter((vein) => {
    const firstMissionId = firstMissionByVein.get(vein.id);
    return firstMissionId !== undefined && getMissionStatus(firstMissionId, progress) === 'completed';
  }).length;
  const availableMissions = getAvailableMissions(progress);
  const inProgressMission = MISSIONS.find(
    (mission) => getMissionStatus(mission.id, progress) === 'in-progress',
  );
  const featuredMission = inProgressMission ?? availableMissions[0] ?? null;
  const featuredMissionStatus = featuredMission
    ? getMissionStatus(featuredMission.id, progress) as 'in-progress' | 'available'
    : null;
  const otherMissions = availableMissions.filter(
    (mission) => mission.id !== featuredMission?.id,
  );

  return {
    isReady,
    firstName: user?.firstName?.trim() || 'Artesano',
    imageUrl: user?.imageUrl ?? null,
    craftFocus: progress.craftFocus ?? '',
    setCraftFocus,
    progress,
    currentLevel,
    nextLevel,
    completedFirstMissions,
    requiredFirstMissions:
      nextLevel?.requirements.minVeinsWithFirstMissionCompleted ?? 0,
    veins: VEINS.map((vein) => ({
      vein,
      icon: VEIN_ICONS[vein.id],
      cover: images.veinCovers[vein.id],
      colorKey: vein.id,
      currentRank: getCurrentRank(vein.id, progress),
      nextRank: getNextRank(vein.id, progress),
      started: progress.veins[vein.id].started,
    })),
    featuredMission,
    otherMissions,
    featuredMissionStatus,
    missionRewards: featuredMission ? getRewardPreview(featuredMission) : [],
    nextLevelRewards: nextLevel ? getRewardPreview(nextLevel) : [],
  };
}
