import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { Image } from 'react-native';

import { PHOTO_MAX_SIDE_PX, PHOTO_TARGET_MAX_BYTES } from './constants';

const PHOTO_DIRECTORY = new Directory(Paths.document, 'locations');
const JPEG_QUALITIES = [0.85, 0.7, 0.55, 0.4] as const;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function ensurePhotoDirectory(): void {
  if (!PHOTO_DIRECTORY.exists) {
    PHOTO_DIRECTORY.create({ intermediates: true, idempotent: true });
  }
}

async function renderJpeg(
  sourceUri: string,
  width: number,
  height: number,
  quality: number,
): Promise<string> {
  const image = await ImageManipulator.ImageManipulator.manipulate(sourceUri)
    .resize({ width, height })
    .renderAsync();
  const result = await image.saveAsync({
    format: ImageManipulator.SaveFormat.JPEG,
    compress: quality,
  });

  return result.uri;
}

export async function processPhoto(
  sourceUri: string,
  photoId = Crypto.randomUUID(),
): Promise<string> {
  if (!sourceUri.trim()) {
    throw new Error('No se puede procesar una foto sin URI de origen.');
  }
  if (!UUID_PATTERN.test(photoId)) {
    throw new Error('El identificador de foto debe ser un UUID válido.');
  }

  ensurePhotoDirectory();

  const sourceImage = await Image.getSize(sourceUri);
  const originalMaxSide = Math.max(sourceImage.width, sourceImage.height);

  if (originalMaxSide <= 0) {
    throw new Error('La foto de origen tiene dimensiones inválidas.');
  }

  let maxSide = Math.min(originalMaxSide, PHOTO_MAX_SIDE_PX);
  let candidateUri: string | undefined;

  try {
    while (maxSide >= 1) {
      const scale = maxSide / originalMaxSide;
      const width = Math.max(1, Math.round(sourceImage.width * scale));
      const height = Math.max(1, Math.round(sourceImage.height * scale));

      for (const quality of JPEG_QUALITIES) {
        candidateUri = await renderJpeg(sourceUri, width, height, quality);
        const candidateFile = new File(candidateUri);

        if (candidateFile.size <= PHOTO_TARGET_MAX_BYTES) {
          const destination = new File(PHOTO_DIRECTORY, `${photoId}.jpg`);
          await candidateFile.move(destination, { overwrite: true });
          return destination.uri;
        }

        candidateFile.delete();
        candidateUri = undefined;
      }

      maxSide = Math.floor(maxSide * 0.8);
    }

    throw new Error(
      `No fue posible comprimir la foto por debajo de ${PHOTO_TARGET_MAX_BYTES} bytes.`,
    );
  } catch (error) {
    if (candidateUri) {
      const candidate = new File(candidateUri);
      if (candidate.exists) {
        candidate.delete();
      }
    }
    throw error;
  }
}

export function deletePhoto(id: string): void {
  if (!UUID_PATTERN.test(id)) {
    throw new Error('El identificador de foto debe ser un UUID válido.');
  }

  const file = new File(PHOTO_DIRECTORY, `${id}.jpg`);
  if (file.exists) {
    file.delete();
  }
}

export function deletePhotoAtUri(uri: string | null | undefined): void {
  if (!uri) {
    return;
  }

  const file = new File(uri);
  if (file.exists) {
    file.delete();
  }
}

export function cleanupOrphanPhotos(referencedPhotoUris: readonly string[]): number {
  if (!PHOTO_DIRECTORY.exists) {
    return 0;
  }

  const referenced = new Set(referencedPhotoUris);
  let removedCount = 0;

  for (const entry of PHOTO_DIRECTORY.list()) {
    if (entry instanceof File && entry.name.endsWith('.jpg') && !referenced.has(entry.uri)) {
      entry.delete();
      removedCount += 1;
    }
  }

  return removedCount;
}

export function getPhotoFile(uri: string): File {
  return new File(uri);
}
