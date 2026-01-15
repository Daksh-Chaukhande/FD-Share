
import { FoodListing, FoodRequest, User, FoodStatus, FoodCategory, Coordinates } from '../types';

const STORAGE_KEYS = {
  CURRENT_USER: 'sharebite_current_user',
  LOCAL_LISTINGS: 'sharebite_local_listings',
  LOCAL_REQUESTS: 'sharebite_local_requests'
};

// Helper to get the correct backend URL based on the current environment
const getApiUrl = (endpoint: string): string => {
  let hostname = 'localhost';
  
  // If we are in a browser, use the current window's hostname
  // This allows mobile devices to connect to the laptop's IP automatically
  if (typeof window !== 'undefined' && window.location.hostname) {
    hostname = window.location.hostname;
  }
  
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  // Standardizing on port 3001 for the backend
  return `http://${hostname}:3001${cleanEndpoint}`;
};

const DEFAULT_LISTINGS: FoodListing[] = [
  {
    id: '1',
    userId: 'user2',
    userName: 'Ananya Sharma',
    title: 'Extra Home-cooked Biryani',
    description: 'Freshly prepared chicken biryani. Too much for me to finish.',
    category: FoodCategory.MEAL,
    quantity: '2 servings',
    expiryTime: new Date(Date.now() + 3600000 * 4).toISOString(),
    locationName: 'Hostel A, Wing 2',
    coordinates: { lat: 12.9716, lng: 77.5946 },
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=600&h=400&auto=format&fit=crop',
    status: FoodStatus.AVAILABLE,
    isSafetyChecked: true,
    createdAt: new Date().toISOString()
  }
];

