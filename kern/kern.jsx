//DESCRIPTION: Apply kerning
// Peter Kahrel -- www.kahrel.plus.com

//#target indesign;

if (parseInt (app.version) > 4 && app.documents.length > 0){
	main();
}

function main()
	{
	ResetDialog = SetFCDialog();
	var kernfolder = get_folder() + '/kern_';
	var logfile = File (app.activeDocument.fullName.path+"/kern_log.txt");
	try {logfile.remove()}catch(_){};
    var MissingKernFiles = "";
	var scope = UserInput();
    if (scope instanceof Story || scope instanceof Document)
		{
        MissingKernFiles = KernDocument (scope, kernfolder, logfile);
		}
    else
        {
        for (var i = 0; i < scope.length; i++)
            {
            MissingKernFiles += KernDocument (scope[i], kernfolder, logfile);
            }
        }
	ResetDialog();
    //if (MissingKernFiles !== "")
		//Report (MissingKernFiles);
		//logfile.execute();
    } // main

//=================================================================

function KernDocument (doc, kernfolder, logfile)
	{
	var mess = create_message (doc.name, 40); mess.show()
	// Collect the names of the typefaces used in the document
	var doc_fonts = document_fonts (doc);
	// Keep track of font-family names for which there isn't a data file
	var no_file = "";
	// Process each typeface
	for (var i = 0; i < doc_fonts.length; i++)
		{
		// Read the kerning data from each data file
		var kern_data = get_kern_data (kernfolder + doc_fonts[i] + '.txt');
		// If there isn't a file for a given font, "" is returned
		if (kern_data != "")
			{
			// Split the data in a file into style sections
			var kern_sections = kern_data.split ('===');
			// Process each section
			for (var j = 1; j < kern_sections.length; j++)
				kern (doc, kern_sections[j], mess, doc_fonts[i]);
			}
		else
			{
			no_file += doc_fonts[i] + '\r';
			}
		}
	mess.close();
//~     if (no_file != "")
//~         no_file = doc.name+"\r"+no_file+"================================\r";
    return no_file;
//~ 	WriteMissingFonts (doc, no_file, logfile);
	}


// End =============================================================


function kern (doc, section, mess, font)
	{
	// From each section we create a two-element object:
	// k.style is the font style,
	// k.pairs is an array of character pairs/kerning values
	// Each kern.pair is still one line: characters, tab, value
	var k = disect (section);
	// See if we can split k.style on a tab. If we can, i.e.
	// if styles.length > 1, then we have two style names, which requires
	// different action
	var font_styles = k.style.split ('\t');
	// Simple case, just one style
	if (font_styles.length == 1)
		kern_same_style (doc, k.style, k.pairs, mess, font);
	else
		// Two styles or style and position
		kern_different_styles (doc, font_styles, k.pairs, mess, font);
	}

//------------------------------------------------------------------

function kern_same_style (doc, style, pairs, mess, font)
	{
	app.findGrepPreferences = null;
	if (style == "ANY_FONT")
		{
		app.findGrepPreferences.appliedFont = null;
		app.findGrepPreferences.fontStyle = "";
		}
	else
		{
		app.findGrepPreferences.appliedFont = font;
		app.findGrepPreferences.fontStyle = style;
		}
	for (var i = 0; i < pairs.length; i++)
		{
		var temp = pairs[i].split ('\t');
		same_style (doc, temp[0], temp[1], mess)
		}
	}


function same_style (doc, srch, kv, mess)
	{
	mess.txt.text = srch;
	app.findGrepPreferences.findWhat = srch;
	var pairs = doc.findGrep ();
	for (var i = 0; i < pairs.length; i++)
		try
        {
        if (kv.toLowerCase() == "m")
            pairs[i].insertionPoints[1].kerningMethod = "$ID/Metrics";
        else
            pairs[i].insertionPoints[1].kerningValue = Number (kv)
        }
		catch (_){}
	}


//------------------------------------------------------------------

function kern_different_styles (doc, style_array, pairs, mess, font)
	{
	app.findGrepPreferences = app.changeGrepPreferences = null;
	app.findGrepPreferences.appliedFont = font;
	// First we need to find out what exactly the 'styles' are.
	// Could be any font style (Regular, Italics) or a position (super- or subscript)
	var style_1 = get_style (style_array[0]);
	var style_2 = get_style (style_array[1]);
	for (var i = 0; i < pairs.length; i++)
		{
		// split 'pairs' into the pair to be kerned and a kern value
		var temp = pairs[i].split ('\t');
		diff_styles (doc, temp[0], temp[1], style_1, style_2, mess)
		}
	}

