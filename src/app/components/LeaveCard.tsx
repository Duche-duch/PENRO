import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Plus, Trash2, Save, Printer } from "lucide-react";

interface LeaveEntry {
  id: string;
  period: string;
  particulars: string;
  vl_earned: number;
  vl_abs_und_w_pay: number;
  vl_balance: number;
  vl_abs_und_wo_pay: number;
  sl_earned: number;
  sl_abs_und_w_pay: number;
  sl_balance: number;
  sl_abs_und_wo_pay: number;
  remarks: string;
}

interface LeaveCardProps {
  employee: any;
  isEditable?: boolean;
}

export function LeaveCard({ employee, isEditable = false }: LeaveCardProps) {
  const [entries, setEntries] = useState<LeaveEntry[]>([
    {
      id: "1",
      period: "January 2026",
      particulars: "Monthly Earned",
      vl_earned: 1.250,
      vl_abs_und_w_pay: 0,
      vl_balance: employee.vacationCredits || 15.000,
      vl_abs_und_wo_pay: 0,
      sl_earned: 1.250,
      sl_abs_und_w_pay: 0,
      sl_balance: employee.sickCredits || 15.000,
      sl_abs_und_wo_pay: 0,
      remarks: "Default Entry"
    }
  ]);

  const addEntry = () => {
    const lastEntry = entries[entries.length - 1];
    const newEntry: LeaveEntry = {
      id: Math.random().toString(36).substr(2, 9),
      period: "",
      particulars: "",
      vl_earned: 0,
      vl_abs_und_w_pay: 0,
      vl_balance: lastEntry.vl_balance,
      vl_abs_und_wo_pay: 0,
      sl_earned: 0,
      sl_abs_und_w_pay: 0,
      sl_balance: lastEntry.sl_balance,
      sl_abs_und_wo_pay: 0,
      remarks: ""
    };
    setEntries([...entries, newEntry]);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 uppercase">Employee Leave Card</h2>
          <p className="text-sm text-gray-500">Official Ledger for {employee.name}</p>
        </div>
        <div className="flex gap-2">
          {isEditable && (
            <Button onClick={addEntry} variant="outline" size="sm" className="flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Row
            </Button>
          )}
          <Button variant="secondary" size="sm" className="flex items-center gap-1">
            <Printer className="w-4 h-4" /> Print Ledger
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100">
              <TableHead rowSpan={2} className="border-r text-center font-bold text-[10px]">PERIOD</TableHead>
              <TableHead rowSpan={2} className="border-r text-center font-bold text-[10px]">PARTICULARS</TableHead>
              <TableHead colSpan={4} className="border-r text-center font-bold text-[10px] bg-blue-50">VACATION LEAVE</TableHead>
              <TableHead colSpan={4} className="border-r text-center font-bold text-[10px] bg-green-50">SICK LEAVE</TableHead>
              <TableHead rowSpan={2} className="text-center font-bold text-[10px]">REMARKS</TableHead>
              {isEditable && <TableHead rowSpan={2} className="w-10"></TableHead>}
            </TableRow>
            <TableRow className="bg-gray-100">
              <TableHead className="border-r text-[9px] text-center p-1">Earned</TableHead>
              <TableHead className="border-r text-[9px] text-center p-1">Abs. w/ Pay</TableHead>
              <TableHead className="border-r text-[9px] text-center p-1">Balance</TableHead>
              <TableHead className="border-r text-[9px] text-center p-1">Abs. wo/ Pay</TableHead>
              <TableHead className="border-r text-[9px] text-center p-1">Earned</TableHead>
              <TableHead className="border-r text-[9px] text-center p-1">Abs. w/ Pay</TableHead>
              <TableHead className="border-r text-[9px] text-center p-1">Balance</TableHead>
              <TableHead className="border-r text-[9px] text-center p-1">Abs. wo/ Pay</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id} className="hover:bg-gray-50 font-mono text-[11px]">
                <TableCell className="border-r p-1">{isEditable ? <Input variant="ghost" className="h-7 text-[11px] p-1" defaultValue={entry.period} /> : entry.period}</TableCell>
                <TableCell className="border-r p-1">{isEditable ? <Input variant="ghost" className="h-7 text-[11px] p-1" defaultValue={entry.particulars} /> : entry.particulars}</TableCell>
                <TableCell className="border-r p-1 text-center">{entry.vl_earned.toFixed(3)}</TableCell>
                <TableCell className="border-r p-1 text-center">{entry.vl_abs_und_w_pay.toFixed(3)}</TableCell>
                <TableCell className="border-r p-1 text-center font-bold text-blue-700">{entry.vl_balance.toFixed(3)}</TableCell>
                <TableCell className="border-r p-1 text-center">{entry.vl_abs_und_wo_pay.toFixed(3)}</TableCell>
                <TableCell className="border-r p-1 text-center">{entry.sl_earned.toFixed(3)}</TableCell>
                <TableCell className="border-r p-1 text-center">{entry.sl_abs_und_w_pay.toFixed(3)}</TableCell>
                <TableCell className="border-r p-1 text-center font-bold text-green-700">{entry.sl_balance.toFixed(3)}</TableCell>
                <TableCell className="border-r p-1 text-center">{entry.sl_abs_und_wo_pay.toFixed(3)}</TableCell>
                <TableCell className="p-1">{entry.remarks}</TableCell>
                {isEditable && (
                  <TableCell className="p-1">
                    <button onClick={() => deleteEntry(entry.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3 h-3" /></button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
