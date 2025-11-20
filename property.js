document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id')?.toLowerCase(); // Get string ID, e.g., "property-1"
  const session = window.UserSession;

  const DATA_URL = 'https://script.google.com/macros/s/AKfycbyjfqkPK9YLpEKHz9aaSa6RJ2Z1D7JTnx0SgI32kVmsdPAhCUXqoQJyPugVTK9X1ucKIw/exec';

  fetch(`${DATA_URL}?ts=${Date.now()}`)
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const allProperties = data[0].properties;
      const prop = allProperties.find(p => String(p.id).toLowerCase() === id); // Match by id field

      if (!prop) {
        const title = document.getElementById('property-title');
        if (title) title.textContent = 'Property Not Found';
        return;
      }

      // Set property title
      const title = document.getElementById('property-title');
      if (title) title.textContent = `${prop.address}, ${prop.city}, TX ${prop.zip}`;

      // Render property details
      const details = document.getElementById('property-details');
      if (details) {
        const isSaved = session?.isSaved?.(prop.id);
        const saveIcon = isSaved ? 'bi-heart-fill' : 'bi-heart';
        const saveLabel = isSaved ? 'Saved' : 'Save home';
        details.innerHTML = `
          <div class="d-flex gap-2 mb-3 flex-wrap">
            <button class="btn ${isSaved ? 'btn-success' : 'btn-dark'}" id="save-home-btn">
              <i class="bi ${saveIcon} me-2"></i>${saveLabel}
            </button>
            <button class="btn btn-outline-secondary" id="message-home-btn">
              <i class="bi bi-chat-dots me-2"></i>Message us
            </button>
          </div>
          <h4>Price: $${prop.price.toLocaleString()}</h4>
          <p><i class="bi bi-house-door-fill me-2"></i><strong>Bedrooms:</strong> ${prop.bedrooms || 'N/A'}</p>
          <p><i class="bi bi-droplet me-2"></i><strong>Bathrooms:</strong> ${prop.bathrooms || 'N/A'}</p>
          <p class="mb-5"><i class="bi bi-rulers me-2"></i><strong>Square Feet:</strong> ${prop.squareFeet?.toLocaleString() || 'N/A'}</p>
          <p class="property-bio">${prop.description || 'No description provided.'}</p>
        `;
      }

      // Render property features
      const features = document.getElementById('property-features');
      if (features) {
        features.innerHTML = `
          <h3 class="mt-4 mb-4">Features</h3>
          <p class="mb-2"><i class="bi-dash me-1"></i><strong>Year Built:</strong> ${prop.yearBuilt || 'N/A'}</p>
          <p class="mb-2"><i class="bi-dash me-1"></i><strong>Lot Size:</strong> ${prop.lotSize || 'N/A'}</p>
          <p class="mb-2"><i class="bi-dash me-1"></i><strong>Garage type:</strong> ${prop.garage || 'N/A'}</p>
          <p class="mb-2"><i class="bi-dash me-1"></i><strong>HOA Fees:</strong> ${prop.hoaFees ? `$${prop.hoaFees}/mo` : 'None'}</p>
          <p class="mb-2"><i class="bi-dash me-1"></i><strong>School District:</strong> ${prop.schoolDistrict || 'N/A'}</p>
          <p class="mb-2"><i class="bi-dash me-1"></i><strong>Heating:</strong> ${prop.heating || 'N/A'}</p>
          <p class="mb-2"><i class="bi-dash me-1"></i><strong>Flooring:</strong> ${prop.flooring || 'N/A'}</p>
          <p class="mb-2"><i class="bi-dash me-1"></i><strong>Exterior:</strong> ${prop.exterior || 'N/A'}</p>
          <p class="mb-2"><i class="bi-dash me-1"></i><strong>Interior Features:</strong> ${prop.interiorFeatures?.join(', ') || 'N/A'}</p>
          <p class="mb-2"><i class="bi-dash me-1"></i><strong>Exterior Features:</strong> ${prop.exteriorFeatures?.join(', ') || 'N/A'}</p>
        `;
      }

      
      // Render map 
      // Render map if coordinates exist
