//////////////////////////////////////////////////////////////////////////////////////////////////
//
//    Glyph_Replacer.jsx
//    A InDesign javascript to place photoletters in InDesign
//    
//    Bruno Herfst 2013
//
//    This script needs a folder containing psd files (glyphs)
//    that carry the unicode decimal number, for example: 65.psd (Capital A)
//    You can find all decibel codepoints here: http://unicodelookup.com/
//    
//    Every font folder needs at least the unicode replacement character:
//    65533.psd (REPLACEMENT CHARACTER) which will be used when a character is not found in the fontfolder.
//
//    Wishlist:
//    Add CSV kern table//    Let the user start from insertion point too
//    Add alternates with PS layers
//
//////////////////////////////////////////////////////////////////////////////////////////////////

#target InDesign;

//presets
var preset = {  minRes    : 300,      //int,      dpi
                warning   : true,     //Boolean,  set to false to not get warnings about resolution
                Hscale    : 100,      //float,    Horizontal scale (percent 100% is no scaling)
                Vscale    : 100,      //float,    Vertical scale (percent 100% is no scaling)
                multiply  : true };   //Boolean,  Use the width of the selected frame as max width, creating linebreaks.


//Make certain that user interaction (display of dialogs, etc.) is turned on.
app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;    
if (app.documents.length != 0){
    // Global variables
    var myDoc = app.activeDocument, myFont = undefined, tf = undefined;
    var myDocXMP = myDoc.metadataPreferences;
    var destNamespace = "http://brunoherfst.com/";
    var destContName = "Settings";

    if (app.selection.length == 1){
        switch (app.selection[0].constructor.name){
            //add case for insertion point
            case "TextFrame":
                tf = app.selection[0];
                showDialog();
                break;
            default:
                alert("Select a textframe and try again.");
                break;
        }
    } else {
        alert("Select a textframe and try again.");
    }
} else {
    alert("No documents are open. Please open a document, select some text, and try again.");
}


///////////////////////////////////////////////// F U N C T I O N S /////////////////////////////////////////////////

function showDialog(){
    //before we continue see if we can find last used settings
    //if so we can see if the folder is still valid
    myFont = {  folder    : null ,
                fontExt   : ".psd",
                charStr   : tf.contents,
                glyphSrt  : null,
                nullFile  : null, };

    if(!loadSettings()){
        loadFont();
    }

    if(myFont.charStr != null && myFont.charStr.length > 0){

        ////////////
        // DIALOG //
        ////////////
        var column1 = 120;
        var column2 = 60;
        var s = 10;

        var myWindow = new Window ("dialog", "Glyph Replacer");
            myWindow.alignChildren =  "left";
            myWindow.spacing = s; //design

        var fontGroup = myWindow.add ("group");
            var myFontName = getFontName(myFont.folder);
            var presetFont = fontGroup.add ("dropdownlist", undefined, [ myFontName,"Load different font..."]);
                presetFont.selection = 0;
                presetFont.preferredSize.width = column1+column2+s; //design
                presetFont.onChange  = function () {
                    if(this.selection > 0){
                        if(!loadFont()){
                            myWindow.close();
                        }
                        presetFont.selection = 0;
                        presetFont.selection.text = getFontName(myFont.folder);
                    }
                }

        var HscaleGroup = myWindow.add ("group");
            var ST1 = HscaleGroup.add ("statictext", undefined, "Horizontal Scale:");
                ST1.preferredSize.width = column1; //design
            var Hscale = HscaleGroup.add ("edittext", undefined, preset.Hscale+"%");
                   Hscale.preferredSize.width = column2; //design
                   Hscale.onChange = function () {
                   this.text = NaN20(parseFloat(this.text))+"%";
                }

            var VscaleGroup = myWindow.add ("group");
            var ST2 = VscaleGroup.add ("statictext", undefined, "Vertical Scale:");
                ST2.preferredSize.width = column1; //design
            var Vscale = VscaleGroup.add ("edittext", undefined, preset.Vscale+"%");
                   Vscale.preferredSize.width = column2; //design
                   Vscale.onChange = function () {
                   this.text = NaN20(parseFloat(this.text))+"%";
                }

            var multiplyGroup = myWindow.add ("group");
            var multiplyCB = multiplyGroup.add ("checkbox", undefined, "Set glyphs to multiply");
                multiplyCB.value = preset.multiply;

        var warnGroup = myWindow.add ("group");
            var warnCB = warnGroup.add ("checkbox", undefined, "Warn if below:");
                warnCB.preferredSize.width = column1; //design
                warnCB.value = preset.warning; //design
            var dpiET = warnGroup.add ("edittext", undefined, preset.minRes+"DPI");
                dpiET.preferredSize.width = column2; //design
                dpiET.onChange = function () {
                   this.text = NaN20(parseInt(this.text))+"DPI";
                }

           var butGroup = myWindow.add ("group");
               var cancelBut = butGroup.add ("button", undefined, "Cancel");
                   cancelBut.preferredSize.width = ((column1+column2)/2); //design
               var okBut = butGroup.add ("button", undefined, "OK");
                   okBut.preferredSize.width = ((column1+column2)/2); //design

        var myResult = myWindow.show();

        if(myResult == true){
            //update settings
            preset.Hscale   = NaN20(parseFloat(Hscale.text));
            preset.Vscale   = NaN20(parseFloat(Vscale.text));
            preset.minRes     = NaN20(parseInt(dpiET.text));
            preset.multiply = multiplyCB.value;
            preset.warning  = warnCB.value;
            
            safeSettings();
            
            //now do it!
            main();
        }
    }
}

