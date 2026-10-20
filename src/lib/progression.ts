import { ARTISAN_LEVELS } from '../data/artisan-levels';
import { CRAFT_GRADES } from '../data/craft-grades';
import { MISSIONS } from '../data/missions';
import { QUALITY_AREAS } from '../data/quality-areas';
import {
  ARTIFICE_RANKS,
  COLLECTOR_RANKS,
  MERCHANT_RANKS,
} from '../data/vein-ranks';
import { VEINS } from '../data/veins';
import type {
  ArtisanLevel,
  ArtisanProgress,
  CraftGrade,
  Reward,
  VeinId,
  VeinRank,
} from '../types/progression';
import type { Mission, MissionEntry } from '../types/missions';

const ALL_RANKS = [...ARTIFICE_RANKS, ...MERCHANT_RANKS, ...COLLECTOR_RANKS];
const RANKS_BY_VEIN: Record<VeinId, readonly VeinRank[]> = {
  artifice: ARTIFICE_RANKS,
  merchant: MERCHANT_RANKS,
  collector: COLLECTOR_RANKS,
};

function getFirstMissionIds(): Partial<Record<VeinId, string>> {
  const firstMissionIds: Partial<Record<VeinId, string>> = {};
  for (const mission of MISSIONS) {
    if (mission.order === 1) {
      firstMissionIds[mission.veinId] = mission.id;
    }
  }
  return firstMissionIds;
}

function isMissionCompleted(missionId: string, progress: ArtisanProgress): boolean {
  return progress.missions[missionId]?.status === 'completed';
}

function hasMissionPrerequisites(mission: Mission, progress: ArtisanProgress): boolean {
  const prerequisites = mission.prerequisites;
  if (!prerequisites.missionIds.every((missionId) => isMissionCompleted(missionId, progress))) {
    return false;
  }

  if (
    prerequisites.minArtisanLevel !== undefined &&
    progress.artisanLevel < prerequisites.minArtisanLevel
  ) {
    return false;
  }

  if (prerequisites.minRankId !== undefined) {
    const requiredRank = ALL_RANKS.find((rank) => rank.id === prerequisites.minRankId);
    if (!requiredRank || progress.veins[requiredRank.veinId].rankId !== requiredRank.id) {
      return false;
    }
  }

  return true;
}

function getMission(missionId: string): Mission {
  const mission = MISSIONS.find((item) => item.id === missionId);
  if (!mission) {
    throw new Error(`Unknown mission: ${missionId}`);
  }
  return mission;
}

function getMinimumRankId(mission: Mission): string | undefined {
  return mission.prerequisites.minRankId;
}

function getUnlockedMissionIds(reward: Reward): readonly string[] {
  return reward.unlocksMissionIds ?? [];
}

function getUnlockedRankIds(reward: Reward): readonly string[] {
  return reward.unlocksRankIds ?? [];
}

export function getCurrentLevel(progress: ArtisanProgress): ArtisanLevel {
  const firstMissionIds = getFirstMissionIds();
  const completedFirstMissionCount = Object.values(firstMissionIds).filter(
    (missionId) => missionId !== undefined && isMissionCompleted(missionId, progress),
  ).length;
  const currentLevel = [...ARTISAN_LEVELS]
    .sort((a, b) => a.level - b.level)
    .filter(
      (level) =>
        level.requirements.minVeinsWithFirstMissionCompleted <= completedFirstMissionCount,
    )
    .at(-1);

  if (!currentLevel) {
    throw new Error('No artisan level is defined for the current progress.');
  }
  return currentLevel;
}

export function getNextLevel(progress: ArtisanProgress): ArtisanLevel | null {
  const currentLevel = getCurrentLevel(progress);
  return (
    ARTISAN_LEVELS.find((level) => level.level === currentLevel.level + 1) ?? null
  );
}

export function getCurrentRank(
  veinId: VeinId,
  progress: ArtisanProgress,
): VeinRank | null {
  if (RANKS_BY_VEIN[veinId].length === 0) {
    return null;
  }

  const rankId = progress.veins[veinId].rankId;
  if (rankId === null) {
    return null;
  }

  const rank = RANKS_BY_VEIN[veinId].find((item) => item.id === rankId);
  if (!rank) {
    throw new Error(`Unknown ${veinId} rank: ${rankId}`);
  }
  return rank;
}

