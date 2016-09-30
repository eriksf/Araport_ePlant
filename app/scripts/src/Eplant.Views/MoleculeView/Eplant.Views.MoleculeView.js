(function() {
	
	/**
		* Eplant.Views.MoleculeView class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* ePlant view for browsing sequence data.
		* Uses the Dalliance genome browser.
		*
		* @constructor
		* @param {Eplant.GeneticElement} The GeneticElement associated with this view.
	*/
	Eplant.Views.MoleculeView = function(geneticElement) {
		// Get constructor
		var constructor = Eplant.Views.MoleculeView;
		
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
		
		// Attributes
		this.geneticElement = geneticElement;
		this.viewMode = 'sequence';
		/* Asher: Create DOM container */
		$.getJSON(Eplant.ServiceUrl + 'JSMol.cgi?agi=' + this.geneticElement.identifier, $.proxy(function(response) {
			if (response.link != "") {
				this.domContainer = document.createElement("iframe");
				//this.domContainer.src = "https://apps.araport.org/jbrowse/?data=arabidopsis&loc=Chr1:" + this.geneticElement.start + ".." + this.geneticElement.end + "&tracks=TAIR9_assemblies,TAIR10_loci,TAIR10_genes,TAIR9_tDNAs,TAIR9_polymorphisms,TAIR9_markers&highlight=";
				this.domContainer.src = "http://104.197.50.15/testjsmol/index30.html?loadfile="+response.link;
				$(this.domContainer).css({
					"position": "absolute",
					"left": 0,
					"top": 0,
					"width": '100%',
					"height": '1px',
					"border": 0
				});
				$(this.domContainer).appendTo(Eplant.Views.MoleculeView.domCacheContainer);
				this.labelDom = null;
				// Finish loading
				$(this.domContainer).load($.proxy(function(){
					//this.update();
					this.loadFinish();
				},this));
				}else{
				this.domContainer = document.createElement("div");
				$(this.domContainer).css({
					"width": '100%',
					"height": '100%'
				});
				var span = document.createElement("span");
				$(span).css({
					'top': '45%',
					'position': 'absolute',
					'text-align': 'center',
					'left': 0,
					'width': '100%',
					'font-size': '25px',
					'color': '#99cc00'
				});
				$(span).text('No molecule structure found for this gene.').appendTo(this.domContainer);
				$(this.domContainer).appendTo(Eplant.Views.MoleculeView.domCacheContainer);
				this.loadFinish();
			}
		},this));
	};
	ZUI.Util.inheritClass(Eplant.View, Eplant.Views.MoleculeView);	// Inherit parent prototype
	
	Eplant.Views.MoleculeView.viewName = "Molecule Viewer";
	Eplant.Views.MoleculeView.hierarchy = "genetic element";
	Eplant.Views.MoleculeView.magnification = 70;
	Eplant.Views.MoleculeView.description = "Molecule viewer";
	Eplant.Views.MoleculeView.citation = "";
	Eplant.Views.MoleculeView.activeIconImageURL = "img/active/molecule.png";
	Eplant.Views.MoleculeView.availableIconImageURL = "img/available/molecule.png";
	Eplant.Views.MoleculeView.unavailableIconImageURL = "img/unavailable/molecule.png";
	Eplant.Views.MoleculeView.viewType = "zui";
	/* Constants */
	Eplant.Views.MoleculeView.domContainer = null;		// DOM container for JSmol
	Eplant.Views.MoleculeView.applet = null;			// JSmol applet object
	Eplant.Views.MoleculeView.container = null;		// JSmol container (inside the main domContainer)
	Eplant.Views.MoleculeView.canvas = null;			// JSmol canvas
	Eplant.Views.MoleculeView.initialize = function() {
		// Get JSmol DOM container
		Eplant.Views.MoleculeView.domContainer = ZUI.container;
		Eplant.Views.MoleculeView.domCacheContainer = document.getElementById("Molecule_cache");
		
		
	};
	
	/**
		* Active callback method.
		*
		* @override
	*/
	Eplant.Views.MoleculeView.prototype.active = function() {
		// Call parent method
		Eplant.View.prototype.active.call(this);
		$('#Molecule_cache').css({
			"visibility": 'visible'
		});
		$(this.domContainer).css({
			"height": '100%'
		});
		// Disable ZUI pointer events
		ZUI.disablePointerEvents();
		
		// Update AIP JBrowse
		//this.update();
	};
	
	/**
		* Inactive callback method.
		*
		* @override
	*/
	Eplant.Views.MoleculeView.prototype.inactive = function() {
		// Call parent method
		Eplant.View.prototype.inactive.call(this);
		$('#Molecule_cache').css({
			"visibility": 'hidden'
		});
		$(this.domContainer).css({
			"height": '0%'
		});
		
		/* Restore ZUI pointer events */
		ZUI.restorePointerEvents();
	};
	
	
	
})();
