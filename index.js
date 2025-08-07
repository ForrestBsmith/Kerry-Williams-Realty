document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('property-search-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const location = document.getElementById('location-input').value.trim();
      window.location.href = `Buying.html?location=${encodeURIComponent(location)}`;
    });
  }
});