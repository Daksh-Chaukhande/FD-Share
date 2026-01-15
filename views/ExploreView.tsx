
import React, { useState, useEffect } from 'react';
import { FoodListing, User, FoodStatus, Coordinates, FoodRequest } from '../types';
import { apiService } from '../services/apiService';
import { geminiService } from '../services/geminiService';

interface ExploreViewProps {
  listings: FoodListing[];
  user: User;
  onRefresh: () => void;
}

const calculateDistance = (coord1: Coordinates, coord2: Coordinates) => {
  const R = 6371;
  const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
  const dLon = (coord2.lng - coord1.lng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
};

const ExploreView: React.FC<ExploreViewProps> = ({ listings, user, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'Meal' | 'Snack' | 'Fruits'>('all');
  const [aiTip, setAiTip] = useState('');
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<Coordinates | null>(user.location || null);
  const [myRequests, setMyRequests] = useState<FoodRequest[]>([]);
  const [safetyInfo, setSafetyInfo] = useState<{title: string, content: string, sources: string[]} | null>(null);
  const [checkingSafety, setCheckingSafety] = useState<string | null>(null);

  useEffect(() => {
    const fetchTip = async () => setAiTip(await geminiService.getSustainabilityTip());
    fetchTip();
    const fetchRequests = async () => {
      const reqs = await apiService.getRequests();
      setMyRequests(reqs.filter(r => r.requesterId === user.id));
    };
    fetchRequests();
    const interval = setInterval(fetchRequests, 5000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          apiService.updateUserLocation(coords);
        }
      );
    }
    return () => clearInterval(interval);
  }, []);

  const handleVerifySafety = async (title: string) => {
    setCheckingSafety(title);
    const data = await geminiService.getSafetyGuidelines(title);
    setSafetyInfo({ title, content: data.text || 'No specific safety data found.', sources: data.sources });
    setCheckingSafety(null);
  };

  const filteredListings = listings.filter(l => {
    const matchesSearch = l.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || l.category === filter;
    return matchesSearch && matchesFilter && l.status === FoodStatus.AVAILABLE;
  });

  return (
    <div className="space-y-6 pt-4 pb-20">
      <div className="bg-emerald-600 text-white p-5 rounded-3xl shadow-xl flex items-center gap-4">
        <div className="bg-white/20 p-3 rounded-2xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
        <div><h2 className="font-black text-sm uppercase tracking-widest opacity-80">Impact Tip</h2><p className="text-sm font-medium leading-tight">{aiTip}</p></div>
      </div>

      <div className="sticky top-0 z-30 bg-slate-50/80 backdrop-blur-md py-2 space-y-3">
        <input type="text" placeholder="Search for food..." className="w-full px-5 py-3 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {(['all', 'Meal', 'Snack', 'Fruits'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest whitespace-nowrap border transition-all ${filter === f ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-400 border-slate-100 hover:border-emerald-200'}`}>{f}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredListings.map((listing) => {
          const isMine = listing.userId === user.id;
          const hasRequested = myRequests.some(r => r.listingId === listing.id);
          const dist = userCoords ? calculateDistance(userCoords, listing.coordinates) : null;

          return (
            <div key={listing.id} className="bg-white rounded-[32px] overflow-hidden border border-slate-100 shadow-sm group">
              <div className="h-44 relative">
                <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-emerald-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-lg">{listing.category}</span>
                  {dist && <span className="bg-white/90 backdrop-blur text-emerald-900 text-[10px] font-black px-2 py-1 rounded-lg">{(dist < 1 ? (dist*1000).toFixed(0)+'m' : dist.toFixed(1)+'km')}</span>}
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-slate-800 text-lg leading-tight">{listing.title}</h3>
                    <p className="text-xs text-slate-400 font-bold uppercase mt-1">{listing.locationName}</p>
                  </div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{listing.quantity}</span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{listing.description}</p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                  <button onClick={() => handleVerifySafety(listing.title)} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5 hover:underline">
                    {checkingSafety === listing.title ? <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                    Safety Info
                  </button>
                  {isMine ? (
                    <div className="flex gap-2">
                      <button className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-slate-300">Your Post</button>
                      <button onClick={async () => { if (!confirm('Delete this listing? This action cannot be undone.')) return; setDeletingId(listing.id); try { await apiService.deleteListing(listing.id, user.id); onRefresh(); } catch (err: any) { alert(err?.message || 'Failed to delete listing'); } finally { setDeletingId(null); } }} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest bg-red-500 text-white hover:bg-red-600 active:scale-95`}>{deletingId === listing.id ? '...' : 'Delete'}</button>
                    </div>
                  ) : (
                    <button disabled={hasRequested} onClick={async () => { setRequestingId(listing.id); await apiService.sendRequest(listing.id, user, listing.userId); setRequestingId(null); onRefresh(); }} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${hasRequested ? 'bg-slate-100 text-slate-400' : 'bg-emerald-600 text-white hover:shadow-lg active:scale-95'}`}>
                      {hasRequested ? 'Requested' : requestingId === listing.id ? '...' : 'Request'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {safetyInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[40px] shadow-2xl overflow-hidden p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg></div>
              <h2 className="text-xl font-black text-slate-800">Safety Verification</h2>
            </div>
            <div className="space-y-4">
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">{safetyInfo.content}</p>
              {safetyInfo.sources.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verified Sources</p>
                  <div className="flex flex-wrap gap-2">
                    {safetyInfo.sources.map((s, i) => (
                      <a key={i} href={s} target="_blank" className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors truncate max-w-[150px]">{s}</a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <button onClick={() => setSafetyInfo(null)} className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-colors">Understood</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExploreView;
