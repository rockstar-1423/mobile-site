// ========== 🔍 Detect current page ==========
const isMobilePage = window.location.pathname.includes("mobile.html");
const isIndexPage =
  window.location.pathname.includes("index.html") ||
  window.location.pathname === "/" ||
  window.location.pathname === "/index.html";

// ========== 📄 CSV to JSON Parser ==========
function CSVToArray(strData, strDelimiter = ",") {
  const objPattern = new RegExp(
    `(${strDelimiter}|\\r?\\n|\\r|^)(?:"([^"]*(?:""[^"]*)*)"|([^"${strDelimiter}\\r\\n]*))`,
    "gi"
  );
  const arrData = [[]];
  let arrMatches = null;

  while ((arrMatches = objPattern.exec(strData))) {
    const strMatchedDelimiter = arrMatches[1];
    if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
      arrData.push([]);
    }
    let strMatchedValue;
    if (arrMatches[2]) {
      strMatchedValue = arrMatches[2].replace(/""/g, '"');
    } else {
      strMatchedValue = arrMatches[3];
    }
    arrData[arrData.length - 1].push(strMatchedValue);
  }

  const headers = arrData[0];
  const dataObjects = arrData.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
  return dataObjects;
}

// ========== 📱 Fetch mobile data from Google Sheet ==========
const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8-tuYENgbEqhB6GgxEu9PtPXSZBPIZNXlxLgYZyzuzH97qPNa8AznKG56HxP_tKA-7WiYm1cFxsTp/pub?output=csv";

fetch(sheetURL)
  .then(response => response.text())
  .then(csvText => {
    const mobilesData = CSVToArray(csvText);

    // ========== 🏠 Handle index.html ==========
    if (isIndexPage) {
      const params = new URLSearchParams(window.location.search);
      const brandName = params.get("brand");
      const searchTerm = params.get("search");

      const container = document.getElementById("mobiles-container");
      if (!container) return;

      let filteredMobiles = mobilesData;

      // Filter by brand
      if (brandName) {
        filteredMobiles = filteredMobiles.filter(
          mobile => mobile.brand.toLowerCase() === brandName.toLowerCase()
        );
      }

      // Filter by search term
      if (searchTerm) {
        filteredMobiles = filteredMobiles.filter(
          mobile => mobile.model.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Display results
      if (filteredMobiles.length === 0) {
        container.innerHTML = `<p style="text-align:center">No matching phones found.</p>`;
        return;
      }

      // Group by mobile_id to avoid duplicate cards
      const mobilesMap = {};
      filteredMobiles.forEach(mobile => {
        if (!mobilesMap[mobile.mobile_id]) mobilesMap[mobile.mobile_id] = mobile;
      });

      Object.values(mobilesMap).forEach((mobile, index) => {
        const card = document.createElement("div");
        card.className = "mobile-card";
        card.style.animationDelay = `${index * 0.1}s`;

        const brandLogo = `images/brands/${mobile.brand.toLowerCase()}.png`;

        card.innerHTML = `
          <a href="mobile.html?name=${encodeURIComponent(mobile.model)}">
            <img src="${mobile.image_url}" alt="${mobile.model}" class="home-img" />
            <div class="brand-name-container">
              <h3>${mobile.model}</h3>
              <img src="${brandLogo}" alt="${mobile.brand}" class="brand-logo" />
            </div>
            <p><strong>Price:</strong> ₹${parseInt(mobile.price).toLocaleString()}</p>
          </a>
        `;
        container.appendChild(card);
      });
    }

    // ========== 📱 Handle mobile.html ==========
    if (isMobilePage) {
      const params = new URLSearchParams(window.location.search);
      const mobileModel = params.get("name");
      if (!mobileModel) return;

      const mobileRows = mobilesData.filter(m => m.model === mobileModel);
      if (mobileRows.length === 0) {
        document.querySelector(".container").innerHTML = "<p>Specs not found for this mobile.</p>";
        return;
      }

      const data = { name: mobileModel, specs: {} };

      mobileRows.forEach(row => {
        if (!data.specs[row.category]) data.specs[row.category] = [];
        data.specs[row.category].push(row.value);
        data.price = row.price;
        data.image = row.image_url;
        data.amazon_link = row.amazon_link;
      });

      // Update HTML
      document.title = `${data.name} - Specs & Price`;
      document.getElementById("page-title").textContent = data.name;
      document.getElementById("mobile-name").textContent = data.name;
      document.getElementById("mobile-img").src = data.image;

      const iconMap = {
        "Performance": "fas fa-microchip",
        "Display": "fas fa-mobile-alt",
        "Rear Camera": "fas fa-camera-retro",
        "Front Camera": "fas fa-user",
        "Battery": "fas fa-battery-full",
        "Storage": "fas fa-hdd",
        "Operating System": "fab fa-android",
        "Connectivity": "fas fa-signal",
        "Multimedia": "fas fa-music",
        "Sensors": "fas fa-sliders-h",
        "Build": "fas fa-tools",
        "Design": "fas fa-paint-brush",
        "General": "fas fa-list"
      };

      const specsList = document.getElementById("specs-list");
      specsList.innerHTML = "";

      for (const category in data.specs) {
        const iconClass = iconMap[category] || "fas fa-circle";
        const dt = document.createElement("dt");
        dt.innerHTML = `<i class="${iconClass}"></i> ${category}`;
        specsList.appendChild(dt);

        data.specs[category].forEach(item => {
          const dd = document.createElement("dd");
          dd.innerHTML = `• ${item}`;
          specsList.appendChild(dd);
        });
      }

      // Update Buy button
      const buyBtn = document.querySelector(".buy-button a");
      if (buyBtn) buyBtn.href = data.amazon_link || "#";
    }
  })
  .catch(error => console.error("Error loading Google Sheet:", error));
