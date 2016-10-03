var cursorX;
var cursorY;

$(document).mousemove(function(e){
	cursorX = e.clientX;
	cursorY = e.clientY-15;
});

var test = function(event){
	if(this.config.title){
		this.DOM.header.css({height:"30px"});
		this.DOM.title.css({height:"32px"});
	}
	else{

		this.DOM.header.css({height:"0px"});
		this.DOM.title.css({height:"0px"});
	}
	this.DOM.content.css({'max-height':document.body.clientHeight*0.8-20});
	//this.DOM.content.css({'max-width':window.width*0.8});
	this._reset();
};

var test = function(event){
	if(this.config.title){
		this.DOM.header.css({height:"30px"});
	}else{
		this.DOM.header.css({height:"0px"});
	}
};

function inputFocus(i) {
	if (i.value == i.defaultValue) { i.value = ""; i.style.color = "#000"; }
}

function inputBlur(i) {
	if (i.value == "") { i.value = i.defaultValue; i.style.color = "#666"; }
}

(function (config) {
 config['skin']='idialog';
 config['okVal'] = 'Ok';
 config['cancelVal'] = 'Cancel';
 config['title'] = '';
 config['defaultinit']=test;
 // [more..]
 })(art.dialog.defaults);

(function() {
	console.log('Getting ready.');
	window.addEventListener('Agave::ready', function() {
		console.log('Agave ready.');
		$(document).ready(function() {
			console.log('jQuery ready, starting ePlant...');
			/* Google maps initailiz */
			
			//	GoogleMapsLoader.KEY = "AIzaSyAj876MbMPM8roSi2JZFgGFUzTPpZ56kzU";
			//	GoogleMapsLoader.load(function(google) {
			Eplant.initialize();
		});

	});
})();
