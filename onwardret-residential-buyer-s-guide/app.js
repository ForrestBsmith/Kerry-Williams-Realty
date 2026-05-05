import { books, getBookKeys } from "./data/books.js";

const state = {
  bookKey: "",
  spreadIndex: 0
};

const bookSelect = document.getElementById("bookSelect");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const stageNode = document.querySelector(".stage");
const bookShell = document.querySelector(".book-shell");
const bookNode = document.getElementById("book");
const pagesMount = document.getElementById("flipbookPages");
const pageMeta = document.getElementById("pageMeta");
const brandName = document.getElementById("brandName");
const logoMark = document.getElementById("logoMark");
const bookTitle = document.getElementById("bookTitle");
const topbarNode = document.querySelector(".topbar");
const metaNode = document.querySelector(".meta");
const mainNode = document.querySelector("main");
const utilityDock = document.getElementById("utilityDock");
const toolsToggleBtn = document.getElementById("toolsToggleBtn");
const singlePageToggle = document.getElementById("singlePageToggle");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomResetBtn = document.getElementById("zoomResetBtn");
const zoomValue = document.getElementById("zoomValue");
const viewAllBtn = document.getElementById("viewAllBtn");
const pageOverviewModal = document.getElementById("pageOverviewModal");
const closeOverviewBtn = document.getElementById("closeOverviewBtn");
const overviewGrid = document.getElementById("overviewGrid");
const utilityControls = document.getElementById("utilityControls");

let pageFlip = null;
let hasLoadedPages = false;
let isFlipInProgress = false;
let shellOffsetMode = "none";
let singlePageMode = false;
let zoomFactor = 1;
const pdfDocCache = new Map();
const pdfRenderTaskCache = new Map();
let pdfJsLibPromise = null;
let pdfRenderDebounce = null;
const ZOOM_MIN = 0.7;
const ZOOM_MAX = 1.4;
const ZOOM_SCROLL_THRESHOLD = 1.2;
let zoomScrollMode = false;

function enforceMobileUtilityDock() {
  if (!utilityDock || !toolsToggleBtn) return;
  if (window.innerWidth <= 900) {
    utilityDock.classList.remove("is-collapsed");
    toolsToggleBtn.setAttribute("aria-expanded", "true");
    toolsToggleBtn.innerHTML = "&#9660; Tools";
    if (utilityControls) {
      utilityControls.style.display = "flex";
      utilityControls.style.opacity = "1";
      utilityControls.style.pointerEvents = "auto";
      utilityControls.style.maxHeight = "none";
      utilityControls.style.transform = "none";
    }
  } else if (utilityControls) {
    utilityControls.style.display = "";
    utilityControls.style.opacity = "";
    utilityControls.style.pointerEvents = "";
    utilityControls.style.maxHeight = "";
    utilityControls.style.transform = "";
  }
}

function applyBookShellOffset() {
  if (!bookShell) return;

  if (shellOffsetMode === "front") {
    const offset = Math.round((bookShell.offsetWidth || 0) / 4);
    bookShell.style.transform = `translateX(-${offset}px)`;
    return;
  }

  bookShell.style.transform = "none";
}

function prepareEdgeLayoutForTurn(direction) {
  if (!pageFlip || !bookNode) return;
  if (singlePageMode) return;

  shellOffsetMode = "none";
  applyBookShellOffset();

  const collection =
    typeof pageFlip.getPageCollection === "function" ? pageFlip.getPageCollection() : null;
  const spreads =
    collection && typeof collection.getSpread === "function" ? collection.getSpread() : null;
  const currentSpreadIndex =
    collection && typeof collection.getCurrentSpreadIndex === "function"
      ? collection.getCurrentSpreadIndex()
      : 0;

  if (!Array.isArray(spreads) || !spreads.length) return;

  const targetSpreadIndex =
    direction === "next"
      ? Math.min(spreads.length - 1, currentSpreadIndex + 1)
      : Math.max(0, currentSpreadIndex - 1);
  const targetSpread = spreads[targetSpreadIndex];
  if (!Array.isArray(targetSpread) || !targetSpread.length) return;

  const currentSpread = spreads[currentSpreadIndex];
  const targetIsSingle = targetSpread.length === 1;
  const targetIsBackEdge = targetSpreadIndex === spreads.length - 1;
  const currentIsBackEdge = currentSpreadIndex === spreads.length - 1;
  const currentIsFrontEdge = currentSpreadIndex === 0 && Array.isArray(currentSpread) && currentSpread.length === 1;

  const prevEdgeSingle = bookNode.classList.contains("edge-single");
  const prevEdgeEnd = bookNode.classList.contains("edge-single-end");

  // Force spread mode before flip so each edge behaves as intended:
  // - Cover -> inside: remove single-page mode so it turns like a normal page.
  // - Inside -> back cover: add back single-page mode so it closes like a book.
  // - Back cover -> inside: remove back single-page mode before opening.
  if (direction === "next" && currentIsFrontEdge) {
    bookNode.classList.remove("edge-single", "edge-single-end");
  } else if (direction === "next" && targetIsSingle && targetIsBackEdge) {
    bookNode.classList.add("edge-single", "edge-single-end");
  } else if (direction === "prev" && currentIsBackEdge) {
    bookNode.classList.remove("edge-single", "edge-single-end");
  } else {
    return;
  }

  if (
    prevEdgeSingle !== bookNode.classList.contains("edge-single") ||
    prevEdgeEnd !== bookNode.classList.contains("edge-single-end")
  ) {
    syncBookScale();
  }
}

