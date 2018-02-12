#targetengine "session"

var selfName = "StyleMaster";
var allowCustomGrep = false;

var Settings = {
    findParaStyle  : "",
    regex          : "^.+",
    useRegex       : false,
    apply_master   : "",
    masterOffset   : 1,
    ignore_masters : ["[None]"],
    replace_master : "",
    liveUpdate     : false
}

var the_document = undefined;

// Helper functions
function updateObj ( Old_Obj, New_Obj ) {
    // This function will try and copy all values
    // from Old_Obj to New_Obj
    for ( var key in New_Obj ) {
        if( Old_Obj.hasOwnProperty(key) ) {
            New_Obj[key] = Old_Obj[key];
        }
    }
    return copy_of( New_Obj );
}

function inArray ( element, arr ) {
    for(var i = arr.length; i--; ) {
        if(arr[i] == element) return true;
    }
    return false;
}

function heroZero(haystack, needle) {
    for (var i = 0; i < haystack.length; i++) {
        if(haystack[i] == needle) return i;
    }
    // Return the first element if nothing is found
    return 0;
}

function loadSettings( Doc, Settings ){
    var tempData = Doc.extractLabel( selfName );
    if( tempData.length > 0 ){
        try {
            tempSettings = eval(tempData);
            tempSettings = updateObj(Settings, tempSettings);
            return tempSettings;
        } catch( r ) {
            return Settings;
        }
    }
    return Settings;
}

function saveSettings ( Doc, Settings) {
    Doc.insertLabel( selfName, String(Settings) );
}

function removeTask( taskName, warnBool ) {
    var warnMsg  = "Could not find idle task " + String(taskName);
    var idleTask = app.idleTasks.itemByName( taskName );
    if (idleTask != null) {
        idleTask.remove();
        warnMsg = "Removed idle task " + idleTask.name;
    }
    if( warnBool ) {
        alert( warnMsg );
    }
}

function runEventHandler( myIdleEvent ) {
    var originalEnableRedraw = app.scriptPreferences.enableRedraw;
    app.scriptPreferences.enableRedraw = false;
    updateMasters( true );
    app.scriptPreferences.enableRedraw = true;
    app.scriptPreferences.enableRedraw = originalEnableRedraw;
}

//--------------------
// T A S K R U N N E R
//--------------------

function updateMasters( headless ) {
    // Headless run of update

    // If document is not valid kill idle task
    if(!the_document.isValid) {
        removeTask( selfName, !headless );
        return false;
    }

    var findParaStyle = NothingEnum.nothing;

    if (Settings.findParaStyle != "") {
        findParaStyle = the_document.paragraphStyles.itemByName( Settings.findParaStyle );
    }

    // Get ref to masters (name is unique)
    if( Settings.apply_master != "" ) {
        var apply_master  = the_document.masterSpreads.itemByName( Settings.apply_master );
    } else {
        var replace_master  = null;
    }

    if( Settings.replace_master != "" ) {
        var replace_master  = the_document.masterSpreads.itemByName( Settings.replace_master );
    } else {
        var replace_master  = null;
    }

    //Find paragraph ^ is buggy in CS5 it will only find the first one, not the next
    if(allowCustomGrep && Settings.useRegex == true && Settings.regex != "" && Settings.regex != "^") {
        var find_what = Settings.regex;
    } else {
        var find_what = "^.+";
    }

    if ( replace_master.isValid ) {
        // Find and replace the pages
        for(var myCounter = 0; myCounter < the_document.pages.length; myCounter++){
            var myPage = the_document.pages.item(myCounter);
            if ( myPage.appliedMaster == apply_master ){
                 myPage.appliedMaster = replace_master;
            }
        }
    }

    // Set find grep preferences to find all paragraphs with the selected paragraph style
    app.findChangeGrepOptions.includeFootnotes            = false;
    app.findChangeGrepOptions.includeHiddenLayers         = false;
    app.findChangeGrepOptions.includeLockedLayersForFind  = false;
    app.findChangeGrepOptions.includeLockedStoriesForFind = false;
    app.findChangeGrepOptions.includeMasterPages          = false;

    app.findGrepPreferences                               = NothingEnum.nothing;
    app.findGrepPreferences.appliedParagraphStyle         = findParaStyle;
    app.findGrepPreferences.findWhat                      = find_what;

    //Search the current story
    var found_paragraphs = the_document.findGrep();
    var myCounter = 0;
    var myMessage = 0;
    var myCounterCounter = 0;
    try {
        if(found_paragraphs.length > 0){
            do {
                // Create an object reference to the found paragraph
                // for use in CS4 change parentPage to parent
                try {
                    var myDocOfset = found_paragraphs[myCounter].insertionPoints[0].parentTextFrames[0].parentPage.documentOffset;    
                } catch( oversetText ) {
                    if(!headless) {
                        throw("There is overset text in the document, please fix and run this script again.");
                    } else {
                        continue;
                    }
                }

                var myPage = the_document.pages[myDocOfset + Settings.masterOffset];
                // make sure page exist
                if(myPage.isValid){
                    var currMaster    = myPage.appliedMaster;
                    var replaceMaster = true;
                    for(var i = 0; i < Settings.ignore_masters.length; i++){
                        if (currMaster == Settings.ignore_masters[i]) replaceMaster = false; 
                    }
                    if(replaceMaster) {
                        myPage.appliedMaster = apply_master;
                    } else {
                        myCounterCounter += 1;
                    }
                } else {
                    myCounterCounter += 1;
                }
                myCounter++;
            } while (myCounter < found_paragraphs.length);
        } else {
            myMessage = "Couldn’t find anything!";
        }
    } catch(err) {
        myMessage = err;
    }

    if(!headless) {
        if(myMessage == 0){
            var myMessage = "Done placing "+(myCounter-myCounterCounter)+" master pages!";
        } else { alert(myMessage) };
    }

}

