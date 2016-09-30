(function () {
	/* global Eplant*/

	/**
	 * Eplant.Views.InteractionView.FilterDialog class
	 * Coded by Hans Yu & Ian Shi
	 * UI designed by Jamie Waese
	 *
	 * Dialog for user to choose filter settings for an interaction view.
	 *
	 * @constructor
	 * @param {Eplant.Views.InteractionView} interactionView The InteractionView that owns dialog.
	 */

	'use strict';
	Eplant.Views.InteractionView.FilterDialog = function (interactionView) {
		/**
		 * The interaction view that owns this dialog
		 * @type {Eplant.Views.InteractionView}
		 */
		this.interactionView = interactionView;
		/**
		 * Filter methods
		 * @type {Eplant.Views.InteractionView.Filter}
		 */
		this.filter = new Eplant.Views.InteractionView.Filter(interactionView);
		/**
		 * The status of interaction filters
		 * @type {List}
		 */
		this.filterStatus = [false, false, false, false, false, false];
		/**
		 * The value of the confidence spinner
		 * @type {Number}
		 */
		this.confidenceValue = null;
		/**
		 * The value of the correlation spinner
		 * @type {Number}
		 */
		this.correlationValue = null;
		/**
		 * DOM container element
		 * @type {HTMLElement}
		 */
		this.domContainer = null;
		/**
		 * DOM element for confidence input
		 * @type {HTMLElement}
		 */
		this.domConfidence = null;
		/**
		 * DOM element for correlation input
		 * @type {HTMLElement}
		 */
		this.domCorrelation = null;
		/**
		 * DOM element for confidence checkbox
		 * @type {HTMLElementCheckbox}
		 */
		this.domConfidendenceCheckbox = null;
		/**
		 * DOM element for correlation checkbox
		 * @type {HTMLElementCheckbox}
		 */
		this.domCorrelationCheckbox = null;
		/**
		 * DOM element for experimental protein-protein interaction checkbox
		 * @type {HTMLElementCheckbox}
		 */
		this.domEPPICheckbox = null;
		/**
		 * DOM element for predicted protein-protein interactions checkbox
		 * @type {HTMLElementCheckbox}
		 */
		this.domPPPICheckbox = null;
		/**
		 * DOM element for experimental protein-DNA interactions checkbox
		 * @type {HTMLElementCheckbox}
		 */
		this.domEPDICheckbox = null;
		/**
		 * DOM element for predicted protein-DNA interactions checkbox
		 * @type {HTMLElementCheckbox}
		 */
		this.domPPDICheckbox = null;
		/**
		 * DOm container for the data filtering label
		 * @type {HTMLElement}
		 */
		this.filterLabelContainer = null;
		/**
		 * The visibility status of the data filtering label
		 * @type {Boolean}
		 */
		this.filterLabelVisible = null;

		/**
		 * String selector to filter EPPI
		 * @type {String}
		 */
		this.EPPISelector = '[interactionType = "PPI"][?published]';
		/**
		 * String selector to filter PPDI
		 * @type {String}
		 */
		this.PPPISelector = '[interactionType = "PPI"][!published]';
		/**
		 * String selector to filter EPDI
		 * @type {String}
		 */
		this.EPDISelector = '[interactionType = "PDI"][?published]';
		/**
		 * String selector to filter PPDI
		 * @type {String}
		 */
		this.PPDISelector = '[interactionType = "PDI"][!published]';

		// Create DOM elements
		this.createDOM();
		// Create filter dialog
		this.createDialog();
		this.isVisible = true;
		// Assign DOM elements to properties
		this.assignProperties();
	};

	/**
	 * Creates DOM elements.
	 * @returns {void}
	 */
	Eplant.Views.InteractionView.FilterDialog.prototype.createDOM = function () {
		// Create DOM container
		this.domContainer = document.createElement('div');

		// Create container for spinners
		var spinnerContainer = document.createElement('div');
		// Create spinner labels
		var confidenceLabel = 'Hide interactions with confidence less than:';
		var correlationLabel = 'Hide interactions with correlation less than:';
		// Create and append spinners
		spinnerContainer.appendChild(this.createSpinner('conf', confidenceLabel, 1, 2));
		spinnerContainer.appendChild(this.createSpinner('corr', correlationLabel, 0.1, 0.5));

		$(this.domContainer).append(spinnerContainer);

		// Create container for checkboxes
		var checkboxContainer = document.createElement('div');
		// Create checkbox labels
		var EPPILabel = 'Hide experimentally determined Protein-Protein interactions';
		var PPPILabel = 'Hide predicted Protein-Protein interactions';
		var EPDILabel = 'Hide experimentally determined Protein-DNA interactions';
		var PPDILabel = 'Hide predicted Protein-DNA interactions';
		// Create and append checkbox elements
		checkboxContainer.appendChild(this.createCheckbox('EPPI', EPPILabel, '15px'));
		checkboxContainer.appendChild(this.createCheckbox('PPPI', PPPILabel));
		checkboxContainer.appendChild(this.createCheckbox('EPDI', EPDILabel, '15px'));
		checkboxContainer.appendChild(this.createCheckbox('PPDI', PPDILabel));

		$(this.domContainer).append(checkboxContainer);
	};

	/**
	 * Constructs spinner elements
	 * @param {string} id The name of the spinner
	 * @param {string} description The description appearing as DOM text
	 * @param {number} step The incremental change for the spinner
	 * @param {number} value The default value of the spinner
	 * @return {HTMLElement} container The container of spinner DOM elements
	 */
	Eplant.Views.InteractionView.FilterDialog.prototype.createSpinner = function (id, description,
		step, value) {
		// Create DOM container
		var container = document.createElement('div');
		// Create DOM checkbox
		var checkbox = this.createCheckbox(id, description);
		// Create DOM spinner container
		var spinnerContainer = document.createElement('div');
		$(spinnerContainer).css({
			'margin-left': '25px',
			'margin-top': '5px'
		});
		// Create DOM spinner
		var spinner = document.createElement('input');
		$(spinnerContainer).append(spinner);
		$(spinner).attr('id', id + '-spinner');
		$(spinner).width(60);
		$(spinner).spinner({
			step: step,
			spin: function (event, ui) {
				if (ui.value < 0) {
					$(this).spinner('value', 0);
				} else if (ui.value > 1) {
					$(this).spinner('value', 1);
				}
			}
		});
		$(spinner).spinner('value', value);
		// Construct DOM structure
		container.appendChild(checkbox);
		container.appendChild(spinnerContainer);

		return container;
	};

	/**
	 * Constructs checkbox elements
	 * @param {string} id The name of the checkbox
	 * @param {string} description The description appearing as DOM text
	 * @param {string} marginTop CSS margin-top of checkbox container
	 * @return {HTMLElement} container The container of checkbox DOM elements
	 */
	Eplant.Views.InteractionView.FilterDialog.prototype.createCheckbox = function (id, description,
		marginTop) {
		// Create DOM container
		var container = document.createElement('div');
		if (typeof marginTop === 'undefined') {
			marginTop = '5px';
		}
		$(container).css('margin-top', marginTop);
		// Create DOM checkbox
		var checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		$(checkbox).attr('id', id + '-checkbox');
		$(checkbox).css({
			'margin-right': '5px',
			'vertical-align': 'middle'
		});

		// Create DOM text
		var text = document.createElement('span');
		$(text).html(description);
		// Construct DOM structure
		container.appendChild(checkbox);
		container.appendChild(text);

		return container;
	};

	/**
	 * Assigns DOM elements to properties
	 * @returns {void}
	 */
	Eplant.Views.InteractionView.FilterDialog.prototype.assignProperties = function () {
		this.domConfidence = $('#conf-spinner');
		this.domCorrelation = $('#corr-spinner');
		this.domConfidenceCheckbox = $('#conf-checkbox');
		this.domCorrelationCheckbox = $('#corr-checkbox');
		this.domEPPICheckbox = $('#EPPI-checkbox');
		this.domPPPICheckbox = $('#PPPI-checkbox');
		this.domEPDICheckbox = $('#EPDI-checkbox');
		this.domPPDICheckbox = $('#PPDI-checkbox');
	};

	/**
	 * Creates and opens the dialog.
	 * @returns {void}
	 */
	Eplant.Views.InteractionView.FilterDialog.prototype.createDialog = function () {
		// Set attributes
		var options = {};
		options.content = this.domContainer;
		options.title = 'Filter Data';
		options.lock = true;
		options.background = '#000';
		options.opacity = 0.6;
		options.width = 500;
		options.window = 'top';
		options.fixed = true;
		options.drag = true;
		options.resize = false;
		options.close = $.proxy(function () {
			this.hide();
		}, this);
		// Onclick action for ok button
		options.ok = $.proxy(function () {
			// Escape if Cytoscape is not ready
			if (!this.interactionView.cy) {
				return;
			}
			// Reset all hidden nodes
			this.interactionView.cy.elements().show();
			// Update spinner values
			this.updateValues();

			// Create confidence selector
			this.confidenceSelector = '[confidence <= ' + this.confidenceValue + ']';
			// Create correlation selector
			this.correlationSelector = '[correlation <= ' + this.correlationValue + ']';

			// Apply value filters
			this.filterStatus[0] = this.applyFilter(this.domConfidenceCheckbox, 0,
				this.confidenceSelector);
			this.filterStatus[1] = this.applyFilter(this.domCorrelationCheckbox, 1,
				this.correlationSelector);
			// Apply type filters
			this.filterStatus[2] = this.applyFilter(this.domEPPICheckbox, 2, this.EPPISelector);
			this.filterStatus[3] = this.applyFilter(this.domPPPICheckbox, 3, this.PPPISelector);
			this.filterStatus[4] = this.applyFilter(this.domEPDICheckbox, 4, this.EPDISelector);
			this.filterStatus[5] = this.applyFilter(this.domPPDICheckbox, 5, this.PPDISelector);
			// Hide orphaned nodes
			this.filter.cleanNodes();
			// Hide parent nodes
			this.filter.cleanCompoundDNA();
			this.filter.cleanCompoundProtein();

			// Check filter status
			var filterActive = this.filterStatus.indexOf(true) !== -1;
			//	Remove pre-existing data active filter
			this.removeDataFilterLabel();
			// Toggle data filtering label depending on filter status
			if (filterActive) {
				this.createDataFilterLabel();
			}
			// Close dialog
			this.hide();
		}, this);

		options.cancel = $.proxy(function () {
			this.hide();
		}, this);

		var dialog = window.top.art.dialog(options);
		// TODO move to constructor
		// Change cancel button class
		$('.aui_buttons:eq(0) button:eq(1)').addClass('aui_state_highlight_grey');
		$.extend(true, this, dialog);
	};

	/**
	 * Creates a label to notify when data filtering is active
	 * @returns {void}
	 */
	Eplant.Views.InteractionView.FilterDialog.prototype.createDataFilterLabel = function () {
		// Get DOM containers
		var container = document.getElementById('Cytoscape_container');
		// Create DOM elements
		var filterLabelContainer = document.createElement('div');
		$(filterLabelContainer).attr('id', 'Data-filtering-label');
		var filterLabel = document.createElement('div');
		$(filterLabel).html('Data Filtering Active');
		// Set CSS for DOM elements
		$(filterLabel).css({
			position: 'absolute',
			'z-index': '1',
			left: '40%',
			top: '40px',
			'font-size': '1.3em',
			'line-height': '1.5em'
		});
		this.filterLabelContainer = filterLabelContainer;
		// Append DOM elements to containers
		$(filterLabelContainer).append(filterLabel);
		$(container).append(filterLabelContainer);
		// Set data filtering label status
		this.filterLabelVisible = true;
	};

	/**
	 * Attaches data filter label to the current view
	 * @returns {void}
	 */
	Eplant.Views.InteractionView.FilterDialog.prototype.attachDataFilterLabel = function () {
		// Attach label
		$('#Cytoscape_container').append(this.filterLabelContainer);
	};

	/**
	 * Detaches data filter label from current view
	 * @returns {void}
	 */
	Eplant.Views.InteractionView.FilterDialog.prototype.detachDataFilterLabel = function () {
		// Detach label
		$(this.filterLabelContainer).detach();
	};

	/**
	 * Removes active data filter label
	 * @returns {void}
	 */
	Eplant.Views.InteractionView.FilterDialog.prototype.removeDataFilterLabel = function () {
		// Remove label
		$('#Data-filtering-label').remove();
		// Set visibility status
		this.filterLabelVisible = false;
	};

	/**
	 * Updates correlation and confidence values from their spinners
	 * @returns {void}
	 */
	Eplant.Views.InteractionView.FilterDialog.prototype.updateValues = function () {
		// Get confidence
		var confidence = $(this.domConfidence).spinner('value');
		// Set confidence to 0 if below 0
		if (confidence < 0) {
			confidence = 0;
		}
		// Get correlation
		var correlation = $(this.domCorrelation).spinner('value');
		// Set correlation to values between -1 and 10px
		if (correlation < -1) {
			correlation = -1;
		}
		if (correlation > 1) {
			correlation = 1;
		}
		// Pass confidence and correlation to global attributes
		this.confidenceValue = confidence;
		this.correlationValue = correlation;
	};


	/**
	 * Applies filter to get edges matching selector
	 * @param {HTMLElement} checkbox The related checkbox element
	 * @param {Number} index The related filterStatus index
	 * @param {String} selector The selector by which to filter edges
	 * @return {boolean} The state of the related checkbox element
	 */
	Eplant.Views.InteractionView.FilterDialog.prototype.applyFilter = function (checkbox, index,
		selector) {
		// Get checkbox status
		var checkboxStatus = checkbox.prop('checked');

		// Show or hide edges based on checkbox status
		if (checkboxStatus) {
			// Generate collection of targetted edges
			var edges = this.filter.filterEdges(selector);
			edges.hide();
		}

		return checkboxStatus;
	};

	/**
	 * Hides the dialog.
	 * @returns {void}
	 */
	Eplant.Views.InteractionView.FilterDialog.prototype.hide = function () {
		// Hides dialog
		$(this.domContainer).dialog('close');
	};

	/**
	 * Removes the filter dialog
	 * @returns {void}
	 */
	Eplant.Views.InteractionView.FilterDialog.prototype.remove = function () {
		// Hide dialog
		$(this.domContainer).remove();
	};
}());