function syncBookScale() {
  if (!stageNode || !bookShell || !bookNode) return;

  const bookWidth = bookNode.offsetWidth || 1280;
  const bookHeight = bookNode.offsetHeight || 860;
  const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1280;
  const stageStyles = window.getComputedStyle(stageNode);
  const stagePadLeft = parseFloat(stageStyles.paddingLeft || "0");
  const stagePadRight = parseFloat(stageStyles.paddingRight || "0");
  const horizontalReserve = viewportWidth <= 900 ? 2 : viewportWidth <= 1200 ? 6 : 10;
  const availableWidth = Math.max(220, stageNode.clientWidth - stagePadLeft - stagePadRight - horizontalReserve);

  const topbarHeight = topbarNode ? topbarNode.offsetHeight : 0;
  const metaHeight = metaNode ? metaNode.offsetHeight : 0;
  const mainStyles = mainNode ? window.getComputedStyle(mainNode) : null;
  const mainPadTop = mainStyles ? parseFloat(mainStyles.paddingTop || "0") : 0;
  const mainPadBottom = mainStyles ? parseFloat(mainStyles.paddingBottom || "0") : 0;
  const stageMarginTop = parseFloat(stageStyles.marginTop || "0");
  const stageMarginBottom = parseFloat(stageStyles.marginBottom || "0");
  const verticalReserve = viewportWidth <= 900 ? 18 : viewportWidth <= 1200 ? 24 : 34;
  const availableHeight = Math.max(
    120,
    window.innerHeight
      - topbarHeight
      - metaHeight
      - mainPadTop
      - mainPadBottom
      - stageMarginTop
      - stageMarginBottom
      - verticalReserve
  );

  const rawScale = Math.min(availableWidth / bookWidth, availableHeight / bookHeight, 1);
  const safeScale = Math.max(0.3, rawScale);
  const dpr = window.devicePixelRatio || 1;
  const snapStep = 1 / (dpr * 8);
  const fitScale = Math.max(0.3, Math.floor(safeScale / snapStep) * snapStep);
  const scale = fitScale * zoomFactor;

  const scaledWidth = Math.floor(bookWidth * scale);
  const scaledHeight = Math.floor(bookHeight * scale);
  const shouldEnableZoomScroll = zoomFactor > ZOOM_SCROLL_THRESHOLD;
  const isMobileViewport = (window.innerWidth || 0) <= 900;

  bookShell.style.width = `${scaledWidth}px`;
  bookShell.style.height = `${scaledHeight}px`;
  stageNode.style.height = shouldEnableZoomScroll ? `${Math.floor(availableHeight)}px` : "auto";
  bookNode.style.transformOrigin = "top left";
  bookNode.style.transform = `translateZ(0) scale(${scale})`;
  applyBookShellOffset();

  stageNode.classList.toggle("zoom-scroll-mode", shouldEnableZoomScroll);
  stageNode.classList.toggle("zoom-scroll-mobile", shouldEnableZoomScroll && isMobileViewport);
  if (shouldEnableZoomScroll && !zoomScrollMode) {
    window.setTimeout(() => {
      stageNode.scrollTop = 0;
      stageNode.scrollLeft = isMobileViewport
        ? 0
        : Math.max(0, Math.floor((scaledWidth - stageNode.clientWidth) / 2));
    }, 0);
  }
  if (!shouldEnableZoomScroll && zoomScrollMode) {
    stageNode.scrollTop = 0;
    stageNode.scrollLeft = 0;
  }
  zoomScrollMode = shouldEnableZoomScroll;
}

function setSinglePageMode(enabled) {
  singlePageMode = Boolean(enabled);
  if (bookNode) {
    bookNode.classList.toggle("single-page-mode", singlePageMode);
    if (singlePageMode) {
      bookNode.classList.remove("edge-single", "edge-single-end");
    }
  }
  if (singlePageMode) {
    shellOffsetMode = "none";
    applyBookShellOffset();
  }
  if (singlePageToggle) {
    singlePageToggle.setAttribute("aria-pressed", singlePageMode ? "true" : "false");
  }
  if (pageFlip && typeof pageFlip.update === "function") {
    pageFlip.update();
    const current = pageFlip.getCurrentPageIndex();
    pageFlip.turnToPage(current);
  }
  window.setTimeout(() => {
    syncBookScale();
    syncMetaAndButtons();
  }, 0);
}

function updateZoomUi() {
  if (zoomValue) {
    zoomValue.textContent = `${Math.round(zoomFactor * 100)}%`;
  }
  if (zoomOutBtn) zoomOutBtn.disabled = zoomFactor <= ZOOM_MIN + 0.001;
  if (zoomInBtn) zoomInBtn.disabled = zoomFactor >= ZOOM_MAX - 0.001;
}

function setZoom(nextZoom) {
  zoomFactor = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, Number(nextZoom) || 1));
  updateZoomUi();
  syncBookScale();
}

async function getPdfJs() {
  let pdfjs = window.pdfjsLib;
  if (!pdfjs) {
    if (!pdfJsLibPromise) {
      pdfJsLibPromise = import("https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.min.mjs")
        .then((mod) => mod.default || mod)
        .catch(() => null);
    }
    pdfjs = await pdfJsLibPromise;
  }
  if (!pdfjs) return null;
  if (pdfjs.GlobalWorkerOptions) {
    pdfjs.GlobalWorkerOptions.workerSrc =
      "https://cdn.jsdelivr.net/npm/pdfjs-dist@4.8.69/build/pdf.worker.min.mjs";
  }
  return pdfjs;
}

async function loadPdfDocument(src) {
  if (!src) return null;
  if (pdfDocCache.has(src)) {
    return pdfDocCache.get(src);
  }
  const pdfjs = await getPdfJs();
  if (!pdfjs) return null;
  const task = pdfjs.getDocument(src);
  const doc = await task.promise;
  pdfDocCache.set(src, doc);
  return doc;
}

