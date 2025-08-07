document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id')?.toLowerCase(); // Get string ID, e.g., "property-1"

  fetch('properties-1.json')
    .then(res => {
      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
      return res.json();
    })
    .then(data => {
      const allProperties = data[0].properties;
      const prop = allProperties.find(p => String(p.id).toLowerCase() === id); // Match by id field

      if (!prop) {
        const title = document.getElementById('property-title');
        if (title) title.textContent = 'Property Not Found';
        return;
      }

      // Set property title
      const title = document.getElementById('property-title');
      if (title) title.textContent = `${prop.address}, ${prop.city}, TX ${prop.zip}`;

      // Render property details
      const details = document.getElementById('property-details');
      if (details) {
        details.innerHTML = `
          <h4>Price: $${prop.price.toLocaleString()}</h4>
          <p><i class="bi bi-house-door-fill me-2"></i><strong>Bedrooms:</strong> ${prop.bedrooms || 'N/A'}</p>
          <p><i class="bi bi-droplet me-2"></i><strong>Bathrooms:</strong> ${prop.bathrooms || 'N/A'}</p>
          <p class="mb-5"><i class="bi bi-rulers me-2"></i><strong>Square Feet:</strong> ${prop.squareFeet?.toLocaleString() || 'N/A'}</p>
          <p>${prop.description || 'No description provided.'}</p>
        `;
      }

      // Render property features
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

      // Generate Fancybox-compatible image gallery
      const extra = document.getElementById('property-extra');
      if (extra) {
        const imageHtml = prop.images?.length
          ? `
            <div class="row g-2">
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
        extra.innerHTML = imageHtml;

        // Ensure Fancybox binds to gallery links
        if (typeof Fancybox !== 'undefined') {
          Fancybox.bind('[data-fancybox="gallery"]');
        } else {
          console.warn('Fancybox library not loaded');
        }
      }
    })
    .catch(err => {
      console.error('Error loading property:', err);
      const title = document.getElementById('property-title');
      if (title) title.textContent = 'Error Loading Property';
      const details = document.getElementById('property-details');
      if (details) details.innerHTML = `<p class="text-danger">Failed to load property: ${err.message}</p>`;
    });
});