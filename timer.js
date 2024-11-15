function checkDateAndRedirect() {
    // Set your target date here in UTC/GMT timezone
    // Format: (YYYY, MM-1, DD, HH, MM, SS)
    // Note: Month is 0-based, so January is 0, December is 11
    // const targetDate = new Date(Date.UTC(2024, 10, 1, 0, 0, 0)); // Example: November 1, 2024 at 00:00:00 UTC
    const targetDate = new Date(Date.UTC(2024, 11, 5, 13, 0, 0)); // Example: November 1, 2024 at 00:00:00 UTC            
    const currentDate = new Date();
    console.log(targetDate)
    if (currentDate >= targetDate) {
        document.body.innerHTML = '<h1 class="expired-message">This offer has passed, you will be redirected</h1>';
        document.querySelector('.expired-message').style.display = 'block';
        setTimeout(() => {
            // This is where the redirect will send the user (Default: homepage)
            window.location.href = 'https://founderos.com';
        }, 2000); // How long the "Sorry" message shows for, in milliseconds - 2000 = 2 seconds
    }
}
window.onload = checkDateAndRedirect;

// Optional: Run the check periodically (every minute)
setInterval(checkDateAndRedirect, 60000);
