document.addEventListener('DOMContentLoaded', () => {
    const steps = [...document.querySelectorAll('.multistep-form-step-newsletter')];
    const progressBar = document.querySelector('.multistep-form-progressbar-progress-newsletter');
    const modal = document.querySelector('.get-the-framework-modal-newsletter');
    const closeModalBtns = document.querySelectorAll('#blurred-bg-close-gfm-1, #close-gfm-1');
    let currentStep = 0;
  
   
  const updateStep = (dir) => {
    steps[currentStep].style.display = 'none';
    currentStep += dir;
    steps[currentStep].style.display = 'block';
    progressBar.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
  };

  steps.forEach((step, index) => {
    step.style.display = index === 0 ? 'block' : 'none';

    step.querySelector('.msf-button')?.addEventListener('click', (e) => {
      e.preventDefault();
      const inputs = [...step.querySelectorAll('input[required]')];
      const isValid = inputs.every(input => {
        const error = step.querySelector(`[data-error-for="${input.id}"]`);
        const valid = !!input.value.trim();
        error?.classList.toggle('hide', valid);
        return valid;
      });

      if (isValid && currentStep < steps.length - 1) updateStep(1);
    });

    step.querySelector('.msf-back-button')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentStep > 0) updateStep(-1);
    });
  });

  progressBar.style.width = `${((currentStep + 1) / steps.length) * 100}%`;

  
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      const step = steps[currentStep];
      const inputs = [...step.querySelectorAll('input[required]')];
      const isValid = inputs.every(input => {
        const error = step.querySelector(`[data-error-for="${input.id}"]`);
        const valid = !!input.value.trim();
        error?.classList.toggle('hide', valid);
        return valid;
      });

      if (isValid && currentStep < steps.length - 1) updateStep(1);
    }
  });


  document.querySelectorAll('.gfm-cta-newsletter').forEach(button => {
    button.addEventListener('click', () => {
      const gfmForm = document.querySelector('.gfm-form-newsletter');
      if (gfmForm) {
        gfmForm.dataset.fathom = button.dataset.fathom; 
        gfmForm.id = button.id; 
      }

      if (modal) {
        modal.style.display = 'block';
      }

      console.log('Fathom value:', button.dataset.fathom);
    });
  });


  document.querySelectorAll('.gfm-form-newsletter').forEach(form => {
    const firstName = form.querySelector('#First-Name-2');
    const emailInput = form.querySelector('#Email-3');
    const phone = form.querySelector('#phone2');

    form.addEventListener('submit', e => {
      e.preventDefault();

      const fathomValue = form.dataset.fathom;
      if (fathomValue && typeof fathom !== 'undefined') {
        fathom.trackEvent(fathomValue);
      }

      if (emailInput && firstName) {
        const query = new URLSearchParams({
          email: emailInput.value,
          firstname: firstName.value,
          phone: phone?.value || ''
        }).toString();

        location.href = `/thank-you-newsletter?${query}`;
      }
    });
  });
});
