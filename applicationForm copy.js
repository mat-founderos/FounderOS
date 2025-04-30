let currentStep = 0;
let currentFormData = {}; 

$(document).ready(function () {
  const steps = $(".multistep-form-step"),
    progressBar = $(".multistep-form-progressbar-progress"),
    totalSteps = steps.length;

  const webhookURL = "https://founderos.app.n8n.cloud/webhook-test/b82aaa3a-642a-41ce-a02f-22e8d93bbd11";

  function updateProgress() {
    progressBar.css("width", `${((currentStep + 1) / totalSteps) * 100}%`);
  }

  function showStep() {
    steps.hide().eq(currentStep).show();
    $(".multistep-form-previous").toggle(currentStep > 0);
    $(".multistep-form-next").toggle(currentStep < totalSteps - 1);
  }

  function collectFormData() {
    $(".multistep-form input, .multistep-form select, .multistep-form textarea").each(function () {
      const name = $(this).attr("name") || $(this).attr("id");
      if (name) {
        if ($(this).is(":checkbox")) {
          currentFormData[name] = $(this).prop("checked");
        } else if ($(this).is(":radio")) {
          if ($(this).prop("checked")) {
            currentFormData[name] = $(this).val();
          }
        } else {
          currentFormData[name] = $(this).val().trim();
        }
      }
    });
  }
  
  

  async function sendPartialData() {
    collectFormData();
  
    try {
      const response = await fetch(webhookURL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "partial",
          formData: currentFormData,
          step: currentStep,
          timestamp: new Date().toISOString(),
        }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to send partial data');
      }
    } catch (err) {
      console.error("Partial data send failed:", err);
    }
  }
  

  function validateStep(step) {
    let textField = step.find(".multiform-textfield"),
      radioButtons = step.find("input[type='radio']"),
      checkbox = step.find("input[type='checkbox']"),
      emailField = step.find("#Email"),
      phoneField = step.find("#Phone-Number"),
      error = step.find(".multistep-form-error"),
      isValid = true;

    if (emailField.length && !validateEmail(emailField.val().trim())) {
      error.text("Please enter a valid email address.").show();
      isValid = false;
    }

    if (phoneField.length && /[a-zA-Z]/.test(phoneField.val().trim())) {
      error.text("Phone number should not contain letters.").show();
      isValid = false;
    }

    if (textField.length && checkbox.length) {
      if (!textField.val().trim() && !checkbox.is(":checked")) {
        error.text("Please fill out this field or check the box.").show();
        isValid = false;
      }
    } else {
      if (textField.length && !textField.val().trim()) {
        error.text("Please fill out this field.").show();
        isValid = false;
      }

      if (checkbox.length && !checkbox.is(":checked")) {
        error.text("Please select at least one to proceed.").show();
        isValid = false;
      }
    }

    if (radioButtons.length && !radioButtons.is(":checked")) {
      error.text("Please select an option.").show();
      isValid = false;
    }

    if (isValid) {
      error.hide();
    }

    return isValid;
  }

  function validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  function validatePhoneNumber(phone) {
    const phonePattern = /^(?:\(\d{3}\)\s?|\d{3}[-.\s]?)\d{3}[-.\s]?\d{4}$/;
    return phonePattern.test(phone);
  }

  async function changeStep(direction) {
    let step = steps.eq(currentStep);
    if (direction === 1 && !validateStep(step)) return;
  
    currentStep += direction;
  
    if (window.fathom) {
      const eventName = `Application Form Submit (Step: ${currentStep + 1})`;
      fathom.trackEvent(eventName);
    }
  
    showStep();
    updateProgress();
  
    await sendPartialData();
  }
  

  $(".msf-button, .multistep-form-next").click(() => changeStep(1));
  $(".multistep-form-previous").click(() => changeStep(-1));

  $(".multistep-choice").change(function () {
    if ($("#first-question-no").is(":checked")) {
      window.location.href = "/training";
    } else {
      changeStep(1);
    }
  });

  $('#first-question-no').on('click', function () {
    window.location.href = '/training';
  });

  showStep();
  updateProgress();

  $(".multistep-form").submit(function (e) {
    e.preventDefault();

    collectFormData();

    let fullname = encodeURIComponent(currentFormData["Full-Name"] || "");
    let email = encodeURIComponent(currentFormData["Email"] || "");
    let phone = encodeURIComponent(currentFormData["phone"] || "");

    let redirectToIntroCall = false;

    $("input[type='radio']:checked").each(function () {
      if ($(this).data("redirection") === "intro-call") {
        redirectToIntroCall = true;
      }
    });

    let destination = redirectToIntroCall ? "/intro-call" : "/call";
    window.location.href = `${destination}?firstname=${fullname}&phone=${phone}&email=${email}`;
  });

  document
    .querySelectorAll(".multistep-choice-checkbox input")
    .forEach((input) => {
      input.addEventListener("change", () => {
        const label = input.closest(".multistep-choice-checkbox");
        if (input.checked) {
          label.style.backgroundColor = "#ffffff4d";
        } else {
          label.style.backgroundColor = "";
        }
        sendPartialData(); 
      });
    });

  function handleRadioBackground(input, containerSelector) {
    document.querySelectorAll(containerSelector).forEach((label) => {
      label.style.backgroundColor = "";
    });

    const label = input.closest(containerSelector);
    if (input.checked) {
      label.style.backgroundColor = "#ffffff4d";
    }
  }

  document.querySelectorAll(".multistep-choice-last input").forEach((input) => {
    input.addEventListener("change", () => {
      handleRadioBackground(input, ".multistep-choice-last");
      sendPartialData(); 
    });
  });

  $(document).on("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      $(".multistep-form-next").click();
    }
  });

  function openModal() {
    document.querySelector('.modal-wrapper').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    document.querySelector('.modal-wrapper').style.display = 'none';
    document.body.style.overflow = '';
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('.application-open')) {
      document.querySelectorAll('.appplication-form-modal').forEach(m => m.style.display = 'flex');
      document.body.style.overflow = 'hidden';
    }
    if (e.target.closest('.application-close')) {
      document.querySelectorAll('.appplication-form-modal').forEach(m => m.style.display = 'none');
      document.body.style.overflow = '';
    }
  });


  window.addEventListener("beforeunload", async function (e) {
    collectFormData();
  
    try {
      await fetch(webhookURL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
  
  console.error = function () {}; // Silences all console.error calls

});
