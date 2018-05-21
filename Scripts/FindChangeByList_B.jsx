//FindChangeByList_B.jsx
//An InDesign JavaScript

// Adjusted by Bruno Herfst (2016) 
// 1. Now it can check out and in placed incopy content
// 2. Reads different preset files
// 3. Shows progressbar for the harder queries and bigger docs

// Still to do, change preview mode so screen gets updated properly and queries can run quicker


/*  
@@@BUILDINFO@@@ "FindChangeByList.jsx" 3.0.0 15 December 2009
*/
//Loads a series of tab-delimited strings from a text file, then performs a series
//of find/change operations based on the strings read from the file.
//
//The data file is tab-delimited, with carriage returns separating records.
//
//The format of each record in the file is:
//findType<tab>findProperties<tab>changeProperties<tab>findChangeOptions<tab>description
//
//Where:
//<tab> is a tab character
//findType is "text", "grep", or "glyph" (this sets the type of find/change operation to use).
//findProperties is a properties record (as text) of the find preferences.
//changeProperties is a properties record (as text) of the change preferences.
//findChangeOptions is a properties record (as text) of the find/change options.
//description is a description of the find/change operation
//
//Very simple example:
//text    {findWhat:"--"}    {changeTo:"^_"}    {includeFootnotes:true, includeMasterPages:true, includeHiddenLayers:true, wholeWord:false}    Find all double dashes and replace with an em dash.
//
//More complex example:
//text    {findWhat:"^9^9.^9^9"}    {appliedCharacterStyle:"price"}    {include footnotes:true, include master pages:true, include hidden layers:true, whole word:false}    Find $10.00 to $99.99 and apply the character style "price".
//
//All InDesign search metacharacters are allowed in the "findWhat" and "changeTo" properties for findTextPreferences and changeTextPreferences.
//
//If you enter backslashes in the findWhat property of the findGrepPreferences object, they must be "escaped"
//as shown in the example below:
//
//{findWhat:"\\s+"}
//
//For more on InDesign/InCopy scripting see the documentation included in the Scripting SDK 
//available at http://www.adobe.com/devnet/indesign/sdk.html
//or visit the InDesign Scripting User to User forum at http://www.adobeforums.com
//


//------------------------------
// Start Incopy Manager API
//------------------------------
function InCopyManager(){

    var self = this;

    self.checkedOut = new Array();
    
    self.checkInStory = function(s){
        if(s.lockState === LockStateValues.CHECKED_OUT_STORY) {
            s.recompose();
            s.checkIn();
        }
    }

    self.checkInAllManagedStories = function () {
        // Checks in all stories that where checked out by this manager
        for (var i = 0; i < self.checkedOut.length; i++) {
            self.checkInStory(self.checkedOut[i]);
        }
    }

    self.checkInAllStories = function (doc) {
        // Checks in all stories in given doc
        for (var i = 0; i < doc.stories.length; i++) {
           self.checkInStory(doc.stories[i]);
        }
    }

    self.checkOutStory = function (s){
        // Checks out a single given story
        if(s.lockState === LockStateValues.CHECKED_IN_STORY) {
            try {
                s.checkOut();
            } catch( r ) {
                alert("Someting went wrong when trying to checkout story " + s.id + "\n" + r.description);
                return;
            }
            self.checkedOut.push(s);
        }
    }

    self.checkOutAllStories = function (doc) {
        // Checks out all stories in given doc
        for (var i = 0; i < doc.stories.length; i++) {
           self.checkOutStory(doc.stories[i]);
        }
    }

    self.isStoryLocked = function(s) {
        // Returns Boolen
        switch(s.lockState) {
            case LockStateValues.CHECKED_IN_STORY:
            case LockStateValues.LOCKED_STORY:
            case LockStateValues.MISSING_LOCK_STATE:
            case LockStateValues.MIXED_LOCK_STATE:
                return true;
            default:
                return false; 
        }
    }

} // EO InCopyIO

var InCopyIO = new InCopyManager();