function get_style (s)
	{
	switch (s.toLowerCase())
		{
		case "super": return "position == Position.superscript";
		case "otsuper": return "position == Position.otSuperscript";
		case "sub": return "position == Position.subscript";
		case "otsub": return "position == Position.otSubscript";
		case "otnum": return "position == Position.otNumerator";
		case "otdenom": return "position == Position.otDenominator";
		case "position_normal": return "position == Position.normal";
		case "proportional_lining": return "otfFigureStyle == OTFFigureStyle.proportionalLining";
		case "proportional_oldstyle": return "otfFigureStyle == OTFFigureStyle.proportionalOldstyle";
		case "tabular_lining": return "otfFigureStyle == OTFFigureStyle.tabularLining";
		case "tabular_oldstyle": return "otfFigureStyle == OTFFigureStyle.tabularOldstyle";
		case "smallcaps": return "capitalization == Capitalization.smallCaps";
		case "otsmallcaps": return "capitalization == Capitalization.capToSmallCap";
		case "allcaps": return "capitalization == Capitalization.allCaps";
		case "normalcaps": return "capitalization == Capitalization.normal";
		default: return 'fontStyle == "' + s + '"';
		}
	}


function diff_styles (doc, srch, kv, style1, style2, mess)
	{
	mess.txt.text = srch;
	app.findGrepPreferences.findWhat = srch;
	var ch_pairs = doc.findGrep ();
	for (var i = ch_pairs.length-1; i > -1; i--)
		if (eval ('ch_pairs[i].characters[0].' + style1) && eval ('ch_pairs[i].characters[1].' + style2))
        {
			try
            {
            if (kv.toLowerCase() == "m")
                ch_pairs[i].insertionPoints[1].kerningMethod = "$ID/Metrics";
            else
                ch_pairs[i].insertionPoints[1].kerningValue = Number (kv)
            }
				catch(_){}
        }
	}


//------------------------------------------------------------------

/*	A section looks like this:

	Regular
	[-\\x{2013}]T	-100
	T[-\\x{2013}]	-135
	/A	-90,/Z	20
	[-\\x{2013}]A	-40
	
	Return a two-element object: the fontstyle and an array of pairs
*/


function disect (s)
	{
	// remove any trailing returns
	s = s.replace (/[\r\n]+$/, "");
	var array = s.split ('\n');
	var stylename = array[0];
	// remove section heading from array
	array.shift();
	return {style: stylename, pairs: array}
	}

//------------------------------------------------------------------
//	Return a list of font-family names with their font styles.

function document_fonts (doc)
	{
	if (doc instanceof Story){
		var f = doc.parent.fonts.everyItem().fontFamily;
	} else {
		var f = doc.fonts.everyItem().fontFamily;
	}
	// There could be multiple instances, so remove duplicates
	return remove_duplicates (f)
	}

function remove_duplicates (array)
	{
	var str = array.join('\r')+'\r';
	str = str.replace(/([^\r]+\r)(\1)+/g,'$1');
	str = str.replace(/\r$/,'');
	return str.split('\r')
	}

// File handlers for kern-data files ===============================

function get_folder ()
	{
	// First try if kern_folder.txt exists in the script folder
	var scriptfolder = script_dir();
	var f = File (scriptfolder + '/kern_folder.txt');
	if (f.exists)
		{
		// if found, open it
		f.open ('r', undefined, undefined);
		var dir = f.readln();
		f.close();
		// check the format of what's there
		dir = check_dir_format (dir);
		// and check if that folder exists
		if (!Folder(dir).exists)
			{
			alert ('The folder ' + dir + ' listed in\rkern_folder.txt does not exist.');
			exit ();
			}
		// it does, return it
		return dir;
		}
	else
		// there's no file "kern_folder.txt" in the script folder,
		// so return the script folder itself
		return scriptfolder;
	}

// read the contents of a kern-data file
function get_kern_data (f)
	{
	var temp = "";
	var f = new File (f);
	if (f.exists)
		{
		f.open ('r');
		f.encoding = 'UTF-8';
		var temp = f.read();
		f.close ();
		return clean_data (temp);
		}
	else
		return "";
	}

