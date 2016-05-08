
// ┌─────────────────────────────────────────────────────────────────────┐ \\
// │ Expression Angler 2015                                              │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ JavaScript Functions                                                │ \\
// ├─────────────────────────────────────────────────────────────────────┤ \\
// │ Copyright (c) 2015 Jamie Waese & Nicholas Provart                   │ \\
// │ University of Toronto                                               │ \\
// └─────────────────────────────────────────────────────────────────────┘ \\

/* -------------------------------------------------- */
// Build JSON array to hold all XML group names and sample Names
var ADAMAUrl = "https://api.araport.org/community/v0.3/asher-dev/expression_angler_service_v0.2/access/"
var allViews = [ "AbioticStress",
"Chemical",
"DevelopmentalMap",
"TissueSpecificEmbryoDevelopment",
"TissueSpecificGuardAndMesophyllCells",
"TissueSpecificMicrogametogenesis",
"TissueSpecificPollenGermination",
"TissueSpecificRoot",
"TissueSpecificShootApicalMeristem",
"TissueSpecificStemEpidermis",
"TissueSpecificStigmaAndOvaries",
"TissueSpecificTrichomes",
"TissueSpecificXylemAndCork"];

var sampleDBs = [  "AtGenExpress_Plus",
"AtGenExpress_Plus",
"AtGenExpress_Plus_3",
"AtGenExpress_Plus_55",
"AtGenExpress_Plus_PID:18284694",
"AtGenExpress_Plus_48",
"AtGenExpress_Plus_2",
"AtGenExpress_Plus_PID:14671301",
"AtGenExpress_Plus",
"AtGenExpress_Plus",
"AtGenExpress_Plus_PID:16299169",
"AtGenExpress_Plus_GEO:GSE3056",
"AtGenExpress_Plus",
"AtGenExpress_Plus_92"
];

// this list of databases needs to be in the same order as the list of views
var allDBs = [  "AtGenExpress_Stress_raw",
"AtGenExpress_Hormone_raw",
"AtGenExpress_Tissue_Plus_raw",
"AtGenExpress_Tissue_Plus_raw",
"AtGenExpress_Tissue_Plus_raw",
"AtGenExpress_Tissue_Plus_raw",
"AtGenExpress_Tissue_Plus_raw",
"AtGenExpress_Tissue_Plus_raw",//"AtGenExpress_Root_raw",
"AtGenExpress_Tissue_Plus_raw",
"AtGenExpress_Tissue_Plus_raw",
"AtGenExpress_Tissue_Plus_raw",
"AtGenExpress_Tissue_Plus_raw",
"AtGenExpress_Tissue_Plus_raw"];



/*var allDBs = [  "atgenexp_stress",
	"atgenexp_hormone",
	"atgenexp_plus",
	"atgenexp_plus",
	"atgenexp_plus",
	"atgenexp_plus",
	"atgenexp_plus",
	"atgenexp_plus",
	"atgenexp_plus",
	"atgenexp_plus",
	"atgenexp_plus",
	"atgenexp_plus",
"atgenexp_plus"];*/


// create filenames
var allXMLfiles = [];
var allSVGfiles = [];
var allInfoFiles = [];
for (var i=0; i<allViews.length; i++) {
    allXMLfiles.push("data/"+allViews[i]+".xml");
    allSVGfiles.push("data/"+allViews[i]+".svg");
}

// now store all tissues from all the XML files in an array called allTissues[]
// (each element is {db, view, tissue, value, color})
var allTissues = [];
var allViewInfos = {};
for (var i=0; i<allViews.length; i++) {
    // load the xml file
    var xmlDoc = loadXMLDoc(allXMLfiles[i]);
	
    // store the database tag from the XML files !! These are different from what the Expression Angler code uses
    var db = xmlDoc.getElementsByTagName('view')[0].getAttributeNode('db').value;
    //console.log(allXMLfiles[i]+" "+db);
	
    // store all the info files
    var info = xmlDoc.getElementsByTagName('info')[0]; //.getAttributeNode('db').value;
    allInfoFiles[i] = info.innerHTML;
	
    // find its tissues
    for (var j=0; j< xmlDoc.getElementsByTagName('tissue').length; j++) {
        tissuesInView = xmlDoc.getElementsByTagName('tissue');
	}
	
    // add each tissue to the allTissues array
    var tissuesInView;
	allViewInfos[allViews[i]]={};
	allViewInfos[allViews[i]].tissues = [];
    for (var j=0; j< tissuesInView.length; j++) {
		if(tissuesInView[j].id.toUpperCase()!== "CONTROL"){;
			var colorKey = tissuesInView[j].getAttributeNode("colorKey").value;
			var url = tissuesInView[j].getElementsByTagName('link')[0].getAttributeNode("url").value;
			var allSamples = tissuesInView[j].getElementsByTagName('sample');
			var samples = [];
			for (var k=0; k<allSamples.length; k++) {
				samples.push(tissuesInView[j].getElementsByTagName('sample')[k].getAttributeNode('name').value)
			}
			// now save it to the array
			var thisTissue = {"db": db, "view":allViews[i],"tissue":tissuesInView[j].id, "value":"null", "color":"#FFFFFF", "colorKey":colorKey, "link":url, "samples":samples}; 
			allTissues.push(thisTissue);
			allViewInfos[allViews[i]].tissues.push(thisTissue);
		}
	}
}
/* -------------------------------------------------- */
// Load all svg images into hidden divs in the #displayWindow
for (var i=0; i<allViews.length; i++) {
    $('#displayWindow').append('<div id="'+allViews[i]+'" style="display:none;height:100%"><img class="svg" src="'+allSVGfiles[i]+'"></div>');
}

