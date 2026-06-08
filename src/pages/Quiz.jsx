import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GraduationCap, 
  Flame, 
  Heart, 
  Trophy, 
  HelpCircle, 
  Timer,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { DOMAINS } from '../data/data';

const Quiz = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { hearts, refillHearts, completeQuiz } = useStudent();

  const nodeId = searchParams.get('node');
  const domainId = searchParams.get('domain');

  // fallback selections if user navigates directly to Quiz Arena without params
  const [selectedDomainId, setSelectedDomainId] = useState(DOMAINS[0].id);
  const [selectedNodeId, setSelectedNodeId] = useState(DOMAINS[0].nodes[0].id);

  // Active quiz states
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30s per question
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState(null); // stores end result object

  const timerRef = useRef(null);

  // Load active node & domain
  const activeDomainId = domainId || selectedDomainId;
  const activeNodeId = nodeId || selectedNodeId;

  const currentDomain = DOMAINS.find(d => d.id === activeDomainId) || DOMAINS[0];
  const currentNode = currentDomain.nodes.find(n => n.id === activeNodeId) || currentDomain.nodes[0];
  const questions = currentNode.quiz || [];

  // Reset quiz states when node changes
  useEffect(() => {
    setQuizStarted(false);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setScore(0);
    setQuizCompleted(false);
    setQuizResults(null);
  }, [nodeId, domainId]);

  // Handle countdown timer
  useEffect(() => {
    if (quizStarted && !quizCompleted && !isAnswerSubmitted) {
      setTimeLeft(30);
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            // Auto submit as wrong
            handleSubmitAnswer(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(timerRef.current);
  }, [quizStarted, currentQuestionIndex, isAnswerSubmitted, quizCompleted]);

  const startQuiz = () => {
    if (hearts <= 0) {
      alert("You have 0 hearts! Please buy a refill in the header using XP before taking a quiz.");
      return;
    }
    setQuizStarted(true);
    setScore(0);
    setCurrentQuestionIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setQuizCompleted(false);
  };

  const handleOptionSelect = (index) => {
    if (isAnswerSubmitted) return;
    setSelectedOptionIndex(index);
  };

  const handleSubmitAnswer = (timeout = false) => {
    if (isAnswerSubmitted) return;
    clearInterval(timerRef.current);

    const question = questions[currentQuestionIndex];
    const isCorrect = !timeout && selectedOptionIndex === question.correctIndex;

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setIsAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOptionIndex(null);
      setIsAnswerSubmitted(false);
    } else {
      // Quiz finished! Calculate and sync with context
      setQuizCompleted(true);
      const finalScore = score + (selectedOptionIndex === questions[currentQuestionIndex].correctIndex && !isAnswerSubmitted ? 1 : 0);
      const results = completeQuiz(currentNode.id, currentDomain.id, finalScore, questions.length);
      setQuizResults(results);
    }
  };

  const getDomainNodes = () => {
    const d = DOMAINS.find(dom => dom.id === selectedDomainId);
    return d ? d.nodes : [];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {/* Intro Hub if Quiz not started */}
      {!quizStarted && !quizCompleted && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-md text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-600 mb-6">
            <GraduationCap size={32} />
          </div>

          <h2 className="text-2xl font-black text-slate-800 dark:text-white">Quiz Arena</h2>
          <p className="text-slate-500 text-xs mt-2 max-w-md mx-auto leading-relaxed">
            Test your expertise. Pass the module tests with a score of **60% or higher** to unlock the subsequent topics. If you fail, you will lose a heart life.
          </p>

          {/* Direct parameters selection mapping */}
          {!nodeId && (
            <div className="my-8 max-w-sm mx-auto space-y-4 text-left">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Select Domain</label>
                <select
                  value={selectedDomainId}
                  onChange={(e) => {
                    setSelectedDomainId(e.target.value);
                    // auto reset node selector
                    const dom = DOMAINS.find(d => d.id === e.target.value);
                    if (dom && dom.nodes.length > 0) setSelectedNodeId(dom.nodes[0].id);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {DOMAINS.map(d => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1 uppercase">Select Node Module</label>
                <select
                  value={selectedNodeId}
                  onChange={(e) => setSelectedNodeId(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {getDomainNodes().map(n => (
                    <option key={n.id} value={n.id}>{n.title}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {nodeId && (
            <div className="my-6 bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-100 dark:border-slate-850 inline-block text-left text-xs">
              <span className="text-slate-400 font-bold block">Selected Module:</span>
              <span className="font-extrabold text-slate-800 dark:text-white text-sm mt-0.5 block">{currentNode.title}</span>
              <span className="text-[10px] text-slate-400">{currentDomain.title}</span>
            </div>
          )}

          <div className="flex gap-4 max-w-sm mx-auto mt-6">
            <button
              onClick={() => navigate('/roadmap')}
              className="flex-1 py-3 border border-slate-250 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-semibold cursor-pointer"
            >
              Back to Roadmap
            </button>
            <button
              onClick={startQuiz}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              Start Quiz Arena
            </button>
          </div>
        </div>
      )}

      {/* Active Question Arena */}
      {quizStarted && !quizCompleted && (
        <div className="space-y-6">
          {/* Progress header */}
          <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-3 rounded-2xl shadow-sm">
            <span className="text-xs font-bold text-slate-500">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>

            {/* Timer visual block */}
            <div className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-200 font-extrabold">
              <Timer size={16} className={timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-indigo-500"} />
              <span className={timeLeft <= 10 ? "text-red-500" : ""}>{timeLeft}s</span>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md">
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base md:text-lg mb-6 leading-relaxed">
              {questions[currentQuestionIndex].question}
            </h3>

            {/* Options List */}
            <div className="space-y-3">
              {questions[currentQuestionIndex].options.map((option, index) => {
                const isSelected = selectedOptionIndex === index;
                const isCorrect = index === questions[currentQuestionIndex].correctIndex;

                let optionStyle = "border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-700 dark:text-slate-300";
                
                if (isAnswerSubmitted) {
                  if (isCorrect) {
                    optionStyle = "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold shadow-sm";
                  } else if (isSelected) {
                    optionStyle = "border-red-500 bg-red-500/10 text-red-600 dark:text-red-400 font-extrabold";
                  } else {
                    optionStyle = "border-slate-100 dark:border-slate-850 opacity-50 text-slate-400";
                  }
                } else if (isSelected) {
                  optionStyle = "border-indigo-600 ring-2 ring-indigo-500/50 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 font-bold";
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionSelect(index)}
                    disabled={isAnswerSubmitted}
                    className={`w-full p-4 rounded-2xl border text-left text-xs transition-all duration-150 flex items-center justify-between ${
                      !isAnswerSubmitted ? 'cursor-pointer' : ''
                    } ${optionStyle}`}
                  >
                    <span>{option}</span>
                    {isAnswerSubmitted && isCorrect && <CheckCircle size={16} className="text-emerald-500 shrink-0" />}
                    {isAnswerSubmitted && isSelected && !isCorrect && <XCircle size={16} className="text-red-500 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Answer Explanation panel after submit */}
            {isAnswerSubmitted && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 rounded-2xl text-xs"
              >
                <span className="font-bold text-slate-400 block mb-1 uppercase text-[10px]">Reference Explanation:</span>
                <p className="text-slate-600 dark:text-slate-450 leading-relaxed">
                  {questions[currentQuestionIndex].explanation}
                </p>
              </motion.div>
            )}

            {/* Action Bar */}
            <div className="mt-8 flex justify-end">
              {!isAnswerSubmitted ? (
                <button
                  onClick={() => handleSubmitAnswer(false)}
                  disabled={selectedOptionIndex === null}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md shadow-indigo-600/10 transition-colors ${
                    selectedOptionIndex === null 
                      ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-400 shadow-none' 
                      : 'bg-indigo-600 hover:bg-indigo-500 cursor-pointer'
                  }`}
                >
                  Submit Answer
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{currentQuestionIndex + 1 === questions.length ? 'Finish Quiz' : 'Next Question'}</span>
                  <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Result Module Screen */}
      {quizCompleted && quizResults && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-md text-center">
          <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center text-3xl mb-4 bg-slate-100 dark:bg-slate-950">
            {quizResults.passed ? "🏆" : "❌"}
          </div>

          <h2 className="text-2xl font-black text-slate-800 dark:text-white">
            {quizResults.passed ? "Prerequisite Unlocked!" : "Quiz Failed"}
          </h2>
          <p className="text-slate-500 text-xs mt-2 leading-relaxed">
            {quizResults.passed 
              ? `Congratulations! You scored ${score}/${questions.length} and unlocked the next nodes. You've earned experience points.`
              : `You scored ${score}/${questions.length} which is below the 60% completion benchmark. Try reviewing study materials before testing again.`
            }
          </p>

          <div className="my-8 max-w-sm mx-auto grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-left">
              <span className="text-[10px] text-slate-450 block uppercase font-bold">XP Gained</span>
              <span className="font-extrabold text-lg text-yellow-500 block">+{quizResults.xpReward} XP</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-left">
              <span className="text-[10px] text-slate-450 block uppercase font-bold">Prerequisites</span>
              <span className={`font-extrabold text-xs block mt-1 ${quizResults.passed ? 'text-emerald-500' : 'text-red-500'}`}>
                {quizResults.passed ? 'UNLOCKED' : 'LOCKED'}
              </span>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex gap-4 max-w-sm mx-auto mt-6">
            <button
              onClick={startQuiz}
              className="flex-1 py-3 border border-slate-250 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} />
              Try Again
            </button>
            <button
              onClick={() => navigate('/roadmap')}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-600/10 cursor-pointer"
            >
              Return to Roadmap
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default Quiz;
