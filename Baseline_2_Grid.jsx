// Baseline to Grid

#target indesign;
#targetengine "session";

function getVerticalGridStep( DEVISION ){
    DEVISION = parseFloat(DEVISION) || 0;
    var GRIDSTEP = doRound(DOC.gridPreferences.verticalGridlineDivision / DOC.gridPreferences.verticalGridSubdivision, 3);
    if (DEVISION == 0) return GRIDSTEP;
    return doRound( GRIDSTEP/DEVISION, 3);
}

function getBaselineOffset() {
    return DOC.gridPreferences.baselineStart;
}

function getBaselineDivision() {
    return DOC.gridPreferences.baselineDivision;
}

function adjustBaseline(myIdealLeading, addSubtract) {
    var addSubtract = addSubtract || 0;
    //set baseline
    var fitLeading = (Math.round(parseFloat(myIdealLeading)/VERTICALGRIDSTEP) * VERTICALGRIDSTEP) + (VERTICALGRIDSTEP * addSubtract);

    DOC.gridPreferences.baselineDivision = fitLeading;
}

function adjustOfset(myIdealLeading, addSubtract) {
    var addSubtract = addSubtract || 0;
    //set baseline
    var fitLeading = (Math.round(parseFloat(myIdealLeading)/VERTICALGRIDSTEP) * VERTICALGRIDSTEP) + (VERTICALGRIDSTEP * addSubtract);

    DOC.gridPreferences.baselineStart    = fitLeading;
}

function setRulerUnits(DOC, RulerUnitsXY){
    var originalUnits = [DOC.viewPreferences.horizontalMeasurementUnits, DOC.viewPreferences.verticalMeasurementUnits];

    DOC.viewPreferences.horizontalMeasurementUnits = RulerUnitsXY[0];
    DOC.viewPreferences.verticalMeasurementUnits = RulerUnitsXY[1];

    return originalUnits;
}

function resetSettings(){
    // This function changes back all settings to original settings
    setRulerUnits(DOC, ORIGINAL_RULERS);
    DOC.gridPreferences.documentGridShown = ORIGINAL_GRIDSHOWN;
}

function doRound(myNum, roundDec) {
    var roundMulit = Math.pow(10,roundDec);
    return Math.round(myNum*roundMulit)/roundMulit;
}

function showUI(){

    function resetUIvalues(){
        i_editGS.text = getBaselineDivision();
        o_editGS.text = getBaselineOffset();
    }

    var myWindow = new Window ("palette", "Baseline Fitter V1");
        myWindow.orientation = "column";

    var myDevisionGroup = myWindow.add ("panel", undefined, "Grid Devision:");
        myDevisionGroup.orientation = "column";
        
        var d_row1 = myDevisionGroup.add ("group");
            d_row1.orientation = "row";

        var d_editGS = d_row1.add ("edittext", undefined, 1);
            d_editGS.characters = 6;
            d_editGS.onChange = function () {
                d_editGS.text = String(parseFloat(d_editGS.text) || 0);
                VERTICALGRIDSTEP = getVerticalGridStep(d_editGS.text);
                resetUIvalues();
            }
    var myIncrementGroup = myWindow.add ("panel", undefined, "Increment Every");
        myIncrementGroup.orientation = "column";
        
        var i_row1 = myIncrementGroup.add ("group");
            i_row1.orientation = "row";

        var i_editGS = i_row1.add ("edittext", undefined, getBaselineDivision(DOC));
            i_editGS.characters = 6;
        var i_row1_unit = i_row1.add ("statictext", undefined, current_measure_unit);

        var i_row1_but_set = i_row1.add ("button", undefined, "Set");
            i_row1_but_set.onClick = function () {
                adjustBaseline(i_editGS.text);
                resetUIvalues();
            };

        var i_row1_but_fitMinus = i_row1.add ("button", undefined, "Fit - 1");
            i_row1_but_fitMinus.onClick = function () {
                adjustBaseline(i_editGS.text, -1);
                resetUIvalues();
            };

        var i_row1_but_fit = i_row1.add ("button", undefined, "Fit");
            i_row1_but_fit.onClick = function () {
                adjustBaseline(i_editGS.text, 0);
                resetUIvalues();
            };

        var i_row1_but_fitPlus = i_row1.add ("button", undefined, "Fit + 1");
            i_row1_but_fitPlus.onClick = function () {
                adjustBaseline(i_editGS.text, 1);
                resetUIvalues();
            };

    var myOffsetGroup = myWindow.add ("panel", undefined, "Offset");
        myOffsetGroup.orientation = "column";
        
        var o_row1 = myOffsetGroup.add ("group");
            o_row1.orientation = "row";

        var o_editGS = o_row1.add ("edittext", undefined, getBaselineOffset(DOC));
            o_editGS.characters = 6;
        var o_row1_unit = o_row1.add ("statictext", undefined, current_measure_unit);

        var o_row1_but_set = o_row1.add ("button", undefined, "Set");
            o_row1_but_set.onClick = function () {
                adjustOfset(v_editGS.text);
                resetUIvalues();
            };

        var o_row1_but_fitMinus = o_row1.add ("button", undefined, "Fit - 1");
            o_row1_but_fitMinus.onClick = function () {
                adjustOfset(o_editGS.text, -1);
                resetUIvalues();
            };

        var o_row1_but_fit = o_row1.add ("button", undefined, "Fit");
            o_row1_but_fit.onClick = function () {
                adjustOfset(o_editGS.text, 0);
                resetUIvalues();
            };

        var o_row1_but_fitPlus = o_row1.add ("button", undefined, "Fit + 1");
            o_row1_but_fitPlus.onClick = function () {
                adjustOfset(o_editGS.text, 1);
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

try {
    //global vars
    var DOC = app.activeDocument;
    var DOC_HEIGHT = DOC.documentPreferences.pageHeight;
    
    var ORIGINAL_RULERS = setRulerUnits(DOC, [MeasurementUnits.POINTS, MeasurementUnits.POINTS]); // Safe old ruler units whils setting to points
    var ORIGINAL_GRIDSHOWN = DOC.gridPreferences.documentGridShown;
    
    var MY_MEASURE_UNITS = ["mm","pt"];
    var current_measure_unit = MY_MEASURE_UNITS[1];

    // Show grid while interacting with the UI
    DOC.gridPreferences.documentGridShown = true;

    //Get current step
    var VERTICALGRIDSTEP = getVerticalGridStep();
    var OFFSET = getBaselineOffset();
    showUI();

} catch(err) {
    alert(err.description);
    exit();
}



