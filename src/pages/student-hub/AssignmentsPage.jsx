import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import StudentHubHeader from '../../components/StudentHubHeader';
import { useStudent } from '../../context/StudentContext';
import { useAuth } from '../../context/AuthContext';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';
import { uploadToSupabase } from '../../utils/supabaseClient';
import { 
  ClipboardList, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  UploadCloud, 
  FileText,
  Loader2,
  ExternalLink,
  Award
} from 'lucide-react';

const AssignmentsPage = () => {
  const { profile } = useStudent();
  const { user } = useAuth();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const studentId = user?.student_id;
  const institutionId = user?.institution_id || 1;

  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');
  
  // Upload states
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({}); // mapping assignment_id -> File object
  const [submitMessage, setSubmitMessage] = useState(null);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/student-hub/assignments');
      if (!res.ok) {
        throw new Error('Failed to load assignments');
      }
      const data = await res.json();
      setAssignments(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleFileChange = (assignmentId, e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFiles(prev => ({
        ...prev,
        [assignmentId]: file
      }));
    }
  };

  const handleUploadAndSubmit = async (assignmentId) => {
    const file = selectedFiles[assignmentId];
    if (!file) return;

    try {
      setUploadingId(assignmentId);
      setSubmitMessage(null);

      // Clean filename
      const safeFilename = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
      const folderPath = `${institutionId}/${studentId}/${assignmentId}/${safeFilename}`;

      // 1. Upload to Supabase Storage
      const uploadUrl = await uploadToSupabase(file, folderPath);

      // 2. Register with FastAPI backend
      const response = await apiFetch(`/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          student_id: studentId,
          submission_url: uploadUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit assignment');
      }

      setSubmitMessage({
        type: 'success',
        text: `Assignment "${file.name}" submitted successfully!`
      });

      // Clear file selection
      setSelectedFiles(prev => {
        const copy = { ...prev };
        delete copy[assignmentId];
        return copy;
      });

      // Reload assignments to show updated state
      await fetchAssignments();
    } catch (err) {
      console.error(err);
      setSubmitMessage({
        type: 'error',
        text: err.message
      });
    } finally {
      setUploadingId(null);
    }
  };

  // Filter assignments based on tab selection
  const now = new Date();
  const filteredAssignments = assignments.filter(assign => {
    const dueDate = new Date(assign.due_date);
    const isPastDue = dueDate < now;
    const isSubmitted = assign.status === 'Submitted' || assign.status === 'Late' || assign.status === 'Graded';

    if (activeTab === 'pending') {
      return !isSubmitted && !isPastDue;
    } else if (activeTab === 'submitted') {
      return isSubmitted;
    } else if (activeTab === 'overdue') {
      return !isSubmitted && isPastDue;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <StudentHubHeader 
        title="Assignments & Submissions" 
        description="View assigned coursework tasks, monitor deadlines, and upload your files directly to the platform storage."
        showBackButton={true}
      />

      {submitMessage && (
        <div 
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between border ${
            submitMessage.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <span>{submitMessage.text}</span>
          <button onClick={() => setSubmitMessage(null)} className="text-xs opacity-70 hover:opacity-100">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-800 gap-4">
        {[
          { id: 'pending', name: 'Pending Tasks', count: assignments.filter(a => a.status === 'Pending' && new Date(a.due_date) >= now).length },
          { id: 'submitted', name: 'Submitted', count: assignments.filter(a => ['Submitted', 'Late', 'Graded'].includes(a.status)).length },
          { id: 'overdue', name: 'Overdue', count: assignments.filter(a => a.status === 'Pending' && new Date(a.due_date) < now).length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id 
                ? `${theme.text} border-current` 
                : 'text-slate-500 border-transparent hover:text-slate-300'
            }`}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-4">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-slate-400 text-xs animate-pulse">Loading assignment board...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center text-slate-500 text-sm">
          No assignments found in this section.
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAssignments.map((assign) => {
            const dueDate = new Date(assign.due_date);
            const isPastDue = dueDate < now;
            const fileSelected = selectedFiles[assign.assignment_id];
            
            return (
              <div 
                key={assign.assignment_id}
                className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all duration-300 flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                <div className="space-y-4 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-bold tracking-widest ${theme.text} ${theme.bg} border ${theme.border} px-2.5 py-0.5 rounded-md`}>
                      {assign.subject_code}
                    </span>
                    <span className="text-xs text-slate-500">{assign.subject_name}</span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-lg text-white">{assign.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{assign.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-semibold">
                    <span className="text-slate-500 flex items-center gap-1">
                      <Calendar size={13} />
                      Due: {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-slate-500 flex items-center gap-1">
                      <Award size={13} />
                      Total Marks: {assign.total_marks}
                    </span>
                    {assign.status === 'Graded' && (
                      <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Score: {assign.marks_obtained} / {assign.total_marks}
                      </span>
                    )}
                    {assign.status === 'Late' && (
                      <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle size={12} />
                        Submitted Late
                      </span>
                    )}
                    {assign.status === 'Submitted' && (
                      <span className="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Submitted
                      </span>
                    )}
                  </div>
                </div>

                {/* Submission Actions */}
                <div className="shrink-0 w-full lg:w-72 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-6 flex flex-col justify-center gap-3">
                  {['Submitted', 'Late', 'Graded'].includes(assign.status) ? (
                    <div className="space-y-3">
                      <div className="bg-slate-850 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                        <FileText className={theme.text} size={20} />
                        <div className="truncate">
                          <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider">Attached Document</span>
                          <span className="text-xs text-slate-300 font-bold truncate block">
                            {assign.submission_url ? assign.submission_url.split('/').pop() : 'Submission URL'}
                          </span>
                        </div>
                      </div>
                      {assign.submission_url && (
                        <a 
                          href={assign.submission_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          View Uploaded File
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <label className="w-full flex flex-col items-center justify-center bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-700 hover:border-slate-500 rounded-xl p-4 cursor-pointer transition-all">
                        <UploadCloud className="text-slate-500 mb-1" size={24} />
                        <span className="text-xs font-bold text-slate-400">
                          {fileSelected ? fileSelected.name : 'Select Submission File'}
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">PDF, DOCX, ZIP etc.</span>
                        <input 
                          type="file" 
                          className="hidden" 
                          onChange={(e) => handleFileChange(assign.assignment_id, e)} 
                        />
                      </label>

                      {fileSelected && (
                        <button
                          disabled={uploadingId === assign.assignment_id}
                          onClick={() => handleUploadAndSubmit(assign.assignment_id)}
                          className={`w-full ${theme.accent} hover:opacity-90 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer`}
                        >
                          {uploadingId === assign.assignment_id ? (
                            <>
                              <Loader2 size={14} className="animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            'Submit Coursework'
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssignmentsPage;
