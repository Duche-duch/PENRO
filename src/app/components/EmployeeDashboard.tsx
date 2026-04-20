import { useState, useRef } from 'react';
import { 
  Calendar, 
  LogOut, 
  Plus, 
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  Upload,
  Trash2,
  Eye,
  Info,
  TrendingUp,
  Printer,
  CreditCard
} from 'lucide-react';
import { LeaveApplicationForm } from './LeaveApplicationForm';
import { DashboardLayout } from './DashboardLayout';
import { PrintLeaveForm } from './PrintLeaveForm';
import { LeaveCard } from './LeaveCard';
import { ApplicationDetailsModal } from './ApplicationDetailsModal';
import { AppModal } from './ui/app-modal';
import { Button } from './ui/button';

interface EmployeeDashboardProps {
  currentUser: any;
  applications: any[];
  onLogout: () => void;
  onAddApplication: (application: any) => void | Promise<void>;
  onUpdateApplications: (applications: any[]) => void;
}

export function EmployeeDashboard({ 
  currentUser, 
  applications, 
  onLogout, 
  onAddApplication,
  onUpdateApplications 
}: EmployeeDashboardProps) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showLeaveCardModal, setShowLeaveCardModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter applications for current employee
  const myApplications = applications.filter(
    app => app.employeeId === currentUser.id
  );

  const stats = {
    total: myApplications.length,
    pending: myApplications.filter(app => app.status === 'pending').length,
    approved: myApplications.filter(app => app.workflowStatus === 'approved').length,
    rejected: myApplications.filter(app => app.workflowStatus === 'rejected').length
  };

  // Mock leave credits if not in currentUser
  const credits = {
    vacation: currentUser.vacationCredits || 15.000,
    sick: currentUser.sickCredits || 15.000,
  };

  const getStatusBadge = (status: string, workflowStatus: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };
    
    // If fully approved in workflow, show approved
    const displayStatus = workflowStatus === 'approved' ? 'approved' : (workflowStatus === 'rejected' ? 'rejected' : 'pending');

    const labels = {
      pending: 'In Progress',
      approved: 'Approved',
      rejected: 'Rejected'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[displayStatus as keyof typeof styles]}`}>
        {labels[displayStatus as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const signature = reader.result as string;
        localStorage.setItem(`signature_${currentUser.id}`, signature);
        currentUser.signature = signature;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveSignature = () => {
    localStorage.removeItem(`signature_${currentUser.id}`);
    currentUser.signature = null;
  };

  const handleTabChange = (tab: string) => {
    setSelectedApplication(null);
    setShowPrintModal(false);
    setShowLeaveCardModal(false);
    if (tab !== 'apply') {
      setShowApplicationForm(false);
    }

    // Treat some sidebar items as "actions" that open modals,
    // instead of navigating away from the current view.
    if (tab === 'apply') {
      setShowApplicationForm(true);
      return;
    }
    if (tab === 'leave-card') {
      setShowLeaveCardModal(true);
      return;
    }

    setActiveTab(tab);
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="space-y-8">
          {/* Credits Awareness Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-green-900 px-6 py-4 flex items-center justify-between">
              <h2 className="text-white font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Current Leave Credit Balance
              </h2>
              <span className="text-green-100 text-xs font-medium bg-green-800/50 px-2 py-1 rounded">As of {new Date().toLocaleDateString()}</span>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold text-blue-700 uppercase tracking-wider mb-1">Vacation Leave</p>
                  <p className="text-4xl font-black text-blue-900">{credits.vacation.toFixed(3)}</p>
                </div>
                <p className="text-xs text-blue-600 mt-4 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Used for personal travel and leisure
                </p>
              </div>

              <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-1">Sick Leave</p>
                  <p className="text-4xl font-black text-emerald-900">{credits.sick.toFixed(3)}</p>
                </div>
                <p className="text-xs text-emerald-600 mt-4 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Used for medical reasons and recovery
                </p>
              </div>

              <div className="bg-gradient-to-br from-green-800 to-green-950 rounded-xl p-5 text-white flex flex-col justify-center items-center gap-3">
                <Plus className="w-8 h-8 opacity-50" />
                <button
                  onClick={() => setShowApplicationForm(true)}
                  className="bg-white text-green-900 px-6 py-2 rounded-lg font-bold hover:bg-green-50 transition-colors shadow-lg"
                >
                  New Application
                </button>
                <p className="text-[10px] text-green-200 uppercase tracking-widest font-bold">Submit Form No. 6</p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-end">
              <button 
                onClick={() => handleTabChange('leave-card')}
                className="text-xs font-bold text-green-800 flex items-center gap-1 hover:underline"
              >
                <CreditCard className="w-3 h-3" />
                View Detailed Leave Card (Ledger)
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Total Filed</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-600 opacity-80" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Processing</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500 opacity-80" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600 opacity-80" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-bold uppercase mb-1">Disapproved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-600 opacity-80" />
              </div>
            </div>
          </div>

          {/* Recent Applications */}
          <div className="bg-white rounded-lg shadow border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Applications Activity</h2>
              <button 
                onClick={() => handleTabChange('applications')}
                className="text-sm text-green-700 font-medium hover:underline"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inclusive Dates</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Track</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {myApplications.slice(0, 5).map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.id}</div>
                        <div className="text-[10px] text-gray-500">{formatDate(app.appliedDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.leaveType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(app.startDate)} - {formatDate(app.endDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">{app.days}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(app.status, app.workflowStatus)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <div className="w-24 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full ${
                                app.workflowStatus === 'approved' ? 'w-full bg-green-500' :
                                app.workflowStatus === 'pending_penr' ? 'w-3/4 bg-purple-500' :
                                app.workflowStatus === 'pending_chief' ? 'w-1/2 bg-blue-500' :
                                app.workflowStatus === 'pending_hr' ? 'w-1/4 bg-yellow-500' :
                                app.workflowStatus === 'rejected' ? 'w-full bg-red-500' : 'w-0'
                              }`}
                            ></div>
                          </div>
                          <span className="text-[10px] font-medium text-gray-500">
                            {app.workflowStatus === 'pending_hr' && 'HR Review'}
                            {app.workflowStatus === 'pending_chief' && 'Chief Recommendation'}
                            {app.workflowStatus === 'pending_penr' && 'PENR Approval'}
                            {app.workflowStatus === 'approved' && 'Completed'}
                            {app.workflowStatus === 'rejected' && 'Rejected'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedApplication(app)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {myApplications.length === 0 && (
              <div className="px-6 py-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No applications yet. Click "Apply for Leave" to start.</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'leave-card') {
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-900">Official Leave Ledger</p>
              <p className="text-xs text-blue-700 leading-relaxed">
                This is your official Employee Leave Card as maintained by the HR office. It tracks all earned credits and deductions from approved leaves.
              </p>
            </div>
          </div>
          <LeaveCard employee={currentUser} isEditable={false} />
        </div>
      );
    }

    if (activeTab === 'applications') {
      return (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">All My Leave Applications</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Workflow</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{app.id}</div>
                      <div className="text-xs text-gray-500">{formatDate(app.appliedDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{app.leaveType}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{formatDate(app.startDate)} - {formatDate(app.endDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{app.days}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(app.status, app.workflowStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-xs font-medium">
                        {app.workflowStatus === 'pending_hr' && <span className="text-yellow-600">HR Review</span>}
                        {app.workflowStatus === 'pending_chief' && <span className="text-blue-600">Chief Recommendation</span>}
                        {app.workflowStatus === 'pending_penr' && <span className="text-purple-600">PENR Approval</span>}
                        {app.workflowStatus === 'approved' && <span className="text-green-600">Completed</span>}
                        {app.workflowStatus === 'rejected' && <span className="text-red-600">Rejected</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => setSelectedApplication(app)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    if (activeTab === 'signature') {
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-3 mb-4">
            <Upload className="w-6 h-6 text-green-700" />
            <h2 className="text-lg font-semibold text-gray-900">Personal Digital Signature</h2>
          </div>
          <p className="text-sm text-gray-600 mb-6">
            Please upload a clear image of your signature on a white background. This will be automatically applied to your Leave Application Form (CS Form No. 6).
          </p>

          {currentUser.signature ? (
            <div className="space-y-4">
              <div className="p-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex justify-center">
                <img
                  src={currentUser.signature}
                  alt="My Signature"
                  className="h-32 object-contain bg-white p-4 shadow-sm rounded"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Replace Signature
                </button>
                <button
                  onClick={handleRemoveSignature}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-12 border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all group text-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3 group-hover:text-green-500 transition-colors" />
                  <p className="text-sm text-gray-600 font-bold group-hover:text-green-700">Click to upload signature</p>
                  <p className="text-xs text-gray-500 mt-2">Recommended: PNG with transparent background</p>
                </button>
              </div>
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg flex gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0" />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Your signature is required to file applications. It will be stored securely on your local device and used only for signing official forms.
                </p>
              </div>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleSignatureUpload}
            className="hidden"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <DashboardLayout
      currentUser={currentUser}
      onLogout={onLogout}
      role="employee"
      activeTab={activeTab}
      onTabChange={handleTabChange}
      headerColor="bg-green-900"
      roleLabel="Employee Portal"
    >
      {renderContent()}

      {showApplicationForm && (
        <LeaveApplicationForm
          currentUser={currentUser}
          onClose={() => handleTabChange('dashboard')}
          onSubmit={onAddApplication}
        />
      )}

      {selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onPrint={() => setShowPrintModal(true)}
        />
      )}

      {showPrintModal && (
        <PrintLeaveForm
          application={selectedApplication}
          onClose={() => setShowPrintModal(false)}
        />
      )}

      {showLeaveCardModal && (
        <AppModal
          open={showLeaveCardModal}
          onOpenChange={setShowLeaveCardModal}
          title="Leave Card"
          description="Official leave ledger"
          size="xl"
          footer={(
            <Button type="button" variant="secondary" onClick={() => setShowLeaveCardModal(false)}>
              Close
            </Button>
          )}
        >
          <div className="rounded-lg bg-muted p-4">
            <LeaveCard employee={currentUser} isEditable={false} />
          </div>
        </AppModal>
      )}
    </DashboardLayout>
  );
}
