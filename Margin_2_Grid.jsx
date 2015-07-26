/*

Adjust_Margin_Grid.jsx
Bruno Herfst 2011

moves the margins on grid.
note this only works with grids that are a division of pagesize

*/

#target InDesign;

try {
	//global vars
	var myDoc = app.activeDocument;
	//get grid offset
	var orGridH = myDoc.gridPreferences.horizontalGridlineDivision,
		orGridV = myDoc.gridPreferences.verticalGridlineDivision,
		//save preferences
		myOrGridBool = myDoc.gridPreferences.documentGridShown,
		myOrLayoutAdj = myDoc.layoutAdjustmentPreferences.enableLayoutAdjustment,
		myPageHeight = myDoc.documentPreferences.pageHeight,
		myPageWidth = myDoc.documentPreferences.pageWidth;
		
		//save measurements units
		myOldXUnits = myDoc.viewPreferences.horizontalMeasurementUnits;
		myOldYUnits = myDoc.viewPreferences.verticalMeasurementUnits;
		//set measurements units to points
		setRulerUnits(myDoc, MeasurementUnits.points, MeasurementUnits.points);
		
		//myDoc.gridPreferences.horizontalGridlineDivision = myPageWidth/(Math.round(myPageWidth/myDoc.gridPreferences.horizontalGridlineDivision));
		//myDoc.gridPreferences.verticalGridlineDivision = myPageHeight/(Math.round(myPageHeight/myDoc.gridPreferences.verticalGridlineDivision));
		
	//save old margins
	var myTopMargin = myDoc.marginPreferences.top,
		myBottomMargin = myDoc.marginPreferences.bottom,
		myOutsideMargin = myDoc.marginPreferences.left,
		myInsideMargin = myDoc.marginPreferences.right,
		hGrid = myDoc.gridPreferences.horizontalGridlineDivision / myDoc.gridPreferences.horizontalGridSubdivision,
		vGrid = myDoc.gridPreferences.verticalGridlineDivision / myDoc.gridPreferences.verticalGridSubdivision;
	
	// set preferences
	myDoc.gridPreferences.documentGridShown = true;
	myDoc.layoutAdjustmentPreferences.enableLayoutAdjustment = true;
	// Let’s set the docs marginpref to grid first
	marginPreftoGrid();
	// Let’s do it!
	showWin();
} catch(err) {
	var txt=err.description;
	alert(txt);
	exit();
}


//------------------------------------- F U N C T I O N S -------------------------------------

function showWin(){
	if(myDoc.documentPreferences.facingPages == true){
		var right = "Outside",
			left = "Inside";
	}else{
		var right = "Right",
			left = "Left"
	}
	var myWin = new Window('dialog', 'Grid Margins');
	myWin.orientation = 'column';
	
	myWin.btnTa = myWin.add('button', undefined, '+ Top');
  	myWin.btnTs = myWin.add('button', undefined, '- Top');
  	
  	myWin.btnIa = myWin.add('button', undefined, '+ '+left);
  	myWin.btnIs = myWin.add('button', undefined, '- '+left);
  	
	myWin.btnOa = myWin.add('button', undefined, '+ '+right);
  	myWin.btnOs = myWin.add('button', undefined, '- '+right);
  	
  	myWin.btnBa = myWin.add('button', undefined, '+ Bottom');
  	myWin.btnBs = myWin.add('button', undefined, '- Bottom');
  	
  	myWin.btnK = myWin.add('button', undefined, 'OK');
  	myWin.btnC = myWin.add('button', undefined, 'Cancel');
  	
	
	//button functionality
	myWin.btnTa.onClick = function () { myWin.close(1); }; // Top Add
	myWin.btnTs.onClick = function () { myWin.close(2); }; // Top subtract
	
	myWin.btnOa.onClick = function () { myWin.close(3); }; // Outside (right) Add
	myWin.btnOs.onClick = function () { myWin.close(4); }; // Outside (right) subtract
	
	myWin.btnIa.onClick = function () { myWin.close(5); }; // Inside (left) Add
	myWin.btnIs.onClick = function () { myWin.close(6); }; // Inside (left) subtract
	
	myWin.btnBa.onClick = function () { myWin.close(7); }; // Bottom Add
	myWin.btnBs.onClick = function () { myWin.close(8); }; // Bottom subtract
	
	myWin.btnC.onClick = function () { myWin.close(0); };
	myWin.btnK.onClick = function () { myWin.close(9); };
	
	myWin.center();
	var myWindow = myWin.show();
	
	
	var positions = ['top', 'right', 'left', 'bottom'];
	if (myWindow %9!=0) {adjustMargin(positions[Math.floor((myWindow-1)/2)], myWindow%2);
	showWin();}
	else {
		switch (myWindow){
		case 9: // OK
			//restore preferences
			myDoc.gridPreferences.documentGridShown = myOrGridBool;
			myDoc.layoutAdjustmentPreferences.enableLayoutAdjustment = myOrLayoutAdj;
			//restore measurements units
			setRulerUnits(myDoc, myOldXUnits, myOldYUnits);
			exit();
			break;
		default: // cancel
			//restore preferences
			//myDoc.gridPreferences.horizontalGridlineDivision = orGridH;
			//myDoc.gridPreferences.verticalGridlineDivision = orGridH;
			myDoc.marginPreferences.top = myTopMargin;
			myDoc.marginPreferences.bottom = myBottomMargin;
			myDoc.marginPreferences.left = myOutsideMargin;
			myDoc.marginPreferences.right = myInsideMargin;
			updateMasters();
			myDoc.gridPreferences.documentGridShown = myOrGridBool;
			myDoc.layoutAdjustmentPreferences.enableLayoutAdjustment = myOrLayoutAdj;
			//restore measurements units
			setRulerUnits(myDoc, myOldXUnits, myOldYUnits);
			exit();
			break;
		}
	}
}

