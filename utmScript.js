function getParameterByName(name) {
  const match = location.search.match(new RegExp('[?&]' + name + '=([^&]*)'));
  return match ? decodeURIComponent(match[1].replace(/\+/g, ' ')) : null;
}

function saveUtmsToStorage() {
  const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  const expires = new Date(Date.now() + 86400 * 1000).toUTCString(); 

  utms.forEach(key => {
    const value = getParameterByName(key);
    if (value) {
      
      try {
        document.cookie = `${key}=${value}; path=/; expires=${expires}`;
      } catch (e) {}
      try {
        sessionStorage.setItem(key, value);
      } catch (e) {}
    }
  });
}


function getStoredValue(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  if (match) return decodeURIComponent(match[2]);
  try {
    return sessionStorage.getItem(name);
  } catch (e) {
    return null;
  }
}


function populateHiddenFields() {
  const utms = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
  utms.forEach(key => {
    const value = getParameterByName(key) || getStoredValue(key);
    if (value) {
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