/* -------------------------------------------------- */
// load XMLDoc function
function loadXMLDoc(dname)
{
    if (window.XMLHttpRequest)
    {
        xhttp=new XMLHttpRequest();
	}
    else
    {
        xhttp=new ActiveXObject("Microsoft.XMLHTTP");
	}
    xhttp.open("GET",dname,false);
    xhttp.send();
    return xhttp.responseXML;
}


/* -------------------------------------------------- */
/*  Replaces all SVG images with the class="svg" tag with inline SVG so we can access the <g>'s'
from: http://jsfiddle.net/3jbumc07/12/ */
jQuery(document).ready(function() {
    /*
		* Replace all SVG images with inline SVG
	*/
	jQuery('img.svg').each(function(){
		var $img = jQuery(this);
		var imgID = $img.attr('id');
		var imgClass = $img.attr('class');
		var imgURL = $img.attr('src');
		
		jQuery.get(imgURL, function(data) {
			// Get the SVG tag, ignore the rest
			var $svg = jQuery(data).find('svg');
			
			$svg.css('height','100%');
			
			// Add replaced image's ID to the new SVG
			if(typeof imgID !== 'undefined') {
				$svg = $svg.attr('id', imgID);
			}
			// Add replaced image's classes to the new SVG
			if(typeof imgClass !== 'undefined') {
				$svg = $svg.attr('class', imgClass+' replaced-svg');
			}
			
			// Remove any invalid XML tags as per http://validator.w3.org
			$svg = $svg.removeAttr('xmlns:a');
			
			// Replace image with new SVG
			$img.replaceWith($svg);
			
			// Add an handler
			jQuery('path').each(function() {
				//jQuery(this).click(function() {alert(jQuery(this).attr('id'));});                       
			});
			$('g', $svg).each(function() {
				var tissueDom = this;
				if(this.id){
					var index = findIndexByKeyValue(allTissues, 'tissue', this.id);
					if(!isNaN(parseFloat(index)) && isFinite(index)){
						$(this).qtip({
							id:this.id+'_tooltip',
							content: {
								text: '',
								title:' '
							},
							style: {
								classes: 'qtip-bootstrap',
								tip: {
									corner: true,
									width: 20,
									height:10
								}
							},
							show: 'click',
							hide: {
								fixed: true,
								event:'unfocus'
							},
							position:{
								my:"center right",
								at:"center left",
								target: 'mouse', // Track the mouse as the positioning target
								adjust: { x: -5 } // Offset it slightly from under the mouse
							},
							events: {
								show: function(event, api) {
									var content = $('#setExpressionLevelDiv');
									content.show();
									$(api.elements.content).append(content);
									setExpressionLevel(tissueDom.id);								
									api.set({
										'content.title': $('#setLevel-tissueName').text()
									});
									// figure out which index number that corresponds to in allTissues
									var index = findIndexByKeyValue(allTissues, 'tissue', tissueDom.id);
									var tissue = allTissues[index]
									
									
									if(!tissue.value||tissue.value==="null"){
										$('#originalExpressionLevelValue').val("null");
										updatetissue(tissue,0);
									}
									else{
										$('#originalExpressionLevelValue').val(tissue.value);
										updatetissue(tissue,tissue.value);
									}
								},
								hide: function(event, api) {
									restoreExpressionLevel();
								}
							}
						});
					}
				}
				
			});
			
		});
		
	});
});

function closeCurrentTooltip(e){
	$(e).closest(".qtip").qtip("hide");
}


/* -------------------------------------------------- */
// Initialize the Select View dropdown menu
var selectedView = "Developmental Map";
updateDisplayWindow();
$(".dropdown-menu li a").click(function(){
    selectedView = $(this).text();
    $(this).parents('.btn-group').find('#dropdownSelectedItem').html(selectedView);
    updateDisplayWindow();
	if($("ul#viewTabList #tableViewLi").hasClass("active"))
	{
		generateSelectionTable();
	}
});



