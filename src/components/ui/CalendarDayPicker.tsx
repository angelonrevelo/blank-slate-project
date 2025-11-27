import { useState } from 'react';
import { Button } from './Button';

interface CalendarDayPickerProps {
  selectedDate?: Date;
  onDateSelect: (date: Date) => void;
  highlightedDates?: Date[];
  surgeryDates?: Date[];
}

export function CalendarDayPicker({
  selectedDate,
  onDateSelect,
  highlightedDates = [],
  surgeryDates = [],
}: CalendarDayPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };

  const isHighlighted = (date: Date) => {
    return highlightedDates.some(d => isSameDay(d, date));
  };

  const isSurgeryDate = (date: Date) => {
    return surgeryDates.some(d => isSameDay(d, date));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const handleDateClick = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    onDateSelect(date);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const renderDays = () => {
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square" />
      );
    }

    // Actual days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = selectedDate && isSameDay(date, selectedDate);
      const isHighlightedDate = isHighlighted(date);
      const isSurgery = isSurgeryDate(date);
      const isToday = isSameDay(date, new Date());

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`
            aspect-square flex items-center justify-center rounded-lg text-sm font-medium
            transition-all duration-200 relative
            ${isSelected
              ? 'bg-primary text-primary-foreground shadow-md scale-105'
              : isSurgery
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : isHighlightedDate
              ? 'bg-secondary text-secondary-foreground'
              : isToday
              ? 'bg-accent text-accent-foreground border-2 border-primary'
              : 'hover:bg-muted text-foreground'
            }
          `}
        >
          {day}
          {isSurgery && (
            <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full" />
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="bg-background border border-border rounded-lg p-4 shadow-sm">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={handlePrevMonth}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        
        <h3 className="text-lg font-semibold text-foreground">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={handleNextMonth}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div
            key={day}
            className="aspect-square flex items-center justify-center text-xs font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-2">
        {renderDays()}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border flex flex-wrap gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span className="text-muted-foreground">Surgery Scheduled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-accent border-2 border-primary" />
          <span className="text-muted-foreground">Today</span>
        </div>
      </div>
    </div>
  );
}
