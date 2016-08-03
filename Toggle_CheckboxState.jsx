/*

Toggle_CheckboxState.jsx
Version 1.0
Bruno Herfst 2016

A quick way to toggle a CheckBox

*/

#target InDesign;

try {
	//global vars
	var myDoc = app.activeDocument;
	
	if(app.selection.length != 0){
		selLen = app.selection.length;
		// Changing the activeStateIndex causes InDesign
		// to delselect objest so we save te current selecton
		// and reselect them again on exit
		var items = new Array();
		for(var i=0; i<app.selection.length; i++){
			items.push(app.selection[i]);
		}
		doSomethingWithItems(items);
	}else{
		alert("Select something first.");
	}
} catch(err) {
	var txt=err.description;
	alert(txt);
	exit();
}

function doSomethingWithItems(items) {
	
	for(var i=0; i<items.length; i++){
		doSomethingWithSelectedItem(items[i]);
	}

	// reselect items
	app.select(items[0], SelectionOptions.replaceWith);
	for(var i=1; i<items.length; i++){
		app.select(items[i], SelectionOptions.addTo);
	}

}

function doSomethingWithSelectedItem(item) {
	if(item.constructor.name == 'Group') {
		var groupLen = item.allPageItems.length;
		for(var i=groupLen-1; i>=0; i--){
			doSomethingWithSelectedItem(item.allPageItems[i]);
		}
	} else if(item.constructor.name == 'CheckBox') {
		if(item.activeStateIndex == 1) {
			item.activeStateIndex = 0;
		} else if(item.activeStateIndex == 0) {
			item.activeStateIndex = 1;
		}
	}
}