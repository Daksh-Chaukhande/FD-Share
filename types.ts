
export enum FoodStatus {
  AVAILABLE = 'available',
  CLAIMED = 'claimed',
  EXPIRED = 'expired'
}

export enum FoodCategory {
  MEAL = 'Meal',
  SNACK = 'Snack',
  BEVERAGE = 'Beverage',
  FRUITS = 'Fruits',
  OTHER = 'Other'
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  hostel: string;
  roomNo: string;
  phone: string;
  points: number;
  role: 'student' | 'admin';
  location?: Coordinates;
  avatar?: string;
}

export interface FoodListing {
  id: string;
  userId: string;
  userName: string;
  title: string;
  description: string;
  category: FoodCategory;
  quantity: string;
  expiryTime: string;
  locationName: string;
  coordinates: Coordinates;
  imageUrl: string;
  status: FoodStatus;
  createdAt: string;
  isSafetyChecked: boolean;
  claimedBy?: string;
}

export interface FoodRequest {
  id: string;
  listingId: string;
  requesterId: string;
  requesterName: string;
  posterId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  timestamp: string;
  message?: string;
  contactShared?: boolean;
  sharedContact?: string;
}
