$(document).ready(function () {
    
    function handleFormSubmission(formClassName) {
        $(formClassName).submit(function (e) {
            e.preventDefault();
            var form = this;

            // Get form field values
            var name = form.querySelector('input[name="first_name"]').value;
            var email = form.querySelector('input[name="email_address"]').value;
            var phone = form.querySelector('input[name="phone"]').value;

            // Log form data (for debugging)
            console.log(name + " " + email + " " + phone);
            var redirectUrl = `https://www.founderos.com/workshop-survey?first_name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`;
            window.location.href = redirectUrl;
        });
    }
    handleFormSubmission(".workshop-form-hubspot");

    // Function to play the video by resetting the iframe src
    function playVideo(iframe) {
        var iframeSrc = iframe.attr('src');
        var iframeClass = "."+iframe.attr('class')+", .video-wrapper, div";
        console.log(iframe);
        console.log(iframeClass);
        // iframe.attr('src', iframeSrc + '?autoplay=1');  
    }

    // Function to pause the video by resetting the iframe src
    function pauseVideo(iframe) {
        var iframeSrc = iframe.attr('src').split('?')[0]; // Get the base URL of the iframe
        iframe.attr('src', iframeSrc);  // Remove the autoplay parameter to stop the video
    }

    $('.sw1').on('click', function() {
        var iframe = $('.testimonial-video-1');
        playVideo(iframe);
    });

    $('.sw2').on('click', function() {
        var iframe = $('.testimonial-video-2');
        playVideo(iframe);
    });

    $('.sw3').on('click', function() {
        var iframe = $('.testimonial-video-3');
        playVideo(iframe);
    });

    $('.sw4').on('click', function() {
        var iframe = $('.testimonial-video-4');
        playVideo(iframe);
    });

    $('.sw5').on('click', function() {
        var iframe = $('.testimonial-video-5');
        playVideo(iframe);
    });

    // When ".close-modal" or ".x-modal" is clicked, pause the respective video
    $('.close-modal, .x-modal').on('click', function() {
        $('iframe.testimonial-video-1, iframe.testimonial-video-2, iframe.testimonial-video-3, iframe.testimonial-video-4, iframe.testimonial-video-5').each(function() {
            pauseVideo($(this));  // Pause each video on the page
        });
    });



    var iframe = $('iframe.testimonial-video-1')[0];

    if (iframe) { // Check if the iframe exists
        iframe.onload = function () {
            var iframeWindow = iframe.contentWindow;
            if (iframeWindow) {
                iframeWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            } else {
                console.error("Iframe contentWindow is not accessible.");
            }
        };
    } else {
        console.error("Iframe with class .testimonial-video-1 not found.");
    }


});