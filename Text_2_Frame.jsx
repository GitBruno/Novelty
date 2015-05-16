/*
Text_2_Frame.jsx

Version 1.0

An InDesign CS5 Javascript
Bruno Herfst 2010

Move text to an inline frame for further manipulation.
Rotate for example.

*/

#target InDesign;

var Settings = {
    removeIndents         : true,      // Boolean
    textFrameInsetSpacing : 2,         // Integer: points
    textBaselineShift     : 1.5,       // Integer: points
    frameBaselineShift    : 0,         // Integer: points
    strokeWeight          : 1,         // Integer: points
    strokeColor           : "Black",   // String: Swatch name or None
    strokeTint            : 100,       // Integer: percentage  
    fillColor             : "Paper",   // String: Swatch name
    fillTint              : 100,       // Integer: percentage
    alignToBaseline       : false      // Boolean: Frame will be aligned to baseline from now on
};

if(app.documents.length != 0){
    //global vars
    var myDoc = app.activeDocument;
    var originalRulerUnits = [myDoc.viewPreferences.horizontalMeasurementUnits,myDoc.viewPreferences.verticalMeasurementUnits];
    main();
}else{
    alert("Please open a document and try again.");
}

function main(){
    if (app.selection.length == 1){
        switch (app.selection[0].constructor.name){
            case "Text":
            case "Character":
            case "Word":
                // Set rulers to points
                setRulerUnits([MeasurementUnits.POINTS,MeasurementUnits.POINTS]);
                
                var tf = app.selection[0].textFrames.add();
                    tf.textFramePreferences.autoSizingType = AutoSizingTypeEnum.WIDTH_ONLY;
                    tf.label = "Text_2_Frame"; // Just in case we need to find them again

                var myBounds    = tf.geometricBounds;                
                    myBounds[2] = myBounds[0] + app.selection[0].pointSize + (Settings.textFrameInsetSpacing*2);
                
                tf.geometricBounds = myBounds;
                
                app.selection[0].duplicate(LocationOptions.AFTER,tf.insertionPoints[0]);
                app.selection[0].contents = "";
                
                var story = app.selection[0].parentStory;
                
                var seltf = story.characters[(app.selection[0].index - 1)];
                seltf.baselineShift = -(Settings.textFrameInsetSpacing + Settings.strokeWeight + Settings.textBaselineShift) + Settings.frameBaselineShift;

                tf.texts[0].alignToBaseline = Settings.alignToBaseline;
                
                if(Settings.removeIndents){
                    removeIndents(tf);
                }
                if(Settings.textBaselineShift > 0){
                    tf.texts[0].baselineShift += Settings.textBaselineShift;
                }
                
                tf.textFramePreferences.firstBaselineOffset   = FirstBaseline.X_HEIGHT;
                tf.textFramePreferences.verticalJustification = VerticalJustification.BOTTOM_ALIGN;

                tf.textFramePreferences.insetSpacing = [0 + "pt",Settings.textFrameInsetSpacing + "pt",Settings.textFrameInsetSpacing + "pt",Settings.textFrameInsetSpacing + "pt"];
                
                styleFrame(Settings,tf);
                
                fixPreviewBug(app.selection[0].parentTextFrames[0]);
                
                // Reset rulers
                setRulerUnits(originalRulerUnits);
                
                break;
            default:
                alert("Select some text or a textframe and try again.");
                break;
        }
    } else {
        alert("Select a textframe and try again.");
    }
}

function fixPreviewBug(TF){
    var OLDTFBOUNDS = TF.geometricBounds;
    var NEWTFBOUNDS = OLDTFBOUNDS;
    NEWTFBOUNDS[0] += 1;
    TF.geometricBounds = NEWTFBOUNDS;
    TF.geometricBounds = OLDTFBOUNDS;
}

function setRulerUnits(rulerUnits){
    myDoc.viewPreferences.horizontalMeasurementUnits = rulerUnits[0];
	myDoc.viewPreferences.verticalMeasurementUnits   = rulerUnits[0];
}

function styleFrame(Settings, frame){
    frame.fillColor    = Settings.fillColor;
    frame.fillTint     = Settings.fillTint;
    frame.strokeColor  = Settings.strokeColor;
    frame.strokeTint   = Settings.strokeTint;
    frame.strokeWeight = Settings.strokeWeight;
}

function removeIndents(textFrame){
    textFrame.texts[0].leftIndent = 0;
    textFrame.texts[0].rightIndent = 0;
}