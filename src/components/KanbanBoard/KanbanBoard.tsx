import { useState } from 'react';
import { Input } from '@/components/ui';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';

export interface KanbanItem {
  id: string;
  patientName: string;
  patientId: string;
  assignedTo?: string;
  waitTime?: string;
  status?: string;
  column: string;
}

interface KanbanBoardProps {
  columns: {
    id: string;
    title: string;
    color?: string;
  }[];
  items: KanbanItem[];
  onCardClick?: (item: KanbanItem) => void;
  onSearch?: (query: string) => void;
}

export function KanbanBoard({ columns, items, onCardClick, onSearch }: KanbanBoardProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const filteredItems = items.filter(item =>
    item.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColumnItems = (columnId: string) => {
    return filteredItems.filter(item => item.column === columnId);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search by patient name or ID..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <KanbanColumn
            key={column.id}
            title={column.title}
            count={getColumnItems(column.id).length}
            color={column.color}
          >
            {getColumnItems(column.id).map(item => (
              <KanbanCard
                key={item.id}
                patientName={item.patientName}
                patientId={item.patientId}
                assignedTo={item.assignedTo}
                waitTime={item.waitTime}
                status={item.status}
                onClick={() => onCardClick?.(item)}
              />
            ))}
            
            {getColumnItems(column.id).length === 0 && (
              <div className="text-center py-8 text-gray-400 text-sm">
                No patients in this stage
              </div>
            )}
          </KanbanColumn>
        ))}
      </div>
    </div>
  );
}
