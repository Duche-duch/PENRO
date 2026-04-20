import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';
import { serializeUser } from '../utils/serializeUser.js';

export async function listUsers(req, res) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id,email,name,role,department,position,vacation_credits,sick_credits,active,date_hired,created_at,updated_at')
      .order('created_at', { ascending: true });
    if (error) return res.status(500).json({ error: error.message });
    return res.json((data || []).map(serializeUser));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to list users' });
  }
}

export async function getUser(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data) return res.status(404).json({ error: 'User not found' });
    return res.json(serializeUser(data));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to fetch user' });
  }
}

export async function createUser(req, res) {
  try {
    const b = req.body || {};
    const { id, email, name, role, password } = b;
    if (!id || !email || !name || !role || !password) {
      return res.status(400).json({ error: 'id, email, name, role, and password are required' });
    }

    const password_hash = await bcrypt.hash(String(password), 10);
    const row = {
      id: String(id).trim(),
      email: String(email).toLowerCase().trim(),
      password_hash,
      name: String(name).trim(),
      role: String(role).trim(),
      department: b.department ?? '',
      position: b.position ?? '',
      vacation_credits: b.vacationCredits ?? 15,
      sick_credits: b.sickCredits ?? 15,
      active: b.active !== false,
      date_hired: b.dateHired || null,
    };

    const { data, error } = await supabase.from('users').insert(row).select('*').single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'User id or email already exists' });
      return res.status(500).json({ error: error.message });
    }
    return res.status(201).json(serializeUser(data));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const b = req.body || {};

    const { data: existing, error: exErr } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (exErr) return res.status(500).json({ error: exErr.message });
    if (!existing) return res.status(404).json({ error: 'User not found' });

    const updates = {
      email: b.email != null ? String(b.email).toLowerCase().trim() : existing.email,
      name: b.name != null ? String(b.name).trim() : existing.name,
      role: b.role != null ? String(b.role).trim() : existing.role,
      department: b.department !== undefined ? b.department : existing.department,
      position: b.position !== undefined ? b.position : existing.position,
      vacation_credits: b.vacationCredits !== undefined ? b.vacationCredits : existing.vacation_credits,
      sick_credits: b.sickCredits !== undefined ? b.sickCredits : existing.sick_credits,
      active: b.active !== undefined ? !!b.active : existing.active,
      date_hired: b.dateHired !== undefined ? b.dateHired : existing.date_hired,
      updated_at: new Date().toISOString(),
    };

    if (b.password && String(b.password).length > 0) {
      updates.password_hash = await bcrypt.hash(String(b.password), 10);
    }

    const { data, error } = await supabase.from('users').update(updates).eq('id', id).select('*').single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(serializeUser(data));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (id === req.user?.sub) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).send();
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}
