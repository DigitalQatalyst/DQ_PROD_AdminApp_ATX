import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../auth/utils/supabaseClient';

/**
 * Accounts API — backed by Supabase table `public.crm_accounts`.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Run migration
 * supabase/migrations/20260311000000_crm_accounts.sql to create the table.
 */

export type LifecycleStage =
  | 'Prospect'
  | 'Active Customer'
  | 'Key Account'
  | 'At Risk'
  | 'Inactive'
  | 'Closed';

export interface Account {
  id: string;
  name: string;
  industry?: string;
  website?: string;
  phone?: string;
  address?: string;
  country?: string;
  ownerName?: string;
  lifecycleStage?: LifecycleStage;
  accountTier?: string;
  createdAt: string;
  updatedAt: string;
}

interface DbRow {
  id: string;
  name: string;
  industry: string | null;
  website: string | null;
  phone: string | null;
  address: string | null;
  country: string | null;
  owner_name: string | null;
  lifecycle_stage: string | null;
  account_tier: string | null;
  created_at: string;
  updated_at: string;
}

const TABLE = 'crm_accounts';

function rowToAccount(r: DbRow): Account {
  return {
    id: r.id,
    name: r.name,
    industry: r.industry ?? undefined,
    website: r.website ?? undefined,
    phone: r.phone ?? undefined,
    address: r.address ?? undefined,
    country: r.country ?? undefined,
    ownerName: r.owner_name ?? undefined,
    lifecycleStage: (r.lifecycle_stage as LifecycleStage) ?? undefined,
    accountTier: r.account_tier ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function bodyToInsert(body: any): Record<string, unknown> {
  const name = typeof body?.name === 'string' ? body.name.trim() : '';
  if (!name) return {} as Record<string, unknown>;
  return {
    name,
    industry: (body?.industry && typeof body.industry === 'string') ? body.industry.trim() || null : null,
    website: (body?.website && typeof body.website === 'string') ? body.website.trim() || null : null,
    phone: (body?.phone && typeof body.phone === 'string') ? body.phone.trim() || null : null,
    address: (body?.address && typeof body.address === 'string') ? body.address.trim() || null : null,
    country: (body?.country && typeof body.country === 'string') ? body.country.trim() || null : null,
    owner_name: (body?.ownerName != null && typeof body.ownerName === 'string') ? body.ownerName.trim() || null : 'Unassigned',
    lifecycle_stage: body?.lifecycleStage ?? 'Prospect',
    account_tier: (body?.accountTier != null && typeof body.accountTier === 'string') ? body.accountTier.trim() || null : 'Standard',
  };
}

function bodyToUpdate(body: any): Record<string, unknown> {
  const u: Record<string, unknown> = {};
  if (body?.name !== undefined) u.name = typeof body.name === 'string' ? body.name.trim() : null;
  if (body?.industry !== undefined) u.industry = typeof body.industry === 'string' ? body.industry.trim() || null : null;
  if (body?.website !== undefined) u.website = typeof body.website === 'string' ? body.website.trim() || null : null;
  if (body?.phone !== undefined) u.phone = typeof body.phone === 'string' ? body.phone.trim() || null : null;
  if (body?.address !== undefined) u.address = typeof body.address === 'string' ? body.address.trim() || null : null;
  if (body?.country !== undefined) u.country = typeof body.country === 'string' ? body.country.trim() || null : null;
  if (body?.ownerName !== undefined) u.owner_name = typeof body.ownerName === 'string' ? body.ownerName.trim() || null : null;
  if (body?.lifecycleStage !== undefined) u.lifecycle_stage = body.lifecycleStage ?? null;
  if (body?.accountTier !== undefined) u.account_tier = typeof body.accountTier === 'string' ? body.accountTier.trim() || null : null;
  return u;
}

const router = Router();

// GET /api/accounts
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('id, name, industry, website, phone, address, country, owner_name, lifecycle_stage, account_tier, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Accounts GET error:', error);
      return res.status(500).json({
        status: 'error',
        error: 'database_error',
        message: error.message,
      });
    }

    const list = (data ?? []).map((r) => rowToAccount(r as DbRow));
    return res.json({ status: 'success', data: list });
  } catch (e) {
    console.error('Accounts GET exception:', e);
    return res.status(500).json({
      status: 'error',
      error: 'internal_server_error',
      message: e instanceof Error ? e.message : 'Failed to load accounts',
    });
  }
});

// POST /api/accounts
router.post('/', async (req: Request, res: Response) => {
  const payload = bodyToInsert(req.body || {});
  if (!payload.name || typeof payload.name !== 'string' || !String(payload.name).trim()) {
    return res.status(400).json({
      status: 'error',
      error: 'validation_error',
      message: 'Account name is required',
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert(payload)
      .select('id, name, industry, website, phone, address, country, owner_name, lifecycle_stage, account_tier, created_at, updated_at')
      .single();

    if (error) {
      console.error('Accounts POST error:', error);
      return res.status(500).json({
        status: 'error',
        error: 'database_error',
        message: error.message,
      });
    }

    return res.status(201).json({
      status: 'success',
      data: rowToAccount(data as DbRow),
    });
  } catch (e) {
    console.error('Accounts POST exception:', e);
    return res.status(500).json({
      status: 'error',
      error: 'internal_server_error',
      message: e instanceof Error ? e.message : 'Failed to create account',
    });
  }
});

// PUT /api/accounts/:id
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = bodyToUpdate(req.body || {});

  if (updates.name !== undefined && (!updates.name || typeof updates.name !== 'string')) {
    return res.status(400).json({
      status: 'error',
      error: 'validation_error',
      message: 'Account name must be a non-empty string',
    });
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      status: 'error',
      error: 'validation_error',
      message: 'No fields to update',
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update(updates)
      .eq('id', id)
      .select('id, name, industry, website, phone, address, country, owner_name, lifecycle_stage, account_tier, created_at, updated_at')
      .single();

    if (error) {
      console.error('Accounts PUT error:', error);
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          status: 'error',
          error: 'not_found',
          message: 'Account not found',
        });
      }
      return res.status(500).json({
        status: 'error',
        error: 'database_error',
        message: error.message,
      });
    }

    return res.json({
      status: 'success',
      data: rowToAccount(data as DbRow),
    });
  } catch (e) {
    console.error('Accounts PUT exception:', e);
    return res.status(500).json({
      status: 'error',
      error: 'internal_server_error',
      message: e instanceof Error ? e.message : 'Failed to update account',
    });
  }
});

export default router;
