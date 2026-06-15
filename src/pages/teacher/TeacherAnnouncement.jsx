import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Bell,
    Send,
    Plus,
    Megaphone
} from "lucide-react";

const TeacherAnnouncements = () => {
    const [activeTab, setActiveTab] =
        useState("received");

    const [stats] = useState({
        received: 0,
        sent: 0,
        unread: 0
    });
    const [targetType, setTargetType] = useState("CLASS");

    const [announcements, setAnnouncements] = useState([]);
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [selectedClass, setSelectedClass] = useState("");

    const loadAnnouncements = async () => {
        try {
            const res = await fetch(
                "http://127.0.0.1:8000/announcements"
            );

            const data = await res.json();

const received = data.filter(
  (ann) => ann.sender_type === "ADMIN"
);

const sent = data.filter(
  (ann) => ann.sender_type === "FACULTY"
);

setAnnouncements(received);
setSentAnnouncements(sent);

            setAnnouncements(received);

        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        loadAnnouncements();
        
    }, []);
    

    const [classes] = useState([
        {
            class_id: 1,
            class_name: "TE Computer A"
        },
        {
            class_id: 2,
            class_name: "TE Computer B"
        }
    ]);
    const [sentAnnouncements, setSentAnnouncements] =
  useState([]);

    const handlePublish = async () => {
        try {
            const res = await fetch(
                "http://127.0.0.1:8000/announcements",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        title,
                        description: message,
                        sender_type: "FACULTY",
                        sender_id: 1,
                        target_type: "CLASS",
                        target_id: Number(selectedClass)
                    })
                }
            );

            const data = await res.json();
            console.log(data);

            alert("Announcement Published Successfully");
            setTitle("");
            setMessage("");
            setSelectedClass("");
            loadAnnouncements();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header */}
            <div>
                <p className="text-xs text-blue-500 font-bold uppercase tracking-wider">
                    Communication Center
                </p>

                <h2 className="text-2xl font-black text-slate-800 dark:text-white">
                    Teacher Announcements
                </h2>

                <p className="text-slate-500 text-sm mt-1">
                    Manage incoming notices and communicate with students.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border">
                    <p className="text-xs text-slate-500">
                        Received
                    </p>
                    <h2 className="text-2xl font-black">
                        {stats.received}
                    </h2>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border">
                    <p className="text-xs text-slate-500">
                        Sent
                    </p>
                    <h2 className="text-2xl font-black">
                        {stats.sent}
                    </h2>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border">
                    <p className="text-xs text-slate-500">
                        Unread
                    </p>
                    <h2 className="text-2xl font-black">
                        {stats.unread}
                    </h2>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setActiveTab("received")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "received"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-slate-900 border"
                        }`}
                >
                    <Bell size={16} className="inline mr-2" />
                    Received
                </button>

                <button
                    onClick={() => setActiveTab("sent")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "sent"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-slate-900 border"
                        }`}
                >
                    <Send size={16} className="inline mr-2" />
                    Sent
                </button>

                <button
                    onClick={() => setActiveTab("compose")}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === "compose"
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-slate-900 border"
                        }`}
                >
                    <Plus size={16} className="inline mr-2" />
                    Compose
                </button>
            </div>

            {/* Received*/}
            {activeTab === "received" && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border">
                    <h3 className="font-bold text-lg mb-4">
                        Admin Announcements
                    </h3>

                    <div className="border rounded-2xl p-4">
                        <div className="flex gap-3 items-center">
                            <Megaphone className="text-blue-500" />
                            <div className="space-y-4">
                                {announcements.map((ann) => (
                                    <div
                                        key={ann.announcement_id}
                                        className="border rounded-2xl p-4 hover:shadow-lg transition-all"
                                    >
                                        <div className="flex gap-3">
                                            <Megaphone className="text-blue-500" />

                                            <div>
                                                <h4 className="font-bold">
                                                    {ann.title}
                                                </h4>

                                                <p className="text-sm text-slate-500">
                                                    {ann.description}
                                                </p>

                                                <div className="text-xs text-slate-400 mt-2">
                                                    {ann.target_type}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Sent */}
            {activeTab === "sent" && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border">
                    <h3 className="font-bold text-lg mb-4">
                        Sent Announcements
                    </h3>

<div className="space-y-4">
  {sentAnnouncements.map((ann) => (
    <div
      key={ann.announcement_id}
      className="border rounded-2xl p-4"
    >
      <h4 className="font-bold">
        {ann.title}
      </h4>

      <p className="text-sm text-slate-500">
        {ann.description}
      </p>

      <div className="text-xs text-slate-400 mt-2">
        Target: {ann.target_type}
      </div>
    </div>
  ))}
</div>
                </div>
            )}

            {/* Compose */}
            {activeTab === "compose" && (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border">
                    <h3 className="font-bold text-lg mb-4">
                        Compose Announcement
                    </h3>

                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Announcement Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border rounded-xl px-4 py-3"
                        />

                        <select
                            value={targetType}
                            className="w-full border rounded-xl px-4 py-3"
                            onChange={(e) =>
                                setTargetType(e.target.value)
                            }
                        >
                            <option value="CLASS">
                                Class
                            </option>

                            <option value="STUDENT">
                                Student
                            </option>
                        </select>

                        {targetType === "CLASS" && (
                            <select
                                value={selectedClass}
                                onChange={(e) => setSelectedClass(e.target.value)}
                                className="w-full border rounded-xl px-4 py-3"
                            >
                                <option value="">Select Class</option>
                                {classes.map((c) => (
                                    <option
                                        key={c.class_id}
                                        value={c.class_id}
                                    >
                                        {c.class_name}
                                    </option>
                                ))}
                            </select>
                        )}
                        <textarea
                            rows="5"
                            placeholder="Announcement Message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="w-full border rounded-xl px-4 py-3"
                        />

                        <button
                            onClick={handlePublish}
                            className="bg-blue-600 text-white px-5 py-3 rounded-xl font-bold"
                        >
                            Publish Announcement
                        </button>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default TeacherAnnouncements;