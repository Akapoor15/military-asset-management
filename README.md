# 🛡️ Military Asset Management System

## 🎯 Live Demo

🌐 **Frontend:** https://military-asset-management-opal.vercel.app  
🔗 **Backend API:** https://military-asset-management-n1gb.onrender.com

## 📘 Project Description

🛡️ Full-stack Military Asset Management system for tracking, auditing, and managing assets across bases with transparency, efficiency, and lifecycle monitoring.

The Military Asset Management System is a full-stack application built to track, manage, and audit military assets across multiple bases. It provides transparency, accountability, and efficiency in handling asset purchases, transfers, assignments, and expenditures — ensuring that every item is tracked throughout its lifecycle.

## ⚙️ Core Features

- 🧾 **Asset Purchases:** Record new acquisitions with pricing, vendor info, and base assignment
- 🔄 **Asset Transfers:** Secure inter-base transfer workflow with quantity tracking
- 🎖️ **Asset Assignments:** Assign assets to personnel with return tracking
- 💥 **Asset Expenditures:** Record permanent asset usage with reason tracking
- 📊 **Dashboard Analytics:** Real-time stats on Opening Balance, Closing Balance, Net Movement, Assigned, and Expended
- 📈 **Visual Charts:** 
  - Assets by Type (Pie Chart)
  - Asset Availability (Bar Chart)
- 🔐 **Unified Authentication:** Login and registration with JWT
- 🧩 **Role-Based Access:** Admin, Base Commander, and Logistics Officer levels
- 🔄 **Data Synchronization:** Sync local data to MongoDB with one click

## 🏗️ Project Structure
military-asset-management/
├── backend/
│ ├── src/
│ │ ├── models/ # MongoDB models
│ │ ├── routes/ # API routes
│ │ ├── middleware/ # Auth middleware
│ │ ├── utils/ # Database connection
│ │ └── server.js # Entry point
│ ├── package.json
│ └── .env # Environment variables
├── frontend/
│ ├── src/
│ │ ├── pages/ # Page components
│ │ │ ├── Login.jsx
│ │ │ ├── Dashboard.jsx
│ │ │ ├── AdminDashboard.jsx
│ │ │ ├── CommanderDashboard.jsx
│ │ │ ├── LogisticsDashboard.jsx
│ │ │ ├── Purchases.jsx
│ │ │ ├── Transfers.jsx
│ │ │ └── Assignments.jsx
│ │ ├── context/ # React contexts
│ │ │ └── AssetContext.jsx
│ │ ├── App.js # Main app component
│ │ └── index.js # Entry point
│ ├── public/ # Static assets
│ ├── package.json
│ └── tailwind.config.js # Tailwind CSS config
└── README.md



## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Deployment:** Render

### Frontend
- **Framework:** React 19
- **Routing:** React Router
- **Styling:** Tailwind CSS
- **State Management:** React Context API
- **HTTP Client:** Fetch API
- **Deployment:** Vercel

## 💻 Local Setup

### Prerequisites

- Node.js v18+ installed
- MongoDB Atlas account (or local MongoDB)
- Git

### 1️⃣ Clone the Repository

git clone https://github.com/Akapoor15/military-asset-management.git
cd military-asset-management
### 2️⃣ Backend Setup

cd backend
npm installCreate a `.env` file in the `backend/` directory:
nv
PORT=5050
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/mams?retryWrites=true&w=majority
JWT_SECRET=replace-with-strong-secret
NODE_ENV=development**Replace `<user>`, `<pass>`, and `<cluster>` with your MongoDB Atlas credentials/host.**

**Ensure your Atlas cluster allows your IP:**
- Go to Security → Network Access → Add IP → "Allow Access from Anywhere" (for testing only)

Start the backend:

npm run devThe backend will run on `http://localhost:5050`

