$(document).ready(function() {
    
$('.logo-carousel').owlCarousel({
				autoWidth:true,
        margin:80,
        loop:true,
        nav: false,
        items:8,
        autoplay:true,
      	autoPlayTimeout:1,
      	autoplaySpeed:6000,
        autoplayHoverPause:false,
        slideTransition: 'linear',
        responsive: {
            0: {
                margin: 30
            },
            768: {
                margin: 80
            }
        }
    })
 });
