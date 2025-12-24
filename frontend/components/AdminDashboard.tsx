import React, { useState } from 'react';
import { Users, DollarSign, TrendingUp, Shield, Search, AlertTriangle, Trash2, Ban, CheckCircle, LogOut, Eye } from 'lucide-react';
import { AdminStats, AdminUser, AdminCircle } from '@/lib/adminTypes';

interface AdminDashboardProps {
  stats: AdminStats;
  users: AdminUser[];
  circles: AdminCircle[];
  onSuspendUser: (userId: number, reason: string) => Promise<void>;
  onUnsuspendUser: (userId: number) => Promise<void>;
  onDeleteUser: (userId: number) => Promise<void>;
  onDeleteCircle: (circleId: number) => Promise<void>;
  onViewCircle: (circleId: number) => void;
  onLogout: () => void;
}

export default function AdminDashboard({
  stats,
  users,
  circles,
  onSuspendUser,
  onUnsuspendUser,
  onDeleteUser,
  onDeleteCircle,
  onViewCircle,
  onLogout
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'circles'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCircles = circles.filter(circle =>
    circle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    circle.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSuspend = (userId: number) => {
    setSelectedUserId(userId);
    setShowSuspendModal(true);
  };

  const submitSuspension = async () => {
    if (selectedUserId && suspensionReason.trim()) {
      await onSuspendUser(selectedUserId, suspensionReason);
      setShowSuspendModal(false);
      setSelectedUserId(null);
      setSuspensionReason('');
    }
  };

  const handleDelete = async (userId: number, userName: string) => {
    if (window.confirm(`Are you sure you want to permanently delete user "${userName}"? This action cannot be undone.`)) {
      await onDeleteUser(userId);
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
            <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeUsers} active • {stats.suspendedUsers} suspended
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Total Circles</h3>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalCircles}</p>
            <p className="text-xs text-gray-500 mt-1">Rotating circles</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Funds Circulating</h3>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.totalFundsCirculating.toLocaleString()} CHF</p>
            <p className="text-xs text-gray-500 mt-1">Total in circles</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-600">Avg Circle Size</h3>
              <Users className="w-5 h-5 text-orange-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.averageCircleSize}</p>
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
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map(user => (
                  <tr key={user.id} className={user.isSuspended ? 'bg-red-50' : 'hover:bg-gray-50'}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.registrationDate}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{user.lastLogin}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{user.totalCircles}</td>
                    <td className="px-6 py-4">
                      {user.isSuspended ? (
                        <div>
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                            Suspended
                          </span>
                          {user.suspensionReason && (
                            <p className="text-xs text-red-600 mt-1">{user.suspensionReason}</p>
                          )}
                        </div>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        {user.isSuspended ? (
                          <button
                            onClick={() => onUnsuspendUser(user.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Unsuspend user"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSuspend(user.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                            title="Suspend user"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(user.id, user.name)}
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
                    <td className="px-6 py-4 text-sm text-gray-600">{circle.creatorName}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{circle.members}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {circle.completedPeriods} / {circle.totalPeriods}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {circle.totalFunds.toLocaleString()} CHF
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

      {/* Suspend User Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Suspend User</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Provide a reason for suspending this user. They will be unable to access their account until unsuspended.
            </p>
            <textarea
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              placeholder="e.g., Multiple late payments, fraudulent activity..."
              className="w-full px-3 py-2 border border-gray-300 text-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={submitSuspension}
                disabled={!suspensionReason.trim()}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
              >
                Suspend User
              </button>
              <button
                onClick={() => {
                  setShowSuspendModal(false);
                  setSelectedUserId(null);
                  setSuspensionReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}