document.addEventListener("DOMContentLoaded", () => {
  // Get agent ID from URL query parameter (matches agents.js 'agent' parameter)
  const urlParams = new URLSearchParams(window.location.search);
  const agentId = urlParams.get("agent");

  fetch("properties-1.json")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      // Log JSON data for debugging
      console.log("Fetched JSON data:", data);

      // DOM elements
      const container = document.getElementById("property-list");
      const nameHeader = document.getElementById("agent-name");
      const bioContainer = document.getElementById("agent-bio");

      // Validate critical DOM elements
      if (!container || !nameHeader) {
        console.error("Critical DOM elements missing:", { container, nameHeader });
        return;
      }

      // Warn if bioContainer is missing
      if (!bioContainer) {
        console.warn("bioContainer (agent-bio) not found; skipping agent bio rendering");
      }

      // Extract agents and properties from nested JSON
      const jsonData = Array.isArray(data) && data.length > 0 ? data[0] : {};
      const agentsArray = Array.isArray(jsonData.agents) ? jsonData.agents : [];
      const properties = Array.isArray(jsonData.properties) ? jsonData.properties : [];

      // Find the selected agent (case-insensitive)
      const agent = agentsArray.find(agent => agent.id.toLowerCase() === agentId?.toLowerCase());
      if (!agent) {
        console.error("Agent not found for ID:", agentId);
        container.innerHTML = `<div class="col-12 text-danger">Agent not found.</div>`;
        if (nameHeader) nameHeader.textContent = "Agent Profile";
        return;
      }

      // Set hardcoded header text
      nameHeader.textContent = "Agents Listings"; // Hardcoded, customizable (e.g., "View Agent Listings")

      // Render agent bio card if bioContainer exists
      if (bioContainer) {
        const bioSection = `
          <div class="card agent-card shadow-sm p-0 mb-4">
            <div class="row g-4 align-items-center">
              <!-- Agent Photo -->
              <div class="col-md-3 d-flex justify-content-start" style="padding: 0em;">
                <img src="${agent.image || 'placeholder.jpg'}" alt="${agent.name || 'Featured Agent'}" 
                     class="img-fluid mb-1" 
                     style="width: 150px; height: 200px; margin-left: 1.5em; margin-top: 1em; object-fit: cover;">
              </div>
              <!-- Agent Info -->
              <div class="col-md-9">
                <div class="row">
                  <div class="col-6">
                    <h6 class="card-title mb-1 fw-semibold" style="font-size: 1.1rem;">${agent.name || 'Featured Agent'}</h6>
                    <p class="text-muted mb-1" style="font-size: 0.9rem;">${agent.lic || 'N/A'}</p>
                    <p class="text-muted mb-3 text-center" style="font-size: 0.9rem;">${agent.bio || 'No bio available for this agent.'}</p>
                  </div>
                  <div class="text-muted col-6">
                    <p class="mb-2" style="font-size: 0.9rem;">📞 ${agent.phone || 'N/A'}</p>
                    <p class="mb-5" style="font-size: 0.9rem;">✉️ ${agent.email || 'N/A'}</p>
                    <p class="mb-0" style="font-size: 0.9rem;">Properties Listed: ${agent.numberofproperties || 'N/A'}</p>
                    <p class="mb-0" style="font-size: 0.9rem;">Properties Sold: ${agent.propertiessold || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        bioContainer.insertAdjacentHTML("beforeend", bioSection);
      }

      // Filter properties for this agent (case-insensitive)
      const agentProperties = properties.filter(prop => prop.agentId.toLowerCase() === agent.id.toLowerCase());

      // Log properties for debugging
      console.log(`Properties for agent ${agent.name || "Unknown"}:`, agentProperties);

      // Render properties or show message if none
      if (agentProperties.length === 0) {
        container.innerHTML = `<div class="col-12 text-muted">No properties listed for this agent.</div>`;
      } else {
        agentProperties.forEach((prop, index) => {
          const card = `
            <div class="col-md-6 col-lg-4 mb-4">
              <div class="card property-card border-0 shadow-sm h-100">
                <div class="position-relative">
                  <img src="${prop.image || 'placeholder.jpg'}" class="card-img-top object-fit-cover" alt="${prop.address || 'Property'}" style="height: 220px; border-top-left-radius: .5rem; border-top-right-radius: .5rem;">
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
    })
    .catch(err => {
      console.error("Error loading data:", err);
      const container = document.getElementById("property-list");
      if (container) {
        container.innerHTML = `<div class="col-12 text-danger">Failed to load properties: ${err.message}</div>`;
      }
    });
});