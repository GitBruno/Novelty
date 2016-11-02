// CompareTwoDocuments.jsx 
// Version1.5  Oct 29 2009
// © Kasyan Servetsky, 2009
// http://www.kasyan.ho.com.ua
// e-mail: askoldich@yahoo.com
//----------------------------------------------------------------------
#target indesign
var myDocs = app.documents;
app.insertLabel("Kas_CompareDocuments_myDoc1fsName", "");
app.insertLabel("Kas_CompareDocuments_myDoc2fsName", "");

if (myDocs.length == 0) {
	OnError(localize({en: "This script requires at least two documents to be open in InDesign, but you have no open files.", ru: "Для работы скрипта необходимо, чтобы были открыто, как минимум, два  документа, а у вас не открыт ни один."}));
}
else if (myDocs.length == 1) {
	OnError(localize({en: "This script requires at least two documents to be open in InDesign, but you have opened only one file.", ru: "Для работы скрипта необходимо, чтобы были открыто, как минимум, два  документа, а у вас открыт только один файл."}));
}

var mySelectedButton;
var myDoc1 = app.documents[0];
if (!myDoc1.saved) OnError(localize({en: "The active document has not been saved since it was created.", ru: "Активный документ ещё ни разу не был сохранён с момента создания."}));
var myDoc2 = ShowDialog();

if (myDoc1.modified) {
	if (confirm(localize({en: "The active document has been modified since it was last saved. Do you want to interrupt the script and save changes?", ru: "Активный документ не был сохранён. Вы хотите прервать скрипт и сохранить изменения?"}), false, localize({en: "Compare two documents", ru: "Сравнить два документа"}))) exit();
}

if (myDoc2.modified) {
	if (confirm(localize({en: "The selected document has been modified since it was last saved. Do you want to interrupt the script and save changes?", ru: "Выбранный документ не был сохранён. Вы хотите прервать скрипт и сохранить изменения?"}), false, localize({en: "Compare two documents", ru: "Сравнить два документа"}))) exit();
}

CheckLinks(myDoc1);
CheckLinks(myDoc2);

var myDoc1_DocPref = myDoc1.documentPreferences;
var myDoc2_DocPref = myDoc2.documentPreferences;

CheckConditions();

try {
	app.insertLabel("Kas_CompareDocuments_myDoc1fsName", myDoc1.fullName.fsName);
	app.insertLabel("Kas_CompareDocuments_myDoc2fsName", myDoc2.fullName.fsName);
}
catch (myError) {
	OnError(myError);
}

var myCompareDoc = myDocs.add(true, undefined);

myDoc1 = FindDocumentByPath(app.extractLabel("Kas_CompareDocuments_myDoc1fsName"));
myDoc2 = FindDocumentByPath(app.extractLabel("Kas_CompareDocuments_myDoc2fsName"));
var myFile1 = myDoc1.fullName;
var myFile2 = myDoc2.fullName;

with (myCompareDoc.viewPreferences) {
	rulerOrigin = RulerOrigin.PAGE_ORIGIN;
	horizontalMeasurementUnits = myDoc1.viewPreferences.horizontalMeasurementUnits;
	verticalMeasurementUnits = myDoc1.viewPreferences.verticalMeasurementUnits;
}

myCompareDoc.documentPreferences.pageWidth = myDoc1_DocPref.pageWidth;
myCompareDoc.documentPreferences.pageHeight = myDoc1_DocPref.pageHeight;

myCompareDoc.layoutWindows.item(0).overprintPreview = true;
myCompareDoc.layoutWindows.item(0).screenMode = ScreenModeOptions.PREVIEW_TO_PAGE;

var myActiveDocLayer = myCompareDoc.layers[0].name = "Active Document";
var mySelectedDocLayer = myCompareDoc.layers.add({name:"Selected Document"});
if (mySelectedButton == 1) {
	var myRecLayer = myCompareDoc.layers.add({name:"White Rectangle"});
}

while (myCompareDoc.pages.length < myDoc1.pages.length) {
	myCompareDoc.pages.add();
}

myCompareDoc.sections[0].continueNumbering = false;
myCompareDoc.sections[0].pageNumberStart = myDoc1.sections[0].pageNumberStart;

	for (var j = myDoc1.sections.length-1; j >= 1; j--) {
		myDoc1Section = myDoc1.sections[j];
		var myPageNumber = myDoc1Section.pageStart.documentOffset;
		var mySection = myCompareDoc.sections[0];
	
		with (mySection) {
			continueNumbering = myDoc1Section.continueNumbering;
			name = myDoc1Section.name;
			sectionPrefix = myDoc1Section.sectionPrefix;
			includeSectionPrefix = myDoc1Section.includeSectionPrefix;
			marker = myDoc1Section.marker;
			try {
				pageNumberStart = myDoc1Section.pageNumberStart;
			}
			catch(err) {
				continueNumbering = false;
				pageNumberStart = myDoc1Section.pageNumberStart;
			}
			pageNumberStyle = myDoc1Section.pageNumberStyle;
		}
	}