async function renderPdfCanvas(canvas, src, pageNumber) {
  if (!canvas || !src || !pageNumber) return;

  const mount = canvas.parentElement || canvas;
  const targetWidth = Math.max(1, mount.clientWidth || 640);
  const targetHeight = Math.max(1, mount.clientHeight || 860);
  const loadingHost = mount instanceof HTMLElement ? mount : canvas;
  const loadingNode =
    loadingHost instanceof HTMLElement
      ? loadingHost.querySelector(".pdf-loading-placeholder, .overview-loading-placeholder")
      : null;
  let loadingShown = false;
  let loadingTimer = null;

  try {
    const doc = await loadPdfDocument(src);
    if (!doc) return;
    const page = await doc.getPage(pageNumber);
    const rawViewport = page.getViewport({ scale: 1 });
    const isThumb = canvas.classList.contains("overview-pdf-thumb");
    const deviceDpr = window.devicePixelRatio || 1;
    const dpr = isThumb ? Math.min(deviceDpr, 1) : Math.min(deviceDpr, 1.5);
    const roundedW = Math.max(64, Math.round(targetWidth / 32) * 32);
    const roundedH = Math.max(64, Math.round(targetHeight / 32) * 32);
    const cacheKey = `${src}|${pageNumber}|${isThumb ? "thumb" : "page"}|${roundedW}x${roundedH}|${dpr.toFixed(2)}`;

    if (canvas.dataset.renderKey === cacheKey) return;
    canvas.dataset.renderKey = cacheKey;
    loadingTimer = window.setTimeout(() => {
      loadingShown = true;
      if (loadingHost instanceof HTMLElement) {
        loadingHost.classList.add("is-loading");
      }
    }, 150);

    if (!pdfRenderTaskCache.has(cacheKey)) {
      const fitScale = isThumb
        ? Math.min(roundedW / rawViewport.width, roundedH / rawViewport.height)
        : Math.max(roundedW / rawViewport.width, roundedH / rawViewport.height);
      const renderScale = Math.max(0.1, fitScale) * dpr;
      const viewport = page.getViewport({ scale: renderScale });

      const task = (async () => {
        const surface = document.createElement("canvas");
        surface.width = Math.floor(viewport.width);
        surface.height = Math.floor(viewport.height);
        const sctx = surface.getContext("2d", { alpha: false });
        if (!sctx) return null;
        await page.render({ canvasContext: sctx, viewport }).promise;
        return surface;
      })();

      pdfRenderTaskCache.set(cacheKey, task);
    }

    const renderedSurface = await pdfRenderTaskCache.get(cacheKey);
    if (!renderedSurface) return;
    // Ignore stale async paint if a newer render request was queued for this node.
    if (canvas.dataset.renderKey !== cacheKey) return;

    canvas.width = renderedSurface.width;
    canvas.height = renderedSurface.height;
    canvas.style.width = `${Math.floor(renderedSurface.width / dpr)}px`;
    canvas.style.height = `${Math.floor(renderedSurface.height / dpr)}px`;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(renderedSurface, 0, 0);
  } catch (error) {
    canvas.replaceWith(document.createTextNode("PDF page failed to load."));
  } finally {
    if (loadingTimer) {
      window.clearTimeout(loadingTimer);
    }
    if (loadingShown && loadingHost instanceof HTMLElement) {
      loadingHost.classList.remove("is-loading");
    }
    if (loadingNode instanceof HTMLElement) {
      loadingNode.setAttribute("aria-hidden", "true");
    }
  }
}

function renderAllPdfPages() {
  const canvases = document.querySelectorAll(".pdf-page-canvas[data-pdf-src][data-pdf-page]");
  canvases.forEach((canvas) => {
    const src = canvas.dataset.pdfSrc || "";
    const pageNumber = Number(canvas.dataset.pdfPage || "0");
    if (!src || !pageNumber) return;
    renderPdfCanvas(canvas, src, pageNumber);
  });
}

function getPrioritizedPdfCanvases() {
  const all = Array.from(
    document.querySelectorAll(".pdf-page-canvas[data-pdf-src][data-pdf-page]")
  );
  if (!all.length) return { urgent: [], deferred: [] };

  const byPage = new Map();
  all.forEach((canvas) => {
    const n = Number(canvas.dataset.pdfPage || "0");
    if (n > 0) byPage.set(n, canvas);
  });

  const total = byPage.size;
  const currentPage = (pageFlip ? pageFlip.getCurrentPageIndex() : 0) + 1;
  const nearby = [currentPage, currentPage + 1, currentPage - 1, currentPage + 2, currentPage - 2]
    .filter((n) => n >= 1 && n <= total);

  const urgent = [];
  nearby.forEach((n) => {
    const canvas = byPage.get(n);
    if (canvas) urgent.push(canvas);
  });

  const urgentSet = new Set(urgent);
  const deferred = all.filter((canvas) => !urgentSet.has(canvas));
  return { urgent, deferred };
}

function renderPdfPagesPrioritized(includeDeferred = false) {
  const { urgent, deferred } = getPrioritizedPdfCanvases();

  urgent.forEach((canvas) => {
    const src = canvas.dataset.pdfSrc || "";
    const pageNumber = Number(canvas.dataset.pdfPage || "0");
    if (!src || !pageNumber) return;
    renderPdfCanvas(canvas, src, pageNumber);
  });

  if (includeDeferred && deferred.length) {
    window.setTimeout(() => {
      deferred.forEach((canvas) => {
        const src = canvas.dataset.pdfSrc || "";
        const pageNumber = Number(canvas.dataset.pdfPage || "0");
        if (!src || !pageNumber) return;
        renderPdfCanvas(canvas, src, pageNumber);
      });
    }, 260);
  }
}

function prewarmPdfPages() {
  const book = books[state.bookKey];
  if (!book || !book.pdfSource) return;
  // Warm only the PDF document parse cache without competing canvas renders.
  window.setTimeout(() => {
    loadPdfDocument(book.pdfSource).catch(() => {});
  }, 20);
}

