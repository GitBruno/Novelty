//////////////////////////////////////////////////////////////////////////////////////////////////
//
//    XHeight_ParagraphStyle.jsx
//    A InDesign javascript to get and set the xHeight from seleced paragraph style
//
//    Bruno Herfst 2015
//
//////////////////////////////////////////////////////////////////////////////////////////////////

#target InDesign;

//Make certain that user interaction (display of dialogs, etc.) is turned on.
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;   

if (app.documents.length != 0){
    // Global variables
    var myDoc = app.activeDocument, myFont = undefined;

    if (app.selection.length == 1){
        switch (app.selection[0].constructor.name){
            //add case for insertion point
            case "Text":
            case "Paragraph":
            case "Character":
            case "Word":
                showXheightPallette(app.selection[0].appliedParagraphStyle);
                break;
            default:
                alert("This is " + app.selection[0].constructor.name + "\n Please select some text.");
                break;
        }
    } else {
        alert("Select some text and try again.");
    }
} else {
    alert("No documents are open. Please open a document, select some text, and try again.");
}

function getXHeight(ParagraphStyle, xPercent){
    if (typeof xPercent === 'undefined') {
        var xPercent = getXPercent(ParagraphStyle);
    }
    var fontSize = ParagraphStyle.pointSize;
    var xHeight = fontSize/xPercent;
    return(xHeight);
}

function getFontSize(ParagraphStyle, xHeight, xPercent){
    if (typeof xPercent === 'undefined') {
        var xPercent = getXPercent(ParagraphStyle);
    }
    var fontSize = xHeight*xPercent;
    return fontSize;
}

function getXPercent(ParagraphStyle){
    var baseSize = 100;

    tempDoc = app.documents.add(false);
    //Set up the new cover.
    with(tempDoc.documentPreferences){
            horizontalMeasurementUnits = MeasurementUnits.POINTS;
            verticalMeasurementUnits = MeasurementUnits.POINTS;
            //Set page size
            pageHeight = "2000pt";
            pageWidth = "2000pt";
            pagesPerDocument = 1;
    }
    with(tempDoc.viewPreferences){
        horizontalMeasurementUnits = MeasurementUnits.POINTS;
        verticalMeasurementUnits   = MeasurementUnits.POINTS;
        rulerOrigin = RulerOrigin.pageOrigin;
    }

    var PAGE = tempDoc.pages[0];

    var myTextFrame = PAGE.textFrames.add();
        myTextFrame.label = "0987654334567890";
        myTextFrame.geometricBounds = PAGE.bounds;
        myTextFrame.contents = "x";
        myTextFrame.textFramePreferences.verticalJustification = VerticalJustification.TOP_ALIGN;
        myTextFrame.textFramePreferences.insetSpacing = 0;
        myTextFrame.textFramePreferences.firstBaselineOffset = FirstBaseline.X_HEIGHT;

    var myStory = myTextFrame.parentStory;
        myStory.appliedFont = ParagraphStyle.appliedFont;
        myStory.pointSize = baseSize;

    myTextFrame.fit(FitOptions.FRAME_TO_CONTENT);

    var tfBounds = myTextFrame.geometricBounds; // [y1, x1, y2, x2]
    var baseXHeight = tfBounds[2] - tfBounds[0];

    if(tempDoc.isValid){
        tempDoc.close( SaveOptions.NO );
    }

    var xPercent = baseSize/baseXHeight;

    return(xPercent);
}

function showXheightPallette(ParagraphStyle){
    var xPercent = getXPercent(ParagraphStyle);
    var currXheight = getXHeight(ParagraphStyle, xPercent);

    var  myDialog  = app.dialogs.add({name:"Set X Height", canCancel:true});

    with(myDialog){
        with(dialogColumns.add()){
            with(dialogRows.add()){
                var xHeightField = measurementComboboxes.add({editUnits:MeasurementUnits.POINTS, editContents:String(currXheight),smallNudge:0.01,largeNudge:1,minWidth:100});
            }
        }
    }

    if(myDialog.show() == true){
        var xHeight=parseFloat(xHeightField.editValue);
        if(xHeight != currXheight){
            var newFontSize = getFontSize(ParagraphStyle, xHeight, xPercent);
            ParagraphStyle.pointSize = newFontSize;
        }
    } else {
        myDialog.destroy();
        exit();
    }
}

