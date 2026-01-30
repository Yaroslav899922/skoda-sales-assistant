export interface AdContent {
  olx: string;
  autoria: string;
  telegram: string;
  instagram: string;
  facebook: string;
  viber: string;
}

export interface AnalysisResult {
  summary: string;
  score: number; // 1-100
  checklist: string[]; // Service recommendations
  details: {
    optics: string;
    steering: string;
    seats: string;
    exterior: string;
  };
  defects: string[];
  preparation?: string; 
}

export interface CarDetails {
  model: string;
  year: string;
  mileage: string;
  price: string;
  engineVolume: string;
  fuelType: string;
  trimLevel?: string;
  additionalInfo?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  carDetails: CarDetails;
  analysis: AnalysisResult;
  ads: AdContent | null;
  images: string[]; // Base64 strings (limit count for storage)
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  REVIEW = 'REVIEW',
  GENERATING_ADS = 'GENERATING_ADS',
  DONE = 'DONE',
}