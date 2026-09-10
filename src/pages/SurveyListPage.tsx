import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/surveyDatabase';
import { SurveyRecord } from '../types/survey';
import { Search, Download, Trash2, MapPin, Eye, FileText, Share2 } from 'lucide-react';
import { CapacitorService } from '../services/capacitorService';

interface SurveyListPageProps {
  onSelectSurvey: (survey: SurveyRecord) => void;
}

export const SurveyListPage: React.FC<SurveyListPageProps> = ({ onSelectSurvey }) => {
  const surveys = useLiveQuery(() => db.surveys.orderBy('createdAt').reverse().toArray()) ?? [];
  
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const filteredSurveys = surveys.filter((s) => {
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.inspectorName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' || s.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  const handleDelete = async (e: React.MouseEvent, id?: number) => {
    e.stopPropagation();
    if (!id) return;
    if (confirm('Bạn có chắc chắn muốn xóa phiếu khảo sát này?')) {
      await db.surveys.delete(id);
      CapacitorService.showToast('Đã xóa phiếu khảo sát');
    }
  };

  const handleExportCSV = () => {
    if (surveys.length === 0) {
      CapacitorService.showToast('Không có dữ liệu để xuất!');
      return;
    }

    const headers = ['Ma_Phieu', 'Tieu_De', 'Nguoi_Khao_Sat', 'Hang_Muc', 'Trang_Thai', 'Vi_Do', 'Kinh_Do', 'Ngay_Tao', 'Da_Dong_Bo'];
    const rows = surveys.map(s => [
      `"${s.code}"`,
      `"${s.title.replace(/"/g, '""')}"`,
      `"${s.inspectorName}"`,
      `"${s.category}"`,
      `"${s.status}"`,
      s.gps?.latitude || '',
      s.gps?.longitude || '',
      `"${s.createdAt}"`,
      s.isSynced ? 'Co' : 'Chua'
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Field_Survey_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    CapacitorService.showToast('Đã tải xuống tệp báo cáo CSV!');
  };

  return (
    <div className="p-4 space-y-4 pb-28">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-800">
          Danh Sách Phiếu ({filteredSurveys.length})
        </h2>
        <button
          onClick={handleExportCSV}
          className="flex items-center space-x-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1.5 rounded-lg shadow active:scale-95 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Xuất Báo Cáo CSV</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
        <input
          type="text"
          placeholder="Tìm theo tiêu đề, mã phiếu, người kiểm tra..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
        />
      </div>

      {/* Filter Categories */}
      <div className="flex space-x-2 overflow-x-auto pb-1 no-scrollbar text-xs">
        {['ALL', 'Cơ sở hạ tầng', 'Điện / Trạm biến áp', 'Cấp thoát nước', 'Giao thông'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilterCategory(cat)}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
              filterCategory === cat
                ? 'bg-sky-600 text-white shadow'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {cat === 'ALL' ? 'Tất cả' : cat}
          </button>
        ))}
      </div>

      {/* Survey List Items */}
      {filteredSurveys.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-xl border border-gray-100 text-gray-400 text-sm">
          Không tìm thấy phiếu khảo sát nào.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSurveys.map((survey) => (
            <div
              key={survey.id}
              onClick={() => onSelectSurvey(survey)}
              className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-2.5 cursor-pointer hover:border-sky-300 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                      {survey.code}
                    </span>
                    <span className="text-xs text-gray-500">{survey.category}</span>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mt-1">{survey.title}</h3>
                </div>

                <span
                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                    survey.status === 'Tốt / Đạt'
                      ? 'bg-emerald-100 text-emerald-800'
                      : survey.status === 'Bảo trì'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {survey.status}
                </span>
              </div>

              <p className="text-xs text-gray-600 line-clamp-2">
                {survey.description || 'Chưa có mô tả chi tiết.'}
              </p>

              <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-sky-600" />
                    <span>
                      {survey.gps?.latitude ? `${survey.gps.latitude.toFixed(4)}, ${survey.gps.longitude.toFixed(4)}` : 'Chưa GPS'}
                    </span>
                  </span>
                  <span>•</span>
                  <span>{new Date(survey.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded ${
                      survey.isSynced ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-800 font-semibold'
                    }`}
                  >
                    {survey.isSynced ? 'Synced' : 'Offline'}
                  </span>
                  <button
                    onClick={(e) => handleDelete(e, survey.id)}
                    className="p-1 text-gray-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
