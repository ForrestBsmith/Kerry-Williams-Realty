document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id')?.toLowerCase(); // Get string ID, e.g., "property-1"
  const session = window.UserSession;

  const DATA_URL = window.DATA_URL || 'https://script.google.com/macros/s/AKfycbz1y92nUxaYyW_Zngv-9iMu0eGbyTwXOmIPOQFH_ZhQx0k6RW4H1Vfx9xACMsJuxrMJ/exec';
  const DATA_CACHE_KEY = 'kw-data-v1';
  const CACHE_TTL = 5 * 60 * 1000;
  let propertyRendered = false;

  const cachedPayload = getCachedPayload();
  if (cachedPayload) {
    renderProperty(cachedPayload);
  }

  fetchRemoteData()
    .then(renderProperty)
    .catch(err => {
      console.error('Error loading property:', err);
      if (!propertyRendered) {
        const title = document.getElementById('property-title');
        if (title) title.textContent = 'Error Loading Property';
        const details = document.getElementById('property-details');
        if (details) details.innerHTML = `<p class="text-danger">Failed to load property: ${err.message}</p>`;
      }
    });

  function renderProperty(data) {
    if (!data) return;
    const allProperties = data.properties || [];
    const prop = allProperties.find(p => String(p.id).toLowerCase() === id);

    if (!prop) {
      const title = document.getElementById('property-title');
      if (title) title.textContent = 'Property Not Found';
      return;
    }

    propertyRendered = true;
    const isSaved = session?.isSaved?.(prop.id) || false;

    const title = document.getElementById('property-title');
    if (title) title.textContent = `${prop.address}, ${prop.city}, TX ${prop.zip}`;

    const details = document.getElementById('property-details');
    if (details) {
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
      document.getElementById('property-map').innerHTML = '<p class="text-muted">Location information not available for this property.</p>';
    }

    const extra = document.getElementById('property-extra');
    if (extra) {
      const messageCard = `
        <div class="card shadow-sm border-0 mb-4">
          <div class="card-body">
            <h4 class="h5 mb-2">Ask about this home</h4>
            <p class="text-muted small">Have questions? Our team is here to walk you through any property.</p>
            <form id="property-message-form" class="mt-3">
              <div class="mb-3">
                <label class="form-label">Your message</label>
                <textarea class="form-control" rows="3" name="message" placeholder="Ask about availability, pricing, or tours..." required></textarea>
              </div>
              <button class="btn btn-dark w-100" type="submit">Send message</button>
              <div id="property-message-status" class="text-success small mt-2 d-none"></div>
            </form>
          </div>
        </div>
      `;

      const imageHtml = prop.images?.length
        ? `
          <h4 class="h5 mb-3">Gallery</h4>
          <div class="row g-3">
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
  }

  function fetchRemoteData() {
    const requestUrl = new URL(DATA_URL);
    requestUrl.searchParams.set('ts', Date.now());
    requestUrl.searchParams.set('origin', window.location.origin);
    return fetch(requestUrl.toString())
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(raw => {
        const data = Array.isArray(raw) ? raw[0] : raw;
        const formatted = {
          properties: data?.properties || [],
          agents: data?.agents || []
        };
        setCachedPayload(formatted);
        return formatted;
      });
  }

  function getCachedPayload() {
    try {
      const cached = sessionStorage.getItem(DATA_CACHE_KEY);
      if (!cached) return null;
      const parsed = JSON.parse(cached);
      if (!parsed?.data || !parsed?.timestamp) return null;
      if (Date.now() - parsed.timestamp > CACHE_TTL) {
        sessionStorage.removeItem(DATA_CACHE_KEY);
        return null;
      }
      return parsed.data;
    } catch {
      return null;
    }
  }

  function setCachedPayload(data) {
    try {
      sessionStorage.setItem(
        DATA_CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), data })
      );
    } catch {
      // ignore storage errors
    }
  }
});
