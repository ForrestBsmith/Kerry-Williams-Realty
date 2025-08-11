document.addEventListener('DOMContentLoaded', () => {
  // Existing form redirect
  const form = document.getElementById('property-search-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const location = document.getElementById('location-input').value.trim();
      window.location.href = `Buying.html?location=${encodeURIComponent(location)}`;
    });
  }

  // === Data ticker animation on scroll once ===
  const soldElem = document.getElementById('properties-sold');
  const avgPriceElem = document.getElementById('average-price');
  const totalValueElem = document.getElementById('total-value');

  function animateValue(el, start, end, duration, prefix = "", suffix = "") {
    let startTime = null;
    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const value = Math.floor(progress * (end - start) + start);
      el.textContent = `${prefix}${value.toLocaleString()}${suffix}`;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Millions (M suffix)
function animateValueMillions(el, start, end, duration, prefix = "", suffix = "M") {
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const value = (progress * (end - start) + start) / 1_000_000;
    el.textContent = `${prefix}${value.toFixed(1)}${suffix}`;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

function animateValueThousands(el, start, end, duration, prefix = "", suffix = "K") {
  let startTime = null;
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const value = (progress * (end - start) + start) / 1000; // convert to thousands
    el.textContent = `${prefix}${value.toFixed(1)}${suffix}`; // one decimal
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}


  let hasAnimated = false;
  const tickerSection = document.getElementById('data-ticker');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
  hasAnimated = true;
animateValue(soldElem, 0, 1250, 1500);                     // Normal count
animateValueThousands(avgPriceElem, 0, 450000, 2000, "$"); // Shows "$350.0K"
animateValueMillions(totalValueElem, 0, 43750000, 2500);   // Shows "43.8M"
  observer.disconnect();
}

    });
  }, { threshold: 0.3});

  observer.observe(tickerSection);
});

