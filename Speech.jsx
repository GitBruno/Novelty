/***********************************************************************/
/*                                                                     */
/*      Speeech ::  Turns a shape into a speech balloon                */
/*                                                                     */
/*      [Ver: 1.01]   [Author: Marc Autret]         [Modif: 01/27/12]  */
/*      [Lang: EN]    [Req: InDesign CS4/CS5+]    [Creat: 01/27/12]    */
/*                                                                     */
/*      Installation:                                                  */
/*                                                                     */
/*      1) Place the current file into Scripts/Scripts Panel/          */
/*                                                                     */
/*      2) Start InDesign, open or create a document                   */
/*                                                                     */
/*      3) Create a shape (oval, rectangle, polygon, textframe).       */
/*                                                                     */
/*      4a) In the Control panel, click one of the reference points    */
/*          to make it the 'control point', then select the shape.     */
/*                                                                     */
/*      OR                                                             */
/*                                                                     */
/*      4b) Select the Line tool, position the mouse where you want    */
/*          the speech balloon to point to, then draw a line from      */
/*          that position to the shape. Once the guideline is drawn,   */
/*          select *both* the line and the shape.                      */
/*                                                                     */
/*      5) Exec the script from your scripts panel:                    */
/*           Window > Automation > Scripts   [CS4]                     */
/*           Window > Utilities > Scripts    [CS5]                     */
/*         + double-click on the script file name                      */
/*                                                                     */
/*      Bugs & Feedback : marc{at}indiscripts{dot}com                  */
/*                        www.indiscripts.com                          */
/*                                                                     */
/***********************************************************************/

var MU_POINTS = MeasurementUnits.POINTS,
	BB_GEO = BoundingBoxLimits.GEOMETRIC_PATH_BOUNDS,
	CS_INNER = CoordinateSpaces.INNER_COORDINATES,
	CS_PASTEBOARD = CoordinateSpaces.PASTEBOARD_COORDINATES,
	AP = AnchorPoint;

var	PEAK_MIN_DIST = 24,		// Minimum distance from the peak point to the edge (in pt)
	ATTACH_WIDTH = 6,		// Distance between the attach point and each 'twin' point (in pt)
	DEPTH = 8,				// Depth of the attach point within the frame (in pt)
	DIR_WEIGHT = .5,		// Magnitude of the direction vectors, given as a barycentric factor ]0,1]
	CURVE = 2;				// Curve factor (>=0)

//======================================
// UTILITIES
//======================================

var hitTest = function(/*PageItem*/shape, /*Number[][]*/ePath)
//--------------------------------------
{
	var t;
	try {
		(t=shape.parent.rectangles.add()).paths[0].entirePath = ePath;
		t.intersectPath(shape).remove();
		t = shape = null;
		}
	catch(_)
		{
		t && t.remove();
		}
	return !shape;
};


//======================================
// MAIN ROUTINE
//======================================

