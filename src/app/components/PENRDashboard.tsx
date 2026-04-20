import { useState, useRef, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye, 
  CheckSquare, 
  XSquare,
  Upload,
  Trash2,
  Filter
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { getIntegratedSignature } from '../utils/signatures';
import { ApplicationDetailsModal } from './ApplicationDetailsModal';
import { useUI } from '../context/UIProvider';
import { AppModal } from './ui/app-modal';
import { Button } from './ui/button';

interface PENRDashboardProps {
  currentUser: any;
  applications: any[];
  onLogout: () => void;
  onUpdateApplications: (applications: any[]) => void;
}

export function PENRDashboard({ 
  currentUser, 
  applications, 
  onLogout, 
  onUpdateApplications 
}: PENRDashboardProps) {
  const { notify } = useUI();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [reviewApplication, setReviewApplication] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [disapprovalReason, setDisapprovalReason] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync integrated signature on mount
  useEffect(() => {
    if (!currentUser.signature) {
      const integrated = getIntegratedSignature(currentUser.id);
      if (integrated) {
        currentUser.signature = integrated;
      }
    }
  }, [currentUser]);

  const handleTabChange = (tab: string) => {
    setSelectedApplication(null);
    setReviewApplication(null);
    setShowDetailsModal(false);
    setDisapprovalReason('');
    setActiveTab(tab);
  };

  const pendingApplications = applications.filter(
    app => app.workflowStatus === 'pending_penr'
  );

  const stats = {
    total: applications.length,
    pendingPENR: pendingApplications.length,
    approved: applications.filter(app => app.workflowStatus === 'approved').length,
    rejected: applications.filter(app => app.workflowStatus === 'rejected').length
  };

  const getStatusBadge = (workflowStatus: string) => {
    const styles = {
      pending_hr: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      pending_chief: 'bg-blue-100 text-blue-800 border-blue-300',
      pending_penr: 'bg-purple-100 text-purple-800 border-purple-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300'
    };
    
    const labels = {
      pending_hr: 'Pending HR Review',
      pending_chief: 'Pending Chief',
      pending_penr: 'Pending PENR',
      approved: 'Approved',
      rejected: 'Rejected'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[workflowStatus as keyof typeof styles]}`}>
        {labels[workflowStatus as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handlePENRApproval = (action: 'approve' | 'disapprove') => {
    if (!reviewApplication || !currentUser.signature) {
      notify('error', 'Please upload your signature first.');
      return;
    }

    const updatedApplications = applications.map(app => {
      if (app.id === reviewApplication.id) {
        if (action === 'approve') {
          return {
            ...app,
            status: 'approved',
            workflowStatus: 'approved',
            penrSignature: currentUser.signature,
            penrApproval: 'Approved',
            penrApprovalDate: new Date().toISOString()
          };
        } else {
          return {
            ...app,
            status: 'rejected',
            workflowStatus: 'rejected',
            penrSignature: currentUser.signature,
            penrApproval: 'Disapproved',
            penrApprovalDate: new Date().toISOString(),
            penrDisapprovalReason: disapprovalReason
          };
        }
      }
      return app;
    });

    onUpdateApplications(updatedApplications);
    notify(
      action === 'approve' ? 'success' : 'info',
      action === 'approve'
        ? 'Application fully approved.'
        : 'Application was disapproved by PENR.',
    );
    setReviewApplication(null);
    setDisapprovalReason('');
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

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Received</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-80" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">For Approval</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingPENR}</p>
                </div>
                <Clock className="w-12 h-12 text-purple-500 opacity-80" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Approved</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600 opacity-80" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Disapproved</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-600 opacity-80" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Applications Pending PENR Approval</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{app.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.employeeName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{app.leaveType}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(app.startDate)} - {formatDate(app.endDate)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setReviewApplication(app);
                          }}
                          className="px-3 py-1 bg-red-900 text-white rounded text-xs hover:bg-red-950"
                        >
                          Review & Finalize
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      );
    }

    if (activeTab === 'pending') {
      return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Applications Pending PENR Approval</h2>
          </div>
          {pendingApplications.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No applications pending PENR approval</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.id}</div>
                        <div className="text-xs text-gray-500">{formatDate(app.appliedDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.employeeName}</div>
                        <div className="text-xs text-gray-500">{app.position}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{app.department}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.leaveType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(app.startDate)}</div>
                        <div className="text-xs text-gray-500">to {formatDate(app.endDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.days} {app.days === 1 ? 'day' : 'days'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setReviewApplication(app);
                          }}
                          className="px-3 py-1 bg-red-900 text-white rounded text-xs hover:bg-red-950"
                        >
                          Review & Finalize
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'all') {
      const filteredApplications =
        filterStatus === 'all'
          ? applications
          : applications.filter((app) => app.workflowStatus === filterStatus);

      return (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">All Applications</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="all">All Status</option>
                <option value="pending_hr">Pending HR</option>
                <option value="pending_chief">Pending Chief</option>
                <option value="pending_penr">Pending PENR</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Application ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Leave Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Days</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{app.id}</div>
                      <div className="text-xs text-gray-500">{formatDate(app.appliedDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{app.employeeName}</div>
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
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(app.workflowStatus)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {app.workflowStatus === 'pending_penr' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setReviewApplication(app);
                            }}
                            className="px-3 py-1 bg-red-900 text-white rounded text-xs hover:bg-red-950"
                          >
                            Review
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedApplication(app);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredApplications.length === 0 && (
            <div className="px-6 py-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No applications found</p>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'signature') {
      const isIntegrated = !!getIntegratedSignature(currentUser.id);
      return (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Official Executive Signature</h2>
          {currentUser.signature ? (
            <div className="space-y-4">
              <div className="p-10 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 flex justify-center">
                <img src={currentUser.signature} alt="My Signature" className="h-32 object-contain bg-white p-4 shadow-sm" />
              </div>
              <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800">Update Signature</button>
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} className="w-full py-12 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-900 text-center">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="font-bold">Click to upload executive signature</p>
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleSignatureUpload} className="hidden" />
        </div>
      );
    }

    return null;
  };

  return (
    <DashboardLayout
      currentUser={currentUser}
      onLogout={onLogout}
      role="penr"
      activeTab={activeTab}
      onTabChange={handleTabChange}
      headerColor="bg-red-900"
      roleLabel="PENR Officer Portal"
      notificationCount={stats.pendingPENR}
    >
      {renderContent()}

      {showDetailsModal && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedApplication(null);
          }}
        />
      )}

      {reviewApplication && (
        <AppModal
          open={!!reviewApplication}
          onOpenChange={(open) => !open && setReviewApplication(null)}
          title={`Final Review - ${reviewApplication.id}`}
          description={`${reviewApplication.employeeName} • ${reviewApplication.leaveType}`}
          size="md"
          footer={(
            <>
              <Button type="button" variant="secondary" onClick={() => setReviewApplication(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => handlePENRApproval('approve')}>
                Final Approve Application
              </Button>
            </>
          )}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-border bg-muted p-4">
                <p className="caption-text">Application ID</p>
                <p className="font-medium">{reviewApplication.id}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted p-4">
                <p className="caption-text">Applied Date</p>
                <p className="font-medium">{formatDate(reviewApplication.appliedDate)}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted p-4">
                <p className="caption-text">Employee</p>
                <p className="font-medium">{reviewApplication.employeeName}</p>
                <p className="text-xs text-muted-foreground">{reviewApplication.position}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted p-4">
                <p className="caption-text">Department</p>
                <p className="font-medium">{reviewApplication.department}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted p-4">
                <p className="caption-text">Leave Type</p>
                <p className="font-medium">{reviewApplication.leaveType}</p>
              </div>
              <div className="rounded-lg border border-border bg-muted p-4">
                <p className="caption-text">Duration</p>
                <p className="font-medium">
                  {formatDate(reviewApplication.startDate)} to {formatDate(reviewApplication.endDate)}
                </p>
                <p className="text-xs text-muted-foreground">
                  {reviewApplication.days} {reviewApplication.days === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="caption-text">Prior Endorsements</p>
              <p className="font-medium">
                HR: {reviewApplication.hrRecommendation || 'Pending'} / Chief: {reviewApplication.chiefRecommendation || 'Pending'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This is the final review step and will directly set the final decision.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted p-4">
              <p className="caption-text">Reason</p>
              <p className="font-medium">{reviewApplication.reason || 'No reason provided.'}</p>
              {reviewApplication.leaveDetails && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Details: {reviewApplication.leaveDetails}
                </p>
              )}
            </div>
          </div>
        </AppModal>
      )}
    </DashboardLayout>
  );
}
