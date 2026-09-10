import React, { useState, useEffect } from 'react';
import { CapacitorService } from '../services/capacitorService';
import { db } from '../db/surveyDatabase';
import { GPSLocation, PhotoAttachment, SurveyCategory, SurveyStatus } from '../types/survey';
import { Camera, MapPin, Save, Trash2, ImagePlus, Check, Navigation, AlertCircle } from 'lucide-react';

interface SurveyFormPageProps {
  onSuccess: () => void;
}

const CATEGORIES: SurveyCategory[] = [
  'Cơ sở hạ tầng',
  'Điện / Trạm biến áp',
  'Cấp thoát nước',
  'Giao thông',
  'Môi trường',
  'Khác'
];

const STATUSES: SurveyStatus[] = [
  'Tốt / Đạt',
  'Bảo trì',
  'Hỏng hóc',
  'Nghiêm trọng'
];

export const SurveyFormPage: React.FC<SurveyFormPageProps> = ({ onSuccess }) => {
  const [code, setCode] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [inspectorName, setInspectorName] = useState<string>('Nguyễn Văn Pháp');
  const [projectCode, setProjectCode] = useState<string>('DA-2026-HIEN_TRUONG');
  const [category, setCategory] = useState<SurveyCategory>('Cơ sở hạ tầng');
  const [status, setStatus] = useState<SurveyStatus>('Tốt / Đạt');
  const [description, setDescription] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [gps, setGps] = useState<GPSLocation | null>(null);
  const [isLoadingGps, setIsLoadingGps] = useState<boolean>(false);

  const [photos, setPhotos] = useState<PhotoAttachment[]>([]);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Auto generate unique survey code
  useEffect(() => {
    const randomCode = `KS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    setCode(randomCode);
    
    // Auto fetch GPS on mount
    fetchLocation();
  }, []);

  const fetchLocation = async () => {
    setIsLoadingGps(true);
    try {
      const loc = await CapacitorService.getCurrentPosition();
      setGps(loc);
      CapacitorService.showToast('Đã cập nhật vị trí GPS!');
    } catch (e) {
      CapacitorService.showToast('Lỗi khi lấy vị trí GPS');
    } finally {
      setIsLoadingGps(false);
    }
  };

  const handleCapturePhoto = async (source: 'camera' | 'photos') => {
    setIsCapturingPhoto(true);
    try {
      const dataUrl = await CapacitorService.takePhoto(source);
      if (dataUrl) {
        const newPhoto: PhotoAttachment = {
          id: Date.now().toString(),
          dataUrl,
          timestamp: new Date().toLocaleTimeString('vi-VN'),
          name: `Ảnh_${photos.length + 1}.jpg`
        };
        setPhotos(prev => [...prev, newPhoto]);
      }
    } catch (e) {
      console.error('Photo capture error:', e);
    } finally {
      setIsCapturingPhoto(false);
    }
  };

  const handleDeletePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      CapacitorService.showToast('Vui lòng nhập tiêu đề phiếu khảo sát');
      return;
    }
    if (!gps) {
      CapacitorService.showToast('Đang lấy vị trí GPS, vui lòng đợi...');
      return;
    }

    setIsSubmitting(true);
    try {
      await db.surveys.add({
        code,
        title: title.trim(),
        inspectorName: inspectorName.trim(),
        projectCode: projectCode.trim(),
        category,
        status,
        description: description.trim(),
        notes: notes.trim(),
        gps,
        photos,
        createdAt: new Date().toISOString(),
        isSynced: false // Saved offline
      });

      CapacitorService.showToast('Đã lưu phiếu khảo sát offline thành công!');
      onSuccess();
    } catch (err) {
      console.error('Save survey error:', err);
      CapacitorService.showToast('Lỗi khi lưu phiếu khảo sát');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-5 pb-28">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-base font-bold text-gray-800 border-b pb-2 flex items-center justify-between">
          <span>Thông Tin Phiếu Khảo Sát</span>
          <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
            {code}
          </span>
        </h2>

        {/* Tên bài khảo sát */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tiêu đề phiếu khảo sát <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="VD: Khảo sát trạm biến áp T3"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        {/* Mã dự án & Người kiểm tra */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Mã dự án</label>
            <input
              type="text"
              value={projectCode}
              onChange={e => setProjectCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Người khảo sát</label>
            <input
              type="text"
              value={inspectorName}
              onChange={e => setInspectorName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Phân loại & Trạng thái */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Hạng mục</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value as SurveyCategory)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Đánh giá hiện trạng</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as SurveyStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none bg-white"
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Định vị GPS hiện trường */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-gray-800 flex items-center space-x-1">
            <MapPin className="w-4 h-4 text-sky-600" />
            <span>Tọa độ GPS Hiện trường</span>
          </label>
          <button
            type="button"
            onClick={fetchLocation}
            disabled={isLoadingGps}
            className="flex items-center space-x-1 text-xs text-sky-600 bg-sky-50 px-2.5 py-1 rounded-lg hover:bg-sky-100 font-medium"
          >
            <Navigation className={`w-3.5 h-3.5 ${isLoadingGps ? 'animate-spin' : ''}`} />
            <span>{isLoadingGps ? 'Đang định vị...' : 'Cập nhật GPS'}</span>
          </button>
        </div>

        {gps ? (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1 font-mono text-slate-700">
            <div className="flex justify-between">
              <span className="text-gray-500">Vĩ độ (Lat):</span>
              <span className="font-semibold text-slate-900">{gps.latitude.toFixed(6)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Kinh độ (Long):</span>
              <span className="font-semibold text-slate-900">{gps.longitude.toFixed(6)}</span>
            </div>
            {gps.accuracy && (
              <div className="flex justify-between text-[11px] text-gray-400">
                <span>Độ chính xác:</span>
                <span>±{gps.accuracy.toFixed(1)} m</span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Chưa lấy được vị trí GPS. Hãy nhấn "Cập nhật GPS".</span>
          </div>
        )}
      </div>

      {/* Ảnh đính kèm hiện trường */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-bold text-gray-800">
            Ảnh đính kèm ({photos.length})
          </label>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => handleCapturePhoto('camera')}
              disabled={isCapturingPhoto}
              className="flex items-center space-x-1 text-xs bg-sky-600 text-white px-2.5 py-1.5 rounded-lg shadow hover:bg-sky-700 font-medium active:scale-95 transition-all"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Chụp Ảnh</span>
            </button>

            <button
              type="button"
              onClick={() => handleCapturePhoto('photos')}
              disabled={isCapturingPhoto}
              className="flex items-center space-x-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1.5 rounded-lg hover:bg-gray-200 font-medium"
            >
              <ImagePlus className="w-3.5 h-3.5 text-gray-500" />
              <span>Thư viện</span>
            </button>
          </div>
        </div>

        {photos.length === 0 ? (
          <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-xs text-gray-400">
            Chưa có ảnh nào. Nhấn "Chụp Ảnh" để ghi nhận hiện trường.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p) => (
              <div key={p.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img src={p.dataUrl} alt={p.name} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(p.id)}
                  className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full shadow hover:bg-rose-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mô tả chi tiết & Ghi chú */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả hiện trạng chi tiết</label>
          <textarea
            rows={3}
            placeholder="Nhập thông tin ghi nhận tại hiện trường..."
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú thêm</label>
          <input
            type="text"
            placeholder="VD: Cần chuyển sang bộ phận bảo trì"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg flex items-center justify-center space-x-2 text-sm active:scale-98 transition-all"
      >
        <Save className="w-5 h-5" />
        <span>Lưu Phiếu Khảo Sát (Offline)</span>
      </button>
    </form>
  );
};
