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

## Backend Schema Notes (Phase 0: Stability + Trust)

### 1) Ramadan Targets Contract
`ramadanService.getChecklist()` now normalizes all checklist records to:

```ts
{ id: string, label: string, category?: string, points?: number }
```

Both Firestore-backed and fallback records are normalized to this shape.

### 2) Kids Content Contracts

#### Kids Quiz
`kidsService.getQuizzes()` always returns:

```ts
{
  id: string,
  title: string,
  description?: string,
  questions: Array<{
    question: string,
    options: string[],
    correctIndex: number,
    explanation?: string,
  }>
}
```

#### Kids Stories
`kidsService.getStories()` / `getStoryById()` always return:

```ts
{ id: string, title: string, short: string, content: string, moral?: string }
```

If `short` is missing in source data, it is auto-generated from the first 140 chars of `content`.

### 3) Ramadan Calendar Completion Persistence

Firestore path used for authenticated users:

```text
users/{uid}/ramadan/{year}/days/{dayNumber}
```

Document shape:

```ts
{ completed: boolean, completedAt: string | null }
```

For anonymous users, completion is saved locally first and synced to Firestore after auth/upgrade when calendar sync runs.

### 4) Notification Preferences Persistence (no push yet)

Notification toggles are now persisted in both local cache and Firestore under:

```text
users/{uid}.settings
```

Fields:

```ts
{
  notif_prayer: boolean,
  notif_iftar: boolean,
  notif_dua: boolean,
  notif_kids: boolean,
}
```
