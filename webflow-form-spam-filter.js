function isSpammyInput(text) {
  const lowercase = text.toLowerCase();

  if (text.length > 150) {
    return "Please keep your response under 150 characters.";
  }

  if (/(.)\1{5,}/.test(text)) {
    return "Looks like your input has too many repeated characters.";
  }

  if (/[bcdfghjklmnpqrstvwxyz]{6,}/i.test(text) && !/\s/.test(text)) {
    return "Please check your response for missing spaces or typos.";
  }

  if (/@(tempmail|mailinator|sharklasers|guerrillamail)/i.test(lowercase)) {
    return "Please use a personal or business email, not a temporary one.";
  }

  if (/asdf|sdfg|dfgh|fghj|hjkl|qwer|zxcv/i.test(lowercase)) {
    return "Please avoid using random key patterns.";
  }

  return null;
}

// Wait for Webflow to load
window.addEventListener("DOMContentLoaded", function () {
  $("form").each(function () {
    const $form = $(this);

    $form.on("submit", function (e) {
      let isSpamDetected = false;

      const fields = $form.find("input:not([type='hidden']), textarea");

      fields.each(function () {
        const $field = $(this);
        const value = $field.val().trim();
        const error = isSpammyInput(value);

        if (error) {
          isSpamDetected = true;
        }
      });

      if (isSpamDetected) {
        e.preventDefault();             // block normal form submission
        e.stopImmediatePropagation();   // block Webflow's AJAX submission
        return false;                   // explicitly stop further processing
      }
    });
  });
});
