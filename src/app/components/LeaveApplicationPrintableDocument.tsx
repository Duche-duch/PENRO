interface LeaveApplicationPrintableDocumentProps {
  application: any;
  documentId?: string;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: '2-digit', year: 'numeric' });
};

const formatSignatureDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

export function LeaveApplicationPrintableDocument({
  application,
  documentId = 'leave-application-print',
}: LeaveApplicationPrintableDocumentProps) {
  const denrLogoSrc = '/print%20logos/DENR.png';
  const bagongPilipinasLogoSrc = '/print%20logos/Bagong_Pilipinas_logo.png';
  const referenceNumber = application.id?.replace('LA-', 'No. ') || 'No. N/A';
  const qrPayload = encodeURIComponent(
    JSON.stringify({
      id: application.id,
      employee: application.employeeName,
      status: application.workflowStatus,
      dates: [application.startDate, application.endDate],
    }),
  );
  const qrCodeSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${qrPayload}`;
  return (
    <div
      id={documentId}
      className="mx-auto w-[210mm] bg-white text-black shadow-sm p-[10mm]"
      style={{ fontFamily: '"Times New Roman", Times, serif' }}
    >
      <div className="border-b border-black pb-3">
        <div className="grid grid-cols-[78px_1fr_110px] items-center gap-3">
          <img src={denrLogoSrc} alt="DENR logo" className="w-[76px] h-[76px] object-contain" />
          <div className="text-center leading-tight">
            <p className="text-[14px]">Republic of the Philippines</p>
            <p className="text-[16px] font-semibold tracking-wide">DEPARTMENT OF ENVIRONMENT AND NATURAL RESOURCES</p>
            <p className="text-[13px]">Regional Office No. IX</p>
            <p className="text-[12px]">PCCARDC, Balintawak, Pagadian City 7016 Zamboanga del Sur</p>
            <p className="text-[12px]">(062) 945-0970 Fax No. (062) 945-0945</p>
          </div>
          <img src={bagongPilipinasLogoSrc} alt="Bagong Pilipinas logo" className="w-[108px] h-[76px] object-contain justify-self-end" />
        </div>
        <div className="text-center mt-2">
          <h2 className="text-[28px] leading-none font-semibold tracking-wide">LEAVE APPLICATION</h2>
          <p className="text-[14px] mt-1">{referenceNumber}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-10 gap-y-1.5 text-[13px] leading-tight">
        <p><span className="font-semibold">Name:</span> {application.employeeName}</p>
        <p><span className="font-semibold">Salary:</span> Php {application.salary || '0.00'}</p>
        <p><span className="font-semibold">Position:</span> {application.position || 'N/A'}</p>
        <p><span className="font-semibold">Office Station:</span> {application.department || 'PENRO Zamboanga del Sur'}</p>
        <p><span className="font-semibold">Departure Date:</span> {formatDate(application.startDate)}</p>
        <p><span className="font-semibold">Arrival Date:</span> {formatDate(application.endDate)}</p>
        <p className="col-span-2"><span className="font-semibold">Destination:</span> {application.leaveDetails || 'As authorized'}</p>
        <p className="col-span-2"><span className="font-semibold">Purpose:</span> {application.reason}</p>
      </div>

      <div className="mt-4 border-t border-black pt-3 text-[12px] space-y-2 avoid-page-break">
        <div className="grid grid-cols-[240px_1fr] gap-3 items-end">
          <p>Per Diems/Expenses Allowed:</p>
          <div className="border-b border-black h-5" />
        </div>
        <div className="grid grid-cols-[240px_1fr] gap-3 items-end">
          <p>Assistants or Laborers Allowed:</p>
          <div className="border-b border-black h-5" />
        </div>
        <div className="grid grid-cols-[240px_1fr] gap-3 items-end">
          <p>Appropriations to be charged:</p>
          <div className="border-b border-black h-5" />
        </div>
        <div className="grid grid-cols-[240px_1fr] gap-3 items-end">
          <p>Remarks/Special instructions:</p>
          <p className="font-semibold">Submit Travel Accomplishment Report on or before {formatDate(application.endDate)}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-black pt-3 text-[12px] avoid-page-break">
        <p className="font-semibold mb-1">Certifications:</p>
        <p>
          This is to certify that the travel is necessary and is connected with the functions of the
          official/employee of this Division/Section/Unit.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-8 text-[12px] avoid-page-break">
        <div>
          <p className="font-semibold mb-2">Recommending Approval</p>
          {application.chiefSignature ? (
            <img src={application.chiefSignature} alt="Chief Signature" className="h-12 object-contain mb-1" />
          ) : (
            <div className="h-12" />
          )}
          <p className="font-semibold">Julius James M. Vela</p>
          <p>Chief, Management Services Division</p>
          <p className="text-[10px] mt-1">Electronically signed by Julius James M. Vela</p>
          <p className="text-[10px]">{formatSignatureDate(application.chiefRecommendationDate)}</p>
        </div>
        <div>
          <p className="font-semibold mb-2">Approved</p>
          {application.penrSignature ? (
            <img src={application.penrSignature} alt="PENR Signature" className="h-12 object-contain mb-1" />
          ) : (
            <div className="h-12" />
          )}
          <p className="font-semibold">George E. Laolao</p>
          <p>PENR Officer</p>
          <p className="text-[10px] mt-1">Electronically signed by George E. Laolao</p>
          <p className="text-[10px]">{formatSignatureDate(application.penrApprovalDate)}</p>
        </div>
      </div>

      <div className="mt-3 border-y border-black py-2 text-[11px] text-center leading-snug avoid-page-break">
        <p className="font-semibold">AUTHORIZATION</p>
        <p>
          I hereby authorize the Accountant to deduct the corresponding amount of the unliquidated cash advance
          from my succeeding salary for my failure to liquidate this travel within the prescribed thirty-day
          period upon return to my permanent official station.
        </p>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-8 items-end avoid-page-break">
        <div className="flex items-end gap-4">
          <img src={qrCodeSrc} alt="Leave application QR code" className="w-[90px] h-[90px] border border-black p-1" />
        </div>
        <div className="text-[12px]">
          {application.employeeSignature ? (
            <img src={application.employeeSignature} alt="Employee Signature" className="h-12 object-contain mb-1" />
          ) : (
            <div className="h-12" />
          )}
          <p className="font-semibold">{application.employeeName}</p>
          <p>{application.position || 'Employee'}</p>
          <p>Date Prepared: {formatDate(application.appliedDate)}</p>
        </div>
      </div>

      <div className="mt-4 border-t border-black pt-2 text-center text-[10px] uppercase tracking-wide avoid-page-break">
        <p>This is an official leave application approved electronically and generated from the DENR leave management system.</p>
        <p>No original signature is required.</p>
        {application.printedAt && <p>Printed: {formatSignatureDate(application.printedAt)} | Status: {application.status}</p>}
      </div>
    </div>
  );
}
