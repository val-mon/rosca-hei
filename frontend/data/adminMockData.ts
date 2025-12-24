import { AdminUser, AdminCircle, AdminStats } from '@/lib/adminTypes';

export const mockAdminStats: AdminStats = {
  totalUsers: 7,
  activeUsers: 5,
  suspendedUsers: 2,
  totalCircles: 5,
  totalFundsCirculating: 452000,
  averageCircleSize: 7.2
};

export const mockAdminUsers: AdminUser[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    registrationDate: "2024-01-15",
    lastLogin: "2024-12-17",
    totalCircles: 3,
    isSuspended: false
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    registrationDate: "2024-02-20",
    lastLogin: "2024-12-16",
    totalCircles: 2,
    isSuspended: false
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike@example.com",
    registrationDate: "2024-03-10",
    lastLogin: "2024-11-30",
    totalCircles: 4,
    isSuspended: true,
    suspensionReason: "Multiple late payments and flagged by multiple circles"
  },
  {
    id: 9,
    name: "Alex Cooper",
    email: "alex@example.com",
    registrationDate: "2024-04-05",
    lastLogin: "2024-12-18",
    totalCircles: 1,
    isSuspended: false
  },
  {
    id: 10,
    name: "Maria Garcia",
    email: "maria@example.com",
    registrationDate: "2024-05-12",
    lastLogin: "2024-12-15",
    totalCircles: 2,
    isSuspended: false
  },
  {
    id: 14,
    name: "Rachel Green",
    email: "rachel@example.com",
    registrationDate: "2024-06-18",
    lastLogin: "2024-12-17",
    totalCircles: 1,
    isSuspended: false
  },
  {
    id: 20,
    name: "Gunther Central",
    email: "gunther@example.com",
    registrationDate: "2024-07-22",
    lastLogin: "2024-12-10",
    totalCircles: 2,
    isSuspended: true,
    suspensionReason: "Consistently late on payments across multiple circles"
  }
];

export const mockAdminCircles: AdminCircle[] = [
  {
    id: 1,
    name: "Family Circle",
    members: 8,
    contributionAmount: 500,
    nextDueDate: "2024-12-20",
    upcomingPayout: 0,
    userHasPaid: false,
    amountOwed: 500,
    isAdmin: true,
    payoutMode: "auction",
    createdDate: "2024-01-20",
    creatorName: "John Doe",
    totalPeriods: 8,
    completedPeriods: 2,
    totalFunds: 32000
  },
  {
    id: 2,
    name: "Friends Savings",
    members: 6,
    contributionAmount: 300,
    nextDueDate: "2024-12-18",
    upcomingPayout: 1800,
    userHasPaid: true,
    amountOwed: 0,
    isAdmin: false,
    payoutMode: "random",
    createdDate: "2024-02-15",
    creatorName: "Alex Cooper",
    totalPeriods: 6,
    completedPeriods: 2,
    totalFunds: 10800
  },
  {
    id: 3,
    name: "Work Colleagues",
    members: 10,
    contributionAmount: 200,
    nextDueDate: "2024-12-25",
    upcomingPayout: 0,
    userHasPaid: true,
    amountOwed: 0,
    isAdmin: false,
    payoutMode: "auction",
    createdDate: "2024-03-01",
    creatorName: "Rachel Green",
    totalPeriods: 10,
    completedPeriods: 4,
    totalFunds: 20000
  },
  {
    id: 4,
    name: "Neighborhood Savings",
    members: 12,
    contributionAmount: 400,
    nextDueDate: "2024-12-22",
    upcomingPayout: 0,
    userHasPaid: true,
    amountOwed: 0,
    isAdmin: false,
    payoutMode: "random",
    createdDate: "2024-04-10",
    creatorName: "Maria Garcia",
    totalPeriods: 12,
    completedPeriods: 3,
    totalFunds: 57600
  },
  {
    id: 5,
    name: "Investment Club",
    members: 5,
    contributionAmount: 1000,
    nextDueDate: "2024-12-30",
    upcomingPayout: 0,
    userHasPaid: true,
    amountOwed: 0,
    isAdmin: false,
    payoutMode: "auction",
    createdDate: "2023-12-01",
    creatorName: "Jane Smith",
    totalPeriods: 5,
    completedPeriods: 5,
    totalFunds: 25000
  }
];