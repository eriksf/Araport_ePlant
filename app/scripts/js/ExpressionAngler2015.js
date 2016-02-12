
// ┌─────────────────────────────────────────────────────────────────────�?\\
// �?Expression Angler 2015                                              �?\\
// ├─────────────────────────────────────────────────────────────────────�?\\
// �?JavaScript Functions                                                �?\\
// ├─────────────────────────────────────────────────────────────────────�?\\
// �?Copyright (c) 2015 Jamie Waese & Nicholas Provart                   �?\\
// �?University of Toronto                                               �?\\
// └─────────────────────────────────────────────────────────────────────�?\\


/* -------------------------------------------------- */
// figure out where user clicked on the SVG image
var clickX = 0;
var clickY = 0;
function showCoords(event) {
    alert('click!')
    clickX = event.pageX;
    clickY = event.pageY;
    //console.log("x:"+clickX+" y:"+clickY);
}


/* -------------------------------------------------- */
/*  Replace all SVG images with inline SVG
	from: http://jsfiddle.net/3jbumc07/12/ */
jQuery(document).ready(function() {
              jQuery('img.svg').each(function(){
            var $img = jQuery(this);
            var imgID = $img.attr('id');
            var imgClass = $img.attr('class');
            var imgURL = $img.attr('src');
    
            jQuery.get(imgURL, function(data) {
                // Get the SVG tag, ignore the rest
                var $svg = jQuery(data).find('svg');
    
                // Add replaced image's ID to the new SVG
                if(typeof imgID !== 'undefined') {
                    $svg = $svg.attr('id', imgID);
                }
                // Add replaced image's classes to the new SVG
                if(typeof imgClass !== 'undefined') {
                    $svg = $svg.attr('class', imgClass+' replaced-svg');
                }
                
                // Remove any invalid XML tags as per http://validator.w3.org
                $svg = $svg.removeAttr('xmlns:a');
                
                // Replace image with new SVG
                $img.replaceWith($svg);
                
                // Add an handler
                jQuery('path').each(function() {
                    // jQuery(this).click(function() {alert(jQuery(this).attr('id'));});                       
               });
            });

        });
});





/* -------------------------------------------------- */
// Open the set expression level popup at the mouse position
var activeTissue;
function setExpressionLevel(tissue, x, y) {
	activeTissue = tissue;
	//console.log(tissue+" x:"+x+" y:"+y);
	$('#setExpressionLevelPopup').popup("open", {x:clickX, y:clickY-150});
	$('#tissueName').text(tissue);
}


/* -------------------------------------------------- */
// Absolute slider
function updateSliderAbsolute(value){
	//console.log(value);
	var sum = Math.round( 255 - ((value/1000)*255) );
	var color = "rgb(255,"+sum+",0)";
	$('#sliderAbsolute').css("background-color", color);
}

/* -------------------------------------------------- */
// update SVG fill colors
function updateSVGfill() {
	console.log(activeTissue);
	var color = $('#sliderAbsolute').css("background-color");
	$('#'+activeTissue).css({ fill: color });
	
}
