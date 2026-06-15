import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Bell, Megaphone, Target, Calendar } from 'lucide-react';

const AnnouncementCenter = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filterTarget, setFilterTarget] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [targetAnn, setTargetAnn] = useState(null);
  const [formTargetId, setFormTargetId] = useState(null);
  const [classes, setClasses] = useState([]);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formTargetType, setFormTargetType] = useState("All");

  useEffect(() => {
    loadAnnouncements();
    loadDepartments();
    loadClasses();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const url = filterTarget
        ? `http://127.0.0.1:8000/announcements?target_type=${encodeURIComponent(filterTarget)}`
        : "http://127.0.0.1:8000/announcements";
      const res = await fetch(url);
      const data = await res.json();
      setAnnouncements(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/departments");
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error(err);
    }
  };

  // Re-load announcements whenever the filter changes
  useEffect(() => {
    loadAnnouncements();
  }, [filterTarget]);

  const handleOpenAdd = () => {
    setFormTitle("");
    setFormDesc("");
    setFormTargetType("All");
    setShowAddModal(true);

  };

  const handleOpenEdit = (ann) => {
    setTargetAnn(ann);
    setFormTitle(ann.title);
    setFormDesc(ann.description);
    setFormTargetType(ann.target_type);
    setShowEditModal(true);
  };

  const loadClasses = async () => {
  try {
    const res = await fetch(
      "http://127.0.0.1:8000/classes"
    );

    const data = await res.json();

    setClasses(data);
  } catch (err) {
    console.error(err);
  }
};

  const handleSaveAdd = async (e) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDesc.trim()) {
      alert("Title and description are required!");
      return;
    }

    try {
      await fetch("http://127.0.0.1:8000/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,

          sender_type: "ADMIN",
          sender_id: 1,

          target_type: formTargetType,
          target_id: formTargetId
        })
      });
      await loadAnnouncements();
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      await fetch(`http://127.0.0.1:8000/announcements/${targetAnn.announcement_id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          description: formDesc,

          sender_type: targetAnn.sender_type || "ADMIN",
          sender_id: targetAnn.sender_id || 1,

          target_type: formTargetType,
          target_id: formTargetId
        })
      });
      await loadAnnouncements();
      setShowEditModal(false);
      setTargetAnn(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;

    try {
      await fetch(`http://127.0.0.1:8000/announcements/${id}`, {
        method: "DELETE"
      });
      await loadAnnouncements();
    } catch (err) {
      console.error(err);
    }
  };
  const getTargetOptions = () => {
    return [
      "ALL",
      "ALL_STUDENTS",
      "ALL_FACULTY",
      "DEPARTMENT",
      "CLASS",
      "FACULTY"
    ];
  };


  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-emerald-500 font-bold uppercase tracking-wider">Institution Outreach</p>
          <h2 className="text-2xl font-black text-slate-800 dark:text-white font-sans">Announcement Control Center</h2>
          <p className="text-slate-500 text-xs mt-1">Broadcast institutional, department-level, or user-role targeted announcements.</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer self-start md:self-auto"
        >
          <Plus size={16} />
          <span>Publish Broadcast</span>
        </button>
      </div>

      {/* Target filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterTarget("")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterTarget === "" ? "bg-emerald-600 text-white shadow-md" : "bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 hover:bg-slate-100"
              }`}
          >
            All Broadcasts
          </button>
          {["Entire Institution", "Students", "Faculty"].map((target) => (
            <button
              key={target}
              onClick={() => setFilterTarget(target)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${filterTarget === target ? "bg-emerald-600 text-white shadow-md" : "bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 text-slate-500 hover:bg-slate-100"
                }`}
            >
              {target}
            </button>
          ))}
        </div>
      </div>

      {/* Announcements List Layout */}
      <div className="space-y-4">
        {announcements.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl">
            No broadcasts posted matching this target audience filter.
          </div>
        ) : (
          announcements.map((ann) => (
            <div
              key={ann.announcement_id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-start justify-between gap-4"
            >
              <div className="flex gap-4">
                <div className="h-12 w-12 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center shrink-0">
                  <Megaphone size={22} />
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-slate-850 dark:text-white text-sm md:text-base leading-snug">{ann.title}</h3>
                    <span className="text-[9px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/10 font-mono">
                      {ann.target_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed pr-6">{ann.description}</p>

                  <div className="flex items-center gap-4 text-[10px] text-slate-400 pt-2 font-semibold">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {ann.created_at.split(" ")[0]}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-1 items-center self-end md:self-auto">
                <button
                  onClick={() => handleOpenEdit(ann)}
                  className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-850 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all cursor-pointer inline-flex"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(ann.announcement_id)}
                  className="p-2 border border-slate-200 dark:border-slate-800 hover:bg-red-500 hover:text-white rounded-lg text-red-500 transition-all cursor-pointer inline-flex"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveAdd}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Publish Broadcast Notice</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="w-full px-3 py-2 text-slate-900 dark:text-white">Notice Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. End Semester Examinations Schedule"
                  className="w-full border rounded-xl px-3 py-2 bg-white text-black"
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Notice Target Audience</label>
                <select
                  value={formTargetType}
                  onChange={(e) => setFormTargetType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  required
                >
                  {getTargetOptions().map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>

                {formTargetType === "DEPARTMENT" && (
                  <div className="mt-3">
                    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
                      Select Department
                    </label>

                    <select
                      value={formTargetId || ""}
                      onChange={(e) =>
                        setFormTargetId(Number(e.target.value))
                      }
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                    >
                      <option value="">
                        Select Department
                      </option>

                      {departments.map((d) => (
                        <option
                          key={d.department_id}
                          value={d.department_id}
                        >
                          {d.department_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              {formTargetType === "CLASS" && (
  <div className="mt-3">
    <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">
      Select Class
    </label>

    <select
      value={formTargetId || ""}
      onChange={(e) =>
        setFormTargetId(Number(e.target.value))
      }
      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5"
    >
      <option value="">
        Select Class
      </option>

      {classes.map((c) => (
        <option
          key={c.class_id}
          value={c.class_id}
        >
          {c.class_name}
        </option>
      ))}
    </select>
  </div>
)}

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Broadcast Message Body</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Enter content details..."
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  required
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-500 hover:bg-slate-50 font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Publish Broadcast
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveEdit}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl max-w-sm w-full shadow-2xl space-y-4"
          >
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-850">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">Modify Notice</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-white cursor-pointer"><X size={18} /></button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Notice Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Notice Target Audience</label>
                <select
                  value={formTargetType}
                  onChange={(e) => setFormTargetType(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  required
                >
                  {getTargetOptions().map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Broadcast Message Body</label>
                <textarea
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  required
                ></textarea>
              </div>
            </div>

            <div className="flex gap-3 pt-3">
              <button
                type="button"
                onClick={() => { setShowEditModal(false); setTargetAnn(null); }}
                className="flex-1 py-2.5 border border-slate-200 dark:border-slate-850 rounded-xl text-slate-500 hover:bg-slate-50 font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all cursor-pointer"
              >
                Save Updates
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
};

export default AnnouncementCenter;
