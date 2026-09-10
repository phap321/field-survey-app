import Dexie, { Table } from 'dexie';
import { SurveyRecord } from '../types/survey';

export class SurveyDatabase extends Dexie {
  surveys!: Table<SurveyRecord, number>;

  constructor() {
    super('FieldSurveyDatabase');
    this.version(1).stores({
      surveys: '++id, code, title, category, status, isSynced, createdAt'
    });
  }
}

export const db = new SurveyDatabase();

// Seed mock data if database is empty
export async function seedSampleSurveysIfEmpty() {
  const count = await db.surveys.count();
  if (count === 0) {
    const sampleSurveys: Omit<SurveyRecord, 'id'>[] = [
      {
        code: 'KS-2026-001',
        title: 'Khảo sát Cột điện hạ thế T12',
        inspectorName: 'Nguyễn Văn Pháp',
        projectCode: 'DA-DIEN-2026',
        category: 'Điện / Trạm biến áp',
        status: 'Bảo trì',
        description: 'Vỏ cách điện xuất hiện nứt rạn nhẹ, vỏ kim loại bị gỉ sét sương sa.',
        gps: {
          latitude: 10.776889,
          longitude: 106.700806,
          accuracy: 5.2,
          timestamp: Date.now() - 3600000
        },
        photos: [],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isSynced: true,
        notes: 'Đã báo bộ phận sửa chữa vật tư.'
      },
      {
        code: 'KS-2026-002',
        title: 'Kiểm tra Cống thoát nước D800',
        inspectorName: 'Trần Thị B',
        projectCode: 'DA-THOATNUEC-01',
        category: 'Cấp thoát nước',
        status: 'Hỏng hóc',
        description: 'Tắc nghẽn rác thải nghẽn dòng chảy 40%. Nắp hố ga bị rạn nứt góc.',
        gps: {
          latitude: 10.780123,
          longitude: 106.695432,
          accuracy: 3.8,
          timestamp: Date.now() - 7200000
        },
        photos: [],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        isSynced: false,
        notes: 'Cần đồng bộ với hệ thống đô thị.'
      },
      {
        code: 'KS-2026-003',
        title: 'Khảo sát Mặt đường Phạm Văn Đồng',
        inspectorName: 'Nguyễn Văn Pháp',
        projectCode: 'DA-GIAOTHONG-05',
        category: 'Giao thông',
        status: 'Tốt / Đạt',
        description: 'Mặt đường láng nhựa bằng phẳng, hệ thống vạch kẻ sơn phản quang rõ nét.',
        gps: {
          latitude: 10.823100,
          longitude: 106.689000,
          accuracy: 4.0,
          timestamp: Date.now()
        },
        photos: [],
        createdAt: new Date().toISOString(),
        isSynced: true,
        notes: 'Đã hoàn thành kiểm tra nghiệm thu.'
      }
    ];

    await db.surveys.bulkAdd(sampleSurveys);
  }
}
