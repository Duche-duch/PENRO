import { Wallet, TrendingDown } from 'lucide-react';

interface Employee {
  employeeId: string;
  employeeName: string;
  department: string;
  position: string;
  vacationLeaveCredits: number;
  sickLeaveCredits: number;
  emergencyLeaveCredits: number;
  totalCredits: number;
}

interface CreditTransaction {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: string;
  days: number;
  date: string;
  applicationId: string;
  previousBalance: number;
  newBalance: number;
}

interface EmployeeCreditsPanelProps {
  applications: any[];
}

export function EmployeeCreditsPanel({ applications }: EmployeeCreditsPanelProps) {
  // Generate employee credits from applications
  const employeeMap = new Map<string, Employee>();

  applications.forEach(app => {
    if (!employeeMap.has(app.employeeId)) {
      employeeMap.set(app.employeeId, {
        employeeId: app.employeeId,
        employeeName: app.employeeName,
        department: app.department,
        position: app.position,
        vacationLeaveCredits: 15,
        sickLeaveCredits: 15,
        emergencyLeaveCredits: 5,
        totalCredits: app.currentCredits
      });
    }
  });

  const employees = Array.from(employeeMap.values());

  // Generate credit transactions from approved applications
  const creditTransactions: CreditTransaction[] = applications
    .filter(app => app.status === 'approved' && app.approvedDate)
    .map(app => ({
      id: `TX-${app.id}`,
      employeeId: app.employeeId,
      employeeName: app.employeeName,
      leaveType: app.leaveType,
      days: app.days,
      date: app.approvedDate,
      applicationId: app.id,
      previousBalance: app.currentCredits + app.days,
      newBalance: app.currentCredits
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getCreditStatus = (credits: number) => {
    if (credits >= 10) return 'text-green-600';
    if (credits >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Employee Leave Credits Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Employee Leave Credits</h2>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vacation Leave
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sick Leave
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emergency Leave
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Available
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee.employeeId} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{employee.employeeName}</div>
                    <div className="text-xs text-gray-500">{employee.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{employee.department}</div>
                    <div className="text-xs text-gray-500">{employee.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getCreditStatus(employee.vacationLeaveCredits)}`}>
                      {employee.vacationLeaveCredits} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getCreditStatus(employee.sickLeaveCredits)}`}>
                      {employee.sickLeaveCredits} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getCreditStatus(employee.emergencyLeaveCredits)}`}>
                      {employee.emergencyLeaveCredits} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-bold ${getCreditStatus(employee.totalCredits)}`}>
                      {employee.totalCredits} days
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {employees.length === 0 && (
          <div className="px-6 py-12 text-center">
            <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No employee data available</p>
          </div>
        )}
      </div>

      {/* Credit Deduction History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            <h2 className="text-lg font-semibold text-gray-900">Credit Deduction History</h2>
          </div>
          <p className="text-sm text-gray-600 mt-1">Recent credit deductions from approved leave applications</p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Deducted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Previous Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  New Balance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {creditTransactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.id}</div>
                    <div className="text-xs text-gray-500">App: {transaction.applicationId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{transaction.employeeName}</div>
                    <div className="text-xs text-gray-500">{transaction.employeeId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.leaveType}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-red-600">-{transaction.days} days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{transaction.previousBalance} days</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getCreditStatus(transaction.newBalance)}`}>
                      {transaction.newBalance} days
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(transaction.date)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {creditTransactions.length === 0 && (
          <div className="px-6 py-12 text-center">
            <TrendingDown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No credit deductions yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
