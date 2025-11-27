import type { ReactNode } from 'react';

interface KanbanColumnProps {
  title: string;
  count: number;
  children: ReactNode;
  color?: string;
}

export function KanbanColumn({ title, count, children, color = 'gray' }: KanbanColumnProps) {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700',
    blue: 'bg-blue-100 text-blue-700',
    green: 'bg-green-100 text-green-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    red: 'bg-red-100 text-red-700',
  }[color] || 'bg-gray-100 text-gray-700';

  return (
    <div className="flex-shrink-0 w-[280px] bg-gray-50 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClasses}`}>
          {count}
        </span>
      </div>
      
      <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
