(function() {
	
	/**
		* Eplant.Views.ExperimentView class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* ePlant View for browsing and choosing eFP Experiment Views
		*
		* @constructor
		* @augments Eplant.View
	*/
	Eplant.Views.HomeView = function() {
		// Get constructor
		var constructor = Eplant.Views.HomeView ;
		
		// Call parent constructor
		Eplant.View.call(this,
		constructor.viewName,			// Name of the View visible to the user
		constructor.hierarchy,			// Hierarchy of the View
		constructor.magnification,			// Magnification level of the View
		constructor.description,			// Description of the View visible to the user
		constructor.citation,			// Citation template of the View
		constructor.activeIconImageURL,		// URL for the active icon image
		constructor.availableIconImageURL,		// URL for the available icon image
		constructor.unavailableIconImageURL	// URL for the unavailable icon image
		);
		
		/* Attributes */
		this.isEntryView = true;		// Identifies this View as the entry View for ePlant
		this.isAnimating = true;		// Whether an animation is taking place
		this.viewMode='home';
		this.dom=$('#sequence');
		/* Create SelectList */
		this.isLoadedData = true;
		this.labelDom = document.createElement("div");  //remove label
		this.viewInstruction='<p>Select a gene with the box on the left, or use the Expression Angler to describe an expression pattern and find genes that match it.</p>';
		
		
	};
	ZUI.Util.inheritClass(Eplant.View, Eplant.Views.HomeView);		// Inherit parent prototype
	
	Eplant.Views.HomeView.viewName = "Welcome Screen";
	Eplant.Views.HomeView.hierarchy = "ePlant";
	Eplant.Views.HomeView.magnification = 0;
	Eplant.Views.HomeView.description = "Welcome Screen";
	Eplant.Views.HomeView.citation = "";
	Eplant.Views.HomeView.activeIconImageURL = "img/active/home.png";
	Eplant.Views.HomeView.availableIconImageURL = "img/available/home.png";
	Eplant.Views.HomeView.unavailableIconImageURL = "img/unavailable/home.png";
	Eplant.Views.HomeView.viewType = "home";
	/**
		* Active callback method.
		*
		* @override
	*/
	Eplant.Views.HomeView.prototype.active = function() {
		/* Call parent method */
		Eplant.View.prototype.active.call(this);
		$("#ZUI_container").hide();
		$("#sequence").show();
		Eplant.tutorialOn = true;
		Eplant.updateIconDock();
		
	};
	
	/**
		* Inactive callback method.
		*
		* @override
	*/
	Eplant.Views.HomeView.prototype.inactive = function() {
		/* Call parent method */
		Eplant.View.prototype.inactive.call(this);
		$("#ZUI_container").show();
		$("#sequence").hide();
		Eplant.tutorialOn = false;
		Eplant.updateIconDock();
	};
	
	/**
		* Draws the View's frame.
		*
		* @Override
	*/
	Eplant.Views.HomeView.prototype.draw = function() {
		
	};
	
	/**
		* Cleans up the View for disposal
		*
		* @override
	*/
	Eplant.Views.HomeView.prototype.remove = function() {
		
	};
	
	/**
		* Returns The exit-out animation configuration.
		*
		* @override
		* @return {Object} The exit-out animation configuration.
	*/
	Eplant.Views.HomeView.prototype.getExitOutAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitOutAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.dom).stop().animate({
				top: "250%"
			}, 1000);
			/*var cover = $('<div>').css({
				position:'absolute',
				width: "100%",
				height: "100%",
				left: "0%",
				top: "0%",
				zIndex:'1000',
				background: '#ffffff'
			})
			.appendTo('#home_container');
			Eplant.getScreenShot($('#home_container')).then(function(screenShot){
				cover.remove();
				$(screenShot).css({
					position:'absolute',
					width: "100%",
					height: "100%",
					left: "0%",
					top: "0%",
					zIndex:'1000'
				})
				.appendTo('#home_container');
				$(screenShot).animate({
					width: "0%",
					height: "0%",
					left: "50%",
					top: "50%"
					}, 1000, function() {
					$(this).remove();
				});
			});*/
		}, this);
		return config;
	};
	
	/**
		* Returns The enter-out animation configuration.
		*
		* @override
		* @return {Object} The enter-out animation configuration.
	*/
	Eplant.Views.HomeView.prototype.getEnterOutAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterOutAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.dom).css({
				top: "-250%"
			});
			$(this.dom).stop().animate({
				top: "0%"
			}, 1000);
			/*var cover = $('<div>').css({
				position:'absolute',
				width: "100%",
				height: "100%",
				left: "0%",
				top: "0%",
				zIndex:'1000',
				background: '#ffffff'
			})
			.appendTo('#home_container');
			Eplant.getScreenShot($('#home_container')).then(function(screenShot){
				cover.remove();
				$(screenShot).css({
					position:'absolute',
					width: "1000%",
					height: "1000%",
					left: "-450%",
					top: "-450%",
					zIndex:'1000'
				})
				.appendTo('#home_container');
				$(screenShot).animate({
					width: "100%",
					height: "100%",
					left: "0%",
					top: "0%"
					}, 1000, function() {
					$(this).remove();
				});
			});*/
		}, this);
		return config;
	};
	
	/**
		* Returns The exit-in animation configuration.
		*
		* @override
		* @return {Object} The exit-in animation configuration.
	*/
	Eplant.Views.HomeView.prototype.getExitInAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitInAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.dom).stop().animate({
				top: "-250%"
			}, 1000);
			/*var cover = $('<div>').css({
				position:'absolute',
				width: "100%",
				height: "100%",
				left: "0%",
				top: "0%",
				zIndex:'1000',
				background: '#ffffff'
			})
			.appendTo('#home_container');
			Eplant.getScreenShot($('#home_container')).then(function(screenShot){
				cover.remove();
				$(screenShot).css({
					position:'absolute',
					width: "100%",
					height: "100%",
					left: "0%",
					top: "0%",
					zIndex:'1000'
				})
				.appendTo('#home_container');
				$(screenShot).animate({
					width: "1000%",
					height: "1000%",
					left: "-450%",
					top: "-450%"
					}, 1000, function() {
					$(this).remove();
				});
			});*/
		}, this);
		
		return config;
	};
	
	/**
		* Returns The enter-in animation configuration.
		*
		* @override
		* @return {Object} The enter-in animation configuration.
	*/
	Eplant.Views.HomeView.prototype.getEnterInAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterInAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.dom).css({
				top: "250%"
			});
			$(this.dom).stop().animate({
				top: "0%"
			}, 1000);
			/*var cover = $('<div>').css({
				position:'absolute',
				width: "100%",
				height: "100%",
				left: "0%",
				top: "0%",
				zIndex:'1000',
				background: '#ffffff'
			})
			.appendTo('#home_container');
			Eplant.getScreenShot($('#home_container')).then(function(screenShot){
				cover.remove();
				$(screenShot).css({
					position:'absolute',
					width: "0%",
					height: "0%",
					left: "50%",
					top: "50%",
					zIndex:'1000'
				})
				.appendTo('#home_container');
				$(screenShot).animate({
					width: "100%",
					height: "100%",
					left: "0%",
					top: "0%"
					}, 1000, function() {
					$(this).remove();
				});
			});*/
		}, this);
		
		return config;
	};
	
	
	
	
})();
