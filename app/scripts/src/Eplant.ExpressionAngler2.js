(function() {
	
	/**
		* Eplant.View class
		* By Hans Yu
		* 
		* Base class for all ePlant views.
		*
		* @constructor
		* @augments ZUI.View
		* @param {String} name Name of the View visible to the user.
		* @param {String} hierarchy Description of the level of hierarchy.
		* 	Can be "ePlant", "species", or "genetic element".
		* @param {Number} magnification Arbitrary magnification value of the View.
		* 	This is evaluated relative to the magnification value of other Views.
		* 	Whole number value is used to determine the magnification level of the View.
		* 	Decimal number value is used to determine the position of the View relative 
		* 	to another with the same Magnification level.
		* @param {String} description Description of the View visible to the user.
		* @param {String} citation Citation template of the View.
		* @param {String} activeIconImageURL URL of the active icon image.
		* @param {String} availableIconImageURL URL of the available icon image.
		* @param {String} unavailableIconImageURL URL of the unavailable icon image.
	*/
	Eplant.ExpressionAngler = function(URL, mainIdentifier) {
		if(mainIdentifier){
			var mainGeneticElement=Eplant.activeSpecies.getGeneticElementByIdentifier(mainIdentifier);
		}
		var dom = $('<div/>', {
		});
		dom.css({'text-align':'center'});
		var p = $('<div/>', {
			text: 'Loading, click cancel to stop loading.'
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
			'class':'button greenButton'
		});
		cancelButton.css({'margin-top':'10px'});
		cancelButton.on('click',$.proxy(function(){
			if(this.expressionXhrLink) {
				this.expressionXhrLink.abort();
				this.expressionXhrLink = null;
				
			}
			if(this.expressionXhrService) {
				this.expressionXhrService.abort();
				this.expressionXhrService = null;
			}
			if(this.expressionAnglerLoadingDialog) this.expressionAnglerLoadingDialog.close();
		},Eplant));
		$(dom).append(p).append(propgressBar.append(propgressLabel)).append(cancelButton);
		Eplant.expressionAnglerLoadingDialog = DialogManager.artDialogDynamic(dom[0]);
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
		this.expressionXhrService = $.get(URL, $.proxy(function( data ) {
			var doc = $.parseHTML(data)
			var tempLinkEle = $('b:contains("View data set as text")', doc);
			if(tempLinkEle.length>0){
				var tempFileLink = tempLinkEle.parent().attr('href').replace('..','http://bar.utoronto.ca/ntools');
				this.expressionXhrLink = $.get( tempFileLink,  $.proxy(function( list ) {
					var allTextLines = list.split(/\r\n|\n/);
					var headers = allTextLines[0].split(/\t/);
					var lines = [];
					
					for (var i=1; i<allTextLines.length; i++) {
						var data = allTextLines[i].split(/\t/);
						if (data.length == headers.length) {
							
							var tarr = [];
							for (var j=0; j<2; j++) {
								tarr.push(data[j]);
							}
							if(/^[a-z0-9]+$/i.test(tarr[0])){//&&!tarr[0].toUpperCase().contains(mainIdentifier.toUpperCase())){
								lines.push(tarr);
							}
						}
					}
					var list = [];
					for(var i = 0;i<lines.length;i++){
						if(lines[i][0]){
							list.push({
								term:lines[i][0],
								rValue:lines[i][1].split('|')[0]
							});
						}
						
					}
					if(this.expressionAnglerLoadingDialog) this.expressionAnglerLoadingDialog.close();
					this.loadExpressionAnglerGenes(list,mainGeneticElement);
					
					
				},Eplant));
			}
			else{
				alert('No information found on Expression Angler')
			}
			
		},Eplant))
		.always(function() {
			if(Eplant.expressionAnglerLoadingDialog) Eplant.expressionAnglerLoadingDialog.close();
		});
	};
	Eplant.loadExpressionAnglerGenes = function(list,mainGeneticElement) {
		var numToLoad = list.length;
		
		if(mainGeneticElement){
			for(var i = 0;i<list.length;i++){
				var term = list[i].term;
				var rValue = list[i].rValue;
				Eplant.activeSpecies.loadGeneticElementByIdentifier(term, $.proxy(function(geneticElement, identifier) {
					if (geneticElement) {
						
						if(mainGeneticElement&&geneticElement.identifier!==mainGeneticElement.identifier&&$.inArray(geneticElement, mainGeneticElement.expressionAnglerGenes)==-1)
						{
							geneticElement.isRelated=true;
							geneticElement.relatedGene=mainGeneticElement;
							geneticElement.rValueToRelatedGene=rValue;
							mainGeneticElement.expressionAnglerGenes.push(geneticElement);
							geneticElement.loadViews();
						}
						
						/* Load views for GeneticElement */
						
					} 
					else {
						//alert("Sorry, we could not find " + identifier + ".");
					}
					},this), $.proxy(function(geneticElement, identifier) {
					if(--numToLoad<=0)
					{
						if(mainGeneticElement){
							mainGeneticElement.updateListDom();
						}
						
					}
				},this));
			}
		}
		else{
			var term = list[0].term;
			var rValue = list[0].rValue;
			Eplant.activeSpecies.loadGeneticElementByIdentifier(term, $.proxy(function(geneticElement, identifier) {
				mainGeneticElement=geneticElement;
				if($.inArray(geneticElement, Eplant.activeSpecies.displayGeneticElements)==-1)
				{
					Eplant.activeSpecies.displayGeneticElements.push(geneticElement);
					geneticElement.loadViews();
				}
				//Eplant.updateGeneticElementPanel();
				numToLoad--;
				for(var i = 1;i<list.length;i++){
					var term = list[i].term;
					var rValue = list[i].rValue;
					Eplant.activeSpecies.loadGeneticElementByIdentifier(term, $.proxy(function(geneticElement, identifier) {
						if (geneticElement) {
							
							
							
							if(mainGeneticElement&&geneticElement.identifier!==mainGeneticElement.identifier&&$.inArray(geneticElement, mainGeneticElement.expressionAnglerGenes)==-1)
							{
								mainGeneticElement.expressionAnglerGenes.push(geneticElement);
								geneticElement.isRelated=true;
								geneticElement.relatedGene=mainGeneticElement;
								geneticElement.rValueToRelatedGene=rValue;
								/* Load views for GeneticElement */
								geneticElement.loadViews();
							}
							
							
							
						} 
						else {
							//alert("Sorry, we could not find " + identifier + ".");
						}
						},this), $.proxy(function(geneticElement, identifier) {
						if(--numToLoad<=0)
						{
							if(mainGeneticElement){
								mainGeneticElement.updateListDom();
							}
							
						}
					},this));
				}
			},this));
		}
		
		
	};
	
})();
