export interface ScheduleSlot {
    id: string;
    date: string;
    shiftTemplateId: string;
    requiredSpecialityId: string | null;
    assignedNurseId: string | null;
    shiftInfo: {
        type: string;
        startTime: string;
        endTime: string;
        durationHours: number;
    };
}

export interface ScheduleSummary {
    id: string;
    departmentId: string;
    targetDate: string;
    coveragePercentage: number;
    slotsCount: number;
    slotsCovered: number;
}