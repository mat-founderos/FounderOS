function isSpammyInput(text, fieldName) {
  const lowercase = text.toLowerCase();

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
  const honeypotField = document.querySelector(".work-email");
  const spamWebhook = "https://founderos.app.n8n.cloud/webhook/spam-logger";

  // Honeypot live check – disables submit buttons if honeypot is typed into
  if (honeypotField) {
    honeypotField.addEventListener("input", function () {
      if (honeypotField.value.length > 0) {
        document.querySelectorAll('input[type="submit"]').forEach(function (btn) {
          btn.disabled = true;
        });
      }
    });
  }

  forms.forEach(form => {
    form.addEventListener("submit", function (e) {
      const honeypot = form.querySelector(".work-email");

      // If honeypot triggered
      if (honeypot && honeypot.value.trim().length > 0) {
        e.preventDefault();
        e.stopImmediatePropagation();
        console.warn("Submission blocked by honeypot.");

        // Collect partial form data
        const formData = {};
        const fields = form.querySelectorAll("input, select, textarea");
        fields.forEach(field => {
          const name = field.name || field.id;
          if (!name) return;

          if (field.type === "checkbox") {
            formData[name] = field.checked;
          } else if (field.type === "radio") {
            if (field.checked) formData[name] = field.value;
          } else {
            formData[name] = field.value.trim();
          }
        });

        // Send to webhook
        fetch(spamWebhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "spam-detected",
            timestamp: new Date().toISOString(),
            formData
          })
        }).then(() => {
          console.info("Partial spam submission sent.");
        }).catch(err => {
          console.error("Failed to send spam data:", err);
        });

        return;
      }

      let isSpamDetected = false;
      let spamMessage = "";

      const fields = form.querySelectorAll("input:not([type='hidden']), textarea");
      fields.forEach(field => {
        const value = field.value.trim();
        const name = field.name || "";
        const error = isSpammyInput(value, name);

        if (error && !isSpamDetected) {
          isSpamDetected = true;
          spamMessage = error;
        }
      });

      if (isSpamDetected) {
        e.preventDefault();
        e.stopImmediatePropagation();

        const oldError = form.querySelector(".spam-error-message");
        if (oldError) oldError.remove();

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
    }, true); // capture phase
  });
});
