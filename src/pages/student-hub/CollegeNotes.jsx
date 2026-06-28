import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Download, 
  Eye, 
  BookOpen, 
  FileText,
  X,
  Clock,
  Sparkles,
  BookMarked
} from 'lucide-react';
import { apiFetch } from '../../services/api';
import { useStudent } from '../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';
import BackToHubButton from '../../components/BackToHubButton';

const CollegeNotes = () => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search states
  const [search, setSearch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('All');
  const [selectedSubject, setSelectedSubject] = useState('All');

  // PDF Modal state
  const [viewingNote, setViewingNote] = useState(null);

  // Fetch all notes
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        setLoading(true);
        // We load all notes, and do frontend/backend filtering. 
        // For a rich experience, fetching all notes allows us to dynamically populate the subject filter list!
        const res = await apiFetch('/student-hub/notes');
        if (!res.ok) {
          throw new Error('Failed to load college notes.');
        }
        const data = await res.json();
        setNotes(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNotes();
  }, []);

  // Unique subject codes/names present in notes for current semester selection
  const availableSubjects = React.useMemo(() => {
    const filteredBySem = selectedSemester === 'All'
      ? notes
      : notes.filter(n => n.semester === parseInt(selectedSemester));
    
    // Get unique subjects
    const unique = [];
    const map = new Map();
    for (const n of filteredBySem) {
      if (!map.has(n.subject_code)) {
        map.set(n.subject_code, true);
        unique.push({ code: n.subject_code, name: n.subject_name });
      }
    }
    return unique;
  }, [notes, selectedSemester]);

  // Reset subject filter if it is no longer available in the new semester
  useEffect(() => {
    if (selectedSubject !== 'All' && !availableSubjects.some(s => s.code === selectedSubject)) {
      setSelectedSubject('All');
    }
  }, [selectedSemester, availableSubjects, selectedSubject]);

  // Handle Download action
  const handleDownload = async (note) => {
    try {
      // Call endpoint to increment counter
      await apiFetch(`/student-hub/notes/${note.note_id}/download`, {
        method: 'POST'
      });
      // Update local state to reflect download increment
      setNotes(prevNotes => 
        prevNotes.map(n => 
          n.note_id === note.note_id 
            ? { ...n, download_count: n.download_count + 1 } 
            : n
        )
      );
      // Open file in new tab
      window.open(note.file_url, '_blank');
    } catch (err) {
      console.error("Error logging download:", err);
      // Fallback: still open the file
      window.open(note.file_url, '_blank');
    }
  };

  // Filtered Notes to display
  const filteredNotes = notes.filter(note => {
    const matchesSemester = selectedSemester === 'All' || note.semester === parseInt(selectedSemester);
    const matchesSubject = selectedSubject === 'All' || note.subject_code === selectedSubject;
    const matchesSearch = search.trim() === '' || 
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.description.toLowerCase().includes(search.toLowerCase()) ||
      note.subject_name.toLowerCase().includes(search.toLowerCase()) ||
      note.subject_code.toLowerCase().includes(search.toLowerCase());
    
    return matchesSemester && matchesSubject && matchesSearch;
  });

  const formatBytes = (bytes, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8">
      {/* Header breadcrumb & info */}
      <div className="flex flex-col gap-4">
        <BackToHubButton />
        <div className={`bg-gradient-to-r ${theme.gradient} border ${theme.border} p-6 rounded-3xl relative overflow-hidden shadow-xl text-white`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
            <div>
              <span className={`text-xs ${theme.text} font-bold uppercase tracking-wider ${theme.bg} px-3 py-1 rounded-full border ${theme.border}`}>
                Resource Repository
              </span>
              <h1 className="text-2xl md:text-3xl font-black mt-3 flex items-center gap-2">
                <BookMarked size={28} className={theme.text} /> College Notes Hub
              </h1>
              <p className="text-slate-300 text-sm mt-1 max-w-xl leading-relaxed">
                Access structured syllabus maps, lecture summaries, and solved practice notebooks uploaded by teachers and administrators.
              </p>
            </div>
            <div className="shrink-0 flex items-center justify-center p-3 rounded-2xl bg-white/5 border border-white/10">
              <BookOpen size={40} className={theme.text} />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Tabs Controls */}
      <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search bar */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic, syllabus code, or description..."
              className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-500 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 transition-colors text-sm"
            />
          </div>

          {/* Subject Filter Dropdown */}
          <div className="relative">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 transition-colors text-sm appearance-none cursor-pointer"
            >
              <option value="All">All Subjects</option>
              {availableSubjects.map((sub) => (
                <option key={sub.code} value={sub.code}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-4 pointer-events-none border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-500 w-0 h-0" />
          </div>
        </div>

        {/* Semester Tab Switcher */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Select Semester</label>
          <div className="flex flex-wrap gap-2">
            {['All', '1', '2', '3', '4', '5', '6', '7', '8'].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
                  selectedSemester === sem
                    ? `${theme.bg} ${theme.text} border-indigo-500/50 scale-105 shadow-md`
                    : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-800 dark:hover:text-white'
                }`}
              >
                {sem === 'All' ? 'All Semesters' : `Semester ${sem}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-slate-500 text-sm font-semibold animate-pulse">Loading note resources...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl text-center text-red-650 dark:text-red-400 max-w-lg mx-auto">
          {error}
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 rounded-3xl p-12 text-center text-slate-500 max-w-lg mx-auto space-y-2">
          <FileText size={48} className="mx-auto text-slate-400 dark:text-slate-700" />
          <h3 className="text-slate-900 dark:text-white font-extrabold text-lg">No Notes Found</h3>
          <p className="text-sm text-slate-550 dark:text-slate-400">
            No note logs match your filters. Try checking a different semester or adjusting your search queries.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNotes.map((note) => (
            <motion.div
              key={note.note_id}
              layout
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 hover:border-indigo-500/30 hover:shadow-md rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-sm group"
            >
              <div className="space-y-4">
                {/* Badges row */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className={`text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full ${theme.bg} ${theme.text} border ${theme.border}`}>
                    Sem {note.semester}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                    {note.subject_code}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-md font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {note.title}
                  </h3>
                  <p className="text-slate-650 dark:text-slate-400 text-xs leading-relaxed line-clamp-3">
                    {note.description}
                  </p>
                </div>
              </div>

              {/* Bottom detail and Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 space-y-4">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {formatBytes(note.file_size)}
                  </span>
                  <span className="flex items-center gap-1 bg-indigo-500/5 px-2 py-0.5 rounded-full text-indigo-600 dark:text-indigo-400 border border-indigo-500/10">
                    <Sparkles size={12} /> {note.download_count} downloads
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setViewingNote(note)}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl text-xs font-bold transition-all"
                  >
                    <Eye size={14} /> Preview
                  </button>
                  <button
                    onClick={() => handleDownload(note)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 ${theme.accent} hover:opacity-90 text-white rounded-xl text-xs font-bold transition-all shadow-md`}
                  >
                    <Download size={14} /> Download
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* PDF View Modal */}
      <AnimatePresence>
        {viewingNote && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${theme.bg} ${theme.text}`}>
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="text-slate-900 dark:text-white font-bold text-sm leading-none">{viewingNote.title}</h3>
                    <span className="text-[10px] text-slate-500 font-bold mt-1 inline-block">
                      {viewingNote.subject_code} - {viewingNote.subject_name}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setViewingNote(null)}
                  className="p-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* PDF Loader Container */}
              <div className="flex-1 bg-slate-100 dark:bg-slate-900 p-2 relative">
                {/* Embed PDF inside object/iframe */}
                <iframe
                  src={`${viewingNote.file_url}#toolbar=0`}
                  className="w-full h-full rounded-2xl border border-slate-200 dark:border-0 bg-slate-50 dark:bg-slate-950"
                  title={viewingNote.title}
                />
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-950">
                <span className="text-xs text-slate-550 dark:text-slate-500 font-semibold">
                  Source Document Link: <a href={viewingNote.file_url} target="_blank" rel="noreferrer" className="text-indigo-650 dark:text-indigo-400 hover:underline">{viewingNote.file_name}</a>
                </span>
                <button
                  onClick={() => {
                    const note = viewingNote;
                    setViewingNote(null);
                    handleDownload(note);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 ${theme.accent} hover:opacity-95 text-white rounded-xl text-xs font-bold transition-all`}
                >
                  <Download size={14} /> Download PDF File
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollegeNotes;
