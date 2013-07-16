/*
		Orphan_Fixer.jsx
		An InDesign javascript fix orphans on selected paragraph style
		Bruno Herfst 2011
*/

try {
	var myDoc = app.activeDocument;
	var list_of_All_paragraph_styles = myDoc.paragraphStyles.everyItem().name;
	var myCheckboxes = new Array();
	
	// create Dialog
	var myDialog = app.dialogs.add({name:"ORPHAN FIXER"});
	with(myDialog.dialogColumns.add()){
		staticTexts.add({staticLabel:"Add orphan fixer to paragraphstyle:"});
		with(dialogRows.add()){
			with(borderPanels.add()){
				staticTexts.add({staticLabel:"Trashhold:"});
				var myTHField = textEditboxes.add({editContents:"5"});
				staticTexts.add({staticLabel:"characters"});

			}
		}
	}
	with(myDialog.dialogColumns.add()){
		for(myCounter=2; myCounter<list_of_All_paragraph_styles.length; myCounter++) {
			var myCheckbox;
			myCheckboxes.push(myCheckbox);
			with(dialogRows.add()){
				myCheckboxes[myCounter] = checkboxControls.add({staticLabel:list_of_All_paragraph_styles[myCounter], checkedState:false});
			}
		}
	}
	var myResult = myDialog.show();
	
	if(myResult == true){
		var myTH = myTHField.editContents;
		var myPS = new Array();
		var myParagraphStyle;
		myPS.push(myParagraphStyle);
		for(myCounter=2; myCounter<list_of_All_paragraph_styles.length; myCounter++) {
			myPS[myCounter-2] = myCheckboxes[myCounter].checkedState;
		}
		
		//create no break style
		myDefineCharacterStyle(myDoc, "noBreak");
		
		//add GREP style to selected paragraph styles
		setGREPstyle(myDoc, myCheckboxes, myPS, list_of_All_paragraph_styles, myTH);
		
		alert("Done!");
	}
	

} catch(err) {
 	alert(err.description);
}


////////////// F U N C T I O N S ///////////////////////////////////////
function setGREPstyle(myDoc, myCheckboxes, myPS, list_of_All_paragraph_styles, myTH) {
	var myGREP = "(?<=\\w)\\s(?=\\w{1,"+myTH+"}[[:punct:]]*$)"
	var myChar = myDoc.characterStyles.item("noBreak");

	for(myCounter=0; myCounter<myPS.length; myCounter++) {
		if (myPS[myCounter] == true) {
			var myPara = myDoc.paragraphStyles.item(list_of_All_paragraph_styles[myCounter+2]);
			var myD = false;
			
			//Check if there is allready a NoBreak nested GREP style
			var list_of_All_GREP_styles = myPara.nestedGrepStyles.everyItem().index;
			for(i=0; i<list_of_All_GREP_styles.length; i++) {
				if(myPara.nestedGrepStyles[i].appliedCharacterStyle == myChar) {
					myD = true;
					if (confirm("This GREP style allready exists! \n\n Do you want to adjust the GREP style in "+myPara.name+"? \n\n")) { 
 						myPara.nestedGrepStyles[i].grepExpression = myGREP;
					}
				}
			}
			if(myD == false){
				myPara.nestedGrepStyles.add({appliedCharacterStyle:myChar, grepExpression:myGREP});
			}
		}
	}
}

function myDefineCharacterStyle(myDoc, myCharacterStyleName){
	var myCharacterStyle;
	
	//Create the character style if it does not already exist.
	myCharacterStyle = myDoc.characterStyles.item(myCharacterStyleName);
	try{
		myCharacterStyle.name;
	}
	catch (myError){
		myCharacterStyle = myDoc.characterStyles.add({name:myCharacterStyleName});
	}
	myCharacterStyle.appliedFont = NothingEnum.NOTHING;
	myCharacterStyle.fontStyle = NothingEnum.NOTHING;
	myCharacterStyle.pointSize = NothingEnum.NOTHING;
	myCharacterStyle.leading = NothingEnum.NOTHING;
	myCharacterStyle.appliedLanguage = NothingEnum.NOTHING;
	myCharacterStyle.kerningMethod = NothingEnum.NOTHING;
	myCharacterStyle.tracking = NothingEnum.NOTHING;
	myCharacterStyle.capitalization = NothingEnum.NOTHING;
	myCharacterStyle.position = NothingEnum.NOTHING;
	myCharacterStyle.ligatures = NothingEnum.NOTHING;
	myCharacterStyle.noBreak = true;
	myCharacterStyle.horizontalScale = NothingEnum.NOTHING;
	myCharacterStyle.verticalScale = NothingEnum.NOTHING;
	myCharacterStyle.baselineShift = NothingEnum.NOTHING;
	myCharacterStyle.skew = NothingEnum.NOTHING;
	myCharacterStyle.fillColor = NothingEnum.NOTHING;
	myCharacterStyle.fillTint = NothingEnum.NOTHING;
	myCharacterStyle.strokeTint = NothingEnum.NOTHING;
	myCharacterStyle.strokeWeight = NothingEnum.NOTHING;
	myCharacterStyle.overprintStroke = NothingEnum.NOTHING;
	myCharacterStyle.overprintFill = NothingEnum.NOTHING;
	myCharacterStyle.otfFigureStyle = NothingEnum.NOTHING;
	myCharacterStyle.otfOrdinal = NothingEnum.NOTHING;
	myCharacterStyle.otfFraction = NothingEnum.NOTHING;
	myCharacterStyle.otfDiscretionaryLigature = NothingEnum.NOTHING;
	myCharacterStyle.otfTitling = NothingEnum.NOTHING;
	myCharacterStyle.otfContextualAlternate = NothingEnum.NOTHING;
	myCharacterStyle.otfSwash = NothingEnum.NOTHING;
	myCharacterStyle.otfSlashedZero = NothingEnum.NOTHING;
	myCharacterStyle.otfHistorical = NothingEnum.NOTHING;
	myCharacterStyle.otfStylisticSets = NothingEnum.NOTHING;
	myCharacterStyle.strikeThru = NothingEnum.NOTHING;
	myCharacterStyle.strokeColor = NothingEnum.NOTHING;
	myCharacterStyle.strokeTint = NothingEnum.NOTHING;
	myCharacterStyle.strokeWeight = NothingEnum.NOTHING;
	myCharacterStyle.tracking = NothingEnum.NOTHING;
	myCharacterStyle.underline = NothingEnum.NOTHING;
	myCharacterStyle.verticalScale = NothingEnum.NOTHING;
}