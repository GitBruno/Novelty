//Optical_Margin_Batch.jsx
//Indesign CS4 javascript
//Bruno Herfst 2011

//Todo: 
//Ignore master pages tickbox
//test locked layers and items
//add search for style?
//calculate auto?

main();

//global variables
var myDoc,mySelection,mySizeSelect,myCustomSize;

function main(){
	if(app.documents.length != 0){
		myDoc = app.activeDocument;
		if(app.selection.length != 0){
			//Get the first item in the selection.
			mySelection = app.selection;
			//Process the selection.
			switch(mySelection[0].constructor.name){
				case "Text":
				case "InsertionPoint":
				case "Character":
				case "Word":
				case "Line":
				case "TextStyleRange":
				case "Paragraph":
				case "TextColumn":
				case "TextFrame":
					myDisplayDialog(true);
					break;
				default:
					myDisplayDialog(false);
			}
		}else{
	  		myDisplayDialog(false);
		}
	}else{
		alert("Please open a document and try again.");
	}
}

//Display a dialog box.
function myDisplayDialog(mySelectedBool){
	var myDialog,myStoryRadio,mySizeRadio;
	with(myDialog = app.dialogs.add({name:"Optical Margin Alignment"})){
		with(dialogColumns.add()){
			with(borderPanels.add()){
				if(mySelectedBool == true){
					with(myStoryRadio = radiobuttonGroups.add()){
						radiobuttonControls.add({staticLabel:"All stories"});
						radiobuttonControls.add({staticLabel:"Selected story", checkedState:true});
					}
				} else {
					with(myStoryRadio = radiobuttonGroups.add()){
						radiobuttonControls.add({staticLabel:"All text frames", checkedState:true});
					}
				}
			}
			with(borderPanels.add()){
				with(mySizeRadio = radiobuttonGroups.add()){
					radiobuttonControls.add({staticLabel:"Manual"});
					radiobuttonControls.add({staticLabel:"Auto", checkedState:true});
				}
					with(dialogColumns.add()){
					myCustomSizeBut = measurementEditboxes.add({editContents:"0"});
				}
			}
		}
	}
	var myResult = myDialog.show();
	if(myResult == true){
		var myStorySelect = myStoryRadio.selectedButton;
		mySizeSelect = mySizeRadio.selectedButton;
		myCustomSize = myCustomSizeBut.editContents;
		myDialog.destroy();
		
		if(myStorySelect == 1){
			doSelection(mySelection);
		}else{
			doAllFrames(myDoc);
		}
	}else{
		myDialog.destroy();
	}
}

function doAllFrames(myDoc){
	//Get all stories in doc
	for(var i=0; i<myDoc.stories.length; i++){
		myStory = myDoc.stories.item(i);
		doThisStory(myStory);
	}
	alert("Done!");
}

function doSelection(mySelection){
	//If text or a text frame is selected, get the first frame of the story; 
	//otherwise, do nothing.
	for(var i=0; i<mySelection.length; i++){
		//get ref to story
		switch(mySelection[i].constructor.name){
			case "Text":
			case "InsertionPoint":
			case "Character":
			case "Word":
			case "Line":
			case "TextStyleRange":
			case "Paragraph":
			case "TextColumn":
			case "TextFrame":
				myStory = mySelection[i].parentStory;
				doThisStory(myStory);
				break;
		}
	}
	alert("Done!");
}

function doThisStory(myStory){
	if(myStory.storyPreferences.opticalMarginAlignment == false){
		myStory.storyPreferences.opticalMarginAlignment = true;
	} else if (mySizeSelect==0){
		myStory.storyPreferences.opticalMarginSize = myCustomSize;
	}
}