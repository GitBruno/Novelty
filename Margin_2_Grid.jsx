/*

Adjust_Margin_Grid.jsx
Bruno Herfst 2011 - 2015

Adjust the margins based on grid steps

NOTE this script is meant to be run only on single or double page spreads 
     that use grids based on a division of pagesize

*/

#target InDesign;
#targetengine "session";

try {
	//global vars
	var DOC = app.activeDocument;
	var ACTIVESPREAD = app.activeWindow.activeSpread;
	var ORIGINAL_RULERS = setRulerUnits(DOC, [MeasurementUnits.MILLIMETERS, MeasurementUnits.MILLIMETERS]); // Safe old ruler units whils setting to points

	//save original units
	ORIGINAL_GRIDSHOWN = DOC.gridPreferences.documentGridShown;
	ORIGINAL_LAYOUTADJ = DOC.layoutAdjustmentPreferences.enableLayoutAdjustment;

	//set custom units
	

	// Show grid while interacting with the UI
	DOC.gridPreferences.documentGridShown = true;
	DOC.layoutAdjustmentPreferences.enableLayoutAdjustment = true; //This should be a feuture that the user controls in UI

	//Save grid step
	var HGS = DOC.gridPreferences.horizontalGridlineDivision / DOC.gridPreferences.horizontalGridSubdivision, // Horizontal Grid Step
		VGS = DOC.gridPreferences.verticalGridlineDivision / DOC.gridPreferences.verticalGridSubdivision;     // Vertical Grid Step

	// Let’s set the docs marginpref to grid first
	var currMargin = marginPreftoGrid(ACTIVESPREAD);
	// Let’s do it!
	showUI(ACTIVESPREAD);

} catch(err) {
	alert(err.description);
	exit();
}

function showUI(ACTIVESPREAD){

	var myWindow = new Window ("palette", "Change Selected Spread Margins");
		myWindow.orientation = "row";
	var myInputGroup = myWindow.add ("group");
		myInputGroup.orientation = "column";
		myInputGroup.alignChildren = "right";

	var myTopMarginGroup = myInputGroup.add ("group");
		myTopMarginGroup.orientation = "row";

		myTopMarginGroup.add ("statictext", undefined, "Top:");
		var topAddWhole = myTopMarginGroup.add ("button", undefined, "-1 gs");
		var topAddQuart = myTopMarginGroup.add ("button", undefined, "-0.25 gs");
		var topSubQuart = myTopMarginGroup.add ("button", undefined, "+0.25 gs");
		var topSubWhole = myTopMarginGroup.add ("button", undefined, "+1 gs");

		    topAddWhole.onClick = function () {addGS_2_spread(ACTIVESPREAD, "top", -1);
		    	currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myTopValue.text = doRound(currMargin[0],3)+"mm";
		    };
		    topAddQuart.onClick = function () {addGS_2_spread(ACTIVESPREAD, "top", -0.25);
		    	currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myTopValue.text = doRound(currMargin[0],3)+"mm";
		    };
		    topSubQuart.onClick = function () {addGS_2_spread(ACTIVESPREAD, "top", +0.25);
		    	currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myTopValue.text = doRound(currMargin[0],3)+"mm";
		    };
		    topSubWhole.onClick = function () {addGS_2_spread(ACTIVESPREAD, "top", +1);
		    	currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myTopValue.text = doRound(currMargin[0],3)+"mm";
		    };

		var myTopValue = myTopMarginGroup.add ("statictext", undefined, doRound(currMargin[0],3)+"mm");

	var myOutMarginGroup = myInputGroup.add ("group");
		myOutMarginGroup.orientation = "row";

		myOutMarginGroup.add ("statictext", undefined, "Outside:");
		var outAddWhole = myOutMarginGroup.add ("button", undefined, "-1 gs");
		var outAddQuart = myOutMarginGroup.add ("button", undefined, "-0.25 gs");
		var outSubQuart = myOutMarginGroup.add ("button", undefined, "+0.25 gs");
		var outSubWhole = myOutMarginGroup.add ("button", undefined, "+1 gs");

		    outAddWhole.onClick = function () {addGS_2_spread(ACTIVESPREAD, "out", -1);
		    	currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myOutValue.text = doRound(currMargin[2],3)+"mm";
		    };
		    outAddQuart.onClick = function () {addGS_2_spread(ACTIVESPREAD, "out", -0.25);
		    	currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myOutValue.text = doRound(currMargin[2],3)+"mm";
		    };
		    outSubQuart.onClick = function () {addGS_2_spread(ACTIVESPREAD, "out", +0.25);
		    	currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myOutValue.text = doRound(currMargin[2],3)+"mm";
		    };
		    outSubWhole.onClick = function () {addGS_2_spread(ACTIVESPREAD, "out", +1);
		    	currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myOutValue.text = doRound(currMargin[2],3)+"mm";
		    };

		var myOutValue = myOutMarginGroup.add ("statictext", undefined, doRound(currMargin[2],3)+"mm");

	var myInsMarginGroup = myInputGroup.add ("group");
		myInsMarginGroup.orientation = "row";

		myInsMarginGroup.add ("statictext", undefined, "Inside:");
		var insAddWhole = myInsMarginGroup.add ("button", undefined, "-1 gs");
		var insAddQuart = myInsMarginGroup.add ("button", undefined, "-0.25 gs");
		var insSubQuart = myInsMarginGroup.add ("button", undefined, "+0.25 gs");
		var insSubWhole = myInsMarginGroup.add ("button", undefined, "+1 gs");

		    insAddWhole.onClick = function () {
		    	addGS_2_spread(ACTIVESPREAD, "ins", -1);
		    	currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myInsValue.text = doRound(currMargin[3],3)+"mm";
		    }
		    insAddQuart.onClick = function () {
		    	addGS_2_spread(ACTIVESPREAD, "ins", -0.25);
		    	currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myInsValue.text = doRound(currMargin[3],3)+"mm";
		    }
		    insSubQuart.onClick = function () {
		    	addGS_2_spread(ACTIVESPREAD, "ins", +0.25);
				currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myInsValue.text = doRound(currMargin[3],3)+"mm";
		    }
		    insSubWhole.onClick = function () {
		    	addGS_2_spread(ACTIVESPREAD, "ins", +1);
		    	currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myInsValue.text = doRound(currMargin[3],3)+"mm";
		    }

		var myInsValue = myInsMarginGroup.add ("statictext", undefined, doRound(currMargin[3],3)+"mm");

	var myBotMarginGroup = myInputGroup.add ("group");
		myBotMarginGroup.orientation = "row";

		myBotMarginGroup.add ("statictext", undefined, "Bottom:");
		var botAddWhole = myBotMarginGroup.add ("button", undefined, "-1 gs");
		var botAddQuart = myBotMarginGroup.add ("button", undefined, "-0.25 gs");
		var botSubQuart = myBotMarginGroup.add ("button", undefined, "+0.25 gs");
		var botSubWhole = myBotMarginGroup.add ("button", undefined, "+1 gs");

		    botAddWhole.onClick = function () {
		    	addGS_2_spread(ACTIVESPREAD, "bot", -1);
		    	currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myBotValue.text = doRound(currMargin[1],3)+"mm";
		    };
		    botAddQuart.onClick = function () {addGS_2_spread(ACTIVESPREAD, "bot", -0.25);
		    	currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myBotValue.text = doRound(currMargin[1],3)+"mm";
		    };
		    botSubQuart.onClick = function () {addGS_2_spread(ACTIVESPREAD, "bot", +0.25);
		    	currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myBotValue.text = doRound(currMargin[1],3)+"mm";
		    };
		    botSubWhole.onClick = function () {addGS_2_spread(ACTIVESPREAD, "bot", +1);
		    	currMargin = getMargins(ACTIVESPREAD.pages[0]);
		    	myBotValue.text = doRound(currMargin[1],3)+"mm";
		    };

		var myBotValue = myBotMarginGroup.add ("statictext", undefined, doRound(currMargin[1],3)+"mm");

	var myButtonGroup = myWindow.add ("group");
		myButtonGroup.orientation = "column";
	var ok_but     = myButtonGroup.add ("button", undefined, "EXIT");
	// We need to add a script undo function if we want to undo all changes made
	// Don’t have time for that at the moment, sorry!
	//var cancel_but = myButtonGroup.add ("button", undefined, "Cancel");

		ok_but.onClick = function () {
			resetSettings();
			myWindow.close()
		};
		//cancel_but.onClick = function () {};

	myWindow.show ();

}

