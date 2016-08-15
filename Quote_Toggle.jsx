/*
Quote.jsx

An InDesign CS6 Javascript
Bruno Herfst 2016


Toggle quote marks (Make sure InDesign smart quotes is turned on!)

EXAMPLE OUTPUT:
-------------------------------------------------------
selection          |    replacement
-------------------------------------------------------
 Any string        |    'Any string'
'Any string'       |    "Any string"
"Any string"       |     Any string
-------------------------------------------------------

HINT: Control-Q is unassigned as a shortcut in InDesign

*/

#target InDesign;

try {
    if(app.documents.length != 0){
        //global vars
        var myDoc = app.activeDocument;
        main();
    }else{
        alert("Please open a document and try again.");
    }
} catch(error) {
    alert(error.description);
    exit();
}


//////////////////////// F U N C T I O N S ///////////////////////////////////////////////

function main(){
    if(app.selection.length != 0){
        mS = myDoc.selection[0];
        if(mS.constructor.name == "Text" || mS.constructor.name == "Word" || mS.constructor.name == "TextStyleRange"){
            //Check first and last character in string
            var str = mS.contents;
            mS.contents = toggleQuotes(str);
			app.select(mS.characters[0],SelectionOptions.ADD_TO);
        }else{
            alert(app.activeDocument.selection[0].constructor.name+"\nPlease select some text");
            exit();
        }
    }else{
        alert("Nothing selected\nPlease select some text");
    }
}

function toggleQuotes(str){
	var firstChar  = undefined;
    var lastChar   = undefined;
    
    // This also works with text supplied by idiot authors //
    
    switch(str.charCodeAt(0)){
    	case 8216:
    	case 8217:
    	case 8218:
    	case 8219:
    	case 8242:
    	case 8245:
    		firstChar = 1;
    		break;
    	case 8220:
    	case 8221:
    	case 8222:
    	case 8223:
    	case 8243:
    	case 8246:
    		firstChar = 2;
    		break;
    	default:
    		firstChar = 0;
    		break;
    }
    switch(str.charCodeAt(str.length-1)){
    	case 8216:
    	case 8217:
    	case 8218:
    	case 8219:
    	case 8242:
    	case 8245:
    		lastChar = 1;
    		break;
    	case 8220:
    	case 8221:
    	case 8222:
    	case 8223:
    	case 8243:
    	case 8246:
    		lastChar = 2;
    		break;
    	default:
    		lastChar = 0;
    		break;
    }
    
    if(firstChar == lastChar) {
    	switch(firstChar) {
    		case 1:
    			// Single quotes to double
    			return '"' + str.substr(1, str.length-2) + '"';
    			break;
    		case 2:
    			// Double quotes nothing
    			return str.substr(1, str.length-2);
    			break;
    		default:
    			// Do nothing
    			break;
    	}
    }
    // No quotes to single quotes
    return("'" + str + "'");
}