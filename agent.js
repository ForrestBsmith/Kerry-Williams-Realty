document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const agentId = params.get("agent")?.toLowerCase();

  const heroSection = document.getElementById("agent-hero");
  const listingsContainer = document.getElementById("agent-listings");
  const metricsSection = document.getElementById("agent-metrics");
  const metricsCards = document.getElementById("agent-metrics-cards");
  const performanceSection = document.getElementById("agent-performance");
  const mapCountPill = document.getElementById("map-count-pill");
  const soldPill = document.getElementById("sold-count-pill");
  const activePill = document.getElementById("active-count-pill");
  const messageBtn = document.getElementById("agent-message-btn");
  const messageForm = document.getElementById("agent-message-form");
  const messageStatus = document.getElementById("message-status");

  let agentProperties = [];
  let soldProperties = [];
  let soldChart;
  let activeChart;

  const session = window.UserSession;

  const guardUser = () => {
    const user = session?.ensureUser?.();
    if (!user) {
      alert("Please sign in to save homes or send messages.");
      window.location.href = "Sign-In.html";
      return null;
    }
    return user;
  };

  const renderHero = (agent, stats) => {
    heroSection.innerHTML = `
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
        <div class="row g-4 align-items-center">
          <div class="col-lg-4">
            <div class="ratio ratio-1x1 rounded-4 overflow-hidden">
              <img src="${agent.image || "realtor.jpg"}" alt="${agent.name}" class="w-100 h-100 object-fit-cover">
            </div>
          </div>
          <div class="col-lg-8">
            <p class="text-uppercase small text-accent mb-1">Licensed Agent</p>
            <h1 class="fw-bold mb-1">${agent.name}</h1>
            <p class="text-muted mb-2">${agent.lic || ""}</p>
            <p class="text-muted mb-3">${agent.sectionbio || agent.bio || "Local expert ready to help you move with confidence."}</p>
            <div class="d-flex flex-wrap gap-3 mb-3 text-muted small">
              <span><i class="bi bi-telephone me-2 text-accent"></i>${agent.phone || "N/A"}</span>
              <span><i class="bi bi-envelope me-2 text-accent"></i>${agent.email || "N/A"}</span>
              <span><i class="bi bi-geo-alt me-2 text-accent"></i>Central Texas</span>
            </div>
            <div class="d-flex flex-wrap gap-2 mb-4">
              ${(agent.languages || [])
                .map((lang) => `<span class="badge bg-light text-dark">${lang}</span>`)
                .join("")}
              ${(agent.specialties || [])
                .map((spec) => `<span class="badge bg-dark">${spec}</span>`)
                .join("")}
            </div>
            <div class="d-flex flex-wrap gap-2">
              <button class="btn btn-dark" id="hero-message-btn"><i class="bi bi-chat-dots me-2"></i>Message</button>
              <a class="btn btn-outline-secondary" href="#agent-listings">View listings</a>
              <a class="btn btn-light border" href="Agents.html"><i class="bi bi-arrow-left me-2"></i>Back to agents</a>
            </div>
            <div class="d-flex gap-4 flex-wrap mt-4 text-center">
              <div>
                <div class="fw-bold h4 mb-0">$${stats.totalSoldValue.toLocaleString()}</div>
                <p class="text-muted small mb-0">Closed volume</p>
              </div>
              <div>
                <div class="fw-bold h4 mb-0">${stats.soldCount}</div>
                <p class="text-muted small mb-0">Closed deals</p>
              </div>
              <div>
                <div class="fw-bold h4 mb-0">${stats.activeCount}</div>
                <p class="text-muted small mb-0">Active listings</p>
              </div>
              <div>
                <div class="fw-bold h4 mb-0">$${stats.averageActivePrice.toLocaleString()}</div>
                <p class="text-muted small mb-0">Avg list price</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const renderMetrics = (stats) => {
    const cards = [
      { label: "Active listings", value: stats.activeCount, icon: "bi bi-house" },
      { label: "Closed volume", value: `$${stats.totalSoldValue.toLocaleString()}`, icon: "bi bi-cash-stack" },
      { label: "Closed deals", value: stats.soldCount, icon: "bi bi-briefcase" },
      { label: "Average list", value: `$${stats.averageActivePrice.toLocaleString()}`, icon: "bi bi-graph-up" },
    ];

    metricsCards.innerHTML = cards
      .map(
        (c) => `
        <div class="col-6 col-md-3">
          <div class="card shadow-sm border-0 h-100">
            <div class="card-body">
              <div class="d-flex align-items-center gap-2 mb-2">
                <i class="${c.icon} text-accent"></i>
                <p class="text-muted small mb-0">${c.label}</p>
              </div>
              <h5 class="fw-bold mb-0">${c.value}</h5>
            </div>
          </div>
        </div>`
      )
      .join("");

    metricsSection.classList.remove("d-none");
  };

  const renderListings = (properties) => {
    listingsContainer.innerHTML = "";
    if (!properties.length) {
      listingsContainer.innerHTML = `<div class="col-12 text-muted text-center">No active listings for this agent.</div>`;
      return;
    }

    properties.forEach((prop, index) => {
      const saved = session?.isSaved?.(prop.id);
      const saveIcon = saved ? "bi-heart-fill text-danger" : "bi-heart";

      const card = `
        <div class="col-md-6 col-lg-4">
          <div class="card property-card border-0 shadow-sm h-100">
            <div class="position-relative">
              <img src="${prop.image || "placeholder.jpg"}" class="card-img-top object-fit-cover property-click" data-index="${index}" alt="${prop.address || "Property"}" style="height: 220px; cursor: pointer;">
              <button class="btn btn-light border position-absolute top-0 end-0 m-2 rounded-circle p-2 btn-save-home" data-id="${prop.id}">
                <i class="bi ${saveIcon} fs-5"></i>
              </button>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="fw-bold mb-0">$${Number(prop.price || 0).toLocaleString()}</h5>
                <span class="badge bg-light text-dark">Listed ${prop.listedDaysAgo || "-"} days</span>
              </div>
              <p class="text-muted small mb-2">${prop.address || "N/A"}, ${prop.city || ""}, TX ${prop.zip || ""}</p>
              <div class="d-flex justify-content-between text-secondary small mb-2">
                <span><i class="bi bi-house-door"></i> ${prop.bedrooms || "N/A"} bd</span>
                <span><i class="bi bi-bucket"></i> ${prop.bathrooms || "N/A"} ba</span>
                <span><i class="bi bi-aspect-ratio"></i> ${prop.squareFeet ? prop.squareFeet.toLocaleString() : "N/A"} sf</span>
              </div>
              <p class="text-muted small">${prop.description || "No description available."}</p>
              <div class="d-flex gap-2 mt-2">
                <button class="btn btn-outline-secondary btn-sm flex-fill btn-photos" data-index="${index}" data-bs-toggle="modal" data-bs-target="#photosModal">Photos</button>
                <button class="btn btn-outline-secondary btn-sm flex-fill btn-schedule" data-index="${index}" data-bs-toggle="modal" data-bs-target="#scheduleModal">Schedule</button>
                <button class="btn btn-outline-secondary btn-sm flex-fill btn-details" data-index="${index}" data-bs-toggle="modal" data-bs-target="#detailsModal">Details</button>
              </div>
            </div>
          </div>
        </div>
      `;
      listingsContainer.insertAdjacentHTML("beforeend", card);
    });
  };

  const renderMap = (properties) => {
    const mapEl = document.getElementById("agent-map");
    if (!mapEl || !properties.length || !window.L) {
      if (mapCountPill) mapCountPill.textContent = "0 listings mapped";
      return;
    }

    const map = L.map(mapEl).setView([31.5, -97.3], 10);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const positions = [];
    properties.forEach((prop) => {
      if (prop.lat && prop.lng) {
        const marker = L.marker([prop.lat, prop.lng]).addTo(map);
        marker.bindPopup(`<strong>${prop.address || "Listing"}</strong><br>$${Number(prop.price || 0).toLocaleString()}`);
        positions.push(marker.getLatLng());
      }
    });

    if (positions.length) {
      map.fitBounds(positions, { padding: [40, 40] });
    }

    if (mapCountPill) {
      mapCountPill.textContent = `${positions.length} listing${positions.length === 1 ? "" : "s"} mapped`;
    }
  };

  const renderCharts = (sales, active) => {
    const soldCanvas = document.getElementById("sold-chart");
    const activeCanvas = document.getElementById("active-chart");
    const soldEmpty = document.getElementById("sold-chart-empty");
    const activeEmpty = document.getElementById("active-chart-empty");

    const monthly = {};
    sales.forEach((p) => {
      const date = p.soldDate ? new Date(p.soldDate) : null;
      if (!date || Number.isNaN(date)) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthly[key] = (monthly[key] || 0) + (p.price || 0);
    });

    const soldEntries = Object.entries(monthly).sort(
      ([a], [b]) => new Date(`${a}-01`) - new Date(`${b}-01`)
    );
    const soldLabels = soldEntries.map(([k]) => k);
    const soldData = soldEntries.map(([, v]) => v);

    if (window.Chart && soldCanvas && soldLabels.length) {
      soldChart?.destroy();
      soldChart = new Chart(soldCanvas, {
        type: "line",
        data: {
          labels: soldLabels.map((k) => {
            const [year, month] = k.split("-").map(Number);
            return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][month - 1]} ${year}`;
          }),
          datasets: [
            {
              label: "Sold volume ($)",
              data: soldData,
              borderColor: "#0d6efd",
              backgroundColor: "rgba(13,110,253,.15)",
              tension: 0.3,
            },
          ],
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } },
      });
      soldEmpty?.classList.add("d-none");
    } else if (soldEmpty) {
      soldEmpty.textContent = "No closed sales yet.";
      soldCanvas?.classList.add("d-none");
    }

    const activeLabels = active.map((p) => p.address || p.id);
    const activeData = active.map((p) => p.price || 0);

    if (window.Chart && activeCanvas && activeData.length) {
      activeChart?.destroy();
      activeChart = new Chart(activeCanvas, {
        type: "bar",
        data: {
          labels: activeLabels,
          datasets: [
            {
              label: "List price ($)",
              data: activeData,
              backgroundColor: "#198754",
            },
          ],
        },
        options: { responsive: true, scales: { y: { beginAtZero: true } } },
      });
      activeEmpty?.classList.add("d-none");
    } else if (activeEmpty) {
      activeEmpty.textContent = "No active listings to chart.";
      activeCanvas?.classList.add("d-none");
    }

    performanceSection.classList.remove("d-none");
    if (soldPill) soldPill.textContent = `${sales.length} closed`;
    if (activePill) activePill.textContent = `${active.length} active`;
  };

  const bindModalActions = () => {
    const photosModal = document.querySelector("#photosModal");
    const scheduleModal = document.querySelector("#scheduleModal");
    const detailsModal = document.querySelector("#detailsModal");

    const photosBody = document.getElementById("photosModalBody");
    const scheduleBody = document.getElementById("scheduleModalBody");
    const detailsBody = document.getElementById("detailsModalBody");

    document.addEventListener("click", (e) => {
      const idx = e.target.getAttribute("data-index");
      if (idx === null) return;
      const property = agentProperties[idx];
      if (!property) return;

      if (e.target.classList.contains("property-click")) {
        window.location.href = `property.html?id=${encodeURIComponent(property.id)}`;
        return;
      }

      if (e.target.classList.contains("btn-photos") && photosModal && photosBody) {
        document.getElementById("photosModalLabel").textContent = property.address || "Listing photos";
        photosBody.innerHTML = `
          <div id="carousel-${idx}" class="carousel slide" data-bs-ride="carousel">
            <div class="carousel-inner">
              ${(property.images || [property.image || "placeholder.jpg"])
                .map(
                  (img, i) => `
                    <div class="carousel-item ${i === 0 ? "active" : ""}">
                      <img src="${img}" class="d-block w-100" alt="Photo ${i + 1}">
                    </div>
                  `
                )
                .join("")}
            </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${idx}" data-bs-slide="prev">
              <span class="carousel-control-prev-icon"></span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carousel-${idx}" data-bs-slide="next">
              <span class="carousel-control-next-icon"></span>
            </button>
          </div>
        `;
      }

      if (e.target.classList.contains("btn-schedule") && scheduleModal && scheduleBody) {
        document.getElementById("scheduleModalLabel").textContent = `Schedule - ${property.address || "Property"}`;
        scheduleBody.innerHTML = `
          <form class="d-grid gap-3">
            <div>
              <label class="form-label">Your Name</label>
              <input type="text" class="form-control" required>
            </div>
            <div>
              <label class="form-label">Preferred Date</label>
              <input type="date" class="form-control" required>
            </div>
            <div>
              <label class="form-label">Email</label>
              <input type="email" class="form-control" required>
            </div>
            <button type="submit" class="btn btn-dark w-100">Submit Request</button>
          </form>
        `;
      }

      if (e.target.classList.contains("btn-details") && detailsModal && detailsBody) {
        document.getElementById("detailsModalLabel").textContent = `Details - ${property.address || "Property"}`;
        detailsBody.innerHTML = `
          <p><strong>Address:</strong> ${property.address || "N/A"}, ${property.city || ""}, TX ${property.zip || ""}</p>
          <p><strong>Price:</strong> $${Number(property.price || 0).toLocaleString()}</p>
          <p><strong>Bedrooms:</strong> ${property.bedrooms || "N/A"}</p>
          <p><strong>Bathrooms:</strong> ${property.bathrooms || "N/A"}</p>
          <p><strong>Type:</strong> ${property.type || "N/A"}</p>
          <p><strong>Square Feet:</strong> ${property.squareFeet ? property.squareFeet.toLocaleString() : "N/A"} sqft</p>
          <p><strong>Year Built:</strong> ${property.yearBuilt || "N/A"}</p>
          <p><strong>Lot Size:</strong> ${property.lotSize ? `${property.lotSize} acres` : "N/A"}</p>
          <p><strong>Garage:</strong> ${property.garage || "N/A"}</p>
          <p><strong>HOA Fees:</strong> ${property.hoaFees ? `$${property.hoaFees}/mo` : "None"}</p>
          <p><strong>School District:</strong> ${property.schoolDistrict || "N/A"}</p>
          ${property.description ? `<p><strong>Description:</strong> ${property.description}</p>` : ""}
        `;
      }
    });
  };

  const bindSaveHandler = () => {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn-save-home");
      if (!btn) return;
      const propertyId = btn.getAttribute("data-id");
      const user = guardUser();
      if (!user) return;

      const result = session.toggleSavedHome(propertyId);
      const icon = btn.querySelector("i");
      if (result.saved) {
        btn.classList.add("btn-success");
        icon.className = "bi bi-heart-fill fs-5 text-white";
        btn.setAttribute("aria-pressed", "true");
      } else {
        btn.classList.remove("btn-success");
        icon.className = "bi bi-heart fs-5";
        btn.removeAttribute("aria-pressed");
      }
    });
  };

  const bindMessageModal = (agent) => {
    const modalEl = document.getElementById("messageModal");
    if (!modalEl || !messageForm) return;
    const modal = new bootstrap.Modal(modalEl);

    const openModal = () => {
      const user = session?.getUser?.();
      if (user) {
        messageForm.name.value = user.name || "";
        messageForm.email.value = user.email || "";
      }
      messageForm.agentName.value = agent.name;
      messageForm.agentId.value = agent.id;
      messageStatus?.classList.add("d-none");
      modal.show();
    };

    messageBtn?.addEventListener("click", openModal);
    document.getElementById("hero-message-btn")?.addEventListener("click", openModal);

    messageForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const user = guardUser();
      if (!user) return;

      const form = new FormData(messageForm);
      const entry = session.addMessage({
        agentId: form.get("agentId"),
        agentName: form.get("agentName"),
        body: form.get("message"),
        subject: "Message to agent",
      });

      if (entry) {
        messageStatus.textContent = "Message saved to your portal. We'll reach out shortly.";
        messageStatus.classList.remove("d-none");
        messageStatus.classList.add("text-success");
        messageForm.reset();
        setTimeout(() => modal.hide(), 800);
      } else {
        messageStatus.textContent = "Unable to save your message. Please try again.";
        messageStatus.classList.remove("d-none");
        messageStatus.classList.add("text-danger");
      }
    });
  };

  const DATA_URL = "https://script.google.com/macros/s/AKfycbyjfqkPK9YLpEKHz9aaSa6RJ2Z1D7JTnx0SgI32kVmsdPAhCUXqoQJyPugVTK9X1ucKIw/exec";

  fetch(`${DATA_URL}?ts=${Date.now()}`)
    .then((res) => res.json())
    .then((data) => {
      const jsonData = Array.isArray(data) ? data[0] : null;
      const agents = jsonData?.agents || [];
      const properties = jsonData?.properties || [];
      const agent = agents.find((a) => String(a.id).toLowerCase() === agentId);

      if (!agent) {
        heroSection.innerHTML = `<div class="alert alert-warning">Agent not found. <a href="Agents.html" class="alert-link">Back to all agents</a>.</div>`;
        return;
      }

      agentProperties = properties.filter((p) => String(p.agentId).toLowerCase() === agentId);
      soldProperties = properties.filter(
        (p) =>
          p.status === "sold" &&
          (String(p.listingAgentId || "").toLowerCase() === agentId ||
            String(p.buyerAgentId || "").toLowerCase() === agentId)
      );

      const stats = {
        activeCount: agentProperties.length,
        soldCount: soldProperties.length,
        totalSoldValue: soldProperties.reduce((sum, p) => sum + (p.price || 0), 0),
        averageActivePrice:
          agentProperties.length > 0
            ? Math.round(agentProperties.reduce((sum, p) => sum + (p.price || 0), 0) / agentProperties.length)
            : 0,
      };

      renderHero(agent, stats);
      renderMetrics(stats);
      renderListings(agentProperties);
      renderMap(agentProperties);
      renderCharts(soldProperties, agentProperties);
      bindSaveHandler();
      bindMessageModal(agent);
      bindModalActions();
    })
    .catch((err) => {
      console.error(err);
      heroSection.innerHTML = `<div class="alert alert-danger">Failed to load agent profile.</div>`;
    });
});
