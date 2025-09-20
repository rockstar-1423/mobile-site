// ========== 🔍 Detect current page ==========
const isMobilePage = window.location.pathname.includes("mobile.html");
const isIndexPage =
  window.location.pathname.includes("index.html") ||
  window.location.pathname === "/" ||
  window.location.pathname === "/index.html";

// ========== 🔥 Firebase Imports ==========
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// ========== ⚙️ Firebase Config ==========
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========== 🏠 Homepage (index.html) ==========
async function loadHomePage() {
  const params = new URLSearchParams(window.location.search);
  const brandName = params.get("brand");
  const searchTerm = params.get("search");

  const container = document.getElementById("mobiles-container");
  if (!container) return;

  const mobilesCol = collection(db, "mobiles");
  const snapshot = await getDocs(mobilesCol);
  let mobiles = snapshot.docs.map(doc => doc.data());

  // ✅ Apply brand filter
  if (brandName) {
    mobiles = mobiles.filter(
      mobile => mobile.brand.toLowerCase() === brandName.toLowerCase()
    );
  }

  // ✅ Apply search filter
  if (searchTerm) {
    mobiles = mobiles.filter(
      mobile => mobile.model.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (mobiles.length === 0) {
    container.innerHTML = `<p style="text-align:center">No matching phones found.</p>`;
    return;
  }

  // Remove duplicates by model
  const mobilesMap = {};
  mobiles.forEach(mobile => {
    if (!mobilesMap[mobile.model]) mobilesMap[mobile.model] = mobile;
  });

  container.innerHTML = "";
  Object.values(mobilesMap).forEach((mobile, index) => {
    const card = document.createElement("div");
    card.className = "mobile-card";
    card.style.animationDelay = `${index * 0.1}s`;

    const brandLogo = `images/brands/${mobile.brand.toLowerCase()}.png`;
    const displaySpec = mobile.specs?.Display?.[0] || "N/A";
    const performanceSpec = mobile.specs?.Performance?.[0] || "N/A";

    card.innerHTML = `
      <a href="mobile.html?name=${encodeURIComponent(mobile.model)}">
        <img src="${mobile.images?.[0] || mobile.image || 'images/default-mobile.png'}" alt="${mobile.model}" class="home-img" />
        <div class="brand-name-container">
          <h3>${mobile.model}</h3>
          <img src="${brandLogo}" alt="${mobile.brand}" class="brand-logo" />
        </div>
        <p><strong>Price:</strong> ₹${parseInt(mobile.price).toLocaleString()}</p>
        <p class="spec-summary">Display: ${displaySpec} | Processor: ${performanceSpec}</p>
      </a>
    `;
    container.appendChild(card);
  });

  // ✅ Load Category Sections
  loadCategorySections(mobiles);
}

// ========== 📱 Mobile Details (mobile.html) ==========
async function loadMobilePage() {
  const params = new URLSearchParams(window.location.search);
  const mobileModel = params.get("name");
  if (!mobileModel) return;

  const mobilesCol = collection(db, "mobiles");
  const snapshot = await getDocs(mobilesCol);
  const mobiles = snapshot.docs.map(doc => doc.data());

  const mobileRows = mobiles.filter(m => m.model === mobileModel);
  if (!mobileRows.length) {
    document.querySelector(".container").innerHTML = "<p>Specs not found for this mobile.</p>";
    return;
  }

  const firstRow = mobileRows[0];
  const data = {
    name: mobileModel,
    specs: firstRow.specs || {},
    price: firstRow.price,
    image: firstRow.images?.[0] || firstRow.image,
    amazon_link: firstRow.amazon_link
  };

  // Update HTML
  document.title = `${data.name} - Specs & Price`;
  document.getElementById("page-title").textContent = data.name;
  document.getElementById("mobile-name").textContent = data.name;
  document.getElementById("mobile-img").src = data.image || "images/default-mobile.png";

  const iconMap = {
    "Launch Date":"fas fa-rocket",
    "Display": "fas fa-mobile-alt",
    "Design and Build Quality": "fas fa-pencil-ruler",
    "Performance": "fas fa-microchip",
    "Rear Camera": "fas fa-camera-retro",
    "Front Camera": "fas fa-camera",
    "OS and Update Policy": "fas fa-cogs",
    "Battery": "fas fa-battery-full",
    "Multi Media": "fas fa-headphones-alt",
    "Sensors": "fas fa-satellite-dish",
    "Connectivity": "fas fa-signal",
    "Additional Features": "fas fa-star"
  };

  const specsList = document.getElementById("specs-list");
  specsList.innerHTML = "";

  for (const category of Object.keys(iconMap)) {
    const dt = document.createElement("dt");
    dt.innerHTML = `<i class="${iconMap[category]}"></i> ${category}`;

    // ✅ Rating badge
    let rating = data.specs[category]?.rating;
    if (rating) {
      const knownRatings = ["below-average","average","good","super","excellent","flagship"];
      const ratingClass = knownRatings.includes(rating.toLowerCase().replace(/\s+/g,"-")) 
        ? `rating-${rating.toLowerCase().replace(/\s+/g,"-")}` 
        : "rating-average";

      const span = document.createElement("span");
      span.textContent = ` (${rating})`;
      span.className = `rating-badge ${ratingClass}`;
      dt.appendChild(span);
    }

    specsList.appendChild(dt);

    const items = data.specs[category]?.values || ["Not Available"];
    items.forEach(item => {
      const dd = document.createElement("dd");
      dd.textContent = item;
      specsList.appendChild(dd);
    });
  }

  // ✅ Buy button
  const buyBtn = document.getElementById("buy-link");
  if (buyBtn) buyBtn.href = data.amazon_link || "#";
}

// ========== 🎯 Category Sections ==========
function loadCategorySections(mobiles) {
  renderCategory("gaming", "🔥 Powerful Gaming Phones", "gaming-section", mobiles);
  renderCategory("camera", "📸 Best Camera Phones", "camera-section", mobiles);
  renderCategory("allrounder", "🌟 All-rounder Phones", "allrounder-section", mobiles);
}

function renderCategory(categoryKey, title, sectionId, mobiles) {
  const section = document.getElementById(sectionId);
  if (!section) return;

  const filtered = mobiles.filter(m => m.categories?.includes(categoryKey));
  if (filtered.length === 0) return;

  let html = `<h2>${title}</h2><div class="category-cards">`;

  filtered.forEach(mobile => {
    const brandLogo = `images/brands/${mobile.brand.toLowerCase()}.png`;
    const displaySpec = mobile.specs?.Display?.[0] || "N/A";
    const performanceSpec = mobile.specs?.Performance?.[0] || "N/A";

    html += `
      <div class="mobile-card">
        <a href="mobile.html?name=${encodeURIComponent(mobile.model)}">
          <img src="${mobile.images?.[0] || mobile.image || 'images/default-mobile.png'}" alt="${mobile.model}" />
          <div class="brand-name-container">
            <h3>${mobile.model}</h3>
            <img src="${brandLogo}" alt="${mobile.brand}" class="brand-logo" />
          </div>
          <p><strong>₹${parseInt(mobile.price).toLocaleString()}</strong></p>
          <p>${displaySpec} | ${performanceSpec}</p>
        </a>
      </div>
    `;
  });

  html += `</div>`;
  section.innerHTML = html;
}

// ========== 🚀 Run ==========
if (isIndexPage) {
  loadHomePage();
}
if (isMobilePage) {
  loadMobilePage();
}
