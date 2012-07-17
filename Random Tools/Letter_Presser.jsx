/*

	Letter_Presser.jsx
	Version 0.2 (TEST)
	Experimental InDesign CS5 JavaScript
	Bruno Herfst 2011

	This script sets a randome baselineshift between two values
	to all text found in seleced paragraph style
	can also set random thin outlines for extra letter-press feel.
	
	TODO:
	- Check if doc is open
	– Make characters/words work
	– random outlines on to give effect of press
	– Rewrite code to run quicker?
	– Make progressbar
	
	NOTE:
	Keep values nice and small!

*/

#target "InDesign"

//global varialbles
var ps, cw, bls, sw;

main();

//============================================== FUNCTIONS =====================================================
function main(){
	var myDoc = app.documents.item(0);

	// Create a list of paragraph styles
	var list_of_All_paragraph_styles = myDoc.paragraphStyles.everyItem().name;
	list_of_All_paragraph_styles.unshift("All paragraph styles");

	// Make the dialog box for selecting the paragraph styles
	var dlg = app.dialogs.add({name:"LetterPresser"});
	with(dlg.dialogColumns.add()){
		with(dialogRows.add()){
			staticTexts.add({staticLabel:"Do"});
			with(myFitButtons = radiobuttonGroups.add()){
					var c = radiobuttonControls.add( { staticLabel : 'Characters', checkedState : true } ),
						w = radiobuttonControls.add( { staticLabel : 'Words' } );
				}
			staticTexts.add({staticLabel:" in paragraph style:"});
			var find_paragraph = dropdowns.add({stringList:list_of_All_paragraph_styles, selectedIndex:list_of_All_paragraph_styles.length-1});
		}
		with(dialogRows.add()){
			with(borderPanels.add()){
				staticTexts.add({staticLabel:"Max baselineshift:"});
				bls = 0.225;
				var myBlsField = measurementEditboxes.add({editUnits: MeasurementUnits.POINTS,editValue:bls});
				staticTexts.add({staticLabel:"Max strokewidth:"});
				sw = 0.15;
				var mySwField = measurementEditboxes.add({editUnits:MeasurementUnits.POINTS,editValue:sw});
			}
		}
		with(dialogRows.add()){
			with(dialogColumns.add()){
				
			}
		}
	}

	//show dialog
	if(dlg.show() == true){
		//get dialog data
		sw = mySwField.editValue,
		bls = myBlsField.editValue,

		cw = c.checkedState; // true: character, false: word
		
		if (find_paragraph.selectedIndex == 0) {
			ps = false;
		} else {
			ps = myDoc.paragraphStyles.item(find_paragraph.selectedIndex-1);
		}
		
		// Set find grep preferences to find all paragraphs with the selected paragraph style
		app.findChangeGrepOptions.includeFootnotes = false;
		app.findChangeGrepOptions.includeHiddenLayers = false;
		app.findChangeGrepOptions.includeLockedLayersForFind = false;
		app.findChangeGrepOptions.includeLockedStoriesForFind = false;
		app.findChangeGrepOptions.includeMasterPages = false;
		app.findGrepPreferences = NothingEnum.nothing;
		if(ps == false){
			app.findGrepPreferences.appliedParagraphStyle = NothingEnum.nothing;
		} else {
			app.findGrepPreferences.appliedParagraphStyle = ps;
		}
		app.findGrepPreferences.findWhat = "^.+";
	
		//Now let’s find the paragraphs
		//Search the current story
		var found_paragraphs = myDoc.findGrep();
		var myCounter = 0;
		var myMessage = false;
		do {
			try {
				// Create an object reference to the found paragraph and the next
				wavePara(found_paragraphs[myCounter]);
				myCounter++;
			} catch(err) {
				myMessage = err;
				myMessage = "Couldn't find anything!";
			}
		} while (myCounter < found_paragraphs.length);
		
		if(myMessage == false){
			var myMessage = "Done setting "+(myCounter)+" paragraphs!";
		}
		
		alert(myMessage);
		//the end
		dlg.destroy();
	} else {
		//cancel
	}
}

//-------------------------------------------------------------------------------------------------------------

function wavePara(myPara){
	myPara.strokeAlignment = TextStrokeAlign.CENTER_ALIGNMENT;
	var myLines = myPara.lines;
	//for lines in paragraph
	for (var line=0, ll=myLines.length; line < ll; line++){
		var myLine = myPara.lines[line];
		var cl = myLine.characters.length;
		var mod = 0;
		startValue = sw;
		//for characters in lines
		for (var character=0; character < cl; character++){
			try{
				var myCharacter = myLine.characters[character];
				myCharacter.strokeColor = "Black";
				myCharacter.baselineShift = randomInRange(0,bls);
				myCharacter.strokeWeight = randomInRange(0,sw);
			}catch(r){
				//alert(r.description);
				//This should not happen but if it does deal with it quitely
				line-=1; // redo line
				ll+=1; // in case the paragraph got longer
				// if not will break anyway
				break;
			}
		}
	}
}

//-------------------------------------------------------------------------------------------------------------

function randomInRange(start,end){
       return Math.random() * (end - start) + start;
}