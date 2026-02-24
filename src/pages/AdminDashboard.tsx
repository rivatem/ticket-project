import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Calendar, TrendingUp, Shield, CheckCircle, XCircle, Search } from 'lucide-react';
import { motion } from 'motion/react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'stats' | 'users' | 'events'>('stats');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, eventsRes, transRes] = await Promise.all([
        axios.get('/api/admin/stats'),
        axios.get('/api/admin/users'),
        axios.get('/api/admin/events'),
        axios.get('/api/admin/transactions')
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setEvents(eventsRes.data);
      setTransactions(transRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-zinc-500 font-medium">Loading Admin Panel...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight flex items-center">
              <Shield className="w-10 h-10 text-indigo-600 mr-4" />
              Admin Control Center
            </h1>
            <p className="text-zinc-500 mt-2">Manage users, events, and track platform performance</p>
          </div>
          
          <div className="flex bg-white p-1 rounded-2xl border border-zinc-200 shadow-sm">
            <button 
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'stats' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-900'}`}
            >Overview</button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'users' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-900'}`}
            >Users</button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === 'events' ? 'bg-zinc-900 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-900'}`}
            >Events</button>
          </div>
        </div>

        {activeTab === 'stats' && (
          <div className="space-y-12">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-1">Total Revenue</p>
                <h3 className="text-3xl font-bold text-zinc-900">KES {stats?.totalRevenue?.toLocaleString() || 0}</h3>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-1">Total Users</p>
                <h3 className="text-3xl font-bold text-zinc-900">{stats?.totalUsers || 0}</h3>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-1">Active Events</p>
                <h3 className="text-3xl font-bold text-zinc-900">{stats?.activeEvents || 0}</h3>
              </div>
              <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <p className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-1">Tickets Sold</p>
                <h3 className="text-3xl font-bold text-zinc-900">{stats?.totalTickets || 0}</h3>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-[40px] border border-zinc-200 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-zinc-100 flex justify-between items-center">
                <h3 className="text-xl font-bold text-zinc-900">Recent Transactions</h3>
                <button onClick={fetchData} className="text-indigo-600 font-bold text-sm hover:underline">Refresh</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                      <th className="px-8 py-4">Order ID</th>
                      <th className="px-8 py-4">Customer</th>
                      <th className="px-8 py-4">Event</th>
                      <th className="px-8 py-4">Amount</th>
                      <th className="px-8 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {transactions.length > 0 ? transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-zinc-50/50 transition-colors">
                        <td className="px-8 py-6 font-mono text-sm text-zinc-500">#{tx.orderNumber}</td>
                        <td className="px-8 py-6 font-bold text-zinc-900">{tx.userName}</td>
                        <td className="px-8 py-6 text-zinc-600">{tx.eventTitle}</td>
                        <td className="px-8 py-6 font-bold text-zinc-900">KES {tx.totalAmount.toLocaleString()}</td>
                        <td className="px-8 py-6">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            tx.paymentStatus === 'completed' ? 'bg-emerald-50 text-emerald-600' : 
                            tx.paymentStatus === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                          }`}>
                            {tx.paymentStatus}
                          </span>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-8 py-12 text-center text-zinc-500">No transactions found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-[40px] border border-zinc-200 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-zinc-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-zinc-900">Platform Users</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="bg-zinc-50 border border-zinc-200 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-zinc-50 text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                    <th className="px-8 py-4">Name</th>
                    <th className="px-8 py-4">Email</th>
                    <th className="px-8 py-4">Role</th>
                    <th className="px-8 py-4">Joined</th>
                    <th className="px-8 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="hover:bg-zinc-50/50 transition-colors">
                      <td className="px-8 py-6 font-bold text-zinc-900">{user.name}</td>
                      <td className="px-8 py-6 text-zinc-600">{user.email}</td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-600' : 'bg-zinc-100 text-zinc-600'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-zinc-500 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-8 py-6">
                        <button className="text-zinc-400 hover:text-red-500 transition-colors">
                          <XCircle className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <div key={event.id} className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm flex flex-col">
                <div className="h-40 relative">
                  <img src={event.bannerImage || `https://picsum.photos/seed/${event.id}/800/400`} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-sm ${event.status === 'published' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {event.status}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-grow">
                  <h4 className="font-bold text-zinc-900 mb-2">{event.title}</h4>
                  <p className="text-zinc-500 text-xs mb-4 line-clamp-2">{event.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-100">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Revenue</span>
                    <span className="font-bold text-zinc-900">KES {(event.revenue || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Tickets Sold</span>
                    <span className="font-bold text-zinc-900">{event.ticketsSold || 0}</span>
                  </div>
                </div>
                <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-2">
                  <button className="flex-1 bg-white border border-zinc-200 text-zinc-900 py-2 rounded-xl font-bold text-xs hover:bg-zinc-100 transition-all">Edit</button>
                  <button className="flex-1 bg-red-50 text-red-600 py-2 rounded-xl font-bold text-xs hover:bg-red-100 transition-all">Cancel</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