for (var i = 0; i < myCompareDoc.pages.length; i++) {
	var myPage = myCompareDoc.pages[i];
	app.importedPageAttributes.pageNumber = i + 1;
	var myImportedDoc1 = myPage.place(myFile1, [0, 0], myCompareDoc.layers.itemByName("Active Document"));
	app.importedPageAttributes.pageNumber = i + 1;
	var myImportedDoc2 = myPage.place(myFile2, [0, 0], myCompareDoc.layers.itemByName("Selected Document"));
	var myRec1 = myImportedDoc1[0].parent;
	var myRec2 = myImportedDoc2[0].parent;
	myRec1.transparencySettings.blendingSettings.blendMode = BlendMode.DIFFERENCE;
	myRec1.fillColor = myCompareDoc.swatches.item("Paper");
	myRec2.transparencySettings.blendingSettings.blendMode = BlendMode.DIFFERENCE;
	myRec2.fillColor = myCompareDoc.swatches.item("Paper");
	if (mySelectedButton == 1) {
		var myWhiteRec = myPage.rectangles.add(myCompareDoc.layers.itemByName("White Rectangle"));
		myWhiteRec.geometricBounds = [0, 0, myDoc1_DocPref.pageHeight ,myDoc1_DocPref.pageWidth];
		myWhiteRec.fillColor = myCompareDoc.swatches.item("Paper");
		myWhiteRec.strokeColor = myCompareDoc.swatches.item("None");
		myWhiteRec.transparencySettings.blendingSettings.blendMode = BlendMode.DIFFERENCE;
	}
}

app.scriptPreferences.userInteractionLevel = UserInteractionLevels.INTERACT_WITH_ALL;
alert(localize({en: "Done.", ru: "Готово."}), localize({en: "Compare two documents", ru: "Сравнить два документа"}));

