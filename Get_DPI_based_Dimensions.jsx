/*

	Get_DPI_based_Dimensions.jsx
	An Adobe Bridge CS4 javascript
	For getting actual file demensions in millimeters at 300 DPI
        Select some files in Adobe Bridge and run the script
	
	Bruno Herfst 2011

*/

#target bridge

var set = { where   : "~/Desktop/300DPI_Dimensions.txt" ,  // where to safe the txt file
            dpi     : 300 }                                // actual size at set DPI 

var allFiles = new Array;
var txt = "";

try {
	// Returns Array
	var selectedThumbnails = app.document.selections;
	if(selectedThumbnails.length == 0) {
		alert("Select some files first in Adobe Bridge");
		exit();
	} else if(selectedThumbnails[0].type == "folder") {
		alert("Only select pictures please");
		exit();
	}
} catch(err) {
		throwError(err);
}

for(var i = 0; i < selectedThumbnails.length; i++) {
	var myFile = new Array;
	// Test with first item of Array
	myFile["file"] = selectedThumbnails[i];
	myFile["filename"] = selectedThumbnails[i].name;

	// Get metadata from thumbnail
	var md = myFile.file.synchronousMetadata;
	
	//Let’s store values in an array
	var x = md.read('http://ns.adobe.com/exif/1.0/',"PixelXDimension");
	var y = md.read('http://ns.adobe.com/exif/1.0/',"PixelYDimension");
	//make mm mm = 254 * pixels / dpi;
	myFile["Xmm"] = doRound((25.4 * x)/set.dpi,2);
	myFile["Ymm"] = doRound((25.4 * y)/set.dpi,2);

	//alert(myFile.filename + '\n\nW ' + myFile["Xmm"] + ' x H ' + myFile["Ymm"] + ' mm');
	allFiles.push(myFile);
}

function doRound(myNum, roundDec) {
	var roundMulit = Math.pow(10,roundDec);
	return Math.round(myNum*roundMulit)/roundMulit;
}

for(var i = 0; i < allFiles.length; i++) {
	txt += "W " + allFiles[i].Xmm + " \t H " + allFiles[i].Ymm + " \t" + allFiles[i].filename + "\n";
}

// Save file
textFile = File(set.where);
if(!textFile.exists) {
	saveTXT(txt);
} else {
	saveTXT(txt);
}

// function to save to a txtfile
function saveTXT(txt){
	try{
		textFile.open("w");
		textFile.write(txt);
		textFile.close();
		alert("You can find the data here: \n\n" + textFile);
		}
	catch(e){
		throwError("Could not save file: " + e, false, 2, textFile);
	}
}
