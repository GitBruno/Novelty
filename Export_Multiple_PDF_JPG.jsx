// Export_Multiple.jsx
// An InDesign JavaScript

// Bruno Herfst 2010 - 2017

// Export multiple Files
// with support for covers build with coverbuilder

#target indesign;
#targetengine "session";

var version = 1.0;

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// JSON
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
//  json2.js -> json-es.js
//  2016-10-28
//  Public Domain.
//  NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
//  See http://www.JSON.org/js.html

//  This is a reference implementation. You are free to copy, modify, or
//  redistribute.

//   Adjusted by Bruno Herfst 2017
//   1. Make it run in ExtendScript
//   2. Add JSON.clone() function
//   3. Add JSON.saveFile() function
//   4. Add JSON.openFile() function
//   5. Add JSON.ask2Safe() function

// Create a JSON object only if one does not already exist. We create the
// methods in a closure to avoid creating global variables.

if (typeof JSON !== "object") {
    JSON = {};
}

(function () {
    "use strict";

    var rx_one = /^[\],:{}\s]*$/;
    var rx_two = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g;
    var rx_three = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g;
    var rx_four = /(?:^|:|,)(?:\s*\[)+/g;
    var rx_escapable = /[\\"\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
    var rx_dangerous = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10
            ? "0" + n
            : n;
    }

    function this_value() {
        return this.valueOf();
    }

    if (typeof Date.prototype.toJSON !== "function") {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear() + "-" +
                        f(this.getUTCMonth() + 1) + "-" +
                        f(this.getUTCDate()) + "T" +
                        f(this.getUTCHours()) + ":" +
                        f(this.getUTCMinutes()) + ":" +
                        f(this.getUTCSeconds()) + "Z"
                : null;
        };

        Boolean.prototype.toJSON = this_value;
        Number.prototype.toJSON = this_value;
        String.prototype.toJSON = this_value;
    }

    var gap;
    var indent;
    var meta;
    var rep;


    function quote(string) {

// If the string contains no control characters, no quote characters, and no
// backslash characters, then we can safely slap some quotes around it.
// Otherwise we must also replace the offending characters with safe escape
// sequences.

        rx_escapable.lastIndex = 0;
        return rx_escapable.test(string)
            ? "\"" + string.replace(rx_escapable, function (a) {
                var c = meta[a];
                return typeof c === "string"
                    ? c
                    : "\\u" + ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
            }) + "\""
            : "\"" + string + "\"";
    }


    function str(key, holder) {

// Produce a string from holder[key].

        var i;          // The loop counter.
        var k;          // The member key.
        var v;          // The member value.
        var length;
        var mind = gap;
        var partial;
        var value = holder[key];

// If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === "object" &&
                typeof value.toJSON === "function") {
            value = value.toJSON(key);
        }

// If we were called with a replacer function, then call the replacer to
// obtain a replacement value.

        if (typeof rep === "function") {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case "string":
            return quote(value);

        case "number":

// JSON numbers must be finite. Encode non-finite numbers as null.

            return isFinite(value)
                ? String(value)
                : "null";

        case "boolean":
        case "null":

// If the value is a boolean or null, convert it to a string. Note:
// typeof null does not produce "null". The case is included here in
// the remote chance that this gets fixed someday.

            return String(value);

// If the type is "object", we might be dealing with an object or an array or
// null.

        case "object":

// Due to a specification blunder in ECMAScript, typeof null is "object",
// so watch out for that case.

            if (!value) {
                return "null";
            }

// Make an array to hold the partial results of stringifying this object value.

            gap += indent;
            partial = [];

// Is the value an array?

            if (Object.prototype.toString.apply(value) === "[object Array]") {

// The value is an array. Stringify every element. Use null as a placeholder
// for non-JSON values.

                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || "null";
                }

// Join all of the elements together, separated with commas, and wrap them in
// brackets.

                v = partial.length === 0
                    ? "[]"
                    : gap
                        ? "[\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "]"
                        : "[" + partial.join(",") + "]";
                gap = mind;
                return v;
            }

// If the replacer is an array, use it to select the members to be stringified.

            if (rep && typeof rep === "object") {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === "string") {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            } else {

// Otherwise, iterate through all of the keys in the object.

                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (
                                gap
                                    ? ": "
                                    : ":"
                            ) + v);
                        }
                    }
                }
            }

// Join all of the member texts together, separated with commas,
// and wrap them in braces.

            v = partial.length === 0
                ? "{}"
                : gap
                    ? "{\n" + gap + partial.join(",\n" + gap) + "\n" + mind + "}"
                    : "{" + partial.join(",") + "}";
            gap = mind;
            return v;
        }
    }

