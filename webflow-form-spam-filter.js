function isSpammyInput(text) {
    const lowercase = text.toLowerCase();

    if (text.length > 150) {
      return "Your answer is too long. Please keep it concise.";
    }

    if (/(.)\1{5,}/.test(text)) {
      return "Your answer contains repeated characters. Please revise it.";
    }

    if (/[bcdfghjklmnpqrstvwxyz]{6,}/i.test(text) && !/\s/.test(text)) {
      return "Your answer seems unclear. Please check for typos.";
    }

    if (/@(tempmail|mailinator|sharklasers|guerrillamail)/i.test(lowercase)) {
      return "Temporary emails are not allowed. Please use a valid email.";
    }

    if (/asdf|sdfg|dfgh|fghj|hjkl|qwer|zxcv/i.test(lowercase)) {
      return "Your answer looks auto-typed or random. Please revise it.";
    }

    return null;
  }

  document.addEventListener("DOMContentLoaded", function () {
    const forms = document.querySelectorAll("form");

    forms.forEach(function (form) {
      form.addEventListener("submit", function (e) {
        let isSpamDetected = false;

        // Remove previous error messages
        form.querySelectorAll(".spam-error-message").forEach(el => el.remove());
        form.querySelectorAll(".spam-error").forEach(el => el.classList.remove("spam-error"));

        const fields = form.querySelectorAll("input:not([type='hidden']), textarea");

        fields.forEach(function (field) {
          const value = field.value.trim();
          const error = isSpammyInput(value);

          if (error) {
            isSpamDetected = true;
            field.classList.add("spam-error");

            if (!form.querySelector(".spam-error-message")) {
              const errorLabel = document.createElement("label");
              errorLabel.className = "spam-error-message";
              errorLabel.style.color = "red";
              errorLabel.style.fontWeight = "normal";
              errorLabel.style.display = "block";
              errorLabel.style.marginBottom = "10px";
              errorLabel.textContent = error;

              form.prepend(errorLabel);
            }
          }
        });

        if (isSpamDetected) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
      });
    });
  });
