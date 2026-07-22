import React from 'react';
import { type IDEClass } from '../../data/ideData';

interface ClassSidebarProps {
  classes: IDEClass[];
  selectedClassId: string;
  onSelectClass: (id: string) => void;
}

export const ClassSidebar: React.FC<ClassSidebarProps> = ({ classes, selectedClassId, onSelectClass }) => {
  return (
    <div className="flex flex-col h-full bg-[#1b1928] text-slate-300 border-r border-[#2d2a3f]">
      <div className="p-5 border-b border-[#2d2a3f]">
        <h2 className="font-bold text-white text-lg tracking-tight mb-1">ক্লাসসমূহ</h2>
        <p className="text-xs text-[#7e7b99] font-medium">ক্লাস ১ - ৯</p>
      </div>
      <div className="flex-1 overflow-y-auto py-3 space-y-1">
        {classes.map((cls, idx) => {
          const isSelected = selectedClassId === cls.id;
          return (
            <button
              key={cls.id}
              onClick={() => onSelectClass(cls.id)}
              className={`w-full flex items-center justify-between px-5 py-3 transition-all text-sm font-medium ${
                isSelected
                  ? 'bg-[#2a2640] text-[#a98af8] border-l-2 border-[#a98af8]'
                  : 'text-[#9c9aae] hover:bg-[#232033] hover:text-slate-200 border-l-2 border-transparent'
              }`}
            >
              <span>{cls.title}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-[#3b3659] text-[#a98af8]' : 'bg-[#29263a] text-[#7e7b99]'}`}>
                5+4
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
