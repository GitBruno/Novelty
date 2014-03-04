/*

ReverseQuotation.jsx
An InDesign CS3/4 JavaScript
Bruno Herfst 2010

This script turns American style quotations:
He said, “Didn’t you like ‘That ’70s Show’ back then?”

into European style quotations:
He said, ‘Didn’t you like “That ’70s Show” back then?’

(and back again :)

*** Please note it will not pick-up words ending with an apostrophe ***
‘It will pick up the students’ apostrophes as closing quotation marks’ (Oops)
‘But it will leave students’s apostrophes’ (OK!)

*/

#target indesign;

main();

function main(){
	//Make certain that user interaction (display of dialogs, etc.) is turned on.
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	if(app.documents.length != 0){
		if (app.activeDocument.stories.length != 0){
			myDoc = app.activeDocument;
			ReverseQuotation(myDoc);
		}
		else{
			alert("The document does not contain any text. Please open a document containing text and try again.");
		}
	}
	else{
		alert("No documents are open. Please open a document and try again.");
	}
}

function ReverseQuotation(myDoc){
	var findChars = new Array("~](?=[A-Z,a-z,0-9])","~[","~]","~{","~}","<singleQuoteLeft>","<singleQuoteRight>","<DoubleQuoteLeft>","<DoubleQuoteRight>","<StaySingle>");
	var replaceChars = new Array("<StaySingle>","<singleQuoteLeft>","<singleQuoteRight>","<DoubleQuoteLeft>","<DoubleQuoteRight>","~{","~}","~[","~]","~]");
	app.findChangeGrepOptions.includeFootnotes = true;
	app.findChangeGrepOptions.includeHiddenLayers = true;
	app.findChangeGrepOptions.includeLockedLayersForFind = true;
	app.findChangeGrepOptions.includeLockedStoriesForFind = true;
	app.findChangeGrepOptions.includeMasterPages = true;

	app.findGrepPreferences = NothingEnum.nothing;
	app.changeGrepPreferences = NothingEnum.nothing;

	for(var i=0; i < findChars.length; i++){
		var findChar = findChars[i];
		var replaceChar = replaceChars[i];
		app.findGrepPreferences.findWhat = findChar;
		app.changeGrepPreferences.changeTo = replaceChar;
		myDoc.changeGrep();
	}
}