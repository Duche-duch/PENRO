import { CheckCircle, Printer } from 'lucide-react';
import { AppModal } from './ui/app-modal';
import { Button } from './ui/button';

type ApplicationDetailsModalProps = {
  application: any;
  onClose: () => void;
  onPrint?: () => void;
};

export function ApplicationDetailsModal({
  application,
  onClose,
  onPrint,
}: ApplicationDetailsModalProps) {
  const canPrint =
    application.workflowStatus === 'approved' ||
    application.workflowStatus === 'ready_to_print' ||
    application.status === 'ready_to_print' ||
    application.status === 'approved';

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

  return (
    <AppModal
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Application Details"
      description={application.id}
      className="sm:max-w-2xl"
      footer={(
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close View
          </Button>
          {onPrint && (
            <Button
              type="button"
              onClick={onPrint}
              disabled={!canPrint}
              title={!canPrint ? 'Document must be approved before printing' : undefined}
            >
              <Printer className="w-4 h-4" />
              Preview Leave Application
            </Button>
          )}
        </>
      )}
    >
          <div className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  Leave Profile
                </h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-500">Type of Leave</p>
                    <p className="font-bold text-gray-900">{application.leaveType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Number of Days</p>
                    <p className="font-bold text-gray-900">
                      {application.days} working days
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Inclusive Dates</p>
                    <p className="font-bold text-gray-900">
                      {formatDate(application.startDate)} - {formatDate(application.endDate)}
                    </p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  Workflow Status
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        application.hrSignature ? 'bg-green-500' : 'bg-yellow-400'
                      }`}
                    />
                    <p className="text-sm font-medium">
                      HR Review: {application.hrSignature ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        application.chiefSignature ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <p className="text-sm font-medium text-gray-600">
                      Chief Recommendation:{' '}
                      {application.chiefSignature ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        application.penrSignature ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    />
                    <p className="text-sm font-medium text-gray-600">
                      PENR Approval: {application.penrSignature ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
              </section>
            </div>

            <section className="bg-gray-50 p-4 rounded-lg border border-gray-100">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                Reason / Details
              </h3>
              <p className="text-sm text-gray-700 italic leading-relaxed">
                "{application.reason}"
              </p>
              {application.leaveDetails && (
                <p className="text-xs text-gray-500 mt-2">
                  Location/Details: {application.leaveDetails}
                </p>
              )}
            </section>

            {application.workflowStatus === 'approved' && (
              <div className="p-4 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <p className="text-sm font-bold text-green-800">
                    Application Fully Approved
                  </p>
                  <p className="text-xs text-green-700">
                    You may now proceed with your leave on the specified dates.
                  </p>
                </div>
              </div>
            )}
          </div>

    </AppModal>
  );
}

