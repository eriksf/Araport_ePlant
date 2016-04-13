var test = function(event){
	if(this.config.title){
		this.DOM.header.css({height:"30px"});
	}else{
		this.DOM.header.css({height:"0px"});
	}
};
(function (config) {
 config['skin']='idialog';
 config['okVal'] = 'Ok';
 config['cancelVal'] = 'Cancel';
 config['title'] = '';
 config['defaultinit']=test;
 // [more..]
 })(art.dialog.defaults);
window.addEventListener('Agave::ready', function() {
	Eplant.initialize();
});
