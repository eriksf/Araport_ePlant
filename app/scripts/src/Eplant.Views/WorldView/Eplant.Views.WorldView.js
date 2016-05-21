(function() {
	
	/**
		* Eplant.Views.WorldView class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* ePlant View for browsing gene expression data of plant tissues during development as eFP.
		*
		* @constructor
		* @augments Eplant.BaseViews.EFPViewJson
		* @param {Eplant.GeneticElement} geneticElement The GeneticElement associated with this view.
	*/
	Eplant.Views.WorldView = function(geneticElement) {
		// Get constructor
		var constructor = Eplant.Views.WorldView;
		
		// Call parent constructor
		Eplant.View.call(this,
		constructor.viewName,				// Name of the View visible to the user
		constructor.hierarchy,			// Hierarchy of the View
		constructor.magnification,			// Magnification level of the View
		constructor.description,			// Description of the View visible to the user
		constructor.citation,			// Citation template of the View
		constructor.activeIconImageURL,		// URL for the active icon image
		constructor.availableIconImageURL,		// URL for the available icon image
		constructor.unavailableIconImageURL	// URL for the unavailable icon image
		);
		
		// Call eFP constructor
		var efpURL = 'app/data/world/' + geneticElement.species.scientificName.replace(' ', '_') + '.json';
		Eplant.BaseViews.EFPViewJson.call(this, geneticElement, efpURL, {
		});
		
		/* Attributes */
		this.zooming=false;
		this.markerIcon = null;		// Marker icon definition
		this.viewGlobalConfigs = {
        	isMaskOn:false, // Whether masking is on
        	maskThreshold:1, // Masking threshold
        	compareEFPView : null, // EFP view for comparing to
			maskColor :  "#B4B4B4", // Mask color
			errorColor : "#FFFFFF", // Error color
        	mode : "absolute", // EFP mode
			left: 0,
			top:0,
			width:'auto',
			height:'auto',
			zoom:2,
			center: new google.maps.LatLng(25, 0)
			
		};
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
	};
	ZUI.Util.inheritClass(Eplant.BaseViews.EFPViewJson, Eplant.Views.WorldView);	// Inherit parent prototype
	
	/* Define ePlant View properties */
	Eplant.Views.WorldView.viewName = "World eFP";		// Name of the View visible to the user
	Eplant.Views.WorldView.hierarchy = "genetic element";	// Hierarchy of the View
	Eplant.Views.WorldView.magnification = 10;			// Magnification level of the View
	Eplant.Views.WorldView.description = "World eFP viewer";	// Description of the View visible to the user
	Eplant.Views.WorldView.citaiton = "";			// Citation template of the View
	Eplant.Views.WorldView.activeIconImageURL = "app/img/active/world.png";		// URL for the active icon image
	Eplant.Views.WorldView.availableIconImageURL = "app/img/available/world.png";		// URL for the available icon image
	Eplant.Views.WorldView.unavailableIconImageURL = "app/img/unavailable/world.png";	// URL for the unavailable icon image
	Eplant.Views.WorldView.viewType = "zui";
	/* Static constants */
	Eplant.Views.WorldView.map = null;			// GoogleMaps object
	Eplant.Views.WorldView.domContainer = null;	// DOM container for GoogleMaps
	
	
	/* Static methods */
	Eplant.Views.WorldView.initialize = function() {
		/* Get GoogleMaps DOM container */
		//Eplant.Views.WorldView.domContainer = document.getElementById("map_container");
		Eplant.Views.WorldView.domContainer = document.getElementById("World_container");	
		/*$(Eplant.Views.WorldView.domContainer).css({
			width:'100%',
			height:'100%',
			position:'absolute',
			left:0,
			top:0,
			opacity:0.99
		});*/
		$(Eplant.Views.WorldView.domContainer).css({"visibility": "hidden"});
		//$(Eplant.Views.WorldView.domContainer).insertBefore(ZUI.canvas);
		/* Create GoogleMaps object */
		Eplant.Views.WorldView.map = new google.maps.Map(Eplant.Views.WorldView.domContainer, {
			center: new google.maps.LatLng(25, 0),
			zoom: 2,
			streetViewControl: false
		});
		
		google.maps.event.addListener(Eplant.Views.WorldView.map, 'zoom_changed', function(event) {
            Eplant.Views.WorldView.map.zooming = false;
		});
	};
	
	/**
		* Active callback method.
		*
		* @override
	*/
	Eplant.Views.WorldView.prototype.active = function() {
		/* Call parent method */
		Eplant.BaseViews.EFPViewJson.prototype.active.call(this);
		
		/* Show map */
		$(Eplant.Views.WorldView.domContainer).css({"visibility": "visible"});
		//$(Eplant.Views.WorldView.domContainer).insertBefore(ZUI.canvas);
		
		//hacky, resize to fix the issue
		//google.maps.event.trigger(Eplant.Views.WorldView.map, 'resize');
		/* Reset map zoom and position 
			
			if(Eplant.globalViewConfigs[this.name].center){
			Eplant.Views.WorldView.map.setCenter(new google.maps.LatLng(
			Eplant.globalViewConfigs[this.name].center.k,
			Eplant.globalViewConfigs[this.name].center.D));
			}
			else{
			Eplant.Views.WorldView.map.setCenter(new google.maps.LatLng(25,0));
			}
			if(Eplant.globalViewConfigs[this.name].zoom){
			Eplant.Views.WorldView.map.setZoom(Eplant.globalViewConfigs[this.name].zoom);
			}
			else{
			Eplant.Views.WorldView.map.setZoom(2);
		}*/
		
		/* Insert markers */
		for (var n = 0; n < this.groups.length; n++) {
			var group = this.groups[n];
			group.marker.setMap(Eplant.Views.WorldView.map);
		}
		$(Eplant.Views.WorldView.domContainer).append(this.labelDom);
		
	};
	
	/**
		* Inactive callback method.
		*
		* @override
	*/
	Eplant.Views.WorldView.prototype.inactive = function() {
		/* Call parent method */
		Eplant.BaseViews.EFPViewJson.prototype.inactive.call(this);
		
		/* Hide map */
		$(Eplant.Views.WorldView.domContainer).css({"visibility": "hidden"});
		//$(Eplant.Views.WorldView.domContainer).detach();
		/* Remove markers */
		for (var n = 0; n < this.groups.length; n++) {
			var group = this.groups[n];
			group.marker.setMap(null);
		}
		
	};
	
	/**
		* Default applyGlobalConfigs callback method.
		*
		* @override
	*/
	/*
		Eplant.Views.WorldView.prototype.applyGlobalConfigs = function() {
        Eplant.View.prototype.applyGlobalConfigs.call(this);
		if(Eplant.globalViewConfigs[this.name].center){
		Eplant.Views.WorldView.map.setCenter(new google.maps.LatLng(
		Eplant.globalViewConfigs[this.name].center.k,
		Eplant.globalViewConfigs[this.name].center.D));
		}
		if(Eplant.globalViewConfigs[this.name].zoom){
		var zoom = Eplant.globalViewConfigs[this.name].zoom;
		Eplant.Views.WorldView.map.setZoom(zoom);
		}
		};
	*/
	/**
		* Default saveGlobalConfigs callback method.
		*
		* @override
	*/
	/*
		Eplant.Views.WorldView.prototype.saveGlobalConfigs = function() {
		Eplant.View.prototype.saveGlobalConfigs.call(this);
		var center = Eplant.Views.WorldView.map.getCenter();
		Eplant.globalViewConfigs[this.name].center = center;
		var zoom = Eplant.Views.WorldView.map.getZoom();
		Eplant.globalViewConfigs[this.name].zoom = zoom===0?0.01:zoom;
		
		};
	*/
	/**
		* Draw callback method.
		*
		* @override
	*/
	Eplant.Views.WorldView.prototype.draw = function() {
		/* Call parent method */
		Eplant.View.prototype.draw.call(this);
		
		/* Draw tags */
		for (var n = 0; n < this.tagVOs.length; n++) {
			var tagVO = this.tagVOs[n];
			tagVO.draw();
		}
	};
	
	/**
		* Clean up view.
		*
		* @override
	*/
	Eplant.Views.WorldView.prototype.remove = function() {
		/* Remove gene id */
		this.viewGeneID.remove();
		/* Call parent method */
		Eplant.View.prototype.remove.call(this);
		
		/* Remove ViewObjects */
		for (var n = 0; n < this.tagVOs.length; n++) {
			var tagVO = this.tagVOs[n];
			tagVO.remove();
		}
		
		/* Remove legend */
		this.legend.remove();
		
		/* Remove EventListeners */
		ZUI.removeEventListener(this.updateAnnotationTagsEventListener);
	};
	
	/**
		* MouseMove callback method.
		*
		* @override
	*/
	Eplant.Views.WorldView.prototype.mouseMove = function() {
	};
	
	/**
		* MouseWheel callback method.
		*
		* @override
	*/
	Eplant.Views.WorldView.prototype.mouseWheel = function() {
	};
	
	/**
		* Loads eFP definition and data.
		*
		* @override
	*/
	Eplant.Views.WorldView.prototype.loadData = function() {
		
		var mouse = {x: 0, y: 0};
		
		document.addEventListener('mousemove', function(e){ 
			mouse.x = e.clientX || e.pageX; 
			mouse.y = e.clientY || e.pageY 
		}, false);
		
		/* Get eFP definition */
		$.getJSON(this.efpURL, $.proxy(function(response) {
			/* Get web service URL */
			this.webService = response.webService;

			/* Override for Araport */
			this.webservice = Eplant.ServiceUrl + 'worldefp.cgi';
			
			/* Get marker shape */
			this.markerIcon = response.marker;
			
			/* Prepare array for samples loading */
			var samples = [];
			
			/* Create groups */
			this.groups = [];
			for (var n = 0; n < response.groups.length; n++) {
				/* Get group data */
				var groupData = response.groups[n];
				Eplant.queue.add(function(){
					/* Create group object */
					var group = {
						id: this.groupData.id,
						samples: [],
						ctrlSamples: [],
						source: this.groupData.source,
						color: Eplant.Color.White,
						isHighlight: false,
						position: {
							lat: this.groupData.position.lat,
							lng: this.groupData.position.lng
						},
						tooltip: null
					};
					
					/* Prepare wrapper object for proxy */
					var wrapper = {
						group: group,
						eFPView: this.view
					};
					
					/* Create marker */
					group.marker = new google.maps.Marker({
						position: new google.maps.LatLng(group.position.lat, group.position.lng),
						icon: this.view.getMarkerIcon(group.color)
					});
					group.marker.data = group;
					
					/* Bind mouseover event for marker */
					google.maps.event.addListener(group.marker, "mouseover", $.proxy(function(event) {
						
						var tooltipContent = "";
						if (this.eFPView.mode == "absolute") {
							tooltipContent = this.group.id + 
							"<br>Mean: " + (+parseFloat(this.group.mean).toFixed(2)) + 
							"<br>Standard error: " + (+parseFloat(this.group.stdev).toFixed(2)) + 
							"<br>Sample size: " + this.group.n;
						}
						else if (this.eFPView.mode == "relative") {
							tooltipContent = this.group.id + 
							"<br>Log2 value: " + (+parseFloat(ZUI.Math.log(this.group.mean / this.group.ctrlMean, 2)).toFixed(2)) + 
							"<br>Fold difference: " + (+parseFloat(this.group.mean / this.group.ctrlMean).toFixed(2));
						}
						else if (this.eFPView.mode == "compare") {
							var index = this.eFPView.groups.indexOf(this.group);
							var compareGroup = this.eFPView.compareEFPView.groups[index];
							tooltipContent = this.group.id + 
							"<br>Log2 value: " + (+parseFloat(ZUI.Math.log(this.group.mean / compareGroup.group.mean, 2)).toFixed(2)) + 
							"<br>Fold difference: " + (+parseFloat(this.group.mean / compareGroup.group.mean).toFixed(2));
						}
						this.group.tooltip = new Eplant.Tooltip({
							content: tooltipContent,
							x:mouse.x,
							y:mouse.y+20
						});
						
					}, wrapper));
					
					google.maps.event.addListener(group.marker, "mousemove", $.proxy(function(event) {
						if (this.group.tooltip) {
							this.group.tooltip.changeTooltipPosition(						
							{clientX:mouse.x,
							clientY:mouse.y+20});
						}
						
						
					}, wrapper));
					
					/* Bind mouseout event for marker */
					google.maps.event.addListener(group.marker, "mouseout", $.proxy(function() {
						if (this.group.tooltip) {
							this.group.tooltip.close();
							this.group.tooltip = null;
						}
					}, wrapper));
					
					/* Prepare samples */
					for (var m = 0; m < this.groupData.samples.length; m++) {
						var sample = {
							name: this.groupData.samples[m],
							value: null
						};
						samples.push(sample);
						group.samples.push(sample);
					}
					
					/* Asher: The new style of control */
					if (this.groupData.ctrlSamples !== undefined) {
						for (var m = 0; m < this.groupData.ctrlSamples.length; m++) {
							var sample = {
								name: this.groupData.ctrlSamples[m],
								value: null
							};
							
							/* Add to the sample array */
							samples.push(sample);
							group.ctrlSamples.push(sample);
						}
					}
					
					/* Append group to array */
					this.view.groups.push(group);
				},{view:this,groupData:groupData});
			}
			
			Eplant.queue.add(function(){
				/* Insert markers to map if this view is active */
				if (ZUI.activeView == this) {
					for (var n = 0; n < this.groups.length; n++) {
						var group = this.groups[n];
						group.marker.setMap(Eplant.Views.WorldView.map);
						
					}
				}
				
				/* Get sample values */
				/* Get sample names */
				var sampleNames = [];
				for (var n = 0; n < samples.length; n++) {
					sampleNames.push(samples[n].name);
				}
				/* Prepare wrapper for proxy */
				var wrapper = {
					samples: samples,
					eFPView: this
				};
				/* Query */
				$.ajax({
					beforeSend: function(request) {
						request.setRequestHeader('Authorization', 'Bearer ' + Agave.token.accessToken);
					},
					dataType: "json",
					async: false,
					cache: false,
					url: this.webService + "id=" + this.geneticElement.identifier + "&samples=" + JSON.stringify(sampleNames), 
					ssuccess: $.proxy(function(response) {
						/* Match results with samples and copy values to samples */
						for (var n = 0; n < this.samples.length; n++) {
							for (var m = 0; m < response.length; m++) {
								if (this.samples[n].name == response[m].name) {
									this.samples[n].value = Number(response[m].value);
									break;
								}
							}
						}
						
						/* Process values */
						this.eFPView.processValues();
						
						/* Update eFP */
						//this.eFPView.updateDisplay();
						Eplant.queue.add(this.eFPView.updateDisplay, this.eFPView);
						
						/* Finish loading */
						//this.eFPView.loadFinish();
						Eplant.queue.add(this.eFPView.loadFinish, this.eFPView);
					
					}, wrapper)
				});
			},this)
		}, this));
	};
	
	/**
		* Updates eFP.
		*
		* @override
	*/
	Eplant.Views.WorldView.prototype.updateDisplay = function() {
		/* Return if data are not loaded */
		if (!this.isLoadedData) {
			return;
		}
		
		/* Update eFP */
		if (this.mode == "absolute") {
			/* Find maximum value */
			var max = this.groups[0].mean;
			for (var n = 1; n < this.groups.length; n++) {
				var group = this.groups[n];
				if (group.mean > max) {
					max = group.mean;
				}
			}
			
			/* Color groups */
			var minColor = ZUI.Util.getColorComponents(Eplant.midColor);
			var maxColor = ZUI.Util.getColorComponents(Eplant.maxColor);
			for (var n = 0; n < this.groups.length; n++) {
				/* Get group */
				var group = this.groups[n];
				
				/* Get value ratio relative to maximum */
				var ratio = group.mean / max;
				
				/* Check whether ratio is invalid */
				if (isNaN(ratio) || !isFinite(ratio)) {		// Invalid
					group.color = this.errorColor;
				}
				else {		// Valid
					var red = minColor.red + Math.round((maxColor.red - minColor.red) * ratio);
					var green = minColor.green + Math.round((maxColor.green - minColor.green) * ratio);
					var blue = minColor.blue + Math.round((maxColor.blue - minColor.blue) * ratio);
					group.color = ZUI.Util.makeColorString(red, green, blue);
				}
				
				/* Set color of ViewObject */
				group.marker.setIcon(this.getMarkerIcon(group.color));
			}
		}
		else if (this.mode == "relative") {
			/* Find extremum log2 value */
			var extremum = Math.abs(ZUI.Math.log(this.groups[0].mean / this.groups[0].ctrlMean, 2));
			for (var n = 1; n < this.groups.length; n++) {
				var group = this.groups[n];
				var absLog2Value = Math.abs(ZUI.Math.log(group.mean / group.ctrlMean, 2));
				if (absLog2Value > extremum) {
					extremum = absLog2Value;
				}
			}
			
			/* Color groups */
			var minColor = ZUI.Util.getColorComponents(Eplant.minColor);
			var midColor = ZUI.Util.getColorComponents(Eplant.midColor);
			var maxColor = ZUI.Util.getColorComponents(Eplant.maxColor);
			for (var n = 0; n < this.groups.length; n++) {
				/* Get group */
				var group = this.groups[n];
				
				/* Get log2 value relative to control */
				var log2Value = ZUI.Math.log(group.mean / group.ctrlMean, 2);
				
				/* Get log2 value ratio relative to extremum */
				var ratio = log2Value / extremum;
				
				/* Check whether ratio is invalid */
				if (isNaN(ratio) || !isFinite(ratio)) {		// Invalid
					group.color = this.errorColor;
				}
				else {		// Valid
					var color1, color2;
					if (ratio < 0) {
						color1 = midColor;
						color2 = minColor;
						ratio *= -1;
					}
					else {
						color1 = midColor;
						color2 = maxColor;
					}
					var red = color1.red + Math.round((color2.red - color1.red) * ratio);
					var green = color1.green + Math.round((color2.green - color1.green) * ratio);
					var blue = color1.blue + Math.round((color2.blue - color1.blue) * ratio);
					group.color = ZUI.Util.makeColorString(red, green, blue);
				}
				
				/* Set color of ViewObject */
				group.marker.setIcon(this.getMarkerIcon(group.color));
			}
		}
		else if (this.mode == "compare") {
			/* Find extremum log2 value */
			var extremum = Math.abs(ZUI.Math.log(this.groups[0].mean / this.compareEFPView.groups[0].mean, 2));
			for (var n = 1; n < this.groups.length; n++) {
				var group = this.groups[n];
				var compareGroup = this.compareEFPView.groups[n];
				var absLog2Value = Math.abs(ZUI.Math.log(group.mean / compareGroup.mean, 2));
				if (absLog2Value > extremum) {
					extremum = absLog2Value;
				}
			}
			
			/* Color groups */
			var minColor = ZUI.Util.getColorComponents(Eplant.minColor);
			var midColor = ZUI.Util.getColorComponents(Eplant.midColor);
			var maxColor = ZUI.Util.getColorComponents(Eplant.maxColor);
			for (var n = 0; n < this.groups.length; n++) {
				/* Get group */
				var group = this.groups[n];
				var compareGroup = this.compareEFPView.groups[n];
				
				/* Get log2 value relative to control */
				var log2Value = ZUI.Math.log(group.mean / compareGroup.mean, 2);
				
				/* Get log2 value ratio relative to extremum */
				var ratio = log2Value / extremum;
				
				/* Check whether ratio is invalid */
				if (isNaN(ratio) || !isFinite(ratio)) {		// Invalid
					group.color = this.errorColor;
				}
				else {		// Valid
					var color1, color2;
					if (ratio < 0) {
						color1 = midColor;
						color2 = minColor;
						ratio *= -1;
					}
					else {
						color1 = midColor;
						color2 = maxColor;
					}
					var red = color1.red + Math.round((color2.red - color1.red) * ratio);
					var green = color1.green + Math.round((color2.green - color1.green) * ratio);
					var blue = color1.blue + Math.round((color2.blue - color1.blue) * ratio);
					group.color = ZUI.Util.makeColorString(red, green, blue);
				}
				
				/* Set color of ViewObject */
				group.marker.setIcon(this.getMarkerIcon(group.color));
			}
		}
		
		/* Apply masking */
		if (this.isMaskOn) {
			for (var n = 0; n < this.groups.length; n++) {
				var group = this.groups[n];
				if (isNaN(group.sterror) || group.sterror >= group.mean * this.maskThreshold) {
					group.color = this.maskColor;
					group.marker.setIcon(this.getMarkerIcon(group.color));
				}
			}
		}
		
		/* Update legend */
		this.legend.update();
	};
	
	/**
		* Returns the data URL of an icon image.
		*
		* @param {String} color Color of the icon image.
		* @return {DOMString} Data URL of the icon image.
	*/
	Eplant.Views.WorldView.prototype.getMarkerIcon = function(color) {
		var _color = color;
		if (_color[0] == "#") _color = _color.substring(1);
		if (this.markerIcon) {
			var canvas = document.createElement("canvas");
			canvas.width = this.markerIcon.width;
			canvas.height = this.markerIcon.height;
			var context = canvas.getContext("2d");
			context.beginPath();
			for (var n = 0; n < this.markerIcon.paths.length; n++) {
				var instructions = ZUI.Parser.pathToObj(this.markerIcon.paths[n]);
				for (var m = 0; m < instructions.length; m++) {
					var instruction = instructions[m];
					context[instruction.instruction].apply(context, instruction.args);
				}
			}
			context.strokeStyle = "none";
			//context.stroke();
			context.fillStyle = color;
			context.fill();
			
			return canvas.toDataURL("image/png");
		}
		else {
			return "http://chart.apis.google.com/chart?chst=d_map_pin_letter&chld=%E2%80%A2|" + _color;
		}
	};
	
	/**
		* Grabs the View's screen.
		*
		* @override
		* @return {DOMString}
	*/
	Eplant.Views.WorldView.prototype.getViewScreen = function() {
		return null;
	};
	
	/**
		* Returns the enter-out animation configuration.
		*
		* @override
		* @return {Object} The default enter-out animation configuration.
	*/
	Eplant.Views.WorldView.prototype.getEnterOutAnimationConfig = function() {
		/* Get default configuration */
		var config = Eplant.View.prototype.getEnterOutAnimationConfig.call(this);
		
		/* Modify configuration */
		config.begin = function() {
			Eplant.Views.WorldView.map.setCenter(new google.maps.LatLng(25, 0));
			Eplant.Views.WorldView.map.setZoom(21);
		};
		config.draw = function(elapsedTime, remainingTime, view, data) {
			var zoom = Math.round((21 - 2) * remainingTime / (elapsedTime + remainingTime) + 2);
			Eplant.Views.WorldView.map.setZoom(zoom);
		};
		config.end = function() {
			Eplant.Views.WorldView.map.setZoom(2);
		};
		
		/* Return configuration */
		return config;
	};
	
	/**
		* Returns the exit-in animation configuration.
		*
		* @override
		* @return {Object} The default exit-in animation configuration.
	*/
	Eplant.Views.WorldView.prototype.getExitInAnimationConfig = function() {
		/* Get default configuration */
		var config = Eplant.View.prototype.getExitInAnimationConfig.call(this);
		
		/* Modify configuration */
		config.data = {
			sourceZoom: Eplant.Views.WorldView.map.getZoom()
		};
		config.draw = function(elapsedTime, remainingTime, view, data) {
			var zoom = Math.round((21 - data.sourceZoom) * elapsedTime / (elapsedTime + remainingTime) + data.sourceZoom);
			Eplant.Views.WorldView.map.setZoom(zoom);
		};
		config.end = function() {
			Eplant.Views.WorldView.map.setZoom(21);
		};
		
		/* Return configuration */
		return config;
	};
	/*
		Eplant.Views.WorldView.prototype.zoomIn = function() {
		
		if(!Eplant.Views.WorldView.map.zooming){
		Eplant.Views.WorldView.map.zooming=true;
		Eplant.Views.WorldView.map.setZoom(Eplant.Views.WorldView.map.getZoom()+1);
		}
		
		};
		
		Eplant.Views.WorldView.prototype.zoomOut = function() {
		if(!Eplant.Views.WorldView.map.zooming){
		Eplant.Views.WorldView.map.zooming=true;
		Eplant.Views.WorldView.map.setZoom(Eplant.Views.WorldView.map.getZoom()-1);
		}
		
	};*/
	
})();
