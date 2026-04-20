import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { LoginPage } from './components/LoginPage';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { HRDashboard } from './components/HRDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { ChiefDashboard } from './components/ChiefDashboard';
import { PENRDashboard } from './components/PENRDashboard';
import { useUI } from './context/UIProvider';
import {
  ApiError,
  attachSignature,
  createRecord,
  fetchCurrentUser,
  fetchRecords,
  fetchUsers,
  loginRequest,
  updateRecord,
} from '../lib/api';

export default function App() {
  const { pageLoading, setPageLoading, notify } = useUI();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Restore session and load shared data
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    let cancelled = false;
    (async () => {
      setPageLoading(true);
      try {
        const me = await fetchCurrentUser();
        if (cancelled) return;
        const u = attachSignature(me as Record<string, unknown>, me.id as string);
        setCurrentUser(u);
        localStorage.setItem('currentUser', JSON.stringify(u));

        const apps = await fetchRecords();
        if (cancelled) return;
        setApplications(apps);

        if (u.role === 'admin') {
          const list = await fetchUsers();
          if (!cancelled) setUsers(list);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
      } finally {
        if (!cancelled) setPageLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setPageLoading]);

  const handleLogin = async (email: string, password: string) => {
    setPageLoading(true);
    try {
      const { token, user } = await loginRequest(email, password);
      localStorage.setItem('accessToken', token);
      const u = attachSignature(user as Record<string, unknown>, user.id as string);
      setCurrentUser(u);
      localStorage.setItem('currentUser', JSON.stringify(u));

      const apps = await fetchRecords();
      setApplications(apps);

      if (u.role === 'admin') {
        const list = await fetchUsers();
        setUsers(list);
      } else {
        setUsers([]);
      }

      notify('success', 'Signed in successfully');
    } catch (e) {
      throw e;
    } finally {
      setPageLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('accessToken');
    setUsers([]);
    setApplications([]);
  };

  const handleAddApplication = useCallback(
    async (application: any) => {
      try {
        const created = await createRecord(application);
        setApplications((prev) => [...prev, created]);
        notify('success', 'Leave application submitted');
      } catch (e) {
        notify('error', e instanceof ApiError ? e.message : 'Failed to submit application');
        throw e;
      }
    },
    [notify]
  );

  const handleUpdateApplications = useCallback(
    async (next: any[]) => {
      const prev = applications;
      setApplications(next);
      try {
        for (const app of next) {
          const old = prev.find((a: any) => a.id === app.id);
          if (!old) {
            await createRecord(app);
          } else if (JSON.stringify(old) !== JSON.stringify(app)) {
            await updateRecord(app.id, app);
          }
        }
      } catch (e) {
        notify('error', e instanceof ApiError ? e.message : 'Failed to save changes');
        setApplications(prev);
      }
    },
    [applications, notify]
  );

  const handleUpdateUsers = useCallback((list: any[]) => {
    setUsers(list);
  }, []);

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-10 w-10 rounded-full border-4 border-muted border-t-primary animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key="login"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          <LoginPage onLogin={handleLogin} />
        </motion.div>
      </AnimatePresence>
    );
  }

  switch (currentUser.role) {
    case 'employee':
      return (
        <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          <EmployeeDashboard
            currentUser={currentUser}
            applications={applications}
            onLogout={handleLogout}
            onAddApplication={handleAddApplication}
            onUpdateApplications={handleUpdateApplications}
          />
        </motion.div>
      );

    case 'hr':
      return (
        <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          <HRDashboard
            currentUser={currentUser}
            applications={applications}
            onLogout={handleLogout}
            onUpdateApplications={handleUpdateApplications}
          />
        </motion.div>
      );

    case 'admin':
      return (
        <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          <AdminDashboard
            currentUser={currentUser}
            users={users}
            applications={applications}
            onLogout={handleLogout}
            onUpdateUsers={handleUpdateUsers}
          />
        </motion.div>
      );

    case 'chief':
      return (
        <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          <ChiefDashboard
            currentUser={currentUser}
            applications={applications}
            onLogout={handleLogout}
            onUpdateApplications={handleUpdateApplications}
          />
        </motion.div>
      );

    case 'penr':
      return (
        <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }}>
          <PENRDashboard
            currentUser={currentUser}
            applications={applications}
            onLogout={handleLogout}
            onUpdateApplications={handleUpdateApplications}
          />
        </motion.div>
      );

    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Unknown Role</h1>
            <p className="text-gray-600 mb-4">The role "{currentUser.role}" is not recognized.</p>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800"
            >
              Back to Login
            </button>
          </div>
        </div>
      );
  }
}
