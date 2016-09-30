(function () {
	/* global Eplant*/

	/**
		* Eplant.Views.InteractionView.Filter class
		* Coded by Ian Shi
		*
		* Filters interaction edges and nodes based on parameters
		* @constructor
		* @param {Eplant.Views.InteractionView} interactionView The ePlant InteractionView.
		* @return {undefined}
	*/
	'use strict';
	Eplant.Views.InteractionView.Filter = function (interactionView) {
		/**
		 * The interactions view associated with this filter
		 * @type {Eplant.Views.InteractionView}
		 */
		this.interactionView = interactionView;
	};

	/**
		* Filters the interaction view for edges matching selector
		* @param {String} selector The selector by which to search nodes
		* @return {Collection} edges The edges which matches the selector
	*/
	Eplant.Views.InteractionView.Filter.prototype.filterEdges = function (selector) {
		// Filter edges
		return this.interactionView.cy.edges(selector);
	};

	/**
		* Clears interaction view of nodes without associated edges
		* @return {undefined}
	*/
	Eplant.Views.InteractionView.Filter.prototype.cleanNodes = function () {
		// Get all nodes in interaction view
		var nodes = this.interactionView.cy.nodes();
		for (var n = 0; n < nodes.length; n = n + 1) {
			var node = nodes[n];
			// Remove nodes without visible edges if node is not query node
			var isQueryNode = this.interactionView.queryNode.data('id') === node.data('id');
			// Remove nodes with no connecting interactions
			var isOrphaned = node.connectedEdges(':visible').length === 0;
			// Exclude interation label (which is coded as node)
			var isNotLabel = node.data('id') !== 'noInteractionLabel';
			// Exclude compound nodes
			var isNotParentDNA = node.data('id') !== 'compoundDNA';
			var isNotParentProtein = node.data('id') !== 'compoundProtein';

			if (isOrphaned && isNotLabel && !isQueryNode &&	isNotParentDNA && isNotParentProtein) {
				node.hide();
			}
		}
		// Clear orphaned translational nodes
		for (var k = 0; k < nodes.length; k = k + 1) {
			var node = nodes[k];
			// Remove trans nodes with only translational interaction
			var isTrans = node.data('id').substring(9) === 'TRANS';
			var isOrphanedTrans = isTrans && node.connectedEdges(':visible').length === 1;
			if (isOrphanedTrans) {
				node.hide();
				node.connectedEdges().connectedNodes().hide();
			}
		}
	};

	/**
		* Cleans interaction view of parent DNA node if no nodes contained are visible
		* @returns {void}
	*/
	Eplant.Views.InteractionView.Filter.prototype.cleanCompoundDNA = function () {
		// Get nodes contained in compound DNA node
		var containedNodes = this.interactionView.cy.nodes('[parent = "compoundDNA"]');
		// Check if there are any visible nodes contained
		var containsVisible = false;
		for (var n = 0; n < containedNodes.length; n = n + 1) {
			var node = containedNodes[n];
			// Check if node is visible
			if (node.visible()) {
				containsVisible = true;
			}
		}

		if (!containsVisible) {
			// Get compound DNA node
			var compoundDNA = this.interactionView.cy.nodes('[id = "compoundDNA"]');
			// Hide compound DNA node
			compoundDNA.hide();
		}
	};

		/**
		* Cleans interaction view of parent Protein node if no nodes contained are visible
		* @returns {void}
	*/
	Eplant.Views.InteractionView.Filter.prototype.cleanCompoundProtein = function () {
		// Get nodes contained in compound DNA node
		var containedNodes = this.interactionView.cy.nodes('[parent = "compoundProtein"]');
		// Check if there are any visible nodes contained
		var containsVisible = false;
		for (var n = 0; n < containedNodes.length; n = n + 1) {
			var node = containedNodes[n];
			// Check if node is visible
			if (node.visible()) {
				containsVisible = true;
			}
		}

		if (!containsVisible) {
			// Get compound DNA node
			var compoundProtein = this.interactionView.cy.nodes('[id = "compoundProtein"]');
			// Hide compound DNA node
			compoundProtein.hide();
		}
	};
}());
