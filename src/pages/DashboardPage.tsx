import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/surveyDatabase';
import { TabType } from '../components/Navigation';
import { PlusCircle, MapPin, FileSpreadsheet, CheckCircle2, AlertTriangle, AlertOctagon, Clock, ShieldCheck } from 'lucide-react';
import { SurveyRecord } from '../types/survey';

interface DashboardPageProps {
  onNavigate: (tab: TabType) => void;
  onSelectSurvey: (survey: SurveyRecord) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, onSelectSurvey }) => {
  const surveys = useLiveQuery(() => db.surveys.orderBy('createdAt').reverse().toArray()) ?? [];

  const totalCount = surveys.length;
  const unsyncedCount = surveys.filter(s => !s.isSynced).length;
  const goodCount = surveys.filter(s => s.status === 'Tốt / Đạt').length;
  const maintenanceCount = surveys.filter(s => s.status === 'Bảo trì').length;
  const criticalCount = surveys.filter(s => s.status === 'Hỏng hóc' || s.status === 'Nghiêm trọng').length;

  const recentSurveys = surveys.slice(0, 4);

  return (
    <div className="p-4 space-y-5 pb-24">
      {/* Banner chào mừng & Thao tác nhanh */}
      <div className="bg-gradient-to-r from-sky-600 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
        <h2 className="text-xl font-bold">Khảo sát Hiện trường</h2>
        <p className="text-xs text-sky-100 mt-1">Lưu trữ ngoại tuyến - Tự động đồng bộ khi có mạng GPS</p>
        
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button
            onClick={() => onNavigate('new-survey')}
            className="flex items-center justify-center space-x-2 bg-white text-sky-700 py-2.5 px-3 rounded-xl font-medium text-sm shadow hover:bg-sky-50 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4 text-sky-600" />
            <span>Tạo Phiếu Mới</span>
          </button>
          
          <button
            onClick={() => onNavigate('map-view')}
            className="flex items-center justify-center space-x-2 bg-sky-500/30 backdrop-blur-md text-white border border-white/30 py-2.5 px-3 rounded-xl font-medium text-sm shadow hover:bg-sky-500/40 active:scale-95 transition-all"
          >
            <MapPin className="w-4 h-4 text-sky-200" />
            <span>Xem Bản Đồ</span>
          </button>
        </div>
      </div>

      {/* Thống kê chỉ số khảo sát */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="p-3 bg-sky-50 rounded-lg text-sky-600">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{totalCount}</div>
            <div className="text-xs text-gray-500 font-medium">Tổng số phiếu</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-800">{unsyncedCount}</div>
            <div className="text-xs text-gray-500 font-medium">Chờ sync offline</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-700">{goodCount}</div>
            <div className="text-xs text-gray-500 font-medium">Tốt / Đạt</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3">
          <div className="p-3 bg-rose-50 rounded-lg text-rose-600">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-rose-700">{criticalCount + maintenanceCount}</div>
            <div className="text-xs text-gray-500 font-medium">Cần bảo trì/Sửa</div>
          </div>
        </div>
      </div>

      {/* Danh sách bài khảo sát gần đây */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-gray-800">Khảo sát mới đây</h3>
          <button
            onClick={() => onNavigate('survey-list')}
            className="text-xs text-sky-600 font-medium hover:underline"
          >
            Xem tất cả ({totalCount})
          </button>
        </div>

        {recentSurveys.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-sm">
            Chưa có phiếu khảo sát nào. Bấm "Tạo Phiếu Mới" để bắt đầu!
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentSurveys.map((survey) => (
              <div
                key={survey.id}
                onClick={() => onSelectSurvey(survey)}
                className="py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                      {survey.code}
                    </span>
                    <span className="text-sm font-semibold text-gray-800 line-clamp-1">{survey.title}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span>{survey.category}</span>
                    <span>•</span>
                    <span>{new Date(survey.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                      survey.status === 'Tốt / Đạt'
                        ? 'bg-emerald-100 text-emerald-700'
                        : survey.status === 'Bảo trì'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {survey.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
