(() => {
  const DEFAULT_REMOTE_DATA_URL = 'https://script.google.com/macros/s/AKfycbz1y92nUxaYyW_Zngv-9iMu0eGbyTwXOmIPOQFH_ZhQx0k6RW4H1Vfx9xACMsJuxrMJ/exec';
  const DEFAULT_LOCAL_DATA_URL = 'properties-1.json';

  function normalizePayload(raw) {
    const data = Array.isArray(raw) ? raw[0] : raw;
    const normalizeImage = (value) => {
      const image = String(value || '').trim();
      return image.toLowerCase() === 'placeholder.jpg' ? 'commercial.jpg' : image;
    };
    const uniqueImages = (images) => Array.from(new Set(images.filter(Boolean)));
    const isLocalDemoImage = (image) => /^img\//i.test(String(image || '').trim());
    const isRemotePrimaryImage = (image) => /(?:drive\.google\.com|googleusercontent\.com|^https?:\/\/)/i.test(
      String(image || '').trim()
    );
    const normalizeGallery = (property = {}) => {
      const primary = normalizeImage(property.image) || 'commercial.jpg';
      const rawGallery = Array.isArray(property.images) ? property.images : [];
      const hasRemotePrimary = isRemotePrimaryImage(primary);
      const gallery = uniqueImages([primary, ...rawGallery.map(normalizeImage)])
        .filter((image) => {
          if (!image) return false;
          if (image.toLowerCase() === 'placeholder.jpg') return false;
          if (hasRemotePrimary && isLocalDemoImage(image) && image !== primary) return false;
          return true;
        });

      return gallery.length ? gallery : [primary];
    };
    const properties = Array.isArray(data?.properties)
      ? data.properties.map((property) => ({
          ...property,
          image: normalizeImage(property.image),
          images: normalizeGallery(property)
        }))
      : [];

    return {
      properties,
      agents: Array.isArray(data?.agents) ? data.agents : []
    };
  }

  function shouldPreferLocalData() {
    const host = window.location.hostname;
    return (
      window.location.protocol === 'file:' ||
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host === '' ||
      host.endsWith('github.io')
    );
  }

  function preferLocalDataForStaticHosting() {
    if (!shouldPreferLocalData()) return;
    window.DATA_URL = window.LOCAL_DATA_URL || DEFAULT_LOCAL_DATA_URL;

    if (/\/(?:agent|property)\.html$/i.test(window.location.pathname)) {
      try {
        sessionStorage.removeItem('kw-data-v1');
        sessionStorage.removeItem('kw-data-v2');
        sessionStorage.removeItem('kw-data-v3');
      } catch {
        // Ignore storage restrictions.
      }
    }
  }

  function buildRequestUrl(sourceUrl) {
    const url = new URL(sourceUrl, window.location.href);
    url.searchParams.set('ts', Date.now());
    if (url.origin !== window.location.origin) {
      url.searchParams.set('origin', window.location.origin);
    }
    return url.toString();
  }

  async function fetchPayload(sourceUrl) {
    const response = await fetch(buildRequestUrl(sourceUrl), { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Failed to load ${sourceUrl}: ${response.status}`);
    }
    return normalizePayload(await response.json());
  }

  async function load(options = {}) {
    const localUrl = options.localUrl || window.LOCAL_DATA_URL || DEFAULT_LOCAL_DATA_URL;
    const remoteUrl = options.remoteUrl || window.DATA_URL || DEFAULT_REMOTE_DATA_URL;
    const sources = shouldPreferLocalData()
      ? [localUrl, remoteUrl]
      : [remoteUrl, localUrl];
    const uniqueSources = sources.filter((url, index) => url && sources.indexOf(url) === index);
    let lastError = null;

    for (const source of uniqueSources) {
      try {
        return await fetchPayload(source);
      } catch (error) {
        lastError = error;
        console.warn(`Data source unavailable: ${source}`, error);
      }
    }

    throw lastError || new Error('No listing data source is configured.');
  }

  window.KWData = {
    load,
    normalizePayload
  };

  preferLocalDataForStaticHosting();
})();
