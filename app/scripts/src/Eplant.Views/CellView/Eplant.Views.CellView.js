(function() {
	
	/**
		* Eplant.Views.CellView class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* ePlant View for browsing subcellular localization data of gene products as eFP.
		*
		* @constructor
		* @augments Eplant.BaseViews.EFPView
		* @param {Eplant.GeneticElement} geneticElement The GeneticElement associated with this view.
	*/
	Eplant.Views.CellView = function(geneticElement) {
		// Get constructor
		var constructor = Eplant.Views.CellView;
		
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
		var efpSvgURL = 'data/cell/' + geneticElement.species.scientificName.replace(" ", "_") + '.svg';
		var efpXmlURL = 'data/cell/' + geneticElement.species.scientificName.replace(" ", "_") + '.xml';
		Eplant.BaseViews.EFPView.call(this, geneticElement, efpSvgURL,efpXmlURL, {
			isRelativeEnabled: false,
			isCompareEnabled: false,
			isMaskEnabled: false
		});
		
	};
	ZUI.Util.inheritClass(Eplant.BaseViews.EFPView, Eplant.Views.CellView);	// Inherit parent prototype
	
	Eplant.Views.CellView.viewName = "Cell eFP";
	Eplant.Views.CellView.hierarchy = "genetic element";
	Eplant.Views.CellView.magnification = 40;
	Eplant.Views.CellView.description = "Cell eFP";
	Eplant.Views.CellView.citation = "";
	Eplant.Views.CellView.activeIconImageURL = "img/active/cell.png";
	Eplant.Views.CellView.availableIconImageURL = "img/available/cell.png";
	Eplant.Views.CellView.unavailableIconImageURL = "img/unavailable/cell.png";
	
	/* Draw method for Cell View */
	Eplant.Views.CellView.prototype.draw = function() {
		Eplant.BaseViews.EFPView.prototype.draw.call(this);
	};
	
	/* Clear up the view */
	Eplant.Views.CellView.prototype.remove = function() {
		Eplant.BaseViews.EFPView.prototype.remove.call(this);
	}; 
	
	Eplant.Views.CellView.prototype.loadsvg = function(svgimage) {
		var $img = jQuery(svgimage);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');
		
        $.get(imgURL, $.proxy(function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = $(data).find('svg');
            $("g", $svg).not('#labels').attr('stroke', "white");
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
			this.transitionCenter = $('#nucleus',this.svgdom);
			this.isSvgLoaded=true;
		}, this), 'xml');
		
	};
	
	
	
    /**
		* Updates eFP.
	*/
    Eplant.Views.CellView.prototype.updateDisplay = function() {
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
				$("#" + group.id + " *", this.svgdom).attr('stroke', 'white');
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
				$("#" + group.id + " *", this.svgdom).attr('stroke', 'white');
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
				$("#" + group.id + " *", this.svgdom).attr('stroke', 'white');
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
					$("#" + group.id + " *", this.svgdom).attr('stroke', 'white');
				}
			}
		}
		
		/* Update legend */
		this.legend.update();
	};
	Eplant.Views.CellView.prototype.bindSvgEvents = function() {
		
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
				$("*", event.currentTarget).attr('stroke', 'white');
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
					//$('div #efpTooltip').remove();
					if (this.view.tooltip) {
						this.view.tooltip.close();
						this.view.tooltip = null;
					}
					
					this.view.tooltip = new Eplant.Tooltip({
						content: this.group.name + '</br>Localization Score: ' + this.group.mean,
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
					$(info).html(this.group.name + '</br>Localization Score: ' + this.group.mean);
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
						$("*", this).attr('stroke', 'black');
					}
				});
			}
		}
	};
	
	
	/**
		* Loads eFP definition and data.
		*
		* @override
	*/
    Eplant.Views.CellView.prototype.loadData = function() {
		var efp = this;
        /* Get eFP definition */
        $.ajax({
            type: "GET",
            url: this.xmlURL,
            dataType: "xml",
            success: $.proxy(function(response) {
				this.webService = "http://bar.utoronto.ca/eplant/cgi-bin/cellefp.cgi?";
                /* Prepare array for samples loading */
				var samples = [];
				
				/* Create labels */
				//this.labels = $(response).find('labels');
				
				
				/* Create groups */
				this.groups = [];
				var groupsXml = $(response).find('subcellular');
				//groupsXml.find('tissue').each(function(index, groupData) {
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
                        fillColor: Eplant.Color.White
					};
                    /* Prepare wrapper object for proxy */
                    var wrapper = {
                        group: group,
                        eFPView: this
					};
					/* Prepare samples */
					var sample = {
						name:groupData.attributes['name'].value,
						value: null
					};
					
					/* Add it the samples array */
					samples.push(sample);
					group.samples.push(sample);
                    /* Append group to array */
                    this.groups.push(group);
					
				}
				
				
				
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
                $.getJSON(this.webService + "id=" + this.geneticElement.identifier, $.proxy(function(response) {
                    /* Match results with samples and copy values to samples */
                    for (var n = 0; n < this.samples.length; n++) {
                        for (var m = 0; m < response.length; m++) {
                            if (this.samples[n].name.toUpperCase() == response[m].name.toUpperCase()) {
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
					//this.eFPView.createViewHeatmap();
					Eplant.queue.add(this.eFPView.createViewHeatmap, this.eFPView);
					
					/* bind events to svg elements eFP */
					//this.eFPView.bindSvgEvents();
					Eplant.queue.add(this.eFPView.bindSvgEvents, this.eFPView);
					/* Finish loading */
					//this.eFPView.loadFinish();
					Eplant.queue.add(this.eFPView.loadFinish, this.eFPView);
				}, wrapper));
				
				
			},this)
		});
	};
	
})();
