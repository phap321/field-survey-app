import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/surveyDatabase';
import { SurveyRecord } from '../types/survey';
import { CapacitorService } from '../services/capacitorService';
import { Navigation, MapPin, CheckCircle, AlertTriangle, Crosshair } from 'lucide-react';

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Component to recenter map view
const RecenterMap: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
};

interface MapViewPageProps {
  onSelectSurvey: (survey: SurveyRecord) => void;
}

export const MapViewPage: React.FC<MapViewPageProps> = ({ onSelectSurvey }) => {
  const surveys = useLiveQuery(() => db.surveys.toArray()) ?? [];
  const [currentPos, setCurrentPos] = useState<[number, number]>([10.776889, 106.700806]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([10.776889, 106.700806]);

  useEffect(() => {
    CapacitorService.getCurrentPosition().then(loc => {
      const pos: [number, number] = [loc.latitude, loc.longitude];
      setCurrentPos(pos);
      setMapCenter(pos);
    });
  }, []);

  const handleCenterUser = async () => {
    const loc = await CapacitorService.getCurrentPosition();
    const pos: [number, number] = [loc.latitude, loc.longitude];
    setCurrentPos(pos);
    setMapCenter(pos);
    CapacitorService.showToast('Đã định vị đến vị trí hiện tại');
  };

  return (
    <div className="relative w-full h-[calc(100vh-8rem)] pb-16">
      <MapContainer
        center={mapCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={mapCenter} />

        {/* Current User Location Marker */}
        <Marker position={currentPos}>
          <Popup>
            <div className="text-xs font-semibold text-sky-700">
              📍 Vị trí hiện tại của bạn
            </div>
          </Popup>
        </Marker>

        {/* Survey Pins */}
        {surveys.map((survey) => {
          if (!survey.gps || !survey.gps.latitude || !survey.gps.longitude) return null;

          return (
            <Marker
              key={survey.id}
              position={[survey.gps.latitude, survey.gps.longitude]}
            >
              <Popup>
                <div className="p-1 space-y-1.5 max-w-[200px]">
                  <div className="flex items-center justify-between border-b pb-1">
                    <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-50 px-1 py-0.5 rounded">
                      {survey.code}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
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

                  <h4 className="text-xs font-bold text-gray-900 leading-tight">
                    {survey.title}
                  </h4>
                  <p className="text-[11px] text-gray-600 line-clamp-2">
                    {survey.description || 'Không có mô tả'}
                  </p>

                  <button
                    onClick={() => onSelectSurvey(survey)}
                    className="w-full mt-1 py-1 text-[11px] bg-sky-600 hover:bg-sky-700 text-white font-medium rounded text-center"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Floating Center GPS Button */}
      <button
        onClick={handleCenterUser}
        className="absolute bottom-20 right-4 z-30 p-3 bg-white text-sky-600 rounded-full shadow-xl border border-gray-200 active:scale-95 transition-all"
        title="Vị trí hiện tại"
      >
        <Crosshair className="w-6 h-6" />
      </button>
    </div>
  );
};
