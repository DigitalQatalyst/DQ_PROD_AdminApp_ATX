import { supabase } from '../../../../lib/client';
import { mapRoleValueToRole } from '../../utils/roleMapper';
import { AdvisorUser } from './types';

export const getAdvisors = async (organizationId?: string | null): Promise<AdvisorUser[]> => {
    // Fallback to empty when no org context is available
    if (!organizationId) return [];

    try {
        const resp = await fetch(
            `https://kfrealexpressserver.vercel.app/api/v1/auth/get-accounts-by-org/${organizationId}`
        );

        if (!resp.ok) {
            return [];
        }

        const json = await resp.json();
        const items = Array.isArray(json?.value) ? json.value : [];
        const advisors = items
            .map((item: any) => {
                const role = mapRoleValueToRole(item?.kf_accessroles);
                if (role !== 'advisor') return null;
                return {
                    id: item?.kf_azureid || item?.contactid || item?.id,
                    username: item?.fullname || item?.firstname || item?.emailaddress1 || 'Advisor',
                    avatar_url: item?.entityimage_url || null,
                    email: item?.emailaddress1 || null,
                    azureId: item?.kf_azureid || null,
                } as AdvisorUser;
            })
            .filter(Boolean) as AdvisorUser[];

        // Deduplicate by id
        const byId = new Map<string, AdvisorUser>();
        advisors.forEach((adv) => {
            if (adv.id && !byId.has(adv.id)) {
                byId.set(adv.id, adv);
            }
        });

        return Array.from(byId.values());
    } catch (_err) {
        return [];
    }
};

export const resolveAdvisorUserId = async (advisor: { id?: string | null; email?: string | null; username?: string | null; azureId?: string | null }): Promise<string> => {
    const azureId = advisor.azureId || advisor.id || null;
    if (!azureId) {
        throw new Error('[ChatSupportService] Advisor has no azureId; cannot resolve users_local');
    }

    const { data: byExternal, error } = await (supabase as any)
        .schema('communities')
        .from('users_local')
        .select('id')
        .eq('external_id', azureId)
        .maybeSingle();

    if (error) {
        throw error;
    }

    if (byExternal?.id) return byExternal.id as string;

    // Explicitly fail if not found to surface FK issues
    throw new Error(`[ChatSupportService] Advisor not provisioned in users_local for azureId=${azureId}`);
};
