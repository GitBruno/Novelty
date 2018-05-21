/*
Transpose.jsx

An InDesign CS5 Javascript
Bruno Herfst 2010


Transposes outer characters in selection
(or words in bigger selections)

EXAMPLE OUTPUT:
-------------------------------------------------------
selection          |    replacement
-------------------------------------------------------
e’                 |    ’e
pot                |    top
test one           |    one test
what was that then |    then was that what
cte                |    etc
-------------------------------------------------------

HINT: Control-T is unassigned as a shortcut in InDesign

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
} catch(err) {
    var txt=err.description;
    alert(txt);
    exit();
}


//////////////////////// F U N C T I O N S ///////////////////////////////////////////////

function main(){
    if(app.selection.length != 0){
        mS = myDoc.selection[0];
        if(mS.constructor.name == "Text" || mS.constructor.name == "Word"){
            //see if they’re words or spaces
            try{
                var spaces = mS.contents.match(/\s/g).length;
                if(mS.contents.length <= 3){
                    letters(mS);
                } else {
                    words(mS,spaces);
                }
            } catch(err) {
                //No spaces found
                letters(mS);
            }
        }else{
            alert(app.activeDocument.selection[0].constructor.name+"\nPlease select some text");
            exit();
        }
    }else{
        alert("Nothing selected\nPlease select some text");
    }
}

function letters(mS){
    if (mS.contents.length == 2){
        mS.contents = mS.contents.replace(/(^.)(.$)/,"$2$1");
    } else {
        mS.contents = mS.contents.replace(/(^.)(.+)(.$)/,"$3$2$1");
    }
}

function words(mS){
    mS.contents = mS.contents.replace(/(^\b\w+\b)(.+)(\b\w+\b$)/,"$3$2$1");
}