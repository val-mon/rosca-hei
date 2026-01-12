// lib/api.ts

import {
  LoginResponse,
  SignupResponse,
  LogoutResponse,
  Circle,
  CircleDetails,
  PaymentResponse,
  KickMemberResponse,
  UpdateCircleResponse,
  PlaceBidResponse,
  StartCycleResponse
} from './types';
import {
  AdminStats,
  AdminUser,
  AdminCircle,
  DeleteUserResponse,
  DeleteCircleResponse,
} from './adminTypes';
import { mockUser, mockCircles, mockCircleDetails, mockAdmin } from '@/data/mockData';
import { mockAdminStats, mockAdminUsers, mockAdminCircles } from '@/data/adminMockData';

const USE_MOCK_DATA = false;
const BASE_URL = 'http://localhost:5431'

const api = {
  // CONNECTION
  logout: async (userToken: string): Promise<LogoutResponse> => {
    if (USE_MOCK_DATA) {
      console.log('Logout');
      await new Promise(resolve => setTimeout(resolve, 300));
      return { success: true };
    } else {
      const res = await fetch(
        `${BASE_URL}/auth/logout`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_token: userToken })
        }
      );
      return res.json();
    }
  },

  login: async (email: string, onetimeCode: string): Promise<LoginResponse> => {
    if (USE_MOCK_DATA) {
      console.log('Login:', { email, onetimeCode });
      await new Promise(resolve => setTimeout(resolve, 500));
      if (email === 'admin@rosca-hei.com') {
        return { success: true, user: mockAdmin, user_token: '' };
      } else {
        return { success: true, user: mockUser, user_token: '' };
      }
    } else {
      const res = await fetch(
        `${BASE_URL}/auth/login?email=${encodeURIComponent(email)}&onetime_code=${encodeURIComponent(onetimeCode)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const temp = res.json();
      return temp;
    }
  },

  sendCode: async (email: string): Promise<{ success: boolean; message: string }> => {
    if (USE_MOCK_DATA) {
      console.log('Sending code to:', email);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Code sent' };
    } else {
      const res = await fetch(
        `${BASE_URL}/auth/sendcode?email=${encodeURIComponent(email)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return res.json();
    }
  },

  signup: async (name: string, email: string, consent: boolean): Promise<SignupResponse> => {
    if (USE_MOCK_DATA) {
      console.log('Signup:', { name, email, consent });
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, user: mockUser };
    } else {
      const res = await fetch(
        `${BASE_URL}/auth/create?email=${encodeURIComponent(email)}&username=${encodeURIComponent(name)}&consent=${consent}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return res.json();
    }
  },

  // DASHBOARD
  getUserInfo: async (userToken: string): Promise<any> => {
    if (USE_MOCK_DATA) {
      console.log('Fetching user info');
      await new Promise(resolve => setTimeout(resolve, 500));
      return {
        user_token: userToken,
        id: 1,
        username: mockUser.username,
        email: mockUser.email,
        privacy_consent: true,
        circles: mockCircles
      };
    } else {
      const res = await fetch(
        `${BASE_URL}/dashboard/userinfo?user_token=${encodeURIComponent(userToken)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return res.json();
    }
  },

  getCircles: async (userToken: string): Promise<Circle[]> => {
    if (USE_MOCK_DATA) {
      console.log('Fetching circles');
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockCircles;
    } else {
      const userInfo = await api.getUserInfo(userToken);
      return userInfo.circles;
    }
  },

  createCircle: async (userToken: string, circleName: string): Promise<{ success: boolean; circle_id: number; join_code: string }> => {
    if (USE_MOCK_DATA) {
      console.log('Creating circle:', circleName);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, circle_id: 99, join_code: 'MOCK123' };
    } else {
      const res = await fetch(
        `${BASE_URL}/dashboard/create_circle`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_token: userToken, circle_name: circleName })
        }
      );
      return res.json();
    }
  },

  joinCircle: async (userToken: string, joinCode: string): Promise<{ success: boolean; circle_id: number }> => {
    if (USE_MOCK_DATA) {
      console.log('Joining circle with code:', joinCode);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, circle_id: 99 };
    } else {
      const res = await fetch(
        `${BASE_URL}/dashboard/join_circle`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_token: userToken, join_code: joinCode })
        }
      );
      return res.json();
    }
  },

  getUserActiveAuctions: async (userToken: string): Promise<any[]> => {
    if (USE_MOCK_DATA) {
      console.log('Fetching user active auctions');
      await new Promise(resolve => setTimeout(resolve, 500));
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
        }
      ];
    } else {
      const res = await fetch(
        `${BASE_URL}/dashboard/useractiveauctions?user_token=${encodeURIComponent(userToken)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      const data = await res.json();
      return data.auctions;
    }
  },

  // CIRCLE PAGE
  getCircleDetails: async (userToken: string, circleId: number): Promise<CircleDetails> => {
    if (USE_MOCK_DATA) {
      console.log('Fetching circle details:', circleId);
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockCircleDetails[circleId];
    } else {
      const res = await fetch(
        `${BASE_URL}/circle/circle?user_token=${encodeURIComponent(userToken)}&circle_id=${circleId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );

      const temp = res.json();
      console.log(temp);
      return temp;
    }
  },

  makePayment: async (userToken: string, circleId: number, periodDate: string): Promise<PaymentResponse> => {
    if (USE_MOCK_DATA) {
      console.log('Making payment:', { circleId, periodDate });
      await new Promise(resolve => setTimeout(resolve, 800));
      return { success: true, message: 'Payment successful' };
    } else {
      if (!periodDate) {
        return { success: false, message: 'Missing period date' };
      }
      const normalizedDate = /^\d{4}-\d{2}-\d{2}$/.test(periodDate) ? periodDate : new Date(periodDate).toISOString().split('T')[0];
      
      const res = await fetch(
        `${BASE_URL}/circle/contribute`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_token: userToken, circle_id: circleId, period_date: normalizedDate })
        }
      );
      return res.json();
    }
  },

  kickMember: async (userToken: string, circleId: number, memberId: number): Promise<KickMemberResponse> => {
    if (USE_MOCK_DATA) {
      console.log('Kicking member:', { circleId, memberId });
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Member ' + memberId + ' removed from circle' };
    } else {
      const res = await fetch(
        `${BASE_URL}/circle/kick_member`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_token: userToken, circle_id: circleId, member_id: memberId })
        }
      );
      return res.json();
    }
  },

  updateCircleName: async (userToken: string, circleId: number, newName: string): Promise<UpdateCircleResponse> => {
    if (USE_MOCK_DATA) {
      console.log('Updating circle name:', { circleId, newName });
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Circle name updated successfully' };
    } else {
      const res = await fetch(
        `${BASE_URL}/circle/change_settings`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_token: userToken, circle_id: circleId, circle_name: newName })
        }
      );
      return res.json();
    }
  },

  placeBid: async (userToken: string, circleId: number, periodDate: string, amount: number): Promise<PlaceBidResponse> => {
    if (USE_MOCK_DATA) {
      console.log('Placing bid:', { circleId, periodDate, amount });
      await new Promise(resolve => setTimeout(resolve, 800));
      const isWinning = Math.random() > 0.5;
      return {
        success: true,
        message: isWinning ? 'You are now the highest bidder!' : 'Bid placed successfully',
        isWinning
      };
    } else {
      const res = await fetch(
        `${BASE_URL}/circle/auction`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_token: userToken, circle_id: circleId, period_date: periodDate, ammount: amount })
        }
      );
      return res.json();
    }
  },

  startCycle: async (userToken: string, circleId: number, contributionAmount: number, payoutMode: 'random' | 'auction'): Promise<StartCycleResponse> => {
    if (USE_MOCK_DATA) {
      console.log('Starting cycle:', { circleId, contributionAmount, payoutMode });
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        success: true,
        message: 'Cycle started successfully',
        cycle_id: 1
      };
    } else {
      const res = await fetch(
        `${BASE_URL}/circle/start_cycle`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_token: userToken, circle_id: circleId, contribution_amount: contributionAmount, payout_mode: payoutMode })
        }
      );
      return res.json();
    }
  },

  // ADMIN SYSTEM PAGE
  getAdminStats: async (userToken: string): Promise<AdminStats> => {
    if (USE_MOCK_DATA) {
      console.log('Fetching admin stats');
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockAdminStats;
    } else {
      const res = await fetch(
        `${BASE_URL}/admin/globalstats?user_token=${encodeURIComponent(userToken)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      return res.json();
    }
  },

  getAllUsers: async (userToken: string): Promise<AdminUser[]> => {
    if (USE_MOCK_DATA) {
      console.log('Fetching all users');
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockAdminUsers;
    } else {
      const res = await fetch(
        `${BASE_URL}/admin/users?user_token=${encodeURIComponent(userToken)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      const data = await res.json();
      return data.users;
    }
  },

  getAllCircles: async (userToken: string): Promise<AdminCircle[]> => {
    if (USE_MOCK_DATA) {
      console.log('Fetching all circles');
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockAdminCircles;
    } else {
      const res = await fetch(
        `${BASE_URL}/admin/circles?user_token=${encodeURIComponent(userToken)}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      const data = await res.json();
      return data.circles;
    }
  },

  deleteUser: async (userToken: string, email: string): Promise<DeleteUserResponse> => {
    if (USE_MOCK_DATA) {
      console.log('Deleting user:', email);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'User deleted successfully' };
    } else {
      const res = await fetch(
        `${BASE_URL}/admin/deleteuser`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_token: userToken, email })
        }
      );
      return res.json();
    }
  },

  deleteCircle: async (userToken: string, circleId: number): Promise<DeleteCircleResponse> => {
    if (USE_MOCK_DATA) {
      console.log('Deleting circle:', circleId);
      await new Promise(resolve => setTimeout(resolve, 500));
      return { success: true, message: 'Circle deleted successfully' };
    } else {
      const res = await fetch(
        `${BASE_URL}/admin/deletecircle`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_token: userToken, circle_id: circleId })
        }
      );
      return res.json();
    }
  }
};

export default api;
