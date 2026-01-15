# Food Share - College Food Sharing Platform

A React-based web application for college students to share and claim leftover food, reducing food waste and helping the community.

## Features

- **Food Listings**: Post available food items with details like category, quantity, expiry time, and location
- **Real-time Sync**: Listings are synchronized across devices on the same local network
- **User Authentication**: Simple login system for students and admins
- **Dashboard**: View and manage food listings and requests
- **Admin Panel**: Administrative controls for managing the platform
- **Offline Support**: Falls back to local storage when backend is unavailable

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Backend**: Node.js, Express.js
- **Styling**: Tailwind CSS (via components)
- **AI Integration**: Google Gemini API for food safety checks

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Daksh-Chaukhande/FD-Share.git
   cd FD-Share
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Copy `.env.local` and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the backend server:**
   ```bash
   node server.js
   ```
   The backend will run on `http://localhost:3001`

5. **Start the frontend (in a new terminal):**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

## Usage

### Local Network Access
To access the app from other devices on the same network:
- Frontend: `http://YOUR_IP_ADDRESS:3000`
- Backend: `http://YOUR_IP_ADDRESS:3001`

### Creating Food Listings
1. Log in with any email (admin@domain.com for admin access)
2. Navigate to "Post Food"
3. Fill in the details and submit
4. Listings will be visible to all users on the network

### Claiming Food
1. Browse available listings in "Explore"
2. Send a request to the donor
3. Wait for approval and contact sharing

## Project Structure

```
├── components/          # Reusable React components
├── services/           # API and external service integrations
├── views/             # Main application views/pages
├── server.js          # Node.js backend server
├── App.tsx           # Main React application
├── types.ts          # TypeScript type definitions
└── vite.config.ts    # Vite configuration
```

## API Endpoints

- `GET /listings` - Get all food listings
- `POST /listings` - Create a new food listing
- `PATCH /listings/:id` - Update listing status
- `DELETE /listings/:id` - Delete a listing
- `GET /requests` - Get food requests
- `POST /requests` - Create a food request

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
