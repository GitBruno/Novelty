#target InDesign;

//Let’s get the text for the two dices
app.selection[0].contents = String(Math.floor(Math.random()*6)+1) + String(Math.floor(Math.random()*6)+1);