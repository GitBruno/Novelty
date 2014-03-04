/*
Remove_Frame_Rotation.jsx
An InDesign Javascript
Bruno Herfst 2011

version 1.1

Moves the rotation of frames to it’s contents.
This way you end up with rotated content in stead of rotated frames.

*/

#target indesign;

main();

function main(){
	//Make certain that user interaction (display of dialogs, etc.) is turned on.
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	if(app.documents.length != 0){
		if(app.selection.length != 0){
			//Get the first item in the selection.
			for(var i=0;i<app.selection.length;i++){
				var mySelection = app.selection[i];
				//alert(mySelection.constructor.name)
				switch(app.selection[i].constructor.name){
					case "Image":
					case "EPS":
					case "PDF":
					case "AI":
					case "ImportedPage":
						break;
					default:
						alert("Please select an image and try again.");
						exit();
				}
			}
			straighten(app.selection);

		}else{
			alert("Please select an image and try again.");
		}
	}else{
		alert("Please open a document and try again.");
	}
}

function straighten(myImg){
	for(var i=0;i<app.selection.length;i++){
		var myImg = app.selection[i];
		//Find out what the rotation angle is
		var myRect = myImg.parent,
			rectRot = myRect.rotationAngle,
			imgBounds = myImg.geometricBounds;
		
		//Create the transformation matrix
		var rectTransformationMatrix = app.transformationMatrices.add({counterclockwiseRotationAngle:-rectRot});
			imgTransformationMatrix = app.transformationMatrices.add({counterclockwiseRotationAngle:rectRot});
		// Rotate a rectangle "myRectangle" around its center point
		myRect.transform(CoordinateSpaces.pasteboardCoordinates, AnchorPoint.centerAnchor, rectTransformationMatrix);
		myImg.transform(CoordinateSpaces.pasteboardCoordinates, AnchorPoint.centerAnchor, imgTransformationMatrix);
		
		myImg.geometricBounds = imgBounds;
	}
}