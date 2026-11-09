export interface Permission {
    id: string;
    name: string;
    description: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface PermissionFilters {
    search?: string;
    page?: number;
    limit?: number;
}

export interface CreatePermissionDto {
    name: string;
    description: string;
}

export interface UpdatePermissionDto {
    name?: string;
    description?: string;
}

export interface PermissionPaginatedResponse {
    data: Permission[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
