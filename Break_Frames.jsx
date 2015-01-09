/*

--------------------------------------------

	Break_Frames.jsx
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
		var mySpreadItems = myCover.spreads[i].rectangles;
		var mySpreadPages = myCover.spreads[i].pages;

		var pagesLen = mySpreadPages.length;
		var myPages = new Array();
		for (var page = pagesLen-1; page>=0; page--){
			// Get page bounds including bleed
			if(page == 0){ // first
				var myFrameBounds	= getBounds(mySpreadPages[page],3);
			} else if (page == pagesLen-1){
				var myFrameBounds	= getBounds(mySpreadPages[page],1);
			} else {
				var myFrameBounds	= getBounds(mySpreadPages[page],2);
			}
			myPages.push({page: mySpreadPages[page], bounds:myFrameBounds});
		}
		if(myPages.length > 1) {
			breakFramesTo(myPages,mySpreadItems);
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
		for (var i = pagesLen-1; i >= 0; i--){
			var myDupItem = spreadItem.duplicate();
			var rect = myPages[i].page.rectangles.add(myLayer,{geometricBounds:myPages[i].bounds, fillColor:"None", strokeColor:"None"});
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

function getBounds(myPage,selector){
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