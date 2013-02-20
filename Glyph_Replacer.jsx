//////////////////////////////////////////////////////////////////////////////////////////////////
//
//	Glyph_Replacer.jsx
//	A InDesign javascript to place photoletters in InDesign
//	
//	Bruno Herfst 2013
//
//  This script needs a folder containing psd files (glyphs)
//	that carry the unicode decimal number, for example: 65.psd (Capital A)
//	You can find all decibel codepoints here: http://unicodelookup.com/
//	
//	Every font folder needs at least the unicode replacement character:
//	65533.psd (REPLACEMENT CHARACTER) which will be used when a character is not found in the fontfolder.
//
//  Wishlist:
//  Add alternates with PS layers
//  Add CSV kern table
//
//////////////////////////////////////////////////////////////////////////////////////////////////

#target InDesign;

//presets
var preset = {	minRes 			: 300,	 	//int,		dpi
				warning 		: true,		//Boolean,	set to false to not get warnings about resolution
				Hscale 			: 100,      //float,	Horizontal scale (percent 100% is no scaling)
				Vscale 			: 100,      //float,	Vertical scale (percent 100% is no scaling)
				multiply 		: true };	//Boolean,	Use the width of the selected frame as max width, creating linebreaks.


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
	myFont = {	folder 		: null ,
				fontExt		: ".psd",
				charStr 	: tf.contents,
				glyphSrt 	: null,
				nullFile 	: null };

	if(!loadSettings()){
		myFont.folder = new Folder().selectDlg ("Where is the font folder?");
		myFont.folder = myFont.folder.absoluteURI + "/";
	} else {
		//check if still is a valid font otherwise show dialog
		//alert(myFont.folder);
	}

	if (myFont.folder != null) {
		var nullPath = myFont.folder + "65533" + myFont.fontExt;
		myFont.nullFile = new File(nullPath);

		if(myFont.nullFile.exists){
			if(myFont.charStr != null && myFont.charStr.length > 0){

				//REBUILD THIS WINDOW WITH HELP OF COVERBUILDER
				var myDialog = app.dialogs.add({name:"Glyph Replacer"});
				with(myDialog.dialogColumns.add()){
					with(dialogRows.add()){
						var FontList = ["Font:","Load other..."];
						var fontDrop = dropdowns.add({stringList:FontList, selectedIndex:0});
					}
					with(dialogRows.add()){
						staticTexts.add({staticLabel:"Horizontal Scale:\t"});
						var hScale_Field = percentEditboxes.add({editValue:preset.Hscale});
					}
					with(dialogRows.add()){
						staticTexts.add({staticLabel:"Vertical Scale:\t"});
						var vScale_Field = percentEditboxes.add({editValue:preset.Vscale});
					}
					with(dialogRows.add()){
						var multiply_Checkbox = checkboxControls.add({staticLabel:"Set glyphs to multiply", checkedState:preset.multiply});
					}
					with(dialogRows.add()){
						var warn_Checkbox = checkboxControls.add({staticLabel:"Warn if below: ", checkedState:preset.warning});
						var dpi_Field = integerEditboxes.add({editValue:preset.minRes});
						staticTexts.add({staticLabel:"DPI"});
					}
				}
				FontList.onChange = function () {
						this.selectedIndex = 0;
					}
				var myResult = myDialog.show();

				if(myResult == true){
					//update settings
					preset.multiply = multiply_Checkbox.checkedState;
					preset.Hscale   = hScale_Field.editValue;
					preset.Vscale   = vScale_Field.editValue;
					preset.warning  = warn_Checkbox.checkedState;
					preset.minRes 	= dpi_Field.editValue;
					//Now let’s safe the values in the Doc
					safeSettings();
					main();
				}
			}
		} else {
			alert("Not a valid font!\nCan't find Unicode Character 'REPLACEMENT CHARACTER' (65533)");
			exit();
		}
	} else {
		//user cancelled
	}
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
		preset.minRes   = parseInt(  myDocXMP.getProperty(destNamespace,destContName + "[1]")  );
		preset.warning  = (  myDocXMP.getProperty(destNamespace,destContName + "[2]") == "true"  );
		preset.Hscale   = parseFloat(  myDocXMP.getProperty(destNamespace,destContName + "[3]")  );
		preset.Vscale   = parseFloat(  myDocXMP.getProperty(destNamespace,destContName + "[4]")  );
		preset.multiply = (  myDocXMP.getProperty(destNamespace,destContName + "[5]") == "true"  );
		return true;
	} else {
		return false;
	}
}

function between(x, min, max) {
  return x >= min && x <= max;
}

function buildGlyphString(myFont){
	var glyphs = new Array();
	for (var i = myFont.charStr.length - 1; i >= 0; i--) {
		var charCode = myFont.charStr.charCodeAt(i);
		var glyph = {	charcode 	: charCode ,									// codepoint
						img 		: myFont.folder + charCode + myFont.fontExt }; 	// link to glyph file
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
			var gfile 		= new File(myFont.glyphSrt[i].img);	
			if(!gfile.exists){
				gfile 		= myFont.nullFile;
				fffound 	= false;
			}
			
			var glyphPLace	= tf.insertionPoints[0].place(gfile);
			var glyphImg 	= glyphPLace[0];
			var glyphFrame 	= glyphImg.parent;
			
			glyphFrame.label = myFont.glyphSrt[i].charcode.toString();
			if(preset.Hscale != 100 || preset.Vscale != 100){
				glyphFrame.horizontalScale = preset.Hscale;
				glyphFrame.verticalScale = preset.Vscale;
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
	if(preset.warning && !fffound){
	 	alert("Some glyphs could not be found.");
	}
}

//EOF

