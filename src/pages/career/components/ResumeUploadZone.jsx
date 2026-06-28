import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ResumeUploadZone = ({ onUploadStart, onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const simulateUpload = (uploadedFile) => {
    setFile(uploadedFile);
    setUploading(true);
    setProgress(0);
    if (onUploadStart) onUploadStart(uploadedFile);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          if (onUploadComplete) onUploadComplete(uploadedFile);
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      simulateUpload(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      simulateUpload(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="w-full">
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.doc"
        onChange={handleChange}
      />
      
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`w-full max-w-lg mx-auto py-12 px-6 border-2 border-dashed rounded-2xl cursor-pointer text-center space-y-4 transition-all duration-300 ${
          dragActive
            ? 'border-indigo-650 bg-indigo-50/10 dark:bg-indigo-950/20'
            : 'border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-slate-950/20'
        }`}
      >
        <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-full inline-block text-indigo-650 dark:text-indigo-400">
          <UploadCloud size={32} />
        </div>

        <div className="space-y-1">
          <h4 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">
            Drag & Drop Your Resume
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
            Supports PDF, DOCX or DOC formats (Max 5MB)
          </p>
        </div>

        <button
          type="button"
          className="px-4 py-2 bg-indigo-650 text-white font-bold text-[10px] uppercase tracking-wider rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
        >
          Select File
        </button>
      </div>

      {uploading && (
        <div className="max-w-lg mx-auto mt-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl space-y-3 shadow-premium">
          <div className="flex items-center justify-between text-xs font-semibold">
            <div className="flex items-center gap-2 text-slate-655 dark:text-slate-200">
              <FileText size={16} className="text-indigo-500" />
              <span className="truncate max-w-[200px]">{file?.name}</span>
            </div>
            <span className="font-mono text-indigo-655 dark:text-indigo-400">{progress}%</span>
          </div>
          
          <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-full h-1.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className="bg-indigo-650 h-full rounded-full"
            />
          </div>
          
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Analyzing CV Structure & Extracting keywords...
          </p>
        </div>
      )}
    </div>
  );
};

export default ResumeUploadZone;
