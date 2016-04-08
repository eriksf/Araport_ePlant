(function() {

    /**
     * Eplant.BaseViews.EFPView class
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
    Eplant.Views.TestView = function(geneticElement) {
        // Get constructor
        var constructor = Eplant.Views.TestView;

        // Call parent constructor
        Eplant.View.call(this,
            constructor.viewName, // Name of the View visible to the user
            constructor.hierarchy, // Hierarchy of the View
            constructor.magnification, // Magnification level of the View
            constructor.description, // Description of the View visible to the user
            constructor.citation, // Citation template of the View
            constructor.activeIconImageURL, // URL for the active icon image
            constructor.availableIconImageURL, // URL for the available icon image
            constructor.unavailableIconImageURL // URL for the unavailable icon image
        );

        /* Attributes */
        this.isEntryView = true; // Identifies this View as the entry View for ePlant
        this.selectList = null; // SelectList that handles the selection UI
        this.isAnimating = false; // Whether an animation is taking place

        this.svgURL = "test/ArabidopsisMap-revised.svg";
        this.svgImage = document.createElement('img');
        this.svgImage.id = 'ArabidopsisMap';
        this.svgImage.src = this.svgURL;
        this.svgImage.title = "ArabidopsisMap";
        this.loadsvg(this.svgImage);


        this.efpURL = 'data/plant/' + geneticElement.species.scientificName.replace(" ", "_") + ".json";
        this.geneticElement = geneticElement;
        this.minColor = "#0000FF"; // Minimum color
        this.midColor = "#FFFF00"; // Middle color
        this.maxColor = "#FF0000"; // Maximum color
        this.maskColor = "#B4B4B4"; // Mask color
        this.errorColor = "#FFFFFF"; // Error color
        this.modeButton = null; // Mode ViewSpecificUIButton
        this.compareButton = null; // Compare ViewSpecificUIButton
        this.maskButton = null; // Mask ViewSpecificUIButton
        this.isMaskOn = false; // Whether masking is on
        this.maskThreshold = 1; // Masking threshold
        this.isRelativeEnabled = true; // Whether relative mode is enabled
        this.isCompareEnabled = true; // Whether compare mode is enabled
        this.isMaskEnabled = true; // Whether masking is enabled
        this.compareEFPView = null; // EFP view for comparing to
        this.mode = "absolute"; // EFP mode
        this.tooltipInfo = null; // Information for creating tooltip

        /* Apply configurations */
        /*if (configs) {
		if (configs.isRelativeEnabled !== undefined) {
			this.isRelativeEnabled = configs.isRelativeEnabled;
		}
		if (configs.isCompareEnabled !== undefined) {
			this.isCompareEnabled = configs.isCompareEnabled;
		}
		if (configs.isMaskEnabled !== undefined) {
			this.isMaskEnabled = configs.isMaskEnabled;
		}
	}*/

        /* Create view-specific UI buttons */
        /*this.createViewSpecificUIButtons();*/

        /* Load data */
        this.loadData();


        /* Create legend */
        this.legend = new Eplant.Views.TestView.Legend(this);

        /* Bind events */
        /*this.bindEvents();*/

    };
    ZUI.Util.inheritClass(Eplant.View, Eplant.Views.TestView); // Inherit parent prototype

    Eplant.Views.TestView.viewName = "Plant Viewer";
    Eplant.Views.TestView.hierarchy = "genetic element";
    Eplant.Views.TestView.magnification = -30;
    Eplant.Views.TestView.description = "Plant viewer";
    Eplant.Views.TestView.citation = "";
    Eplant.Views.TestView.activeIconImageURL = "app/img/active/plant.png";
    Eplant.Views.TestView.availableIconImageURL = "app/img/available/plant.png";
    Eplant.Views.TestView.unavailableIconImageURL = "app/img/unavailable/plant.png";




    /**
     * Active callback method.
     *
     * @override
     */
    Eplant.Views.TestView.prototype.active = function() {
        /* Call parent method */
        Eplant.View.prototype.active.call(this);
        /*$(ZUI.container).append(this.svgImage);*/
        $("#efp_container").append(this.svgdom);

        //$("#efp_container").append(this.svgImage);

        this.svgdom = document.getElementById('ArabidopsisMap');
        $("#ZUI_container").hide();
        $("#efp_container").show();

	if (this.legend.isVisible) {
		this.legend.attach();
	}

    };

    /**
     * Inactive callback method.
     *
     * @override
     */
    Eplant.Views.TestView.prototype.inactive = function() {
        /* Call parent method */
        Eplant.View.prototype.inactive.call(this);
        $(this.svgdom).detach();
        $("#ZUI_container").show();
        $("#efp_container").hide();
	if (this.legend.isVisible) {
		this.legend.detach();
	}
    };

    /**
     * Draws the View's frame.
     *
     * @Override
     */
    Eplant.Views.TestView.prototype.draw = function() {
        /* Call parent method */
        Eplant.View.prototype.draw.call(this);
    };

    /**
     * Cleans up the View for disposal
     *
     * @override
     */
    Eplant.Views.TestView.prototype.remove = function() {
        /* Call parent method */
        Eplant.View.prototype.remove.call(this);


    };

    /**
     * Returns the enter-out animation configuration.
     *
     * @override
     * @return {Object} The enter-out animation configuration.
     */
    Eplant.Views.TestView.prototype.getEnterOutAnimationConfig = function() {
        var config = Eplant.View.prototype.getEnterOutAnimationConfig.call(this);
        config.sourceX = ZUI.width / 6;
        config.data = {
            speciesView: this
        };
        config.begin = function(data) {
            data.speciesView.isAnimating = true;
        };
        config.end = function(data) {
            data.speciesView.isAnimating = false;
        };
        return config;
    };

    /**
     * Returns the exit-in animation configuration.
     *
     * @override
     * @return {Object} The exit-in animation configuration.
     */
    Eplant.Views.TestView.prototype.getExitInAnimationConfig = function() {
        var config = Eplant.View.prototype.getExitInAnimationConfig.call(this);
        config.targetX = ZUI.width / 6;
        config.data = {
            speciesView: this
        };
        config.begin = function(data) {
            data.speciesView.isAnimating = true;
        };
        config.end = function(data) {
            data.speciesView.isAnimating = false;
        };
        return config;
    };

    /**
     * Returns the enter-in animation configuration.
     *
     * @override
     * @return {Object} The enter-in animation configuration.
     */
    Eplant.Views.TestView.prototype.getEnterInAnimationConfig = function() {
        var config = Eplant.View.prototype.getEnterInAnimationConfig.call(this);
        config.sourceX = -ZUI.width / 6 / 500 * (10000 - 500);
        config.data = {
            speciesView: this
        };
        config.begin = function(data) {
            data.speciesView.isAnimating = true;
        };
        config.end = function(data) {
            data.speciesView.isAnimating = false;
        };
        return config;
    };



    Eplant.Views.TestView.prototype.loadsvg = function(svgimage) {
        var $img = jQuery(svgimage);
        var imgID = $img.attr('id');
        var imgClass = $img.attr('class');
        var imgURL = $img.attr('src');

        $.get(imgURL, $.proxy(function(data) {
            // Get the SVG tag, ignore the rest
            var $svg = $(data).find('svg');
            $("g", $svg).attr('stroke', "black");
	   /* $("g", $svg).attr('mouseover', '$("path",this).attr("stroke-width", "3");');
	    $("g", $svg).attr('mouseleave', '$("path",this).attr("stroke-width", "1");');*/

            $("g:not('#outlines')", $svg).on({
	    mouseover: function() {
                $("path",this).attr('stroke-width', "3");
            }, 
	    mouseleave: function() {
                // change to any color that was previously used.
                $("path",this).attr('stroke-width', "1");
            }
	    });

            // Add replaced image's ID to the new SVG
            if (typeof imgID !== 'undefined') {
                $svg = $svg.attr('id', imgID);
            }
            // Add replaced image's classes to the new SVG
	    $svg = $svg.attr('class', 'efp-view-svg');
            // Remove any invalid XML tags as per http://validator.w3.org
            $svg = $svg.removeAttr('xmlns:a');

            $svg = $svg.attr('width', '100%');
            $svg = $svg.attr('height', '100%');
            // Replace image with new SVG
            $img.replaceWith($svg);
	     $svg.draggable();
            this.svgdom = $svg;
        }, this), 'xml');

    };

    /**
     * Loads eFP definition and data.
     */
    Eplant.Views.TestView.prototype.loadData = function() {
        /* Get eFP definition */
        $.getJSON(this.efpURL, $.proxy(function(response) {

            /* Get web service URL */
            this.webService = response.webService;

            /* Prepare array for samples loading */
            var samples = [];

            /* Create labels */
            this.labels = response.labels;


            /* Create groups */
            this.groups = [];
            for (var n = 0; n < response.groups.length; n++) {
                /* Get group data */
                var groupData = response.groups[n];

                /* Asher: My solution is to have an if statement to read all control data for each group
			if (typeof groupData.control != 'undefined') {
				alert(groupData.control.id);
			}
			*/

                /* Create group object */
                var group = {
                    id: groupData.id.replace(" ", "_").replace(/^[^a-z]+|[^\w:.-]+/gi, ""),
                    samples: [],
                    ctrlSamples: [],
                    source: groupData.source,
                    color: Eplant.Color.White,
                    isHighlight: false,
                    tooltip: null,
                    fillColor: Eplant.Color.White
                };
                /* Prepare wrapper object for proxy */
                var wrapper = {
                    group: group,
                    eFPView: this
                };

                /* Prepare samples */
                for (var m = 0; m < groupData.samples.length; m++) {
                    var sample = {
                        name: groupData.samples[m],
                        value: null
                    };

                    /* Add it the samples array */
                    samples.push(sample);

                    /* Add to group samples */
                    group.samples.push(sample);
                }

                /* Asher: Prepare samples for controls if it exists in the group */
                if (groupData.ctrlSamples !== undefined) {
                    for (var m = 0; m < groupData.ctrlSamples.length; m++) {
                        var sample = {
                            name: groupData.ctrlSamples[m],
                            value: null
                        };

                        /* Add it the samples array */
                        samples.push(sample);
                        group.ctrlSamples.push(sample);
                    }
                }

                /* Append group to array */
                this.groups.push(group);
            }

            /* Get sample values */
            /* Get sample names */
            var sampleNames = [];
            for (var n = 0; n < samples.length; n++) {
                if ($.inArray(samples[n].name, sampleNames) === -1) {
                    sampleNames.push(samples[n].name);
                }
            }
            /* Prepare wrapper for proxy */
            var wrapper = {
                samples: samples,
                eFPView: this
            };
            /* Query */
            $.getJSON(this.webService + "id=" + this.geneticElement.identifier + "&samples=" + JSON.stringify(sampleNames), $.proxy(function(response) {
                /* Match results with samples and copy values to samples */
                for (var n = 0; n < this.samples.length; n++) {
                    for (var m = 0; m < response.length; m++) {
                        if (this.samples[n].name == response[m].name) {
                            this.samples[n].value = Number(response[m].value);
                            break;
                        }
                    }
                }

                /* Process values */
                this.eFPView.processValues();

                /* Finish loading */
                this.eFPView.loadFinish();

                /* Update eFP */
                this.eFPView.updateEFP();
            }, wrapper));
        }, this));
    };

    /**
     * Binds events.
     */
    Eplant.BaseViews.EFPView.prototype.bindEvents = function() {
        /* update-annotationTags */
        this.updateAnnotationTagsEventListener = new ZUI.EventListener("update-annotationTags", this.geneticElement, function(event, eventData, listenerData) {
            /* Get EFPView */
            var eFPView = listenerData.eFPView;

            /* Update tags */
            eFPView.updateTags();
        }, {
            eFPView: this
        });
    };

    /**
     * Calculates useful information from raw values.
     */
    Eplant.Views.TestView.prototype.processValues = function() {
        /* Processes raw values for a group */
        function processGroupValues(group) {
            var values = [];
            for (var n = 0; n < group.samples.length; n++) {
                var sample = group.samples[n];
                if (!isNaN(sample.value)) {
                    values.push(sample.value);
                }
            }
            group.mean = ZUI.Statistics.mean(values);
            group.n = values.length;
            group.stdev = ZUI.Statistics.stdev(values);
            group.sterror = ZUI.Statistics.sterror(values);

            if (group.ctrlSamples === undefined) {
                return;
            }

            /* Asher: Calculate the stats for group control */
            var values = [];
            for (var n = 0; n < group.ctrlSamples.length; n++) {
                var sample = group.ctrlSamples[n];
                if (!isNaN(sample.value)) {
                    values.push(sample.value);
                }
            }
            group.ctrlMean = ZUI.Statistics.mean(values);
            group.ctrln = values.length;
            group.ctrlStdev = ZUI.Statistics.stdev(values);
            group.ctrlSterror = ZUI.Statistics.sterror(values);
        }

        /* Groups */
        for (var n = 0; n < this.groups.length; n++) {
            var group = this.groups[n];
            processGroupValues(group);
        }
    };

    /**
     * Updates eFP.
     */
    Eplant.Views.TestView.prototype.updateEFP = function() {
        /* Return if data are not loaded */
        if (!this.isLoadedData) {
            return;
        }

        /* Update eFP */
        if (this.mode == "absolute") {
            /* Find maximum value */
            var max = this.groups[0].mean;
            for (var n = 1; n < this.groups.length; n++) {
                var group = this.groups[n];
                if (group.mean > max) {
                    max = group.mean;
                }
            }

            /* Color groups */
            var minColor = ZUI.Util.getColorComponents(this.midColor);
            var maxColor = ZUI.Util.getColorComponents(this.maxColor);
            for (var n = 0; n < this.groups.length; n++) {
                /* Get group */
                var group = this.groups[n];

                /* Get value ratio relative to maximum */
                var ratio = group.mean / max;

                /* Check whether ratio is invalid */
                if (isNaN(ratio) || !isFinite(ratio)) { // Invalid
                    group.color = this.errorColor;
                } else { // Valid
                    var red = minColor.red + Math.round((maxColor.red - minColor.red) * ratio);
                    var green = minColor.green + Math.round((maxColor.green - minColor.green) * ratio);
                    var blue = minColor.blue + Math.round((maxColor.blue - minColor.blue) * ratio);
                    group.color = ZUI.Util.makeColorString(red, green, blue);
                }

                /* Set color of ViewObject */
                $("#" + group.id, this.svgdom).attr('fill', group.color);
            }
        } else if (this.mode == "relative") {
            /* Find extremum log2 value */
            var extremum = Math.abs(ZUI.Math.log(this.groups[0].mean / this.groups[0].ctrlMean, 2));
            for (var n = 1; n < this.groups.length; n++) {
                var group = this.groups[n];
                var absLog2Value = Math.abs(ZUI.Math.log(group.mean / group.ctrlMean, 2));
                if (absLog2Value > extremum) {
                    if (isNaN(absLog2Value) || !isFinite(absLog2Value)) {} else {
                        extremum = absLog2Value;
                    }
                }
            }

            /* Color groups */
            var minColor = ZUI.Util.getColorComponents(this.minColor);
            var midColor = ZUI.Util.getColorComponents(this.midColor);
            var maxColor = ZUI.Util.getColorComponents(this.maxColor);
            for (var n = 0; n < this.groups.length; n++) {
                /* Get group */
                var group = this.groups[n];
                var log2Value = ZUI.Math.log(group.mean / group.ctrlMean, 2);

                /* Get log2 value ratio relative to extremum */
                var ratio = log2Value / extremum;

                /* Check whether ratio is invalid */
                if (isNaN(ratio) || !isFinite(ratio)) { // Invalid
                    group.color = this.errorColor;
                } else { // Valid
                    var color1, color2;
                    if (ratio < 0) {
                        color1 = midColor;
                        color2 = minColor;
                        ratio *= -1;
                    } else {
                        color1 = midColor;
                        color2 = maxColor;
                    }
                    var red = color1.red + Math.round((color2.red - color1.red) * ratio);
                    var green = color1.green + Math.round((color2.green - color1.green) * ratio);
                    var blue = color1.blue + Math.round((color2.blue - color1.blue) * ratio);
                    group.color = ZUI.Util.makeColorString(red, green, blue);
                }

                /* Set color of ViewObject */
                $("#" + group.id, this.svgdom).attr('fill', group.color);
            }
        } else if (this.mode == "compare") {
            /* Find extremum log2 value */
            var extremum = Math.abs(ZUI.Math.log(this.groups[0].mean / this.compareEFPView.groups[0].mean, 2));
            for (var n = 1; n < this.groups.length; n++) {
                var group = this.groups[n];
                var compareGroup = this.compareEFPView.groups[n];
                var absLog2Value = Math.abs(ZUI.Math.log(group.mean / compareGroup.mean, 2));
                if (absLog2Value > extremum) {
                    extremum = absLog2Value;
                }
            }

            /* Color groups */
            var minColor = ZUI.Util.getColorComponents(this.minColor);
            var midColor = ZUI.Util.getColorComponents(this.midColor);
            var maxColor = ZUI.Util.getColorComponents(this.maxColor);
            for (var n = 0; n < this.groups.length; n++) {
                /* Get group */
                var group = this.groups[n];
                var compareGroup = this.compareEFPView.groups[n];

                /* Get log2 value relative to control */
                var log2Value = ZUI.Math.log(group.mean / compareGroup.mean, 2);

                /* Get log2 value ratio relative to extremum */
                var ratio = log2Value / extremum;

                /* Check whether ratio is invalid */
                if (isNaN(ratio) || !isFinite(ratio)) { // Invalid
                    group.color = this.errorColor;
                } else { // Valid
                    var color1, color2;
                    if (ratio < 0) {
                        color1 = midColor;
                        color2 = minColor;
                        ratio *= -1;
                    } else {
                        color1 = midColor;
                        color2 = maxColor;
                    }
                    var red = color1.red + Math.round((color2.red - color1.red) * ratio);
                    var green = color1.green + Math.round((color2.green - color1.green) * ratio);
                    var blue = color1.blue + Math.round((color2.blue - color1.blue) * ratio);
                    group.color = ZUI.Util.makeColorString(red, green, blue);
                }

                /* Set color of ViewObject */
                $("#" + group.id, this.svgdom).attr('fill', group.color);
            }
        }

        /* Apply masking */
        if (this.isMaskOn) {
            for (var n = 0; n < this.groups.length; n++) {
                var group = this.groups[n];
                if (isNaN(group.sterror) || group.sterror >= group.mean * this.maskThreshold) {
                    group.color = this.maskColor;
                    $("#" + group.id, this.svgdom).attr('fill', group.color);
                }
            }
        }

        /* Update legend */
        this.legend.update();
    };

    
    Eplant.Views.TestView.prototype.zoomIn = function() {
	   var relativePercentage = ($(this.svgdom).width()/$(this.svgdom).parent('div').width())*100;
	   var leftPercentage = (parseInt($(this.svgdom).css('left').replace('auto','0'))/$(this.svgdom).parent('div').width())*100;
	   var topPercentage = (parseInt($(this.svgdom).css('top').replace('auto','0'))/$(this.svgdom).parent('div').height())*100;
	   $(this.svgdom).stop().animate({
			width:(relativePercentage+4)+"%",
			height:(relativePercentage+4)+"%",
			left:(leftPercentage-2)+"%",
			top:(topPercentage-2)+"%"
		}, 100);
	   return true;
    };

    Eplant.Views.TestView.prototype.zoomOut = function() {
		   var relativePercentage = ($(this.svgdom).width()/$(this.svgdom).parent('div').width())*100;
	   var leftPercentage = (parseInt($(this.svgdom).css('left').replace('auto','0'))/$(this.svgdom).parent('div').width())*100;
	   var topPercentage = (parseInt($(this.svgdom).css('top').replace('auto','0'))/$(this.svgdom).parent('div').height())*100;
	   $(this.svgdom).stop().animate({
			width:(relativePercentage-4)+"%",
			height:(relativePercentage-4)+"%",
			left:(leftPercentage+2)+"%",
			top:(topPercentage+2)+"%"
		}, 100);
	   return true;
    };


})();