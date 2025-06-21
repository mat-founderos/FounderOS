function isSpammyInput(text, fieldName) {
  const lowercase = text.toLowerCase();

  // Length check only for firstname or lastname
  if ((fieldName === "firstname" || fieldName === "lastname") && text.length > 100) {
    return "Please keep your response concise.";
  }

  if (/([a-z]{3,})\1{2,}/i.test(text.replace(/[^a-z]/gi, ''))) {
    return "Your response appears to repeat too often.";
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
  if (/^[0-9]+@/.test(lowercase)) {
    return "Please use a valid email address, not one made of only numbers.";
  }


  return null;
}

document.addEventListener("DOMContentLoaded", function () {
  const forms = document.querySelectorAll("form");

  forms.forEach(form => {
    form.addEventListener("submit", function (e) {
      let isSpamDetected = false;
      let spamMessage = "";

      const fields = form.querySelectorAll("input:not([type='hidden']), textarea");

      fields.forEach(field => {
        const value = field.value.trim();
        const name = field.name || ""; // Use field.name to get the fieldName
        const error = isSpammyInput(value, name);

        if (error && !isSpamDetected) {
          isSpamDetected = true;
          spamMessage = error;
        }
      });

      if (isSpamDetected) {
        e.preventDefault();               // Stop form submission
        e.stopImmediatePropagation();     // Prevent further event handlers

        // Remove existing spam error
        const oldError = form.querySelector(".spam-error-message");
        if (oldError) oldError.remove();

        // Show spam error above the disclaimer (or at the top if not found)
        const disclaimer = form.querySelector(".form-disclaimer-checkbox");
        const errorLabel = document.createElement("label");
        errorLabel.className = "spam-error-message";
        errorLabel.style.cssText = "color: red; display: block; margin-bottom: 10px; font-weight: normal;";
        errorLabel.textContent = spamMessage;

        if (disclaimer) {
          disclaimer.parentNode.insertBefore(errorLabel, disclaimer);
        } else {
          form.insertBefore(errorLabel, form.firstChild);
        }
      }
    }, true); // Use capture=true so it runs before third-party scripts
  });
});
