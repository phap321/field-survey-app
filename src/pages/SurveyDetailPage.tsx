import React from 'react';
import { SurveyRecord } from '../types/survey';
import { X, MapPin, Calendar, User, Tag, ShieldCheck, CheckCircle2, Clock, AlertTriangle, FileText, Trash2 } from 'lucide-react';
import { db } from '../db/surveyDatabase';
import { CapacitorService } from '../services/capacitorService';

interface SurveyDetailPageProps {
  survey: SurveyRecord;
  onClose: () => void;
}

export const SurveyDetailPage: React.FC<SurveyDetailPageProps> = ({ survey, onClose }) => {
  const handleDelete = async () => {
    if (survey.id && confirm('Bạn có chắc chắn muốn xóa phiếu khảo sát này?')) {
      await db.surveys.delete(survey.id);
      CapacitorService.showToast('Đã xóa phiếu khảo sát');
      onClose();
    }
  };

  const handleToggleSync = async () => {
    if (survey.id) {
      const nextSync = !survey.isSynced;
      await db.surveys.update(survey.id, { isSynced: nextSync });
      survey.isSynced = nextSync;
      CapacitorService.showToast(nextSync ? 'Đã đánh dấu ĐÃ ĐỒNG BỘ' : 'Đã đánh dấu CHỜ ĐỒNG BỘ');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-700 to-indigo-800 text-white p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold bg-white/20 px-2 py-0.5 rounded text-sky-100">
                {survey.code}
              </span>
              <span className="text-xs text-sky-200">{survey.projectCode}</span>
            </div>
            <h3 className="text-base font-bold mt-1 line-clamp-1">{survey.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-sky-100"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-sm text-gray-700">
          {/* Status Banner */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200">
            <div>
              <div className="text-xs text-gray-500 font-medium">Trạng thái hiện trạng</div>
              <span
                className={`inline-block mt-1 px-2.5 py-0.5 text-xs font-bold rounded-full ${
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

            <button
              onClick={handleToggleSync}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition-all ${
                survey.isSynced
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-500 text-white hover:bg-amber-600'
              }`}
            >
              {survey.isSynced ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Đã Đồng Bộ</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5" />
                  <span>Chờ Đồng Bộ (Bấm để Sync)</span>
                </>
              )}
            </button>
          </div>

          {/* Key Info */}
          <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl">
            <div className="flex items-center space-x-2">
              <Tag className="w-4 h-4 text-sky-600" />
              <div>
                <div className="text-gray-400">Hạng mục</div>
                <div className="font-semibold text-gray-800">{survey.category}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-sky-600" />
              <div>
                <div className="text-gray-400">Người khảo sát</div>
                <div className="font-semibold text-gray-800">{survey.inspectorName}</div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-sky-600" />
              <div>
                <div className="text-gray-400">Thời gian tạo</div>
                <div className="font-semibold text-gray-800">
                  {new Date(survey.createdAt).toLocaleString('vi-VN')}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-sky-600" />
              <div>
                <div className="text-gray-400">Tọa độ GPS</div>
                <div className="font-mono text-gray-800 text-[11px]">
                  {survey.gps?.latitude?.toFixed(4)}, {survey.gps?.longitude?.toFixed(4)}
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="font-bold text-gray-800 mb-1 text-xs uppercase tracking-wide">Mô tả hiện trạng</h4>
            <p className="bg-white p-3 rounded-lg border border-gray-200 text-xs leading-relaxed text-gray-700">
              {survey.description || 'Không có mô tả chi tiết.'}
            </p>
          </div>

          {/* Notes */}
          {survey.notes && (
            <div>
              <h4 className="font-bold text-gray-800 mb-1 text-xs uppercase tracking-wide">Ghi chú bổ sung</h4>
              <p className="bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-xs text-amber-900">
                {survey.notes}
              </p>
            </div>
          )}

          {/* Photo Gallery */}
          {survey.photos && survey.photos.length > 0 && (
            <div>
              <h4 className="font-bold text-gray-800 mb-2 text-xs uppercase tracking-wide">
                Bộ sưu tập ảnh hiện trường ({survey.photos.length})
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {survey.photos.map((p) => (
                  <div key={p.id} className="rounded-lg overflow-hidden border border-gray-200 aspect-video">
                    <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <button
            onClick={handleDelete}
            className="flex items-center space-x-1 text-rose-600 hover:text-rose-700 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-rose-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>Xóa Phiếu</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg text-xs font-semibold hover:bg-gray-900"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
