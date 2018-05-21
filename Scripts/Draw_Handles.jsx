/*

    Draw_Handles.jsx
    Version 1.0
    Bruno Herfst 2014

    This script visualises the path so we can print the curve representation

*/

#target InDesign

var Settings = {
	anchorDraw         : true,
	anchorRadius       : 0.35,
	anchorColour       : [100,0,0,0],

	controlPointDraw   : true,
	controlPointRadius : 0.2,
	controlPointColour : [100,0,0,0],

	outlineDraw        : false, // this creates a copy of the object first
	outlineStroke      : 0.15,
	outlineColour      : [100,0,0,0]
}

//Make certain that user interaction (display of dialogs, etc.) is turned on.
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;

//Check if we have what we need to run the script.
if (app.documents.length == 0){
	alert("Open a document before running this script.");
	exit();
} else if (app.selection.length == 0){
	alert("Select an object before running this script");
	exit();
}

var myPathList = new Array;

for(var i = 0;i < app.selection.length; i++){
	switch (app.selection[i].constructor.name){
		case "Rectangle":
		case "TextFrame":
		case "Oval":
		case "Polygon":
		case "GraphicLine":
		case "Group":
		case "PageItem":
		myPathList.push(app.selection[i]);
		break;
	}
}
if (myPathList.length == 0){
	alert ("Select a rectangle or text frame and try again.");
	exit();
}

drawPathElements(myPathList);

function drawPathElements(myPathList){
	for(var objCount = 0;objCount < myPathList.length; objCount++){
		for(var pathCount = 0;pathCount < myPathList[objCount].paths.length; pathCount++){
			var myPath = myPathList[objCount].paths[pathCount];
			drawAnchors(myPath);
		}
	}
}

function drawAnchors(myPath){
	try{
		for(var point = 0;point < myPath.entirePath.length; point++){ //we process last point later for closed paths only
			if(myPath.entirePath[point].length == 2){ // no control handles
				if(Settings.anchorDraw){
					drawCircle(app.activeWindow.activePage,myPath.entirePath[point], Settings.anchorRadius);
				}
			} else { // controlHandles found

				var leftHandle  = myPath.entirePath[point][0];
				var actualPoint = myPath.entirePath[point][1];
				var rightHandle = myPath.entirePath[point][2];

				if(Settings.anchorDraw){
					drawCircle(app.activeWindow.activePage, actualPoint, Settings.anchorRadius);
				}
				if(Settings.controlPointDraw){
					if(leftHandle !== actualPoint){
						drawCircle(app.activeWindow.activePage, leftHandle,  Settings.controlPointRadius);
					}
					if(rightHandle !== actualPoint){
						drawCircle(app.activeWindow.activePage, rightHandle, Settings.controlPointRadius);
					}
				}
			}
		}
	} catch(err){
		alert(err);
	}
}

function drawCircle(page, point, radius){
	var bounds = [point[1]-radius,point[0]-radius,point[1]+radius,point[0]+radius]; //y1,x1,y2,x2
	page.ovals.add({geometricBounds:bounds});
}