var createPeaker = function(/*PageItem*/shape, /*GraphicLine=false*/gl)
//--------------------------------------
{
	var	mSQR = Math.sqrt,
		mABS = Math.abs,
		// ---
		oInner = shape.resolve([[0,0],BB_GEO,CS_INNER],CS_INNER)[0],
		dist2 = function(/*Number[2]*/xy_, /*Number[2]=[0,0]*/_xy)
			{
				_xy || (_xy=[0,0]);
				var dx = xy_[0]-_xy[0],
					dy = xy_[1]-_xy[1];
				return dx*dx + dy*dy;
			},
		pathPointToPasteboard = function(/*PathPoint*/pp)
			{
				return pp.parent.parent.resolve([pp.anchor,[0,0],BB_GEO], CS_PASTEBOARD, true)[0];
			},
		anchorToInner = function(/*AnchorPoint|Number[2]*/xy)
			{
				var r = shape.resolve([xy,BB_GEO,CS_INNER],CS_INNER)[0];
				return [ r[0]-oInner[0], r[1]-oInner[1]];
			},
		pasteboardToInner = function(/*Number[2]*/xy)
			{
				var	r = shape.resolve(xy,CS_INNER)[0];
				return [ r[0]-oInner[0], r[1]-oInner[1]];
			},
		oPathPoint = shape.resolve([[0,0],[0,0],BB_GEO],CS_PASTEBOARD,true)[0],
		innerToPathPoint = function(/*Number[2]*/xy)
			{
				var r = shape.resolve([[xy[0]+oInner[0], xy[1]+oInner[1]],CS_INNER], CS_PASTEBOARD)[0];
				return [ r[0]-oPathPoint[0], r[1]-oPathPoint[1] ];
			},
		// ---
		u = anchorToInner([1,0])[0],
		v = anchorToInner([0,1])[1],
		inFrame = function(/*Number[2]*/xy)
			{
				return xy[0] >= 0 && xy[1] >= 0 && xy[0] <= u && xy[1] <= v;
			},
		// ---
		EDGES = [
			{index:0, value:0, alt:v},		// left
			{index:1, value:0, alt:u},		// top
			{index:0, value:u, alt:v},		// right
			{index:1, value:v, alt:u}		// bottom
			],
		p, a, paStep,
		twinPts, dirPts,
		seg, ePath, dup, edge,
		// ---
		i, j, k, t, d;
	
	// Resolve the line points (p, a) and find the nearest edge
	// ---
	if( gl )
		{
		t = gl.paths[0].pathPoints;
		seg = [
			pasteboardToInner(pathPointToPasteboard(t[0])),
			pasteboardToInner(pathPointToPasteboard(t[-1]))
			];
		t = [ inFrame(seg[0]), inFrame(seg[1]) ];
		if( t[0] != t[1] )
			{
			d = 0;
			i = +t[0];
			}
		else
			{
			d = t[0] ? 1 : -1;
			t = anchorToInner([.5,.5]);
			i = +(dist2(seg[0],t) < dist2(seg[1],t));
			}
		
		p = seg[i].concat();		// peak point
		a = seg[1-i].concat();		// attach point

		if( p[0]==(t=a[0]) && (t <= 0 || t >= u) ) return null;
		if( p[1]==(t=a[1]) && (t <= 0 || t >= v) ) return null;

		// Find the nearest edge and reset a
		// ---
		edge = null;
		for( i=0 ; i < 4 ; ++i )
			{
			t = EDGES[i];
			j = t.index;
			
			if( d )
				{
				// d==1		=>	Edge <= p < a
				// d==-1	=>	p < a < Edge
				k = t.value;
				if( -1==d )
					{
					if( k && a[j] <= k ) continue;
					if( (!k) && a[j] >= 0 ) continue;
					}
				k = (d>0?a:p)[j] - k;
				if( !k ) continue;
				k = d * (a[j] - p[j]) / k;
				}
			else
				{
				// p < Edge <= a
				k = p[j] - a[j];
				if( !k ) continue;
				k = (p[j] - t.value)/k;
				}
			if( k <= 0 || k > 1 ) continue;

			d && (k=1/k);
			k *= (a[1-j]-p[1-j]);
			
			k = ( d <= 0 ) ? (p[1-j] + k) : (a[1-j]-k);
			if( k < 0 || k > t.alt ) continue;

			a[j] = t.value;
			a[1-j] = k;
			edge = t;
			break;
			}
		if( null===edge ) return null;
		}
	else
		{
		t = app.layoutWindows.length && app.activeWindow;
		if( t && (t instanceof LayoutWindow) )
			{
			switch( t.transformReferencePoint )
				{
				case AP.BOTTOM_CENTER_ANCHOR :	t = [ [.5,1], [0,1], 3]; break;
				case AP.BOTTOM_LEFT_ANCHOR : 	t = [ [.25,1], [-1,1], 3]; break;
				case AP.LEFT_CENTER_ANCHOR :	t = [ [0,.6], [-1,1], 0]; break;
				case AP.RIGHT_CENTER_ANCHOR :	t = [ [1,.6], [1,1], 2]; break;
				case AP.TOP_CENTER_ANCHOR :		t = [ [.5,0], [0,-1], 1]; break;
				case AP.TOP_LEFT_ANCHOR :		t = [ [.25,0], [-1,-1], 1]; break;
				case AP.TOP_RIGHT_ANCHOR :		t = [ [.75,0], [1,-1], 1]; break;
				default : t = false;
				}
			}
		t || (t = [ [.75,1], [1,1], 3]); // BOTTOM_RIGHT
		a = anchorToInner(t[0]);
		p = [a[0]+PEAK_MIN_DIST*(t[1][0]), a[1]+PEAK_MIN_DIST*(t[1][1])];
		edge = EDGES[t[2]];
		d = 0;
		}

	// Set a unit vector having the p->a direction
	// ---
	d = ((d==1)?-1:1)*mSQR(dist2(a,p));
	paStep = [(a[0]-p[0])/d, (a[1]-p[1])/d];

	i = edge.index;
	j = 1-i;
	k = edge.value;
	t = k ? 1 : -1;

	// Make sure p is outside the frame with respect to PEAK_MIN_DIST
	// ---
	if( PEAK_MIN_DIST > t*(p[i]-k) )
		{
		p[i] = k + PEAK_MIN_DIST*t;
		p[j] = a[j] - paStep[j]*((a[i]-p[i])/paStep[i]);
		}

	// Make sure a intersects the shape
	// ---
	dup = shape.duplicate(undefined,[0,0]);
	seg = [
		[ 3*paStep[1]-6*paStep[0], -3*paStep[0]-6*paStep[1] ],
		[ -3*paStep[1]-6*paStep[0], 3*paStep[0]-6*paStep[1] ]
		];

	do	{
		a = [a[0]+paStep[0],a[1]+paStep[1]];
		ePath = [
			innerToPathPoint(a),
			innerToPathPoint([a[0]+seg[0][0], a[1]+seg[0][1]]),
			innerToPathPoint([a[0]+seg[1][0], a[1]+seg[1][1]])
			];
		if( hitTest(dup,ePath) ){ dup=null; break; }
		} while( inFrame(a) );
	
	if( dup !== null )
		{
		dup.remove();
		return null;
		}

	// Make sure a is inside the shape with respect to DEPTH
	// ---
	a[i] -= t*DEPTH;

	// LEFT		i=0    j=1    t=-1
	// TOP		i=1    j=0    t=-1
	// RIGHT	i=0    j=1    t=1
	// BOTTOM	i=1    j=0    t=1

	// Set the twin points
	// ---
	k = i ? t : -t;
	twinPts = [a.concat(), a.concat()];
	twinPts[0][j] -= k*ATTACH_WIDTH;
	twinPts[1][j] += k*ATTACH_WIDTH;
	
	// Set the dir points with respect to DIR_WEIGHT and CURVE
	// ---
	d = a[j] - p[j];
	dirPts = [twinPts[0].concat(), twinPts[1].concat()];

	if( d && CURVE )
		{
		k = (p[i]-a[i])/(1+DIR_WEIGHT);
		dirPts[0][i] += k;
		dirPts[1][i] += k;

		k = ((d>0)-(d<0))*CURVE*CURVE;
		dirPts[0][j] += k;
		dirPts[1][j] += k;
		}

	// Draw the peaker
	// ---
	ePath = [
		innerToPathPoint(twinPts[0]),
			[
			innerToPathPoint(dirPts[0]),
			innerToPathPoint(p),
			innerToPathPoint(dirPts[1])
			],
		innerToPathPoint(twinPts[1])
		];

	(t=shape.parent.rectangles.add()).paths[0].entirePath = ePath;
	t.addPath(shape);
	
	gl && gl.remove();

	return true;
};

