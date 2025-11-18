document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  fetch("properties-1.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load JSON");
      return res.json();
    })
    .then((data) => {
      const container = document.querySelector("#realtor-list");
      const agents = data[0].agents;
      container.innerHTML = "";

      agents.forEach((agent) => {
        const {
          name = "Unnamed",
          lic = "",
          phone = "",
          email = "",
          image = "agents.jpg",
          numberofproperties = "0",
          propertiessold = "0",
          averageprice = "N/A",
          totalvalue = "N/A",
          bio = "No bio available"
        } = agent;

        const card = document.createElement("div");
        card.className = "col-12 col-md-6 col-lg-4 animate-fade";
        card.innerHTML = `
          <article class="agent-card-modern h-100 shadow-sm rounded-4 overflow-hidden bg-white">
            <div class="agent-card-modern__image" style="background-image:url('${image}')"></div>
            <div class="p-3 p-md-4 d-flex flex-column gap-2 h-100">
              <div class="d-flex align-items-center justify-content-between gap-3">
                <div>
                  <p class="text-accent text-uppercase small mb-1">Licensed Agent</p>
                  <h5 class="mb-0">${name}</h5>
                  <p class="text-muted small mb-0">${lic}</p>
                </div>
              </div>
              <p class="text-muted small mb-1">${bio}</p>
              <div class="d-flex gap-3 flex-wrap text-muted small">
                <span><i class="bi bi-check2-circle me-1"></i>${propertiessold} closed</span>
                <span><i class="bi bi-house-door me-1"></i>${numberofproperties} active</span>
                <span><i class="bi bi-cash-stack me-1"></i>${averageprice} avg</span>
              </div>
              <div class="border-top pt-3 d-flex flex-column gap-2 text-muted small">
                <span><i class="bi bi-telephone me-2 text-accent"></i>${phone}</span>
                <span><i class="bi bi-envelope me-2 text-accent"></i>${email}</span>
                <span><i class="bi bi-currency-dollar me-2 text-accent"></i>Total value: ${totalvalue}</span>
              </div>
              <div class="mt-auto d-flex gap-2">
                <a href="agent.html?agent=${encodeURIComponent(agent.id)}" class="btn btn-dark flex-grow-1">View profile</a>
                <a href="property.html" class="btn btn-outline-secondary btn-sm">Listings</a>
              </div>
            </div>
          </article>
        `;

        container.appendChild(card);
        observer.observe(card);
      });
    })
    .catch((err) => console.error("Error loading agents:", err));
});
