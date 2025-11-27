import type { ReactNode } from 'react';
import { Badge } from '@/components/ui';

interface KanbanColumnProps {
  title: string;
  count: number;
  children: ReactNode;
  color?: string;
}

export function KanbanColumn({ title, count, children, color = 'gray' }: KanbanColumnProps) {
  const colorVariantMap: Record<string, any> = {
    gray: 'secondary',
    blue: 'new',
    green: 'graduated',
    purple: 'surgery',
    orange: 'for_surgery',
    red: 'to_refer',
    yellow: 'warning',
  };

  const variant = colorVariantMap[color] || 'secondary';

  return (
    <div className="flex-shrink-0 w-[280px] bg-muted/30 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground text-sm">{title}</h3>
        <Badge variant={variant}>
          {count}
        </Badge>
      </div>
      
      <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
