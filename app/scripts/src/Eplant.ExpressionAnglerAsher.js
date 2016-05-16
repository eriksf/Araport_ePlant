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
	Eplant.ExpressionAngler = function(URL, mainIdentifier,resultCount) {
		resultCount = parseInt(resultCount, 10);
		
		var dom = $('<div/>', {
		});
		dom.css({'text-align':'center'});
		var p = $('<div/>', {
			text: 'Loading, click cancel to stop loading.'
		});
		var propgressBar = $('<div/>', {
			'class': 'progressbar'
		});
		var propgressLabel = $('<div/>', {
			'class': 'progresslabel'
		});
		
		
		var cancelButton = $('<input/>', {
			type: 'button',
			value: "cancel",
			'class':'button greenbutton'
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
		$progressLabel = $( ".progresslabel",dom );
		
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
		
		// Data for Expression Angler Post request 
		var eaRegEx = /(.*)\?(agi_id=.*)/gmi;
		var eaMatch = eaRegEx.exec(URL);
		//eaMatch[2] = "agi_id=&use_custom_bait=yes&match_count=&lower_r_cutoff=0.75&upper_r_cutoff=1.00&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&Epidermis+and+Whole+Stem=on&expts=839-JO_total_stem_top+%5BAtGenExpress_Plus_PID%3A16299169%5D&custom_bait=1&expts=840-JO_total_stem_top+%5BAtGenExpress_Plus_PID%3A16299169%5D&custom_bait=1&expts=841-JO_epidermis_from_stem_top+%5BAtGenExpress_Plus_PID%3A16299169%5D&custom_bait=1&expts=842-JO_epidermis_from_stem_top+%5BAtGenExpress_Plus_PID%3A16299169%5D&custom_bait=200&expts=872-JO_epidermis_from_stem_base+%5BAtGenExpress_Plus_PID%3A16299169%5D&custom_bait=200&expts=873-JO_epidermis_from_stem_base+%5BAtGenExpress_Plus_PID%3A16299169%5D&custom_bait=1&expts=874-JO_total_stem_base+%5BAtGenExpress_Plus_PID%3A16299169%5D&custom_bait=1&expts=875-JO_total_stem_base+%5BAtGenExpress_Plus_PID%3A16299169%5D&custom_bait=1&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&custom_bait=-&database=AtGenExpress_Tissue_Plus_raw&alias_id=&alias_agi=";
		/*alert(eaMatch[1]);	// URL
			alert(eaMatch[2]);	// Data
		*/
		Eplant.expressionXhrService = $.ajax({
			beforeSend: function(request) {
					request.setRequestHeader('Authorization', 'Bearer ' + Agave.token.accessToken);
			},
			url: eaMatch[1],
			data: eaMatch[2], 
			type: "post",
			success: $.proxy(function( data ) {
				var doc = $.parseHTML(data)
				var tempLinkEle = $('b:contains("View data set as text")', doc);
				if(tempLinkEle.length>0){
					var tempFileLink = tempLinkEle.parent().attr('href').replace(/..\/.+_/i,'');
					var dataId = tempFileLink.replace(/.txt/i,'');
					Eplant.expressionXhrLink = $.ajax({
						beforeSend: function(request) {
							request.setRequestHeader('Authorization', 'Bearer ' + Agave.token.accessToken);
						},
  						url: ExpressionAnglerUrl + 'getData.php?id=' + dataId,
						type: 'get',
						success: $.proxy(function( list ) {
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
									if(/^[a-z0-9]+$/i.test(tarr[0])){
										lines.push(tarr);
									}
								}
							}
							var list = [];
							if(mainIdentifier&&lines[0][0].toUpperCase()===mainIdentifier.toUpperCase()){
								var term = lines[0][0];
								var rv = lines[0][1].split('|')[0];
								
								list.push({
									term:term,
									rValue:rv
								});
								
							}
							for(var i = 1;i<lines.length;i++){
								if(lines[i][0]){
									if(!mainIdentifier||lines[i][0].toUpperCase()!==mainIdentifier.toUpperCase()){
										var term = lines[i][0];
										var rv = lines[i][1].split('|')[0];
										if(parseInt(rv)<1){
											list.push({
												term:term,
												rValue:rv
											});
										}
									}
									
								}
							}
							list= list.slice(0, (mainIdentifier)?resultCount+1:resultCount);
							if(Eplant.expressionAnglerLoadingDialog) Eplant.expressionAnglerLoadingDialog.close();
							this.showFoundGenes(list,mainIdentifier,URL,resultCount);
						},this)
					});
				} else {
					var dom = $('<div/>', {
					});
					dom.css({'text-align':'center'});
					var p = $('<div/>', {
						html: '<pre style="font-weight:bold;background-color: #ffffff;">Results:</pre> <br> Expression Angler found 0 matches. <br>'
						}).css({
						'max-height': '400px',
						'overflow': 'auto'
					});
					$(dom).append(p);
					Eplant.expressionAnglerResultDialog = DialogManager.artDialogDynamic(dom[0]);
				}
			
			},this)
		})
		.always(function() {
			if(Eplant.expressionAnglerLoadingDialog) Eplant.expressionAnglerLoadingDialog.close();
		});
	};
	
	Eplant.showFoundGenes = function(list,mainIdentifier,URL,resultCount) {
		var dom = $('<div/>', {
		});
		dom.css({'text-align':'center','width': '250px','background-color': '#ffffff'});
		var text = mainIdentifier?'Expression Angler found '+(list.length-1)+' matches with similar expression patterns to '+mainIdentifier
		:'Expression Angler found '+list.length+' matches.';
		var pHead = $('<div/>', {
			html: '<pre style="font-weight:bold; background-color: #ffffff;">Results:</pre> '+text+' <br>'
			}).css({
			'max-height': '400px',
			'overflow': 'auto'
		});
		$(dom).append(pHead);
		var selectAllButton = $('<input/>', {
			type: 'button',
			value: "Select all",
			'class':'button'
		});
		selectAllButton.css({'margin-top':'10px',width:'220px'});
		selectAllButton.on('click', function(){
			if($(':checked',dom).length == $(':checkbox',dom).length){
				$(':checkbox',dom).prop('checked',false);
				$(this).val("Select all");
			}
			else{
				$(':checkbox',dom).prop('checked',true);
				$(this).val("Deselect all");
			}
			
			
		});
		$(dom).append(selectAllButton);
		var p = $('<div/>', {
			}).css({
			'max-height': '400px',
			'overflow': 'auto'
		});
		$(dom).append(p);
		if(list.length>0){
		p.append('<pre style="font-weight:bold;background-color: #ffffff;">&#9;    Gene&#9; &#9;r-value    &#9;<br></pre>');
		if(parseInt(list[0].rValue,10)>=1)
		{
			p.append('<pre style="background-color: #ffffff;"><input type="checkbox" name="found gene '+0+'" value="'+0+'" style="margin-right: 10px;vertical-align: middle;" checked>'+list[0].term+' &#9;'+list[0].rValue+' &#9;<br></pre>');
			}else{
			p.append('<pre style="background-color: #ffffff;"><input type="checkbox" name="found gene '+0+'" value="'+0+'" style="margin-right: 10px;vertical-align: middle;" >'+list[0].term+' &#9;'+list[0].rValue+' &#9;<br></pre>');
		}
		
		for(var i = 1; i<list.length;i++){
			p.append('<pre style="background-color: #ffffff;"><input type="checkbox" name="found gene '+i+'" value="'+i+'" style="margin-right: 10px;vertical-align: middle;">'+list[i].term+' &#9;'+list[i].rValue+' &#9;<br></pre>');
		}
		
		/*var cancelButton = $('<input/>', {
			type: 'button',
			value: "cancel",
			'class':'button greyButton'
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
			if(Eplant.expressionAnglerResultDialog) Eplant.expressionAnglerResultDialog.close();
		},Eplant));*/
		var moreGeneButton = $('<input/>', {
			type: 'button',
			value: "Get the next five matches",
			'class':'button'
		});
		moreGeneButton.css({'margin-top':'10px',width:'220px'});
		moreGeneButton.on('click',$.proxy(function(){
			if(Eplant.expressionAnglerResultDialog) Eplant.expressionAnglerResultDialog.close();
			if(resultCount){
				resultCount += 5;
				URL = URL.replace(/(match_count=)[^\&]+/, '$1' + resultCount);
			}
			Eplant.ExpressionAngler(URL, this.mainIdentifier, resultCount);
		},{resultCount:resultCount,mainIdentifier:mainIdentifier,EA:this}));
		$(dom).append(moreGeneButton);
		var continueButton = $('<input/>', {
			type: 'button',
			value: "Get data for selected genes",
			'class':'greenbutton'
		});
		continueButton.css({'margin-top':'10px',width:'220px'});
		continueButton.on('click',$.proxy(function(){
			var selectedList = [];
			$('input[type=checkbox]',p).each($.proxy(function(index,input){
				if(input.checked){
					selectedList.push(this.list[index]);
				}
				
			},this));
			this.EA.loadExpressionAnglerGenes(selectedList,this.mainIdentifier);
			if(Eplant.expressionAnglerResultDialog) Eplant.expressionAnglerResultDialog.close();
		},{list:list,mainIdentifier:mainIdentifier,EA:this}));
		$(dom).append(continueButton);
		
		}
		else{
			
		}
		
		Eplant.expressionAnglerResultDialog = DialogManager.artDialogDynamic(dom[0]);
	};
	
	
	Eplant.loadExpressionAnglerGenes = function(list,mainIdentifier) {
		var numToLoad = list.length;
		if(mainIdentifier){
			var mainGeneticElement=Eplant.activeSpecies.getGeneticElementByIdentifier(mainIdentifier);
		}
		if(mainGeneticElement){
			for(var i = 0;i<list.length;i++){
				var term = list[i].term;
				var rValue = list[i].rValue;
				Eplant.activeSpecies.loadGeneticElementByIdentifier(term, $.proxy(function(geneticElement, identifier) {
					if (geneticElement) {
						
						if(mainGeneticElement&&geneticElement.identifier!==mainGeneticElement.identifier&&$.inArray(geneticElement, Eplant.activeSpecies.displayGeneticElements)==-1)
						{
							geneticElement.isRelated=true;
							geneticElement.relatedGene=mainGeneticElement;
							geneticElement.rValueToRelatedGene=rValue;
							Eplant.activeSpecies.displayGeneticElements.push(geneticElement);
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
						Eplant.updateGeneticElementPanel();
						
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
							
							if(mainGeneticElement&&geneticElement.identifier!==mainGeneticElement.identifier&&$.inArray(geneticElement, Eplant.activeSpecies.displayGeneticElements)==-1)
							{
								geneticElement.isRelated=true;
								geneticElement.relatedGene=mainGeneticElement;
								geneticElement.rValueToRelatedGene=rValue;
								Eplant.activeSpecies.displayGeneticElements.push(geneticElement);
								geneticElement.loadViews();
							}
							
							
						} 
						else {
							//alert("Sorry, we could not find " + identifier + ".");
						}
						},this), $.proxy(function(geneticElement, identifier) {
						if(--numToLoad<=0)
						{
							Eplant.updateGeneticElementPanel();
							
						}
					},this));
				}
			},this));
		}
		
		
	};
	
})();
