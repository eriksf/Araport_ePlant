(function() {
	
    /**
		* Eplant.Views.ExpressionAnglerView class
		* Coded by Hans Yu
		* UI designed by Jamie Waese
		*
		* @constructor
		* @augments Eplant.View
		* @param {Eplant.GeneticElement} geneticElement The GeneticElement that this EFPView is associated with.
		* @param {String} efpURL The URL of the EFP definition file.
		* @param {Object} configs Configurations.
		* @param {Boolean} configs.isRelativeEnabled Whether relative mode is enabled.
		* @param {Boolean} configs.isCompareEnabled Whether compare mode is enabled.
		* @param {Boolean} configs.isMaskEnabled Whether masking is enabled.
	*/
    Eplant.Views.ExpressionAnglerView = function(geneticElement) {
		
		var constructor = Eplant.Views.ExpressionAnglerView;
		
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
		
		/* Attributes */
		this.loadSimilarGenesDialog = null; //Dialog of loading similiar genes
		this.xhrService = null;
		this.xhrLink = null;
		
        this.viewMode = "exp";
		this.activeView = null;
		this.relatedGenes = [];
		this.lowRvalueCutoff = 0.75;
		this.highRvalueCutoff = 1;
		
		this.viewGlobalConfigs = {
			
		};
        /* Apply configurations */
		
        /* Create view-specific UI buttons */
        this.createViewSpecificUIButtons();
		
        /* Load data */
        this.loadData();
		
		
        /* Create legend */
        this.legend = new Eplant.Views.ExpressionAnglerView.Legend(this);
		
		
		this.labelDom = document.createElement("div");
		$(this.labelDom).css({
			"position": "absolute",
			"z-index": 1,
			"left":10,
			"top":10,
			"font-size":'1.5em',
			"line-height":'1.5em'
		});
		if(this.name)
		{
			this.viewNameDom = document.createElement("span");
			this.viewNameDom.appendChild(document.createTextNode(this.name+'-'+this.geneticElement.identifier)); 
			$(this.viewNameDom).appendTo(this.labelDom);
		}
		
        /* Bind events */
        /*this.bindEvents();*/
		
	};
    ZUI.Util.inheritClass(Eplant.View, Eplant.Views.ExpressionAnglerView); // Inherit parent prototype
	
	
	Eplant.Views.ExpressionAnglerView.viewName = "Experiment Results and Tissue eFP¡¯s";
	Eplant.Views.ExpressionAnglerView.hierarchy = "genetic";
	Eplant.Views.ExpressionAnglerView.magnification = 35;
	Eplant.Views.ExpressionAnglerView.description = "Experiment viewer";
	Eplant.Views.ExpressionAnglerView.citation = "";
	Eplant.Views.ExpressionAnglerView.activeIconImageURL = "img/active/experiment.png";
	Eplant.Views.ExpressionAnglerView.availableIconImageURL = "img/available/experiment.png";
	Eplant.Views.ExpressionAnglerView.unavailableIconImageURL = "img/unavailable/experiment.png";
	Eplant.Views.ExpressionAnglerView.viewType = "exp";
	
    /**
		* Active callback method.
		*
		* @override
	*/
    Eplant.Views.ExpressionAnglerView.prototype.active = function() {
        /* Call parent method */
        Eplant.View.prototype.active.call(this);

		
	};
	
    /**
		* Inactive callback method.
		*
		* @override
	*/
    Eplant.Views.ExpressionAnglerView.prototype.inactive = function() {
        /* Call parent method */
        Eplant.View.prototype.inactive.call(this);

	};
	

	
	/**
		* Creates view-specific UI buttons.
	*/
	Eplant.Views.ExpressionAnglerView.prototype.createViewSpecificUIButtons = function() {
	
	};
	
	
    /**
		* Loads eFP definition and data.
	*/
    Eplant.Views.ExpressionAnglerView.prototype.loadData = function() {
		var dom = $('<div/>', {
		});
		dom.css({'text-align':'center'});
		var p = $('<div/>', {
			text: 'Loading genes similiar to '+this.identifier+', click cancel to stop loading.'
		});
		var propgressBar = $('<div/>', {
			'class': 'progressBar'
		});
		var propgressLabel = $('<div/>', {
			'class': 'progressLabel'
		});
		
		
		var cancelButton = $('<input/>', {
			type: 'button',
			value: "cancel",
			'class':'gene-cancel-button '
		});
		cancelButton.css({'margin-top':'10px'});
		cancelButton.on('click',$.proxy(function(){
			if(this.xhrLink) {
				this.xhrLink.abort();
				this.xhrLink = null;
			}
			if(this.xhrService) {
				this.xhrService.abort();
				this.xhrService = null;
			}
			if(this.loadSimilarGenesDialog) this.loadSimilarGenesDialog.close();
		},this));
		$(dom).append(p).append(propgressBar.append(propgressLabel)).append(cancelButton);
		this.loadSimilarGenesDialog = DialogManager.artDialogDynamic(dom[0], {
			init:function() {
				
				
			}
		});
		
		var $progressbar = $( ".progressbar",dom ),
		$progressLabel = $( ".progressLabel",dom );
		
		$progressbar.progressbar({
			value: false,
			change: function() {
				$progressLabel.text( $progressbar.progressbar( "value" ) + "%" );
			},
			complete: function() {
				$progressLabel.text( "Complete!" );
			}
		});
		
		function progress() {
			var val = $progressbar.progressbar( "value" ) || 0;
			
			$progressbar.progressbar( "value", val + 4 );
			
			if ( val < 99 ) {
				setTimeout( progress, 1000 );
			}
		}
		
		setTimeout( progress, 1000 );
		
		/* Clean up Views */
		this.xhrService = $.get( "http://bar.utoronto.ca/ntools/cgi-bin/ntools_expression_angler.cgi?default_db=AtGenExpress_Tissue_Plus_raw&match_count=10&agi_id="+this.identifier, $.proxy(function( data ) {
			var doc = $.parseHTML(data)
			var tempFileLink = $('b:contains("View list of agis as text")', doc)
			.parent().attr('href').replace('..','http://bar.utoronto.ca/ntools');
			this.xhrLink = $.get( tempFileLink,  $.proxy(function( list ) {
				var genesArray = list.split('\n').filter(function(el) {return el.length != 0});
				Eplant.queryIdentifier(genesArray);
				if(this.loadSimilarGenesDialog) this.loadSimilarGenesDialog.close();
			},this));
		},this))
		.always(function() {
			if(this.loadSimilarGenesDialog) this.loadSimilarGenesDialog.close();
		});
        $.getJSON( "data/expressionAngler/viewNames.json", function( data ) {
			eFPViews = data;
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
		});
	};
	
	Eplant.Views.ExpressionAnglerView.prototype.generateStandardSearchQuery = function () {
		var search = "";
		var URL = "http://bar.utoronto.ca/ntools/cgi-bin/ntools_expression_angler.cgi?";
		var agiID = "";
		var use_custom_bait = "";  
		var defaultDB = "&default_db="+this.activeView.database;
		var lowerRcutoff = "";
		var upperRcutoff = "";
		var match_count = "";
		var db = "+["+this.activeView.database+"_PID%3A14671301%5D";
		
		
		// either set agiID or set custom bait = yes
		if (geneticElement.identifier) {
			use_custom_bait = "&use_custom_bait=yes"
		}
		else {
			agiID = geneticElement.identifier;
		}
		
		// if Select an r-value cutoff range is selected, get them
		if (limitResults === "r-value") {
			lowerRcutoff = "&lower_r_cutoff="+($( "#r-value-slider-range" ).slider("values", 0)/100);
			upperRcutoff = "&upper_r_cutoff="+($( "#r-value-slider-range" ).slider("values", 1)/100);
		}
		
		// if Limit the results is selected, get the number
		if (limitResults === "topHits") {
			match_count = "&match_count="+$('input[name=matchGroup]:checked').val();
		}
		
		// start building the search
		search = URL+agiID+use_custom_bait+defaultDB+lowerRcutoff+upperRcutoff+match_count;
		
		// add the tissues
		for (var i=0; i<allTissues.length; i++){
			if (allTissues[i].view === allViews[activeView]) { // only include items for the active view
				var samples = allTissues[i].samples; 
				// cycle through array of samples
				for (var j=0; j<samples.length; j++) {
					var sample = "&expts="+samples[j]+db;
					// get the value for each tissue
					
					var value = allTissues[i].value;
					
					// if use custom bait mode is on, convert "null" values to 1
					if (use_custom_bait === "&use_custom_bait=yes" && value === "null") {
						value = 1;
					}
					
					// now prepend "&custom_bait=" to value
					value = "&custom_bait="+value;
					
                    // if value isn't null, add sample and value to search query
                    if (value != "&custom_bait=null") {
                        // add each sample name to the search query
                        search += sample;
                        // add value to the search query
                        search += value;
					}
				}
			}
		}    
		
		// postSearchQuery(search);
		return search;
	}
    /**
		* Binds events.
	*/
    Eplant.Views.ExpressionAnglerView.prototype.bindEvents = function() {
		
	};
	
	
	Eplant.Views.ExpressionAnglerView.prototype.zoomIn = function() {
		var relativePercentage = ($(this.svgdom).width() / $(this.svgdom).parent('div').width()) * 100;
		var leftPercentage = (parseInt($(this.svgdom).css('left').replace('auto', '0')) / $(this.svgdom).parent('div').width()) * 100;
		var topPercentage = (parseInt($(this.svgdom).css('top').replace('auto', '0')) / $(this.svgdom).parent('div').height()) * 100;
		$(this.svgdom).stop().animate({
            width: (relativePercentage + 4) + "%",
            height: (relativePercentage + 4) + "%",
            left: (leftPercentage - 2) + "%",
            top: (topPercentage - 2) + "%"
		}, 100);
		return true;
	};
	
	Eplant.Views.ExpressionAnglerView.prototype.zoomOut = function() {
		var relativePercentage = ($(this.svgdom).width() / $(this.svgdom).parent('div').width()) * 100;
		var leftPercentage = (parseInt($(this.svgdom).css('left').replace('auto', '0')) / $(this.svgdom).parent('div').width()) * 100;
		var topPercentage = (parseInt($(this.svgdom).css('top').replace('auto', '0')) / $(this.svgdom).parent('div').height()) * 100;
		$(this.svgdom).stop().animate({
            width: (relativePercentage - 4) + "%",
            height: (relativePercentage - 4) + "%",
            left: (leftPercentage + 2) + "%",
            top: (topPercentage + 2) + "%"
		}, 100);
		return true;
	};
	
	/**
		* Returns The exit-out animation configuration.
		*
		* @override
		* @return {Object} The exit-out animation configuration.
	*/
	Eplant.Views.ExpressionAnglerView.prototype.getExitOutAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitOutAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.svgdom).stop().animate({
				width: "0%",
				height: "0%",
				left: "50%",
				top: "50%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The enter-out animation configuration.
		*
		* @override
		* @return {Object} The enter-out animation configuration.
	*/
	Eplant.Views.ExpressionAnglerView.prototype.getEnterOutAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterOutAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			
			$(this.svgdom).css({
				width: "1000%",
				height: "1000%",
				left: "-450%",
				top: "-450%"
			});
            $(this.svgdom).stop().animate({
				width: "100%",
				height: "100%",
				left: "0%",
				top: "0%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The exit-in animation configuration.
		*
		* @override
		* @return {Object} The exit-in animation configuration.
	*/
	Eplant.Views.ExpressionAnglerView.prototype.getExitInAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitInAnimationConfig.call(this);
		config.begin = $.proxy(function() {
			$(this.svgdom).stop().animate({
				width: "1000%",
				height: "1000%",
				left: "-450%",
				top: "-450%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The enter-in animation configuration.
		*
		* @override
		* @return {Object} The enter-in animation configuration.
	*/
	Eplant.Views.ExpressionAnglerView.prototype.getEnterInAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterInAnimationConfig.call(this);
		config.begin = $.proxy(function() {
            $(this.svgdom).css({
				width: "0%",
				height: "0%",
				left: "50%",
				top: "50%"
			});
            $(this.svgdom).stop().animate({
				width: "100%",
				height: "100%",
				left: "0%",
				top: "0%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The exit-right animation configuration.
		*
		* @override
		* @return {Object} The exit-right animation configuration.
	*/
	Eplant.Views.ExpressionAnglerView.prototype.getExitRightAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitRightAnimationConfig.call(this);
		config.begin = $.proxy(function() {
            $(this.svgdom).stop().animate({
				width: "0%",
				height: "0%",
				left: "150%",
				top: "50%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The enter-right animation configuration.
		*
		* @override
		* @return {Object} The enter-right animation configuration.
	*/
	Eplant.Views.ExpressionAnglerView.prototype.getEnterRightAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterRightAnimationConfig.call(this);
		config.begin = $.proxy(function() {
            $(this.svgdom).css({
				width: "0%",
				height: "0%",
				left: "50%",
				top: "50%"
			});
            $(this.svgdom).stop().animate({
				width: "100%",
				height: "100%",
				left: "0%",
				top: "0%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The exit-left animation configuration.
		*
		* @override
		* @return {Object} The exit-left animation configuration.
	*/
	Eplant.Views.ExpressionAnglerView.prototype.getExitLeftAnimationConfig = function() {
		var config = Eplant.View.prototype.getExitLeftAnimationConfig.call(this);
		config.begin = $.proxy(function() {
            $(this.svgdom).stop().animate({
				width: "0%",
				height: "0%",
				left: "-50%",
				top: "50%"
			}, 1000);
		}, this);
		return config;
	};
	
	/**
		* Returns The enter-left animation configuration.
		*
		* @override
		* @return {Object} The enter-left animation configuration.
	*/
	Eplant.Views.ExpressionAnglerView.prototype.getEnterLeftAnimationConfig = function() {
		var config = Eplant.View.prototype.getEnterLeftAnimationConfig.call(this);
		config.begin = $.proxy(function() {
            $(this.svgdom).css({
				width: "0%",
				height: "0%",
				left: "50%",
				top: "50%"
			});
            $(this.svgdom).stop().animate({
				width: "100%",
				height: "100%",
				left: "0%",
				top: "0%"
			}, 1000);
		}, this);
		return config;
	};
	
	
	
})();			
