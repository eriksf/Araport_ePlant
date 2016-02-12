$(document).ready(function(){
    var options = {
        nextButton: true,
        prevButton: true,
        pagination: true,
        animateStartingFrameIn: true,
        autoPlay: true,
        autoPlayDelay: 5000,
        preloader: true,
        pauseOnHover:true,
        preloadTheseFrames: [1],
        preloadTheseImages: [
        ]
    };
    
    var sequence = $("#sequence").sequence(options).data("sequence");

});