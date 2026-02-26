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

    if (isLikelySpam(currentFormData)) {
      console.warn("Spam detected. Skipping partial submission.");
      return;
    }

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

    // Mandatory step logic: Steps 1,2,4,5,6,7 (Indexes 0,1,3,4,5,6)
    const mandatorySteps = [0, 1, 3, 4, 5, 6];
    if (mandatorySteps.includes(currentStep)) {
      let hasValidInput = false;

      // Check for filled inputs (text, textarea, select, checkbox)
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

      // Check for valid radio groups
      const radioNames = new Set();
      stepElement.find("input[type=radio]").each(function () {
        const name = $(this).attr("name");
        if (name) radioNames.add(name);
      });

      for (let name of radioNames) {
        const group = stepElement.find(`input[name="${name}"]`);
        if (group.is(":checked")) {
          hasValidInput = true;
          break;
        }
      }

      if (!hasValidInput) {
        errorBox.text("This step is required. Please answer before continuing.").show();
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

      if (window.fathom) {
        window.trackedSteps = window.trackedSteps || new Set();
        if (!window.trackedSteps.has(currentStep)) {
          fathom.trackEvent(
            `Application Form Submit (Step: ${currentStep + 1})`
          );
          window.trackedSteps.add(currentStep);
        }
      }

      updateStep();
      updateProgress();
      await sendPartial();
    }
  }

  // Button Handlers
  container
    .find(".msf-button, .multistep-form-next-modal")
    .click(() => goToStep(1));
  container.find(".multistep-form-previous-modal").click(() => goToStep(-1));

  // Choice Handler
  container.find(".multistep-choice").change(function () {
    if (container.find("#first-question-no").is(":checked")) {
      window.location.href = "/revenue-accelerator";
    } else {
      goToStep(1);
    }
  });

  container.find("#first-question-no").on("click", function () {
    window.location.href = "/revenue-accelerator";
  });

  // Form Submit
  container.find(".multistep-form-modal").submit(function (e) {

  collectFormData();
   // 👇 Force step to 8 (index 7)
  currentStep = 7;

  container.find(".status").val("complete");

  // Optional: send a final partial/completion payload
  fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      type: "complete",
      formData: currentFormData,
      step: currentStep,
      timestamp: new Date().toISOString(),
    }),
  });

  if (window.RH && typeof RH.pendingReferral === "function") {
    RH.pendingReferral(currentFormData);
  }
    fathom.trackEvent("Application Form Submit");
  });

  // Checkbox background logic
  container.find(".multistep-choice-checkbox input").change(function () {
    const parent = $(this).closest(".multistep-choice-checkbox");
    if ($(this).prop("checked")) {
      parent.css("background-color", "#ffffff4d");
    } else {
      parent.css("background-color", "");
    }
  });

  container.find(".multistep-choice-last input").change(function () {
    container.find(".multistep-choice-last").css("background-color", "");
    const parent = $(this).closest(".multistep-choice-last");
    if ($(this).prop("checked")) {
      parent.css("background-color", "#ffffff4d");
    }
    sendPartial();
  });

  // First Name + Last Name auto split
  container.find("#What-s-your-full-name").on("input", function () {
    const fullName = $(this).val().trim().split(" ");
    container.find("#first_name").val(fullName[0] || "");
    container.find("#last_name").val(fullName.slice(1).join(" ") || "");
  });

  // Dynamic question text logic
  window.addEventListener("load", function () {
    const radios = container.find('input[type="radio"]');
    const dynamicText = container.find(".q2-dynamic");
    const otherField = container.find(
      'input[name="What-s-the-1-bottleneck-in-your-business-right-now-Other"]'
    );

    dynamicText.text(
      "8. If your main challenge was solved, what could you achieve in the next 90 days?"
    );

    const textMap = {
      "The-business-needs-you-in-day-to-day-operations":
        "8. If day-to-day operations no longer needed you, what could you achieve in the next 90 days working “on” the business, instead of being in it?",
      "Revenue-has-plateaued-at-current-levels":
        "8. If your revenue was no longer plateaued, what revenue level do you think you could achieve in the next 90 days?",
      "The-team-needs-you-for-every-decision":
        "8. If your team could make decisions without you, what could you accomplish in the next 90 days?",
      "Lead-flow-is-unpredictable":
        "8. If you had consistent, predictable lead flow, what would that do for you and your business?",
      "Profit-margins-are-too-low-for-the-effort":
        "8. If your business had healthy 40%+ profit margins, what would that allow you to do that you can’t do now?",
    };

    radios.each(function () {
      $(this).change(function () {
        const id = this.id;
        if (this.checked && textMap[id]) {
          dynamicText.text(textMap[id]);
        }
      });
    });

    if (otherField.length) {
      otherField.on("input", function () {
        if (this.value.trim() !== "") {
          dynamicText.text(
            "8. If your main challenge was solved, what could you achieve in the next 90 days?"
          );
        }
      });
    }
  });

  // Enter + Escape key handlers
  $(document).on("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      container.find(".multistep-form-next-modal").click();
    }
  });

  // Modal open/close (global, not scoped because you open full screen modals)
 document.addEventListener("click", function (e) {
  const openBtn = e.target.closest(".application-open");
  const closeBtn = e.target.closest(".application-close");

  if (openBtn) {
    e.preventDefault(); // 👈 ADD THIS
    document
      .querySelectorAll(".appplication-form-modal")
      .forEach((el) => (el.style.display = "flex"));
    document.body.style.overflow = "hidden";
    window.fathom && fathom.trackEvent("Application Form Submit (Step: 1)");
  }

  if (closeBtn) {
    e.preventDefault(); // 👈 optional but safe
    document
      .querySelectorAll(".appplication-form-modal")
      .forEach((el) => (el.style.display = "none"));
    document.body.style.overflow = "";
  }
});


  // Unload partial save
  window.addEventListener("beforeunload", async function () {
    collectFormData();
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
        keepalive: true,
      });
    } catch (err) {
      console.error("Failed to send data before unload:", err);
    }
  });

  $(".status").val("partial");

  // Initialize first step
  updateStep();
  updateProgress();

  // Reusable function to sync textfield and radio group both ways
  function setupOtherFieldSync(textFieldName, radioGroupName) {
    const textField = container.find(`input[name="${textFieldName}"]`);
    const radioGroup = container.find(`input[name="${radioGroupName}"]`);

    // When typing into the text field, uncheck radio group
    textField.on("input", function () {
      const value = $(this).val().trim();
      if (value !== "") {
        radioGroup.prop("checked", false);
      }
    });

    // When selecting any radio button, clear the text field
    radioGroup.on("change", function () {
      textField.val("");
    });
  }

  setupOtherFieldSync(
    "What-s-the-1-bottleneck-in-your-business-right-now-Other",
    "What-s-the-1-bottleneck-in-your-business-right-now"
  );
  setupOtherFieldSync(
    "What-type-of-business-do-you-run-Other",
    "What-type-of-business-do-you-run"
  );
}

$(document).ready(function () {
  // Get values from input fields and combine
  const firstName = $("[name='firstname']").val();
  const lastName = $("[name='lastname']").val();

  if (firstName && lastName) {
    $(".full-name").val(`${firstName} ${lastName}`).trigger("input");
  } else if (firstName) {
    $(".full-name").val(firstName).trigger("input");
  }

  initMultistepForm(".application-form-control");
  initMultistepForm(".application-form-variant-a");

  // Auto-open form if hash is #application
  if (window.location.hash === "#application") {
    document
      .querySelectorAll(".appplication-form-modal")
      .forEach((el) => (el.style.display = "flex"));
    document.body.style.overflow = "hidden";
    window.fathom && fathom.trackEvent("Application Form Submit (Step: 1)");
  }
});
