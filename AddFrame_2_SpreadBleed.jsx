/*////////////////////////////////////////////////////////////////
	
	AddFrame_2_SpreadBleed.jsx
	Version 1
	Tested in InDesign CC
	
	This scripts adds a new rectangle frame covering the current spread including bleed.
	
	Bruno Herfst 2015
		
////////////////////////////////////////////////////////////////*/

#target indesign;

try{
	var DOC = app.activeDocument;
	var SPREAD = app.activeWindow.activeSpread;
	main();
}catch(e){
	alert("OOPS!\n" + e.description);
	exit();
}

// ------------------------------------------------------ FUNCTIONS ------------------------------------------------------

function main(){
	//alert(SPREAD.pages.length);
	var myRect = addRectangle(SPREAD.pages[0], "NEW_RECT_48655");
	app.select(fit2SpreadBleed(myRect));
}

function addRectangle( PAGE, LABEL ){
	var myRect = PAGE.rectangles.add();
    	myRect.label = LABEL;
	return myRect;
}

function fit2SpreadBleed(myRect){
    var myPage = myRect.parentPage;
    var mySpread = myPage.parent;
    var firstPage = mySpread.pages[0];
    var lastPage  = mySpread.pages[mySpread.pages.length-1];

    //check bounds
    var rectBounds = myRect.geometricBounds;
        
    var firstPageBounds = firstPage.bounds; //in the format [y1, x1, y2, x2], top-left and bottom-right
    var lastPageBounds  = lastPage.bounds;

    var pageBounds = [firstPageBounds[0],firstPageBounds[1],lastPageBounds[2],lastPageBounds[3]]; 
    var pageWidth = pageBounds[3]-pageBounds[1];

    var bleedBot = DOC.documentPreferences.documentBleedBottomOffset;
    var bleedLef = DOC.documentPreferences.documentBleedInsideOrLeftOffset;
    var bleedRig = DOC.documentPreferences.documentBleedOutsideOrRightOffset;
    var bleedTop = DOC.documentPreferences.documentBleedTopOffset;

    var bleedBound = new Array(pageBounds[0]-bleedTop,pageBounds[1]-bleedLef,pageBounds[2]+bleedBot,pageBounds[3]+bleedRig);

    myRect.geometricBounds = bleedBound;

    return myRect;
}
