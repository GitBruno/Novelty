/*
Text_2_Frame.jsx

Version 1.1

An InDesign CS5 Javascript
Bruno Herfst 2015

Move text to an inline frame for further manipulation.
Rotate for example.

NOTE: This script uses the bounds to set the size and therefore does not work inside
      text frames that already have been rotated.
      It does not work with obkect srtyles in folers

*/

#target InDesign;

// Would be good if some of these can be undefined:

var Standard = {
    moveSingleCharacters  : false,     // Boolean
    moveSingleWords       : true,      // Boolean
    centerText            : true,      // Boolean
    removeIndents         : true,      // Boolean
    textFrameInsetSpacing : 2,         // float: points
    heightGain            : 0.5,       // float: points. Adjust the height of the frame
    textBaselineShift     : 1.5,       // float: points. Adjust the vertical alignment inside the frame
    frameBaselineShift    : 0,         // float: points. Adjust the vertical position of the inline frame
    objectStyleName       : "None",  // String
    strokeWeight          : 0,         // float: points.
    strokeColor           : "None",    // String: Swatch name or None
    strokeTint            : [0,0],     // Array: percentage [float: Min, float: Max]
    fillColor             : "None",  // String: Swatch name
    fillTint              : [0,0],     // Array: percentage [float: Min, float: Max]
    alignToBaseline       : false,     // Boolean: True only works without rotation (Frame will be aligned to baseline).
    rotation              : [-3,5],    // Array: rotation [float: Min, float: Max]
    name                  : "Standard" // String
};

var WB_Cutwords = {
    moveSingleCharacters  : false,     // Boolean
    moveSingleWords       : false,      // Boolean
    centerText            : false,     // Boolean
    removeIndents         : true,      // Boolean
    textFrameInsetSpacing : 2,         // float: points
    heightGain            : 0.5,       // float: points. Adjust the height of the frame
    textBaselineShift     : 1.5,       // float: points. Adjust the vertical alignment inside the frame
    //textBaselineShift     : 4.5,       // float: points. Adjust the vertical alignment inside the frame
    frameBaselineShift    : 0,         // float: points. Adjust the vertical position of the inline frame
    objectStyleName       : "WB_Cut_DropShadow", // String
    strokeWeight          : 0,         // float: points.
    strokeColor           : "None",    // String: Swatch name or None
    strokeTint            : [0,0], // Array: percentage [float: Min, float: Max]
    fillColor             : "Black",   // String: Swatch name
    fillTint              : [6,15],    // Array: percentage [float: Min, float: Max]
    alignToBaseline       : false,     // Boolean: Frame will be aligned to baseline from now on.
    rotation              : [-3,5],    // Array: rotation [float: Min, float: Max]
    name                  : "WordBurger_CutWords" // String
};

var WB_Crossword = {
    moveSingleCharacters  : true,      // Boolean
    moveSingleWords       : false,     // Boolean
    forceSquares          : true,      // Boolean: Force a square when doing single characters
    centerText            : true,      // Boolean
    removeIndents         : true,      // Boolean
    textFrameInsetSpacing : 2,         // float: points
    heightGain            : 0.5,       // float: points. Adjust the height of the frame
    textBaselineShift     : 0,         // float: points. Adjust the vertical alignment inside the frame
    frameBaselineShift    : 0,         // float: points. Adjust the vertical position of the inline frame
    objectStyleName       : "WB_CrosswordFrame", // String
    strokeWeight          : 0,         // float: points.
    strokeColor           : "None",    // String: Swatch name or None
    strokeTint            : [0,0],     // Array: percentage [float: Min, float: Max]
    fillColor             : "Paper",   // String: Swatch name
    fillTint              : [100,100], // Array: percentage [float: Min, float: Max]
    alignToBaseline       : false,     // Boolean: Frame will be aligned to baseline from now on.
    rotation              : [0,0],     // Array: rotation [float: Min, float: Max]
    name                  : "WordBurger_CutWords" // String
};

var Settings = Standard;

var userNeverGotObjectStyleAlert = true; // So we only get the warning once.

if(app.documents.length != 0){
    //global vars
    var myDoc = app.activeDocument;
    var originalRulerUnits = [myDoc.viewPreferences.horizontalMeasurementUnits,myDoc.viewPreferences.verticalMeasurementUnits];

    if (app.selection.length == 1){
        switch (app.selection[0].constructor.name){
            case "Character":
            case "Text":
            case "Word":
            case "Paragraph":
            case "TextStyleRange":
            case "TextColumn":
                if(Settings.moveSingleCharacters){
                    for(i=app.selection[0].characters.length-1; i>=0 ; i--){
                        main(app.selection[0].characters[i]);
                    }
                } else if(Settings.moveSingleWords){
                    for(i=app.selection[0].words.length-1; i>=0 ; i--){
                        main(app.selection[0].words[i]);
                    }
                } else {
                    main(app.selection[0]);
                }
                break;
            default:
                alert("This is a "+ app.selection[0].constructor.name +"\nSelect some text or a textframe and try again.");
                break;
        }
    } else {
        alert("Select a textframe and try again.");
    }

}else{
    alert("Please open a document and try again.");
}

