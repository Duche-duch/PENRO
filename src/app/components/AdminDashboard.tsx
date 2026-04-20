import { useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { UserManagement } from './UserManagement';

interface AdminDashboardProps {
  currentUser: any;
  users: any[];
  onLogout: () => void;
  onUpdateUsers: (users: any[]) => void;
}

export function AdminDashboard({
  currentUser,
  users,
  onLogout,
  onUpdateUsers,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('user_management');

  const renderContent = () => {
    if (activeTab === 'user_management') {
      return <UserManagement users={users} onUsersUpdate={onUpdateUsers} />;
    }
    return null;
  };

  return (
    <DashboardLayout
      currentUser={currentUser}
      onLogout={onLogout}
      role="admin"
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerColor="bg-indigo-900"
      roleLabel="System Admin Portal"
    >
      {renderContent()}
    </DashboardLayout>
  );
}
