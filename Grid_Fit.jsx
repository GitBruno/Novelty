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
	
	var SPREAD = app.activeWindow.activeSpread;
	var SPREAD_SIZE = getBoundDimensions(getSpreadBounds(SPREAD));
	
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

function getBoundDimensions(myBounds){
	var boundsWidth  = myBounds[3]-myBounds[1];
    var boundsHeight = myBounds[2]-myBounds[0];
    return { W : boundsWidth, H : boundsHeight};
}

function getSpreadBounds(mySpread){
	// A function copied from the coverbuilder API
    // This functions returns the bounds of the spread in current measure units
    try{
        var firstPage = mySpread.pages[0];
        var lastPage  = mySpread.pages[mySpread.pages.length-1];
        var firstPageBounds = firstPage.bounds; //in the format [y1, x1, y2, x2], top-left and bottom-right
        var lastPageBounds  = lastPage.bounds;

        return [firstPageBounds[0],firstPageBounds[1],lastPageBounds[2],lastPageBounds[3]];
    } catch(err) {
        alert(err);
        return null;
    }
}

function showUI(){

	function resetUIvalues(){
		GS = getGridStep();
		v_editGS.text = GS.VGS;
		h_editGS.text = GS.HGS;
		v_row1_unit.text = current_measure_unit;
		h_row1_unit.text = current_measure_unit;
	}

	var myWindow = new Window ("palette", "Grid Fit V1");
		myWindow.orientation = "column";

	/////////////////////////////////////////////
	// START HORIZONTAL GRID STEP MEASUREMENTS //
	/////////////////////////////////////////////
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

		var h_row1_but_fitMinus = h_row1.add ("button", undefined, "Fit - 1");
			h_row1_but_fitMinus.onClick = function () {
				fitHGS(h_editGS.text, -1);
				resetUIvalues();
			};

		var h_row1_but_fit = h_row1.add ("button", undefined, "Fit");
			h_row1_but_fit.onClick = function () {
				fitHGS(h_editGS.text, 0);
				resetUIvalues();
			};

		var h_row1_but_fitPlus = h_row1.add ("button", undefined, "Fit + 1");
			h_row1_but_fitPlus.onClick = function () {
				fitHGS(h_editGS.text, 1);
				resetUIvalues();
			};

	///////////////////////////////////////////
	// START VERTICAL GRID STEP MEASUREMENTS //
	///////////////////////////////////////////
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

		var v_row1_but_fitMinus = v_row1.add ("button", undefined, "Fit - 1");
			v_row1_but_fitMinus.onClick = function () {
				fitVGS(v_editGS.text, -1);
				resetUIvalues();
			};

		var v_row1_but_fit = v_row1.add ("button", undefined, "Fit");
			v_row1_but_fit.onClick = function () {
				fitVGS(v_editGS.text, 0);
				resetUIvalues();
			};

		var v_row1_but_fitPlus = v_row1.add ("button", undefined, "Fit + 1");
			v_row1_but_fitPlus.onClick = function () {
				fitVGS(v_editGS.text, 1);
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

function fitHGS(myGridStep, addSubtract){
	var mySubdevision = DOC.gridPreferences.horizontalGridSubdivision;
	var myGS = parseFloat(myGridStep);
	var countGS = doRound(SPREAD_SIZE.W/myGS,0) + addSubtract;
	var fitGS = doRound(SPREAD_SIZE.W/countGS,8);
	setHGS(fitGS);
}

function fitVGS(myGridStep, addSubtract){
	var mySubdevision = DOC.gridPreferences.verticalGridSubdivision;
	var myGS = parseFloat(myGridStep);
	var countGS = doRound(SPREAD_SIZE.H/myGS,0) + addSubtract;
	var fitGS = doRound(SPREAD_SIZE.H/countGS,8);
	setVGS(fitGS);
}

function setHGS(myGridStep){
	var mySubdevision = DOC.gridPreferences.horizontalGridSubdivision;
	var myGS = parseFloat(myGridStep);
	DOC.gridPreferences.horizontalGridlineDivision = doRound(myGS * mySubdevision, 8);
}

function setVGS(myGridStep){
	var myGS = parseFloat(myGridStep);
	var mySubdevision = DOC.gridPreferences.verticalGridSubdivision;
	DOC.gridPreferences.verticalGridlineDivision = doRound(myGS * mySubdevision, 8);
}

function getGridStep(){
	return {
		HGS : doRound(DOC.gridPreferences.horizontalGridlineDivision / DOC.gridPreferences.horizontalGridSubdivision, 8),
		VGS : doRound(DOC.gridPreferences.verticalGridlineDivision / DOC.gridPreferences.verticalGridSubdivision, 8)
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