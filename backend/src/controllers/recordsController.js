import { supabase } from '../config/supabase.js';

function rowToApplication(row) {
  if (!row?.payload) return null;
  return { ...row.payload, id: row.id };
}

async function audit(userId, action, entityId, meta) {
  try {
    await supabase.from('audit_logs').insert({
      action,
      entity: 'record',
      entity_id: entityId,
      user_id: userId || null,
      meta: meta || null,
    });
  } catch (e) {
    console.error('audit_logs insert failed', e?.message);
  }
}

export async function listRecords(req, res) {
  try {
    const { data, error } = await supabase
      .from('records')
      .select('id,payload,created_at,updated_at')
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });
    const list = (data || []).map(rowToApplication).filter(Boolean);
    return res.json(list);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to list records' });
  }
}

export async function getRecord(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('records').select('*').eq('id', id).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'Record not found' });
    return res.json(rowToApplication(data));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to fetch record' });
  }
}

export async function createRecord(req, res) {
  try {
    const body = req.body || {};
    const id = body.id;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Field "id" is required (string)' });
    }
    const required = ['employeeId', 'leaveType', 'startDate', 'endDate', 'reason'];
    for (const k of required) {
      if (body[k] === undefined || body[k] === null || body[k] === '') {
        return res.status(400).json({ error: `Missing required field: ${k}` });
      }
    }

    const row = {
      id,
      payload: { ...body, id },
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('records').insert(row).select('*').single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Record id already exists' });
      return res.status(500).json({ error: error.message });
    }
    await audit(req.user?.sub, 'create', id, { leaveType: body.leaveType });
    return res.status(201).json(rowToApplication(data));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to create record' });
  }
}

export async function updateRecord(req, res) {
  try {
    const { id } = req.params;
    const body = req.body || {};
    const { data: existing, error: exErr } = await supabase.from('records').select('*').eq('id', id).maybeSingle();
    if (exErr) return res.status(500).json({ error: exErr.message });
    if (!existing) return res.status(404).json({ error: 'Record not found' });

    const mergedPayload = { ...existing.payload, ...body, id };
    const { data, error } = await supabase
      .from('records')
      .update({
        payload: mergedPayload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    await audit(req.user?.sub, 'update', id, { workflowStatus: mergedPayload.workflowStatus });
    return res.json(rowToApplication(data));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to update record' });
  }
}

export async function deleteRecord(req, res) {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('records').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    await audit(req.user?.sub, 'delete', id, null);
    return res.status(204).send();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to delete record' });
  }
}
