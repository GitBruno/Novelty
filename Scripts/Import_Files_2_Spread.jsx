// Import_Files_2_Spread.jsx
// An InDesign javascript to place exported layers from Photoshop into InDesign.
// Version 1.0
// Bruno Herfst 2018

// Based on Files_2_Pages

#target indesign;

var presetLabel = 'Import_Files_2_Spread.jsx'
var myDoc = app.activeDocument;
var mySelected = 0;
var myFiles;

if (myFiles = File.openDialog("Select files to insert:", "", true)){
	var oldRuler = myDoc.viewPreferences.rulerOrigin;
	myDoc.viewPreferences.rulerOrigin = RulerOrigin.pageOrigin;
	// Create lists
	var list_of_layers = myDoc.layers.everyItem().name;
	list_of_layers.push("[New Layer]");
	var list_of_master_pages = myDoc.masterSpreads.everyItem().name;

	/*
	var list_of_pages = myDoc.pages.everyItem().name;
	// Let’s see which page is selected
	for (var j=0; j<=list_of_pages.length-1; j++){
		if(list_of_pages[j] == app.activeWindow.activePage.name){
			mySelected = j;
			break;
		}
	}
	*/

	var loadSettings = eval(myDoc.extractLabel(presetLabel));
	myDisplayDialog();
}

//show dialog
function myDisplayDialog(){
	var myTempString="PLACE "+(myFiles.length + " ")+"FILES";
	var myDialog = app.dialogs.add({name:myTempString});

	// function which assigns values to elements
	// Thanks to Marijan Tompa
	// http://indisnip.wordpress.com/2010/12/31/saving-script-data-using-json-part-2/
	var myValues = function(setObj, defValue){
	    if(loadSettings != undefined){
	        if(loadSettings[setObj]){
	            return loadSettings[setObj];
	        } else { return defValue }
	    }else{
	        return defValue;
	    }
	};

	with(myDialog.dialogColumns.add()){
		with(dialogRows.add()){
			/*
			var myTempList=new Array("Before","After");
			with(dialogColumns.add()){
				var myBefore_after = dropdowns.add({stringList:myTempList, selectedIndex:1});
			}
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"page"});
			}
			with(dialogColumns.add()){
				var insert_page = dropdowns.add({stringList:list_of_pages, selectedIndex:mySelected});
			}
			*/
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"on layer"});
			}
			with(dialogColumns.add()){
				var mySelectedLayer = dropdowns.add({stringList:list_of_layers});
				mySelectedLayer.selectedIndex = myValues("mySelectedLayer", 0);
			}
		}
		//break//
		with(borderPanels.add()){
			with(myFitButtons = radiobuttonGroups.add()){
				var myFitPercentRadio = radiobuttonControls.add( { staticLabel : 'Percentage:'} );
				var myFitRadio = radiobuttonControls.add( { staticLabel : 'Fit proportionally '} );
				myFitButtons.selectedButton = myValues("myFitButtons", 0);
			}
			with(dialogColumns.add()){
				var myPercentField = percentEditboxes.add({editValue:myValues("myPercentField", 100)});
			}
			with(myFitButtons2 = radiobuttonGroups.add()){
				//var myFitPageMarginRadio = radiobuttonControls.add( { staticLabel : 'To page margins'} );
				//var myFitPageRadio = radiobuttonControls.add( { staticLabel : 'To page' } );
				//var myFitPageBleedRadio = radiobuttonControls.add( { staticLabel : 'To page bleed' } );
				var myFitSpreadMarginRadio = radiobuttonControls.add( { staticLabel : 'To spread margins'} );
				var myFitSpreadRadio = radiobuttonControls.add( { staticLabel : 'To spread' } );
				var myFitSpreadBleedRadio = radiobuttonControls.add( { staticLabel : 'To spread bleed' } );
				myFitButtons2.selectedButton = myValues("myFitButtons2", 0);
			}
		}
		//break//
		var myFitCenterContentCheckbox = checkboxControls.add({staticLabel:"Center Content", checkedState:myValues("myFitCenterContentCheckbox", false)});
		var myFitFrameToContentCheckbox = checkboxControls.add({staticLabel:"Frame to Content", checkedState:myValues("myFitFrameToContentCheckbox", false)});
		var myFitScaleDownCheckbox = checkboxControls.add({staticLabel:"Only Scale Down", checkedState:myValues("myFitScaleDownCheckbox", false)});
	}

	var myResult = myDialog.show();

    if(myResult == true){
        var myPercent        = myPercentField.editValue;
        var myFitPercent     = myFitPercentRadio.checkedState;
        var myFitScaleDown   = myFitScaleDownCheckbox.checkedState;
        var myFit            = myFitRadio.checkedState;
        var myFitPageMargin    = false;
        var myFitPage          = false;
        var myFitPageBleed     = false;
        var myFitSpreadMargin    = myFitSpreadMarginRadio.checkedState;
        var myFitSpread          = myFitSpreadRadio.checkedState;
        var myFitSpreadBleed     = myFitSpreadBleedRadio.checkedState;
        var myFitCenterContent   = myFitCenterContentCheckbox.checkedState;
        var myFitFrameToContent  = myFitFrameToContentCheckbox.checkedState;

        if (mySelectedLayer.selectedIndex == list_of_layers.length-1){
            var selectedLayer = myDoc.layers.add();
        } else {
            var selectedLayer = myDoc.layers[mySelectedLayer.selectedIndex];
        };

        // save settings to doc
        var mySettings = {}; // new JSON
        // adds values from dialog to JSON
        mySettings['mySelectedLayer'] = mySelectedLayer.selectedIndex;
        mySettings['myFitButtons']    = myFitButtons.selectedButton;
        mySettings['myPercentField']  = myPercentField.editValue;
        mySettings['myFitButtons2']   = myFitButtons2.selectedButton;
        mySettings['myFitCenterContentCheckbox']  = myFitCenterContentCheckbox.checkedState;
        mySettings['myFitFrameToContentCheckbox'] = myFitFrameToContentCheckbox.checkedState;
        mySettings['myFitScaleDownCheckbox']      = myFitScaleDownCheckbox.checkedState;

        // saves JSON which is converted to string to activeDocument label
        app.activeDocument.insertLabel(presetLabel, mySettings.toSource());

        var useSpreads = true;

        // we have to reverse the order when we are placing before or after a static page
        myFiles.reverse();

        myDialog.destroy();

        myPlaceImages(myFiles, useSpreads, myFitPercent, myPercent, myFit, myFitPageMargin, myFitPage, myFitPageBleed, myFitSpreadMargin, myFitSpread, myFitSpreadBleed, myFitCenterContent, myFitFrameToContent, myFitScaleDown, selectedLayer);
    } else {
        myDialog.destroy();
        exit();
    }
}
//end dialog

