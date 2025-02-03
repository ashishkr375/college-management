import React from "react";
import { RadioGroup, RadioGroupItem, Label } from "@radix-ui/react-radio-group";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

const MonthlyAttendanceTable = ({ students, totalClasses }) => {
  return (
    <div className="border rounded-lg">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-4 text-left">Roll Number</th>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Total Present</th>
            <th className="p-4 text-left">Absent</th>
            <th className="p-4 text-left">Remark</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            const totalPresent = student.totalPresent;
            const absent = totalClasses - totalPresent;
            const remark = student.remark;

            return (
              <tr key={index} className="border-b">
                <td className="p-4">{student.rollNumber}</td>
                <td className="p-4">{student.name}</td>
                <td className="p-4">{totalPresent}</td>
                <td className="p-4">{absent}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    {remark === "Complete Attendance" ? (
                      <CheckCircle className="text-green-500" />
                    ) : (
                      <XCircle className="text-red-500" />
                    )}
                    <span>{remark}</span>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MonthlyAttendanceTable;
