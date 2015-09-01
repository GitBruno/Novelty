// Frame_2_Bleed.jsx
// An InDesign CS5+ JavaScript by Bruno Herfst 2012
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
			fit();
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
			try{
				var myImg = myRect.images[0];
			} catch(_) {
				continue;
			}

			//Find out what the rotationangle is
			var rectRot = myRect.rotationAngle,
				imgRot = myImg.rotationAngle,
				imgBounds = myImg.geometricBounds;

			if(rectRot == 0){
				continue;
			}

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
	try {
        for(var i=0;i<app.selection.length;i++){
            var myRect = app.selection[i];
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

            //check bleed (can be made more specific, good for now)
            var bleed = myDoc.documentPreferences.documentBleedTopOffset;

            var bleedBound = new Array(pageBounds[0]-bleed,pageBounds[1]-bleed,pageBounds[2]+bleed,pageBounds[3]+bleed);

            myRect.geometricBounds = bleedBound;
        }
    }catch(e){ alert(e.description)}
	myDoc.viewPreferences.rulerOrigin = oldRuler;
}
