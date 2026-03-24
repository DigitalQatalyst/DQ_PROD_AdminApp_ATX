import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../auth/utils/supabaseClient';

/**
 * Contacts API — backed by Supabase table `public.contacts`.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 */

export type ContactStatus = 'active' | 'inactive';

export interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  mobile: string | null;
  title: string | null;
  organization_id: string | null;
  vendor_id: string | null;
  owner_id: string | null;
  status: ContactStatus;
  source: string | null;
  created_at: string;
  updated_at: string;
}

interface DbRow {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  mobile: string | null;
  title: string | null;
  organization_id: string | null;
  vendor_id: string | null;
  owner_id: string | null;
  status: string;
  source: string | null;
  created_at: string;
  updated_at: string;
}

const TABLE = 'contacts';

function rowToContact(r: DbRow): Contact {
  return {
    id: r.id,
    first_name: r.first_name,
    last_name: r.last_name,
    email: r.email,
    phone: r.phone,
    mobile: r.mobile,
    title: r.title,
    organization_id: r.organization_id,
    vendor_id: r.vendor_id,
    owner_id: r.owner_id,
    status: (r.status as ContactStatus) || 'active',
    source: r.source,
    created_at: r.created_at,
    updated_at: r.updated_at,
  };
}

function bodyToInsert(body: any): Record<string, unknown> {
  return {
    first_name: typeof body?.first_name === 'string' ? body.first_name.trim() : '',
    last_name: typeof body?.last_name === 'string' ? body.last_name.trim() : '',
    email: typeof body?.email === 'string' ? body.email.trim() : '',
    phone: (body?.phone && typeof body.phone === 'string') ? body.phone.trim() || null : null,
    mobile: (body?.mobile && typeof body.mobile === 'string') ? body.mobile.trim() || null : null,
    title: (body?.title && typeof body.title === 'string') ? body.title.trim() || null : null,
    organization_id: (body?.organization_id && typeof body.organization_id === 'string') ? body.organization_id.trim() || null : null,
    vendor_id: (body?.vendor_id && typeof body.vendor_id === 'string') ? body.vendor_id.trim() || null : null,
    owner_id: (body?.owner_id && typeof body.owner_id === 'string') ? body.owner_id.trim() || null : null,
    status: body?.status || 'active',
    source: (body?.source && typeof body.source === 'string') ? body.source.trim() || null : null,
  };
}

function bodyToUpdate(body: any): Record<string, unknown> {
  const u: Record<string, unknown> = {};
  if (body?.first_name !== undefined) u.first_name = body.first_name;
  if (body?.last_name !== undefined) u.last_name = body.last_name;
  if (body?.email !== undefined) u.email = body.email;
  if (body?.phone !== undefined) u.phone = body.phone;
  if (body?.mobile !== undefined) u.mobile = body.mobile;
  if (body?.title !== undefined) u.title = body.title;
  if (body?.organization_id !== undefined) u.organization_id = body.organization_id;
  if (body?.vendor_id !== undefined) u.vendor_id = body.vendor_id;
  if (body?.owner_id !== undefined) u.owner_id = body.owner_id;
  if (body?.status !== undefined) u.status = body.status;
  if (body?.source !== undefined) u.source = body.source;
  return u;
}

const router = Router();

// GET /api/contacts
router.get('/', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Contacts GET error:', error);
      return res.status(500).json({
        status: 'error',
        error: 'database_error',
        message: error.message,
      });
    }

    const list = (data ?? []).map((r) => rowToContact(r as DbRow));
    return res.json({ status: 'success', data: list });
  } catch (e) {
    console.error('Contacts GET exception:', e);
    return res.status(500).json({
      status: 'error',
      error: 'internal_server_error',
      message: e instanceof Error ? e.message : 'Failed to load contacts',
    });
  }
});

// POST /api/contacts
router.post('/', async (req: Request, res: Response) => {
  const payload = bodyToInsert(req.body || {});
  if (!payload.first_name || !payload.last_name || !payload.email) {
    return res.status(400).json({
      status: 'error',
      error: 'validation_error',
      message: 'First name, last name, and email are required',
    });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert(payload)
      .select('*')
      .single();

    if (error) {
      console.error('Contacts POST error:', error);
      return res.status(500).json({
        status: 'error',
        error: 'database_error',
        message: error.message,
      });
    }

    return res.status(201).json({
      status: 'success',
      data: rowToContact(data as DbRow),
    });
  } catch (e) {
    console.error('Contacts POST exception:', e);
    return res.status(500).json({
      status: 'error',
      error: 'internal_server_error',
      message: e instanceof Error ? e.message : 'Failed to create contact',
    });
  }
});

// PUT /api/contacts/:id
router.put('/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const updates = bodyToUpdate(req.body || {});

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
      .select('*')
      .single();

    if (error) {
      console.error('Contacts PUT error:', error);
      return res.status(500).json({
        status: 'error',
        error: 'database_error',
        message: error.message,
      });
    }

    return res.json({
      status: 'success',
      data: rowToContact(data as DbRow),
    });
  } catch (e) {
    console.error('Contacts PUT exception:', e);
    return res.status(500).json({
      status: 'error',
      error: 'internal_server_error',
      message: e instanceof Error ? e.message : 'Failed to update contact',
    });
  }
});

export default router;
