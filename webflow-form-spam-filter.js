
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

  // Wait for Webflow to load
  window.addEventListener("DOMContentLoaded", function () {
    $("form").each(function () {
      const $form = $(this);

      $form.on("submit", function (e) {
        let isSpamDetected = false;

        // Clean previous errors
        $form.find(".spam-error-message").remove();
        $form.find(".spam-error").removeClass("spam-error");

        const fields = $form.find("input:not([type='hidden']), textarea");

        fields.each(function () {
          const $field = $(this);
          const value = $field.val().trim();
          const error = isSpammyInput(value);

          if (error) {
            isSpamDetected = true;
            $field.addClass("spam-error");

            // Only add error message once
            if ($form.find(".spam-error-message").length === 0) {
              const $errorLabel = $(`<label class="spam-error-message" style="color: red; display: block; margin-bottom: 10px;">${error}</label>`);
              $form.find(".form-disclaimer-checkbox").first().before($errorLabel);
            }
          }
        });

        if (isSpamDetected) {
          e.preventDefault();        // block normal form submission
          e.stopImmediatePropagation(); // block Webflow's AJAX submission
          return false;              // explicitly stop further processing
        }
      });
    });
  });

