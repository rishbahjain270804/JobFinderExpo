# JobFinder Expo

A modern React Native job finder app built with Expo, featuring real-time job search powered by Adzuna API and intelligent job matching.

## 🚀 Features

- **Smart Job Matching** - AI-powered algorithm matching jobs to your profile (100-point scoring system)
- **Real-time Job Search** - Live data from Adzuna API (34,488+ jobs in India)
- **Enhanced Filtering** - Filter by All Jobs, Top Matches (75%+), or Remote positions
- **Save & Apply** - Track saved jobs and applications with persistence
- **Complete Onboarding** - Conversational intake with validation
- **Beautiful UI** - Animated components with pull-to-refresh

## 📱 Screenshots

[Add screenshots here]

## 🛠️ Tech Stack

- **Framework**: React Native + Expo (~54.0.23)
- **Language**: TypeScript
- **Navigation**: React Navigation Stack
- **Storage**: AsyncStorage
- **API**: Adzuna Jobs API
- **Icons**: Expo Vector Icons (Feather)
- **Animations**: React Native Animated API

## 📦 Installation

```bash
# Clone repository
git clone https://github.com/yourusername/JobFinderExpo.git
cd JobFinderExpo

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Add your Adzuna API credentials to .env
# Get free API key at: https://developer.adzuna.com/
```

## 🔑 Environment Variables

Create a `.env` file with:

```env
ADZUNA_APP_ID=your_app_id_here
ADZUNA_API_KEY=your_api_key_here
EXPO_PUBLIC_BACKEND_URL=https://api.jspcoders.tech
```

## 🏃 Running the App

```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

## 📂 Project Structure

```
JobFinderExpo/
├── src/
│   ├── components/       # Reusable components
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # App screens
│   │   ├── GateScreen.tsx
│   │   ├── WelcomeScreen.tsx
│   │   ├── ManualIntakeScreen.tsx
│   │   ├── PreloadScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── DetailsScreen.tsx
│   │   ├── SavedJobsScreen.tsx
│   │   └── AppliedJobsScreen.tsx
│   ├── services/         # API & business logic
│   │   ├── api.ts
│   │   ├── jobMatcher.ts
│   │   └── realTimeJobScraper.ts
│   ├── theme/            # Colors & styling
│   └── types/            # TypeScript types
├── server/               # Backend API (optional)
├── assets/               # Images & fonts
└── app.json              # Expo configuration
```

## 🎯 Matching Algorithm

Our intelligent matching algorithm scores jobs 0-100 based on:

- **Skills** (35 points) - Enhanced with synonyms & fuzzy matching
- **Experience** (20 points) - Years of experience alignment
- **Work Mode** (15 points) - Remote/Hybrid/On-site preference
- **Location** (15 points) - Geographic match
- **Role** (15 points) - Career goal alignment
- **Salary** (10 points) - Compensation expectations

## 🌐 API Integration

Uses **Adzuna API** for job data:
- Free tier: 1000 calls/month
- 6-hour caching for optimization
- 34,488+ jobs available in India
- Real-time salary data

## 📱 Screens

1. **Gate** - Initial loading screen
2. **Welcome** - App introduction
3. **Manual Intake** - Conversational onboarding with validation
4. **Preload** - Data preparation
5. **Home** - Job feed with filters & stats
6. **Details** - Job details with apply/save
7. **Saved Jobs** - Bookmarked jobs management
8. **Applied Jobs** - Application tracking with statistics

## 🔐 Data Persistence

All data stored locally using AsyncStorage:
- User profile (`profileManualData`)
- Saved jobs (`savedJobs`)
- Applied jobs (`appliedJobsWithDates`)
- Job cache (6-hour TTL)

## 🚀 Deployment

### Build for Production

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

### Deploy Backend

```bash
cd server
npm install
npm run build
# Deploy to api.jspcoders.tech
```

## 🌍 Deep Linking

App supports universal links:
- iOS: `tech.jspcoders.jobfinder://`
- Android: `tech.jspcoders.jobfinder://`
- Web: `https://jspcoders.tech/jobs`

## 📄 License

MIT License - feel free to use for your projects!

## 👨‍💻 Author

**JSPCoders**
- Website: [jspcoders.tech](https://jspcoders.tech)
- Domain: jspcoders.tech

## 🤝 Contributing

Contributions welcome! Please open an issue or PR.

## 📝 TODO

- [ ] Add job alerts/notifications
- [ ] Implement user authentication
- [ ] Add chat/messaging with employers
- [ ] Resume upload & parsing
- [ ] Interview scheduling
- [ ] Job recommendations based on behavior

## 🙏 Acknowledgments

- Adzuna API for job data
- Expo team for amazing tools
- React Native community

---

Built with ❤️ by JSPCoders
