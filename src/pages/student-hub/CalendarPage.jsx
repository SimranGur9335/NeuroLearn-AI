import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../services/api';
import StudentHubHeader from '../../components/StudentHubHeader';
import { useStudent } from '../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../components/StudentHubTheme';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  AlertCircle,
  Tag
} from 'lucide-react';

const CalendarPage = () => {
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState(null);

  // Calendar visual state
  const [viewDate, setViewDate] = useState(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState([]);
  const [selectedDayString, setSelectedDayString] = useState(null);

  useEffect(() => {
    const fetchCalendar = async () => {
      try {
        setLoading(true);
        const res = await apiFetch('/student-hub/calendar');
        if (!res.ok) {
          throw new Error('Failed to load academic events');
        }
        const data = await res.json();
        setEvents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendar();
  }, []);

  // Helper date logic
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);

  // Month names
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Navigate months
  const handlePrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDateEvents([]);
    setSelectedDayString(null);
  };

  const handleNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDateEvents([]);
    setSelectedDayString(null);
  };

  // Check if a specific date has any events
  const getEventsForDate = (dayNum) => {
    const dString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    return events.filter(e => e.event_date === dString);
  };

  const handleDayClick = (dayNum) => {
    const dString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const dayEvents = getEventsForDate(dayNum);
    setSelectedDateEvents(dayEvents);
    setSelectedDayString(new Date(currentYear, currentMonth, dayNum).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }));
  };

  // Generate days array for grid rendering
  const daysArray = [];
  // Fill empty spaces for preceding month days
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push({ type: 'empty', id: `empty-${i}` });
  }
  // Fill actual month days
  for (let i = 1; i <= daysInMonth; i++) {
    const dayEvents = getEventsForDate(i);
    daysArray.push({
      type: 'day',
      dayNum: i,
      events: dayEvents,
      id: `day-${i}`
    });
  }

  // Find all upcoming events in general (sorted)
  const sortedUpcomingEvents = [...events]
    .filter(e => new Date(e.event_date) >= new Date().setHours(0,0,0,0))
    .sort((a,b) => new Date(a.event_date) - new Date(b.event_date));

  return (
    <div className="space-y-6">
      <StudentHubHeader 
        title="Academic Calendar" 
        description="Track key institution milestones, holidays, term dates, and scheduled exam weeks."
        showBackButton={true}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] space-y-4">
          <div className="w-8 h-8 border-4 border-slate-700 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-slate-400 text-xs animate-pulse">Synchronizing academic calendar...</span>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Calendar visual grid card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 lg:col-span-2 space-y-6">
            
            {/* Calendar Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={18} className={theme.text} />
                <h3 className="font-extrabold text-base text-white">
                  {monthNames[currentMonth]} {currentYear}
                </h3>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <button 
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Grid days layout */}
            <div className="space-y-2">
              {/* Day initials */}
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[10px] text-slate-500 uppercase tracking-widest pb-2 border-b border-slate-800/60">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>
              
              {/* Day cells grid */}
              <div className="grid grid-cols-7 gap-2">
                {daysArray.map((cell) => {
                  if (cell.type === 'empty') {
                    return <div key={cell.id} className="aspect-square" />;
                  }

                  const hasEvents = cell.events.length > 0;
                  const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, cell.dayNum).toDateString();
                  
                  return (
                    <button
                      key={cell.id}
                      onClick={() => handleDayClick(cell.dayNum)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-between p-1.5 border transition-all cursor-pointer relative group ${
                        isToday 
                          ? `${theme.accent} text-white border-transparent` 
                          : hasEvents
                          ? `bg-slate-850 hover:bg-slate-800 border-slate-800 hover:border-slate-700 text-slate-200`
                          : `bg-slate-900/40 hover:bg-slate-850 border-slate-850 hover:border-slate-800 text-slate-400`
                      }`}
                    >
                      <span className="text-xs font-bold self-start">{cell.dayNum}</span>
                      
                      {/* Event Indicator dot */}
                      {hasEvents && (
                        <span className={`w-1.5 h-1.5 rounded-full ${isToday ? 'bg-white' : theme.accent} mb-0.5`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected Day events details drawer */}
            {selectedDayString && (
              <div className="p-4 bg-slate-850 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Events for: {selectedDayString}</h4>
                  <button onClick={() => { setSelectedDateEvents([]); setSelectedDayString(null); }} className="text-[10px] text-slate-500 hover:text-slate-300">Clear</button>
                </div>

                {selectedDateEvents.length === 0 ? (
                  <p className="text-xs text-slate-500">No events scheduled for this day.</p>
                ) : (
                  <div className="space-y-3">
                    {selectedDateEvents.map((evt, idx) => (
                      <div key={idx} className="space-y-1 p-2 bg-slate-900/60 rounded-lg border border-slate-800/80">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold text-white">{evt.title}</span>
                          <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                            evt.event_type === 'Exam' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            evt.event_type === 'Holiday' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                          }`}>
                            {evt.event_type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">{evt.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upcoming Events sidebar list */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 flex flex-col">
            <h3 className="font-extrabold text-sm text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle size={16} className={theme.text} />
              Upcoming Milestones
            </h3>
            
            <div className="space-y-4 overflow-y-auto max-h-[400px] pr-1 flex-grow">
              {sortedUpcomingEvents.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No upcoming calendar milestones found.
                </div>
              ) : (
                sortedUpcomingEvents.map((evt) => {
                  const evDate = new Date(evt.event_date);
                  return (
                    <div 
                      key={evt.calendar_id}
                      className="p-3.5 bg-slate-850 hover:bg-slate-800 border border-slate-850 hover:border-slate-800 rounded-xl transition-colors space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-extrabold text-white leading-tight">{evt.title}</span>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded shrink-0 ${
                          evt.event_type === 'Exam' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          evt.event_type === 'Holiday' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}>
                          {evt.event_type}
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-slate-400 leading-normal">{evt.description}</p>
                      
                      <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-semibold">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {evDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default CalendarPage;
