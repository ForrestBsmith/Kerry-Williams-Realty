document.addEventListener('DOMContentLoaded', () => {
  const els = {
    propertyGrid: document.getElementById('property-grid'),
    agentGrid: document.getElementById('agent-grid'),
    heroFeature: document.getElementById('hero-feature'),
    totalValue: document.getElementById('total-value'),
    averagePrice: document.getElementById('average-price'),
    propertiesSold: document.getElementById('properties-sold'),
    location: document.getElementById('location-input'),
    city: document.getElementById('filter-city'),
    type: document.getElementById('filter-type'),
    min: document.getElementById('filter-min'),
    max: document.getElementById('filter-max'),
    beds: document.getElementById('filter-beds'),
    clear: document.getElementById('clear-filters'),
    form: document.getElementById('property-search-form'),
    statsSection: document.getElementById('market-stats'),
    shareLocation: document.getElementById('share-location'),
  };

  let payload = { properties: [], agents: [] };
  let statsAnimated = false;

  init();

  async function init() {
    try {
      payload = await loadData();
      hydrateCities(payload.properties);
      renderHeroFeature(selectFeatured(payload.properties));
      renderProperties(payload.properties);
      renderAgents(payload.agents);
      setupFilters();
      setupStatsObserver(payload);
      setupAnimations();
    } catch (error) {
      console.error(error);
      showError('Unable to load listings right now.');
    }
  }

  async function loadData() {
    const res = await fetch('properties-1.json');
    if (!res.ok) throw new Error('Failed to fetch data');
    const raw = await res.json();
    const data = Array.isArray(raw) ? raw[0] : raw;
    return {
      properties: data.properties || [],
      agents: data.agents || []
    };
  }

  function setupFilters() {
    const controls = [els.city, els.type, els.min, els.max, els.beds, els.location];
    controls.forEach(ctrl => {
      if (!ctrl) return;
      const eventName = ctrl.tagName === 'INPUT' ? 'input' : 'change';
      ctrl.addEventListener(eventName, filterAndRender);
    });

    els.form?.addEventListener('submit', (e) => {
      e.preventDefault();
      filterAndRender();
    });

    els.clear?.addEventListener('click', () => {
      els.form?.reset();
      filterAndRender();
    });

    els.shareLocation?.addEventListener('click', handleShareLocation);
  }

  function hydrateCities(properties) {
    if (!els.city) return;
    const cities = Array.from(new Set(properties.map(p => p.city))).sort();
    cities.forEach(city => {
      const option = document.createElement('option');
      option.value = city;
      option.textContent = city;
      els.city.appendChild(option);
    });
  }

  function filterAndRender() {
    const filtered = filterProperties(payload.properties);
    renderProperties(filtered);
    renderHeroFeature(selectFeatured(filtered.length ? filtered : payload.properties));
    setupAnimations();
  }

  function filterProperties(list) {
    const location = (els.location?.value || '').toLowerCase();
    const city = els.city?.value || '';
    const type = (els.type?.value || '').toLowerCase();
    const min = Number(els.min?.value || 0);
    const max = Number(els.max?.value || Number.MAX_SAFE_INTEGER);
    const beds = Number(els.beds?.value || 0);

    return list.filter(p => {
      const matchesLocation = location
        ? [p.address, p.city, p.zip].join(' ').toLowerCase().includes(location)
        : true;
      const matchesCity = city ? p.city === city : true;
      const matchesType = type ? (p.type || '').toLowerCase() === type : true;
      const matchesBeds = beds ? Number(p.bedrooms || 0) >= beds : true;
      const price = Number(p.price || 0);
      const matchesMin = min ? price >= min : true;
      const matchesMax = max && max !== Number.MAX_SAFE_INTEGER ? price <= max : true;
      return matchesLocation && matchesCity && matchesType && matchesBeds && matchesMin && matchesMax;
    }).sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
  }

  function renderProperties(listings) {
    if (!els.propertyGrid) return;
    if (!listings.length) {
      els.propertyGrid.innerHTML = `<div class="col-12">
        <div class="placeholder-card p-4 border rounded-3 bg-white text-center text-muted">No listings match those filters yet. Try broadening your search.</div>
      </div>`;
      return;
    }

    els.propertyGrid.innerHTML = listings.map(renderPropertyCard).join('');
    setupAnimations();
  }

  function renderPropertyCard(property) {
    const {
      id,
      image,
      address,
      city,
      zip,
      price,
      bedrooms,
      bathrooms,
      squareFeet,
      type,
      status
    } = property;

    return `<div class="col-12 col-md-6 col-lg-4 animate-fade">
      <article class="property-card h-100 shadow-sm rounded-4 overflow-hidden">
        <div class="property-image" style="background-image:url('${image || 'agents.jpg'}');">
          <div class="property-badges">
            <span class="badge text-bg-dark">${status || 'For Sale'}</span>
            <span class="badge text-bg-light">${type || 'Property'}</span>
          </div>
        </div>
        <div class="p-3 p-md-4 d-flex flex-column gap-2">
          <h5 class="mb-0">${formatCurrency(price)}</h5>
          <p class="text-muted mb-0 small">${address || '-'} - ${city || ''} ${zip || ''}</p>
          <div class="d-flex gap-3 text-muted small">
            <span><i class="bi bi-door-closed me-1"></i>${bedrooms || 0} bd</span>
            <span><i class="bi bi-droplet me-1"></i>${bathrooms || 0} ba</span>
            <span><i class="bi bi-aspect-ratio me-1"></i>${squareFeet ? `${squareFeet.toLocaleString()} sqft` : '-'}</span>
          </div>
          <div class="d-flex gap-2 mt-2 align-items-stretch">
            <a class="btn btn-dark flex-grow-1 d-flex align-items-center justify-content-center" href="property.html?id=${encodeURIComponent(id)}">View details</a>
            <a class="btn btn-accent flex-grow-1 d-flex align-items-center justify-content-center" href="Agents.html">Contact agent</a>
          </div>
        </div>
      </article>
    </div>`;
  }

  function renderHeroFeature(property) {
    if (!els.heroFeature) return;
    if (!property) {
      els.heroFeature.innerHTML = `<p class="text-muted mb-0">No featured listing available yet.</p>`;
      return;
    }

    const agent = payload.agents.find(a => a.id === property.agentId);

    els.heroFeature.innerHTML = `
      <div class="feature-hero-img rounded-4 mb-3" style="background-image:url('${property.image || 'agents.jpg'}');"></div>
      <h4 class="mb-1">${formatCurrency(property.price)}</h4>
      <p class="mb-2 text-muted small">${property.address || ''}, ${property.city || ''} ${property.zip || ''}</p>
      <div class="d-flex gap-2 flex-wrap mb-3">
        <span class="badge text-bg-dark">${property.status || 'For Sale'}</span>
        <span class="badge text-bg-light">${property.type || 'Property'}</span>
        <span class="badge text-bg-light"><i class="bi bi-door-closed me-1"></i>${property.bedrooms || 0} bd</span>
        <span class="badge text-bg-light"><i class="bi bi-droplet me-1"></i>${property.bathrooms || 0} ba</span>
        <span class="badge text-bg-light"><i class="bi bi-aspect-ratio me-1"></i>${property.squareFeet ? `${property.squareFeet.toLocaleString()} sqft` : '-'}</span>
      </div>
      <div class="d-flex align-items-center gap-3">
        <img src="${agent?.image || 'agents.jpg'}" class="rounded-circle" width="52" height="52" alt="${agent?.name || 'Agent'}">
        <div>
          <p class="mb-0 fw-semibold text-black">${agent?.name || 'Local expert'}</p>
          <p class="mb-0 text-muted small">${agent?.phone || ''}</p>
        </div>
      </div>
    `;
  }

  function selectFeatured(list) {
    if (!list.length) return null;
    return [...list].sort((a, b) => Number(b.price || 0) - Number(a.price || 0))[0];
  }

  function renderAgents(agents) {
    if (!els.agentGrid) return;
    if (!agents.length) {
      els.agentGrid.innerHTML = `<div class="col-12">
        <div class="placeholder-card p-4 border rounded-3 bg-white text-center text-muted">No agents found.</div>
      </div>`;
      return;
    }

    const topAgents = [...agents]
      .sort((a, b) => toNumber(b.propertiessold) - toNumber(a.propertiessold))
      .slice(0, 3);

    els.agentGrid.innerHTML = topAgents.map(agentCard).join('');
    setupAnimations();
  }

  function agentCard(agent) {
    return `<div class="col-12 animate-slide">
      <article class="agent-card h-100 shadow-sm rounded-4 p-3 p-md-4 bg-white">
        <img src="${agent.image || 'agents.jpg'}" alt="${agent.name}" class="rounded-circle" width="80" height="80">
        <div class="agent-meta">
          <h6 class="mb-1">${agent.name}</h6>
          <p class="text-muted small mb-1">${agent.lic || ''}</p>
          <p class="text-muted small mb-3">${agent.bio || ''}</p>
          <div class="d-flex gap-2 flex-wrap mb-2">
            ${(agent.languages || []).map(lang => `<span class="badge text-bg-light">${lang}</span>`).join('')}
          </div>
          <div class="d-flex flex-wrap gap-3 small text-muted mb-0">
            <span><i class="bi bi-check2-circle me-1"></i>${agent.exp || 'Experience'}</span>
            <span><i class="bi bi-house-door me-1"></i>${agent.numberofproperties || 0} active</span>
            <span><i class="bi bi-graph-up me-1"></i>${agent.propertiessold || 0} sold</span>
          </div>
        </div>
        <div class="agent-actions">
          <a class="btn btn-sm btn-dark w-100" href="agent.html?id=${encodeURIComponent(agent.id)}">View profile</a>
          <a class="btn btn-sm btn-outline-secondary w-100" href="tel:${agent.phone?.replace(/[^0-9]/g, '') || ''}" aria-label="Call ${agent.name}"><i class="bi bi-telephone me-1"></i> Call</a>
        </div>
      </article>
    </div>`;
  }

  function setupStatsObserver(data) {
    if (!els.statsSection) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
          statsAnimated = true;
          renderStats(data);
          observer.disconnect();
        }
      });
    }, { threshold: 0.3 });
    observer.observe(els.statsSection);
  }

  function setupAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    document.querySelectorAll('.animate-fade:not(.in-view), .animate-slide:not(.in-view)')
      .forEach(el => observer.observe(el));
  }

  function renderStats(data) {
    const metrics = computeMetrics(data);
    animateValueMillions(els.totalValue, 0, metrics.totalValue, 1500, '$', 'M');
    animateValueThousands(els.averagePrice, 0, metrics.avgPrice, 1500, '$', 'K');
    animateValue(els.propertiesSold, 0, metrics.activeListings, 1500, '', '');
  }

  function computeMetrics(data) {
    const totalValue = data.properties.reduce((sum, p) => sum + Number(p.price || 0), 0);
    const avgPrice = data.properties.length ? totalValue / data.properties.length : 0;
    const activeListings = data.properties.length;
    return { totalValue, avgPrice, activeListings };
  }

  function animateValue(el, start, end, duration, prefix = '', suffix = '') {
    if (!el) return;
    let startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      el.textContent = `${prefix}${value.toLocaleString()}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function animateValueThousands(el, start, end, duration, prefix = '', suffix = 'K') {
    if (!el) return;
    let startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = (progress * (end - start) + start) / 1000;
      el.textContent = `${prefix}${value.toFixed(1)}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function animateValueMillions(el, start, end, duration, prefix = '', suffix = 'M') {
    if (!el) return;
    let startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = (progress * (end - start) + start) / 1_000_000;
      el.textContent = `${prefix}${value.toFixed(1)}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Number(value || 0));
  }

  function toNumber(value) {
    return Number(String(value || '').replace(/[^0-9.]/g, '')) || 0;
  }

  function showError(message) {
    if (els.propertyGrid) {
      els.propertyGrid.innerHTML = `<div class="col-12">
        <div class="placeholder-card p-4 border rounded-3 bg-white text-center text-muted">${message}</div>
      </div>`;
    }
  }

  function handleShareLocation() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported in this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        const nearest = findNearestCity(latitude, longitude, payload.properties);
        if (nearest) {
          if (els.city) els.city.value = nearest.city || '';
          if (els.location) els.location.value = nearest.city || '';
        }
        filterAndRender();
      },
      () => alert('Unable to access location. Please allow location services or search manually.'),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }

  function findNearestCity(lat, lng, properties) {
    if (!properties?.length) return null;
    let nearest = null;
    let nearestDist = Number.MAX_VALUE;
    properties.forEach(p => {
      if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
      const d = haversine(lat, lng, p.lat, p.lng);
      if (d < nearestDist) {
        nearestDist = d;
        nearest = p;
      }
    });
    return nearest;
  }

  function haversine(lat1, lon1, lat2, lon2) {
    const toRad = (deg) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
});