if (prop.lat && prop.lng) {
  const map = L.map('property-map').setView([prop.lat, prop.lng], 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  L.marker([prop.lat, prop.lng])
    .addTo(map)
    .bindPopup(`${prop.address}<br>${prop.city}, TX ${prop.zip}`)
    .openPopup();
} else {
  const mapContainer = document.getElementById('property-map');
  if (mapContainer) {
    mapContainer.innerHTML = '<p class="text-muted">No map available for this property.</p>';
  }
}

document.querySelector('#property-map').insertAdjacentHTML(
  'beforebegin',
  `<h3 class="mb-3">Location: ${prop.address}, ${prop.city}</h3>`
);



      
      // Generate Fancybox-compatible image gallery
      const extra = document.getElementById('property-extra');
      if (extra) {
        const user = session?.getUser?.();
        const messageCard = `
          <div class="card shadow-sm mb-4">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h5 class="fw-bold mb-0">Send a note about this home</h5>
                <a href="Sign-In.html" class="small">Sign in</a>
              </div>
              <form id="property-message-form" class="d-grid gap-3">
                <div>
                  <label class="form-label">Name</label>
                  <input type="text" class="form-control" name="name" value="${user?.name || ''}" required>
                </div>
                <div>
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" name="email" value="${user?.email || ''}" required>
                </div>
                <div>
                  <label class="form-label">Message</label>
                  <textarea class="form-control" name="message" rows="3" placeholder="Tell us what you love or need to know" required></textarea>
                </div>
                <div class="small text-muted d-none" id="property-message-status"></div>
                <button type="submit" class="btn btn-dark w-100">Send</button>
              </form>
            </div>
          </div>
        `;
        const imageHtml = prop.images?.length
          ? `
            <div class="row g-2">
              ${prop.images.map(img => `
                <div class="col-4">
                  <a href="${img}" data-fancybox="gallery" data-caption="Property photo">
                    <img src="${img}" class="img-fluid rounded" alt="Property photo">
                  </a>
                </div>
              `).join('')}
            </div>
          `
          : '<p>No images available.</p>';
        extra.innerHTML = messageCard + imageHtml;

        // Ensure Fancybox binds to gallery links
        if (typeof Fancybox !== 'undefined') {
          Fancybox.bind('[data-fancybox="gallery"]');
        } else {
          console.warn('Fancybox library not loaded');
        }
      }

      const saveBtn = document.getElementById('save-home-btn');
      if (saveBtn) {
        const setSaveState = (saved) => {
          saveBtn.classList.toggle('btn-success', saved);
          saveBtn.classList.toggle('btn-dark', !saved);
          saveBtn.innerHTML = `<i class="bi ${saved ? 'bi-heart-fill' : 'bi-heart'} me-2"></i>${saved ? 'Saved' : 'Save home'}`;
        };
        setSaveState(isSaved);

        saveBtn.addEventListener('click', () => {
          if (!session?.ensureUser?.()) {
            alert('Please sign in to save homes.');
            window.location.href = 'Sign-In.html';
            return;
          }
          const result = session.toggleSavedHome(prop.id);
          setSaveState(result.saved);
        });
      }

      const messageForm = document.getElementById('property-message-form');
      const messageStatus = document.getElementById('property-message-status');
      if (messageForm) {
        messageForm.addEventListener('submit', (e) => {
          e.preventDefault();
          if (!session?.ensureUser?.()) {
            alert('Sign in to send and track your messages.');
            window.location.href = 'Sign-In.html';
            return;
          }

          const form = new FormData(messageForm);
          const entry = session.addMessage({
            subject: `Inquiry about ${prop.address || 'a property'}`,
            body: form.get('message'),
            propertyId: prop.id,
          });

          if (entry) {
            messageStatus.textContent = 'Message saved to your portal. Our team will follow up.';
            messageStatus.classList.remove('d-none');
            messageStatus.classList.remove('text-danger');
            messageStatus.classList.add('text-success');
            messageForm.reset();
          } else {
            messageStatus.textContent = 'Unable to save your message right now.';
            messageStatus.classList.remove('d-none');
            messageStatus.classList.remove('text-success');
            messageStatus.classList.add('text-danger');
          }
        });
      }
    })
    .catch(err => {
      console.error('Error loading property:', err);
      const title = document.getElementById('property-title');
      if (title) title.textContent = 'Error Loading Property';
      const details = document.getElementById('property-details');
      if (details) details.innerHTML = `<p class="text-danger">Failed to load property: ${err.message}</p>`;
    });
});

