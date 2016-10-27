(function () {
	/* global Eplant, ZUI, cytoscape*/
	
	/**
		* Eplant.Views.InteractionView class
		* Coded by Ian Shi & Hans Yu
		* UI designed by Jamie Waese
		*
		* eFP View for browsing protein-protein interactions data.
		* Uses the Cytoscape.js plugin.
		*
		* @constructor
		* @augments Eplant.View
		* @param {Eplant.GeneticElement} geneticElement The GeneticElement associated with this view.
	*/
	'use strict';
	Eplant.Views.InteractionView = function (geneticElement) {
		// Get constructor
		var constructor = Eplant.Views.InteractionView;
		
		// Call parent constructor
		Eplant.View.call(this,
		constructor.displayName,
		// Name of the View visible to the user
		constructor.viewName,
		// Hierarchy of the View
		constructor.hierarchy,
		// Magnification level of the View
		constructor.magnification,
		// Description of the View visible to the user
		constructor.description,
		// Citation template of the View
		constructor.citation,
		// URL for the active icon image
		constructor.activeIconImageURL,
		// URL for the available icon image
		constructor.availableIconImageURL,
		// URL for the unavailable icon image
		constructor.unavailableIconImageURL
		);
		
		// Attributes
		
		/**
			* The GeneticElement associated with this view
			* @type {Eplant.geneticElement}
		*/
		this.geneticElement = geneticElement;
		/**
			* Cytoscape object
			* @type {Cytoscape Object}
		*/
		this.cy = null;
		/**
			* Cytoscape configuration object. Stores Cytoscape parameters prior to initialization
			* @type {Object}
		*/
		this.cyConf = null;
		/**
			* GeneticElementDialog information
			* @type {Object}
		*/
		this.geneticElementDialogInfo = null;
		/**
			* Interaction tooltip information
			* @type {Object}
		*/
		this.interactionTooltipInfo = null;
		/**
			* Legend
			* @type {Eplant.Views.InteractionView.Legend}
		*/
		this.legend = null;
		/**
			* Event listeners
			* @type {Array}
		*/
		this.eventListeners = [];
		/**
			* FilterDialog Object
			* @type {Eplant.Views.InteractionView.FilterDialog}
		*/
		this.filterDialog = null;
		/**
			* The fitted state of the cytoscape object
			* @type {Boolean}
		*/
		this.fitted = false;
		/**
			* The eplant view mode of this view
			* @type {String}
		*/
		this.viewMode = 'cytoscape';
		/**
			* The currently active node dialog object
		*/
		this.nodeDialog = null;
		/**
			* The collection of all visible node dialogs
		*/
		this.nodeDialogs = [];
		
		// Create view-specific UI buttons
		this.createViewSpecificUIButtons();
		
		// Set Cytoscape configurations
		this.setCyConf();
		this.domHolder = document.createElement('div');
		$(this.domHolder).css({
			width: '100%',
			height: '100%',
			'background-color':"#ffffff"
		});
		this.domContainer = document.createElement('div');
		$(this.domContainer).css({
			width: '100%',
			height: '100%'
		});
		$(this.domHolder).append(this.domContainer);
		$(document.body).append(this.domHolder);
		// Load interaction data, then load sulocalization data and layout
		this.loadInteractionData(this.loadSublocalizationData, this.setLayout, this);
		
		// Create legend
		this.legend = new Eplant.Views.InteractionView.Legend(this);
		
		
		if(this.name)
		{
			$(this.labelDom).empty();
			this.viewNameDom = document.createElement("span");
			var labelText = this.geneticElement.identifier;
			if (this.geneticElement.aliases && this.geneticElement.aliases.length && this.geneticElement.aliases[0].length) {
				labelText += " / " + this.geneticElement.aliases.join(", ");
			}
			var text = this.name+': '+labelText;
			/*if(this.geneticElement.isRelated){
				text += ", "+this.geneticElement.identifier+" correlates to "+this.geneticElement.relatedGene.identifier+" with an r-value of "+this.geneticElement.rValueToRelatedGene;
			}*/
			this.viewNameDom.appendChild(document.createTextNode(text));
			$(this.viewNameDom).appendTo(this.labelDom);
		}
		
		// Bind events
		this.bindEvents();
	};
	
	// Inherit parent prototype
	ZUI.Util.inheritClass(Eplant.View, Eplant.Views.InteractionView);
	Eplant.Views.InteractionView.displayName = 'Interaction Viewer';
	Eplant.Views.InteractionView.viewName = 'Interaction Viewer';
	Eplant.Views.InteractionView.hierarchy = 'genetic element';
	Eplant.Views.InteractionView.magnification = 60;
	Eplant.Views.InteractionView.description = 'Interaction viewer';
	Eplant.Views.InteractionView.citation = '';
	Eplant.Views.InteractionView.activeIconImageURL = 'app/img/active/interaction.png';
	Eplant.Views.InteractionView.availableIconImageURL = 'app/img/available/interaction.png';
	Eplant.Views.InteractionView.unavailableIconImageURL = 'app/img/unavailable/interaction.png';
	
	// Constants
	// DOM container element for Cytoscape
	Eplant.Views.InteractionView.domContainer = null;
	// If the number of interactions exceeds this number, a filter will be applied automatically
	Eplant.Views.InteractionView.interactionsThreshold = 300;
	
	/* Static methods */
	Eplant.Views.InteractionView.getZUIDistance = function (zoom) {
		return ZUI.width / 2 / zoom;
	};
	Eplant.Views.InteractionView.getZUIPosition = function (pan) {
		return {
			x: ZUI.camera.unprojectDistance(ZUI.width / 2) - ZUI.width / 2 -
			ZUI.camera.unprojectDistance(pan.x),
			y: ZUI.camera.unprojectDistance(ZUI.height / 2) - ZUI.height / 2 -
			ZUI.camera.unprojectDistance(pan.y)
		};
	};
	Eplant.Views.InteractionView.getCyZoom = function (distance) {
		return ZUI.width / 2 / distance;
	};
	Eplant.Views.InteractionView.getCyPan = function (position) {
		return {
			x: ZUI.camera.projectDistance(ZUI.camera.unprojectDistance(ZUI.width / 2) -
			ZUI.width / 2 - position.x),
			y: ZUI.camera.projectDistance(ZUI.camera.unprojectDistance(ZUI.height / 2) -
			ZUI.height / 2 - position.y)
		};
	};
	
	/**
		* Initializes the view's pre-requisites.
		* @returns {void}
	*/
	Eplant.Views.InteractionView.initialize = function () {
		// Get DOM container and cache
		var cytoscapeContainer = document.getElementById('Cytoscape_container');
		var cytoscapeCache = document.getElementById('Cytoscape_cache');
		// Assignment to interactionView attributes
		Eplant.Views.InteractionView.domContainer = cytoscapeContainer;
		Eplant.Views.InteractionView.domCacheContainer = cytoscapeCache;
	};
	
	/**
		* Active callback method.
		*
		* @override
	*/
	Eplant.Views.InteractionView.prototype.active = function () {
		// Call parent method
		Eplant.View.prototype.active.call(this);
		
		// Start Cytoscape
		if (this.isLoadedData) {
			$(this.domHolder).appendTo(Eplant.Views.InteractionView.domContainer);
			this.cy.resize();
			this.resize();
			this.cy.forceRender();
			// Zoom in slightly to fit screen
			if (this.nodeAlign && this.nodeAlign.circular) {
				this.cy.zoom(this.cy.zoom() * 1.5);
			}
		}
		
		// Attach legend
		if (this.legend.isVisible) {
			this.legend.attach();
		}
		
		// Attach data filtering label
		if (this.filterDialog && this.filterDialog.filterLabelVisible) {
			this.filterDialog.attachDataFilterLabel();
		}
		// Attach recursive label
		if (this.nonRecursiveQuery === true) {
			$('#nonRecursiveLabel').show();
		}
	};
	
	/**
		* Inactive callback method.
		*
		* @override
	*/
	Eplant.Views.InteractionView.prototype.inactive = function () {
		// Call parent method
		Eplant.View.prototype.inactive.call(this);
		$(this.domHolder).appendTo(Eplant.Views.InteractionView.domCacheContainer);
		
		// Save layout
		if (this.cy) {
			this.cyConf.layout.name = 'preset';
		}
		
		if (this.tooltip) {
			this.tooltip.close();
			this.tooltip = null;
		}
		
		// Detach legend
		if (this.legend.isVisible) {
			this.legend.detach();
		}
		
		// Detach data label
		if (this.filterDialog && this.filterDialog.filterLabelVisible) {
			this.filterDialog.detachDataFilterLabel();
		}
		// Detach recursive label
		if (this.nonRecursiveQuery) {
			$('#nonRecursiveLabel').hide();
		}
		
		// Close all node dialogs
		if(this.nodeDialog) {
			this.nodeDialog.close();
		}
		if (this.nodeDialogs) {
			for (var n = 0; n < this.nodeDialogs.length; n = n + 1) {
				if (this.nodeDialogs[n]) {
					this.nodeDialogs[n].close();
				}
			}
		}
		this.nodeDialog = null;
		this.nodeDialogs = [];
		
		// Stop passing input events to Cytoscape
		ZUI.passInputEvent = null;
		this.cyConf.zoom = this.zoom;
		this.cyConf.pan = this.pan;
	};
	
	/**
		* Draw callback method.
		*
		* @override
	*/
	Eplant.Views.InteractionView.prototype.draw = function () {
		/* Call parent method */
		Eplant.View.prototype.draw.call(this);
		
		
		/* Draw annotations */
		if (this.cy) {
			var nodes = this.cy.nodes();
			for (var n = 0; n < nodes.length; n = n + 1) {
				var node = nodes[n];
				if (node._private.data.annotation && node.visible()) {
					node._private.data.annotation.draw();
				}
			}
		}
	};
	
	/**
		* Clean up view.
		*
		* @override
	*/
	Eplant.Views.InteractionView.prototype.remove = function () {
		// Call parent method
		Eplant.View.prototype.remove.call(this);
		
		
		// Remove EventListeners
		for (var n = 0; n < this.eventListeners.length; n = n + 1) {
			var eventListener = this.eventListeners[n];
			ZUI.removeEventListener(eventListener);
		}
	};
	
	/**
		* Creates view-specific UI buttons.
		* @returns {void}
	*/
	Eplant.Views.InteractionView.prototype.createViewSpecificUIButtons = function () {
		// Filter
		this.filterButton = new Eplant.ViewSpecificUIButton(
		// imageSource
		'app/img/filter-interaction.png',
		// description
		'Filter interactions.',
		function (data) {
			if (data.interactionView.filterDialog) {
				data.interactionView.filterDialog.createDialog();
				} else {
				// Create Filter Dialog
				var filterDialog = new Eplant.Views.InteractionView.FilterDialog(
				data.interactionView);
				data.interactionView.filterDialog = filterDialog;
			}
		}, {interactionView: this});
		this.viewSpecificUIButtons.push(this.filterButton);
		
		// Legend
		var viewSpecificUIButton = new Eplant.ViewSpecificUIButton(
		// imageSource
		'app/img/legend.png',
		// description
		'Toggle legend.',
		function (data) {
			// Check whether legend is showing
			if (data.interactionView.legend.isVisible) {
				// Hide legend
				data.interactionView.legend.hide();
				} else {
				// Show legend
				data.interactionView.legend.show();
			}
		}, {interactionView: this}
		);
		this.viewSpecificUIButtons.push(viewSpecificUIButton);
	};
	
	/**
		* Sets Cytoscape configurations.
		* @returns {void}
	*/
	Eplant.Views.InteractionView.prototype.setCyConf = function () {
		this.cyConf = {
			wheelSensitivity: 0.3
		};
		// Layout algorithm
		this.cyConf.layout = {
			// Will be set to cose-bilkent if network is not empty
			name: 'grid',
			fit: false,
			nodeMass: function (data) {
				return data.mass;
			}
		};
		
		// Style sheet
		this.cyConf.style = cytoscape.stylesheet()
		.selector('node.Protein')
		.css({
			shape: 'circle',
			width: 'data(size)',
			height: 'data(size)',
			content: 'data(content)',
			color: 'data(color)',
			'background-color': 'data(backgroundColor)',
			'font-size': 'data(fontsize)',
			'font-weight': 'bold',
			'text-background-shape': 'roundrectangle',
			'text-background-color': 'data(backgroundColor)',
			'text-background-opacity': '1',
			'border-width': 'data(borderWidth)',
			'border-color': 'data(borderColor)',
			'text-valign': 'center',
			'padding-left': '3px',
			'padding-bottom': '3px',
			'padding-right': '3px',
			'padding-top': '3px'
		})
		.selector('node.queryNode')
		.css({
			shape: 'circle',
			width: 'data(size)',
			height: 'data(size)',
			content: 'data(content)',
			color: 'data(color)',
			'background-color': 'data(backgroundColor)',
			'font-size': 'data(fontsize)',
			'font-weight': 'bold',
			'text-background-shape': 'roundrectangle',
			'text-background-color': 'data(backgroundColor)',
			'text-background-opacity': '1',
			'border-width': 'data(borderWidth)',
			'border-color': 'data(borderColor)',
			'text-valign': 'center',
			'padding-left': '3px',
			'padding-bottom': '3px',
			'padding-right': '3px',
			'padding-top': '3px'
		})
		.selector('node.DNA')
		.css({
			shape: 'square',
			width: 'data(size)',
			height: 'data(size)',
			content: 'data(content)',
			color: 'data(color)',
			'background-color': 'data(backgroundColor)',
			'font-size': 'data(fontsize)',
			'font-weight': 'bold',
			'text-background-shape': 'roundrectangle',
			'text-background-color': 'data(backgroundColor)',
			'text-background-opacity': '1',
			'border-width': 'data(borderWidth)',
			'border-color': 'data(borderColor)',
			'text-valign': 'center',
			'padding-left': '3px',
			'padding-bottom': '3px',
			'padding-right': '3px',
			'padding-top': '3px'
		})
		.selector('node.trans')
		.css({
			content: 'data(content)'
		})
		.selector('node.highlight')
		.css({
			shape: 'circle',
			'font-weight': 'bold'
		})
		.selector('node.loaded')
		.css({
			'background-color': '#3C3C3C',
			'text-background-color': '#3C3C3C',
			color: '#FFFFFF'
		})
		.selector('edge')
		.css({
			width: 'data(size)',
			'line-style': 'data(lineStyle)',
			'line-color': 'data(lineColor)',
			'curve-style': 'data(curveStyle)',
			'mid-target-arrow-shape': 'data(targetArrowShape)',
			'mid-target-arrow-color': 'data(lineColor)',
			'control-point-distance': '50px',
			'control-point-weight': '0.5'
		})
		.selector('edge.trans')
		.css({
			width: 'data(size)',
			'line-style': 'data(lineStyle)',
			'line-color': 'data(lineColor)',
			'curve-style': 'segments',
			'segment-distances': '10 -10',
			'segment-weights': '0.33 0.66'
		})
		.selector('#noInteractionLabel')
		.css({
			width: '1px',
			height: '1px',
			content: 'data(label)',
			color: '#000',
			'text-background-opacity': '0'
		})
		.selector('#compoundDNA')
		.css({
			shape: 'roundrectangle',
			'background-color': '#F3F3F3',
			'background-opacity': '0.4',
			'text-background-color': '#FFF',
			'text-background-opacity': '0',
			'border-width': '0px',
			'text-wrap': 'wrap',
			content: 'Protein-DNA\nInteractions',
			color: '#000',
			'padding-top': '100px',
			'padding-right': '25px',
			'padding-left': '25px',
			'font-size': 13,
			'font-weight': 'normal',
			'text-outline-width': '0px',
			'text-valign': 'top',
			'text-halign': 'center'
		})
		.selector('#compoundProtein')
		.css({
			shape: 'roundrectangle',
			'background-color': '#F3F3F3',
			'background-opacity': '0',
			'text-background-color': '#FFF',
			'text-background-opacity': '1',
			'border-width': '0px',
			'text-wrap': 'wrap',
			content: 'Protein-Protein\nInteractions',
			color: '#000',
			'padding-top': '100px',
			'padding-right': '25px',
			'padding-left': '25px',
			'font-size': 13,
			'font-weight': 'normal',
			'text-outline-width': '0px',
			'text-valign': 'top',
			'text-halign': 'center'
		});
		/* Create elements arrays */
		this.cyConf.elements = {
			nodes: [],
			edges: []
		};
		
		// Ready event handler
		this.cyConf.ready = $.proxy(function () {
			// Save Cytoscape object
			this.cy = $(this.domContainer).cytoscape('get');
			var querySelector = '#' + this.geneticElement.identifier.toUpperCase() + 'QUERY';
			// Save query node to interactions view
			this.queryNode = this.cy.nodes(querySelector);
			// Create no interactions label if no interactions exist
			if (this.cyConf.elements.nodes.length <= 1) {
				var node = {
					group: 'nodes',
					// etc...
					data: {
						id: 'noInteractionLabel',
						shape: 'circle',
						label: 'No interactions found for this gene.',
						fontsize: 15,
						textOutlineWidth: 0,
						backgroundColor: '#fff',
						borderColor: '#fff',
						borderWidth: 0
					},
					position: {
						x: this.queryNode.position().x,
						y: this.queryNode.position().y + 100
					}
				};
				this.cy.add(node);
				this.cy.noInteraction = true;
			}
			
			// Filter elements if view is too dense
			var numEdges = this.cyConf.elements.edges.length;
			if (numEdges > Eplant.Views.InteractionView.interactionsThreshold) {
				if(this.filter){
					var edges = this.filter.filterEdges('[confidence < 2][correlation <0.5]');
					edges.hide();
					this.filter.cleanNodes();
				}
				
			}
			
			// Update annotations
			for (var n = 0; n < this.cyConf.elements.nodes.length; n = n + 1) {
				var node = this.cyConf.elements.nodes[n];
				if (node.data.annotation) {
					node.data.annotation.update();
				}
			}
			// Listen for zoom events
			this.cy.on('zoom', $.proxy(function () {
				// Synchronize with ZUI camera distance
				ZUI.camera.setDistance(Eplant.Views.InteractionView.getZUIDistance(this.cy.zoom()));
				this.zoom = this.cy.zoom();
				this.cyConf.zoom = this.zoom;
			}, this));
			// Listen for pan events
			this.cy.on('pan', $.proxy(function () {
				// Synchronize with ZUI camera position
				var position = Eplant.Views.InteractionView.getZUIPosition(this.cy.pan());
				ZUI.camera.setPosition(
				position.x,
				position.y
				);
				this.pan = this.cy.pan();
				this.cyConf.pan = this.pan;
			}, this));
			
			// Listen for mouseover events on nodes
			this.cy.on('mouseover', 'node', $.proxy(function (event) {
				var nodeID = event.cyTarget.data('id');
				// Check that the node is not a compound node
				if (nodeID !== 'compoundDNA' && nodeID !== 'compoundProtein') {
					this.nodeMouseOverHandler(this, event);
				}
			}, this));
			// Listen for mouseout events on nodes
			this.cy.on('mouseout', 'node', $.proxy(function (event) {
				var nodeID = event.cyTarget.data('id');
				if (nodeID !== 'compoundDNA' && nodeID !== 'compoundProtein') {
					this.nodeMouseOutHandler(this, event);
				}
			}, this));
			
			this.cy.on('tap', 'node', $.proxy(function (event) {
				var nodeID = event.cyTarget.data('id');
				if (nodeID !== 'compoundDNA' && nodeID !== 'compoundProtein') {
					this.nodeMouseTapHandler(this, event);
				}
			}, this));
			
			// Node reposition handler
			this.cy.on('position', 'node', $.proxy(function (event) {
				// Get node
				var node = event.cyTarget;
				
				// Update annotation position
				var annotation = node._private.data.annotation;
				if (annotation) {
					annotation.update();
				}
			}, this));
			
			// Handle edge events
			this.edgeEventHandler();
			
			this.cy.on('layoutstop', $.proxy(function () {
				
				// Finish loading data
				this.loadFinish();
			}, this));
		}, this);
	};
	
	/**
		* Creates Node Dialogs using the Eplant Genetic Element Dialogs
		* @param {Eplant.GeneticElement} geneticElement The gene which the dialog is created for
		* @param {Object} node The cytoscape node object which the dialog is created for
		* @param {Object} data Additional loading data for this node dialog
		* @returns {void}
	*/
	Eplant.Views.InteractionView.prototype.createNodeDialog = function (geneticElement, node,
	data) {
		// Get node position
		var nodePosition = node.renderedPosition();
		
		var positionDialog = {
			x: nodePosition.x + 200,
			y: nodePosition.y - 120 - node.renderedHeight()
		};
		
		// Use specified position if avaiable
		if (data && data.position) {
			positionDialog = {
				x: data.position.x,
				y: data.position.y
			};
		}
		
		var orientation = null;
		
		// Set orientation if dialog is created by a click/tap event
		if (data && data.orientation) {
			orientation = data.orientation;
		}
		
		// Create GeneticElementDialog
		var geneticElementDialog = new Eplant.GeneticElementDialog(
		geneticElement,
		positionDialog.x,
		positionDialog.y,
		orientation
		);
		
		geneticElementDialog.isActive = true;
		// Get the rendered height of the node dialog with all its contents
		var nodeDialogHeight = $(geneticElementDialog.domContainer).height();
		// Get the DOM element containing the node dialog
		var nodeDialogDOM = $(geneticElementDialog.dialog.DOM.wrap[0]);
		// Set height by distance from dialog bottom to node top
		nodeDialogDOM.css('top', nodePosition.y - nodeDialogHeight);

		// Move dialog down if height exceeds bounds
		if (positionDialog.y - nodeDialogHeight <= 0) {
			nodeDialogDOM.css('top', "20%");
		}
		return geneticElementDialog;
	};
	
	/**
		* Handles all node mouseover events. Creates a node dialog based on GeneticElement information,
		* and initializes the GeneticElement if not pre-existing. Closes any previously existing dialog
		*
		* @param {Eplant.Views.InteractionView} scope The execution context for this mouse over event
		* @param {Object} event The event object
		* @returns {void}
	*/
	Eplant.Views.InteractionView.prototype.nodeMouseOverHandler = function (scope, event) {
		// Change cursor
		ZUI.container.style.cursor = 'pointer';
		// Get node
		var node = event.cyTarget;
		// Track mouseover status
		node._private.data.mousedOver = true;
		// Highlight node
		node.addClass('highlight');
		// Add timer to detect true user intention to view dialog
		this.nodeDialogStartTimer = setTimeout(function () {
			// Close any pre-existing nodeDialogs
			if (scope.nodeDialog) {
				scope.nodeDialog.close();
				scope.nodeDialog.isActive = false;
				scope.nodeDialog = null;
			}
			// Open GeneticElementDialog
			var geneticElement = node._private.data.geneticElement;
			// Check if GeneticElement exists
			if (geneticElement) {
				var nodeDialog = geneticElement.geneticElementDialog;
				// Check that there are no currently active genetic element dialogs
				if (!nodeDialog && !scope.nodeDialog) {
					nodeDialog = scope.createNodeDialog(geneticElement, node);
					scope.nodeDialog = nodeDialog;
				}
				// Call back node if not a trans node
				} else if (node._private.data.id.substring(9) !== 'TRANS') {
				var options = {};
				options.callback = $.proxy(function (cbGeneticElement) {
					// Attach GeneticElement to node
					node._private.data.geneticElement = cbGeneticElement;
					var cdNodeDialog = cbGeneticElement.geneticElementDialog;
					// Make sure GeneticElementDialog is not already open and is still moused over
					if (!cdNodeDialog && !scope.nodeDialog && node._private.data.mousedOver) {
						cdNodeDialog = scope.createNodeDialog(cbGeneticElement, node);
						scope.nodeDialog = cbGeneticElement.geneticElementDialog;
					}
				}, scope);
				// GeneticElement doesn't exist, create it
				scope.geneticElement.species.loadGeneticElementByIdentifier(
				node.data('id').substring(0, 9), options);
			}
		}, 250);
	};
	
	/**
		* Handles mouse out events on nodes. Closes node dialogs after a delay, and sets makes them
		* invisible to the code.
		*
		* @param {Eplant.Views.InteractionView} scope The execution context (InteractionView object)
		* @param {Object} event The event object which triggered this function
		* @return {void}
	*/
	Eplant.Views.InteractionView.prototype.nodeMouseOutHandler = function (scope, event) {
		// Restore cursor
		ZUI.container.style.cursor = 'default';
		// Get node
		var node = event.cyTarget;
		// Remove node highlight
		node.removeClass('highlight');
		
		// Track mouseover status
		node._private.data.mousedOver = false;
		
		// Clear startup timer
		clearTimeout(this.nodeDialogStartTimer);
		
		// Get genetic element
		var geneticElement = node._private.data.geneticElement;
		
		// Check if genetic element exists and is not pinned
		if (geneticElement && geneticElement.geneticElementDialog
		&& !geneticElement.geneticElementDialog.pinned) {
			// Get dialog
			var dialog = geneticElement.geneticElementDialog;
			// Start close timer
			var timer = setTimeout(function () {
				// Check that the node dialog is still active
				if (dialog.isActive) {
					dialog.close();
					dialog.isActive = false;
					// Set active node dialog to null
					scope.nodeDialog = null;
				}
			}, 500);
			// Get top level container
			var topContainer = $(dialog.domContainer).parents().eq(10);
			// Stop close timer if mouse in dialog
			topContainer.mouseenter($.proxy(function () {
				clearTimeout(timer);
				clearTimeout(this.edgeStationaryTimer);
				if (this.tooltip) {
					this.tooltip.close();
					this.tooltip = null;
				}
			}, this));
			// Reset close timer if mouse leaves dialog
			topContainer.mouseleave(function () {
				timer = setTimeout(function () {
					// Check that the node dialog is still active
					if (dialog.isActive) {
						dialog.close();
						dialog.isActive = false;
						// Reset active node dialog
						scope.nodeDialog = null;
					}
				}, 250);
			});
		}
	};
	
	/**
		* Handles mouse tap events on nodes. Creates a node dialog which does not disappear unless the
		* user specifically closes it.
		*
		* @param {Eplant.Views.InteractionView} scope The execution context
		* @param {Object} event The event which triggered this handler
		* @return {void}
	*/
	Eplant.Views.InteractionView.prototype.nodeMouseTapHandler = function (scope, event) {
		// Get node
		var node = event.cyTarget;
		
		// Get GeneticElement
		var geneticElement = node._private.data.geneticElement;
		
		if (geneticElement) {
			// Make sure GeneticElementDialog is not already open
			if (!geneticElement.geneticElementDialog) {
				var data = {};
				// Get node position
				var position = node.position();
				
				// Get orientation
				data.orientation = position.x > ZUI.width / 2 ? 'left' : 'right';
				
				// Create dialog
				geneticElement.geneticElementDialog = scope.createNodeDialog(geneticElement,
				node, data);
			}
			} else {
			var options = {};
			// Callback for loading node
			options.callback = $.proxy(function(geneticElement) {
				// Get node
				var node = scope.cy.nodes('[id *= "' + geneticElement.identifier + '"]')[0];
				
				// Attach GeneticElement to node
				node._private.data.geneticElement = geneticElement;
				
				// Make sure node is still highlighted and GeneticElementDialog is not already open
				if (node.hasClass('highlight') && !geneticElement.geneticElementDialog) {
					var data = {};
					// Get node position
					var position = node.position();
					
					// Get orientation
					data.orientation = position.x > ZUI.width / 2 ? 'left' : 'right';
					
					// Create dialog
					geneticElement.geneticElementDialog = scope.createNodeDialog(geneticElement,
					node, data);
				}
			}, scope);
			
			// Load the genetic element, and create a dialog afterwards
			scope.geneticElement.species.loadGeneticElementByIdentifier(
			node.data("id").substring(0, 9), options);
		}
		
		// Check whether GeneticElement is created
		if (geneticElement) {
			// Check whether GeneticElementDialog is created
			if (geneticElement.geneticElementDialog) {
				// Pin
				geneticElement.geneticElementDialog.pinned = true;
				// Disable node dialog closing
				geneticElement.geneticElementDialog.isActive = false;
				this.nodeDialogs.push(geneticElement.geneticElementDialog);
				} else {
				// Set GeneticElementDialog information
				this.geneticElementDialogInfo = {
					finish: ZUI.appStatus.progress,
					node: node,
					pin: true
				};
			}
			} else {
			var options = {};
			// Call back on data loading
			options.callback = $.proxy(function (geneticElement) {
				// Get node
				var node = scope.cy.nodes('[id *= "' + geneticElement.identifier + '"]')[0];
				
				// Attach GeneticElement to node
				node._private.data.geneticElement = geneticElement;
				
				// Check whether GeneticElementDialog is created
				if (geneticElement.geneticElementDialog) {
					// Pin
					geneticElement.geneticElementDialog.pinned = true;
					geneticElement.geneticElementDialog.isActive = false;
					scope.nodeDialogs.push(geneticElement.geneticElementDialog);
					} else {
					// Set GeneticElementDialog information
					scope.geneticElementDialogInfo = {
						finish: ZUI.appStatus.progress,
						node: node,
						pin: true
					};
				}
			}, scope);
			// Load data
			scope.geneticElement.species.loadGeneticElementByIdentifier(
			node.data('id').substring(0, 9), options);
		}
		this.nodeDialog = null;
	};
	
	/**
		* Handles all events bound to interaction edges
		*
		* @return {undefined}
	*/
	Eplant.Views.InteractionView.prototype.edgeEventHandler = function () {
		// Timer for exit event
		var exitTimer;
		// Timer which tracks intention for tooltip creation
		this.edgeStationaryTimer;
		// Sets scope for async timeout functions
		var _this = this;
		// Tracks mouse position in between mouseover and tooltip creation events
		var currCoords = null;
		// Tracks the edge with an active tooltip by index
		var currIndex = null;
		
		// Listen for pointer events on edges
		this.cy.on('mouseover', 'edge', $.proxy(function (event) {
			// Start a timer to determine if user intends to hover on edge
			_this.edgeStationaryTimer = setTimeout(function () {
				// Change cursor
				ZUI.container.style.cursor = 'pointer';
				// Get edge
				var edge = event.cyTarget;
				
				// Exclude trans edges
				var isTransTarget = edge._private.data.target.substring(9, 14) === 'TRANS';
				var isDNASource = edge._private.data.source.substring(9, 12) === 'DNA';
				if (!(isTransTarget && isDNASource)) {
					// Get interaction data
					var interaction = edge._private.data;
					
					// Remove previous tooltip and stop timer
					if (_this.tooltip) {
						clearTimeout(exitTimer);
						_this.tooltip.close();
						_this.tooltip = null;
					}
					
					// Check if a reference exists
					var confidence = interaction.published ? 'Experimentally determined' :
					interaction.confidence;
					
					// Instantiate mouse position
					var mouseX = null;
					var mouseY = null;
					
					// Set mouse position
					if (currCoords) {
						mouseX = currCoords.x;
						mouseY = currCoords.y;
						} else {
						mouseX = event.originalEvent.clientX;
						mouseY = event.originalEvent.clientY;
					}
					
					// Create tooltip
					var tooltip = new Eplant.Views.InteractionView.EdgeInfoTooltip({
						// Tooltip content
						content: 'Co-expression coefficient:' + interaction.correlation +
						'<br>Confidence Value:' + confidence + '<br>',
						// Set position
						x: mouseX,
						y: mouseY
					}, interaction);
					// Save tooltip
					_this.tooltip = tooltip;
					// Reset temporary coordinates
					currCoords = null;
					// Track which interaction edge the tooltip is attached to
					currIndex = event.cyTarget._private.index;
				}
			}, 350);
		}, this));
		
		// Listen for edge mouse out events
		this.cy.on('mouseout', 'edge', $.proxy(function () {
			// Clear intention timer if user exits edge
			clearTimeout(_this.edgeStationaryTimer);
			// Verify tooltip exists
			if (this.tooltip) {
				// Start closedown timer
				exitTimer = setTimeout(function () {
					// Check if tooltip still exists
					if (_this.tooltip) {
						_this.tooltip.close();
						_this.tooltip = null;
						// Reset edge index tracker
						currIndex = null;
					}
				}, 250);
				
				// Stop close timer if mouse in tooltip
				$(_this.tooltip.domContainer).parent().mouseenter(function () {
					clearTimeout(exitTimer);
				});
				
				// Close tooltip if mouse leaves tooltip
				$(_this.tooltip.domContainer).parent().mouseleave(function () {
					_this.tooltip.close();
					_this.tooltip = null;
					// Reset edge index tracker
					currIndex = null;
				});
			}
		}, this));
		
		// Listen for mouse move to reposition tooltip
		this.cy.on('mousemove', 'edge', $.proxy(function (event) {
			// Verifies that the tooltip exists, and the event is executing on the correct edge
			if (this.tooltip && event.cyTarget._private.index === currIndex) {
				this.tooltip.changeTooltipPosition(event.originalEvent);
				} else {
				// Track mouse position for usage in updating tooltip position when it initializes
				currCoords = event.originalEvent;
			}
		}, this));
	};
	
	/**
		* Checks JSON data to determine if any protein DNA interactions (Index > 1) exist.
		* @param  {JSONObject} JSONquery The response from the JSON query
		* @param  {String} id The identifier of the genetic element which was queried
		* @return {Boolean} Returns true if any PDI elements exists. Else, returns false.
		*
		* @example AT1G54330 - Returns true
		* @example AT1G01010 - Returns false
	*/
	Eplant.Views.InteractionView.prototype.checkExistsPDI = function (JSONquery, id) {
		// Gets the interaction data from the JSON query
		var interactionData = JSONquery[id];
		
		for (var n = 0; n < interactionData.length; n = n + 1) {
			// Checks for PDI interactions, which have an index > 1
			if (interactionData[n].index > 1) {
				return true;
			}
		}
		return false;
	};
	
	/**
		* Helper function to check if a node already exists in the collection of all elements
		* @param  {Collection} nodes The collection of all processed cytoscape nodes
		* @param  {String} searchID The ID of the element to be compared against the overall collection
		* @return {Boolean} Returns true if a node with the same id already exists
	*/
	Eplant.Views.InteractionView.prototype.checkNodeExists = function (nodes, searchID) {
		// Checks if current interaction source exists as a node
		for (var m = 0; m < nodes.length; m = m + 1) {
			// Compares interaction with existing node elements
			if (nodes[m].data.id.toUpperCase() === searchID) {
				return true;
			}
		}
		return false;
	};
	
	/**
		* Helper function to get a node already existing in the collection of all elements
		* @param  {Collection} nodes The collection of all processed cytoscape nodes
		* @param  {String} searchID The ID of the element to be retrieved from the overall collection
		* @return {Object} Returns the targeted node
	*/
	Eplant.Views.InteractionView.prototype.getNode = function (nodes, searchID) {
		// Checks if current interaction source exists as a node
		for (var m = 0; m < nodes.length; m = m + 1) {
			// Compares interaction with existing node elements
			if (nodes[m].data.id.toUpperCase() === searchID) {
				return nodes[m];
			}
		}
		// Throw error if match is not found
		throw Error('Node could not be found');
	};
	
	/**
		* Creates self query node interactions.
		* @param  {Object} scope The interactionView scope
		* @param  {Collection} nodes The collection of all CyConf nodes
		* @param  {Collection} edges The collection of all CyConf edges
		* @param  {Object} interactionData The data related to this interaction
		* @return {Boolean} Whether an interaction was created
	*/
	Eplant.Views.InteractionView.prototype.createSelfQPI = function (scope, nodes, edges,
	interactionData) {
		// Verify that the inputted index is correct
		var index = interactionData.index;
		
		// Store interaction data
		var sourceID = interactionData.source.toUpperCase();
		var targetID = interactionData.target.toUpperCase();
		// Checks if the source node is the query node
		var isQuerySource = sourceID === scope.geneticElement.identifier.toUpperCase();
		// Checks if the target node is the query node
		var isQueryTarget = targetID === scope.geneticElement.identifier.toUpperCase();
		if (index < 2 && isQuerySource && isQueryTarget) {
			interactionData.source = sourceID + 'QUERY';
			interactionData.target = targetID + 'QUERY';
			
			var edge = scope.createEdge(interactionData);
			edges.push(edge);
			return true;
		}
		return false;
	};
	
	/**
		* Creates source and target nodes, and edges for query-protein interactions exclusively. The
		* interaction must be below 2. Nodes must also be connected to the query node.
		*
		* @param  {Object} scope The scope reference to the interactionView object.
		* @param  {Collection} nodes The collection of all CyConf nodes
		* @param  {Collection} edges The collection of all CyConf edges
		* @param  {Object} interactionData The object which contains all data for this interaction
		* @param  {String} parentNodeID The string ID of the parent compound protein node
		* @return {Boolean} Whether a QPI was created
	*/
	Eplant.Views.InteractionView.prototype.createQPI = function (scope, nodes, edges,
	interactionData, parentNodeID) {
		// Verify that the inputted index is correct
		var index = interactionData.index;
		
		// Store interaction data
		var sourceID = interactionData.source.toUpperCase();
		var targetID = interactionData.target.toUpperCase();
		
		// Checks if the source node is the query node
		var isQuerySource = sourceID === scope.geneticElement.identifier.toUpperCase();
		// Checks if the target node is the query node
		var isQueryTarget = targetID === scope.geneticElement.identifier.toUpperCase();
		
		// Create interaction if above conditions are met. Interaction must be PPI, and source and
		// target must be different, as self interctions should not be handled.
		if (index < 2 && sourceID !== targetID && (isQuerySource || isQueryTarget)) {
			// Add appropriate identifier tag to source
			if (isQuerySource) {
				interactionData.source = sourceID + 'QUERY';
				} else {
				interactionData.source = sourceID + 'PROTEIN';
			}
			// Add appropriate identifier tag to target
			if (isQueryTarget) {
				interactionData.target = targetID + 'QUERY';
				} else {
				interactionData.target = targetID + 'PROTEIN';
			}
			
			var existsSource = scope.checkNodeExists(nodes, interactionData.source);
			var existsTarget = scope.checkNodeExists(nodes, interactionData.target);
			
			// Check that the source node is not pre-existing
			if (!existsSource) {
				// Create source node
				var sourceNode = scope.createNode(interactionData.source, 'Protein');
				// Assign parent compound node if required
				if (parentNodeID) {
					sourceNode.data.parent = parentNodeID;
				}
				// Push new node to CyConf
				nodes.push(sourceNode);
			}
			
			// Check that the target node is not pre-existing
			if (!existsTarget) {
				// Create target node
				var targetNode = scope.createNode(interactionData.target, 'Protein');
				// Assign parent compound node if required
				if (parentNodeID) {
					targetNode.data.parent = parentNodeID;
				}
				// Push new node to CyConf
				nodes.push(targetNode);
			}
			
			// Create an interaction if not pre-existing
			if (!existsTarget || !existsSource) {
				// Create new edge and push to CyConf
				var edge = scope.createEdge(interactionData);
				edges.push(edge);
				
				// Return true if an interaction has been created
				return true;
			}
			return false;
		}
		return false;
	};
	
	/**
		* Creates protein-protein interactions which do not include the query node. Must be executed
		* after the creation of QPIs, e.g, after the createQPI method has run. This ensures that all
		* PPIs will have an origin from a query node rooted protein. This method will include the
		* creation of self PPIs.
		*
		* @param  {Object} scope The scope reference to the interactionView object.
		* @param  {Collection} nodes The collection of all CyConf nodes
		* @param  {Collection} edges The collection of all CyConf edges
		* @param  {Object} interactionData The interaction data associated with the current interaction
		* @param  {String} parentNodeID The string ID of the parent compound protein node
		* @return {Boolean} Whether an interaction was created
	*/
	Eplant.Views.InteractionView.prototype.createPPI = function (scope, nodes, edges,
	interactionData, parentNodeID) {
		// Verify that the inputted index is correct
		var index = interactionData.index;
		
		// Store interaction data
		var sourceID = interactionData.source.toUpperCase();
		var targetID = interactionData.target.toUpperCase();
		
		// Checks that both the source and target nodes are pre-existing
		var existsProteinSource = scope.checkNodeExists(nodes, sourceID + 'PROTEIN');
		var existsProteinTarget = scope.checkNodeExists(nodes, targetID + 'PROTEIN');
		
		// Check that source and target nodes are not the query node
		var existsQuerySource = scope.checkNodeExists(nodes, sourceID + 'QUERY');
		var existsQueryTarget = scope.checkNodeExists(nodes, targetID + 'QUERY');
		var existsQuery = existsQuerySource || existsQueryTarget;
		
		if (index < 2 && (existsProteinSource || existsProteinTarget) && !existsQuery) {
			// Add protein tag to interaction data source and target
			interactionData.source = sourceID + 'PROTEIN';
			interactionData.target = targetID + 'PROTEIN';
			
			// Check that the source node is not pre-existing
			if (!existsProteinSource) {
				// Create source node
				var sourceNode = scope.createNode(interactionData.source, 'Protein');
				// Assign parent compound node if required
				if (parentNodeID) {
					sourceNode.data.parent = parentNodeID;
				}
				// Push new node to CyConf
				nodes.push(sourceNode);
			}
			
			// Check that the target node is not pre-existing
			if (!existsProteinTarget) {
				// Create target node
				var targetNode = scope.createNode(interactionData.target, 'Protein');
				// Assign parent compound node if required
				if (parentNodeID) {
					targetNode.data.parent = parentNodeID;
				}
				// Push new node to CyConf
				nodes.push(targetNode);
			}
			// Create new edge and push to CyConf
			var edge = scope.createEdge(interactionData);
			edges.push(edge);
			
			// Return true if an interaction has been created
			return true;
		}
		return false;
	};
	
	/**
		* Creates source and target nodes, and edges for protein-DNA interactions. The elements are
		* only created if an existing protein source exists. Therefore, this method MUST be run after
		* all protein nodes have been created (after the createPPI script is finished).
		*
		* @param  {Object} scope The scope reference to the interactionView object.
		* @param  {Collection} nodes The collection of all CyConf nodes
		* @param  {Collection} edges The collection of all CyConf edges
		* @param  {Object} interactionData The object which contains all data for this interaction
		* @param  {String} parentNodeID The string ID of the parent compound protein node
		* @return {Boolean} Whether an interaction was created
	*/
	Eplant.Views.InteractionView.prototype.createPDI = function (scope, nodes, edges,
	interactionData, parentNodeID) {
		// Store data from interation data
		var index = interactionData.index;
		
		var querySourceID = interactionData.source.toUpperCase() + 'QUERY';
		var proteinSourceID = interactionData.source.toUpperCase() + 'PROTEIN';
		
		var querySourceExists = scope.checkNodeExists(nodes, querySourceID);
		var proteinSourceExists = scope.checkNodeExists(nodes, proteinSourceID);
		
		// Verify that the index is correct, and a source query or protein node exists
		if (index >= 2 && (querySourceExists || proteinSourceExists)) {
			// Add identifier tag to interaction data source and target
			if (querySourceExists) {
				interactionData.source = querySourceID;
				} else {
				interactionData.source = proteinSourceID;
			}
			// Add tag to interaction target
			interactionData.target = interactionData.target.toUpperCase() + 'DNA';
			
			if (!scope.checkNodeExists(nodes, interactionData.target)) {
				// Create target node
				var targetNode = scope.createNode(interactionData.target, 'DNA');
				// Assign parent compound node
				targetNode.data.parent = parentNodeID;
				// Push new node to CyConf
				nodes.push(targetNode);
			}
			// Create new edge and push to CyConf
			var edge = scope.createEdge(interactionData);
			edges.push(edge);
			
			// Return true if an interaction has been created
			return true;
		}
		return false;
	};
	
	/**
		* Creates source and target nodes, and edges for DNA-protein-DNA interactions. The elements are
		* only created if an existing DNA source exists. Therefore, this method MUST be run after all
		* protein nodes AND DNA nodes have been created (after the createPPI and createPDI script is
		* finished).
		*
		* @param  {Object} scope The scope reference to the interactionView object.
		* @param  {Collection} nodes The collection of all CyConf nodes
		* @param  {Collection} edges The collection of all CyConf edges
		* @param  {Object} interactionData The object which contains all data for this interaction
		* @return {Boolean} Whether an interaction was created
	*/
	Eplant.Views.InteractionView.prototype.createDPDI = function (scope, nodes, edges,
	interactionData) {
		// Store data from interation data
		var index = interactionData.index;
		
		var sourceID = interactionData.source.toUpperCase();
		
		var existsDNATarget = scope.checkNodeExists(nodes, sourceID + 'DNA');
		var existsProtein = scope.checkNodeExists(nodes, sourceID + 'PROTEIN');
		
		// Verify that the index is correct, DNA source exists, and a protein source does not exist
		if (index >= 2 && existsDNATarget && !existsProtein) {
			// Get the translational node if existent, else create a new one.
			var transNode;
			if (!scope.checkNodeExists(nodes, sourceID + 'TRANS')) {
				// Create translational node
				transNode = scope.createTransNode(nodes, edges, sourceID);
				} else {
				transNode = scope.getNode(nodes, sourceID + 'TRANS');
			}
			
			// Add non-terminal tag to DNA node
			var nodeDNA = scope.getNode(nodes, sourceID + 'DNA');
			nodeDNA.data.nonTerm = true;
			
			// Set DNA interaction source to translational node
			interactionData.source = transNode.data.id;
			interactionData.target = interactionData.target.toUpperCase() + 'DNA';
			// Create new edge and push to CyConf
			var edge = scope.createEdge(interactionData);
			edges.push(edge);
			
			// Return true if an interaction has been created
			return true;
		}
		return false;
	};
	
	/**
		* Creates self PPI interactions which are attached to translational nodes. Must be executed
		* after the creation of all DNA nodes, e.g, after the createDPDI method has run. This ensures
		* that all DPPIs will only attached to a translational node if a protein node is not avaliable.
		*
		* @param {Object} scope The scope reference to the interactionView object.
		* @param {Collection} nodes The collection of CyConf nodes
		* @param {Collection} edges The collection of CyConf edges
		* @param {Object} interactionData The interaction data associated with the current interaction
		* @return {Boolean} Whether an interaction was created
	*/
	Eplant.Views.InteractionView.prototype.createSelfDPPI = function (scope, nodes, edges,
	interactionData) {
		// Verify that the inputted index is correct
		var index = interactionData.index;
		
		// Store interaction data
		var sourceID = interactionData.source.toUpperCase();
		var targetID = interactionData.target.toUpperCase();
		
		// Check that target and source nodes exist
		var sourceExists = scope.checkNodeExists(nodes, sourceID + 'DNA');
		var proteinExists = scope.checkNodeExists(nodes, sourceID + 'PROTEIN');
		
		if (index < 2 && sourceID === targetID && sourceExists && !proteinExists) {
			// Create translational node
			var transNode = scope.createTransNode(nodes, edges, sourceID);
			
			// Add non-terminal tag to DNA node
			var nodeDNA = scope.getNode(nodes, sourceID + 'DNA');
			nodeDNA.data.nonTerm = true;
			
			// Add protein tag to interaction data source and target
			interactionData.source = transNode.data.id;
			interactionData.target = transNode.data.id;
			var edge = scope.createEdge(interactionData);
			edges.push(edge);
			
			// Return true if an interaction has been created
			return true;
		}
		return false;
	};
	
	/**
		* Creates PPI interactions which are attached to translational nodes. Must be executed after
		* the creation of all DNA nodes, e.g, after the createDPDI method has run. This ensures that
		* all DPPIs will only attached to a translational node if a protein node is not avaliable.
		*
		* @param {Object} scope The scope reference to the interactionView object.
		* @param {Collection} nodes The collection of CyConf nodes
		* @param {Collection} edges The collection of CyConf edges
		* @param {Object} interactionData The interaction data associated with the current interaction
		* @return {Boolean} Whether an interaction was created
	*/
	Eplant.Views.InteractionView.prototype.createDPPI = function (scope, nodes, edges,
	interactionData) {
		// Verify that the inputted index is correct
		var index = interactionData.index;
		
		// Store interaction data
		var sourceID = interactionData.source.toUpperCase();
		var targetID = interactionData.target.toUpperCase();
		
		// Check that target and source nodes exist
		var sourceTransExists = scope.checkNodeExists(nodes, sourceID + 'TRANS');
		var targetTransExists = scope.checkNodeExists(nodes, targetID + 'TRANS');
		
		if (index < 2 && sourceID !== targetID && sourceTransExists && targetTransExists) {
			// Add protein tag to interaction data source and target
			interactionData.source = sourceID + 'TRANS';
			interactionData.target = targetID + 'TRANS';
			// Create interaction edge from trans node to trans node
			var edge = scope.createEdge(interactionData);
			edges.push(edge);
			
			// Return true if an interaction has been created
			return true;
		}
		return false;
	};
	
	/**
		* Creates a query node if it has not been previously created
		* @param  {Collection} nodes The collection of all cytoscape nodes
		* @param  {String} query The id of the queried genetic element
		* @return {void}
	*/
	Eplant.Views.InteractionView.prototype.createQueryNode = function (nodes, query) {
		// Check whether query node has been created
		var isCreatedQuery = false;
		
		for (var n = 0; n < nodes.length; n = n + 1) {
			if (nodes[n].data.id.toUpperCase() === query.toUpperCase()) {
				isCreatedQuery = true;
			}
		}
		// If not, create it
		if (!isCreatedQuery) {
			var node = this.createNode(query);
			node.data.id = query + 'QUERY';
			this.cyConf.queryNode = node;
			nodes.push(node);
		}
	};
	
	/**
		* Creates a translational protein interaction node to be paired with a DNA node.
		* @param  {Collection} nodes The collection of all CyConf nodes
		* @param  {Collection} edges The collection of all CyConf edges
		* @param  {String} id The id of the DNA node for which to add a protein translational node
		* @return {Object} The translational node object
	*/
	Eplant.Views.InteractionView.prototype.createTransNode = function (nodes, edges, id) {
		var transNode = this.createNode(id + 'TRANS', 'Protein');
		transNode.classes = transNode.classes + ' trans';
		nodes.push(transNode);
		
		var sourceID = id.toUpperCase() + 'DNA';
		
		var edge = {
			group: 'edges',
			data: {
				source: sourceID,
				target: transNode.data.id,
				published: true,
				targetArrowShape: 'none',
				'target-arrow-color': '#669900',
				interactionType: 'PDI',
				reference: ''
			},
			classes: 'trans'
		};
		
		edge.data.lineStyle = 'solid';
		edge.data.size = 6;
		edge.data.lineColor = '#000';
		
		edges.push(edge);
		
		return transNode;
	};
	
	/**
		* Creates a compound node with a specified ID
		* @param {String} id The id of the new node
		* @return {Object} A node data object
	*/
	Eplant.Views.InteractionView.prototype.createCompoundNode = function (id) {
		var node = {
			group: 'nodes',
			data: {
				id: id,
				shape: 'square',
				borderColor: '#FFFFFF'
			}
		};
		// Assigns visual styles to nodes
		node.data.size = 30;
		node.data.borderWidth = 5;
		node.data.textOutlineWidth = 0;
		node.data.mass = 9;
		return node;
	};
	
	/**
		* Creates interactions, and removes created interactions from the total list of interactions.
		*
		* @param  {Collection} nodes The nodes which are associated with the interactionView
		* @param  {Collection} edges The edges which are associated with the interactionView
		* @param  {Object} interactionsData The total array of all interaction datas
		* @param  {Function} creationFunction The function which interactions should be created by
		* @param  {Array} parentNodes The array contianing all types of parent nodes (PPI and PDI)
		* @return {Boolean} Returns whether any interactions have been created
	*/
	Eplant.Views.InteractionView.prototype.createInteractions = function (nodes, edges,
	interactionsData, creationFunction, parentNodes) {
		// Preserve scope
		var _this = this;
		// Track if any interactions have been added
		var createdInteractions = false;
		// Store index of interactions which have been added for use in future removal
		var addedIndexes = [];
		for (var n = 0; n < interactionsData.length; n = n + 1) {
			// Get interactions data
			var interactionData = interactionsData[n];
			
			// Create PDI nodes, adding to parent compound
			var created = creationFunction(_this, nodes, edges, interactionData, parentNodes);
			if (created) {
				createdInteractions = true;
				addedIndexes.push(n);
			}
		}
		
		// Sort indexes in decreasing order, allowing for deletion at the indexes without
		// interrupting other elements.
		addedIndexes.sort(function (a, b) {
			return b - a;
		});
		
		// Remove the interactions which have been created
		for (var i = 0; i < addedIndexes.length; i = i + 1) {
			interactionsData.splice(addedIndexes[i], 1);
		}
		
		return createdInteractions;
	};
	
	/**
		* Handles the loading of individual interactions, including its source/target nodes and edge.
		* Allows separate handling of PDI and PPI interactions.
		* @param  {Collection} nodes The collection of cytoscape nodes
		* @param  {Collection} edges The collection of cytoscape edges
		* @param  {Array} interactionsData The interaction data queried by JSOn
		* @param  {Boolean} addCompound Whether nodes should be added to a parent compound node
		* @return {void}
	*/
	Eplant.Views.InteractionView.prototype.loadInteractionElements = function (nodes, edges,
	interactionsData, addCompound) {
		if (!addCompound) {
			// Interaction creation with no PDIs
			Eplant.queue.add(function () {
				// Store creation functions are variables
				var createSelfQPI = this.view.createSelfQPI;
				var createQPI = this.view.createQPI;
				var createPPI = this.view.createPPI;
				
				// Execute interaction creation
				this.view.createInteractions(nodes, edges, interactionsData, createSelfQPI);
				// Add query-protein interactions
				this.view.createInteractions(nodes, edges, interactionsData, createQPI);
				// Add non-query PPIs and self PPIs
				this.view.createInteractions(nodes, edges, interactionsData, createPPI);
			}, {view: this, interactionsData: interactionsData, nodes: nodes, edges: edges},null,this.geneticElement.identifier+"_Loading");
			} else {
			// Initialize parent compound nodes
			var parent = [this.createCompoundNode('compoundProtein'),
			this.createCompoundNode('compoundDNA')];
			// Track if any protein nodes have been added
			var existsProteinNode = false;
			
			// Add protein-protein interactions
			Eplant.queue.add(function () {
				// Store creation functions are variables
				var createSelfQPI = this.view.createSelfQPI;
				var createQPI = this.view.createQPI;
				var createPPI = this.view.createPPI;
				var createPDI = this.view.createPDI;
				var createDPDI = this.view.createDPDI;
				var createSelfDPPI = this.view.createSelfDPPI;
				var createDPPI = this.view.createDPPI;
				
				// Execute interaction creation
				this.view.createInteractions(nodes, edges, interactionsData, createSelfQPI);
				// Add query-protein interactions
				existsProteinNode = this.view.createInteractions(nodes, edges, interactionsData,
				createQPI, parent[0].data.id);
				// Add non-query PPIs and self PPIs
				this.view.createInteractions(nodes, edges, interactionsData, createPPI,
				parent[0].data.id);
				// Add protein-DNA interaction
				this.view.createInteractions(nodes, edges, interactionsData, createPDI,
				parent[1].data.id);
				// Add DNA-Protein-DNA interactions
				this.view.createInteractions(nodes, edges, interactionsData, createDPDI);
				// Add self translational node interactions
				this.view.createInteractions(nodes, edges, interactionsData, createSelfDPPI);
				// Add translational-translational interactions
				this.view.createInteractions(nodes, edges, interactionsData, createDPPI);
				
				// Pushes parent compound nodes into CyConf if required
				if (addCompound) {
					// Check if any ppi nodes are contained
					if (existsProteinNode) {
						nodes.push(parent[0]);
					}
					nodes.push(parent[1]);
				}
			}, {view: this, interactionsData: interactionsData, nodes: nodes, edges: edges},null,this.geneticElement.identifier+"_Loading");
		}
	};
	
	/**
		* Loads interaction data.
		*
		* @param {Function} cb1 The first function to callback on completion of loading
		* @param {Function} cb2 The second function to callback on completion of loading
		* @param {InteractionView} cbObj The InteractionView to be passed to callbacks
		* @return {void}
	*/
	Eplant.Views.InteractionView.prototype.loadInteractionData = function (cb1, cb2, cbObj) {
		// Gene to query for information
		var queryParam = [{
			agi: this.geneticElement.identifier
		}];
		
		// URL location of webservices
		var urlInteractions =
		'//bar.utoronto.ca/eplant/cgi-bin/get_interactions.php?request=';
		// Gets JSON file from web services
		$.getJSON(urlInteractions + JSON.stringify(queryParam), $.proxy(function (response) {
			// Get interaction data for all interactions from JSON
			var interactionsData = response[queryParam[0].agi];
			// Get recursive status
			var recursiveObject = interactionsData[interactionsData.length - 1];
			// Notify users if search is not recursive
			if (recursiveObject.recursive === 'false') {
				// Set recursive query status
				this.nonRecursiveQuery = true;
				if ($('#nonRecursiveLabel').length === 0){
					// Create non-recursive label
					var cytoContainer = $('#Cytoscape_container');
					// Create DOM elements
					var recContainer = document.createElement('div');
					recContainer.id = 'nonRecursiveLabel';
					var recLabel = document.createElement('div');
					recLabel.innerHTML = 'Recursive interactions not shown';
					// Set CSS for DOM elements
					$(recLabel).css({
						'color': '#444444',
						'font-size': '1.3em',
						'left': '20px',
						'line-height': '1.5em',
						'position': 'absolute',
						'top': '40px',
						'z-index': '1'
					});
					$(recContainer).hide();
					// Append DOM elements to containers
					$(recContainer).append(recLabel);
					$(cytoContainer).append(recContainer);
				}
			}
			// Remove recursive object
			interactionsData.splice(interactionsData.length - 1, 1);
			// Get element arrays
			var nodes = this.cyConf.elements.nodes;
			var edges = this.cyConf.elements.edges;
			
			// Get query ID
			var query = Object.keys(response)[0];
			// Create query node
			this.createQueryNode(nodes, query);
			
			// Checks for PDI, load into compound nodes if PDIs are found
			var containsPDI = this.checkExistsPDI(response, queryParam[0].agi);
			this.loadInteractionElements(nodes, edges, interactionsData, containsPDI);
			
			cb1.apply(cbObj);
			cb2.apply(cbObj);
		}, this));
	};
	
	/**
		* Loads the subcellular localization data of interactions
		* @returns {void}
	*/
	Eplant.Views.InteractionView.prototype.loadSublocalizationData = function () {
		Eplant.queue.add(function () {
			// Get nodes from cytoscape
			var nodes = this.cyConf.elements.nodes;
			// Generate a list of query identifiers
			var ids = [];
			for (var n = 0; n < nodes.length; n = n + 1) {
				var id = nodes[n].data.id.substring(0, 9);
				ids.push(id);
			}
			
			// URL for sublocalization webservices
			var urlSUBA = '//bar.utoronto.ca/eplant/cgi-bin/groupsuba3.cgi?ids=';
			// Get data from webservices
			$.getJSON(urlSUBA + JSON.stringify(ids), $.proxy(function (response) {
				// Go through localizations data
				for (var n = 0; n < response.length; n = n + 1) {
					// Get localization data
					var localizationData = response[n];
					// Assign localization colors to nodes
					this.setLocalizationData(nodes, localizationData);
				}
			}, this));
			
			// Initialize cytoscape
			Eplant.queue.add(function () {
				$(this.domContainer).cytoscape(this.cyConf);
			}, this,null,this.geneticElement.identifier+"_Loading");
		}, this,null,this.geneticElement.identifier+"_Loading");
	};
	
	/**
		* Assigns subcellular localization colors to nodes from queried subcellular localization data.
		* Runs synchronously by use of the ePlant queue.
		*
		* @param {Collection} nodes The nodes which are contained in CyConf
		* @param {Object} localizationData The subcellular localization data which has been queried
		* @return {void}
	*/
	Eplant.Views.InteractionView.prototype.setLocalizationData = function (nodes,
	localizationData) {
		Eplant.queue.add(function () {
			// Get matching nodes
			var matchedNodes = [];
			
			// Finds nodes with ids that match localization data
			for (var m = 0; m < nodes.length; m = m + 1) {
				// Compares node IDs
				var localizationID = localizationData.id.toUpperCase();
				if (localizationID === nodes[m].data.id.toUpperCase().substring(0, 9)) {
					matchedNodes.push(nodes[m]);
				}
			}
			
			// Assign color to each match
			for (var n = 0; n < matchedNodes.length; n = n + 1) {
				var color;
				// Get matched node
				var node = matchedNodes[n];
				
				// Get localization compartment with the highest score
				var compartment;
				var maxScore = 0;
				for (var _compartment in localizationData.data) {
					if (localizationData.data[_compartment] > maxScore) {
						compartment = _compartment;
						maxScore = localizationData.data[_compartment];
					}
				}
				
				// Check for interaction type
				if (node.data.interactionType === 'DNA') {
					// Get PDI color if PDI
					color = this.view.getColorByCompartment('DNA');
					} else {
					// Get color corresponding to compartment
					color = this.view.getColorByCompartment(compartment);
				}
				
				// Set node color if cytoscape is loaded, else assign to data
				if (this.view.cy) {
					// Select node with associated id
					var nodeID = 'node#' + node.data.id;
					// Set color to compartment
					this.view.cy.elements(nodeID).data('borderColor', color);
					} else {
					node.data.borderColor = color;
				}
			}
		}, {view: this, nodes: nodes, localizationData: localizationData},null,this.geneticElement.identifier+"_Loading");
	};
	
	/**
		* Sets the layout configuration used by Cytoscape. Uses the cose-bilkent layout for layouts
		* when handling more than one node. Calls node alignment prior to layout when DNA nodes are
		* existent.
		* @returns {void}
	*/
	Eplant.Views.InteractionView.prototype.setLayout = function () {
		Eplant.queue.add(function () {
			// Get nodes from cytoscape
			var nodes = this.cyConf.elements.nodes;
			// Set layout to cose-bilkent if there are multiple nodes
			if (nodes.length > 1) {
				// Check if any DNA nodes exist
				var containsPDI = false;
				for (var n = 0; n < nodes.length; n = n + 1) {
					if (nodes[n].data.interactionType === 'DNA') {
						containsPDI = true;
					}
				}
				// Initate DNA node alignment if DNA nodes exist
				if (containsPDI) {
					this.cyConf.layout.name = 'grid';
					this.cyConf.layout.stop = $.proxy(function () {
						if (!this.nodeAlign) {
							// Align PDI nodes, and synchronously reposition PPI nodes after
							this.nodeAlign = new Eplant.Views.InteractionView.NodeAlign(this);
							this.cyConf.layout.stop = null;
						}
					}, this);
					} else if (this.cyConf.elements.nodes.length < 100) {
					// Calls cose-bilkent on protein nodes
					this.cyConf.layout.name = 'cose';
					this.cyConf.layout.fit = true;
					this.cyConf.layout.numIter = 2000;
					// Must be false, or an unresolved error involving compound nodes will occur
					this.cyConf.layout.tile = false;
					this.cyConf.animate = false;
					this.cyConf.layout.nodeRepulsion = 800000;
					} else {
					this.cyConf.layout.name = 'grid';
					this.cyConf.layout.stop = $.proxy(function() {
						if (this.cy) {
							// Attempts to fit layout to screen proportions
							var width = this.cy.width();
							var height = this.cy.height();
							// Center query
							this.queryNode.position({
								x: width / 2,
								y: height / 2
							});
							this.queryNode.lock();
							// Restart layout after finishing cytoscape initialization to bypass
							// some weird zooming issues that cause terrible results
							this.cy.layout({
								name: 'arbor',
								fit: true,
								boundingBox: {x1: 0, y1: 0, x2: width * 1.05, y2: height * 1.1},
								stop: $.proxy(function() {
									this.queryNode.unlock();
								}, this)
							});
						}
						this.cyConf.layout.stop = null;
					}, this);
				}
				} else {
				this.cyConf.layout.name = 'grid';
			}
		}, this,null,this.geneticElement.identifier+"_Loading");
	};
	
	/**
		* Binds events.
		* @returns {void}
	*/
	Eplant.Views.InteractionView.prototype.bindEvents = function () {
		// load-views
		var eventListenerLoad = new ZUI.EventListener('load-views', null,
		function (event, eventData, listenerData) {
			// Check the target GeneticElement Species is associated with InteractionView
			if (listenerData.interactionView.geneticElement.species === event.target.species) {
				// Check that Cytoscape is ready, access node via Cytoscape
				if (listenerData.interactionView.cy) {
					// Check whether the GeneticElement is part of the interaction network
					var loadedNodes = listenerData.interactionView.cy.nodes('[id ^= "' +
					event.target.identifier.toUpperCase() + '"]');
					
					for (var n = 0; n < loadedNodes.length; n = n + 1) {
						var node = loadedNodes[n];
						
						// Change node style
						node.addClass('loaded');
						
						// Create annotation
						var annotation = new Eplant.Views.InteractionView.Annotation(
						event.target, listenerData.interactionView);
						node._private.data.annotation = annotation;
					}
					} else {
					// Cytoscape is not ready, access node via Cytoscape configurations
					// Check whether the GeneticElement is part of the interaction network
					var nodes = listenerData.interactionView.cyConf.elements.nodes;
					var loadedNodes = [];
					for (var n = 0; n < nodes.length; n = n + 1) {
						if (nodes[n].data.id.toUpperCase().substring(0, 9) ===
						event.target.identifier.toUpperCase()) {
							loadedNodes.push(nodes[n]);
						}
					}
					
					for (var n = 0; n < loadedNodes.length; n = n + 1) {
						var node = loadedNodes[n];
						
						// Add node class
						node.classes = node.classes + ' loaded';
						// Create annotation
						var annotation = new Eplant.Views.InteractionView.Annotation(
						event.target, listenerData.interactionView);
						node.data.annotation = annotation;
					}
				}
			}
		}, {interactionView: this});
		this.eventListeners.push(eventListenerLoad);
		ZUI.addEventListener(eventListenerLoad);
		
		// drop-views
		var eventListenerDrop = new ZUI.EventListener('drop-views', null,
		function (event, eventData, listenerData) {
			// Check the target GeneticElement parent Species is associated with InteractionView
			if (listenerData.interactionView.geneticElement.species === event.target.species) {
				if (listenerData.interactionView.cy) {
					// Cytoscape is ready, access node via Cytoscape
					// Check whether the GeneticElement is part of the interaction network
					var loadedNodes = listenerData.interactionView.cy.nodes('[id ^= "' +
					event.target.identifier.toUpperCase() + '"]');
					
					for (var n = 0; n < loadedNodes.length; n = n + 1) {
						var node = loadedNodes[n];
						
						// Remove node loaded class
						node.removeClass('loaded');
						
						// Remove annotation
						if (node._private.data.annotation) {
							node._private.data.annotation.remove();
							node._private.data.annotation = null;
						}
					}
					} else {
					// Cytoscape is not ready, access node via Cytoscape configurations
					// Check whether the GeneticElement is part of the interaction network
					var nodes = listenerData.interactionView.cyConf.elements.nodes;
					var loadedNodes;
					for (var n = 0; n < nodes.length; n = n + 1) {
						if (nodes[n].data.id.toUpperCase().substring(0, 9) ===
						event.target.identifier.toUpperCase()) {
							loadedNodes.push(nodes[n]);
						}
					}
					
					for (var n = 0; n < loadedNodes.length; n = n + 1) {
						var node = loadedNodes[n];
						// Change node style
						node.classes.replace('loaded', '');
						// Remove annotation
						if (node.data.annotation) {
							node.data.annotation.remove();
							node.data.annotation = null;
						}
					}
				}
			}
		}, {interactionView: this});
		this.eventListeners.push(eventListenerDrop);
		ZUI.addEventListener(eventListenerDrop);
		
		// mouseover-geneticElementPanel-item
		var eventListenerMouseOver = new ZUI.EventListener('mouseover-geneticElementPanel-item',
		null, function (event, eventData, listenerData) {
			// Check the target GeneticElement parent Species is associated with InteractionView
			if (listenerData.interactionView.geneticElement.species === event.target.species) {
				if (listenerData.interactionView.cy) {
					// Highlight node
					listenerData.interactionView.cy.$('node#' +
					event.target.identifier.toUpperCase()).addClass('highlight');
				}
			}
		}, {interactionView: this});
		this.eventListeners.push(eventListenerMouseOver);
		ZUI.addEventListener(eventListenerMouseOver);
		
		// mouseout-geneticElementPanel-item
		var eventListenerMouseOut = new ZUI.EventListener('mouseout-geneticElementPanel-item', null,
		function (event, eventData, listenerData) {
			// Check the target GeneticElement parent Species is associated with InteractionView
			if (listenerData.interactionView.geneticElement.species === event.target.species) {
				if (listenerData.interactionView.cy) {
					// Remove node highlight
					listenerData.interactionView.cy.$('node#' +
					event.target.identifier.toUpperCase()).removeClass('highlight');
				}
			}
		}, {interactionView: this});
		this.eventListeners.push(eventListenerMouseOut);
		ZUI.addEventListener(eventListenerMouseOut);
		window.addEventListener('resize', $.proxy(this.resize, this), false);
	};
	
	/**
		* Resizes the cytoscape window to fit all elements
		* @return {void}
	*/
	Eplant.Views.InteractionView.prototype.resize = function () {
		this.fit();
	};
	
	/**
		* Creates a node object for feeding to Cytoscape.
		*
		* @param {String} identifier Identifier of the node.
		* @param {String} interactionType The type of interaction
		* @return {Object} Node object that can be fed to Cytoscape.
	*/
	Eplant.Views.InteractionView.prototype.createNode = function (identifier, interactionType) {
		// Check whether this is the query node
		var isQueryNode = identifier.toUpperCase() === this.geneticElement.identifier.toUpperCase();
		
		// Gets genetic element associated with identifier;
		var geneticElement = this.geneticElement.species.getGeneticElementByIdentifier(
		identifier.substring(0, 9));
		var annotation = null;
		// Create annotation if associated genetic element has been loaded
		if (geneticElement && geneticElement.isLoadedViews) {
			annotation = new Eplant.Views.InteractionView.Annotation(geneticElement, this);
		}
		// Create node object
		var node = {
			group: 'nodes',
			data: {
				id: identifier.toUpperCase(),
				geneticElement: geneticElement,
				annotation: annotation,
				interactionType: interactionType,
				borderColor: '#FFFFFF',
				backgroundColor: '#B4B4B4',
				color: '#000',
				content: identifier.substring(0, 9)
			}
		};
		
		// Class assignent
		if (interactionType === 'DNA') {
			node.classes = 'DNA';
			} else if (interactionType === 'Protein') {
			node.classes = 'Protein';
			} else if (isQueryNode) {
			node.classes = 'queryNode';
		}
		
		// Distinguish nodes with loaded views by class
		if (geneticElement && geneticElement.isLoadedViews) {
			node.classes = node.classes + ' loaded';
		}
		// Assigns visual styles to nodes
		if (isQueryNode) {
			node.data.size = 50;
			node.data.borderWidth = 8;
			node.data.textOutlineWidth = 2;
			node.data.mass = 25;
			node.data.fontsize = 13;
			} else if (interactionType === 'Protein') {
			node.data.size = 32;
			node.data.borderWidth = 4;
			node.data.textOutlineWidth = 0;
			node.data.mass = 9;
			node.data.fontsize = 11;
			} else {
			node.data.size = 32;
			node.data.borderWidth = 4;
			node.data.textOutlineWidth = 0;
			node.data.mass = -500;
			node.data.fontsize = 11;
		}
		// Return node object
		return node;
	};
	
	/**
		* Creates an edge object for feeding to Cytoscape.
		*
		* @param {Object} interactionData Data that is to be represented by the edge.
		* @return {Object} Edge object that can be fed to Cytoscape.
	*/
	Eplant.Views.InteractionView.prototype.createEdge = function (interactionData) {
		// Determine interaction type
		var interactionType = interactionData.index > 1 ? 'PDI' : 'PPI';
		var published;
		if (interactionData.reference === false) {
			published = false;
		} else if (interactionData.reference === "PubMed27117388") {
			published = false;
		} else {
			published = true;
		}

		// Create edge object
		var edge = {
			group: 'edges',
			data: {
				source: interactionData.source.toUpperCase(),
				target: interactionData.target.toUpperCase(),
				correlation: interactionData.correlation_coefficient,
				confidence: interactionData.interolog_confidence,
				tooltip: null,
				published: published,
				reference: interactionData.reference,
				interactionType: interactionType
			}
		};
		
		// Set edge style and size based on confidence
		if (interactionType === 'PPI') {
			if (published) {
				edge.data.lineStyle = 'solid';
				edge.data.size = 6;
				} else if (interactionData.interolog_confidence > 10) {
				edge.data.lineStyle = 'solid';
				edge.data.size = 6;
				} else if (interactionData.interolog_confidence > 5) {
				edge.data.lineStyle = 'solid';
				edge.data.size = 4;
				} else if (interactionData.interolog_confidence > 2) {
				edge.data.lineStyle = 'solid';
				edge.data.size = 1;
				} else {
				edge.data.lineStyle = 'dashed';
				edge.data.size = 1;
			}
		} else if (interactionType === 'PDI') {
			if (published) {
				edge.data.lineStyle = 'solid';
				edge.data.size = 6;
			} else if (interactionData.interolog_confidence <= 0.0000000001) {
				edge.data.lineStyle = 'solid';
				edge.data.size = 6;
			} else if (interactionData.interolog_confidence <= 0.00000001) {
				edge.data.lineStyle = 'solid';
				edge.data.size = 4;
			} else if (interactionData.interolog_confidence < 0.000001) {
					edge.data.lineStyle = 'solid';
					edge.data.size = 1;
			} else {
					edge.data.lineStyle = 'dashed';
					edge.data.size = 1;
			}
		}
		
		// Set edge color based on correlation
		if (interactionType === 'PDI' && published) {
			edge.data.lineColor = '#669900';
		} else if (interactionType === 'PDI') {
			edge.data.lineColor = '#A0A0A0';
		} else if (published) {
			edge.data.lineColor = '#99CC00';
		} else if (interactionData.correlation_coefficient > 0.8) {
			edge.data.lineColor = '#B1171D';
		} else if (interactionData.correlation_coefficient > 0.7) {
			edge.data.lineColor = '#D32E09';
		} else if (interactionData.correlation_coefficient > 0.6) {
			edge.data.lineColor = '#E97911';
		} else if (interactionData.correlation_coefficient > 0.5) {
			edge.data.lineColor = '#EEB807';
		} else {
			edge.data.lineColor = '#A0A0A0';
		}
		
		
		// Distinguish PDI edges by arc
		edge.data.curveStyle = edge.data.interactionType === 'PDI' ? 'unbundled-bezier' : 'bezier';
		edge.data.targetArrowShape = edge.data.interactionType === 'PDI' ? 'triangle' : 'none';
		// Return edge object
		return edge;
	};
	
	/**
		* Returns the color corresponding to a subcellular compartment.
		*
		* @param {String} compartment A subcellular compartment.
		* @return {String} The color corresponding to the subcellular compartment.
	*/
	Eplant.Views.InteractionView.prototype.getColorByCompartment = function (compartment) {
		// Define color map
		var map = {
			cytoskeleton: '#FF2200',
			cytosol: '#E04889',
			'endoplasmic reticulum': '#D0101A',
			extracellular: '#6D3F1F',
			golgi: '#A5A417',
			mitochondrion: '#41ABF9',
			nucleus: '#0032FF',
			peroxisome: '#660066',
			'plasma membrane': '#ECA926',
			plastid: '#179718',
			vacuole: '#F6EE3C',
			DNA: '#030303'
		};
		
		// Get color
		var color = map[compartment];
		if (!color) {
			color = '#787878';
		}
		
		// Return color
		return color;
	};
	
	/**
		* Grabs the View's screen.
		*
		* @override
		* @return {DOMString} The data url for the canvas
	*/
	Eplant.Views.InteractionView.prototype.getViewScreen = function () {
		// Get Cytoscape canvases
		var canvases = Eplant.Views.InteractionView.domContainer.getElementsByTagName('canvas');
		
		// Sort canvases by z-index
		Array(canvases).sort(function (a, b) {
			return a.style.zIndex - b.style.zIndex;
		});
		
		// Create temporary canvas for drawing the combined image
		var canvas = document.createElement('canvas');
		canvas.width = ZUI.width;
		canvas.height = ZUI.height;
		var context = canvas.getContext('2d');
		
		// Combine Cytoscape canvases
		for (var n = 0; n < canvases.length; n = n + 1) {
			context.drawImage(canvases[n], 0, 0);
		}
		
		// Return data URL
		return canvas.toDataURL();
	};
	
	/**
		* Returns The exit-out animation configuration.
		*
		* @override
		* @return {Object} The exit-out animation configuration.
	*/
	Eplant.Views.InteractionView.prototype.getExitOutAnimationConfig = function () {
		var config = Eplant.View.prototype.getExitOutAnimationConfig.call(this);
		config.begin = $.proxy(function () {
			this.cy.animate({
				fit: {
					padding: 10000
				}
				}, {
				duration: 1000
			});
		}, this);
		return config;
	};
	
	/**
		* Returns The enter-out animation configuration.
		*
		* @override
		* @return {Object} The enter-out animation configuration.
	*/
	Eplant.Views.InteractionView.prototype.getEnterOutAnimationConfig = function () {
		var config = Eplant.View.prototype.getEnterOutAnimationConfig.call(this);
		config.begin = $.proxy(function () {
			this.cy.fit(-10000);
			if (this.cy.noInteraction) {
				this.cy.animate({
					fit: {
						padding: 150
					}
					}, {
					duration: 1000
				});
				} else {
				this.cy.animate({
					fit: {
						padding: 100
					}
					}, {
					duration: 1000
				});
			}
		}, this);
		return config;
	};
	
	/**
		* Returns The exit-in animation configuration.
		*
		* @override
		* @return {Object} The exit-in animation configuration.
	*/
	Eplant.Views.InteractionView.prototype.getExitInAnimationConfig = function () {
		var config = Eplant.View.prototype.getExitInAnimationConfig.call(this);
		config.begin = $.proxy(function () {
			this.cy.animate({
				fit: {
					padding: -10000
				}
				}, {
				duration: 1000
			});
		}, this);
		return config;
	};
	
	/**
		* Returns The enter-in animation configuration.
		*
		* @override
		* @return {Object} The enter-in animation configuration.
	*/
	Eplant.Views.InteractionView.prototype.getEnterInAnimationConfig = function () {
		var config = Eplant.View.prototype.getEnterInAnimationConfig.call(this);
		config.begin = $.proxy(function () {
			this.cy.fit(10000);
			if (this.cy.noInteraction) {
				this.cy.animate({
					fit: {
						padding: 150
					}
					}, {
					duration: 1000
				});
				} else {
				this.cy.animate({
					fit: {
						padding: 100
					}
					}, {
					duration: 1000
				});
			}
		}, this);
		return config;
	};
	
	Eplant.Views.InteractionView.prototype.zoomIn = function () {
		if (this.cy) {
			this.zoom = this.zoom + 0.2;
			this.cy.zoom({
				level: this.zoom,
				position: this.queryNode.position()
			});
		}
	};
	
	Eplant.Views.InteractionView.prototype.zoomOut = function () {
		if (this.cy) {
			this.zoom = this.zoom - 0.2;
			this.cy.zoom({
				level: this.zoom,
				position: this.queryNode.position()
			});
		}
	};
	
	Eplant.Views.InteractionView.prototype.fit = function () {
		if (ZUI.activeView === this) {
			if (this.cy) {
				if (this.cy.noInteraction) {
					this.cy.fit(150);
				} else {
					this.cy.fit(100);
				}
				
				this.zoom = this.cy.zoom();
				this.pan = this.cy.pan();
			}
		}
	};
}());