function marginPreftoGrid(){
	myDoc.marginPreferences.top = (Math.round(myDoc.masterSpreads[0].pages[0].marginPreferences.right/vGrid))*vGrid;
	myDoc.marginPreferences.right = (Math.round(myDoc.masterSpreads[0].pages[0].marginPreferences.right/hGrid))*hGrid;
	myDoc.marginPreferences.left = (Math.round(myDoc.masterSpreads[0].pages[0].marginPreferences.right/hGrid))*hGrid;
	myDoc.marginPreferences.bottom = (Math.round(myDoc.masterSpreads[0].pages[0].marginPreferences.right/vGrid))*vGrid;
	updateMasters();
}

function adjustMargin(side,AddSubtractBool){
	myDoc.marginPreferences[side] += ((side == 'top' || side == 'bottom')?vGrid:hGrid)*((AddSubtractBool)?1:-1);
	//myDoc.marginPreferences[side] += this[((side.substr(-1,1)=='t')?'h':'v')+'Grid']*((AddSubtractBool)?1:-1);
	
	//var mod = (AddSubtractBool)? 1 : -1;
	
	/*switch(side){
		case 'top':
			myDoc.marginPreferences.top += vGrid * mod;
			break;
		case 'right':
			if(AddSubtractBool == true){
				myDoc.marginPreferences.right += hGrid;
			} else {
				myDoc.marginPreferences.right -= hGrid;
			}
			break;
		case 'bottom':
			if(AddSubtractBool == true){
				myDoc.marginPreferences.bottom += vGrid;
			} else {
				myDoc.marginPreferences.bottom -= vGrid;
			}
			break;
		case 'left':
			if(AddSubtractBool == true){
				myDoc.marginPreferences.left += hGrid;
			} else {
				myDoc.marginPreferences.left -= hGrid;
			}
			break;
		default:
			alert('whoops!');
			exit();
			break;
	}*/
	updateMasters();
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

function updateMasters(){
	for(var i=0; i < myDoc.masterSpreads.length; i++){
		for(var j=0; j < myDoc.masterSpreads.item(i).pages.length; j++){
			myPage = myDoc.masterSpreads.item(i).pages.item(j);
			updatePage(myPage);
		}
	}
}

function updatePage(myPage){
	try {
		// We need to round these numbers 
		// Indesign does not like more than three decimals here
		// This will fix the boundingbox error with automatic textflow
		myPage.marginPreferences.top = doRound(myDoc.marginPreferences.top, 3);
		myPage.marginPreferences.bottom = doRound(myDoc.marginPreferences.bottom, 3);
		myPage.marginPreferences.left = doRound(myDoc.marginPreferences.left, 3);
		myPage.marginPreferences.right = doRound(myDoc.marginPreferences.right, 3);		
	} catch(err) {
	  	alert(err.description);
	}
}