import type { ArtisanProgress } from '../types/progression';

export const INITIAL_ARTISAN_PROGRESS: ArtisanProgress = {
  artisanLevel: 1,
  veins: {
    artifice: { started: false, rankId: null },
    merchant: { started: false, rankId: null },
    collector: { started: false, rankId: null },
  },
  missions: {
    'artifice-mission-1': { status: 'available', entries: [] },
    'artifice-mission-2': { status: 'locked', entries: [] },
    'merchant-mission-1': { status: 'available', entries: [] },
    'collector-mission-1': { status: 'available', entries: [] },
  },
};
