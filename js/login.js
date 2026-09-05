// ─────────────────────────────────────────────────────────────
// js/login.js — หน้าเข้าสู่ระบบ/สมัครสมาชิก
// ─────────────────────────────────────────────────────────────

import { auth, db } from "./firebaseConfig.js";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

(function () {
  var แท็บเข้าสู่ระบบ = document.getElementById("แท็บเข้าสู่ระบบ");
  var แท็บสมัครสมาชิก = document.getElementById("แท็บสมัครสมาชิก");
  var ฟอร์มเข้าสู่ระบบ = document.getElementById("ฟอร์มเข้าสู่ระบบ");
  var ฟอร์มสมัครสมาชิก = document.getElementById("ฟอร์มสมัครสมาชิก");
  var กล่องเตือน = document.getElementById("ข้อความเตือน");

  แท็บเข้าสู่ระบบ.addEventListener("click", function () { สลับแท็บ(true); });
  แท็บสมัครสมาชิก.addEventListener("click", function () { สลับแท็บ(false); });

  function สลับแท็บ(เป็นเข้าสู่ระบบ) {
    กล่องเตือน.classList.add("hidden");
    ฟอร์มเข้าสู่ระบบ.classList.toggle("hidden", !เป็นเข้าสู่ระบบ);
    ฟอร์มสมัครสมาชิก.classList.toggle("hidden", เป็นเข้าสู่ระบบ);
    แท็บเข้าสู่ระบบ.className = เป็นเข้าสู่ระบบ ? "btn" : "btn-ghost";
    แท็บสมัครสมาชิก.className = เป็นเข้าสู่ระบบ ? "btn-ghost" : "btn";
  }

  function เตือน(ข้อความ) {
    กล่องเตือน.textContent = "⚠️ " + ข้อความ;
    กล่องเตือน.classList.remove("hidden");
  }

  ฟอร์มเข้าสู่ระบบ.addEventListener("submit", async function (e) {
    e.preventDefault();
    var อีเมล = document.getElementById("อีเมลเข้าสู่ระบบ").value.trim();
    var รหัสผ่าน = document.getElementById("รหัสผ่านเข้าสู่ระบบ").value;

    if (!อีเมล || !รหัสผ่าน) {
      เตือน("กรอกอีเมลและรหัสผ่านก่อน");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, อีเมล, รหัสผ่าน);
      location.href = "leave-requests.html";
    } catch (err) {
      เตือน("เข้าสู่ระบบไม่สำเร็จ (" + err.message + ")");
    }
  });

  ฟอร์มสมัครสมาชิก.addEventListener("submit", async function (e) {
    e.preventDefault();
    var ชื่อ = document.getElementById("ชื่อสมัคร").value.trim();
    var อีเมล = document.getElementById("อีเมลสมัคร").value.trim();
    var รหัสผ่าน = document.getElementById("รหัสผ่านสมัคร").value;

    if (!ชื่อ || !อีเมล || !รหัสผ่าน) {
      เตือน("กรอกให้ครบทุกช่องก่อนสมัครสมาชิก");
      return;
    }
    try {
      var ผลลัพธ์ = await createUserWithEmailAndPassword(auth, อีเมล, รหัสผ่าน);
      await updateProfile(ผลลัพธ์.user, { displayName: ชื่อ });
      await setDoc(doc(db, "users", ผลลัพธ์.user.uid), { name: ชื่อ, email: อีเมล, role: "employee" });
      location.href = "leave-requests.html";
    } catch (err) {
      เตือน("สมัครสมาชิกไม่สำเร็จ (" + err.message + ")");
    }
  });
})();
