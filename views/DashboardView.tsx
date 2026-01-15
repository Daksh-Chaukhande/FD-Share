
import React, { useState, useEffect } from 'react';
import { User, FoodListing, FoodRequest, FoodStatus } from '../types';
import { apiService } from '../services/apiService';

interface DashboardViewProps {
  user: User;
  listings: FoodListing[];
  onRefresh: () => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({ user, listings, onRefresh }) => {
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

  const fetchRequests = async () => {
    const data = await apiService.getRequests();
    setRequests(data || []);
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchRequests();
  }, [listings]);

  const myPosts = listings.filter(l => l.userId === user.id);
  const myRequests = requests.filter(r => r.requesterId === user.id);
  const incomingRequests = requests.filter(r => r.posterId === user.id && r.status === 'pending');

  const stats = {
    totalShared: myPosts.filter(l => l.status === FoodStatus.CLAIMED).length,
    impact: {
      meals: myPosts.filter(l => l.status === FoodStatus.CLAIMED).length * 1.5,
      kg: (myPosts.filter(l => l.status === FoodStatus.CLAIMED).length * 0.8).toFixed(1),
      co2: (myPosts.filter(l => l.status === FoodStatus.CLAIMED).length * 2.1).toFixed(1)
    }
  };

  const handleAction = async (requestId: string, status: 'accepted' | 'rejected') => {
    await apiService.updateRequestStatus(requestId, status);
    onRefresh();
    fetchRequests();
    if (status === 'accepted') {
      setShareModalRequestId(requestId);
    }
  };

  const [shareModalRequestId, setShareModalRequestId] = React.useState<string | null>(null);
  const handleShareContact = async (requestId: string) => {
    await apiService.shareRequestContact(requestId, user.phone);
    fetchRequests();
    setShareModalRequestId(null);
    alert('Your number has been shared with the requester.');
  };

  return (
    <div className="space-y-8 pt-4 pb-12">
      <section>
        <h2 className="text-xl font-bold text-slate-900 mb-4">Your Sustainability Impact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-3xl font-black text-slate-800">{stats.impact.meals}</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">Meals Shared</span>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" /></svg>
            </div>
            <span className="text-3xl font-black text-slate-800">{stats.impact.kg}</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">kg Waste Saved</span>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-emerald-100 shadow-sm flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <span className="text-3xl font-black text-slate-800">{stats.impact.co2}</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest mt-1">kg CO₂ Offset</span>
          </div>
        </div>
      </section>
      {shareModalRequestId && (() => {
        const req = requests.find(r => r.id === shareModalRequestId);
        return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white w-[92%] max-w-md rounded-2xl p-6 space-y-4">
              <h3 className="text-lg font-bold">Share Contact with {req?.requesterName}</h3>
              <p className="text-sm text-slate-600">If you share your number, the requester will see it in their requests. Your phone: <span className="font-bold">{user.phone}</span></p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShareModalRequestId(null)} className="px-4 py-2 rounded bg-slate-100">Cancel</button>
                <button onClick={() => handleShareContact(shareModalRequestId)} className="px-4 py-2 rounded bg-emerald-600 text-white">Share My Number</button>
              </div>
            </div>
          </div>
        );
      })()}

      <section className="bg-white rounded-[32px] border border-slate-100 shadow-xl overflow-hidden">
        <div className="flex border-b border-slate-50">
          <button 
            onClick={() => setActiveTab('incoming')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'incoming' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            Pickup Requests {incomingRequests.length > 0 && `(${incomingRequests.length})`}
          </button>
          <button 
            onClick={() => setActiveTab('outgoing')}
            className={`flex-1 py-4 text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'outgoing' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-50'}`}
          >
            My Requests
          </button>
        </div>

        <div className="p-6 min-h-[200px]">
          {activeTab === 'incoming' ? (
            <div className="space-y-4">
              {incomingRequests.length > 0 ? (
                incomingRequests.map(req => {
                  const listing = listings.find(l => l.id === req.listingId);
                  return (
                    <div key={req.id} className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex items-center justify-between animate-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-600 font-black shadow-sm border border-emerald-50">
                          {req.requesterName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{req.requesterName} <span className="text-slate-400 font-normal">wants</span></h4>
                          <p className="text-sm font-black text-emerald-700">{listing?.title}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">Requested {new Date(req.timestamp).toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAction(req.id, 'rejected')}
                          className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <button 
                          onClick={() => handleAction(req.id, 'accepted')}
                          className="bg-emerald-600 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                        >
                          Accept & Share
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400 flex flex-col items-center gap-3">
                  <svg className="w-12 h-12 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-8 4-8-4" /></svg>
                  <p className="text-sm font-medium">No pending pickup requests from others.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {myRequests.length > 0 ? (
                myRequests.map(req => {
                  const listing = listings.find(l => l.id === req.listingId);
                  return (
                    <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                          req.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                        }`}>
                          {req.status === 'accepted' ? (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{listing?.title || 'Food Item'}</h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                              req.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      {req.status === 'accepted' && (
                        <div className="text-right flex flex-col items-end gap-1">
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] animate-pulse">Ready for Pickup</span>
                          <span className="text-xs font-bold text-slate-500">Go to {listing?.locationName}</span>
                          {req.contactShared && req.sharedContact ? (
                            <div className="mt-2 text-sm bg-emerald-50 text-emerald-700 px-3 py-2 rounded">
                              <div className="font-bold">Contact Shared</div>
                              <div className="text-xs">{req.sharedContact}</div>
                            </div>
                          ) : (
                            <div className="mt-2 text-xs text-slate-400">Contact not yet shared by donor</div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400">
                  <p className="text-sm font-medium">You haven't requested any food yet.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-slate-900 mb-4">My Listing History</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {myPosts.map(listing => (
            <div key={listing.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-4 shadow-sm">
              <img src={listing.imageUrl} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-800">{listing.title}</h4>
                  <span className={`text-[9px] px-2 py-1 rounded-full font-black uppercase tracking-widest ${
                    listing.status === FoodStatus.CLAIMED ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'
                  }`}>
                    {listing.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mt-2 tracking-widest">
                  Posted {new Date(listing.createdAt).toLocaleDateString()}
                </p>
                {listing.status === FoodStatus.CLAIMED && (
                  <p className="text-[10px] font-bold text-blue-600 mt-1">Successfully Shared!</p>
                )}
              </div>
            </div>
          ))}
          {myPosts.length === 0 && (
            <div className="col-span-2 py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <p className="text-sm text-slate-400">You haven't posted any food items yet.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default DashboardView;