export function getNextRank(veinId: VeinId, progress: ArtisanProgress): VeinRank | null {
  const ranks = RANKS_BY_VEIN[veinId];
  if (ranks.length === 0) {
    return null;
  }

  const currentRank = getCurrentRank(veinId, progress);
  if (!currentRank) {
    return ranks.find((rank) => rank.order === 1) ?? null;
  }
  return ranks.find((rank) => rank.order === currentRank.order + 1) ?? null;
}

export function getMissionStatus(
  missionId: string,
  progress: ArtisanProgress,
): 'locked' | 'available' | 'in-progress' | 'completed' {
  const mission = getMission(missionId);
  const savedStatus = progress.missions[missionId]?.status;

  if (savedStatus === 'completed') {
    return 'completed';
  }
  if (!hasMissionPrerequisites(mission, progress)) {
    return 'locked';
  }
  return savedStatus === 'in-progress' ? 'in-progress' : 'available';
}

export function getAvailableMissions(progress: ArtisanProgress): readonly Mission[] {
  return MISSIONS.filter((mission) => getMissionStatus(mission.id, progress) === 'available');
}

export function getRewardPreview(
  target: ArtisanLevel | VeinRank | Mission,
): readonly Reward[] {
  return target.rewards;
}

export function getCraftGradeForAreas(areasMetCount: number): CraftGrade['id'] {
  if (!Number.isInteger(areasMetCount) || areasMetCount < 0 || areasMetCount > 6) {
    throw new RangeError('areasMetCount must be an integer between 0 and 6.');
  }

  if (areasMetCount === 6) {
    return 'emblem';
  }
  if (areasMetCount >= 4) {
    return 'maestre';
  }
  if (areasMetCount >= 2) {
    return 'artisanal';
  }
  return 'functional';
}

export function isMissionCompletable(
  mission: Mission,
  entries: readonly MissionEntry[],
  reflection?: string,
): boolean {
  const targetCount = mission.objective.targetCount;
  if (targetCount !== null && entries.length < targetCount) {
    return false;
  }

  if (mission.validation.requiresDistinctEntries) {
    const entryIds = new Set(entries.map((entry) => entry.id));
    if (entryIds.size !== entries.length) {
      return false;
    }
  }

  if (
    mission.validation.requiresEvidencePerEntry &&
    entries.some((entry) => entry.evidenceIds.length === 0)
  ) {
    return false;
  }

  if (mission.validation.requiresReflection && !reflection?.trim()) {
    return false;
  }

  return true;
}

export function canAdvanceRank(
  rank: VeinRank,
  progress: ArtisanProgress,
): { eligible: boolean; reason?: string } {
  if (rank.order === 1) {
    return { eligible: true };
  }

  if (rank.requirements.missionIds.length === 0 && rank.requirements.minQualityAreasMet === null) {
    return { eligible: false, reason: 'requirements-pending-design' };
  }

  const eligible = rank.requirements.missionIds.every((missionId) =>
    isMissionCompleted(missionId, progress),
  );
  return eligible ? { eligible: true } : { eligible: false };
}

