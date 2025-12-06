(() => {
  const getWebhookUrl = () => {
    const url = window.SheetSettings?.accountWebhookUrl || '';
    return typeof url === 'string' ? url.trim() : '';
  };

  const sendAccount = async (payload) => {
    const url = getWebhookUrl();
    if (!url) {
      console.warn('Sheet sync skipped: no webhook URL configured in sheet-config.js');
      return { ok: false, skipped: true };
    }
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        mode: 'cors',
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (err) {
        data = text;
      }

      if (!response.ok) {
        throw new Error((data && data.message) || 'Failed to sync with Google Sheets');
      }

      return { ok: true, data };
    } catch (error) {
      console.error('Sheet sync failed', error);
      return { ok: false, error };
    }
  };

  window.SheetSync = { sendAccount };
})();
