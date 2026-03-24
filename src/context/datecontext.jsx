import React, { createContext, useState, useCallback, useMemo } from 'react';
import { format, isSameDay, isSameWeek, isSameMonth, isSameYear, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

export const DateContext = createContext();

export const DateProvider = ({ children }) => {
  const [range, setRange] = useState('today');
  const [customDate, setCustomDate] = useState({ start: null, end: null });

  const today = useMemo(() => new Date(), []);

  const rangeLabel = useMemo(() => {
    switch (range) {
      case 'today':
        return 'Today';
      case 'week':
        return 'This Week';
      case 'month':
        return 'This Month';
      case 'year':
        return 'This Year';
      case 'custom':
        return 'Custom Range';
      default:
        return 'Today';
    }
  }, [range]);

  const inRange = useCallback((date) => {
    const checkDate = new Date(date);
    
    switch (range) {
      case 'today':
        return isSameDay(checkDate, today);
      case 'week':
        return isSameWeek(checkDate, today);
      case 'month':
        return isSameMonth(checkDate, today);
      case 'year':
        return isSameYear(checkDate, today);
      case 'custom':
        if (customDate.start && customDate.end) {
          const start = new Date(customDate.start);
          const end = new Date(customDate.end);
          return checkDate >= start && checkDate <= end;
        }
        return true;
      default:
        return true;
    }
  }, [range, customDate, today]);

  const value = useMemo(() => ({
    range,
    setRange,
    customDate,
    setCustomDate,
    rangeLabel,
    inRange,
    today,
  }), [range, customDate, rangeLabel, inRange, today]);

  return (
    <DateContext.Provider value={value}>
      {children}
    </DateContext.Provider>
  );
};
