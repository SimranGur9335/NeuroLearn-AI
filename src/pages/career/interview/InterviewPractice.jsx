import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, ArrowLeft, ArrowRight, Mic, Play, Sparkles, Volume2, Award, ClipboardCheck } from 'lucide-react';
import { useStudent } from '../../../context/StudentContext';
import { THEME_COLOR_MAP } from '../../../components/StudentHubTheme';
import { interviews } from '../data/interviews';
import CareerHero from '../components/CareerHero';
import CareerCard from '../components/CareerCard';
import CareerSection from '../components/CareerSection';
import CareerSearch from '../components/CareerSearch';
import CareerFilter from '../components/CareerFilter';
import CareerTag from '../components/CareerTag';
import CareerBadge from '../components/CareerBadge';
import CareerEmptyState from '../components/CareerEmptyState';
import CareerDetailHeader from '../components/CareerDetailHeader';
import CareerInfoGrid from '../components/CareerInfoGrid';
import CareerStatCard from '../components/CareerStatCard';
import CareerBreadcrumb from '../components/CareerBreadcrumb';
import CareerCTA from '../components/CareerCTA';

const InterviewPractice = () => {
  const navigate = useNavigate();
  const { profile } = useStudent();
  const themeColor = profile?.theme_color || 'indigo';
  const theme = THEME_COLOR_MAP[themeColor] || THEME_COLOR_MAP.indigo;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Interactive session states
  const [currentSession, setCurrentSession] = useState(null); // null | interview object
  const [sessionStep, setSessionStep] = useState('prep'); // 'prep' | 'active' | 'summary'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: text }
  const [typedAnswer, setTypedAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const categories = [
    'All',
    'Technical Interview',
    'HR Interview',
    'Behavioral Interview',
    'Role Specific Interview',
    'Company Specific Interview'
  ];

  const filteredInterviews = interviews.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.overview.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const selectSession = (session) => {
    setCurrentSession(session);
    setSessionStep('prep');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setTypedAnswer('');
    setIsRecording(false);
  };

  const startInterview = () => {
    setSessionStep('active');
  };

  const handleNext = () => {
    const currentQ = currentSession.questions[currentQuestionIndex];
    const updatedAnswers = { ...answers, [currentQ.id]: typedAnswer };
    setAnswers(updatedAnswers);
    setTypedAnswer('');

    if (currentQuestionIndex + 1 < currentSession.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setSessionStep('summary');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      setTypedAnswer("Simulated voice input transcription: " + currentSession.questions[currentQuestionIndex].q.replace('Explain', 'I believe that').replace('Design', 'My approach to design is'));
    } else {
      setIsRecording(true);
    }
  };

  // Dynamic Detail/Active/Summary render
  if (currentSession) {
    const breadcrumbItems = [
      { name: 'Career Journey', onClick: () => setCurrentSession(null) },
      { name: 'Interview practice', onClick: () => setCurrentSession(null) },
      { name: currentSession.title }
    ];

    return (
      <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto">
        <CareerBreadcrumb items={breadcrumbItems} />

        {/* STEP 1: PREPARATION AND OVERVIEW SCREEN */}
        {sessionStep === 'prep' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <CareerDetailHeader
              category={currentSession.category}
              title={currentSession.title}
              description={currentSession.overview}
              onBack={() => setCurrentSession(null)}
            />

            <CareerInfoGrid columns={3}>
              <CareerStatCard title="Interview Tier" value={currentSession.difficulty} icon="warning" />
              <CareerStatCard title="Expected Duration" value={currentSession.duration} icon="clock" />
              <CareerStatCard title="Questions count" value={`${currentSession.questionsCount} Questions`} icon="chat" />
            </CareerInfoGrid>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <CareerSection title="Instructions & Best Practices" icon="calendar">
                  <ul className="space-y-3">
                    {currentSession.instructions.map((inst, idx) => (
                      <li key={idx} className="flex gap-3 items-start p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl">
                        <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-650 dark:text-indigo-400 text-[10px] font-mono font-bold shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-xs text-slate-655 dark:text-slate-400 font-semibold leading-relaxed">
                          {inst}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CareerSection>

                <CareerSection title="Skills Tested in This Interview" icon="dev">
                  <div className="flex flex-wrap gap-2">
                    {currentSession.id.includes('ml') ? (
                      <>
                        <CareerTag label="Python" />
                        <CareerTag label="TensorFlow" />
                        <CareerTag label="Linear Algebra" />
                      </>
                    ) : currentSession.id.includes('tech') ? (
                      <>
                        <CareerTag label="React Library" />
                        <CareerTag label="SQL Analytics" />
                        <CareerTag label="Node.js" />
                      </>
                    ) : (
                      <>
                        <CareerTag label="Technical Communication" />
                        <CareerTag label="Problem Solving" />
                        <CareerTag label="Adaptability" />
                      </>
                    )}
                  </div>
                </CareerSection>
              </div>

              <div className="space-y-6">
                {/* AI Ready Badge Box */}
                <div className="p-6 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-indigo-250/20 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                    <Sparkles size={18} className="animate-pulse" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Future AI Integration Ready</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider">AI Voice & Face Analyzer</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                    In future sprints, this module will enable microphone recordings, voice tone evaluation, grammar feedback, and real-time webcam facial expressions analysis.
                  </p>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 rounded font-mono text-[9px] text-indigo-600 dark:text-indigo-400">Voice Record</span>
                    <span className="px-2 py-0.5 bg-purple-50 dark:bg-purple-950/40 border border-purple-250/25 rounded font-mono text-[9px] text-purple-600 dark:text-purple-400">Emotion Recognition</span>
                  </div>
                </div>

                <button
                  onClick={startInterview}
                  className={`w-full py-3 bg-gradient-to-r ${theme.gradient} text-white font-bold text-xs uppercase tracking-wider shadow-lg rounded-xl hover:shadow-xl transition-all flex items-center justify-center gap-2`}
                >
                  <Play size={14} />
                  Start Practice Interview
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 2: ACTIVE PRACTICE INTERVIEW INTERFACE */}
        {sessionStep === 'active' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch"
          >
            {/* Left side: Question Board */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-premium space-y-4">
                <div className="flex justify-between items-center text-[10px] font-bold text-slate-405 uppercase tracking-wider">
                  <span>Question {currentQuestionIndex + 1} of {currentSession.questions.length}</span>
                  <span className="font-mono text-indigo-650 dark:text-indigo-400">PRACTICE INTERVIEW SESSION</span>
                </div>

                <div className="w-full bg-slate-100 dark:bg-slate-950 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-650 h-full transition-all duration-300"
                    style={{ width: `${((currentQuestionIndex + 1) / currentSession.questions.length) * 100}%` }}
                  />
                </div>

                <div className="p-6 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-xl relative overflow-hidden">
                  <div className="relative z-10 text-xs font-bold text-slate-850 dark:text-white leading-relaxed">
                    {currentSession.questions[currentQuestionIndex].q}
                  </div>
                </div>

                {/* Simulated transcript area */}
                <div className="space-y-2 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Answer Response</label>
                  <textarea
                    value={typedAnswer}
                    onChange={(e) => setTypedAnswer(e.target.value)}
                    placeholder="Type your response answer here to simulate your speech transcript..."
                    rows={6}
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950 text-xs text-slate-850 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-650/20 focus:border-indigo-650 transition-all font-medium"
                  />
                </div>

                {/* Mic and submit triggers */}
                <div className="flex justify-between items-center gap-3 pt-2">
                  <button
                    onClick={toggleRecording}
                    className={`px-4 py-2.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                      isRecording 
                        ? 'bg-rose-500 border-rose-600 text-white animate-pulse'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-655 dark:text-slate-300'
                    }`}
                  >
                    <Mic size={14} className={isRecording ? 'animate-spin' : ''} />
                    {isRecording ? "Stop Simulated Voice" : "Simulate Speech Input"}
                  </button>

                  <button
                    onClick={handleNext}
                    className={`px-5 py-2.5 bg-gradient-to-r ${theme.gradient} text-white font-bold text-[10px] uppercase tracking-wider shadow-md hover:shadow-lg transition-all rounded-xl flex items-center gap-2`}
                  >
                    <span>
                      {currentQuestionIndex + 1 === currentSession.questions.length ? "Finish & Submit" : "Next Question"}
                    </span>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>

            {/* Right side: Session status panel */}
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-premium space-y-4">
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-650 dark:text-indigo-400 flex items-center gap-2">
                  <ClipboardCheck size={16} />
                  Session Telemetry
                </h3>
                
                <div className="space-y-3.5 text-xs font-semibold text-slate-655 dark:text-slate-400 leading-normal">
                  <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-850">
                    <span>Mute Status</span>
                    <span className="font-mono text-emerald-500 font-bold uppercase">Ready</span>
                  </div>
                  <div className="flex justify-between pb-2 border-b border-slate-100 dark:border-slate-850">
                    <span>Audio Latency</span>
                    <span className="font-mono text-slate-400 font-bold">12ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Speech Clarity</span>
                    <span className="font-mono text-emerald-500 font-bold">98% Avg</span>
                  </div>
                </div>
              </div>

              <div className="p-5 border border-dashed border-rose-500/20 bg-rose-500/5 rounded-2xl space-y-2">
                <span className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider block">End session</span>
                <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">Exiting the page now will discard your current progress answers.</p>
                <button
                  onClick={() => setCurrentSession(null)}
                  className="px-3.5 py-1.5 border border-rose-250 dark:border-rose-850 text-rose-500 text-[9px] font-extrabold uppercase tracking-wider rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all bg-transparent"
                >
                  Quit Practice
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3: DETAILED PRACTICE COMPLETION SUMMARY SCREEN */}
        {sessionStep === 'summary' && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <CareerDetailHeader
              category="Interview feedback"
              title="Practice Evaluation Completed"
              description="Review your mock score, structural speech feedback, and targeted improvements guidelines."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
              {/* Score widget */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-premium flex flex-col justify-between items-center text-center space-y-6">
                <div className="space-y-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Performance Score</h4>
                  <span className="text-[9px] text-slate-400 font-mono block uppercase">LLM Mock Metrics</span>
                </div>

                <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-4 border-slate-100 dark:border-slate-850">
                  <span className="font-mono text-3xl font-black text-slate-850 dark:text-white leading-none">
                    {currentSession.mockFeedback.score}%
                  </span>
                </div>

                <div className="w-full py-2 px-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 font-bold text-xs">
                  Pass (Qualified Benchmark)
                </div>
              </div>

              {/* Summary and tips */}
              <div className="md:col-span-2 space-y-6">
                <CareerSection title="Analysis Overview" icon="chat">
                  <p className="text-xs text-slate-655 dark:text-slate-400 leading-relaxed font-semibold">
                    {currentSession.mockFeedback.analysis}
                  </p>
                </CareerSection>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <CareerSection title="Core Strengths" icon="check">
                    <div className="space-y-2">
                      {currentSession.mockFeedback.strengths.map((str, i) => (
                        <div key={i} className="flex gap-2 items-center text-xs text-slate-655 dark:text-slate-400 font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>{str}</span>
                        </div>
                      ))}
                    </div>
                  </CareerSection>

                  <CareerSection title="Areas of Improvement" icon="warning">
                    <div className="space-y-2">
                      {currentSession.mockFeedback.improvements.map((imp, i) => (
                        <div key={i} className="flex gap-2 items-center text-xs text-slate-655 dark:text-slate-400 font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                          <span>{imp}</span>
                        </div>
                      ))}
                    </div>
                  </CareerSection>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setCurrentSession(null)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-all cursor-pointer"
              >
                Back to Interview Bank
              </button>

              <button
                onClick={() => selectSession(currentSession)}
                className={`px-5 py-2.5 bg-gradient-to-r ${theme.gradient} text-white font-bold text-xs uppercase tracking-wider shadow-md rounded-xl hover:shadow-lg transition-all`}
              >
                Practice Again
              </button>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 font-sans pb-10 max-w-5xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate('/career')}
        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors bg-transparent border-none cursor-pointer"
      >
        <MessageSquare size={14} />
        Back to Dashboard
      </button>

      <CareerHero
        category="Placement Prep Suite"
        title="Interview Practice Deck"
        description="Enhance your technical articulation and behavioral framing. Practice simulated role interviews, HR alignment calls, and Google-onsite templates."
      />

      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        <div className="w-full md:w-80">
          <CareerSearch
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search interviews..."
          />
        </div>
        <CareerFilter
          options={categories}
          activeOption={selectedCategory}
          onSelect={setSelectedCategory}
        />
      </div>

      <AnimatePresence mode="popLayout">
        {filteredInterviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInterviews.map((item) => (
              <CareerCard
                key={item.id}
                title={item.title}
                description={item.overview}
                icon="chat"
                badge={item.category}
                extraInfo={`Duration: ${item.duration} | Difficulty: ${item.difficulty}`}
                onClick={() => selectSession(item)}
              >
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold mt-2 border-t border-slate-100 dark:border-slate-850 pt-3">
                  <span className="text-indigo-655 dark:text-indigo-400 font-bold uppercase">{item.questionsCount} Questions</span>
                  <div className="flex items-center gap-1 text-indigo-650 dark:text-indigo-400 font-bold group-hover:underline">
                    <span>Open Session</span>
                    <ArrowRight size={12} />
                  </div>
                </div>
              </CareerCard>
            ))}
          </div>
        ) : (
          <CareerEmptyState
            title="No Interviews Found"
            message={`We couldn't find any sessions matching "${searchQuery}" under ${selectedCategory}.`}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewPractice;