// If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== "function") {
        meta = {    // table of character substitutions
            "\b": "\\b",
            "\t": "\\t",
            "\n": "\\n",
            "\f": "\\f",
            "\r": "\\r",
            "\"": "\\\"",
            "\\": "\\\\"
        };
        JSON.stringify = function (value, replacer, space) {

// The stringify method takes a value and an optional replacer, and an optional
// space parameter, and returns a JSON text. The replacer can be a function
// that can replace values, or an array of strings that will select the keys.
// A default replacer method can be provided. Use of the space parameter can
// produce text that is more easily readable.

            var i;
            gap = "";
            indent = "";

// If the space parameter is a number, make an indent string containing that
// many spaces.

            if (typeof space === "number") {
                for (i = 0; i < space; i += 1) {
                    indent += " ";
                }

// If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === "string") {
                indent = space;
            }

// If there is a replacer, it must be a function or an array.
// Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== "function" &&
                    (typeof replacer !== "object" ||
                    typeof replacer.length !== "number")) {
                throw new Error("JSON.stringify");
            }

// Make a fake root object containing our value under the key of "".
// Return the result of stringifying the value.

            return str("", {"": value});
        };
    }


// If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== "function") {
        JSON.parse = function (text, reviver) {

// The parse method takes a text and an optional reviver function, and returns
// a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

// The walk method is used to recursively walk the resulting structure so
// that modifications can be made.

                var k;
                var v;
                var value = holder[key];
                if (value && typeof value === "object") {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


// Parsing happens in four stages. In the first stage, we replace certain
// Unicode characters with escape sequences. JavaScript handles many characters
// incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            rx_dangerous.lastIndex = 0;
            if (rx_dangerous.test(text)) {
                text = text.replace(rx_dangerous, function (a) {
                    return "\\u" +
                            ("0000" + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

// In the second stage, we run the text against regular expressions that look
// for non-JSON patterns. We are especially concerned with "()" and "new"
// because they can cause invocation, and "=" because it can cause mutation.
// But just to be safe, we want to reject all unexpected forms.

// We split the second stage into 4 regexp operations in order to work around
// crippling inefficiencies in IE's and Safari's regexp engines. First we
// replace the JSON backslash pairs with "@" (a non-JSON character). Second, we
// replace all simple value tokens with "]" characters. Third, we delete all
// open brackets that follow a colon or comma or that begin the text. Finally,
// we look to see that the remaining characters are only whitespace or "]" or
// "," or ":" or "{" or "}". If that is so, then the text is safe for eval.

            if (
                rx_one.test(
                    text
                        .replace(rx_two, "@")
                        .replace(rx_three, "]")
                        .replace(rx_four, "")
                )
            ) {

// In the third stage we use the eval function to compile the text into a
// JavaScript structure. The "{" operator is subject to a syntactic ambiguity
// in JavaScript: it can begin a block or an object literal. We wrap the text
// in parens to eliminate the ambiguity.

                j = eval("(" + text + ")");

// In the optional fourth stage, we recursively walk the new structure, passing
// each name/value pair to a reviver function for possible transformation.

                return (typeof reviver === "function")
                    ? walk({"": j}, "")
                    : j;
            }

// If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError("JSON.parse");
        };
    };

    if (typeof JSON.clone !== "function") {

// The clone method takes a JSON object and returns a clone of the JSON object.

        JSON.clone = function ( value ) {
            if (typeof value === undefined) {
                return undefined;
            }
            return JSON.parse(JSON.stringify(value));
        }
    };

    if (typeof JSON.saveFile !== "function") {

// The saveFile method takes an ExtendScript File object and any instance and saves it the the given File.

        JSON.saveFile = function (File, Obj){
            var objStr = JSON.stringify(Obj);
            File.open('w');
            var ok = File.write(objStr);
            if (ok) {
                ok = File.close();
            }
            if (!ok) {
                alert("JSON: Error saving file. \n" + File.error);
                File.close();
            }
            return Obj;
        }
    };

    if (typeof JSON.openFile !== "function") {

// The saveFile method takes an ExtendScript File object and any instance and saves it the the given File.

        JSON.openFile = function (File){
            var obj = {};
            if(File !== false){
                File.open('r');
                content = File.read();
                obj = JSON.parse(content);
                File.close();
            }else{
                alert("JSON: Could not open file."); // if something went wrong
            }
            return obj;
        }
    };

    if (typeof JSON.ask2Safe !== "function") {

// The ask2Safe method is similar to saveFile method. Except that it will ask the user first

        JSON.ask2Safe = function (question, File, Obj){
            var save = confirm(question);
            if(save){
                JSON.saveFile(File, Obj);
            }
            return save;
        }
    };

}());

// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -


function stripFileName(myString){
    s = myString.replace(/[:\\\/\*\?\"\'<>|]/g,"");
    return s;
}

function seperate(myFileName,extension) {
    if (extension == true){
        return myFileName.replace(/^.*\./,'');
    } else {
        return myFileName.replace(/.[^.]+$/,'');
    }
}

function pageExists( Doc, label ) {
    for (var i=0; Doc.pages.length > i; i++){
        if(Doc.pages[i].label === label){
            return true;
        }
    }
    return false;
}

function getExportRangeByLabel( Doc, label){
    var pagerange = "";
    for (var i=0; Doc.pages.length > i; i++){
        if(Doc.pages[i].label === label){
            pagerange += Doc.pages[i].name + ",";
        }
    }
    if (pagerange.length > 0) {
        pagerange = pagerange.substring(0, pagerange.length - 1);
        return pagerange;
    } else {
        alert("Could not find any pages with label: " + label);
        return "All";
    }
}

function getExportRange( Doc, rangeName ) {
    switch ( rangeName ) {
        case "All Spreads":
        case "All Pages":
            return "All";
            break;
        case "Current Spread":
        case "Current Spread as Pages":
            mySpread = app.activeWindow.activeSpread;
            var myPages = mySpread.pages;
            return myPages[0].name + "-" + myPages[-1].name;
            break;
        case "Spine":
            return getExportRangeByLabel(Doc, "Spine");
            break;
        case "Current Page":
            return app.activeWindow.activePage.name;
            break;
        case "Front Cover":
            return getExportRangeByLabel(Doc, "CVRR");
            break;
        case "Back Cover":
            return getExportRangeByLabel(Doc, "CVRL");
            break;
        default:
            alert("Could not parse page range for: " + rangeName );
            return "All";
            break;
    }
}

function getIndexFloor(arr, val) {
    for (var i = 0; i < arr.length; i++) {
        if(arr[i] === val) return i;
    }
    return 0; // Return the first element if nothing is found
}

function export_jpg( Doc, Preset ){
    // Set Preferences
    app.jpegExportPreferences.antiAlias                   = true;
    app.jpegExportPreferences.embedColorProfile           = true;
    app.jpegExportPreferences.jpegColorSpace              = JpegColorSpaceEnum.RGB;
    app.jpegExportPreferences.jpegRenderingStyle          = JPEGOptionsFormat.BASELINE_ENCODING;
    app.jpegExportPreferences.simulateOverprint           = true;
    app.jpegExportPreferences.useDocumentBleeds           = false;

    switch ( Preset.presetName.replace(/[0-9]/g,'').replace(/ /g,'') ) {
        case "Max":
            app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.MAXIMUM;
            break;
        case "High":
            app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.HIGH;
            break;
        case "Medium":
            app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.MEDIUM;
            break;
        case "Low":
            app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.LOW;
            break;
        default:
            alert("Could not parse quality");
            app.jpegExportPreferences.jpegQuality = JPEGOptionsQuality.HIGH;
            break;
    }

    app.jpegExportPreferences.exportResolution = parseInt(Preset.presetName.replace(/[^0-9]/g, ''));

    // Page Range
    var pageRange = getExportRange( Doc, Preset.rangeName );
    if(pageRange === "All") {
        app.jpegExportPreferences.jpegExportRange = ExportRangeOrAllPages.EXPORT_ALL;
    } else {
        app.jpegExportPreferences.jpegExportRange = ExportRangeOrAllPages.EXPORT_RANGE;
        app.jpegExportPreferences.pageString      = pageRange;
    }

    // Spreads
    app.jpegExportPreferences.exportingSpread = Preset.exportSpreads;

    // Document Name
    var SP = "P_"; // Spread or Page
    if( Preset.exportSpreads ){
        SP = "S_";
    }

    var documentNameAddon = "_"+app.jpegExportPreferences.exportResolution+"DPI["+SP+pageRange+"]";

    var myFilePath = Preset.folder + "/" + Preset.documentName + documentNameAddon + ".jpg";
    var myFile = new File(myFilePath);
    Doc.exportFile(ExportFormat.JPG, myFile, false);
}


function export_pdf( Doc, Preset ) {
    // We need to duplicate the preset so we can make the nececairy changes (Export Spreads)
    var exportPreset = app.pdfExportPresets.item(Preset.presetName).duplicate();
    exportPreset.exportReaderSpreads = Preset.exportSpreads;

    // Page Range
    var pageRange = getExportRange( Doc, Preset.rangeName );
    app.pdfExportPreferences.pageRange = pageRange;

    // Document Name
    var SP = "P_"; // Spread or Page
    if( Preset.exportSpreads ){
        SP = "S_";
    }

    var documentNameAddon = "_["+SP+pageRange+"]";

    var myFilePath = Preset.folder + "/" + Preset.documentName + documentNameAddon + ".pdf";
    var myFile = new File(myFilePath);
    Doc.exportFile(ExportFormat.PDF_TYPE, myFile, false, exportPreset );
    exportPreset.remove();
}

function export_Doc( Doc, withPresets ){
    //get the export location
    var myFolder = Folder.selectDialog ("Choose a Folder to save files");
    if(myFolder != null){
        for(var i=0; i<withPresets.length; i++){
            var Preset = withPresets[i];
                Preset.documentName = seperate(Doc.name, false);
                Preset.folder       = myFolder;
            if(Preset.type === 'PDF') {
                export_pdf( Doc, Preset )
            } else if (Preset.type === 'JPG') {
                export_jpg( Doc, Preset );
            }
        }
        alert("Done");
    }
}

function export_UI( Doc, presetData ) {

    function add_group( given_group, preset ) { 
        var group = given_group.panel.add( "panel");
            group.orientation = "row";
            group.alignChildren = "top";

        group.typePresets_drop = group.add("dropDownList",[0,0,50,25], presetData.exportTypes);
        group.typePresets_drop.selection = 0;

        group.pdfPresets_drop = group.add("dropDownList",[0,0,200,25], presetData.pdfPresetNames);
        group.pdfPresets_drop.selection = 0;

        group.page_range_drop = group.add("dropDownList",[0,0,150,25], presetData.pageRangeNames);
        group.page_range_drop.selection = 0;

        group.typePresets_drop.onChange = function() {
            var pdfPresets = this.parent.children[1];
                pdfPresets.removeAll();

            if(this.selection == 1) {
                for (var i = 0; i < presetData.jpgPresetNames.length; i++) { 
                    pdfPresets.add("item", presetData.jpgPresetNames[i]);
                }
                pdfPresets.selection = 6;
            } else {
                for (var i = 0; i < presetData.pdfPresetNames.length; i++) { 
                    pdfPresets.add("item", presetData.pdfPresetNames[i]);
                }
                pdfPresets.selection = 0;
            }
        }

        group.getData = function(){
            var Data = new Object();
            var isSpreadRange = function ( rangeName ) {
                switch ( rangeName ) {
                    case "All Spreads":
                    case "Current Spread":
                        return true;
                        break;
                    case "Spine":
                    case "All Pages":
                    case "Current Spread as Pages":
                    case "Current Page":
                    case "Front Cover":
                    case "Back Cover":
                    case "Spine":
                        return false;
                        break;
                    default:
                        alert("Could not parse rangeName: " + rangeName );
                        return false;
                        break;
                }
            };
            Data.version       = version;
            Data.type          = String( group.typePresets_drop.selection );
            Data.presetName    = String( group.pdfPresets_drop.selection  );
            Data.rangeName     = String( group.page_range_drop.selection  );
            Data.exportSpreads = isSpreadRange( Data.rangeName );
            Data.exportRange   = getExportRange(Doc, Data.rangeName);
            return Data;
        }

        // End with Plus and Minus Buttons
        group.index = given_group.panel.children.length - 1;
        group.plus = group.add("button", undefined, "+");
        group.plus.margins = 0;
        group.plus.characters = 1;
        group.plus.preferredSize = [25,25];
        group.plus.onClick = function(){
            add_group( given_group, this.parent.getData() );
        }
        group.minus = group.add("button", undefined, "-");
        group.minus.margins = 0;
        group.minus.characters = 1;
        group.minus.preferredSize = [25,25];
        group.minus.onClick = minus_btn( given_group ); 
        
        // INIT
        if( preset !== undefined) {
            var presetNames = presetData.jpgPresetNames;
            if(preset.type === 0) {
                presetNames = presetData.pdfPresetNames
            }
            group.typePresets_drop.selection = getIndexFloor( presetData.exportTypes,    preset.type        );
            group.pdfPresets_drop.selection  = getIndexFloor( presetNames,               preset.presetName  );
            group.page_range_drop.selection  = getIndexFloor( presetData.pageRangeNames, preset.rangeName   );
        }

        win.layout.layout( true ); 

        return group; 
    }

    function add_btn( given_group ) {
        return function () {
            return add_group( given_group, given_group.getData() );
        }
    }

    function minus_btn ( given_group ) {
        return function () {   
            var ix = this.parent.index;
            if(ix == 0 && given_group.panel.children.length == 1) {
                // Don't remove the last one
            } else {
                given_group.panel.remove( given_group.panel.children[ix] );    
            }
            // update indexes
            for(var i = 0; i < given_group.panel.children.length; i++){
                given_group.panel.children[i].index = i;
            }
            win.layout.layout( true );
        }
    }

    function create_group(location, groupName){
        // param location: InDesign UI Window, panels or group
        // param group name (string): e.g: "panel" or "group"
        var newGroup                     = new Object();
            newGroup.panel               = location.add(groupName);
            newGroup.panel.orientation   = "column";
            newGroup.panel.alignChildren = "left";
            newGroup.add_btn             = add_btn(newGroup, 0);
            newGroup.minus_btn           = minus_btn(newGroup);
        return newGroup;
    }

    var win = new Window("palette", "Export Multiple");
        win.orientation = "column";
        win.alignChildren = "left";
        win.margins = 15;
    
    var contentGroup = win.add("group");
        contentGroup.orientation = "row";
        contentGroup.alignChildren = "top";

    var exportGroup  = create_group(contentGroup, "group");
    var buttonGroup  = create_group(contentGroup, "group");

    var ok_but     = buttonGroup.panel.add ("button", [0,0,100,25], "OK");
    var new_but    = buttonGroup.panel.add ("button", [0,0,100,25], "PDF Presets");
    var cancel_but = buttonGroup.panel.add ("button", [0,0,100,25], "Cancel");

    ok_but.onClick = function () {
        var withPresets = new Array();
        var len = contentGroup.children[0].children.length;
        for(var i = 0; i < len; i++){
            var ui_group = contentGroup.children[0].children[i];
            withPresets.push(ui_group.getData());
        }

        // Save settings in doc
        Doc.insertLabel( "Export_Multiple", JSON.stringify(withPresets) );
        
        win.close();
        export_Doc( Doc, withPresets );
    };

    new_but.onClick = function () {
        // Define PDF Export Presets...
        app.menuActions.itemByID(9474).invoke();
    };

    cancel_but.onClick = function () {
        win.close();
    };

    // INIT
    //--------

    var tempData = Doc.extractLabel( "Export_Multiple" );
    if( tempData.length > 0 ){
        try {
            tempPresets = eval(tempData);
            if( tempPresets.length > 0) {
                for(var i = 0; i < tempPresets.length; i++){
                    add_group( exportGroup, tempPresets[i] );
                }
            } else  {
                add_group( exportGroup ); // At least one, otherwise there is nothing to export
            }
        } catch( error ) {
            add_group( exportGroup ); // At least one, otherwise there is nothing to export
        }
    } else {
        add_group( exportGroup ); // At least one, otherwise there is nothing to export
    }

    win.show();
}

function Export_Multiple() {
    var Doc = app.documents.item(0); // Active Document
    if(!Doc.isValid) {
        alert("Open a document before running this script.");
        return;
    }

    var presetData = new Object();
        presetData.exportTypes    = ["PDF","JPG"];
        presetData.pageRangeNames = ["All Spreads", "All Pages", "Current Spread", "Current Spread as Pages", "Current Page"];
        presetData.jpgPresetNames = ["Max 1200","Max 600","Max 300","Max 100", "High 1200","High 600","High 300","High 100","High 72","Medium 300","Medium 100","Medium 72","Low 300","Low 100","Low 72"];
        presetData.pdfPresetNames = app.pdfExportPresets.everyItem().name;

    if(presetData.pdfPresetNames.length <= 0) {
        alert("Failed to locate PDF presets.");
        return;
    }

    // Let's see if we can add specific cover elements
    // Front Cover, Spine, Back Cover
    if( pageExists( Doc, "CVRR" ) ) {
       presetData.pageRangeNames.push('Front Cover'); 
    }
    if( pageExists( Doc, "Spine" ) ) {
       presetData.pageRangeNames.push('Spine'); 
    }
    if( pageExists( Doc, "CVRL" ) ) {
       presetData.pageRangeNames.push('Back Cover'); 
    }

    export_UI( Doc, presetData );
}

try {
    Export_Multiple();
} catch(err) {
    alert( err.description );
}

