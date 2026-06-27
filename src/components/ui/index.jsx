import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Search as SearchIcon, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  AlertTriangle,
  Loader
} from 'lucide-react';

// ==========================================
// 1. BUTTON COMPONENT
// ==========================================
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  disabled = false, 
  onClick, 
  className = '', 
  type = 'button' 
}) => {
  const baseStyle = 'inline-flex items-center justify-center font-bold transition-all focus:outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md shadow-indigo-600/10 rounded-2xl',
    secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-2xl',
    outline: 'bg-white border border-slate-250 hover:bg-slate-50 text-slate-800 rounded-2xl',
    ghost: 'bg-transparent hover:bg-slate-100 text-slate-700 rounded-2xl',
    danger: 'bg-red-600 hover:bg-red-750 text-white rounded-2xl'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-5 py-2.5 text-xs',
    lg: 'px-7 py-3.5 text-sm'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-current/20 border-t-current rounded-full animate-spin mr-1.5" />
          <span>Loading...</span>
        </>
      ) : children}
    </button>
  );
};

// ==========================================
// 2. CARD COMPONENT
// ==========================================
export const Card = ({ children, className = '', onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-white border border-slate-200 rounded-3xl p-6 shadow-sm ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

// ==========================================
// 3. INPUT COMPONENT
// ==========================================
export const Input = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder = '', 
  required = false, 
  error = '', 
  icon: Icon,
  className = ''
}) => {
  return (
    <div className={`space-y-1 w-full ${className}`}>
      {label && (
        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">
          {label}
        </label>
      )}
      <div className={`relative flex items-center bg-white border ${error ? 'border-red-500 focus-within:ring-red-500/20' : 'border-slate-200 focus-within:ring-indigo-600/20'} focus-within:ring-2 focus-within:border-indigo-650 rounded-2xl px-3 py-2.5 transition-all`}>
        {Icon && <Icon size={14} className="text-slate-400 mr-2 shrink-0" />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="bg-transparent border-none text-xs text-slate-800 placeholder-slate-400 focus:outline-none w-full font-medium"
        />
      </div>
      {error && <span className="text-[10px] text-red-500 pl-1 font-semibold">{error}</span>}
    </div>
  );
};

// ==========================================
// 4. SELECT COMPONENT
// ==========================================
export const Select = ({ 
  label, 
  value, 
  onChange, 
  options = [], 
  required = false, 
  className = '' 
}) => {
  return (
    <div className={`space-y-1 w-full ${className}`}>
      {label && (
        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">
          {label}
        </label>
      )}
      <div className="relative flex items-center bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-600/20 rounded-2xl px-3 py-2 transition-all">
        <select
          value={value}
          onChange={onChange}
          className="bg-transparent border-none text-xs text-slate-800 focus:outline-none w-full cursor-pointer py-1 font-semibold"
          required={required}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-slate-800">
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

// ==========================================
// 5. TEXTAREA COMPONENT
// ==========================================
export const Textarea = ({ 
  label, 
  value, 
  onChange, 
  placeholder = '', 
  rows = 4, 
  required = false, 
  className = '' 
}) => {
  return (
    <div className={`space-y-1 w-full ${className}`}>
      {label && (
        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">
          {label}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className="w-full bg-white border border-slate-200 focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 rounded-2xl px-4 py-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none transition-all font-medium"
      />
    </div>
  );
};

// ==========================================
// 6. CHECKBOX COMPONENT
// ==========================================
export const Checkbox = ({ checked, onChange, label, className = '' }) => {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 text-xs text-slate-550 hover:text-slate-800 select-none cursor-pointer font-semibold ${className}`}
    >
      {checked ? <CheckCircle2 size={14} className="text-indigo-600" /> : <div className="w-3.5 h-3.5 border border-slate-300 rounded" />}
      {label && <span>{label}</span>}
    </button>
  );
};

// ==========================================
// 7. RADIO COMPONENT
// ==========================================
export const Radio = ({ selected, value, onChange, label, className = '' }) => {
  const isSelected = selected === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex items-center gap-2 text-xs text-slate-550 hover:text-slate-800 select-none cursor-pointer font-semibold ${className}`}
    >
      <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-600' : 'border-slate-300'}`}>
        {isSelected && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />}
      </div>
      {label && <span>{label}</span>}
    </button>
  );
};

// ==========================================
// 8. BADGE COMPONENT
// ==========================================
export const Badge = ({ children, variant = 'info', className = '' }) => {
  const colors = {
    info: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    danger: 'bg-red-50 text-red-750 border-red-100'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${colors[variant]} ${className}`}>
      {children}
    </span>
  );
};

// ==========================================
// 9. TABLE COMPONENT
// ==========================================
export const Table = ({ headers = [], children, className = '' }) => {
  return (
    <div className={`bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-150 text-slate-400 font-bold uppercase text-[9px] tracking-wider bg-slate-50/50">
              {headers.map((h, i) => (
                <th key={i} className="py-3.5 px-5">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {children}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ==========================================
// 10. MODAL & DIALOG COMPONENTS
// ==========================================
export const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-6 z-10 text-slate-800"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X size={18} />
            </button>
            {title && (
              <div className="space-y-1 border-b border-slate-100 pb-3">
                <h3 className="text-base font-black text-slate-900">{title}</h3>
              </div>
            )}
            <div className="space-y-4 pt-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export const Dialog = ({ isOpen, onClose, title, desc, children }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      {desc && <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>}
      {children}
    </Modal>
  );
};

// ==========================================
// 11. SIDEBAR CONTAINER COMPONENT
// ==========================================
export const Sidebar = ({ children, className = '' }) => {
  return (
    <aside className={`w-64 bg-slate-50 border-r border-slate-200 h-screen flex flex-col justify-between ${className}`}>
      {children}
    </aside>
  );
};

// ==========================================
// 12. NAVBAR CONTAINER COMPONENT
// ==========================================
export const Navbar = ({ children, className = '' }) => {
  return (
    <nav className={`bg-white border-b border-slate-150 px-6 py-4 flex items-center justify-between sticky top-0 z-40 ${className}`}>
      {children}
    </nav>
  );
};

// ==========================================
// 13. TABS COMPONENT
// ==========================================
export const Tabs = ({ tabs = [], activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex gap-2 border-b border-slate-200 pb-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${isActive ? 'bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100' : 'text-slate-500 hover:text-slate-800'}`}
          >
            {tab.title}
          </button>
        );
      })}
    </div>
  );
};

// ==========================================
// 14. TOAST COMPONENT
// ==========================================
export const Toast = ({ msg, type = 'success', onClose }) => {
  const icons = {
    success: <CheckCircle2 className="text-emerald-500 shrink-0" size={16} />,
    danger: <AlertCircle className="text-red-500 shrink-0" size={16} />,
    warning: <AlertTriangle className="text-amber-500 shrink-0" size={16} />,
    info: <Info className="text-indigo-650 shrink-0" size={16} />
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-slate-200 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 max-w-sm animate-bounce-slow">
      {icons[type]}
      <span className="text-xs text-slate-700 font-semibold">{msg}</span>
      <button onClick={onClose} className="p-0.5 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-650 cursor-pointer">
        <X size={14} />
      </button>
    </div>
  );
};

// ==========================================
// 15. ALERT COMPONENT
// ==========================================
export const Alert = ({ children, variant = 'warning', className = '' }) => {
  const backgrounds = {
    warning: 'bg-amber-50 border-amber-200 text-amber-700',
    info: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    danger: 'bg-red-50 border-red-200 text-red-750',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-700'
  };

  return (
    <div className={`p-4 border rounded-2xl flex items-start gap-3 text-xs leading-relaxed font-medium ${backgrounds[variant]} ${className}`}>
      <AlertCircle size={18} className="shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
};

// ==========================================
// 16. PAGINATION COMPONENT
// ==========================================
export const Pagination = ({ currentPage, totalPages, onPageChange, className = '' }) => {
  return (
    <div className={`flex items-center justify-end gap-2 text-xs ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="font-bold text-slate-700">Page {currentPage} of {totalPages}</span>
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

// ==========================================
// 17. SEARCH COMPONENT
// ==========================================
export const Search = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
  return (
    <div className={`relative flex items-center bg-white border border-slate-200 focus-within:ring-2 focus-within:ring-indigo-600/20 focus-within:border-indigo-600 rounded-2xl px-3 py-2 transition-all ${className}`}>
      <SearchIcon size={14} className="text-slate-400 mr-2 shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-transparent border-none text-xs text-slate-850 placeholder-slate-400 focus:outline-none w-full font-medium"
      />
    </div>
  );
};

// ==========================================
// 18. FILTER COMPONENT
// ==========================================
export const Filter = ({ label, value, onChange, options = [], className = '' }) => {
  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      options={options}
      className={className}
    />
  );
};

// ==========================================
// 19. EMPTY STATE COMPONENT
// ==========================================
export const EmptyState = ({ title = 'No results found', desc, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-10 text-center space-y-2 border border-dashed border-slate-200 rounded-3xl p-6 ${className}`}>
      <Info size={32} className="text-slate-350" />
      <h4 className="font-extrabold text-slate-800 text-sm">{title}</h4>
      {desc && <p className="text-slate-550 text-xs max-w-sm leading-relaxed">{desc}</p>}
    </div>
  );
};

// ==========================================
// 20. LOADING STATE COMPONENT
// ==========================================
export const LoadingState = ({ label = 'Loading information...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center min-h-[150px] space-y-3 ${className}`}>
      <Loader size={24} className="text-indigo-600 animate-spin" />
      <span className="text-slate-500 text-xs font-semibold animate-pulse">{label}</span>
    </div>
  );
};

// ==========================================
// 21. KPI CARD COMPONENT
// ==========================================
export const KPICard = ({ title, value, subtext, icon: Icon, className = '' }) => {
  return (
    <div className={`bg-white border border-slate-200 p-5 rounded-3xl shadow-sm flex items-center justify-between gap-4 ${className}`}>
      <div className="space-y-1">
        <span className="text-[10px] uppercase font-bold text-slate-400 block pl-0.5">{title}</span>
        <h3 className="text-2xl font-black text-slate-900">{value}</h3>
        {subtext && <p className="text-[9px] text-slate-500 font-semibold">{subtext}</p>}
      </div>
      {Icon && (
        <div className="bg-indigo-50 text-indigo-700 p-3 rounded-2xl shrink-0">
          <Icon size={20} />
        </div>
      )}
    </div>
  );
};

// ==========================================
// 22. ANALYTICS CARD COMPONENT
// ==========================================
export const AnalyticsCard = ({ title, desc, children, className = '' }) => {
  return (
    <Card className={`flex flex-col justify-between space-y-4 ${className}`}>
      <div>
        <h4 className="font-extrabold text-slate-800 text-sm tracking-tight">{title}</h4>
        {desc && <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{desc}</p>}
      </div>
      <div className="w-full">
        {children}
      </div>
    </Card>
  );
};

// ==========================================
// 23. CHART CARD COMPONENT
// ==========================================
export const ChartCard = ({ title, desc, children, className = '' }) => {
  return (
    <Card className={`space-y-4 ${className}`}>
      <div>
        <h4 className="font-extrabold text-slate-800 text-sm tracking-tight">{title}</h4>
        {desc && <p className="text-xs text-slate-500 leading-snug">{desc}</p>}
      </div>
      <div className="w-full">
        {children}
      </div>
    </Card>
  );
};

// ==========================================
// 24. PROFILE CARD COMPONENT
// ==========================================
export const ProfileCard = ({ name, role, details = [], avatarUrl, className = '' }) => {
  return (
    <Card className={`flex flex-col items-center text-center space-y-4 ${className}`}>
      <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-black text-xl overflow-hidden shadow-sm">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'NL'
        )}
      </div>
      <div className="space-y-1">
        <h4 className="text-base font-black text-slate-900 leading-tight">{name}</h4>
        <span className="text-xs text-slate-500 font-semibold">{role}</span>
      </div>
      <div className="w-full space-y-2 border-t border-slate-100 pt-4 text-left text-xs text-slate-600">
        {details.map((d, i) => (
          <div key={i} className="flex justify-between items-center">
            <span className="text-slate-400 font-bold uppercase text-[9px]">{d.label}</span>
            <span className="font-semibold text-slate-700">{d.value}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
