export type DomainStatus = 'pending' | 'active' | 'error' | 'configuring';

export interface VerificationRecord {
    type: string;
    name: string;
    value: string;
}

export interface Domain {
    id: string;
    user_id: string;
    funnel_id: string;
    domain: string;
    status: DomainStatus;
    verification_records: VerificationRecord[];
    created_at: string;
    updated_at: string;
}

export interface DomainFormData {
    domain: string;
    funnel_id: string;
}

export interface DomainError {
    code: string;
    message: string;
} 