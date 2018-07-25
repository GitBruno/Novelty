/*

Align_2_Grid.jsx
Version 1.0
Bruno Herfst 2011 - 2018

An InDesign JavaScript to align page-items to Document Grid

*/

#target InDesign;

var Settings = {
	alignInset : true
};

try {
    //global vars
    var myDoc = app.activeDocument;
    //save measurements units
    myOldXUnits = myDoc.viewPreferences.horizontalMeasurementUnits,
    OldYUnits = myDoc.viewPreferences.verticalMeasurementUnits;
    
    setRulerUnits(myDoc, MeasurementUnits.points, MeasurementUnits.points);
    var G = getGridDivision(myDoc);
    
    function alignBounds( myPageItem ){
        var bounds = myPageItem.geometricBounds; //array [y1, x1, y2, x2], [top, left, bottom, right]
        myPageItem.geometricBounds = [roundTo(bounds[0],G.h), roundTo(bounds[1],G.w), roundTo(bounds[2],G.h), roundTo(bounds[3],G.w)];
    };
    
    function alignInset( myTextFrame ){
        var inset = myTextFrame.textFramePreferences.insetSpacing; //array [y1, x1, y2, x2], [top, left, bottom, right]
        myTextFrame.textFramePreferences.insetSpacing = [roundTo(inset[0],G.h), roundTo(inset[1],G.w), roundTo(inset[2],G.h), roundTo(inset[3],G.w)];
    };

    if(app.selection.length != 0){
        //Get the first item in the selection.
        for(var i=0;i<app.selection.length;i++){
            var mySelection = app.selection[i];
            switch(mySelection.constructor.name){
                case "Rectangle": case "Oval": case "Polygon": case "Group": case "Path":
                    alignBounds( mySelection );
                    break;
                case "TextFrame":
                    alignBounds( mySelection );
                    if(Settings.alignInset) {
                        alignInset( mySelection );
                    };
                    break;
                default:
                    var ws = mySelection.constructor.name;
                    alert("Didn’t do "+ws+" in selection");
            }
        }
    }else{
        alert("Please select something first.");
    }
} catch(err) {
    var txt=err.description;
    alert(txt);
    exit();
}

function getGridDivision(myDoc){
    var G = new Object();
    G.w = myDoc.gridPreferences.horizontalGridlineDivision / myDoc.gridPreferences.horizontalGridSubdivision;
    G.h = myDoc.gridPreferences.verticalGridlineDivision / myDoc.gridPreferences.verticalGridSubdivision;
    return G;
}

function setRulerUnits(myDoc,XUnits,YUnits){
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
    myDoc.viewPreferences.verticalMeasurementUnits = YUnits;
}

function roundTo(num,grid){
    return doRound(Math.round(num/grid)*grid,3);
}

function doRound(myNum, roundDec) {
    var roundMulit = Math.pow(10,roundDec);
    return Math.round(myNum*roundMulit)/roundMulit;
}

function exit(){
    //reset rulers
    setRulerUnits(myDoc, myOldXUnits, OldYUnits);
}
