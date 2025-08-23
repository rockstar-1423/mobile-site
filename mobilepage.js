document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const pageId = urlParams.get("page");

  if (!pageId) {
    document.body.innerHTML = "<h2>Mobile not found</h2>";
    return;
  }

  // Your Google Sheets CSV link
  const sheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ8-tuYENgbEqhB6GgxEu9PtPXSZBPIZNXlxLgYZyzuzH97qPNa8AznKG56HxP_tKA-7WiYm1cFxsTp/pub?output=csv";

  fetch(sheetUrl)
    .then(res => res.text())
    .then(csvText => {
      // Convert CSV into rows
      const rows = csvText.split("\n").map(r => r.split(","));

      // First row is headers
      const headers = rows[0];
      const mobiles = rows.slice(1).map(row => {
        let obj = {};
        headers.forEach((header, i) => {
          obj[header.trim()] = row[i] ? row[i].trim() : "";
        });
        return obj;
      });

      // Find mobile with matching ID
      const mobile = mobiles.find(phone => phone.id === pageId);

      if (!mobile) {
        document.body.innerHTML = "<h2>Mobile not found</h2>";
        return;
      }

      document.title = `${mobile.name} - Specs & Price`;
      document.getElementById("phoneName").textContent = mobile.name;
      document.getElementById("phoneImage").src = mobile.image;
      document.getElementById("phonePrice").textContent = `₹${mobile.price}`;

      const specsList = document.getElementById("specsList");
      specsList.innerHTML = "";

      // Show all specs (excluding id, name, image, price)
      for (const [key, value] of Object.entries(mobile)) {
        if (["id", "name", "image", "price"].includes(key)) continue;

        const dt = document.createElement("dt");
        dt.innerHTML = `<strong>${key}</strong>`;
        const dd = document.createElement("dd");
        dd.textContent = value;

        specsList.appendChild(dt);
        specsList.appendChild(dd);
      }
    })
    .catch(err => {
      console.error("Failed to load mobile data:", err);
      document.body.innerHTML = "<h2>Failed to load mobile data</h2>";
    });
});
