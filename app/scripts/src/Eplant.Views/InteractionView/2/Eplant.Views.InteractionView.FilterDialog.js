(function() {
	
	/**
		* Eplant.Views.InteractionView.FilterDialog class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* Dialog for user to choose filter settings for an interaction view.
		*
		* @constructor
		* @param {Eplant.Views.InteractionView} interactionView The InteractionView that owns this dialog.
	*/
	Eplant.Views.InteractionView.FilterDialog = function(interactionView) {
		/* Attributes */
		this.interactionView = interactionView;	// The InteractionView that owns this dialog
		this.domContainer = null;			// DOM container element
		this.domConfidence = null;			// DOM element for confidence input
		this.domCorrelation = null;			// DOM element for correlation input
		
		/* Create DOM elements */
		this.createDOM();
		
		/* Create dialog */
		this.createDialog();
	};
	
	/**
		* Creates DOM elements.
	*/
	Eplant.Views.InteractionView.FilterDialog.prototype.createDOM = function() {
		/* Container */
		this.domContainer = document.createElement("div");
		this.domDesc = document.createElement("div");
		$(this.domDesc).css({'color':'#999','margin-bottom':'10px'});
		$(this.domDesc).html("Mask interactions with confidence and/or correlation values beneath a certain threshold.");
		$(this.domContainer).append(this.domDesc);
		/* Table */
		var table = document.createElement("table");
		$(table).width(250);
		$(this.domContainer).append(table);
		
		/* Confidence */
		var tr = document.createElement("tr");
		var td = document.createElement("td");
		/* Label */
		var label = document.createElement("label");
		$(label).html("Confidence:");
		$(td).append(label);
		$(tr).append(td);
		var td = document.createElement("td");
		/* Confidence input */
		var div = document.createElement("div");
		$(div).css({'margin-bottom':'10px'});
		$(td).append(div);
		this.domConfidence = document.createElement("input");
		
		$(this.domConfidence).width(60);
		$(div).append(this.domConfidence);
		$(this.domConfidence).spinner({
			spin: function(event, ui) {
				if (ui.value < 0) {
					$(this).spinner("value", 0);
				}
			}
		});
		$(this.domConfidence).spinner("value", 2);
		$(tr).append(td);
		$(table).append(tr);
		
		/* Correlation */
		tr = document.createElement("tr");
		td = document.createElement("td");
		/* Label */
		var label = document.createElement("label");
		$(label).html("Correlation:");
		$(td).append(label);
		$(tr).append(td);
		td = document.createElement("td");
		/* Correlation input */
		div = document.createElement("div");
		$(div).css({'margin-bottom':'10px'});
		$(td).append(div);
		this.domCorrelation = document.createElement("input");
		$(tr).css({'margin-bottom':'10px'});
		$(this.domCorrelation).width(60);
		$(div).append(this.domCorrelation);
		$(this.domCorrelation).spinner({
			step: 0.1,
			spin: function(event, ui) {
				if (ui.value < 0) {
					$(this).spinner("value", 0);
				}
				else if (ui.value > 1) {
					$(this).spinner("value", 1);
				}
			}
		});
		$(this.domCorrelation).spinner("value", 0.5);
		$(tr).append(td);
		$(table).append(tr);
		
	};
	
	/**
		* Creates and opens the dialog.
	*/
	Eplant.Views.InteractionView.FilterDialog.prototype.createDialog = function() {
		var options = {};
		options.content = this.domContainer;
		options.title = "Filter Interactions";
		options.lock = true;
		options.background = '#000'; 
		options.opacity = 0.6;
		options.width = 320;
		options.window = 'top'; 
		options.fixed= true; 
		options.drag= false;
		options.resize= false;
		options.close= $.proxy(function() {
			//this.remove();
		}, this);
		options.ok =$.proxy(function(event, ui) {
			// Escape if Cytoscape is not ready
			if (!this.interactionView.cy) {
				return;
			}
			
			// Get confidence
			var confidence = $(this.domConfidence).spinner("value");
			if (confidence < 0) confidence = 0;
			
			// Get correlation
			var correlation = $(this.domCorrelation).spinner("value");
			if (correlation < 0) correlation = 0;
			else if (correlation > 1) correlation = 1;
			
			//Turn on filter 
			this.interactionView.filterConfidence = confidence;
			this.interactionView.filterCorrelation = correlation;
			this.interactionView.applyFilter();
			
			// Close dialog 
			this.remove();
		}, this);
		/*options.cancel = $.proxy(function(event, ui) {
			this.remove();
		}, this);*/
		this.dialog = window.top.art.dialog(options);
		//$.extend(true,this, dialog );
		/*
			$(this.domContainer).dialog({
			title: "Masking",
			width: 270,
			height: "auto",
			minHeight: 0,
			resizable: false,
			modal: true,
			buttons: [
			{
			text: "OK",
			click: $.proxy(function(event, ui) {
			// Escape if Cytoscape is not ready
			if (!this.interactionView.cy) {
			return;
			}
			
			// Get confidence
			var confidence = $(this.domConfidence).spinner("value");
			if (confidence < 0) confidence = 0;
			
			// Get correlation
			var correlation = $(this.domCorrelation).spinner("value");
			if (correlation < 0) correlation = 0;
			else if (correlation > 1) correlation = 1;
			
			//Turn on filter 
			this.interactionView.filterConfidence = confidence;
			this.interactionView.filterCorrelation = correlation;
			this.interactionView.applyFilter();
			
			// Close dialog 
			this.close();
			}, this)
			},
			{
			text: "Close",
			click: $.proxy(function(event, ui) {
			this.close();
			}, this)
			}
			],
			close: $.proxy(function(event, ui) {
			this.remove();
			}, this)
		});*/
	};
	
	/**
		* Closes the dialog.
	*/
	Eplant.Views.InteractionView.FilterDialog.prototype.close = function() {
		/* Close dialog */
		this.dialog.close();
	};
	
	/**
		* Removes the dialog.
	*/
	Eplant.Views.InteractionView.FilterDialog.prototype.remove = function() {
		/* Remove DOM elements */
		this.dialog.close();
	};
	
})();