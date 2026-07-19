# 💚 FitIntelligence

**AI-Powered Blood Pressure Health Companion**

FitIntelligence is a mobile app that helps people in their late 40s and 50s manage and prevent high blood pressure through AI-driven workout tracking, meal analysis, smart food scanning, and personalized DASH diet recommendations — all powered by real-time data from wearable devices.

---

## 📖 About The Project

High blood pressure disproportionately affects adults in their late 40s and 50s. FitIntelligence was built to give this audience a simple, supportive, and medically-informed daily companion — combining fitness, nutrition, and behavioral nudges into one app, with an accessible, easy-to-navigate design.

---

## ✨ Features

### 🏃 Workout Tracking & Rewards
- Live wearable device integration (Apple Watch, Fitbit, Garmin)
- Real-time capture of heart rate, steps, calories, blood pressure, sleep, and SpO₂
- AI auto-logs workouts and flags abnormal vitals
- Points, badges, and streaks for consistent activity

### 🔔 Smart Motivational Notifications
- Detects missed workout days via wearable inactivity
- Sends motivational nudges with BP-specific health facts to encourage the user back on track

### 🍽️ AI Meal Photo Tracker
- Upload a photo of every meal
- AI identifies food items and assesses nutritional content
- Maintains a daily visual food diary

### 📋 AI-Powered DASH Diet Plans
- Personalized daily meal plans (breakfast through dinner) based on the DASH diet
- Adapts recommendations based on prior meal compliance and wearable vitals

### ⚠️ Harmful Food Warning System
- Instantly flags BP-harmful foods in uploaded meal photos (high sodium, saturated fat, etc.)
- Explains real health consequences and suggests healthier alternatives

### 📷 Smart Food Scanner
- Scan any product before buying
- AI verdict: BP-Friendly ✅, Caution ⚠️, or Avoid ⛔
- Breaks down concerning ingredients and suggests healthier alternatives

### 🛒 AI Shopping List Generator
- Generates a DASH-aligned grocery list organized by category
- Each item includes its specific BP benefit
- Checklist format for easy in-store use

### 📊 Progress Dashboard
- Weekly BP and step trend charts
- Workout and meal compliance streak calendar
- Achievement badges

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | Flutter (Dart) |
| Backend / Database | Firebase (Firestore, Auth, Storage) |
| AI | Anthropic Claude API (vision + text) |
| Wearables | Apple HealthKit, Google Fit, Fitbit API, Garmin API |
| State Management | Riverpod |
| Charts | fl_chart |
| Notifications | flutter_local_notifications |

---

## 📁 Project Structure

```
fitintelligence/
├── lib/
│   ├── main.dart
│   ├── app/            # App shell, routes, theme
│   ├── core/            # Constants, utils, error handling
│   ├── models/           # Data models
│   ├── services/         # AI, wearable, notification services
│   ├── repositories/       # Firestore data layer
│   ├── providers/         # State management
│   ├── screens/          # App screens
│   └── widgets/          # Reusable UI components
├── assets/             # Images, icons, fonts
├── test/               # Unit & widget tests
└── pubspec.yaml
```

---

## 🚀 Getting Started

### Prerequisites
- [Flutter SDK](https://docs.flutter.dev/get-started/install) (3.x or later)
- [Firebase account](https://firebase.google.com/) and CLI configured
- Anthropic API key
- Xcode (for iOS builds) / Android Studio (for Android builds)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/<your-username>/fitintelligence.git
   cd fitintelligence
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Configure Firebase**
   ```bash
   flutterfire configure
   ```

4. **Set up environment variables**

   Create a `.env` file in the root directory:
   ```
   ANTHROPIC_API_KEY=your_api_key_here
   FIREBASE_PROJECT_ID=your_project_id
   ```

5. **Run the app**
   ```bash
   flutter run
   ```

---

## 📱 Wearable Setup

FitIntelligence connects to wearable devices to capture real-time vitals:

- **Apple Watch** — requires HealthKit permissions on iOS
- **Fitbit / Garmin** — requires OAuth authentication via their respective developer APIs

See `lib/services/wearable/` for integration details.

---

## 🧪 Running Tests

```bash
flutter test
```

---

## 🗺️ Roadmap

- [ ] Multi-language support
- [ ] Family/caregiver linked accounts for remote monitoring
- [ ] Integration with healthcare provider portals
- [ ] Offline mode for meal logging
- [ ] Voice-guided navigation for accessibility

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## ⚠️ Medical Disclaimer

FitIntelligence provides general wellness guidance and is **not a substitute for professional medical advice, diagnosis, or treatment**. Always consult a qualified healthcare provider regarding any medical condition, including hypertension, before making changes to diet, exercise, or medication.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👤 Author

**Joseph**
Software Developer — Malawi
