window.addEventListener("message", (event) => {
    if (event.data?.meetingBookSucceeded) {
        let pageName = window.location.pathname.replace(/^\//, '') 
            .replace(/-/g, ' ') // Replace hyphens with spaces
            .replace(/\b\w/g, (char) => char.toUpperCase()) || "Unknown Page"; 
        fathom.trackEvent(`${pageName} Page HubSpot Scheduled Booking`);
        }
		
    }, false);

   function fathomFormTrackerById(id, eventName) {
      var form = document.getElementById(id);
      if (form) {
        form.addEventListener('submit', function() {
          fathom.trackEvent(eventName);
        });
      }
    }
  
  function fathomClick(selector, eventName) {
    var elements = document.querySelectorAll(selector);
    if (elements.length) {
      elements.forEach(function(element) {
        element.addEventListener('click', function() {
          fathom.trackEvent(eventName);
        });
      });
    }
  }
  function fathomClickById(id, eventName) {
    var element = document.getElementById(id);
    if (element) {
        element.addEventListener('click', function() {
            fathom.trackEvent(eventName);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
  fathomFormTrackerById('footer-newsletter', 'Footer Newsletter Form Submit');
  fathomClick('.fos-faq_item', 'FAQ Item Click');
  fathomClick('.nav-cta-primary', 'Navigation Apply Now CTA Click');
  fathomClick('.x-fl', 'Footer X Link Click');
  fathomClick('.li-fl', 'Footer LinkedIn Link Click');
  fathomClick('.yt-fl', 'Footer YouTube Link Click');
  fathomClick('.tiktok-fl', 'Footer TikTok Link Click');
  fathomClick('.ig-fl', 'Footer Instagram Link Click');
  fathomClick('.podcast-fl', 'Footer Podcast Link Click');
  fathomClick('.blog-fl', 'Footer Blog Link Click');
  fathomClick('.careers-fl', 'Footer Careers Link Click');
  fathomClick('.partners-fl', 'Footer Partners Link Click');
  fathomClick('.contact-fl', 'Footer Contact Link Click');
  fathomClick('.dmca-fl', 'Footer DMCA Link Click');
  fathomClick('.pp-fl', 'Footer Privacy Policy Link Click');
  fathomClick('.tos-fl', 'Footer Terms of Service Link Click');
  fathomClick('.newsletter-pp-link', 'Newsletter Form Privacy Policy Link Click');
  fathomClick('.newsletter-tos-link', 'Newsletter Form Terms of Service Link Click');
  fathomClick('.newsletter-footer-click', 'Footer Get the Framework Click');
  fathomClickById('nav-founderos-plus-link', 'Navigation Founder OS Plus Link Click');
  fathomClickById('nav-founderos-link', 'Navigation Founder OS Link Click');
  fathomClickById('nav-mastermind-link', 'Navigation Mastermind Link Click');
  fathomClickById('nav-blog-link', 'Navigation Blog Link Click');
  fathomClickById('nav-about-link', 'Navigation About Link Click');
  fathomClickById('nav-home-logo-link', 'Navigation Home Logo Link Click');
});