/* -------------------------------------------------- */
// Respond to the View Selector dropdown menu
var activeView = 2;
function updateDisplayWindow() {
    // hide everything
    for (var i=0; i<allViews.length; i++) {
        $('#'+allViews[i]).css('display','none');
	}
	
    // now only show the selected item
    switch (selectedView) {
		
        case "Abiotic Stress":
		$('#AbioticStress').css('display','block');
		activeView = 0;
		//$('#displayWindow').html('<img class="svg" id="SVGAbioticStress" src="data/AbioticStress.svg" type="image/svg+xml">');
		break;
		
        case "Chemical Stress":
		$('#Chemical').css('display','block');
		activeView = 1;
		//$('#displayWindow').html('<img class="svg" id="SVGChemicalStress" src="data/Chemical.svg" type="image/svg+xml">');
		break;   
		
        case "Developmental Map":
		$('#DevelopmentalMap').css('display','block');
		activeView = 2;
		break;
		
        case "Embryo Development":
		$('#TissueSpecificEmbryoDevelopment').css('display','block');
		activeView = 3;
		//$('#displayWindow').html('<img class="svg" id="SVGEmbryoDevelopment" src="data/TissueSpecificEmbryoDevelopment.svg" type="image/svg+xml">');
		break;
		
        case "Guard and Mesophyll Cells":
		$('#TissueSpecificGuardAndMesophyllCells').css('display','block');
		activeView = 4;
		//$('#displayWindow').html('<img class="svg" id="SVGGuardAndMesophyllCells" src="data/TissueSpecificGuardAndMesophyllCells.svg" type="image/svg+xml">');
		break;
		
        case "Microgametogenesis":
		$('#TissueSpecificMicrogametogenesis').css('display','block');
		activeView = 5;
		//$('#displayWindow').html('<img class="svg" id="SVGMicrogametogenesis" src="data/TissueSpecificMicrogametogenesis.svg" type="image/svg+xml">');
		break;
		
        case "Pollen Germination":
		$('#TissueSpecificPollenGermination').css('display','block');
		activeView = 6;
		//$('#displayWindow').html('<img class="svg" id="SVGPollenGermination" src="data/TissueSpecificPollenGermination.svg" type="image/svg+xml">');
		break;
		
        case "Root":
		$('#TissueSpecificRoot').css('display','block');
		activeView = 7;
		//$('#displayWindow').html('<img class="svg" id="SVGRoot" src="data/TissueSpecificRoot.svg" type="image/svg+xml">');
		break;
		
        case "Shoot Apical Meristem":
		$('#TissueSpecificShootApicalMeristem').css('display','block');
		activeView = 8;
		//$('#displayWindow').html('<img class="svg" id="SVGShootApicalMeristem" src="data/TissueSpecificShootApicalMeristem.svg" type="image/svg+xml">');
		break;
		
        case "Stem Epidermis":
		$('#TissueSpecificStemEpidermis').css('display','block');
		activeView = 9;
		//$('#displayWindow').html('<img class="svg" id="SVGStemEpidermis" src="data/TissueSpecificStemEpidermis.svg" type="image/svg+xml">');
		break;
		
        case "Stigma and Ovaries":
		$('#TissueSpecificStigmaAndOvaries').css('display','block');
		activeView = 10;
		//$('#displayWindow').html('<img class="svg" id="SVGStigmaAndOvaries" src="data/TissueSpecificStigmaAndOvaries.svg" type="image/svg+xml">');
		break;
		
        case "Trichomes":
		$('#TissueSpecificTrichomes').css('display','block');
		activeView = 11;
		//$('#displayWindow').html('<img class="svg" id="SVGTrichomes" src="data/TissueSpecificTrichomes.svg" type="image/svg+xml">');
		break;
		
        case "Xylem and Cork":
		$('#TissueSpecificXylemAndCork').css('display','block');
		activeView = 12;
		//$('#displayWindow').html('<img class="svg" id="SVGXylemAndCork" src="data/TissueSpecificXylemAndCork.svg" type="image/svg+xml">');
		break;
		
	}
}


/* -------------------------------------------------- */
// Return a color from yellow to red based on an input from 0 to 1000
function calculateColor(value) {
    var c = Math.round( 255 - ((value/1000)*255) );
    var color = "rgb(255,"+c+",0)";
    return color;
}

/* -------------------------------------------------- */
// update all the colors in the SVG image
function updateColors() {
    for (var i=0; i<allTissues.length; i++){
		$('#'+allTissues[i].tissue).attr({ fill: allTissues[i].color });
		//console.log(allTissues[i].tissue+" "+allTissues[i].value+" "+allTissues[i].color);
	}
}

/* -------------------------------------------------- */
// set null values for all the tissues in the SVG image
function resetAllTissues() {
    for (var i=0; i<allTissues.length; i++){
		if (allTissues[i].view === allViews[activeView]) { // only include items for the active view
			allTissues[i].value = "null";
			allTissues[i].color = "#FFFFFF";
		}
	}
    updateColors();
}

/* -------------------------------------------------- */
// set maximum values for all the tissues in the SVG image
function randomAllTissues() {
    for (var i=0; i<allTissues.length; i++){
		if (allTissues[i].view === allViews[activeView]) { // only include items for the active view
			var rand = 1000*Math.random();
			allTissues[i].value = rand;
			allTissues[i].color = calculateColor(rand);
		}
	}
    updateColors();
}

/* -------------------------------------------------- */
// set maximum values for all the tissues in the SVG image
function maxAllTissues() {
    for (var i=0; i<allTissues.length; i++){
		if (allTissues[i].view === allViews[activeView]) { // only include items for the active view
			allTissues[i].value = 1000;
			allTissues[i].color = calculateColor(1000);
		}
	}
    updateColors();
}

/* -------------------------------------------------- */
// set minimum values for all the tissues in the SVG image
function minAllTissues() {
    for (var i=0; i<allTissues.length; i++){
		if (allTissues[i].view === allViews[activeView]) { // only include items for the active view
			allTissues[i].value = 0;
			allTissues[i].color = calculateColor(0);
		}
	}
    updateColors();
}


