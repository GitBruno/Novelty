/*	
	Remove_Character_Overrides.jsx
	Bruno Herfst 2010
	
	version 1.2
	
	An InDesign JavaScript to clear all character overrides in selected or all paragraph styles	
*/

#target indesign;

var the_document = app.documents.item(0);

// Create a list of paragraph styles
var list_of_All_paragraph_styles = the_document.paragraphStyles.everyItem().name;
list_of_All_paragraph_styles.push("All paragraph styles");

// Make the dialog box for selecting the paragraph styles
var the_dialog = app.dialogs.add({name:"Remove paragraph overrides"});
with(the_dialog.dialogColumns.add()){
	with(dialogRows.add()){
		staticTexts.add({staticLabel:"Paragraph style:"});
	}
	with(borderPanels.add()){
		var selected_paragraph = dropdowns.add({stringList:list_of_All_paragraph_styles, selectedIndex:list_of_All_paragraph_styles.length-1});
	}
}

var mdlg = the_dialog.show();

if(mdlg == true){
	var findChars = "";
	var replaceChars = "";
	app.findChangeGrepOptions.includeFootnotes = true;
	app.findChangeGrepOptions.includeHiddenLayers = true;
	app.findChangeGrepOptions.includeLockedLayersForFind = true;
	app.findChangeGrepOptions.includeLockedStoriesForFind = true;
	app.findChangeGrepOptions.includeMasterPages = true;
	
	app.findGrepPreferences = NothingEnum.nothing;
	app.changeGrepPreferences = NothingEnum.nothing;
	app.findGrepPreferences.findWhat = "";
	app.changeGrepPreferences.changeTo = "";
	
	if (selected_paragraph.selectedIndex == list_of_All_paragraph_styles.length-1){
		for (i=0; i<list_of_All_paragraph_styles.length-1; i++){
			// Define paragraph style
			var find_paragraph = the_document.paragraphStyles.item(i);
			app.findGrepPreferences.appliedParagraphStyle = find_paragraph;
			app.changeGrepPreferences.appliedParagraphStyle = find_paragraph;
			the_document.changeGrep();
		}
	} else {
		// Define paragraph style
		var find_paragraph = the_document.paragraphStyles.item(selected_paragraph.selectedIndex);
		app.findGrepPreferences.appliedParagraphStyle = find_paragraph;
		app.changeGrepPreferences.appliedParagraphStyle = find_paragraph;
		the_document.changeGrep();
	}
} else {
	//cancel
}