# 🎯 Complete Visitor Tracking System Documentation

## Overview

A production-ready visitor tracking system built with Node.js, Express, and MongoDB that tracks all portfolio visits with intelligent duplicate detection and daily analytics.

---

## ✨ Features

### 1. **Automatic Visit Tracking**
- Tracks every visitor automatically when they access your portfolio
- Captures IP address, User-Agent, referrer, and page visited
- No additional setup needed on frontend

### 2. **Duplicate Prevention (5-Minute Window)**
- Prevents counting the same IP twice within 5 minutes
- Ensures accurate visitor counts
- Handles rapid page reloads gracefully

### 3. **Daily Reset & Tracking**
- "Today's Visitors" automatically resets at midnight (00:00:00)
- Maintains separate all-time and daily counts
- Uses MongoDB timestamps for accuracy

### 4. **Unique Visitor Detection**
- Counts unique IP addresses
- Tracks both all-time and today's unique visitors
- Useful for understanding reach and impact

### 5. **Accurate IP Detection**
- Handles IPv4 and IPv6 addresses
- Works behind proxies (X-Forwarded-For)
- Normalizes IP formats consistently

### 6. **Comprehensive Analytics**
- Detailed daily breakdown (last 30 days)
- Top pages visited
- Top referrers
- Page view distribution

---

## 📂 File Structure

```
server/
├── models/
│   └── Visitor.js           # Two schemas: Visitor + VisitorStats
├── controllers/
│   └── visitorController.js # All tracking logic
├── routes/
│   └── visitors.js          # API endpoints
└── index.js                 # Trust proxy middleware

client/
└── src/pages/
    └── AdminDashboard.jsx   # Display stats
```

---

## 🔌 API Endpoints

### 1. **Track a Visitor**
```
POST /api/visitors/track
Content-Type: application/json

Body: {
  "page": "/path/to/page" (optional, defaults to "/")
}

Response: {
  "message": "Visitor tracked successfully",
  "isDuplicate": false,
  "visitorIP": "192.168.1.1"
}
```

**When Called:** Automatically on PublicView component mount
**Duplicate Check:** Yes (5-minute window)

---

### 2. **Get Visitor Statistics**
```
GET /api/visitors/stats

Response: {
  "success": true,
  "data": {
    "allTime": {
      "totalVisits": 150,
      "uniqueVisitors": 42
    },
    "today": {
      "visits": 12,
      "uniqueVisitors": 8
    },
    "total": 150,           // Legacy format
    "today": 12,            // Legacy format
    "unique": 42,           // Legacy format
    "todayUnique": 8,       // Legacy format
    "hasData": true
  }
}
```

**When Called:** Refreshed every 10 seconds in Analytics tab
**Used By:** AdminDashboard Analytics section

---

### 3. **Get Detailed Analytics**
```
GET /api/visitors/analytics

Response: {
  "success": true,
  "data": {
    "last7Days": 85,
    "topPages": [
      { "_id": "/", "count": 50 },
      { "_id": "/projects", "count": 25 }
    ],
    "topReferrers": [
      { "_id": "Direct", "count": 100 },
      { "_id": "google.com", "count": 30 }
    ]
  }
}
```

---

### 4. **Get Daily Breakdown**
```
GET /api/visitors/breakdown?days=30

Response: {
  "success": true,
  "data": [
    {
      "date": "2024-04-01",
      "visits": 25,
      "uniqueVisitors": 18
    }
  ]
}
```

---

### 5. **Reset All Data** ⚠️
```
POST /api/visitors/reset

Response: {
  "success": true,
  "message": "Visitor stats reset successfully",
  "data": {
    "total": 0,
    "today": 0,
    "unique": 0
  }
}
```

**⚠️ WARNING:** Deletes ALL visitor records. Use with caution!

---

## 📊 Data Models

### Visitor Schema
```javascript
{
  ip: String,              // Normalized IPv4/IPv6
  userAgent: String,       // Browser info
  referrer: String,        // Referrer source
  page: String,            // Page path visited
  visitDate: Date,         // Start of day (for daily tracking)
  country: String,         // Optional: GeoIP data
  city: String,            // Optional: GeoIP data
  createdAt: Date,         // Auto timestamp
  updatedAt: Date          // Auto timestamp
}
```

**Indexes:**
- `ip` (single)
- `visitDate` (single)
- `ip + visitDate` (compound)
- `createdAt` (for sorting)