function ProgressBar(/*str*/title, /*uint*/width, /*uint*/height)  
// https://github.com/indiscripts/extendscript/blob/master/scriptui/ProgressBar.jsx
// =========================================================  
// Version 2.beta | 12-Nov-2014  
// -- Keep the message centered --see below the new method this.msg()  
// -- Supports message patterns e.g: "Step %1/100" --see the sample code  
// -- Other minor improvements  
// =========================================================  
{  
    (60<=(width||0))||(width=340);  
    (40<=(height||0))||(height=60);  
  
    var H = 22,  
        Y = (3*height-2*H)>>2,  
        W = new Window('palette', ' '+title, [0,0,width,height]),  
        P = W.add('progressbar', { x:20, y:height>>2, width:width-40, height:12 }, 0,100),  
        T = W.add('statictext' , { x:20, y:Y, width:width, height:H}),  
        __ = function(a,b){ return localize.apply(null,a.concat(b)) };  
  
    this.pattern = ['%1'];  
  
    W.center();  
  
    // ---  
    // API  
    // ---  
     
    this.msg = function(/*str*/s)  
    // ---------------------------------  
    {  
        //s && (T.location = [(width-T.graphics.measureString(s)[0])>>1, Y]);  
        T.text = s;  
    };  
  
    this.show = this.reset = function(/*str*/s, /*uint*/v)  
    // ---------------------------------  
    {  
        if( s && s != localize(s,1,2,3,4,5,6,7,8,9) )  
            {  
            this.pattern[0] = s;  
            s = __(this.pattern, [].slice.call(arguments,2));  
            }  
        else  
            {  
            this.pattern[0] = '%1';  
            }  
         
        P.value = 0;  
        P.maxvalue = v||0;  
        P.visible = !!v;  
  
        this.msg(s);  
        W.show();  
    };  
  
    this.hit = function(x)  
    // ---------------------------------  
    {  
        ++P.value;  
        //('undefined' != typeof x) && this.msg(__(this.pattern, [].slice.call(arguments,0)));  
    };  
  
    this.hide = function()  
    // ---------------------------------  
    {  
        W.hide();  
    };  
     
    this.close = function()  
    // ---------------------------------  
    {  
        W.close();  
    };  
};  

try {
    var files = Folder(myFindFolder() + "/FindChangeSupport/").getFiles();
    var procesFiles = new Array();
    for (var i = 0; i < files.length; i++) {
        var file = files[i];
        if (file instanceof File) {
            // Ignore hidden files and files without .jsinc extensions
            if(file.name.indexOf('.') != 0 || file.name.indexOf('.txt') != -1 ) {
                procesFiles.push({name : decodeURI(file.name.substr(0, file.name.lastIndexOf('.')) || file.name), filePath : file.absoluteURI});
            }
        }
    }
    if(procesFiles.length > 0) {
        main();
    } else {
        alert("Could not find any processing files.");
    }
} catch (error) {
	alert("Error:\n" + error.description);
}

