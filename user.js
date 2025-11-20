(() => {
  const STORAGE_KEY = "kwUser";

  const getUser = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return {
        name: parsed.name || "",
        email: parsed.email || "",
        savedHomeIds: parsed.savedHomeIds || [],
        messages: parsed.messages || [],
      };
    } catch (err) {
      console.error("Failed to read user storage", err);
      return null;
    }
  };

  const persist = (user) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return true;
    } catch (err) {
      console.error("Failed to save user storage", err);
      return false;
    }
  };

  const login = ({ name, email }) => {
    const user = getUser() || { savedHomeIds: [], messages: [] };
    const nextUser = {
      ...user,
      name: name?.trim() || email,
      email: email?.trim() || "",
      savedHomeIds: Array.isArray(user.savedHomeIds) ? user.savedHomeIds : [],
      messages: Array.isArray(user.messages) ? user.messages : [],
    };
    persist(nextUser);
    return nextUser;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const ensureUser = () => getUser();

  const toggleSavedHome = (propertyId) => {
    const user = getUser();
    if (!user) return { saved: false, user: null };
    const ids = new Set(user.savedHomeIds || []);
    let saved;
    if (ids.has(propertyId)) {
      ids.delete(propertyId);
      saved = false;
    } else {
      ids.add(propertyId);
      saved = true;
    }
    const nextUser = { ...user, savedHomeIds: Array.from(ids) };
    persist(nextUser);
    return { saved, user: nextUser };
  };

  const isSaved = (propertyId) => {
    const user = getUser();
    return !!user?.savedHomeIds?.includes(propertyId);
  };

  const addMessage = (message) => {
    const user = getUser();
    if (!user) return null;
    const entry = {
      ...message,
      timestamp: new Date().toISOString(),
      id: (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : String(Date.now()),
    };
    const nextUser = {
      ...user,
      messages: [entry, ...(user.messages || [])].slice(0, 50),
    };
    persist(nextUser);
    return entry;
  };

  window.UserSession = {
    getUser,
    login,
    logout,
    ensureUser,
    toggleSavedHome,
    isSaved,
    addMessage,
  };
})();
