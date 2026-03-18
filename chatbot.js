(() => {
  const CHAT_API_URL = window.CHAT_API_URL || 'http://localhost:8000/api/chat';
  const LEAD_API_URL = window.LEAD_API_URL || 'http://localhost:8000/api/lead';

  const widget = document.createElement('div');
  widget.id = 'chatbot-widget';
  widget.innerHTML = `
    <button class="chatbot-toggle" type="button" aria-expanded="false">Chat with us</button>
    <div class="chatbot-panel" aria-hidden="true">
      <div class="chatbot-header">
        <div>
          <strong>44 Realty Assistant</strong>
          <span class="chatbot-status">Online</span>
        </div>
        <button class="chatbot-close" type="button" aria-label="Close chat">×</button>
      </div>
      <div class="chatbot-messages" role="log" aria-live="polite"></div>
      <div class="chatbot-properties"></div>
      <form class="chatbot-input" autocomplete="off">
        <input type="text" name="message" placeholder="Ask about homes, prices, neighborhoods..." required>
        <button type="submit">Send</button>
      </form>
      <form class="chatbot-lead" autocomplete="off" hidden>
        <div class="lead-title">Connect with an agent</div>
        <input type="text" name="name" placeholder="Your name" required>
        <input type="email" name="email" placeholder="Email" required>
        <input type="tel" name="phone" placeholder="Phone" required>
        <input type="text" name="property" placeholder="Property address" required>
        <textarea name="notes" rows="2" placeholder="Notes (optional)"></textarea>
        <button type="submit">Send my info</button>
      </form>
    </div>
  `;
  document.body.appendChild(widget);

  const toggleBtn = widget.querySelector('.chatbot-toggle');
  const panel = widget.querySelector('.chatbot-panel');
  const closeBtn = widget.querySelector('.chatbot-close');
  const messagesEl = widget.querySelector('.chatbot-messages');
  const propertiesEl = widget.querySelector('.chatbot-properties');
  const inputForm = widget.querySelector('.chatbot-input');
  const leadForm = widget.querySelector('.chatbot-lead');

  const state = {
    messages: [
      { role: 'assistant', content: 'Hi! Tell me what kind of home you want, and I will pull matching listings.' },
    ],
    lastProperties: [],
  };

  const renderMessages = () => {
    messagesEl.innerHTML = '';
    state.messages.forEach((msg) => {
      const bubble = document.createElement('div');
      bubble.className = `chatbot-message ${msg.role}`;
      bubble.textContent = msg.content;
      messagesEl.appendChild(bubble);
    });
    messagesEl.scrollTop = messagesEl.scrollHeight;
  };

  const renderProperties = () => {
    propertiesEl.innerHTML = '';
    if (!state.lastProperties.length) return;
    const title = document.createElement('div');
    title.className = 'chatbot-properties-title';
    title.textContent = 'Top matches';
    propertiesEl.appendChild(title);

    state.lastProperties.forEach((property) => {
      const card = document.createElement('div');
      card.className = 'chatbot-property';
      const price = property.price ? `$${Number(property.price).toLocaleString()}` : 'Price on request';
      const beds = property.bedrooms ? `${property.bedrooms} bd` : '';
      const baths = property.bathrooms ? `${property.bathrooms} ba` : '';
      card.innerHTML = `
        <div class="chatbot-property-main">
          <div class="chatbot-property-address">${property.address || 'Listing'}</div>
          <div class="chatbot-property-meta">${[price, beds, baths, property.city].filter(Boolean).join(' • ')}</div>
        </div>
        <button type="button" class="chatbot-property-cta">I'm interested</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        leadForm.hidden = false;
        leadForm.property.value = property.address || '';
        leadForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      propertiesEl.appendChild(card);
    });
  };

  const setPanelOpen = (open) => {
    panel.setAttribute('aria-hidden', String(!open));
    toggleBtn.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('open', open);
  };

  toggleBtn.addEventListener('click', () => {
    setPanelOpen(true);
    renderMessages();
    renderProperties();
  });

  closeBtn.addEventListener('click', () => setPanelOpen(false));

  inputForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const input = inputForm.message.value.trim();
    if (!input) return;

    state.messages.push({ role: 'user', content: input });
    renderMessages();
    inputForm.reset();

    try {
      const response = await fetch(CHAT_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: state.messages }),
      });
      if (!response.ok) throw new Error('Chat request failed');
      const data = await response.json();
      state.messages.push({ role: 'assistant', content: data.reply || 'Thanks! How else can I help?' });
      state.lastProperties = Array.isArray(data.properties) ? data.properties : [];
      renderMessages();
      renderProperties();
    } catch (err) {
      state.messages.push({ role: 'assistant', content: 'Sorry, I had trouble reaching the server. Please try again in a moment.' });
      renderMessages();
    }
  });

  leadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = {
      name: leadForm.name.value.trim(),
      email: leadForm.email.value.trim(),
      phone: leadForm.phone.value.trim(),
      property_inquired: leadForm.property.value.trim(),
      notes: leadForm.notes.value.trim(),
    };

    if (!payload.name || !payload.email || !payload.phone || !payload.property_inquired) {
      return;
    }

    try {
      const response = await fetch(LEAD_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Lead capture failed');
      leadForm.reset();
      leadForm.hidden = true;
      state.messages.push({ role: 'assistant', content: 'Thank you! An agent will follow up shortly.' });
      renderMessages();
    } catch (err) {
      state.messages.push({ role: 'assistant', content: 'Sorry, I could not send that. Please try again or email us directly.' });
      renderMessages();
    }
  });

  renderMessages();
})();