// return the script directory
function script_dir()
	{
	try {return File (app.activeScript).path}
        catch (e) {return File (e.fileName).path}
//~     return app.scriptPreferences.scriptsFolder;
	}


// There must be a slash at the beginning,
// there must not be a slash at the end

function check_dir_format (dir)
	{
	dir = dir.replace (/^([^\/])/, '/$1');
	dir = dir.replace (/\/$/, "");
	return dir
	}

function clean_data (s)
	{
	// delete comments
	s = s.replace (/^---.+$/gm, "");
	// delete sequences of tabs and spaces
	s = s.replace (/\t\t+/g, '\t');
	s = s.replace (/  +/g, ' ');
	// delete trailing tabs and spaces
	s = s.replace (/[ \t]+$/gm, "");
	// delete empty lines
	s = s.replace (/[\r\n][\r\n]+/g, '\n');
	return s
	}


function WriteMissingFonts (doc, missing, logfile)
	{
	logfile.open ("e"); logfile.seek(0,2);
	logfile.writeln(doc.name);
	if (missing !== "")
		logfile.writeln(missing);
	else
		logfile.writeln("(All fonts accounted for)");
	logfile.writeln("=================================");
	logfile.close();
	}


// Misc. ==================================================================

function errorM (m)
	{
	alert (m);
	exit()
	}

// We'll display progress by showing the processed pairs
function create_message (title, le)
	{
	var dlg = new Window ('palette', title, undefined, {resizeable: true, closeButton: false});
	dlg.alignChildren = ['left', 'top'];
	dlg.txt = dlg.add ('statictext', undefined, '');
	dlg.txt.characters = le;
	return dlg;
	}


function SetFCDialog ()
	{
	var fprefs = app.findGrepPreferences.properties;
	var cprefs = app.changeGrepPreferences.properties;
	var options = app.findChangeGrepOptions.properties;
	app.findChangeGrepOptions.includeFootnotes = true;
	app.findChangeGrepOptions.includeHiddenLayers = true;
	app.findChangeGrepOptions.includeLockedLayersForFind = true;
	app.findChangeGrepOptions.includeLockedStoriesForFind = true;
	app.findChangeGrepOptions.includeMasterPages = true;
	app.findGrepPreferences = app.changeGrepPreferences = null;
	return function (){
		app.findGrepPreferences.properties = fprefs;
		app.changeGrepPreferences.properties = cprefs;
		app.findChangeGrepOptions.properties = options;
		}
	}

function UserInput ()
	{
	var w = new Window ("dialog", "Kern", undefined, {closeButton: false});
		w.alignChildren = "right";
		var p = w.add ('panel {alignChildren: "left"}');
			p.add ('radiobutton {text: "Active document"}');
			p.add ('radiobutton {text: "Selected story"}');
			p.add ('radiobutton {text: "All open documents"}');
			
		var b = w.add("group");
			b.add("button", undefined, "Cancel");
			b.add("button", undefined, "OK");

	if (app.documents.length == 1) {
		p.children[2].enabled = false;
	}

	if (app.selection.length > 0 && app.selection[0].hasOwnProperty ('parentStory')) {
		p.children[1].value = true;
	} else {
		p.children[0].value = true;
		p.children[1].enabled = false;
	}
    
  
	if (w.show() == 1){
		if (p.children[0].value) return app.documents[0];
		if (p.children[1].value) return app.selection[0].parentStory;
		return app.documents;
	}
	w.close();
	exit();
	} // UserInput


function Report (s)
    {
    s=s.replace(/\r$/,"");
    var array = s.split("\r");
    if (array.length > 1)
        {
        var known = [], singles = [];
        for (var i = 0; i < array.length; i++)
            {
            if (!known[array[i]])
                {
                singles.push(array[i]);
                known[array[i]]=true;
                }
            }
        var text = singles.sort().join("\r");
        var plural = "s";
        }
    else
        {
        var text = s;
        var plural = "";
        }
    var w = new Window("dialog"); w.alignChildren="fill";
        w.add("statictext", undefined, "No kern data for the following font"+plural+":");
        w.add("edittext", undefined, text, {multiline: true});
        //w.children[0].graphics.font = w.children[1].graphics.font = "dialog:16";
    w.show();
    } // Report