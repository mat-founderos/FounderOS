function initMultistepForm(containerSelector) {
    let currentStep = 0,
        currentFormData = {};

    const container = $(containerSelector);
    const steps = container.find(".multistep-form-step-modal");
    const progressBar = container.find(".multistep-form-progressbar-progress-modal");
    const totalSteps = steps.length;
    const endpoint = "https://founderos.app.n8n.cloud/webhook/webhook/partial-submission";

    function updateProgress() {
        const percent = (currentStep / (totalSteps - 1)) * 100;
        progressBar.css("width", percent + "%");
        container.find(".multistep-progress-number").text(currentStep + 1 + "/" + totalSteps);
        container.find(".multistep-progress-percent").text(Math.round(percent) + "%");
    }

    function updateStep() {
        steps.hide().eq(currentStep).show();
        container.find(".multistep-form-previous-modal").toggle(currentStep > 0);
        container.find(".multistep-form-next-modal").toggle(currentStep < totalSteps - 1);
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

    async function sendPartial() {
        collectFormData();
        try {
            await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    type: "partial",
                    formData: currentFormData,
                    step: currentStep,
                    timestamp: new Date().toISOString()
                })
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

        if (emailInput.length) {
            const emailVal = emailInput.val().trim();
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
                errorBox.text("Please enter a valid email address.").show();
                isValid = false;
            }
        }

        if (phoneInput.length) {
            const phoneVal = phoneInput.val().trim();
            if (/[a-zA-Z]/.test(phoneVal)) {
                errorBox.text("Phone number should not contain letters.").show();
                isValid = false;
            }
        }

        if (isValid) errorBox.hide();
        return isValid;
    }

    async function goToStep(direction) {
        if (currentStep + direction >= 0 && currentStep + direction < totalSteps) {
            const currentStepElement = steps.eq(currentStep);

            if (direction === 1 && !validateStep(currentStepElement)) return;

            currentStep += direction;

            if (window.fathom) {
                window.trackedSteps = window.trackedSteps || new Set();
                if (!window.trackedSteps.has(currentStep)) {
                    fathom.trackEvent(`Application Form Submit (Step: ${currentStep + 1})`);
                    window.trackedSteps.add(currentStep);
                }
            }

            updateStep();
            updateProgress();
            await sendPartial();
        }
    }

    // Button Handlers
    container.find(".msf-button, .multistep-form-next-modal").click(() => goToStep(1));
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
        e.preventDefault();
        fathom.trackEvent("Application Form Submit - Control");
        collectFormData();

        let fullName = (currentFormData["Full-Name"] || "").trim();
        let [firstName, ...lastParts] = fullName.split(" ");
        let lastName = lastParts.join(" ");

        const redirectUrl = `/schedule/intro-call?firstname=${encodeURIComponent(firstName)}&lastname=${encodeURIComponent(lastName)}&phone=${encodeURIComponent(currentFormData.phone || "")}&email=${encodeURIComponent(currentFormData.Email || "")}`;

        localStorage.setItem("bookingOutcome", "setter");
        window.location.href = redirectUrl;
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
    container.find("#Full-Name").on("input", function () {
        const fullName = $(this).val().trim().split(" ");
        container.find("#firstname").val(fullName[0] || "");
        container.find("#lastname").val(fullName.slice(1).join(" ") || "");
    });

    // Dynamic question text logic
    window.addEventListener("load", function () {
        const radios = container.find('input[type="radio"]');
        const dynamicText = container.find('.q2-dynamic');
        const otherField = container.find('input[name="What-s-the-1-bottleneck-in-your-business-right-now-Other"]');

        const textMap = {
            "The-business-needs-you-in-day-to-day-operations": "8. If day-to-day operations no longer needed you, what could you achieve in the next 90 days working “on” the business, instead of being in it?",
            "Revenue-has-plateaued-at-current-levels": "8. If your revenue was no longer plateaued, what revenue level do you think you could achieve in the next 90 days?",
            "The-team-needs-you-for-every-decision": "8. If your team could make decisions without you, what could you accomplish in the next 90 days?",
            "Lead-flow-is-unpredictable": "8. If you had consistent, predictable lead flow, what would that do for you and your business?",
            "Profit-margins-are-too-low-for-the-effort": "8. If your business had healthy 40%+ profit margins, what would that allow you to do that you can’t do now?"
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
                if (this.value.trim() !== '') {
                    dynamicText.text("8. If your main challenge was solved, what could you achieve in the next 90 days?");
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
        if (e.target.closest(".application-open")) {
            document.querySelectorAll(".appplication-form-modal").forEach(el => el.style.display = "flex");
            document.body.style.overflow = "hidden";
            window.fathom && fathom.trackEvent("Application Form Submit (Step: 1)");
        }
        if (e.target.closest(".application-close")) {
            document.querySelectorAll(".appplication-form-modal").forEach(el => el.style.display = "none");
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
                body: JSON.stringify({ type: "partial", formData: currentFormData, step: currentStep, timestamp: new Date().toISOString() }),
                keepalive: true
            });
        } catch (err) {
            console.error("Failed to send data before unload:", err);
        }
    });

    $('.status').val('complete');

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
            if (value !== '') {
                radioGroup.prop("checked", false);
            }
        });

        // When selecting any radio button, clear the text field
        radioGroup.on("change", function () {
            textField.val('');
        });
    }

    setupOtherFieldSync("What-s-the-1-bottleneck-in-your-business-right-now-Other", "What-s-the-1-bottleneck-in-your-business-right-now");
    setupOtherFieldSync("What-type-of-business-do-you-run-Other", "What-type-of-business-do-you-run");

}

$(document).ready(function () {
    initMultistepForm('.application-form-control');
    initMultistepForm('.application-form-variant-a');
});
