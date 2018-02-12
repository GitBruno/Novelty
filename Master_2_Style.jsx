/*
    
    Master_2_Style.jsx
    Bruno Herfst 2010 - 2017

    Version 2.0
    // 27.02.17 // Added master exceptions
    // 10.04.17 // Added save last used settings in doc
                // And remove custom grep options for simplicity

    An InDesign script to apply the selected master-page 
    to any page that contains the searchresult.

    Tested in CS6

*/

#target indesign;

var settingsLabel = "Master_2_Style";
var allowCustomGrep = false;

var settings = {
    findParaStyle  : "",
    regex          : "^.+",
    useRegex       : false,
    apply_Master   : "",
    masterOffset   : 1,
    ignoreMasters  : ["[None]"],
    replace_Master : ""
}

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

function loadSettings( the_document, settings ){
    var tempData = the_document.extractLabel( settingsLabel );
    if( tempData.length > 0 ){
        try {
            tempSettings = eval(tempData);
            tempSettings = updateObj(settings, tempSettings);
            return tempSettings;
        } catch( r ) {
            return settings;
        }
    }
    return settings;
}

function saveSettings ( the_document, settings) {
    the_document.insertLabel( settingsLabel, String(settings) );
}

function main() {
    var the_document = app.documents.item(0);
    if(!the_document.isValid) {
        alert("Open a document before running this script");
        return;
    }

    settings = loadSettings( the_document, settings );

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
            var findParaStyle_drop = dropdowns.add({stringList:list_of_paragraph_styles, selectedIndex:heroZero(list_of_paragraph_styles, settings.findParaStyle) });
            // A decorative checkbox :)
            if(allowCustomGrep) {
                var myGREPCheckbox = checkboxControls.add({staticLabel:"Custom GREP:", checkedState:settings.useRegex});
                var myGREPField    = textEditboxes.add({editContents:settings.regex});
            }
        }
        with(dialogRows.add()){
            staticTexts.add({staticLabel:"Apply "});
            var apply_master_drop = dropdowns.add({stringList:list_of_master_pages, selectedIndex:heroZero(list_of_master_pages, settings.apply_Master)});
            staticTexts.add({staticLabel:" to "});
            var master_offset = dropdowns.add({stringList:["Page Before", "Page", "Page After"], selectedIndex:settings.masterOffset });
        }
        var myMasterCheckBoxes = new Array();
        with(dialogRows.add()){
            staticTexts.add({staticLabel:"Except when page is using: "});
            with(borderPanels.add()){
                with(dialogColumns.add()){
                    for(i=0;i<list_of_master_pages.length;i++){
                        var masterCheck = false;
                        //alert(list_of_master_pages[i]);
                        if( inArray (list_of_master_pages[i], settings.ignoreMasters ) ) masterCheck = true;
                        myMasterCheckBoxes.push( checkboxControls.add({staticLabel:list_of_master_pages[i], checkedState:masterCheck}) );
                    }
                }
            }
        }
        with(dialogRows.add()){
            var myRMCheckbox        = checkboxControls.add({staticLabel:"Replace 'Apply masters' first with", checkedState:(settings.replace_Master != "")});
            var replace_master_drop = dropdowns.add({stringList:list_of_master_pages, selectedIndex:heroZero(list_of_master_pages, settings.replace_Master)});
        }
    }

    var myResult = the_dialog.show();

    if(myResult == true){
        var newSettings = new Object();

        // Define variables
        if (findParaStyle_drop.selectedIndex == 0) {
            newSettings.findParaStyle = "";
            var findParaStyle = NothingEnum.nothing;
        } else {
            newSettings.findParaStyle = list_of_paragraph_styles[findParaStyle_drop.selectedIndex];
            var findParaStyle = the_document.paragraphStyles.item(findParaStyle_drop.selectedIndex-1);
        }

        if(allowCustomGrep) {
            newSettings.regex    = myGREPField.editContents;
            newSettings.useRegex = myGREPCheckbox.checkedState;
        } else {
            newSettings.regex    = "^.+";
            newSettings.useRegex = false;
        }
        
        newSettings.masterOffset = 0;
        if(master_offset.selectedIndex != 1){
            if(master_offset.selectedIndex > 1){
                // Page After
                newSettings.masterOffset = 1;
            } else {
                // Page Before;
                newSettings.masterOffset = -1;
            }
        }

        newSettings.apply_Master   = list_of_master_pages[apply_master_drop.selectedIndex];
        newSettings.replace_Master = list_of_master_pages[replace_master_drop.selectedIndex];

        var apply_master_drop_i  = apply_master_drop.selectedIndex-1;
        var replace_master_drop_i = replace_master_drop.selectedIndex-1;

        if(apply_master_drop_i >= 0) {
            var apply_master  = the_document.masterSpreads.item( apply_master_drop_i );
        } else {
            var apply_master  = null;
        }

        if(replace_master_drop_i >= 0) {
            var replace_master  = the_document.masterSpreads.item( replace_master_drop_i );
        } else {
            var replace_master  = null;
        }

        newSettings.ignoreMasters  = [];

        var ignore_masters  = new Array();
        for(var i = 0; i < myMasterCheckBoxes.length; i++){
            if(myMasterCheckBoxes[i].checkedState) {
                newSettings.ignoreMasters.push(list_of_master_pages[i]);
                if(i-1 >= 0) {
                    ignore_masters.push( the_document.masterSpreads.item(i-1) );
                } else {
                    ignore_masters.push( null );
                }
            }
        }


        saveSettings(the_document, newSettings);

        var myRM   = myRMCheckbox.checkedState;
        
        //Find paragraph ^ is buggy in CS5 it will only find the first one not the next
        if(allowCustomGrep && newSettings.useRegex == true && newSettings.regex != "" && newSettings.regex != "^") {
            var find_what = newSettings.regex;
        } else {
            var find_what = "^.+";
        }

        if (myRM == true) {
            // Find and replace the pages
            for(var myCounter = 0; myCounter < the_document.pages.length; myCounter++){
                myPage = the_document.pages.item(myCounter);
                if (myPage.appliedMaster == apply_master){
                    myPage.appliedMaster = replace_master;
                }
            }
        }
        

        // Set find grep preferences to find all paragraphs with the selected paragraph style
        app.findChangeGrepOptions.includeFootnotes = false;
        app.findChangeGrepOptions.includeHiddenLayers = false;
        app.findChangeGrepOptions.includeLockedLayersForFind = false;
        app.findChangeGrepOptions.includeLockedStoriesForFind = false;
        app.findChangeGrepOptions.includeMasterPages = false;
        
        app.findGrepPreferences = NothingEnum.nothing;
        app.findGrepPreferences.appliedParagraphStyle = findParaStyle;
        app.findGrepPreferences.findWhat = find_what;
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
                        throw("There is overset text in the document, please fix and run this script again.");
                    }
                    var myPage     = the_document.pages[myDocOfset + newSettings.masterOffset];
                    // make sure page exist
                    if(myPage.isValid){
                        var currMaster    = myPage.appliedMaster;
                        var replaceMaster = true;
                        for(var i = 0; i < ignore_masters.length; i++){
                            if (currMaster == ignore_masters[i]) replaceMaster = false;
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
        if(myMessage == 0){
            var myMessage = "Done placing "+(myCounter-myCounterCounter)+" master pages!";
        }
        
        alert(myMessage);

    } else {
        exit();
    }
}

main();