function resetSettings(){
	// This function changes back all settings to original settings
	setRulerUnits(DOC, ORIGINAL_RULERS);
	DOC.gridPreferences.documentGridShown = ORIGINAL_GRIDSHOWN;
	DOC.layoutAdjustmentPreferences.enableLayoutAdjustment = ORIGINAL_LAYOUTADJ;
}

function marginPreftoGrid(SPREAD){
	var VGSQ = VGS/4;
	var HGSQ = HGS/4
	for (var page = 0; page < SPREAD.pages.length; page++){
		var PAGE = SPREAD.pages[page];
		PAGE.marginPreferences.top    = ( Math.round(PAGE.marginPreferences.top    /VGSQ) ) *VGSQ;
		PAGE.marginPreferences.bottom = ( Math.round(PAGE.marginPreferences.bottom /VGSQ) ) *VGSQ;
		PAGE.marginPreferences.left   = ( Math.round(PAGE.marginPreferences.left   /HGSQ) ) *HGSQ;
		PAGE.marginPreferences.right  = ( Math.round(PAGE.marginPreferences.right  /HGSQ) ) *HGSQ;
	}
	return getMargins(SPREAD.pages[0]);
}

function getMargins(PAGE){
	if(PAGE.side == "LEFT_HAND"){
		return [ PAGE.marginPreferences.top,
	             PAGE.marginPreferences.bottom,
	             PAGE.marginPreferences.left,
	             PAGE.marginPreferences.right];
	} else { // righthand
		return [ PAGE.marginPreferences.top,
	             PAGE.marginPreferences.bottom,
	             PAGE.marginPreferences.right,
	             PAGE.marginPreferences.left];
	}
}

function addGS_2_spread(SPREAD, SIDE, STEP){
	for (var page = 0; page < SPREAD.pages.length; page++){
		var PAGE = SPREAD.pages[page];
		addGS_2_Page(PAGE, SIDE, STEP);
	}
}

function addGS_2_Page(PAGE, SIDE, STEP){
	if(PAGE.side == "LEFT_HAND"){
		if(SIDE == "ins"){
			SIDE = "rig";
		} else if (SIDE == "out"){
			SIDE = "lef";
		}
	} else { // righthand
		if(SIDE == "ins"){
			SIDE = "lef";
		} else if (SIDE == "out"){
			SIDE = "rig";
		}
	}

	switch (SIDE) {
		case "top":
			PAGE.marginPreferences.top    += doRound(STEP*VGS, 3);
			break;
		case "bot":
			PAGE.marginPreferences.bottom += doRound(STEP*VGS, 3);
			break;
		case "rig":
			PAGE.marginPreferences.right  += doRound(STEP*HGS, 3);
			break;
		case "lef":
			PAGE.marginPreferences.left   += doRound(STEP*HGS, 3);
			break;
		default:
			alert("Margin not supported: " + SIDE);
			break;
	}
}

