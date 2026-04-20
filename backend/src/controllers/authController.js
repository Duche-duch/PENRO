import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';
import { serializeUser } from '../utils/serializeUser.js';

const JWT_SECRET = () => process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

export async function login(req, res) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', String(email).toLowerCase().trim())
      .maybeSingle();

    if (error) {
      console.error(error);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user || user.active === false) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const safe = serializeUser(user);
    const token = jwt.sign(
      { sub: user.id, email: user.email, role: user.role },
      JWT_SECRET(),
      { expiresIn: JWT_EXPIRES }
    );

    return res.json({ token, user: safe });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Login failed' });
  }
}

export async function me(req, res) {
  try {
    const { data, error } = await supabase.from('users').select('*').eq('id', req.user.sub).maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    if (!data || data.active === false) return res.status(401).json({ error: 'User no longer active' });
    return res.json(serializeUser(data));
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Failed to load profile' });
  }
}