export function validateContent(): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  const missionIds = new Set<string>(MISSIONS.map((mission) => mission.id));
  const rankIds = new Set<string>(ALL_RANKS.map((rank) => rank.id));
  const areaById = new Map(QUALITY_AREAS.map((area) => [area.id, area]));
  const veinIds = new Set(VEINS.map((vein) => vein.id));

  const registerIds = (items: readonly { id: string }[], label: string): void => {
    for (const item of items) {
      if (ids.has(item.id)) {
        errors.push(`Duplicate content id "${item.id}" (${label}).`);
      } else {
        ids.add(item.id);
      }
    }
  };

  registerIds(VEINS, 'vein');
  registerIds(QUALITY_AREAS, 'quality area');
  registerIds(CRAFT_GRADES, 'craft grade');
  registerIds(ARTISAN_LEVELS, 'artisan level');
  registerIds(MISSIONS, 'mission');
  registerIds(ALL_RANKS, 'rank');
  for (const mission of MISSIONS) {
    registerIds(mission.evidence, `evidence requirement for mission "${mission.id}"`);
  }

  for (const vein of VEINS) {
    const orders = MISSIONS.filter((mission) => mission.veinId === vein.id)
      .map((mission) => mission.order)
      .sort((a, b) => a - b);
    if (orders.some((order, index) => order !== index + 1)) {
      errors.push(`Mission order is not contiguous from 1 for vein "${vein.id}".`);
    }
  }

  for (const vein of VEINS) {
    const ranks = RANKS_BY_VEIN[vein.id];
    const orders = ranks.map((rank) => rank.order).sort((a, b) => a - b);
    if (orders.some((order, index) => order !== index + 1)) {
      errors.push(`Rank order is not contiguous from 1 for vein "${vein.id}".`);
    }
  }

  const levelNumbers = [...ARTISAN_LEVELS].map((level) => level.level).sort((a, b) => a - b);
  if (levelNumbers.some((level, index) => level !== index + 1)) {
    errors.push('Artisan level order is not contiguous from 1.');
  }

  const missionEdges = new Map<string, readonly string[]>();
  for (const mission of MISSIONS) {
    if (!veinIds.has(mission.veinId)) {
      errors.push(`Mission "${mission.id}" references unknown vein "${mission.veinId}".`);
    }
    missionEdges.set(mission.id, mission.prerequisites.missionIds);

    for (const prerequisiteId of mission.prerequisites.missionIds) {
      if (!missionIds.has(prerequisiteId)) {
        errors.push(`Mission "${mission.id}" references unknown prerequisite "${prerequisiteId}".`);
      }
    }
    const minRankId = getMinimumRankId(mission);
    if (minRankId !== undefined && !rankIds.has(minRankId)) {
      errors.push(
        `Mission "${mission.id}" references unknown prerequisite rank "${minRankId}".`,
      );
    }

    for (const reward of mission.rewards) {
      for (const unlockedMissionId of getUnlockedMissionIds(reward)) {
        if (!missionIds.has(unlockedMissionId)) {
          errors.push(`Mission "${mission.id}" unlocks unknown mission "${unlockedMissionId}".`);
        }
      }
      for (const unlockedRankId of getUnlockedRankIds(reward)) {
        if (!rankIds.has(unlockedRankId)) {
          errors.push(`Mission "${mission.id}" unlocks unknown rank "${unlockedRankId}".`);
        }
      }
    }
  }

  for (const rank of ALL_RANKS) {
    if (!veinIds.has(rank.veinId)) {
      errors.push(`Rank "${rank.id}" references unknown vein "${rank.veinId}".`);
    }
    for (const missionId of rank.requirements.missionIds) {
      if (!missionIds.has(missionId)) {
        errors.push(`Rank "${rank.id}" references unknown mission "${missionId}".`);
      }
    }
    for (const areaId of rank.requirements.qualityAreaIds) {
      const area = areaById.get(areaId);
      if (!area) {
        errors.push(`Rank "${rank.id}" references unknown quality area "${areaId}".`);
      } else if (area.scope !== rank.veinId) {
        errors.push(
          `Rank "${rank.id}" uses quality area "${areaId}" from scope "${area.scope}".`,
        );
      }
    }
    for (const reward of rank.rewards) {
      for (const unlockedMissionId of getUnlockedMissionIds(reward)) {
        if (!missionIds.has(unlockedMissionId)) {
          errors.push(`Rank "${rank.id}" unlocks unknown mission "${unlockedMissionId}".`);
        }
      }
      for (const unlockedRankId of getUnlockedRankIds(reward)) {
        if (!rankIds.has(unlockedRankId)) {
          errors.push(`Rank "${rank.id}" unlocks unknown rank "${unlockedRankId}".`);
        }
      }
    }
  }

  for (const level of ARTISAN_LEVELS) {
    for (const reward of level.rewards) {
      for (const unlockedMissionId of getUnlockedMissionIds(reward)) {
        if (!missionIds.has(unlockedMissionId)) {
          errors.push(`Level "${level.id}" unlocks unknown mission "${unlockedMissionId}".`);
        }
      }
      for (const unlockedRankId of getUnlockedRankIds(reward)) {
        if (!rankIds.has(unlockedRankId)) {
          errors.push(`Level "${level.id}" unlocks unknown rank "${unlockedRankId}".`);
        }
      }
    }
  }

  const visitState = new Map<string, 'visiting' | 'visited'>();
  const visitMission = (missionId: string): void => {
    const state = visitState.get(missionId);
    if (state === 'visiting') {
      errors.push(`Mission prerequisite cycle includes "${missionId}".`);
      return;
    }
    if (state === 'visited') {
      return;
    }

    visitState.set(missionId, 'visiting');
    for (const prerequisiteId of missionEdges.get(missionId) ?? []) {
      if (missionIds.has(prerequisiteId)) {
        visitMission(prerequisiteId);
      }
    }
    visitState.set(missionId, 'visited');
  };

  for (const missionId of missionIds) {
    visitMission(missionId);
  }

  return errors;
}
