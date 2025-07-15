let allPhones = [];

// Fetch mobiles from given JSON file
function fetchMobiles(jsonPath) {
  fetch(jsonPath)
    .then(res => res.json())
    .then(data => {
      allPhones = data;
      displayPhones(data);
    })
    .catch(err => console.error("Error loading phones:", err));
}

// ⭐ Convert rating number to gold star string
function getStars(rating) {
  const safeRating = Math.max(0, Math.min(5, Math.floor(rating || 0)));
  const filled = '★'.repeat(safeRating);
  const empty = '☆'.repeat(5 - safeRating);
  return `<span class="stars">${filled}${empty}</span>`;
}

// Display phones as cards
function displayPhones(phones) {
  const container = document.getElementById('mobileList');
  container.innerHTML = '';

  phones.forEach(phone => {
    const r = phone.ratings || {};  // fallback if no ratings provided

    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <a href="${phone.page}">
        <img src="${phone.image}" alt="${phone.name}" class="phone-img">
        <h3>${phone.name}</h3>
      </a>
      <p><strong>Price:</strong> ₹${phone.price.toLocaleString()}</p>
      <p><strong>Display:</strong> ${getStars(r.display)}</p>
      <p><strong>Build:</strong> ${getStars(r.build)}</p>
      <p><strong>Camera:</strong> ${getStars(r.camera)}</p>
      <p><strong>Battery:</strong> ${getStars(r.battery)}</p>
      <p><strong>Processor:</strong> ${getStars(r.processor)}</p>
    `;

    container.appendChild(card);
  });
}

// 🔍 Live Search
document.getElementById('searchBox').addEventListener('input', function () {
  const query = this.value.toLowerCase();
  const filtered = allPhones.filter(phone =>
    phone.name.toLowerCase().includes(query)
  );
  displayPhones(filtered);
});

// 🔀 Section switch
function navigateTo(section) {
  if (section === 'home') {
    fetchMobiles('mobiles.json');
  } else if (section === 'upcoming') {
    fetchMobiles('upcoming.json');
  }
}

// 🚀 On page load
document.addEventListener('DOMContentLoaded', () => {
  fetchMobiles('mobiles.json');
});
