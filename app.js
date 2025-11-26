// app.js

// 從 Firebase CDN 載入模組版 SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/10.14.0/firebase-firestore.js";

// ===== 你的 Firebase 設定（已套用你給的 config） =====
const firebaseConfig = {
  apiKey: "AIzaSyDsxwPxXP5O-MTQ0PXLbsTFIwP8jfP2BiA",
  authDomain: "office-garden-d2a31.firebaseapp.com",
  projectId: "office-garden-d2a31",
  storageBucket: "office-garden-d2a31.firebasestorage.app",
  messagingSenderId: "77115176802",
  appId: "1:77115176802:web:afead52eb21c336e661e3b",
  measurementId: "G-DJXTJXMY4J"
};

// 初始化 Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 指到 plants 這個 collection（會自動建立）
const plantsRef = collection(db, "plants");

// ===== DOM 元件 =====
const garden = document.getElementById("garden");
const nameInput = document.getElementById("nameInput");
const saveNameBtn = document.getElementById("saveName");
const randomPlantBtn = document.getElementById("randomPlant");

// ===== 名稱（存在 localStorage）=====
let myName = localStorage.getItem("officeGardenName") || "";
if (myName) {
  nameInput.value = myName;
}

// 設定名稱
saveNameBtn.addEventListener("click", () => {
  const n = nameInput.value.trim();
  if (!n) {
    alert("先輸入一個名字吧！");
    return;
  }
  myName = n;
  localStorage.setItem("officeGardenName", myName);
  alert("名稱已設定：" + myName);
});

// ===== 新增一棵植物到 Firestore =====
async function plantAt(xPercent) {
  if (!myName) {
    alert("請先設定名稱！");
    return;
  }

  try {
    await addDoc(plantsRef, {
      owner: myName,
      x: xPercent,       // 在花園寬度的百分比位置
      stage: 0,          // 0 = 🌱，之後可以做升級
      createdAt: Date.now()
    });
  } catch (err) {
    console.error("新增植物失敗：", err);
    alert("種植失敗 QQ，等等再試試看");
  }
}

// 點草地種植物
garden.addEventListener("click", (e) => {
  const rect = garden.getBoundingClientRect();
  const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
  plantAt(xPercent);
});

// 按鈕：隨機種一棵
randomPlantBtn.addEventListener("click", () => {
  const x = Math.random() * 100;
  plantAt(x);
});

// ===== 即時監聽 Firestore（多人同步） =====
const qPlants = query(plantsRef, orderBy("createdAt", "asc"));

onSnapshot(qPlants, (snapshot) => {
  const plants = snapshot.docs.map(doc => doc.data());
  renderGarden(plants);
});

// ===== 把所有植物畫到畫面上 =====
function renderGarden(plants) {
  garden.innerHTML = "";

  plants.forEach((p) => {
    const div = document.createElement("div");
    div.className = "plant";

    // x 決定左右位置，y 這邊簡單固定在草地交界上方
    div.style.left = `${p.x}%`;
    div.style.top = "60%";

    let icon = "🌱";
    if (p.stage === 1) icon = "🌿";
    if (p.stage === 2) icon = "🌳";

    div.innerHTML = `
      <div>${icon}</div>
      <div class="owner">${p.owner}</div>
