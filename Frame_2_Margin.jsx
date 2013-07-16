// Frame_2_Margin.jsx
// An InDesign JavaScript by Bruno Herfst 2013
// Version 1.0

#target indesign
main();

var myDoc;

function main(){
	//Make certain that user interaction (display of dialogs, etc.) is turned on.
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	if(app.documents.length != 0){
		myDoc = app.activeDocument;
		if(app.selection.length != 0){
			//Get the first item in the selection.
			for(var i=0;i<app.selection.length;i++){
				var mySelection = app.selection[i];
				switch(mySelection.constructor.name){
				    case "Rectangle", "TextFrame":
				        break;
		                    default:
		                        var ws = mySelection.constructor.name;
			                alert("This is a "+ws+" \rPlease select a Rectangle or TextFrame and try again.");
			                exit();
				}
			}
			fit();
		}else{
			alert("Please select a Rectangle or TextFrame and try again.");
		}
	}else{
		alert("Please open a document and try again.");
	}
}

function fit(){
	var oldRuler = myDoc.viewPreferences.rulerOrigin;
	myDoc.viewPreferences.rulerOrigin = RulerOrigin.spreadOrigin;
	for(var i=0;i<app.selection.length;i++){
		var myRect = app.selection[i];
		var myPage = myRect.parentPage;
		var marginBounds = getMarginBounds(myPage);
		myRect.geometricBounds = marginBounds;
		myDoc.viewPreferences.rulerOrigin = oldRuler;
	}
}

function getMarginBounds(thisPage){
    pH = doRound(thisPage.bounds[2]-thisPage.bounds[0], 3);
    pW = doRound(thisPage.bounds[3]-thisPage.bounds[1], 3);
    return [thisPage.marginPreferences.top,thisPage.marginPreferences.left, pH-thisPage.marginPreferences.bottom, pW-thisPage.marginPreferences.right];
}
function doRound(myNum, roundDec) {
	var roundMulit = Math.pow(10,roundDec);
	return Math.round(myNum*roundMulit)/roundMulit;
}
