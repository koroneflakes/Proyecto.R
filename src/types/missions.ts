import type { ContentStatus, Reward, VeinId } from './progression';

export type MissionStatus = 'locked' | 'available' | 'in-progress' | 'completed';

export type EvidenceType =
  | 'photo'
  | 'text-note'
  | 'before-after'
  | 'cost-breakdown'
  | 'sale-record'
  | 'resource-record';

export interface EvidenceRequirement {
  id: string;
  type: EvidenceType;
  label: string;
  description: string;
  perEntry: boolean;
}

export type MissionRule =
  | { kind: 'max-markup-percent'; percent: number; description: string }
  | {
      kind: 'allowed-acquisition-methods';
      methods: readonly ('free' | 'cheap' | 'exchange' | 'good-deal')[];
      description: string;
    }
  | { kind: 'use-existing-product'; description: string }
  | { kind: 'pick-unresolved-areas'; count: number; description: string }
  | { kind: 'custom'; description: string };

export interface MissionObjective {
  kind: 'create' | 'upgrade-grade' | 'sell' | 'source';
  targetCount: number | null;
}

export interface MissionValidation {
  requiresDistinctEntries: boolean;
  requiresEvidencePerEntry: boolean;
  requiresReflection: boolean;
}

export interface Mission {
  id: string;
  veinId: VeinId;
  order: number;
  title: string;
  summary: string;
  objective: MissionObjective;
  steps: readonly string[];
  rules: readonly MissionRule[];
  evidence: readonly EvidenceRequirement[];
  validation: MissionValidation;
  completionStatement: string | null;
  closingLine: string | null;
  prerequisites: {
    missionIds: readonly string[];
    minArtisanLevel?: number;
    minRankId?: string;
  };
  rewards: readonly Reward[];
  status: ContentStatus;
}

export interface MissionEntry {
  id: string;
  createdAt: string;
  note?: string;
  evidenceIds: readonly string[];
  data?: Record<string, string | number | boolean>;
}

export interface MissionProgress {
  status: MissionStatus;
  entries: readonly MissionEntry[];
  reflection?: string;
}
