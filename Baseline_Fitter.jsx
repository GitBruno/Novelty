//    Baseline_Fitter.jsx
//    An InDesign CS5 JavaScript
//    Bruno Herfst 2011

//    V1.2 BETA

//    Sets baseline based on selected textleading.
//    With the ability to adjusts pagemargins and styles and grid accordingly.


//----------------------------------- S H O W - D I A L O G

//Global variables
var myDoc, myPageHeight, myPageWidth, myOldXUnits, myOldYUnits;

main();

function ShowDialog(myDoc, myIdealLeading){
	var myDialog = app.dialogs.add({name:"Set Baseline", canCancel:true});
	with(myDialog){
		with(dialogColumns.add()){
			with(dialogRows.add()){
				staticTexts.add({staticLabel:"The ideal leading is " + myIdealLeading});
			}
			with(dialogRows.add()){
				var myBaselineCheckbox = checkboxControls.add({staticLabel:"Adjust Baseline Grid", checkedState:true});
			}
			with(dialogRows.add()){
				var myStylesCheckbox = checkboxControls.add({staticLabel:"Adjust Styles", checkedState:true});
			}
			with(dialogRows.add()){
				var myMarginsCheckbox = checkboxControls.add({staticLabel:"Align margins", checkedState:true});
			}
			with(dialogRows.add()){
				var myGridCheckbox = checkboxControls.add({staticLabel:"Adjust Grid", checkedState:true});
			}
		}
	}
	//Display the dialog box.
	if(myDialog.show() == true){
		var myBaselineBool = myBaselineCheckbox.checkedState;
		var myStylesBool = myStylesCheckbox.checkedState;
		var myMarginsBool = myMarginsCheckbox.checkedState;
		var myGridBool = myGridCheckbox.checkedState;
	
		if(myBaselineBool == true){
			adjustBaseline(myDoc,myIdealLeading);
		}
		if(myGridBool == true){
			fixGrid(myDoc, myIdealLeading);
		}
		if(myMarginsBool == true){
			adjustMyMargins(myDoc,myIdealLeading);
		}
		if(myStylesBool == true){
			adjustMyStyles(myDoc,myIdealLeading);
		}
		
		//restore measurements units
		setRulerUnits(myDoc, myOldXUnits, myOldYUnits);
		
		myDialog.destroy();
		
	}
	else{
		myDialog.destroy()
	}
}

//----------------------------------- E N D - D I A L O G

