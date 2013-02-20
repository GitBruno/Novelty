/*
		Read_Actual_Margins.jsx
		Reads actual margin size and optionally rounds them to three decimals 
		This fixes automatic text flow error ‘Unable to create boundingbox’

		Bruno Herfst 2011

*/

//-------------------- V A R I A B L E S --------------------------//
var myTopMargin, myBottomMargin, myInsideMargin, myOutsideMargin;
var myMargins = [];

try {
	var myPage = app.activeWindow.activePage;
	readmargins(myPage);
	showDialog(myMargins);
	
} catch(err) {
 	alert(err.description);
}

//-------------------- F U N C T I O N S --------------------------//
function readmargins(myPage) {
	try {
		myTopMargin = myPage.marginPreferences.top;  
		myBottomMargin = myPage.marginPreferences.bottom;
		if(myPage.side == PageSideOptions.leftHand){
				myOutsideMargin = myPage.marginPreferences.left;
				myInsideMargin = myPage.marginPreferences.right;
		}
		else{
			myInsideMargin = myPage.marginPreferences.left;
			myOutsideMargin = myPage.marginPreferences.right;
		}
		myMargins=[myTopMargin, myBottomMargin, myOutsideMargin, myInsideMargin];
	} catch(err) {
	  	alert(err.description);
	}
}

function showDialog(myMargins) {
	var myDlg = new Window('dialog', 'Page margins');
	
	myDlg.orientation = 'row';
	//myDlg.alignment = 'left';
	
	//add Mdata
	myDlg.Mdata = myDlg.add('group');
	myDlg.Mdata.orientation = 'column';
	myDlg.Mdata.alignment = 'left';

	myDlg.Mdata.mTop = myDlg.Mdata.add('staticText', undefined, 'Top: '+myMargins[0]);
	myDlg.Mdata.mTop.alignment = 'left';
	myDlg.Mdata.mBot = myDlg.Mdata.add('staticText', undefined, 'Bottom: '+myMargins[1]);
	myDlg.Mdata.mBot.alignment = 'left';
	myDlg.Mdata.mOut = myDlg.Mdata.add('staticText', undefined, 'Outside: '+myMargins[2]);
	myDlg.Mdata.mOut.alignment = 'left';
	myDlg.Mdata.mIn = myDlg.Mdata.add('staticText', undefined, 'Inside: '+myMargins[3]);
	myDlg.Mdata.mIn.alignment = 'left';
	
	//add buttons
	myDlg.mbut = myDlg.add('group');
	myDlg.mbut.orientation = 'column';
	myDlg.mbut.alignment = ["left", "top"];
	
	myDlg.mbut.pageBtn = myDlg.mbut.add('button', undefined, 'Fix page');
	myDlg.mbut.docBtn = myDlg.mbut.add('button', undefined, 'Fix doc');
	myDlg.mbut.closeBtn = myDlg.mbut.add('button', undefined, 'Cancel');
	
	
	myDlg.mbut.closeBtn.onClick = function() {
	  this.parent.parent.close(1);
	}
	myDlg.mbut.docBtn.onClick = function() {
	  this.parent.parent.close(2);
	}
	myDlg.mbut.pageBtn.onClick = function() {
	  this.parent.parent.close(3);
	}
	
	result = myDlg.show();
	
	if (result == 1) {
  		exit();
	} else if(result == 2) {
		fixDoc(myMargins);
	} else if(result == 3) {
		fixPage(myPage, myMargins);
	}
}

function doRound(myNum, roundDec) {
	var roundMulit = Math.pow(10,roundDec);
	return Math.round(myNum*roundMulit)/roundMulit;
}

function fixPage(myPage, myMargins){
	myTopMargin = doRound(myMargins[0],3);
	myBottomMargin = doRound(myMargins[1],3);
	myOutsideMargin = doRound(myMargins[2],3);
	myInsideMargin = doRound(myMargins[3],3);
	
	try {
		myPage.marginPreferences.top = myTopMargin;  
		myPage.marginPreferences.bottom = myBottomMargin;
		if(myPage.side == PageSideOptions.leftHand){
				myPage.marginPreferences.left = myOutsideMargin;
				myPage.marginPreferences.right = myInsideMargin;
		}
		else{
			myPage.marginPreferences.left = myInsideMargin;
			myPage.marginPreferences.right = myOutsideMargin;
		}
	} catch(err) {
	  	alert(err.description);
	}
}

function fixDoc(myMargins) {
	//get ref to doc
	var myDoc = app.activeDocument;
	//do every page
	for (var myCounter = 0; myCounter < myDoc.pages.everyItem().getElements().length; myCounter++){
		readmargins(myDoc.pages.item(myCounter));
		fixPage(myDoc.pages.item(myCounter), myMargins);
	}
	//and masterspread
	for (var myCounter = 0; myCounter < myDoc.masterSpreads.everyItem().getElements().length; myCounter++){
		myMasterSpread = myDoc.masterSpreads.item(myCounter);
		for (var i = 0; i < myMasterSpread.pages.everyItem().getElements().length; i++){
			myMasterPage=myMasterSpread.pages.item(i);
			readmargins(myMasterPage);
			fixPage(myMasterPage, myMargins);
		}
	}
}