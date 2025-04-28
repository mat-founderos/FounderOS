$(document).ready(function () {
    
    function handleFormSubmission(formClassName) {
        $(formClassName).submit(function (e) {
            e.preventDefault();
            var form = this;

           
            var name = form.querySelector('input[name="first_name"]').value;
            var email = form.querySelector('input[name="email_address"]').value;
            var phone = form.querySelector('input[name="phone"]').value;

            
            console.log(name + " " + email + " " + phone);
            var redirectUrl = `https://www.founderos.com/workshop-survey?first_name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`;
            window.location.href = redirectUrl;
        });
    }
    handleFormSubmission(".workshop-form-hubspot");


    function playVideo(iframe) {
        var iframeSrc = iframe.attr('src');
        var iframeClass = "."+iframe.attr('class')+", .video-wrapper, div";
        console.log(iframe);
        console.log(iframeClass);
    }


    function pauseVideo(iframe) {
        var iframeSrc = iframe.attr('src').split('?')[0]; 
        iframe.attr('src', iframeSrc);
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

 
    $('.close-modal, .x-modal').on('click', function() {
        $('iframe.testimonial-video-1, iframe.testimonial-video-2, iframe.testimonial-video-3, iframe.testimonial-video-4, iframe.testimonial-video-5').each(function() {
            pauseVideo($(this));  
        });
    });



    var iframe = $('iframe.testimonial-video-1')[0];

    if (iframe) { 
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