/**
 * Role Mapper Utility for Chat Support
 * 
 * Maps application roles and user segments to chat-specific role labels.
 * Aligned with src/types/index.ts UserRole and UserSegment types.
 */

import type { UserRole, UserSegment } from '../../../types';

// Chat-specific role type that combines UserRole and UserSegment for chat context
export type ChatRole = UserRole | UserSegment | 'user' | 'bot';

/**
 * Role label mappings for display purposes
 */
const ROLE_LABELS: Record<string, string> = {
    // UserRole mappings
    admin: 'Administrator',
    editor: 'Editor',
    approver: 'Approver',
    viewer: 'Viewer',
    advisor: 'Advisor',  // Advisor role (distinct from advisor segment)
    // UserSegment mappings (for chat participant display)
    internal: 'Internal Staff',
    partner: 'Partner',
    customer: 'Customer',
    // Chat-specific roles
    user: 'User',
    bot: 'Bot',
    member: 'Member',
};

/**
 * Get human-readable label for a role or segment
 * @param role - The role or segment value
 * @returns Human-readable label
 */
export function getRoleLabel(role: string | null | undefined): string {
    if (!role) return 'User';
    const normalized = role.toLowerCase();
    return ROLE_LABELS[normalized] || normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

/**
 * Maps a raw role/segment value to a normalized ChatRole
 * Handles various CRM field values and normalizes them
 * @param roleValue - Raw role value (string or number)
 * @returns Normalized ChatRole
 */
export function mapRoleValueToRole(roleValue: string | number | null | undefined): ChatRole | null {
    if (roleValue === null || roleValue === undefined) return null;

    const normalized = String(roleValue).toLowerCase().trim();

    // Direct matches
    if (normalized in ROLE_LABELS) {
        return normalized as ChatRole;
    }

    // Handle numeric CRM role codes if needed (extend as per your CRM schema)
    // Example: if roleValue is a number, map it to a role
    if (typeof roleValue === 'number') {
        // Placeholder for CRM numeric role mapping
        // Customize based on your kf_accessroles or kf_accounttype values
        return null;
    }

    return null;
}

/**
 * Determines if a user is an "advisor" for chat purposes
 * In this app, advisors are identified by userSegment, not role
 * @param userSegment - The user's segment
 * @returns True if user is an advisor
 */
export function isAdvisorSegment(userSegment: string | null | undefined): boolean {
    return userSegment?.toLowerCase() === 'advisor';
}

/**
 * Determines if a user is internal staff for chat purposes
 * @param userSegment - The user's segment
 * @returns True if user is internal
 */
export function isInternalSegment(userSegment: string | null | undefined): boolean {
    return userSegment?.toLowerCase() === 'internal';
}

/**
 * Determines if a user is a partner for chat purposes
 * @param userSegment - The user's segment
 * @returns True if user is a partner
 */
export function isPartnerSegment(userSegment: string | null | undefined): boolean {
    return userSegment?.toLowerCase() === 'partner';
}