/* -------------------------------------------------- */
// set exclude from search for all the tissues in the SVG image
function toggleButtonAvailability() {
    setTimeout(function() { // this stuff is happens after 200 ms because it wasn't registerring when called immediately
        if ( $('#user_agi').val() != "" ) {
            // make select sample buttons available
            $('#ToolbarSelectAllSamples').css("display","block");
            $('#ToolbarExcludeAllSamples').css("display","block");
            $('#selectThisSampleButton').css("display","block");
            $('#excludeThisSampleButton').css("display","block");
            $('#TableSelectAllSamplesButton').css("display","block");          
            $('#TableExcludeAllSamplesButton').css("display","block");
			
            // hide Min Max and Reset buttons
            $('#ToolbarMinButton').css("display","none");
            $('#ToolbarMaxButton').css("display","none");
            $('#ToolbarResetButton').css("display","none");
            $('#ModalResetButton').css("display","none");
            $('#TableMaxForAll').css("display","none");
            $('#TableMinForAll').css("display","none");
            $('#TableResetAll').css("display","none");
			
			
			// hide slider
			$('#expressionLevelSlider').css("display","none");
			$('#selectThisSampleButton').css("display","block");
			$('#excludeThisSampleButton').css("display","block");
			
			//includeAllSamplesInSearch();    
		}
        else {
			// make select sample buttons unavailable
			$('#ToolbarSelectAllSamples').css("display","none");
			$('#ToolbarExcludeAllSamples').css("display","none");
			$('#selectThisSampleButton').css("display","none");
			$('#excludeThisSampleButton').css("display","none");
			$('#TableSelectAllSamplesButton').css("display","none");
			$('#TableExcludeAllSamplesButton').css("display","none");
			
			// show Min Max and reset buttons
			$('#ToolbarMinButton').css("display","block");
			$('#ToolbarMaxButton').css("display","block");
			$('#ToolbarResetButton').css("display","block");
			$('#ModalResetButton').css("display","block");
			$('#TableMaxForAll').css("display","block");
			$('#TableMinForAll').css("display","block");
			$('#TableResetAll').css("display","block");
			
			
			// hide slider
			$('#expressionLevelSlider').css("display","block");
			$('#selectThisSampleButton').css("display","none");
			$('#excludeThisSampleButton').css("display","none");
			
			
			
			
			
			resetAllTissues();    
		}
	},200);
}

/* -------------------------------------------------- */
// include all sample in search for all the tissues in the SVG image
function includeAllSamplesInSearch() {
	for (var i=0; i<allTissues.length; i++){
		if (allTissues[i].view === allViews[activeView]) { // only include items for the active view
			allTissues[i].value = "included";
			allTissues[i].color = "#999999";
		}
	}
	updateColors();
}


/* -------------------------------------------------- */
// exclude all samples in search for all the tissues in the SVG image
function excludeAllSamplesFromSearch() {
	for (var i=0; i<allTissues.length; i++){
		if (allTissues[i].view === allViews[activeView]) { // only include items for the active view
			allTissues[i].value = "excluded";
			allTissues[i].color = "#FFFFFF";
		}
	}
	updateColors();
}

/* -------------------------------------------------- */
// Include tissue in search button (on modal popup) - sets value of current tissue to include and makes background grey
function includeTissueInSearch() {
	//console.log("Exclude");
	$('#textboxAbsolute').val("included");
	$('#textboxAbsolute').css("background-color", "#999999");
	$('#expressionLevelSlider').val(0);
	
	$('#selectThisSampleButton').addClass("active");
	$('#excludeThisSampleButton').removeClass("active");
	
	
	// get name of tissue we're adjusting
	var tissue = $('#setLevel-tissueName').text()
	
	// figure out which index number that corresponds to in allTissues
	var index = findIndexByKeyValue(allTissues, 'tissue', tissue);
	
	// reset the value and color in allTissues to null
	allTissues[index].value = "included";
	allTissues[index].color = "#999999";
	
	// update the color on the svg shape 
	$('#'+tissue).attr({ fill: "#999999" });
}




function excludeTissueFromSearch() {
	$('#textboxAbsolute').val("excluded");
	$('#textboxAbsolute').css("background-color", "#FFFFFF");
	$('#expressionLevelSlider').val(0);
	
	$('#selectThisSampleButton').removeClass("active");
	$('#excludeThisSampleButton').addClass("active");
	
	
	// get name of tissue we're adjusting
	var tissue = $('#setLevel-tissueName').text()
	
	// figure out which index number that corresponds to in allTissues
	var index = findIndexByKeyValue(allTissues, 'tissue', tissue);
	
	// reset the value and color in allTissues to null
	allTissues[index].value = "excluded";
	allTissues[index].color = "#FFFFFF";
	
	// update the color on the svg shape 
	$('#'+tissue).attr({ fill: "#FFFFFF" });
}

/* -------------------------------------------------- */
// mouse over svg tissue event listeners
var activeTissue = "";
function mouseOverTissue(tissue) {
	showTooltip(tissue.id);
	activeTissue = tissue.id;
}

function mouseClick(tissueDom) {
	setExpressionLevel(tissueDom.id);
	activeTissue = tissueDom.id;
	
	// figure out which index number that corresponds to in allTissues
	var index = findIndexByKeyValue(allTissues, 'tissue', tissueDom.id);
	var tissue = allTissues[index]
	
	
	if(!tissue.value||tissue.value==="null"){
		$('#originalExpressionLevelValue').val("null");
		updatetissue(tissue,0);
	}
	else{
		$('#originalExpressionLevelValue').val(tissue.value);
		updatetissue(tissue,tissue.value);
	}
	
}

function mouseOut() {
	//console.log("Out");
	hideTooltip();
	activeTissue = "";
}


