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
  Award,
  FileDown,
  Link,
  MessageSquare,
  Sparkles,
  Bookmark
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

  // Upload and submission states
  const [uploadingId, setUploadingId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({}); // mapping assignment_id -> File object
  const [externalUrls, setExternalUrls] = useState({}); // mapping assignment_id -> string
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

  const handleExternalUrlChange = (assignmentId, val) => {
    setExternalUrls(prev => ({
      ...prev,
      [assignmentId]: val
    }));
  };

  const handleUploadAndSubmit = async (assignmentId) => {
    const file = selectedFiles[assignmentId];
    const externalUrl = externalUrls[assignmentId] || '';

    if (!file && !externalUrl.trim()) {
      setSubmitMessage({
        type: 'error',
        text: 'Please select a submission file or enter an external deliverable URL.'
      });
      return;
    }

    try {
      setUploadingId(assignmentId);
      setSubmitMessage(null);

      let uploadUrl = '';
      if (file) {
        // Clean filename
        const safeFilename = file.name.replace(/[^a-zA-Z0-9_.-]/g, '_');
        const folderPath = `${institutionId}/${studentId}/${assignmentId}/${safeFilename}`;

        // 1. Upload to Supabase Storage
        uploadUrl = await uploadToSupabase(file, folderPath);
      }

      // 2. Register with FastAPI backend
      const response = await apiFetch(`/assignments/${assignmentId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          student_id: studentId,
          submission_url: uploadUrl || null,
          submission_file_name: file ? file.name : null,
          submission_file_size: file ? file.size : null,
          external_url: externalUrl.trim() ? externalUrl.trim() : null
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to submit assignment');
      }

      setSubmitMessage({
        type: 'success',
        text: file
          ? `Assignment "${file.name}" submitted successfully!`
          : 'Assignment external link registered successfully!'
      });

      // Clear selections
      setSelectedFiles(prev => {
        const copy = { ...prev };
        delete copy[assignmentId];
        return copy;
      });
      setExternalUrls(prev => {
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

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  // Filter assignments based on tab selection
  const now = new Date();
  const filteredAssignments = assignments.filter(assign => {
    const dueDate = new Date(assign.due_date);
    const isPastDue = dueDate < now;
    const isSubmitted = ['Submitted', 'Late', 'Graded'].includes(assign.status);

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
        title="Coursework Assignments"
        description="View coursework tasks, access resources, download rubrics, and upload your files directly to your storage locker."
        showBackButton={true}
      />

      {submitMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between border ${submitMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
        >
          <span>{submitMessage.text}</span>
          <button onClick={() => setSubmitMessage(null)} className="text-xs opacity-70 hover:opacity-100 cursor-pointer">Dismiss</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-4">
        {[
          { id: 'pending', name: 'Pending Tasks', count: assignments.filter(a => a.status === 'Pending' && new Date(a.due_date) >= now).length },
          { id: 'submitted', name: 'Submitted', count: assignments.filter(a => ['Submitted', 'Late', 'Graded'].includes(a.status)).length },
          { id: 'overdue', name: 'Overdue', count: assignments.filter(a => a.status === 'Pending' && new Date(a.due_date) < now).length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${activeTab === tab.id
                ? `${theme.text} border-current`
                : 'text-slate-500 border-transparent hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            {tab.name} ({tab.count})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-4">
          <div className="w-8 h-8 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-slate-500 dark:text-slate-400 text-xs animate-pulse">Loading coursework deliverables...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400 text-sm font-semibold">
          {error}
        </div>
      ) : filteredAssignments.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 p-12 rounded-2xl text-center text-slate-500 dark:text-slate-400 text-sm font-semibold">
          No assignments registered in this section. Good job!
        </div>
      ) : (
        <div className="space-y-6">
          {filteredAssignments.map((assign) => {
            const dueDate = new Date(`${assign.due_date}`);
            const isPastDue = dueDate < now;
            const fileSelected = selectedFiles[assign.assignment_id];

            return (
              <div
                key={assign.assignment_id}
                className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-indigo-500/30 hover:shadow-md transition-all duration-300 flex flex-col lg:flex-row lg:items-stretch justify-between gap-6"
              >
                {/* Left side details */}
                <div className="flex-1 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-[9px] uppercase font-black tracking-widest ${theme.text} ${theme.bg} border ${theme.border} px-2.5 py-0.5 rounded-md`}>
                      {assign.subject_code}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">{assign.subject_name}</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold ml-auto sm:ml-0">
                      Assigned by: {assign.faculty_name || 'Faculty'}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{assign.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{assign.description}</p>
                  </div>

                  {/* Supporting Material Card */}
                  {assign.attachment_url && (
                    <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3.5 rounded-xl flex items-center justify-between max-w-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-100 dark:bg-slate-900 rounded-lg text-indigo-600 dark:text-indigo-400">
                          <FileText size={18} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{assign.attachment_name || 'Resources Material'}</p>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider mt-0.5">
                            {assign.attachment_type || 'DOC'} • {assign.attachment_size ? formatBytes(assign.attachment_size) : 'Download'}
                          </p>
                        </div>
                      </div>
                      <a
                        href={assign.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
                        title="Download supporting material"
                      >
                        <FileDown size={14} />
                      </a>
                    </div>
                  )}

                  {/* Instructions Box */}
                  {assign.instructions && (
                    <div className="border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl space-y-1.5">
                      <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Bookmark size={10} /> Academic rubrics & guidelines
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-mono whitespace-pre-wrap">
                        {assign.instructions}
                      </p>
                    </div>
                  )}

                  {/* Faculty Grading Feedback */}
                  {assign.status === 'Graded' && (
                    <div className="border border-emerald-500/20 bg-emerald-500/5 p-4 rounded-xl space-y-2">
                      <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                        <MessageSquare size={12} /> Faculty assessment feedback
                      </span>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        "{assign.feedback || 'Excellent work! Demonstrated clear conceptual understanding.'}"
                      </p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-xs font-bold pt-2">
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Calendar size={13} className="text-slate-500 dark:text-slate-400" />
                      Due: {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <Award size={13} className="text-slate-500 dark:text-slate-400" />
                      Marks: {assign.total_marks}
                    </span>
                    {assign.status === 'Graded' && (
                      <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Score: {assign.marks_obtained} / {assign.total_marks}
                      </span>
                    )}
                    {assign.status === 'Late' && (
                      <span className="text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle size={12} />
                        Submitted Late
                      </span>
                    )}
                    {assign.status === 'Submitted' && (
                      <span className="text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Submitted
                      </span>
                    )}
                  </div>
                </div>

                {/* Right side submission actions */}
                <div className="shrink-0 w-full lg:w-80 pt-6 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800 lg:pl-6 flex flex-col justify-center gap-3">
                  {['Submitted', 'Late', 'Graded'].includes(assign.status) ? (
                    <div className="space-y-3.5">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 block uppercase font-black tracking-wider">Your Deliverables</span>

                      {assign.submission_url && (
                        <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className={theme.text} size={16} />
                            <div className="truncate">
                              <span className="text-[9px] text-slate-500 dark:text-slate-450 block uppercase font-bold">Uploaded File</span>
                              <span className="text-xs text-slate-800 dark:text-slate-300 font-bold truncate block">
                                {assign.submission_file_name || assign.submission_url.split('/').pop()}
                              </span>
                            </div>
                          </div>
                          <a
                            href={assign.submission_url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}

                      {assign.external_url && (
                        <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <Link className="text-indigo-600 dark:text-indigo-400" size={16} />
                            <div className="truncate">
                              <span className="text-[9px] text-slate-500 dark:text-slate-450 block uppercase font-bold">External URL</span>
                              <span className="text-xs text-slate-800 dark:text-slate-300 font-bold truncate block">
                                {assign.external_url}
                              </span>
                            </div>
                          </div>
                          <a
                            href={assign.external_url}
                            target="_blank"
                            rel="noreferrer"
                            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white p-2 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                          >
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}

                      {assign.assignment_status !== 'Closed' && (
                        <button
                          onClick={() => {
                            // Enable re-submitting by clearing submission status locally
                            setAssignments(prev => prev.map(a => a.assignment_id === assign.assignment_id ? { ...a, status: 'Pending' } : a));
                          }}
                          className="w-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                        >
                          Re-Submit Work
                        </button>
                      )}
                    </div>
                  ) : assign.assignment_status === 'Closed' ? (
                    <div className="text-center p-6 border border-red-500/20 bg-red-500/5 rounded-2xl space-y-2">
                      <AlertCircle className="text-red-500 mx-auto" size={24} />
                      <p className="text-xs font-black text-red-500 uppercase">Submissions Closed</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                        Submission intake for this assignment has been closed by the faculty. Work is no longer accepted.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-black block">Upload Deliverables</span>

                      {/* File uploader */}
                      <label className="w-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 rounded-xl p-4 cursor-pointer transition-all">
                        <UploadCloud className="text-slate-500 dark:text-slate-400 mb-1" size={22} />
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-300 truncate max-w-[220px]">
                          {fileSelected ? fileSelected.name : 'Select coursework file'}
                        </span>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 mt-0.5">PDF, DOCX, ZIP etc. (Max 15MB)</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileChange(assign.assignment_id, e)}
                        />
                      </label>

                      {/* External Deliverable URL */}
                      <div>
                        <label className="block text-[9px] font-black text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">
                          External Work URL (Optional)
                        </label>
                        <div className="relative">
                          <Link className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={13} />
                          <input
                            type="url"
                            placeholder="GitHub repo, Figma, or portfolio link..."
                            value={externalUrls[assign.assignment_id] || ''}
                            onChange={(e) => handleExternalUrlChange(assign.assignment_id, e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 dark:text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors"
                          />
                        </div>
                      </div>

                      <button
                        disabled={uploadingId === assign.assignment_id}
                        onClick={() => handleUploadAndSubmit(assign.assignment_id)}
                        className={`w-full ${theme.accent} hover:opacity-90 text-white font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50`}
                      >
                        {uploadingId === assign.assignment_id ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Uploading coursework...
                          </>
                        ) : (
                          'Submit Deliverables'
                        )}
                      </button>
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
