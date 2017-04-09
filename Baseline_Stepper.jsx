//    Baseline_Stepper.jsx
//    An InDesign CS5 JavaScript
//    Bruno Herfst 2011

//    V1.0 BETA (Based on Baseline_Fitter.jsx)

//    Sets baseline to fit page including baseline adder/remover 
//    and offset control in percentage of basline

//----------------------------------- S H O W - D I A L O G

#target indesign;
#targetengine "session";

//Global variables
var myDoc, pageHeight, pageWidth, originalGridShown, originalXUnits, originalYUnits, currentBaselineStep, currentBaselineDivision, currentBaselineStart, originalBaselineDivision, originalBaselineStart;

var appSettingVal = false;

function getIdealPageLeading() {
    //calculate ideal baseline
    myLines     = doRound(pageHeight/currentBaselineDivision, 0);
    pageLeading = doRound(pageHeight/myLines,3);
    return pageLeading; 
}

function setRulerUnits(myDoc, XUnits, YUnits){
    //myUnits choices are:
    //MeasurementUnits.picas
    //MeasurementUnits.points
    //MeasurementUnits.inches
    //MeasurementUnits.inchesDecimal
    //MeasurementUnits.millimeters
    //MeasurementUnits.centimeters
    //MeasurementUnits.ciceros
    //MeasurementUnits.gates
    myDoc.viewPreferences.horizontalMeasurementUnits = XUnits;
    myDoc.viewPreferences.verticalMeasurementUnits   = YUnits;
}

function doRound(myNum, roundDec) {
    var roundMulit = Math.pow(10,roundDec);
    return Math.round(myNum*roundMulit)/roundMulit;
}

function adjustBaseline(myDoc, incrementEvery, start){
    if (!start) {
        start = incrementEvery;
    }
    //set baseline
    myDoc.gridPreferences.baselineDivision = incrementEvery;
    myDoc.gridPreferences.baselineStart    = start;
}

function showUI( myDoc ){
    // checkboxControls.add({staticLabel:"Adjust Grid", checkedState:true});

    var myWindow = new Window ("palette", "Baseline Stepper");
        myWindow.orientation = "row";
    var myInputGroup = myWindow.add ("group");
        myInputGroup.orientation = "column";
        myInputGroup.alignChildren = "right";

    var incrementGroup = myInputGroup.add ("group");
        incrementGroup.orientation = "row";

        incrementGroup.add ("statictext", undefined, "Increment:");
        var blAddWhole = incrementGroup.add ("button", undefined, "-1 bs");
        var blAddQuart = incrementGroup.add ("button", undefined, "-0.25 bs");
        var blFit      = incrementGroup.add ("button", undefined, "Fit to page");
        var blSubQuart = incrementGroup.add ("button", undefined, "+0.25 bs");
        var blSubWhole = incrementGroup.add ("button", undefined, "+1 bs");

        blAddWhole.onClick = function () {
            setCurrentBaselineValue ( blStepper( -1 ) );
        };
        blAddQuart.onClick = function () {
            setCurrentBaselineValue ( blStepper( -0.25 ) );
        };
        blFit.onClick = function () {
            // Snap to 0.25?
            setCurrentBaselineValue ( blFittedStepper( 0 ) );
        };
        blSubQuart.onClick = function () {
            setCurrentBaselineValue ( blStepper( 0.25 ) );
        };
        blSubWhole.onClick = function () {
            setCurrentBaselineValue ( blStepper( 1 ) );
        };

        // Show and customise current value
        var myCurBLDValue = incrementGroup.add ("editText", undefined, doRound(currentBaselineDivision,3)+" pt");
            myCurBLDValue.characters = 10;

    var myButtonGroup = myWindow.add ("group");
        myButtonGroup.orientation = "column";

    var ok_but     = myButtonGroup.add ("button", undefined, "Exit");
    var cancel_but = myButtonGroup.add ("button", undefined, "Cancel");

    myCurBLDValue.onChange = function () {
        if(!appSettingVal){
            currentBaselineDivision = parseFloat(this.text);
            adjustBaseline(myDoc, currentBaselineDivision, currentBaselineStart);
            myCurBLDValue.text = doRound(currentBaselineDivision,3)+" pt";
        }
    }

    ok_but.onClick = function () {
        cleanExit();
        myWindow.close();
    };
    cancel_but.onClick = function () {
        adjustBaseline(myDoc, originalBaselineDivision, originalBaselineStart);
        cleanExit();
        myWindow.close();
    };

    function setCurrentBaselineValue ( val ) {
        appSettingVal = true;
        currentBaselineDivision = val;
        adjustBaseline(myDoc, currentBaselineDivision, currentBaselineStart);
        myCurBLDValue.text = doRound(currentBaselineDivision,3)+" pt";
        appSettingVal = false;
    }

    function blStepper( addLines ) {
        var actualHeight = pageHeight - currentBaselineStart;
        var myLines      = (actualHeight/currentBaselineDivision) + addLines;
        var baselineStep = actualHeight/myLines;
        return baselineStep;
    }

    function blFittedStepper( addLines ) {
        var actualHeight = pageHeight - currentBaselineStart;
        var myLines      = doRound(actualHeight/currentBaselineDivision, 0) + addLines;
        var idealLeading = doRound(actualHeight/myLines,3);
        return idealLeading; 
    }

    myWindow.show();
}

//----------------------------------- E N D - D I A L O G

function cleanExit() {
    // restore orignal settings
    myDoc.gridPreferences.documentGridShown = originalGridShown;
    myDoc.gridPreferences.baselineGridShown = originalBaselineGridShown;
    setRulerUnits(myDoc, originalXUnits, originalYUnits);
}

function main(){
    if(app.documents.length != 0){
        myDoc = app.documents[0];
        if( myDoc.isValid ){            
            // save measurements units
            originalXUnits = myDoc.viewPreferences.horizontalMeasurementUnits;
            originalYUnits = myDoc.viewPreferences.verticalMeasurementUnits;
            //set measurement units to points
            setRulerUnits(myDoc, MeasurementUnits.points, MeasurementUnits.points);
            // save 
            originalGridShown = myDoc.gridPreferences.documentGridShown;
            originalBaselineGridShown = myDoc.gridPreferences.baselineGridShown;
            // save orginal baseline
            currentBaselineDivision  = myDoc.gridPreferences.baselineDivision;
            currentBaselineStart     = myDoc.gridPreferences.baselineStart;
            originalBaselineDivision = currentBaselineDivision;
            originalBaselineStart    = currentBaselineStart;
            // save page dimension
            pageHeight = myDoc.documentPreferences.pageHeight;
            pageWidth  = myDoc.documentPreferences.pageWidth;

            // Show grid while interacting with the UI
            myDoc.gridPreferences.baselineGridShown = true;

            showUI( myDoc );

        }else{
            alert("Please open a document before running this script.");
        }
    }else{
        alert("Please open a document and try again.");
    }
}

main(); // EOF
