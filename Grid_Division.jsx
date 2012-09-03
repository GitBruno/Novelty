/*

GridDivision.jsx
Version 1.1
Bruno Herfst 2011

Returns value of grid division as edittext for you to copy.

*/

#target InDesign;

try {
	//global vars
	var myDoc = app.activeDocument;
		//save measurements units
		myOldXUnits = myDoc.viewPreferences.horizontalMeasurementUnits,
		myOldYUnits = myDoc.viewPreferences.verticalMeasurementUnits;
	
	setRulerUnits(myDoc, MeasurementUnits.points, MeasurementUnits.points);
	
	//get actual grid size! //////////////////////////////////////////
	var	hGrid = myDoc.gridPreferences.horizontalGridlineDivision / myDoc.gridPreferences.horizontalGridSubdivision,
		vGrid = myDoc.gridPreferences.verticalGridlineDivision / myDoc.gridPreferences.verticalGridSubdivision,
		exp = 1;
		
	showWin();
} catch(err) {
	var txt=err.description;
	alert(txt);
	exit();
}


//------------------------------------- F U N C T I O N S -------------------------------------

function showWin(){
	var horGrid = exp*hGrid;
	var verGrid = exp*vGrid;
	var myWin = new Window('dialog', exp+' Grid Division');
	
	myWin.orientation = 'column';
	myWin.myShField = myWin.add('statictext', undefined, "Width:");
	myWin.myWField = myWin.add('edittext', undefined, doRound(horGrid,3) + " pt");
	myWin.mySvField = myWin.add('statictext', undefined, "Height:");
	myWin.myHField = myWin.add('edittext', undefined, doRound(verGrid,3) + " pt");
	
  	myWin.btnA = myWin.add('button', [0,0,100,0], '+ 1');
  	myWin.btnD = myWin.add('button', [0,0,100,0], '- 1');
  	myWin.btnA5 = myWin.add('button', [0,0,100,0], '+ 0.5');
  	myWin.btnD5 = myWin.add('button', [0,0,100,0], '- 0.5');
  	
  	myWin.btnC = myWin.add('button', [0,0,100,0], 'Cancel');
  	
	
	//button functionality
	myWin.btnA.onClick = function () { myWin.close(1); };
	myWin.btnD.onClick = function () { myWin.close(2); };
	myWin.btnA5.onClick = function () { myWin.close(3); };
	myWin.btnD5.onClick = function () { myWin.close(4); };
	myWin.btnC.onClick = function () { myWin.close(0); };
	
	myWin.center();
	var myWindow = myWin.show();
	
	
	switch (myWindow){
		case 1: // AH
			exp += 1;
			showWin();
			break;
		case 2: // RH
			if(exp > 0){
				exp -= 1;
			}
			showWin();
			break;
		case 3: // AH
			exp += 0.5;
			showWin();
			break;
		case 4: // RH
			if(exp > 0){
				exp -= 0.5;
			}
			showWin();
			break;
		default: // cancel
			//restore measurements units
			setRulerUnits(myDoc, myOldXUnits, myOldYUnits);
			exit();
			break;
	}
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

function doRound(myNum, roundDec) {
	var roundMulit = Math.pow(10,roundDec);
	return Math.round(myNum*roundMulit)/roundMulit;
}