function main(selection){
    // Set rulers to points
    setRulerUnits([MeasurementUnits.POINTS,MeasurementUnits.POINTS]);

    var tf = selection.textFrames.add();
        tf.textFramePreferences.autoSizingType = AutoSizingTypeEnum.WIDTH_ONLY;
        tf.label = "Text_2_Frame"; // Just in case we need to find them again

    var myBounds    = tf.geometricBounds;
        myBounds[2] = myBounds[0] + selection.pointSize + (Settings.textFrameInsetSpacing*2) + Settings.heightGain;

    tf.geometricBounds = myBounds;

    if(Settings.forceSquares){
        myBounds    = tf.geometricBounds;
        tf.textFramePreferences.autoSizingType = AutoSizingTypeEnum.OFF;
        myBounds[3] = myBounds[1] + (myBounds[2]-myBounds[0]);
        tf.geometricBounds = myBounds;
    }

    selection.duplicate(LocationOptions.AFTER,tf.insertionPoints[0]);
    selection.contents = "";

    tf.texts[0].alignToBaseline = Settings.alignToBaseline;
    tf.texts[0].justification = Justification.CENTER_ALIGN;

    if(Settings.removeIndents){
        removeIndents(tf);
    }

    if(Math.abs(Settings.textBaselineShift) > 0){
        tf.texts[0].baselineShift += Settings.textBaselineShift;
    }

    tf.textFramePreferences.firstBaselineOffset   = FirstBaseline.X_HEIGHT;
    tf.textFramePreferences.verticalJustification = VerticalJustification.BOTTOM_ALIGN;

    var bottomInset = Settings.textFrameInsetSpacing;
    if(Math.abs(Settings.heightGain) > 0){
        bottomInset += Settings.heightGain/2;
    }
    tf.textFramePreferences.insetSpacing = [0 + "pt",Settings.textFrameInsetSpacing + "pt",bottomInset + "pt",Settings.textFrameInsetSpacing + "pt"];

    styleFrame(Settings,tf);

    try{
        var tfWidth = tf.visibleBounds[3]-tf.visibleBounds[1];
    } catch(err) {
        alert("OOPS! Can't fit the new frame!\nPlease make the frame bigger and try again.");
        exit();
    }

    tf.absoluteRotationAngle = randomInRange(Settings.rotation[0],Settings.rotation[1]);

    // Add rotation height different to frame offset
    Settings.frameBaselineShift += -( Math.abs(getOpposite(tfWidth,tf.absoluteRotationAngle)) /2 );

    // Align frame to center using baselineShift
    var story = selection.parentStory;
    var seltf = story.characters[(selection.index - 1)];

    seltf.baselineShift = -(bottomInset + Settings.strokeWeight + Settings.textBaselineShift) + Settings.frameBaselineShift;

    try {
        tf.appliedObjectStyle = myDoc.objectStyles.item(Settings.objectStyleName);
    } catch(err){
        if(userNeverGotObjectStyleAlert){
            alert("Could not set object Style");
            userNeverGotObjectStyleAlert = false;
        }
    }

    // Done! Reset the preview and rulers.
    fixPreviewBug(selection.parentTextFrames[0]);
    // Reset rulers
    setRulerUnits(originalRulerUnits);
}

function getFrameDimensions(frame){
    var b = frame.geometricBounds;
    return [ b[3]-b[1] , b[2]-b[0] ];
}

function randomInRange(start,end){
    return Math.random() * (end - start) + start;
}

function getOpposite(hypotenuse, angle){
    //                 .
    // hypotenuse --> /|  <-- Opposite
    //     angle --> /_|
    //
    return Math.sin(toRadians(angle))*hypotenuse;
}

function toDegrees (angle) {
  return angle * (180 / Math.PI);
}
function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function fixPreviewBug(TF){
    var NEWTFBOUNDS = TF.geometricBounds;
    NEWTFBOUNDS[0] += 1;
    TF.geometricBounds = NEWTFBOUNDS;
    NEWTFBOUNDS[0] -= 1;
    TF.geometricBounds = NEWTFBOUNDS;
}

function setRulerUnits(rulerUnits){
    myDoc.viewPreferences.horizontalMeasurementUnits = rulerUnits[0];
    myDoc.viewPreferences.verticalMeasurementUnits   = rulerUnits[0];
}

function styleFrame(Settings, frame){
    frame.endCap       = EndCap.ROUND_END_CAP;
    frame.endJoin      = EndJoin.ROUND_END_JOIN;
    frame.fillColor    = Settings.fillColor;
    frame.fillTint     = randomInRange(Settings.fillTint[0],Settings.fillTint[1]);
    frame.strokeTint   = randomInRange(Settings.strokeTint[0],Settings.strokeTint[1]);
    frame.strokeWeight = Settings.strokeWeight;
    frame.strokeColor  = Settings.strokeColor;
}

function removeIndents(textFrame){
    textFrame.texts[0].leftIndent = 0;
    textFrame.texts[0].rightIndent = 0;
}
