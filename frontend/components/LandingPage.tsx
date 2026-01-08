import React, { useState, useEffect, useRef } from 'react';
import { Users, Calendar, TrendingUp } from 'lucide-react';

interface LandingPageProps {
  onSendLoginCode: (email: string) => void;
  onLogin: (email: string, otp: string) => void;
  onSignup: (email: string, username: string, consent: boolean) => void;
}

export default function LandingPage({ onLogin, onSendLoginCode, onSignup }: LandingPageProps) {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showSignupModal, setShowSignupModal] = useState(false);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [otp, setOtp] = useState("");
  const [consent, setConsent] = useState(false);

  const handleLogin = async () => {
    setShowLoginModal(true);
  }

  const handleSignup = async () => {
    setShowSignupModal(true);
  }

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
              onClick={handleLogin}
              className="px-4 py-2 text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={handleSignup}
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
            onClick={handleSignup}
            className="px-8 py-4 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer"
          >
            Get Started Now
          </button>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Login</h3>
              <p className='text-gray-900 mt-4'>Email</p>
            <textarea
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@rosca-hei.com"
              className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={1}
            />

            {!otpSent && (
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => {onSendLoginCode(email);setOtpSent(true);}}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 cursor-pointer"
              >
                Send Code
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  setOtpSent(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>)}

            {otpSent && (
              <div>
                <p className='text-gray-900 mt-4'>Login code</p>
                <textarea
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  rows={1}
                  maxLength={6}
                />
              </div>
            )}

            {otpSent && (
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => {
                  onLogin(email, otp);
                  setShowLoginModal(false);
                }}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 cursor-pointer"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>)}

          </div>
        </div>
      )}

      {/* Signup Modal */}
      {showSignupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Signup</h3>
            <p className='text-gray-900 mt-4'>Email</p>
            <textarea
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@rosca-hei.com"
              className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={1}
            />
            <p className='text-gray-900 mt-4'>Username</p>
            <textarea
              onChange={(e) => setUsername(e.target.value)}
              placeholder="JohnDoe49"
              className="w-full px-3 py-2 text-gray-600 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={1}
            />
            <div className="flex items-center gap-2 mt-4">
            <input
              type="checkbox"
              id="chx-consent"
              name="chx-consent"
              className="h-4 w-4 text-teal-600 focus:ring-teal-500"
              onChange={(e) => setConsent(e.target.checked)}
            />
            <label htmlFor="chx-consent" className="text-gray-900">
              Confidentiality consent
            </label>
          </div>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => {
                  onSignup(email, username, consent);
                  setShowSignupModal(false);
                }}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 cursor-pointer"
              >
                Signup
              </button>
              <button
                onClick={() => {
                  setShowSignupModal(false);
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
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
