//DESCRIPTION:CopyCutter -- Run Me On A Text Frame To Shred It Into Strips
// A Jongware script 7-Aug-2011
// w/Thanks to SebastiaoV to find a working version

// Updated 2018 by Bruno Herfst to use findGrep() instead of changeGrep()

if (app.selection.length == 1 && app.selection[0].hasOwnProperty("baseline") && app.selection[0].length > 1)
{
	app.selection[0].insertionPoints[0].contents = "\r";
	app.selection[0].insertionPoints[-1].contents = "\r";
	app.findGrepPreferences = null;
	app.changeGrepPreferences = null;
	app.findGrepPreferences.findWhat = "^.+$";
	app.selection[0].findGrep();
	p = app.selection[0].parentTextFrames[0];
	lh = (p.lines[-1].baseline - p.lines[0].baseline) / (p.lines.length-1);
	top = app.selection[0].lines[0].baseline - lh;
	while (app.selection[0].length > 0)
	{
		f = app.activeDocument.layoutWindows[0].activePage.textFrames.add ({geometricBounds:[top, p.geometricBounds[3]+2*lh, top+lh, 2*(lh+p.geometricBounds[3])-p.geometricBounds[1] ]});
		app.selection[0].lines[0].move (LocationOptions.AFTER, f.texts[0]);
		top += lh;
	}
	app.selection[0].insertionPoints[-1].contents = "";
} else
	alert ("please select some text to shred");