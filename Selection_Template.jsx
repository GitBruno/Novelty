/*

Selection_Temlate.jsx
Version 1.0
Bruno Herfst 2011

An InDesign javascript to quickly do something with the selected object

*/

#target InDesign;

try {
	//global vars
	var myDoc = app.activeDocument;
	
	if(app.selection.length != 0){
		for(var i=0; i<app.selection.length; i++){
			doSomethingWithSelectedItem(app.selection[i]);
		}
	}else{
		alert("Select something first.");
	}
} catch(err) {
	var txt=err.description;
	alert(txt);
	exit();
}

function doSomethingWithSelectedItem(item) {
	alert(item);
}