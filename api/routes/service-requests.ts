import { Router, Request, Response } from 'express';
import { supabaseAdmin } from '../auth/utils/supabaseClient';

const router = Router();
const TABLE = 'service_requests';
const ACTIVITY_TABLE = 'service_request_activities';

/**
 * GET /api/service-requests
 * List service requests with joins
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select(`
        *,
        account:organisations(name),
        contact:contacts(first_name, last_name),
        owner:user_profiles!service_requests_owner_id_fkey(
          user:users(name)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform for consistency
    const transformed = (data || []).map(sr => ({
      ...sr,
      account_name: sr.account?.name,
      contact_name: sr.contact ? `${sr.contact.first_name} ${sr.contact.last_name}` : null,
      owner_name: sr.owner?.user?.name
    }));

    res.json({ status: 'success', data: transformed });
  } catch (error) {
    console.error('Error fetching service requests:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch service requests' });
  }
});

/**
 * GET /api/service-requests/:id
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .select(`
        *,
        account:organisations(name),
        contact:contacts(first_name, last_name),
        owner:user_profiles!service_requests_owner_id_fkey(
          user:users(name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ status: 'error', message: 'Not found' });

    const transformed = {
      ...data,
      account_name: data.account?.name,
      contact_name: data.contact ? `${data.contact.first_name} ${data.contact.last_name}` : null,
      owner_name: data.owner?.user?.name
    };

    res.json({ status: 'success', data: transformed });
  } catch (error) {
    console.error('Error fetching service request:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch service request' });
  }
});

/**
 * POST /api/service-requests
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .insert(req.body)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ status: 'success', data });
  } catch (error) {
    console.error('Error creating service request:', error);
    res.status(500).json({ status: 'error', message: 'Failed to create service request' });
  }
});

/**
 * PUT /api/service-requests/:id
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from(TABLE)
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ status: 'success', data });
  } catch (error) {
    console.error('Error updating service request:', error);
    res.status(500).json({ status: 'error', message: 'Failed to update service request' });
  }
});

/**
 * GET /api/service-requests/:id/activities
 */
router.get('/:id/activities', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from(ACTIVITY_TABLE)
      .select(`
        *,
        creator:user_profiles(
          user:users(name)
        )
      `)
      .eq('service_request_id', id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const transformed = (data || []).map(a => ({
      ...a,
      creator_name: a.creator?.user?.name
    }));

    res.json({ status: 'success', data: transformed });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch activities' });
  }
});

/**
 * POST /api/service-requests/:id/activities
 */
router.post('/:id/activities', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from(ACTIVITY_TABLE)
      .insert({ ...req.body, service_request_id: id })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ status: 'success', data });
  } catch (error) {
    console.error('Error logging activity:', error);
    res.status(500).json({ status: 'error', message: 'Failed to log activity' });
  }
});

export default router;
