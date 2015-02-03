#target InDesign;

switch(app.selection[0].constructor.name){
	case "Character":
	case "Paragraph":
	case "Word":
	case "Text":
	case "TextStyleRange":
		app.selection[0].contents = ""; // results in app.selection[0] == InsertionPoint;
		//break; // no break as we want to continue as InsertionPoint
	case "InsertionPoint":
		insertImpressionNumber(app.selection[0]);
		break;
	default:
		alert("This is an "+ app.selection[0].constructor.name + "\nThis function is meant to be run inside from within text-frame.");
}

function insertImpressionNumber(selection){
	var impression = {left:"10 9 8 7 6 5 4 3 2 1",centre:"1 3 5 7 9 10 8 6 4 2",right:"1 2 3 4 5 6 7 8 9 10"};
	// try and get the alignment automatically without asking
	switch(String(selection.justification)){
		case "LEFT_ALIGN":
		case "LEFT_JUSTIFIED":
			selection.contents = impression.left;
			break;
		case "RIGHT_ALIGN":
		case "RIGHT_JUSTIFIED":
			selection.contents = impression.right;
			break;
		case "CENTER_ALIGN":
		case "CENTER_JUSTIFIED":
			selection.contents = impression.centre;
			break;
		//case "TO_BINDING_SIDE":
		//case "AWAY_FROM_BINDING_SIDE":
		//	break; //we need to get the parent page first
		default: //FULLY_JUSTIFIED: Ask what the user wants to do
			_placeViaAlignmentUI(selection, impression);
	}
}

function _placeViaAlignmentUI(selection, impression){
	// Make the dialog box for selecting the alignment
    var dlg = app.dialogs.add({name:"Insert Impression Number"});
    with(dlg.dialogColumns.add()){
        with(dialogRows.add()){
            with(dialogColumns.add()){
                var requestedJustification = dropdowns.add({stringList:["Left","Centre","Right"], selectedIndex:0});
            }
        }
    }
    //show dialog
    if(dlg.show() == true){
		switch(requestedJustification.selectedIndex){
			case 0:
				selection.contents = impression.left;
				break;
			case 1:
			    selection.contents = impression.centre;
				break;
			case 2:
				selection.contents = impression.right;
				break;
			default:
				// do nothing
				break;
		}
    }
}