document.addEventListener("DOMContentLoaded", () => {
  fetch("properties-1.json")
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const container = document.getElementById("property-list");
      const nameHeader = document.getElementById("agent-name");
      const bioContainer = document.getElementById("agent-bio");

      const agentsArray = Array.isArray(data) ? data : [data];

      agentsArray.forEach(agentData => {
        const agents = agentData.agents || [];
        const properties = agentData.properties || [];

        // Render each agent's bio and their associated properties
        agents.forEach(agent => {
          // Set agent name (optional: could be customized to show multiple agents)
          nameHeader.textContent = agent.name || "Agent Listings";

          // Add Realtor Bio & Stats section
          const bioSection = `
            <div class="agent-bio-section my-4 p-4 bg-light rounded">
              <h3 class="fw-bold">${agent.name || "Agent"}'s Bio</h3>
              <p>${agent.bio || "No bio available."}</p>
              <div class="stats mt-3">
                <h4 class="fw-bold">Stats</h4>
                <ul class="list-unstyled">
                  <li><strong>License:</strong> ${agent.lic || "N/A"}</li>
                  <li><strong>Years of Experience:</strong> ${agent.numberofproperties || "N/A"}</li>
                  <li><strong>Properties Sold:</strong> ${agent.propertiessold || "N/A"}</li>
                  <li><strong>Contact:</strong> ${agent.email || "N/A"} | ${agent.phone || "N/A"}</li>
                </ul>
              </div>
            </div>
          `;
          if (bioContainer) {
            bioContainer.insertAdjacentHTML("beforeend", bioSection);
          }

          // Filter and render properties for this agent
          const agentProperties = properties.filter(prop => prop.agentId === agent.id);
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
                    <p class="text-muted small mb-2">${prop.address || 'N/A'}, ${prop.city || 'N/A'}, TX ${prop.zip || 'N/A'}</p>
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
        });
      });
    })
    .catch(err => {
      console.error("Error loading data:", err);
      const container = document.getElementById("property-list");
      container.innerHTML = `<div class="col-12 text-danger">Failed to load properties: ${err.message}</div>`;
    });
});

