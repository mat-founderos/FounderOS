document.addEventListener('DOMContentLoaded', () => {
  const steps = [...document.querySelectorAll('.multistep-form-step')];
  const progressBar = document.querySelector('.multistep-form-progressbar-progress');
  const modal = document.querySelector('.get-the-framework-modal');
  const closeModalBtns = document.querySelectorAll('#blurred-bg-close-gfm, #close-gfm');
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

  // Close modal
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


  document.querySelectorAll('.gtf-cta').forEach(button => {
    button.addEventListener('click', () => {
      const gfmForm = document.querySelector('.gfm-form');
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


  document.querySelectorAll('.gfm-form').forEach(form => {
    const firstName = form.querySelector('#First-Name');
    const emailInput = form.querySelector('#Email');
    const phone = form.querySelector('#phone');

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
