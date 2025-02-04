import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // Adjust path as needed
import { useParams } from "next/navigation";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const STUDENTS_PER_PAGE = 10;

const MonthlyAttendanceTable = ({ students }) => {
  const params =useParams();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalWorkingDays, setTotalWorkingDays] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [attendanceData, setAttendanceData] = useState(
    students.map((student) => ({
      rollNumber: student.roll_number,
      name: student.full_name,
      totalPresent: "0",
      absent: "",
      remark: "",
    }))
  );

  const totalPages = Math.ceil(students.length / STUDENTS_PER_PAGE);
  const paginatedStudents = attendanceData.slice(
    (currentPage - 1) * STUDENTS_PER_PAGE,
    currentPage * STUDENTS_PER_PAGE
  );

  const handleInputChange = (index, field, value) => {
    const updatedData = [...attendanceData];

    if (field === "totalPresent") {
      if (value === "") {
        updatedData[index].totalPresent = "";
        updatedData[index].absent = "";
      } else {
        const presentValue = Math.max(0, Math.min(totalWorkingDays, Number(value)));
        updatedData[index].totalPresent = presentValue;
        updatedData[index].absent = totalWorkingDays - presentValue;
      }
    } else {
      updatedData[index][field] = value;
    }

    setAttendanceData(updatedData);
  };

  const fetchRecords = async (start_date, end_date) => {
    try {
      const response = await fetch(`/api/faculty/attendance/monthly?faculty_course_id=${params.courseId}&start_date=${start_date}&end_date=${end_date}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch attendance records");
      }
  
      const updatedData = data.attendance.map((record) => ({
        rollNumber: record.roll_number,
        name: record.full_name,
        totalPresent: record.present_count,
        absent: record.total_classes - record.present_count,
        remark: record.remark || "",
        total_classes: record.total_classes,
      }));
      setTotalWorkingDays(updatedData[0].total_classes);

      setAttendanceData(updatedData);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
      // toast.error("Failed to fetch attendance records. Please try again.");
    }
  };
  
  useEffect(() => {
    if(startDate && endDate){
      fetchRecords(startDate, endDate);
    }
  },[startDate,endDate]);


  const handleSave = async () => {
    if (!startDate || !endDate || !totalWorkingDays) {
      toast.error("Please provide start date, end date, and total classes held");
      return;
    }
  
    const formattedData = paginatedStudents.map((student) => ({
      roll_number: student.rollNumber,
      faculty_course_id: params.courseId,
      start_date: startDate,
      end_date: endDate,
      total_classes: totalWorkingDays,
      present_count: student.totalPresent,
      remark: student.remark || null,
      flag: 1,
    }));
  
    console.log("Final Attendance Data to be Submitted:", formattedData);
  
    try {
      const response = await fetch("/api/faculty/attendance/monthly", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          faculty_course_id: params.courseId,
          attendance: formattedData,
          start_date: startDate,
          end_date: endDate,
          total_classes: totalWorkingDays,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || "Failed to save attendance");
      }
  
      toast.success("Attendance saved successfully!");
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Failed to save attendance. Please try again.");
    }
  };
  

  return (
    <div className="border rounded-lg p-4">
      <div className="flex space-x-4 mb-4">
      <label className="block mb-1">From</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border p-2 rounded w-full"
        />
        <label className="block mb-1">To</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1">Total Classes held:</label>
        <input
          type="number"
          min="1"
          value={totalWorkingDays}
          onChange={(e) =>
            setTotalWorkingDays(e.target.value === "" ? "" : Number(e.target.value))
          }
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Table */}
      <table className="w-full border">
        <thead>
          <tr className="border-b bg-gray-100">
            <th className="p-4 text-left">Roll Number</th>
            <th className="p-4 text-left">Name</th>
            <th className="p-4 text-left">Total Present</th>
            <th className="p-4 text-left">Absent</th>
            <th className="p-4 text-left">Percentage</th>
            <th className="p-4 text-left">Remark</th>
          </tr>
        </thead>
        <tbody>
          {paginatedStudents.map((student, index) => {
            const globalIndex = (currentPage - 1) * STUDENTS_PER_PAGE + index;
            const percentage =
              totalWorkingDays > 0 && student.totalPresent !== ""
                ? ((student.totalPresent / totalWorkingDays) * 100).toFixed(2) + "%"
                : "N/A";

            return (
              <tr key={index} className="border-b">
                <td className="p-4">{student.rollNumber}</td>
                <td className="p-4">{student.name}</td>
                <td className="p-4">
                  <input
                    type="number"
                    min="0"
                    max={totalWorkingDays}
                    value={student.totalPresent}
                    onChange={(e) =>
                      handleInputChange(globalIndex, "totalPresent", e.target.value)
                    }
                    className="border p-2 rounded w-full"
                  />
                </td>
                <td className="p-4">{student.absent !== "" ? student.absent : "-"}</td>
                <td className="p-4">{percentage}</td>
                <td className="p-4">
                  <input
                    type="text"
                    maxLength="255"
                    value={student.remark}
                    onChange={(e) => handleInputChange(globalIndex, "remark", e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {students.length > STUDENTS_PER_PAGE && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      <div className="flex justify-end mt-4">
        <Button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded">
          Save Attendance
        </Button>
      </div>
    </div>
  );
};

export default MonthlyAttendanceTable;