function runFlip(direction) {
  if (!pageFlip || isFlipInProgress) return;

  const before = typeof pageFlip.getCurrentPageIndex === "function"
    ? pageFlip.getCurrentPageIndex()
    : 0;
  const total = typeof pageFlip.getPageCount === "function" ? pageFlip.getPageCount() : 0;

  if (direction === "next") {
    prepareEdgeLayoutForTurn("next");
    pageFlip.flipNext("top");
  } else {
    prepareEdgeLayoutForTurn("prev");
    pageFlip.flipPrev("top");
  }

  // Single-page mode can occasionally no-op on flipPrev/flipNext.
  // If that happens, apply a direct page turn fallback for this interaction.
  window.setTimeout(() => {
    if (!singlePageMode || !pageFlip || isFlipInProgress) return;
    if (typeof pageFlip.getCurrentPageIndex !== "function") return;

    const after = pageFlip.getCurrentPageIndex();
    if (after !== before) return;

    if (direction === "next" && before < total - 1) {
      pageFlip.turnToPage(before + 1);
    } else if (direction === "prev" && before > 0) {
      pageFlip.turnToPage(before - 1);
    }
    syncMetaAndButtons();
  }, 720);
}

function getFlatPageEntries(book) {
  const entries = [];
  book.spreads.forEach((spread, index) => {
    const leftNum = index * 2 + 1;
    const rightNum = leftNum + 1;
    entries.push({ page: leftNum, title: spread.left?.title || spread.left?.layout || `Page ${leftNum}` });
    entries.push({ page: rightNum, title: spread.right?.title || spread.right?.layout || `Page ${rightNum}` });
  });
  return entries;
}

function buildOverviewGrid() {
  if (!overviewGrid) return;
  overviewGrid.innerHTML = "";
  const book = books[state.bookKey];
  const totalPages = book.spreads.length * 2;
  const isPdfBook = Boolean(book.pdfSource);
  const pages = isPdfBook ? [] : buildFlatPages(book);

  Array.from({ length: totalPages }).forEach((_, index) => {
    const pageNumber = index + 1;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "overview-page-btn";
    btn.title = `Page ${pageNumber}`;
    btn.setAttribute("aria-label", `Open page ${pageNumber}`);

    const previewFrame = document.createElement("div");
    previewFrame.className = "overview-page-frame";

    if (isPdfBook) {
      const placeholder = document.createElement("div");
      placeholder.className = "overview-loading-placeholder";
      placeholder.textContent = "Loading page...";
      previewFrame.appendChild(placeholder);

      const thumbCanvas = document.createElement("canvas");
      thumbCanvas.className = "overview-pdf-thumb";
      thumbCanvas.dataset.pdfSrc = book.pdfSource || "";
      thumbCanvas.dataset.pdfPage = String(pageNumber);
      previewFrame.appendChild(thumbCanvas);
    } else {
      const pageNode = pages[index];
      if (pageNode) {
        const previewPage = pageNode.cloneNode(true);
        previewPage.classList.add("overview-page-snapshot");
        previewPage.removeAttribute("id");
        previewFrame.appendChild(previewPage);
      }
    }

    btn.appendChild(previewFrame);
    btn.addEventListener("click", () => {
      if (pageFlip) {
        pageFlip.turnToPage(pageNumber - 1);
        syncMetaAndButtons();
      }
      if (pageOverviewModal) {
        pageOverviewModal.setAttribute("aria-hidden", "true");
      }
    });
    overviewGrid.appendChild(btn);
  });
}

function renderOverviewPdfThumbnails() {
  const thumbs = document.querySelectorAll(".overview-pdf-thumb[data-pdf-src][data-pdf-page]");
  thumbs.forEach((thumb) => {
    const src = thumb.dataset.pdfSrc || "";
    const pageNumber = Number(thumb.dataset.pdfPage || "0");
    if (!src || !pageNumber) return;
    renderPdfCanvas(thumb, src, pageNumber);
  });
}

function setEdgePagesSoft() {
  if (!pageFlip || typeof pageFlip.getPageCount !== "function" || typeof pageFlip.getPage !== "function") {
    return;
  }

  const pageCount = pageFlip.getPageCount();
  if (pageCount < 1) return;

  const frontPage = pageFlip.getPage(0);
  if (frontPage) {
    if (typeof frontPage.setDensity === "function") {
      frontPage.setDensity("soft");
    }
    if (typeof frontPage.setDrawingDensity === "function") {
      frontPage.setDrawingDensity("soft");
    }
  }

  const backIndex = pageCount - 1;
  const backPage = pageFlip.getPage(backIndex);
  if (backPage) {
    if (typeof backPage.setDensity === "function") {
      backPage.setDensity("hard");
    }
    if (typeof backPage.setDrawingDensity === "function") {
      backPage.setDrawingDensity("hard");
    }
  }
}

function resolveInitialBook() {
  const url = new URL(window.location.href);
  const fromQuery = url.searchParams.get("book");
  if (fromQuery && books[fromQuery]) {
    return fromQuery;
  }
  return getBookKeys()[0];
}

function setCssVariables(variables) {
  Object.entries(variables).forEach(([name, value]) => {
    document.documentElement.style.setProperty(name, value);
  });
}

function renderProcessTimeline(inner, pageData) {
  inner.classList.add("page-inner-process");

  const shell = document.createElement("div");
  shell.className = "process-shell";

  const media = document.createElement("div");
  media.className = "process-media";

  const mediaTop = document.createElement("div");
  mediaTop.className = "process-media-top";
  mediaTop.innerHTML = `<h2>${pageData.title || ""}</h2>`;
  media.appendChild(mediaTop);

  if (pageData.image) {
    const image = document.createElement("img");
    image.className = "process-media-image";
    image.src = pageData.image;
    image.alt = pageData.imageAlt || "Buyer guide cover image";
    image.loading = "lazy";
    media.appendChild(image);
  }

  const content = document.createElement("div");
  content.className = "process-content";

  const card = document.createElement("div");
  card.className = "timeline-card";
  if (pageData.centerBullets) {
    card.classList.add("timeline-card-center-bullets");
  }

  if (Array.isArray(pageData.steps)) {
    pageData.steps.forEach((step, idx) => {
      const stepBlock = document.createElement("section");
      stepBlock.className = "timeline-step";

      const tag = document.createElement("span");
      tag.className = "timeline-tag";
      tag.textContent = step.label || `Step ${idx + 1}`;
      stepBlock.appendChild(tag);

      const title = document.createElement("h3");
      title.textContent = step.title || "";
      stepBlock.appendChild(title);

      if (Array.isArray(step.items) && step.items.length) {
        const list = document.createElement("ul");
        step.items.forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          list.appendChild(li);
        });
        stepBlock.appendChild(list);
      }

      card.appendChild(stepBlock);
    });
  }

  content.appendChild(card);
  shell.appendChild(media);
  shell.appendChild(content);
  inner.appendChild(shell);
}

