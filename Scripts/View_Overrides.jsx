#target InDesign;

/***********************************************************************/
/*                                                                     */
/*      ShowHideLocalFormatting ::   Show/hide local formatting        */
/*                                                                     */
/*      [Ver: 1.1]    [Author: Marc Autret]     [Modif: 05/25/10]      */
/*      [Lang: EN]    [Req: InDesign CS4]       [Creat: 05/09/10]      */
/*                                                                     */
/*      Installation:                                                  */
/*                                                                     */
/*      1) Place the current file into Scripts/Scripts Panel/          */
/*                                                                     */
/*      2) Run InDesign, open a document containing texts              */
/*                                                                     */
/*      3) Exec script from Window > Automatisation > Scripts          */
/*         (double-click on the script name)                           */
/*                                                                     */
/*      Bugs & Feedback : marc{at}indiscripts{dot}com                  */
/*                        www.indiscripts.com                          */
/*                                                                     */
/***********************************************************************/

if( app.documents.length &&
	app.activeDocument.textPreferences.enableStylePreviewMode^= 1 &&
	app.layoutWindows.length &&
	app.activeWindow.constructor==LayoutWindow){
        //app.activeDocument.paragraphStyles.item("Paragraph Style 1").previewColor = UIColors.YELLOW;  
		app.activeWindow.screenMode = ScreenModeOptions.previewOff;
		// UPDATE [100525] - THX to ptruskier
		app.activeWindow.overprintPreview = false;
	}
