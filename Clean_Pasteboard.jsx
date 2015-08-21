/***********************************************************************/
/*                                                                     */
/*      CleanupPasteboard ::    Remove external page items             */
/*                              from the whole document                */
/*                                                                     */
/*      [Ver: 1.11]    [Author: Marc Autret]    [Modif: 12/03/09]      */
/*      [Lang: EN|FR]  [Req: InDesign CS3/CS4]  [Creat: 09/03/09]      */
/*                                                                     */
/*      Installation:                                                  */
/*                                                                     */
/*      1) Place the current file into Scripts/Scripts Panel/          */
/*                                                                     */
/*      2) Run InDesign, open a document                               */
/*                                                                     */
/*      3) Exec script from Window > Automatisation > Scripts          */
/*         (double-click on the script name)                           */
/*                                                                     */
/*      Bugs & Feedback : marc{at}indiscripts{dot}com                  */
/*                        www.indiscripts.com                          */
/*                                                                     */
/***********************************************************************/

var SCRIPT = {name:'CleanupPasteboard', version:'1.11'};

//======================================
// <L10N> :: FRENCH_LOCALE
//======================================
// Remove objects outside: :: Supprimer les objets au-del\u00E0 de :
// Bleed :: Fonds perdus
// Slug :: Ligne-bloc
// Custom page offset: :: Distance de la page :
// Parse master spreads :: Inclure les gabarits
// Items removed: :: Objets supprim\u00E9s :
// </L10N>
var L10N = L10N || (function()
	{
	var	__com = '// ', __sep = ' :: ', __beg = '<L10N>', __end = '</L10N>';

	var ln = (function()
		{ // <this> : Number
		for(var p in Locale) if(Locale[p] == this) return(p);
		}).call(app.locale);

	var parseL10N = /*str[]*/function(/*str*/locale_)
		{ // <this> : File
		var line, lines=[], r=[];
		var uEsc = function(){return String.fromCharCode(Number('0x'+arguments[1]));}
		if( this.open('r') )
			{
			var comSize=__com.length;
			while( !this.eof )
				{
				line = this.readln().replace(/\\u([0-9a-f]{4})/gi, uEsc);
				if( line.indexOf(__com) != 0 ) continue;
				if( line.indexOf(__end) >= 0 ) break;
				if( line.indexOf(__sep) < 0  ) continue;
				lines.push(line.substr(comSize).split(__sep));
				}
			this.close();
			}

		var locIndex = (function()
			{ // <this> : Attay
			while( (line=this.shift()) && line[0] != __beg ) {};
			if (!line) return false;
			for (var i=1,sz=line.length ; i<sz ; i++)
				if ( line[i] == locale_ ) return i;
			return 0;
			}).call(lines);
		if (!locIndex) return r;
		
		while( line=lines.shift() )
			if ( typeof line[locIndex] != 'undefined' )
				r[line[0]] = line[locIndex];
		return r;
		}
	
	var tb = parseL10N.call(File(app.activeScript),ln);
	__ = function(/*str*/ks){return(tb[ks]||ks);}
	return {locale: ln};
	})();

var UNITS = (function()
	{
	var r={}, mu=MeasurementUnits;
	r[mu.AGATES]='agt';
	r[mu.CENTIMETERS]='cm';
	r[mu.CICEROS]='ci';
	r[mu.INCHES]='in';
	r[mu.INCHES_DECIMAL]='in';
	r[mu.MILLIMETERS]='mm';
	r[mu.PICAS]='pc';
	r[mu.POINTS]='pt';
	return(r);
	})();

Application.prototype.showUI = function()
// Run the dialog and return {choice,customOffset,parseMaster}, or false on cancel
// choice (int) : 0=>Bleed | 1=>Slug | 2=>Custom
// customOffset (num) : a measurementEditbox value (in pts)
// parseMaster (bool) : parse masterSpreads flag
	{
	var dlg = this.dialogs.add( {name: ' '+SCRIPT.name+'  '+SCRIPT.version, canCancel: true} );
	var PREF_UNITS = MeasurementUnits.MILLIMETERS;
	
	var rgOffsets, meOffset, cbMaster;
	with ( dlg ) 
		{
 		with ( dialogColumns.add().borderPanels.add().dialogColumns.add() )
 			{
   			staticTexts.add( {staticLabel:__("Remove objects outside:")} );
   			with ( (rgOffsets=radiobuttonGroups.add()).radiobuttonControls )
   				{
   				add( {staticLabel: __("Bleed")} );
   				add( {staticLabel: __("Slug") } );
   				add( {staticLabel: __("Custom page offset:"), checkedState:true} );
   				}
   			meOffset = measurementEditboxes.add( {editUnits: PREF_UNITS, editValue:0, smallNudge:1 });
   			cbMaster = checkboxControls.add( {staticLabel:__("Parse master spreads")} );
  			}
		}
	
	var r = ( dlg.show() ) ?
			{
			choice: rgOffsets.selectedButton,
			customOffset: meOffset.editValue,
			parseMaster: cbMaster.checkedState
			} : false;

	dlg.destroy();
	return(r);
	}

