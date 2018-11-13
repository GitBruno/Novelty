/***********************************************************************/
/*                                                                     */
/*      PageBorder ::  Create a border around your InDesign page(s)    */
/*                                                                     */
/*      [Ver: 1.27]   [Author: Marc Autret]         [Modif: 12/02/10]  */
/*      [Lang: EN]   [Req: InDesign CS3/CS4/CS5]    [Creat: 09/13/10]  */
/*                                                                     */
/*      Installation:                                                  */
/*                                                                     */
/*      1) Place the current file into Scripts/Scripts Panel/          */
/*                                                                     */
/*      2) Run InDesign, open a document                               */
/*                                                                     */
/*      3) Exec the script from your scripts panel:                    */
/*           Window > Automation > Scripts   [CS3/CS4]                 */
/*           Window > Utilities > Scripts    [CS5]                     */
/*         + double-click on the script file name                      */
/*                                                                     */
/*      Bugs & Feedback : marc{at}indiscripts{dot}com                  */
/*                        www.indiscripts.com                          */
/*                                                                     */
/***********************************************************************/

#targetengine 'pageborder127'

var	scriptName = "PageBorder",
	scriptVersion = "1.27",
	layerName = scriptName + "Layer";

var	alignStrings = ['Inside','Outside','Center'],
	ptBorder = ptBorder||.5,						// default border weight (pts)
	pgMode = pgMode||1,								// -1=active page | 1=all pages
	align = align||0,								// default alignment index
	jDots = jDots||0,								// Japanese dots flag,
	jDotsStyleName = false,
	solidStyleName = false;


var createBorder = function(/*Layer*/layer)
//------------------------------------------------
// this: Page [collective allowed]
{
	var pages = this.getElements(),
		alignMode = StrokeAlignment[alignStrings[align].toLowerCase()+'Alignment'],
		pg;
	
	var recProps = {
		fillColor: 'None',
		strokeColor: 'Black',
		strokeTint: 100,
		strokeWeight: ptBorder,
		strokeAlignment: alignMode,
		strokeType: (jDots && jDotsStyleName) || solidStyleName,
		// [fix101125]
		textWrapPreferences: (parseInt(app.version) > 5) ? // [fix101202]
			{textWrapMode: TextWrapModes.NONE} :
			{textWrapType: TextWrapTypes.NONE}
		};

	while( pg=pages.pop() )
		{
		recProps.geometricBounds = pg.bounds;
		pg.rectangles.add(layer,undefined,undefined,recProps);
		}
};

var pageBorderMain = function()
//------------------------------------------------
{
	var doc = app.documents.length&&app.activeDocument;
	
	if( !doc ) throw Error("Please open a document before running " + scriptName + ".");
	
	var vwPrefs = doc.viewPreferences,
		strokeUnits = ('strokeMeasurementUnits' in vwPrefs)?
			vwPrefs.strokeMeasurementUnits:
			MeasurementUnits.points;

	jDotsStyleName = (function()
		{
		try{return doc.strokeStyles.itemByName("$ID/Japanese Dots").name;}
		catch(_){}
		return false;
		})();

	solidStyleName = (function()
		{
		try{return doc.strokeStyles.itemByName("$ID/Solid").name;}
		catch(_){}
		return false;
		})();

	if( !solidStyleName ) throw Error("Unable to find the 'Solid' stroke style in InDesign!");

	
	var canRemove = (function()
		{
		var r = false;
		try{r=!!doc.layers.itemByName(layerName).id;}
		catch(_){}
		return r;
		})();
	
	var dlgRet = (function()
		{
		var dlgTitle = ' ' + scriptName + ' ' + scriptVersion + "  |  \u00A9Indiscripts.com",
			d = app.dialogs.add({name:dlgTitle, canCancel:true}),
			
			pn = d.dialogColumns.add().borderPanels.add(),
			dc = pn.dialogColumns.add(),
			dr = dc.dialogRows.add(),
			
			// Weight
			sWeight = dr.dialogColumns.add().
				staticTexts.add({
				staticLabel: "Weight:",
				minWidth: 80,
				}),
			meWeight = dr.dialogColumns.add().
				measurementEditboxes.add({
				editValue: ptBorder,
				editUnits: strokeUnits,
				minimumValue: .1,
				maximumValue: 5,
				smallNudge: .25,
				largeNudge: .1,
				}),
			
			// Alignment
			sAlign = (dr=dc.dialogRows.add()).dialogColumns.add().
				staticTexts.add({
				staticLabel: "Alignment:",
				minWidth: 80,
				}),
			ddAlign = dr.dialogColumns.add().
				dropdowns.add({
				stringList: alignStrings,
				selectedIndex: align,
				}),
			
			// All Pages flag
			cbAllPages = (dc=pn.dialogColumns.add()).dialogRows.add().dialogColumns.add().
				checkboxControls.add({
				staticLabel: "All Pages",
				checkedState: pgMode==1,
				}),
				
			// Dots flag
			cbDots = jDotsStyleName?
				(dr=dc.dialogRows.add()).dialogColumns.add().
				checkboxControls.add({
				staticLabel: "Dotted Stroke",
				checkedState: !!jDots,
				}):
				{checkedState:false},
			
			// Remove
			cbRemove = canRemove?
				d.dialogColumns.add().
				checkboxControls.add({
				staticLabel: "Remove the border",
				checkedState: false,
				}):
				{checkedState:false};

		
		var ret = d.show()&&{
			ptBorder: meWeight.editValue,
			align: ddAlign.selectedIndex,
			pgMode: (cbAllPages.checkedState)?1:-1,
			jDots: !!cbDots.checkedState,
			removeBorder: cbRemove.checkedState,
			}
		d.destroy();
		return ret;
		})();
	
	if( !dlgRet ) return false;
	ptBorder = dlgRet.ptBorder;
	pgMode = dlgRet.pgMode;
	align = dlgRet.align;
	jDots = dlgRet.jDots;
	
	// [fix100914]
	var activeLayer = (function()
		{
		var al = doc.activeLayer;
		return ( al.name == layerName )?
			(doc.layers.length==1&&doc.layers.add()):
			al.getElements()[0];
		})();
	// [/fix100914]
	
	
	var removeBorder = dlgRet.removeBorder;
	var borderLayer = (function()
		{
		var layers = doc.layers;
		try{layers.itemByName(layerName).remove();}catch(_){};
		return ( removeBorder ) ? null :
			layers.add({name: layerName, printable: true}).
			move(LocationOptions.atBeginning); // [fix100916]
		})();
	if( removeBorder ) return;
	
	// [fix100914]
	var ro = vwPrefs.rulerOrigin;
	vwPrefs.rulerOrigin = RulerOrigin.spreadOrigin;
	// [/fix100914]

	// Main process
	createBorder.call(
		(pgMode==1)?doc.pages.everyItem():app.activeWindow.activePage,
		borderLayer
		);
	
	borderLayer.locked = true;

	// [fix100914]
	if( activeLayer ) doc.activeLayer = activeLayer;
	vwPrefs.rulerOrigin = ro;
	// [/fix100914]
};

app.scriptPreferences.enableRedraw = false;
try	{pageBorderMain();}catch(_){alert(_);}
app.scriptPreferences.enableRedraw = true;