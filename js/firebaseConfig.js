// js/firebaseConfig.js — ตั้งค่าการเชื่อมต่อ Firebase/Firestore ของโปรเจกต์นี้
//
// apiKey ของ Firebase web app ไม่ใช่ความลับ ฝังในโค้ดฝั่ง client ได้ตามปกติ
// ความปลอดภัยจริงควบคุมด้วย Firestore Security Rules (งานสัปดาห์ 7-8)

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAIaWpmP2LL3m8xp2d6jQUfatLEVUEKIwk",
  authDomain: "leaveeasy-inthiporn.firebaseapp.com",
  projectId: "leaveeasy-inthiporn",
  storageBucket: "leaveeasy-inthiporn.firebasestorage.app",
  messagingSenderId: "483933167593",
  appId: "1:483933167593:web:4ae659b3c2f8d686a1b578",
  measurementId: "G-SLN0WX1LFT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
