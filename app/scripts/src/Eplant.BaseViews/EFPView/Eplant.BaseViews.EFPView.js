(function() {
	
    /**
		* Eplant.BaseViews.EFPView class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* @constructor
		* @augments Eplant.View
		* @param {Eplant.GeneticElement} geneticElement The GeneticElement that this EFPView is associated with.
		* @param {String} efpURL The URL of the EFP definition file.
		* @param {Object} configs Configurations.
		* @param {Boolean} configs.isRelativeEnabled Whether relative mode is enabled.
		* @param {Boolean} configs.isCompareEnabled Whether compare mode is enabled.
		* @param {Boolean} configs.isMaskEnabled Whether masking is enabled.
	*/
    Eplant.BaseViews.EFPView = function(geneticElement, efpSvgURL, efpXmlURL, configs) {
		
		
		this.isEFPView=true;
        this.viewMode = "svg";
		
        /* Attributes */
        this.svgdom = null;
        this.svgURL = efpSvgURL;
		this.isSvgLoaded = false;
        this.svgImage = document.createElement('img');
        this.svgImage.src = this.svgURL;
        this.loadsvg(this.svgImage);
		
		this.heatmapDom = null;
		
        this.xmlURL = efpXmlURL;
        this.geneticElement = geneticElement;
        this.maskColor = "#B4B4B4"; // Mask color
        this.errorColor = "#FFFFFF"; // Error color
		this.paletteButton = null;
		this.infoButton= null;
        this.modeButton = null; // Mode ViewSpecificUIButton
        this.compareButton = null; // Compare ViewSpecificUIButton
        this.maskButton = null; // Mask ViewSpecificUIButton
        this.isMaskOn = false; // Whether masking is on
        this.maskThreshold = 1; // Masking threshold
        this.isRelativeEnabled = true; // Whether relative mode is enabled
        this.isCompareEnabled = true; // Whether compare mode is enabled
        this.isMaskEnabled = true; // Whether masking is enabled
        this.compareEFPView = null; // EFP view for comparing to
        this.mode = "absolute"; // EFP mode
        this.tooltipInfo = null; // Information for creating tooltip
		this.tooltip = null;
		this.linkDialog = null;
		this.viewGlobalConfigs = {
        	isMaskOn:false, // Whether masking is on
        	maskThreshold:1, // Masking threshold
        	compareEFPView : {}, // EFP view for comparing to
			maskColor :  "#B4B4B4", // Mask color
			errorColor : "#FFFFFF", // Error color
        	mode : "absolute", // EFP mode
			left: 0,
			top:0,
			width:'100%',
			height:'100%',
			isLegendVisible:true
		};
        /* Apply configurations */
        if (configs) {
            if (configs.isRelativeEnabled !== undefined) {
                this.isRelativeEnabled = configs.isRelativeEnabled;
			}
            if (configs.isCompareEnabled !== undefined) {
                this.isCompareEnabled = configs.isCompareEnabled;
			}
            if (configs.isMaskEnabled !== undefined) {
                this.isMaskEnabled = configs.isMaskEnabled;
			}
		}
		
		this.transitionCenter = null;
		
        /* Create view-specific UI buttons */
        this.createViewSpecificUIButtons();
		
        /* Load data */
        this.loadData();
		
		
        /* Create legend */
        this.legend = new Eplant.BaseViews.EFPView.Legend(this);
		
		
		this.labelDom = document.createElement("div");
		$(this.labelDom).css({
			"position": "absolute",
			"z-index": 1,
			"left":20,
			"top":10,
			"font-size":'1.5em',
			"line-height":'1.5em'
		});
		$(this.labelDom).addClass('selectable');
		if(this.name)
		{
			this.viewNameDom = document.createElement("span");
			var text = this.name+': '+this.geneticElement.identifier;
			/*if(this.geneticElement.isRelated){
				text += ", "+this.geneticElement.identifier+" correlates to "+this.geneticElement.relatedGene.identifier+" with an r-value of "+this.geneticElement.rValueToRelatedGene;
			}*/
			this.viewNameDom.appendChild(document.createTextNode(text)); 
			$(this.viewNameDom).appendTo(this.labelDom);
			if(this.geneticElement.isRelated){
				$('<br>').appendTo(this.labelDom);
				var viewNameRelatedDom = document.createElement("span");
				
				viewNameRelatedDom.appendChild(document.createTextNode(this.geneticElement.identifier+" correlates to "+this.geneticElement.relatedGene.identifier+" with an r-value of "+this.geneticElement.rValueToRelatedGene)); 
				$(viewNameRelatedDom).css({
					"font-size":'0.7em',
					"line-height":'1em'
				}).appendTo(this.labelDom);
			}
		}
		
        /* Bind events */
        /*this.bindEvents();*/
		
	};
    ZUI.Util.inheritClass(Eplant.View, Eplant.BaseViews.EFPView); // Inherit parent prototype
	Eplant.BaseViews.EFPView.isEFPView = true;
	
    /**
		* Active callback method.
		*
		* @override
	*/
    Eplant.BaseViews.EFPView.prototype.active = function() {
        /* Call parent method */
        Eplant.View.prototype.active.call(this);
		
		this.svgdom.draggable();
		if(this.infoButton){
			
			$(this.infoButton.domContainer).detach().appendTo('#crossViewUI');
		}
		if(!this.svgdom)
		{
			setTimeout(this.active(),1000);
		}
		if(this.magnification ===35){
			Eplant.experimentSelectList.getSidebar().done($.proxy(function(domSideBar){
				$('#efp_experiement_list').css('width','150px');
				$('#efp_container').css('margin-left','150px');
				//$('#efp_experiement_list').append(domSideBar);
				/*var activeViewSnapshot = $(domSideBar).find("[data-viewname='" + this.name + "']");
				if(activeViewSnapshot.length>0){
					activeViewSnapshot.css({'outline':'2px solid #000000'});
					var scrollTop = activeViewSnapshot.position().top-$('#efp_experiement_list').height()/2+activeViewSnapshot.outerHeight();
					if(scrollTop>0) $('#efp_experiement_list').scrollTop(scrollTop,500);
				}*/
				Eplant.experimentSelectList.updateActive(this.name);
			},this));
			
		}
		$("#efp_container").append(this.svgdom);
		$("#efp_container").append(this.labelDom);
		
        if (this.isLegendVisible) {
            this.legend.attach();
		}
		/* Update eFP */
		this.updateDisplay();
		
	};
	
    /**
		* Inactive callback method.
		*
		* @override
	*/
    Eplant.BaseViews.EFPView.prototype.inactive = function() {
		/* Call parent method */
		Eplant.View.prototype.inactive.call(this);
		if(this.infoButton){
			$(this.infoButton.domContainer).detach();
		}
		$('#efp_experiement_list').empty();
		$('#efp_experiement_list').css('width','0px');
		$('#efp_container').css('margin-left','0px');
		$(this.svgdom).detach();
		//$(this.labelDom).detach();
		if (this.tooltip) {
			this.tooltip.close();
			this.tooltip = null;
		}
		if (this.legend.isVisible) {
			this.legend.detach();
		}
	};
	
	
	/**
		* Default applyGlobalConfigs callback method.
		*
		* @override
	*/
	Eplant.BaseViews.EFPView.prototype.applyGlobalConfigs = function() {
		Eplant.View.prototype.applyGlobalConfigs.call(this);
		$(this.svgdom).css({
			width: Eplant.globalViewConfigs[this.name].width,
			height: Eplant.globalViewConfigs[this.name].height,
			left: Eplant.globalViewConfigs[this.name].left,
			top: Eplant.globalViewConfigs[this.name].top
		}, 1000);
		
	};
	
	/**
		* Default saveGlobalConfigs callback method.
		*
		* @override
		*/
	Eplant.BaseViews.EFPView.prototype.saveGlobalConfigs = function() {
		Eplant.View.prototype.saveGlobalConfigs.call(this);
		Eplant.globalViewConfigs[this.name].width = $(this.svgdom).css('width');
		Eplant.globalViewConfigs[this.name].height = $(this.svgdom).css('height');
		Eplant.globalViewConfigs[this.name].top = $(this.svgdom).css('top');
		Eplant.globalViewConfigs[this.name].left = $(this.svgdom).css('left');
		
	};
	
	
    /**
		* Draws the View's frame.
		*
		* @Override
	*/
    Eplant.BaseViews.EFPView.prototype.draw = function() {
		/* Call parent method */
		Eplant.View.prototype.draw.call(this);
	};
	
    /**
		* Cleans up the View for disposal
		*
		* @override
	*/
    Eplant.BaseViews.EFPView.prototype.remove = function() {
		/* Call parent method */
		Eplant.View.prototype.remove.call(this);
		
		
	};
	
	/**
		* Creates view-specific UI buttons.
	*/
	Eplant.BaseViews.EFPView.prototype.createViewSpecificUIButtons = function() {
		/* Mode */
		if (this.isRelativeEnabled) {
			this.modeButton = new Eplant.ViewSpecificUIButton(
			"app/img/efpmode-absolute.png",		// imageSource
			"Toggle data mode: absolute.",	// Description
			function(data) {			// click
				/* Update button */
				if (data.eFPView.mode == "absolute") {
					data.eFPView.mode = "relative";
					this.setImageSource("app/img/efpmode-relative.png");
					this.setDescription("Toggle data mode: relative.");
				}
				else if (data.eFPView.mode == "relative") {
					data.eFPView.mode = "absolute";
					this.setImageSource("app/img/efpmode-absolute.png");
					this.setDescription("Toggle data mode: absolute.");
				}
				
				/* Update eFP */
				data.eFPView.updateDisplay();
			},
			{
				eFPView: this
			}
			);
			this.viewSpecificUIButtons.push(this.modeButton);
		}
		
		/* Compare */
		if (this.isRelativeEnabled && this.isCompareEnabled) {
			this.compareButton = new Eplant.ViewSpecificUIButton(
			"app/img/available/efpmode-compare.png",		// imageSource
			"Compare to another gene.",			// Description
			function(data) {				// click
				/* Check whether compare mode is already activated */
				if (data.eFPView.mode == "compare") {	// Yes
					/* Change mode to relative */
					data.eFPView.mode = "absolute";
					
					/* Update mode button */
					data.eFPView.modeButton.setImageSource("app/img/efpmode-absolute.png");
					data.eFPView.modeButton.setDescription("Toggle data mode: absolute.");
					
					/* Update compare button */
					this.setImageSource("app/img/available/efpmode-compare.png");
					this.setDescription("Compare to another gene.");
					
					/* Update eFP */
					data.eFPView.updateDisplay();
				}
				else {		// No
					/* Create compare dialog */
					var compareDialog = new Eplant.BaseViews.EFPView.CompareDialog(data.eFPView);
				}
			},
			{
				eFPView: this
			}
			);
			this.viewSpecificUIButtons.push(this.compareButton);
		}
		
		/* Mask */
		if (this.isMaskEnabled) {
			this.maskButton = new Eplant.ViewSpecificUIButton(
			"app/img/off/filter.png",		// imageSource
			"Mask data with below threshold confidence.",		// description
			function(data) {				// click
				/* Check whether masking is already on */
				if (data.eFPView.isMaskOn) {		// Yes
					/* Update button */
					this.setImageSource("app/img/off/filter.png");
					
					/* Turn off masking */
					data.eFPView.isMaskOn = false;
					
					/* Update eFP */
					data.eFPView.updateDisplay();
				}
				else {		// No
					/* Create mask dialog */
					var maskDialog = new Eplant.BaseViews.EFPView.MaskDialog(data.eFPView);
				}
			},
			{
				eFPView: this
			}
			);
			this.viewSpecificUIButtons.push(this.maskButton);
		}
		
		/* Legend */
		var viewSpecificUIButton = new Eplant.ViewSpecificUIButton(
		"app/img/legend.png",		// imageSource
		"Toggle legend.",		// description
		function(data) {		// click
			/* Check whether legend is showing */
			if (data.eFPView.legend.isVisible) {		// Yes
				this.setImageSource("app/img/off/legend.png");
				/* Hide legend */
				data.eFPView.legend.hide();
				data.eFPView.isLegendVisible=false;
			}
			else {		// No
				this.setImageSource("app/img/on/legend.png");
				/* Show legend */
				data.eFPView.legend.show();
				data.eFPView.isLegendVisible=true;
			}
		},
		{
			eFPView: this
		}
		);
		this.viewSpecificUIButtons.push(viewSpecificUIButton);
		
	};
	
    Eplant.BaseViews.EFPView.prototype.loadsvg = function(svgimage) {
		var $img = jQuery(svgimage);
		var imgID = $img.attr('id');
		var imgClass = $img.attr('class');
		var imgURL = $img.attr('src');
		
		$.get(imgURL, $.proxy(function(data) {
			// Get the SVG tag, ignore the rest
			var $svg = $(data).find('svg');
			$("g", $svg).not('[id*=label],[id*=Label]').attr('stroke', "black");
			$("text", $svg).attr('stroke','');
			$("text", $svg).attr('fill','black');
			// Add replaced image's ID to the new SVG
			if (typeof imgID !== 'undefined') {
				$svg = $svg.attr('id', imgID);
			}
			// Add replaced image's classes to the new SVG
			$svg = $svg.attr('class', 'efp-view-svg');
			// Remove any invalid XML tags as per http://validator.w3.org
			$svg = $svg.removeAttr('xmlns:a');
			
			// Replace image with new SVG
			//$img.replaceWith($svg);
			$svg.draggable();
			this.svgdom = $svg;
			this.isSvgLoaded=true;
		}, this), 'xml');
		
	};
	
    /**
		* Loads eFP definition and data.
	*/
    Eplant.BaseViews.EFPView.prototype.loadData = function() {
		var efp = this;
		/* Get eFP definition */
		$.ajax({
			type: "GET",
			url: this.xmlURL,
			dataType: "xml",
			success: $.proxy(function(response) {
				var infoXml = $(response).find('info');
				if (infoXml.length > 0) {
					this.infoButton	= new Eplant.ViewSpecificUIButton(
					"app/img/info.png", // imageSource
					"Additional information about the efp view", // Description
					function(data) { // click
						DialogManager.artDialogDynamic('<p style="font-size:24px">Information for this view</p><br>'+infoXml.html(),{width:'600px'});
						}, { // data
					}
					);
					this.viewSpecificUIButtons.push(this.infoButton);
				}
				var webServiceXml = $(response).find('webservice');
				if (webServiceXml.length > 0) {
					this.webService = Eplant.ServiceUrl + webServiceXml.text();
					} else {
					this.webService = Eplant.ServiceUrl + "plantefp.cgi?datasource=atgenexp_plus&";
				}
				/* Prepare array for samples loading */
				var samples = [];
				
				/* Create labels */
				//this.labels = $(response).find('labels');
				
				this.database = null;
				if($(response).find('view')[0]&&$(response).find('view')[0].attributes['db'])this.database = $(response).find('view')[0].attributes['db'].value;
				
				/* Create groups */
				this.groups = [];
				var groupsXml = $(response).find('tissue');
				for (var n = 0; n < groupsXml.length; n++) {
					
					/* Get group data */
					var groupData = groupsXml[n];
					
					/* Asher: My solution is to have an if statement to read all control data for each group
						if (typeof groupData.control != 'undefined') {
						alert(groupData.control.id);
						}
					*/
					
					/* Create group object */
					var group = {
						id: groupData.attributes['id'].value.replace(" ", "_").replace("_x2B_", "").replace("_x2C_", "").replace(" ", "_").replace(/^[^a-z]+|[^\w:.-]+/gi, ""),
						name: groupData.attributes['name'].value,
						samples: [],
						ctrlSamples: [],
						source: groupData.source,
						color: Eplant.Color.White,
						isHighlight: false,
						tooltip: null,
						fillColor: Eplant.Color.White,
						ePlantLink: groupData.attributes['ePlantLink']?groupData.attributes['ePlantLink'].value:null,
						link: $('link', groupData).attr('url'),
						database: $(response).find('view')[0].attributes['db']?$(response).find('view')[0].attributes['db'].value:''
					};
					/* Prepare wrapper object for proxy */
					var wrapper = {
						group: group,
						eFPView: this
					};
					
					/* Prepare samples */
					var samplesXml = $('sample', groupData);
					for (var m = 0; m < samplesXml.length; m++) {
						var sample = {
							name: samplesXml[m].attributes['name'].value,
							value: null
						};
						
						/* Add it the samples array */
						samples.push(sample);
						
						/* Add to group samples */
						group.samples.push(sample);
					}
					
					/* Asher: Prepare samples for controls if it exists in the group */
					var controlsXml = $('sample', groupsXml);
					if (controlsXml !== undefined) {
						for (var m = 0; m < controlsXml.length; m++) {
							var sample = {
								name: controlsXml[m].attributes['name'].value,
								value: null
							};
							
							/* Add it the samples array */
							samples.push(sample);
							group.ctrlSamples.push(sample);
						}
					}
					
					/* Append group to array */
					this.groups.push(group);
					
				}
				
				/* Get sample values */
				/* Get sample names */
				var sampleNames = [];
				for (var n = 0; n < samples.length; n++) {
					if ($.inArray(samples[n].name, sampleNames) === -1) {
						sampleNames.push(samples[n].name);
					}
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
					success: $.proxy(function(response) {
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
					}, wrapper)
				});
			}, this)
		});
	};
	
	Eplant.BaseViews.EFPView.prototype.loadFinish = function() {
		/* Call parent method */
		Eplant.View.prototype.loadFinish.call(this);
		
		if(this.magnification ===35 && ZUI.activeView == this){
			Eplant.activeSpecies.views['ExperimentView'].selectList.getSidebar().done($.proxy(function(domSideBar){
				$('#efp_experiement_list').css('width','150px');
				$('#efp_container').css('margin-left','150px');
				$('#efp_experiement_list').append(domSideBar);
				var activeViewSnapshot = $(domSideBar).find("[data-viewname='" + this.name + "']");
				if(activeViewSnapshot.length>0){
					activeViewSnapshot.css({'outline':'2px solid #000000'});
					var scrollTop = activeViewSnapshot.position().top-$('#efp_experiement_list').height()/2+activeViewSnapshot.outerHeight();
					if(scrollTop>0) $('#efp_experiement_list').scrollTop(scrollTop,500);
				}
			},this));
			
		}
	};
	
	
	
	
    /**
		* Binds events.
	*/
    Eplant.BaseViews.EFPView.prototype.bindEvents = function() {
		/* update-annotationTags */
		this.updateAnnotationTagsEventListener = new ZUI.EventListener("update-annotationTags", this.geneticElement, function(event, eventData, listenerData) {
			/* Get EFPView */
			var eFPView = listenerData.eFPView;
			
			/* Update tags */
			eFPView.updateTags();
			}, {
			eFPView: this
		});
	};
	
    /**
		* Calculates useful information from raw values.
	*/
    Eplant.BaseViews.EFPView.prototype.processValues = function() {
		/* Processes raw values for a group */
		function processGroupValues() {
			var values = [];
			for (var n = 0; n < this.samples.length; n++) {
				var sample = this.samples[n];
				if (!isNaN(sample.value)) {
					values.push(sample.value);
				}
			}
			this.mean = Math.round(ZUI.Statistics.mean(values)* 100) / 100;
			this.n = values.length;
			this.stdev = Math.round(ZUI.Statistics.stdev(values)* 100) / 100;
			this.sterror = Math.round(ZUI.Statistics.sterror(values)* 100) / 100;
			
			if (this.ctrlSamples === undefined) {
				return;
			}
			
			/* Asher: Calculate the stats for group control */
			var values = [];
			for (var n = 0; n < this.ctrlSamples.length; n++) {
				var sample = this.ctrlSamples[n];
				if (!isNaN(sample.value)) {
					values.push(sample.value);
				}
			}
			this.ctrlMean = Math.round(ZUI.Statistics.mean(values)* 100) / 100;
			this.ctrln = values.length;
			this.ctrlStdev = Math.round(ZUI.Statistics.stdev(values)* 100) / 100;
			this.ctrlSterror = Math.round(ZUI.Statistics.sterror(values)* 100) / 100;
		}
		
		/* Groups */
		for (var n = 0; n < this.groups.length; n++) {
			var group = this.groups[n];
			Eplant.queue.add(processGroupValues, group);
		}
		Eplant.queue.add(function(){
			this.max = this.groups[0].mean;
			for (var n = 1; n < this.groups.length; n++) {
				var group = this.groups[n];
				if (group.mean > this.max) {
					this.max = group.mean;
				}
			}
			
		}, this);
		/* Update eFP */
		//this.eFPView.updateDisplay();
		Eplant.queue.add(this.updateDisplay, this);
		
		/* Finish loading */
		//this.eFPView.createViewHeatmap();
		Eplant.queue.add(this.createViewHeatmap, this);
		
		/* bind events to svg elements eFP */
		//this.eFPView.bindSvgEvents();
		Eplant.queue.add(this.bindSvgEvents, this);
		/* Finish loading */
		//this.eFPView.loadFinish();
		Eplant.queue.add(this.loadFinish, this);
	};
	
	
    /**
		* Updates eFP.
	*/
    Eplant.BaseViews.EFPView.prototype.createViewHeatmap = function() {
		table = $('<table></table>').css({
			width:'100%',
			height:'100%'
		});
		row = $('<tr></tr>');
		for (var j = 0; j < this.groups.length; j++) {
			var group = this.groups[j];
			var rowData = $('<td></td>')
			.attr('data-rel-color',group.color)
			.attr('data-gene',this.geneticElement.identifier)
			.attr('data-tissue',group.name)
			.attr('data-expression-level',group.mean)
			.attr('data-database',group.database)
			.attr('data-view-name',this.name);
			row.append(rowData);
			
			if(this.viewName ==='Cell eFP'){
				rowData.attr('data-abs-color',this.getAbsoluteColor(group,106))
			}
			else
			{
				rowData.attr('data-abs-color',this.getAbsoluteColor(group,this.geneticElement.species.views['HeatMapView'].max));
			}
			
			/*
				var color;
				if(mode==='absolute'){
				color=rowData.attr('data-abs-color');
				}
				else{
				color=rowData.attr('data-rel-color');
				}
			rowData.css({'background-color':color});*/
		}
		table.append(row);
		this.heatmapDom = table;
	};
	
	Eplant.BaseViews.EFPView.prototype.getAbsoluteColor=function(group,max){
		/* Color groups */
		var minColor = ZUI.Util.getColorComponents(Eplant.midColor);
		var maxColor = ZUI.Util.getColorComponents(Eplant.maxColor);
		
		
		/* Get value ratio relative to maximum */
		var ratio = group.mean / max;
		var color;
		/* Check whether ratio is invalid */
		if (isNaN(ratio) || !isFinite(ratio)) { // Invalid
			color = '';
		} 
		else 
		{ // Valid
			var red = minColor.red + Math.round((maxColor.red - minColor.red) * ratio);
			var green = minColor.green + Math.round((maxColor.green - minColor.green) * ratio);
			var blue = minColor.blue + Math.round((maxColor.blue - minColor.blue) * ratio);
			color = ZUI.Util.makeColorString(red, green, blue);
		}
		
		return color?color:group.color;
	};
	
	/**
		* Updates eFP.
	*/
	Eplant.BaseViews.EFPView.prototype.updateDisplay = function() {
		/* Return if data are not loaded */
		if (!this.isLoadedData) {
			return;
		}
		
		/* Update eFP */
		if (this.mode == "absolute") {
			/* Find maximum value */
			
			
			/* Color groups */
			var minColor = ZUI.Util.getColorComponents(Eplant.midColor);
			var maxColor = ZUI.Util.getColorComponents(Eplant.maxColor);
			for (var n = 0; n < this.groups.length; n++) {
				/* Get group */
				var group = this.groups[n];
				
				/* Get value ratio relative to maximum */
				var ratio = group.mean / this.max;
				
				/* Check whether ratio is invalid */
				if (isNaN(ratio) || !isFinite(ratio)) { // Invalid
					group.color = this.errorColor;
					} else { // Valid
					var red = minColor.red + Math.round((maxColor.red - minColor.red) * ratio);
					var green = minColor.green + Math.round((maxColor.green - minColor.green) * ratio);
					var blue = minColor.blue + Math.round((maxColor.blue - minColor.blue) * ratio);
					group.color = ZUI.Util.makeColorString(red, green, blue);
				}
				
				/* Set color of ViewObject */
				$("#" + group.id + " *", this.svgdom).attr('fill', group.color);
				$("#" + group.id + "", this.svgdom).attr('fill', group.color);
				$("#" + group.id + " *", this.svgdom).attr('stroke-width', '0');
			}
		} 
		else if (this.mode == "relative") {
			/* Find extremum log2 value */
			var extremum = Math.abs(ZUI.Math.log(this.groups[0].mean / this.groups[0].ctrlMean, 2));
			for (var n = 1; n < this.groups.length; n++) {
				var group = this.groups[n];
				var absLog2Value = Math.abs(ZUI.Math.log(group.mean / group.ctrlMean, 2));
				if (absLog2Value > extremum) {
					if (isNaN(absLog2Value) || !isFinite(absLog2Value)) {} else {
						extremum = absLog2Value;
					}
				}
			}
			
			/* Color groups */
			var minColor = ZUI.Util.getColorComponents(Eplant.minColor);
			var midColor = ZUI.Util.getColorComponents(Eplant.midColor);
			var maxColor = ZUI.Util.getColorComponents(Eplant.maxColor);
			for (var n = 0; n < this.groups.length; n++) {
				/* Get group */
				var group = this.groups[n];
				var log2Value = ZUI.Math.log(group.mean / group.ctrlMean, 2);
				
				/* Get log2 value ratio relative to extremum */
				var ratio = log2Value / extremum;
				
				/* Check whether ratio is invalid */
				if (isNaN(ratio) || !isFinite(ratio)) { // Invalid
					group.color = this.errorColor;
					} else { // Valid
					var color1, color2;
					if (ratio < 0) {
						color1 = midColor;
						color2 = minColor;
						ratio *= -1;
						} else {
						color1 = midColor;
						color2 = maxColor;
					}
					var red = color1.red + Math.round((color2.red - color1.red) * ratio);
					var green = color1.green + Math.round((color2.green - color1.green) * ratio);
					var blue = color1.blue + Math.round((color2.blue - color1.blue) * ratio);
					group.color = ZUI.Util.makeColorString(red, green, blue);
				}
				
				/* Set color of ViewObject */
				$("#" + group.id + " *", this.svgdom).attr('fill', group.color);
				$("#" + group.id + "", this.svgdom).attr('fill', group.color);
				$("#" + group.id + " *", this.svgdom).attr('stroke-width', '0');
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
				if (isNaN(ratio) || !isFinite(ratio)) { // Invalid
					group.color = this.errorColor;
					} else { // Valid
					var color1, color2;
					if (ratio < 0) {
						color1 = midColor;
						color2 = minColor;
						ratio *= -1;
						} else {
						color1 = midColor;
						color2 = maxColor;
					}
					var red = color1.red + Math.round((color2.red - color1.red) * ratio);
					var green = color1.green + Math.round((color2.green - color1.green) * ratio);
					var blue = color1.blue + Math.round((color2.blue - color1.blue) * ratio);
					group.color = ZUI.Util.makeColorString(red, green, blue);
				}
				
				/* Set color of ViewObject */
				$("#" + group.id + " *", this.svgdom).attr('fill', group.color);
				$("#" + group.id + "", this.svgdom).attr('fill', group.color);
				$("#" + group.id + " *", this.svgdom).attr('stroke-width', '0');
			}
		}
		
		/* Apply masking */
		if (this.isMaskOn) {
			for (var n = 0; n < this.groups.length; n++) {
				var group = this.groups[n];
				if (isNaN(group.sterror) || group.sterror >= group.mean * this.maskThreshold) {
					group.color = this.maskColor;
					$("#" + group.id + " *", this.svgdom).attr('fill', group.color);
					$("#" + group.id + "", this.svgdom).attr('fill', group.color);
					$("#" + group.id + " *", this.svgdom).attr('stroke-width', '0');
				}
			}
		}
		
		/* Update legend */
		this.legend.update();
		this.snapshot = this.svgdom.clone().css({width:'100%',height:'80%',left:0,top:0});
	};
	
	Eplant.BaseViews.EFPView.prototype.bindSvgEvents = function() {
		var changeTooltipPosition = $.proxy(function(event) {
			if (this.tooltip) {
				this.tooltip.changeTooltipPosition(event);
			}
		},this);
		var hideTooltip = $.proxy(function(event) {
			//$('div#efpTooltip').remove();
			if (this.tooltip) {
				this.tooltip.close();
				this.tooltip = null;
			}
			if($(event.currentTarget).attr('fill')){
				$("*", event.currentTarget).attr('stroke-width', "0");
			}
			
		},this);
		if (this.groups) {
			for (var n = 0; n < this.groups.length; n++) {
				var group = this.groups[n];
				
				var obj = {
					group:group,
					view:this
				};
				
				var showTooltip = $.proxy(function(event) {
					$("*", this.view).attr('stroke', "1");
					//$('div #efpTooltip').remove();
					if (this.view.tooltip) {
						this.view.tooltip.close();
						this.view.tooltip = null;
					}
					
					this.view.tooltip = new Eplant.Tooltip({
						content: this.group.name + '</br>Level: ' + this.group.mean + ', SD: ' + this.group.stdev + '</br>Sample Size: ' + this.group.samples.length,
						x:event.clientX,
						y:event.clientY,
						ele:event.currentTarget
					});
					//$(toolTipString).appendTo('body');
					//changeTooltipPosition(event);
				}, obj);
				
				
				
				$("#" + group.id, this.svgdom).click($.proxy(function() {
					var div = document.createElement("div");
					var info = document.createElement("div");
					$(info).html('' + this.group.name + '</br>Level: ' + this.group.mean + ', SD: ' + this.group.stdev + '</br>Sample Size: ' + this.group.samples.length + '');
					$(div).append(info);
					
					if(this.group.link)
					{					
						var a1 = $('<a></a>',{
							text: 'Open NASCArrays Information in a separate window',
							'class': ''
							}).appendTo(div).css({
							'font-size': '13px',
							'margin-top': '5px',
							color:'#99cc00'
						});
						
						$(a1).click($.proxy(function() {
							window.open(this.group.link, '_blank');
						},this));
					}
					if(this.group.ePlantLink && this.view.geneticElement.views[this.group.ePlantLink])
					{		
						$(div).append(document.createElement("br"));
						var a2 = $('<a></a>',{
							text: 'Zoom to '+this.group.ePlantLink+' viewer',
							'class': ''
							}).appendTo(div).css({
							'font-size': '13px',
							'margin-top': '5px',
							color:'#99cc00'
						});
						$(a2).click($.proxy(function() {
							Eplant.changeActiveView(this.view.geneticElement.views[this.group.ePlantLink]);
							if(this.view.linkDialog)this.view.linkDialog.close();
						},this));
					}
					this.linkDialog = DialogManager.artDialogDynamic(div);
					
					
				},obj));
				
				$("#" + group.id, this.svgdom).on({
					mousemove: changeTooltipPosition,
					mouseenter: showTooltip,
					mouseleave: hideTooltip,
					mouseover: function() {
						$("*", this).attr('stroke-width', "1");
					}
				});
			}
		}
	};
	
	
	/**
		* Activates compare mode and compares data of this GeneticElement to the specified GeneticElement.
	*/
	Eplant.BaseViews.EFPView.prototype.compare = function(geneticElement) {
		/* Confirm GeneticElement that is compared to has views loaded */
		if (!geneticElement.isLoadedViews) {
			alert("Please load data for " + geneticElement.identifier + " first.");
			return;
		}
		
		/* Get name of the eFP view */
		var viewName = Eplant.getViewName(this);
		
		/* Switch to compare mode */
		this.compareEFPView = geneticElement.views[viewName];
		this.mode = "compare";
		
		/* Update mode button */
		this.modeButton.setImageSource("app/img/efpmode-relative.png");
		this.modeButton.setDescription("Data mode: compare. Click on Compare button to turn off.");
		
		/* Update compare button */
		this.compareButton.setImageSource("app/img/active/efpmode-compare.png");
		this.compareButton.setDescription("Turn off compare mode.");
		
		/* Update eFP */
		this.updateDisplay();
	};
	
	Eplant.BaseViews.EFPView.prototype.zoomIn = function() {
		var relativePercentage = ($(this.svgdom).width() / $(this.svgdom).parent('div').width()) * 100;
		var leftPercentage = (parseInt($(this.svgdom).css('left').replace('auto', '0')) / $(this.svgdom).parent('div').width()) * 100;
		var topPercentage = (parseInt($(this.svgdom).css('top').replace('auto', '0')) / $(this.svgdom).parent('div').height()) * 100;
		$(this.svgdom).stop().animate({
			width: (relativePercentage + 4) + "%",
			height: (relativePercentage + 4) + "%",
			left: (leftPercentage - 2) + "%",
			top: (topPercentage - 2) + "%"
		}, 100);
		return true;
	};
	
	Eplant.BaseViews.EFPView.prototype.zoomOut = function() {
		var relativePercentage = ($(this.svgdom).width() / $(this.svgdom).parent('div').width()) * 100;
		var leftPercentage = (parseInt($(this.svgdom).css('left').replace('auto', '0')) / $(this.svgdom).parent('div').width()) * 100;
		var topPercentage = (parseInt($(this.svgdom).css('top').replace('auto', '0')) / $(this.svgdom).parent('div').height()) * 100;
		$(this.svgdom).stop().animate({
			width: (relativePercentage - 4) + "%",
			height: (relativePercentage - 4) + "%",
			left: (leftPercentage + 2) + "%",
			top: (topPercentage + 2) + "%"
		}, 100);
		return true;
	};
	
	/**
		* Returns The exit-out animation configuration.
		*
		* @override
		* @return {Object} The exit-out animation configuration.
	*/
	Eplant.BaseViews.EFPView.prototype.getExitOutAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitOutAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.svgdom).stop().animate({
				width: "0%",
				height: "0%",
				left: "50%",
				top: "50%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The enter-out animation configuration.
		*
		* @override
		* @return {Object} The enter-out animation configuration.
	*/
	Eplant.BaseViews.EFPView.prototype.getEnterOutAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterOutAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			if(this.transitionCenter){
				$(this.svgdom).css({
					width: "100%",
					height: "100%",
					left: "0%",
					top: "0%",
				}, 1000);
				var box = $(this.transitionCenter)[0].getBoundingClientRect();
				var width = box.right-box.left;
				var height = box.bottom-box.top;
				var center = {
					left:width/2+$(this.transitionCenter).position().left,
					top:height+$(this.transitionCenter).position().top
				};
				var halfWidth = $(this.svgdom).width()/2;
				var leftPercentOffset = (halfWidth - center.left)/$(this.svgdom).width()*1000;
				var halfHeight = $(this.svgdom).width()/2;
				var topPercentOffset = (halfHeight - center.top)/$(this.svgdom).width()*1000;
				$(this.svgdom).css({
					width: "1000%",
					height: "1000%",
					left: -450+leftPercentOffset+"%",
					top: -450+topPercentOffset+"%",
				}, 1000);
			}
			else{
				$(this.svgdom).css({
					width: "1000%",
					height: "1000%",
					left: -450+"%",
					top: -450+"%",
				}, 1000);
			}
			$(this.svgdom).stop().animate({
				width: "100%",
				height: "100%",
				left: "0%",
				top: "0%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The exit-in animation configuration.
		*
		* @override
		* @return {Object} The exit-in animation configuration.
	*/
	Eplant.BaseViews.EFPView.prototype.getExitInAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitInAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			if(this.transitionCenter){
				var box = $(this.transitionCenter)[0].getBoundingClientRect();
				var width = box.right-box.left;
				var height = box.bottom-box.top;
				var center = {
					left:width/2+$(this.transitionCenter).position().left,
					top:height+$(this.transitionCenter).position().top
				};
				var halfWidth = $(this.svgdom).width()/2;
				var leftPercentOffset = (halfWidth - center.left)/$(this.svgdom).width()*1000;
				var halfHeight = $(this.svgdom).width()/2;
				var topPercentOffset = (halfHeight - center.top)/$(this.svgdom).width()*1000;
				$(this.svgdom).stop().animate({
					width: "1000%",
					height: "1000%",
					left: -450+leftPercentOffset+"%",
					top: -450+topPercentOffset+"%",
				}, 1000);
			}
			else{
				$(this.svgdom).stop().animate({
					width: "1000%",
					height: "1000%",
					left: -450+"%",
					top: -450+"%",
				}, 1000);
			}
			
		}, this);
		return config;
	};
	
	/**
		* Returns The enter-in animation configuration.
		*
		* @override
		* @return {Object} The enter-in animation configuration.
	*/
	Eplant.BaseViews.EFPView.prototype.getEnterInAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterInAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.svgdom).css({
				width: "0%",
				height: "0%",
				left: "50%",
				top: "50%"
			});
			$(this.svgdom).stop().animate({
				width: "100%",
				height: "100%",
				left: "0%",
				top: "0%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The exit-right animation configuration.
		*
		* @override
		* @return {Object} The exit-right animation configuration.
	*/
	Eplant.BaseViews.EFPView.prototype.getExitDownAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitDownAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.svgdom).css({
				width: "100%",
				height: "100%",
				left: "0%",
				top: "0%"
			});
			$(this.svgdom).stop().animate({
				top: "300%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The enter-right animation configuration.
		*
		* @override
		* @return {Object} The enter-right animation configuration.
	*/
	Eplant.BaseViews.EFPView.prototype.getEnterDownAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterDownAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.svgdom).css({
				width: "100%",
				height: "100%",
				left: "0%",
				top: "-300%"
			});
			$(this.svgdom).stop().animate({
				width: "100%",
				height: "100%",
				top: "0%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The exit-right animation configuration.
		*
		* @override
		* @return {Object} The exit-right animation configuration.
	*/
	Eplant.BaseViews.EFPView.prototype.getExitUpAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitUpAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.svgdom).css({
				width: "100%",
				height: "100%",
				left: "0%",
				top: "0%"
			});
			$(this.svgdom).stop().animate({
				top: "-300%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The enter-right animation configuration.
		*
		* @override
		* @return {Object} The enter-right animation configuration.
	*/
	Eplant.BaseViews.EFPView.prototype.getEnterUpAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterUpAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.svgdom).css({
				width: "100%",
				height: "100%",
				left: "0%",
				top: "300%"
			});
			$(this.svgdom).stop().animate({
				width: "100%",
				height: "100%",
				top: "0%"
			}, 1000);
		}, this);
		return config;
	};
	
})();																											
