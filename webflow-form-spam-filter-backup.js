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
  const e = document.querySelectorAll("form"),
        t = document.querySelector(".work-email");

  t && t.addEventListener("input", (function () {
    t.value.length > 0 && document.querySelectorAll('input[type="submit"]').forEach((function (e) {
      e.disabled = !0;
    }));
  }));

  e.forEach((e => {
    e.addEventListener("submit", (function (t) {
      const o = e.querySelector(".work-email");

      if (o && o.value.trim().length > 0) {
        t.preventDefault();
        t.stopImmediatePropagation();
        console.warn("Submission blocked by honeypot.");

        const o = {};
        e.querySelectorAll("input, select, textarea").forEach((e => {
          const t = e.name || e.id;
          if (t) {
            if (e.type === "checkbox") o[t] = e.checked;
            else if (e.type === "radio") e.checked && (o[t] = e.value);
            else o[t] = e.value.trim();
          }
        }));

        fetch("https://founderos.app.n8n.cloud/webhook/spam-logger", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "spam-detected",
            timestamp: (new Date).toISOString(),
            formData: o
          })
        })
        .then(() => { console.info("Partial spam submission sent."); })
        .catch((e => { console.error("Failed to send spam data:", e); }));

        return;
      }

      let a = !1, n = "";

      e.querySelectorAll("input:not([type='hidden']), textarea").forEach((e => {
        const fieldName = e.name || "";
        if (fieldName === "cf-turnstile-response") return;

        const t = isSpammyInput(e.value.trim(), fieldName);
        if (t && !a) {
          a = !0;
          n = t;
        }
      }));

      if (a) {
        t.preventDefault();
        t.stopImmediatePropagation();

        const o = e.querySelector(".spam-error-message");
        if (o) o.remove();

        const a = e.querySelector(".form-disclaimer-checkbox"),
              s = document.createElement("label");
        s.className = "spam-error-message";
        s.style.cssText = "color: red; display: block; margin-bottom: 10px; font-weight: normal;";
        s.textContent = n;

        a ? a.parentNode.insertBefore(s, a) : e.insertBefore(s, e.firstChild);
      }
    }), !0);
  }));
}));
