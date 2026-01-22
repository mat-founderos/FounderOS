function initMultistepForm(containerSelector) {
  let currentStep = 0,
    currentFormData = {};

  const container = $(containerSelector);
  const steps = container.find(".multistep-form-step-modal");
  const progressBar = container.find(
    ".multistep-form-progressbar-progress-modal"
  );
  const totalSteps = steps.length;
  const endpoint =
    "https://founderos.app.n8n.cloud/webhook/webhook/partial-submission";

  /* ---------------------------
     STATUS HANDLING
  ----------------------------*/
  function setStatus(value) {
    container.find(".status").val(value);
  }

  // default state
  setStatus("partial");

  function updateProgress() {
    const percent = (currentStep / (totalSteps - 1)) * 100;
    progressBar.css("width", percent + "%");
    container
      .find(".multistep-progress-number")
      .text(currentStep + 1 + "/" + totalSteps);
    container
      .find(".multistep-progress-percent")
      .text(Math.round(percent) + "%");
  }

  function updateStep() {
    steps.hide().eq(currentStep).show();
    container.find(".multistep-form-previous-modal").toggle(currentStep > 0);
    container
      .find(".multistep-form-next-modal")
      .toggle(currentStep < totalSteps - 1);
  }

  function collectFormData() {
    container.find("input, select, textarea").each(function () {
      const name = $(this).attr("name") || $(this).attr("id");
      if (name) {
        if ($(this).is(":checkbox")) {
          currentFormData[name] = $(this).prop("checked");
        } else if ($(this).is(":radio")) {
          if ($(this).prop("checked")) currentFormData[name] = $(this).val();
        } else {
          currentFormData[name] = $(this).val().trim();
        }
      }
    });
  }

  function isLikelySpam(formData) {
    for (const [key, value] of Object.entries(formData)) {
      const excludedFields = [
        "90-day-timeframe",
        "cf-turnstile-response",
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_term",
        "utm_content",
        "user_country_name",
        "status",
      ];

      if (excludedFields.includes(key)) continue;

      const inputEl = container.find(`[name="${key}"], #${key}`);
      const isHiddenField =
        inputEl.length &&
        (inputEl.attr("type") === "hidden" ||
          !inputEl.is(":visible") ||
          inputEl.css("opacity") === "0" ||
          inputEl.css("display") === "none" ||
          inputEl.css("visibility") === "hidden" ||
          inputEl.hasClass("hide"));

      if (isHiddenField) continue;
      if (typeof value !== "string") continue;

      const text = value.trim();
      const lowercase = text.toLowerCase();

      if (text.length > 150) {
        return "Please keep your response under 150 characters.";
      }
      if (/^[0-9]+@(?:gmail|yahoo|outlook)\./i.test(lowercase)) {
        return "Please use a valid email address, not one made of only numbers.";
      }
      if (/([a-z]{3,})\1{2,}/i.test(text.replace(/[^a-z]/gi, ""))) {
        return "Your response appears to repeat too often.";
      }
      if (/@(tempmail|mailinator|sharklasers|guerrillamail)/i.test(lowercase)) {
        return "Please use a personal or business email, not a temporary one.";
      }
      if (/^(asdf|sdfg|dfgh|fghj|hjkl|qwer|zxcv){1,2}$/i.test(lowercase)) {
        return "Please avoid using random key patterns.";
      }
    }
    return null;
  }

  async function sendPartial() {
    collectFormData();
    setStatus("partial");

    if (isLikelySpam(currentFormData)) return;

    try {
      await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "partial",
          formData: currentFormData,
          step: currentStep,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error("Partial data send failed:", err);
    }
  }

  function validateStep(stepElement) {
    let isValid = true;
    const emailInput = stepElement.find("#Email");
    const phoneInput = stepElement.find("#Phone-Number");
    const errorBox = stepElement.find(".multistep-form-error");

    errorBox.text("").hide();

    if (emailInput.length) {
      const emailVal = emailInput.val().trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        errorBox.text("Please enter a valid email address.").show();
        return false;
      }
    }

    if (phoneInput.length) {
      const phoneVal = phoneInput.val().trim();
      if (/[a-zA-Z]/.test(phoneVal)) {
        errorBox.text("Phone number should not contain letters.").show();
        return false;
      }
    }

    collectFormData();
    const spamResult = isLikelySpam(currentFormData);
    if (spamResult) {
      errorBox.text(spamResult).show();
      return false;
    }

    const mandatorySteps = [0, 1, 3, 4, 5, 6];
    if (mandatorySteps.includes(currentStep)) {
      let hasValidInput = false;

      stepElement
        .find("input:not([type=radio]), select, textarea")
        .each(function () {
          const el = $(this);
          if (!el.is(":visible") || el.prop("disabled")) return;

          if (el.is(":checkbox") && el.prop("checked")) {
            hasValidInput = true;
          } else if (!el.is(":checkbox") && el.val().trim() !== "") {
            hasValidInput = true;
          }
        });

      const radioNames = new Set();
      stepElement.find("input[type=radio]").each(function () {
        const name = $(this).attr("name");
        if (name) radioNames.add(name);
      });

      for (let name of radioNames) {
        if (stepElement.find(`input[name="${name}"]`).is(":checked")) {
          hasValidInput = true;
          break;
        }
      }

      if (!hasValidInput) {
        errorBox
          .text("This step is required. Please answer before continuing.")
          .show();
        return false;
      }
    }
    return true;
  }

  async function goToStep(direction) {
    if (currentStep + direction >= 0 && currentStep + direction < totalSteps) {
      const currentStepElement = steps.eq(currentStep);

      if (direction === 1 && !validateStep(currentStepElement)) return;

      currentStep += direction;
      updateStep();
      updateProgress();
      await sendPartial();
    }
  }

  container
    .find(".msf-button, .multistep-form-next-modal")
    .click(() => goToStep(1));
  container.find(".multistep-form-previous-modal").click(() => goToStep(-1));

  container.find(".multistep-form-modal").submit(function () {
    collectFormData();
    setStatus("complete");

    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "complete",
        formData: currentFormData,
        step: currentStep,
        timestamp: new Date().toISOString(),
      }),
      keepalive: true,
    });
  });

  updateStep();
  updateProgress();
}

$(document).ready(function () {
  initMultistepForm(".application-form-control");
  initMultistepForm(".application-form-variant-a");
});
