function isSpammyInput(e, t) {
  const o = e.toLowerCase();
  if ((t === "firstname" || t === "lastname" || t === "email") && e.length > 150) {
    return "Please keep your response concise.";
  } else if (/([a-z]{3,})\1{2,}/i.test(e.replace(/[^a-z]/gi, ""))) {
    return "Your response appears to repeat too often.";
  } else if (/@(tempmail|mailinator|sharklasers|guerrillamail)/i.test(o)) {
    return "Please use a personal or business email, not a temporary one.";
  } else if (/^(asdf|sdfg|dfgh|fghj|hjkl|qwer|zxcv){1,2}$/i.test(o)) {
  return "Please avoid using random key patterns.";
  } else if (/^[0-9]+@(?:gmail|yahoo|outlook)\./i.test(o)) {
  return "Please avoid using number-only addresses from free email providers.";
  } else {
    return null;
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const forms = document.querySelectorAll("form");

  // Append JS check field to all forms
  const jsCheckInput = document.createElement("input");
  jsCheckInput.type = "hidden";
  jsCheckInput.name = "js-check";
  jsCheckInput.value = "valid-js-token";
  forms.forEach(form => form.appendChild(jsCheckInput.cloneNode(true)));

  // Bot User-Agent filter
  const userAgent = navigator.userAgent.toLowerCase();
  if (["curl", "python", "scrapy", "httpclient", "wget", "node"].some(ua => userAgent.includes(ua))) {
    console.warn("Blocked by User-Agent filter.");
    document.body.innerHTML = "";
    return;
  }

  // Setup per-form input timing
  forms.forEach(form => {
    form.dataset.startTime = "";
    form.addEventListener("input", () => {
      if (!form.dataset.startTime) {
        form.dataset.startTime = Date.now();
      }
    }, { once: true });

    form.addEventListener("submit", function (event) {
      const honeypot = form.querySelector(".hp-field"); // renamed class
      if (honeypot && honeypot.value.trim().length > 0) {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.warn("Submission blocked by honeypot.");
        const formData = {};
        form.querySelectorAll("input, select, textarea").forEach(field => {
          const name = field.name || field.id;
          if (name) {
            if (field.type === "checkbox") {
              formData[name] = field.checked;
            } else if (field.type === "radio") {
              if (field.checked) {
                formData[name] = field.value;
              }
            } else {
              formData[name] = field.value.trim();
            }
          }
        });
        fetch("https://founderos.app.n8n.cloud/webhook/spam-logger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "spam-detected",
            timestamp: new Date().toISOString(),
            formData: formData
          })
        }).then(() => {
          console.info("Partial spam submission sent.");
        }).catch(err => {
          console.error("Failed to send spam data:", err);
        });
        return;
      }

      // New logic: block if user didn't interact or submitted too fast
      const startTime = parseInt(form.dataset.startTime || "0", 10);
      if (!startTime || (Date.now() - startTime < 3000)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.warn("Submission blocked: too fast.");
        alert("Form submitted too quickly. Please take a moment before submitting.");
        return;
      }

      // Safety: reinsert js-check if missing
      setTimeout(() => {
        document.querySelectorAll("form").forEach(f => {
          if (!f.querySelector('input[name="js-check"]')) {
            const t = document.createElement("input");
            t.type = "hidden";
            t.name = "js-check";
            t.value = "valid-js-token";
            f.appendChild(t);
          }
        });
      }, 500);

      // Run spam content checks
      let blocked = false;
      let errorMessage = "";
      form.querySelectorAll("input:not([type='hidden']):not(.hide), textarea:not(.hide)").forEach(field => {
        const name = field.name || "";
        if (["cf-turnstile-response", "g-recaptcha-response", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "user_country_name"].includes(name)) return;
        const result = isSpammyInput(field.value.trim(), name);
        if (result && !blocked) {
          blocked = true;
          errorMessage = result;
        }
      });

      if (blocked) {
        event.preventDefault();
        event.stopImmediatePropagation();
        const existingError = form.querySelector(".spam-error-message");
        if (existingError) {
          existingError.remove();
        }
        const errorLabel = document.createElement("label");
        errorLabel.className = "spam-error-message";
        errorLabel.style.cssText = "color: red; display: block; margin-bottom: 10px; font-weight: normal;";
        errorLabel.textContent = errorMessage;
        const checkbox = form.querySelector(".form-disclaimer-checkbox");
        if (checkbox && checkbox.parentNode === form) {
          form.insertBefore(errorLabel, checkbox);
        } else {
          form.appendChild(errorLabel);
        }
      }
    }, true);
  });
});