//+++++++++++++++ FUNCTIONS +++++++++++++++
function OnError(e){
	alert(e, localize({en: "Compare two documents", ru: "Сравнить два документа"}), true);
	exit();
}
//----------------------------------------------------------------------
function CheckConditions() {
	if (myDocs.length == 1) {
		OnError(localize({en: "This script requires at least two documents to be open in InDesign, but you have opened only one file.", ru: "Для работы скрипта необходимо, чтобы были открыто, как минимум, два  документа, а у вас открыт только один файл."}));
	}
	else if (myDocs.length == 0) {
		OnError(localize({en: "This script requires at least two documents to be open in InDesign, but you have no open files.", ru: "Для работы скрипта необходимо, чтобы были открыто, как минимум, два  документа, а у вас не открыт ни один."}));
	}
	if (myDoc1_DocPref.pageOrientation != myDoc2_DocPref.pageOrientation) OnError(localize({en: "Orientation should be the same in both documents.", ru: "Ориентация для обоих документов должна быть одинаковой."}));
	if (myDoc1_DocPref.pageHeight != myDoc2_DocPref.pageHeight || myDoc1_DocPref.pageWidth != myDoc2_DocPref.pageWidth) OnError(localize({en: "Height and Width of page in both documents should be the same.", ru: "Ширина и высота в обоих документах должна быть одинаковой"}));
	if (myDoc1_DocPref.facingPages != myDoc2_DocPref.facingPages) OnError(localize({en: "Facing Pages parameter should be the same in both documents.", ru: "Параметр \"Facing Pages\" должен быть одинаковым для обоих документов."}));
	if (myDoc1_DocPref.pagesPerDocument != myDoc2_DocPref.pagesPerDocument) OnError(localize({en: "Number of pages in both documents should be the same.", ru: "Колличество страниц в обоих документах должно быть одинаковым."}));
	if (myDoc1.sections.length != myDoc2.sections.length) OnError(localize({en: "Number of sections in both documents should be the same.", ru: "Колличество разделов в обоих документах должно быть одинаковым."}));
}
//----------------------------------------------------------------------
function ShowDialog() {
	var mySavedDocs = [];
	var mySavedDocNames = [];
	
	for (var j = 1; j < myDocs.length; j++) {
		if (myDocs[j].saved) {
			mySavedDocs.push(myDocs[j]);
			mySavedDocNames.push(myDocs[j].name);
		}
	}

	if (mySavedDocs.length == 0) OnError(localize({en: "You don't have any saved documents to compare with the active document.", ru: "У вас ни открыто ни одного сохранённого документа, для того чтобы сравнить его с активным документом."}));;

	var myWindow = new Window("dialog", localize({en: "Compare two documents", ru: "Сравнить два документа"}));
	myWindow.alignChildren = "fill";

	var myPanel = myWindow.add("panel", undefined, undefined);
	myPanel.orientation = "column";
	myPanel.alignChildren = "left";
	
	var myGroup1 = myPanel.add("group");
	myGroup1.orientation = "row";
	var myStText1 = myGroup1.add("statictext", undefined, myDoc1.name +  localize({en: " with", ru: " c"}));
	myStText1.helpTip = app.documents[0].fullName.fsName.replace("/Volumes/", "");

	var myDropdownlist = myGroup1.add ("dropdownlist", undefined, mySavedDocNames);
	myDropdownlist.selection = myDropdownlist.items[0];
	myDropdownlist.helpTip = mySavedDocs[myDropdownlist.selection.index].fullName.fsName.replace("/Volumes/", "");
	
	myDropdownlist.onChange = function() {
		myDropdownlist.helpTip = mySavedDocs[myDropdownlist.selection.index].fullName.fsName.replace("/Volumes/", "");
	}
	
	var myGroup2 = myPanel.add("group");
	myGroup2.orientation = "row";
	var myStText2 = myGroup2.add("statictext", undefined, localize({en: "Background color:", ru: "Цвет фона:"}));

	var myRadioBtn1 = myGroup2.add("radiobutton", undefined, localize({en: "white", ru: "белый"}));
	var myRadioBtn2 = myGroup2.add("radiobutton", undefined, localize({en: "black", ru: "чёрный"}));
	if (app.extractLabel("Kas_CompareDocuments_RadioSelected") != "") {
		eval("myRadioBtn" + app.extractLabel("Kas_CompareDocuments_RadioSelected") + ".value= true");
	}
	else {
		myRadioBtn1.value = true;
	}
	
	var myGroup3 = myWindow.add("group");
	myGroup3.alignment = "center";
	var myOkBtn = myGroup3.add("button", undefined, "OK");
	var myCancelBtn = myGroup3.add("button", undefined, "Cancel");
	
	var myDialogResult = myWindow.show();
	if (myDialogResult == 1) {
		var myRadSelected;
		if (myRadioBtn1.value) {
			myRadSelected = 1;
		}
		else if (myRadioBtn2.value) {
			myRadSelected = 2;
		}
		app.insertLabel("Kas_CompareDocuments_RadioSelected", myRadSelected + "");
		
		mySelectedButton = myRadSelected;
		var myDropdownResult = mySavedDocs[myDropdownlist.selection.index];
		return myDropdownResult;
	}
	else {
		exit();
	}	
}
//----------------------------------------------------------------------
function FindDocumentByPath(myPath) {
	for (var i = 0; i < myDocs.length; i++) {
		var myCurDoc = myDocs[i];
		if (myCurDoc.saved) {
			try {
				if (myCurDoc.fullName.fsName == myPath) {
					return myCurDoc;
				}
			}
			catch(e) {
				OnError(localize({en: "Can't find the file by its path: " + myPath, ru: "Не удалось найти файл по его пути : "+ myPath}));
			}
		}
	}
}
//----------------------------------------------------------------------
function CheckLinks(myDoc) {
	var myMissingLinks = [];
	var myModifiedLinks = [];
	
	for (var n = 0; n < myDoc.links.length; n++) {
		var myLink = myDoc.links[n];
		if (myLink.status == LinkStatus.linkMissing) {
			myMissingLinks.push(myLink);
		}
		else if (myLink.status == LinkStatus.LINK_OUT_OF_DATE) {
			myModifiedLinks.push(myLink);
		}
	}

	if (myMissingLinks.length > 0) {
		var myConfirm = confirm(localize({en: myDoc.name + " contains ", ru: myDoc.name + " содержит "}) + myMissingLinks.length + localize({en: " missing link" +  ((myMissingLinks.length > 1) ? "s" : "") + ". Do you want to stop the script and repair them?", ru: ((myMissingLinks.length > 1) ? " потерянные  ссылки" : " потерянную  ссылку") + ". Хотите остановить скрипт и исправить?"}), false, localize({en: "Compare two documents", ru: "Сравнить два документа"}));
		if (myConfirm) exit();
	}

	if (myModifiedLinks.length > 0) {
		var myConfirm = confirm(localize({en: myDoc.name + " contains ", ru: myDoc.name + " содержит "}) + myModifiedLinks.length + localize({en: " modified link" +  ((myModifiedLinks.length > 1) ? "s" : "") + ". Do you want to stop the script and repair them?", ru: ((myModifiedLinks.length > 1) ? " необновлённые  ссылки" : " необновлённую  ссылку") + ". Хотите остановить скрипт и исправить?"}), false, localize({en: "Compare two documents", ru: "Сравнить два документа"}));
		if (myConfirm) exit();
	}

	if (myMissingLinks.length > 0 || myModifiedLinks.length > 0) {
		app.scriptPreferences.userInteractionLevel = UserInteractionLevels.NEVER_INTERACT;
	}
}