/* -------------------------------------------------- */
// Show & hide values in a tooltip upon mouse over
function showTooltip(tissue) {
	// console.log(tissue);
	var moveLeft = 20;
	var moveUp = 30;
	// put the tissue name in the box
	$('#tissue-title').text(tissue);
	
	// put the tissue value in the box
	var result = $.grep(allTissues, function(e){ return e.tissue == tissue}); // a nifty function to find elements in an array of JSON objects
	var value = result[0].value;
	$('#tissue-value').text("Value: "+value);
	
	// show the box and move it according to mouse position
	$(document).mousemove(function(event){
        //console.log("X: " + event.pageX + ", Y: " + event.pageY);
        $('#tissue-pop-up').css({'visibility':'visible', 'opacity':'1','transition-delay':'0.1s'})
        .css('top', event.offsetY - moveUp)
        .css('left',event.offsetX + moveLeft)
	});
}

function hideTooltip() {
	//console.log("hide it now");
	$(document).mousemove(function(event){
        $('#tissue-pop-up').css({'visibility':'hidden', 'opacity':'0','transition-delay':'0s'});
	});
}


/* -------------------------------------------------- */
// Two Handle Range slider for R-value setting
$(function() {
	$( "#r-value-slider-range" ).slider({
		range: true,
		min: -100,
		max: 100,
		values: [ 75, 100 ],
		slide: function( event, ui ) {
			$( "#amount" ).val((ui.values[ 0 ]/100) + " to " + (ui.values[ 1 ]/100) );
		},
		create: function(){
			switchLimitResultDOM();	
		}
	});
	$( "#amount" ).val( $( "#r-value-slider-range" ).slider( "values", 0 ) +
	" - " + $( "#r-value-slider-range" ).slider( "values", 1 ) ).css("color", "black");
});


/* -------------------------------------------------- */
// Opens the select expression level modal popup
function setExpressionLevel(tissue) {
	
	var index = findIndexByKeyValue(allTissues, 'tissue', tissue)
	var value = allTissues[index].value;
	var color;
	
	// set slider level
	if (value === "null") {
        $('#expressionLevelSlider').val(0);
        color = "#FFFFFF";
        $('#selectThisSampleButton').removeClass("active");
        $('#excludeThisSampleButton').removeClass("active");
	}
	else if (value === "included") {
        $('#selectThisSampleButton').addClass("active");
        $('#excludeThisSampleButton').removeClass("active");
        color = "#999999";
	}
	else if (value === "excluded") {
        $('#selectThisSampleButton').removeClass("active");
        $('#excludeThisSampleButton').addClass("active");
        color = "#FFFFFF";
	}
	else {
        $('#expressionLevelSlider').val(value);
        color = calculateColor(value);
	}
	
	// put value in text box
	$('#textboxAbsolute').val(value);
	
	// set background color of text box
	$('#textboxAbsolute').css("background-color", color);
	$('#textboxAbsolute').css("background-color", color);
	
	// open the modal popup with the slider control
	$('#setLevel-tissueName').text(tissue);
	//$('#setExpressionLevelModal').modal('toggle');
	
	
	
	// select the text box so it's read to be typed into
	setTimeout(function(){
        $('#textboxAbsolute').click();
	},500);
}


/* -------------------------------------------------- */
// Absolute slider
function updateexpressionLevelSlider(value){
	// constrain value within acceptable limits
	if (value > 1000) {
        value = 1000;
	}
	if (value < 0) {
        value = 0;
	}
	// get name of tissue we're adjusting
	var tissueId = $('#setLevel-tissueName').text()
	var index = findIndexByKeyValue(allTissues, 'tissue', tissueId);
	var tissue = allTissues[index]
	updatetissue(tissue,value);
}
function minTissue(){
	// get name of tissue we're adjusting
	var tissueId = $('#setLevel-tissueName').text()
	var index = findIndexByKeyValue(allTissues, 'tissue', tissueId);
	var tissue = allTissues[index]
	updatetissue(tissue,0);
}
function maxTissue(){
	// get name of tissue we're adjusting
	var tissueId = $('#setLevel-tissueName').text()
	var index = findIndexByKeyValue(allTissues, 'tissue', tissueId);
	var tissue = allTissues[index]
	updatetissue(tissue,1000);
}

function restoreExpressionLevel(){
	var value = $('#originalExpressionLevelValue').val();
	// get name of tissue we're adjusting
	var tissueId = $('#setLevel-tissueName').text()
	var index = findIndexByKeyValue(allTissues, 'tissue', tissueId);
	var tissue = allTissues[index]
	updatetissue(tissue,value);
}

function saveExpressionLevel(){
	var newValue = $('#textboxAbsolute').val();
	var value = $('#originalExpressionLevelValue').val(newValue);

}


function updatetissue(tissue,value){
	// adjust the value and color of the text box according to the slider level
	var color = ((value==="null")? "#FFFFFF":calculateColor(value));
	$('#textboxAbsolute').val(value);
	$('#textboxAbsolute').css("background-color", color);
	$('#expressionLevelSlider').val(value); // redundant if user accesses this function by adjusting the slider, necessesary if user accesses this function by entering value in text box
	$('#tissue-value').text("Value: "+value);
	
	// store the value and color in the array of allValues
	tissue.value = value;
	tissue.color = color;
	
	// now adjust the fill color of the SVG shape
	$('#'+tissue.tissue).attr({ fill: tissue.color });
}


