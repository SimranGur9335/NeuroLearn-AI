import React, { createContext, useContext, useState, useEffect } from 'react';
import { BADGES as INITIAL_BADGES, DOMAINS } from '../data/data';
import { generateStudents, TEACHERS, COURSES } from '../data/academicData';
import { useAuth } from './AuthContext';

const StudentContext = createContext();

export const useStudent = () => useContext(StudentContext);

export const StudentProvider = ({ children }) => {
  const { role: authRole, user } = useAuth() || {};

  // --- Active Persona Role ---
  const [role, setRole] = useState(() => {
    const saved = localStorage.getItem('neurolearn_role');
    return saved !== null ? saved : 'student'; // 'student' | 'teacher' | 'admin'
  });

  const [institution, setInstitution] = useState(() => {
    const saved = localStorage.getItem('neurolearn_institution');
    return saved !== null ? saved : 'coep'; // 'coep' | 'mitwpu' | 'pccoe' | 'vitpune'
  });

  // --- Dynamic Registries (CRUD-able in-memory database) ---
  const [studentsList, setStudentsList] = useState(() => {
    const saved = localStorage.getItem('neurolearn_students');
    return saved !== null ? JSON.parse(saved) : generateStudents();
  });

  const [teachersList, setTeachersList] = useState(() => {
    const saved = localStorage.getItem('neurolearn_teachers');
    return saved !== null ? JSON.parse(saved) : TEACHERS;
  });

  const [coursesList, setCoursesList] = useState(() => {
    const saved = localStorage.getItem('neurolearn_courses');
    return saved !== null ? JSON.parse(saved) : COURSES;
  });

  // --- Original Student Global States ---
  const [profile, setProfile] = useState({
    name: "Aarav Singh",
    branch: "B.Tech Computer Science",
    year: "3rd Year",
    rollNumber: "2023CS8094",
    college: "COEP Technological University",
    email: "student@neurolearn.ai",
    avatar: "🚀"
  });

  // Sync role and profile from AuthContext
  useEffect(() => {
    if (authRole) {
      setRole(authRole);
    }
  }, [authRole]);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || "Aarav Singh",
        branch: user.branch || (user.role === 'student' ? "B.Tech Computer Science" : "Computer Engineering"),
        year: user.year || "3rd Year",
        rollNumber: user.rollNumber || "2023CS8094",
        college: user.college || "COEP Technological University",
        email: user.email || "student@neurolearn.ai",
        avatar: user.avatar || "🚀"
      });
    }
  }, [user]);

  const [xp, setXp] = useState(() => {
    const saved = localStorage.getItem('neurolearn_xp');
    return saved !== null ? parseInt(saved, 10) : 1450;
  });

  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem('neurolearn_streak');
    return saved !== null ? parseInt(saved, 10) : 7;
  });

  const [hearts, setHearts] = useState(() => {
    const saved = localStorage.getItem('neurolearn_hearts');
    return saved !== null ? parseInt(saved, 10) : 3;
  });

  const [badges, setBadges] = useState(() => {
    const saved = localStorage.getItem('neurolearn_badges');
    return saved !== null ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [quizHistory, setQuizHistory] = useState(() => {
    const saved = localStorage.getItem('neurolearn_history');
    return saved !== null ? JSON.parse(saved) : [
      { nodeId: "fs-1", domainId: "full-stack", score: 100, xpEarned: 100, date: "2026-06-06" },
      { nodeId: "cyber-1", domainId: "cybersecurity", score: 100, xpEarned: 100, date: "2026-06-07" }
    ];
  });

  const [nodeStates, setNodeStates] = useState(() => {
    const saved = localStorage.getItem('neurolearn_nodes');
    return saved !== null ? JSON.parse(saved) : {
      "fs-1": "completed",
      "fs-2": "in_progress",
      "fs-3": "locked",
      "fs-4": "locked",
      "aiml-1": "in_progress",
      "aiml-2": "locked",
      "aiml-3": "locked",
      "aiml-4": "locked",
      "cyber-1": "completed",
      "cyber-2": "in_progress",
      "cyber-3": "locked",
      "cyber-4": "locked",
      "cloud-1": "in_progress",
      "cloud-2": "locked",
      "cloud-3": "locked",
      "cloud-4": "locked",
      "devops-1": "in_progress",
      "devops-2": "locked",
      "devops-3": "locked",
      "devops-4": "locked",
      "ds-1": "in_progress",
      "ds-2": "locked",
      "ds-3": "locked",
      "ds-4": "locked"
    };
  });

  const [activeDomain, setActiveDomain] = useState(() => {
    const saved = localStorage.getItem('neurolearn_activedomain');
    return saved !== null ? JSON.parse(saved) : DOMAINS[0];
  });

  const [searchTerm, setSearchTerm] = useState("");

  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('neurolearn_darkmode');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // --- LocalStorage Synchronizers ---
  useEffect(() => {
    localStorage.setItem('neurolearn_role', role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem('neurolearn_institution', institution);
  }, [institution]);

  useEffect(() => {
    localStorage.setItem('neurolearn_students', JSON.stringify(studentsList));
  }, [studentsList]);

  useEffect(() => {
    localStorage.setItem('neurolearn_teachers', JSON.stringify(teachersList));
  }, [teachersList]);

  useEffect(() => {
    localStorage.setItem('neurolearn_courses', JSON.stringify(coursesList));
  }, [coursesList]);

  useEffect(() => {
    localStorage.setItem('neurolearn_xp', xp);
  }, [xp]);

  useEffect(() => {
    localStorage.setItem('neurolearn_streak', streak);
  }, [streak]);

  useEffect(() => {
    localStorage.setItem('neurolearn_hearts', hearts);
  }, [hearts]);

  useEffect(() => {
    localStorage.setItem('neurolearn_badges', JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem('neurolearn_history', JSON.stringify(quizHistory));
  }, [quizHistory]);

  useEffect(() => {
    localStorage.setItem('neurolearn_nodes', JSON.stringify(nodeStates));
  }, [nodeStates]);

  useEffect(() => {
    localStorage.setItem('neurolearn_activedomain', JSON.stringify(activeDomain));
  }, [activeDomain]);

  useEffect(() => {
    localStorage.setItem('neurolearn_darkmode', JSON.stringify(darkMode));
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // --- Student Quiz Arena trigger functions ---
  const completeQuiz = (nodeId, domainId, score, maxQuestions) => {
    const percentage = (score / maxQuestions) * 100;
    const passed = percentage >= 60;
    const xpReward = passed ? Math.round(percentage) : 10;

    if (passed) {
      setNodeStates(prev => {
        const next = { ...prev };
        next[nodeId] = "completed";

        const domain = DOMAINS.find(d => d.id === domainId);
        const nodeIndex = domain.nodes.findIndex(n => n.id === nodeId);
        if (nodeIndex !== -1 && nodeIndex + 1 < domain.nodes.length) {
          const nextNodeId = domain.nodes[nodeIndex + 1].id;
          if (next[nextNodeId] === "locked") {
            next[nextNodeId] = "in_progress";
          }
        }
        return next;
      });

      setStreak(prev => prev + 1);
      setXp(prev => prev + xpReward);
      unlockBadgesCheck(nodeId, domainId, percentage);
    } else {
      setHearts(prev => Math.max(0, prev - 1));
      setXp(prev => prev + xpReward);
    }

    setQuizHistory(prev => [
      { nodeId, domainId, score, xpEarned: xpReward, date: new Date().toISOString().split('T')[0] },
      ...prev
    ]);

    return { passed, xpReward };
  };

  const refillHearts = () => {
    setHearts(3);
    setXp(prev => Math.max(0, prev - 150));
  };

  const unlockBadgesCheck = (nodeId, domainId, percentage) => {
    setBadges(prev => {
      return prev.map(badge => {
        if (badge.id === "b3" && nodeId === "cyber-1" && !badge.unlocked) {
          return { ...badge, unlocked: true };
        }
        if (badge.id === "b4" && domainId === "ai-ml" && percentage === 100 && !badge.unlocked) {
          return { ...badge, unlocked: true };
        }
        if (badge.id === "b5" && nodeId === "devops-2" && !badge.unlocked) {
          return { ...badge, unlocked: true };
        }
        if (badge.id === "b6" && !badge.unlocked) {
          const passedCount = quizHistory.filter(h => (h.score / 3) >= 0.8).length;
          if (passedCount >= 4) {
            return { ...badge, unlocked: true };
          }
        }
        return badge;
      });
    });
  };

  // --- CRUD Operations: Student Registry ---
  const addStudent = (student) => {
    setStudentsList(prev => [student, ...prev]);
  };

  const updateStudent = (id, updatedFields) => {
    setStudentsList(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields } : s));
  };

  const deleteStudent = (id) => {
    setStudentsList(prev => prev.filter(s => s.id !== id));
  };

  // --- CRUD Operations: Teacher Registry ---
  const addTeacher = (teacher) => {
    setTeachersList(prev => [teacher, ...prev]);
  };

  const updateTeacher = (id, updatedFields) => {
    setTeachersList(prev => prev.map(t => t.id === id ? { ...t, ...updatedFields } : t));
  };

  const deleteTeacher = (id) => {
    setTeachersList(prev => prev.filter(t => t.id !== id));
  };

  // --- CRUD Operations: Course Curriculum ---
  const addCourse = (course) => {
    setCoursesList(prev => [course, ...prev]);
  };

  const updateCourse = (id, updatedFields) => {
    setCoursesList(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
  };

  const deleteCourse = (id) => {
    setCoursesList(prev => prev.filter(c => c.id !== id));
  };

  return (
    <StudentContext.Provider value={{
      role,
      setRole,
      institution,
      setInstitution,
      studentsList,
      teachersList,
      coursesList,
      profile,
      setProfile,
      xp,
      setXp,
      streak,
      setStreak,
      hearts,
      setHearts,
      badges,
      nodeStates,
      setNodeStates,
      quizHistory,
      completeQuiz,
      refillHearts,
      activeDomain,
      setActiveDomain,
      searchTerm,
      setSearchTerm,
      darkMode,
      toggleDarkMode,
      addStudent,
      updateStudent,
      deleteStudent,
      addTeacher,
      updateTeacher,
      deleteTeacher,
      addCourse,
      updateCourse,
      deleteCourse
    }}>
      {children}
    </StudentContext.Provider>
  );
};
