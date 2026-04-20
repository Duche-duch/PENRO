import { Download, Eye, Printer } from 'lucide-react';
import { AppModal } from './ui/app-modal';
import { Button } from './ui/button';
import { LeaveApplicationPrintableDocument } from './LeaveApplicationPrintableDocument';

interface PrintLeaveFormProps {
  application: any;
  onClose: () => void;
}

const canPrintApplication = (application: any) =>
  application.workflowStatus === 'approved' ||
  application.workflowStatus === 'ready_to_print' ||
  application.status === 'approved' ||
  application.status === 'ready_to_print';

const getPrintRoute = (applicationId: string) =>
  `${window.location.origin}/print/leave-application/${encodeURIComponent(applicationId)}`;

export function PrintLeaveForm({ application, onClose }: PrintLeaveFormProps) {
  if (!application) {
    return null;
  }

  const canOutput = canPrintApplication(application);

  const openPrintView = () => {
    if (!canOutput) return;
    const route = getPrintRoute(application.id);
    window.open(route, '_blank', 'noopener,noreferrer');
  };

  const handlePreview = () => {
    document.getElementById('leave-application-print')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <AppModal
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      title="Leave Application Preview"
      description="Official printable document"
      size="xl"
      footer={(
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button type="button" variant="secondary" onClick={handlePreview} disabled={!canOutput}>
            <Eye className="w-4 h-4" />
            Preview Leave Application
          </Button>
          <Button type="button" onClick={openPrintView} disabled={!canOutput} title={!canOutput ? 'Document must be approved before printing' : undefined}>
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button type="button" onClick={openPrintView} disabled={!canOutput} title={!canOutput ? 'Document must be approved before printing' : undefined}>
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </>
      )}
    >
        <div className="p-4 md:p-6 bg-neutral-100 rounded-lg">
          <LeaveApplicationPrintableDocument application={application} />
          {!canOutput && (
            <p className="mt-3 text-xs text-red-700">
              Leave application output is only available when status is Approved or Ready to Print.
            </p>
          )}
        </div>

      <style>{`
        .print-only-note {
          display: none;
        }
      `}</style>
    </AppModal>
  );
}
