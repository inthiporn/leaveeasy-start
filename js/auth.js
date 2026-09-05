// ─────────────────────────────────────────────────────────────
// js/auth.js — โมดูลกลางเรื่องล็อกอิน ใช้ร่วมกันทุกหน้า
// เติมชื่อ/ปุ่มออกจากระบบใน #navUser (placeholder จาก js/nav.js)
// และให้หน้าที่ต้องล็อกอินก่อนถึงจะใช้ได้ เรียก ต้องล็อกอิน()
// ─────────────────────────────────────────────────────────────

import { auth } from "./firebaseConfig.js";
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

onAuthStateChanged(auth, function (user) {
  var กล่องผู้ใช้ = document.getElementById("navUser");
  if (!กล่องผู้ใช้) return;

  if (user) {
    กล่องผู้ใช้.innerHTML =
      "👤 " + (user.displayName || user.email) +
      ' <button type="button" class="btn-ghost" id="ปุ่มออกจากระบบ">ออกจากระบบ</button>';
    document.getElementById("ปุ่มออกจากระบบ").addEventListener("click", function () {
      signOut(auth).then(function () { location.href = "login.html"; });
    });
  } else {
    กล่องผู้ใช้.innerHTML = '<a href="login.html">เข้าสู่ระบบ</a>';
  }
});

// หน้าที่ต้องล็อกอินก่อนถึงจะอ่าน/เขียน Firestore ได้ เรียกฟังก์ชันนี้เป็นบรรทัดแรก
// ไม่ล็อกอิน → เด้งไปหน้า login.html ทันที
export function ต้องล็อกอิน() {
  return new Promise(function (resolve) {
    var เลิกฟัง = onAuthStateChanged(auth, function (user) {
      เลิกฟัง();
      if (!user) {
        location.href = "login.html";
        return;
      }
      resolve(user);
    });
  });
}
