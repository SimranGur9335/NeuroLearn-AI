import React, { useEffect, useState } from 'react';
import { saveAs } from "file-saver";
import { motion } from 'framer-motion';
import {
  FileSpreadsheet,
  Search,
  Download,
  Check,
  X,
  Sparkles,
  Award
} from 'lucide-react';

const AttendanceTracking = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const selectedClass = JSON.parse(localStorage.getItem("selectedClass") || "{}");
  const [summary, setSummary] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [registryData, setRegistryData] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});



  useEffect(() => {

    if (!selectedClass.class_id) return;

    fetch(
      `http://127.0.0.1:8000/class/${selectedClass.class_id}/students`
    )
      .then((res) => res.json())
      .then((data) => {

        setStudents(data);

        const initialStatus = {};

        data.forEach((student) => {
          initialStatus[student.student_id] = "Present";
        });

        setAttendanceStatus(initialStatus);

      })
      .catch((err) => console.error(err));

    fetch(
      `http://127.0.0.1:8000/class/${selectedClass.class_id}/attendance-summary`
    )
      .then((res) => res.json())
      .then((data) => setSummary(data))
      .catch((err) => console.error(err));

    fetch(
      `http://127.0.0.1:8000/class/${selectedClass.class_id}/attendance`
    )
      .then((res) => res.json())
      .then((data) => setAttendanceData(data))
      .catch((err) => console.error(err));

    fetch(
      `http://127.0.0.1:8000/class/${selectedClass.class_id}/attendance-registry`
    )
      .then((res) => res.json())
      .then((data) => setRegistryData(data))
      .catch((err) => console.error(err));

  }, [selectedClass.class_id]);

  console.log(summary);
  console.log(attendanceData);
  console.log(registryData);


  const loadAttendanceData = async () => {

    const summaryRes = await fetch(
      `http://127.0.0.1:8000/class/${selectedClass.class_id}/attendance-summary`
    );

    const summaryData = await summaryRes.json();
    setSummary(summaryData);

    const registryRes = await fetch(
      `http://127.0.0.1:8000/class/${selectedClass.class_id}/attendance-registry`
    );

    const registry = await registryRes.json();
    setRegistryData(registry);

  };

  const handleExport = (type) => {
    alert(
      `Export Format: ${type.toUpperCase()}
Records Count: ${filteredRegistry.length} Students`
    );
  };
  const exportCSV = () => {

  const headers = [
    "Roll No",
    "Student Name",
    "Attendance %",
    "Present",
    "Absent",
    "Late"
  ];

  const rows = registryData.map(student => [
    student.roll_no,
    student.full_name,
    student.attendance_percentage,
    student.present_count,
    student.absent_count,
    student.late_count
  ]);

  const csvContent = [
    headers,
    ...rows
  ]
    .map(row => row.join(","))
    .join("\n");

  const blob = new Blob(
    [csvContent],
    {
      type: "text/csv;charset=utf-8;"
    }
  );

  saveAs(
    blob,
    `attendance_registry_class_${selectedClass.class_id}.csv`
  );

};

  // Seeded mock monthly logs grid (P/A statuses for last 5 days)
  const filteredRegistry = registryData.filter(student =>
    student.full_name
      .toLowerCase()
      .includes(searchTerm.toLowerCase()) ||

    student.roll_no
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );
  const saveAttendance = async () => {

    try {

      for (const studentId in attendanceStatus) {

        await fetch(
          "http://127.0.0.1:8000/attendance/mark",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              student_id: Number(studentId),
              class_id: selectedClass.class_id,
              attendance_date: new Date().toISOString().split("T")[0],
              status: attendanceStatus[studentId]
            })
          }
        );

      }

      alert("Attendance Saved Successfully");
      await loadAttendanceData();

    } catch (err) {

      console.error(err);

      alert("Failed To Save Attendance");

    }

  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Intro Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-purple-650 font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Registry Audits</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Attendance & Curriculum Progress Registry</h2>
          <p className="text-slate-500 text-xs mt-1">
            Access logs of student lecture attendance, monthly completion indicators, and download official college records.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex gap-2 shrink-0">
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-250 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-emerald-500" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md cursor-pointer"
          >
            <Download size={14} />
            Export PDF Report
          </button>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-3 py-2 rounded-xl w-full md:w-80 focus-within:ring-2 focus-within:ring-purple-500/50">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Search student roll, name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-slate-700 dark:text-slate-250 placeholder-slate-400 focus:outline-none w-full text-xs"
          />
        </div>

        <div className="grid grid-cols-4 gap-4">

          <div className="bg-white p-4 rounded-xl">
            Total: {summary?.total_records}
          </div>

          <div className="bg-white p-4 rounded-xl">
            Present: {summary?.present_count}
          </div>

          <div className="bg-white p-4 rounded-xl">
            Absent: {summary?.absent_count}
          </div>

          <div className="bg-white p-4 rounded-xl">
            Late: {summary?.late_count}
          </div>

        </div>


      </div>
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">

        <h3 className="text-xl font-bold text-white mb-5">
          Today's Attendance
        </h3>

        <div className="space-y-3">

          {students.map((student) => (

            <div
              key={student.student_id}
              className="flex justify-between items-center border-b border-slate-800 pb-3"
            >

              <div>
                <p className="text-white font-semibold">
                  {student.full_name}
                </p>

                <p className="text-slate-400 text-sm">
                  {student.roll_no}
                </p>
              </div>

              <select
                value={attendanceStatus[student.student_id] || "Present"}
                onChange={(e) =>
                  setAttendanceStatus({
                    ...attendanceStatus,
                    [student.student_id]: e.target.value
                  })
                }
                className="bg-slate-800 text-white px-3 py-2 rounded-lg"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Late">Late</option>
              </select>


            </div>

          ))}

        </div>
        <div className="mt-6 flex justify-end">

          <button
            onClick={saveAttendance}
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-xl font-semibold"
          >
            Save Attendance
          </button>

        </div>

      </div>
      {/* Attendance Spreadsheet Grid Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm text-white">
            <thead className="bg-slate-800 text-purple-300">
              <tr>
                <th>Roll No</th>
                <th>Student</th>
                <th>Attendance %</th>
                <th>Present</th>
                <th>Absent</th>
                <th>Late</th>
              </tr>
            </thead>
            <tbody>

              {filteredRegistry.map((student) => (

                <tr
                  key={student.student_id}
                  className="border-b border-slate-700 hover:bg-slate-800"
                >

                  <td className="p-4">{student.roll_no}</td>

                  <td className="p-4">{student.full_name}</td>

                  <td className="p-4">{student.attendance_percentage}%</td>

                  <td className="p-4">{student.present_count}</td>

                  <td className="p-4">{student.absent_count}</td>

                  <td className="p-4">{student.late_count}</td>

                </tr>

              ))}

            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default AttendanceTracking;
