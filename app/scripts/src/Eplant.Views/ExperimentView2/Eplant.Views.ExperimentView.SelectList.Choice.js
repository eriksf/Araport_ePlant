(function() {

/**
 * Eplant.Views.ExperimentView.SelectList.Choice class
 * Coded by Hans Yu
 * UI designed by Jamie Waese
 *
 * Describes a Choice of the Select UI in ExperimentView
 *
 * @constructor
 */
Eplant.Views.ExperimentView.SelectList.Choice = function(view, viewList) {
	/* Attributes */
	this.view = view;		// View associated with this Choice object
	this.selectList = viewList;	// SelectList object that owns this Choice object
	this.dom = null;			// DOM element of this Choice
	this.vo = null;			// ViewObject associated with this Choice object

	/* Create DOM */
	this.createDOM();

	/* Append DOM to the SelectList container */
	$(this.selectList.domContainer).append(this.dom);

	/* Create ViewObject 
	this.createVO(); */
};

/**
 * Creates the DOM element
 */
Eplant.Views.ExperimentView.SelectList.Choice.prototype.createDOM = function() {
	/* Create DOM element */
	this.dom = document.createElement("span");

	/* Set CSS class for styling */
	$(this.dom).addClass("efp-selectList-choice");

	/* Add italic CSS styling */
	$(this.dom).css("font-style", "italic");

	/* Set content */
	$(this.dom).html(this.view);

	/* Bind event handler to the "mouseover" event */
	$(this.dom).mouseover($.proxy(function() {
		/* Return if species view is animating */
		if (this.selectList.speciesView.isAnimating) {
			return;
		}

		/* Unselect previous selected choice */
		if (this.selectList.selected) {
			this.selectList.selected.unselect();
		}

		/* Select this choice */
		this.select();
	}, this));

	/* Bind event handler to the "click" event */
	$(this.dom).click($.proxy(function() {
		/* Select this choice, if not already selected */
		if (this.selectList.selected != this) {
			/* Unselect previous selected choice */
			if (this.selectList.selected) {
				this.selectList.selected.unselect();
			}

			/* Select this choice */
			this.select();
		}

		var viewName = this.view;
		viewName = viewName.replace(/ /g, "");
		viewName = viewName + "View";
		//alert(viewName);

		Eplant.changeActiveView(Eplant.activeSpecies.activeGeneticElement.views[viewName]);

		/* Set the Species associated with this Choice to active */
		//Eplant.setActiveSpecies(this.species);

		/* Change to ChromosomeView */
		//if (this.species.scientificName === "Arabidopsis thaliana") {
		//	Eplant.changeActiveView(this.species.views["ChromosomeView"]);
		//}
	}, this));
};

/**
 * Creates the ViewObject.
 
Eplant.Views.ExperimentView.SelectList.Choice.prototype.createVO = function() {
	this.vo = new ZUI.ViewObject({
		shape: "svg",
		positionScale: "world",
		sizeScale: "world",
		centerAt: "center center",
		x: ZUI.width / 6,
		y: 0,
		url: 'app/data/species/' + this.species.scientificName.replace(' ', '_') + '.svg'
	});
};
*/

/**
 * Selects this Choice.
 */
Eplant.Views.ExperimentView.SelectList.Choice.prototype.select = function() {
	/* Add CSS class for selected Choice */
	$(this.dom).addClass("eplant-selectList-choice-selected");

	/* Select this Choice */
	this.selectList.selected = this;
};

/**
 * Unselects this Choice.
 */
Eplant.Views.ExperimentView.SelectList.Choice.prototype.unselect = function() {
	/* Remove CSS class for selected Choice */
	$(this.dom).removeClass("eplant-selectList-choice-selected");

	/* Unselect this Choice */
	if (this.selectList.selected == this) this.selectList.selected = null;
};

/**
 * Draws the Choice.
 */
Eplant.Views.ExperimentView.SelectList.Choice.prototype.draw = function() {
	/* Draw ViewObject */
	//this.vo.draw();
};

/**
 * Cleans up this Choice object for disposal.
 */
Eplant.Views.ExperimentView.SelectList.Choice.prototype.remove = function() {
	/* Remove ViewObject */
	//this.vo.remove();

	/* Remove DOM element */
	$(this.dom).remove();
};

})();
