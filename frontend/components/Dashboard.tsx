import React from 'react';
import { Users, DollarSign, TrendingUp, LogOut } from 'lucide-react';
import { Circle, User } from '@/lib/types';

interface DashboardProps {
  circles: Circle[];
  onSelectCircle: (circleId: number) => void;
  onLogout: () => void;
  user: User;
}

export default function Dashboard({ circles, onSelectCircle, onLogout, user }: DashboardProps) {
  const totalDueNext2Weeks = circles.reduce((sum, circle) => {
    const dueDate = new Date(circle.nextDueDate);
    const today = new Date();
    const twoWeeksFromNow = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    if (dueDate <= twoWeeksFromNow) {
      return sum + circle.contributionAmount;
    }
    return sum;
  }, 0);

  const totalPayoutNext2Weeks = circles.reduce((sum, circle) => sum + circle.upcomingPayout, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Users className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">ROSCA-HEI</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">Welcome, {user.name}</span>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Dashboard</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Total Due Next 2 Weeks</h3>
              <DollarSign className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalDueNext2Weeks} CHF</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Expected Payout</h3>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-gray-900">{totalPayoutNext2Weeks} CHF</p>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Circles</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {circles.map(circle => (
            <div
              key={circle.id}
              onClick={() => onSelectCircle(circle.id)}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{circle.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${circle.payoutMode === 'auction' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                    {circle.payoutMode}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Members:</span>
                  <span className="font-medium text-gray-900">{circle.members}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contribution:</span>
                  <span className="font-medium text-gray-900">{circle.contributionAmount} CHF</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Due:</span>
                  <span className="font-medium text-gray-900">{circle.nextDueDate}</span>
                </div>
                {circle.upcomingPayout > 0 && (
                  <div className="flex justify-between pt-2 border-t">
                    <span>Your Payout:</span>
                    <span className="font-bold text-green-600">{circle.upcomingPayout} CHF</span>
                  </div>
                )}
                {circle.amountOwed > 0 && (
                  <div className="flex justify-between pt-2 border-t">
                    <span>Amount Owed:</span>
                    <span className="font-bold text-red-600">{circle.amountOwed} CHF</span>
                  </div>
                )}
              </div>

              {!circle.userHasPaid && circle.amountOwed > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('Pay contribution for circle:', circle.id);
                  }}
                  className="w-full mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium cursor-pointer"
                >
                  Pay {circle.amountOwed} CHF
                </button>
              )}
              {circle.userHasPaid && (
                <div className="mt-4 flex items-center justify-center text-green-600 text-sm font-medium">
                  <span className="w-5 h-5 mr-2">✓</span>
                  Paid for this period
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div >
  );
}