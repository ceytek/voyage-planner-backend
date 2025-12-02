import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

const firebaseConfig = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  console.log('🔥 Initializing Firebase Admin SDK with project:', process.env.FIREBASE_PROJECT_ID);
  console.log('🔥 Firebase client email:', process.env.FIREBASE_CLIENT_EMAIL);
  admin.initializeApp({
    credential: admin.credential.cert(firebaseConfig as admin.ServiceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID,
  });
  console.log('✅ Firebase Admin SDK initialized successfully');
}

export const firebaseAuth = admin.auth();
export const firestore = admin.firestore();

export default admin;
