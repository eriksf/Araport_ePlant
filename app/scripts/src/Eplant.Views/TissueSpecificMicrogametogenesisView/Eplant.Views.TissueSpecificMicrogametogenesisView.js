(function() {

/**
 * Eplant.Views.ExperimentalView class
 * Coded by Hans Yu
 * UI designed by Jamie Waese
 *
 * ePlant View for browsing gene expression data of plant tissues during development as eFP.
 *
 * @constructor
 * @augments Eplant.Experimental.EFPView
 * @param {Eplant.GeneticElement} geneticElement The GeneticElement associated with this view.
 */
Eplant.Views.TissueSpecificMicrogametogenesisView = function(geneticElement) {
	// Get constructor
	var constructor = Eplant.Views.TissueSpecificMicrogametogenesisView;

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
	
	/* Call eFP constructor */ 

	var efpSvgURL = 'data/experiment/efps/TissueSpecificMicrogametogenesis/' + geneticElement.species.scientificName.replace(" ", "_") + '.svg';
	var efpXmlURL = 'data/experiment/efps/TissueSpecificMicrogametogenesis/' + geneticElement.species.scientificName.replace(" ", "_") + '.xml';
	Eplant.BaseViews.EFPView.call(this, geneticElement, efpSvgURL,efpXmlURL, {
	});

};
ZUI.Util.inheritClass(Eplant.BaseViews.EFPView, Eplant.Views.TissueSpecificMicrogametogenesisView);	// Inherit parent prototype

Eplant.Views.TissueSpecificMicrogametogenesisView.viewName = "Tissue Specific Microgametogenesis eFP";
Eplant.Views.TissueSpecificMicrogametogenesisView.hierarchy = "genetic element";
Eplant.Views.TissueSpecificMicrogametogenesisView.magnification = 35;
Eplant.Views.TissueSpecificMicrogametogenesisView.description = "Tissue Specific Microgametogenesis eFP";
Eplant.Views.TissueSpecificMicrogametogenesisView.citation = "";
Eplant.Views.TissueSpecificMicrogametogenesisView.activeIconImageURL = "";
Eplant.Views.TissueSpecificMicrogametogenesisView.availableIconImageURL = "";
Eplant.Views.TissueSpecificMicrogametogenesisView.unavailableIconImageURL = "";


})();
