export interface AdminUser extends User {
  registrationDate: string;
  lastLogin: string;
  totalCircles: number;
}

export interface AdminCircle extends Circle {
  createdDate: string;
  creator: string;
  total_periods: number;
  completed_periods: number;
  total_funds: number;
}

export interface AdminStats {
  total_users: number;
  suspendedUsers: number;
  total_circles: number;
  funds_circulating: number;
  average_circle_size: number;
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