import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, Smartphone } from 'lucide-react';
import { CapacitorService } from '../services/capacitorService';
import { db } from '../db/surveyDatabase';
import { useLiveQuery } from 'dexie-react-hooks';

interface HeaderProps {
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ title = 'Khảo Sát Hiện Trường' }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Query unsynced records count live
  const unsyncedCount = useLiveQuery(
    () => db.surveys.where('isSynced').equals(0).count(),
    []
  ) ?? 0;

  useEffect(() => {
    // Listen for Network Status Changes via Capacitor
    const handleStatus = (status: { connected: boolean }) => {
      setIsOnline(status.connected);
    };

    CapacitorService.getNetworkStatus().then((status) => {
      setIsOnline(status.connected);
    });

    let cleanup: (() => void) | null = null;
    CapacitorService.listenNetworkStatus(handleStatus).then((listener) => {
      cleanup = listener.remove;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const handleManualSync = async () => {
    if (!isOnline) {
      CapacitorService.showToast('Không có kết nối mạng để đồng bộ!');
      return;
    }

    if (unsyncedCount === 0) {
      CapacitorService.showToast('Tất cả dữ liệu đã được đồng bộ!');
      return;
    }

    setIsSyncing(true);
    try {
      // Simulate sync with backend server
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      const unsyncedList = await db.surveys.where('isSynced').equals(0).toArray();
      for (const record of unsyncedList) {
        if (record.id) {
          await db.surveys.update(record.id, { isSynced: true });
        }
      }
      CapacitorService.showToast(`Đã đồng bộ thành công ${unsyncedCount} phiếu khảo sát!`);
    } catch (e) {
      CapacitorService.showToast('Đồng bộ thất bại, vui lòng thử lại sau.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-sky-700 to-indigo-800 text-white shadow-md pt-safe">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm">
            <Smartphone className="w-5 h-5 text-sky-200" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide leading-tight">{title}</h1>
            <p className="text-[11px] text-sky-200 font-medium">Capacitor Field Survey v1.0</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Unsynced Badge & Sync Button */}
          {unsyncedCount > 0 && (
            <button
              onClick={handleManualSync}
              disabled={isSyncing || !isOnline}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow transition-all ${
                isOnline
                  ? 'bg-amber-500 hover:bg-amber-600 text-white animate-pulse'
                  : 'bg-gray-600 text-gray-300 opacity-70'
              }`}
              title="Nhấn để đồng bộ dữ liệu ngoại tuyến"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{unsyncedCount} Chờ Sync</span>
            </button>
          )}

          {/* Network Status Indicator */}
          <div
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-md ${
              isOnline ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30' : 'bg-rose-500/20 text-rose-200 border border-rose-400/30'
            }`}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Online</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
