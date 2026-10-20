import type { MissionProgress } from './missions';

export type ContentStatus = 'official' | 'proposed';

export type VeinId = 'artifice' | 'merchant' | 'collector';

export interface VeinArchetype {
  name: string;
  essence: string;
  description: readonly string[];
}

export interface Vein {
  id: VeinId;
  name: string;
  summary: string;
  purpose: string;
  principles: readonly string[];
  archetype: VeinArchetype;
  status: ContentStatus;
}

export type QualityAreaScope = 'craft-piece' | 'merchant' | 'collector';

export interface QualityArea {
  id: string;
  scope: QualityAreaScope;
  name: string;
  description: string;
  status: ContentStatus;
}

export type CraftGradeRule = 'base' | 'min-areas' | 'all-areas' | 'discretionary';

export interface CraftGrade {
  id: string;
  order: number;
  name: string;
  summary: string;
  description: string;
  rule: CraftGradeRule;
  minAreasMet: number | null;
  status: ContentStatus;
}

export type RewardType =
  | 'unlock-mission'
  | 'unlock-rank'
  | 'recognition'
  | 'profile-upgrade'
  | 'tool-access'
  | 'collaboration-access';

export interface Reward {
  type: RewardType;
  title: string;
  description: string;
  unlocksMissionIds?: readonly string[];
  unlocksRankIds?: readonly string[];
}

export interface RankRequirements {
  missionIds: readonly string[];
  qualityAreaIds: readonly string[];
  minQualityAreasMet: number | null;
}

export interface VeinRank {
  id: string;
  veinId: VeinId;
  order: number;
  name: string;
  tagline: string;
  summary: string;
  description: string;
  closingLine?: string;
  thresholdText?: string;
  requirements: RankRequirements;
  rewards: readonly Reward[];
  status: ContentStatus;
}

export interface ArtisanLevelRequirements {
  minVeinsWithFirstMissionCompleted: number;
}

export interface ArtisanLevel {
  id: string;
  level: number;
  name: string;
  summary: string;
  capabilities: readonly string[];
  requirements: ArtisanLevelRequirements;
  rewards: readonly Reward[];
  status: ContentStatus;
}

export interface ArtisanProgress {
  artisanLevel: number;
  craftFocus?: string;
  veins: Record<VeinId, { started: boolean; rankId: string | null }>;
  missions: Record<string, MissionProgress>;
}
