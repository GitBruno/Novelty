//http://indesignsecrets.com/move-every-object-on-every-page-toward-or-away-from-spine.php
//AdjustLayout_modified.jsx
//An InDesign CS6 JavaScript
#target indesign
//
//Moves the content of even/odd pages by specified amounts; attempts to get
//objects back into the correct position after a master page margin change
//and/or page insertion.
//
main();
function main(){
	//Make certain that user interaction (display of dialogs, etc.) is turned on.
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	if(app.documents.length != 0){
		if(app.activeDocument.pageItems.length != 0){
			myDisplayDialog();
		}
		else{
			alert("Document contains no page items.");
		}
	}
	else{
		alert("Please open a document and try again.");
	}
}
function myDisplayDialog(){
	var myLabelWidth = 70;
	var myDialog = app.dialogs.add({name:"Adjust Layout"});
	var myPageNames = myGetPageNames();
	with(myDialog.dialogColumns.add()){
		with(borderPanels.add()){
			with(dialogColumns.add()){
				with(dialogRows.add()){
					with(dialogColumns.add()){
						staticTexts.add({staticLabel:"Start Page:", minWidth:myLabelWidth});
					}
					with(dialogColumns.add()){
						var myStartPageDropdown = dropdowns.add({stringList:myPageNames, selectedIndex:0});
					}
				}
				with(dialogRows.add()){
					with(dialogColumns.add()){
						staticTexts.add({staticLabel:"End Page:", minWidth:myLabelWidth});
					}
					with(dialogColumns.add()){
						var myEndPageDropdown = dropdowns.add({stringList:myPageNames, selectedIndex:myPageNames.length-1});
					}
				}
			}
		}
		with(borderPanels.add()){
			with(dialogRows.add()){
				with(dialogColumns.add()){
					staticTexts.add({staticLabel:"Even Pages", minWidth:myLabelWidth});
					staticTexts.add({staticLabel:"Horizontal:", minWidth:myLabelWidth});
					staticTexts.add({staticLabel:"Vertical:", minWidth:myLabelWidth});
				}
				with(dialogColumns.add()){
					staticTexts.add({staticLabel:""});
					var myEvenXField = measurementEditboxes.add({editValue:-12, editUnits:MeasurementUnits.points});
					var myEvenYField = measurementEditboxes.add({editValue:0, editUnits:MeasurementUnits.points});
				}
			}
		}
		with(borderPanels.add()){
			with(dialogRows.add()){
				with(dialogColumns.add()){
					staticTexts.add({staticLabel:"Odd Pages", minWidth:myLabelWidth});
					staticTexts.add({staticLabel:"Horizontal:", minWidth:myLabelWidth});
					staticTexts.add({staticLabel:"Vertical:", minWidth:myLabelWidth});
				}
				with(dialogColumns.add()){
					staticTexts.add({staticLabel:""});
					var myOddXField = measurementEditboxes.add({editValue:12, editUnits:MeasurementUnits.points});
					var myOddYField = measurementEditboxes.add({editValue:0, editUnits:MeasurementUnits.points});
				}
			}
		}
	}
	var myResult = myDialog.show();
	if(myResult == true){
		var myStartPageName = myPageNames[myStartPageDropdown.selectedIndex];
		var myEndPageName = myPageNames[myEndPageDropdown.selectedIndex];
		if(myCheckPageRange(myStartPageName, myEndPageName) == true){
			var myEvenX = myEvenXField.editValue;
			var myEvenY = myEvenYField.editValue;
			var myOddX = myOddXField.editValue;
			var myOddY = myOddYField.editValue;
			myDialog.destroy();
			myAdjustPages(myEvenX, myEvenY, myOddX, myOddY, myStartPageName, myEndPageName);
		}
		else{
			myDialog.destroy();
			alert("Invalid page range.");
		}
	}
	else{
		myDialog.destroy();
	}
}
function myAdjustPages(myEvenX, myEvenY, myOddX, myOddY, myStartPageName, myEndPageName){
	var myPage, myPageAdjust;
    // Set the transform content property to true so that content will move with frames.
    //myOldTransformContent = app.transformPreferences.transformContent;
    //app.transformPreferences.transformContent = true;
    var myOldXUnits = app.activeDocument.viewPreferences.horizontalMeasurementUnits;
    var myOldYUnits = app.activeDocument.viewPreferences.verticalMeasurementUnits;
    //Set the measurement units to points.
    app.activeDocument.viewPreferences.horizontalMeasurementUnits = MeasurementUnits.points;
    app.activeDocument.viewPreferences.verticalMeasurementUnits = MeasurementUnits.points;
    //Save the old page numbering
    var myOldPageNumbering = app.generalPreferences.pageNumbering;
    app.generalPreferences.pageNumbering = PageNumberingOptions.section;
    var myStartPage = app.activeDocument.pages.item(myStartPageName);
    var myEndPage = app.activeDocument.pages.item(myEndPageName);
    //Set page numbering to absolute
    app.generalPreferences.pageNumbering = PageNumberingOptions.absolute;
    //Does the document start with an even page?
    if(myCheckPageStart(app.activeDocument) == false){
        myPageAdjust = 0;
    }
    else{
        myPageAdjust = 1;
    }
    for(var myCounter = (myStartPage.documentOffset); myCounter <= myEndPage.documentOffset; myCounter++){
        myPage = app.activeDocument.pages.item(myCounter);
        var myPageValue = myPage.documentOffset;
        myPageValue = myPageValue + myPageAdjust;
        if(myPageValue % 2 == 0){
            //Page is an even page.
            myAdjustPage(myPage, myEvenX, myEvenY);
        }
        else{
            //Page is an odd page.
            myAdjustPage(myPage, myOddX, myOddY);
        }
    }
    //Reset the transform content and measurement units to their original values.
    app.activeDocument.viewPreferences.horizontalMeasurementUnits = myOldXUnits;
    app.activeDocument.viewPreferences.verticalMeasurementUnits = myOldYUnits;
    //app.transformPreferences.transformContent = myOldTransformContent;
    app.generalPreferences.pageNumbering = myOldPageNumbering;
}
function myAdjustPage(myPage, myX, myY){
	var myPageItem;
	var myResetItemLock = false;
	var myResetLayerLock = false;
	for(var myCounter = 0; myCounter < myPage.pageItems.length; myCounter ++){
		myPageItem = myPage.pageItems.item(myCounter);
		if(myPageItem.locked == true){
			myPageItem.locked = false;
			myResetItemLock = true;
		}
		if(myPageItem.itemLayer.locked == true){
			myPageItem.itemLayer.locked = false;
			myResetLayerLock = true;

		}
		myPageItem.move(undefined, [myX, myY]);
		if(myResetItemLock == true){
			myPageItem.locked = true;
		}
		if(myResetLayerLock == true){
			myPageItem.itemLayer.locked = true;
		}
	}
}
function myGetPageNames(){
	var myPageNames = new Array;
	for(myCounter = 0; myCounter < app.activeDocument.pages.length; myCounter ++){
		myPageNames.push(app.activeDocument.pages.item(myCounter).name);
	}
	return myPageNames;
}
function myCheckPageStart(myDocument){
    var mySection = myDocument.sections.item(0);
    if(mySection.pageNumberStart % 2 == 0){
        //Starting page number is an even page.
        return false;
    }
    else{
        //Starting page number is an odd page.
        return true;
    }
}
function myCheckPageRange(myStartPageName, myEndPageName){
	var myStartIndex = app.activeDocument.pages.item(myStartPageName).documentOffset;
	var myEndIndex = app.activeDocument.pages.item(myEndPageName).documentOffset;
	if(myStartIndex <= myEndIndex){
		return true;
	}
	else{
		return false;
	}
}