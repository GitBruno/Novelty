/*--------

    Unembed_Images.jsx is a heavely modified version of 
    dump_pasted_images.jsx by Peter Kahrel -- www.kahrel.plus.com

    http://www.kahrel.plus.com/indesign/unembed_images.html

     Script adjusted to suit Bruno Herfst 2016
    
    PLease note that I had to remove the JPG and PNG options as these 
    where based on the build-in exportFile() function. This function 
    does not export the original, but rather the cropped version.

    The JPG and PNG or TIFF options can be easelly added to this script,
    but since I have no use for them, I'm leaving them out for now.

    The main reason for adjusting the script was so it can handles pasted 
    graphics that are scaled and/or rotated. Or are conatained by frames
    that are not rectangular.

    You can either unembed a single file by selecting it and running the script.
    If nothing is selected the script will unembed all embedded images in the document.

--------*/

#target indesign;

function main(){
    if (app.documents.length > 0) {
        if(app.activeDocument.modified) {
            return alert("Please save your document before running this script.");
        }
        if(app.selection.length > 0) {
            // Work on selction
            unembed_selected_images();
        } else {
            // Process whole document
            unembed_images();
        }
    } else {
        alert("Open a document before running this script.");
    }
}

function get_embedded_from( selection ){
    var embeddedImages = [];
    var len = selection.length;
    for (var i = 0; i < len; i++) {
        var type = selection[i].constructor.name;
        switch(type) {
            case "Image":
            case "EPS":
            case "PDF":
            case "AI":
                if( (selection[i].itemLink == null) || (selection[i].itemLink.status == LinkStatus.linkEmbedded) ) {
                    embeddedImages.push(selection[i]);
                }
                break;
            case "Rectangle":
            case "Polygon":
            case "Oval":
                if( (selection[i].graphics[0].itemLink == null) || (selection[i].graphics[0].itemLink.status == LinkStatus.linkEmbedded) ) {
                    embeddedImages.push(selection[i].graphics[0]);
                }
                break;
            default:
                alert("Can't process elements of type " + type + "\nPlease select an image.");
                return [];
                break;
        }
    }
    return embeddedImages;
}

function unembed_selected_images ()
{
    var d = app.activeDocument;
    var g = get_embedded_from( app.selection );
    
    if(g.length == 0) {
        alert("No embedded images found.");
        return;
    }

    unembed(d,g);
}

function unembed_images ()
{
    var d = app.activeDocument;
    var g = d.allGraphics;

    if(embedded_graphics) {
        unembed(d, g);
    } else {
        alert("No embedded images found.");
    }
}

function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function getPlatformInfo(){
    var platform = File.fs;
    if(platform == 'Windows'){
        var trailSlash = "\\";
    } else if(platform == "Macintosh") {
        var trailSlash = "/";
    } else {
        var trailSlash = undefined;
        coverBuilderAlert( localLocalised.Unsupported_Platform  + platform );
    }
    return {name : platform, trailSlash : trailSlash};
}

function unembed(d, g) {

    var platform = File.fs;
    if(platform == 'Windows'){
        var trailSlash = "\\";
    } else { // platform == "Macintosh"
        var trailSlash = "/";
    }
    
    var outfolder = get_outfolder();

    var image_file, n = 0;
    var sessionString = randomString(4, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');

    for (var i = g.length-1; i > -1; i--)
    {
        if (g[i].itemLink == null)
        {
            var fileName = sessionString + (n++) + '.EPS';
            image_file = File (outfolder + trailSlash + fileName);
            export_eps (g[i], image_file);
            g[i].parent.place (image_file);
        } else {
            if (g[i].itemLink.status === LinkStatus.linkEmbedded) {
                g[i].itemLink.unembed(outfolder);
            }
        }
    }

    alert("Finished exporting " + g.length + " images.\nFiles are saved in folder " + outfolder)
}

function get_outfolder ()
{
    var e;

    try {var f = Folder (app.activeDocument.fullName.path).selectDlg();}
        catch(e){alert(e.message); exit();}
    if (f === null)
        exit();
    else
        return f;
}

function embedded_graphics(array)
{
    var z = array.length;
    for (var i = 0; i < z; i++)
        if (array[i].itemLink == null || array[i].itemLink.status == LinkStatus.linkEmbedded)
            return true;
    return false;
}

function export_eps (im, f)
{

    var gb   = im.parent.geometricBounds;
    var d    = app.documents.add (false);

    // Separate try-catch-finally here (apart from the global one)
    // to make sure that we don't end up with documents without a layout window
    try
    {
        d.viewPreferences.rulerOrigin = RulerOrigin.pageOrigin;
        d.zeroPoint = [0,0];

        // Set margins to zero in case page size is smaller then margins
        d.pages[0].marginPreferences.top    = 0;
        d.pages[0].marginPreferences.right  = 0;
        d.pages[0].marginPreferences.left   = 0;
        d.pages[0].marginPreferences.bottom = 0;

        var dupl = im.parent.duplicate (d.pages[0]);

        // Imges are always rectangles
        dupl.convertShape(ConvertShapeOptions.CONVERT_TO_RECTANGLE);
        // Reset image parameters
        dupl.rotationAngle = 0;
        dupl.images[0].rotationAngle = 0;
        dupl.images[0].horizontalScale = 100;
        dupl.images[0].verticalScale = 100;
        dupl.images[0].fit(FitOptions.FRAME_TO_CONTENT);

        originalSize = dupl.images[0].geometricBounds;

        d.documentPreferences.pageHeight = originalSize[2] - originalSize[0];
        d.documentPreferences.pageWidth  = originalSize[3] - originalSize[1];

        // Make sure item is on page
        dupl.move([1, 1]); 
        // Center on the page
        d.align([dupl], AlignOptions.HORIZONTAL_CENTERS, AlignDistributeBounds.PAGE_BOUNDS);
        d.align([dupl], AlignOptions.VERTICAL_CENTERS,   AlignDistributeBounds.PAGE_BOUNDS);

        dupl.exportFile (ExportFormat.epsType, f);
    }
    catch (_) { }
    finally {d.close (SaveOptions.no)}
}

try {
    main();
} catch (e) {
    alert (e.message + '\r(line ' + e.line + ')')
};