function renderDosDonts(inner, pageData) {
  inner.classList.add("page-inner-dos");

  const header = document.createElement("div");
  header.className = "dos-header";

  const headerTitle = document.createElement("h2");
  headerTitle.textContent = pageData.title || "";
  header.appendChild(headerTitle);

  if (pageData.body) {
    const headerText = document.createElement("p");
    headerText.textContent = pageData.body;
    header.appendChild(headerText);
  }
  inner.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "dos-grid";

  const dontColumn = document.createElement("section");
  dontColumn.className = "dos-column dont";
  dontColumn.innerHTML = `<h3>Make sure that you <span>DO NOT:</span></h3>`;
  const dontList = document.createElement("ul");
  (pageData.dontList || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    dontList.appendChild(li);
  });
  dontColumn.appendChild(dontList);

  const doColumn = document.createElement("section");
  doColumn.className = "dos-column do";
  doColumn.innerHTML = `<h3>Make sure that you <span>DO:</span></h3>`;
  const doList = document.createElement("ul");
  (pageData.doList || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    doList.appendChild(li);
  });
  doColumn.appendChild(doList);

  grid.appendChild(dontColumn);
  grid.appendChild(doColumn);
  inner.appendChild(grid);
}

function renderPromisePage(inner, pageData) {
  inner.classList.add("page-inner-promise");
  if (pageData.sizeMode) {
    inner.classList.add(`promise-size-${pageData.sizeMode}`);
  }

  const top = document.createElement("div");
  top.className = "promise-top";

  const title = document.createElement("h2");
  title.textContent = pageData.title || "Our Promise";
  top.appendChild(title);

  const bullets = document.createElement("ul");
  bullets.className = "promise-list";
  (pageData.items || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    bullets.appendChild(li);
  });
  top.appendChild(bullets);

  const sigRow = document.createElement("div");
  sigRow.className = "promise-signatures";
  (pageData.signatures || []).forEach((sig) => {
    const block = document.createElement("div");
    block.className = "promise-sig";
    block.innerHTML = `<strong>${sig.name || ""}</strong><span>${sig.role || ""}</span><em>${sig.signature || ""}</em>`;
    sigRow.appendChild(block);
  });
  inner.appendChild(top);
  if ((pageData.signatures || []).length) {
    inner.appendChild(sigRow);
  }

  if (pageData.image) {
    const image = document.createElement("img");
    image.className = "promise-photo";
    image.src = pageData.image;
    image.alt = pageData.imageAlt || "Team photo";
    image.loading = "lazy";
    inner.appendChild(image);
  }

  const team = document.createElement("div");
  team.className = "promise-team";
  team.innerHTML = `<h3>${pageData.teamTitle || "Onward Real Estate Team"}</h3>`;
  const teamList = document.createElement("ul");
  (pageData.teamItems || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    teamList.appendChild(li);
  });
  team.appendChild(teamList);
  inner.appendChild(team);
}

function renderIntroProfilePage(inner, pageData) {
  inner.classList.add("page-inner-intro");

  const media = document.createElement("div");
  media.className = "intro-media";
  if (pageData.image) {
    media.style.backgroundImage = `url("${pageData.image}")`;
  }
  inner.appendChild(media);

  const copy = document.createElement("div");
  copy.className = "intro-copy";
  copy.innerHTML = `<h2>${pageData.title || "Introduction"}</h2>`;

  if (pageData.body) {
    const body = document.createElement("p");
    body.textContent = pageData.body;
    copy.appendChild(body);
  }

  if (Array.isArray(pageData.bullets) && pageData.bullets.length) {
    const list = document.createElement("ul");
    pageData.bullets.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    copy.appendChild(list);
  }

  if (pageData.afterBullets) {
    const afterBullets = document.createElement("p");
    afterBullets.textContent = pageData.afterBullets;
    copy.appendChild(afterBullets);
  }

  if (Array.isArray(pageData.enclosed) && pageData.enclosed.length) {
    const enclosedTitle = document.createElement("h3");
    enclosedTitle.textContent = pageData.enclosedTitle || "Enclosed please find:";
    copy.appendChild(enclosedTitle);

    const enclosedList = document.createElement("ul");
    pageData.enclosed.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      enclosedList.appendChild(li);
    });
    copy.appendChild(enclosedList);
  }

  inner.appendChild(copy);
}

function renderPhotoCover(inner, pageData, book) {
  inner.classList.add("page-inner-cover");

  const top = document.createElement("div");
  top.className = "cover-photo";
  if (pageData.image) {
    top.style.backgroundImage = `url("${pageData.image}")`;
  }

  const marks = document.createElement("div");
  marks.className = "cover-marks";
  (pageData.markers || [book.branding.brandName]).forEach((mark) => {
    const chip = document.createElement("span");
    chip.textContent = mark;
    marks.appendChild(chip);
  });
  top.appendChild(marks);
  inner.appendChild(top);

  const panel = document.createElement("div");
  panel.className = "cover-panel";

  const brand = document.createElement("p");
  brand.className = "cover-brand";
  brand.textContent = pageData.brandLine || "Onward Real Estate Team";
  panel.appendChild(brand);

  const title = document.createElement("h2");
  title.textContent = pageData.title || "Your Guide to Purchasing a Home";
  panel.appendChild(title);

  if (pageData.metaLine) {
    const meta = document.createElement("p");
    meta.className = "cover-meta";
    meta.textContent = pageData.metaLine;
    panel.appendChild(meta);
  }

  inner.appendChild(panel);
}

