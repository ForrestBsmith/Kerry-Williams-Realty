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
      console.log("Fetched JSON data:", data);

      const container = document.getElementById("property-list");
      const nameHeader = document.getElementById("agent-name");
      const bioContainer = document.getElementById("agent-bio");

      if (!container || !nameHeader) {
        console.error("Critical DOM elements missing:", { container, nameHeader });
        return;
      }

      if (!bioContainer) {
        console.warn("bioContainer (agent-bio) not found; skipping agent bio rendering");
      }

      const jsonData = Array.isArray(data) && data.length > 0 ? data[0] : {};
      const agentsArray = Array.isArray(jsonData.agents) ? jsonData.agents : [];
      const properties = Array.isArray(jsonData.properties) ? jsonData.properties : [];

      const agent = agentsArray.find(agent => agent.id.toLowerCase() === agentId?.toLowerCase());
      if (!agent) {
        console.error("Agent not found for ID:", agentId);
        container.innerHTML = `<div class="col-12 text-danger">Agent not found.</div>`;
        nameHeader.textContent = "Agent Profile";
        return;
      }

      nameHeader.textContent = "Agents Listings";

      if (bioContainer) {
        const bioSection = `
          <div class="card agent-card shadow-sm p-0 mb-4">
            <div class="row g-4 align-items-center">
              <div class="d-flex" style="padding: 0em;">
                <img src="${agent.image || 'placeholder.jpg'}" alt="${agent.name || 'Featured Agent'}" 
                     class="img-fluid mb-1" 
                     style="width: 150px; height: 200px; margin-left: 1.5em; margin-top: 1em; object-fit: cover;">
                <div class="text-end text-muted col-6 mt-5">
                  <p class="mb-1 mt-0" style="font-size: 0.9rem;">📞 ${agent.phone || 'N/A'}</p>
                  <p class="mb-1" style="font-size: 0.9rem;">✉️ ${agent.email || 'N/A'}</p>
                  <p class="mb-0 mt-5" style="font-size: 0.9rem;">Properties Listed: ${agent.numberofproperties || 'N/A'}</p>
                  <p class="mb-0" style="font-size: 0.9rem;">Properties Sold: ${agent.propertiessold || 'N/A'}</p>
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
      const agentProperties = properties.filter(prop => prop.agentId.toLowerCase() === agent.id.toLowerCase());

      console.log(`Properties for agent ${agent.name || "Unknown"}:`, agentProperties);

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

        // 🔁 Now that cards are rendered, attach event listeners to buttons

        document.querySelectorAll('.btn-photos').forEach(button => {
          button.addEventListener('click', () => {
            const index = button.getAttribute('data-index');
            const prop = agentProperties[index];
            document.getElementById("photosModal").innerHTML = `
              <div class="modal-dialog modal-lg">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Photos - ${prop.address}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body text-center">
                    <img src="${prop.image}" class="img-fluid" alt="Property photo">
                  </div>
                </div>
              </div>
            `;
          });
        });

        document.querySelectorAll('.btn-schedule').forEach(button => {
          button.addEventListener('click', () => {
            const index = button.getAttribute('data-index');
            const prop = agentProperties[index];
            document.getElementById("scheduleModal").innerHTML = `
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">Schedule Visit - ${prop.address}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <p>Please contact the agent to schedule a viewing.</p>
                    <p><strong>Agent:</strong> ${agent.name}</p>
                    <p><strong>Phone:</strong> ${agent.phone}</p>
                    <p><strong>Email:</strong> ${agent.email}</p>
                  </div>
                </div>
              </div>
            `;
          });
        });

        document.querySelectorAll('.btn-details').forEach(button => {
          button.addEventListener('click', () => {
            const index = button.getAttribute('data-index');
            const prop = agentProperties[index];
            document.getElementById("detailsModal").innerHTML = `
              <div class="modal-dialog">
                <div class="modal-content">
                  <div class="modal-header">
                    <h5 class="modal-title">${prop.address}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                  </div>
                  <div class="modal-body">
                    <ul>
                      <li><strong>Price:</strong> $${Number(prop.price).toLocaleString()}</li>
                      <li><strong>Beds:</strong> ${prop.bedrooms}</li>
                      <li><strong>Baths:</strong> ${prop.bathrooms}</li>
                      <li><strong>SqFt:</strong> ${prop.squareFeet}</li>
                      <li><strong>Description:</strong> ${prop.description}</li>
                    </ul>
                  </div>
                </div>
              </div>
            `;
          });
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
