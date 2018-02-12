if (app.documents.length<1){exit()}
var doc = app.activeDocument;
for (var i=0;i<doc.stories.length;i++){
	var myStory = doc.stories[i];
	for (j=0;j<myStory.paragraphs.length;j++){
		var myPara = myStory.paragraphs[j];
		if (myPara.characters[-1].contents == "\r"){
			myPara.characters[-1].pointSize = myPara.characters[-2].pointSize;
			myPara.characters[-1].leading = myPara.characters[-2].leading;
			}
		}
	}