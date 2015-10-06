//    Grid_Fit.jsx
//    An InDesign CS5 JavaScript
//    Bruno Herfst 2015

//    V1 BETA

//    Sets grid to fit page based on selected x-Height.

//----------------------------------- S H O W - D I A L O G

#target indesign;
#targetengine "session";

try {
	//global vars
	var DOC = app.activeDocument;
	var DOC_SIZE = { W : DOC.documentPreferences.pageWidth, H : DOC.documentPreferences.pageHeight};
	var ORIGINAL_RULERS = setRulerUnits(DOC, [MeasurementUnits.MILLIMETERS, MeasurementUnits.MILLIMETERS]); // Safe old ruler units whils setting to points
	var ORIGINAL_GRIDSHOWN = DOC.gridPreferences.documentGridShown;
	var ORIGINAL_LAYOUTADJ = DOC.layoutAdjustmentPreferences.enableLayoutAdjustment;
	
	var MY_MEASURE_UNITS = ["mm","pt"];
	var current_measure_unit = MY_MEASURE_UNITS[0];

	// Show grid while interacting with the UI
	DOC.gridPreferences.documentGridShown = true;
	DOC.layoutAdjustmentPreferences.enableLayoutAdjustment = true; //This should be a feuture that the user controls in UI

	//Get current step
	var GS = getGridStep();

	showUI();

} catch(err) {
	alert(err.description);
	exit();
}

function showUI(){

	var myWindow = new Window ("palette", "Grid Fit V1");
		myWindow.orientation = "column";

	// START VERTICAL GRID STEP MEASUREMENTS
	var myVerticalGridGroup = myWindow.add ("panel", undefined, "HEIGHT");
		myVerticalGridGroup.orientation = "column";
		
		var v_row1 = myVerticalGridGroup.add ("group");
			v_row1.orientation = "row";

			v_row1.add ("statictext", undefined, "Current GS: ");
		var v_editGS = v_row1.add ("edittext", undefined, GS.VGS);
			v_editGS.characters = 6;
		var v_row1_unit = v_row1.add ("statictext", undefined, current_measure_unit);

		var v_row1_but_set = v_row1.add ("button", undefined, "Set");
			v_row1_but_set.onClick = function () {
				setVGS(v_editGS.text);
				resetUIvalues();
			};

		var v_row1_but_fit = v_row1.add ("button", undefined, "Fit");
			v_row1_but_fit.onClick = function () {
				fitVGS(v_editGS.text);
				resetUIvalues();
			};


	// START HORIZONTAL GRID STEP MEASUREMENTS
	var myHorizontalGridGroup = myWindow.add ("panel", undefined, "WIDTH");
		myHorizontalGridGroup.orientation = "column";
		
		var h_row1 = myHorizontalGridGroup.add ("group");
			h_row1.orientation = "row";

			h_row1.add ("statictext", undefined, "Current GS: ");
		var h_editGS = h_row1.add ("edittext", undefined, GS.HGS);
			h_editGS.characters = 6;
		var h_row1_unit = h_row1.add ("statictext", undefined, current_measure_unit);

		var h_row1_but_set = h_row1.add ("button", undefined, "Set");
			h_row1_but_set.onClick = function () {
				setHGS(h_editGS.text);
				resetUIvalues();
			};

		var h_row1_but_fit = h_row1.add ("button", undefined, "Fit");
			h_row1_but_fit.onClick = function () {
				fitHGS(h_editGS.text);
				resetUIvalues();
			};

	// OK BUTTONS
	var myButtonGroup = myWindow.add ("group");
		myButtonGroup.orientation = "row";
		
		var but_closeWin = myButtonGroup.add ("button", undefined, "Exit");
			but_closeWin.onClick = function () {
				resetSettings();
				myWindow.close();
			};

	myWindow.show ();
}

function resetSettings(){
	// This function changes back all settings to original settings
	setRulerUnits(DOC, ORIGINAL_RULERS);
	DOC.gridPreferences.documentGridShown = ORIGINAL_GRIDSHOWN;
	DOC.layoutAdjustmentPreferences.enableLayoutAdjustment = ORIGINAL_LAYOUTADJ;
}

function fitHGS(myGridStep){
	var mySubdevision = DOC.gridPreferences.horizontalGridSubdivision;
	var myGS = parseFloat(myGridStep);
	var countGS = doRound(DOC_SIZE.W/myGS,0);
	var fitGS = doRound(DOC_SIZE.W/countGS,3);
	setHGS(fitGS);
}

function fitVGS(myGridStep){
	var mySubdevision = DOC.gridPreferences.verticalGridSubdivision;
	var myGS = parseFloat(myGridStep);
	var countGS = doRound(DOC_SIZE.H/myGS,0);
	var fitGS = doRound(DOC_SIZE.H/countGS,3);
	setVGS(fitGS);
}

function setHGS(myGridStep){
	var mySubdevision = DOC.gridPreferences.verticalGridSubdivision;
	var myGS = parseFloat(myGridStep);
	DOC.gridPreferences.horizontalGridlineDivision = doRound(myGS * mySubdevision, 6);
}

function setVGS(myGridStep){
	var myGS = parseFloat(myGridStep);
	var mySubdevision = DOC.gridPreferences.verticalGridSubdivision;
	DOC.gridPreferences.verticalGridlineDivision = doRound(myGS * mySubdevision, 6);
}

function resetUIvalues(){
	alert("Reset UI values here");
}

function getGridStep(){
	return {
		HGS : doRound(DOC.gridPreferences.horizontalGridlineDivision / DOC.gridPreferences.horizontalGridSubdivision, 3),
		VGS : doRound(DOC.gridPreferences.verticalGridlineDivision / DOC.gridPreferences.verticalGridSubdivision, 3)
	}
}

function setRulerUnits(DOC, RulerUnitsXY){
    var originalUnits = [DOC.viewPreferences.horizontalMeasurementUnits, DOC.viewPreferences.verticalMeasurementUnits];

    DOC.viewPreferences.horizontalMeasurementUnits = RulerUnitsXY[0];
    DOC.viewPreferences.verticalMeasurementUnits = RulerUnitsXY[1];

    return originalUnits;
}

function doRound(myNum, roundDec) {
	var roundMulit = Math.pow(10,roundDec);
	return Math.round(myNum*roundMulit)/roundMulit;
}