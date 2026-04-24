# Stocksy Mobile 📈

A React Native (Expo) stock tracking app.

---

## 🚀 Quick Setup (Fresh Start)

### 1. Prerequisites
Make sure you have these installed:
- **Node.js** v18+ → https://nodejs.org
- **Expo CLI** → `npm install -g expo-cli`
- **Expo Go** app on your phone (iOS / Android)

### 2. Unzip & Install
```bash
# Unzip the folder, then:
cd Stocksy_Mobile

# Install all dependencies (clean install)
npm install
```

### 3. Configure Environment
Open `.env` and update:
```
API_BASE_URL=https://your-actual-api-url.com/api
```

### 4. Run the App
```bash
npm start
# or
npx expo start
```
Then scan the QR code with Expo Go on your phone.

---

## 📁 Folder Structure
```
Stocksy_Mobile/
├── assets/               ← Images, icons, splash
├── services/
│   ├── api.js            ← Axios instance with interceptors
│   └── authService.js    ← login / signup / logout
├── src/
│   ├── components/
│   │   ├── Button.js     ← Reusable button (primary/outline/danger)
│   │   └── Input.js      ← Reusable text input with validation
│   └── pages/
│       ├── LoginPage.js
│       ├── SignupPage.js
│       └── DashboardPage.js
├── App.js                ← Navigation setup
├── index.js              ← Entry point
├── app.json              ← Expo config
├── babel.config.js
├── tailwind.config.js
├── .env                  ← Environment variables
└── package.json
```

---

## 🛠️ If you have issues

**Clear everything and reinstall:**
```bash
rm -rf node_modules
rm package-lock.json
npm install
npx expo start --clear
```

**Metro bundler cache:**
```bash
npx expo start --clear
```