function renderOfferQuestions(inner, pageData) {
  inner.classList.add("page-inner-offer");

  const topPhoto = document.createElement("div");
  topPhoto.className = "offer-top-photo";
  if (pageData.image) {
    topPhoto.style.backgroundImage = `url("${pageData.image}")`;
  }
  inner.appendChild(topPhoto);

  const content = document.createElement("div");
  content.className = "offer-columns";

  const leftCol = document.createElement("section");
  leftCol.className = "offer-col";
  leftCol.innerHTML = `<h2>${pageData.leftTitle || "What to Expect When Writing an Offer"}</h2>`;
  (pageData.leftSections || []).forEach((section) => {
    const h3 = document.createElement("h3");
    h3.textContent = section.title || "";
    leftCol.appendChild(h3);
    const list = document.createElement("ul");
    (section.items || []).forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
    leftCol.appendChild(list);
  });

  const rightCol = document.createElement("section");
  rightCol.className = "offer-col";
  rightCol.innerHTML = `<h2>${pageData.rightTitle || "Questions to Ask Your Realtor"}</h2>`;
  const rightList = document.createElement("ul");
  (pageData.rightItems || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    rightList.appendChild(li);
  });
  rightCol.appendChild(rightList);

  content.appendChild(leftCol);
  content.appendChild(rightCol);
  inner.appendChild(content);
}

function renderTestimonials(inner, pageData) {
  inner.classList.add("page-inner-testimonials");

  const header = document.createElement("div");
  header.className = "testimonials-header";
  header.innerHTML = `<h2>${pageData.title || "Client Testimonials"}</h2>`;
  inner.appendChild(header);

  const grid = document.createElement("div");
  grid.className = "testimonials-grid";

  (pageData.testimonials || []).forEach((t) => {
    const card = document.createElement("article");
    card.className = "testimonial-card";
    card.innerHTML = `<span class="testimonial-tag">${t.tag || "Testimonial"}</span><p>${t.text || ""}</p><strong>${t.author || ""}</strong>`;
    grid.appendChild(card);
  });

  inner.appendChild(grid);
}

function renderBackCover(inner, pageData, book) {
  inner.classList.add("page-inner-back-cover");

  const surface = document.createElement("div");
  surface.className = "back-cover-surface";

  const lockup = document.createElement("div");
  lockup.className = "back-cover-lockup";
  lockup.innerHTML = `<strong>${pageData.lockup || "Onward"}</strong><span>${pageData.lockupSub || "Real Estate Team"}</span>`;
  surface.appendChild(lockup);

  const meta = document.createElement("p");
  meta.className = "back-cover-meta";
  meta.textContent = pageData.metaLine || "254.870.9800  |  OnwardRETeam.com  |  3701 W Waco Dr, Waco, TX";
  surface.appendChild(meta);

  inner.appendChild(surface);
}

function renderPdfPage(inner, pageData, book) {
  inner.classList.add("page-inner-pdf");
  const wrap = document.createElement("div");
  wrap.className = "pdf-page-wrap";

  const placeholder = document.createElement("div");
  placeholder.className = "pdf-loading-placeholder";
  placeholder.textContent = "Loading page...";
  wrap.appendChild(placeholder);

  const canvas = document.createElement("canvas");
  canvas.className = "pdf-page-canvas";
  canvas.dataset.pdfSrc = pageData.pdfSource || book.pdfSource || "";
  canvas.dataset.pdfPage = String(pageData.pageNumber || 1);

  wrap.appendChild(canvas);
  inner.appendChild(wrap);
}

function createPage(position, pageData, pageNumber, totalPages, book) {
  const page = document.createElement("article");
  page.className = `page flip-page ${position}`;

  const inner = document.createElement("div");
  inner.className = "page-inner";

  if (pageData.layout === "processTimeline") {
    page.classList.add("page-layout-process");
    renderProcessTimeline(inner, pageData);
  } else if (pageData.layout === "dosDonts") {
    page.classList.add("page-layout-dos");
    renderDosDonts(inner, pageData);
  } else if (pageData.layout === "promisePage") {
    page.classList.add("page-layout-promise");
    renderPromisePage(inner, pageData);
  } else if (pageData.layout === "introProfile") {
    page.classList.add("page-layout-intro");
    renderIntroProfilePage(inner, pageData);
  } else if (pageData.layout === "photoCover") {
    page.classList.add("page-layout-cover");
    renderPhotoCover(inner, pageData, book);
  } else if (pageData.layout === "offerQuestions") {
    page.classList.add("page-layout-offer");
    renderOfferQuestions(inner, pageData);
  } else if (pageData.layout === "testimonialsGrid") {
    page.classList.add("page-layout-testimonials");
    renderTestimonials(inner, pageData);
  } else if (pageData.layout === "backCover") {
    page.classList.add("page-layout-back-cover");
    renderBackCover(inner, pageData, book);
  } else if (pageData.layout === "pdfPage") {
    page.classList.add("page-layout-pdf");
    renderPdfPage(inner, pageData, book);
  } else {
    if (pageData.ribbon) {
      const ribbon = document.createElement("p");
      ribbon.className = "ribbon";
      ribbon.textContent = pageData.ribbon;
      inner.appendChild(ribbon);
    }

    if (pageData.title) {
      const title = document.createElement("h2");
      title.textContent = pageData.title;
      inner.appendChild(title);
    }

    if (pageData.body) {
      const body = document.createElement("p");
      body.textContent = pageData.body;
      inner.appendChild(body);
    }

    if (Array.isArray(pageData.bullets) && pageData.bullets.length) {
      const bullets = document.createElement("ul");
      bullets.className = "bullets";

      pageData.bullets.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        bullets.appendChild(li);
      });

      inner.appendChild(bullets);
    }

    if (pageData.image) {
      const image = document.createElement("img");
      image.className = "hero-img";
      image.src = pageData.image;
      image.alt = pageData.imageAlt || `${book.branding.title} image`;
      image.loading = "lazy";
      inner.appendChild(image);
    }
  }

  if (pageData.layout !== "backCover" && pageData.layout !== "pdfPage") {
    const footer = document.createElement("div");
    footer.className = "footer-mark";
    footer.innerHTML = `<span>${book.branding.brandName}</span><span>Page ${pageNumber} / ${totalPages}</span>`;
    inner.appendChild(footer);
  }

  page.appendChild(inner);
  return page;
}

