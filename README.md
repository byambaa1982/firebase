
# Flash Card React App for Kids

This is a simple React flash card app for kids, using Firebase for authentication, database, and image storage.

## Features
- Sign in with Google (Firebase Authentication)
- Create, view, edit, and delete flash cards (Firestore)
- Upload images for flash cards (Firebase Storage)
- Tailwind CSS for easy styling

## Getting Started

### 1. Prerequisites
- Node.js and npm installed
- A Google account
- Firebase CLI installed (`npm install -g firebase-tools`)

### 2. Clone and Install
```
git clone <your-repo-url>
cd <project-folder>
npm install
```

### 3. Set Up Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. In your project, add a web app and copy the Firebase config.
3. Replace the placeholders in `src/firebase.js` with your config values.
4. In the project folder, run:
	```
	firebase login
	firebase init
	```
	- Select **Hosting**, **Firestore**, and **Storage**
	- Use `dist` as the public directory (or `build` if using Create React App)
	- Configure as a single-page app (yes)
	- Do **not** overwrite `index.html` if asked

### 4. Run the App Locally
```
npm run dev
```

### 5. Deploy to Firebase Hosting
```
npm run build
firebase deploy
```

### 6. See Your App Online!
Firebase will give you a link after deploy.

---

**Tip:** If you get stuck, ask your teacher or search for "Firebase Hosting deploy" online.
