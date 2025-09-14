// ====================== 🔹 Firebase Setup ======================
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getFirestore, collection, getDocs, query } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCMHCVkW-3maym87_MEWRMAJpbBpYpcCxE",
  authDomain: "vsmobiles-43528.firebaseapp.com",
  projectId: "vsmobiles-43528",
  storageBucket: "vsmobiles-43528.appspot.com",
  messagingSenderId: "1026685480980",
  appId: "1:1026685480980:web:ce02a6b5e1779e50387701",
  measurementId: "G-EGMM3NS67G"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ====================== 🔍 Page Detection ======================
const isMobilePage = window.location.pathname.includes("mobile.html");
const isIndexPage =
  window.location.pathname.includes("index.html") ||
  window.location.pathname === "/" ||
  window.location.pathname === "/index.html";

// ====================== 🏠 Index Page ======================
async function loadHomePage() {
  const params = new URLSearchParams(window.location.search);
  const brandName = params.get("brand");
  const searchTerm = params.get("search");

  const mobilesCol = collection(db, "mobiles");
  const snapshot = await getDocs(mobilesCol);
  let mobiles = snapshot.docs.map(doc => doc.data());

  if (brandName) {
    mobiles = mobiles.filter(m => m.brand.toLowerCase() === brandName.toLowerCase());
  }

  if (searchTerm) {
    mobiles = mobiles.filter(m => m.model.toLowerCase().includes(searchTerm.toLowerCase()));
  }

  const container = document.getElementById("mobiles-container");
  if (!container) return;

  if (mobiles.length === 0) {
    container.innerHTML = `<p style="text-align:center">No matching phones found.</p>`;
    return;
  }

  container.innerHTML = "";
  mobiles.forEach((mobile, index) => {
    const card = document.createElement("div");
    card.className = "mobile-card";
    card.style.animationDelay = `${index * 0.1}s`;

    const brandLogo = `images/brands/${mobile.brand.toLowerCase()}.png`;

    // ✅ Only take Display + Processor
    const displaySpec = mobile.specs?.Display?.[0] || "N/A";
    const performanceSpec = mobile.specs?.Performance?.[0] || "N/A";
    const specSummary = `Display: ${displaySpec} | Processor: ${performanceSpec}`;

    // ✅ Multiple images (carousel)
    const images = mobile.images || [mobile.image || "images/default-mobile.png"];
    const cardId = `gallery-${index}`;

    card.innerHTML = `
      <a href="mobile.html?name=${encodeURIComponent(mobile.model)}">
        <div class="card-gallery">
          <img src="${images[0]}" alt="${mobile.model}" id="${cardId}-img" />
          ${images.length > 1 ? `
            <div class="card-gallery-controls">
              <button id="${cardId}-prev">◀</button>
              <button id="${cardId}-next">▶</button>
            </div>
          ` : ""}
        </div>
        <div class="brand-name-container">
          <h3>${mobile.model}</h3>
          <img src="${brandLogo}" alt="${mobile.brand}" class="brand-logo" />
        </div>
        <p><strong>Price:</strong> ₹${parseInt(mobile.price).toLocaleString()}</p>
        <p class="spec-summary">${specSummary}</p>
      </a>
    `;

    container.appendChild(card);

    // ✅ Add gallery controls if multiple images
    if (images.length > 1) {
      let currentIndex = 0;
      const imgEl = document.getElementById(`${cardId}-img`);

      document.getElementById(`${cardId}-prev`).addEventListener("click", (e) => {
        e.preventDefault();
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        imgEl.src = images[currentIndex];
      });

      document.getElementById(`${cardId}-next`).addEventListener("click", (e) => {
        e.preventDefault();
        currentIndex = (currentIndex + 1) % images.length;
        imgEl.src = images[currentIndex];
      });
    }
  });
}

// ====================== 📱 Mobile Page ======================
async function loadMobilePage() {
  const params = new URLSearchParams(window.location.search);
  const mobileModel = params.get("name");
  if (!mobileModel) return;

  const mobilesCol = collection(db, "mobiles");
  const snapshot = await getDocs(mobilesCol);
  const mobileData = snapshot.docs.map(doc => doc.data()).find(m => m.model === mobileModel);

  if (!mobileData) {
    document.querySelector(".container").innerHTML = "<p>Specs not found for this mobile.</p>";
    return;
  }

  // Update basic info
  document.title = `${mobileData.model} - Specs & Price`;
  document.getElementById("page-title").textContent = mobileData.model;
  document.getElementById("mobile-name").textContent = mobileData.model;
  document.getElementById("buy-link").href = mobileData.amazon_link || "#";

  // ===== Gallery Setup =====
  const images = mobileData.images || ["images/default-mobile.png"];
  let currentIndex = 0;
  const mainImg = document.getElementById("mobile-img");
  mainImg.src = images[currentIndex];

  document.getElementById("prev-img").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    mainImg.src = images[currentIndex];
  });

  document.getElementById("next-img").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % images.length;
    mainImg.src = images[currentIndex];
  });

  // ===== Specs =====
  const iconMap = {
    "Display": "fas fa-mobile-alt",
    "Design and Build Quality": "fas fa-pencil-ruler",
    "Performance": "fas fa-microchip",
    "Rear Camera": "fas fa-camera-retro",
    "Front Camera": "fas fa-camera",
    "OS and Update Policy": "fas fa-cogs",
    "Battery": "fas fa-battery-full",
    "Multi Media and Sensors": "fas fa-headphones-alt",
    "Network Connectivity": "fas fa-signal",
    "Additional Features": "fas fa-star"
  };

  const specsList = document.getElementById("specs-list");
  specsList.innerHTML = "";

  for (const category in iconMap) {
    const dt = document.createElement("dt");
    dt.innerHTML = `<i class="${iconMap[category]}"></i> ${category}`;
    specsList.appendChild(dt);

    const items = mobileData.specs[category] || ["Not Available"];
    items.forEach(item => {
      const dd = document.createElement("dd");
      dd.textContent = item;
      specsList.appendChild(dd);
    });
  }
}


// ====================== 🔹 Initialize ======================
if (isIndexPage) loadIndexPage();
if (isMobilePage) loadMobilePage();
