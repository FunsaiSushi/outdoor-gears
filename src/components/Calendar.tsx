import React, { useState } from "react";

interface CalendarProps {
  unavailableDates: Date[];
  today: Date;
  onDateSelect?: (date: Date) => void;
  selectedStartDate?: Date | null;
  selectedEndDate?: Date | null;
  isSelectingStartDate?: boolean;
  isSelectingEndDate?: boolean;
  allowSingleDay?: boolean; // New prop to enable single day selection
  selectedDate?: Date | null; // New prop for single date selection
  onModeChange?: (isSingleMode: boolean) => void; // Callback for mode changes
}

const Calendar: React.FC<CalendarProps> = ({
  unavailableDates,
  today,
  onDateSelect,
  selectedStartDate,
  selectedEndDate,
  isSelectingStartDate,
  isSelectingEndDate,
  allowSingleDay = false,
  selectedDate,
  onModeChange,
}) => {
  const DAYS = [
    { key: "sun", label: "S" },
    { key: "mon", label: "M" },
    { key: "tue", label: "T" },
    { key: "wed", label: "W" },
    { key: "thu", label: "T" },
    { key: "fri", label: "F" },
    { key: "sat", label: "S" },
  ];
  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSingleMode, setIsSingleMode] = useState(allowSingleDay);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const toggleMode = () => {
    const newMode = !isSingleMode;
    setIsSingleMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Get number of days in current month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Get first day of month (0-6)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Calculate the number of weeks needed
  const totalDays = firstDayOfMonth + daysInMonth;
  const numberOfWeeks = Math.ceil(totalDays / 7);

  // Add this function to check if a date is between start and end dates
  const isDateInRange = (date: Date) => {
    if (isSingleMode) return false; // No range selection in single day mode
    if (!selectedStartDate || !selectedEndDate) return false;
    const normalizedDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
    const normalizedStart = new Date(
      selectedStartDate.getFullYear(),
      selectedStartDate.getMonth(),
      selectedStartDate.getDate()
    ).getTime();
    const normalizedEnd = new Date(
      selectedEndDate.getFullYear(),
      selectedEndDate.getMonth(),
      selectedEndDate.getDate()
    ).getTime();
    return normalizedDate >= normalizedStart && normalizedDate <= normalizedEnd;
  };

  // Add this function to check if a date is selectable
  const isDateSelectable = (date: Date) => {
    if (date < today) return false;
    return !unavailableDates.some(
      (unavailableDate) =>
        unavailableDate.toDateString() === date.toDateString()
    );
  };

  // Check if a date is the selected single date
  const isSingleDateSelected = (date: Date) => {
    if (!isSingleMode || !selectedDate) return false;
    return selectedDate.toDateString() === date.toDateString();
  };

  // Modify the calendar days creation to support continuous range styling
  const calendarDays = [];
  let day = 1;

  for (let week = 0; week < numberOfWeeks; week++) {
    const weekDays = [];

    for (let weekday = 0; weekday < 7; weekday++) {
      if (week === 0 && weekday < firstDayOfMonth) {
        weekDays.push(
          <td key={`empty-${weekday}`} className="p-0.5 sm:p-1 md:p-2"></td>
        );
      } else if (day > daysInMonth) {
        weekDays.push(
          <td key={`empty-end-${weekday}`} className="p-0.5 sm:p-1 md:p-2"></td>
        );
      } else {
        const currentDay = new Date(currentYear, currentMonth, day);
        const isUnavailable = unavailableDates.some(
          (date) => date.toDateString() === currentDay.toDateString()
        );
        const isPast = currentDay < today;
        const isRangeStart =
          !isSingleMode &&
          selectedStartDate?.toDateString() === currentDay.toDateString();
        const isRangeEnd =
          !isSingleMode &&
          selectedEndDate?.toDateString() === currentDay.toDateString();
        const isInRange = !isSingleMode && isDateInRange(currentDay);
        const isSelectable = isDateSelectable(currentDay);
        const isSingleSelected =
          isSingleMode && isSingleDateSelected(currentDay);

        weekDays.push(
          <td key={day} className="p-0.5 sm:p-1 md:p-2 relative">
            {isInRange && !isSingleMode && (
              <div
                className={`absolute inset-0 bg-amber-100 z-0 ${
                  isRangeStart
                    ? "rounded-l-full"
                    : isRangeEnd
                    ? "rounded-r-full"
                    : ""
                }`}
              />
            )}
            <div className="relative">
              <button
                onClick={() => {
                  if (!isSelectable) return;
                  if (!onDateSelect) return;

                  // Only allow selection if we're in single mode or selecting start/end dates
                  if (
                    isSingleMode ||
                    isSelectingStartDate ||
                    isSelectingEndDate
                  ) {
                    onDateSelect(currentDay);
                  }
                }}
                disabled={!isSelectable}
                className={`
                  w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm md:text-base
                  transition-colors relative z-10 border border-amber-800/10
                  ${
                    isPast
                      ? "text-amber-200 cursor-not-allowed border-amber-200/30"
                      : isUnavailable
                      ? "bg-red-200 text-red-700 cursor-not-allowed border-red-300"
                      : isSingleSelected
                      ? "bg-amber-700 text-white hover:bg-amber-800 border-amber-800"
                      : isRangeStart || isRangeEnd
                      ? "bg-amber-700 text-white hover:bg-amber-800 border-amber-800"
                      : isInRange
                      ? "bg-amber-200 text-amber-800 hover:bg-amber-300 border-amber-300"
                      : "bg-amber-100 text-amber-700 hover:bg-amber-200 cursor-pointer border-amber-200"
                  }
                `}
              >
                {day}
              </button>
            </div>
          </td>
        );
        day++;
      }
    }
    calendarDays.push(<tr key={`week-${week}`}>{weekDays}</tr>);
  }

  return (
    <div className="w-full max-w-full sm:max-w-md mx-auto p-4 bg-[#F5E6D3] rounded-2xl border border-amber-700/30 shadow-sm">
      {/* Mode Toggle Button */}
      <div className="flex justify-center mb-4">
        <button
          onClick={toggleMode}
          className="px-4 py-2 bg-amber-200 hover:bg-amber-300 text-amber-800 rounded-lg border border-amber-300 transition-colors font-medium text-sm cursor-pointer"
        >
          {!isSingleMode ? "Select Date Range" : "Select Single Date"}
        </button>
      </div>

      {(isSelectingStartDate || isSelectingEndDate) && !isSingleMode && (
        <div className="text-center mb-4 text-amber-800 font-medium">
          {isSelectingStartDate ? "Select Start Date" : "Select End Date"}
        </div>
      )}
      {isSingleMode && (
        <div className="text-center mb-4 text-amber-800 font-medium">
          Select Date
        </div>
      )}
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <button
          onClick={goToPreviousMonth}
          className="p-1 sm:p-2 rounded-full hover:bg-amber-100 transition-colors cursor-pointer border border-amber-800/20"
          disabled={
            currentYear === today.getFullYear() &&
            currentMonth === today.getMonth()
          }
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <div className="text-center font-semibold text-xs sm:text-sm md:text-base">
          {MONTHS[currentMonth]} {currentYear}
        </div>
        <button
          onClick={goToNextMonth}
          className="p-1 sm:p-2 rounded-full hover:bg-amber-100 transition-colors cursor-pointer border border-amber-800/20"
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>
      <table className="w-full table-fixed">
        <thead>
          <tr>
            {DAYS.map((day) => (
              <th
                key={day.key}
                className="p-0.5 sm:p-1 md:p-2 text-[10px] sm:text-xs md:text-sm text-amber-800 font-medium"
              >
                {day.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{calendarDays}</tbody>
      </table>
      <div className="mt-2 sm:mt-4 flex flex-col sm:flex-row justify-center items-center gap-1 sm:gap-4 text-[10px] sm:text-xs md:text-sm text-amber-800">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-amber-200"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-red-200"></div>
          <span>Unavailable</span>
        </div>
        {isSingleMode && (
          <div className="flex items-center gap-1 sm:gap-2">
            <div className="w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 rounded-full bg-amber-700"></div>
            <span>Selected</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;