function main(){
	if(app.documents.length != 0){
		myDoc = app.activeDocument;
		if(app.selection.length != 0){
			if (myDoc.selection[0].constructor.name != "Text") {
				alert ("This is a "+app.activeDocument.selection[0].constructor.name+"\nPlease select some text");
				exit(0);
			}else{
				//save measurements units
				myOldXUnits = myDoc.viewPreferences.horizontalMeasurementUnits;
				myOldYUnits = myDoc.viewPreferences.verticalMeasurementUnits;
				//set measurements units to points
				setRulerUnits(myDoc, MeasurementUnits.points, MeasurementUnits.points);
				
				//get data
				var myLeading = myDoc.selection[0].leading;
				if(myLeading == 1635019116){
					//myLeading is set to auto
					myLeading = (myDoc.selection[0].pointSize/100)*myDoc.selection[0].autoLeading;
				}
				myPageHeight = myDoc.documentPreferences.pageHeight;
				myPageWidth = myDoc.documentPreferences.pageWidth;
				
				//calculate ideal leading
				myLines = doRound(myPageHeight/myLeading, 0);
				
				myIdealLeading = doRound(myPageHeight/myLines,3);
				ShowDialog(myDoc,myIdealLeading);
			}
		}else{
			alert("Nothing selected\nPlease select some text");
		}
	}else{
		alert("Please open a document and try again.");
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

function adjustBaseline(myDoc,myIdealLeading){
	//set baseline
	myDoc.gridPreferences.baselineDivision = myIdealLeading;
	myDoc.gridPreferences.baselineStart = myIdealLeading;
}

function adjustMyStyles(myDoc,myIdealLeading){
	var list_of_All_paragraph_styles = myDoc.paragraphStyles.everyItem().name;
	var myCheckboxes = new Array();
	var myCheckboxes2 = new Array();
	
	// create Dialog
	var myDialog = app.dialogs.add({name:"Adjust styles", canCancel:false});
	with(myDialog.dialogColumns.add()){
		staticTexts.add({staticLabel:"Set leading to "+myIdealLeading+" pt:"});
	}
	with(myDialog.dialogColumns.add()){
		for(myCounter=1; myCounter<list_of_All_paragraph_styles.length; myCounter++) {
			var myCheckbox;
			myCheckboxes.push(myCheckbox);
			with(dialogRows.add()){
				myCheckboxes[myCounter] = checkboxControls.add({staticLabel:list_of_All_paragraph_styles[myCounter], checkedState:false});
			}
		}
	}
	with(myDialog.dialogColumns.add()){
		for(myCounter=1; myCounter<list_of_All_paragraph_styles.length; myCounter++) {
			var myCheckbox2;
			myCheckboxes2.push(myCheckbox2);
			with(dialogRows.add()){
				myCheckboxes2[myCounter] = checkboxControls.add({staticLabel:"Align to grid", checkedState:false});
			}
		}
	}
	var myResult = myDialog.show();
	
	if(myResult == true){
		var myPS = new Array();
		var myBL = new Array();
		var myParagraphStyle;
		var myBaseLine;
		myPS.push(myParagraphStyle);
		myBL.push(myBaseLine);
		for(myCounter=1; myCounter<list_of_All_paragraph_styles.length; myCounter++) {
			myPS[myCounter-1] = myCheckboxes[myCounter].checkedState;
		}
		for(myCounter=1; myCounter<list_of_All_paragraph_styles.length; myCounter++) {
			myBL[myCounter-1] = myCheckboxes2[myCounter].checkedState;
		}
		for(myCounter=0; myCounter<myPS.length; myCounter++) {
			if (myPS[myCounter] == true) {
				var myPara = myDoc.paragraphStyles.item(list_of_All_paragraph_styles[myCounter+1]);
				myPara.leading = myIdealLeading;
			}
			if (myBL[myCounter] == true) {
				var myPara = myDoc.paragraphStyles.item(list_of_All_paragraph_styles[myCounter+1]);
				myPara.alignToBaseline = true;
			}
		}
	}
}

function adjustMyMargins(myDoc,myIdealLeading){
	for(i=0; i < myDoc.masterSpreads.length; i++){
		for(j=0; j < myDoc.masterSpreads.item(i).pages.length; j++){
			myPage = myDoc.masterSpreads.item(i).pages.item(j);
			readmargins(myPage);
			fixPage(myPage, myMargins, myIdealLeading);
		}
	}
}

function readmargins(myPage) {
	try {
		//save measurements units
		var myOldXUnits = myDoc.viewPreferences.horizontalMeasurementUnits;
		var myOldYUnits = myDoc.viewPreferences.verticalMeasurementUnits;
	
		//set measurements units to points
		setRulerUnits(myDoc, MeasurementUnits.points, MeasurementUnits.points);
	
		myTopMargin = myPage.marginPreferences.top;  
		myBottomMargin = myPage.marginPreferences.bottom;
		if(myPage.side == PageSideOptions.leftHand){
				myOutsideMargin = myPage.marginPreferences.left;
				myInsideMargin = myPage.marginPreferences.right;
		}
		else{
			myInsideMargin = myPage.marginPreferences.left;
			myOutsideMargin = myPage.marginPreferences.right;
		}
		myMargins = new Array(myTopMargin, myBottomMargin, myOutsideMargin, myInsideMargin);
		
		//restore measurements units
		setRulerUnits(myDoc, myOldXUnits, myOldYUnits);
		
		return myMargins;
	
	} catch(err) {
	  	alert(err.description);
	}
}

function fixGrid(myDoc, myIdealLeading){
	myDevide = 3;
	myV_every = myIdealLeading*myDevide;
	myH_every = (myIdealLeading*(myPageWidth/myPageHeight))*3;
	
	myDoc.gridPreferences.horizontalGridlineDivision = doRound(myH_every,3);
	myDoc.gridPreferences.horizontalGridSubdivision = myDevide;
	
	myDoc.gridPreferences.verticalGridlineDivision = doRound(myV_every,3);
	myDoc.gridPreferences.verticalGridSubdivision = myDevide;
}

function fixPage(myPage, myMargins, myIdealLeading){
	//calculate ideal margin
	myTopLines = doRound(myMargins[0]/myIdealLeading,0);
	myTopMargin = myIdealLeading*myTopLines;
	myBottomLines = doRound(myMargins[1]/myIdealLeading,0);
	myBottomMargin = (myIdealLeading*myBottomLines);
	
	myH_every = myIdealLeading*(myPageWidth/myPageHeight);
	
	myOutsideLines = doRound(myMargins[2]/myH_every,0);
	myOutsideMargin = doRound(myH_every*myOutsideLines,3);
	
	myInsideLines = doRound(myMargins[3]/myH_every,0);
	myInsideMargin = doRound(myH_every*myInsideLines,3);
	
	try {
		myPage.marginPreferences.top = myTopMargin;  
		myPage.marginPreferences.bottom = myBottomMargin;
		
		if(myPage.side == PageSideOptions.leftHand){
			myPage.marginPreferences.left = myOutsideMargin;
			myPage.marginPreferences.right = myInsideMargin;
		}
		else{
			myPage.marginPreferences.left = myInsideMargin;
			myPage.marginPreferences.right = myOutsideMargin;
		}
		
	} catch(err) {
	  	alert(err.description);
	}
}