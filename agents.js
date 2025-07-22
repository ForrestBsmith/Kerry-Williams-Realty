document.addEventListener("DOMContentLoaded", () => {
  fetch("properties-1.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load JSON");
      return res.json();
    })
    .then((data) => {
      const container = document.querySelector("#realtor-list .row");
      const agents = data[0].agents; // access agents array inside first object

      agents.forEach((agent) => {
        const {
          name = "Unnamed",
          lic = "",
          phone = "",
          email = "",
          image = "default.jpg",
          profileUrl = "#"
        } = agent;

        const card = document.createElement("div");
        card.className = "col-md-3 mb-4";
        card.innerHTML = `
          <div class="card agent-card shadow-sm p-0">
            <div class="row g-4 align-items-center">
              <!-- Realtor Photo -->
              <div class="col-3 d-flex justify-content-center" style="padding: 0em;">
                <img src="${image}" alt="${name}" 
                     class="img-fluid mb-1" 
                     style="width:100px; height:130px; margin-left:1.5em; margin-top:1em; object-fit: fill;">
              </div>

              <!-- Realtor Info -->
              <div class="col-9">
                <div class="row">
                  <div class="col-6">
                    <h6 class="card-title mb-1 fw-semibold" style="font-size: 0.95rem;">${name}</h6>
                    <p class="text-muted mb-0" style="font-size: 0.85rem;">${lic}</p>
                  </div>
                  <div class="text-muted col-6">
                    <p class="mb-1" style="font-size: 0.85rem;">📞 ${phone}</p>
                    <p class="mb-0" style="font-size: 0.75rem;">✉️ ${email}</p>
                  </div>
                </div>
              </div>

              <!-- View Listings Button -->
              <div class="col-12 listingbutton">
                <a href="agent.html?agent=${encodeURIComponent(agent.id)}" class="btn btn-sm w-100 pt-0">View Listings</a>
              </div>
            </div>
          </div>
        `;

        container.appendChild(card);
      });
    })
    .catch((err) => console.error("Error loading agents:", err));
});
