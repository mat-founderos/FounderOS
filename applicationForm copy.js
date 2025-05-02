let currentStep = 0;
let currentFormData = {};
$(document).ready(function () { 
    
    function r() {
        const progressPercent = (currentStep / (o - 1)) * 100; 
        e.css("width", progressPercent + "%");
        $(".multistep-progress-number").text((currentStep + 1) + "/" + o);
        $(".multistep-progress-percent").text(Math.round(progressPercent) + "%");
      }
      
      
  function i() {
    t.hide().eq(currentStep).show();
    $(".multistep-form-previous-modal").toggle(currentStep > 0);
    $(".multistep-form-next-modal").toggle(currentStep < o - 1);
  }
  function c() {
    $(".multistep-form-modal input, .multistep-form-modal select, .multistep-form-modal textarea").each(function () {
      const t = $(this).attr("name") || $(this).attr("id");
      if (t) {
        if ($(this).is(":checkbox")) {
          currentFormData[t] = $(this).prop("checked");
        } else if ($(this).is(":radio")) {
          if ($(this).prop("checked")) {
            currentFormData[t] = $(this).val();
          }
        } else {
          currentFormData[t] = $(this).val().trim();
        }
      }
    });
  }

  const webhookURL = "https://founderos.app.n8n.cloud/webhook/webhook/partial-lead";

  async function a() {
    c();
    try {
      if (!(await fetch(webhookURL, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({type: "partial", formData: currentFormData, step: currentStep, timestamp: (new Date).toISOString()})})).ok) {
        throw new Error("Failed to send partial data");
      }
    } catch (t) {
      console.error("Partial data send failed:", t);
    }
  }
  async function l(e) {
    // Prevent moving to an invalid step
    if (currentStep + e >= 0 && currentStep + e < o) {
      let o = t.eq(currentStep);
      if (e !== 1 || function (t) {
        let r = t.find("#Email");
        let i = t.find("#Phone-Number");
        let c = t.find(".multistep-form-error");
        let a = true;
        var l;
        if (r.length) {
          l = r.val().trim();
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(l)) {
            c.text("Please enter a valid email address.").show();
            a = false;
          }
        }
        if (i.length && /[a-zA-Z]/.test(i.val().trim())) {
          c.text("Phone number should not contain letters.").show();
          a = false;
        }
       
        if (a) {
          c.hide();
        }
        return a;
      }(o)) {
          currentStep += e;
        
          if (window.fathom) {
            window.trackedSteps = window.trackedSteps || new Set();
            if (!window.trackedSteps.has(currentStep)) {
              const eventLabel = `Application Form Submit (Step: ${currentStep + 1})`;
              fathom.trackEvent(eventLabel);
              window.trackedSteps.add(currentStep);
            }
          }
        
          i();
          r();
          await a();
        }
    }
  }
  const t = $(".multistep-form-step-modal ");
  const e = $(".multistep-form-progressbar-progress-modal");
  const o = t.length;
  $(".msf-button, .multistep-form-next-modal ").click(() => l(1));
  $(".multistep-form-previous-modal ").click(() => l(-1));
  $(".multistep-choice").change(function () {
    if ($("#first-question-no").is(":checked")) {
      window.location.href = "/training";
    } else {
      l(1);
    }
  });
  $("#first-question-no").on("click", function () {
    window.location.href = "/training";
  });
  i();
  r();
  $(".multistep-form-modal").submit(function (t) {
    fathom.trackEvent("Application Form Submit");
    t.preventDefault();
    c();
    let fullName = (currentFormData["Full-Name"] || "").trim();
    let [firstName, ...rest] = fullName.split(" ");
    let lastName = rest.join(" ");
    let e = encodeURIComponent(firstName);
    let l = encodeURIComponent(lastName);
    let o = encodeURIComponent(currentFormData.Email || "");
    let n = encodeURIComponent(currentFormData.phone || "");
    let r = false;
    $("input[type='radio']:checked").each(function () {
      if ($(this).data("redirection") === "intro-call") {
        r = true;
      }
    });
    let i = r ? "/intro-call" : "/call";
    window.location.href = `${i}?firstname=${e}&lastname=${l}&phone=${n}&email=${o}`;
  });
  
  document.querySelectorAll(".multistep-choice-checkbox input").forEach(t => {
    t.addEventListener("change", () => {
      const e = t.closest(".multistep-choice-checkbox");
      if (t.checked) {
        e.style.backgroundColor = "#ffffff4d";
      } else {
        e.style.backgroundColor = "";
      }
    });
  });
  
  document.querySelectorAll(".multistep-choice-last input").forEach(t => {
    t.addEventListener("change", () => {
      (function (t, e) {
        document.querySelectorAll(e).forEach(t => {
          t.style.backgroundColor = "";
        });
        const o = t.closest(e);
        if (t.checked) {
          o.style.backgroundColor = "#ffffff4d";
        }
      }(t, ".multistep-choice-last"));
      a();
    });
  });
  $(document).on("keydown", function (t) {
    if (t.key === "Enter") {
      t.preventDefault();
      $(".multistep-form-next-modal ").click();
    }
    if (t.key === "Escape") {
      document.querySelector(".appplication-form-modal").style.display = "none";
      document.body.style.overflow = "";
    }
  });
  document.addEventListener("click", function (t) {
    if (t.target.closest(".application-open")) {
        document.querySelectorAll(".appplication-form-modal").forEach(t => t.style.display = "flex");
        document.body.style.overflow = "hidden";
        if (window.fathom) {
          window.trackedSteps = window.trackedSteps || new Set();
          if (!window.trackedSteps.has(0)) {
            fathom.trackEvent("Application Form Submit (Step: 1)");
            window.trackedSteps.add(0);
          }
        }
      }
      
    if (t.target.closest(".application-close")) {
      document.querySelectorAll(".appplication-form-modal").forEach(t => t.style.display = "none");
      document.body.style.overflow = "";
    }
  });
  window.addEventListener("beforeunload", async function (t) {
    c();
    try {
      await fetch(webhookURL, {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({type: "partial", formData: currentFormData, step: currentStep, timestamp: (new Date).toISOString()}), keepalive: true});
    } catch (t) {
      console.error("Failed to send data before unload:", t);
    }
  });
  console.error = function () {};
});