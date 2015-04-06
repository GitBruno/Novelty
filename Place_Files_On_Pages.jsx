// Place_Files_On_Pages.jsx
// An InDesign javascript
// Version 2.2
// Bruno Herfst 2010 - 2015

// Thanks to Marijan Tompa & Hansjörg Römer

// TODO:
// Put more value on extensions
// Use existing pages

#target indesign;


//add to dialog? (what about offsetting?)
app.pdfPlacePreferences.pdfCrop = PDFCrop.cropMedia;

var myDoc = app.activeDocument;
var mySelected = 0;
var myFiles
if (myFiles = File.openDialog("Select files to place:", "", true)){
	var oldRuler = myDoc.viewPreferences.rulerOrigin;
	myDoc.viewPreferences.rulerOrigin = RulerOrigin.pageOrigin;
	// Create lists
	var list_of_layers = myDoc.layers.everyItem().name;
	list_of_layers.push("[New Layer]");
	var list_of_objstyles = myDoc.objectStyles.everyItem().name;
	var list_of_master_pages = myDoc.masterSpreads.everyItem().name;
	var list_of_pages = myDoc.pages.everyItem().name;
	// Let’s see which page is selected
	for (var j=0; j<=list_of_pages.length-1; j++){
		if(list_of_pages[j] == app.activeWindow.activePage.name){
			mySelected = j;
			break;
		}
	}
	var loadSettings = eval(myDoc.extractLabel('PFOP-Settings'));
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
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"on layer"});
			}
			with(dialogColumns.add()){
				var mySelectedLayer = dropdowns.add({stringList:list_of_layers});
				mySelectedLayer.selectedIndex = myValues("mySelectedLayer", 0);
			}
		}
		//break//
		with(dialogRows.add()){
			staticTexts.add({staticLabel:"Using masterspread"});
			with(dialogColumns.add()){
				var myChange_master = dropdowns.add({stringList:list_of_master_pages});
				myChange_master.selectedIndex = myValues("myChange_master", 0);
			}
			staticTexts.add({staticLabel:"& object style"});
			with(dialogColumns.add()){
				var myObjectStyle = dropdowns.add({stringList:list_of_objstyles});
				myObjectStyle.selectedIndex = myValues("myObjectStyle", 0);
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
				var myFitMarginRadio = radiobuttonControls.add( { staticLabel : 'To margins'} );
				var myFitPageRadio = radiobuttonControls.add( { staticLabel : 'To page' } );
				var myFitBleedRadio = radiobuttonControls.add( { staticLabel : 'To bleed' } );
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
        var change_master  = myDoc.masterSpreads.item(myChange_master.selectedIndex);
        var objectStyle    = myDoc.objectStyles.item(myObjectStyle.selectedIndex);
        var selected_pageNo  = insert_page.selectedIndex;
        var myPercent      = myPercentField.editValue;
        var myFitPercent   = myFitPercentRadio.checkedState;
        var myFitScaleDown = myFitScaleDownCheckbox.checkedState;
        var myFit          = myFitRadio.checkedState;
        var myFitMargin    = myFitMarginRadio.checkedState;
        var myFitPage      = myFitPageRadio.checkedState;
        var myFitBleed     = myFitBleedRadio.checkedState;
        var myFitCenterContent  = myFitCenterContentCheckbox.checkedState;
        var myFitFrameToContent = myFitFrameToContentCheckbox.checkedState;
        
        if (mySelectedLayer.selectedIndex == list_of_layers.length-1){
            var selectedLayer = myDoc.layers.add();
        } else {
            var selectedLayer = myDoc.layers[mySelectedLayer.selectedIndex];
        }
        
        var before_after = myBefore_after.selectedIndex;

        // save settings to doc
        var mySettings = {}; // new JSON
        // adds values from dialog to JSON
        mySettings['mySelectedLayer'] = mySelectedLayer.selectedIndex;
        mySettings['myChange_master'] = myChange_master.selectedIndex;
        mySettings['myObjectStyle']   = myObjectStyle.selectedIndex;
        mySettings['myFitButtons']    = myFitButtons.selectedButton;
        mySettings['myPercentField']  = myPercentField.editValue;
        mySettings['myFitButtons2']   = myFitButtons2.selectedButton;
        mySettings['myFitCenterContentCheckbox']  = myFitCenterContentCheckbox.checkedState;
        mySettings['myFitFrameToContentCheckbox'] = myFitFrameToContentCheckbox.checkedState;
        mySettings['myFitScaleDownCheckbox']      = myFitScaleDownCheckbox.checkedState;

        // saves JSON which is converted to string to activeDocument label
        app.activeDocument.insertLabel("PFOP-Settings", mySettings.toSource());

        // we have to reverse the order when we are placing before or after a static page
        myFiles.reverse();

        myDialog.destroy();

        myPlaceImages(myFiles, myFitPercent, myPercent, myFit, myFitMargin, myFitPage, myFitBleed, myFitCenterContent, myFitFrameToContent, myFitScaleDown, selected_pageNo, change_master, before_after, selectedLayer, objectStyle);
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

function myPlaceImages(myFiles, myFitPercent, myPercent, myFit, myFitMargin, myFitPage, myFitBleed, myFitCenterContent, myFitFrameToContent, myFitScaleDown, selected_pageNo, change_master, before_after, selectedLayer, objectStyle){
	var filesPlaced = 0;
	var filecount = myFiles.length;
	//var hack_page = selected_pageNo;
	
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
			
			if( (myCounter > 1) && (before_after == 1) ){ // if we go more then once over the loop we are placing PDFs or Images
			    //I need to reverse the PDF pages if I want to place them after a static page.
				//Solution: update the before_after page
				var selected_page = myPage;
			} else if( (myCounter > 1) && (before_after == 0) ){
			    alert("SORRY!\nI can't place multi-page files like PDFs using 'before' yet. This functionality still needs to be worked out. Please choose 'after' or email mail@brunoherfst.com");
			    break;
			} else {
			    var selected_page = myDoc.pages.item(selected_pageNo);
			}
			
			if (before_after == 0){
				var myPage = myDoc.pages.add(LocationOptions.BEFORE,selected_page);
			} else {
				var myPage = myDoc.pages.add(LocationOptions.AFTER,selected_page);
			}
			filesPlaced++;
			
			myPage.appliedMaster = change_master;

			var myTopMargin = myPage.marginPreferences.top;
			var myBottomMargin = myPage.marginPreferences.bottom;
			var bleed = myDoc.documentPreferences.documentBleedTopOffset; //(can be made more specific, good for now);

            if( ((before_after == 1) && (myPage.side == PageSideOptions.leftHand)  && (filecount %2 == 0)) 
             || ((before_after == 1) && (myPage.side == PageSideOptions.rightHand) && (filecount %2 == 1))
             || ((before_after == 0) && (myPage.side == PageSideOptions.leftHand))
             ){
                var startPage = 0;
            } else {
                var startPage = 1;
            }
            
			if(filesPlaced % 2 == startPage){
			        var myOutsideMargin = myPage.marginPreferences.left;
					var myInsideMargin = myPage.marginPreferences.right;
					var bleedLeft  = bleed;
					var bleedRight = 0;
			}
			else{
				var myOutsideMargin = myPage.marginPreferences.right;
				var myInsideMargin  = myPage.marginPreferences.left;
				var bleedLeft  = 0;
				var bleedRight = bleed;
			}
			
			if (myFitMargin){
				var myX1 = myInsideMargin;
				var myY1 = myTopMargin;
				var myX2 = myDoc.documentPreferences.pageWidth  - myOutsideMargin;
				var myY2 = myDoc.documentPreferences.pageHeight - myBottomMargin;
			}
			if (myFitPage){
				var myX1 = 0;
				var myY1 = 0;
				var myX2 = myDoc.documentPreferences.pageWidth;
				var myY2 = myDoc.documentPreferences.pageHeight;
			}
			if (myFitBleed){
			    if(myPage.side == PageSideOptions.SINGLE_SIDED){
			        var myX1 = 0-bleed;
				    var myY1 = 0-bleed;
				    var myX2 = myDoc.documentPreferences.pageWidth  + bleed;
				    var myY2 = myDoc.documentPreferences.pageHeight + bleed;
			    } else {
			        var myX1 = 0-bleedLeft;
				    var myY1 = 0-bleed;
				    var myX2 = myDoc.documentPreferences.pageWidth  + bleedRight;
				    var myY2 = myDoc.documentPreferences.pageHeight + bleed;
				}
			}

			myRectangle = myPage.rectangles.add(selectedLayer, undefined, undefined, {geometricBounds:[myY1, myX1, myY2, myX2],appliedObjectStyle:objectStyle});
			//And place the file in the textframe
			myRectangle.place(myFiles[i]);

			try{
				//Apply fitting options as specified.
				if(myFitPercent){
					myRectangle.allGraphics[0].horizontalScale=myPercent;
					myRectangle.allGraphics[0].verticalScale=myPercent;
				} else if(myFitMargin || myFitPage){
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
							myPage.remove();
							filesPlaced--;
							myBreak = true;
						}
					}
				} else {
					//indesign file
					app.importedPageAttributes.pageNumber = myCounter+1;
					if(myCounter == inddpagelength+1){
						myPage.remove();
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
	alert("Done\n" + filesPlaced + " pages inserted.");
}

