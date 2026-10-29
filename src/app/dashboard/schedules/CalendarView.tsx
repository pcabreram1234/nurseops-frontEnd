"use client"

import React, { useCallback, useRef, useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import esLocale from "@fullcalendar/core/locales/es";
import { ScheduleEntry } from "@/modules/schedules/types";

const formatTimeStr = (isoString?: string | null) => {
    if (!isoString) return "--:--";
    if (!isoString.includes("T")) return isoString.substring(0, 5);
    const timePart = isoString.split("T")[1];
    return timePart ? timePart.substring(0, 5) : "--:--";
};

interface CalendarViewProps {
    entries: ScheduleEntry[];
    viewMode: "summary" | "all_staff";
    isVacantCollapsed: boolean;
    renderEventContent: (arg: any) => React.ReactNode;
    onEventClick: (info: any) => void;
    onDateRangeChange: (range: { startDate: string; endDate: string }) => void;
    isLoading: boolean;
}

const LoadingOverlay = React.memo(function LoadingOverlay() {
    return (
        <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl transition-opacity duration-200">
            <div className="flex flex-col items-center gap-3 p-8">
                <div className="h-8 w-8 border-[3px] border-slate-200 border-t-emerald-500 rounded-full animate-spin" />
                <span className="text-xs text-slate-400 font-semibold tracking-wide">Cargando calendario...</span>
            </div>
        </div>
    );
});

export const CalendarView = React.memo(function CalendarView(props: CalendarViewProps) {
    const { entries, viewMode, isVacantCollapsed, renderEventContent, onEventClick, onDateRangeChange, isLoading } = props;

    const lastProcessedRange = useRef<{ start: string; end: string } | null>(null);
    // Track if we've ever received data — once true, never show overlay again
    const hasDataRef = useRef(false);
    if (entries.length > 0) hasDataRef.current = true;
    const showOverlay = isLoading && !hasDataRef.current;

    const rawEvents = useMemo(() => {
        const events: any[] = [];
        if (!entries) return events;

        if (viewMode === "summary") {
            const entriesByDate = new Map<string, { assigned: ScheduleEntry[], vacantCount: number }>();

            entries.forEach(entry => {
                const dateStr = entry.date.split("T")[0];
                let dayData = entriesByDate.get(dateStr);
                if (!dayData) {
                    dayData = { assigned: [], vacantCount: 0 };
                    entriesByDate.set(dateStr, dayData);
                }
                if (entry.nurseId && entry.nurse) dayData.assigned.push(entry);
                else dayData.vacantCount++;
            });

            entriesByDate.forEach((dayData, dateStr) => {
                dayData.assigned.forEach(entry => {
                    const timeStart = entry.shift?.startTime?.split("T")[1] || "00:00:00Z";
                    const timeEnd = entry.shift?.endTime?.split("T")[1] || "23:59:59Z";
                    const baseColor = entry.isEmergencyCoverage ? "#dc2626" : (entry.shift?.color && entry.shift.color !== "#f3f4f6" ? entry.shift.color : "#2563eb");

                    events.push({
                        id: entry.id,
                        title: `${entry.nurse?.user?.firstName} ${entry.nurse?.user?.lastName}`,
                        start: `${dateStr}T${timeStart}`,
                        end: `${dateStr}T${timeEnd}`,
                        backgroundColor: baseColor,
                        borderColor: "transparent",
                        textColor: "#ffffff",
                        extendedProps: {
                            type: "assignment",
                            entry,
                            departmentName: entry?.shiftTemplate?.department?.name || "Gral",
                            formattedTime: `${formatTimeStr(entry?.shift?.startTime)} - ${formatTimeStr(entry?.shift?.endTime)}`
                        }
                    });
                });

                if (dayData.vacantCount > 0 && !isVacantCollapsed) {
                    events.push({
                        id: `vacants-${dateStr}`,
                        title: `➕ ${dayData.vacantCount} Vacantes`,
                        start: dateStr,
                        allDay: true,
                        backgroundColor: "#fee2e2",
                        textColor: "#991b1b",
                        borderColor: "#fca5a5",
                        extendedProps: { type: "vacant_summary", dateStr }
                    });
                }
            });
        } else {
            entries.forEach((entry) => {
                const dateOnly = entry.date.split("T")[0];
                const timeStart = entry.shift?.startTime?.split("T")[1] || "00:00:00Z";
                const timeEnd = entry.shift?.endTime?.split("T")[1] || "23:59:59Z";
                const isVacant = !entry.nurseId || !entry.nurse;
                const baseColor = isVacant ? "#475569" : (entry.isEmergencyCoverage ? "#dc2626" : (entry.shift?.color || "#2563eb"));

                events.push({
                    id: entry.id,
                    title: isVacant ? "⚠️ VACANTE" : `${entry.nurse?.user?.firstName} ${entry.nurse?.user?.lastName}`,
                    start: `${dateOnly}T${timeStart}`,
                    end: `${dateOnly}T${timeEnd}`,
                    backgroundColor: baseColor,
                    textColor: "#ffffff",
                    borderColor: "transparent",
                    extendedProps: {
                        type: "assignment",
                        entry,
                        departmentName: entry?.shiftTemplate?.department?.name || "Gral",
                        formattedTime: `${formatTimeStr(entry?.shift?.startTime)} - ${formatTimeStr(entry?.shift?.endTime)}`
                    }
                });
            });
        }

        return events;
    }, [entries, viewMode, isVacantCollapsed]);

    const handleDatesSet = useCallback((arg: any) => {
        if (lastProcessedRange.current?.start === arg.startStr && lastProcessedRange.current?.end === arg.endStr) {
            return;
        }
        lastProcessedRange.current = { start: arg.startStr, end: arg.endStr };

        onDateRangeChange({ startDate: arg.startStr, endDate: arg.endStr });
    }, [onDateRangeChange]);

    return (
        <div className="relative">
            {showOverlay && <LoadingOverlay />}
            <div className="fullcalendar-wrapper global-schedules-theme">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin]}
                    initialView="dayGridMonth"
                    locales={[esLocale]}
                    locale="es"
                    headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek" }}
                    events={rawEvents}
                    height="auto"
                    navLinks={true}
                    nowIndicator={true}
                    eventContent={renderEventContent}
                    datesSet={handleDatesSet}
                    eventClick={onEventClick}
                />
            </div>
        </div>
    );
});
