(function() {

/**
 * Eplant.BaseViews.EFPViewJson.MaskDialog class
 * Coded by Hans Yu
 * UI designed by Jamie Waese
 *
 * Dialog for user to choose masking settings for an eFP view.
 *
 * @constructor
 * @param {Eplant.BaseViews.EFPViewJson} eFPView The EFPView that owns this dialog.
 */
Eplant.BaseViews.EFPViewJson.MaskDialog = function(eFPView) {
	/* Attributes */
	this.eFPView = eFPView;		// Parent EFPView
	this.domContainer = null;		// DOM container element
	this.domInput = null;		// DOM element for threshold input

	/* Create DOM elements */
	this.createDOM();

	/* Create and open dialog */
	this.createDialog();
};

	/**
		* Creates DOM elements.
	*/
	Eplant.BaseViews.EFPViewJson.MaskDialog.prototype.createDOM = function() {
		/* Container */
		this.domContainer = document.createElement("div");
		
		/* Table */
		var table = document.createElement("table");
		$(table).width(300);
		$(this.domContainer).append(table);
		
		/* Threshold */
		var tr = document.createElement("tr");
		var td = document.createElement("td");
		/* Label */
		var label = document.createElement("label");
		$(label).html("Set threshold RSE (%):");
		$(td).append(label);
		$(tr).append(td);
		var td = document.createElement("td");
		/* Treshold input */
		this.domInput = document.createElement("input");
		$(this.domInput).width(60);
		$(td).append(this.domInput);
		$(this.domInput).spinner({
			spin: function(event, ui) {
				if (ui.value < 0) {
					$(this).spinner("value", 0);
				}
			}
		});
		$(this.domInput).spinner("value", 50);
		$(tr).append(td);
		$(table).append(tr);
		this.domDesc = document.createElement("div");
		$(this.domDesc).css({"margin":"5 15 5 4",'color':'#999'});
		$(this.domDesc).html("Mask samples if the expression level is within a given range of their standard deviation");
		$(this.domContainer).append(this.domDesc);
		this.domOk = document.createElement("input");
		$(this.domOk).attr("type", "button");
		$(this.domOk).css({"width":"130px"});
		$(this.domOk).addClass("button greenButton");
		$(this.domOk).val("Compare");
		$(this.domContainer).append(this.domOk);
		$(this.domOk).on('click',  $.proxy(function(event, ui) {
			/* Get threshold */
			var value = $(this.domInput).spinner("value");
			if (value < 0) value = 0;
			
			/* Turn on masking */
			this.eFPView.maskThreshold = value / 100;
			this.eFPView.isMaskOn = true;
			
			/* Update icon image */
			this.eFPView.maskButton.setImageSource("img/on/filter.png");
			
			/* Update eFP */
			this.eFPView.updateDisplay();
			
			/* Close dialog */
			this.close();
		}, this));
	};
	
	/**
		* Creates and opens the dialog.
	*/
	Eplant.BaseViews.EFPViewJson.MaskDialog.prototype.createDialog = function() {
		$(this.domContainer).dialog({
			title: "Masking",
			width: 320,
			height: "auto",
			minHeight: 0,
			resizable: false,
			modal: true,
			open: function(event, ui) { $(".ui-dialog-titlebar-close").hide();
				$(".ui-dialog-buttonpane").css({'border-top-width':'0px'});
			},
			close: $.proxy(function(event, ui) {
				this.remove();
			}, this)
		});
	};

/**
 * Closes the dialog.
 */
Eplant.BaseViews.EFPViewJson.MaskDialog.prototype.close = function() {
	/* Close dialog */
	$(this.domContainer).dialog("close");
};

/**
 * Removes the dialog.
 */
Eplant.BaseViews.EFPViewJson.MaskDialog.prototype.remove = function() {
	/* Remove DOM elements */
	$(this.domContainer).remove();
};

})();