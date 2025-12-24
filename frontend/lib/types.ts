export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Circle {
  id: number;
  name: string;
  members: number;
  contributionAmount: number;
  nextDueDate: string;
  upcomingPayout: number;
  userHasPaid: boolean;
  amountOwed: number;
  isAdmin: boolean;
  payoutMode: 'random' | 'auction';
}

export interface CircleMember {
  id: number;
  name: string;
  email: string;
  position: number;
  hasPaid: boolean;
  latePayments: number;
  totalPenalties: number;
  isFlagged: boolean;
  flagReason?: string;
  hasReceivedPayout: boolean;
}

export interface Period {
  id: number;
  startDate: string;
  endDate: string;
  recipient: string;
  recipientId?: number;
  status: 'completed' | 'current' | 'upcoming' | 'auction';
  amount: number;
  auctionEndDate?: string;
  hasAuction?: boolean;
}

export interface AuctionBid {
  id: number;
  memberId: number;
  memberName: string;
  bidAmount: number;
  timestamp: string;
  isWinning: boolean;
}

export interface Auction {
  periodId: number;
  startDate: string;
  endDate: string;
  payoutAmount: number;
  currentHighestBid: number;
  currentWinner: string | null;
  bids: AuctionBid[];
  hasUserBid: boolean;
  userBidAmount?: number;
  isActive: boolean;
}

export interface CircleDetails {
  members: CircleMember[];
  periods: Period[];
  currentAuction?: Auction;
}

export interface LoginResponse {
  success: boolean;
  user: User;
}

export interface SignupResponse {
  success: boolean;
  user: User;
}

export interface LogoutResponse {
  success: boolean;
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
}

export interface ActiveAuction {
  circleId: number;
  circleName: string;
  periodId: number;
  payoutAmount: number;
  userBidAmount?: number;
  currentHighestBid: number;
  currentWinner: string;
  isWinning: boolean;
  endDate: string;
  timeRemaining: string;
}

export interface KickMemberResponse {
  success: boolean;
  message?: string;
}

export interface FlagMemberResponse {
  success: boolean;
  message?: string;
}

export interface UpdateCircleResponse {
  success: boolean;
  message?: string;
}

export interface PlaceBidResponse {
  success: boolean;
  message?: string;
  isWinning?: boolean;
}