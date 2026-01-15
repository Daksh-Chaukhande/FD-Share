
import React, { useState, useEffect, useRef } from 'react';
import { User, FoodCategory, Coordinates } from '../types';
import { apiService } from '../services/apiService';
import { geminiService } from '../services/geminiService';

interface PostFoodViewProps {
  user: User;
  onSuccess: () => void;
}

const PostFoodView: React.FC<PostFoodViewProps> = ({ user, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [userCoords, setUserCoords] = useState<Coordinates | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const getDefaultExpiry = () => {
    const now = new Date();
    now.setHours(now.getHours() + 4);
    return now.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: FoodCategory.MEAL,
    quantity: '',
    expiryTime: getDefaultExpiry(),
    locationName: `Hostel A, Room ${user.roomNo}`,
    imageUrl: '',
    isSafetyChecked: false
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserCoords({ lat: position.coords.latitude, lng: position.coords.longitude }),
        () => setUserCoords({ lat: 12.9716, lng: 77.5946 })
      );
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);
        setFormData(prev => ({ ...prev, imageUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSmartScan = async () => {
    if (!imagePreview) return;
    setAnalyzing(true);
    const aiResults = await geminiService.analyzeFoodImage(imagePreview);
    if (aiResults) {
      setFormData(prev => ({
        ...prev,
        title: aiResults.title || prev.title,
        category: aiResults.category as FoodCategory || prev.category,
        description: `${aiResults.description}\n\nAI Safety Tip: ${aiResults.storageTip}` || prev.description,
      }));
    }
    setAnalyzing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.isSafetyChecked) {
      alert("Please confirm that the food is safe for consumption.");
      return;
    }
    if (!formData.imageUrl) {
      alert("Please add a photo of the food.");
      return;
    }
    
    setLoading(true);
    await apiService.addListing({
      userId: user.id,
      userName: user.name,
      title: formData.title,
      description: formData.description,
      category: formData.category,
      quantity: formData.quantity,
      expiryTime: new Date(formData.expiryTime).toISOString(),
      locationName: formData.locationName,
      coordinates: userCoords || { lat: 12.9716, lng: 77.5946 },
      imageUrl: formData.imageUrl,
      isSafetyChecked: formData.isSafetyChecked
    });
    setLoading(false);
    onSuccess();
  };

  return (
    <div className="pt-4 max-w-lg mx-auto pb-10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-100 rounded-xl text-emerald-600">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Post Surplus Food</h1>
          <p className="text-sm text-slate-500">Share with your campus community.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 bg-white p-6 rounded-3xl border border-slate-100 shadow-xl">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Food Photo</label>
          <div 
            onClick={() => !imagePreview && fileInputRef.current?.click()}
            className={`relative h-56 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
              imagePreview ? 'border-emerald-500 ring-4 ring-emerald-50' : 'border-slate-300 hover:border-emerald-400 bg-slate-50'
            }`}
          >
            {imagePreview ? (
              <>
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3 opacity-0 hover:opacity-100 transition-opacity">
                  <button type="button" onClick={(e) => {e.stopPropagation(); handleSmartScan();}} disabled={analyzing}
                    className="bg-white text-emerald-700 px-6 py-2 rounded-xl font-bold text-sm shadow-xl flex items-center gap-2 hover:bg-emerald-50 active:scale-95 transition-all">
                    {analyzing ? (
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    ) : <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1014 0c0-1.807-.73-3.44-1.919-4.61a1 1 0 00-1.414 1.414A5.001 5.001 0 0115 11a5 5 0 11-10 0c0-1.653.602-2.153 1.054-2.459a.33.33 0 00.046-.034 4.542 4.542 0 01.127.464c.231.815.549 1.677.956 2.356.408.681.982 1.276 1.817 1.276a1 1 0 001-1 31.365 31.365 0 01.614-3.58c.225-.966.505-1.93.839-2.734.167-.403.356-.785.57-1.116.208-.322.477-.65.822-.88z" clipRule="evenodd" /></svg>}
                    {analyzing ? 'Analyzing...' : 'AI Smart Scan'}
                  </button>
                  <button type="button" onClick={(e) => {e.stopPropagation(); fileInputRef.current?.click();}} className="text-white text-xs font-bold underline">Change Photo</button>
                </div>
              </>
            ) : (
              <div className="text-center p-4">
                <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <p className="text-sm font-bold text-slate-500">Tap to Capture Food Photo</p>
                <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-black">AI Auto-fills details</p>
              </div>
            )}
            <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageChange} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Food Title</label>
          <input required type="text" placeholder="e.g. Fresh Homemade Pasta" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Category</label>
            <select className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
              value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as FoodCategory})}>
              <option value={FoodCategory.MEAL}>Meal</option>
              <option value={FoodCategory.SNACK}>Snack</option>
              <option value={FoodCategory.FRUITS}>Fruits</option>
              <option value={FoodCategory.BEVERAGE}>Beverage</option>
              <option value={FoodCategory.OTHER}>Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Best Before</label>
            <input required type="datetime-local" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none"
              value={formData.expiryTime} onChange={e => setFormData({...formData, expiryTime: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Quantity</label>
          <input required type="text" placeholder="e.g. 2 portions" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none"
            value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Details</label>
          <textarea placeholder="Ingredients, allergens, or pickup notes..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none h-24 resize-none"
            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
        </div>

        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
          <input id="safety" type="checkbox" className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            checked={formData.isSafetyChecked} onChange={e => setFormData({...formData, isSafetyChecked: e.target.checked})}
          />
          <label htmlFor="safety" className="text-[10px] text-amber-800 leading-tight font-medium uppercase tracking-tight">
            I certify that this food is fresh and safe for consumption. I accept responsibility for hygiene.
          </label>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl shadow-xl hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
          {loading ? 'Posting...' : "Post for Pickup"}
        </button>
      </form>
    </div>
  );
};

export default PostFoodView;
