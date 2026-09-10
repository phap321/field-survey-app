import React from 'react';
import { LayoutDashboard, PlusCircle, Map, ListFilter } from 'lucide-react';

export type TabType = 'dashboard' | 'new-survey' | 'map-view' | 'survey-list';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const navItems = [
    { id: 'dashboard' as TabType, label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'new-survey' as TabType, label: 'Tạo phiếu', icon: PlusCircle },
    { id: 'map-view' as TabType, label: 'Bản đồ', icon: Map },
    { id: 'survey-list' as TabType, label: 'Danh sách', icon: ListFilter },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg pb-safe">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                isActive
                  ? 'text-sky-600 font-semibold'
                  : 'text-gray-500 hover:text-gray-700 font-normal'
              }`}
            >
              <div className={`p-1 rounded-full transition-all ${isActive ? 'bg-sky-50 scale-110' : ''}`}>
                <Icon className={`w-5 h-5 ${isActive ? 'text-sky-600' : 'text-gray-400'}`} />
              </div>
              <span className="text-[11px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