function show_setup_UI() {
    the_document = app.documents.item(0);
    if(!the_document.isValid) {
        alert("Open a document before running this script");
        return false;
    }

    Settings = loadSettings( the_document, Settings );

    // Create a list of paragraph styles
    var list_of_paragraph_styles = the_document.paragraphStyles.everyItem().name;
    list_of_paragraph_styles.unshift("--ANY STYLE--");

    // Create a list of master pages
    var list_of_master_pages = the_document.masterSpreads.everyItem().name;
    list_of_master_pages.unshift("[None]");

    // Make the dialog box for selecting the paragraph styles
    var the_dialog = app.dialogs.add({name:"Apply Master To Style"});

    with(the_dialog.dialogColumns.add()){
        with(dialogRows.add()){
            staticTexts.add({staticLabel:"Find:"});
            var findParaStyle_drop = dropdowns.add({stringList:list_of_paragraph_styles, selectedIndex:heroZero(list_of_paragraph_styles, Settings.findParaStyle) });
            // A decorative checkbox :)
            if(allowCustomGrep) {
                var myGREPCheckbox = checkboxControls.add({staticLabel:"Custom GREP:", checkedState:Settings.useRegex});
                var myGREPField    = textEditboxes.add({editContents:Settings.regex});
            }
        }
        with(dialogRows.add()){
            staticTexts.add({staticLabel:"Apply "});
            var apply_master_drop = dropdowns.add({stringList:list_of_master_pages, selectedIndex:heroZero(list_of_master_pages, Settings.apply_master)});
            staticTexts.add({staticLabel:" to "});
            var master_offset = dropdowns.add({stringList:["Page Before", "Page", "Page After"], selectedIndex:Settings.masterOffset });
        }
        var myMasterCheckBoxes = new Array();
        with(dialogRows.add()){
            staticTexts.add({staticLabel:"Except when page is using: "});
            with(borderPanels.add()){
                with(dialogColumns.add()){
                    for(i=0;i<list_of_master_pages.length;i++){
                        var masterCheck = false;
                        //alert(list_of_master_pages[i]);
                        if( inArray (list_of_master_pages[i], Settings.ignore_masters) ) masterCheck = true;
                        myMasterCheckBoxes.push( checkboxControls.add({staticLabel:list_of_master_pages[i], checkedState:masterCheck}) );
                    }
                }
            }
        }
        with(dialogRows.add()){
            var myRMCheckbox        = checkboxControls.add({staticLabel:"Replace 'Apply masters' first with:", checkedState:(Settings.replace_master != "")});
            var replace_master_drop = dropdowns.add({stringList:list_of_master_pages, selectedIndex:heroZero(list_of_master_pages, Settings.replace_master)});
        }
        with(dialogRows.add()){
            var myLiveUpdateCheckbox = checkboxControls.add({staticLabel:"Live update", checkedState:(Settings.liveUpdate == true)});
        }
    }

    var myResult = the_dialog.show();

    if(myResult == true){
        // Update Settings
        if (findParaStyle_drop.selectedIndex == 0) {
            Settings.findParaStyle = "";
        } else {
            Settings.findParaStyle = list_of_paragraph_styles[findParaStyle_drop.selectedIndex];
        }

        if(allowCustomGrep) {
            Settings.regex    = myGREPField.editContents;
            Settings.useRegex = myGREPCheckbox.checkedState;
        } else {
            Settings.regex    = "^.+";
            Settings.useRegex = false;
        }
        
        Settings.masterOffset = 0;
        if(master_offset.selectedIndex != 1){
            if(master_offset.selectedIndex > 1){
                // Page After
                Settings.masterOffset = 1;
            } else {
                // Page Before;
                Settings.masterOffset = -1;
            }
        }

        Settings.apply_master   = list_of_master_pages[apply_master_drop.selectedIndex];
        Settings.replace_master = list_of_master_pages[replace_master_drop.selectedIndex];
        Settings.ignore_masters  = [];

        for(var i = 0; i < myMasterCheckBoxes.length; i++){
            if(myMasterCheckBoxes[i].checkedState) {
                Settings.ignore_masters.push(list_of_master_pages[i]);
            }
        }

        Settings.liveUpdate = myLiveUpdateCheckbox.checkedState;

        saveSettings(the_document, Settings);

        return true;

    } else {
        return false;
    }
}

function main() {
    // If task is allready running turn it off
    var runTask = app.idleTasks.itemByName( selfName );
    if (runTask != null) {
        Settings.liveUpdate = true;
        removeTask( selfName, false );
    }
    var OK = show_setup_UI();
    
    if( OK && Settings.liveUpdate ) {
        runTask = app.idleTasks.add({
            name: selfName,
            sleep: 5000
        });
        var runEventListener = runTask.addEventListener("onIdle", runEventHandler, false);
    } else if( OK ) {
        // Run once
        updateMasters( false );
    } else {
        // User pressed cancel
    }
}

try {
    main();       
} catch ( err ) {
    alert( err.message + " (Line " + err.line + " in file " + err.fileName + ")");
}