DocumentPreference.prototype.bsOffsets = function(/*[0=Bleed|1=Slug]*/bsOption)
// Return bleed/slug offsets in the [top,left,bottom,right] form
// The top/bot values are Numbers returned in the current vertical measurement units
// The left/right values are Numbers returned in the current horizontal measurement units
	{
	var bs = (bsOption)?'slug':'documentBleed';
	var right = (bsOption)?'RightOrOutsideOffset':'OutsideOrRightOffset';
	return [ this[bs+'TopOffset'], this[bs+'InsideOrLeftOffset'],
		this[bs+'BottomOffset'], this[bs+right] ];
	}

ViewPreference.prototype.toOffsets = function(/*num*/ptsValue)
// Convert <ptsValue> to the appropriate h-units and v-units values
// according to the current measurement units
// Return an array in the form [top,left,bottom,right]
	{
	var uv = UnitValue(ptsValue, 'pt');
	var h = uv.as(UNITS[this.horizontalMeasurementUnits]);
	var v = uv.as(UNITS[this.verticalMeasurementUnits]);
	return [v,h,v,h];
	}

Document.prototype.cleanOut = function(/*arr*/offsets, /*bool*/parseMaster)
// Remove "out of bounds" items
// <offsets> : a [top,left,bot,right] array of numbers to offset each spread bounds
// <parseMaster> : if true, parse also the master spreads
// The top/bot values are given in the current vertical measurement units
// The left/right values are given in the current horizontal measurement units
	{
	var outOf = function(b)
		{ // context: pageItem bounds
		return this[2]<b[0] || this[3]<b[1] || this[0]>b[2] || this[1]>b[3];
		}
	
	var extraBounds = function()
		{ // context: Spread or MasterSpread
		var bFirst = this.pages.item(0).bounds; // bounds of the first page
		
		var bLast = this.pages.item(-1).bounds;	// bounds of the last page
		return [ bFirst[0]-offsets[0], bFirst[1]-offsets[1],
			bLast[2]+offsets[2], bLast[3]+offsets[3] ];
		};

	var spreads = this.spreads.everyItem().getElements();
	if (parseMaster)
		spreads = spreads.concat(this.masterSpreads.everyItem().getElements());
	
	var cpt=0;
	var i, s, iBounds, eBounds, items;

	// [fix091203]
	var ro = this.viewPreferences.rulerOrigin;
	this.viewPreferences.rulerOrigin = RulerOrigin.spreadOrigin;
	// [/fix091203]
	while(s=spreads.pop())			// for each spread
		{
		eBounds = extraBounds.call(s);	// get extra bounds
		items = s.pageItems.everyItem().getElements();
		while(i=items.pop())		// for each item
			{
			if ( outOf.call(i.visibleBounds,eBounds) )
				try {i.remove();cpt++} catch(ex){};
			}
		}
	this.viewPreferences.rulerOrigin = ro; // [fix091203]
	return(cpt);
 	}

Application.prototype.main = function()
// Main process
	{
	if (! this.documents.length ) return;

	// run the dialog
	var ui = app.showUI();
	if (! ui ) return;

	// create the array of [top,left,bot,right] offsets
	var doc = this.activeDocument;
	var offsets = ( ui.choice > 1 ) ?
		doc.viewPreferences.toOffsets(ui.customOffset) :
		doc.documentPreferences.bsOffsets(ui.choice);

	// cleanup
	alert(__("Items removed:") + ' ' + doc.cleanOut(offsets, ui.parseMaster));
	}

if ( parseInt(app.version) >= 6)
	{ // CS4+
	app.doScript('app.main();', ScriptLanguage.javascript,
	undefined, UndoModes.entireScript, app.activeScript.displayName);
	}
else
	{ // CS3
	app.main();
	}