/*

    Rotate_Between_Values.jsx
    Version 1.0
    Bruno Herfst 2015

    This script rotates the selected objects somewhere between two given values.

    Please note that this script assumes you have set your preferred reference point
*/

#target InDesign

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
var myPrefs = {min:0,max:0,reset:'true'};

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
	exit;
}

showSettingsUI();

function showSettingsUI(){
	// Look for and read prefs file
	prefsFile = File((Folder(app.activeScript)).parent + "/Rotate_Bewteen_Values_Memory.txt");
	if(!prefsFile.exists) {
		savePrefs();
	} else {
		readPrefs();
	}
	// Make the dialog box
    var dlg = app.dialogs.add({name:"Rotate between"});
    with(dlg.dialogColumns.add()){
		var resetRotation = checkboxControls.add({ staticLabel : 'Reset rotation', checkedState : true });
		staticTexts.add({staticLabel:"Min rotation: "});
        var minRotationInput = angleComboboxes.add({editValue:myPrefs.min});
        staticTexts.add({staticLabel:"Max rotation: "});
        var maxRotationInput = angleComboboxes.add({editValue:myPrefs.max});
    }

    //show dialog
    if(dlg.show() == true){
    	 // Get actual values
    	myPrefs.min = minRotationInput.editValue % 360;
    	myPrefs.max = maxRotationInput.editValue % 360;
		// Make sure min is smaller then max, for the jokers.
    	if (myPrefs.min > myPrefs.max) {
			var swap=myPrefs.min; myPrefs.min=myPrefs.max; myPrefs.max=swap;
		}
		myPrefs.reset = resetRotation.checkedState;
		savePrefs();
		rotatePaths();
    }
}

function rotatePaths(){
	for(var objCount = 0;objCount < myPathList.length; objCount++){
		var rotationAngle = myPathList[objCount].absoluteRotationAngle;
		if(myPrefs.reset){
			rotationAngle = 0;
		}
		rotationAngle += randomInRange(myPrefs.min,myPrefs.max);
		myPathList[objCount].absoluteRotationAngle = rotationAngle;
	}
}

function randomInRange(start,end){
	return Math.random() * (end - start) + start;
}

// function to read prefs from a file
function readPrefs() {
	try {
		prefsFile.open("r");
		myPrefs = eval(prefsFile.readln());
		prefsFile.close();
	} catch(e) {
		throwError("Could not read preferences: " + e, false, 2, prefsFile);
	}
}

// function to save prefs to a file
function savePrefs() {
	try	{
		prefsFile.open("w");
		prefsFile.write(myPrefs.toSource());
		prefsFile.close();
	 }catch(e){
		throwError("Could not save preferences: " + e, false, 2, prefsFile);
	}
}