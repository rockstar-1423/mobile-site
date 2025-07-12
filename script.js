let allPhones = []; // Store all phones here globally

fetch('mobiles.json')
  .then(res => res.json())
  .then(data => {
    // Sort by price (lowest to highest)
    data.sort((a, b) => a.price - b.price);

    allPhones = data;
    displayPhones(data);
  });

function displayPhones(phones) {
  const container = document.getElementById('mobileList');
  container.innerHTML = ''; // Clear previous results

  phones.forEach(phone => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${phone.image}" alt="${phone.name}" width="200">
      <h3>${phone.name}</h3>
      <p><strong>Price:</strong> ₹${phone.price.toLocaleString()}</p>
      <p><strong>Display:</strong> ${phone.display}</p>
      <p><strong>Build:</strong> ${phone.build}</p>
      <p><strong>RAM:</strong> ${phone.ram} | <strong>Storage:</strong> ${phone.storage}</p>
      <p><strong>Network:</strong> ${phone.network}</p>
      <p><strong>Camera:</strong> ${phone.camera}</p>
      <p><strong>Battery:</strong> ${phone.battery}</p>
      <p><strong>Processor:</strong> ${phone.processor}</p>
      <p><strong>Extras:</strong> ${phone.extras}</p>
      <a href="${phone.buyLink}" target="_blank">
        <button>Buy Now</button>
      </a>
    `;
    container.appendChild(card);
  });
}

// 🔍 Search Filter
document.getElementById('searchBox').addEventListener('input', function () {
  const query = this.value.toLowerCase();

  const filtered = allPhones.filter(phone =>
    phone.name.toLowerCase().includes(query)
  );

  displayPhones(filtered);
});
