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
          profileUrl = "#",
          numberofproperties = "0",
          propertiessold = "0",
          averageprice = "N/A",
          totalvalue = "N/A",
          bio = "No bio available"
        } = agent;

        const card = document.createElement("div");
        card.className = "col-md-3 mb-4";
        card.innerHTML = `
          <div class="card agent-card shadow-sm p-0">
            <div class="row g-2 align-items-center">
              <!-- Realtor Photo -->
              <div class="col-3 d-flex justify-content-center" style="padding: 0em;">
                <img src="${image}" alt="${name}" 
                     class="img-fluid mb-0 realtor-photo">
              </div>
<div class="col-9">
  <p class="p-1 agentcardtitle">About Us</p>
  <p class="text-muted p-1 mb-0 bio-text">${bio}</p>
</div>

<!-- Realtor Info -->
<div>
  <div class="row p-1 mt-0">
    <div class="col-6">
      <h6 class="card-title mb-1 p-1 ml-1 fw-semibold name-text">${name}</h6>
      <p class="text-muted mb-0 lic-text">${lic}</p>
      <p class="mb-0 mt-3 contact-text">📞 ${phone}</p>
      <p class="mb-0 contact-text">✉️ ${email}</p>
    </div>

    <div class="col-6">
      <p class="mb-0 mt-4 stat-text">Available properties: ${numberofproperties}</p>
      <p class="mb-2 stat-text">Properties sold: ${propertiessold}</p>
      <p class="mb-0 price-text">Average Price: ${averageprice}</p>
      <p class="mb-0 price-text">Total Value: ${totalvalue}</p>
    </div>
  </div>
</div>

<!-- View Listings Button -->
<div class="col-12 listingbutton mt-0">
  <a href="agent.html?agent=${encodeURIComponent(agent.id)}" class="btn btn-sm w-100">View Listings</a>
</div>

            </div>
          </div>
        `;

        container.appendChild(card);
      });
    })
    .catch((err) => console.error("Error loading agents:", err));
});
