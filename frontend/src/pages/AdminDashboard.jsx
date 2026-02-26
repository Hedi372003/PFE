import React, { useEffect, useState, useRef } from "react";
import {
  LayoutDashboard, Users, Gamepad2, Bot, Plus, ClipboardList,
  Settings, Bell, Pencil, Trash2, ChevronLeft, LogOut, User as UserIcon
} from "lucide-react";
import RobotsPage from "./RobotsPage";

export default function AdminDashboard({ onLogout, user }) {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [users, setUsers] = useState([]);
  const [robotsCount, setRobotsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("list");
  const [editingUser, setEditingUser] = useState(null);

  // États pour les menus déroulants (dropdowns)
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const [formData, setFormData] = useState({
    name: "", email: "", password: "", role: "operator",
  });

  // Notifications simulées (comme sur votre image)
  const notifications = [
    { id: 1, text: "Robot R-001 went offline", time: "2 min ago", type: "alert" },
    { id: 2, text: "New user registered", time: "15 min ago", type: "info" },
    { id: 3, text: "Robot R-003 battery low", time: "1 hr ago", type: "warning" },
    { id: 4, text: "System update completed", time: "3 hr ago", type: "success" },
  ];

  useEffect(() => {
    fetchUsers();
    fetchRobotsCount();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchRobotsCount = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/robots");
      const data = await res.json();
      if (Array.isArray(data)) setRobotsCount(data.length);
    } catch (err) { console.error(err); }
  };

  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { key: "users", label: "Users", icon: <Users size={20} /> },
    { key: "robot-control", label: "Robot Control", icon: <Gamepad2 size={20} /> },
    { key: "robots", label: "Robots", icon: <Bot size={20} /> },
    { key: "requests", label: "Requests", icon: <ClipboardList size={20} /> },
    { key: "settings", label: "Settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-[#f8fafc] font-sans text-slate-900">
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#0b1426] text-gray-400 flex flex-col fixed h-full">
        <div className="p-6 flex items-center gap-3 text-white text-xl font-bold border-b border-slate-800">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white">
            <Bot size={22} />
          </div>
          TeleBot
        </div>
        <nav className="px-4 py-6 space-y-1 flex-1">
          {menuItems.map((item) => (
            <div
              key={item.key}
              onClick={() => { setActiveMenu(item.key); setView("list"); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                activeMenu === item.key 
                ? "bg-blue-600/10 text-blue-400 border border-blue-600/20" 
                : "hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="text-sm font-semibold">{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col ml-64">
        {/* HEADER */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-30">
          <h1 className="text-xl font-bold text-slate-800 capitalize">{activeMenu}</h1>
          
          <div className="flex items-center gap-4">
            {/* Notifications Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition"
              >
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded-full border-2 border-white">2</span>
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 border-b font-bold text-slate-800">Notifications</div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition">
                        <p className="text-sm text-slate-700 font-medium">{n.text}</p>
                        <p className="text-xs text-slate-400 mt-1">{n.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-2 p-1 pr-3 hover:bg-slate-100 rounded-full transition"
              >
                <div className="bg-[#1e2a4a] text-white w-9 h-9 flex items-center justify-center rounded-full font-bold">
                  {user?.name?.charAt(0) || "A"}
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-3 border-b mb-1">
                    <p className="text-sm font-bold text-slate-800">{user?.name || "Admin"}</p>
                    <p className="text-xs text-slate-500 truncate">{user?.email || "admin@telebot.com"}</p>
                  </div>
                  <button onClick={() => setActiveMenu("settings")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 rounded-lg transition">
                    <Settings size={16} /> Settings
                  </button>
                  <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-lg transition font-medium">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN BODY */}
        <main className="p-8">
          {activeMenu === "dashboard" && (
            <div className="space-y-8">
              <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-slate-800">Admin Dashboard</h2>
                <p className="text-slate-500 text-sm">Manage platform users, assign robots, and monitor system activity.</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: "Total Users", val: users.length, color: "blue" },
                  { label: "Active Robots", val: robotsCount, color: "green" },
                  { label: "Alerts", val: 2, color: "red" }
                ].map((stat, i) => (
                  <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 transition hover:shadow-md">
                    <p className="text-slate-500 font-medium text-sm">{stat.label}</p>
                    <p className="text-4xl font-black mt-2 text-slate-800">{stat.val}</p>
                  </div>
                ))}
              </div>

              {/* User Table inside Dashboard (comme votre image) */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                   <h3 className="font-bold text-slate-800">Recent Users</h3>
                   <button onClick={() => setView("add")} className="bg-[#0b1426] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition">
                      <Plus size={16} /> Add User
                   </button>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-8 py-4">Name</th>
                      <th className="px-8 py-4">Email</th>
                      <th className="px-8 py-4">Robot ID</th>
                      <th className="px-8 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {users.slice(0, 4).map((u) => (
                      <tr key={u._id} className="hover:bg-slate-50/50 transition">
                        <td className="px-8 py-4 font-semibold text-slate-700">{u.name}</td>
                        <td className="px-8 py-4 text-slate-500">{u.email}</td>
                        <td className="px-8 py-4">
                          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-xs font-bold border border-blue-100">R-00{Math.floor(Math.random() * 9)}</span>
                        </td>
                        <td className="px-8 py-4 text-right">
                          <div className="flex justify-end gap-3">
                            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Pencil size={18} /></button>
                            <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SETTINGS VIEW (Comme sur votre image) */}
          {activeMenu === "settings" && (
            <div className="max-w-2xl space-y-8">
               <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold text-slate-800">Settings</h2>
                <p className="text-slate-500 text-sm">Configure platform preferences and account details.</p>
              </div>
              
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6">
                <h3 className="font-bold text-lg">Profile</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-500 mb-1.5 block">Display Name</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition" defaultValue="Admin" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-500 mb-1.5 block">Email</label>
                    <input className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500/20 transition" defaultValue="admin@telebot.com" />
                  </div>
                </div>
                <button className="bg-[#0b1426] text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg transition">Update Profile</button>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-lg mb-6">Notifications</h3>
                <div className="space-y-4">
                  {[ "Email Notifications", "Robot Alerts", "System Updates" ].map((label, idx) => (
                    <div key={label} className="flex justify-between items-center py-2">
                      <span className="text-slate-700 font-medium">{label}</span>
                      <div className={`w-12 h-6 rounded-full p-1 cursor-pointer transition ${idx < 2 ? 'bg-blue-600' : 'bg-slate-200'}`}>
                        <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition ${idx < 2 ? 'translate-x-6' : 'translate-x-0'}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeMenu === "robots" && <RobotsPage />}
          {activeMenu === "users" && <div className="p-4 bg-white rounded-3xl border italic text-slate-400">User full list logic here...</div>}
        </main>
      </div>
    </div>
  );
}