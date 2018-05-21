//DESCRIPTION: Jongware's PrepText

if (app.activeDocument.selection[0].constructor.name != "InsertionPoint")
{
	alert ("Cursor in "+app.activeDocument.selection[0].constructor.name+"\nPlease put the cursor into a text frame");
	exit(0);
}

var myMaximumValue = 63;
var myProgressBarWidth = 384;
var myIncrement = myMaximumValue/myProgressBarWidth;
myCreateProgressPanel(myMaximumValue, myProgressBarWidth);

myProgressPanel.myProgressBar.value = 0;
myCreateProgressPanel(100, 400);
myProgressPanel.show();

for (b=0; b<2; b++)
{
	for (i=0; i<2; i++)
	{
		for (s=0; s<2; s++)
		{
			for (u=0; u<2; u++)
			{
			//	Don't process strikeout
				for (k=0; k<1; k++)
				{
					for (c=0; c<3; c++)
					{
						if (b+i+s+u+k+c)
						{
							myProgressPanel.myProgressBar.value = 32*b+16*i+8*s+4*u+2*k+c;
							findAttr (b, i, s, false, u, /*k*/false, c, "");
							if (s)
								findAttr (b, i, false, s, u, /*k*/false, c, "");
						}
					}
				}
			}
		}
	}
}
myProgressPanel.hide();

exit(0);

function myCreateProgressPanel(myMaximumValue, myProgressBarWidth)
{
	myProgressPanel = new Window('window', 'Prepping text');
	with(myProgressPanel)
	{
		myProgressPanel.myProgressBar = add('progressbar', [12, 12, myProgressBarWidth, 24], 0, myMaximumValue);
	}
}

function findAttr (bold, italic, superscript, subscript, underline, strikeout, small_all_caps, StyleName)
{
	app.findTextPreferences = NothingEnum.nothing;
	app.changeTextPreferences = NothingEnum.nothing;
	app.findTextPreferences.appliedCharacterStyle = app.activeDocument.characterStyles[0];	// "[None]"

	app.findTextPreferences.fontStyle = "Regular";
	app.findTextPreferences.position = Position.NORMAL;
	app.findTextPreferences.capitalization = Capitalization.NORMAL;
	app.findTextPreferences.underline = false;
	app.findTextPreferences.strikeThru = false;

	if (bold)
	{
		if (italic)
			app.findTextPreferences.fontStyle = "Bold Italic";
		else
			app.findTextPreferences.fontStyle = "Bold";
	} else
	{
		if (italic)
			app.findTextPreferences.fontStyle = "Italic";
	}
	if (superscript)
		app.findTextPreferences.position = Position.SUPERSCRIPT;

	if (subscript)
		app.findTextPreferences.position = Position.SUBSCRIPT;

	if (underline)
		app.findTextPreferences.underline = true;
	if (strikeout)
		app.findTextPreferences.strikeThru = true;

	if (small_all_caps == 1)
		app.findTextPreferences.capitalization = Capitalization.SMALL_CAPS;
	if (small_all_caps == 2)
		app.findTextPreferences.capitalization = Capitalization.ALL_CAPS;

	foundItems = app.activeDocument.selection[0].parent.findText();

	if (foundItems.length > 0)
	{
		if (StyleName == "")
		{
		//	Make up a name
			if (bold)
				StyleName = "Bold";
			if (italic)
			{
				if (bold)
					StyleName = "Bold Italic";
				else
					StyleName = "Italic";
			}
			if (superscript)
			{
				if (StyleName) StyleName += " + ";
				StyleName += "Super";
			}
			if (subscript)
			{
				if (StyleName) StyleName += " + ";
				StyleName += "Sub";
			}
			if (underline)
			{
				if (StyleName) StyleName += " + ";
				StyleName += "Underline";
			}
			if (strikeout)
			{
				if (StyleName) StyleName += " + ";
				StyleName += "Stkout";
			}
			if (small_all_caps == 1)
			{
				if (StyleName) StyleName += " + ";
				StyleName += "Scaps";
			}
			if (small_all_caps == 2)
			{
				if (StyleName) StyleName += " + ";
				StyleName += "Caps";
			}
			try
			{
				cstyle = app.activeDocument.characterStyles.add({name:StyleName}); // , fontStyle:app.findTextPreferences.fontStyle, underline:app.findTextPreferences.underline, strikeThru:app.findTextPreferences.strikeThru, position:app.findTextPreferences.position, capitalization:app.findTextPreferences.capitalization});
				if (bold || italic) cstyle.fontStyle = app.findTextPreferences.fontStyle;
				if (superscript || subscript) cstyle.position = app.findTextPreferences.position;
				if (underline) cstyle.underline = app.findTextPreferences.underline;
				if (strikeout) cstyle.strikeThru = app.findTextPreferences.strikeThru;
				if (small_all_caps) cstyle.capitalization = app.findTextPreferences.capitalization;
			} catch (e)
			{
			}
		}
		app.changeTextPreferences.appliedCharacterStyle = StyleName;
		app.activeDocument.selection[0].parent.changeText (false);
	}
}
