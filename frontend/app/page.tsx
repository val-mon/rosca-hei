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
  const [activeAuctions, setActiveAuctions] = useState<any[]>([]);
  
  // Admin states
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [adminCircles, setAdminCircles] = useState<AdminCircle[]>([]);

  const handleLogin = async () => {
    // In a real app, you would show a login form and get credentials
    // For now, we're simulating with dummy data
    const result = await api.login('admin@example.com', 'password');
    console.log(result)
    if (result.success) {
      setUser(result.user);
      setIsLoggedIn(true);
      
      // Check if user is admin (in real app, this would come from backend)
      // For demo: admin@example.com is admin
      if (result.user.email === 'admin@example.com') {
        setIsAdmin(true);
        const stats = await api.getAdminStats();
        const users = await api.getAllUsers();
        const circles = await api.getAllCircles();
        setAdminStats(stats);
        setAdminUsers(users);
        setAdminCircles(circles);
      } else {
        const userCircles = await api.getCircles();
        const auctions = await api.getUserActiveAuctions();
        setCircles(userCircles);
        setActiveAuctions(auctions);
      }
    }
  };

  const handleSignup = async () => {
    // In a real app, you would show a signup form and get user data
    // For now, we're simulating with dummy data
    const result = await api.signup('John Doe', 'john@example.com', 'password');
    if (result.success) {
      setUser(result.user);
      setIsLoggedIn(true);
      const userCircles = await api.getCircles();
      const auctions = await api.getUserActiveAuctions();
      setCircles(userCircles);
      setActiveAuctions(auctions);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setSelectedCircleId(null);
    setSelectedCircleData(null);
    setCircles([]);
    setUser(null);
    setActiveAuctions([]);
    setAdminStats(null);
    setAdminUsers([]);
    setAdminCircles([]);
  };

  const handleSelectCircle = async (circleId: number) => {
    const circleData = await api.getCircleDetails(circleId);
    setSelectedCircleData(circleData);
    setSelectedCircleId(circleId);
  };

  const handleBackToDashboard = () => {
    setSelectedCircleId(null);
    setSelectedCircleData(null);
  };

  const handlePayment = async (circleId: number, amount: number) => {
    const result = await api.makePayment(circleId, amount);
    if (result.success) {
      // Refresh circles data
      const userCircles = await api.getCircles();
      setCircles(userCircles);
      // Refresh circle details
      const circleData = await api.getCircleDetails(circleId);
      setSelectedCircleData(circleData);
      // Refresh active auctions
      const auctions = await api.getUserActiveAuctions();
      setActiveAuctions(auctions);
      alert(result.message || 'Payment successful!');
    }
  };

  const handleKickMember = async (circleId: number, memberId: number) => {
    const result = await api.kickMember(circleId, memberId);
    if (result.success) {
      // Refresh circle details
      const circleData = await api.getCircleDetails(circleId);
      setSelectedCircleData(circleData);
      alert(result.message || 'Member removed successfully');
    }
  };

  const handleFlagMember = async (circleId: number, memberId: number, reason: string) => {
    const result = await api.flagMember(circleId, memberId, reason);
    if (result.success) {
      // Refresh circle details
      const circleData = await api.getCircleDetails(circleId);
      setSelectedCircleData(circleData);
      alert(result.message || 'Member flagged successfully');
    }
  };

  const handleUnflagMember = async (circleId: number, memberId: number) => {
    const result = await api.unflagMember(circleId, memberId);
    if (result.success) {
      // Refresh circle details
      const circleData = await api.getCircleDetails(circleId);
      setSelectedCircleData(circleData);
      alert(result.message || 'Member unflagged successfully');
    }
  };

  const handleUpdateCircleName = async (circleId: number, newName: string) => {
    const result = await api.updateCircleName(circleId, newName);
    if (result.success) {
      // Refresh circles data
      const userCircles = await api.getCircles();
      setCircles(userCircles);
      // Refresh circle details
      const circleData = await api.getCircleDetails(circleId);
      setSelectedCircleData(circleData);
      alert(result.message || 'Circle name updated successfully');
    }
  };

  const handlePlaceBid = async (circleId: number, periodId: number, bidAmount: number) => {
    const result = await api.placeBid(circleId, periodId, bidAmount);
    if (result.success) {
      // Refresh circle details to show updated auction
      const circleData = await api.getCircleDetails(circleId);
      setSelectedCircleData(circleData);
      // Refresh active auctions
      const auctions = await api.getUserActiveAuctions();
      setActiveAuctions(auctions);
      alert(result.message || 'Bid placed successfully');
    }
  };

  // Admin handlers
  const handleSuspendUser = async (userId: number, reason: string) => {
    const result = await api.suspendUser(userId, reason);
    if (result.success) {
      const users = await api.getAllUsers();
      setAdminUsers(users);
      alert(result.message || 'User suspended successfully');
    }
  };

  const handleUnsuspendUser = async (userId: number) => {
    const result = await api.unsuspendUser(userId);
    if (result.success) {
      const users = await api.getAllUsers();
      setAdminUsers(users);
      alert(result.message || 'User unsuspended successfully');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const result = await api.deleteUser(userId);
    if (result.success) {
      const users = await api.getAllUsers();
      const stats = await api.getAdminStats();
      setAdminUsers(users);
      setAdminStats(stats);
      alert(result.message || 'User deleted successfully');
    }
  };

  const handleDeleteCircle = async (circleId: number) => {
    const result = await api.deleteCircle(circleId);
    if (result.success) {
      const circles = await api.getAllCircles();
      const stats = await api.getAdminStats();
      setAdminCircles(circles);
      setAdminStats(stats);
      alert(result.message || 'Circle deleted successfully');
    }
  };

  const handleViewCircleFromAdmin = async (circleId: number) => {
    const circleData = await api.getCircleDetails(circleId);
    setSelectedCircleData(circleData);
    setSelectedCircleId(circleId);
  };

  if (!isLoggedIn) {
    return <LandingPage onLogin={handleLogin} onSignup={handleSignup} />;
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
        onFlagMember={handleFlagMember}
        onUnflagMember={handleUnflagMember}
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
        onSuspendUser={handleSuspendUser}
        onUnsuspendUser={handleUnsuspendUser}
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
        onFlagMember={handleFlagMember}
        onUnflagMember={handleUnflagMember}
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
        user={user}
      />
    );
  }

  return null;
}