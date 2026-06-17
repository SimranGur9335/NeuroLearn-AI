import React, { useEffect, useState } from "react";
import { 
  Users, 
  Sparkles,
  Search,
  UserCheck,
  UserX,
  ShieldAlert
} from "lucide-react";
import { apiFetch } from "../../services/api";

export default function UsersDirectory() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [instFilter, setInstFilter] = useState("all");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await apiFetch("/v1/platform-admin/users");
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
          setFilteredUsers(data);
        } else {
          setError("Failed to load users directory.");
        }
      } catch (err) {
        console.error(err);
        setError("Network error loading users directory.");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filter application
  useEffect(() => {
    let result = users;

    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase();
      result = result.filter(u => 
        u.email.toLowerCase().includes(query) || 
        u.institution_name.toLowerCase().includes(query)
      );
    }

    if (roleFilter !== "all") {
      result = result.filter(u => u.role === roleFilter);
    }

    if (instFilter !== "all") {
      result = result.filter(u => u.institution_name === instFilter);
    }

    setFilteredUsers(result);
  }, [searchTerm, roleFilter, instFilter, users]);

  // Distinct institutions for dropdown
  const institutionsList = Array.from(new Set(users.map(u => u.institution_name)));

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-4">
          <Sparkles className="animate-spin text-indigo-500" size={32} />
          <p className="text-sm font-bold uppercase tracking-wider animate-pulse">Loading Platform Registries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2">
          System Registry <Users className="text-indigo-400" size={24} />
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Master roster of all tenant administrators, faculty, and students registered under isolated scopes.
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-4 rounded-2xl">
          {error}
        </div>
      )}

      {/* Filter panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-900/40 border border-slate-850 p-4 rounded-2xl backdrop-blur-md">
        {/* Search input */}
        <div className="relative flex items-center bg-slate-950/65 border border-slate-800 focus-within:ring-2 focus-within:ring-indigo-500/50 rounded-xl px-3 py-2 transition-all">
          <Search size={16} className="text-slate-500 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Search email, campus..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-200 placeholder-slate-550 focus:outline-none w-full"
          />
        </div>

        {/* Role select */}
        <div className="bg-slate-950/65 border border-slate-800 rounded-xl px-3 py-2 flex items-center">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Roles</option>
            <option value="super_admin" className="bg-slate-900">Platform Admin (super_admin)</option>
            <option value="admin" className="bg-slate-900">Tenant Admin (admin)</option>
            <option value="faculty" className="bg-slate-900">Faculty (faculty)</option>
            <option value="student" className="bg-slate-900">Student (student)</option>
          </select>
        </div>

        {/* Institution select */}
        <div className="bg-slate-950/65 border border-slate-800 rounded-xl px-3 py-2 flex items-center">
          <select 
            value={instFilter}
            onChange={(e) => setInstFilter(e.target.value)}
            className="bg-transparent border-none text-xs text-slate-200 focus:outline-none w-full cursor-pointer"
          >
            <option value="all" className="bg-slate-900">All Campuses</option>
            {institutionsList.map((inst, idx) => (
              <option key={idx} value={inst} className="bg-slate-900">{inst}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Users list table */}
      <div className="bg-slate-900/40 border border-slate-850 rounded-3xl overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-850 bg-slate-950/40">
                <th className="p-4 text-xs font-black uppercase text-slate-400">User Email</th>
                <th className="p-4 text-xs font-black uppercase text-slate-400">Role</th>
                <th className="p-4 text-xs font-black uppercase text-slate-400">Institution association</th>
                <th className="p-4 text-xs font-black uppercase text-slate-400">Date created</th>
                <th className="p-4 text-xs font-black uppercase text-slate-400">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 text-xs">
                    No matching user records located in the registry.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u, idx) => (
                  <tr 
                    key={u.user_id}
                    className={`border-b border-slate-850/50 hover:bg-slate-900/20 transition-colors ${
                      idx % 2 === 0 ? "bg-slate-900/10" : ""
                    }`}
                  >
                    <td className="p-4">
                      <span className="text-xs font-bold text-white font-mono">{u.email}</span>
                    </td>
                    <td className="p-4">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                        u.role === 'super_admin' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                        u.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        u.role === 'faculty' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' :
                        'bg-slate-550/10 text-slate-400 border border-slate-800'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs font-semibold text-slate-300">{u.institution_name}</span>
                    </td>
                    <td className="p-4">
                      <span className="text-xs text-slate-400 font-mono">
                        {new Date(u.created_at).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-xs">
                        {u.is_active !== false ? (
                          <>
                            <UserCheck size={14} className="text-emerald-500" />
                            <span className="text-slate-400 text-[10px]">Active</span>
                          </>
                        ) : (
                          <>
                            <UserX size={14} className="text-slate-650" />
                            <span className="text-slate-600 text-[10px]">Inactive</span>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
