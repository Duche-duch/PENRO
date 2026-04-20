import { useState } from 'react';
import { Users, Plus, Edit, Trash2, Save, X, Search, Filter, Loader2 } from 'lucide-react';
import { AppModal } from './ui/app-modal';
import { useUI } from '../context/UIProvider';
import { ApiError, createUserApi, deleteUserApi, fetchUsers, updateUserApi } from '../../lib/api';

interface UserManagementProps {
  users: any[];
  onUsersUpdate: (users: any[]) => void;
}

export function UserManagement({ users, onUsersUpdate }: UserManagementProps) {
  const { notify } = useUI();
  const [saving, setSaving] = useState(false);

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [newUser, setNewUser] = useState({
    id: '',
    name: '',
    email: '',
    role: 'employee',
    department: '',
    position: '',
    password: '',
    vacationCredits: 15.0,
    sickCredits: 15.0,
    active: true,
  });

  const refreshUsers = async () => {
    const list = await fetchUsers();
    onUsersUpdate(list);
  };

  const handleAddUser = async () => {
    if (!newUser.id || !newUser.name || !newUser.email || !newUser.password) {
      notify('error', 'Please fill in all required fields');
      return;
    }

    if (users.find((u: any) => u.id === newUser.id || u.email === newUser.email)) {
      notify('error', 'User ID or email already exists');
      return;
    }

    setSaving(true);
    try {
      await createUserApi({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        password: newUser.password,
        department: newUser.department,
        position: newUser.position,
        vacationCredits: newUser.vacationCredits,
        sickCredits: newUser.sickCredits,
        active: newUser.active,
      });
      await refreshUsers();
      notify('success', 'User created');
      setShowAddUserModal(false);
      setNewUser({
        id: '',
        name: '',
        email: '',
        role: 'employee',
        department: '',
        position: '',
        password: '',
        vacationCredits: 15.0,
        sickCredits: 15.0,
        active: true,
      });
    } catch (e) {
      notify('error', e instanceof ApiError ? e.message : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        department: selectedUser.department,
        position: selectedUser.position,
        active: selectedUser.active,
        vacationCredits: selectedUser.vacationCredits,
        sickCredits: selectedUser.sickCredits,
      };
      if (selectedUser.password && String(selectedUser.password).trim().length > 0) {
        body.password = selectedUser.password;
      }
      await updateUserApi(selectedUser.id, body);
      await refreshUsers();
      notify('success', 'User updated');
      setShowEditUserModal(false);
      setSelectedUser(null);
    } catch (e) {
      notify('error', e instanceof ApiError ? e.message : 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    setSaving(true);
    try {
      await deleteUserApi(userId);
      await refreshUsers();
      notify('success', 'User deleted');
    } catch (e) {
      notify('error', e instanceof ApiError ? e.message : 'Failed to delete user');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (userId: string) => {
    const u = users.find((x: any) => x.id === userId);
    if (!u) return;
    setSaving(true);
    try {
      await updateUserApi(userId, { active: !u.active });
      await refreshUsers();
    } catch (e) {
      notify('error', e instanceof ApiError ? e.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const roleLabels = {
    employee: 'Employee',
    hr: 'HR Officer',
    admin: 'System Admin',
    chief: 'Chief Services',
    penr: 'PENR Officer',
  };

  const roleColors = {
    employee: 'bg-blue-100 text-blue-800 border-blue-300',
    hr: 'bg-purple-100 text-purple-800 border-purple-300',
    admin: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    chief: 'bg-green-100 text-green-800 border-green-300',
    penr: 'bg-red-100 text-red-800 border-red-300',
  };

  // Filter users
  const filteredUsers = users.filter((user: any) => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'active' && user.active) ||
                         (filterStatus === 'inactive' && !user.active);
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter((u: any) => u.active).length,
    inactive: users.filter((u: any) => !u.active).length,
    employees: users.filter((u: any) => u.role === 'employee').length
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Users className="w-12 h-12 text-blue-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active</p>
              <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <Users className="w-12 h-12 text-green-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Inactive</p>
              <p className="text-3xl font-bold text-gray-900">{stats.inactive}</p>
            </div>
            <Users className="w-12 h-12 text-red-600 opacity-80" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Employees</p>
              <p className="text-3xl font-bold text-gray-900">{stats.employees}</p>
            </div>
            <Users className="w-12 h-12 text-purple-600 opacity-80" />
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h2 className="text-lg font-semibold text-gray-900">User Accounts</h2>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                />
              </div>

              {/* Role Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded text-sm"
                >
                  <option value="all">All Roles</option>
                  <option value="employee">Employee</option>
                  <option value="hr">HR</option>
                  <option value="admin">Admin</option>
                  <option value="chief">Chief</option>
                  <option value="penr">PENR</option>
                </select>
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Add User Button */}
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Password</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user: any) => (
                <tr key={user.id} className={`hover:bg-gray-50 ${!user.active ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-xs text-gray-500">{user.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${roleColors[user.role as keyof typeof roleColors]}`}>
                      {roleLabels[user.role as keyof typeof roleLabels]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{user.department}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(user.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        user.active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                      }`}
                    >
                      {user.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-mono text-gray-500">••••••••</span>
                    <span className="block text-xs text-gray-400 mt-0.5">Set via Add / Edit</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser({ ...user, password: '' });
                          setShowEditUserModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <AppModal
          open={showAddUserModal}
          onOpenChange={setShowAddUserModal}
          title="Add New User"
          size="lg"
          className="p-0"
        >
            <div className="px-6 py-4 border-b border-gray-200 bg-purple-900 text-white flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add New User</h2>
              <button onClick={() => setShowAddUserModal(false)} className="hover:bg-purple-800 p-1 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID *</label>
                  <input
                    type="text"
                    value={newUser.id}
                    onChange={(e) => setNewUser({ ...newUser, id: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="e.g., EMP-1003"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="email@denr.gov.ph"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="text"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="Enter password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    <option value="employee">Employee</option>
                    <option value="hr">HR Officer</option>
                    <option value="admin">System Admin</option>
                    <option value="chief">Chief Services</option>
                    <option value="penr">PENR Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={newUser.department}
                    onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="Department name"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={newUser.position}
                    onChange={(e) => setNewUser({ ...newUser, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="Job position"
                  />
                </div>

                {newUser.role === 'employee' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vacation Credits</label>
                      <input
                        type="number"
                        step="0.001"
                        value={newUser.vacationCredits}
                        onChange={(e) => setNewUser({ ...newUser, vacationCredits: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sick Credits</label>
                      <input
                        type="number"
                        step="0.001"
                        value={newUser.sickCredits}
                        onChange={(e) => setNewUser({ ...newUser, sickCredits: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowAddUserModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleAddUser()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Add User
              </button>
            </div>
        </AppModal>
      )}

      {/* Edit User Modal */}
      {showEditUserModal && selectedUser && (
        <AppModal
          open={showEditUserModal}
          onOpenChange={setShowEditUserModal}
          title={`Edit User - ${selectedUser.id}`}
          size="lg"
          className="p-0"
        >
            <div className="px-6 py-4 border-b border-gray-200 bg-purple-900 text-white flex justify-between items-center">
              <h2 className="text-xl font-semibold">Edit User - {selectedUser.id}</h2>
              <button onClick={() => setShowEditUserModal(false)} className="hover:bg-purple-800 p-1 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                  <input
                    type="text"
                    value={selectedUser.id}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={selectedUser.name}
                    onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New password (optional)</label>
                  <input
                    type="password"
                    value={selectedUser.password || ''}
                    onChange={(e) => setSelectedUser({ ...selectedUser, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                    placeholder="Leave blank to keep current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                  <select
                    value={selectedUser.role}
                    onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  >
                    <option value="employee">Employee</option>
                    <option value="hr">HR Officer</option>
                    <option value="admin">System Admin</option>
                    <option value="chief">Chief Services</option>
                    <option value="penr">PENR Officer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={selectedUser.department}
                    onChange={(e) => setSelectedUser({ ...selectedUser, department: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    type="text"
                    value={selectedUser.position}
                    onChange={(e) => setSelectedUser({ ...selectedUser, position: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                  />
                </div>

                {selectedUser.role === 'employee' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Vacation Credits</label>
                      <input
                        type="number"
                        step="0.001"
                        value={selectedUser.vacationCredits || 0}
                        onChange={(e) => setSelectedUser({ ...selectedUser, vacationCredits: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sick Credits</label>
                      <input
                        type="number"
                        step="0.001"
                        value={selectedUser.sickCredits || 0}
                        onChange={(e) => setSelectedUser({ ...selectedUser, sickCredits: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <button
                type="button"
                disabled={saving}
                onClick={() => setShowEditUserModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleEditUser()}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
        </AppModal>
      )}
    </div>
  );
}
