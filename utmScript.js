// Get UTM from URL
function getParameterByName(name) {
  const match = location.search.match(new RegExp('[?&]' + name + '=([^&]*)'));
  return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
}

// Save UTM to cookie and sessionStorage
function saveUtmsToStorage() {
  const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const expires = new Date(Date.now() + 86400 * 1000).toUTCString(); // 1 day

  utms.forEach(key => {
    const value = getParameterByName(key);
    if (value) {
      // Try saving to cookie
      try {
        document.cookie = `${key}=${value}; path=/; expires=${expires}`;
      } catch (e) {}

      // Fallback: save to sessionStorage
      try {
        sessionStorage.setItem(key, value);
      } catch (e) {}
    }
  });
}

// Get stored UTM from cookie or sessionStorage
function getStoredValue(name) {
  // Try cookies
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);

  // Fallback to sessionStorage
  try {
    return sessionStorage.getItem(name);
  } catch (e) {
    return null;
  }
}

// Fill all hidden fields with the same name with the same value
function populateHiddenFields() {
  const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  utms.forEach(key => {
    const value = getParameterByName(key) || getStoredValue(key);
    if (value) {
      // Select all hidden fields with the given name and set their value
      const inputs = document.querySelectorAll(`input[name="${key}"]`);
      inputs.forEach(input => {
        input.value = value;
      });
    }
  });
}

document.addEventListener("DOMContentLoaded", function() {
  saveUtmsToStorage();
  populateHiddenFields();
});
