/*
Text_2_Frame.jsx

An InDesign CS5 Javascript
Bruno Herfst 2010

Move text to an inline frame for further manipulation.
Rotate for example.

*/

#target InDesign;

var Settings = {
    removeIndents         : true,
    textFrameInsetSpacing : 5, // in points
    baselineShift         : 0  // in points
};

if(app.documents.length != 0){
    //global vars
    var myDoc = app.activeDocument;
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
                var quarterPointSize = app.selection[0].pointSize/4;
                
                var story = app.selection[0].parentStory;
                
                var tf = app.selection[0].textFrames.add();
                    tf.textFramePreferences.autoSizingType = AutoSizingTypeEnum.WIDTH_ONLY;
                
                app.selection[0].pointSize
                
                var myBounds = tf.geometricBounds;
                myBounds[2] += app.selection[0].pointSize;
                tf.geometricBounds = myBounds;
                
                app.selection[0].duplicate(LocationOptions.AFTER,tf.insertionPoints[0]);
                
                var seltf = story.characters[(app.selection[0].index - 1)];
                seltf.baselineShift = -(Settings.textFrameInsetSpacing+quarterPointSize) + Settings.baselineShift;
                
                app.selection[0].contents = "";
                
                if(Settings.removeIndents){
                    removeIndents(tf);
                }
                
                tf.textFramePreferences.firstBaselineOffset   = FirstBaseline.X_HEIGHT;
                tf.textFramePreferences.verticalJustification = VerticalJustification.BOTTOM_ALIGN;

                tf.textFramePreferences.insetSpacing = [(Settings.textFrameInsetSpacing+quarterPointSize) + "pt",Settings.textFrameInsetSpacing + "pt",(Settings.textFrameInsetSpacing+quarterPointSize) + "pt",Settings.textFrameInsetSpacing + "pt"];
                
                break;
            default:
                alert("Select some text or a textframe and try again.");
                break;
        }
    } else {
        alert("Select a textframe and try again.");
    }
}

function removeIndents(textFrame){
    textFrame.texts[0].leftIndent = 0;
    textFrame.texts[0].rightIndent = 0;
}