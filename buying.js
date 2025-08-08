/* === Global Variables === */
let map;
let allProperties = [];

/* === Map Rendering === */
function renderMapMarkers(properties) {
  if (map) {
    map.remove();
  }
  map = L.map('property-map').setView([31.5, -97.3], 9);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  properties.forEach(prop => {
    if (prop.lat && prop.lng) {
      L.marker([prop.lat, prop.lng])
        .addTo(map)
        .bindPopup(
          `<strong>${prop.address}</strong><br>$${prop.price.toLocaleString()}<br>${prop.city || ''}`
        );
    }
  });

  window.propertyMap = map; // Expose globally if needed
}

/* === Tab Switching Logic === */
const listTab = document.getElementById('list-tab');
const mapTab = document.getElementById('map-tab');
const listView = document.getElementById('list-view');
const mapView = document.getElementById('map-view');

listTab.addEventListener('click', () => {
  listTab.classList.add('active');
  mapTab.classList.remove('active');
  listView.classList.remove('d-none');
  mapView.classList.add('d-none');
});

mapTab.addEventListener('click', () => {
  mapTab.classList.add('active');
  listTab.classList.remove('active');
  listView.classList.add('d-none');
  mapView.classList.remove('d-none');

  // Fix hidden map rendering after tab switch
  if (map) {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }
});

/* === Render Property Cards === */
function renderProperties(propertyArray) {
  const container = document.getElementById('property-list');
  container.innerHTML = '';

  if (propertyArray.length === 0) {
    container.innerHTML = `<p class="text-center">No properties match your search.</p>`;
    return;
  }

  propertyArray.forEach((prop, index) => {
    const card = `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="card property-card border-0 shadow-sm h-100">
          <div class="position-relative">
            <img 
              src="${prop.image || 'placeholder.jpg'}" 
              class="card-img-top object-fit-cover property-click" 
              data-index="${index}"
              style="height: 220px; cursor: pointer; border-top-left-radius: .5rem; border-top-right-radius: .5rem;"
              alt="${prop.address || 'Property'}"
            >
            <button class="btn position-absolute top-0 end-0 m-2 rounded-circle p-2">
              <i class="bi bi-heart text-danger fs-5"></i>
            </button>
          </div>
          <div class="card-body">
            <h5 class="card-title fw-bold mb-2">$${Number(prop.price || 0).toLocaleString()}</h5>
            <p class="text-muted small mb-2">${prop.address || 'N/A'}, ${prop.city || 'N/A'}, TX ${
      prop.zip || 'N/A'
    }</p>
            <div class="d-flex justify-content-between text-secondary small mb-2">
              <div><i class="bi bi-house-door"></i> ${prop.bedrooms || 'N/A'} Beds</div>
              <div><i class="bi bi-bucket"></i> ${prop.bathrooms || 'N/A'} Baths</div>
              <div><i class="bi bi-aspect-ratio"></i> ${
                prop.squareFeet ? prop.squareFeet.toLocaleString() : 'N/A'
              } SqFt</div>
            </div>
            <div class="text-muted" style="font-size:13px;">${prop.description || 'No description available.'}</div>
            <div class="d-flex gap-2 mt-1">
              <button class="btn btn-sm text-muted btn-photos" data-index="${index}" data-bs-toggle="modal" data-bs-target="#photosModal">View Photos</button>
              <button class="btn btn-sm text-muted btn-schedule" data-index="${index}" data-bs-toggle="modal" data-bs-target="#scheduleModal">Schedule</button>
              <button class="btn btn-sm text-muted btn-details" data-index="${index}" data-bs-toggle="modal" data-bs-target="#detailsModal">Details</button>
            </div>
          </div>
          <div class="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center small text-muted">
            <div class="btn-share" data-index="${index}">
              <i class="bi bi-share me-1"></i> Share
            </div>
            <div>Listed ${prop.listedDaysAgo || 'N/A'} days ago</div>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', card);
  });
}

/* === Share Link Logic === */
document.addEventListener('click', (e) => {
  const shareBtn = e.target.closest('.btn-share');
  if (shareBtn) {
    const index = shareBtn.getAttribute('data-index');
    if (!index) return;
    const prop = allProperties[index];
    if (!prop) return;

    const shareUrl = `${window.location.origin}/property.html?id=${encodeURIComponent(prop.id)}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => alert('Link copied to clipboard!'))
      .catch(() => alert('Failed to copy link.'));
  }
});

