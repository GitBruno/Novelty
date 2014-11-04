// Frame_2_Bleed.jsx
// An InDesign JavaScript by Bruno Herfst 2012
// Version 1.1

// WISHLIST
// + script to work with polygons
// + Script need to take multiple page spreads into account

#target indesign
main();

var myDoc;

function main(){
	//Make certain that user interaction (display of dialogs, etc.) is turned on.
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	if(app.documents.length != 0){
		myDoc = app.activeDocument;
		if(app.selection.length != 0){
			//Get the first item in the selection.
			for(var i=0;i<app.selection.length;i++){
				var mySelection = app.selection[i];
				switch(mySelection.constructor.name){
					case "Rectangle":
						//straighten(mySelection);
						break;
					default:
						var ws = mySelection.constructor.name;
						alert("This is a "+ws+" \rPlease select a rectangle and try again.");
						exit();
				}
			}
			straightenFrames();
			fit()

		}else{
			alert("Please select a frame.");
		}
	}else{
		alert("Please open a document and try again.");
	}
}

function straightenFrames(){
	try {
		for(var i=0;i<app.selection.length;i++){
			var myRect = app.selection[i];
			var myImg = myRect.images[0];

			//Find out what the rotationangle is
			var rectRot = myRect.rotationAngle,
				imgRot = myImg.rotationAngle,
				imgBounds = myImg.geometricBounds;

			//Create the transformation matrix
			var rectTransformationMatrix = app.transformationMatrices.add({counterclockwiseRotationAngle:-rectRot});
				imgTransformationMatrix = app.transformationMatrices.add({counterclockwiseRotationAngle:rectRot+imgRot});
			// Rotate around its center point
			myRect.transform(CoordinateSpaces.pasteboardCoordinates, AnchorPoint.centerAnchor, rectTransformationMatrix);
			myImg.transform(CoordinateSpaces.pasteboardCoordinates, AnchorPoint.centerAnchor, imgTransformationMatrix);

			if(imgRot >= 180) {
				var newAngle = myImg.rotationAngle -= 180;
			}

			myImg.geometricBounds = imgBounds;
		}
	}catch(e){} //no image
}

function fit(){
	var oldRuler = myDoc.viewPreferences.rulerOrigin;
	myDoc.viewPreferences.rulerOrigin = RulerOrigin.spreadOrigin;
	for(var i=0;i<app.selection.length;i++){
		var myRect = app.selection[i];
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