// app/page.tsx
'use client';

import React, { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import CircleDetail from '@/components/CircleDetail';
import AdminDashboard from '@/components/AdminDashboard';
import api from '@/lib/api';
import { Circle, User, CircleDetails } from '@/lib/types';
import { AdminStats, AdminUser, AdminCircle } from '@/lib/adminTypes';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedCircleId, setSelectedCircleId] = useState<number | null>(null);
  const [selectedCircleData, setSelectedCircleData] = useState<CircleDetails | null>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [userToken, setUserToken] = useState('');
  const [activeAuctions, setActiveAuctions] = useState<any[]>([]);

  // Admin states
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminCircles, setAdminCircles] = useState<AdminCircle[]>([]);

  const handleSendLoginCode = async (email: string) => {
    const result = await api.sendCode(email);
  };

  const handleLogin = async (email: string, otp: string) => {    
    const result = await api.login(email, otp);
    if (result.success) {
      setUser(result.user ?? null);
      setUserToken(result.user_token ?? '');
      setIsLoggedIn(true);
      
      if (result.user?.email === 'admin@rosca-hei.com') {
        setIsAdmin(true);
        const stats = await api.getAdminStats(result.user_token ?? '');
        const users = await api.getAllUsers(result.user_token ?? '');
        const circles = await api.getAllCircles(result.user_token ?? '');
        setAdminStats(stats);
        setAdminUsers(users);
        setAdminCircles(circles);
      } else {
        const userCircles = await api.getCircles(result.user_token ?? '');
        const auctions = await api.getUserActiveAuctions(result.user_token ?? '');
        setCircles(userCircles);
        setActiveAuctions(auctions);
      }
    }
  };

  const handleSignup = async (email: string, username: string, consent: boolean) => {
    // In a real app, you would show a signup form and get user data
    // For now, we're simulating with dummy data
    const result = await api.signup(username, email, consent);
    if (result.success) {
      const token = result.user_token || '';
      setUserToken(token);
      setUser(result.user || null);
      setIsLoggedIn(true);
      const userCircles = await api.getCircles(token);
      const auctions = await api.getUserActiveAuctions(token);
      setCircles(userCircles);
      setActiveAuctions(auctions);
    }
  };

  const handleLogout = async () => {
    await api.logout(userToken);
    setIsLoggedIn(false);
    setIsAdmin(false);
    setSelectedCircleId(null);
    setSelectedCircleData(null);
    setCircles([]);
    setUser(null);
    setUserToken('');
    setActiveAuctions([]);
    setAdminStats(null);
    setAdminUsers([]);
    setAdminCircles([]);
  };

  const handleSelectCircle = async (circleId: number) => {
    const circleData = await api.getCircleDetails(userToken, circleId);
    setSelectedCircleData(circleData);
    setSelectedCircleId(circleId);
  };

  const handleCreateCircle = async (circleName: string) => {
    const result = await api.createCircle(userToken, circleName);
  }

  const handleJoinCircle = async (joinCode: string) => {
    const result = await api.joinCircle(userToken, joinCode);
  }

  const handleBackToDashboard = () => {
    setSelectedCircleId(null);
    setSelectedCircleData(null);
  };

  const handlePayment = async (circleId: number, periodDate: string) => {
    const result = await api.makePayment(userToken, circleId, periodDate);
    if (result.success) {
      // Refresh circles data
      const userCircles = await api.getCircles(userToken);
      setCircles(userCircles);
      // Refresh circle details
      const circleData = await api.getCircleDetails(userToken, circleId);
      setSelectedCircleData(circleData);
      // Refresh active auctions
      const auctions = await api.getUserActiveAuctions(userToken);
      setActiveAuctions(auctions);
      alert(result.message || 'Payment successful!');
    }
  };

  const handleKickMember = async (circleId: number, memberId: number) => {
    const result = await api.kickMember(userToken, circleId, memberId);
    if (result.success) {
      // Refresh circle details
      const circleData = await api.getCircleDetails(userToken, circleId);
      setSelectedCircleData(circleData);
      alert(result.message || 'Member removed successfully');
    }
  };

  const handleUpdateCircleName = async (circleId: number, newName: string) => {
    const result = await api.updateCircleName(userToken, circleId, newName);
    if (result.success) {
      // Refresh circles data
      const userCircles = await api.getCircles(userToken);
      setCircles(userCircles);
      // Refresh circle details
      const circleData = await api.getCircleDetails(userToken, circleId);
      setSelectedCircleData(circleData);
      alert(result.message || 'Circle name updated successfully');
    }
  };

  const handlePlaceBid = async (circleId: number, periodDate: string, bidAmount: number) => {
    const result = await api.placeBid(userToken, circleId, periodDate, bidAmount);
    if (result.success) {
      // Refresh circle details to show updated auction
      const circleData = await api.getCircleDetails(userToken, circleId);
      setSelectedCircleData(circleData);
      // Refresh active auctions
      const auctions = await api.getUserActiveAuctions(userToken);
      setActiveAuctions(auctions);
      alert(result.message || 'Bid placed successfully');
    }
  };

  // Admin handlers
  const handleDeleteUser = async (userEmail: string) => {
    const result = await api.deleteUser(userToken, userEmail);
    if (result.success) {
      const users = await api.getAllUsers(userToken);
      const stats = await api.getAdminStats(userToken);
      setAdminUsers(users);
      setAdminStats(stats);
      alert(result.message || 'User deleted successfully');
    }
  };

  const handleDeleteCircle = async (circleId: number) => {
    const result = await api.deleteCircle(userToken, circleId);
    if (result.success) {
      const circles = await api.getAllCircles(userToken);
      const stats = await api.getAdminStats(userToken);
      setAdminCircles(circles);
      setAdminStats(stats);
      alert(result.message || 'Circle deleted successfully');
    }
  };

  const handleViewCircleFromAdmin = async (circleId: number) => {
    const circleData = await api.getCircleDetails(userToken, circleId);
    setSelectedCircleData(circleData);
    setSelectedCircleId(circleId);
  };

  if (!isLoggedIn) {
    return <LandingPage onLogin={handleLogin} onSendLoginCode={handleSendLoginCode} onSignup={handleSignup} />;
  }

  // Admin viewing a specific circle
  if (isAdmin && selectedCircleId && adminStats) {
    const selectedCircle = adminCircles.find(c => c.id === selectedCircleId);
    if (!selectedCircle) return null;

    return (
      <CircleDetail
        circleId={selectedCircleId}
        circleName={selectedCircle.name}
        circleMembers={selectedCircle.members}
        contributionAmount={selectedCircle.contributionAmount}
        nextDueDate={selectedCircle.nextDueDate}
        circleData={selectedCircleData}
        isAdmin={true}
        userHasPaid={true}
        amountOwed={0}
        payoutMode={selectedCircle.payoutMode}
        onBack={() => {
          setSelectedCircleId(null);
          setSelectedCircleData(null);
        }}
        onPayment={async () => {}}
        onKickMember={handleKickMember}
        onUpdateCircleName={handleUpdateCircleName}
        onPlaceBid={async () => {}}
      />
    );
  }

  // Admin dashboard
  if (isAdmin && adminStats) {
    return (
      <AdminDashboard
        stats={adminStats}
        users={adminUsers}
        circles={adminCircles}
        onDeleteUser={handleDeleteUser}
        onDeleteCircle={handleDeleteCircle}
        onViewCircle={handleViewCircleFromAdmin}
        onLogout={handleLogout}
      />
    );
  }

  // Regular user viewing a specific circle
  if (selectedCircleId && user) {
    const selectedCircle = circles.find(c => c.id === selectedCircleId);
    if (!selectedCircle) return null;

    return (
      <CircleDetail
        circleId={selectedCircleId}
        circleName={selectedCircle.name}
        circleMembers={selectedCircle.members}
        contributionAmount={selectedCircle.contributionAmount}
        nextDueDate={selectedCircle.nextDueDate}
        circleData={selectedCircleData}
        isAdmin={selectedCircle.isAdmin}
        userHasPaid={selectedCircle.userHasPaid}
        amountOwed={selectedCircle.amountOwed}
        payoutMode={selectedCircle.payoutMode}
        onBack={handleBackToDashboard}
        onPayment={handlePayment}
        onKickMember={handleKickMember}
        onUpdateCircleName={handleUpdateCircleName}
        onPlaceBid={handlePlaceBid}
      />
    );
  }

  if (user) {
    return (
      <Dashboard
        circles={circles}
        activeAuctions={activeAuctions}
        onSelectCircle={handleSelectCircle}
        onLogout={handleLogout}
        onCreateCircle={handleCreateCircle}
        onJoinCircle={handleJoinCircle}
        user={user}
      />
    );
  }

  return null;
}
