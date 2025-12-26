export enum GameMode {
  MENU = 'MENU',
  LEARN = 'LEARN',
  FIND = 'FIND',
}

export enum MapRegion {
  WORLD = 'WORLD',
  ASIA = 'ASIA',
  INDIA = 'INDIA',
}

export interface GeoFeature {
  type: string;
  properties: {
    name: string;
    [key: string]: any;
  };
  geometry: any;
  id?: string | number;
}

export interface MapData {
  type: string;
  features: GeoFeature[];
}

export interface GameState {
  score: number;
  totalAttempts: number;
  currentTarget: string | null; // Name of the country/state to find
  message: string;
  feedbackType: 'neutral' | 'success' | 'error';
}

export interface FunFactResponse {
  fact: string;
  emoji: string;
}
