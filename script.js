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

      if (brandName) {
        filteredMobiles = filteredMobiles.filter(
          mobile => mobile.brand.toLowerCase() === brandName.toLowerCase()
        );
      }

      if (searchTerm) {
        filteredMobiles = filteredMobiles.filter(
          mobile => mobile.model.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (filteredMobiles.length === 0) {
        container.innerHTML = `<p style="text-align:center">No matching phones found.</p>`;
        return;
      }

      const mobilesMap = {};
      filteredMobiles.forEach(mobile => {
        if (!mobilesMap[mobile.mobile_id]) mobilesMap[mobile.mobile_id] = mobile;
      });

   Object.values(mobilesMap).forEach((mobile, index) => {
  const card = document.createElement("div");
  card.className = "mobile-card";
  card.style.animationDelay = `${index * 0.1}s`;

  const brandLogo = `images/brands/${mobile.brand.toLowerCase()}.png`;

  // Get specs for summary: only Display and Performance
  const mobileRows = filteredMobiles.filter(m => m.model === mobile.model);
  let displaySpec = mobileRows.find(r => r.category === "Display")?.value || "N/A";
  let performanceSpec = mobileRows.find(r => r.category === "Performance")?.value || "N/A";

  const specSummary = `Display: ${displaySpec} | Processor: ${performanceSpec}`;

  card.innerHTML = `
    <a href="mobile.html?name=${encodeURIComponent(mobile.model)}">
      <img src="${mobile.image_url || 'images/default-mobile.png'}" alt="${mobile.model}" class="home-img" />
      <div class="brand-name-container">
        <h3>${mobile.model}</h3>
        <img src="${brandLogo}" alt="${mobile.brand}" class="brand-logo" />
      </div>
      <p><strong>Price:</strong> ₹${parseInt(mobile.price).toLocaleString()}</p>
      <p class="spec-summary">${specSummary}</p>
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

      // Use the first row for image, price, amazon_link
      const firstRow = mobileRows[0];
      const data = {
        name: mobileModel,
        specs: {},
        price: firstRow.price,
        image: firstRow.image_url,
        amazon_link: firstRow.amazon_link
      };

      // Collect all specs by category
      mobileRows.forEach(row => {
        if (!data.specs[row.category]) data.specs[row.category] = [];
        data.specs[row.category].push(row.value);
      });

      // Update HTML
      document.title = `${data.name} - Specs & Price`;
      document.getElementById("page-title").textContent = data.name;
      document.getElementById("mobile-name").textContent = data.name;
      document.getElementById("mobile-img").src = data.image || "images/default-mobile.png";

      const iconMap = {
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
        specsList.appendChild(dt);

        const items = data.specs[category] || ["Not Available"];
        items.forEach(item => {
          const dd = document.createElement("dd");
          dd.textContent = item;
          specsList.appendChild(dd);
        });
      }

      // Update Buy button
      const buyBtn = document.getElementById("buy-link");
      if (buyBtn) buyBtn.href = data.amazon_link || "#";
    }
  })
  .catch(error => console.error("Error loading Google Sheet:", error));