/* -------------------------------------------------- */
// Reset individual tissue button (on modal popup) - sets value of current tissue to undefined and makes background white
function resetButton() {
	$('#textboxAbsolute').val("null");
	$('#textboxAbsolute').css("background-color", "#FFFFFF");
	$('#expressionLevelSlider').val(0);
	
	// get name of tissue we're adjusting
	var tissue = $('#setLevel-tissueName').text()
	
	// figure out which index number that corresponds to in allTissues
	var index = findIndexByKeyValue(allTissues, 'tissue', tissue);
	
	// reset the value and color in allTissues to null
	allTissues[index].value = "null";
	allTissues[index].color = "#FFFFFF";
	
	// update the color on the svg shape 
	$('#'+tissue).attr({ fill: "#FFFFFF" });
}


/* -------------------------------------------------- */
// Reset individual tissue button (on Custom Bait Table) - sets value of current tissue to undefined and makes background white
function resetTissueTableButton(i) {
	
	// reset the value and color in allTissues to null
	allTissues[i].value = "null";
	allTissues[i].color = "#FFFFFF";
	
	// update the color on the svg shape 
	$('#'+allTissues[i].tissue).attr({ fill: "#FFFFFF" });
	
	generateSelectionTable();
}

/* -------------------------------------------------- */
// Reset individual tissue button (on Custom Bait Table) - sets value of current tissue to included and makes background grey
function includeTissueTableButton(i) {
	
	// reset the value and color in allTissues to null
	allTissues[i].value = "included";
	allTissues[i].color = "#999999";
	
	// update the color on the svg shape 
	$('#'+allTissues[i].tissue).attr({ fill: "#999999" });
	
	generateSelectionTable();
}

/* -------------------------------------------------- */
// Exclude individual tissue button (on Custom Bait Table) - sets value of current tissue to excluded and makes background white
function excludeTissueTableButton(i) {
	
	// reset the value and color in allTissues to null
	allTissues[i].value = "excluded";
	allTissues[i].color = "#FFFFFF";
	
	// update the color on the svg shape 
	$('#'+allTissues[i].tissue).attr({ fill: "#FFFFFF" });
	
	generateSelectionTable();
}

/* -------------------------------------------------- */
// Link to NASCArrays button (on modal popup) 
function linkToURL() {
	// get name of tissue we're adjusting
	var tissue = $('#setLevel-tissueName').text()
	
	// figure out which index number that corresponds to in allTissues
	var index = findIndexByKeyValue(allTissues, 'tissue', tissue);
	
	var link = allTissues[index].link;
	
	window.open(link);
	
}

/* -------------------------------------------------- */
// Keyboard listener for adjusting the expressionLevelSlider
// from: http://javascript.info/tutorial/keyboard-events
document.onkeydown = function(e) {
	//console.log(e);
	
	// if Set Expression Level modal isn't open, and mouse is over a tissue, and the SelectionTable isn't open, open the modal
	var popupOpen = $('#setExpressionLevelModal').hasClass('in');
	if(!popupOpen && activeTissue != "" && !$('#selectionTableModal').hasClass('in')) {
        setExpressionLevel(activeTissue);
	}
	
	// if Set Expression Level modal is open, adjust the slider based on keyboard input
	var tissue = $('#setLevel-tissueName').text();
	var level = getCurrentLevelOfTissue(tissue);
	if (level === "null") {
        level = 0;
	}
	
	e = e || event
	
	if ( $('#user_agi').val() == "" ) { 
		
		switch(e.keyCode) {
			case 37: // left
			updateexpressionLevelSlider(level-100);
			//console.log("left");
			return false
			case 38: // up
			updateexpressionLevelSlider(level+10);
			//console.log("up");
			return false
			case 39: // right
			updateexpressionLevelSlider(level+100);
			//console.log("right");
			return false
			case 40: // down
			updateexpressionLevelSlider(level-10);
			//console.log("down");
			return false  
			case 13: // enter key
			// only do this if the selection table modal isn't open 
			if (!$('#selectionTableModal').hasClass('in')) {
				$('#setExpressionLevelModal').modal('toggle'); // close modal
			}
		}
	}
}


function getCurrentLevelOfTissue(tissue) {
	try {
        // figure out which index number that corresponds to in allTissues
        var index = findIndexByKeyValue(allTissues, 'tissue', tissue);
		
        // return the value of the tissue from the array of allValues
        return allTissues[index].value 
	}
	catch(e) {
        // do nothing;
	}
}


/* -------------------------------------------------- */
/* Find Index of Array of JSON objects
	from: http://inderpreetsingh.com/2010/10/14/javascriptjson-find-index-in-an-array-of-objects/
	function findIndexByKeyValue: finds "key" key inside "ob" object that equals "value" value
	example: findIndexByKeyValue(students, 'name', "Jim");
	object: students = [
	{name: 'John', age: 100, profession: 'Programmer'},
	{name: 'Jim', age: 50, profession: 'Carpenter'}
	];
	would find the index of "Jim" and return 1
*/

function findIndexByKeyValue(obj, key, value)
{
	for (var i = 0; i < obj.length; i++) {
        if (obj[i][key] == value) {
			return i;
		}
	}
	return null;
}


/* -------------------------------------------------- */
// populate the Information Modal popup
function populateInformationModal() {
	// add text to the label
	var category = allViews[activeView];
	// trim the heading "TissueSpecific" if necessary
	if (category.substr(0,14) == "TissueSpecific") {
		category = category.substr(14);
	}
	$('#informationLabel').text(category+" Information"); 
	
	// now put info text in body
	$('#informationBody').html(allInfoFiles[activeView]);
	
}


