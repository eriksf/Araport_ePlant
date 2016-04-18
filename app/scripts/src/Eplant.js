(function() {
	
    /**
		* Eplant namespace
		* By Hans Yu
		*
		* This namespace is for the ePlant core.
		*
		* @namespace
	*/
    Eplant = {};
	
    /* Constants */
    Eplant.ServiceUrl = 'https://api.araport.org/community/v0.3/asher-dev/eplant_service_v0.3/access/'; // Base services url
	
    /* Attributes */
    Eplant.species = []; // Array of Species objects
    Eplant.activeSpecies = null; // Species that is under active study
    Eplant.views = null; // Object container for Views associated with ePlant
    Eplant.isLoadedViews = false; // Whether Views are loaded
    Eplant.isLoadedSpecies = false; // Whether Species are loaded
    Eplant.isAnimateActiveViewChange = true; // Whether activeView changes are animated
	Eplant.showViewIntruction = true; // Whether activeView changes are animated
	
    Eplant.viewSpecificUIButtonsContainer = null; // DOM container for ViewSpecificUIButtons
    Eplant.isTooltipOn = true; // Whether tooltips are enabled
    Eplant.history = null; // Keeps track of history
    Eplant.activeView = null; // Active view
    Eplant.activeViews = {}; // Active views
    Eplant.activeTabId = null; // Active Tab
	Eplant.viewLoadTimeout = null; // time out for loading active view
	Eplant.viewLoadTick = 0 ;
    Eplant.identifierQuery = []; // Identifier array
    Eplant.zoomTimeout = null; // Zooming process timeout 
    /* icon dock related */
    Eplant.iconList = []; // View Icon List
    Eplant.iconIndex = 0; // Index used for carousel
    Eplant.visibleIcons = 0; // Number of visible icons in the carousel
    Eplant.loadingGeneList = []; // Genes still loading
    Eplant.loadingDialog = null; // Genes still loading
    /* RSVP related */
    Eplant.RSVPOn = false; // Is RSVP mode on or not
	Eplant.RSVPOnMode = 1; // hover mode
	Eplant.geneticElementPanelMapOn = false; // Is RSVP mode on or not
    Eplant.RSVPSpeed = 100; // RSVP transition time interval, .5 seconds by default
    Eplant.RSVPTimeout = null; // RSVP Timeout storing variable
    Eplant.DialogTimeout = null; // Loading dialog Timeout storing variable
    Eplant.geneLoadingTimeout = null; //Gene panel loading Timeout storing variable
	Eplant.sidebarOpen = true;
    Eplant.globalViewConfigs = {}; //global configs for each view
    Eplant.expressionAnglerDbMap = [];
	Eplant.minColor = "#0000FF"; // Minimum color
	Eplant.midColor = "#FFFF00"; // Middle color
	Eplant.maxColor = "#FF0000"; // Maximum color
	Eplant.viewInstructions={};
    /**
		* Initializes ePlant
	*/
    Eplant.initialize = function() {
        /* Initialize ZUI */
        ZUI.initialize({
            canvas: document.getElementById("ZUI_canvas"),
            background: "#ffffff",
            backgroundAlpha: 0,
            frameRate: 45,
            cameraMoveRate: 0.25,
            width: width,
            height: height
		});
		
		Eplant.EFPViewsCount = 0;
		Eplant.geneticElementViewsCount = 0;
        /* Initialize View modules */
        for (var ViewName in Eplant.Views) {
            /* Get View constructor */
            var View = Eplant.Views[ViewName];
			if(View.isEFPView) Eplant.EFPViewsCount++;
			if(View.hierarchy ==="genetic element")Eplant.geneticElementViewsCount++;
            /* Initialize */
            if (View.initialize) {
                View.initialize();
			}
			
            
		}
		Eplant.eachEFPViewAsPercent = 1/Eplant.EFPViewsCount;
		Eplant.eachGeneticViewAsPercent = 1/Eplant.geneticElementViewsCount;
		
		
		
        /* Sort Views by magnification (ascending) */
        var sortedViewNames = [];
        for (var ViewName in Eplant.Views) {
            sortedViewNames.push(ViewName);
		}
        sortedViewNames.sort(function(a, b) {
            return (Eplant.Views[a].magnification - Eplant.Views[b].magnification);
		});
        /* Add View icons to the dock */
        var lastMagnification = Eplant.Views[sortedViewNames[0]].magnification;
        for (var n = 0; n < sortedViewNames.length; n++) {
            /* Get View constructor */
            var ViewName = sortedViewNames[n];
            /* Skip the Species View in the Dock. Can't change species if we selected a species */
            if (ViewName === "SpeciesView") {
                continue;
			}
			
            var View = Eplant.Views[sortedViewNames[n]];
			
            /* Skip eFP experimental views */
            if (View.magnification === 35) {
                continue;
			}
			
            /* Append line break if magnification level is higher 
				if (Math.floor(View.magnification) > Math.floor(lastMagnification)) {
				var br = document.createElement("br");
				$("#navigationContainer").append(br);
			}*/
            lastMagnification = View.magnification;
			
            /* Create and append icon */
            var icon = document.createElement("div");
            icon.id = ViewName + "Icon";
            icon.className = "icon hint--right hint--success hint-rounded";
            icon.setAttribute("data-hint", View.description);
			icon.setAttribute("title", View.description); 
            icon.setAttribute("data-enabled", "true");
            /*if(ViewName=="ExperimentView")
				{
				icon.setAttribute("data-dropdown", "#dropdown-experiment");
			}*/
            icon.onclick = function() {
				
                /* Get icon id */
                var id = this.id;
				
                /* Get View name */
                var ViewName = id.substring(0, id.length - 4);
				
                /* Get View */
                var view = null;
                if (Eplant.Views[ViewName].hierarchy == "ePlant") {
                    view = Eplant.views[ViewName];
					} else if (Eplant.Views[ViewName].hierarchy == "species") {
                    view = Eplant.activeSpecies.views[ViewName];
					} else if (Eplant.Views[ViewName].hierarchy == "genetic element") {
                    view = Eplant.activeSpecies.activeGeneticElement.views[ViewName];
				}
				
                /* Set View to activeView */
                if (view && view.isLoadedData) {
					if(ViewName=="ExperimentView")
					{
						Eplant.changeActiveView(Eplant.activeSpecies.activeGeneticElement.views['TissueSpecificEmbryoDevelopmentView']);
						
					}
					else if(ViewName=="LinkoutView")
					{
						view.show();
					}
					else
					{
						Eplant.changeActiveView(view);
					}
				}
			};
            var img = document.createElement("img");
            img.src = View.unavailableIconImageURL;
            $(icon).append(img);
            $("#navigationContainer").append(icon);
            Eplant.iconList.push("#" + icon.id);
		}
		
        /* Get ViewSpecificUIButtons container */
        Eplant.viewSpecificUIButtonsContainer = document.getElementById("viewSpecificUI");
		
        // Initialize history tracker
        this.history = new Eplant.History();
		
        /* Load Views */
        Eplant.loadViews();
		
		
		
        /* Bind Events */
        Eplant.bindUIEvents();
        Eplant.bindEvents();
		
        /* Find and set the entry View 
			for (var ViewName in Eplant.views) {
			var view = Eplant.views[ViewName];
			if (view.isEntryView) {		// Found
			//Set active view 
			ZUI.changeActiveView(view);
			
			//End search 
			break;
			}
			}
		*/
		/* Change to HomeView */
		Eplant.experimentSelectList = new Eplant.ExperimentSelectList();
		Eplant.changeActiveView(Eplant.views["HomeView"],'tabs-1');
		$(".hiddenInSpeciesView").css("visibility", "visible");
		$(".hiddenInSpeciesView").css("opacity", "1");
		
        Eplant.resizeIconDock();
        Eplant.updateIconDock();
		Eplant.resize();
		Eplant.loadUrlData();
		Eplant.getExpressionAnglerDbMap();
		TabManager.initialize();
		
	};
	
	Eplant.getExpressionAnglerDbMap = function() {
		$.getJSON( "app/data/expressionAngler/viewsMap.json", function( data ) {
			Eplant.expressionAnglerDbMap= data;
		});
	}
	
	Eplant.getUrlParameter = function(name) {
		return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
	}
	
	Eplant.loadUrlData = function() {
		var ActiveSpeciesToLoaded = Eplant.getUrlParameter('ActiveSpecies');
		var GeneListString = Eplant.getUrlParameter('Genes'), GeneListToLoaded;
		if(GeneListString)
		{
			var GeneListToLoaded = GeneListString.split(',');
		}
		if(ActiveSpeciesToLoaded)
		{
			
			ZUI.removeEventListener(new ZUI.EventListener("load-species"));
			var eventListener = new ZUI.EventListener("load-species", null, function(event, eventData, listenerData) {
				Eplant.setActiveSpecies(Eplant.getSpeciesByScientificName(ActiveSpeciesToLoaded));
				Eplant.queryIdentifier(GeneListToLoaded);
				ZUI.removeEventListener(new ZUI.EventListener("load-species"));
				var eventListener = new ZUI.EventListener("load-species", null, function(event, eventData, listenerData) {
					Eplant.setActiveSpecies(Eplant.species[0]);
				}, {});
				ZUI.addEventListener(eventListener);
			}, {});
			ZUI.addEventListener(eventListener);
		}
		var ActiveGene = Eplant.getUrlParameter('ActiveGene');
		var ActiveView = Eplant.getUrlParameter('ActiveView');
		if(ActiveGene)
		{
			ZUI.removeEventListener(new ZUI.EventListener("genes-all-loaded"));
			eventListener = new ZUI.EventListener("genes-all-loaded", null, function(event, eventData, listenerData) {
				var geneticElement = Eplant.activeSpecies.getGeneticElementByIdentifier(ActiveGene);
				if(geneticElement)
				{
					Eplant.activeSpecies.setActiveGeneticElement(geneticElement);
				}
				if(ActiveView)
				{
					Eplant.searchForActiveView(ActiveView);
				}
				ZUI.removeEventListener(new ZUI.EventListener("genes-all-loaded"));
				eventListener = new ZUI.EventListener("genes-all-loaded", null, function(event, eventData, listenerData) {
					if(Eplant.activeView.magnification === 0){
						Eplant.searchForActiveView('HeatMapView');
					}
				}, {});
				ZUI.addEventListener(eventListener);
			}, {});
			ZUI.addEventListener(eventListener);
		}
		
		
		
		
	}
	
	
	/**
		* Searches the active View of ePlant.
		*
		* @param {Eplant.View} activeView The new activeView.
	*/
    Eplant.searchForActiveView = function(viewName) {
		if(Eplant.viewLoadTick >= 10)
		{
			DialogManager.artDialogDynamic('Active view cannot be loaded, going back to welcome screen...',{width:'600px'});
			Eplant.changeActiveView(Eplant.views["HomeView"],'tabs-1');
			Eplant.viewLoadTick = 0;
		}
		else
		{
			var view = null;
			
			var View = Eplant.Views[viewName];
			/* Get the active view instance */
			
			if (View.hierarchy == "ePlant") 
			{
				view = Eplant.views[viewName];
			} 
			else if (View.hierarchy == "species") 
			{
				if (Eplant.activeSpecies) {
					view = Eplant.activeSpecies.views[viewName];
				}
			} 
			else if (View.hierarchy == "genetic element") 
			{
				if (Eplant.activeSpecies && Eplant.activeSpecies.activeGeneticElement) 
				{
					view = Eplant.activeSpecies.activeGeneticElement.views[viewName];
				} 
			}
			
			if(view)
			{
				if(view.isLoadedData)
				{
					Eplant.changeActiveView(view);
					clearTimeout(Eplant.viewLoadTimeout);
				}
				else {
					Eplant.viewLoadTimeout = setTimeout(function() 
					{
						Eplant.viewLoadTick += 1;
						Eplant.searchForActiveView(viewName);
					}, 500);
				}
			}
		}
	};
	
	
	/* Show citation via popup */
	Eplant.showCitation = function() {
		var containerElement = document.createElement("div");
		$(containerElement).enableSelection();
		containerElement.style.textAlign = "left";
		containerElement.innerHTML = "Loading citation...";
		var dialog = art.dialog({
			content: containerElement,
			title: "Citation",
			width: 600,
			minHeight: 0,
			resizable: false,
			draggable: false,
			lock: true,
			position: [document.width / 2, 150],
			buttons: [{
				text: "Close",
				click: $.proxy(function(event, ui) {
					$(this).dialog("close");
				}, containerElement)
			}],
			close: $.proxy(function() {
				$(this).remove();
			}, containerElement)
			
		})
		
		var obj = {
			dialog: dialog,
		};
		$.ajax({
			beforeSend: function(request) {
				request.setRequestHeader('Authorization', 'Bearer ' + Agave.token.accessToken);
			},
			type: "GET",
			async: false,
			cache: false,
			url: Eplant.ServiceUrl + "citation.cgi?view=" + ZUI.activeView.name,
			dataType: "json"
			}).done($.proxy(function(response) {
			var content = '';
			
			if(response.source) content+="<br><br>" + response.source;
			if(response.notes) content+="<br><br>" + response.notes;
			if(response.URL) content+="<br><br>" + response.URL;
			if(content.length>0) content = content.substring(8);
			content += "<br><br>This image was  generated with the ePlant <i>" + Eplant.activeSpecies.scientificName + "</i> " + response.view + "  at bar.utoronto.ca by Waese, Fan, Yu, Pasha & Provart 2015.";
			content='<p style="font-size:24px">Citation information for this view</p><br>'+content;
			obj.dialog.content(content);
			}, obj)).fail($.proxy(function(response) {
			obj.dialog.content('No citation information available for this view.');
		}, obj));
	};
	Eplant.expressionAnglerClick = function() {
		DialogManager.artDialogUrl('app/ExpressionAngler',{
			close: function () {
				var expressionAnglerUrl = art.dialog.data('expressionAnglerUrl');
				var expressionAnglerMainIdentifier = art.dialog.data('expressionAnglerMain');
				var expressionAnglerCount = art.dialog.data('expressionAnglerCount');
				if (expressionAnglerUrl !== undefined) Eplant.ExpressionAngler(expressionAnglerUrl,expressionAnglerMainIdentifier,expressionAnglerCount);
				art.dialog.removeData('expressionAnglerUrl');
				art.dialog.removeData('expressionAnglerMain');
				art.dialog.removeData('expressionAnglerCount');
			},
			width:"95%"
		});
	};
	/**
		* Bind events for ePlant DOM UI elements.
	*/
	Eplant.bindUIEvents = function() {
		$("#genePanel_container").mCustomScrollbar({
			theme:"dark",
			callbacks:{
				onOverflowY: function(){
				$('#bottom_fade').show();},
				onOverflowYNone: function(){
					$('#top_fade').hide();
				$('#bottom_fade').hide();},
				onScrollStart: function(){
					$('#top_fade').show();
				$('#bottom_fade').show();},
				onTotalScrollBack: function(){$('#top_fade').hide();},
				onTotalScroll: function(){$('#bottom_fade').hide();}
			}
			
		});
		/* Genetic element identifier auto-complete */
		$("#enterIdentifier").autocomplete({
			source: function(request, response) {
				var last = request.term.split(/,\s*/).pop();
				$.ajax({
					beforeSend: function(request) {
						request.setRequestHeader('Authorization', 'Bearer ' + Agave.token.accessToken);
					},
					type: "GET",
					async: false,
					cache: false,
					url: Eplant.ServiceUrl +  "idautocomplete.cgi?species=" + Eplant.activeSpecies.scientificName.split(" ").join("_") + "&term=" + last,
					dataType: "json"
					}).done(function(data) {
					response(data);
				});
			},
			minLength: 0,
			focus: function() {
				// prevent value inserted on focus
				return false;
			},
			select: function(event, ui) {
				var terms = this.value.split(/,\s*/);
				// remove the current input
				terms.pop();
				// add the selected item
				terms.push(ui.item.value);
				// add placeholder to get the comma-and-space at the end
				terms.push("");
				this.value = terms.join(", ");
				return false;
			}
		})
		.on('input', function() {
			if (this.value.slice(-1) == ',') {
				$("#enterIdentifier").autocomplete("close");
			}
		});;
		
		/* Query genetic element identifier */
		$("#queryIdentifier").click(function() {
			
			Eplant.queryIdentifier();
		});
		$("#enterIdentifier").keyup(function(event) {
			if (event.keyCode == "13") {
				Eplant.queryIdentifier();
			}
		});
		$("#enterIdentifier").clearSearch();
		
		/* Example genetic element identifier query */
		$("#getExample").click(function() {
			$("#enterIdentifier").val(Eplant.activeSpecies.exampleQuery);
			Eplant.queryIdentifier();
		});
		
		/* Save session button */
		$("#saveSession").click(function() {
			// TODO
		});
		
		/* Load session button */
		$("#loadSession").click(function() {
			// TODO
		});
		
		/* Zoom in button */
		
		
		
		$("#zoomIn").mousedown(function() {
			
			Eplant.zoomTimeout = setInterval(function() {
				if (Eplant.activeView.zoomIn) {
					Eplant.activeView.zoomIn();
					
				}
			}, 200);
			
			return false;
		});
		
		
		$("#zoomIn").mouseup(function() {
			clearInterval(Eplant.zoomTimeout);
			return false;
		});
		
		$('#zoomIn').mouseout(function() {
			clearInterval(Eplant.zoomTimeout);
			return false;
		});
		
		
		/* Zoom out button */
		
		
		$("#zoomOut").mousedown(function(event) {
			Eplant.zoomTimeout = setInterval(function() {
				if (Eplant.activeView.zoomOut) {
					Eplant.activeView.zoomOut();
					
				}
			}, 200);
			
			return false;
		});
		
		
		
		$("#zoomOut").mouseup(function(event) {
			clearInterval(Eplant.zoomTimeout);
			return false;
		});
		$('#zoomOut').mouseout(function() {
			clearInterval(Eplant.zoomTimeout);
			return false;
		});
		
		
		// History dialog button
		$("#historyIcon").click(function() {
			var historyDialog = new Eplant.HistoryDialog();
		});
		
		// History back button
		$("#historyBackIcon").click(function() {
			// Go back if possible
			if (Eplant.history.isBackPossible()) {
				Eplant.history.goBack();
			}
		});
		
		// History forward button
		$("#historyForwardIcon").click(function() {
			// Go forward if possible
			if (Eplant.history.isForwardPossible()) {
				Eplant.history.goForward();
			}
		});
		
		// show url link with current eplant state
		$("#showUrl").click(function() {
			var hasQueryString = false;
			var geneIdentifiers;
			var activeSpeciesName = Eplant.activeSpecies.scientificName;
			var url = [location.protocol, '//', location.host, location.pathname].join('');
			if(Eplant.activeSpecies) 
			{
				url += hasQueryString ? '&' : '?';
				url += 'ActiveSpecies=' + Eplant.activeSpecies.scientificName;
				hasQueryString=true;
				
				geneIdentifiers = $.map(Eplant.activeSpecies.displayGeneticElements,function(value, index) {
					return value.identifier;
				}).join(',')
			}
			if(geneIdentifiers && geneIdentifiers !== '') 
			{
				url += hasQueryString ? '&' : '?';
				url+= 'Genes='  + geneIdentifiers;
				hasQueryString=true;
			}
			if(Eplant.activeSpecies.activeGeneticElement) 
			{
				url += hasQueryString ? '&' : '?';
				url+= 'ActiveGene='  + Eplant.activeSpecies.activeGeneticElement.identifier;
				hasQueryString=true;
			}
			if(Eplant.activeView) 
			{
				
				url += hasQueryString ? '&' : '?';
				url+= 'ActiveView='  + Eplant.getViewName(Eplant.activeView);
				hasQueryString=true;
			}
			DialogManager.artDialogDynamic('<div>Use this URL to automatically reload this session.</div><textarea rows="4" cols="50" style="margin:15px 0">'+url+'</textarea><button id="CopyToClipboard" class="greenButton" data-clipboard-text="'+url+'" title="Click to copy me.">Copy to Clipboard</button>',{
				init:function(){
					var client = new ZeroClipboard( document.getElementById("CopyToClipboard") );
					
					client.on( "ready", function( readyEvent ) {
						// alert( "ZeroClipboard SWF is ready!" );
						
						client.on( "aftercopy", function( event ) {
							// `this` === `client`
							// `event.target` === the element that was clicked
							alert("Copied text to clipboard: " + event.data["text/plain"] );
						} );
					} );
				},
				width:'600px'
			})
		});
		
		/* Toggle view change animation button */
		$("#viewChangeAnimationIcon").click(function() {
			Eplant.isAnimateActiveViewChange = !Eplant.isAnimateActiveViewChange;
			if (Eplant.isAnimateActiveViewChange) {
				$("#viewChangeAnimationIcon img").attr("src", "app/img/on/zoom.png");
				$("#viewChangeAnimationIcon span").html("Zoom transitions on");
				} else {
				$("#viewChangeAnimationIcon img").attr("src", "app/img/off/zoom.png");
				$("#viewChangeAnimationIcon span").html("Zoom transitions off");
			}
		});
		
		$("#viewIntructionIcon").click(function() {
			Eplant.showViewIntruction = !Eplant.showViewIntruction;
			if (Eplant.showViewIntruction) {
				$("#viewIntructionIcon img").attr("src", "app/img/on/fyi.png");
				$("#viewIntructionIcon span").html("New user popups on");
				} else {
				$("#viewIntructionIcon img").attr("src", "app/img/off/fyi.png");
				$("#viewIntructionIcon span").html("New user popups off");
			}
		});
		
		
		
		/* Toggle tooltip button */
		$("#tooltipIcon").click(function() {
			Eplant.isTooltipOn = !Eplant.isTooltipOn;
			var domElements = document.getElementsByClassName("hint--rounded");
			if (Eplant.isTooltipOn) {
				for (var n = 0; n < domElements.length; n++) {
					var domElement = domElements[n];
					$(domElement).attr("data-enabled", "true");
				}
				$("#tooltipIcon img").attr("src", "app/img/on/tooltip.png");
				$("#tooltipIcon span").html("Tooltips on");
				$( '.hint--right' ).tooltip( "option", "disabled", false );
				$( '.hint--left' ).tooltip( "option", "disabled", false );
				$( '.hint--bottom' ).tooltip( "option", "disabled", false );
				$( '.hint--top' ).tooltip( "option", "disabled", false );
			} 
			else {
				for (var n = 0; n < domElements.length; n++) {
					var domElement = domElements[n];
					$(domElement).attr("data-enabled", "false");
				}
				$("#tooltipIcon img").attr("src", "app/img/off/tooltip.png");
				$("#tooltipIcon span").html("Tooltips off");
				$( '.hint--right' ).tooltip( "option", "disabled", true );
				$( '.hint--left' ).tooltip( "option", "disabled", true );
				$( '.hint--bottom' ).tooltip( "option", "disabled", true );
				$( '.hint--top' ).tooltip( "option", "disabled", true );
			}
		});
		
		/* Get image button */
		$("#getImageIcon").click(function() {
			//var dataURL = ZUI.activeView.getViewScreen();
			Eplant.screenShotForCurrent();
		});
		
		/* Get image button */
		$("#palleteIcon").click(function() {
			var paletteDialog = new Eplant.PaletteDialog();
		});
		
		/* Get Citation button */
		$("#citationIcon").click(function() {
			if(Eplant.activeView.showCitation){
				Eplant.activeView.showCitation()
				}else{
				Eplant.showCitation();
			}
			
		});
		
		
		/* Remove dialogs button 
			$("#removeDialogsIcon").click(function() {
			for (var n = 0; n < Eplant.species.length; n++) {
			var species = Eplant.species[n];
			for (var m = 0; m < species.geneticElements.length; m++) {
			var geneticElement = species.geneticElements[m];
			if (geneticElement.geneticElementDialog) {
			geneticElement.geneticElementDialog.remove();
			geneticElement.geneticElementDialog = null;
			}
			}
			}
		});*/
		//resize icondock when up or down arrow is clicked
		$("#iconTopArrow").click(function() {
			Eplant.iconIndex--;
			Eplant.resizeIconDock($('#left').height());
		});
		$("#iconBottomArrow").click(function() {
			Eplant.iconIndex++;
			Eplant.resizeIconDock($('#left').height());
		});
		$("#iconBottomArrow").click(function() {
			Eplant.iconIndex++;
			Eplant.resizeIconDock($('#left').height());
		});
		$("#dropdown-rsvp li").click(function() {
			var radio = $('input[type="radio"]',this);
			
			$(this).closest('#dropdown-rsvp').find('input[type="radio"]').removeProp('checked');
			radio.prop('checked','checked');
			if (Eplant.RSVPOn) {
				if(Eplant.RSVPOnMode===1){
					$( "body" ).undelegate( '.eplant-geneticElementPanel-item', "mouseover");
				}
				else{
					clearTimeout(Eplant.RSVPTimeout);
				}
			}
			Eplant.RSVPOnMode = parseInt(radio.val());
			if (Eplant.RSVPOn) {
				if(Eplant.RSVPOnMode===2){
					Eplant.RSVPSpeed = 100;
				}
				else if(Eplant.RSVPOnMode===3){
					Eplant.RSVPSpeed = 200;
				}
				else if(Eplant.RSVPOnMode===4){
					Eplant.RSVPSpeed = 300;
				}
				if(Eplant.RSVPOnMode===1){
					$( "body" ).delegate( '.eplant-geneticElementPanel-item', "mouseover",$.proxy(function(e){
						var geneticElement = Eplant.activeSpecies.displayGeneticElements[$(e.currentTarget).index()];
						geneticElement.species.setActiveGeneticElement(geneticElement);
					},this));
				}
				else {
					Eplant.RSVPMode(0);	
				}
			}
			
		});
		
		$("#RSVPIcon").click(function() {
			if (Eplant.RSVPOn) {
				$("#RSVPIcon").css("color", "#989898");
				Eplant.RSVPOn = false;
				//$("#RSVPSpeed").slider( "disable" );
				
				
				$('#viewPort').css({'pointer-events' : 'auto'});
				
				if(Eplant.RSVPOnMode===1){
					$( "body" ).undelegate( '.eplant-geneticElementPanel-item', "mouseover");
				}
				else{
					clearTimeout(Eplant.RSVPTimeout);
				}
			} 
			else {
				$("#RSVPIcon").css("color", "#000");
				Eplant.RSVPOn = true;
				//$("#RSVPSpeed").slider( "enable" );
				
				
				$('#viewPort').css({'pointer-events' : 'none'});
				
				if(Eplant.RSVPOnMode===2){
					Eplant.RSVPSpeed = 100;
				}
				else if(Eplant.RSVPOnMode===3){
					Eplant.RSVPSpeed = 200;
				}
				else if(Eplant.RSVPOnMode===4){
					Eplant.RSVPSpeed = 300;
				}
				if(Eplant.RSVPOnMode===1){
					$( "body" ).delegate( '.eplant-geneticElementPanel-item', "mouseover",$.proxy(function(e){
						var geneticElement = Eplant.activeSpecies.displayGeneticElements[$(e.currentTarget).index()];
						geneticElement.species.setActiveGeneticElement(geneticElement);
					},this));
				}
				else {
					Eplant.RSVPMode(0);	
				}
				
			}
			});/*
			$("#RSVPSpeed").slider({
			orientation: "horizontal",
			range: "min",
			//disabled: true,
			min: 100,
			max: 1000,
			value: Eplant.RSVPSpeed,
			slide: $.proxy(function(event, ui) {
			Eplant.RSVPSpeed = ui.value;
			$("#RSVPSpeed").attr('data-hint', "RSVP Mode Transition Time, Current: "+Eplant.RSVPSpeed+"ms")
			},this)
		});*/
		$("#lowhighIcon").click(function() {
			Eplant.activeSpecies.displayGeneticElements.sort(function(a, b){return a.maxExpressionLevel-b.maxExpressionLevel});
			Eplant.updateGeneticElementPanel();
			Eplant.activeSpecies.views['HeatMapView'].refreshHeatMap();
		});
		$("#highlowIcon").click(function() {
			Eplant.activeSpecies.displayGeneticElements.sort(function(a, b){return b.maxExpressionLevel-a.maxExpressionLevel});
			Eplant.updateGeneticElementPanel();
			Eplant.activeSpecies.views['HeatMapView'].refreshHeatMap();
		});
		$("#heatmapModeIcon").click(function() {
			
			Eplant.geneticElementPanelMapOn = !Eplant.geneticElementPanelMapOn;
			if(Eplant.geneticElementPanelMapOn){
				$("#heatmapModeIcon img").attr("src", "app/img/on/heatMapMode.png");	
				}else{
				$("#heatmapModeIcon img").attr("src", "app/img/off/heatMapMode.png");
			}
			Eplant.updateGeneticElementPanel();
		});
		
		
		/* about page dialog click */
		$("#getAbout").on('click', function () {
			DialogManager.artDialogUrl('app/pages/about.html');
		});
		/* help page dialog click */
		$("#getHelp").on('click', function () {
			DialogManager.artDialogUrl('app/pages/help.html');
		});
		/* contact page dialog click */
		$("#getComments").on('click', function () {
			DialogManager.artDialogUrl('app/pages/comments.html');
		});
		$("#expressionAnglerButton").on('click', function () {
			Eplant.expressionAnglerClick();
		});
		
		
		$('#genePanel_content').sortable({
			start: function (event, ui) {
				ui.item.data('originIndex', ui.item.index());
			},
			
			//update Eplant.activeSpecies.geneticElements
			update: function (event, ui) {
				var children = $('#genePanel_content').children();
				var originIndex = ui.item.data('originIndex');
				ui.item.removeData('originIndex');
				var currentIndex = ui.item.index();
				
				if (currentIndex != originIndex) {
					
					tempGene = Eplant.activeSpecies.displayGeneticElements[originIndex];
					Eplant.activeSpecies.displayGeneticElements.splice(originIndex, 1);
					
					Eplant.activeSpecies.displayGeneticElements.splice(currentIndex, 0, tempGene);
				}
				Eplant.activeSpecies.views['HeatMapView'].refreshHeatMap();
			}
		});
		$( '.hint--right' ).tooltip({
			position: {
				my: 'left center', at: 'right+5 center'
			},
			tooltipClass:'right'
		});
		$( '.hint--left' ).tooltip({
			position: {
				my: 'left center', at: 'right+5 center'
			},
			tooltipClass:'left'
		});
		
		$( '.hint--bottom' ).tooltip({
			position: {
				my: 'left center', at: 'right+5 center'
			},
			tooltipClass:'bottom'
		});
		$( '.hint--top' ).tooltip({
			position: {
				my: 'left center', at: 'right+5 center'
			},
			tooltipClass:'top'
		});
		$('.leftToggle').click(function() {
			if (Eplant.sidebarOpen == false) {
				$('.left').animate({
					marginLeft: "0px"
				}, 500);
				$('.leftToggle').animate({
					marginLeft: "0px"
				}, 500);
				$('.leftColumn').animate({
					width: "307px"
				}, 500);
				$('#topLeft',window.parent.document).animate({
					left: "0px"
				}, 500);
				$('.pLeft',window.parent.document).animate({
					paddingLeft: "307px"
				}, 500);
				$('#settings_container').animate({
					marginLeft: "307px",
					width: $(window).width()-307+"px"
				}, 500);
				
				
				$(".toggleArrow").attr('src',"app/img/arrow-left.png");
				
				Eplant.sidebarOpen = true;
				$(":animated").promise().done(function() {
					var evt = document.createEvent('UIEvents');
					evt.initUIEvent('resize', true, false,window,0);
					window.dispatchEvent(evt);
					respondCanvas();
				});
				
			}
			else {
				$('.left').animate({
					marginLeft: "-245px"
				}, 500);
				$('.leftToggle').animate({
					marginLeft: "-245px"
				}, 500);
				$('.leftColumn').animate({
					width: "60px"
				}, 500);
				$('#topLeft',window.parent.document).animate({
					left: "-245px"
				}, 500);
				$('.pLeft',window.parent.document).animate({
					paddingLeft: "60px"
				}, 500);
				$('#settings_container').animate({
					marginLeft: "60px",
					width: $(window).width()-60+"px"
				}, 500);
				$(".toggleArrow").attr('src',"app/img/arrow-right.png");
				Eplant.sidebarOpen = false;
				
				$(":animated").promise().done(function() {
					var evt = document.createEvent('UIEvents');
					evt.initUIEvent('resize', true, false,window,0);
					window.dispatchEvent(evt);
					respondCanvas();
				});
				
			}
		});
	};
	
	/**
	*/
	Eplant.RSVPMode = function(index) {
		if (Eplant.RSVPOn) {
			if (Eplant.activeSpecies.displayGeneticElements.length > index) {
				var geneticElement = Eplant.activeSpecies.displayGeneticElements[index];
				geneticElement.species.setActiveGeneticElement(geneticElement);
				Eplant.RSVPTimeout = setTimeout(function() {
					Eplant.RSVPMode(index + 1);
				}, Eplant.RSVPSpeed);
			} 
			else {
				var geneticElement = Eplant.activeSpecies.displayGeneticElements[0];
				geneticElement.species.setActiveGeneticElement(geneticElement);
				Eplant.RSVPTimeout = setTimeout(function() {
					Eplant.RSVPMode(1);
				}, Eplant.RSVPSpeed);
			}
		}
	};
	
	
	/**
		* Bind events for ePlant.
	*/
	Eplant.bindEvents = function() {
		$(window).resize(Eplant.resize);
		
		/* Update*/
		var eventListener = new ZUI.EventListener("update-colors", Eplant, function(event, eventData, listenerData) {
			
			
			for (i= 0; i <Eplant.activeSpecies.displayGeneticElements.length; i++){
				Eplant.activeSpecies.displayGeneticElements[i].refreshHeatmap();
				Eplant.activeSpecies.displayGeneticElements[i].updateEFPViews();
			}
			Eplant.activeSpecies.views['HeatMapView'].refreshHeatMap();
			
			if(Eplant.activeView.magnification ===35){
				Eplant.activeSpecies.views['ExperimentView'].selectList.getSidebar().done($.proxy(function(domSideBar){
					$('#efp_experiement_list').empty();
					$('#efp_experiement_list').css('width','150px');
					$('#efp_container').css('margin-left','150px');
					$('#efp_experiement_list').append(domSideBar);
					var activeViewSnapshot = $(domSideBar).find("[data-viewname='" + this.name + "']");
					if(activeViewSnapshot.length>0){
						activeViewSnapshot.css({'outline':'2px solid #000000'});
						var scrollTop = activeViewSnapshot.position().top-$('#efp_experiement_list').height()/2+activeViewSnapshot.outerHeight();
						if(scrollTop>0) $('#efp_experiement_list').scrollTop(scrollTop);
					}
				},this));
			}
			
			
			Eplant.updateGeneticElementPanel();
		}, {});
		ZUI.addEventListener(eventListener);
		
		/* Update speciesLabel when the activeSpecies changes */
		var eventListener = new ZUI.EventListener("update-activeSpecies", Eplant, function(event, eventData, listenerData) {
			$("#speciesLabel").html(Eplant.activeSpecies.scientificName);
			$("#left").removeClass("hideleft");
			$("#leftToggle").removeClass("hideleft");
			
		}, {});
		ZUI.addEventListener(eventListener);
		
		/* Update View icon when the View finishes loading */
		var eventListener = new ZUI.EventListener("view-loaded", null, function(event, eventData, listenerData) {
			/* Get View */
			var view = event.target;
			
			if(view.geneticElement){
				//Eplant.queue.add(view.geneticElement.getDom, view.geneticElement);
				view.geneticElement.getDom();				
				if(view.geneticElement.isLoadedViewsData){
					Eplant.queue.add(Eplant.updateGeneticElementPanel,Eplant);
					
				}
			}
			
			/* Determine whether the View is represented in the icon dock */
			var isInIconDock = false;
			if (view.hierarchy == "ePlant") {
				isInIconDock = true;
				} else if (view.hierarchy == "species") {
				if (view.species == Eplant.activeSpecies) {
					isInIconDock = true;
				}
				} else if (view.hierarchy == "genetic element") {
				if (view.geneticElement.species == Eplant.activeSpecies && view.geneticElement == Eplant.activeSpecies.activeGeneticElement) {
					isInIconDock = true;
				}
			}
			
			/* Update icon if applicable */
			if (isInIconDock) {
				Eplant.updateIconDock();
			}
		}, {});
		ZUI.addEventListener(eventListener);
		
		/* Update View icon dock when activeSpecies changes */
		var eventListener = new ZUI.EventListener("update-activeSpecies", Eplant, function(event, eventData, listenerData) {
			Eplant.updateIconDock();
		}, {});
		ZUI.addEventListener(eventListener);
		
		/* Update View icon dock when the activeGeneticElement of activeSpecies changes */
		var eventListener = new ZUI.EventListener("update-activeGeneticElement", null, function(event, eventData, listenerData) {
			/* Get Species */
			var species = event.target;
			
			/* Check if Species is the activeSpecies */
			if (species == Eplant.activeSpecies) {
				Eplant.updateIconDock();
			}
		}, {});
		ZUI.addEventListener(eventListener);
		
		/* Update View icon dock when the activeView changes */
		var eventListener = new ZUI.EventListener("update-activeView", Eplant, function(event, eventData, listenerData) {
			Eplant.updateIconDock();
			Eplant.updateHistoryIcons();
		}, {});
		ZUI.addEventListener(eventListener);
		
		// Update history icons when the activeItem of the history changes
		var eventListener = new ZUI.EventListener("update-history-activeItem", Eplant.history, function(event, eventData, listenerData) {
			if (Eplant.history.isBackPossible()) {
				$("#historyBackIcon img").attr("src", "app/img/available/history-back.png");
				} else {
				$("#historyBackIcon img").attr("src", "app/img/unavailable/history-back.png");
			}
			if (Eplant.history.isForwardPossible()) {
				$("#historyForwardIcon img").attr("src", "app/img/available/history-forward.png");
				} else {
				$("#historyForwardIcon img").attr("src", "app/img/unavailable/history-forward.png");
			}
		}, {});
		ZUI.addEventListener(eventListener);
		
		/* Update GeneticElement panel when the activeSpecies changes */
		var eventListener = new ZUI.EventListener("update-activeSpecies", Eplant, function(event, eventData, listenerData) {
			Eplant.updateGeneticElementPanel();
		}, {});
		ZUI.addEventListener(eventListener);
		
		/* Update GeneticElement panel when the activeGeneticElement of activeSpecies changes */
		var eventListener = new ZUI.EventListener("update-activeGeneticElement", null, function(event, eventData, listenerData) {
			/* Get Species */
			var geneticElement = event.target;
			var species = event.target.species;
			
			/* Check if Species is the activeSpecies */
			if (species == Eplant.activeSpecies) {
				Eplant.updateGeneticElementPanel();
				if(Eplant.activeView.name === "Heat Map Viewer"){
					Eplant.activeView.changeActiveGeneRow(geneticElement.identifier);
				}
			}
			
			
			
		}, {});
		ZUI.addEventListener(eventListener);
		
		/* Update GeneticElement panel when the activeGeneticElement of activeSpecies changes */
		var eventListener = new ZUI.EventListener("remove-geneticElement", null, function(event, eventData, listenerData) {
			/* Get Species */
			var species = event.target.species;
			var geneticElement = event.target;
			
			if(species.displayGeneticElements.length > 0){
				species.setActiveGeneticElement(species.displayGeneticElements[species.displayGeneticElements.length-1]);
			}
			else{
				species.activeGeneticElement = null;
				Eplant.changeActiveView(Eplant.views['HomeView']);
			}
			/* Check if Species is the activeSpecies */
			if (species == Eplant.activeSpecies) {
				Eplant.updateGeneticElementPanel();
				Eplant.updateIconDock();
			}
			if(Eplant.activeView.name === "Heat Map Viewer"){
				Eplant.activeSpecies.views['HeatMapView'].removeRow(geneticElement.identifier);
			}
			
			TabManager.removeIdentifier(event.target.identifier);
		}, {});
		ZUI.addEventListener(eventListener);
		
		/* Update GeneticElement panel when views of a GeneticElement of the activeSpecies are loaded */
		var eventListener = new ZUI.EventListener("load-views", null, function(event, eventData, listenerData) {
			/* Get Species */
			var species = event.target.species;
		
			event.target.species.setActiveGeneticElement(event.target);
			
		}, {});
		ZUI.addEventListener(eventListener);
		
				/* Update GeneticElement panel when views of a GeneticElement of the activeSpecies are loaded */
		var eventListener = new ZUI.EventListener("load-efp-views", null, function(event, eventData, listenerData) {
			/* Get Species */
			var species = event.target.species;
			event.target.updateEFPViews();
			/*if(Eplant.activeView.name === "Heat Map Viewer" ){
				Eplant.activeSpecies.views['HeatMapView'].active();
			}*/
			if(Eplant.activeView.name === "Welcome Screen"){
				Eplant.searchForActiveView('HeatMapView');
			}
			else if(Eplant.activeView.name === "Heat Map Viewer"){
				Eplant.activeSpecies.views['HeatMapView'].addNewRow(event.target)
			}
			
			/* Check if Species is the activeSpecies */
			if (species == Eplant.activeSpecies) {
				//Eplant.updateGeneticElementPanel();
			}
			event.target.species.setActiveGeneticElement(event.target);
			/*Eplant.loadingGeneList.pop();
				if (Eplant.loadingGeneList.length == 0) {
				art.dialog({
				id: 'loadingDialog'
				}).close();
				DialogManager.artDialogBottom({
				content: 'Loading Complete, closing in 3 seconds',
				time: 3,
				});
			}*/
		}, {});
		ZUI.addEventListener(eventListener);
		
		/* Update GeneticElement panel when the GeneticElementDialog of a GeneticElement of the activeSpecies is updated */
		var eventListener = new ZUI.EventListener("update-geneticElementDialog", null, function(event, eventData, listenerData) {
			/* Get Species */
			var species = event.target.species;
			
			/* Check if Species is the activeSpecies */
			if (species == Eplant.activeSpecies) {
				Eplant.updateGeneticElementPanel();
			}
		}, {});
		ZUI.addEventListener(eventListener);
		
		/* Update GeneticElement panel when tags change */
		var eventListener = new ZUI.EventListener("update-annotationTags", null, function(event, eventData, listenerData) {
			/* Get GeneticElement */
			var geneticElement = event.target;
			
			/* Update if Species is the activeSpecies */
			if (geneticElement.species == Eplant.activeSpecies) {
				Eplant.updateGeneticElementPanel();
			}
		}, {});
		ZUI.addEventListener(eventListener);
		var eventListener = new ZUI.EventListener("load-species", null, function(event, eventData, listenerData) {
			Eplant.setActiveSpecies(Eplant.species[0]);
		}, {});
		ZUI.addEventListener(eventListener);
		
		var eventListener = new ZUI.EventListener("genes-all-loaded", null, function(event, eventData, listenerData) {
			
			
			
			
			
		}, {});
		ZUI.addEventListener(eventListener);
	};
	
	/**
		* Queries the identifier in the input box.
	*/
	Eplant.queryIdentifier = function(array) {
		if (array) {
			var terms = array;
			} else {
			if ($("#enterIdentifier").val() == '' || $("#enterIdentifier").val() == $("#enterIdentifier")[0].defaultValue) {
				DialogManager.artDialogDynamic('Please enter a gene name or ID.');
				return;
			}
			else{
				var terms = $("#enterIdentifier").val().split(",").filter(function(el) {return el.length != 0});
			}
			
		}
		terms= terms.filter(function(str) {
			return /\S/.test(str);
		});
		Eplant.loadingGeneList = jQuery.unique(Eplant.loadingGeneList);
		for (var n = 0; n < terms.length; n++) {
			var term = terms[n].trim();
			Eplant.activeSpecies.loadGeneticElementByIdentifier(term);
			
			
		}
		$("#enterIdentifier").val('');
		Eplant.updateGeneticElementPanel();
		
	};
	
	/**
		* Load Views at the hierarchy level of ePlant.
	*/
	Eplant.loadViews = function() {
		/* Set up Object wrapper */
		Eplant.views = {};
		
		/* Loop through Eplant.Views namespace */
		for (var ViewName in Eplant.Views) {
			/* Get View constructor */
			var View = Eplant.Views[ViewName];
			
			/* Skip if View hierarchy is not at the level of genetic element */
			if (View.hierarchy != "ePlant") continue;
			
			/* Create View */
			Eplant.views[ViewName] = new View(this);
		}
		
		/* Set flag for view loading */
		this.isLoadedViews = true;
	};
	
	/**
		* Loads all Species for ePlant
	*/
	Eplant.loadSpecies = function() {
		if (!this.isLoadedSpecies) {
			$.ajax({
				beforeSend: function(request) {
					request.setRequestHeader('Authorization', 'Bearer ' + Agave.token.accessToken);
				},
				dataType: "json",
				async: false,
				cache: false,
				url: Eplant.ServiceUrl + 'speciesinfo.cgi',
				success: $.proxy(function(response) {
					/* Loop through species */
					for (var n = 0; n < response.length; n++) {
						/* Get data for this species */
						var speciesData = response[n];

						/* Create Species */
						var species = new Eplant.Species({
							scientificName: speciesData.scientificName,
							commonName: speciesData.commonName,
							exampleQuery: speciesData.exampleQuery
						});
						species.loadViews();

						/* Add Species to ePlant */
						Eplant.addSpecies(species);

						/* Araport: Set Arabidopsis as active species for now*/
						if (n == 0) {
							Eplant.setActiveSpecies(species);
						}
					}

					/* Set Species load status */
					Eplant.isLoadedSpecies = true;


					/* Fire event for loading chromosomes */
					var event = new ZUI.Event("load-species", Eplant, null);
					ZUI.fireEvent(event);
				}, this)
			});
		}
	};
	
	/**
		* Adds a Species to ePlant
		*
		* @param {Eplant.Species} species The Species to be added.
	*/
	Eplant.addSpecies = function(species) {
		/* Add Species to array */
		Eplant.species.push(species);
		
		/* Fire event for updating the Species array */
		var event = new ZUI.Event("update-species", Eplant, null);
		ZUI.fireEvent(event);
	};
	
	/**
		* Removes a Species from ePlant
		*
		* @param {Eplant.Species} species The Species to be removed.
	*/
	Eplant.removeSpecies = function(species) {
		/* Clean up Species */
		species.remove();
		
		/* Remove Species from array */
		var index = Eplant.species.indexOf(species);
		if (index > -1) Eplant.species.splice(index, 1);
		
		/* Fire event for updating the Species array */
		var event = new ZUI.Event("update-species", Eplant, null);
		ZUI.fireEvent(event);
	};
	
	/**
		* Gets the Species with the specified scientific name.
		*
		* @param {String} scientificName Scientific name of the Species.
		* @return {Eplant.Species} Matching Species.
	*/
	Eplant.getSpeciesByScientificName = function(scientificName) {
		/* Loop through Species objects to find the Species with a matching scientificName */
		for (var n = 0; n < Eplant.species.length; n++) {
			var species = Eplant.species[n];
			if (species.scientificName.toUpperCase() == scientificName.toUpperCase()) {
				return species;
			}
		}
		
		/* Not found */
		return null;
	};
	
	/**
		* Sets ePlant's activeSpecies.
		*
		* @param {Eplant.Species} species The new activeSpecies.
	*/
	Eplant.setActiveSpecies = function(species) {
		/* Unselect GeneticElementDialog of previous activeSpecies' activeGeneticElement */
		if (Eplant.activeSpecies && Eplant.activeSpecies.activeGeneticElement && Eplant.activeSpecies.activeGeneticElement.geneticElementDialog) {
			Eplant.activeSpecies.activeGeneticElement.geneticElementDialog.unselect();
		}
		
		/* Set activeSpecies */
		Eplant.activeSpecies = species;
		
		/* Fire event for updating activeSpecies */
		var event = new ZUI.Event("update-activeSpecies", Eplant, null);
		ZUI.fireEvent(event);
		
		/* Select GeneticElementDialog of new active Species' activeGeneticElement */
		if (Eplant.activeSpecies.activeGeneticElement && Eplant.activeSpecies.activeGeneticElement.geneticElementDialog) {
			Eplant.activeSpecies.activeGeneticElement.geneticElementDialog.select();
		}
	};
	
	
	
	
	/**
		* gets the active View of a tab.
		*
		* @param {Eplant.View} activeView .
		* @param {string} tab id.
	*/
	Eplant.getTabActiveView = function(tabId) {
		return Eplant.activeViews[tabId];
	}
	
	/**
		* gets the active View of a tab.
		*
		* @param {Eplant.View} activeView .
		* @param {string} tab id.
	*/
	Eplant.setTabActiveView = function(activeView, tabId) {
		var newActiveView;
		if (!tabId) {
			tabId = Eplant.activeTabId;
		}
		Eplant.activeViews[tabId] = activeView;
		
	}
	
	/**
		* deletes the active View of a tab.
		*
		* @param {string} tab id.
	*/
	Eplant.deleteTabActiveView = function(tabId) {
		
		if (Eplant.activeViews.hasOwnProperty(tabId)) {
			delete Eplant.activeViews[tabId];
		}
		
		
	}
	
	/**
		* Changes the active View of ePlant.
		*
		* @param {Eplant.View} activeView The new activeView.
	*/
	Eplant.changeActiveView = function(activeView, tabId) {
		if(activeView.isLoadedData)
		{
			var sameTab = Eplant.activeTabId == tabId;
			if (tabId) {
				Eplant.setTabActiveView(activeView, tabId);
				Eplant.activeTabId = tabId;
				} else {
				Eplant.setTabActiveView(activeView, Eplant.activeTabId);
				tabId = Eplant.activeTabId;
				var sameTab = true;
			}
			/* Check whether activeView change should be animated */
			if (Eplant.isAnimateActiveViewChange && sameTab) { // Yes
				/* Determine direction of animation */
				var direction = null;
				var integerMagnification1 = Math.floor(ZUI.activeView.magnification);
				var integerMagnification2 = Math.floor(activeView.magnification);
				if(ZUI.activeView.name!==activeView.name){
					if (integerMagnification1 < integerMagnification2) {
						direction = "In";
					} 
					else if (integerMagnification1 > integerMagnification2) {
						direction = "Out";
					} 
					else if (integerMagnification1 === integerMagnification2) {
						if(Eplant.activeView.max&&activeView.max&&activeView.max>Eplant.activeView.max){
							direction = "Down";
						}
						else{
							direction = "Up";
						}
					} 
				}
				
				/* Get animation configuration */
				var exitAnimationConfig, enterAnimationConfig;
				if (direction) {
					exitAnimationConfig = ZUI.activeView["getExit" + direction + "AnimationConfig"]();
					enterAnimationConfig = activeView["getEnter" + direction + "AnimationConfig"]();
					} else {
					exitAnimationConfig = {};
					enterAnimationConfig = {};
				}
				
				/* Modify animation configurations to set up view change between the animations and create Animation objects */
				enterAnimationConfig.end = $.proxy(function() {
					if(ZUI.activeView.beforeInactive){
						ZUI.activeView.afterActive();
					}
				},this);
				var enterAnimation = new ZUI.Animation(enterAnimationConfig);
				
				var wrapper = {
					activeView: activeView,
					enterAnimation: enterAnimation
				};
				exitAnimationConfig.end = $.proxy(function() {
					/* Call inactive for the old activeView */
					ZUI.activeView.inactive();
					
					/* Change activeView */
					ZUI.activeView = this.activeView;
					
					/* Fire event for updating activeView */
					var event = new ZUI.Event("update-activeView", Eplant, null);
					ZUI.fireEvent(event);
					
					/* Synchronize activeView with activeSpecies and activeGeneticElement */
					var tabName = "";
					tabName += ZUI.activeView.name;
					if (ZUI.activeView.geneticElement) {
						if (Eplant.activeSpecies != ZUI.activeView.geneticElement.species) {
							Eplant.setActiveSpecies(ZUI.activeView.geneticElement.species);
						}
						if (Eplant.activeSpecies.activeGeneticElement != ZUI.activeView.geneticElement) {
							Eplant.activeSpecies.setActiveGeneticElement(ZUI.activeView.geneticElement);
						}
						tabName +=': ' + ZUI.activeView.geneticElement.identifier;
						} else if (ZUI.activeView.species) {
						if (Eplant.activeSpecies != ZUI.activeView.species) {
							Eplant.setActiveSpecies(ZUI.activeView.species);
						}
					}
					
					if (tabId) {
						var $active = $("#tabs  #tabUl").find("[aria-controls='" + tabId + "']");
						$(".fullTab", $active).text(tabName);
						$(".displayTab", $active).text(tabName);
						TabManager.resizeTabs();
					}
					/* Call active for the new activeView */
					ZUI.activeView.active();
					
					/* Start the enter animation */
					wrapper.activeView.animate(this.enterAnimation);
				}, wrapper);
				var exitAnimation = new ZUI.Animation(exitAnimationConfig);
				if(ZUI.activeView.beforeInactive){
					ZUI.activeView.beforeInactive();
				}
				
				/* Start the exit animation */
				ZUI.activeView.animate(exitAnimation)
				} else { // No
				/* Call inactive for the old activeView */
				ZUI.activeView.inactive();
				
				/* Change activeView */
				ZUI.activeView = activeView;
				
				/* Fire event for updating activeView */
				var event = new ZUI.Event("update-activeView", Eplant, null);
				ZUI.fireEvent(event);
				
				/* Synchronize activeView with activeSpecies and activeGeneticElement */
				var tabName = "";
				if (ZUI.activeView.geneticElement) {
					if (Eplant.activeSpecies != ZUI.activeView.geneticElement.species) {
						Eplant.setActiveSpecies(ZUI.activeView.geneticElement.species);
					}
					if (Eplant.activeSpecies.activeGeneticElement != ZUI.activeView.geneticElement) {
						Eplant.activeSpecies.setActiveGeneticElement(ZUI.activeView.geneticElement);
					}
					tabName += ZUI.activeView.geneticElement.identifier + ":";
					} else if (ZUI.activeView.species) {
					if (Eplant.activeSpecies != ZUI.activeView.species) {
						Eplant.setActiveSpecies(ZUI.activeView.species);
					}
				}
				
				
				tabName += ZUI.activeView.name;
				if (tabId) {
					var $active = $("#tabs  #tabUl").find("[aria-controls='" + tabId + "']");
					$(".fullTab", $active).text(tabName);
					$(".displayTab", $active).text(tabName);
					TabManager.resizeTabs();
				}
				/* Call active for the new activeView */
				ZUI.activeView.active();
			}
			Eplant.activeView = activeView;
			/* Fire event for updating activeView */
			var event = new ZUI.Event("update-activeView", Eplant, null);
			ZUI.fireEvent(event);
		}
	};
	
	/**
		* Updates the View icon dock.
	*/
	Eplant.updateIconDock = function() {
		
		for (var ViewName in Eplant.Views) {
			/* Get constructor */
			var View = Eplant.Views[ViewName];
			
			/* Get the active view instance */
			var view = null;
			if (View.hierarchy == "ePlant") {
				view = Eplant.views[ViewName];
				if (ZUI.activeView == view) {
					$("#" + ViewName + "Icon").children("img").attr("src", View.activeIconImageURL);
					} else {
					$("#" + ViewName + "Icon").children("img").attr("src", View.availableIconImageURL);
				}
				} else if (View.hierarchy == "species") {
				if (Eplant.activeSpecies) {
					view = Eplant.activeSpecies.views[ViewName];
				}
				} else if (View.hierarchy == "genetic element") {
				if (Eplant.activeSpecies && Eplant.activeSpecies.activeGeneticElement) {
					view = Eplant.activeSpecies.activeGeneticElement.views[ViewName];
				}
			}
			
			/* Set icon image */
			if (view) {
				if (ZUI.activeView == view) {
					if(view.magnification === 35){
						$("#ExperimentViewIcon").children("img").attr("src", "app/img/active/experiment.png");
					}
					else{
						$("#" + ViewName + "Icon").children("img").attr("src", View.activeIconImageURL);
					}
					
				} 
				else if (view.isLoadedData) {
					if(view.hierarchy == "species" && Eplant.activeSpecies && Eplant.activeSpecies.displayGeneticElements.length>0)
					{
						$("#" + ViewName + "Icon").children("img").attr("src", View.availableIconImageURL);
					}
					else if(view.hierarchy !== "species"){
						$("#" + ViewName + "Icon").children("img").attr("src", View.availableIconImageURL);
					}
					else{
						$("#" + ViewName + "Icon").children("img").attr("src", View.unavailableIconImageURL);
					}
				} 
				else {
					$("#" + ViewName + "Icon").children("img").attr("src", View.unavailableIconImageURL);
				}
			} 
			else {
				$("#" + ViewName + "Icon").children("img").attr("src", View.unavailableIconImageURL);
			}
		}
	};
	
	/**
		* Updates the GeneticElement panel
	*/
	Eplant.updateGeneticElementPanel = function() {
		/* Return if activeSpecies does not exist */
		if (!Eplant.activeSpecies) {
			return;
		}
		
		
		/* Get panel DOM container */
		var domPanel = document.getElementById("genePanel_content");
		
		/* Clear old panel content */
		//$(domPanel).empty();
		
		/* Clear old identifier query */
		Eplant.identifierQuery = [];
		
		/* Populate panel */
		
		var allLoaded = true;
		var loaded = 0;
		var notLoaded = 0;
		for (var n = 0; n < Eplant.activeSpecies.displayGeneticElements.length; n++) {
			/* Get GeneticElement */
			var geneticElement = Eplant.activeSpecies.displayGeneticElements[n];
			
			var domItem = geneticElement.getDom();
			
			/* Pass if views not loaded */
			if (!geneticElement.isLoadedViewsData) {
				allLoaded = false;
				notLoaded++;
				}else{
				loaded++;
			}
			
			/* add loaded genetic elements */
			//Eplant.identifierQuery.push(geneticElement.identifier);
			
			
			
			/* Append item to panel */
			$(domPanel).append(domItem);
			
		}
		if(loaded ===0 ){
			$('#genePanel_label').html('No genes / gene products currently loaded');
		}
		else if (loaded ===1 ){
			$('#genePanel_label').html(loaded+' gene / gene product currently loaded');
		}
		else{
			$('#genePanel_label').html(loaded+' genes / gene products currently loaded');
		}
		if (!allLoaded) {
			
			if (notLoaded ===1 ){
				$('#genePanel_loading_label').html(notLoaded+' gene / gene product currently loading');
			}
			else{
				$('#genePanel_loading_label').html(notLoaded+' genes / gene products currently loading');
			}
			$("#enterIdentifier").attr('placeholder', 'Downloading data...');
		} 
		else {
			$('#genePanel_loading_label').html('');
			if ($("#enterIdentifier").attr('placeholder') == 'Downloading data...') {
				$("#enterIdentifier").attr('placeholder', 'What would you like to see?');
				var event = new ZUI.Event("genes-all-loaded", this, null);
				ZUI.fireEvent(event);
			}
			clearTimeout(Eplant.geneLoadingTimeout);
		}
		
		
	};
	
	/**
		* Updates history icons.
	*/
	Eplant.updateHistoryIcons = function() {
		if (Eplant.history.isBackPossible()) {
			$("#historyBackIcon img").attr("src", "app/img/available/history-back.png");
			} else {
			$("#historyBackIcon img").attr("src", "app/img/unavailable/history-back.png");
		}
		if (Eplant.history.isForwardPossible()) {
			$("#historyForwardIcon img").attr("src", "app/img/available/history-forward.png");
			} else {
			$("#historyForwardIcon img").attr("src", "app/img/unavailable/history-forward.png");
		}
	};
	
	/**
		* Gets the constructor name of a View.
		*
		* @param {Eplant.View} view A View.
		* @return {String} Constructor name of the View.
	*/
	Eplant.getViewName = function(view) {
		for (var ViewName in Eplant.Views) {
			var View = Eplant.Views[ViewName];
			if (view instanceof View) {
				return ViewName;
			}
		}
		return null;
	};
	
	/**
		* Resize icons in the Icon Dock
		*
		* @param {int} height of the icon dock.
	*/
	Eplant.resizeIconDock = function(height) {
		if (!height) {
			var height = $(window).height() - 75;
		}
		var iconNum = Math.floor((height - 120) / 68), i;
		if (Eplant.iconIndex == 0) iconNum++;
		if (iconNum < Eplant.iconList.length) {
			/*for (i = 0; i < Eplant.iconIndex; i++) {
				$(Eplant.iconList[i]).hide();
				}
				for (i = Eplant.iconIndex; i < iconNum + Eplant.iconIndex; i++) {
				$(Eplant.iconList[i]).show();
				}
				for (i = iconNum + Eplant.iconIndex; i < Eplant.iconList.length; i++) {
				$(Eplant.iconList[i]).hide();
			}*/
			/*$('#navigationContainer').animate({
				top:-(Eplant.iconIndex*68)
				}, 200, function() {
				// Animation complete.
				});
				if (Eplant.iconIndex != 0) {
				$('#navigationContainer').css("margin-top", "60px");
				$('#iconTopArrow').show();
				} else {
				$('#navigationContainer').css("margin-top", "0px");
				$('#iconTopArrow').hide();
				}
				if (iconNum + Eplant.iconIndex < Eplant.iconList.length) {
				$('#navigationContainer').css("margin-bottom", "60px");
				$('#iconBottomArrow').show();
				
				} else {
				$('#navigationContainer').css("margin-bottom", "0px");
				$('#iconBottomArrow').hide();
				
				}
				Eplant.visibleIcons = iconNum;
			*/
			var newWidth = (height - (20 * Eplant.iconList.length)-10)/Eplant.iconList.length;
			var newMargin = (50 - newWidth)/2;
			if(newMargin<5){
				newWidth = 40;
				newMargin = 5;
			}
			for (i = 0; i < Eplant.iconList.length; i++) {
				
				$(Eplant.iconList[i]).css({
					'width': newWidth,
					'height': newWidth,
					'margin':'5px '+newMargin+'px'
				});
				$('img', Eplant.iconList[i]).css({
					'width': newWidth,
					'height': newWidth
				});
			}
			
		} 
		else {
			/*for (i = 0; i < Eplant.iconList.length; i++) {
				
				$(Eplant.iconList[i]).show();
			}*/
			/*$('#navigationContainer').css({
				top:0
				});
				$('#iconTopArrow').hide();
				$('#iconBottomArrow').hide();
				Eplant.visibleIcons = Eplant.iconList.length;
				$('#navigationContainer').css("margin-top", 0);
			$('#navigationContainer').css("margin-bottom", 0);*/
			for (i = 0; i < Eplant.iconList.length; i++) {
				
				$(Eplant.iconList[i]).css({
					'width': '',
					'height':'',
					'margin':''
				});
				$('img', Eplant.iconList[i]).css({
					'width': '',
					'height': ''
				});
			}
		}
	};
	Eplant.resize = function() {
		var c = $('#ZUI_canvas');
		container = $(c).parent();
		c.attr('width', $(window).width() ); //max width
		c.attr('height', $(window).height() ); //max height
		var $left = $('#left');
		var leftMargin =$left.width()+$left.outerWidth(true)-$left.innerWidth();
		var height = $(window).height() - 75;
		var width = $(window).width()-leftMargin;
		$('div#left').height(height);
		$('div.tab').height(height);
		if(height>600)
		{
			$('div#sequence-theme').height(height);
			$('div#sequence').height(height);
		}
		$('div#genePanel_container').height(height-350);
		if($('div#genePanel_content').height()<(height-360)){
			$('div#genePanel_content').height(height-360);
		}
		else{
			$('div#genePanel_content').height('');
		}
		
		$('div.tab').width(width);
		$('div#ZUI_container').width(width);
		$('div#ZUI_container').height(height);
		$(c).width(width);
		$(c).height(height);
		$('div.tab').css('left',leftMargin);
		var settings = $('div#settings_container'); 
		settings.width($(window).width() - parseInt(settings.css('marginLeft'),10) );
		$('div#tabUl').width($(window).width() - parseInt(settings.css('marginLeft'),10));
		Eplant.resizeIconDock(height);
		if(Eplant.activeView&&Eplant.activeView.resize){
			Eplant.activeView.resize();
		}
	}
})();																																																																																																											
