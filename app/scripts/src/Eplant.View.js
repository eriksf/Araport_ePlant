(function() {
	
	/**
		* Eplant.View class
		* By Hans Yu
		* 
		* Base class for all ePlant views.
		*
		* @constructor
		* @augments ZUI.View
		* @param {String} name Name of the View visible to the user.
		* @param {String} hierarchy Description of the level of hierarchy.
		* 	Can be "ePlant", "species", or "genetic element".
		* @param {Number} magnification Arbitrary magnification value of the View.
		* 	This is evaluated relative to the magnification value of other Views.
		* 	Whole number value is used to determine the magnification level of the View.
		* 	Decimal number value is used to determine the position of the View relative 
		* 	to another with the same Magnification level.
		* @param {String} description Description of the View visible to the user.
		* @param {String} citation Citation template of the View.
		* @param {String} activeIconImageURL URL of the active icon image.
		* @param {String} availableIconImageURL URL of the available icon image.
		* @param {String} unavailableIconImageURL URL of the unavailable icon image.
	*/
	Eplant.View = function(name, hierarchy, magnification, description, citation, activeIconImageURL, availableIconImageURL, unavailableIconImageURL) {
		/* Call parent constructor */
		ZUI.View.call(this);
		
		/* Store properties */
		this.name = name;				// Name of the View visible to the user
		this.hierarchy = hierarchy;			// Description of the level of hierarchy
		this.magnification = magnification;	// Arbitrary magnification value of the View
		this.description = description;		// Description of the View visible to the user
		this.citation = citation;			// Citation template of the View
		this.activeIconImageURL = activeIconImageURL;			// Image URL of the active icon
		this.availableIconImageURL = availableIconImageURL;		// Image URL of the available icon
		this.unavailableIconImageURL = unavailableIconImageURL;		// Image URL of the unavailable icon
		this.isLoadedData = false;			// Whether data is loaded
		this.viewSpecificUIButtons = [];		// Array of ViewSpecificUIButtons
		this.species = null;				// Associated Species, must define if appropriate
		this.geneticElement = null;			// Associated GeneticElement, must define if appropriate
		this.relatedTabId = null;				// Associated Tab, must define if appropriate
		this.viewGlobalConfigs = {
			
		};			// Configs needed to be stored globally
		
		/* Title of the view 
			this.viewTitle = new ZUI.ViewObject({
			shape: "text",
			positionScale: "screen",
			sizeScale: "screen",
			x: 20,
			y: 7,
			size: 15,
			fillColor: Eplant.Color.DarkGrey,
			content: this.name,
			centerAt: "left top"
		});*/
		this.labelDom = document.createElement("div");
		$(this.labelDom).css({
			"position": "absolute",
			"z-index": 1,
			"left":10,
			"top":10,
			"font-size":'1.5em',
			"line-height":'1.5em',
			"z-index":'10'
		});
		$(this.labelDom).addClass('selectable');
		if(this.name)
		{
			this.viewNameDom = document.createElement("span");
			
			var text = this.name;
			this.viewNameDom.appendChild(document.createTextNode(text)); 
			$(this.viewNameDom).appendTo(this.labelDom);
		}
		this.viewInstruction = Eplant.ViewInstructions[this.name];
	};
	ZUI.Util.inheritClass(ZUI.View, Eplant.View);	// Inherit parent prototype
	
	/**
		* Default active callback method.
		*
		* @override
	*/
	Eplant.View.prototype.active = function() {
		this.applyGlobalConfigs();
		/* Append View to History */
		if (!Eplant.history.activeItem || Eplant.history.activeItem.view != this) {
			var historyItem = new Eplant.History.Item(this);
			Eplant.history.addItem(historyItem);
		}
		
		if(this.zoomIn&&this.magnification !==35){
			$("#zoomIn").show();
			}else{
			
			$("#zoomIn").hide();
		}
		
		if(this.zoomOut&&this.magnification !==35){
			$("#zoomOut").show();
			}else{
			
			$("#zoomOut").hide();
		}
		
		/* Restore cursor */
		ZUI.container.style.cursor = "default";
		
		/* Restore camera */
		ZUI.camera.setPosition(0, 0);
		ZUI.camera.setDistance(500);
		
		/* Attach ViewSpecificUIButtons */
		for (var n = 0; n < this.viewSpecificUIButtons.length; n++) {
			var viewSpecificUIButton = this.viewSpecificUIButtons[n];
			viewSpecificUIButton.attach();
		}
		
		if(this.viewMode)
		{
			Eplant.switchViewMode(this.viewMode);
			$(Eplant.ViewModes[this.viewMode]).append(this.labelDom);
		}
		else
		{
			Eplant.switchViewMode('zui');
			$('#ZUI_container').append(this.labelDom);
		}
		
	};
	
	/**
		* Default inactive callback method.
		*
		* @override
	*/
	Eplant.View.prototype.inactive = function() {
		this.saveGlobalConfigs();
		/* Detach ViewSpecificUIButtons */
		for (var n = 0; n < this.viewSpecificUIButtons.length; n++) {
			var viewSpecificUIButton = this.viewSpecificUIButtons[n];
			viewSpecificUIButton.detach();
		}
		
		if(this.labelDom){
			$(this.labelDom).detach();
		}
		if(Eplant.instructionDialog){
			Eplant.instructionDialog.close();
			Eplant.instructionDialog=null;
		}
	};
	
	/**
		* Default beforeInactive callback method.
		*
		* @override
	*/
	Eplant.View.prototype.beforeInactive = function() {
		if(this.instructionDialog){
			this.instructionDialog.close();
			this.instructionDialog=null;
		}
	};
	
	/**
		* Default beforeInactive callback method.
		*
		* @override
	*/
	Eplant.View.prototype.afterActive = function() {
		if(Eplant.showViewIntruction&&!Eplant.viewInstructions[this.magnification]){
			if(this.viewInstruction){
				var content = $('<div>').addClass('viewInstruction').html(this.viewInstruction)[0];
				this.instructionDialog = DialogManager.artDialogBottom(content);
				
				
				Eplant.viewInstructions[this.magnification] = true;
			}else if(this.magnification==35)
			{
				
				var content = $('<div>').addClass('viewInstruction').html(Eplant.ViewInstructions['Experimental Viewer'])[0];
				this.instructionDialog = DialogManager.artDialogBottom(content);
				Eplant.viewInstructions[35] = true;
				
			}
		}
		
	};
	
	
	/**
		* Default initializeGlobalConfigs callback method.
		*
	* @override
	*/
	Eplant.View.prototype.initializeGlobalConfigs = function() {
		if(this.name&& !Eplant.globalViewConfigs[this.name])
		{
			Eplant.globalViewConfigs[this.name]={};
			for (var config in this.viewGlobalConfigs) {
		if (!Eplant.globalViewConfigs[this.name].hasOwnProperty(config)) {
		Eplant.globalViewConfigs[this.name][config] = this.viewGlobalConfigs[config];
			}
			}
		}
	};
	
	/**
		* Default applyGlobalConfigs callback method.
		*
		* @override
	*/
	Eplant.View.prototype.applyGlobalConfigs = function() {
		if(!Eplant.globalViewConfigs[this.name])
		{
			this.initializeGlobalConfigs();
		}
		if(this.name&&Eplant.globalViewConfigs[this.name])
		{
			for (var config in Eplant.globalViewConfigs[this.name]) {
				if (Eplant.globalViewConfigs[this.name].hasOwnProperty(config)) {
					this[config] = Eplant.globalViewConfigs[this.name][config];
				}
			}
		}
		
		if (Eplant.globalViewConfigs[this.name].viewSpecificUIButtonImages) {
			for(var i =0;i<this.viewSpecificUIButtons.length;i++){
				var viewSpecificUIButton = this.viewSpecificUIButtons[i];
				viewSpecificUIButton.setImageSource(Eplant.globalViewConfigs[this.name].viewSpecificUIButtonImages[i]);
			}
		}
		
	};
	
	/**
		* Default saveGlobalConfigs callback method.
		*
		* @override
	*/
	Eplant.View.prototype.saveGlobalConfigs = function() {
		if(!Eplant.globalViewConfigs[this.name])
		{
			this.initializeGlobalConfigs();
		}
		if(this.name&&Eplant.globalViewConfigs[this.name])
		{
			for (var config in Eplant.globalViewConfigs[this.name]) {
				if (Eplant.globalViewConfigs[this.name].hasOwnProperty(config)) {
					Eplant.globalViewConfigs[this.name][config] = this[config];
				}
			}
		}
		
		if (this.viewSpecificUIButtons) {
			Eplant.globalViewConfigs[this.name].viewSpecificUIButtonImages = [];
			for(var i =0;i<this.viewSpecificUIButtons.length;i++){
				var viewSpecificUIButton = this.viewSpecificUIButtons[i];
				Eplant.globalViewConfigs[this.name].viewSpecificUIButtonImages.push(viewSpecificUIButton.imageSource);
			}
		}
	};
	
	/**
		* Default method for drawing the View's frame.
		*
		* @override
	*/
	Eplant.View.prototype.draw = function() {
		//this.viewTitle.draw();
		
		/* Update camera */
		ZUI.camera.update();
	};
	
	/**
		* Default method for removing the View.
		*
		* @override
	*/
	Eplant.View.prototype.remove = function() {
		/* Clear ViewObjects array */
		//this.viewTitle.remove();
		this.viewObjects = [];
		
		/* Remove ViewSpecificUIButtons */
		for (var n = 0; n < this.viewSpecificUIButtons.length; n++) {
			var viewSpecificUIButton = this.viewSpecificUIButtons[n];
			viewSpecificUIButton.remove();
		}
	};
	
	/**
		* Saves the current session.
		* Should be overrided if needed.
	*/
	Eplant.View.prototype.saveSession = function() {
	};
	
	/**
		* Loads saved session.
		* Should be overrided if needed.
	*/
	Eplant.View.prototype.loadSession = function(sessionData) {
	};
	
	/**
		* This method should be called when the View finishes loading.
		* If no loading is required, call this method in the constructor.
	*/
	Eplant.View.prototype.loadFinish = function() {
		/* Set load status */
		this.isLoadedData = true;
		
		/* Fire event to signal loading is finished */
		var event = new ZUI.Event("view-loaded", this, null);
		ZUI.fireEvent(event);
	};
	
	/**
		* Default method for grabbing the View's screen.
		*
		* @return {DOMString}
	*/
	Eplant.View.prototype.getViewScreen = function() {
		return ZUI.canvas.toDataURL();
	};
	
	/**
		* Returns the default exit-out animation configuration.
		*
		* @return {Object} The default exit-out animation configuration.
	*/
	Eplant.View.prototype.getExitOutAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.75, 0, 0.75, 0.9],
			targetX: 0,
			targetY: 0,
			targetDistance: 10000,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default enter-out animation configuration.
		*
		* @return {Object} The default enter-out animation configuration.
	*/
	Eplant.View.prototype.getEnterOutAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.25, 0.1, 0.25, 1],
			sourceX: 0,
			sourceY: 0,
			sourceDistance: 0,
			targetX: 0,
			targetY: 0,
			targetDistance: 500,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default exit-in animation configuration.
		*
		* @return {Object} The default exit-in animation configuration.
	*/
	Eplant.View.prototype.getExitInAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.75, 0, 0.75, 0.9],
			targetX: 0,
			targetY: 0,
			targetDistance: 0,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default enter-in animation configuration.
		*
		* @return {Object} The default enter-in animation configuration.
	*/
	Eplant.View.prototype.getEnterInAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.25, 0.1, 0.25, 1],
			sourceX: 0,
			sourceY: 0,
			sourceDistance: 10000,
			targetX: 0,
			targetY: 0,
			targetDistance: 500,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default exit-right animation configuration.
		*
		* @return {Object} The default exit-right animation configuration.
	*/
	Eplant.View.prototype.getExitRightAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.75, 0, 0.75, 0.9],
			targetX: ZUI.camera._x + 900,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default enter-right animation configuration.
		*
		* @return {Object} The default enter-right animation configuration.
	*/
	Eplant.View.prototype.getEnterRightAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.75, 0, 0.75, 0.9],
			sourceX: -900,
			sourceY: 0,
			sourceDistance: 500,
			targetX: 0,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default exit-left animation configuration.
		*
		* @return {Object} The default exit-left animation configuration.
	*/
	Eplant.View.prototype.getExitLeftAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.75, 0, 0.75, 0.9],
			targetX: ZUI.camera._x - 900,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default enter-left animation configuration.
		*
		* @return {Object} The default enter-left animation configuration.
	*/
	Eplant.View.prototype.getEnterLeftAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000,
			bezier: [0.75, 0, 0.75, 0.9],
			sourceX: 900,
			sourceY: 0,
			sourceDistance: 500,
			targetX: 0,
			draw: function(elapsedTime, remainingTime, view, data) {
				view.draw();
			}
		};
	};
	
	/**
		* Returns the default exit-right animation configuration.
		*
		* @return {Object} The default exit-right animation configuration.
	*/
	Eplant.View.prototype.getExitUpAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000
		};
	};
	
	/**
		* Returns the default enter-right animation configuration.
		*
		* @return {Object} The default enter-right animation configuration.
	*/
	Eplant.View.prototype.getEnterUpAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000
		};
	};
	
	/**
		* Returns the default exit-left animation configuration.
		*
		* @return {Object} The default exit-left animation configuration.
	*/
	Eplant.View.prototype.getExitDownAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000
		};
	};
	
	/**
		* Returns the default enter-left animation configuration.
		*
		* @return {Object} The default enter-left animation configuration.
	*/
	Eplant.View.prototype.getEnterDownAnimationConfig = function() {
		return {
			type: "zoom",
			view: this,
			duration: 1000
		};
	};
	
	
})();
