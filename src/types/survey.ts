export type SurveyCategory = 
  | 'Cơ sở hạ tầng'
  | 'Điện / Trạm biến áp'
  | 'Cấp thoát nước'
  | 'Giao thông'
  | 'Môi trường'
  | 'Khác';

export type SurveyStatus = 'Tốt / Đạt' | 'Bảo trì' | 'Hỏng hóc' | 'Nghiêm trọng';

export interface GPSLocation {
  latitude: number;
  longitude: number;
  altitude?: number | null;
  accuracy?: number | null;
  timestamp?: number;
}

export interface PhotoAttachment {
  id: string;
  dataUrl: string; // Base64 or ObjectURL
  timestamp: string;
  name: string;
}

export interface SurveyRecord {
  id?: number; // Auto increment ID from Dexie
  code: string;
  title: string;
  inspectorName: string;
  projectCode: string;
  category: SurveyCategory;
  status: SurveyStatus;
  description: string;
  gps: GPSLocation;
  photos: PhotoAttachment[];
  createdAt: string;
  isSynced: boolean;
  notes?: string;
}
