// lib/api.ts

import { 
  LoginResponse, 
  SignupResponse, 
  LogoutResponse, 
  Circle, 
  CircleDetails,
  PaymentResponse,
  KickMemberResponse,
  FlagMemberResponse,
  UpdateCircleResponse,
  PlaceBidResponse
} from './types';
import { 
  AdminStats, 
  AdminUser, 
  AdminCircle,
  SuspendUserResponse,
  DeleteUserResponse,
  DeleteCircleResponse,
  UpdateUserResponse
} from './adminTypes';
import { mockUser, mockCircles, mockCircleDetails } from '@/data/mockData';
import { mockAdminStats, mockAdminUsers, mockAdminCircles } from '@/data/adminMockData';

const api = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // TODO: Implement backend call
    // Example: const response = await fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, password })
    // });
    // return response.json();
    
    console.log('Login:', { email, password });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, user: mockUser };
  },
  
  signup: async (name: string, email: string, password: string): Promise<SignupResponse> => {
    // TODO: Implement backend call
    // Example: const response = await fetch('/api/auth/signup', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name, email, password })
    // });
    // return response.json();
    
    console.log('Signup:', { name, email, password });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, user: mockUser };
  },
  
  logout: async (): Promise<LogoutResponse> => {
    // TODO: Implement backend call
    // Example: const response = await fetch('/api/auth/logout', {
    //   method: 'POST'
    // });
    // return response.json();
    
    console.log('Logout');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return { success: true };
  },
  
  getCircles: async (): Promise<Circle[]> => {
    // TODO: Implement backend call
    // Example: const response = await fetch('/api/circles');
    // return response.json();
    
    console.log('Fetching circles');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockCircles;
  },

  getUserActiveAuctions: async (): Promise<any[]> => {
    // TODO: Implement backend call
    // Example: const response = await fetch('/api/user/active-auctions');
    // return response.json();
    
    console.log('Fetching user active auctions');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock active auctions for circles 1 and 3
    return [
      {
        circleId: 1,
        circleName: "Family Circle",
        periodId: 3,
        payoutAmount: 4000,
        userBidAmount: 3750,
        currentHighestBid: 3750,
        currentWinner: "John Doe",
        isWinning: true,
        endDate: "2024-12-14",
        timeRemaining: "18h 32m"
      },
      {
        circleId: 3,
        circleName: "Work Colleagues",
        periodId: 5,
        payoutAmount: 2000,
        userBidAmount: 1800,
        currentHighestBid: 1850,
        currentWinner: "Joey Tribbiani",
        isWinning: false,
        endDate: "2024-12-29",
        timeRemaining: "10d 14h"
      }
    ];
  },
  
  getCircleDetails: async (circleId: number): Promise<CircleDetails> => {
    // TODO: Implement backend call
    // Example: const response = await fetch(`/api/circles/${circleId}`);
    // return response.json();
    
    console.log('Fetching circle details:', circleId);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockCircleDetails[circleId];
  },
  
  makePayment: async (circleId: number, amount: number): Promise<PaymentResponse> => {
    // TODO: Implement backend call
    // Example: const response = await fetch('/api/payments', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ circleId, amount })
    // });
    // return response.json();
    
    console.log('Making payment:', { circleId, amount });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return { success: true, message: 'Payment successful' };
  },

  kickMember: async (circleId: number, memberId: number): Promise<KickMemberResponse> => {
    // TODO: Implement backend call
    // Example: const response = await fetch(`/api/circles/${circleId}/members/${memberId}`, {
    //   method: 'DELETE'
    // });
    // return response.json();
    
    console.log('Kicking member:', { circleId, memberId });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, message: 'Member removed from circle' };
  },

  flagMember: async (circleId: number, memberId: number, reason: string): Promise<FlagMemberResponse> => {
    // TODO: Implement backend call
    // Example: const response = await fetch(`/api/circles/${circleId}/members/${memberId}/flag`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ reason })
    // });
    // return response.json();
    
    console.log('Flagging member:', { circleId, memberId, reason });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, message: 'Member flagged successfully' };
  },

  unflagMember: async (circleId: number, memberId: number): Promise<FlagMemberResponse> => {
    // TODO: Implement backend call
    // Example: const response = await fetch(`/api/circles/${circleId}/members/${memberId}/unflag`, {
    //   method: 'POST'
    // });
    // return response.json();
    
    console.log('Unflagging member:', { circleId, memberId });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, message: 'Member unflagged successfully' };
  },

  updateCircleName: async (circleId: number, newName: string): Promise<UpdateCircleResponse> => {
    // TODO: Implement backend call
    // Example: const response = await fetch(`/api/circles/${circleId}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ name: newName })
    // });
    // return response.json();
    
    console.log('Updating circle name:', { circleId, newName });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, message: 'Circle name updated successfully' };
  },

  placeBid: async (circleId: number, periodId: number, bidAmount: number): Promise<PlaceBidResponse> => {
    // TODO: Implement backend call
    // Example: const response = await fetch(`/api/circles/${circleId}/periods/${periodId}/bid`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ bidAmount })
    // });
    // return response.json();
    
    console.log('Placing bid:', { circleId, periodId, bidAmount });
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simulate checking if bid is winning
    const isWinning = Math.random() > 0.5;
    
    return { 
      success: true, 
      message: isWinning ? 'You are now the highest bidder!' : 'Bid placed successfully',
      isWinning 
    };
  },

  // Admin API calls
  getAdminStats: async (): Promise<AdminStats> => {
    // TODO: Implement backend call
    // Example: const response = await fetch('/api/admin/stats');
    // return response.json();
    
    console.log('Fetching admin stats');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockAdminStats;
  },

  getAllUsers: async (): Promise<AdminUser[]> => {
    // TODO: Implement backend call
    // Example: const response = await fetch('/api/admin/users');
    // return response.json();
    
    console.log('Fetching all users');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockAdminUsers;
  },

  getAllCircles: async (): Promise<AdminCircle[]> => {
    // TODO: Implement backend call
    // Example: const response = await fetch('/api/admin/circles');
    // return response.json();
    
    console.log('Fetching all circles');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return mockAdminCircles;
  },

  suspendUser: async (userId: number, reason: string): Promise<SuspendUserResponse> => {
    // TODO: Implement backend call
    // Example: const response = await fetch(`/api/admin/users/${userId}/suspend`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ reason })
    // });
    // return response.json();
    
    console.log('Suspending user:', { userId, reason });
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, message: 'User suspended successfully' };
  },

  unsuspendUser: async (userId: number): Promise<SuspendUserResponse> => {
    // TODO: Implement backend call
    // Example: const response = await fetch(`/api/admin/users/${userId}/unsuspend`, {
    //   method: 'POST'
    // });
    // return response.json();
    
    console.log('Unsuspending user:', userId);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, message: 'User unsuspended successfully' };
  },

  deleteUser: async (userId: number): Promise<DeleteUserResponse> => {
    // TODO: Implement backend call
    // Example: const response = await fetch(`/api/admin/users/${userId}`, {
    //   method: 'DELETE'
    // });
    // return response.json();
    
    console.log('Deleting user:', userId);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, message: 'User deleted successfully' };
  },

  deleteCircle: async (circleId: number): Promise<DeleteCircleResponse> => {
    // TODO: Implement backend call
    // Example: const response = await fetch(`/api/admin/circles/${circleId}`, {
    //   method: 'DELETE'
    // });
    // return response.json();
    
    console.log('Deleting circle:', circleId);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return { success: true, message: 'Circle deleted successfully' };
  }
};

export default api;