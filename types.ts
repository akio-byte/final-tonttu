export enum AppStep {
  INTRO = 'INTRO',
  NAME_INPUT = 'NAME_INPUT',
  CAMERA = 'CAMERA',
  PROCESSING = 'PROCESSING',
  RESULT = 'RESULT',
}

export interface UserState {
  originalName: string;
  originalPhotoBase64: string | null;
  elfName: string | null;
  elfPhotoBase64: string | null;
}

export interface ElfNameResponse {
  tonttunimi: string;
}

// Error types
export class AppError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AppError';
  }
}
