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
  Filter,
  Printer,
  ChevronRight,
  Info
} from 'lucide-react';
import { DashboardLayout } from './DashboardLayout';
import { AppModal } from './ui/app-modal';
import { Button } from './ui/button';
import { PrintLeaveForm } from './PrintLeaveForm';
import { ApplicationDetailsModal } from './ApplicationDetailsModal';
import { Reports } from './Reports';
import { EmployeeRecords } from './EmployeeRecords';
import { getIntegratedSignature } from '../utils/signatures';
import { useUI } from '../context/UIProvider';

interface HRDashboardProps {
  currentUser: any;
  applications: any[];
  onLogout: () => void;
  onUpdateApplications: (applications: any[]) => void;
}

export function HRDashboard({ 
  currentUser, 
  applications, 
  onLogout, 
  onUpdateApplications 
}: HRDashboardProps) {
  const { notify } = useUI();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [reviewApplication, setReviewApplication] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Separate deduction states
  const [vacationDeduct, setVacationDeduct] = useState('0');
  const [sickDeduct, setSickDeduct] = useState('0');
  const [skipDeduction, setSkipDeduction] = useState(false);
  
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
    setShowPrintModal(false);
    setShowDetailsModal(false);
    setVacationDeduct('0');
    setSickDeduct('0');
    setSkipDeduction(false);
    setActiveTab(tab);
  };

  const pendingApplications = applications.filter(
    app => app.workflowStatus === 'pending_hr'
  );

  const stats = {
    total: applications.length,
    pendingHR: applications.filter(app => app.workflowStatus === 'pending_hr').length,
    pendingChief: applications.filter(app => app.workflowStatus === 'pending_chief').length,
    pendingPENR: applications.filter(app => app.workflowStatus === 'pending_penr').length,
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

  const handleHRApproval = (action: 'approve' | 'reject') => {
    if (!reviewApplication || !currentUser.signature) {
      notify('error', 'Please upload your signature first.');
      return;
    }

    const vDeduct = skipDeduction ? 0 : (parseFloat(vacationDeduct) || 0);
    const sDeduct = skipDeduction ? 0 : (parseFloat(sickDeduct) || 0);
    
    const newVacationBalance = reviewApplication.vacationCredits - vDeduct;
    const newSickBalance = reviewApplication.sickCredits - sDeduct;

    const updatedApplications = applications.map(app => {
      if (app.id === reviewApplication.id) {
        if (action === 'approve') {
          return {
            ...app,
            workflowStatus: 'pending_chief',
            hrSignature: currentUser.signature,
            hrRecommendation: 'For approval',
            hrRecommendationDate: new Date().toISOString(),
            vacationDeduction: vDeduct,
            sickDeduction: sDeduct,
            vacationBalanceAfter: newVacationBalance,
            sickBalanceAfter: newSickBalance,
            deductionSkipped: skipDeduction
          };
        } else {
          return {
            ...app,
            status: 'rejected',
            workflowStatus: 'rejected',
            hrSignature: currentUser.signature,
            hrRecommendation: 'Disapproved',
            hrRecommendationDate: new Date().toISOString()
          };
        }
      }
      return app;
    });

    onUpdateApplications(updatedApplications);
    notify(
      action === 'approve' ? 'success' : 'info',
      action === 'approve'
        ? 'Application endorsed to Chief for recommendation.'
        : 'Application marked as disapproved by HR.',
    );
    setReviewApplication(null);
    setVacationDeduct('0');
    setSickDeduct('0');
    setSkipDeduction(false);
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
    if (activeTab === 'reports') {
      return <Reports applications={applications} />;
    }

    if (activeTab === 'employee_records') {
      return <EmployeeRecords applications={applications} />;
    }

    if (activeTab === 'dashboard') {
      return (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <FileText className="w-12 h-12 text-blue-600 opacity-80" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending HR</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingHR}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-500 opacity-80" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">With Chief</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingChief}</p>
                </div>
                <Clock className="w-12 h-12 text-blue-500 opacity-80" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">With PENR</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.pendingPENR}</p>
                </div>
                <Clock className="w-12 h-12 text-purple-500 opacity-80" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-600 opacity-80" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border-l-4 border-red-600">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rejected</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-600 opacity-80" />
              </div>
            </div>
          </div>

          {/* Pending Applications */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Applications Pending HR Review</h2>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{app.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{app.employeeName}</div>
                        <div className="text-xs text-gray-500">{app.position}</div>
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
                        <div className="text-sm text-gray-500">{formatDate(app.appliedDate)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setReviewApplication(app);
                            // Auto-set deduction values based on leave type
                            if (app.leaveType.toLowerCase().includes('vacation')) {
                              setVacationDeduct(app.days.toString());
                              setSickDeduct('0');
                            } else if (app.leaveType.toLowerCase().includes('sick')) {
                              setSickDeduct(app.days.toString());
                              setVacationDeduct('0');
                            }
                          }}
                          className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pendingApplications.length === 0 && (
              <div className="px-6 py-12 text-center">
                <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No pending applications for HR review</p>
              </div>
            )}
          </div>
        </>
      );
    }

    if (activeTab === 'pending') {
      return (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Pending HR Review</h2>
          </div>

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
                        className="px-3 py-1 bg-purple-600 text-white rounded text-xs hover:bg-purple-700 transition-colors"
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pendingApplications.length === 0 && (
            <div className="px-6 py-12 text-center">
              <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No pending applications for HR review</p>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'all') {
      const filteredApplications = filterStatus === 'all' 
        ? applications 
        : applications.filter(app => app.workflowStatus === filterStatus);

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
                      <div className="text-xs text-gray-500">{app.position}</div>
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
                      {getStatusBadge(app.workflowStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedApplication(app);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (!(app.workflowStatus === 'approved' || app.workflowStatus === 'ready_to_print')) return;
                            setSelectedApplication(app);
                            setShowPrintModal(true);
                          }}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          title={app.workflowStatus === 'approved' || app.workflowStatus === 'ready_to_print' ? 'Print Leave Form' : 'Document must be approved before printing'}
                          disabled={!(app.workflowStatus === 'approved' || app.workflowStatus === 'ready_to_print')}
                        >
                          <Printer className="w-4 h-4" />
                        </button>
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Official Digital Signature</h2>
          <p className="text-sm text-gray-600 mb-6">
            {isIntegrated 
              ? "Your official signature is integrated into the system." 
              : "Upload your digital signature for approving leave applications."}
          </p>

          {currentUser.signature ? (
            <div className="space-y-4">
              <div className="p-6 bg-gray-50 rounded-lg border-2 border-gray-200">
                <p className="text-sm text-gray-700 mb-3">Current Signature:</p>
                <img
                  src={currentUser.signature}
                  alt="My Signature"
                  className="h-24 border border-gray-300 rounded bg-white p-3"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Update Signature
                </button>
                {!isIntegrated && (
                  <button
                    onClick={handleRemoveSignature}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove Signature
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 transition-colors text-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium">Click to upload signature image</p>
                  <p className="text-xs text-gray-500 mt-2">PNG, JPG up to 2MB</p>
                </button>
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
      role="hr"
      activeTab={activeTab}
      onTabChange={handleTabChange}
      headerColor="bg-purple-900"
      roleLabel="HR Portal"
      notificationCount={stats.pendingHR}
    >
      {renderContent()}

      {reviewApplication && (
        <AppModal
          open={!!reviewApplication}
          onOpenChange={(open) => !open && setReviewApplication(null)}
          title={`HR Review - ${reviewApplication.id}`}
          description={`${reviewApplication.employeeName} • ${reviewApplication.leaveType}`}
          size="lg"
          footer={(
            <>
              <Button type="button" variant="secondary" onClick={() => setReviewApplication(null)}>
                Cancel
              </Button>
              <Button type="button" onClick={() => handleHRApproval('approve')}>
                Simulate HR Process (Approve)
              </Button>
            </>
          )}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      {showDetailsModal && selectedApplication && (
        <ApplicationDetailsModal
          application={selectedApplication}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedApplication(null);
          }}
          onPrint={() => {
            if (!(selectedApplication.workflowStatus === 'approved' || selectedApplication.workflowStatus === 'ready_to_print')) return;
            setShowPrintModal(true);
          }}
        />
      )}

      {showPrintModal && selectedApplication && (
        <PrintLeaveForm
          application={selectedApplication}
          onClose={() => {
            setShowPrintModal(false);
            setSelectedApplication(null);
          }}
        />
      )}
    </DashboardLayout>
  );
}
