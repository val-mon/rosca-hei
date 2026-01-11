import React, { useState } from 'react';
import { Users, DollarSign, TrendingUp, Shield, Search, Trash2, LogOut, Eye } from 'lucide-react';
import { AdminStats, AdminUser, AdminCircle } from '@/lib/adminTypes';

interface AdminDashboardProps {
  stats: AdminStats;
  users: AdminUser[];
  circles: AdminCircle[];
  onDeleteUser: (userEmail: string) => Promise<void>;
  onDeleteCircle: (circleId: number) => Promise<void>;
  onViewCircle: (circleId: number) => void;
  onLogout: () => void;
}

export default function AdminDashboard({
  stats,
  users,
  circles,
  onDeleteUser,
  onDeleteCircle,
  onViewCircle,
  onLogout
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'circles'>('users');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCircles = circles.filter(circle =>
    circle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    circle.creator.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (userEmail: string, userName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
      await onDeleteUser(userEmail);
    }
  };

  const handleDeleteCircle = async (circleId: number, circleName: string) => {
    if (window.confirm(`Are you sure you want to delete circle "${circleName}"? All members will be removed.`)) {
      await onDeleteCircle(circleId);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-white" />
            <div>
              <span className="text-2xl font-bold text-white">Admin Panel</span>
              <p className="text-xs text-indigo-100">System Administration</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Total Users</h3>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total_users}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Total Circles</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total_circles}</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Funds Circulating</h3>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.funds_circulating.toLocaleString()} CHF</p>
            <p className="text-xs text-gray-500 mt-1">Total in circles</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Avg Circle Size</h3>
              <Users className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.average_circle_size}</p>
            <p className="text-xs text-gray-500 mt-1">members per circle</p>
          </div>
        </div>

        {/* Search and Tabs */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                  activeTab === 'users'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Users ({users.length})
              </button>
              <button
                onClick={() => setActiveTab('circles')}
                className={`px-4 py-2 font-semibold rounded-lg transition-colors ${
                  activeTab === 'circles'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Circles ({circles.length})
              </button>
            </div>
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Users Table */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">User</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Registration</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Last Login</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Circles</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className='hover:bg-gray-50'>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{user.username}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.registrationDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.lastLogin}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{user.totalCircles}</td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDelete(user.email, user.username)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete user"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Circles Table */}
        {activeTab === 'circles' && (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Circle</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Creator</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Members</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Progress</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Total Funds</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCircles.map(circle => (
                  <tr key={circle.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{circle.name}</div>
                        <div className="text-xs text-gray-500">
                          Created: {circle.createdDate}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{circle.creator}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{circle.members}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {circle.completed_periods} / {circle.total_periods}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {circle.total_funds ? circle.total_funds.toLocaleString() : 0} CHF
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          circle.payoutMode === 'auction' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {circle.payoutMode}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onViewCircle(circle.id)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="View circle details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCircle(circle.id, circle.name)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete circle"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
