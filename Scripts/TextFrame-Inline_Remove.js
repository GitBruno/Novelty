// Remove in-line textFrames
// Bruno Herfst 2018

function removeInlineTextFrame( inFrame ) {
    if(inFrame.constructor.name !== "TextFrame" || inFrame.parent.constructor.name !== "Character") {
        return false;
    };
    inFrame.parentStory.paragraphs.everyItem().duplicate(LocationOptions.BEFORE, inFrame.parent.insertionPoints[0]);
    inFrame.remove();
    return true;
};

function removeInlineTextFrames( selection ) {
    // Does selection contain textFrames
    var i = selection.textFrames.length;
    if( i != 0 ) {
        // Selection contains textFrame
        while( i-- ){ // Recurse
            removeInlineTextFrames( selection.textFrames[i] );
        };
    };
    // Check if selection itself is a textFrame
    if(selection.constructor.name === "TextFrame") {
        removeInlineTextFrame( selection );
    };
};

function main() {
    if (app.selection.length == 1){
        switch (app.selection[0].constructor.name){
            case "Text":
            case "TextStyleRange":
            case "TextColumn":
            case "Paragraph":
                app.selection[0].textFrames;
                break;
            case "TextFrame":
                removeInlineTextFrames( app.selection[0] );
                break;
            default:
                alert("This is a "+ app.selection[0].constructor.name +"\nSelect some text or a textFrame and try again.");
                break;
        };
    } else {
        alert("Please select a single Text or textFrame");
    };
};

if(app.documents.length != 0){
    //global vars
    try {
      // Run script with single undo if supported
      if (parseFloat(app.version) < 6) {
        main();
      } else {
        app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Expand State Abbreviations");
      };
      // Error reporting
    } catch ( error ) {
      alert("Oops, something went wrong:\n" + error + " (Line " + error.line + " in file " + error.fileName + ")");
    };
}else{
    alert("Please open a document and try again.");
};