//======================================
// INTERFACE
//======================================

var speeech = function(/*Polygon*/shape, /*?GraphicLine*/gLine)
//--------------------------------------
{
	// Script prefs
	// ---
	var vwPrefs = app.activeDocument.viewPreferences,
		units = [vwPrefs.horizontalMeasurementUnits, vwPrefs.verticalMeasurementUnits];
	
	vwPrefs.properties = {
		horizontalMeasurementUnits: MU_POINTS,
		verticalMeasurementUnits: MU_POINTS
		};
	app.scriptPreferences.enableRedraw = true;

	try {
		if( null === createPeaker(shape, gLine) )
			alert( "Unable to attach the objects." );
		}
	catch(e)
		{
			alert( "InDesign returned the following error:\r\r" + e );
		}

	// Restore original prefs
	// ---
	app.scriptPreferences.enableRedraw = true;

	vwPrefs.properties = {
		horizontalMeasurementUnits: units[0],
		verticalMeasurementUnits: units[1]
		};
};


//======================================
// ROOT
//======================================

var root = function()
//--------------------------------------
{
	if( !app.documents.length )
		{
		alert( "No document open." );
		}
	
	var sel = app.selection,
		i;

	switch( sel.length )
		{
		case 1 :
			if( !sel[0].hasOwnProperty('paths') ) break;
			return speeech(sel[0]);
		case 2 :
			if( !(sel[i=0] instanceof GraphicLine) && !(sel[i=1] instanceof GraphicLine) ) break;
			if( !sel[1-i].hasOwnProperty('paths') ) break;
			return speeech(sel[1-i], sel[i]);
		default :
		}

	alert( "Please select one single shape, or both a shape and a graphic line." );
};

app.doScript(root, ScriptLanguage.JAVASCRIPT, undefined, UndoModes.ENTIRE_SCRIPT, "Speeech!");