/*
	
	Section_2_Master.jsx
	Bruno Herfst 2010

	An InDesign script to create a section with marker to selected masterpages (applied)
	It can also remove the same section elsewhere.
	
*/

#target indesign;

var myDoc = app.documents.item(0);

// Create a list of master pages
var list_of_master_pages = myDoc.masterSpreads.everyItem().name;

// Dialog
var myDialog = app.dialogs.add({name:"Add section to pages"});
with(myDialog.dialogColumns.add()){
	with(dialogRows.add()){
		staticTexts.add({staticLabel:"Applied master:"});
		var CM = dropdowns.add({stringList:list_of_master_pages, selectedIndex:0});
	}
	with(dialogRows.add()){
		// A decorative checkbox :)
		var mySMCheckbox = checkboxControls.add({staticLabel:"Section marker:", checkedState:true});
		var mySMField = textEditboxes.add();
	}
	with(dialogRows.add()){
		var myRSMCheckbox = checkboxControls.add({staticLabel:"Remove sectionmarker elsewhere", checkedState:true});
	}
}

var myResult = myDialog.show();

if(myResult == true){
	// Define variables
	var find_master = myDoc.masterSpreads.item(CM.selectedIndex);
	var mySM = mySMField.editContents;
	var myRSM = myRSMCheckbox.checkedState;

	var change_page = [];
	
	// Find the pages
	for(myCounter = 0; myCounter < myDoc.pages.length; myCounter++){
        myPage = myDoc.pages.item(myCounter);
        if(myPage.appliedSection.marker == mySM && myPage == myPage.appliedSection.pageStart && myPage.appliedSection.index != 0) {
        	myPage.appliedSection.remove();
       	}
		if (myPage.appliedMaster == find_master){
			change_page.push(myPage);
		}
	}
	
	// Now we can start sections
    myCounter = 0;
    do {
    	
    	if (change_page[myCounter] == change_page[myCounter].appliedSection.pageStart) {
    		change_page[myCounter].appliedSection.marker = mySM;
    	} else {
    		myDoc.sections.add(change_page[myCounter],{marker:mySM,continueNumbering:true})
    	}
		
		myCounter++;
		
	} while (myCounter < change_page.length);
	
	
	
	alert("Added "+(myCounter+1)+" sections");

} else {
	exit();
}