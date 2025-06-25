function isSpammyInput(e, t) {
  const o = e.toLowerCase();
  return ("firstname" === t || "lastname" === t) && e.length > 100
    ? "Please keep your response concise."
    : /([a-z]{3,})\1{2,}/i.test(e.replace(/[^a-z]/gi, ""))
    ? "Your response appears to repeat too often."
    : /[bcdfghjklmnpqrstvwxyz]{6,}/i.test(e) && !/\s/.test(e)
    ? "Please check your response for missing spaces or typos."
    : /@(tempmail|mailinator|sharklasers|guerrillamail)/i.test(o)
    ? "Please use a personal or business email, not a temporary one."
    : /asdf|sdfg|dfgh|fghj|hjkl|qwer|zxcv/i.test(o)
    ? "Please avoid using random key patterns."
    : /^[0-9]+@/.test(o)
    ? "Please use a valid email address, not one made of only numbers."
    : null;
}

document.addEventListener("DOMContentLoaded", (function () {
  const forms = document.querySelectorAll("form"),
        honeypot = document.querySelector(".work-email");

  // === Add Submission Timer ===
  const formStartTime = Date.now();

  // === Add JS Validation Token ===
  const jsToken = document.createElement("input");
  jsToken.type = "hidden";
  jsToken.name = "js-check";
  jsToken.value = "valid-js-token";
  forms.forEach(form => form.appendChild(jsToken));

  // === Block Known Bad User Agents ===
  const badAgents = ["curl", "python", "scrapy", "httpclient", "wget", "node"];
  const ua = navigator.userAgent.toLowerCase();
  if (badAgents.some(agent => ua.includes(agent))) {
    console.warn("Blocked by User-Agent filter.");
    document.body.innerHTML = ""; // Stop loading page content
    return;
  }

  // Honeypot trigger disables submit button
  if (honeypot) {
    honeypot.addEventListener("input", function () {
      if (honeypot.value.length > 0) {
        document.querySelectorAll('input[type="submit"]').forEach((btn) => {
          btn.disabled = true;
        });
      }
    });
  }

  forms.forEach((form => {
    form.addEventListener("submit", (function (event) {
      // Check honeypot
      const honeypotField = form.querySelector(".work-email");
      if (honeypotField && honeypotField.value.trim().length > 0) {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.warn("Submission blocked by honeypot.");

        const formData = {};
        form.querySelectorAll("input, select, textarea").forEach((el => {
          const name = el.name || el.id;
          if (name) {
            if (el.type === "checkbox") formData[name] = el.checked;
            else if (el.type === "radio") el.checked && (formData[name] = el.value);
            else formData[name] = el.value.trim();
          }
        }));

        fetch("https://founderos.app.n8n.cloud/webhook/spam-logger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "spam-detected",
            timestamp: (new Date).toISOString(),
            formData
          })
        })
        .then(() => { console.info("Partial spam submission sent."); })
        .catch((err => { console.error("Failed to send spam data:", err); }));

        return;
      }

      // === Submission Timer check ===
      const timeElapsed = (Date.now() - formStartTime) / 1000;
      if (timeElapsed < 5) {
        event.preventDefault();
        event.stopImmediatePropagation();
        console.warn("Submission blocked: too fast.");
        alert("Form submitted too quickly. Please take a moment before submitting.");
        return;
      }

      // === JS Token Check ===
    setTimeout(() => {
        document.querySelectorAll("form").forEach(form => {
            if (!form.querySelector('input[name="js-check"]')) {
            const jsToken = document.createElement("input");
            jsToken.type = "hidden";
            jsToken.name = "js-check";
            jsToken.value = "valid-js-token";
            form.appendChild(jsToken);
            }
        });
    }, 500); // delay 0.5s to ensure Webflow loaded the form


      // === Input validation check ===
      let foundSpam = false, message = "";
      form.querySelectorAll("input:not([type='hidden']), textarea").forEach((el => {
        const fieldName = el.name || "";
        if (fieldName === "cf-turnstile-response") return;
        if (fieldName === "g-recaptcha-response") return;
        const checkResult = isSpammyInput(el.value.trim(), fieldName);
        if (checkResult && !foundSpam) {
          foundSpam = true;
          message = checkResult;
        }
      }));

      if (foundSpam) {
        event.preventDefault();
        event.stopImmediatePropagation();

        const existingError = form.querySelector(".spam-error-message");
        if (existingError) existingError.remove();

        const errorLabel = document.createElement("label");
        errorLabel.className = "spam-error-message";
        errorLabel.style.cssText = "color: red; display: block; margin-bottom: 10px; font-weight: normal;";
        errorLabel.textContent = message;

        const insertBeforeEl = form.querySelector(".form-disclaimer-checkbox") || form.firstChild;
        form.insertBefore(errorLabel, insertBeforeEl);
      }
    }), true);
  }));
}));
