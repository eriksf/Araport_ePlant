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
	Eplant.Views.HeatMapView = function() {
		// Get constructor
		var constructor = Eplant.Views.HeatMapView ;
		
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
		/* Create SelectList */
		this.viewNames = [];
		this.views = [];
		this.domTitle = null;
		this.domDescription = null;
		this.domTable = null;
		this.dom = null;
		this.domHeader = null;
		this.headerDfd = null;
		this.viewMode = "heatmap";
		this.isLoadedData = false;
		this.mode = 'absolute';
		this.max=0;
		this.maxUpdated=false;
		this.experimentNumber = 9;
		this.createViewSpecificUIButtons();
		this.createInfoDom();
		this.loadData();
		this.efpViewCount = 15;
		this.efpExperimentViewCount=13;
	};
	ZUI.Util.inheritClass(Eplant.View, Eplant.Views.HeatMapView);		// Inherit parent prototype
	
	Eplant.Views.HeatMapView.viewName = "Heat Map Viewer";
	Eplant.Views.HeatMapView.hierarchy = "species";
	Eplant.Views.HeatMapView.magnification = 5;
	Eplant.Views.HeatMapView.description = "Heat Map viewer";
	Eplant.Views.HeatMapView.citation = "";
	Eplant.Views.HeatMapView.activeIconImageURL = "app/img/active/heatMap.png";
	Eplant.Views.HeatMapView.availableIconImageURL = "app/img/available/heatMap.png";
	Eplant.Views.HeatMapView.unavailableIconImageURL = "app/img/unavailable/heatMap.png";
	
	/**
		* Creates view-specific UI buttons.
	*/
	Eplant.Views.HeatMapView.prototype.createViewSpecificUIButtons = function() {
		/* Mode */
		
		this.modeButton = new Eplant.ViewSpecificUIButton(
		"app/img/efpmode-absolute.png",		// imageSource
		"Toggle data mode: absolute.",	// Description
		function(data) {			// click
			/* Update button */
			if (data.view.mode == "absolute") {
				data.view.mode = "relative";
				this.setImageSource("app/img/efpmode-relative.png");
				this.setDescription("Toggle data mode: relative.");
			}
			else if (data.view.mode == "relative") {
				data.view.mode = "absolute";
				this.setImageSource("app/img/efpmode-absolute.png");
				this.setDescription("Toggle data mode: absolute.");
			}
			
			/* Update eFP */
			data.view.updateDisplay();
		},
		{
			view: this
		}
		);
		this.viewSpecificUIButtons.push(this.modeButton);
		
	};
	Eplant.Views.HeatMapView.prototype.updateDisplay = function() {
		var selector;
		if(this.mode==='absolute')
		{
			selector = 'data-abs-color';
		}else if(this.mode==='relative')
		{
			selector = 'data-rel-color';
		}
		var views = $('.view-td td');
		for (var i = 0; i < views.length; i++) {
			var view = views[i];
			var color=$(view).attr(selector);
			$(view).css({'background-color':color})
		}
		
	};
	Eplant.Views.HeatMapView.prototype.createDom = function() {
		
		
		var geneticElements= Eplant.activeSpecies.displayGeneticElements;
		this.dom = $('<table></table>').css({
			width:'90%',
			height:'90%',
			margin:'5%',
			position:'absolute'
		});
		
		var row = $('<tr></tr>');
		var rowData = $('<td></td>').append($('<div></div>').css({
			height:'24px'
		}));
		row.append(rowData);
		this.dom.append(row);
		
		
		row = $('<tr></tr>').css({'height':'100%'});
		this.heapMapTableHolder = rowData = $('<td></td>').append(this.createTableDom());
		row.append(rowData);
		this.dom.append(row);
		
		
		
	};
	
	
	Eplant.Views.HeatMapView.prototype.refreshHeatMap = function() {
		if(this.heapMapTableHolder){
			$(this.heapMapTableHolder).empty();
			$(this.heapMapTableHolder).append(this.createTableDom());
			
		}
	};
	
	Eplant.Views.HeatMapView.prototype.createInfoDom = function() {
		this.infoDom = $('<div></div>').css({
			overflow:'hidden',
			'min-width': '300px'
		});
		
		var table = $('<table></table>').css({
			width:'100%',
			height:'100%',
			margin:'0%'
		}).appendTo(this.infoDom);
		
		
		var row = $('<tr></tr>').appendTo(table);
		this.domGeneLabel=$('<span></span>').attr('id','domGeneLabel')
		var rowData = $('<td></td>').append(this.domGeneLabel).css({'width':'100px',height:20,'vertical-align': 'middle'}).appendTo(row);
		this.domGene = $('<div/>').attr('id','domGene').html(' ').css({'font-size':'20px'});
		rowData = $('<td></td>').append(this.domGene).appendTo(row);
		
		
		row = $('<tr></tr>').appendTo(table);
		this.domSampleLabel =$('<span></span>').attr('id','domSampleLabel');
		rowData = $('<td></td>').append(this.domSampleLabel).css({'width':'100px',height:15,'vertical-align': 'middle'}).appendTo(row);
		var sampleDiv = $('<div/>').css({
			'font-size':'15px',
			'line-height':'15px',
			'overflow': 'hidden',
			'width': '80%'
		});
		this.domSample = $('<span/>').attr('id','domSample').html(' ').css({
			'text-overflow':'ellipsis',
			'white-space': 'nowrap',
			'overflow': 'hidden',
			'position': 'absolute',
			'width': '60%'
		}).appendTo(sampleDiv);
		rowData = $('<td></td>').append(sampleDiv).appendTo(row);
		
		
		row = $('<tr></tr>').appendTo(table);
		this.domExpressionLevelLabel =$('<span></span>').attr('id','domExpressionLevelLabel');
		rowData = $('<td></td>').append(this.domExpressionLevelLabel).css({'width':'100px',height:15,'vertical-align': 'middle'}).appendTo(row);
		this.domExpressionLevel = $('<div/>').attr('id','domExpressionLevel').html(' ').css({'font-size':'15px'});
		rowData = $('<td></td>').append(this.domExpressionLevel).appendTo(row);
		
		
		row = $('<tr></tr>').appendTo(table);
		this.domDatabaseLabel =$('<span></span>').attr('id','domDatabaseLabel');
		rowData = $('<td></td>').append(this.domDatabaseLabel).css({'width':'100px',height:15,'vertical-align': 'middle'}).appendTo(row);
		this.domDatabase = $('<div/>').attr('id','domDatabase').html(' ').css({'font-size':'15px'});
		rowData = $('<td></td>').append(this.domDatabase).appendTo(row);
		
		row = $('<tr></tr>').appendTo(table);
		this.domClickText = $('<div/>').html(' ').css({
			'font-size':'13px',
			'margin-top': '5px',
			color: '#99cc00'
		});
		rowData = $('<td></td>').attr('colspan','2').append(this.domClickText).appendTo(row);
		
		return this.infoDom;
	};
	
	
	Eplant.Views.HeatMapView.prototype.updateGlobalMax = function() {
		this.maxUpdated=false;
		var geneticElements= Eplant.activeSpecies.displayGeneticElements;
		for (var i = 0; i < geneticElements.length; i++) {
			var geneticElement = geneticElements[i];
			for (var j = 0; j < this.viewNames.length; j++) {
				var localMax = geneticElement.views[this.viewNames[j]].max;
				if(localMax && localMax>this.max){
					this.max = localMax;
					this.maxUpdated = true;
				}
			}
		}
		
	};
	
	Eplant.Views.HeatMapView.prototype.geneticElementHeatmap = function(geneticElement) {
		this.updateGlobalMax();
		var row = $('<tr></tr>').addClass('gene-tr');
		$(row).attr('data-geneIdentifier',geneticElement.identifier);
		for (var j = 0; j < this.viewNames.length; j++) {
			var viewDom = this.createViewDom(geneticElement,this.viewNames[j],'absolute');
			//var viewDom = geneticElement.views[this.viewNames[j]].heatmapDom;
			if(viewDom){
				viewDom.css({'height':'25px'})
			}
			rowData = $('<td></td>').append(viewDom).css('height','25px');
			row.append(rowData);
		}
		return row;
	};
	
	Eplant.Views.HeatMapView.prototype.changeActiveGeneRow = function(identifier) {
		var activeGeneTr=$('tr[data-geneIdentifier='+identifier+']',this.domTable);
		$('.gene-tr',this.dom).removeClass('active-gene-tr');
		activeGeneTr.addClass('active-gene-tr');
	};
	
	Eplant.Views.HeatMapView.prototype.removeRow = function(identifier) {
		var removedGeneTr=$('tr[data-geneIdentifier='+identifier+']',this.domTable);
		removedGeneTr.remove();
	};
	
	Eplant.Views.HeatMapView.prototype.addNewRow = function(geneticElement) {
		//remove existing row with same id, mainly loading ones
		
		var row = $('<tr></tr>').addClass('gene-tr');
				$(row).attr('data-geneIdentifier',geneticElement.identifier);
		var rowData = $('<td></td>').append(geneticElement.identifier).css({'width':'100px','vertical-align': 'middle'});
		row.append(rowData);
		if(geneticElement.isLoadedEFPViewsData){
			for (var j = 0; j < this.viewNames.length; j++) {
				var viewDom = this.createViewDom(geneticElement,this.viewNames[j],this.mode);
				//var viewDom = geneticElement.views[this.viewNames[j]].heatmapDom;
				if(viewDom){
					viewDom.css({'height':'25px'})
				}
				$(viewDom).on('click',$.proxy(function(){
					Eplant.changeActiveView(this.geneticElement.views[this.viewName]);
					
				},{viewName:this.viewNames[j],geneticElement:geneticElement}));
				rowData = $('<td></td>').append(viewDom).addClass('view-td');
				row.append(rowData);
				$('td', rowData).on('mouseover',$.proxy(function(e) {
					var current = $(e.currentTarget);
					//var viewtd = $(current).closest('.view-td');
					var genetr = $(current).closest('.gene-tr');
					//var viewcolumn = this.domTable.children('tbody').children('tr').children("td:nth-child(" + (viewtd.index()+1) + ")");
					/*this.verticalSelectionBox.css({
						height:this.domTable.height(),
						left:current.position().left-1
						});
					this.verticalSelectionBox.insertBefore(this.domTable);*/
					if(genetr.length>0){
						genetr.css({
							'font-weight': 'bold'
						});
						//genetr.addClass('heat-map-hover');
						current.addClass('heat-map-hover');
						//$("td:nth-child(" + (current.index()+1) + ")",viewcolumn).addClass("heat-map-hover");
						var gene = $(e.currentTarget).attr('data-gene');
						if(gene){
							this.domGeneLabel.html('Gene');
							this.domGene.html(gene);
							var viewName =$(e.currentTarget).attr('data-view-name');
							if(viewName){
								this.domClickText.html('Click to open '+viewName);
							}
						}
						var tissue = $(e.currentTarget).attr('data-tissue');
						if(tissue){
							this.domSampleLabel.html('Sample');
							this.domSample.html(tissue);
						}
						var expression = $(e.currentTarget).attr('data-expression-level');
						if(expression){
							this.domExpressionLevelLabel.html('Value');
							if($(e.currentTarget).attr('data-view-name')==='Cell eFP'){
								this.domExpressionLevel.html('Localization Score: '+expression);
							}
							else{
								this.domExpressionLevel.html('Expression Level: '+expression);
							}
							
						}
						
						var database =$(e.currentTarget).attr('data-database');
						if(database){
							this.domDatabaseLabel.html('Database');
							this.domDatabase.html(database);
						}
						
						var tooltip = new Eplant.Tooltip({
							content: this.infoDom,
							x:e.clientX,
							y:e.clientY+20,
							classes: 'arrow-bottom',
							ele:current
						});
						this.tooltip = tooltip;
						
					}
				},this));
				$('td', rowData).on('mouseleave',$.proxy(function(e) {
					var current = $(e.currentTarget);
					//var viewtd = $(current).closest('.view-td');
					var genetr = $(current).closest('.gene-tr');
					//var viewcolumn = this.domTable.children('tbody').children('tr').children("td:nth-child(" + (viewtd.index()+1) + ")");
					/*this.verticalSelectionBox.css({
						height:this.domTable.height(),
						left:current.position().left-1
						});
					this.verticalSelectionBox.insertBefore(this.domTable);*/
					if(genetr.length>0){
						genetr.css({
							'font-weight': 'normal'
						});
						//genetr.removeClass('heat-map-hover');
						this.verticalSelectionBox.detach();
						current.removeClass('heat-map-hover');
						//$("td:nth-child(" + (current.index()+1) + ")",viewcolumn).removeClass("heat-map-hover");
						this.domGene.html(' ');
						this.domSample.html(' ');
						this.domExpressionLevel.html(' ');
						this.domDatabase.html(' ');
						this.domGeneLabel.html('');
						this.domSampleLabel.html('');
						this.domExpressionLevelLabel.html('');
						this.domDatabaseLabel.html('');
						this.domClickText.html('');
						
					}
					if (this.tooltip) {
						this.tooltip.close();
						this.tooltip = null;
					}
				},this));
			}
			}else{
			rowData = $('<td></td>').attr('colspan',this.efpViewCount).appendTo(row);
			var h2 = document.createElement('h2');
			$(h2).addClass('heatmapGeneLoading');
			var span = document.createElement('span');
			span.innerHTML="Loading";
			$(h2).append(span).appendTo(rowData);
		}
		var existing = $("td",this.domTable).filter(function() { return $.text([this]) == geneticElement.identifier; }).closest('tr');
		if(existing.length>0){
			$(existing).replaceWith(row);
		}
		else{
			this.domTable.append(row);
		}
		
		
		
	};
	
	Eplant.Views.HeatMapView.prototype.createTableDom = function() {
		var geneticElements= Eplant.activeSpecies.displayGeneticElements;
		this.domTable = $('<table></table>').css({
			width:'100%'
		});
		var headerRow = $('<tr></tr>').appendTo(this.domTable);
		var rowData = $('<td></td>').css({'height':'30px'}).appendTo(headerRow);
		rowData = $('<td></td>').css({'height':'30px'}).appendTo(headerRow);
		$('<img/>',{
			'src': "app/img/available/plant.png"
		}).addClass('heatmapViewIcon')
		.appendTo($('<div></div>').addClass('heatmapViewIconDiv').appendTo(rowData));
		rowData = $('<td></td>').attr('colspan',this.efpExperimentViewCount).css({'height':'30px'}).appendTo(headerRow);
		$('<img/>',{
			'src': "app/img/available/experiment.png"
		}).addClass('heatmapViewIcon')
		.appendTo($('<div></div>').addClass('heatmapViewIconDiv').appendTo(rowData));
		rowData = $('<td></td>').css({'height':'30px'}).appendTo(headerRow);
		$('<img/>',{
			'src': "app/img/available/cell.png"
		}).addClass('heatmapViewIcon')
		.appendTo($('<div></div>').addClass('heatmapViewIconDiv').appendTo(rowData));
		this.verticalSelectionBox = $('<div></div>').css({
			height: '0',
			position: 'absolute',
			outline: '1px solid #aaa',
			width: '4px',
			'pointer-events':'none'
		});
		this.allLoaded = true;
		if(!this.headerDfd) this.headerDfd= this.loadTableHeader();
		this.headerDfd.then($.proxy(function(){
			if(this.domHeader){
				this.domTable.append(this.domHeader);
			}
			var tempGeneticElements = []
			for (var i = 0; i < geneticElements.length; i++) {
				var geneticElement = geneticElements[i];
				tempGeneticElements.push(geneticElement);
				if(geneticElement.expressionAnglerGenes.length>0)
				tempGeneticElements=tempGeneticElements.concat(geneticElement.expressionAnglerGenes);
			}
			geneticElements=tempGeneticElements;
			for (var i = 0; i < geneticElements.length; i++) {
				var geneticElement = geneticElements[i];
				this.addNewRow(geneticElement);
				
			}
			this.changeActiveGeneRow(Eplant.activeSpecies.activeGeneticElement.identifier);
			if(this.allLoaded){
				this.loadFinish();
			}
			
			
			
		},this));
		
		return this.domTable;
	};
	
	
	
	Eplant.Views.HeatMapView.prototype.createViewDom = function(geneticElement,viewName, mode) {
		var view = geneticElement.views[viewName];
		var table = null;
		if(view.isLoadedData){
			table = $('<table></table>').css({
				width:'100%',
				height:'100%'
			});
			row = $('<tr></tr>');
			for (var j = 0; j < view.groups.length; j++) {
				var group = view.groups[j];
				var rowData = $('<td></td>')
				.attr('data-rel-color',group.color)
				.attr('data-gene',geneticElement.identifier)
				.attr('data-tissue',group.name)
				.attr('data-expression-level',group.mean)
				.attr('data-database',group.database)
				.attr('data-view-name',view.name);
				row.append(rowData);
				
				if(view.name ==='Cell eFP'){
					rowData.attr('data-abs-color',this.getAbsoluteColor(group,106))
				}
				else
				{
					rowData.attr('data-abs-color',this.getAbsoluteColor(group,this.max));
				}
				
				
				var color;
				if(mode==='absolute'){
					color=rowData.attr('data-abs-color');
				}
				else{
					color=rowData.attr('data-rel-color');
				}
				rowData.css({'background-color':color});
			}
			table.append(row);
			}else{
			this.allLoaded = false;
		}
		return table;
	};
	
	Eplant.Views.HeatMapView.prototype.loadTableHeader = function(urls) {
		this.headerDfd = $.Deferred();
		// var headerRow = $('<tr></tr>');
		// var rowData = $('<td>Experiment</td>').css({'width':'100px','vertical-align': 'middle'});
		// headerRow.append(rowData);
		// urls.reduce($.proxy(function(prev, cur, index) {
			// return prev.then($.proxy(function(data) {
				// return $.ajax(cur).then($.proxy(function(response) {
					// /* Create groups */
					// this.experimentNumber++;
					// var table = $('<table></table>').css({
						// width:'100%',
						// height:'100%'
					// });
					// var row = $('<tr></tr>').addClass('gene-tr');
					// var groupsXml = $(response).find('tissue');
					// var database = null;
					// if($(response).find('view')[0]&&$(response).find('view')[0].attributes['db'])database = $(response).find('view')[0].attributes['db'].value;
					// for (var n = 0; n < groupsXml.length; n++) {
						
						// /* Get group data */
						// var groupData = groupsXml[n];
						
						// var rowData = $('<td></td>')
						// .css({'background-color':groupData.attributes['colorKey']?groupData.attributes['colorKey'].value:'#ffffff','height':'25px'})
						// .attr('data-tissue',groupData.attributes['name']?groupData.attributes['name'].value:'')
						// .attr('data-database',database?database:'');
						// row.append(rowData);
						
						// $(rowData).on('mouseover',$.proxy(function(e) {
							// var current = $(e.currentTarget);
							
							// var genetr = $(current).closest('.gene-tr');

							// if(genetr.length>0){
								// genetr.css({
									// 'font-weight': 'bold'
								// });
								
								// current.addClass('heat-map-hover');
							
								
								// var tissue = $(e.currentTarget).attr('data-tissue');
								// if(tissue){
									// this.domSampleLabel.html('Sample');
									// this.domSample.html(tissue);
								// }
								
								// var database =$(e.currentTarget).attr('data-database');
								// if(database){
									// this.domDatabaseLabel.html('Database');
									// this.domDatabase.html(database);
								// }
								
								// var tooltip = new Eplant.Tooltip({
									// content: this.infoDom,
									// x:e.clientX,
									// y:e.clientY,
									// classes: 'arrow-bottom',
									// ele:current
								// });
								// this.tooltip = tooltip;
								
							// }
						// },this));
						// $(rowData).on('mouseleave',$.proxy(function(e) {
							// var current = $(e.currentTarget);
							
							// var genetr = $(current).closest('.gene-tr');
							
							// if(genetr.length>0){
								// genetr.css({
									// 'font-weight': 'normal'
								// });
								
								// this.verticalSelectionBox.detach();
								// current.removeClass('heat-map-hover');
								
								// this.domGene.html(' ');
								// this.domSample.html(' ');
								// this.domExpressionLevel.html(' ');
								// this.domDatabase.html(' ');
								// this.domGeneLabel.html('');
								// this.domSampleLabel.html('');
								// this.domExpressionLevelLabel.html('');
								// this.domDatabaseLabel.html('');
								// this.domClickText.html('');
								
							// }
							// if (this.tooltip) {
								// this.tooltip.close();
								// this.tooltip = null;
							// }
						// },this));
						
					// }
					// table.append(row);
					// $('<td></td>').append(table).addClass('view-td').appendTo(headerRow);
				// },this));
			// },this))
			// },this), $().promise()).done($.proxy(function() {
			// this.domHeader=headerRow.css({'padding':'10px 0','height':'25px'});
			// this.headerDfd.resolve(headerRow);
		// },this));
		this.headerDfd.resolve();
		return this.headerDfd;
	};
	
	Eplant.Views.HeatMapView.prototype.loadData = function() {
		$.getJSON( "data/heatMap/viewsMap.json", $.proxy(function( data ) {
			this.views = data;
			this.viewNames = [];
			var xmlUrls = [];
			for (var n = 0; n < this.views.length; n++) {
				this.viewNames.push(this.views[n].name.replace(/ /g, "") + "View");
				xmlUrls.push(this.views[n].xmlurl + Eplant.activeSpecies.scientificName.replace(" ", "_") + '.xml');
				
			}
			this.loadTableHeader(xmlUrls).then(this.loadFinish());
		},this));
		
	};
	/**
		* Active callback method.
		*
		* @override
	*/
	Eplant.Views.HeatMapView.prototype.active = function() {
		/* Call parent method */
		Eplant.View.prototype.active.call(this);
		this.updateGlobalMax();
		this.createDom();
		$("#heatmap_container").css({'overflow':'hidden'});
		$("#heatmap_container").append(this.dom);
	};
	
	/**
		* Inactive callback method.
		*
		* @override
	*/
	Eplant.Views.HeatMapView.prototype.inactive = function() {
		/* Call parent method */
		Eplant.View.prototype.inactive.call(this);
		if (this.tooltip) {
			this.tooltip.close();
			this.tooltip = null;
		}
		$(this.dom).remove();
		$("#heatmap_container").css({'overflow':'auto'});
	};
	
	Eplant.Views.HeatMapView.prototype.beforeInactive = function() {
		Eplant.View.prototype.beforeInactive.call(this);
		$("#heatmap_container").css({'overflow':'hidden'});
	};
	
	
	Eplant.Views.HeatMapView.prototype.afterActive = function() {
		Eplant.View.prototype.afterActive.call(this);
		$("#heatmap_container").css({'overflow':'auto'});
		
	};
	
	/**
		* Draws the View's frame.
		*
		* @Override
	*/
	Eplant.Views.HeatMapView.prototype.draw = function() {
		
	};
	
	/**
		* Cleans up the View for disposal
		*
		* @override
	*/
	Eplant.Views.HeatMapView.prototype.remove = function() {
		
	};
	
	
	Eplant.Views.HeatMapView.prototype.showCitation = function() {
		var containerElement = document.createElement("div");
		$(containerElement).enableSelection();
		containerElement.style.textAlign = "left";
		containerElement.innerHTML = "Loading citation...";
		var dialog = art.dialog({
			content: containerElement,
			title: "Citation",
			width: 600,
			minHeight: 0,
			resizable: false,
			draggable: false,
			lock: true,
			position: [document.width / 2, 150],
			buttons: [{
				text: "Close",
				click: $.proxy(function(event, ui) {
					$(this).dialog("close");
				}, containerElement)
			}],
			close: $.proxy(function() {
				$(this).remove();
			}, containerElement)
			
		})
		
		var obj = {
			dialog: dialog,
			view:this
		};
		$.ajax({
			type: "GET",
			url: "cgi-bin/citation.cgi?view=" + ZUI.activeView.name,
			dataType: "json"
			}).done($.proxy(function(response) {
			
			var genes = $.map(Eplant.activeSpecies.displayGeneticElements, function(gene,index) {
				return gene.identifier;
			}).join(", ");
			
			var content = "This chart shows the expression levels of "+genes+" across 350+ samples along with the corresponding subcellular localizations of the gene products.";
			if(response.source) content+="<br><br>" + response.source;
			if(response.notes) content+="<br><br>" + response.notes;
			if(response.URL) content+="<br><br>" + response.URL;
			obj.dialog.content(content);
			
		}, obj));
	};
	Eplant.Views.HeatMapView.prototype.getAbsoluteColor=function(group,max){
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
		* Returns The exit-out animation configuration.
		*
		* @override
		* @return {Object} The exit-out animation configuration.
	*/
	Eplant.Views.HeatMapView.prototype.getExitOutAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitOutAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.dom).stop().animate({
				top: "250%"
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
	Eplant.Views.HeatMapView.prototype.getEnterOutAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterOutAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			
			$(this.dom).css({
				top: "-250%"
			});
			$(this.dom).stop().animate({
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
	Eplant.Views.HeatMapView.prototype.getExitInAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitInAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.dom).stop().animate({
				top: "-250%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The enter-in animation configuration.
		*
		* @override
		* @return {Object} The enter-in animation configuration.
	*/
	Eplant.Views.HeatMapView.prototype.getEnterInAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterInAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.dom).css({
				top: "250%"
			});
			$(this.dom).stop().animate({
				top: "0%"
			}, 1000);
		}, this);
		return config;
	};
	
	
	
})();