/* -------------------------------------------------- */
// populate the Selection Table Modal popup with a custom bait table
var activeIndex;
function generateSelectionTable() {
	var table = "<div class='row'><span class='col1' style='margin-left:28px;'><h4>Value</h4></span><span class='col2'><h4>Category</h4></span><span class='col3''><h4>Sample</h4></span></div>";
	
	//console.log(dbForThisView);
	
	// build the table
	for (var i=0; i<allTissues.length; i++) {
		if (allTissues[i].view === allViews[activeView]) { // only include items for the active view
			var color = allTissues[i].color;
			var value = allTissues[i].value;
			var resetTissueButton = '<span class="resetTissueTableButton glyphicon glyphicon-repeat" onclick="resetTissueTableButton('+i+')"></span>';
			var excludeTissueButton = '<span class="resetTissueTableButton glyphicon glyphicon-ok" onclick="excludeTissueTableButton('+i+')"></span>';
			var includeTissueButton = '<span class="resetTissueTableButton glyphicon glyphicon-ban-circle" onclick="includeTissueTableButton('+i+')"></span>';
			var inputBox = '<span class="col1"><input class="selectionTableTextInput" id="selectionTableInputBox'+i+'" style="background-color:'+color+';" size="8" maxlength="4" onclick="this.select();activeIndex='+i+';" onchange="updateInputBox('+i+')" value="'+value+'"></input></span>';
			var category = allTissues[i].view;
			// trim the heading "TissueSpecific" if necessary
			if (category.substr(0,14) == "TissueSpecific") {
				category = category.substr(14);
			}
			category = "<span class='col2'>"+category+'</span>';    
			var sample = "<span class='col3' style='background-color:"+allTissues[i].colorKey+"''>"+allTissues[i].tissue+"</span>";
			
			var actionButton = "";
			if ( $('#user_agi').val() == "" )  {  
				actionButton = resetTissueButton;
			}
			else if (allTissues[i].value === "excluded") {
				actionButton = includeTissueButton;
			}
			else {
				actionButton = excludeTissueButton;
			}
			
			var row="<div class='row'>"+actionButton+inputBox+category+sample+"</div>";
			table += row;
		}
		
	}
	
	//console.log(table);
	// now add table to the div
	$('#selectionTableBody').html(table);
}



/* -------------------------------------------------- */
// react to any changes in the input box on the selectionTable
function updateInputBox(i) {
	// set active tissue global
	activeTissue = i;
	var color = "";
	
	if ($('#user_agi').val() === "") {
		// get value of input box
		var value = $('#selectionTableInputBox'+i).val();
		//console.log(i+" "+value);
		
		// get associated color
		color = calculateColor(value);
		
		// if empty, set value as "null"
		if (value == "" || isNaN(value) ) {
			$('#selectionTableInputBox'+i).val("null");
			color = "#FFFFFF";
			value = "null";
		}
		else if (value > 1000) {
			$('#selectionTableInputBox'+i).val(1000);
		}
		else if (value < 0) {
			$('#selectionTableInputBox'+i).val(0);
		}
		
		// set the input box background color
		$('#selectionTableInputBox'+i).css("background-color", color);
		
	}
	else {
		if ( $('#selectionTableInputBox'+i).val() === "" ) {
			$('#selectionTableInputBox'+i).val('excluded');                
			color = "#FFFFFF";
			value = "excluded";
			$('#selectionTableInputBox'+i).css("background-color", color);
		}
		else {
			$('#selectionTableInputBox'+i).val('included');                
			color = "#999999";
			value = "included";
			$('#selectionTableInputBox'+i).css("background-color", color);
		}
	}
	
	
	// set the appropriate tissue color
	var tissue = allTissues[i].tissue;
	$('#'+tissue).attr({ fill: color });
	
	// update allTissues array with new values
	allTissues[i].value = value;
	allTissues[i].color = color;
	
	// update table
	generateSelectionTable();
}

/* -------------------------------------------------- */
// Initialize the popover and tooltip functionality in Bootstrap
// used for the notice "This may take a little while"
$(function () {
	$('[data-toggle="popover"]').popover()
})
// add the loading gif to the popover
var image = '<img src="images/Loading.gif">';
$('#GoButtonGeneInput').popover({title: image+" Loading", html:true});
$('#GoButtonGeneInput').popover({content:'Hang on, this may take a minute'});
/* -------------------------------------------------- */
// Get value of LimitResults radio button group
function switchLimitResultDOM(){
	if(limitResultsByR){
		
		$('#matchCountSelection').children().attr('disabled','disabled');
		$( "#r-value-slider-range" ).slider( "enable" );
		}else{
		$('#matchCountSelection').children().removeAttr('disabled');
		$( "#r-value-slider-range" ).slider( "disable" );
	}
}
var limitResultsByR = false;
//switchLimitResultDOM();
$('#advancedOptions input').on('change', function() {
	limitResultsByR = $('input[name="limitResults"]', '#advancedOptions').prop('checked');
	switchLimitResultDOM();
});
var searchById = false;
$('a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
	var target = $(e.target).attr("href");
	$(target+" .advancedOptionsHolder").append($("#advancedOptions"));
	$(target+" .startSearchHolder").append($("#startSearch"));
	if(target==="#byId"){
	searchById=true;
		$('#geneSearchHolder').append('<div id="byIdCover" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');
		$('#geneSearchHolder').fadeTo('fast',.2);
		
		}else{
		searchById=false;
		$('#geneSearchHolder').fadeTo('fast',1,function(){
			$('#geneSearchHolder #byIdCover').remove();
			
		});
		
	}
});