function buildFlatPages(book) {
  const pages = [];
  const totalPages = book.spreads.length * 2;

  book.spreads.forEach((spread, spreadIndex) => {
    const leftPageNum = spreadIndex * 2 + 1;
    const rightPageNum = leftPageNum + 1;

    pages.push(createPage("left", spread.left || {}, leftPageNum, totalPages, book));
    pages.push(createPage("right", spread.right || {}, rightPageNum, totalPages, book));
  });

  if (pages.length) {
    pages[0].dataset.density = "hard";
    pages[pages.length - 1].dataset.density = "hard";
  }

  return pages;
}

function syncHeader() {
  const book = books[state.bookKey];
  brandName.textContent = book.branding.brandName;
  logoMark.textContent = book.branding.logoText;
  bookTitle.textContent = book.branding.title;
  setCssVariables(book.branding.cssVars);
}

function syncMetaAndButtons() {
  const spreadTotal = books[state.bookKey].spreads.length;
  const totalPages = spreadTotal * 2;
  const currentPageIndex = pageFlip ? pageFlip.getCurrentPageIndex() : 0;

  const lastPage = pageFlip ? pageFlip.getPageCount() - 1 : spreadTotal * 2 - 1;
  const safeIndex = Math.max(0, Math.min(currentPageIndex, lastPage));
  const collection = pageFlip && typeof pageFlip.getPageCollection === "function"
    ? pageFlip.getPageCollection()
    : null;
  const spreads = collection && typeof collection.getSpread === "function"
    ? collection.getSpread()
    : null;
  const spreadCount = Array.isArray(spreads) && spreads.length ? spreads.length : spreadTotal;
  const spreadIndex = collection && typeof collection.getCurrentSpreadIndex === "function"
    ? Math.max(0, Math.min(collection.getCurrentSpreadIndex(), spreadCount - 1))
    : Math.floor(safeIndex / 2);
  const currentSpread = Array.isArray(spreads) && spreads[spreadIndex] ? spreads[spreadIndex] : null;
  const isSingleSpread = Array.isArray(currentSpread) && currentSpread.length === 1;
  const isBackEdge = isSingleSpread && spreadIndex >= spreadCount - 1;
  const isFrontEdge = isSingleSpread && spreadIndex <= 0;

  // In single-page mode, rely on concrete page bounds (engine canFlip* can misreport).
  const canPrev = singlePageMode
    ? safeIndex > 0
    : (
      pageFlip && typeof pageFlip.canFlipPrev === "function"
        ? pageFlip.canFlipPrev()
        : spreadIndex > 0
    );
  const canNext = singlePageMode
    ? safeIndex < lastPage
    : (
      pageFlip && typeof pageFlip.canFlipNext === "function"
        ? pageFlip.canFlipNext()
        : spreadIndex < spreadCount - 1
    );
  prevBtn.disabled = !canPrev;
  nextBtn.disabled = !canNext;

  if (currentSpread) {
    const startPage = currentSpread[0] + 1;
    const endPage = (currentSpread[currentSpread.length - 1] || currentSpread[0]) + 1;
    pageMeta.textContent = startPage === endPage
      ? `Page ${startPage} of ${totalPages}`
      : `Pages ${startPage}-${endPage} of ${totalPages}`;
    state.spreadIndex = Math.min(spreadTotal - 1, Math.max(0, spreadIndex));
  } else if (isFrontEdge) {
    pageMeta.textContent = `Page 1 of ${totalPages}`;
    state.spreadIndex = 0;
  } else if (isBackEdge) {
    pageMeta.textContent = `Page ${totalPages} of ${totalPages}`;
    state.spreadIndex = spreadTotal - 1;
  } else {
    const leftPage = safeIndex + 1;
    const rightPage = Math.min(leftPage + 1, totalPages);
    pageMeta.textContent = `Pages ${leftPage}-${rightPage} of ${totalPages}`;
    state.spreadIndex = Math.floor((leftPage - 1) / 2);
  }

  const isEdgeSingle = !singlePageMode && isSingleSpread;
  const hadClass = bookNode.classList.contains("edge-single");

  bookNode.classList.toggle("edge-single", isEdgeSingle);
  bookNode.classList.toggle("edge-single-end", !singlePageMode && isBackEdge);

  if (hadClass !== isEdgeSingle) {
    // Avoid delayed post-flip snap by applying scale sync immediately.
    syncBookScale();
  }

  shellOffsetMode = !singlePageMode && isFrontEdge && !isFlipInProgress ? "front" : "none";
  applyBookShellOffset();
}