export const apiService = {
  // --- STATUS CHECK ---
  checkBackend: async (): Promise<boolean> => {
    try {
      // Use a short timeout to prevent UI hang
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      
      const res = await fetch(getApiUrl('/listings'), { signal: controller.signal });
      clearTimeout(timeoutId);
      return res.ok;
    } catch {
      return false;
    }
  },

  getLocalListings: (): FoodListing[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LOCAL_LISTINGS);
    return data ? JSON.parse(data) : DEFAULT_LISTINGS;
  },
  saveLocalListings: (listings: FoodListing[]) => {
    localStorage.setItem(STORAGE_KEYS.LOCAL_LISTINGS, JSON.stringify(listings));
  },
  getLocalRequests: (): FoodRequest[] => {
    const data = localStorage.getItem(STORAGE_KEYS.LOCAL_REQUESTS);
    return data ? JSON.parse(data) : [];
  },
  saveLocalRequests: (requests: FoodRequest[]) => {
    localStorage.setItem(STORAGE_KEYS.LOCAL_REQUESTS, JSON.stringify(requests));
  },

  async fetchJson(endpoint: string, options?: RequestInit) {
    const url = getApiUrl(endpoint);
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      return await response.json();
    } catch (error) {
      console.warn(`API call failed for ${endpoint}. Backend might be offline.`);
      return null;
    }
  },

  getCurrentUser: (): User | null => {
    const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return data ? JSON.parse(data) : null;
  },

  login: (email: string): User => {
    const isAdmin = email.startsWith('admin@');
    const user: User = {
      id: isAdmin ? 'admin1' : 'user_' + email.split('@')[0].replace(/[^a-zA-Z0-9]/g, ''),
      name: isAdmin ? 'System Admin' : 'Student ' + email.split('@')[0],
      email,
      hostel: 'Nightingale Hall',
      roomNo: '302',
      phone: '+91 9876543210',
      points: 450,
      role: isAdmin ? 'admin' : 'student'
    };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    return user;
  },

  updateUserProfile: (updates: { name?: string; avatar?: string }) => {
    const user = apiService.getCurrentUser();
    if (!user) return null;
    const updatedUser = { ...user, ...(updates.name ? { name: updates.name } : {}), ...(updates.avatar ? { avatar: updates.avatar } : {}) } as User;
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
    return updatedUser;
  },

  updateUserLocation: (coords: Coordinates) => {
    const user = apiService.getCurrentUser();
    if (user) {
      const updatedUser = { ...user, location: coords };
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(updatedUser));
      return updatedUser;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getListings: async (): Promise<FoodListing[]> => {
    const data = await apiService.fetchJson('/listings');
    if (data) {
      apiService.saveLocalListings(data);
      return data;
    }
    // Fallback to local storage if backend is offline
    return apiService.getLocalListings();
  },

  addListing: async (listingData: Omit<FoodListing, 'id' | 'createdAt' | 'status'>) => {
    const response = await apiService.fetchJson('/listings', {
      method: 'POST',
      body: JSON.stringify(listingData)
    });
    
    if (response) {
      return response;
    } else {
      // Manual fallback logic for local-only mode
      const newListings = apiService.getLocalListings();
      const newListing: FoodListing = {
        ...listingData,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        status: FoodStatus.AVAILABLE
      };
      newListings.unshift(newListing);
      apiService.saveLocalListings(newListings);
      return newListing;
    }
  },

  updateListingStatus: async (id: string, status: FoodStatus, claimedBy?: string) => {
    const response = await apiService.fetchJson(`/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, claimedBy })
    });
    
    // Always update local storage for persistence consistency
    const listings = apiService.getLocalListings();
    const updated = listings.map(l => l.id === id ? { ...l, status, claimedBy } : l);
    apiService.saveLocalListings(updated);
    
    return { success: true };
  },

  // Delete a listing (donor-only). Sends requesterId to backend for verification. Falls back to local storage when backend is unavailable.
  deleteListing: async (id: string, requesterId: string) => {
    const response = await apiService.fetchJson(`/listings/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ requesterId })
    });

    if (response) {
      const listings = apiService.getLocalListings().filter(l => l.id !== id);
      apiService.saveLocalListings(listings);
      return { success: true };
    } else {
      // Local-only fallback: enforce donor check locally
      const listings = apiService.getLocalListings();
      const listing = listings.find(l => l.id === id);
      if (!listing) throw new Error('Listing not found');
      if (listing.userId !== requesterId) throw new Error('Only the donor can delete this listing');
      const updated = listings.filter(l => l.id !== id);
      apiService.saveLocalListings(updated);
      return { success: true };
    }
  },

  getRequests: async (): Promise<FoodRequest[]> => {
    const data = await apiService.fetchJson('/requests');
    if (data) {
      apiService.saveLocalRequests(data);
      return data;
    }
    return apiService.getLocalRequests();
  },

  sendRequest: async (listingId: string, requester: User, posterId: string, message?: string) => {
    const requestData = { listingId, requesterId: requester.id, requesterName: requester.name, posterId, message };
    const response = await apiService.fetchJson('/requests', {
      method: 'POST',
      body: JSON.stringify(requestData)
    });
    
    if (!response) {
      const requests = apiService.getLocalRequests();
      const newReq: FoodRequest = {
        id: Math.random().toString(36).substr(2, 9),
        ...requestData,
        status: 'pending',
        timestamp: new Date().toISOString()
      };
      requests.push(newReq);
      apiService.saveLocalRequests(requests);
      return newReq;
    }
    return response;
  },

  updateRequestStatus: async (requestId: string, status: FoodRequest['status']) => {
    const response = await apiService.fetchJson(`/requests/${requestId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    
    // Fallback/Local mirror
    const requests = apiService.getLocalRequests();
    const reqObj = requests.find(r => r.id === requestId);
    const updatedRequests = requests.map(r => r.id === requestId ? { ...r, status } : r);
    apiService.saveLocalRequests(updatedRequests);
    
    if (reqObj && status === 'accepted') {
      const listings = apiService.getLocalListings();
      const updatedListings = listings.map(l => 
        l.id === reqObj.listingId ? { ...l, status: FoodStatus.CLAIMED, claimedBy: reqObj.requesterId } : l
      );
      apiService.saveLocalListings(updatedListings);
    }
    
    return { success: true };
  }

  ,

  shareRequestContact: (requestId: string, phone: string) => {
    const requests = apiService.getLocalRequests();
    const updated = requests.map(r => r.id === requestId ? { ...r, contactShared: true, sharedContact: phone } : r);
    apiService.saveLocalRequests(updated);
    return updated.find(r => r.id === requestId) || null;
  },
};
