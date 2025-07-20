// ========== 🔍 Detect current page ==========
const isMobilePage = window.location.pathname.includes("mobile.html");
const isIndexPage =
  window.location.pathname.includes("index.html") ||
  window.location.pathname === "/" ||
  window.location.pathname === "/index.html";

// ========== 📱 Handle mobile.html ==========
if (isMobilePage) {
  const params = new URLSearchParams(window.location.search);
  const mobileName = params.get("name");

  if (mobileName) {
    fetch(`mobiles/${mobileName}.json`)
      .then((response) => {
        if (!response.ok) throw new Error("File not found");
        return response.json();
      })
      .then((data) => {
        document.title = `${data.name} - Specs & Price`;
        document.getElementById("page-title").textContent = data.name;
        document.getElementById("mobile-name").textContent = data.name;

        const img = document.getElementById("mobile-img");
        img.src = data.image;
        img.alt = data.name;

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
          "Design": "fas fa-paint-brush"
        };

        const specsList = document.getElementById("specs-list");
        specsList.innerHTML = "";

        for (const category in data.specs) {
          const iconClass = iconMap[category] || "fas fa-circle";
          const dt = document.createElement("dt");
          dt.innerHTML = `<i class="${iconClass}"></i> ${category}`;
          specsList.appendChild(dt);

          data.specs[category].forEach((item) => {
            const dd = document.createElement("dd");
            dd.innerHTML = `• ${item}`;
            specsList.appendChild(dd);
          });
        }
      })
      .catch((error) => {
        console.error("Error loading mobile specs:", error);
        document.querySelector(".container").innerHTML =
          "<p>Specs not found for this mobile.</p>";
      });
  }
}

// ========== 🏠 Handle index.html ==========
if (isIndexPage) {
  const params = new URLSearchParams(window.location.search);
  const brandName = params.get("brand");

  fetch("mobiles.json")
    .then((response) => {
      if (!response.ok) throw new Error("mobiles.json not found");
      return response.json();
    })
    .then((mobiles) => {
      const container = document.getElementById("mobiles-container");
      if (!container) return;

      let filteredMobiles = mobiles;

      // Filter by brand if present
      if (brandName) {
        document.title = `${brandName} Mobiles - VS Mobiles`;
        filteredMobiles = mobiles.filter(
          (mobile) => mobile.brand.toLowerCase() === brandName.toLowerCase()
        );
      }

      if (filteredMobiles.length === 0) {
        container.innerHTML = `<p style="text-align:center">No ${brandName} phones found.</p>`;
        return;
      }

      filteredMobiles.forEach((mobile, index) => {
        const card = document.createElement("div");
        card.className = "mobile-card";
        card.style.animationDelay = `${index * 0.1}s`;

        const brandLogo = `images/brands/${mobile.brand.toLowerCase()}.png`;

        card.innerHTML = `
          <a href="${mobile.page}">
            <img src="${mobile.image}" alt="${mobile.name}" class="home-img" />
            <div class="brand-name-container">
              <h3>${mobile.name}</h3>
              <img src="${brandLogo}" alt="${mobile.brand}" class="brand-logo" />
            </div>
            <p><strong>Price:</strong> ₹${mobile.price.toLocaleString()}</p>
          </a>
        `;

        container.appendChild(card);
      });
    })
    .catch((error) =>
      console.error("Error loading mobiles.json:", error)
    );
}
