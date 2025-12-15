'use client';

import React, { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import Dashboard from '@/components/Dashboard';
import CircleDetail from '@/components/CircleDetail';
import api from '@/lib/api';
import { Circle, User, CircleDetails } from '@/lib/types';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedCircleId, setSelectedCircleId] = useState<number | null>(null);
  const [selectedCircleData, setSelectedCircleData] = useState<CircleDetails | null>(null);
  const [circles, setCircles] = useState<Circle[]>([]);
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = async () => {
    // TODO: Real sign-in form
    const result = await api.login('john@example.com', 'password');
    if (result.success) {
      setUser(result.user);
      setIsLoggedIn(true);
      const userCircles = await api.getCircles();
      setCircles(userCircles);
    }
  };

  const handleSignup = async () => {
    // TODO: Real Sign-up form
    const result = await api.signup('John Doe', 'john@example.com', 'password');
    if (result.success) {
      setUser(result.user);
      setIsLoggedIn(true);
      const userCircles = await api.getCircles();
      setCircles(userCircles);
    }
  };

  const handleLogout = async () => {
    await api.logout();
    setIsLoggedIn(false);
    setSelectedCircleId(null);
    setSelectedCircleData(null);
    setCircles([]);
    setUser(null);
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
      alert(result.message || 'Bid placed successfully');
    }
  };

  if (!isLoggedIn) {
    return <LandingPage onLogin={handleLogin} onSignup={handleSignup} />;
  }

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
        onSelectCircle={handleSelectCircle}
        onLogout={handleLogout}
        user={user}
      />
    );
  }

  return null;
}