/*

    Letter_Jitter.jsx
    Version 1.0

    Bruno Herfst 2017–2018

    This script sets every character between two values

    NOTES:
    1. Add presets
    2. Add separate color Characters/Words option

*/

#target InDesign
var doneAlert = false;

var myDoc, AllSettings, Settings, colorCounter;

//global variables
AllSettings = {
    Foodpedia_receipe : {
        name                 : "Foodpedia Receipe",
        doCharacters         : true,
        doWords              : true,
        v_center             : true,
        resetBaseline        : true,
        addCharSize          : [-1,1],
        addWordSize          : [0,2],
        addCharBaselineShift : [0,0],
        addWordBaselineShift : [0,0],
        paragraphStyle       : "[None]",
        characterStyle       : "[None]",
        useColor             : false,
        colorGroup           : "[None]",
        colorLoop            : "Random"
    },
    Meerkat_Splash_C : {
        name                 : "Foodpedia Receipe",
        doCharacters         : false,
        doWords              : true,
        v_center             : true,
        resetBaseline        : true,
        addCharSize          : [0,0],
        addWordSize          : [0,3],
        addCharBaselineShift : [0,0],
        addWordBaselineShift : [0,0],
        paragraphStyle       : "[None]",
        characterStyle       : "[None]",
        useColor             : true,
        colorGroup           : "p rand",
        colorLoop            : "Random"
    }
};

Settings = AllSettings.Meerkat_Splash_C;
colorCounter = 0;