**Verify backend:**
curl http://localhost:5050/api/healthExpected response:
{"ok":true,"service":"military-asset-management-backend"}### 3️⃣ Frontend Setup

cd frontend
npm installCreate a `.env` file in the `frontend/` directory:

REACT_APP_API_URL=http://localhost:5050Start the frontend:
ash
npm startThe frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Assets
- `GET /api/assets` - Get all assets
- `POST /api/assets` - Create asset (Admin, Logistics Officer)
- `GET /api/assets/:id` - Get asset by ID
- `PUT /api/assets/:id` - Update asset (Admin, Logistics Officer)
- `DELETE /api/assets/:id` - Delete asset (Admin only)

### Purchases
- `GET /api/purchases` - Get all purchases
- `POST /api/purchases` - Create purchase (Admin, Logistics Officer)

### Transfers
- `GET /api/transfers` - Get all transfers
- `POST /api/transfers` - Create transfer (All roles)

### Assignments
- `GET /api/assignments` - Get all assignments
- `POST /api/assignments` - Create assignment (All roles)

### Dashboard
- `GET /api/dashboard/summary` - Get dashboard metrics

### Admin Utilities
- `POST /api/admin/purchases/replace` - Replace all purchases from local data
- `POST /api/admin/transfers/replace` - Replace all transfers from local data
- `POST /api/admin/assignments/replace` - Replace all assignments from local data

## 🔐 Default Roles

- **Admin:** Full system access to all features
- **Base Commander:** View and manage assets for assigned base
- **Logistics Officer:** Manage purchases and transfers

## 🎨 Features in Detail

### Dashboard
- Real-time metrics (Opening Balance, Closing Balance, Net Movement, Assigned, Expended)
- Interactive charts:
  - Assets by Type (Pie Chart with color-coded categories)
  - Asset Availability (Bar Chart showing Available vs Assigned)
- Recent transactions tables
- Filter by Base, Equipment Type, and Date

### Asset Management
- Track inventory across multiple bases (Base Alpha, Base Beta, Base Gamma, Base Delta)
- Automatic quantity updates on purchases/transfers/assignments
- Equipment types: Weapons, Vehicles, Ammunition, Equipment, Supplies

### Data Synchronization
- Sync local data to MongoDB with one click
- Replace entire collections from local state
- Automatic asset creation on transactions

## 🚀 Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm run start`
   - **Environment:** Node
4. Add Environment Variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A strong secret key
   - `NODE_VERSION` - 18
5. Set Health Check Path: `/api/health`
6. Deploy!

**Live Backend:** https://military-asset-management-n1gb.onrender.com

### Frontend (Vercel)

1. Import your GitHub repository on Vercel
2. Configure:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Create React App
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
3. Add Environment Variable:
   - `REACT_APP_API_URL` - Your Render backend URL
4. Deploy!

**Live Frontend:** https://military-asset-management-opal.vercel.app

### MongoDB Atlas Setup

1. Create a cluster on MongoDB Atlas
2. Create a database user with read/write permissions
3. Whitelist IP addresses (or use 0.0.0.0/0 for development)
4. Get your connection string and add it to environment variables

## 📝 Notes

- Ensure your MongoDB Atlas cluster allows incoming connections from your IP (or use 0.0.0.0/0 for development)
- Use a strong JWT_SECRET for security
- Free tier Render instances spin down after inactivity (50+ second cold start)
- Ensure the backend is running before starting the frontend
- The frontend requires `REACT_APP_API_URL` environment variable
- All API calls are made to the backend URL specified in the environment variable
- For production, make sure CORS is properly configured on the backend

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Protected API routes
- CORS enabled for frontend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 🧠 Author

**Akshita Kapoor**
- GitHub: [@Akapoor15](https://github.com/Akapoor15)

*"Designed with precision. Built for accountability."*

## 🏅 License

This project is licensed under the MIT License – feel free to modify and use it.

---

For issues or questions, please open an issue on GitHub.