//sort
function by(item,direction) {
	// if direction == 1 A-Z sorted
	// if direction == -1 Z-A sorted
	return function(first,second){
		first = first[item];
		second = second[item];
		return first == second ? 0 : (first < second ? -1*direction : direction);
	}
}

function restoreOriginalSettings(){
	myDoc.viewPreferences.rulerOrigin = oldRuler
}

function getINDPageCount(inddFile) {
	var myInddFile = app.open(inddFile, false);
	var pagecount = myInddFile.pages.length;
	myInddFile.close(SaveOptions.NO);
	return pagecount;
}

function myPlaceImages(myFiles, useSpreads, myFitPercent, myPercent, myFit, myFitPageMargin, myFitPage, myFitPageBleed, myFitSpreadMargin, myFitSpread, myFitSpreadBleed, myFitCenterContent, myFitFrameToContent, myFitScaleDown, selectedLayer){
	var filesPlaced = 0;
	var filecount = myFiles.length;

	for (var i=0; i<=myFiles.length-1; i++){
		var myCounter = 1;
		var myBreak = false;

		var myFileName = myFiles[i].name;

		//check for indesign doc
		if(/\.indd/.test(myFileName)){
			//placed file is an InDesign file
			var inddpagelength = getINDPageCount(myFiles[i]);
			filecount += inddpagelength-1;
		} else {
			var inddpagelength = null;
		}

		while(myBreak == false){
			app.pdfPlacePreferences.pageNumber = myCounter;

			var selected_page_or_spread = app.activeWindow.activeSpread; 
			var myPageOrSpread = app.activeWindow.activeSpread;

			var myTopMargin = myPageOrSpread.pages[0].marginPreferences.top;
			var myBottomMargin = myPageOrSpread.pages[0].marginPreferences.bottom;
			var bleed = myDoc.documentPreferences.documentBleedTopOffset; //(can be made more specific, good for now);
			
			filesPlaced++;

        	var myOutsideMargin = myPageOrSpread.pages[myPageOrSpread.pages.length-1].marginPreferences.right;
			var myInsideMargin  = myPageOrSpread.pages[0].marginPreferences.left;
			var bleedLeft  = bleed;
			var bleedRight = bleed;

			var mySpreadBounds = new Array (myPageOrSpread.pages[0].bounds[0], myPageOrSpread.pages[0].bounds[1], myPageOrSpread.pages[myPageOrSpread.pages.length-1].bounds[2], myPageOrSpread.pages[myPageOrSpread.pages.length-1].bounds[3] );
			if (myFitSpreadMargin){
				var myX1 = myInsideMargin;
				var myY1 = myTopMargin;
				var myX2 = mySpreadBounds[3] - myOutsideMargin;
				var myY2 = mySpreadBounds[2] - myBottomMargin;
			}
			if (myFitSpread){
				var myX1 = mySpreadBounds[1];
				var myY1 = mySpreadBounds[0];
				var myX2 = mySpreadBounds[3];
				var myY2 = mySpreadBounds[2];
			}
			if (myFitSpreadBleed){
		        var myX1 = mySpreadBounds[1] - bleed;
			    var myY1 = mySpreadBounds[0] - bleed;
			    var myX2 = mySpreadBounds[3] + bleed;
			    var myY2 = mySpreadBounds[2] + bleed;
			}
			
			myRectangle = myPageOrSpread.rectangles.add(selectedLayer, undefined, undefined, {geometricBounds:[myY1, myX1, myY2, myX2]});
			//And place the file in the textframe
			myRectangle.place(myFiles[i]);

			try{
				//Apply fitting options as specified.
				if(myFitPercent){
					myRectangle.allGraphics[0].horizontalScale=myPercent;
					myRectangle.allGraphics[0].verticalScale=myPercent;
				} else if(myFitPageMargin || myFitPage || myFitSpreadMargin || myFitSpread){
					myRectangle.fit(FitOptions.proportionally);
				}

				if(myFitScaleDown){
					if(myRectangle.allGraphics[0].verticalScale > 100 || myRectangle.allGraphics[0].horizontalScale > 100){
						myRectangle.allGraphics[0].horizontalScale=myPercent;
						myRectangle.allGraphics[0].verticalScale=myPercent;
					}
				}
				if(myFitCenterContent){
					myRectangle.fit(FitOptions.centerContent);
				}
				if(myFitFrameToContent){
					myRectangle.fit(FitOptions.frameToContent);
				}

				if(inddpagelength == null){
					// Thanks to Hansjörg Römer for the PDF functionality!
					if(myCounter == 1){ // First run, PDF already placed
						try{
							var myFirstPage = myRectangle.pdfs[0].pdfAttributes.pageNumber;
						} catch(e) {
							//not a PDF
							myBreak = true;
						}
					} else {
						if(myRectangle.pdfs[0].pdfAttributes.pageNumber == myFirstPage){
							myPageOrSpread.remove();
							filesPlaced--;
							myBreak = true;
						}
					}
				} else {
					//indesign file
					app.importedPageAttributes.pageNumber = myCounter+1;
					if(myCounter == inddpagelength+1){
						myPageOrSpread.remove();
						filesPlaced--;
						myBreak = true;
					}
				}

				myCounter += 1;
			} catch(e) {
				//leave textfiles
				myBreak = true;
			}
		} // end while loop
	}
	restoreOriginalSettings();

	alert("Done\n" + filesPlaced + " spreads inserted.");
	
}

