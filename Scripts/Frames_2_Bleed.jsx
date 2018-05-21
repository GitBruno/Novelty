// Document_Frames_2_Bleed.jsx
// Based on Frame_2_Bleed.jsx
// An InDesign JavaScript by Bruno Herfst 2012
// Handy to run after multi page importer.
// Version 1.0

#target indesign
main();

var myDoc, myRects, len;

function main(){
	//Make certain that user interaction (display of dialogs, etc.) is turned on.
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	if(app.documents.length != 0){
		myDoc   = app.activeDocument;
		myRects = myDoc.rectangles; //image frames are rectangles
		len     = myRects.length;
		fit();
	}else{
		alert("Please open a document and try again.");
	}
	alert("Resized "+len+" rectangles!");
}

function fit(){
	var oldRuler = myDoc.viewPreferences.rulerOrigin;
	myDoc.viewPreferences.rulerOrigin = RulerOrigin.spreadOrigin;
	for(var i=0;i<len;i++){
		var myRect = myRects[i];
		var myPage = myRect.parentPage;
		//check bounds
		var rectBounds = myRect.geometricBounds,
			pageBounds = myPage.bounds, //in the format [y1, x1, y2, x2], top-left and bottom-right
			pageWidth = myPage.bounds[3]-myPage.bounds[1];
		
		//check bleed (can be made more specific, good for now)
		var bleed = myDoc.documentPreferences.documentBleedTopOffset;

		//check if image meant to be a spread
		if(rectBounds[1] < pageWidth*0.25 && rectBounds[3] > pageWidth*1.75){
			//spread
			var bleedBound = new Array(-bleed,-bleed,pageBounds[2]+bleed,pageWidth*2+bleed);
		} else {
			//page
			if(myPage.side == PageSideOptions.RIGHT_HAND){
				var bleedBound = new Array(pageBounds[0]-bleed,pageBounds[1],pageBounds[2]+bleed,pageBounds[3]+bleed);	
			} else if(myPage.side == PageSideOptions.LEFT_HAND){
				var bleedBound = new Array(pageBounds[0]-bleed,pageBounds[1]-bleed,pageBounds[2]+bleed,pageBounds[3]);	
			} else { // PageSideOptions.SINGLE_SIDED
				var bleedBound = new Array(pageBounds[0]-bleed,pageBounds[1]-bleed,pageBounds[2]+bleed,pageBounds[3]+bleed);
			}
		}
		myRect.geometricBounds = bleedBound;
		myDoc.viewPreferences.rulerOrigin = oldRuler;
	}
}