function loadPagesIntoFlipbook() {
  const book = books[state.bookKey];
  pagesMount.innerHTML = "";

  const pages = buildFlatPages(book);
  pages.forEach((page) => pagesMount.appendChild(page));

  if (!pageFlip) {
    if (!window.St || typeof window.St.PageFlip !== "function") {
      pageMeta.textContent = "Flip engine failed to load. Refresh and check internet access.";
      prevBtn.disabled = true;
      nextBtn.disabled = true;
      return;
    }

    pageFlip = new St.PageFlip(bookNode, {
      width: 640,
      height: 860,
      size: "fixed",
      minWidth: 320,
      maxWidth: 1420,
      minHeight: 420,
      maxHeight: 980,
      autoSize: false,
      showCover: true,
      drawShadow: true,
      maxShadowOpacity: 0.35,
      flippingTime: 650,
      swipeDistance: 24,
      showPageCorners: false,
      disableFlipByClick: true,
      useMouseEvents: false,
      usePortrait: true,
      mobileScrollSupport: false
    });

    pageFlip.on("flip", () => {
      // Intentionally no layout sync here; this event can fire during animation.
    });
    pageFlip.on("changeState", (event) => {
      const stateName = event && event.data ? String(event.data) : "";
      const isFlippingState =
        stateName === "flipping" || stateName === "user_fold" || stateName === "fold_corner";
      isFlipInProgress = isFlippingState;
      bookNode.classList.toggle("is-flipping", isFlippingState);
      if (!isFlippingState) {
        // Apply edge/single layout only after animation settles.
        syncMetaAndButtons();
        renderPdfPagesPrioritized(false);
      }
    });
    pageFlip.on("changeOrientation", () => {
      window.setTimeout(syncMetaAndButtons, 0);
    });
  }

  const htmlPages = pagesMount.querySelectorAll(".flip-page");

  if (!hasLoadedPages) {
    if (typeof pageFlip.loadFromHtml === "function") {
      pageFlip.loadFromHtml(htmlPages);
    } else {
      pageFlip.loadFromHTML(htmlPages);
    }
    hasLoadedPages = true;
  } else if (typeof pageFlip.updateFromHtml === "function") {
    pageFlip.updateFromHtml(htmlPages);
  } else {
    pageFlip.updateFromHTML(htmlPages);
  }

  setEdgePagesSoft();
  pageFlip.turnToPage(0);
  window.setTimeout(syncBookScale, 0);
  syncMetaAndButtons();
  window.setTimeout(() => renderPdfPagesPrioritized(false), 0);
  // Backfill non-visible pages later, after initial reading experience is ready.
  window.setTimeout(() => renderPdfPagesPrioritized(true), 2200);
}

function changeBook(newBookKey) {
  state.bookKey = newBookKey;
  state.spreadIndex = 0;

  syncHeader();
  loadPagesIntoFlipbook();
  buildOverviewGrid();
  prewarmPdfPages();

  const url = new URL(window.location.href);
  url.searchParams.set("book", newBookKey);
  window.history.replaceState({}, "", url);
}

function initSelect() {
  const keys = getBookKeys();
  keys.forEach((key) => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = books[key].label;
    bookSelect.appendChild(option);
  });
}

function initEvents() {
  nextBtn.addEventListener("click", () => {
    runFlip("next");
  });

  prevBtn.addEventListener("click", () => {
    runFlip("prev");
  });

  bookSelect.addEventListener("change", (event) => {
    changeBook(event.target.value);
  });

  if (singlePageToggle) {
    singlePageToggle.addEventListener("click", () => setSinglePageMode(!singlePageMode));
  }
  if (toolsToggleBtn && utilityDock) {
    toolsToggleBtn.addEventListener("click", () => {
      if (window.innerWidth <= 900) {
        utilityDock.classList.remove("is-collapsed");
        toolsToggleBtn.setAttribute("aria-expanded", "true");
        toolsToggleBtn.innerHTML = "&#9660; Tools";
        enforceMobileUtilityDock();
        return;
      }

      const nextCollapsed = !utilityDock.classList.contains("is-collapsed");
      utilityDock.classList.toggle("is-collapsed", nextCollapsed);
      toolsToggleBtn.setAttribute("aria-expanded", nextCollapsed ? "false" : "true");
      toolsToggleBtn.innerHTML = nextCollapsed ? "&#9650; Tools" : "&#9660; Tools";
    });
  }
  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => setZoom(zoomFactor + 0.1));
  }
  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => setZoom(zoomFactor - 0.1));
  }
  if (zoomResetBtn) {
    zoomResetBtn.addEventListener("click", () => setZoom(1));
  }
  if (viewAllBtn && pageOverviewModal) {
    viewAllBtn.addEventListener("click", () => {
      buildOverviewGrid();
      pageOverviewModal.setAttribute("aria-hidden", "false");
      window.setTimeout(renderOverviewPdfThumbnails, 0);
    });
  }
  if (closeOverviewBtn && pageOverviewModal) {
    closeOverviewBtn.addEventListener("click", () => pageOverviewModal.setAttribute("aria-hidden", "true"));
  }
  if (pageOverviewModal) {
    pageOverviewModal.addEventListener("click", (event) => {
      if (event.target === pageOverviewModal) {
        pageOverviewModal.setAttribute("aria-hidden", "true");
      }
    });
  }

  // Deterministic click-to-turn: left half -> prev, right half -> next.
  if (bookShell) {
    bookShell.addEventListener("click", (event) => {
      if (!pageFlip || isFlipInProgress) return;

      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName.toLowerCase();
        if (["a", "button", "select", "input", "textarea", "label"].includes(tag)) return;
      }

      const rect = bookShell.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const half = rect.width / 2;

      if (x >= half) {
        runFlip("next");
      } else {
        runFlip("prev");
      }
    });
  }

  window.addEventListener("keydown", (event) => {
    if (!pageFlip || isFlipInProgress) return;

    if (event.key === "ArrowRight") {
      runFlip("next");
    }

    if (event.key === "ArrowLeft") {
      runFlip("prev");
    }
  });

  window.addEventListener("resize", () => {
    syncBookScale();
    window.setTimeout(syncMetaAndButtons, 0);
    if (pdfRenderDebounce) {
      window.clearTimeout(pdfRenderDebounce);
    }
    pdfRenderDebounce = window.setTimeout(() => renderPdfPagesPrioritized(false), 140);
    enforceMobileUtilityDock();
  });
}

function init() {
  initSelect();
  state.bookKey = resolveInitialBook();
  bookSelect.value = state.bookKey;
  changeBook(state.bookKey);
  updateZoomUi();
  syncBookScale();
  initEvents();

  enforceMobileUtilityDock();
}

init();
