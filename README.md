# NoorRamadan

A premium Ramadan + Deen companion app built with Next.js, Firebase, and Tailwind CSS.

## Setup Instructions

1.  **Firebase Project**:
    *   Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project named `NoorRamadan`.
    *   Enable **Authentication** and choose the **Email/Password** provider.
    *   Create a **Firestore Database** in test mode (or apply the provided `firestore.rules`).
    *   Create a web app within your Firebase project to get your configuration.

2.  **Environment Variables**:
    *   Create a `.env.local` file in the root directory.
    *   Add the following variables with your Firebase config:
        ```env
        NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
        NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
        ```

3.  **Install Dependencies**:
    ```bash
    npm install
    ```

4.  **Run Locally**:
    ```bash
    npm run dev
    ```

5.  **Deployment**:
    *   Install Firebase CLI: `npm install -g firebase-tools`
    *   Login: `firebase login`
    *   Initialize: `firebase init hosting`
    *   Build: `npm run build`
    *   Deploy: `firebase deploy`

## Features
*   **Quran Reader**: Surahs Al-Fatiha and Al-Ikhlas seeded. Supports EN/UR/HI translations and transliteration.
*   **Prayer Timings**: Integrated city-based UI (currently mock data, ready for API integration).
*   **Learn Namaz**: Visual, step-by-step Salah guide with "Kids Mode" and progress tracking.
*   **Duas**: Collection of essential Ramadan and daily supplications.
*   **Dashboard**: High-end Islamic aesthetic with Today's Iftar highlight.
*   **GenAI**: Personalized spiritual insights based on user activity (requires GenAI keys).