### VisitorStats Schema
```javascript
{
  date: Date,              // Start of that day (unique)
  totalAllTime: Number,    // Cumulative total
  visitorsToday: Number,   // Today's count
  uniqueIPs: Number,       // All-time unique
  uniqueIPsToday: Number,  // Today's unique
  pageViews: Map<String, Number>, // By page
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 How It Works

### Automatic Visit Tracking
1. User visits your portfolio
2. `PublicView` component mounts
3. `useEffect` triggers `POST /api/visitors/track`
4. Server checks for duplicate (same IP in last 5 minutes)
5. If duplicate → response `isDuplicate: true`, no record created
6. If new → visitor record saved to MongoDB
7. Server updates aggregate stats in `VisitorStats`

### Daily Reset (Automatic)
- Each visitor record has a `visitDate` field
- Set to start of day (00:00:00) when created
- Queries use `visitDate: today` for daily counts
- At midnight, new records go to new date
- No manual reset needed for daily counts

### Unique Visitor Counting
```javascript
// All-time unique
const uniqueIPs = await Visitor.distinct('ip');

// Today's unique
const uniqueIPsToday = await Visitor.distinct('ip', {
  visitDate: today
});
```

---

## 🔧 Configuration

### Server Configuration
```javascript
// server/index.js
app.set('trust proxy', 1);  // Important for accurate IP behind proxy
```

This allows Express to read `X-Forwarded-For` header from proxies.

### Frontend Auto-Tracking
```javascript
// client/src/pages/PublicView.jsx
useEffect(() => {
  fetch('http://localhost:5001/api/visitors/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page: window.location.pathname })
  }).catch(() => console.log('Tracking failed'));
}, []);
```

---

## 📈 Viewing Analytics

### In Admin Dashboard
1. Go to **Analytics** tab
2. See:
   - **Total Visits**: All-time visit count
   - **Today's Visits**: Last 24 hours
   - **Unique All-Time**: Total unique IPs ever
   - **Unique Today**: Today's unique IPs

### No Data Message
If no visits tracked yet:
```
"No visitor data yet. Stats will update when users visit your portfolio site."
```

---

## 🛡️ Edge Cases Handled

| Scenario | Handling |
|----------|----------|
| **Same IP, rapid clicks** | 5-minute duplicate check |
| **IPv6 localhost** | Normalized to `127.0.0.1` |
| **Behind proxy** | `trust proxy` + X-Forwarded-For |
| **Server restart** | Data persists in MongoDB |
| **Midnight date change** | `visitDate` field ensures reset |
| **Browser close/refresh** | Each visit counted separately (unless within 5 min) |

---

## 🧪 Testing the System

### 1. Test Visitor Tracking
```bash
curl -X POST http://localhost:5001/api/visitors/track \
  -H "Content-Type: application/json" \
  -d '{"page": "/"}'
```

### 2. Check Stats
```bash
curl http://localhost:5001/api/visitors/stats
```

### 3. Reset Data
```bash
curl -X POST http://localhost:5001/api/visitors/reset
```

### 4. Browser Console
Visit your portfolio and check browser console:
- Should see tracking request
- Should see no errors in network tab

---

## 💾 Database Queries

### Count Today's Visitors
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0);

const count = await Visitor.countDocuments({ visitDate: today });
```

### Find Duplicate Detection Issue
```javascript
// Recent visits from an IP
const recent = await Visitor.find({
  ip: 'YOUR_IP',
  createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
}).sort({ createdAt: -1 });
```

### Clear Old Data (Optional)
```javascript
// Keep only last 90 days
const ninetyDaysAgo = new Date();
ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

await Visitor.deleteMany({
  createdAt: { $lt: ninetyDaysAgo }
});
```

---

## 📝 Common Issues & Solutions

### Issue: Stats not updating
**Solution:** Check if Analytics tab is active (stats only auto-refresh when viewing)

### Issue: Same visitor counted multiple times
**Solution:** 5-minute duplicate check working. Space clicks 5+ minutes apart.

### Issue: "No visitor data yet" persists
**Solution:** Visit your live portfolio URL, not localhost (different IP)

### Issue: Incorrect IP detection
**Solution:** Ensure `trust proxy` is set in server/index.js

---

## 🚀 Future Enhancements

- [ ] Geolocation tracking (city/country)
- [ ] Device type detection (mobile/desktop)
- [ ] Visitor session tracking
- [ ] Heatmap integration
- [ ] Custom date range analytics
- [ ] Export analytics to CSV
- [ ] Visitor flow visualization

---

## 📊 Performance Notes

- **MongoDB Indexes:** Optimized for fast queries
- **Duplicate Check:** O(1) with indexed IP + time fields
- **Aggregation:** Uses MongoDB pipelines for efficiency
- **Real-time Updates:** Server-side calculation, not polling

---

## ✅ Checklist

- [x] Track all visits automatically
- [x] Prevent duplicate counts (5-min window)
- [x] Daily reset at midnight
- [x] Unique visitor detection
- [x] IP normalization
- [x] Proxy support
- [x] MongoDB persistence
- [x] Admin dashboard display
- [x] "No data" message
- [x] Production-ready code

---

**Last Updated:** April 3, 2026
**Status:** ✅ Production Ready
