document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const pageId = urlParams.get("page");

  if (!pageId) {
    document.body.innerHTML = "<h2>Mobile not found</h2>";
    return;
  }

  fetch("mobiles.json")
    .then(res => res.json())
    .then(data => {
      const mobile = data.find(phone => phone.id === pageId);

      if (!mobile) {
        document.body.innerHTML = "<h2>Mobile not found</h2>";
        return;
      }

      document.title = `${mobile.name} - Specs & Price`;
      document.getElementById("phoneName").textContent = mobile.name;
      document.getElementById("phoneImage").src = mobile.image;
      document.getElementById("phonePrice").textContent = `₹${mobile.price.toLocaleString()}`;

      const specsList = document.getElementById("specsList");
      specsList.innerHTML = "";

      for (const [key, value] of Object.entries(mobile.specs)) {
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
