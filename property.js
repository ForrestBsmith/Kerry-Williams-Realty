document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'));

  fetch('properties-1.json')
    .then(res => res.json())
    .then(data => {
      const allProperties = data[0].properties;
      const prop = allProperties[id];

      if (!prop) {
        document.getElementById('property-title').textContent = 'Property Not Found';
        return;
      }

      // Set property title
      document.getElementById('property-title').textContent = `${prop.address}, ${prop.city}, TX ${prop.zip}`;

      // Render property details
      document.getElementById('property-details').innerHTML = `
        <h4>Price: $${prop.price.toLocaleString()}</h4>
        <p><i class="bi bi-house-door-fill me-2"></i><strong>Bedrooms:</strong> ${prop.bedrooms}</p>
        <p><i class="bi bi-droplet me-2"></i><strong>Bathrooms:</strong> ${prop.bathrooms}</p>
        <p class="mb-5"><i class="bi bi-rulers me-2"></i><strong>Square Feet:</strong> ${prop.squareFeet?.toLocaleString() || 'N/A'}</p>
        <p>${prop.description || 'No description provided.'}</p>
      `;

      // Generate Fancybox-compatible image gallery
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
        : '';

      // Insert gallery into page
      document.getElementById('property-extra').innerHTML = imageHtml;

      // ✅ Fancybox auto-binds, but this ensures it re-binds in case you're injecting dynamically
      Fancybox.bind('[data-fancybox="gallery"]');
            });
});
    
