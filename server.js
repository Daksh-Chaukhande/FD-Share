
/**
 * TO RUN THIS SERVER:
 * 1. Install Node.js
 * 2. Create a folder and run: npm init -y
 * 3. Run: npm install express cors body-parser
 * 4. Save this code as server.js
 * 5. Run: node server.js
 */

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors());
app.use(bodyParser.json());

// In-memory "Database" for demo (restarts clear data)
let db = {
  listings: [
    {
      id: '1',
      userId: 'user2',
      userName: 'Ananya Sharma',
      title: 'Extra Home-cooked Biryani',
      description: 'Freshly prepared chicken biryani. Too much for me to finish.',
      category: 'Meal',
      quantity: '2 servings',
      expiryTime: new Date(Date.now() + 3600000 * 4).toISOString(),
      locationName: 'Hostel A, Wing 2',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      imageUrl: 'https://picsum.photos/seed/biryani/600/400',
      status: 'available',
      isSafetyChecked: true,
      createdAt: new Date().toISOString()
    }
  ],
  requests: []
};

// Endpoints
app.get('/listings', (req, res) => res.json(db.listings));
app.post('/listings', (req, res) => {
  const newListing = {
    ...req.body,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString(),
    status: 'available'
  };
  db.listings.unshift(newListing);
  res.status(201).json(newListing);
});

app.patch('/listings/:id', (req, res) => {
  const { id } = req.params;
  db.listings = db.listings.map(l => l.id === id ? { ...l, ...req.body } : l);
  res.json({ success: true });
});

// Allow donors to delete their own listings. Requires { requesterId } in the request body.
app.delete('/listings/:id', (req, res) => {
  const { id } = req.params;
  const { requesterId } = req.body || {};
  const listing = db.listings.find(l => l.id === id);
  if (!listing) return res.status(404).json({ error: 'Listing not found' });
  if (requesterId !== listing.userId) return res.status(403).json({ error: 'Only the donor can delete this listing' });
  db.listings = db.listings.filter(l => l.id !== id);
  res.json({ success: true });
});

app.get('/requests', (req, res) => res.json(db.requests));
app.post('/requests', (req, res) => {
  const newRequest = {
    ...req.body,
    id: Math.random().toString(36).substr(2, 9),
    status: 'pending',
    timestamp: new Date().toISOString()
  };
  db.requests.push(newRequest);
  res.status(201).json(newRequest);
});

app.patch('/requests/:id', (req, res) => {
  const { id } = req.params;
  const reqObj = db.requests.find(r => r.id === id);
  if (reqObj && req.body.status === 'accepted') {
    db.listings = db.listings.map(l => l.id === reqObj.listingId ? { ...l, status: 'claimed', claimedBy: reqObj.requesterId } : l);
  }
  db.requests = db.requests.map(r => r.id === id ? { ...r, ...req.body } : r);
  res.json({ success: true });
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Food Share Backend running on http://localhost:${PORT}`);
  console.log(`Available on local network at your IP address.`);
});