function loadFont(){
    myFont.folder = new Folder().selectDlg ("Where is the font folder?");
    if (myFont.folder != null) {
        myFont.folder = myFont.folder.absoluteURI + "/";
    }
    return checkFont(true);
}

function checkFont(warn){
    var nullPath = myFont.folder + "65533" + myFont.fontExt;
    myFont.nullFile = new File(nullPath);
    if(myFont.nullFile.exists){
        return true;
    }
    if(warn){
        alert("Not a valid font!\nCan't find Unicode Character 'REPLACEMENT CHARACTER' (65533)");
    }
    return false;
}

function getFontName(path){
    var FNreg = new RegExp("[^/]+(?=\\/$)","gi");
    return FNreg.exec( path );
}

function main(){
     myFont.glyphSrt = buildGlyphString(myFont);
    replaceGlyphs(myFont);    
}

function safeSettings(){
    var myXML = new XML("<x:xmpmeta xmlns:x=\"adobe:ns:meta/\"><rdf:RDF xmlns:rdf=\"http://www.w3.org/1999/02/22-rdf-syntax-ns#\"><rdf:Description xmlns:GlyphReplacer=\"http://brunoherfst.com/\"><GlyphReplacer:contact>mail@brunoherfst.com</GlyphReplacer:contact></rdf:Description></rdf:RDF></x:xmpmeta>");
    var myXMLfile = File('TEMP_XMP.xml');
    if ( myXMLfile.open('e') ){
        myXMLfile.write(myXML);
        myXMLfile.close();
        myDoc.metadataPreferences.append(myXMLfile);
        myXMLfile.remove();
    }
    myDocXMP.createContainerItem(destNamespace, destContName, undefined, ContainerType.BAG);
    myDocXMP.setProperty(destNamespace, destContName + "[1]", String(preset.minRes));
    myDocXMP.setProperty(destNamespace, destContName + "[2]", String(preset.warning));
    myDocXMP.setProperty(destNamespace, destContName + "[3]", String(preset.Hscale));
    myDocXMP.setProperty(destNamespace, destContName + "[4]", String(preset.Vscale));
    myDocXMP.setProperty(destNamespace, destContName + "[5]", String(preset.multiply));
    myDocXMP.setProperty(destNamespace, destContName + "[6]", String(myFont.folder));
}

function loadSettings(){
    myFont.folder       = myDocXMP.getProperty(destNamespace,destContName + "[6]");
    if(myFont.folder   != ""){
        preset.minRes   = parseInt(  myDocXMP.getProperty(destNamespace,destContName  + "[1]")  );
        preset.warning  = (  myDocXMP.getProperty(destNamespace,destContName + "[2]") == "true"  );
        preset.Hscale   = parseFloat(  myDocXMP.getProperty(destNamespace,destContName + "[3]")  );
        preset.Vscale   = parseFloat(  myDocXMP.getProperty(destNamespace,destContName + "[4]")  );
        preset.multiply = (  myDocXMP.getProperty(destNamespace,destContName + "[5]") == "true"  );
        return checkFont(false);
    } else {
        return false;
    }
}

function between(x, min, max) {
    return x >= min && x <= max;
}

function NaN20(no){
    if(isNaN(no)){
        return 0;
    } else {
        return no;
    }
}

function buildGlyphString(myFont){
    var glyphs = new Array();
    for (var i = myFont.charStr.length - 1; i >= 0; i--) {
        var charCode = myFont.charStr.charCodeAt(i);
        var glyph = { charcode : charCode ,                                    // codepoint
                      img      : myFont.folder + charCode + myFont.fontExt };  // link to glyph file
        glyphs.push(glyph);
    };
    return glyphs;
}

function replaceGlyphs(myFont){
    //empty the frame
    tf.contents = "";

    var lowres = false, fffound = true;

    for (var i = 0; i < myFont.glyphSrt.length; i++) {
        //Don’t replace controle characters with pictures
        if(!between(myFont.glyphSrt[i].charcode, 0, 31)){
            var gfile   = new File(myFont.glyphSrt[i].img);    
            if(!gfile.exists){
                gfile   = myFont.nullFile;
                fffound = false;
            }
            
            var glyphPLace   = tf.insertionPoints[0].place(gfile);
            var glyphImg     = glyphPLace[0];
            var glyphFrame   = glyphImg.parent;
            
            glyphFrame.label  = myFont.glyphSrt[i].charcode.toString();
            if(preset.Hscale != 100 || preset.Vscale != 100){
                glyphFrame.horizontalScale = preset.Hscale;
                glyphFrame.verticalScale   = preset.Vscale;
            }
            if(preset.multiply){
                glyphFrame.transparencySettings.blendingSettings.blendMode = BlendMode.MULTIPLY;
            }
            if(glyphImg.actualPpi[0] < preset.minRes || glyphImg.actualPpi[1] < preset.minRes ){
                lowres  = true;
            }    
        } else {
            tf.insertionPoints[0].contents = String.fromCharCode(myFont.glyphSrt[i].charcode);
        }
    };

    if(preset.warning && lowres){
        alert("Some glyphs are low resolution\n< "+preset.minRes);
    }
    if(!fffound){
         alert("Some glyphs could not be found.");
    }
}

//EOF

