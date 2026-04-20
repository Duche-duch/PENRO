import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { AppModal } from './ui/app-modal';
import { Button } from './ui/button';

interface LeaveApplicationFormProps {
  currentUser: any;
  onClose: () => void;
  onSubmit: (application: any) => void | Promise<void>;
}

export function LeaveApplicationForm({ currentUser, onClose, onSubmit }: LeaveApplicationFormProps) {
  const [formData, setFormData] = useState({
    office: 'PENR-Zamboanga del Sur',
    lastName: currentUser.name.split(' ').slice(-1)[0],
    firstName: currentUser.name.split(' ')[0],
    middleName: currentUser.name.split(' ')[1] || '',
    dateOfFiling: new Date().toISOString().split('T')[0],
    position: currentUser.position,
    salary: currentUser.salary || '',
    
    // Leave Type
    leaveType: '',
    otherLeaveType: '',
    
    // Leave Details
    leaveDetails: '',
    leaveDetailsSpecify: '',
    
    // Duration
    days: '',
    startDate: '',
    endDate: '',
    
    // Commutation
    commutation: 'Not Requested',
    
    // Leave Credits (from records)
    vacationCredits: 15,
    sickCredits: 15,
    totalEarned: 17.587,
    
    reason: ''
  });

  const [errors, setErrors] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const leaveTypes = [
    { value: 'Vacation Leave', label: 'Vacation Leave (Sec. 51, Rule XVI, Omnibus Rules Implementing E.O. No. 292)', hasDetails: true },
    { value: 'Mandatory/Forced Leave', label: 'Mandatory/Forced Leave (Sec. 25, Rule XVI, Omnibus Rules Implementing E.O. No. 292)', hasDetails: false },
    { value: 'Sick Leave', label: 'Sick Leave (Sec. 43, Rule XVI, Omnibus Rules Implementing E.O. No. 292)', hasDetails: true },
    { value: 'Maternity Leave', label: 'Maternity Leave (R.A. No. 11210 and IRR issued pursuant to CSC MC No. 71, s. 1990, as amended)', hasDetails: false },
    { value: 'Paternity Leave', label: 'Paternity Leave (Sec. 21, Rule XIV, Omnibus Rules Implementing E.O. No. 292)', hasDetails: false },
    { value: 'Solo Parent Leave', label: 'Solo Parent Leave (R.A. No. 8972 / CSC MC No. 8, s. 2004)', hasDetails: false },
    { value: 'Study Leave', label: 'Study Leave (Sec. 68, Rule XVI, Omnibus Rules Implementing E.O. No. 292)', hasDetails: false },
    { value: '10-Day VAWC Leave', label: '10-Day VAWC Leave (R.A. No. 9262 / CSC MC No. 15, s. 2005)', hasDetails: false },
    { value: 'Rehabilitation Privilege', label: 'Rehabilitation Privilege (Sec. 55, Rule XIV, Omnibus Rules Implementing E.O. No. 292)', hasDetails: false },
    { value: 'Special Leave Benefits for Women', label: 'Special Leave Benefits for Women (R.A. No. 9710 / CSC MC No. 25, s. 2010)', hasDetails: true },
    { value: 'Special Emergency', label: 'Special Emergency (Calamity) Leave (CSC MC No. 2, s. 2012, as amended)', hasDetails: false },
    { value: 'Adoption Leave', label: 'Adoption Leave (R.A. No. 8552)', hasDetails: false },
    { value: 'Other', label: 'Others', hasDetails: false }
  ];

  const vacationLeaveDetails = [
    'In case of Vacation/Special Privilege Leave: Within the Philippines',
    'In case of Vacation/Special Privilege Leave: Abroad (Specify)'
  ];

  const sickLeaveDetails = [
    'In case of Sick Leave: In Hospital (Specify Illness)',
    'In case of Sick Leave: Out Patient (Specify Illness)'
  ];

  const specialLeaveDetails = [
    'In case of Special Leave Benefits for Women: (Specify Illness)'
  ];

  const studyLeaveDetails = [
    'In case of Study Leave: Completion of Master\'s Degree',
    'In case of Study Leave: BAR/Board Examination Review',
    'Other Purpose: Monetization of Leave Credits',
    'Other Purpose: Terminal Leave'
  ];

  const selectedLeaveType = leaveTypes.find(lt => lt.value === formData.leaveType);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: null }));
    }
  };

  const calculateDays = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return '';

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Invalid range should not produce a value.
    if (end < start) return '';

    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays.toString();
  };

  useEffect(() => {
    const computedDays = calculateDays(formData.startDate, formData.endDate);
    setFormData((prev) => {
      if (prev.days === computedDays) return prev;
      return { ...prev, days: computedDays };
    });
  }, [formData.startDate, formData.endDate]);

  const validateForm = () => {
    const newErrors: any = {};

    if (!formData.leaveType) newErrors.leaveType = 'Please select a leave type';
    if (selectedLeaveType?.hasDetails && !formData.leaveDetails) {
      newErrors.leaveDetails = 'Please select leave details';
    }
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.days || parseInt(formData.days) <= 0) newErrors.days = 'Number of days must be greater than 0';
    if (formData.startDate && formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date cannot be earlier than start date';
    }
    if (!formData.reason.trim()) newErrors.reason = 'Reason is required';
    
    if (!currentUser.signature) {
      newErrors.signature = 'Please upload your signature before submitting';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const application = {
      id: `LA-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department,
      position: formData.position,
      salary: formData.salary,
      leaveType: formData.leaveType === 'Other' ? formData.otherLeaveType : formData.leaveType,
      leaveDetails: formData.leaveDetails + (formData.leaveDetailsSpecify ? ': ' + formData.leaveDetailsSpecify : ''),
      startDate: formData.startDate,
      endDate: formData.endDate,
      days: parseInt(formData.days),
      reason: formData.reason,
      status: 'pending',
      workflowStatus: 'pending_hr',
      appliedDate: formData.dateOfFiling,
      currentCredits: formData.vacationCredits,
      vacationCredits: formData.vacationCredits,
      sickCredits: formData.sickCredits,
      earnedCredits: formData.totalEarned,
      lessThisApplication: parseInt(formData.days),
      balance: formData.totalEarned - parseInt(formData.days),
      commutation: formData.commutation,
      employeeSignature: currentUser.signature,
      hrSignature: null,
      hrRecommendation: null,
      hrRecommendationDate: null,
      chiefSignature: null,
      chiefRecommendation: null,
      chiefRecommendationDate: null,
      penrSignature: null,
      penrApproval: null,
      penrApprovalDate: null,
      penrDisapprovalReason: null
    };

    setIsSubmitting(true);
    try {
      await Promise.resolve(onSubmit(application));
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormInvalid = useMemo(() => {
    const hasMissingDetails = selectedLeaveType?.hasDetails && !formData.leaveDetails;
    return (
      !formData.leaveType ||
      hasMissingDetails ||
      !formData.startDate ||
      !formData.endDate ||
      !formData.reason.trim() ||
      !formData.days ||
      parseInt(formData.days) <= 0 ||
      !currentUser.signature
    );
  }, [currentUser.signature, formData, selectedLeaveType?.hasDetails]);

  return (
    <AppModal
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Application for Leave"
      description="Civil Service Form No. 6 (Revised 2020)"
      className="sm:max-w-4xl"
      footer={(
        <>
          <Button
            type="button"
            variant="secondary"
            className="min-w-[140px]"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="leave-application-form"
            className="min-w-[180px]"
            disabled={isFormInvalid || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Application'
            )}
          </Button>
        </>
      )}
    >
        {/* Header */}
        <form id="leave-application-form" onSubmit={handleSubmit} className="space-y-6">
          {/* Header Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-gray-900">Republic of the Philippines</p>
              <p className="text-sm font-semibold text-gray-900">DEPARTMENT OF ENVIRONMENT AND NATURAL RESOURCES</p>
              <p className="text-sm text-gray-700">Provincial Environment and Natural Resources Office</p>
              <p className="text-sm text-gray-700">PENR-Zamboanga del Sur</p>
            </div>
          </div>

          {/* Section 1: Office/Department & Personal Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                1. Office/Department
              </label>
              <input
                type="text"
                value={formData.office}
                onChange={(e) => handleChange('office', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                2. Name (Last, First, Middle)
              </label>
              <input
                type="text"
                value={`${formData.lastName}, ${formData.firstName} ${formData.middleName}`}
                readOnly
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                3. Date of Filing
              </label>
              <input
                type="date"
                value={formData.dateOfFiling}
                onChange={(e) => handleChange('dateOfFiling', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                4. Position
              </label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => handleChange('position', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                5. Salary (Monthly PHP)
              </label>
              <input
                type="text"
                value={formData.salary}
                onChange={(e) => handleChange('salary', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="e.g., 25,000"
              />
            </div>
          </div>

          {/* Section 6.A: Type of Leave */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">6.A TYPE OF LEAVE TO BE AVAILED OF</h3>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {leaveTypes.map((type) => (
                <label key={type.value} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="radio"
                    name="leaveType"
                    value={type.value}
                    checked={formData.leaveType === type.value}
                    onChange={(e) => {
                      handleChange('leaveType', e.target.value);
                      handleChange('leaveDetails', '');
                    }}
                    className="mt-1"
                  />
                  <span className="text-sm text-gray-700">{type.label}</span>
                </label>
              ))}
            </div>
            {formData.leaveType === 'Other' && (
              <input
                type="text"
                value={formData.otherLeaveType}
                onChange={(e) => handleChange('otherLeaveType', e.target.value)}
                placeholder="Specify other leave type"
                className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            )}
            {errors.leaveType && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.leaveType}
              </p>
            )}
          </div>

          {/* Section 6.B: Details of Leave */}
          {selectedLeaveType?.hasDetails && (
            <div className="border border-gray-300 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">6.B DETAILS OF LEAVE</h3>
              <div className="space-y-2">
                {formData.leaveType === 'Vacation Leave' && vacationLeaveDetails.map((detail) => (
                  <label key={detail} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      name="leaveDetails"
                      value={detail}
                      checked={formData.leaveDetails === detail}
                      onChange={(e) => handleChange('leaveDetails', e.target.value)}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-700">{detail}</span>
                  </label>
                ))}
                {formData.leaveType === 'Sick Leave' && sickLeaveDetails.map((detail) => (
                  <label key={detail} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      name="leaveDetails"
                      value={detail}
                      checked={formData.leaveDetails === detail}
                      onChange={(e) => handleChange('leaveDetails', e.target.value)}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-700">{detail}</span>
                  </label>
                ))}
                {formData.leaveType === 'Special Leave Benefits for Women' && specialLeaveDetails.map((detail) => (
                  <label key={detail} className="flex items-start gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                    <input
                      type="radio"
                      name="leaveDetails"
                      value={detail}
                      checked={formData.leaveDetails === detail}
                      onChange={(e) => handleChange('leaveDetails', e.target.value)}
                      className="mt-1"
                    />
                    <span className="text-sm text-gray-700">{detail}</span>
                  </label>
                ))}
                
                {(formData.leaveDetails.includes('Specify') || formData.leaveType === 'Special Leave Benefits for Women') && (
                  <input
                    type="text"
                    value={formData.leaveDetailsSpecify}
                    onChange={(e) => handleChange('leaveDetailsSpecify', e.target.value)}
                    placeholder="Please specify"
                    className="w-full mt-2 border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                )}
              </div>
              {errors.leaveDetails && (
                <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.leaveDetails}
                </p>
              )}
            </div>
          )}

          {/* Section 6.C: Number of Working Days */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">6.C NUMBER OF WORKING DAYS APPLIED FOR</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className={`w-full border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                />
                {errors.startDate && <p className="text-xs text-red-600 mt-1">{errors.startDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className={`w-full border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                />
                {errors.endDate && <p className="text-xs text-red-600 mt-1">{errors.endDate}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Days *
                </label>
                <input
                  type="number"
                  value={formData.days}
                  min="1"
                  readOnly
                  className={`w-full border ${errors.days ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
                />
                {errors.days && <p className="text-xs text-red-600 mt-1">{errors.days}</p>}
              </div>
            </div>
          </div>

          {/* Section 6.D: Commutation */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">6.D COMMUTATION</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="commutation"
                  value="Not Requested"
                  checked={formData.commutation === 'Not Requested'}
                  onChange={(e) => handleChange('commutation', e.target.value)}
                />
                <span className="text-sm text-gray-700">Not Requested</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="commutation"
                  value="Requested"
                  checked={formData.commutation === 'Requested'}
                  onChange={(e) => handleChange('commutation', e.target.value)}
                />
                <span className="text-sm text-gray-700">Requested</span>
              </label>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason for Leave *
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              rows={3}
              className={`w-full border ${errors.reason ? 'border-red-500' : 'border-gray-300'} rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none`}
              placeholder="Enter the reason for your leave application"
            />
            {errors.reason && (
              <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.reason}
              </p>
            )}
          </div>

          {/* Signature Notice */}
          <div className={`p-4 rounded-lg border ${currentUser.signature ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
            {currentUser.signature ? (
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 mb-1">✓ Your signature will be attached to this application</p>
                  <p className="text-xs text-green-700">The application will be signed with your uploaded signature</p>
                </div>
                <img src={currentUser.signature} alt="Signature" className="h-12 border border-green-300 rounded bg-white p-1" />
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900">Signature Required</p>
                  <p className="text-xs text-yellow-700">Please upload your signature in your profile before submitting this application</p>
                </div>
              </div>
            )}
            {errors.signature && (
              <p className="text-sm text-red-600 mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {errors.signature}
              </p>
            )}
          </div>

        </form>
    </AppModal>
  );
}
