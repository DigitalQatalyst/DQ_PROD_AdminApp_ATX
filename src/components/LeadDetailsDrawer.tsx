import React, { useEffect, useState } from 'react';
import { XIcon, CheckCircleIcon, XCircleIcon, RefreshCwIcon } from 'lucide-react';
import { Lead, LeadStage } from '../types';
import { useAbility } from '../hooks/useAbility';
import { logLeadActivity } from '../lib/auditLog';
import { getSupabaseClient, setSupabaseSession } from '../lib/dbClient';
import { useAuth } from '../context/AuthContext';

type LeadDetailsDrawerProps = {
  isOpen: boolean;
  lead: Lead | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Lead>) => Promise<void>;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
};

const getStageActions = (stage: LeadStage) => {
  switch (stage) {
    case 'New':
      return ['Qualifying'];
    case 'Qualifying':
      return ['Qualified', 'Disqualified'];
    case 'Qualified':
      return ['Converted'];
    case 'Converted':
      return [];
    case 'Disqualified':
      return ['Qualifying'];
    default:
      return [];
  }
};

const ENABLE_LEAD_CONVERSION = true; // TODO: disable after testing

export const LeadDetailsDrawer: React.FC<LeadDetailsDrawerProps> = ({
  isOpen,
  lead,
  onClose,
  onUpdate,
  showToast
}) => {
  const ability = useAbility();
  const { user } = useAuth();
  const [disqualifyReason, setDisqualifyReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setDisqualifyReason(lead?.disqualify_reason || '');
    }
  }, [isOpen, lead]);

  if (!isOpen || !lead) {
    return null;
  }

  const canUpdate = ability.can('update', 'Lead');
  const availableActions = getStageActions(lead.stage);

  const handleAssignToMe = async () => {
    if (!user?.id || !user?.name) {
      showToast?.('User info not available for assignment.', 'error');
      return;
    }
    if (!canUpdate) {
      showToast?.('You do not have permission to assign leads.', 'error');
      return;
    }
    setIsSaving(true);
    try {
      await onUpdate(lead.id, {
        owner_id: user.id,
        owner_name: user.name,
      });
      showToast?.('Lead assigned to you.', 'success');
    } catch (error) {
      console.error('Failed to assign lead:', error);
      showToast?.('Failed to assign lead.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStageChange = async (nextStage: LeadStage) => {
    if (!canUpdate) {
      showToast?.('You do not have permission to update leads.', 'error');
      return;
    }

    if (nextStage === 'Disqualified' && !disqualifyReason.trim()) {
      showToast?.('Disqualification reason is required.', 'error');
      return;
    }

    if (lead.stage === 'Converted' && nextStage !== 'Converted') {
      showToast?.('Converted leads are read-only.', 'info');
      return;
    }

    if (nextStage === 'Converted') {
      const hasContact = Boolean(lead.contact_email || lead.contact_phone);
      if (!hasContact) {
        showToast?.('Email or phone is required to convert a lead.', 'error');
        return;
      }

      if (!ENABLE_LEAD_CONVERSION) {
        showToast?.('Lead conversion is disabled until next release.', 'info');
        return;
      }
    }

    const updates: Partial<Lead> = {
      stage: nextStage
    };

    if (nextStage === 'Qualified') {
      updates.qualified_at = new Date().toISOString();
    }

    if (nextStage === 'Converted') {
      updates.converted_at = new Date().toISOString();
    }

    if (nextStage === 'Disqualified') {
      updates.disqualify_reason = disqualifyReason.trim();
    }

    setIsSaving(true);
    try {
      if (nextStage === 'Converted') {
        await setSupabaseSession();
        const supabase = getSupabaseClient();
        if (!supabase) {
          throw new Error('Supabase client not available');
        }

        // Conversion implementation (disabled by flag above)
        if (lead.service_request_id) {
          updates.service_request_id = lead.service_request_id;
        } else {
          const { data: existingRequest, error: existingError } = await supabase
            .from('crm_service_requests')
            .select('id')
            .eq('lead_id', lead.id)
            .limit(1)
            .maybeSingle();

          if (existingError) {
            throw existingError;
          }

          if (existingRequest?.id) {
            updates.service_request_id = existingRequest.id;
          } else {
            const { data: requestRow, error: requestError } = await supabase
              .from('crm_service_requests')
              .insert({
                lead_id: lead.id,
                organization_id: lead.organization_id || null,
                owner_id: lead.owner_id || null,
                source: lead.source,
                status: 'Open',
                metadata: {
                  contact_name: lead.contact_name,
                  contact_email: lead.contact_email,
                  contact_phone: lead.contact_phone,
                  organization_name: lead.organization_name
                }
              })
              .select('id')
              .single();

            if (requestError) {
              throw requestError;
            }

            updates.service_request_id = requestRow?.id;
          }
        }
      }

      await onUpdate(lead.id, updates);
      await logLeadActivity('updated', lead.id, { stage: nextStage });
      showToast?.(`Lead moved to ${nextStage}.`, 'success');
    } catch (error) {
      console.error('Failed to update lead stage:', error);
      showToast?.('Failed to update lead stage.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-xl bg-white shadow-xl h-full overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Lead Details</h2>
            <p className="text-xs text-gray-500">{lead.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded hover:bg-gray-100"
            aria-label="Close"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-5">
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Stage Progress</h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {(['New', 'Qualifying', 'Qualified', 'Converted'] as LeadStage[]).map((step) => (
                <span
                  key={step}
                  className={`rounded-full px-2 py-0.5 ${
                    step === lead.stage ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {step}
                </span>
              ))}
              {lead.stage === 'Disqualified' && (
                <span className="rounded-full px-2 py-0.5 bg-red-100 text-red-600">Disqualified</span>
              )}
            </div>
          </section>
          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Contact</h3>
            <div className="text-sm text-gray-800">
              <div>{lead.contact_name || 'Unknown'}</div>
              <div>{lead.contact_email || 'No email'}</div>
              <div>{lead.contact_phone || 'No phone'}</div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Organization</h3>
            <div className="text-sm text-gray-800">
              <div>{lead.organization_name || 'Not provided'}</div>
              <div className="text-xs text-gray-500">{lead.organization_id || ''}</div>
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Status</h3>
            <div className="text-sm text-gray-800">
              <div>Stage: {lead.stage}</div>
              <div>Source: {lead.source}</div>
              {lead.qualified_at && <div>Qualified: {new Date(lead.qualified_at).toLocaleString()}</div>}
              {lead.converted_at && <div>Converted: {new Date(lead.converted_at).toLocaleString()}</div>}
            </div>
          </section>

          <section className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-700">Owner</h3>
            <div className="text-sm text-gray-800">
              <div>{lead.owner_name || 'Unassigned'}</div>
              <div className="text-xs text-gray-500">{lead.owner_id || ''}</div>
            </div>
            {!lead.owner_id && user?.id && (
              <button
                onClick={handleAssignToMe}
                className="mt-2 inline-flex items-center rounded-md border border-gray-200 px-3 py-1 text-xs text-gray-700 hover:bg-gray-50"
              >
                Assign to me
              </button>
            )}
          </section>

          {lead.stage === 'Disqualified' && (
            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">Disqualification Reason</h3>
              <p className="text-sm text-gray-600">{lead.disqualify_reason || 'No reason provided'}</p>
            </section>
          )}

          {availableActions.length > 0 && (
            <section className="space-y-3">
              <h3 className="text-sm font-semibold text-gray-700">Actions</h3>
              {availableActions.includes('Disqualified') && (
                <textarea
                  value={disqualifyReason}
                  onChange={(event) => setDisqualifyReason(event.target.value)}
                  placeholder="Disqualification reason"
                  className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  rows={3}
                />
              )}
              <div className="flex flex-wrap gap-2">
                {availableActions.map((nextStage) => (
                  <button
                    key={nextStage}
                    onClick={() => handleStageChange(nextStage as LeadStage)}
                    disabled={!canUpdate || isSaving}
                    className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCwIcon className="h-4 w-4 animate-spin" /> : null}
                    {nextStage === 'Qualified' && <CheckCircleIcon className="h-4 w-4 text-green-600" />}
                    {nextStage === 'Disqualified' && <XCircleIcon className="h-4 w-4 text-red-600" />}
                    {nextStage}
                  </button>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
