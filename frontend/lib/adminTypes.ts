export interface AdminUser extends User {
  registrationDate: string;
  lastLogin: string;
  totalCircles: number;
  isSuspended: boolean;
  suspensionReason?: string;
}

export interface AdminCircle extends Circle {
  createdDate: string;
  creatorName: string;
  totalPeriods: number;
  completedPeriods: number;
  totalFunds: number;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalCircles: number;
  totalFundsCirculating: number;
  averageCircleSize: number;
}

export interface SuspendUserResponse {
  success: boolean;
  message?: string;
}

export interface DeleteUserResponse {
  success: boolean;
  message?: string;
}

export interface DeleteCircleResponse {
  success: boolean;
  message?: string;
}

export interface UpdateUserResponse {
  success: boolean;
  message?: string;
}

import { User, Circle } from './types';