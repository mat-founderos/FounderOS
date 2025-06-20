
  function isSpammyInput(text) {
    const lowercase = text.toLowerCase();

    if (text.length > 150) {
     return "Please keep your response under 150 characters.";
    }

    if (/(.)\1{5,}/.test(text)) {
     return "Looks like your input has too many repeated characters. Try simplifying it.";
    }

    if (/[bcdfghjklmnpqrstvwxyz]{6,}/i.test(text) && !/\s/.test(text)) {
     return "Please check your response for missing spaces or typos.";
    }

    if (/@(tempmail|mailinator|sharklasers|guerrillamail)/i.test(lowercase)) {
     return "Please use a personal or business email, not a temporary one.";
    }

    if (/asdf|sdfg|dfgh|fghj|hjkl|qwer|zxcv/i.test(lowercase)) {
     return "Please avoid using random key patterns. Enter a meaningful response.";
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
              const $errorLabel = $(`<label class="spam-error-message" style="color: red; display: block; margin-bottom: 10px; font-weight:normal;">${error}</label>`);
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

