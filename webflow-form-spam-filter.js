function isSpammyInput(text) {
  const lowercase = text.toLowerCase();

       if (text.length > 150) {
            return "Please keep your response under 150 characters.";
        }

        if (/(.)\1{5,}/.test(text)) {
            return "Looks like your input has too many repeated characters.";
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
        const error = isSpammyInput(value);
        if (error && !isSpamDetected) {
          isSpamDetected = true;
          spamMessage = error;
        }
      });

      if (isSpamDetected) {
        e.preventDefault();               // stops default form submit
        e.stopImmediatePropagation();     // stops any later submit handlers (like the redirect)

        // Remove existing spam message
        const oldError = form.querySelector(".spam-error-message");
        if (oldError) oldError.remove();

        // Show spam error above disclaimer
        const disclaimer = form.querySelector(".form-disclaimer-checkbox");
        if (disclaimer) {
          const errorLabel = document.createElement("label");
          errorLabel.className = "spam-error-message";
          errorLabel.style.cssText = "color: red; display: block; margin-bottom: 10px; font-weight: normal;";
          errorLabel.textContent = spamMessage;
          disclaimer.parentNode.insertBefore(errorLabel, disclaimer);
        }
      }
    }, true); // <<<< VERY IMPORTANT: capture = true (runs before embed script)
  });
});
