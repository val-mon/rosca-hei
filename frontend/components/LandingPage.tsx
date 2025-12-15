import React from 'react';
import { Users, Calendar, TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onLogin: () => void;
  onSignup: () => void;
}

export default function LandingPage({ onLogin, onSignup }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Users className="w-8 h-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">ROSCA-HEI</span>
          </div>
          <div className="space-x-4">
            <button
              onClick={onLogin}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={onSignup}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-sm cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Save Together, Grow Together
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join trusted savings circles with friends, family, or colleagues. Build financial resilience through collaborative rotating savings and credit associations.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Create Circles</h3>
            <p className="text-gray-600">
              Form savings groups with people you trust. Set contribution amounts and payout schedules that work for everyone.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Rotating Payouts</h3>
            <p className="text-gray-600">
              Each period, a different member receives the collective contribution. Fair, transparent, and automated.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Track Progress</h3>
            <p className="text-gray-600">
              Monitor your contributions, upcoming payouts, and circle activity all in one intuitive dashboard.
            </p>
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={onSignup}
            className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            Get Started Now
          </button>
        </div>
      </div>
    </div>
  );
}