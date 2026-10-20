import {
  MAX_SUBTYPES,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
} from './constants';
import { getCategory } from './categories';
import { isValidCoordinate } from './coordinates';
import { MAP_TEXTS } from './texts';
import {
  VALIDATION_ERROR_CODES,
  type LocationDraft,
  type ValidationErrorCode,
} from './types';
import { isValidSubtype } from './subtypes';

export interface DraftValidationError {
  code: ValidationErrorCode;
  message: string;
}

export function sanitizeName(name: string): string {
  return name
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function validateDraft(draft: LocationDraft): DraftValidationError[] {
  const errors: DraftValidationError[] = [];
  const name = sanitizeName(draft.name);
  const addError = (code: ValidationErrorCode) => {
    errors.push({ code, message: MAP_TEXTS.validationErrors[code] });
  };

  if (name.length === 0) {
    addError(VALIDATION_ERROR_CODES.NAME_REQUIRED);
  } else if (name.length < NAME_MIN_LENGTH) {
    addError(VALIDATION_ERROR_CODES.NAME_TOO_SHORT);
  } else if (name.length > NAME_MAX_LENGTH) {
    addError(VALIDATION_ERROR_CODES.NAME_TOO_LONG);
  }

  if (draft.category === null) {
    addError(VALIDATION_ERROR_CODES.CATEGORY_REQUIRED);
  } else if (!getCategory(draft.category)) {
    addError(VALIDATION_ERROR_CODES.CATEGORY_INVALID);
  }

  if (draft.subtypes.length > MAX_SUBTYPES) {
    addError(VALIDATION_ERROR_CODES.TOO_MANY_SUBTYPES);
  }

  const category = draft.category;
  if (category !== null && draft.subtypes.some((subtype) => !isValidSubtype(category, subtype))) {
    addError(VALIDATION_ERROR_CODES.SUBTYPE_NOT_ALLOWED_FOR_CATEGORY);
  }

  if (!isValidCoordinate(draft.lat, draft.lng)) {
    addError(VALIDATION_ERROR_CODES.COORDINATES_INVALID);
  }

  if (!draft.photoLocalUri?.trim()) {
    addError(VALIDATION_ERROR_CODES.PHOTO_REQUIRED);
  }

  return errors;
}
