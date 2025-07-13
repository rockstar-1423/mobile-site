let allPhones = [];

function fetchMobiles(jsonPath) {
  fetch(jsonPath)
    .then(res => res.json())
    .then(data => {
      allPhones = data;
      displayPhones(data);
    })
    .catch(err => console.error("Error loading phones:", err));
}

// ⭐ Convert number to gold stars
function getStars(rating) {
  const filled = '★'.repeat(rating);
  const empty = '☆'.repeat(5 - rating);
  return `<span style="color:gold">${filled}${empty}</span>`;
}

function displayPhones(phones) {
  const container = document.getElementById('mobileList');
  container.innerHTML = '';

  phones.forEach(phone => {
    const r = phone.ratings || {};  // Fallback if no ratings

    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <a href="${phone.page}">
        <img src="${phone.image}" alt="${phone.name}" class="phone-img">
        <h3>${phone.name}</h3>
      </a>
      <p><strong>Price:</strong> ₹${phone.price.toLocaleString()}</p>
      <p><strong>Display:</strong> ${getStars(r.display || 0)}</p>
      <p><strong>Build:</strong> ${getStars(r.build || 0)}</p>
      <p><strong>Camera:</strong> ${getStars(r.camera || 0)}</p>
      <p><strong>Battery:</strong> ${getStars(r.battery || 0)}</p>
      <p><strong>Processor:</strong> ${getStars(r.processor || 0)}</p>
    `;

    container.appendChild(card);
  });
}

// 🔍 Search
document.getElementById('searchBox').addEventListener('input', function () {
  const query = this.value.toLowerCase();
  const filtered = allPhones.filter(phone =>
    phone.name.toLowerCase().includes(query)
  );
  displayPhones(filtered);
});

// 🌐 Navigation
function navigateTo(section) {
  if (section === 'home') {
    fetchMobiles('mobiles.json');
  } else if (section === 'upcoming') {
    fetchMobiles('upcoming.json');
  }
}

// 🔁 Load home on page load
document.addEventListener('DOMContentLoaded', () => {
  fetchMobiles('mobiles.json');
});
