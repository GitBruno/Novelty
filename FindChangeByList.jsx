//FindChangeByList.jsx
//An InDesign JavaScript
/*  
@@@BUILDINFO@@@ "FindChangeByList.jsx" 3.0.0 15 December 2009
*/
//Loads a series of tab-delimited strings from a text file, then performs a series
//of find/change operations based on the strings read from the file.
//
//The data file is tab-delimited, with carriage returns separating records.
//
//The format of each record in the file is:
//findType<tab>findProperties<tab>changeProperties<tab>findChangeOptions<tab>description
//
//Where:
//<tab> is a tab character
//findType is "text", "grep", or "glyph" (this sets the type of find/change operation to use).
//findProperties is a properties record (as text) of the find preferences.
//changeProperties is a properties record (as text) of the change preferences.
//findChangeOptions is a properties record (as text) of the find/change options.
//description is a description of the find/change operation
//
//Very simple example:
//text	{findWhat:"--"}	{changeTo:"^_"}	{includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}	Find all double dashes and replace with an em dash.
//
//More complex example:
//text	{findWhat:"^9^9.^9^9"}	{appliedCharacterStyle:"price"}	{include footnotes:true, include master pages:true, include hidden layers:true, whole word:false}	Find $10.00 to $99.99 and apply the character style "price".
//
//All InDesign search metacharacters are allowed in the "findWhat" and "changeTo" properties for findTextPreferences and changeTextPreferences.
//
//If you enter backslashes in the findWhat property of the findGrepPreferences object, they must be "escaped"
//as shown in the example below:
//
//{findWhat:"\\s+"}
//
//For more on InDesign/InCopy scripting see the documentation included in the Scripting SDK 
//available at http://www.adobe.com/devnet/indesign/sdk.html
//or visit the InDesign Scripting User to User forum at http://www.adobeforums.com
//
main();
function main(){
	var myObject;
	//Make certain that user interaction (display of dialogs, etc.) is turned on.
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	if(app.documents.length > 0){
		if(app.selection.length > 0){
			switch(app.selection[0].constructor.name){
				case "InsertionPoint":
				case "Character":
				case "Word":
				case "TextStyleRange":
				case "Line":
				case "Paragraph":
				case "TextColumn":
				case "Text":
				case "Cell":
				case "Column":
				case "Row":
				case "Table":
					myDisplayDialog();
					break;
				default:
					//Something was selected, but it wasn't a text object, so search the document.
					myFindChangeByList(app.documents.item(0));
			}
		}
		else{
			//Nothing was selected, so simply search the document.
			myFindChangeByList(app.documents.item(0));
		}
	}
	else{
		alert("No documents are open. Please open a document and try again.");
	}
}
function myDisplayDialog(){
	var myObject;
	var myDialog = app.dialogs.add({name:"FindChangeByList"});
	with(myDialog.dialogColumns.add()){
		with(dialogRows.add()){
			with(dialogColumns.add()){
				staticTexts.add({staticLabel:"Search Range:"});
			}
			var myRangeButtons = radiobuttonGroups.add();
			with(myRangeButtons){
				radiobuttonControls.add({staticLabel:"Document", checkedState:true});
				radiobuttonControls.add({staticLabel:"Selected Story"});
				if(app.selection[0].contents != ""){
					radiobuttonControls.add({staticLabel:"Selection", checkedState:true});
				}
			}			
		}
	}
	var myResult = myDialog.show();
	if(myResult == true){
		switch(myRangeButtons.selectedButton){
			case 0:
				myObject = app.documents.item(0);
				break;
			case 1:
				myObject = app.selection[0].parentStory;
				break;
			case 2:
				myObject = app.selection[0];
				break;
		}
		myDialog.destroy();
		myFindChangeByList(myObject);
	}
	else{
		myDialog.destroy();
	}
}
function myFindChangeByList(myObject){
	var myScriptFileName, myFindChangeFile, myFindChangeFileName, myScriptFile, myResult;
	var myFindChangeArray, myFindPreferences, myChangePreferences, myFindLimit, myStory;
	var myStartCharacter, myEndCharacter;
	var myFindChangeFile = myFindFile("/FindChangeSupport/FindChangeList.txt")
	if(myFindChangeFile != null){
		myFindChangeFile = File(myFindChangeFile);
		var myResult = myFindChangeFile.open("r", undefined, undefined);
		if(myResult == true){
			//Loop through the find/change operations.
			do{
				myLine = myFindChangeFile.readln();
				//Ignore comment lines and blank lines.
				if((myLine.substring(0,4)=="text")||(myLine.substring(0,4)=="grep")||(myLine.substring(0,5)=="glyph")){
					myFindChangeArray = myLine.split("\t");
					//The first field in the line is the findType string.
					myFindType = myFindChangeArray[0];
					//The second field in the line is the FindPreferences string.
					myFindPreferences = myFindChangeArray[1];
					//The second field in the line is the ChangePreferences string.
					myChangePreferences = myFindChangeArray[2];
					//The fourth field is the range--used only by text find/change.
					myFindChangeOptions = myFindChangeArray[3];
					switch(myFindType){
						case "text":
							myFindText(myObject, myFindPreferences, myChangePreferences, myFindChangeOptions);
							break;
						case "grep":
							myFindGrep(myObject, myFindPreferences, myChangePreferences, myFindChangeOptions);
							break;
						case "glyph":
							myFindGlyph(myObject, myFindPreferences, myChangePreferences, myFindChangeOptions);
							break;
					}
				}
			} while(myFindChangeFile.eof == false);
			myFindChangeFile.close();
		}
	} else {
		alert("Can't find the FindChangeList.txt");
	}
}
function myFindText(myObject, myFindPreferences, myChangePreferences, myFindChangeOptions){
	//Reset the find/change preferences before each search.
	app.changeTextPreferences = NothingEnum.nothing;
	app.findTextPreferences = NothingEnum.nothing;
	var myString = "app.findTextPreferences.properties = "+ myFindPreferences + ";";
	myString += "app.changeTextPreferences.properties = " + myChangePreferences + ";";
	myString += "app.findChangeTextOptions.properties = " + myFindChangeOptions + ";";
	app.doScript(myString, ScriptLanguage.javascript);
	myFoundItems = myObject.changeText();
	//Reset the find/change preferences after each search.
	app.changeTextPreferences = NothingEnum.nothing;
	app.findTextPreferences = NothingEnum.nothing;
}
function myFindGrep(myObject, myFindPreferences, myChangePreferences, myFindChangeOptions){
	//Reset the find/change grep preferences before each search.
	app.changeGrepPreferences = NothingEnum.nothing;
	app.findGrepPreferences = NothingEnum.nothing;
	var myString = "app.findGrepPreferences.properties = "+ myFindPreferences + ";";
	myString += "app.changeGrepPreferences.properties = " + myChangePreferences + ";";
	myString += "app.findChangeGrepOptions.properties = " + myFindChangeOptions + ";";
	app.doScript(myString, ScriptLanguage.javascript);
	var myFoundItems = myObject.changeGrep();
	//Reset the find/change grep preferences after each search.
	app.changeGrepPreferences = NothingEnum.nothing;
	app.findGrepPreferences = NothingEnum.nothing;
}
function myFindGlyph(myObject, myFindPreferences, myChangePreferences, myFindChangeOptions){
	//Reset the find/change glyph preferences before each search.
	app.changeGlyphPreferences = NothingEnum.nothing;
	app.findGlyphPreferences = NothingEnum.nothing;
	var myString = "app.findGlyphPreferences.properties = "+ myFindPreferences + ";";
	myString += "app.changeGlyphPreferences.properties = " + myChangePreferences + ";";
	myString += "app.findChangeGlyphOptions.properties = " + myFindChangeOptions + ";";
	app.doScript(myString, ScriptLanguage.javascript);
	var myFoundItems = myObject.changeGlyph();
	//Reset the find/change glyph preferences after each search.
	app.changeGlyphPreferences = NothingEnum.nothing;
	app.findGlyphPreferences = NothingEnum.nothing;
}
function myFindFile(myFilePath){
	var myScriptFile = myGetScriptPath();
	var myScriptFile = File(myScriptFile);
	var myScriptFolder = myScriptFile.path;
	myFilePath = myScriptFolder + myFilePath;
	if(File(myFilePath).exists == false){
		//Display a dialog.
		myFilePath = File.openDialog("Choose the file containing your find/change list");
	}
	return myFilePath;
}
function myGetScriptPath(){
	try{
		myFile = app.activeScript;
	}
	catch(myError){
		myFile = myError.fileName;
	}
	return myFile;
}