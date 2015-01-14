/*

--------------------------------------------

	Frame_Break_2_Pagebounds.jsx
	An InDesign CS5/6 Javascript
	Version 1

	Bruno Herfst 2013-2015
	mail@brunoherfst.com

	This script breaks graphic frames over pages using pathfinder commands.

--------------------------------------------

*/
#target InDesign;



//////////////
// SETTINGS //
//////////////
doTextFrames = false;


//Make certain that user interaction (display of dialogs, etc.) is turned on.
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;

if (app.documents.length != 0) {
    //global vars
    var myCover = app.activeDocument;
    var myCoverBleed = {
    	    Top    : myCover.documentPreferences.documentBleedTopOffset,
    	    Bottom : myCover.documentPreferences.documentBleedBottomOffset,
            Left   : myCover.documentPreferences.documentBleedInsideOrLeftOffset,
            Right  : myCover.documentPreferences.documentBleedOutsideOrRightOffset
        };
    if(breakSpreadsOn(myCover)) {
    	alert("Done!");
    }
} else {
	alert("Can’t find any open documents.");
}

function breakSpreadsOn(myCover){
	var ruleror = myCover.viewPreferences.rulerOrigin;
	myCover.viewPreferences.rulerOrigin = RulerOrigin.SPREAD_ORIGIN;

	//For all spreads
	var spreadsLen = myCover.spreads.length;
	for (i=spreadsLen-1; i>=0; i--){
		var mySpreadRectangles  = myCover.spreads[i].rectangles;
		var mySpreadOvals       = myCover.spreads[i].ovals;
		var mySpreadPolygons    = myCover.spreads[i].polygons;
		
		var mySpreadPages = myCover.spreads[i].pages;
		var pagesLen      = mySpreadPages.length;
		var myPages       = new Array();
		
		for (var page = pagesLen-1; page>=0; page--){
			// Get page bounds including bleed
			if(page == 0){ // first
				var myFrameBounds	= getPageBounds(mySpreadPages[page],3);
			} else if (page == pagesLen-1){
				var myFrameBounds	= getPageBounds(mySpreadPages[page],1);
			} else {
				var myFrameBounds	= getPageBounds(mySpreadPages[page],2);
			}
			myPages.push({page: mySpreadPages[page], bounds:myFrameBounds});
		}
		if(myPages.length > 1) {
            breakFramesTo(myPages,mySpreadRectangles);
			breakFramesTo(myPages,mySpreadOvals);
			breakFramesTo(myPages,mySpreadPolygons);
		}
	}
	myCover.viewPreferences.rulerOrigin = ruleror;
	return true;
}

function breakFramesTo(myPages,mySpreadItems){
	for ( i = mySpreadItems.length-1; i >= 0; i-- ) {
		var spreadItem = mySpreadItems[i];
		var myLayer = spreadItem.itemLayer;
		//make sure layer is unlocked
		var myLayerLock = myLayer.locked;
		if(myLayerLock){
			myLayer.locked = false;
		}
		// Check item agains every page
		var pagesLen = myPages.length;
		for (var j = pagesLen-1; j >= 0; j--){
			var myDupItem = spreadItem.duplicate();
			var rect = myPages[j].page.rectangles.add(myLayer,{geometricBounds:myPages[j].bounds, fillColor:"None", strokeColor:"None"});
				rect.sendToBack();
			try {
				rect.intersectPath(myDupItem);
			} catch(e) {
				// Don't break if it doesn't work out. It's OK.
				rect.remove();
				myDupItem.remove();
				// alert(e.description);
			}
		}
		spreadItem.remove();
		//set original lock
		if(myLayerLock){
			myLayer.locked = true;
		}
	}
}

function getPageBounds(myPage,selector){
	var myBleedBounds = myPage.bounds; //[y1, x1, y2, x2]

	// Add top and bottom bleed
	myBleedBounds[0] -= myCoverBleed.Top;
	myBleedBounds[2] += myCoverBleed.Bottom;

	// Left and right bleed
	switch (selector){
		case 2:
			return myBleedBounds; // Return page-bounds with top+bottom bleed
			break;
		case 3:
			myBleedBounds[1] -= myCoverBleed.Left;
			return myBleedBounds;
			break;
		case 1:
			myBleedBounds[3] += myCoverBleed.Right;
			return myBleedBounds;
			break;
		default: // Return page-bounds without bleed
			return myPage.bounds;
			break;
	}
}