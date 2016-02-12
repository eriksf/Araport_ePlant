(function() {
	
	/**
		* Eplant.Views.InteractionView.Legend class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* @constructor
		* @param {Eplant.Views.InteractionView} interactionView The InteractionView that owns this legend.
	*/
	Eplant.Views.InteractionView.Legend = function(interactionView) {
		/* Attributes */
		this.interactionView = interactionView;		// The InteractionView that owns this legend
		this.domContainer = null;				// DOM container for the legend
		this.isVisible = false;				// Whether this legend is visible
		this.height = 500;
		this.x = 20;
		this.y = 90;
		this.width = 285;
		
		/* Asher: Create DOM container */
		this.domContainer = document.createElement("div");
		
		this.domImg = document.createElement("img");
		this.domImg.src = "img/legendAIV.png";
		$(this.domContainer).css({
			//"pointer-events": "none",
			"position": "absolute",
			"left": this.x,
			"bottom": this.y,
			"width": this.width,
			"height": this.height,
			"opacity":"0.95"
		});
		$(this.domContainer).append(this.domImg);
		
		this.domClose = document.createElement("div");
		$(this.domClose).on('click',$.proxy(function(){
			this.hide();
		},this));
		$(this.domClose).text('X');
		this.domImg.src = "img/legendAIV.png";
		$(this.domClose).css({
			//"pointer-events": "none",
			"position": "absolute",
			"right": 0
		}).addClass('aui_close');
		$(this.domContainer).append(this.domClose);
		this.domContainer.ondragstaart = function() {
			return false;
		};
		$(this.domContainer).draggable();
	};
	
	/**
		* Attaches the legend to the view.
	*/
	Eplant.Views.InteractionView.Legend.prototype.attach = function() {
		$(this.interactionView.domHolder).append(this.domContainer);
		
	};
	
	/**
		* Detaches the legend to the view.
	*/
	Eplant.Views.InteractionView.Legend.prototype.detach = function() {
		$(this.domContainer).detach();
	};
	
	/**
		* Makes the legend visible.
	*/
	Eplant.Views.InteractionView.Legend.prototype.show = function() {
		this.isVisible = true;
		if (ZUI.activeView == this.interactionView) {
			this.attach();
		}
	};
	
	/**
		* Hides the legend.
	*/
	Eplant.Views.InteractionView.Legend.prototype.hide = function() {
		this.isVisible = false;
		if (ZUI.activeView == this.interactionView) {
			this.detach();
		}
	};
	
	/**
		* Removes the legend.
	*/
	Eplant.Views.InteractionView.Legend.prototype.remove = function() {
		/* Remove DOM elements */
		$(this.domContainer).remove();
	};
	
	
	
	
})();
