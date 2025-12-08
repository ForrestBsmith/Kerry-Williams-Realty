document.addEventListener('DOMContentLoaded', () => {
  const savedList = document.getElementById('saved-homes');
  const authStatus = document.getElementById('auth-status');
  const messageStatus = document.getElementById('message-status');
  const messageHistory = document.getElementById('message-history');
  const messageCount = document.getElementById('message-count');
  const propertySelect = document.getElementById('message-property');
  const authForm = document.getElementById('auth-form');
  const phoneInput = authForm ? authForm.querySelector('input[name="phone"]') : null;
  const interestsInput = authForm ? authForm.querySelector('input[name="interests"]') : null;
  const notesInput = authForm ? authForm.querySelector('[name="notes"]') : null;
  const messageForm = document.getElementById('message-form');
  const accountFormSection = document.getElementById('account-form-section');
  const accountProfileSection = document.getElementById('account-profile-section');
  const profileNameEl = document.getElementById('profile-name');
  const profileEmailEl = document.getElementById('profile-email');
  const profilePhoneEl = document.getElementById('profile-phone');
  const profileInitialsEl = document.getElementById('profile-initials');
  const profileFavoritePreview = document.getElementById('profile-favorite-preview');
  const profileInterestsRow = document.getElementById('profile-interests-row');
  const profileInterestsEl = document.getElementById('profile-interests');
  const profileNotesRow = document.getElementById('profile-notes-row');
  const profileNotesEl = document.getElementById('profile-notes');
  const statFavoritesEl = document.getElementById('stat-favorites');
  const statMessagesEl = document.getElementById('stat-messages');
  const editProfileBtn = document.getElementById('edit-profile');
  const logoutProfileBtn = document.getElementById('logout-profile');
  const modalCreateForm = document.getElementById('modal-create-form');
  const modalElement = document.getElementById('createAccountModal');

  const waitForSession = (timeoutMs = 5000, interval = 50) => new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      const session = window.UserSession;
      if (session?.login) {
        resolve(session);
        return;
      }
      if (Date.now() - start >= timeoutMs) {
        reject(new Error('UserSession not available'));
        return;
      }
      setTimeout(check, interval);
    };
    check();
  });

  const init = (session) => {
    let propertyIndex = {};
    const getCurrentUser = () => session?.getUser?.();

    const getSavedHomeAddresses = (user) => {
      const ids = user?.savedHomeIds || [];
      return ids.map((id) => propertyIndex[id]?.address || `Listing #${id}`).filter(Boolean);
    };

    const getMessageSubjects = (user) => {
      const msgs = user?.messages || [];
      return msgs.map((msg) => msg.subject || 'Message');
    };

    const updateProfileStats = () => {
      if (!accountProfileSection) return;
      const user = getCurrentUser();
      if (!user) return;
      if (statFavoritesEl) statFavoritesEl.textContent = user.savedHomeIds?.length || 0;
      if (statMessagesEl) statMessagesEl.textContent = user.messages?.length || 0;
      if (profileNameEl) profileNameEl.textContent = user.name || 'New member';
      if (profileEmailEl) profileEmailEl.textContent = user.email || '';
      if (profilePhoneEl) profilePhoneEl.textContent = user.phone ? `📞 ${user.phone}` : '';
      if (profileInterestsRow && profileInterestsEl) {
        if (user.interests) {
          profileInterestsRow.classList.remove('d-none');
          profileInterestsEl.textContent = user.interests;
        } else {
          profileInterestsRow.classList.add('d-none');
          profileInterestsEl.textContent = 'Tell us what you are planning.';
        }
      }
      const initials = (user.name || user.email || 'User')
        .split(' ')
        .map((part) => part.charAt(0))
        .join('')
        .slice(0, 2)
        .toUpperCase();
      if (profileInitialsEl) profileInitialsEl.textContent = initials || 'ME';
      const addresses = getSavedHomeAddresses(user);
      if (addresses.length) {
        if (profileFavoritePreview) profileFavoritePreview.textContent = addresses.slice(0, 3).join(', ');
      } else {
        if (profileFavoritePreview) profileFavoritePreview.textContent = 'No saved homes yet.';
      }
      if (profileNotesRow && profileNotesEl) {
        if (user.notes) {
          profileNotesRow.classList.remove('d-none');
          profileNotesEl.textContent = user.notes;
        } else {
          profileNotesRow.classList.add('d-none');
          profileNotesEl.textContent = 'Share your goals to personalize updates.';
        }
      }
    };

    const showProfileView = () => {
      if (!accountProfileSection || !accountFormSection) return;
      if (!getCurrentUser()) {
        showFormView();
        return;
      }
      accountFormSection.classList.add('d-none');
      accountProfileSection.classList.remove('d-none');
      updateProfileStats();
    };

    const showFormView = (user) => {
      if (!accountProfileSection || !accountFormSection) return;
      accountProfileSection.classList.add('d-none');
      accountFormSection.classList.remove('d-none');
      if (authForm && user) {
        const nameInput = authForm.querySelector('input[name="name"]');
        const emailInput = authForm.querySelector('input[name="email"]');
        if (nameInput) nameInput.value = user.name || '';
        if (emailInput) emailInput.value = user.email || '';
        if (phoneInput) phoneInput.value = user.phone || '';
        if (notesInput) notesInput.value = user.notes || '';
        if (interestsInput) interestsInput.value = user.interests || '';
      } else if (authForm) {
        const nameInput = authForm.querySelector('input[name="name"]');
        const emailInput = authForm.querySelector('input[name="email"]');
        if (nameInput) nameInput.value = '';
        if (emailInput) emailInput.value = '';
        if (phoneInput) phoneInput.value = '';
        if (notesInput) notesInput.value = '';
        if (interestsInput) interestsInput.value = '';
      }
    };

    if (getCurrentUser()) {
      showProfileView();
    } else {
      showFormView();
    }

    const setAuthStatus = (message, tone = 'success') => {
      if (!authStatus) return;
      authStatus.textContent = message;
      authStatus.classList.remove('d-none', 'text-success', 'text-danger', 'text-warning');
      authStatus.classList.add(`text-${tone}`);
    };

    const syncAccountToSheet = (user) => {
      if (!user) return Promise.resolve({ ok: false, skipped: true });
      const sender = window.SheetSync?.sendAccount;
      if (typeof sender !== 'function') {
        return Promise.resolve({ ok: false, skipped: true });
      }
      const savedAddresses = getSavedHomeAddresses(user).join(' | ');
      const messageSubjects = getMessageSubjects(user).slice(0, 5).join(' | ');
      const payload = {
        timestamp: new Date().toISOString(),
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        interests: user.interests || '',
        notes: user.notes || '',
        saved_home_count: user.savedHomeIds?.length || 0,
        saved_home_addresses: savedAddresses,
        saved_home_ids: (user.savedHomeIds || []).join(', '),
        message_count: user.messages?.length || 0,
        message_subjects: messageSubjects,
        source: 'Sign-In.html',
      };
      return sender(payload);
    };

    const renderSavedHomes = () => {
      const user = session?.getUser?.();
      savedList.innerHTML = '';
      if (!user) {
        savedList.innerHTML = '<div class="text-muted">Sign in to begin saving homes.</div>';
        return;
      }
      const savedIds = user.savedHomeIds || [];
      if (!savedIds.length) {
        savedList.innerHTML = '<div class="text-muted">No saved homes yet. Tap the heart on any listing.</div>';
        updateProfileStats();
        return;
      }

      savedIds.forEach((id) => {
        const prop = propertyIndex[id];
        savedList.insertAdjacentHTML('beforeend', `
          <div class="d-flex justify-content-between align-items-center border rounded-3 p-3">
            <div>
              <div class="fw-semibold">${prop?.address || `Listing #${id}`}</div>
              <div class="small text-muted">${prop?.city || ''} ${prop ? '$' + (prop.price || 0).toLocaleString() : ''}</div>
            </div>
            <div class="d-flex gap-2">
              <a href="${prop ? 'property.html?id=' + encodeURIComponent(prop.id) : '#'}" class="btn btn-outline-secondary btn-sm">Open</a>
              <button class="btn btn-outline-danger btn-sm" data-remove="${id}">Remove</button>
            </div>
          </div>
        `);
      });
      updateProfileStats();
    };

    const renderMessages = () => {
      const user = session?.getUser?.();
      messageHistory.innerHTML = '';
      if (!user || !user.messages?.length) {
        messageHistory.innerHTML = '<div class="text-muted">No messages yet.</div>';
        messageCount.textContent = '0 messages';
        updateProfileStats();
        return;
      }
      messageCount.textContent = `${user.messages.length} message${user.messages.length === 1 ? '' : 's'}`;

      user.messages.forEach((msg) => {
        const prop = msg.propertyId ? propertyIndex[msg.propertyId] : null;
        messageHistory.insertAdjacentHTML('beforeend', `
          <div class="border rounded-3 p-3">
            <div class="d-flex justify-content-between align-items-center">
              <div class="fw-semibold">${msg.subject || 'Message'}</div>
              <div class="small text-muted">${new Date(msg.timestamp).toLocaleString()}</div>
            </div>
            <p class="mb-1 small text-muted">${msg.body || ''}</p>
            ${prop ? `<div class="small"><i class="bi bi-house me-1"></i>${prop.address}</div>` : ''}
          </div>
        `);
      });
      updateProfileStats();
    };

    document.addEventListener('click', (e) => {
      const removeBtn = e.target.closest('[data-remove]');
      if (!removeBtn) return;
      const id = removeBtn.getAttribute('data-remove');
      if (!session?.ensureUser?.()) return;
      session.toggleSavedHome(id);
      renderSavedHomes();
    });

    authForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const form = new FormData(e.target);
      const name = form.get('name');
      const email = form.get('email');
      const phone = form.get('phone');
      const notes = form.get('notes');
      const interestsValue = form.get('interests');
      const updatedUser = session.login({ name, email, phone, interests: interestsValue, notes });
      setAuthStatus('Profile saved on this device. Syncing to your sheet...');
      showProfileView();
      renderSavedHomes();
      renderMessages();
      syncAccountToSheet(updatedUser)
        .then((result) => {
          if (result.ok) {
            setAuthStatus('Saved locally + logged to the Google Sheet.');
          } else if (result.skipped) {
            setAuthStatus('Profile saved. Add your sheet webhook URL in sheet-config.js to sync it.', 'warning');
          } else {
            setAuthStatus('Profile saved locally, but we could not reach the Google Sheet.', 'warning');
          }
        })
        .catch((err) => {
          console.error('Sheet sync error', err);
          setAuthStatus('Profile saved locally, but we could not reach the Google Sheet.', 'warning');
        });
    });

    messageForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!session?.ensureUser?.()) {
        alert('Sign in to send and track your messages.');
        return;
      }
      const form = new FormData(e.target);
      const entry = session.addMessage({
        subject: form.get('subject'),
        body: form.get('body'),
        propertyId: form.get('propertyId') || undefined,
      });
      if (entry) {
        messageStatus.textContent = 'Saved to your portal. We will reach out shortly.';
        messageStatus.classList.remove('d-none');
        messageStatus.classList.remove('text-danger');
        messageStatus.classList.add('text-success');
        e.target.reset();
        renderMessages();
      } else {
        messageStatus.textContent = 'Could not save your message.';
        messageStatus.classList.remove('d-none');
        messageStatus.classList.remove('text-success');
        messageStatus.classList.add('text-danger');
      }
    });

    editProfileBtn?.addEventListener('click', () => {
      const currentUser = getCurrentUser();
      showFormView(currentUser);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    logoutProfileBtn?.addEventListener('click', () => {
      session.logout();
      showFormView();
      renderSavedHomes();
      renderMessages();
      setAuthStatus('Signed out on this device.', 'warning');
    });

    modalCreateForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const modalName = formData.get('modalName');
      const modalEmail = formData.get('modalEmail');
      const modalPhone = formData.get('modalPhone');
      const modalNotes = formData.get('modalNotes');
      const modalInterests = formData.getAll('modalInterests').join(', ');
      if (authForm) {
        const nameInput = authForm.querySelector('input[name="name"]');
        const emailInput = authForm.querySelector('input[name="email"]');
        if (nameInput) nameInput.value = modalName || '';
        if (emailInput) emailInput.value = modalEmail || '';
        if (phoneInput) phoneInput.value = modalPhone || '';
        if (notesInput) notesInput.value = modalNotes || '';
        if (interestsInput) interestsInput.value = modalInterests;
      }
      const modalInstance = modalElement && typeof bootstrap !== 'undefined'
        ? bootstrap.Modal.getInstance(modalElement) || new bootstrap.Modal(modalElement)
        : null;
      modalInstance?.hide();
      authForm?.requestSubmit();
    });

    fetch('properties-1.json')
      .then((res) => res.json())
      .then((data) => {
        const props = (Array.isArray(data) ? data[0]?.properties : []) || [];
        propertyIndex = props.reduce((acc, p) => ({ ...acc, [p.id]: p }), {});
        propertySelect.innerHTML = '<option value="">General question</option>';
        props.forEach((p) => {
          propertySelect.insertAdjacentHTML('beforeend', `<option value="${p.id}">${p.address} (${p.city})</option>`);
        });
        renderSavedHomes();
        renderMessages();
        if (getCurrentUser()) {
          updateProfileStats();
        }
      })
      .catch(() => {
        savedList.innerHTML = '<div class="text-danger">Unable to load saved homes right now.</div>';
      });
  };

  waitForSession()
    .then((session) => init(session))
    .catch((err) => {
      console.error('UserSession is not available. Ensure user.js is loaded before sign-in.js.', err);
      if (authStatus) {
        authStatus.textContent = 'We could not load your saved activity. Please refresh.';
        authStatus.classList.remove('d-none');
        authStatus.classList.add('text-danger');
      }
    });
});
