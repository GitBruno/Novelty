// Size a frame's tables to the width of the frame 
// by resizing columns proportionally.
// Peter Kahrel -- www.kahrel.plus.com

// Adjusted by Bruno Herfst to suit needs:
// 1. Don't check if columns are wide enough
// 2. Set rows to auto grow

(function () {
	
	var units;

	//----------------------------------------------
	// Get a table's resizeable columns, then resize them
	// Take the right edge into account. Border are a mess, 
	// we ignore them.
	
	function resizeTable (table, frameWidth) {
		var columns = table.columns.everyItem().getElements();
		var tableWidth = table.width               
		var excess = Math.abs (frameWidth - tableWidth);
		var addon = excess/columns.length;
		for (var i = table.columns.length-1; i >= 0; i--) {
			table.columns[i].width += addon;
		}
	}

	// ----------------------------------------------
	// Get the selected frame and resize the tables that aren't the frame's width
	// (Fix the height of all rows at 12 points)
	
	function resizeTables (frame) {
		var frameWidth = frame.geometricBounds[3] - frame.geometricBounds[1];
		var tables = frame.tables.everyItem().getElements();
		for (var i = tables.length-1; i >= 0; i--) {
			if (tables[i].width !== frameWidth) {
				resizeTable (tables[i], frameWidth);
			}
			tables[i].rows.everyItem().autoGrow = true;
		}
	}


	if (app.selection.length > 0 && app.selection[0] instanceof TextFrame) {
		units = app.scriptPreferences.measurementUnit;
		app.scriptPreferences.measurementUnit = MeasurementUnits.POINTS;
		resizeTables (app.selection[0]);
		app.scriptPreferences.measurementUnit = units;
	} else {
		alert ('Please select a text frame.', 'Size tables', true);
	}

}());