function main(){
    var myObject;
    var somethingSelected = false;

    //Make certain that user interaction (display of dialogs, etc.) is turned on.
    app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
    if(app.documents.length > 0){
        myDisplayDialog();
    }
    else{
        alert("No documents are open. Please open a document and try again.");
    }
}
function myDisplayDialog(){
    var myObject;
    var checkboxes = new Array;
    var myDialog = app.dialogs.add({name:"FindChangeByList B"});

    with(myDialog.dialogColumns.add()){
        with(dialogRows.add()){
            staticTexts.add({staticLabel:"Search Range:"});
        }
        
        var myRangeButtons = radiobuttonGroups.add();
        with(myRangeButtons){
            radiobuttonControls.add({staticLabel:"Active Document", checkedState:true});
            
            if(app.selection.length > 0){
                radiobuttonControls.add({staticLabel:"Selected Story"});

                switch(app.selection[0].constructor.name){
                    case "InsertionPoint":
                    case "Character":
                    case "Word":
                    case "TextStyleRange":
                    case "Line":
                    case "Paragraph":
                    case "TextColumn":
                    case "Text":
                    case "Cell":
                    case "Column":
                    case "Row":
                    case "Table":
                        if(app.selection[0].contents != ""){
                            radiobuttonControls.add({staticLabel:"Selection", checkedState:true});
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }
    with(myDialog.dialogColumns.add()){
        with(dialogRows.add()){
            staticTexts.add({staticLabel:"Queries:"});
        }
            for (var i = 0; i < procesFiles.length; i++) {
                 checkboxes.push( {checkbox: checkboxControls.add({ staticLabel : procesFiles[i].name, checkedState : false }), filePath: procesFiles[i].filePath } );
            }
        
    }

    var myResult = myDialog.show();
    var filePaths = new Array();

    if(myResult == true){
        switch(myRangeButtons.selectedButton){
            case 0:
                myObject = app.activeDocument;
                InCopyIO.checkOutAllStories(myObject);
                break;
            case 1:
                myObject = app.selection[0].parentStory;
                InCopyIO.checkOutStory(myObject);
                break;
            case 2:
                myObject = app.selection[0];
                InCopyIO.checkOutStory(myObject.parentStory);
                break;
        }

        for (var i = 0; i < checkboxes.length; i++) {
            if(checkboxes[i].checkbox.checkedState) {
                filePaths.push(checkboxes[i].filePath);
            }
        }

        myDialog.destroy();
        
        for (var i = 0; i < filePaths.length; i++) {
            myFindChangeByList(myObject, filePaths[i]);   
        }
    } else {
        myDialog.destroy();
    }
}
function myFindChangeByList(myObject, myFindChangeFile){
    var myFindChangeArray, myFindPreferences, myChangePreferences;

    if(myFindChangeFile != null){
        myFindChangeFile = File(myFindChangeFile);
        var myResult = myFindChangeFile.open("r", undefined, undefined);
        if(myResult == true){
            
            // Count the lines to be procesed
            lineLen = 0;
            do{
                myLine = myFindChangeFile.readln();
                if((myLine.substring(0,4)=="text")||(myLine.substring(0,4)=="grep")||(myLine.substring(0,5)=="glyph")){
                    lineLen++;
                }
            } while(myFindChangeFile.eof == false);
            myResult = myFindChangeFile.open("r", undefined, undefined);
            
            var PB = new ProgressBar("Find Change By List",350,100),  
                i, vMax;  

            PB.show("Processing...", vMax=lineLen, i=0); 

            //Loop through the find/change operations.
            do{
                myLine = myFindChangeFile.readln();
                //Ignore comment lines and blank lines.
                if((myLine.substring(0,4)=="text")||(myLine.substring(0,4)=="grep")||(myLine.substring(0,5)=="glyph")){
                    myFindChangeArray = myLine.split("\t");
                    //The first field in the line is the findType string.
                    myFindType = myFindChangeArray[0];
                    //The second field in the line is the FindPreferences string.
                    myFindPreferences = myFindChangeArray[1];
                    //The second field in the line is the ChangePreferences string.
                    myChangePreferences = myFindChangeArray[2];
                    //The fourth field is the range--used only by text find/change.
                    myFindChangeOptions = myFindChangeArray[3];
                    //The fifth field are comments
                    myComments = myFindChangeArray[4];

                    PB.hit(++i);
                    PB.msg(String(myComments));

                    switch(myFindType){
                        case "text":
                            myFindText(myObject, myFindPreferences, myChangePreferences, myFindChangeOptions);
                            break;
                        case "grep":
                            myFindGrep(myObject, myFindPreferences, myChangePreferences, myFindChangeOptions);
                            break;
                        case "glyph":
                            myFindGlyph(myObject, myFindPreferences, myChangePreferences, myFindChangeOptions);
                            break;
                    }
                }
            } while(myFindChangeFile.eof == false);
            PB.close(); 
        }
        InCopyIO.checkInAllManagedStories();
        alert("Done!");
    } else {
        alert("Can't find the FindChangeList.txt");
    }
}
function myFindText(myObject, myFindPreferences, myChangePreferences, myFindChangeOptions){
    //Reset the find/change preferences before each search.
    app.changeTextPreferences = NothingEnum.nothing;
    app.findTextPreferences = NothingEnum.nothing;
    var myString = "app.findTextPreferences.properties = "+ myFindPreferences + ";";
    myString += "app.changeTextPreferences.properties = " + myChangePreferences + ";";
    myString += "app.findChangeTextOptions.properties = " + myFindChangeOptions + ";";
    app.doScript(myString, ScriptLanguage.javascript);
    myFoundItems = myObject.changeText();
    //Reset the find/change preferences after each search.
    app.changeTextPreferences = NothingEnum.nothing;
    app.findTextPreferences = NothingEnum.nothing;
}
function myFindGrep(myObject, myFindPreferences, myChangePreferences, myFindChangeOptions){
    //Reset the find/change grep preferences before each search.
    app.changeGrepPreferences = NothingEnum.nothing;
    app.findGrepPreferences = NothingEnum.nothing;
    var myString = "app.findGrepPreferences.properties = "+ myFindPreferences + ";";
    myString += "app.changeGrepPreferences.properties = " + myChangePreferences + ";";
    myString += "app.findChangeGrepOptions.properties = " + myFindChangeOptions + ";";
    app.doScript(myString, ScriptLanguage.javascript);
    var myFoundItems = myObject.changeGrep();
    //Reset the find/change grep preferences after each search.
    app.changeGrepPreferences = NothingEnum.nothing;
    app.findGrepPreferences = NothingEnum.nothing;
}
function myFindGlyph(myObject, myFindPreferences, myChangePreferences, myFindChangeOptions){
    //Reset the find/change glyph preferences before each search.
    app.changeGlyphPreferences = NothingEnum.nothing;
    app.findGlyphPreferences = NothingEnum.nothing;
    var myString = "app.findGlyphPreferences.properties = "+ myFindPreferences + ";";
    myString += "app.changeGlyphPreferences.properties = " + myChangePreferences + ";";
    myString += "app.findChangeGlyphOptions.properties = " + myFindChangeOptions + ";";
    app.doScript(myString, ScriptLanguage.javascript);
    var myFoundItems = myObject.changeGlyph();
    //Reset the find/change glyph preferences after each search.
    app.changeGlyphPreferences = NothingEnum.nothing;
    app.findGlyphPreferences = NothingEnum.nothing;
}

function myFindFolder(){
    var myScriptFile = myGetScriptPath();
    var myScriptFile = File(myScriptFile);
    var myScriptFolder = myScriptFile.path;
    return myScriptFolder;
}

function myFindFile(myFilePath){
    var myScriptFolder = myFindFolder();
    myFilePath = myScriptFolder + myFilePath;
    if(File(myFilePath).exists == false){
        //Display a dialog.
        myFilePath = File.openDialog("Choose the file containing your find/change list");
    }
    return myFilePath;
}

function myGetScriptPath(){
    try{
        myFile = app.activeScript;
    }
    catch(myError){
        myFile = myError.fileName;
    }
    return myFile;
}

