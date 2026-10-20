export const MOCK_CENTER = {
  lat: 31.87149,
  lng: -116.60071,
} as const;

export interface MockPublicServiceFlags {
  simulateLatency: boolean;
  offline: boolean;
  forceDailyLimit: boolean;
  failureProbability: number;
}

export const MOCK_PUBLIC_SERVICE_FLAGS: MockPublicServiceFlags = {
  simulateLatency: true,
  offline: false,
  forceDailyLimit: false,
  failureProbability: 0,
};

export function setMockPublicServiceFlags(
  changes: Partial<MockPublicServiceFlags>,
): void {
  if (
    changes.failureProbability !== undefined &&
    (!Number.isFinite(changes.failureProbability) ||
      changes.failureProbability < 0 ||
      changes.failureProbability > 1)
  ) {
    throw new RangeError('La probabilidad de fallo debe estar entre 0 y 1.');
  }

  Object.assign(MOCK_PUBLIC_SERVICE_FLAGS, changes);
}
