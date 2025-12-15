import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Settings, AlertTriangle, UserX, Flag, Edit2, X, Trophy, Gavel, Clock } from 'lucide-react';
import { CircleDetails } from '@/lib/types';

interface CircleDetailProps {
  circleId: number;
  circleName: string;
  circleMembers: number;
  contributionAmount: number;
  nextDueDate: string;
  circleData: CircleDetails | null;
  isAdmin: boolean;
  userHasPaid: boolean;
  amountOwed: number;
  payoutMode: 'random' | 'auction';
  onBack: () => void;
  onPayment: (circleId: number, amount: number) => Promise<void>;
  onKickMember: (circleId: number, memberId: number) => Promise<void>;
  onFlagMember: (circleId: number, memberId: number, reason: string) => Promise<void>;
  onUnflagMember: (circleId: number, memberId: number) => Promise<void>;
  onUpdateCircleName: (circleId: number, newName: string) => Promise<void>;
  onPlaceBid: (circleId: number, periodId: number, bidAmount: number) => Promise<void>;
}

export default function CircleDetail({
  circleId,
  circleName,
  circleMembers,
  contributionAmount,
  nextDueDate,
  circleData,
  isAdmin,
  userHasPaid,
  amountOwed,
  payoutMode,
  onBack,
  onPayment,
  onKickMember,
  onFlagMember,
  onUnflagMember,
  onUpdateCircleName,
  onPlaceBid
}: CircleDetailProps) {
  const [showManageModal, setShowManageModal] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newCircleName, setNewCircleName] = useState(circleName);
  const [selectedMember, setSelectedMember] = useState<number | null>(null);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showAuctionModal, setShowAuctionModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [placingBid, setPlacingBid] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'leaderboard'>('members');

  if (!circleData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading circle details...</p>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    setProcessingPayment(true);
    try {
      await onPayment(circleId, amountOwed);
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleKickMember = async (memberId: number) => {
    if (window.confirm('Are you sure you want to remove this member from the circle?')) {
      await onKickMember(circleId, memberId);
      setSelectedMember(null);
    }
  };

  const handleFlagMember = async (memberId: number) => {
    setSelectedMember(memberId);
    setShowFlagModal(true);
  };

  const submitFlagMember = async () => {
    if (selectedMember && flagReason.trim()) {
      await onFlagMember(circleId, selectedMember, flagReason);
      setShowFlagModal(false);
      setSelectedMember(null);
      setFlagReason('');
    }
  };

  const handleUnflagMember = async (memberId: number) => {
    await onUnflagMember(circleId, memberId);
  };

  const handleUpdateName = async () => {
    if (newCircleName.trim() && newCircleName !== circleName) {
      await onUpdateCircleName(circleId, newCircleName);
      setEditingName(false);
    } else {
      setEditingName(false);
      setNewCircleName(circleName);
    }
  };

  const handlePlaceBid = async () => {
    const amount = parseFloat(bidAmount);
    if (!amount || amount <= 0 || !circleData.currentAuction) return;

    // Validate bid amount
    if (amount >= contributionAmount * circleMembers) {
      alert('Bid amount must be less than the full payout amount');
      return;
    }

    if (circleData.currentAuction.currentHighestBid && amount <= circleData.currentAuction.currentHighestBid) {
      alert('Bid must be higher than the current highest bid');
      return;
    }

    setPlacingBid(true);
    try {
      await onPlaceBid(circleId, circleData.currentAuction.periodId, amount);
      setBidAmount('');
      setShowAuctionModal(false);
    } finally {
      setPlacingBid(false);
    }
  };

  const membersWithLatePayments = circleData.members.filter(m => m.latePayments > 0);
  const totalPenaltiesInCircle = circleData.members.reduce((sum, m) => sum + m.totalPenalties, 0);

  // Sort bids by amount (highest first) for leaderboard
  const sortedBids = circleData.currentAuction
    ? [...circleData.currentAuction.bids].sort((a, b) => b.bidAmount - a.bidAmount)
    : [];

  // Get eligible bidders (haven't received payout this cycle)
  const eligibleBidders = circleData.members.filter(m => !m.hasReceivedPayout);

  // Calculate time remaining for auction
  const getTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { hours, minutes, isExpired: diff <= 0 };
  };

  const periodsContainerRef = useRef<HTMLDivElement | null>(null);
  const currentPeriodRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!periodsContainerRef.current || !currentPeriodRef.current) return;

    const container = periodsContainerRef.current;
    const current = currentPeriodRef.current;

    const containerHeight = container.clientHeight;
    const currentOffset =
      current.offsetTop - container.offsetTop + current.clientHeight / 2;

    container.scrollTop = currentOffset - containerHeight / 2;
  }, [circleData.periods]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setShowManageModal(!showManageModal)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-400 hover:bg-gray-500 cursor-pointer rounded-lg"
            >
              <Settings className="w-4 h-4" />
              <span>Manage Circle</span>
            </button>
          )}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
          <div className="flex items-center justify-between mb-4">
            {editingName ? (
              <div className="flex items-center space-x-2 flex-1">
                <input
                  type="text"
                  value={newCircleName}
                  onChange={(e) => setNewCircleName(e.target.value)}
                  className="text-3xl font-bold text-gray-900 border-b-2 border-indigo-500 focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleUpdateName}
                  className="p-2 text-green-600 hover:bg-green-50 rounded cursor-pointer"
                >
                  ✓
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setNewCircleName(circleName);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">{circleName}</h1>
                {isAdmin && (
                  <button
                    onClick={() => setEditingName(true)}
                    className="p-2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-4 gap-4 text-sm items-center">
            <div className='flex items-center'>
              <span className="text-gray-600">Members:</span>
              <span className="ml-2 font-semibold text-gray-900">{circleMembers}</span>
            </div>
            <div className='flex items-center'>
              <span className="text-gray-600">Contribution:</span>
              <span className="ml-2 font-semibold text-gray-900">{contributionAmount} CHF</span>
            </div>
            <div className='flex items-center'>
              <span className="text-gray-600">Next Due:</span>
              <span className="ml-2 font-semibold text-gray-900">{nextDueDate}</span>
            </div>
            {!userHasPaid && amountOwed > 0 && (
              <div className='flex items-center'>
                <button
                  onClick={handlePayment}
                  disabled={processingPayment}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium cursor-pointer disabled:opacity-50"
                >
                  {processingPayment ? 'Processing...' : `Pay ${amountOwed} CHF`}
                </button>
              </div>
            )}
            {userHasPaid && (
              <div className="flex items-center text-green-600 font-medium">
                <span className="mr-2">✓</span>
                Paid for this period
              </div>
            )}
          </div>
        </div>

        {/* Active Auction Alert */}
        {circleData.currentAuction && circleData.currentAuction.isActive && (
          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 mb-8 rounded">
            <div className="flex items-center justify-between">
              <div className="flex">
                <Gavel className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-indigo-900">Active Auction</h3>
                  <p className="text-sm text-indigo-700 mt-1">
                    Payout Amount: {circleData.currentAuction.payoutAmount} CHF
                    {circleData.currentAuction.currentHighestBid > 0 && (
                      <> • Current Bid: {circleData.currentAuction.currentHighestBid} CHF</>
                    )}
                    {circleData.currentAuction.currentWinner && (
                      <> • Leading: {circleData.currentAuction.currentWinner}</>
                    )}
                  </p>
                  {(() => {
                    const timeLeft = getTimeRemaining(circleData.currentAuction.endDate);
                    return !timeLeft.isExpired && (
                      <p className="text-xs text-indigo-600 mt-1 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        Ends in {timeLeft.hours}h {timeLeft.minutes}m
                      </p>
                    );
                  })()}
                </div>
              </div>
              {!circleData.members.find(m => m.id === 1)?.hasReceivedPayout && (
                <button
                  onClick={() => setShowAuctionModal(true)}
                  className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium text-sm whitespace-nowrap cursor-pointer"
                >
                  {circleData.currentAuction.hasUserBid ? 'Update Bid' : 'Place Bid'}
                </button>
              )}
            </div>
          </div>
        )}

        {membersWithLatePayments.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded">
            <div className="flex">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Late Payments Alert</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  {membersWithLatePayments.length} member{membersWithLatePayments.length > 1 ? 's have' : ' has'} late payments.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex space-x-4 mb-4 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('members')}
                className={`pb-2 px-1 font-semibold ${activeTab === 'members'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700 cursor-pointer'
                  }`}
              >
                Members
              </button>
              {payoutMode === 'auction' && circleData.currentAuction && circleData.currentAuction.isActive && (
                <button
                  onClick={() => setActiveTab('leaderboard')}
                  className={`pb-2 px-1 font-semibold flex items-center ${activeTab === 'leaderboard'
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 cursor-pointer'
                    }`}
                >
                  <Trophy className="w-4 h-4 mr-1" />
                  Auction Standings
                </button>
              )}
            </div>

            {activeTab === 'members' ? (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      {isAdmin && (
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                </table>

                <div className="max-h-[360px] overflow-y-auto">
                  <table className="w-full table-fixed">
                    <tbody className="divide-y divide-gray-200">
                      {circleData.members.map(member => (
                        <tr key={member.id} className={member.isFlagged ? 'bg-red-50' : ''}>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                  {member.name}
                                  {member.isFlagged && (
                                    <Flag className="w-3 h-3 text-red-500 ml-2" />
                                  )}
                                  {member.hasReceivedPayout && (
                                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                      Received
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500">{member.email}</div>
                                {member.latePayments > 0 && (
                                  <div className="text-xs text-red-600 mt-1">
                                    {member.latePayments} late payment{member.latePayments > 1 ? 's' : ''}
                                  </div>
                                )}
                                {member.isFlagged && member.flagReason && (
                                  <div className="text-xs text-red-600 italic mt-1">
                                    {member.flagReason}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 text-xs rounded-full ${member.hasPaid
                              ? 'bg-green-100 text-green-700'
                              : 'bg-yellow-100 text-yellow-700'
                              }`}>
                              {member.hasPaid ? 'Paid' : 'Pending'}
                            </span>
                          </td>
                          {isAdmin && (
                            <td className="px-4 py-3">
                              <div className="flex space-x-2">
                                {member.isFlagged ? (
                                  <button
                                    onClick={() => handleUnflagMember(member.id)}
                                    className="text-green-600 hover:text-green-800"
                                    title="Unflag member"
                                  >
                                    <Flag className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleFlagMember(member.id)}
                                    className="text-yellow-600 hover:text-yellow-800"
                                    title="Flag member"
                                  >
                                    <Flag className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleKickMember(member.id)}
                                  className="text-red-600 hover:text-red-800"
                                  title="Remove member"
                                >
                                  <UserX className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            ) : (
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-100 border-b">
                  <h3 className="font-semibold text-gray-800 flex items-center">
                    <Trophy className="w-5 h-5 text-indigo-600 mr-2" />
                    Current Auction Standings
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Live bidding for Period #{circleData.currentAuction?.periodId} • Payout: {circleData.currentAuction?.payoutAmount} CHF
                  </p>
                </div>
                {sortedBids.length > 0 ? (
                  <div className="divide-y divide-gray-200 overflow-auto max-h-[320px]">
                    {sortedBids.map((bid, index) => {
                      const netPayout = (circleData.currentAuction?.payoutAmount || 0) - bid.bidAmount;
                      return (
                        <div
                          key={bid.id}
                          className={`p-4 flex items-center justify-between ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-transparent' :
                            index === 1 ? 'bg-gradient-to-r from-gray-50 to-transparent' :
                              index === 2 ? 'bg-gradient-to-r from-orange-50 to-transparent' :
                                ''
                            }`}
                        >
                          <div className="flex items-center space-x-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${index === 0 ? 'bg-yellow-400 text-white' :
                              index === 1 ? 'bg-gray-300 text-gray-700' :
                                index === 2 ? 'bg-orange-400 text-white' :
                                  'bg-gray-100 text-gray-600'
                              }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 flex items-center">
                                {bid.memberName}
                                {bid.isWinning && (
                                  <span className="ml-2 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                                    Winning
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500">
                                Bid: {bid.bidAmount} CHF • Net Payout: {netPayout} CHF
                              </div>
                              <div className="text-xs text-gray-400">
                                {new Date(bid.timestamp).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-indigo-600">{bid.bidAmount} CHF</div>
                            <div className="text-xs text-gray-500">bid amount</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <Gavel className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No bids placed yet</p>
                    <p className="text-xs mt-1">Be the first to bid for this period!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Periods</h2>

            <div
              ref={periodsContainerRef}
              className="max-h-[400px] overflow-y-auto pr-2 space-y-4 scroll-smooth"
            >
              {circleData.periods.map(period => {
                const isCurrent = period.status === 'current' || period.status === 'auction';

                return (
                  <div
                    key={period.id}
                    ref={isCurrent ? currentPeriodRef : null}
                    className={`bg-white p-4 rounded-xl shadow-md border-l-4 ${period.status === 'completed'
                      ? 'border-gray-300'
                      : period.status === 'current'
                        ? 'border-indigo-500'
                        : period.status === 'auction'
                          ? 'border-purple-500'
                          : 'border-green-500'
                      }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${period.status === 'completed'
                            ? 'bg-gray-100 text-gray-700'
                            : period.status === 'current'
                              ? 'bg-indigo-100 text-indigo-700'
                              : period.status === 'auction'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-green-100 text-green-700'
                            }`}
                        >
                          {period.status === 'auction' ? 'Auction' : period.status}
                        </span>

                        {period.status === 'auction' && (
                          <Gavel className="w-4 h-4 text-purple-500" />
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-900">
                          {period.amount} CHF
                        </div>
                      </div>
                    </div>

                    <div className="text-sm text-gray-600">
                      {period.startDate} to {period.endDate}
                    </div>

                    <div className="text-sm font-medium text-gray-900 mt-2">
                      Recipient: {period.recipient}
                    </div>

                    {period.hasAuction && period.auctionEndDate && (
                      <div className="text-xs text-purple-600 mt-1">
                        Auction ends: {period.auctionEndDate}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* Auction Bidding Modal */}
      {showAuctionModal && circleData.currentAuction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <Gavel className="w-6 h-6 text-indigo-600 mr-3" />
              <h3 className="text-xl font-bold text-gray-900">Place Your Bid</h3>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Payout Amount:</span>
                  <div className="font-bold text-gray-900">{circleData.currentAuction.payoutAmount} CHF</div>
                </div>
                <div>
                  <span className="text-gray-600">Current High Bid:</span>
                  <div className="font-bold text-indigo-600">
                    {circleData.currentAuction.currentHighestBid || 0} CHF
                  </div>
                </div>
              </div>
              {circleData.currentAuction.currentWinner && (
                <div className="mt-2 text-xs text-gray-600">
                  Leading bidder: <span className="font-medium">{circleData.currentAuction.currentWinner}</span>
                </div>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Enter your bid amount. The highest bidder receives the payout minus their bid amount.
              You can only bid if you haven't received a payout this cycle.
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Bid Amount (CHF)
              </label>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder="Enter amount"
                min={circleData.currentAuction.currentHighestBid + 1}
                max={circleData.currentAuction.payoutAmount - 1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                You will receive {circleData.currentAuction.payoutAmount} - {bidAmount || 0} CHF = CHF
                {circleData.currentAuction.payoutAmount - (parseFloat(bidAmount) || 0)}
              </p>
            </div>

            {circleData.currentAuction.bids.length > 0 && (
              <div className="mb-4 max-h-40 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Standings:</h4>
                <div className="space-y-2">
                  {sortedBids.slice(0, 5).map((bid, index) => (
                    <div key={bid.id} className={`flex justify-between items-center text-sm p-2 rounded ${index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                      }`}>
                      <div className="flex items-center">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mr-2 ${index === 0 ? 'bg-yellow-400 text-white' : 'bg-gray-300 text-gray-700'
                          }`}>
                          {index + 1}
                        </span>
                        <span className="text-gray-700">{bid.memberName}</span>
                      </div>
                      <span className="font-bold text-indigo-600">{bid.bidAmount} CHF</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={handlePlaceBid}
                disabled={placingBid || !bidAmount || parseFloat(bidAmount) <= (circleData.currentAuction.currentHighestBid || 0)}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {placingBid ? 'Placing Bid...' : 'Place Bid'}
              </button>
              <button
                onClick={() => {
                  setShowAuctionModal(false);
                  setBidAmount('');
                }}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Member Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Flag Member</h3>
            <p className="text-sm text-gray-600 mb-4">
              Provide a reason for flagging this member. This will be visible to all circle members.
            </p>
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="e.g., Multiple late payments, unresponsive to messages..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
            />
            <div className="flex space-x-3 mt-4">
              <button
                onClick={submitFlagMember}
                disabled={!flagReason.trim()}
                className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 cursor-pointer"
              >
                Flag Member
              </button>
              <button
                onClick={() => {
                  setShowFlagModal(false);
                  setSelectedMember(null);
                  setFlagReason('');
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
  )
}