/* -------------------------------------------------- */
// generate serach query
var mapUrl = "data/lookUp.json";
var allTissuesLookUpJson = "data/AllTissuesLookUp.json";
function generateStandardSearchQuery() {
	$.getJSON(allTissuesLookUpJson, $.proxy(
	function(allTissuesLookUp) {
		$.getJSON(mapUrl, $.proxy(
		
		function(response) {
			var activeViewLookUp = response[allViews[activeView]];
			var allTissuesInDb = allTissuesLookUp[activeViewLookUp.database];
			var valid = false;
			var search = "";
			var URL = ADAMAUrl + "ntools_expression_angler.cgi?";
			var agiID = "";
			var agiIDOnly = "";
			var use_custom_bait = "";  
			var defaultDB = "&database="+activeViewLookUp.database;
			var lowerRcutoff = "";
			var upperRcutoff = "";
			var match_count = "";
			var matchCountNum = "";
			//var db = "+%5b"+sampleDBs[activeView]+"%5d";
			//var db = "+%5bAtGenExpress_Plus_PID:14671301%5d";
			agiID = "agi_id="+$('#user_agi').val();
			// either set agiID or set custom bait = yes
			if ( !searchById ) {
				use_custom_bait = "&use_custom_bait=yes"
			}
			else {
				valid=true;
				agiIDOnly = $('#user_agi').val();
			}
			
			// if Select an r-value cutoff range is selected, get them
			if (limitResultsByR) {
				lowerRcutoff = "&lower_r_cutoff="+($( "#r-value-slider-range" ).slider("values", 0)/100);
				upperRcutoff = "&upper_r_cutoff="+($( "#r-value-slider-range" ).slider("values", 1)/100);
			}
			else// if Limit the results is selected, get the number
			{
				match_count = "&match_count="+$('input[name=matchGroup]:checked').val();
				matchCountNum = $('input[name=matchGroup]:checked').val();
			}
			
			
			
			// start building the search
			search = URL+agiID+use_custom_bait+lowerRcutoff+upperRcutoff+match_count;
			
			// add the tissues
			if ( $('#user_agi').val() == "" ) {
				var appendToEnd = "";
				/*if(activeViewLookUp.emptyBaitsBefore)
					{
					for (var i=0; i<activeViewLookUp.emptyBaitsBefore; i++){
					allTissuesInDb.shift();
					search += "&custom_bait=-";
					}
					}
					
					if(activeViewLookUp.emptyBaitsAfter)
					{
					for (var i=0; i<activeViewLookUp.emptyBaitsAfter; i++)
					{
					allTissuesInDb.pop();
					appendToEnd += "&custom_bait=-";
					}
				}*/
				var activeTissues= allViewInfos[allViews[activeView]].tissues;
				var allTissuesQueries = [];
				for (var i=0; i<activeTissues.length; i++){
					if (activeTissues[i].view === allViews[activeView]) { // only include items for the active view
						var samples = activeTissues[i].samples;
						for (var j=0; j<samples.length; j++){
							var sample = activeViewLookUp.sampleMap[samples[j]];
							var value = activeTissues[i].value;
							// now prepend "&custom_bait=" to value
							
							// if use custom bait mode is on, convert "null" values to 1
							if (use_custom_bait === "&use_custom_bait=yes" && (typeof value === 'undefined'||value==="null")) {
								value = 1;
							}
							var tissueQuery = {
								"tissue":sample,
								"value":value
							};
							allTissuesQueries.push(tissueQuery);
						}
					}
				}
				for (var i=0; i<allTissuesInDb.length; i++){
					var result = $.grep(allTissuesQueries, function(e){ return e.tissue === allTissuesInDb[i]; });
					if (result.length == 0) {
						// not found
						search += "&custom_bait=-";
						} else{
						var tissue = "&expts="+result[0].tissue;//samples[0]+db;
						// if value isn't null, add sample and value to search query
						
						// add each sample name to the search query
						search += tissue;
						// add value to the search query
						search += "&custom_bait="+result[0].value;
						
						valid = true;
						
						// multiple items found
					}
					
				}
				
			}
			
			search +=appendToEnd+defaultDB;
			// postSearchQuery(search);
			if(valid){
				//openSearchQueryInNewWindow(search);
				art.dialog.data('expressionAnglerUrl',search);
				art.dialog.data('expressionAnglerMain',agiIDOnly);
				art.dialog.data('expressionAnglerCount',matchCountNum);
				art.dialog.close();
			}
			else{
				var errorInfo='Not enough information provided. ';
				var dialog = window.top.art.dialog({
					content: errorInfo,
					title: "Citation",
					width: 600,
					minHeight: 0,
					resizable: false,
					draggable: false,
					lock: true
				})
			}
		},this));
	},this));
}

/* -------------------------------------------------- */
// open search in new window
function openSearchQueryInNewWindow(searchQuery) {
	
	var wnd = window.open("about:blank", "", "_blank");
	wnd.document.write(searchQuery);
}



/* -------------------------------------------------- */
// POST search query
function postSearchQuery(searchQuery) {
	console.log(searchQuery);
	
	$.post(searchQuery, function(result) {
		var wnd = window.open("about:blank", "", "_blank");
		wnd.document.write(result);
	}, "html");
}
