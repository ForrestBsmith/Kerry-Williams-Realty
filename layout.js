document.addEventListener('DOMContentLoaded', () => {
  const headerTpl = `
    <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div class="container-fluid">
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="index.html">
          <img src="44realty.png" alt="44 Realty Group logo" class="brand-logo">
          <span>44 Realty Group</span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="mainNav">
          <ul class="navbar-nav gap-lg-3 text-center w-100 justify-content-center justify-content-lg-end">
            <li class="nav-item"><a class="nav-link" href="Buying.html">Listings</a></li>
            <li class="nav-item"><a class="nav-link" href="Agents.html">Agents</a></li>
            <li class="nav-item"><a class="nav-link" href="Selling.html">Sell</a></li>
            <li class="nav-item"><a class="nav-link" href="FAQ.html">FAQs</a></li>
          </ul>
        </div>
      </div>
    </nav>
  `;

  const footerTpl = `
    <div class="container">
      <div class="row">
        <div class="col-6 col-md-3 mb-3">
          <h5>Services</h5>
          <ul class="list-unstyled">
            <li><a href="Buying.html">Listing</a></li>
            <li><a href="Selling.html">Selling</a></li>
            <li><a href="FAQ.html">Financing</a></li>
            <li><a href="FAQ.html">FAQs</a></li>
          </ul>
        </div>
        <div class="col-6 col-md-3 mb-3">
          <h5>Properties</h5>
          <ul class="list-unstyled">
            <li><a href="Buying.html">Homes</a></li>
            <li><a href="Buying.html">Condos</a></li>
            <li><a href="Buying.html">Rentals</a></li>
            <li><a href="Buying.html">Commercial</a></li>
          </ul>
        </div>
        <div class="col-md-6">
          <h5>Stay in the loop</h5>
          <form class="row g-2">
            <div class="col-12 col-sm">
              <input type="email" class="form-control" placeholder="Email address">
            </div>
            <div class="col-12 col-sm-auto">
              <button class="btn btn-dark w-100" type="submit">Subscribe</button>
            </div>
          </form>
          <div class="mt-3 d-flex gap-3">
            <a href="#" class="text-muted"><i class="bi bi-instagram"></i></a>
            <a href="#" class="text-muted"><i class="bi bi-facebook"></i></a>
            <a href="#" class="text-muted"><i class="bi bi-twitter"></i></a>
          </div>
        </div>
      </div>
      <div class="d-flex flex-column flex-sm-row justify-content-between pt-3 border-top">
        <p class="mb-0">&copy; 2024 44 Realty Group. All rights reserved.</p>
        <a href="FAQ.html" class="text-muted">Privacy & Terms</a>
      </div>
    </div>
  `;

  const headerEl = document.querySelector('header.site-nav');
  if (headerEl) headerEl.innerHTML = headerTpl;

  const footerEl = document.querySelector('footer.site-footer');
  if (footerEl) footerEl.innerHTML = footerTpl;
});
