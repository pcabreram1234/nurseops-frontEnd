export interface Branch {
    id: string;
    organizationId: string;
    organization?: {
        id: string;
        name: string;
    };
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone: string;
    email: string;
    latitude?: number | null;
    longitude?: number | null;
    timezone?: string | null;
    isMainBranch: boolean;
    isActive: boolean;
    departments?: [{
        id: string;
        name: string
    }];
}

export interface BranchFormData {
    organizationId: string;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phone: string;
    email: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    isMainBranch: boolean;
    isActive: boolean;
}