(function() {
	
	/**
		* Eplant.Views.MoleculeView class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* ePlant view for browsing protein molecular structures and 3D annotations.
		* Uses JSmol.
		*
		* @constructor
		* @param {Eplant.GeneticElement} The GeneticElement associated with this view.
	*/
	Eplant.Views.MoleculeView = function(geneticElement) {
		// Get constructor
		var constructor = Eplant.Views.MoleculeView;
		
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
		
		// Attributes
		this.geneticElement = geneticElement;
		this.zoom = 100;
		/* Title of the view */
		/*this.viewGeneID = new ZUI.ViewObject({
			shape: "text",
			positionScale: "screen",
			sizeScale: "screen",
			x: 400,
			y: 7,
			size: 15,
			fillColor: Eplant.Color.DarkGrey,
			content: geneticElement.identifier,
			centerAt: "left top"
		});*/
		
		this.viewInstruction= "This view displays the 3D molecular structure of the protein associated with the selected gene.";
		
		this.labelDom = document.createElement("div");
		$(this.labelDom).css({
			"position": "absolute",
			"z-index": 1,
			"left":10,
			"top":10,
			"font-size":'1.5em',
			"line-height":'1.5em'
		});
		if(this.name)
		{
			this.viewNameDom = document.createElement("span");
			
			var text = this.name+': '+this.geneticElement.identifier;
			if(this.geneticElement.isRelated){
				text += ", "+this.geneticElement.identifier+" correlates to "+this.geneticElement.relatedGene.identifier+" with an r-value of "+this.geneticElement.rValueToRelatedGene;
			}
			
			this.viewNameDom.appendChild(document.createTextNode(text)); 
			$(this.viewNameDom).appendTo(this.labelDom);
		}
		
		this.defaultLoadScript =
		'isDssp = false;' +		//Turn off DSSP
		'set defaultVDW babel;' +	//Set default Van der Waals to babel
		'spacefill off;' +		//Turn off space fill
		'wireframe off;' +		//Turn off wire frame
		'cartoons on;' +		//Turn on cartoons
		'color structure;'		//Color structures
		;
		this.info = {
			width: ZUI.width,
			height: ZUI.height,
			use: "HTML5",
			j2sPath: "lib/JSmol/j2s",
			script: 'set defaultloadscript "' + this.defaultLoadScript + '";',
			disableJ2SLoadMonitor: true,
			disableInitialConsole: true
		};
		
		// define loaded function to jsmol
		Eplant.Views.MoleculeView.loadedFunctions[this.geneticElement.identifier+'_loaded']=$.proxy(this.structureLoaded,this);
		this.info.loadstructcallback = 'Eplant.Views.MoleculeView.loadedFunctions.'+this.geneticElement.identifier+'_loaded';
		
		
		this.domContainer = document.createElement("div");
		$(this.domContainer).css({
			'width':'100%',
			'height':'100%'
		});
		
		// Create JSmol applet
		
		this.applet = Jmol.getApplet(this.geneticElement.identifier+"_MoleculeViewJSmolApplet", this.info);
		$(this.domContainer).html(Jmol.getAppletHtml(this.applet));
		$(Eplant.Views.MoleculeView.domCacheContainer).append(this.domContainer);	
		// Hide JSmol
		$(Eplant.Views.MoleculeView.domContainer).css({"visibility": "hidden"});
		
		// Move JSmol to its appropriate container
		
		// Remove applet info table (not sure what this does)
		
		
		// Get the structure file name and location from JSMol.cgi webserice
		$.getJSON(Eplant.ServiceUrl + 'JSMol.cgi?agi=' + this.geneticElement.identifier, $.proxy(function(response) {
			if (response.link != "") {
				this.loadStructure(response.link);
				
			}
		},this));
		
	};
	ZUI.Util.inheritClass(Eplant.View, Eplant.Views.MoleculeView);	// Inherit parent prototype
	
	Eplant.Views.MoleculeView.viewName = "Molecule Viewer";
	Eplant.Views.MoleculeView.hierarchy = "genetic element";
	Eplant.Views.MoleculeView.magnification = 70;
	Eplant.Views.MoleculeView.description = "Molecule viewer";
	Eplant.Views.MoleculeView.citation = "";
	Eplant.Views.MoleculeView.activeIconImageURL = "app/img/active/molecule.png";
	Eplant.Views.MoleculeView.availableIconImageURL = "app/img/available/molecule.png";
	Eplant.Views.MoleculeView.unavailableIconImageURL = "app/img/unavailable/molecule.png";
	Eplant.Views.MoleculeView.viewType = "zui";
	/* Constants */
	Eplant.Views.MoleculeView.domContainer = null;		// DOM container for JSmol
	Eplant.Views.MoleculeView.applet = null;			// JSmol applet object
	Eplant.Views.MoleculeView.container = null;		// JSmol container (inside the main domContainer)
	Eplant.Views.MoleculeView.canvas = null;			// JSmol canvas
	
	/* Static methods */
	/**
		* Initializes JSmol
	*/
	Eplant.Views.MoleculeView.initialize = function() {
		// Get JSmol DOM container
		Eplant.Views.MoleculeView.domContainer = document.getElementById("JSmol_container");
		Eplant.Views.MoleculeView.domCacheContainer = document.getElementById("JSmol_cache");
		Jmol.setDocument(0);
		Eplant.Views.MoleculeView.loadedFunctions = {};
		// Define JSmol initialization info
		
		
		
	};
	
	/**
		* Loads a structure from a file URL.
		*
		* @param {String} fileURL The URL of the file containing the structure.
	*/
	Eplant.Views.MoleculeView.prototype.loadStructure = function(fileURL) {
		Jmol.script(this.applet, "load \"" + fileURL + "\";");
	};
	
	Eplant.Views.MoleculeView.prototype.structureLoaded = function() {
		// Finish loading
		this.loadFinish();
	};
	
	
	/**
		* Runs a Jmol script.
		*
		* @param {String} script The Jmol script to be run.
	*/
	Eplant.Views.MoleculeView.prototype.runScript = function(script) {
		Jmol.script(this.applet, script);
	};
	
	Eplant.Views.MoleculeView.prototype.resize = function(script) {
		Jmol.resizeApplet(this.applet, "100%");
	};
	
	
	/**
		* Gets the orientation / camera information of JSmol.
	*/
	Eplant.Views.MoleculeView.prototype.getOrientationInfo = function() {
		var orientationInfo = JSON.parse(Jmol.getPropertyAsJSON(this.applet, "orientationInfo") || "null");
		if (orientationInfo) {
			return orientationInfo.orientationInfo;
		}
		else {
			return null;
		}
	};
	
	/**
		* Active callback method.
		*
		* @override
	*/
	Eplant.Views.MoleculeView.prototype.active = function() {
		// Call parent method
		Eplant.View.prototype.active.call(this);
		
		/* Disable pointer events for ZUI canvas */
		ZUI.disablePointerEvents();
		this.resize();
		$(this.domContainer).appendTo(Eplant.Views.MoleculeView.domContainer);
		// Make JSmol visible
		$(Eplant.Views.MoleculeView.domContainer).css({"visibility": "visible"});
		// Get JSmol canvas
		var canvas = document.getElementById(this.geneticElement.identifier+"_MoleculeViewJSmolApplet_canvas2d");
		
		// Pass input events to JSmol canvas
		ZUI.passInputEvent = $.proxy(function(event) {
			var e = new Event(event.type);
			for (var key in event) {
				e[key] = event[key];
			}
			canvas.dispatchEvent(e);
		}, this);
		
		
	};
	
	/**
		* Inactive callback method.
		*
		* @override
	*/
	Eplant.Views.MoleculeView.prototype.inactive = function() {
		// Call parent method
		Eplant.View.prototype.inactive.call(this);
		
		$(this.domContainer).appendTo(Eplant.Views.MoleculeView.domCacheContainer);
		// Hide JSmol
		$(Eplant.Views.MoleculeView.domContainer).css({"visibility": "hidden"});
		
		// Stop passing input events to JSmol
		ZUI.passInputEvent = null;
	};
	
	/**
		* Returns The exit-out animation configuration.
		*
		* @override
		* @return {Object} The exit-out animation configuration.
	*/
	Eplant.Views.MoleculeView.prototype.getExitOutAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitOutAnimationConfig.call(this);
		config.draw = $.proxy(function(elapsedTime, remainingTime, view, data) {
			this.runScript("zoom " + (400 / ZUI.camera._distance * 100));
			view.draw();
		},this);
		return config;
	};
	
	/**
		* Returns The enter-in animation configuration.
		*
		* @override
		* @return {Object} The enter-in animation configuration.
	*/
	Eplant.Views.MoleculeView.prototype.getEnterInAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterInAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			this.runScript("zoom " + (400 / 10000 * 100));
		},this);
		config.draw = $.proxy(function(elapsedTime, remainingTime, view, data) {
			this.runScript("zoom " + (400 / ZUI.camera._distance * 100));
			view.draw();
		},this);
		return config;
	};
	
	/*
		* The draw function
	*/
	Eplant.Views.MoleculeView.prototype.draw = function() {
		//this.viewGeneID.draw();
		Eplant.View.prototype.draw.call(this);
	};
	
	/*
		* The remove function
	*/
	Eplant.Views.MoleculeView.prototype.remove = function() {
		//this.viewGeneID.remove();
		Eplant.View.prototype.remove.call(this);
		Eplant.Views.MoleculeView.loadedFunctions[this.geneticElement.identifier+'_loaded']=null;
	};
	Eplant.Views.MoleculeView.prototype.zoomIn = function() {
		this.zoom +=10;
		this.runScript("zoom " + this.zoom);
	};
	
	Eplant.Views.MoleculeView.prototype.zoomOut = function() {
		this.zoom -=10;
		this.runScript("zoom " + this.zoom);
	};
})();