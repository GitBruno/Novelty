/*	
	ReplaceMaster.jsx
	Bruno Herfst 2010

	An InDesign script to find/replace selected Master Pages	
*/

#target indesign;

var the_document = app.documents.item(0);

// Create a list of master pages
var list_of_master_pages = the_document.masterSpreads.everyItem().name;

// Make the dialog box for selecting the paragraph styles
var the_dialog = app.dialogs.add({name:"Replace master pages"});
with(the_dialog.dialogColumns.add()){
	with(dialogRows.add()){
		staticTexts.add({staticLabel:"Find masterpage:"});
		var find_master = dropdowns.add({stringList:list_of_master_pages, selectedIndex:0});
	}
	with(dialogRows.add()){
		staticTexts.add({staticLabel:"Replace master with:"});
		var change_master = dropdowns.add({stringList:list_of_master_pages, selectedIndex:0});
	}
}

var myResult = the_dialog.show();

if(myResult == true){
	// Define masters
	var find_master = the_document.masterSpreads.item(find_master.selectedIndex);
	var change_master = the_document.masterSpreads.item(change_master.selectedIndex);
	
	var change_page = [];
	
	// Find the pages
	for(myCounter = 0; myCounter < the_document.pages.length; myCounter++){
		myPage = the_document.pages.item(myCounter);
		if (myPage.appliedMaster == find_master){
			change_page.push(myPage);
		}
	}
		
	// Apply masters
	myCounter = 0;
	do {
		change_page[myCounter].appliedMaster = change_master;
		myCounter++;
	} while (myCounter < change_page.length);
	
	alert("Replaced " + change_page.length + " masters!");
} else {
	exit();
}