//Make certain that user interaction (display of dialogs, etc.) is turned on.
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
// Single undo and error includes line number
if (app.documents.length != 0) {
    try {
      // Run script with single undo if supported
      if (parseFloat(app.version) < 6) {
        main();
      } else {
        app.doScript(main, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Expand State Abbreviations");
      };
    } catch ( error ) {
      alert( error + " (Line " + error.line + " in file " + error.fileName + ")");
    };
} else {
    alert("Open a document first before running this script.");
};

//============================================== FUNCTIONS =====================================================
function main(){
    myDoc = app.activeDocument;

    // Create a list of paragraph styles
    var list_of_All_paragraph_styles = myDoc.paragraphStyles.everyItem().name;
    list_of_All_paragraph_styles.unshift("[Any paragraph style]");
    // Create a list of character styles
    var list_of_All_character_styles = myDoc.characterStyles.everyItem().name;
    list_of_All_character_styles.unshift("[Any character style]");
    // Create a list of color groups.
    var list_of_All_color_groups = myDoc.colorGroups.everyItem().name;
    list_of_All_color_groups.unshift("[None]");
    // Create a list of color loop directions.
    var list_of_All_color_loops = ["Loop","Random"];
    // Create a list of locations
    var list_of_All_locations = ["Current Document"];

    // Let's see if there is text selected so we can set the UI already to the right spot.
    var paraSelection, charSelection = undefined;
    if(app.selection.length != 0){
        mS = myDoc.selection[0];
        if(mS.constructor.name == "Text" ||
           mS.constructor.name == "Word" ||
           mS.constructor.name == "Line" ||
           mS.constructor.name == "Character"  ||
           mS.constructor.name == "Paragraph"  ||
           mS.constructor.name == "TextColumn" ||
           mS.constructor.name == "TextStyleRange" ){
            //see what paragraph style the selection is
            paraSelection = mS.appliedParagraphStyle.name;
            charSelection = mS.appliedCharacterStyle.name;
            list_of_All_locations.unshift("Parent Story");
            list_of_All_locations.unshift("Selected Text");
        } else if (mS.constructor.name == "TextFrame"){
            list_of_All_locations.unshift("Parent Story");
        } else {
            // No need to add any find locations
            // alert(mS.constructor.name);
        }
    }

    // Make the dialog box for selecting the paragraph styles
    var dlg = app.dialogs.add({name:"Letter Jitter"});
    with(dlg.dialogColumns.add()){

        with(dialogRows.add()){
            with(dialogColumns.add()){
                var find_locations = dropdowns.add({stringList:list_of_All_locations, selectedIndex:0});
                var find_paragraph = dropdowns.add({stringList:list_of_All_paragraph_styles, selectedIndex:0});
                //find_paragraph.selectedIndex = getIndex(paraSelection,list_of_All_paragraph_styles);
                var find_charStyle = dropdowns.add({stringList:list_of_All_character_styles, selectedIndex:0});
                //find_charStyle.selectedIndex = getIndex(charSelection,list_of_All_character_styles);
            }
        }
        staticTexts.add({staticLabel:""}); // Add some space to UI

        with(dialogRows.add()){
            with(dialogColumns.add()){
                var c = checkboxControls.add({ staticLabel : 'Set Characters:\t', checkedState : Settings.doCharacters });
                with(dialogRows.add()){
                    var charSizeMin = measurementEditboxes.add({editUnits: MeasurementUnits.POINTS,editValue:Settings.addCharSize[0]});
                    staticTexts.add({staticLabel:"Min Offset"});
                };
                with(dialogRows.add()){
                    var charSizeMax = measurementEditboxes.add({editUnits:MeasurementUnits.POINTS,editValue:Settings.addCharSize[1]});
                    staticTexts.add({staticLabel:"Max Offset"});
                };
            };
            with(dialogColumns.add()){
                var w = checkboxControls.add({ staticLabel : 'Set Words:\t', checkedState : Settings.doWords });
                with(dialogRows.add()){
                    var wordSizeMin = measurementEditboxes.add({editUnits: MeasurementUnits.POINTS,editValue:Settings.addWordSize[0]});
                    staticTexts.add({staticLabel:"Min Offset"});
                };
                with(dialogRows.add()){
                    var wordSizeMax = measurementEditboxes.add({editUnits:MeasurementUnits.POINTS,editValue:Settings.addWordSize[1]});
                    staticTexts.add({staticLabel:"Max Offset"});
                };
            };
        };

        with(dialogRows.add()){
            with(dialogColumns.add()){
                with(dialogRows.add()){
                    staticTexts.add({staticLabel:"Use colors"});
                    var colorSelection = dropdowns.add({stringList:list_of_All_color_groups, selectedIndex:0}); 
                    colorSelection.selectedIndex = getIndex(Settings.colorGroup,list_of_All_color_groups);
                    staticTexts.add({staticLabel:": "});
                    var colorLoop      = dropdowns.add({stringList:list_of_All_color_loops, selectedIndex:0});
                    colorLoop.selectedIndex = getIndex(Settings.colorLoop,list_of_All_color_loops);
                };
                var myReset = checkboxControls.add({ staticLabel : 'Reset baseline', checkedState : Settings.v_center });
                var myCent  = checkboxControls.add({ staticLabel : 'Center baseline offset', checkedState : Settings.v_center });
            };
        };
    };

    //show dialog
    if(dlg.show() == true){
        //get dialog data
        Settings.doCharacters   = c.checkedState;
        Settings.doWords        = w.checkedState;
        Settings.resetBaseline  = myReset.checkedState;
        Settings.v_center       = myCent.checkedState;
        Settings.addCharSize[0] = charSizeMin.editValue;
        Settings.addCharSize[1] = charSizeMax.editValue;
        Settings.addWordSize[0] = wordSizeMin.editValue;
        Settings.addWordSize[1] = wordSizeMax.editValue;
        Settings.location       = find_locations.stringList[find_locations.selectedIndex];
        Settings.colorGroup     = colorSelection.stringList[colorSelection.selectedIndex];
        Settings.colorLoop      = colorLoop.stringList[colorLoop.selectedIndex];
        Settings.useColor       = (colorSelection.selectedIndex !== 0)? true : false;

        // Set selected styles
        if (find_paragraph.selectedIndex == 0) {
            Settings.paragraphStyle = false;
        } else {
            Settings.paragraphStyle = myDoc.paragraphStyles.item(find_paragraph.selectedIndex-1);
        };
        if (find_charStyle.selectedIndex == 0) {
            Settings.characterStyle = false;
        } else {
            Settings.characterStyle = myDoc.characterStyles.item(find_charStyle.selectedIndex-1);
        };

        if(Settings.doCharacters == false && Settings.doWords == false){
            alert("Did you meant to press cancel?");
            exit();
        };

        app.findChangeGrepOptions.includeFootnotes            = false;
        app.findChangeGrepOptions.includeHiddenLayers         = false;
        app.findChangeGrepOptions.includeLockedLayersForFind  = false;
        app.findChangeGrepOptions.includeLockedStoriesForFind = false;
        app.findChangeGrepOptions.includeMasterPages          = false;

        // reset grep preferences first
        app.findGrepPreferences = NothingEnum.nothing;

        if(Settings.paragraphStyle == false && Settings.characterStyle == false){
            app.findGrepPreferences.findWhat = ".+";
        } else {
            app.findGrepPreferences.findWhat = NothingEnum.nothing;
        };

        if(Settings.paragraphStyle == false){
            app.findGrepPreferences.appliedParagraphStyle = NothingEnum.nothing;
        } else {
            //this can throw an error if multi-find/change plugin is open
            app.findGrepPreferences.appliedParagraphStyle = Settings.paragraphStyle;
        };

        if(Settings.characterStyle == false){
            app.findGrepPreferences.appliedCharacterStyle = NothingEnum.nothing;
        } else {
            //this can throw an error if multi-find/change plugin is open
            app.findGrepPreferences.appliedCharacterStyle = Settings.characterStyle;
        };

        //Search
        switch(Settings.location){
            case "Current Document":
                var found_text = myDoc.findGrep();
                break;
            case "Parent Story":
                var found_text = myDoc.selection[0].parentStory.findGrep();
                break;
            case "Selected Text":
                var found_text = myDoc.selection[0].findGrep();
                break;
            default:
                alert("Something went wrong \nLocation unknown");
                exit();
        }

        if(found_text.length < 1){
            alert("Couldn't find anything!");
            exit();
        }

        var myCounter = 0;
        var myMessage = false;
        do {
            try {
                setCharOrWord(found_text[myCounter], Settings);
            } catch(err) {
                myMessage = err;
            }
            myCounter++;
        } while (myCounter < found_text.length);

        if(myMessage == false){
            var myMessage = "Done!";
        }
        if(doneAlert){
            alert(myMessage);
        };
        //the end
        dlg.destroy();
    } else {
        //cancel
    };
};

//-------------------------------------------------------------------------------------------------------------
function setCharOrWord( fText, Settings ){
    if(Settings.doWords) {
        setText(fText.words, Settings);
    };
    if(Settings.doCharacters) {
        setText(fText.characters, Settings);
    };
};

function setText( mySection, Settings ){
    var swatchGroup, swatchLen;
    if(Settings.useColor){
        swatchGroup = myDoc.colorGroups.itemByName(Settings.colorGroup).colorGroupSwatches;
        swatchLen   = swatchGroup.length;
    };

    var len = mySection.length;
    for (var i=0; i < len; i++){
        try{
            var myText = mySection[i];
            var mySizeAdjust = 0;

            if(Settings.doWords) {
                if( (Math.abs(Settings.addWordSize[0]) + Math.abs(Settings.addWordSize[1])) > 0 ) {
                    mySizeAdjust = randomInRange( Settings.addWordSize[0], Settings.addWordSize[1] );
                    myText.pointSize += mySizeAdjust;
                };
            };

            if(Settings.doCharacters) {
                if( (Math.abs(Settings.addCharSize[0]) + Math.abs(Settings.addCharSize[1])) > 0 ) {
                    mySizeAdjust = randomInRange( Settings.addCharSize[0], Settings.addCharSize[1] );
                    myText.pointSize += mySizeAdjust;
                };
            };

            if(Settings.resetBaseline){
                myText.baselineShift = 0;
            };
            if(Settings.v_center && mySizeAdjust != 0) {
                myText.baselineShift -= mySizeAdjust * 0.25; // Works OK with general x-height variable
                // We can calculate this properly by getting x-height from font see: ParagraphStyle_GetSet_xHeight.jsx
            };

            if(Settings.useColor){
                if(Settings.colorLoop === "Loop"){
                    colorCounter++;
                    myText.fillColor = swatchGroup[colorCounter%swatchLen].swatchItemRef;
                } else {
                    myText.fillColor = swatchGroup[Math.floor(randomInRange( 0, swatchLen ))].swatchItemRef;
                };
            };

        } catch( error ) {
            alert( error + " (Line " + error.line + " in file " + error.fileName + ")");
            break;
        };
    }
}

function getIndex( item, array) {
    var count=array.length;
    for(var index=0;index<count;index++) {
        if(array[index]===item){return index;}
    }
    return 0;
}

function randomInRange( start, end ) {
       return Math.random() * (end - start) + start;
}
