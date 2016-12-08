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
		 * Tracks whether a semi-circle layout has been used
		 * @type {Boolean}
		 */
		this.circular;
		/**
		 * The list of PDI nodes ID's
		 * @type {List}
		 */
		this.PDIArray = [];
		/**
		 * The array of coordinates to place nodes
		 * @type {List}
		 */
		this.coordinateArray = [];
		/**
		 * The vertical increment between nodes for linear layout
		 * @type {Number}
		 */
		this.linearIncrement = 100;		
		/**
		 * The x coordinate for linear layouts
		 * @type {Number}
		 */
		this.linearXCoord = this.interactionView.queryNode.position().x - 500
		/**
		 * The midpoint of the query node
		 * @type {Number}
		 */
		this.linearMidpoint = this.interactionView.queryNode.position().y;

		this.execute();
	};

	/**
	 * Execute the node alignment process
	 * @return {Void}
	 */
	Eplant.Views.InteractionView.NodeAlign.prototype.execute = function () {
		this.PDIArray = this.collectPDI();
		this.coordinateArray = this.coordCalculator(this.PDIArray);
		this.positionNodes(this.PDIArray, this.coordinateArray);
		// Lay out protein nodes post alignment
		var compoundProtein = this.interactionView.cy.$("#compoundProtein");
		compoundProtein.position({
			x: this.interactionView.queryNode.position().x + 500,
			y: this.linearMidpoint - 200
		});
		this.setAlignmentLayout();
	};

	/**
	 * Collect nodes of Protein-DNA interactions
	 *
	 * @returns {Array} nodesIDArray An array of node ids
	*/
	Eplant.Views.InteractionView.NodeAlign.prototype.collectPDI = function () {
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
	 * Generates an array of node coordinates, which layout shape determined by number of nodes.
	 *
	 * @param  {Array} The array of PDI node ID's
	 * @return {Array} Returns an array of tuples of (x, y) coordinates for the nodes
	 */
	Eplant.Views.InteractionView.NodeAlign.prototype.coordCalculator = function (nodes) {
		// Generate coordinate array
		var coordinateArray;

		// Get number of nodes to determine layout
		var numNodes = nodes.length;
		if (numNodes <= 30) {
			// Linear layout
			coordinateArray = this.coordCalculatorLinear(numNodes);
			// Set status for interaction view
			this.circular = false;
		} else {
			// Circular layout
			coordinateArray = this.coordCalculatorCircular(numNodes);
			// Set status for interaction view
			this.circular = true;
		}

		return coordinateArray;
	};

	/**
	 * Repositions node in the Interaction Viewer to the left side
	 * @param {Array} nodes The Array of node ids to be positioned
	 * @param {Array} coordArray The array of coordinates of individual nodes
	 * @returns {void}
	*/
	Eplant.Views.InteractionView.NodeAlign.prototype.positionNodes = function (nodes, coordArray) {
		for (var n = 0; n < nodes.length; n = n + 1) {
			var nodeID = nodes[n];
			// Get node associated with ID
			var currentNode = this.interactionView.cy.nodes('#' + nodeID);
			var transNode = this.interactionView.cy.nodes('#' + nodeID.substring(0, 9) + 'TRANS');
			// Reposition node according to coordinates
			currentNode.position({x: coordArray[n][0], y: coordArray[n][1]});
			transNode.position({x: coordArray[n][0] - 150, y: coordArray[n][1]});
		}
	};

	/**
	 * Determines Y coordinate for individual nodes with even spacing
	 *
	 * @param {Number} numNodes The amount of nodes to be positioned
	 * @return {List} coordinates The calculated (x, y) coordinates
	*/
	Eplant.Views.InteractionView.NodeAlign.prototype.coordCalculatorLinear = function (numNodes) {
		var coordinates = [];
		// Assign values to coordinates
		if (numNodes <= 0) {
			// Return empty coords
			coordinates = [];
		} else if (numNodes === 1) {
			// Return midpoint
			coordinates.push([this.linearXCoord, this.linearMidpoint]);
		} else if (numNodes % 2 === 0) {
			// Adds coordinates symmetrically from the midpoint. 
			// The midpoint is placed between the two middle coordinates.
			for (var n = 0; n < numNodes / 2; n = n + 1) {
				var posCoord = this.linearMidpoint + n * this.linearIncrement * 1.5;
				var negCoord = this.linearMidpoint - n * this.linearIncrement * 0.5;
				coordinates.push([this.linearXCoord, posCoord]);
				coordinates.unshift([this.linearXCoord, negCoord]);
			}
		} else {
			// Add aligned center node
			coordinates.push([this.linearXCoord, this.linearMidpoint]);
			// Adds coordinates symmetrically from the midpoint.
			for (var n = 1; n <= Math.floor(numNodes / 2); n = n + 1) {
				var posCoord = this.linearMidpoint + n * this.linearIncrement;
				var negCoord = this.linearMidpoint - n * this.linearIncrement;
				coordinates.push([this.linearXCoord, posCoord]);
				coordinates.unshift([this.linearXCoord, negCoord]);
			}
		}
		return coordinates;
	};

	/**
	 * Generates the coordinates to lay out PDI's in a semicircle
	 * 
	 * @param {Number} The number of nodes to lay out
	 * @returns {Array} The computed coordinate array [(x,y)..] in a semi-circle
	 */
	Eplant.Views.InteractionView.NodeAlign.prototype.coordCalculatorCircular = function (numNodes) {
		// Set bounds for semi-circle (in radians)
		var topLimit;
		var bottomLimit;
		if (numNodes > 80) {
			// Increase arc size past vertical if many nodes
			topLimit = Math.PI / 2 - Math.PI / 8;
			bottomLimit = Math.PI * 1.5 + Math.PI / 8;  
		} else {
			topLimit = Math.PI / 2;
			bottomLimit = Math.PI * 1.5;
		}

		// Angle in radians between nodes
		var increment = (bottomLimit - topLimit) / numNodes;

		// Rows of nodes to stagger
		var rows = 2;
		if (numNodes > 75) {
			rows += 1 + Math.floor(numNodes / 80);
		}
		// Counter to track current row
		var j = 1;
		
		// Final array of x,y coordinates of nodes
		var coordArray = [];

		for (var i = topLimit; i < bottomLimit; i += increment) {
			// Determine radius and distance between nodes
			var radius;
			var separation_weight; 
			if (numNodes > 400) {
				radius = (10 - rows) * numNodes;
				separation_weight = (1 + rows * 0.1);
			} else if (numNodes > 100) {
				radius = (10 - 1.1 * rows) * numNodes;
				separation_weight = (1 + rows * 0.1);
			} else {
				radius = 7.5 * numNodes;
				separation_weight = 1 + rows * 0.3;
			}
			// Stagger rows, weight radius by number of nodes	
			if (j % rows == 7) {
				radius += separation_weight * 315;
			} else if (j % rows == 6) {
				radius += separation_weight * 270;
			} else if (j % rows == 5) {
				radius += separation_weight * 225;
			} else if (j % rows == 4) {
				radius += separation_weight * 180;
			} else if (j % rows == 3) {
				radius += separation_weight * 135;
			} else if (j % rows == 2) {
				radius += separation_weight * 90;
			} else if (j % rows == 1) {
				radius += separation_weight * 45;
			}
			j++;
			coordArray.unshift(trigCalculator(radius, i));
		}
		return coordArray;
	};

	/**
	 * Calls layout on protein nodes after PDI alignment.
	 *
	 * @returns {void}
	 */
	Eplant.Views.InteractionView.NodeAlign.prototype.setAlignmentLayout = function () {
		// Get protein and query node categories from cytoscape
		//var proteinNodes = this.interactionView.cy.nodes('[id $= "PROTEIN"], [id $= "QUERY"]');
		var proteinNodes = this.interactionView.cy.nodes('[id $= "compoundProtein"]').children();
		// Checks if protein nodes exist (e.g., not only query was returned)
		if (proteinNodes.length >= 1) {
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
					var queryNode = this.interactionView.queryNode;
					var mid_x = queryNode.position('x');
					var mid_y = queryNode.position('y');
					transformAverage(proteinNodes, mid_x, mid_y);
				}, this)
			});
		}
	};

	/**
	 * Generates the x-y coordinates of nodes using trigonometry
	 * 
	 * @param {Number} The radius of the interaction edge
	 * @param {Number} The angle of the interaction edge in radians
	 * @returns {Tuple} Returns a tuple of (x, y)
	 */
	function trigCalculator (radius, angle) {
		var x_coord = radius * Math.cos(angle);
		var y_coord = radius * Math.sin(angle);
		return [x_coord, y_coord];
	};
	
	/**
	 * Transform the collection of protein nodes to an area to the average right of the query node.
	 *
	 * @param  {Array} nodes The array of nodes to transform
	 * @param  {Number} center_x The x coord of the query node
	 * @param  {Number} center_y The y coord of the query node
	 * @return {void}
	 */
	function transformAverage(nodes, center_x, center_y) {
		//var max_x = -10000;
		var min_x = 10000;
		var max_y = -10000;
		var min_y = 10000;
		// Get range of values
		for (var n = 0; n < nodes.length; n++) {
			var node = nodes[n];
			var pos_x = node.position('x');
			var pos_y = node.position('y');
			min_x = (pos_x < min_x) ? pos_x : min_x;
			//max_x = (pos_x > max_x) ? pos_x : max_x;
			min_y = (pos_y < min_y) ? pos_y : min_y;
			max_y = (pos_y > max_y) ? pos_y : max_y;
		}

		// Make minimum x at least past the query node + 50
		var delta_x = (center_x + 100 > min_x) ? center_x + 100 - min_x : 0;
		
		// Center average y value with query node
		var avg_y = 0;
		for (var a = 0; a < nodes.length; a ++ ) {
			avg_y += nodes[a].position('y');
		}
		avg_y = avg_y / nodes.length;
		var delta_y = avg_y - center_y;

		// Transform positions
		nodes.positions(function(i, node) {
			var cur_x = node.position('x');
			var cur_y = node.position('y');
			return {
				x: cur_x + delta_x, 
				y: cur_y - delta_y
			}
		})
	};
}());
