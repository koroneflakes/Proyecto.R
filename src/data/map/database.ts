import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'map-locations.db';
const DATABASE_VERSION = 2;

let databasePromise: Promise<SQLite.SQLiteDatabase> | undefined;

async function migrateDatabase(database: SQLite.SQLiteDatabase): Promise<void> {
  const versionRow = await database.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  );
  const currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion > DATABASE_VERSION) {
    throw new Error(
      `La base local está en la versión ${currentVersion}, superior a la compatible (${DATABASE_VERSION}).`,
    );
  }

  if (currentVersion < 1) {
    await database.withTransactionAsync(async () => {
      await database.execAsync(`
        CREATE TABLE locations (
          id TEXT PRIMARY KEY NOT NULL,
          owner_id TEXT NOT NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          subtypes TEXT NOT NULL DEFAULT '[]',
          lat REAL NOT NULL,
          lng REAL NOT NULL,
          photo_local_uri TEXT,
          photo_path TEXT,
          status TEXT NOT NULL,
          last_sync_error TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL,
          published_at INTEGER
        );
        CREATE INDEX locations_owner_status_idx
          ON locations (owner_id, status);
        CREATE INDEX locations_owner_coordinates_idx
          ON locations (owner_id, lat, lng);
        PRAGMA user_version = 1;
      `);
    });
  }

  if (currentVersion < 2) {
    await database.withTransactionAsync(async () => {
      await database.execAsync(`
        CREATE TABLE mock_public_locations (
          id TEXT PRIMARY KEY NOT NULL,
          owner_id TEXT NOT NULL,
          name TEXT NOT NULL,
          category TEXT NOT NULL,
          subtypes TEXT NOT NULL DEFAULT '[]',
          lat REAL NOT NULL,
          lng REAL NOT NULL,
          photo_url TEXT NOT NULL,
          created_at TEXT NOT NULL,
          published_at INTEGER NOT NULL
        );
        CREATE INDEX mock_public_locations_bounds_idx
          ON mock_public_locations (lat, lng);
        CREATE TABLE mock_public_location_reports (
          id TEXT PRIMARY KEY NOT NULL,
          location_id TEXT NOT NULL,
          reporter_id TEXT NOT NULL,
          reason TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          UNIQUE (location_id, reporter_id)
        );
        CREATE TABLE mock_public_publish_events (
          id TEXT PRIMARY KEY NOT NULL,
          owner_id TEXT NOT NULL,
          published_at INTEGER NOT NULL
        );
        CREATE INDEX mock_public_publish_events_owner_time_idx
          ON mock_public_publish_events (owner_id, published_at);
        CREATE TABLE mock_public_seed_state (
          id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
          seeded_at INTEGER NOT NULL
        );
        PRAGMA user_version = 2;
      `);
    });
  }
}

export function getLocationsDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME)
      .then(async (database) => {
        await database.execAsync('PRAGMA foreign_keys = ON;');
        await migrateDatabase(database);
        return database;
      })
      .catch((error: unknown) => {
        databasePromise = undefined;
        throw error;
      });
  }

  return databasePromise;
}
