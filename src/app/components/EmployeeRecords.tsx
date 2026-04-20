import { useMemo, useState } from 'react';
import { Search, CreditCard } from 'lucide-react';
import { LeaveCard } from './LeaveCard';
import { DataTable } from './ui/data-table';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { AppModal } from './ui/app-modal';

interface EmployeeRecordsProps {
  applications: any[];
}

const MOCK_EMPLOYEES = [
  { id: 'EMP-1001', name: 'Juan Dela Cruz', email: 'juan.delacruz@denr.gov.ph', position: 'HR Officer II', department: 'Human Resources', vacationCredits: 15.245, sickCredits: 12.580 },
  { id: 'EMP-1002', name: 'Maria Santos', email: 'maria.santos@denr.gov.ph', position: 'Accountant III', department: 'Finance', vacationCredits: 10.120, sickCredits: 8.450 },
  { id: 'EMP-1003', name: 'Roberto Garcia', email: 'roberto.garcia@denr.gov.ph', position: 'EMS I', department: 'Surveys', vacationCredits: 5.000, sickCredits: 5.000 },
];

export function EmployeeRecords({ applications }: EmployeeRecordsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  const filteredEmployees = MOCK_EMPLOYEES.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = useMemo(
    () => [
      {
        id: 'employee',
        header: 'Employee',
        sortable: true,
        sortAccessor: (emp: any) => emp.name,
        cell: (emp: any) => (
          <div>
            <p className="font-medium text-foreground">{emp.name}</p>
            <p className="caption-text">{emp.id}</p>
          </div>
        ),
      },
      {
        id: 'position',
        header: 'Position',
        sortable: true,
        sortAccessor: (emp: any) => emp.position,
        cell: (emp: any) => <span className="text-muted-foreground">{emp.position}</span>,
      },
      {
        id: 'vl',
        header: 'VL Balance',
        sortable: true,
        sortAccessor: (emp: any) => emp.vacationCredits,
        cell: (emp: any) => <span className="font-semibold text-foreground">{emp.vacationCredits.toFixed(3)}</span>,
      },
      {
        id: 'sl',
        header: 'SL Balance',
        sortable: true,
        sortAccessor: (emp: any) => emp.sickCredits,
        cell: (emp: any) => <span className="font-semibold text-foreground">{emp.sickCredits.toFixed(3)}</span>,
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: (emp: any) => (
          <Button type="button" variant="secondary" size="sm" onClick={() => setSelectedEmployee(emp)}>
            <CreditCard className="h-4 w-4" />
            Manage Ledger
          </Button>
        ),
      },
    ],
    [setSelectedEmployee],
  );

  return (
    <div className="app-page">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="section-title">Employee Leave Records</h2>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search employees..."
            className="pl-9"
          />
        </div>
      </div>

      <DataTable rows={filteredEmployees} columns={columns} rowKey={(row) => row.id} emptyMessage="No matching employee records." />

      {selectedEmployee && (
        <AppModal
          open={!!selectedEmployee}
          onOpenChange={(open) => !open && setSelectedEmployee(null)}
          title="Employee Leave Card"
          description={`${selectedEmployee.name} (${selectedEmployee.id})`}
          className="sm:max-w-6xl"
        >
          <div className="rounded-lg bg-muted p-4">
            <LeaveCard employee={selectedEmployee} isEditable={true} />
          </div>
        </AppModal>
      )}
    </div>
  );
}
