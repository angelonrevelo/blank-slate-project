interface KanbanCardProps {
  patientName: string;
  patientId: string;
  assignedTo?: string;
  waitTime?: string;
  status?: string;
  onClick?: () => void;
}

export function KanbanCard({
  patientName,
  patientId,
  assignedTo,
  waitTime,
  status,
  onClick
}: KanbanCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-gray-900 text-sm">{patientName}</h4>
          {status && (
            <span className={`
              px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap
              ${status === 'Checkup' ? 'bg-blue-100 text-blue-700' : ''}
              ${status === 'Graduated' ? 'bg-green-100 text-green-700' : ''}
              ${status === 'Surgery' ? 'bg-purple-100 text-purple-700' : ''}
              ${status === 'Revisit' ? 'bg-orange-100 text-orange-700' : ''}
            `}>
              {status}
            </span>
          )}
        </div>
        
        <p className="text-xs text-gray-500">ID: {patientId}</p>
        
        {assignedTo && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span>{assignedTo}</span>
          </div>
        )}
        
        {waitTime && (
          <div className="flex items-center gap-1.5 text-xs text-gray-600">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
            </svg>
            <span>{waitTime}</span>
          </div>
        )}
      </div>
    </div>
  );
}
