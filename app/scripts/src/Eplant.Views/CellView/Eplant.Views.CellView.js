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
		constructor.displayName,				// Name of the View visible to the user
		constructor.viewName,
		constructor.hierarchy,			// Hierarchy of the View
		constructor.magnification,			// Magnification level of the View
		constructor.description,			// Description of the View visible to the user
		constructor.citation,			// Citation template of the View
		constructor.activeIconImageURL,		// URL for the active icon image
		constructor.availableIconImageURL,		// URL for the available icon image
		constructor.unavailableIconImageURL	// URL for the unavailable icon image
		);
		
		// Call eFP constructor
		var efpSvgURL = 'app/data/cell/' + geneticElement.species.scientificName.replace(" ", "_") + '.svg';
		var efpXmlURL = 'app/data/cell/' + geneticElement.species.scientificName.replace(" ", "_") + '.xml';
		Eplant.BaseViews.EFPView.call(this, geneticElement, efpSvgURL,efpXmlURL, {
			isRelativeEnabled: false,
			isCompareEnabled: false,
			isMaskEnabled: false
		});
		this.geneDistributionChart=null;
	};
	ZUI.Util.inheritClass(Eplant.BaseViews.EFPView, Eplant.Views.CellView);	// Inherit parent prototype
	
	Eplant.Views.CellView.viewName = "CellView";
	Eplant.Views.CellView.displayName = "Cell eFP";
	Eplant.Views.CellView.hierarchy = "genetic element";
	Eplant.Views.CellView.magnification = 40;
	Eplant.Views.CellView.description = "Cell eFP";
	Eplant.Views.CellView.citation = "";
	Eplant.Views.CellView.activeIconImageURL = "app/img/active/cell.png";
	Eplant.Views.CellView.availableIconImageURL = "app/img/available/cell.png";
	Eplant.Views.CellView.unavailableIconImageURL = "app/img/unavailable/cell.png";
	
	/* Draw method for Cell View */
	Eplant.Views.CellView.prototype.draw = function() {
		Eplant.BaseViews.EFPView.prototype.draw.call(this);
	};
	
	/* Clear up the view */
	Eplant.Views.CellView.prototype.remove = function() {
		Eplant.BaseViews.EFPView.prototype.remove.call(this);
	};
	
	Eplant.Views.CellView.prototype.loadsvg = function() {
		
		
		this.Xhrs.loadsvgXhr=$.get(this.svgURL, $.proxy(function(data) {
			this.Xhrs.loadsvgXhr=null;
			// Get the SVG tag, ignore the rest
			var $svg = $(data).find('svg');
			$("g", $svg).not('#labels').attr('stroke', "#e6e6e6");
			$("text", $svg).attr('stroke','');
			$("text", $svg).attr('fill','black');
			// Add replaced image's ID to the new SVG
			
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
		if (Eplant.viewColorMode == "absolute") {
			/* Find maximum value */
			var max = this.max;
			switch(Eplant.globalColorMode){
				case "absolute" :
				/*if(Eplant.experimentColorMode==="all"&&this.magnification===35){
					max= this.geneticElement.experimentViewMax;
					}
				else{*/
				max = this.max;
				break;
				case "globalAbsolute" :
				if(/*Eplant.experimentColorMode==="all"&&this.magnification===35*/this.viewName!="CellView"){
					max= this.geneticElement.species.max;//experimentViewMax;
				}
				else{
					max = this.geneticElement.species.geneticViewMax[this.viewName];
				}
				break;
				case "customAbsolute" :
				if(/*Eplant.experimentColorMode==="all"&&this.magnification===35*/this.viewName!="CellView"){
					max = Eplant.customGlobalMax;
				}
				else{
					max = this.geneticElement.species.geneticViewMax[this.viewName];
				}
				
				break;
				default:
				max = this.eFPView.max;
				break;
			}
			
			
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
				$("#" + group.id + " *", this.svgdom).attr('stroke', '#e6e6e6');
			}
		}
		else if (Eplant.viewColorMode == "relative") {
			/* Find extremum log2 value */
			var extremum=this.extremum;
			switch(Eplant.globalColorMode){
				case "absolute" :
				/*if(Eplant.experimentColorMode==="all"&&this.magnification===35){
					extremum= this.geneticElement.experimentViewExtremum;
					}
				else{*/
				extremum = this.extremum;
				break;
				case "globalAbsolute" :
				if(/*Eplant.experimentColorMode==="all"&&this.magnification===35*/this.viewName!="CellView"){
					extremum= this.geneticElement.species.extremum;//experimentViewExtremum;
				}
				else{
					extremum = this.geneticElement.species.geneticViewExtremum[this.viewName];
				}
				
				break;
				case "customAbsolute" :
				if(/*Eplant.experimentColorMode==="all"&&this.magnification===35*/this.viewName!="CellView"){
					extremum = Eplant.customGlobalExtremum;
				}
				else{
					extremum = this.geneticElement.species.geneticViewExtremum[this.viewName];
				}
				
				
				break;
				default:
				extremum = this.extremum;
				break;
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
				$("#" + group.id + " *", this.svgdom).attr('stroke', '#e6e6e6');
			}
		}
		else if (Eplant.viewColorMode == "compare") {
			
			this.compare(Eplant.compareGeneticElement);
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
				$("#" + group.id + " *", this.svgdom).attr('stroke', '#e6e6e6');
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
					$("#" + group.id + " *", this.svgdom).attr('stroke', '#e6e6e6');
				}
			}
		}
		
		/* Update legend */
		this.legend.update();
		if(this.svgdom){
			var snapshot = this.svgdom.clone().css({width:'100%',height:'80%',left:0,top:0});
			$('text',snapshot).remove();
			if ($(this.svgImage,document).length>0) {
				$(this.svgImage).replaceWith(snapshot);
			}
			this.svgImage= snapshot;
			
		}
		if(!this.isLoadedData){
			this.loadFinish();
		}
	};
	Eplant.Views.CellView.prototype.getTooltipContent = function(group) {
		return group.name + '</br>Localization Score: ' + group.mean;
	};
	Eplant.Views.CellView.prototype.bindSvgEvents = function() {
		
		if (this.groups) {
			for (var n = 0; n < this.groups.length; n++) {
				var group = this.groups[n];
				
				var obj = {
					group:group,
					view:this,
					tooltipText:this.getTooltipContent(group)
				};
				
				
				$("#" + group.id, this.svgdom).click($.proxy(function( event ) {
					if(!this.view.linkDialog){
						var div = document.createElement("div");
						var info = document.createElement("div");
						$(info).html(this.tooltipText);
						$(div).append(info);
						
						var EAViewName = Eplant.expressionAnglerViewNameMap[this.view.viewName];
						if(EAViewName)
						{
							$(div).append(document.createElement("br"));
							var a1 = $('<a></a>',{
								text: 'Find genes that are highly expressed in this sample',
								'class': ''
								}).appendTo(div).css({
								'font-size': '13px',
								'margin-top': '5px',
								color:'#99cc00'
							});
							
							$(a1).click($.proxy(function() {
								Eplant.ExpressionAngler.generateStandardSearchQuery(EAViewName,this.view,this.group,100);
							},this));
						}
						if(EAViewName)
						{
							$(div).append(document.createElement("br"));
							var a1 = $('<a></a>',{
								text: 'Find genes that are specifically expressed in this sample',
								'class': ''
								}).appendTo(div).css({
								'font-size': '13px',
								'margin-top': '5px',
								color:'#99cc00'
							});
							
							$(a1).click($.proxy(function() {
								Eplant.ExpressionAngler.generateStandardSearchQuery(EAViewName,this.view,this.group);
							},this));
						}
						if(this.group.link)
						{
							$(div).append(document.createElement("br"));
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
						if(Eplant.citations[Eplant.activeSpecies.scientificName][this.view.name]){
							$(div).append(document.createElement("br"));
							var a1 = $('<a></a>',{
								text: 'Get citation information for this view',
								'class': ''
								}).appendTo(div).css({
								'font-size': '13px',
								'margin-top': '5px',
								color:'#99cc00'
							});
							
							$(a1).click($.proxy(function() {
								if(this.showCitation){
									this.showCitation()
								}
								else{
									Eplant.showCitation();
								}
							},this.view));
						}
						if(this.view.rawSampleData){
							$(div).append(document.createElement("br"));
							var a1 = $('<a></a>',{
								text: 'Get raw data for this view',
								'class': ''
								}).appendTo(div).css({
								'font-size': '13px',
								'margin-top': '5px',
								color:'#99cc00'
							});
							
							$(a1).click($.proxy(function() {
								
								this.downloadRawData()
								
							},this.view));
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
						
						this.view.linkDialog = DialogManager.artDialogDynamic(div,{
							close:$.proxy(function(){
								this.view.linkDialog=null;
							},this)
						});
						
					}
				},obj));
				
				$("#" + group.id, this.svgdom).on({
					mouseleave: function(event) {
						if($(event.currentTarget).attr('fill')){
							$("*", event.currentTarget).attr('stroke', '#e6e6e6');
						}
					},
					mouseover: function() {
						$("*", this).attr('stroke', 'black');
					}
				});
				$("#" + group.id, this.svgdom).qtip({
					content: {
						text: obj.tooltipText
					},
					style: {
						classes: 'qtip-bootstrap',
						tip: {
							corner: true,
							width: 20,
							height:10
						}
					},
					position:{
						viewport: $(window),
						my:"center left",
						at:"center right",
						target: 'mouse', // Track the mouse as the positioning target
						adjust: {
							method: 'none shift',
							x: +5
							
						} // Offset it slightly from under the mouse
					},
					events: {
						show: $.proxy(function(event, api) {
							var content = this.tooltipText;
							if(Eplant.viewColorMode == "relative"){
								if(this.log2Value){
									content += "</br>Log2 Ratio relative to control: " + this.group.log2Value;
									api.tooltip.css({
										width:"265px"
									});
								}
								else{
									api.tooltip.css({
										width:"200px"
									});
								}
								
							}
							else{
								api.tooltip.css({
									width:"200px"
								})
							}
							api.set('content.text', content);
							
						},obj),
						hide: function(event, api) {
						}
					}
					
				});
			}
		}
		if (this.InfoButtons) {
			for (var n = 0; n < this.InfoButtons.length; n++) {
				var InfoButton = this.InfoButtons[n];
				
				$("#" + InfoButton.id, this.svgdom).qtip({
					content: {
						text: InfoButton.text
					},
					style: {
						classes: 'qtip-bootstrap',
						tip: {
							corner: true,
							width: 20,
							height:10
						}
					},
					position:{
						viewport: $(window),
						my:"center left",
						at:"center right",
						target: 'mouse', // Track the mouse as the positioning target
						adjust: {
							method: 'none shift',
							x: +5
							
						} // Offset it slightly from under the mouse
					},
					events: {
						show: function(event, api) {
							
						},
						hide: function(event, api) {
						}
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
		this.Xhrs.loadDataXhr=$.ajax({
			type: "GET",
			url: this.xmlURL,
			dataType: "xml",
			success: $.proxy(function(response) {
				this.Xhrs.loadDataXhr=null;
				this.webService = "//bar.utoronto.ca/eplant/cgi-bin/cellefp.cgi?";
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
						id: groupData.attributes['id'].value,
						name: groupData.attributes['name'].value,
						samples: [],
						ctrlSamples: [],
						source: groupData.source,
						color: "#e6e6e6",
						isHighlight: false,
						tooltip: null,
						fillColor: "#e6e6e6"
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
				
				this.Xhrs.loadSamplesXhr=$.ajax({
					beforeSend: function(request) {
						request.setRequestHeader('Authorization', 'Bearer ' + Agave.token.accessToken);
					},
					dataType: "json",
					url: Eplant.ServiceUrl + "cellefp.cgi?id=" + this.geneticElement.identifier, 
					success: $.proxy(function(response) {
						this.eFPView.Xhrs.loadSamplesXhr=null;
						this.eFPView.rawSampleData= JSON.stringify(response);
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
						
					
					}, wrapper),
					error: $.proxy(function(jqXHR, status, errorThrown){   //the status returned will be "timeout"
						this.errorLoadingMessage="The sample database is not responding. Try again later.";
						this.loadFinish();
					}, this)//,
					//timeout: 100000 //10 second timeout
				});
				
				
			},this)
		});
	};
	
})();
