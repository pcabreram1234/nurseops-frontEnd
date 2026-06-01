export interface Permission {
    id: string;
    name: string;
    description: string;
}

export interface RolePermissionRelation {
    permisionId: string;
    permissions?: Permission;
}

export interface Role {
    id: string;
    name: string;
    organizationId: string;
    rolePermissions: RolePermissionRelation[];
}

export interface RoleFormData {
    name: string;
    id: string; // IDs de los permisos seleccionados bajo Checkboxes
    permissionIds: string[]
}

export interface UpadeteRoleFormData {
    name: string;
    id: string; // IDs de los permisos seleccionados bajo Checkboxes
}

export interface CreateRoleFormData {
    name: string
}

export interface AssingPermisions {
    permissionIds: string[]
}