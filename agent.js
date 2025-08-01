document.addEventListener("DOMContentLoaded", () => {
  // Get agent ID from URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const agentId = urlParams.get("agent")?.toLowerCase();

  // DOM elements
  const container = document.getElementById("property-list");
  const nameHeader = document.getElementById("agent-name");
  const bioContainer = document.getElementById("agent-bio");

  // Validate critical DOM elements
  if (!container || !nameHeader) {
    console.error("Critical DOM elements missing:", { container, nameHeader });
    if (container) {
      container.innerHTML = `<div class="col-12 text-danger">Error: Page elements not found. Please try again later.</div>`;
    }
    return;
  }

  if (!bioContainer) {
    console.warn("bioContainer (agent-bio) not found; skipping agent bio rendering");
  }

  // Fetch properties data
  fetch("properties-1.json")
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log("Fetched JSON data:", data);

      // Validate JSON structure
      const jsonData = Array.isArray(data) && data.length > 0 ? data[0] : null;
      if (!jsonData || !Array.isArray(jsonData.agents) || !Array.isArray(jsonData.properties)) {
        throw new Error("Invalid JSON structure: Expected an array with agents and properties");
      }

      const agentsArray = jsonData.agents;
      const properties = jsonData.properties;

      // Find agent by ID
      const agent = agentsArray.find(agent => String(agent.id).toLowerCase() === agentId);
      if (!agentId || !agent) {
        console.error("Agent not found for ID:", agentId);
        container.innerHTML = `<div class="col-12 text-danger">Agent not found.</div>`;
        nameHeader.textContent = "Agent Profile";
        return;
      }

      // Update header
      nameHeader.textContent = `${agent.name || "Agent"}'s Listings`;

      // Render agent bio if container exists
      if (bioContainer) {
        const bioSection = `
          <div class="card agent-card shadow-sm p-3 mb-4">
            <div class="row g-2 align-items-center">
              <div class="d-flex" style="padding: 0em;">
                <img src="${agent.image || 'placeholder.jpg'}" alt="${agent.name || 'Featured Agent'}" 
                     class="img-fluid mb-1" 
                     style="width: 100px; height: auto; margin-left: 1.5em; margin-top: 1em; object-fit: cover; margin-right:3em;">
                <div class="text-end text-muted col-6 mt-5">
                  <p class="mb-1 mt-0" style="font-size: 1rem;">📞 ${agent.phone || 'N/A'}</p>
                  <p class="mb-1" style="font-size: 1rem;">✉️ ${agent.email || 'N/A'}</p>
                  <p class="mb-0 mt-5" style="font-size: 1rem;">Properties Listed: ${agent.numberofproperties || 'N/A'}</p>
                  <p class="mb-0" style="font-size: 1rem;">Properties Sold: ${agent.propertiessold || 'N/A'}</p>
                </div>
              </div>
              <div>
                <div class="row">
                  <div class="col-9">
                    <h6 class="card-title mb-1 fw-semibold" style="font-size: 1.1rem;">${agent.name || 'Featured Agent'}</h6>
                    <p class="text-muted mb-1" style="font-size: 0.9rem;">${agent.lic || 'N/A'}</p>
                    <p class="text-muted mb-4" style="font-size: 0.9rem;">${agent.bio || 'No bio available for this agent.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        bioContainer.insertAdjacentHTML("beforeend", bioSection);
      }

      // Filter and render agent's properties
      const agentProperties = properties.filter(prop => String(prop.agentId).toLowerCase() === agentId);
      console.log(`Properties for agent ${agent.name || "Unknown"}:`, agentProperties);

      if (agentProperties.length === 0) {
        container.innerHTML = `<div class="col-12 text-muted">No properties listed for this agent.</div>`;
      } else {
        agentProperties.forEach((prop, index) => {
          const card = `
            <div class="col-md-6 col-lg-4 mb-4">
              <div class="card property-card border-0 shadow-sm h-100">
                <div class="position-relative">
                <img 
  src="${prop.image || 'placeholder.jpg'}" 
  class="card-img-top object-fit-cover property-click" 
  data-index="${index}" 
  alt="${prop.address || 'Property'}" 
  style="height: 220px; border-top-left-radius: .5rem; border-top-right-radius: .5rem; cursor: pointer;">
                  <button class="btn position-absolute top-0 end-0 m-2 rounded-circle p-2">
                    <i class="bi bi-heart text-danger fs-5"></i>
                  </button>
                </div>
                <div class="card-body">
                  <h5 class="card-title fw-bold mb-2">$${Number(prop.price || 0).toLocaleString()}</h5>
                  <p class="text-muted small mb-2">${prop.address || 'No Address Provided'}, ${prop.city || 'N/A'}, TX ${prop.zip || 'N/A'}</p>
                  <div class="d-flex justify-content-between text-secondary small mb-2">
                    <div><i class="bi bi-house-door"></i> ${prop.bedrooms || 'N/A'} Beds</div>
                    <div><i class="bi bi-bucket"></i> ${prop.bathrooms || 'N/A'} Baths</div>
                    <div><i class="bi bi-aspect-ratio"></i> ${prop.squareFeet ? prop.squareFeet.toLocaleString() : 'N/A'} SqFt</div>
                  </div>
                  <div class="text-muted" style="font-size:13px;">${prop.description || 'No description available.'}</div>
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
          container.insertAdjacentHTML("beforeend", card);
        });
      }

      // Modal Event Delegation
      document.addEventListener('click', (e) => {
        const index = e.target.getAttribute('data-index');
        if (index === null) return;

        const prop = agentProperties[index];
        if (!prop) return;


// Clicking on property image redirects to full page
// Redirect to dynamic property page when image is clicked
if (e.target.classList.contains('property-click')) {
  const idx = e.target.getAttribute('data-index');
  const prop = agentProperties[idx];
  if (!prop) return;

  const encodedAddress = encodeURIComponent(prop.address || '');
  window.location.href = `property.html?id=${idx}&address=${encodedAddress}`;
  return;
}


        // View Photos
        if (e.target.classList.contains('btn-photos')) {
          const photosModal = document.querySelector('#photosModal');
          if (photosModal) {
            document.querySelector('#photosModal .modal-title').textContent = `Home Address - ${prop.address || 'Property'}`;
            document.querySelector('#photosModalBody').innerHTML = `
              <div id="carousel-${index}" class="carousel slide" data-bs-ride="carousel">
                <div class="carousel-inner">
                  ${(prop.images || [prop.image || 'placeholder.jpg']).map(
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
          } else {
            console.error("Photos modal (#photosModal) not found in DOM");
          }
        }

        // Schedule Form
        if (e.target.classList.contains('btn-schedule')) {
          const scheduleModal = document.querySelector('#scheduleModal');
          if (scheduleModal) {
            document.querySelector('#scheduleModal .modal-title').textContent = `Schedule a Viewing - ${prop.address || 'Property'}`;
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
          } else {
            console.error("Schedule modal (#scheduleModal) not found in DOM");
          }
        }

        // Property Details
        if (e.target.classList.contains('btn-details')) {
          const detailsModal = document.querySelector('#detailsModal');
          if (detailsModal) {
            document.querySelector('#detailsModal .modal-title').textContent = `Property Details - ${prop.address || 'Property'}`;
            const detailsHTML = `
              <p><strong>Address:</strong> ${prop.address || 'N/A'}, ${prop.city || 'N/A'}, TX ${prop.zip || 'N/A'}</p>
              <p><strong>Price:</strong> $${Number(prop.price || 0).toLocaleString()}</p>
              <p><strong>Bedrooms:</strong> ${prop.bedrooms || 'N/A'}</p>
              <p><strong>Bathrooms:</strong> ${prop.bathrooms || 'N/A'}</p>
              <p><strong>Type:</strong> ${prop.type || 'N/A'}</p>
              <p><strong>Square Feet:</strong> ${prop.squareFeet ? prop.squareFeet.toLocaleString() : 'N/A'} sqft</p>
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
          } else {
            console.error("Details modal (#detailsModal) not found in DOM");
          }
        }
      });
    })
    .catch(err => {
      console.error("Error loading data:", err);
      container.innerHTML = `<div class="col-12 text-danger">Failed to load properties: ${err.message}. Please try refreshing the page.</div>`;
    });
});