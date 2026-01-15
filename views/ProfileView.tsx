
import React, { useState } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';

interface ProfileViewProps {
  user: User;
  onLogout: () => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onLogout }) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user.name);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user.avatar);
  const [uploading, setUploading] = useState(false);
  return (
    <div className="pt-4 max-w-md mx-auto space-y-8">
      <div className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl text-center space-y-4">
        <div className="relative inline-block">
          {avatarPreview ? (
            <img src={avatarPreview} alt="avatar" className="w-24 h-24 object-cover rounded-3xl shadow-lg" />
          ) : (
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-700 rounded-3xl flex items-center justify-center text-white text-3xl font-black shadow-lg">
              {user.name.charAt(0)}
            </div>
          )}
          <button onClick={() => setEditing(true)} className="absolute -bottom-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
            <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" /></svg>
          </button>
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">{name}</h2>
          <p className="text-emerald-600 font-bold text-sm tracking-wide uppercase">{user.hostel}</p>
        </div>
        <div className="flex justify-center gap-8 py-4 border-y border-slate-50">
          <div>
            <span className="block font-black text-xl text-slate-800">{user.points}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Impact Pts</span>
          </div>
          <div>
            <span className="block font-black text-xl text-slate-800">Gold</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rank</span>
          </div>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[92%] max-w-md">
            <h3 className="font-bold text-lg mb-4">Edit Profile</h3>
            <label className="block text-sm font-semibold mb-2">Full name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded mb-4" />

            <label className="block text-sm font-semibold mb-2">Photo</label>
            <div className="flex items-center gap-4 mb-4">
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                const reader = new FileReader();
                reader.onload = () => {
                  setAvatarPreview(reader.result as string);
                  setUploading(false);
                };
                reader.readAsDataURL(file);
              }} />
              {avatarPreview && <img src={avatarPreview} className="w-12 h-12 rounded" />}
            </div>

            <div className="flex justify-end gap-2">
              <button onClick={() => setEditing(false)} className="px-4 py-2 bg-slate-100 rounded">Cancel</button>
              <button onClick={() => {
                const updates: any = { name };
                if (avatarPreview) updates.avatar = avatarPreview;
                apiService.updateUserProfile(updates);
                window.location.reload();
              }} className="px-4 py-2 bg-emerald-600 text-white rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[40px] border border-slate-100 shadow-lg overflow-hidden">
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-4 text-slate-600">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
              <p className="text-sm font-semibold">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Room Details</p>
              <p className="text-sm font-semibold">Room {user.roomNo}, {user.hostel}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Contact Number</p>
              <p className="text-sm font-semibold">{user.phone}</p>
            </div>
          </div>
        </div>
        
        <button 
          onClick={onLogout}
          className="w-full py-5 bg-slate-50 text-red-500 font-black border-t border-slate-100 hover:bg-red-50 transition-colors"
        >
          LOG OUT
        </button>
      </div>
    </div>
  );
};

export default ProfileView;