/* === Modal Event Delegation === */
document.addEventListener('click', (e) => {
  // Find clicked element with data-index
  const clickedWithIndex = e.target.closest('[data-index]');
  if (!clickedWithIndex) return;

  const index = clickedWithIndex.getAttribute('data-index');
  if (index === null) return;

  const prop = allProperties[index];
  if (!prop) return;

  // Clicking on property image redirects to property page
  if (e.target.closest('.property-click')) {
    const encodedAddress = encodeURIComponent(prop.address || '');
    window.location.href = `property.html?id=${encodeURIComponent(prop.id)}&address=${encodedAddress}`;
    return;
  }

  // View Photos Modal
  if (e.target.closest('.btn-photos')) {
    document.querySelector('#photosModal .modal-title').textContent = `Home Address - ${prop.address}`;
    document.querySelector('#photosModalBody').innerHTML = `
      <div id="carousel-${index}" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          ${(prop.images || [prop.image]).map(
            (img, i) => `
              <div class="carousel-item ${i === 0 ? 'active' : ''}">
                <img src="${img}" class="d-block w-100" alt="Photo ${i + 1}">
              </div>
            `
          ).join('')}
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${index}" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" style="margin-bottom: 200px;"></span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carousel-${index}" data-bs-slide="next">
          <span class="carousel-control-next-icon" style="margin-bottom: 200px;"></span>
        </button>
      </div>
    `;
    return;
  }

  // Schedule Modal
  if (e.target.closest('.btn-schedule')) {
    document.querySelector('#scheduleModal .modal-title').textContent = `Schedule a Viewing - ${prop.address}`;
    document.querySelector('#scheduleModalBody').innerHTML = `
      <form>
        <div class="mb-3">
          <label class="form-label">Your Name</label>
          <input type="text" class="form-control" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Preferred Date</label>
          <input type="date" class="form-control" required>
        </div>
        <div class="mb-3">
          <label class="form-label">Email</label>
          <input type="email" class="form-control" required>
        </div>
        <button type="submit" class="btn w-100">Submit Request</button>
      </form>
    `;
    return;
  }

  // Details Modal
  if (e.target.closest('.btn-details')) {
    document.querySelector('#detailsModal .modal-title').textContent = `Property Details - ${prop.address}`;
    const detailsHTML = `
      <p><strong>Address:</strong> ${prop.address}, ${prop.city}, TX ${prop.zip}</p>
      <p><strong>Price:</strong> $${prop.price.toLocaleString()}</p>
      <p><strong>Bedrooms:</strong> ${prop.bedrooms}</p>
      <p><strong>Bathrooms:</strong> ${prop.bathrooms}</p>
      <p><strong>Type:</strong> ${prop.type}</p>
      <p><strong>Square Feet:</strong> ${prop.squareFeet?.toLocaleString() || 'N/A'} sqft</p>
      <p><strong>Year Built:</strong> ${prop.yearBuilt || 'N/A'}</p>
      <p><strong>Lot Size:</strong> ${prop.lotSize ? prop.lotSize + ' acres' : 'N/A'}</p>
      <p><strong>Garage:</strong> ${prop.garage || 'N/A'}</p>
      <p><strong>HOA Fees:</strong> ${prop.hoaFees ? `$${prop.hoaFees}/mo` : 'None'}</p>
      <p><strong>School District:</strong> ${prop.schoolDistrict || 'N/A'}</p>
      <p><strong>Heating:</strong> ${prop.heating || 'N/A'}</p>
      <p><strong>Cooling:</strong> ${prop.cooling || 'N/A'}</p>
      <p><strong>Flooring:</strong> ${prop.flooring || 'N/A'}</p>
      <p><strong>Roof:</strong> ${prop.roof || 'N/A'}</p>
      <p><strong>Exterior:</strong> ${prop.exterior || 'N/A'}</p>
      ${prop.description ? `<p><strong>Description:</strong> ${prop.description}</p>` : ''}
      ${prop.interiorFeatures?.length ? `<p><strong>Interior Features:</strong></p><ul>${prop.interiorFeatures.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}
      ${prop.exteriorFeatures?.length ? `<p><strong>Exterior Features:</strong></p><ul>${prop.exteriorFeatures.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}
      ${prop.energyFeatures?.length ? `<p><strong>Energy Efficiency:</strong></p><ul>${prop.energyFeatures.map(f => `<li>${f}</li>`).join('')}</ul>` : ''}
    `;
    document.querySelector('#detailsModalBody').innerHTML = detailsHTML;
    return;
  }
});

/* === Property Search Form === */
document.getElementById('property-filter-form').addEventListener('submit', function (e) {
  e.preventDefault();

  const location = document.getElementById('location-input').value.trim().toLowerCase();
  const type = document.getElementById('propertyType').value.trim().toLowerCase();
  const bedrooms = parseInt(document.getElementById('bedrooms').value) || 0;
  const bathrooms = parseInt(document.getElementById('bathrooms').value) || 0;
  const lotSize = document.getElementById('lotSize').value;
  const squareFeet = document.getElementById('squareFeet').value;
  const maxPrice = parseInt(document.getElementById('maxPrice').value) || Infinity;
  const sortOrder = document.getElementById('sortPrice').value;

  let filtered = allProperties.filter(p => {
    const matchesLocation =
      location === '' ||
      (p.address && p.address.toLowerCase().includes(location)) ||
      (p.city && p.city.toLowerCase().includes(location)) ||
      (p.zip && p.zip.includes(location));

    const matchesType = type === '' || (p.type && p.type.toLowerCase() === type);
    const matchesBedrooms = p.bedrooms >= bedrooms;
    const matchesBathrooms = p.bathrooms >= bathrooms;

    let matchesLotSize = true;
    if (lotSize) {
      const [minLot, maxLot] = lotSize.split('-').map(Number);
      const lotInSqft = p.lotSize * 43560;
      matchesLotSize = lotInSqft >= minLot && lotInSqft <= maxLot;
    }

    let matchesSquareFeet = true;
    if (squareFeet) {
      const [minSqft, maxSqft] = squareFeet.split('-').map(Number);
      matchesSquareFeet = p.squareFeet >= minSqft && p.squareFeet <= maxSqft;
    }

    const matchesPrice = p.price <= maxPrice;

    return matchesLocation && matchesType && matchesBedrooms && matchesBathrooms && matchesLotSize && matchesSquareFeet && matchesPrice;
  });

  if (sortOrder === 'asc') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortOrder === 'desc') {
    filtered.sort((a, b) => b.price - a.price);
  }

  renderProperties(filtered);
  renderMapMarkers(filtered);
});


document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('property-search-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const location = document.getElementById('location-input').value.trim();
      window.location.href = `Buying.html?location=${encodeURIComponent(location)}`;
    });
  }
});

/* === Initial Load: Fetch Properties JSON and Render === */
function getURLParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

fetch('properties-1.json')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    allProperties = data[0].properties || [];

    const locationParam = getURLParam('location')?.toLowerCase() || '';

    if (locationParam) {
      const locInput = document.getElementById('location-input');
      if (locInput) locInput.value = locationParam;
    }

    let initialFiltered = allProperties;
    if (locationParam) {
      initialFiltered = allProperties.filter(p =>
        (p.address && p.address.toLowerCase().includes(locationParam)) ||
        (p.city && p.city.toLowerCase().includes(locationParam)) ||
        (p.zip && p.zip.includes(locationParam))
      );
    }

    renderProperties(initialFiltered);
    renderMapMarkers(initialFiltered);
  })
  .catch(err => {
    console.error('Failed to load properties:', err);
    const container = document.getElementById('property-list');
    container.innerHTML = `<div class="col-12 text-danger">Failed to load properties: ${err.message}</div>`;
  });
