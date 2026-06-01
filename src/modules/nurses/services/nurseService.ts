import { apiInstance } from "@/services/axios";
import { Nurse, NurseFormData } from "../types";

const API_URL = "/nurses";

export const nurseService = {
    getAll: async (): Promise<Nurse[]> => {
        const response = await apiInstance.get<Nurse[]>(API_URL);
        return response.data;
    },

    create: async (data: any): Promise<Nurse> => {
        const nursePayload = {
            userId: data.userId,
            departmentId: data.departmentId,
            specialityId: data.specialityId || null,
            organizationId: data.organizationId,
            contract_type: data.contract_type,
            status: data.status,
            hire_date: new Date(data.hire_date).toISOString(),
            isCrossDepartmental: data.isCrossDepartmental,
        };

        const response = await apiInstance.post<Nurse>("/nurses", nursePayload);
        const newNurse = response.data;

        const profilePayload = {
            nurseId: newNurse.id,
            organizationId: data.organizationId,
            birthDate: new Date(data.birthDate).toISOString(),
            emergencyContactName: data.emergencyContactName?.toUpperCase() || null,
            emergencyContactPhone: data.emergencyContactPhone || null,
            educationLevel: data.educationLevel,
            yearsOfExperience: Number(data.yearsOfExperience),
            notes: data.notes || "",
        };

        const requests = [
            apiInstance.post(`/nurse-profiles`, profilePayload)
        ];

        // 🌟 CREACIÓN EN BUCLE: Insertamos cada restricción asignada en la tabla intermedia
        if (data.restrictions && data.restrictions.length > 0) {
            data.restrictions.forEach((rest: any) => {
                if (rest.restrictionTypeId) {
                    requests.push(apiInstance.post(`/nurse-restrictions`, {
                        nurseId: newNurse.id,
                        organizationId: data.organizationId,
                        restrictionTypeId: rest.restrictionTypeId,
                        startDate: rest.startDate ? new Date(rest.startDate).toISOString() : null,
                        endDate: rest.endDate ? new Date(rest.endDate).toISOString() : null,
                        isTemporary: rest.isTemporary,
                        isActive: rest.isActive,
                        notes: rest.notes
                    }));
                }
            });
        }

        await Promise.all(requests);
        return newNurse;
    },

    update: async (nurseId: string, profileId: string | undefined, data: any, existingRestrictions: any[] = []): Promise<void> => {
        const nursePayload = {
            userId: data.userId,
            departmentId: data.departmentId,
            specialityId: data.specialityId || null,
            organizationId: data.organizationId,
            contract_type: data.contract_type,
            status: data.status,
            hire_date: new Date(data.hire_date).toISOString(),
            isCrossDepartmental: data.isCrossDepartmental,
        };

        const profilePayload = {
            birthDate: new Date(data.birthDate).toISOString(),
            emergencyContactName: data.emergencyContactName,
            emergencyContactPhone: data.emergencyContactPhone,
            educationLevel: data.educationLevel,
            yearsOfExperience: Number(data.yearsOfExperience),
            notes: data.notes || "",
        };

        const requests = [
            apiInstance.patch(`/nurses/${nurseId}`, nursePayload)
        ];

        if (profileId) {
            requests.push(apiInstance.patch(`/nurse-profiles/${profileId}`, profilePayload));
        } else {
            requests.push(apiInstance.post(`/nurse-profiles`, { ...profilePayload, nurseId, organizationId: data.organizationId }));
        }

        // 🌟 LÓGICA DE SINCRONIZACIÓN DE RESTRICCIONES (DIFF)
        const newRestrictions = data.restrictions || [];

        // 1. ELIMINAR: Están en el original pero ya no en el nuevo (el usuario le dio al botón de borrar)
        const toDelete = existingRestrictions.filter(old => !newRestrictions.some((n: any) => n.id === old.id));
        toDelete.forEach(d => requests.push(apiInstance.delete(`/nurse-restrictions/${d.id}`)));

        // 2. ACTUALIZAR: Ya existían y se han modificado
        const toUpdate = newRestrictions.filter((n: any) => n.id && n.restrictionTypeId);
        toUpdate.forEach((u: any) => requests.push(apiInstance.patch(`/nurse-restrictions/${u.id}`, {
            restrictionTypeId: u.restrictionTypeId,
            startDate: u.startDate ? new Date(u.startDate).toISOString() : null,
            endDate: u.endDate ? new Date(u.endDate).toISOString() : null,
            isTemporary: u.isTemporary,
            isActive: u.isActive,
            notes: u.notes
        })));

        // 3. CREAR: Nuevas restricciones añadidas en el formulario (no tienen ID aún)
        const toCreate = newRestrictions.filter((n: any) => !n.id && n.restrictionTypeId);
        toCreate.forEach((c: any) => requests.push(apiInstance.post(`/nurse-restrictions`, {
            nurseId: nurseId,
            organizationId: data.organizationId,
            restrictionTypeId: c.restrictionTypeId,
            startDate: c.startDate ? new Date(c.startDate).toISOString() : null,
            endDate: c.endDate ? new Date(c.endDate).toISOString() : null,
            isTemporary: c.isTemporary,
            isActive: c.isActive,
            notes: c.notes
        })));

        await Promise.all(requests);
    },

    delete: async (id: string): Promise<void> => {
        await apiInstance.delete(`${API_URL}/${id}`);
    },
};