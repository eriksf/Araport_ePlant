
/**
	* Eplant.ViewMode namespace
	*
	* This namespace contains view modes used in ePlant.
	*
	* @namespace
*/
Eplant.ViewModes= {};
Eplant.ViewModes.zui = $('#ZUI_container');
Eplant.ViewModes.home = $('#home_container');
Eplant.ViewModes.svg = $('#efp_holder');
Eplant.ViewModes.heatmap = $('#heatmap_container');
Eplant.ViewModes.sequence = $('#Sequence_cachea');
Eplant.ViewModes.cytoscape = $('#Cytoscape_container');
Eplant.currentViewModes = 'home';

/* Switch view mode */
Eplant.switchViewMode = function(mode) {
	if(Eplant.ViewModes[mode])
	{
		for (var viewMode in Eplant.ViewModes) {
			if (Eplant.ViewModes.hasOwnProperty(viewMode)) {
				$(Eplant.ViewModes[viewMode]).hide();
			}
		}
		
		$(Eplant.ViewModes[mode]).show();
		Eplant.currentViewModes = mode;
		
	}
};
Eplant.screenShotForCurrent = function() {
	var $toPrint = $(Eplant.ViewModes[Eplant.currentViewModes])/*'#viewPort'*/;
	if(Eplant.currentViewModes ==='svg'){
		var $toPrint = $('#efp_container');
	}
	var containerElement = document.createElement("div");
	$(containerElement).css({
		'position': 'absolute',
		bottom:'2%',
		left:'-50%',
		width:'80%',
		'margin-left': '65%',
		color:'grey',
		opacity:0.8
	});
	
	
	
	
	
	$(containerElement).enableSelection();
	containerElement.style.textAlign = "left";
	containerElement.innerHTML = "Loading citation...";
	$.ajax({
		beforeSend: function(request) {
			request.setRequestHeader('Authorization', 'Bearer ' + Agave.token.accessToken);
		},
		type: "GET",
		url: Eplant.ServiceUrl + "citation.cgi?view=" + ZUI.activeView.name,
		dataType: "json"
		}).done(function(response) {
		var content = '';
		content += "This image was  generated with the ePlant <i>" + Eplant.activeSpecies.scientificName + "</i> " + response.view + "  at bar.utoronto.ca by Waese, Fan, Yu, Pasha & Provart 2015.";
		containerElement.innerHTML =content;
	})
	.fail(function(){
		containerElement.innerHTML ='No citation information available for this view.';
	})
	.always($.proxy(function(){

		var addedEle = [];
		/*
				var parent = $($toPrint).parent();
		var percent = Math.round(2048/$(window).width()*100)+'%';
		
		var domScreenshotContainer= document.createElement("div");
		addedEle.push(domScreenshotContainer);
		$(domScreenshotContainer).css({
			
			width: percent,
			'position': 'absolute',
			left: '0%',
			top: '0%',
			height:percent
		}).appendTo(document.body);
		
		$($toPrint).appendTo(domScreenshotContainer);
		*/
		if($('svg',$toPrint).length>0)
		{
			$('svg',$toPrint).each(function() {
				var c = document.createElement('canvas');
				$(c).css({
					left:$(this).position().left,
					top:$(this).position().top,
					position:'absolute'
				})
				var svgStr=(new XMLSerializer()).serializeToString(this);//$(this).html().replace(/>\s+/g, ">").replace(/\s+</g, "<").replace(/<canvas.+/g,"");
				$toPrint.append(c);
				canvg(c,svgStr);
				addedEle.push(c);
				$(this).hide();
			});	
		}
		if(containerElement.innerHTML !=='No citation information available for this view.'){
			
			$toPrint.append(containerElement);
			addedEle.push(containerElement);
		}
		html2canvas($toPrint, {
			onrendered: function(canvas) {
				if (canvas) {
					var imgUrl = canvas.toDataURL();
					var filename = $('#tabUl').find('.ui-tabs-active .fullTab').text();
					var img = $('<img />', { 
						src: imgUrl,
						alt: 'Screenshot'
						}).css({
						'max-width': '100%',
						'max-height': '100%',
						width: 'auto',
						height: 'auto'
					});
					var link = $('<a />', { 
						'download':filename,
						'href':imgUrl
					}).append(img);
					var domImageContainer= document.createElement("div");
					$(domImageContainer).css({
						'overflow': 'hidden',
						width: '50%',
						'position': 'absolute',
						left: '25%',
						top:'20%',
						border: '1px solid #aaaaaa'
					});
					$(domImageContainer).append(link);
					
					
					/* Create image container DOM element */
					
					/* Create container DOM element */
					var domContainer= document.createElement("div");
					
					/* Create title DOM element */
					var domTitle = $('<p>Left click the image or <a href="'+imgUrl+'" download="'+filename+'" style="color:#99cc00;">here</a> to download.</p>');
					/* Set CSS class of title for styling */
					$(domTitle).css({
						'font-size': '30px',
						'line-height': '56px',
						color:'#000'
					});
					
					
					//$(domTitle).html("Right click on the image to download");
					
					
					/* Add title DOM element to the container */
					$(domContainer).append(domTitle);
					$(domContainer).append(domImageContainer);
					
					
					//$(domContainer).append(containerElement);
					
					
					DialogManager.artDialog(domContainer);
					
					
					} else {
					alert("Sorry! Screen capture is not available for this view.");
				}
				//$toPrint.appendTo(parent);
				if(addedEle.length>0)
				{
					for(var i =0;i<addedEle.length;i++)
					{
						var c = addedEle.pop();
						$(c).remove();
					}
				}
				$('svg',$toPrint).each(function() {
					$(this).show();
				});
				
			}
			
		});
	},this));
	
		};
		
				
