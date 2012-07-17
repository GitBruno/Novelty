/*

Text_2_Layer.jsx
Indesign CS5 javascript
Bruno Herfst 2011

Move all text to new layer (except for locked layers)
Finds stories and moves all it’s textframes to a new layer.
This makes sure all text will be done even TextPaths.

*/

//TODO: Select target layer

main();

function main(){
	//Make certain that user interaction (display of dialogs, etc.) is turned on.
	app.scriptPreferences.userInteractionLevel = UserInteractionLevels.interactWithAll;
	if(app.documents.length != 0){
		//get ref to doc
		myDoc = app.activeDocument;
		doAllStories(myDoc);
	}else{
		alert("Please open a document and try again.");
	}
}

function doAllStories(myDoc){
	//create a new layer
	var myLayer = GetLayer(myDoc,"Text");
	//send every story to a new layer
	for(var i=0; i<myDoc.stories.length; i++){
		myStory = myDoc.stories.item(i);
		moveStoryToLayer(myStory,myLayer);
	}
	alert("All found text to layer "+myLayer.name);
}

function moveStoryToLayer(myStory,myLayer){
	var myTextFrame;
	for(var myCounter = myStory.textContainers.length-1; myCounter >= 0; myCounter --){
		myTextFrame = myStory.textContainers[myCounter];
		switch(myTextFrame.constructor.name){
			case "TextFrame":
				//I use a try statement here so it will continue moving text 
				//even if it finds text on a locked layer.
				try{
  					myTextFrame.move(myLayer);
				}
				catch (myError){}
				break;
			default:
				try{
					myTextFrame.parent.move(myLayer);
				}
				catch (myError){}
		}
	}
}

function GetLayer(myDoc,name){
  var layer = myDoc.layers.item(name);
  var i = 0;
  while(layer.isValid){
  	i++;
  	layer = myDoc.layers.item(name+i);
  }
  layer = myDoc.layers.add({name:name+i});
  return layer;
}