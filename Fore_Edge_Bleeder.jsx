//////////////////////////////////////////////////////////////////////////////////////////////////
//
//	Fore_Edge_Bleeder.jsx
//	An InDesign javascript
//	Place selected files in outside margin
//
//	Bruno Herfst 2011
//	
//////////////////////////////////////////////////////////////////////////////////////////////////

#target InDesign;

try{
	// Global variables
	var selectedLayer, myLoopImages = false, myInnerBleed = 5,
		myDoc = app.activeDocument,
		list_of_pages = myDoc.pages.everyItem().name,
		myFiles = File.openDialog("Select files to place:", "", true);
	
	// we are going to place the same image on both sides of the page
	// this ensures a sharp image on bookblock
	if(myFiles.length*2 < list_of_pages.length+1){ //just in case document is uneven
		// Save and set preferences
		var oldRuler = myDoc.viewPreferences.rulerOrigin;
		myDoc.viewPreferences.rulerOrigin = RulerOrigin.pageOrigin;
		//set rules to mm
		
		// Prep dialog
		var list_of_layers = myDoc.layers.everyItem().name;
		list_of_layers.push("[New Layer]");

		myDisplayDialog();
	}else{
		var diff = myFiles.length*2 - list_of_pages.length;
		alert("Too many images!\nPlease add "+diff+" pages");
		exit();
	}

} catch(err) {
	var txt=err.description;
	alert(txt);
	exit();
}

///////////////////////////////////////////////// F U N C T I O N S /////////////////////////////////////////////////

//dialog
function myDisplayDialog(){
	var myDialog = app.dialogs.add({name:"BookArt"}); 
	with(myDialog.dialogColumns.add()){
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Place images on layer:"});
			}
			with(dialogColumns.add()){
				var mySelectedLayer = dropdowns.add({stringList:list_of_layers, selectedIndex:0});
			}
		}
		//break//
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Visibility on page:"});
			}
			with(dialogColumns.add()){
				var myInputBleed=mm2pt(myInnerBleed);
				var myInnerBleedField = measurementEditboxes.add({editUnits:MeasurementUnits.MILLIMETERS,editValue:myInputBleed});
			}
		}
		//break//
		var diff = list_of_pages.length-(myFiles.length*2);
		if(diff>0){
			with(borderPanels.add()){
				with(dialogColumns.add()){
					staticTexts.add({staticLabel:"You have "+diff+" pages left:"});
				}
				with(dialogColumns.add()){
					var myLoopImagesCheckbox = checkboxControls.add({staticLabel:"Loop images", checkedState:true});
				}
			}
		}		
		var myResult = myDialog.show(); 
        
        if(myResult == true){
        	if (mySelectedLayer.selectedIndex == list_of_layers.length-1){
				selectedLayer = myDoc.layers.add();
			} else {
				selectedLayer = myDoc.layers[mySelectedLayer.selectedIndex];
			}
			myInnerBleed = pt2mm(myInnerBleedField.editValue);
			try{
        		myLoopImages = myLoopImagesCheckbox.checkedState;
			} catch(err){
				myLoopImages = false;
			}
			myDialog.destroy();
			placeImages();
			restoreOriginalSettings();
			alert("Done!");
			exit();
        } else {
			myDialog.destroy();
			exit();
		}
	}
}
//end dialog

function mm2pt(myMmNum){
	//1 millimetre = 2.83464567 PostScript points
	return myMmNum*2.83464567;
}
function pt2mm(myMmNum){
	//1 millimetre = 2.83464567 PostScript points
	return myMmNum/2.83464567;
}



function placeImages(){
	var myImages = myFiles.slice();//array
	for (var i=0; i<list_of_pages.length; i++){
		var myPage = myDoc.pages[i];
		if(myImages.length == 0){
			if(myLoopImages == true){
				myImages = myFiles.slice();
			} else {
				break;
			}
		}
		//place the same image on both sides of the sheet
		if(i % 2 === 0){
			var myIMG = myImages[0];
		} else {
			//shift array
			var myIMG = myImages.shift();
		}
		// create a container for the image
		// the coordinates
		var myY1 = -myDoc.documentPreferences.documentBleedTopOffset; //top
		var myY2 = myDoc.documentPreferences.pageHeight+myDoc.documentPreferences.documentBleedBottomOffset; //bottom
		if(myPage.side == PageSideOptions.leftHand){
			var myX1 = -myDoc.documentPreferences.documentBleedInsideOrLeftOffset; //left
			var myX2 = myInnerBleed; //right
		}
		else if(myPage.side == PageSideOptions.rightHand){
			var myX1 = myDoc.documentPreferences.pageWidth-myInnerBleed;
			var myX2 = myDoc.documentPreferences.pageWidth+myDoc.documentPreferences.documentBleedOutsideOrRightOffset;
		}
		myRectangle = myPage.rectangles.add(selectedLayer, undefined, undefined, {geometricBounds:[myY1, myX1, myY2, myX2], strokeWeight:0, strokeColor:myDoc.swatches.item("None"), fillColor:myDoc.swatches.item("None")});
		// place image in container
		myRectangle.place(myIMG);
	}
}

function restoreOriginalSettings(){
	myDoc.viewPreferences.rulerOrigin = oldRuler
}