
document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('.test-form');

    forms.forEach(form => {
        const firstName = form.querySelector('#firstname');
        const lastName = form.querySelector('#lastname');
        const emailInput = form.querySelector('#email');
        const phone = form.querySelector('#phone');

        form.addEventListener('submit', e => {
            e.preventDefault();
             var data = {
                name: form.querySelector('#firstname').value, // Optional value but recommended
                email: form.querySelector('#email').value, // Required value as unique identifier
                phone_number: form.querySelector('#phone').value, // Required if used as unique identifier
                extra_field: form.querySelector('#user_country_name').value
            };

            if (RH_MFaa41f84dfb) {
                RH_MFaa41f84dfb.form.submit(data);
            }
        });
    });
});