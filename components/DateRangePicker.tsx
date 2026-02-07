import React, { useState, useEffect } from "react";
// Added Filter to imports to resolve the reference error on line 208
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  startOfWeek,
  endOfWeek,
  isBefore,
  isAfter,
} from "date-fns";

export type DateFilterMode =
  | "On"
  | "Before"
  | "After"
  | "Between"
  | "Is empty"
  | "All time";

export interface DateRange {
  start?: Date;
  end?: Date;
}

interface DateRangePickerProps {
  currentMode: DateFilterMode;
  currentRange: DateRange;
  onApply: (mode: DateFilterMode, range: DateRange) => void;
  onClose: () => void;
}

const MODES: DateFilterMode[] = [
  "On",
  "Before",
  "After",
  "Between",
  "Is empty",
  "All time",
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  currentMode,
  currentRange,
  onApply,
  onClose,
}) => {
  const [selectedMode, setSelectedMode] = useState<DateFilterMode>(currentMode);
  const [tempRange, setTempRange] = useState<DateRange>(currentRange);
  const [viewDate, setViewDate] = useState(
    currentRange.start || new Date(2025, 0, 1),
  );

  // Sync internal state when external mode changes if needed,
  // though usually controlled by the parent opening/closing.
  useEffect(() => {
    setSelectedMode(currentMode);
    setTempRange(currentRange);
  }, [currentMode, currentRange]);

  const handleDateClick = (date: Date) => {
    if (
      selectedMode === "On" ||
      selectedMode === "Before" ||
      selectedMode === "After"
    ) {
      setTempRange({ start: date, end: date });
    } else if (selectedMode === "Between") {
      if (!tempRange.start || (tempRange.start && tempRange.end)) {
        setTempRange({ start: date, end: undefined });
      } else {
        if (isBefore(date, tempRange.start)) {
          setTempRange({ start: date, end: tempRange.start });
        } else {
          setTempRange({ start: tempRange.start, end: date });
        }
      }
    }
  };

  const renderCalendar = () => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days = eachDayOfInterval({
      start: calendarStart,
      end: calendarEnd,
    });

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-4 px-2">
          <button
            onClick={() => setViewDate(subMonths(viewDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h3 className="text-sm font-semibold text-gray-900">
            {format(viewDate, "MMMM yyyy")}
          </h3>
          <button
            onClick={() => setViewDate(addMonths(viewDate, 1))}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors text-gray-600"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-0 text-center mb-1">
          {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((d) => (
            <div
              key={d}
              className="text-[10px] font-bold text-gray-400 uppercase py-2"
            >
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const isCurrentMonth = day.getMonth() === viewDate.getMonth();
            const isSelStart =
              tempRange.start && isSameDay(day, tempRange.start);
            const isSelEnd = tempRange.end && isSameDay(day, tempRange.end);
            const isInRange =
              tempRange.start &&
              tempRange.end &&
              isAfter(day, tempRange.start) &&
              isBefore(day, tempRange.end);
            const isTodayDate = isToday(day);

            return (
              <button
                key={idx}
                onClick={() => handleDateClick(day)}
                disabled={!isCurrentMonth}
                className={`
                  relative h-9 w-9 text-xs flex items-center justify-center transition-all rounded-md
                  ${!isCurrentMonth ? "text-gray-200 cursor-default" : "hover:bg-blue-50 text-gray-700"}
                  ${isSelStart || isSelEnd ? "bg-blue-600 text-white font-bold hover:bg-blue-700 z-10" : ""}
                  ${isInRange ? "bg-blue-50 text-blue-700" : ""}
                  ${isTodayDate && !isSelStart && !isSelEnd ? "border border-blue-200 text-blue-600" : ""}
                `}
              >
                {format(day, "d")}
              </button>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-100">
          <button
            onClick={() => {
              const today = new Date();
              setViewDate(today);
              handleDateClick(today);
            }}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 px-2 py-1"
          >
            Go to Today
          </button>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-1.5 border border-gray-200 rounded-md bg-white"
            >
              Cancel
            </button>
            <button
              onClick={() => onApply(selectedMode, tempRange)}
              className="text-xs font-medium bg-blue-600 text-white px-4 py-1.5 rounded-md hover:bg-blue-700 shadow-sm"
            >
              Apply Filter
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="absolute top-full left-0 mt-3 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] flex overflow-hidden w-[540px]">
      {/* Sidebar Navigation */}
      <div className="w-[140px] bg-gray-50/80 border-r border-gray-100 flex flex-col p-2 gap-1">
        {MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => {
              setSelectedMode(mode);
              // Reset range if switching to special modes
              if (mode === "Is empty" || mode === "All time") {
                setTempRange({});
              }
            }}
            className={`
              px-3 py-2 text-left text-xs font-medium rounded-md transition-all
              ${
                selectedMode === mode
                  ? "bg-white text-blue-600 shadow-sm ring-1 ring-gray-200"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }
            `}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6">
        {selectedMode !== "Is empty" && selectedMode !== "All time" && (
          <div className="mb-6">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Selection Range
            </label>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-2">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              <div className="flex items-center gap-2 flex-1">
                <span
                  className={`text-sm ${tempRange.start ? "text-gray-900" : "text-gray-400"}`}
                >
                  {tempRange.start
                    ? format(tempRange.start, "MMM dd, yyyy")
                    : selectedMode === "After"
                      ? "From date"
                      : selectedMode === "Before"
                        ? "To date"
                        : selectedMode === "On"
                          ? "Select date"
                          : "Start date"}
                </span>
                {selectedMode === "Between" && (
                  <>
                    <ArrowRight className="w-3 h-3 text-gray-300" />
                    <span
                      className={`text-sm ${tempRange.end ? "text-gray-900" : "text-gray-400"}`}
                    >
                      {tempRange.end
                        ? format(tempRange.end, "MMM dd, yyyy")
                        : "End date"}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {["On", "Before", "After", "Between"].includes(selectedMode) ? (
          renderCalendar()
        ) : (
          <div className="h-[280px] flex flex-col items-center justify-center text-center px-4">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Filter className="w-6 h-6 text-gray-300" />
            </div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">
              {selectedMode === "Is empty"
                ? "Filter: No Date"
                : "Clear Date Filter"}
            </h4>
            <p className="text-xs text-gray-500 mb-6 leading-relaxed">
              {selectedMode === "Is empty"
                ? "Only show records that do not have any date information assigned to them."
                : "Show all records regardless of their date. This is the default view."}
            </p>
            <button
              onClick={() => onApply(selectedMode, {})}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-all"
            >
              Apply Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
