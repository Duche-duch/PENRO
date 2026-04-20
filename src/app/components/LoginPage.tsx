import { useState } from 'react';
import { Calendar, Lock, Loader2, User } from 'lucide-react';
import { getIntegratedSignature } from '../utils/signatures';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ApiError } from '../../lib/api';

interface LoginPageProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

/** Demo quick-login accounts (passwords match seeded Supabase users). */
const demoAccounts = [
  {
    id: 'EMP-1001',
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@denr.gov.ph',
    password: 'employee123',
    role: 'employee',
    position: 'HR Officer II',
  },
  {
    id: 'EMP-1002',
    name: 'Maria Santos',
    email: 'maria.santos@denr.gov.ph',
    password: 'employee123',
    role: 'employee',
    position: 'Accountant III',
  },
  {
    id: 'HR-001',
    name: 'Gardeniah Krizyl B. Lastima',
    email: 'hr@denr.gov.ph',
    password: 'hr123',
    role: 'hr',
    position: 'HR Officer IV/HRMO',
  },
  {
    id: 'ADMIN-001',
    name: 'System Administrator',
    email: 'admin@denr.gov.ph',
    password: 'admin123',
    role: 'admin',
    position: 'System Admin',
  },
  {
    id: 'CSD-001',
    name: 'Julius James M. Vela',
    email: 'chief@denr.gov.ph',
    password: 'chief123',
    role: 'chief',
    position: 'Chief, Mgt. Services Division',
  },
  {
    id: 'PENR-001',
    name: 'George E. Laolao',
    email: 'penr@denr.gov.ph',
    password: 'penr123',
    role: 'penr',
    position: 'PENR Officer',
  },
];

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await onLogin(email, password);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const quickLogin = async (emailLogin: string, passwordLogin: string) => {
    setError('');
    setSubmitting(true);
    try {
      await onLogin(emailLogin, passwordLogin);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Unable to sign in');
    } finally {
      setSubmitting(false);
    }
  };

  const roleLabels: any = {
    employee: 'Employee',
    hr: 'HR Officer',
    admin: 'System Admin',
    chief: 'Chief Services Division',
    penr: 'PENR Officer',
  };

  const roleColors: any = {
    employee: 'bg-blue-100 border-blue-300 hover:bg-blue-200',
    hr: 'bg-purple-100 border-purple-300 hover:bg-purple-200',
    admin: 'bg-indigo-100 border-indigo-300 hover:bg-indigo-200',
    chief: 'bg-green-100 border-green-300 hover:bg-green-200',
    penr: 'bg-red-100 border-red-300 hover:bg-red-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-muted via-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calendar className="w-12 h-12 text-primary" />
            <div>
              <h1 className="text-3xl font-bold text-foreground">Leave Management System</h1>
              <p className="text-muted-foreground mt-1">Department of Environment and Natural Resources</p>
              <p className="text-sm text-muted-foreground">PENR-Zamboanga del Sur</p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="surface-card p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-6">Sign In</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="app-field-label">Email Address</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    placeholder="your.email@denr.gov.ph"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
              <div>
                <label className="app-field-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    placeholder="Enter your password"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>
              {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Signing in…
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </div>

          <div className="surface-card p-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Demo Accounts</h2>
            <p className="text-sm text-muted-foreground mb-6">Click to sign in as different roles (database demo users).</p>
            <div className="space-y-3">
              {['employee', 'hr', 'admin', 'chief', 'penr'].map((role) => (
                <div key={role}>
                  <button
                    type="button"
                    onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                    className={`w-full p-3 border-2 rounded-md text-left app-transition ${roleColors[role]}`}
                  >
                    <div className="font-medium text-foreground">{roleLabels[role]}</div>
                  </button>
                  {selectedRole === role && (
                    <div className="mt-2 pl-4 space-y-2">
                      {demoAccounts
                        .filter((u) => u.role === role)
                        .map((user) => (
                          <button
                            type="button"
                            key={user.id}
                            disabled={submitting}
                            onClick={() => quickLogin(user.email, user.password)}
                            className="w-full rounded-md border border-border bg-muted px-3 py-2 text-left text-sm app-transition hover:bg-muted/70"
                          >
                            <div className="font-medium text-foreground">{user.name}</div>
                            <div className="text-xs text-muted-foreground">{user.position}</div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
