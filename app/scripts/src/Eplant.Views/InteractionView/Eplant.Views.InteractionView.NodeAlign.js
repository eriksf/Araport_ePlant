(function () {
	/* global Eplant*/

	/**
		* Eplant.Views.InteractionView.NodeAlign class
		* Coded by Ian Shi
		*
		* Align Protein-DNA interaction nodes spatially according to chromosome number
		* @constructor
		* @param {Eplant.Views.InteractionView} interactionView The Cytoscape InteractionView
	*/
	'use strict';
	Eplant.Views.InteractionView.NodeAlign = function (interactionView) {
		/**
		 * The interactions view associated with this object
		 * @type {Eplant.Views.InteractionView}
		 */
		this.interactionView = interactionView;
		/**
		 * The list of sorted PDI nodes
		 * @type {List}
		 */
		this.nodeIDArray = this.CollectPDI();
		/**
		 * The list of sorted PDI node IDs
		 * @type {List}
		 */
		this.sortedNodeIDArray = this.SortNodes(this.nodeIDArray);
		/**
		 * The default x coordinate for aligned nodes
		 * @type {Number}
		 */
		this.xCoordinate = this.interactionView.queryNode.position().x - 500;
		/**
		 * The list of y coordinates for aligned nodes
		 * @type {List}
		 */
		try {
			this.yCoordinates = this.CoordCalculator(this.interactionView, this.nodeIDArray.length, 100);
		} catch (error) {
			this.yCoordinates = null;
			console.error(error.message);
		}

		// Reposition nodes
		this.PositionNodes(this.sortedNodeIDArray, this.xCoordinate, this.yCoordinates);

		// Lay out protein nodes post alignment
		this.setAlignmentLayout();
	};

	/**
		* Collect nodes of Protein-DNA interactions
		*
		* @returns {Array} nodesIDArray An array of node ids
	*/
	Eplant.Views.InteractionView.NodeAlign.prototype.CollectPDI = function () {
		// Uses Cytoscape built-in filter to find PDI nodes
		var nodes = this.interactionView.cy.nodes('[interactionType = "DNA"]');
		// Add nodes to an array
		var nodesIDArray = [];
		for (var n = 0; n < nodes.length; n = n + 1) {
			// Appends associated ID to array
			nodesIDArray.push(nodes[n].data('id'));
		}
		return nodesIDArray;
	};

	/**
		* Sort an Array of nodes IDs based on chromosome number in increasing order
		* Quicksort algorithm taken from Wikibooks.org
		* @param {Array} nodes The Array of nodes IDs to be sorted
		* @return {Array} The Array of sorted nodes IDs
	*/
	Eplant.Views.InteractionView.NodeAlign.prototype.SortNodes = function (nodes) {
		// QuickSort
		var QuickSort = $.proxy(function (nodes) {
			// Base Case
			if (nodes.length === 0) {
				return [];
			}

			var left = [];
			var right = [];
			var pivot = nodes[0];

			for (var n = 1; n < nodes.length; n = n + 1) {
				var node = nodes[n];
				// Compare 3rd character of ID of nodes
				(node[2] > pivot) ? left.push(node) : right.push(node);
			}
			// Recurse
			return QuickSort(left).concat(pivot, QuickSort(right));
		}, this);

		return QuickSort(nodes);
	};

	/**
		* Repositions node in the Interaction Viewer to the left side
		* @param {Array} nodes The Array of node ids to be positioned
		* @param {Number} x The x coordinate of all nodes
		* @param {Array} y The array of y coordintes of individual nodes
		* @returns {void}
	*/
	Eplant.Views.InteractionView.NodeAlign.prototype.PositionNodes = function (nodes, x, y) {
		for (var n = 0; n < nodes.length; n = n + 1) {
			var nodeID = nodes[n];
			// Get node associated with ID
			var currentNode = this.interactionView.cy.nodes('#' + nodeID);
			var transNode = this.interactionView.cy.nodes('#' + nodeID.substring(0, 9) + 'TRANS');
			// Reposition node according to coordinates
			currentNode.position({x: x, y: y[n]});

			transNode.position({x: x - 150, y: y[n]});
		}
	};

	/**
		* Determines Y coordinate for individual nodes with even spacing
		* @param {Eplant.Views.InteractionView} view The interaction view
		* @param {Number} numNodes The amount of nodes to be positioned
		* @param {Number} increment The vertical distance between nodes
		* @return {List} coordinates The calculated y coordinates
	*/
	Eplant.Views.InteractionView.NodeAlign.prototype.CoordCalculator = function (view, numNodes,
		increment) {
		// Get y coordinate of query node from interactions viewer
		var midpoint = view.queryNode.position().y;

		var coordinates;

		// Assign values to coordinates
		if (numNodes === 0) {
			// Return empty coords
			coordinates = [];
		} else if (numNodes === 1) {
			// Return midpoint
			coordinates = [midpoint];
		} else if (numNodes >= 1) {
			if (numNodes % 2 === 0) {
			// Check if number of nodes are odd, and handle with helper function
				try {
					coordinates = this.AssignYCoordEven(midpoint, numNodes, increment);
				} catch (error) {
					console.error(error.message);
				}
			} else if (numNodes % 2 === 1) {
			// Check if the number of nodes are even, and handle with helper function
				try {
					coordinates = this.AssignYCoordOdd(midpoint, numNodes, increment);
				} catch (error) {
					console.error(error.message);
				}
			}
		} else {
			// Throw exception if incorrect input of nodes occur
			throw new Error('Unexpected number of nodes.');
		}
		return coordinates;
	};

 /**
		* Calculates the vertical coordinates of an even number of nodes.
		* @param {Number} midpoint The center anchor for alignment; the query node y coordinate
		* @param {Number} numNodes The number of nodes to align. Must be even.
		* @param {Number} increment The vertical distance between nodes
		* @return {List} coordinates The calculated y coordinates
	*/
	Eplant.Views.InteractionView.NodeAlign.prototype.AssignYCoordEven = function (midpoint, numNodes,
		increment) {
		// Verify numNodes is even
		if (numNodes % 2 !== 0) {
			throw new Error('An even number is required for AssignYCoordEven');
		}

		var coordinates = [];

		// Adds coordinates symmetrically from the midpoint. The midpoint is placed between the two
		// middle coordinates.
		for (var n = 0; n < numNodes / 2; n = n + 1) {
			var posCoord = midpoint + n * increment + increment / 2;
			var negCoord = midpoint - n * increment - increment / 2;
			coordinates.push(posCoord);
			coordinates.unshift(negCoord);
		}

		return coordinates;
	};

	 /**
		* Calculates the vertical coordinates of an odd number of nodes.
		* @param {Number} midpoint The center anchor for alignment; the query node y coordinate
		* @param {Number} numNodes The number of nodes to align. Must be odd.
		* @param {Number} increment The vertical distance between nodes
		* @return {List} coordinates The calculated y coordinates
	*/
	Eplant.Views.InteractionView.NodeAlign.prototype.AssignYCoordOdd = function (midpoint, numNodes,
		increment) {
		// Verify numNodes is odd
		if (numNodes % 2 !== 1) {
			throw new Error('An odd number is required for AssignYCoordOdd');
		}

		var coordinates = [];

		// Add aligned center node
		coordinates.push(midpoint);
		// Adds coordinates symmetrically from the midpoint.
		for (var n = 1; n <= Math.floor(numNodes / 2); n = n + 1) {
			var posCoord = midpoint + n * increment;
			var negCoord = midpoint - n * increment;
			coordinates.push(posCoord);
			coordinates.unshift(negCoord);
		}
		return coordinates;
	};

	/**
		* Calls layout on protein nodes after PDI alignment.
		*
		* @returns {void}
		*/
	Eplant.Views.InteractionView.NodeAlign.prototype.setAlignmentLayout = function () {
		// Get protein and query node categories from cytoscape
		var proteinNodes = this.interactionView.cy.nodes('[id $= "PROTEIN"], [id $= "QUERY"]');
		// Checks if protein nodes exist (e.g., not only query was returned)
		if (proteinNodes.length > 1) {
			// Executes layout
			proteinNodes.layout({
				name: 'cose-bilkent',
				 // Whether to fit the network view after when done
				fit: false,
				// Padding on fit (Default)
				padding: 10,
				// Whether to enable incremental mode (Default)
				randomize: true,
				// Node repulsion (non overlapping) multiplier
				nodeRepulsion: 45000,
				// Ideal edge (non nested) length (Default)
				idealEdgeLength: 50,
				// Divisor to compute edge forces (Default)
				edgeElasticity: 0.45,
				// Nesting factor (multiplier) to compute ideal edge length for nested edges (Default)
				nestingFactor: 0.1,
				// Gravity force (constant) (Default)
				gravity: 0.25,
				// Maximum number of iterations to perform
				numIter: 7500,
				// For enabling tiling (Must be false, or error occurs)
				tile: false,
				// Type of layout animation. The option set is {'during', 'end', false}
				animate: 'false',
				// Gravity range (constant) for compounds (Default)
				gravityRangeCompound: 1.5,
				// Gravity force (constant) for compounds (Default)
				gravityCompound: 1.0,
				// Gravity range (constant) (Default)
				gravityRange: 3.8,
				stop: $.proxy(function () {
					proteinNodes.layout = null;
					this.interactionView.cy.fit();
				}, this)
			});
		}
	};
}());
