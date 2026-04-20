import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { LeaveApplicationPrintableDocument } from './LeaveApplicationPrintableDocument';
import { fetchRecord, updateRecord } from '../../lib/api';

function canPrintApplication(application: any) {
  return (
    application?.workflowStatus === 'approved' ||
    application?.workflowStatus === 'ready_to_print' ||
    application?.status === 'approved' ||
    application?.status === 'ready_to_print'
  );
}

export function LeaveApplicationPrintPage() {
  const applicationId = useMemo(() => window.location.pathname.split('/').pop() || '', []);
  const [application, setApplication] = useState<any>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [autoPrintTried, setAutoPrintTried] = useState(false);
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const found = await fetchRecord(applicationId);
        if (cancelled) return;
        setApplication(found);
      } catch {
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  const logPrinted = async (id: string, app: any) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
      const now = new Date().toISOString();
      const existingLogs = Array.isArray(app.printLogs) ? app.printLogs : [];
      const updated = {
        ...app,
        status: 'printed',
        printedAt: now,
        printedBy: currentUser?.name || 'System User',
        printLogs: [...existingLogs, { action: 'print', at: now, by: currentUser?.name || 'System User' }],
      };
      await updateRecord(id, updated);
    } catch {
      // Keep UX flowing even if audit write fails
    }
  };

  useEffect(() => {
    const handleAfterPrint = () => {
      if (!hasLoggedRef.current && applicationId && application) {
        hasLoggedRef.current = true;
        void logPrinted(applicationId, application);
      }
      setTimeout(() => window.close(), 150);
      setTimeout(() => {
        if (!window.closed) {
          window.location.href = '/';
        }
      }, 350);
    };

    window.addEventListener('afterprint', handleAfterPrint);
    return () => window.removeEventListener('afterprint', handleAfterPrint);
  }, [applicationId, application]);

  useEffect(() => {
    if (!application || !canPrintApplication(application) || autoPrintTried) return;
    const timer = window.setTimeout(() => {
      setAutoPrintTried(true);
      window.print();
    }, 450);
    return () => window.clearTimeout(timer);
  }, [application, autoPrintTried]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        <p className="text-sm text-gray-700">Loading leave application…</p>
      </div>
    );
  }

  if (loadError || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-sm text-gray-700">
          Leave application not found. Sign in and open print from the app, or verify the record id.
        </p>
      </div>
    );
  }

  if (!canPrintApplication(application)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <p className="text-sm text-gray-700">Document must be approved before printing.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-2 sm:p-4">
      <div className="print:hidden flex justify-end mb-3">
        <Button type="button" onClick={() => window.print()}>
          Print
        </Button>
      </div>
      <LeaveApplicationPrintableDocument application={application} />

      <style>{`
        @page {
          size: A4 portrait;
          margin: 10mm;
        }
        @media print {
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            background: #fff !important;
          }
          body * {
            visibility: hidden;
          }
          #leave-application-print,
          #leave-application-print * {
            visibility: visible;
          }
          #leave-application-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 190mm;
            margin: 0 auto;
            box-shadow: none !important;
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .avoid-page-break {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
}
