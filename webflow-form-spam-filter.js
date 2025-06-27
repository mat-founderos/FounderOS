function isSpammyInput(e, t) {
  const o = e.toLowerCase();
  if ((t === "firstname" || t === "lastname") && e.length > 100) {
    return "Please keep your response concise.";
  } else if (/([a-z]{3,})\1{2,}/i.test(e.replace(/[^a-z]/gi, ""))) {
    return "Your response appears to repeat too often.";
  } else if (/@(tempmail|mailinator|sharklasers|guerrillamail)/i.test(o)) {
    return "Please use a personal or business email, not a temporary one.";
  } else if (/asdf|sdfg|dfgh|fghj|hjkl|qwer|zxcv/i.test(o)) {
    return "Please avoid using random key patterns.";
  } else if (/^[0-9]+@/.test(o)) {
    return "Please use a valid email address, not one made of only numbers.";
  } else {
    return null;
  }
}
document.addEventListener("DOMContentLoaded", function () {
  const e = document.querySelectorAll("form");
  const t = document.querySelector(".work-email");
  const o = Date.now();
  const n = document.createElement("input");
  n.type = "hidden";
  n.name = "js-check";
  n.value = "valid-js-token";
  e.forEach(e => e.appendChild(n));
  const a = navigator.userAgent.toLowerCase();
  if (["curl", "python", "scrapy", "httpclient", "wget", "node"].some(e => a.includes(e))) {
    console.warn("Blocked by User-Agent filter.");
    document.body.innerHTML = "";
    return;
  }
  if (t) {
    t.addEventListener("input", function () {
      if (t.value.length > 0) {
        document.querySelectorAll('input[type="submit"]').forEach(e => {
          e.disabled = true;
        });
      }
    });
  }
  e.forEach(e => {
    e.addEventListener("submit", function (t) {
      const n = e.querySelector(".work-email");
      if (n && n.value.trim().length > 0) {
        t.preventDefault();
        t.stopImmediatePropagation();
        console.warn("Submission blocked by honeypot.");
        const o = {};
        e.querySelectorAll("input, select, textarea").forEach(e => {
          const t = e.name || e.id;
          if (t) {
            if (e.type === "checkbox") {
              o[t] = e.checked;
            } else if (e.type === "radio") {
              if (e.checked) {
                o[t] = e.value;
              }
            } else {
              o[t] = e.value.trim();
            }
          }
        });
        fetch("https://founderos.app.n8n.cloud/webhook/spam-logger", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({type: "spam-detected", timestamp: (new Date).toISOString(), formData: o})}).then(() => {
          console.info("Partial spam submission sent.");
        }).catch(e => {
          console.error("Failed to send spam data:", e);
        });
        return;
      }
      if ((Date.now() - o) / 1e3 < 5) {
        t.preventDefault();
        t.stopImmediatePropagation();
        console.warn("Submission blocked: too fast.");
        alert("Form submitted too quickly. Please take a moment before submitting.");
        return;
      }
      setTimeout(() => {
        document.querySelectorAll("form").forEach(e => {
          if (!e.querySelector('input[name="js-check"]')) {
            const t = document.createElement("input");
            t.type = "hidden";
            t.name = "js-check";
            t.value = "valid-js-token";
            e.appendChild(t);
          }
        });
      }, 500);
      let a = false;
      let r = "";
      e.querySelectorAll("input:not([type='hidden']):not(.hide), textarea:not(.hide)").forEach(e => {
        const t = e.name || "";
        if (
            ["cf-turnstile-response", "g-recaptcha-response", "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "user_country_name"].includes(t)
        ) return;
        const o = isSpammyInput(e.value.trim(), t);
        if (o && !a) {
            a = true;
            r = o;
        }
        });

      if (a) {
        t.preventDefault();
        t.stopImmediatePropagation();
        const o = e.querySelector(".spam-error-message");
        if (o) {
          o.remove();
        }
        const n = document.createElement("label");
        n.className = "spam-error-message";
        n.style.cssText = "color: red; display: block; margin-bottom: 10px; font-weight: normal;";
        n.textContent = r;
        const a = e.querySelector(".form-disclaimer-checkbox") || e.firstChild;
        e.insertBefore(n, a);
      }
    }, true);
  });
});
