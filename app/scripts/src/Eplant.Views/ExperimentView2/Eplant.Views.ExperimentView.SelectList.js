(function() {

/**
 * Eplant.Views.ExperimentView.SelectList class
 * Coded by Hans Yu
 * UI designed by Jamie Waese
 *
 * Describes the SelectList UI in ExperimentView.
 *
 * @constructor
 */
Eplant.Views.ExperimentView.SelectList = function(speciesView) {
	/* Attributes */
	this.speciesView = speciesView;		// ExperimentView that owns this SelectList object
	this.choices = [];				// Array of Choice objects
	this.selected = null;			// Selected Choice
	this.domContainer = null;			// DOM element of the container
	this.domTitle = null;			// DOM element of the title

	/* Create DOM */
	this.createDOM();
};

/**
 * Creates the DOM elements.
 */
Eplant.Views.ExperimentView.SelectList.prototype.createDOM = function() {
	/* Create container DOM element */
	this.domContainer = document.createElement("div");
	/*this.domContainer.id="dropdown-experiment";
	this.domContainer.className = "dropdown dropdown-tip";
*/
	/* Set CSS class of container for styling */
	$(this.domContainer).addClass("efp-selectList");

	/* Disable context menu */
	this.domContainer.oncontextmenu = function() {
		return false;
	};

	/* Create title DOM element */
	this.domTitle = document.createElement("span");

	/* Set CSS class of title for styling */
	$(this.domTitle).addClass("eplant-selectList-title");

	/* Set title content */
	$(this.domTitle).html("Select View");

	/* Add title DOM element to the container */
	$(this.domContainer).append(this.domTitle);
/*
	$(this.domContainer).appendTo('body');
	$(this.domContainer).dropdown('show');
*/
	/* Set up event listener for load-species */
	var eventListener = new ZUI.EventListener("load-experiments", Eplant, function(event, eventData, listenerData) {
		/* Remove this EventListener */
		ZUI.removeEventListener(this);

		/* Names of views TODO: JSON file */
		var eFPViews = ["Abiotic Stress", "Tissue Specific Embryo Development", "Tissue Specific Guard And Mesophyll Cells", "Tissue Specific Microgametogenesis", 
			"Tissue Specific Pollen Germination", "Tissue Specific Root", "Tissue Specific Shoot Apical Meristem", "Tissue Specific Stem Epidermis",
			"Tissue Specific Stigma And Ovaries", "Tissue Specific Trichomes", "Tissue Specific Xylem And Cork"];

		/* Create Choice objects for the SelectList */
		for (var n = 0; n < eFPViews.length; n++) {
			/* Get Species */
			var view = eFPViews[n];

			/* Create Choice */
			var choice = new Eplant.Views.ExperimentView.SelectList.Choice(view, listenerData.selectList);
			listenerData.selectList.choices.push(choice);
		}

		/* Select first choice */
		if (listenerData.selectList.choices.length) {
			listenerData.selectList.choices[0].select();
		}

		/* Finish loading */
		//listenerData.selectList.ExperimentView.loadFinish();
	}, {
		selectList: this
	});
	ZUI.addEventListener(eventListener);

};

/**
 * Gets the Choice object associated with the specified Species.
 *
 * @param {Eplant.Species} species Species associated with the Choice object.
 * @return {Eplant.Views.ExperimentView.SelectList.Choice} Choice associated with the specified Species.
 */
Eplant.Views.ExperimentView.SelectList.prototype.getChoiceByView = function(view) {
	/* Loop through Choices to find the Choice with a matching Species */
	for (var n = 0; n < this.choices; n++) {
		var choice = this.choices[n];
		if (choice.view == view) {
			return choice;
		}
	}

	/* Not found */
	return null;
};

/**
 * Draws the SelectList.
 */
Eplant.Views.ExperimentView.SelectList.prototype.draw = function() {
	/* Draw selected Choice */
	if (this.selected) {
		this.selected.draw();
	}
};

/**
 * Shows the SelectList.
 */
Eplant.Views.ExperimentView.SelectList.prototype.show = function() {
	/* Append to ZUI container */
	$(ZUI.container).append(this.domContainer);

	/* fire event */
	var expEvent = new ZUI.Event("load-experiments", Eplant, null);
	ZUI.fireEvent(expEvent);
};

/**
 * Hides the SelectList.
 */
Eplant.Views.ExperimentView.SelectList.prototype.hide = function() {
	/* Remove from ZUI container */
	$(this.domContainer).detach();
};

/**
 * Cleans up the Select object for disposal.
 */
Eplant.Views.ExperimentView.SelectList.prototype.remove = function() {
	/* Clean up Choice objects */
	for (var n = 0; n < this.choices.length; n++) {
		this.choices[n].remove();
	}

	/* Remove DOM element */
	$(this.domTitle).remove();
	$(this.domContainer).remove();
};

})();
