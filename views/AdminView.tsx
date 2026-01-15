
import React from 'react';
import { FoodListing, FoodStatus } from '../types';

interface AdminViewProps {
  listings: FoodListing[];
  onRefresh: () => void;
}

const AdminView: React.FC<AdminViewProps> = ({ listings }) => {
  const totalPosts = listings.length;
  const activePosts = listings.filter(l => l.status === FoodStatus.AVAILABLE).length;
  const claimedPosts = listings.filter(l => l.status === FoodStatus.CLAIMED).length;

  return (
    <div className="pt-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-900">Admin Command Center</h1>
        <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest">Live Monitoring</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Total Items</p>
          <p className="text-3xl font-black text-slate-800">{totalPosts}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Active Listings</p>
          <p className="text-3xl font-black text-emerald-600">{activePosts}</p>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase">Successful Shares</p>
          <p className="text-3xl font-black text-blue-600">{claimedPosts}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Food Item</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Poster</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Status</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {listings.map(l => (
              <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-sm text-slate-800">{l.title}</p>
                  <p className="text-[10px] text-slate-400">{l.category}</p>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{l.userName}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                    l.status === FoodStatus.AVAILABLE ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">
                  {new Date(l.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminView;
