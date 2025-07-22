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
        .bindPopup(`<strong>${prop.address}</strong><br>$${prop.price.toLocaleString()}<br>${prop.city || ''}`);
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
          <!-- Property Image -->
          <div class="position-relative">
            <img src="${prop.image || 'placeholder.jpg'}" class="card-img-top object-fit-cover" alt="${
      prop.address || 'Property'
    }" style="height: 220px; border-top-left-radius: .5rem; border-top-right-radius: .5rem;">
            <button class="btn position-absolute top-0 end-0 m-2 rounded-circle p-2">
              <i class="bi bi-heart text-danger fs-5"></i>
            </button>
          </div>
          <div class="card-body">
            <!-- Price -->
            <h5 class="card-title fw-bold mb-2">$${Number(prop.price || 0).toLocaleString()}</h5>
            <!-- Address -->
            <p class="text-muted small mb-2">${prop.address || 'N/A'}, ${prop.city || 'N/A'}, TX ${
      prop.zip || 'N/A'
    }</p>
            <!-- Specs Row -->
            <div class="d-flex justify-content-between text-secondary small mb-2">
              <div><i class="bi bi-house-door"></i> ${prop.bedrooms || 'N/A'} Beds</div>
              <div><i class="bi bi-bucket"></i> ${prop.bathrooms || 'N/A'} Baths</div>
              <div><i class="bi bi-aspect-ratio"></i> ${
                prop.squareFeet ? prop.squareFeet.toLocaleString() : 'N/A'
              } SqFt</div>
            </div>
            <div class="text-muted" style="font-size:13px;">${prop.description || 'No description available.'}</div>
            <!-- CTA Buttons -->
            <div class="d-flex gap-2 mt-1">
              <button class="btn btn-sm text-muted btn-photos" data-index="${index}" data-bs-toggle="modal" data-bs-target="#photosModal">View Photos</button>
              <button class="btn btn-sm text-muted btn-schedule" data-index="${index}" data-bs-toggle="modal" data-bs-target="#scheduleModal">Schedule</button>
              <button class="btn btn-sm text-muted btn-details" data-index="${index}" data-bs-toggle="modal" data-bs-target="#detailsModal">Details</button>
            </div>
          </div>
          <div class="card-footer bg-white border-top-0 d-flex justify-content-between align-items-center small text-muted">
            <div><i class="bi bi-share me-1"></i> Share</div>
            <div>Listed ${prop.listedDaysAgo || 'N/A'} days ago</div>
          </div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', card);
  });
}

/* === Modal Event Delegation === */
document.addEventListener('click', (e) => {
  const index = e.target.getAttribute('data-index');
  if (index === null) return;

  const prop = allProperties[index];
  if (!prop) return;

  // View Photos
  if (e.target.classList.contains('btn-photos')) {
    document.querySelector('#photosModal .modal-title').textContent = `Home Address - ${prop.address}`;
    document.querySelector('#photosModalBody').innerHTML = `
      <div id="carousel-${index}" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          ${(prop.images || [prop.image]).map(
            (img, i) => `
              <div class="carousel-item photoscarousel ${i === 0 ? 'active' : ''}">
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
  }

  // Schedule Form
  if (e.target.classList.contains('btn-schedule')) {
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
  }

  // Property Details
  if (e.target.classList.contains('btn-details')) {
    document.querySelector('#detailsModal .modal-title').textContent = `Property Details - ${prop.address}`;
    const detailsHTML = `
      <p><strong>Address:</strong> ${prop.address}, ${prop.city}, TX ${prop.zip}</p>
      <p><strong>Price:</strong> $${prop.price.toLocaleString()}</p>
      <p><strong>Bedrooms:</strong> ${prop.bedrooms}</p>
      <p><strong>Bathrooms:</strong> ${prop.bathrooms}</p>
      <p><strong>Type:</strong> ${prop.type}</p>
      <p><strong>Square Feet:</strong> ${prop.squareFeet?.toLocaleString() || 'N/A'} sqft</p>
      <p><strong>Year Built:</strong> ${prop.yearBuilt || 'N/A'}</p>
      <p><strong>Lot Size:</strong> ${prop.lotSize ? `${prop.lotSize} acres` : 'N/A'}</p>
      <p><strong>Garage:</strong> ${prop.garage || 'N/A'}</p>
      <p><strong>HOA Fees:</strong> ${prop.hoaFees ? `$${prop.hoaFees}/mo` : 'None'}</p>
      <p><strong>School District:</strong> ${prop.schoolDistrict || 'N/A'}</p>
      <p><strong>Heating:</strong> ${prop.heating || 'N/A'}</p>
      <p><strong>Cooling:</strong> ${prop.cooling || 'N/A'}</p>
      <p><strong>Flooring:</strong> ${prop.flooring || 'N/A'}</p>
      <p><strong>Roof:</strong> ${prop.roof || 'N/A'}</p>
      <p><strong>Exterior:</strong> ${prop.exterior || 'N/A'}</p>
      ${prop.description ? `<p><strong>Description:</strong> ${prop.description}</p>` : ''}
      ${prop.interiorFeatures?.length ? `<p><strong>Interior Features:</strong></p><ul>${prop.interiorFeatures
        .map(f => `<li>${f}</li>`)
        .join('')}</ul>` : ''}
      ${prop.exteriorFeatures?.length ? `<p><strong>Exterior Features:</strong></p><ul>${prop.exteriorFeatures
        .map(f => `<li>${f}</li>`)
        .join('')}</ul>` : ''}
      ${prop.energyFeatures?.length ? `<p><strong>Energy Efficiency:</strong></p><ul>${prop.energyFeatures
        .map(f => `<li>${f}</li>`)
        .join('')}</ul>` : ''}
    `;
    document.querySelector('#detailsModalBody').innerHTML = detailsHTML;
  }
});

/* === Property Search Form === */
document.getElementById('property-search-form').addEventListener('submit', function (e) {
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
      p.address.toLowerCase().includes(location) ||
      p.city.toLowerCase().includes(location) ||
      p.zip.includes(location);

    const matchesType = type === '' || p.type.toLowerCase() === type;
    const matchesBedrooms = p.bedrooms >= bedrooms;
    const matchesBathrooms = p.bathrooms >= bathrooms;

    let matchesLotSize = true;
    if (lotSize) {
      const lotSizeAcres = parseFloat(lotSize);
      if (lotSize === 'under5000') matchesLotSize = p.lotSize < 5000 / 43560; // Convert sq.ft to acres
      else if (lotSize === '5000-10000') matchesLotSize = p.lotSize >= 5000 / 43560 && p.lotSize <= 10000 / 43560;
      else if (lotSize === 'over10000') matchesLotSize = p.lotSize > 10000 / 43560;
    }

    let matchesSquareFeet = true;
    if (squareFeet) {
      if (squareFeet === 'under1000') matchesSquareFeet = p.squareFeet < 1000;
      else if (squareFeet === '1000-2000') matchesSquareFeet = p.squareFeet >= 1000 && p.squareFeet <= 2000;
      else if (squareFeet === 'over2000') matchesSquareFeet = p.squareFeet > 2000;
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

/* === Initial Load: Fetch Properties JSON and Render === */
fetch('properties-1.json')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    return res.json();
  })
  .then(data => {
    allProperties = data[0].properties || []; // Extract properties array from JSON
    renderProperties(allProperties);
    renderMapMarkers(allProperties);
  })
  .catch(err => {
    console.error('Failed to load properties:', err);
    const container = document.getElementById('property-list');
    container.innerHTML = `<div class="col-12 text-danger">Failed to load properties: ${err.message}</div>`;
  });