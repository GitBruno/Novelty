/*
	Auto create paragraph and character styles
	Version: 1.0
	
    Script by Thomas Silkjær
	http://indesigning.net/
*/

var the_document = app.documents.item(0);
var the_story = app.selection[0].parentStory;
var auto_pstyle_number = 0;
var auto_cstyle_number = 0;

counter = 0;
do {
	var current_paragraph = the_story.paragraphs.item(counter);
	
	counter_2 = 0;
	do {
		pstyle_is_applied = 0;
		if(pstylePropertyDifferences(current_paragraph,the_document.paragraphStyles.item(counter_2),0) != 1) {
			current_paragraph.applyParagraphStyle(the_document.paragraphStyles.item(counter_2),false);
			counter_2 = the_document.paragraphStyles.length;
			pstyle_is_applied = 1;
		}
	counter_2++;	
	} while (counter_2 < the_document.paragraphStyles.length);
	
	if(pstyle_is_applied == 0) {
		auto_pstyle_number++;
		var created_style = pstylePropertyDifferences(current_paragraph,the_document.paragraphStyles.item(0),1);
		created_style.name = "AutoStyle"+auto_pstyle_number;
		current_paragraph.applyParagraphStyle(created_style,false);
	}
	
	counter_3 = 0;
	do {
		
		var current_character = current_paragraph.characters.item(counter_3);
		
		if(current_character.styleOverridden == true) {
			counter_4 = 0;
			do {
				cstyle_is_applied = 0;
				var created_style = cstylePropertyDifferences(current_character,current_paragraph.appliedParagraphStyle,1);
				if(cstylePropertyDifferences(created_style,the_document.characterStyles.item(counter_4),0) != 1) {
					current_character.applyCharacterStyle(the_document.characterStyles.item(counter_4));
					counter_4 = the_document.characterStyles.length;
					cstyle_is_applied = 1;
				}
				created_style.remove();
			counter_4++;	
			} while (counter_4 < the_document.characterStyles.length);
			
			if(cstyle_is_applied == 0) {
				auto_cstyle_number++;
				var created_style = cstylePropertyDifferences(current_character,current_paragraph.appliedParagraphStyle,1);
				created_style.name = "AutoStyle"+auto_cstyle_number;
				current_character.applyCharacterStyle(created_style);
			}
		}
		
	counter_3++;	
	} while (counter_3 < current_paragraph.characters.length);
		
	counter++;
} while (counter < the_story.paragraphs.length);


function pstylePropertyDifferences(the_text,the_style,create_style){
	if(create_style == 1) { 
		var temporary_style = the_document.paragraphStyles.add({name:"TempStyle"});
	} else { 
		var the_difference = 0;
	}
	
	if (the_text.alignToBaseline != the_style.alignToBaseline) { if(create_style != 0) { temporary_style.alignToBaseline = the_text.alignToBaseline; } else { the_difference = 1; } }
	if (the_text.appliedFont != the_style.appliedFont) { if(create_style != 0) { temporary_style.appliedFont = the_text.appliedFont; } else { the_difference = 1; } }
	if (the_text.appliedLanguage != the_style.appliedLanguage) { if(create_style != 0) { temporary_style.appliedLanguage = the_text.appliedLanguage; } else { the_difference = 1; } }
	if (the_text.appliedNumberingList != the_style.appliedNumberingList) { if(create_style != 0) { temporary_style.appliedNumberingList = the_text.appliedNumberingList; } else { the_difference = 1; } }
	if (the_text.autoLeading != the_style.autoLeading) { if(create_style != 0) { temporary_style.autoLeading = the_text.autoLeading; } else { the_difference = 1; } }
	if (the_text.balanceRaggedLines != the_style.balanceRaggedLines) { if(create_style != 0) { temporary_style.balanceRaggedLines = the_text.balanceRaggedLines; } else { the_difference = 1; } }
	if (the_text.baselineShift != the_style.baselineShift) { if(create_style != 0) { temporary_style.baselineShift = the_text.baselineShift; } else { the_difference = 1; } }
	if (the_text.bulletsAlignment != the_style.bulletsAlignment) { if(create_style != 0) { temporary_style.bulletsAlignment = the_text.bulletsAlignment; } else { the_difference = 1; } }
	if (the_text.bulletsAndNumberingListType != the_style.bulletsAndNumberingListType) { if(create_style != 0) { temporary_style.bulletsAndNumberingListType = the_text.bulletsAndNumberingListType; } else { the_difference = 1; } }
	if (the_text.bulletsCharacterStyle != the_style.bulletsCharacterStyle) { if(create_style != 0) { temporary_style.bulletsCharacterStyle = the_text.bulletsCharacterStyle; } else { the_difference = 1; } }
	if (the_text.bulletsTextAfter != the_style.bulletsTextAfter) { if(create_style != 0) { temporary_style.bulletsTextAfter = the_text.bulletsTextAfter; } else { the_difference = 1; } }
	if (the_text.capitalization != the_style.capitalization) { if(create_style != 0) { temporary_style.capitalization = the_text.capitalization; } else { the_difference = 1; } }
	if (the_text.composer != the_style.composer) { if(create_style != 0) { temporary_style.composer = the_text.composer; } else { the_difference = 1; } }
	if (the_text.desiredGlyphScaling != the_style.desiredGlyphScaling) { if(create_style != 0) { temporary_style.desiredGlyphScaling = the_text.desiredGlyphScaling; } else { the_difference = 1; } }
	if (the_text.desiredLetterSpacing != the_style.desiredLetterSpacing) { if(create_style != 0) { temporary_style.desiredLetterSpacing = the_text.desiredLetterSpacing; } else { the_difference = 1; } }
	if (the_text.desiredWordSpacing != the_style.desiredWordSpacing) { if(create_style != 0) { temporary_style.desiredWordSpacing = the_text.desiredWordSpacing; } else { the_difference = 1; } }
	if (the_text.dropCapCharacters != the_style.dropCapCharacters) { if(create_style != 0) { temporary_style.dropCapCharacters = the_text.dropCapCharacters; } else { the_difference = 1; } }
	if (the_text.dropCapLines != the_style.dropCapLines) { if(create_style != 0) { temporary_style.dropCapLines = the_text.dropCapLines; } else { the_difference = 1; } }
	if (the_text.dropCapStyle != the_style.dropCapStyle) { if(create_style != 0) { temporary_style.dropCapStyle = the_text.dropCapStyle; } else { the_difference = 1; } }
	if (the_text.dropcapDetail != the_style.dropcapDetail) { if(create_style != 0) { temporary_style.dropcapDetail = the_text.dropcapDetail; } else { the_difference = 1; } }
	if (the_text.fillColor != the_style.fillColor) { if(create_style != 0) { temporary_style.fillColor = the_text.fillColor; } else { the_difference = 1; } }
	if (the_text.fillTint != the_style.fillTint) { if(create_style != 0) { temporary_style.fillTint = the_text.fillTint; } else { the_difference = 1; } }
	if (the_text.firstLineIndent != the_style.firstLineIndent) { if(create_style != 0) { temporary_style.firstLineIndent = the_text.firstLineIndent; } else { the_difference = 1; } }
	if (the_text.fontStyle != the_style.fontStyle) { if(create_style != 0) { temporary_style.fontStyle = the_text.fontStyle; } else { the_difference = 1; } }
	if (the_text.horizontalScale != the_style.horizontalScale) { if(create_style != 0) { temporary_style.horizontalScale = the_text.horizontalScale; } else { the_difference = 1; } }
	if (the_text.hyphenWeight != the_style.hyphenWeight) { if(create_style != 0) { temporary_style.hyphenWeight = the_text.hyphenWeight; } else { the_difference = 1; } }
	if (the_text.hyphenateAcrossColumns != the_style.hyphenateAcrossColumns) { if(create_style != 0) { temporary_style.hyphenateAcrossColumns = the_text.hyphenateAcrossColumns; } else { the_difference = 1; } }
	if (the_text.hyphenateAfterFirst != the_style.hyphenateAfterFirst) { if(create_style != 0) { temporary_style.hyphenateAfterFirst = the_text.hyphenateAfterFirst; } else { the_difference = 1; } }
	if (the_text.hyphenateBeforeLast != the_style.hyphenateBeforeLast) { if(create_style != 0) { temporary_style.hyphenateBeforeLast = the_text.hyphenateBeforeLast; } else { the_difference = 1; } }
	if (the_text.hyphenateCapitalizedWords != the_style.hyphenateCapitalizedWords) { if(create_style != 0) { temporary_style.hyphenateCapitalizedWords = the_text.hyphenateCapitalizedWords; } else { the_difference = 1; } }
	if (the_text.hyphenateLadderLimit != the_style.hyphenateLadderLimit) { if(create_style != 0) { temporary_style.hyphenateLadderLimit = the_text.hyphenateLadderLimit; } else { the_difference = 1; } }
	if (the_text.hyphenateLastWord != the_style.hyphenateLastWord) { if(create_style != 0) { temporary_style.hyphenateLastWord = the_text.hyphenateLastWord; } else { the_difference = 1; } }
	if (the_text.hyphenateWordsLongerThan != the_style.hyphenateWordsLongerThan) { if(create_style != 0) { temporary_style.hyphenateWordsLongerThan = the_text.hyphenateWordsLongerThan; } else { the_difference = 1; } }
	if (the_text.hyphenation != the_style.hyphenation) { if(create_style != 0) { temporary_style.hyphenation = the_text.hyphenation; } else { the_difference = 1; } }
	if (the_text.hyphenationZone != the_style.hyphenationZone) { if(create_style != 0) { temporary_style.hyphenationZone = the_text.hyphenationZone; } else { the_difference = 1; } }
	if (the_text.ignoreEdgeAlignment != the_style.ignoreEdgeAlignment) { if(create_style != 0) { temporary_style.ignoreEdgeAlignment = the_text.ignoreEdgeAlignment; } else { the_difference = 1; } }
	if (the_text.justification != the_style.justification) { if(create_style != 0) { temporary_style.justification = the_text.justification; } else { the_difference = 1; } }
	if (the_text.keepAllLinesTogether != the_style.keepAllLinesTogether) { if(create_style != 0) { temporary_style.keepAllLinesTogether = the_text.keepAllLinesTogether; } else { the_difference = 1; } }
	if (the_text.keepFirstLines != the_style.keepFirstLines) { if(create_style != 0) { temporary_style.keepFirstLines = the_text.keepFirstLines; } else { the_difference = 1; } }
	if (the_text.keepLastLines != the_style.keepLastLines) { if(create_style != 0) { temporary_style.keepLastLines = the_text.keepLastLines; } else { the_difference = 1; } }
	if (the_text.keepLinesTogether != the_style.keepLinesTogether) { if(create_style != 0) { temporary_style.keepLinesTogether = the_text.keepLinesTogether; } else { the_difference = 1; } }
	if (the_text.keepRuleAboveInFrame != the_style.keepRuleAboveInFrame) { if(create_style != 0) { temporary_style.keepRuleAboveInFrame = the_text.keepRuleAboveInFrame; } else { the_difference = 1; } }
	if (the_text.keepWithNext != the_style.keepWithNext) { if(create_style != 0) { temporary_style.keepWithNext = the_text.keepWithNext; } else { the_difference = 1; } }
	if (the_text.kerningMethod != the_style.kerningMethod) { if(create_style != 0) { temporary_style.kerningMethod = the_text.kerningMethod; } else { the_difference = 1; } }
	if (the_text.lastLineIndent != the_style.lastLineIndent) { if(create_style != 0) { temporary_style.lastLineIndent = the_text.lastLineIndent; } else { the_difference = 1; } }
	if (the_text.leading != the_style.leading) { if(create_style != 0) { temporary_style.leading = the_text.leading; } else { the_difference = 1; } }
	if (the_text.leftIndent != the_style.leftIndent) { if(create_style != 0) { temporary_style.leftIndent = the_text.leftIndent; } else { the_difference = 1; } }
	if (the_text.ligatures != the_style.ligatures) { if(create_style != 0) { temporary_style.ligatures = the_text.ligatures; } else { the_difference = 1; } }
	if (the_text.maximumGlyphScaling != the_style.maximumGlyphScaling) { if(create_style != 0) { temporary_style.maximumGlyphScaling = the_text.maximumGlyphScaling; } else { the_difference = 1; } }
	if (the_text.maximumLetterSpacing != the_style.maximumLetterSpacing) { if(create_style != 0) { temporary_style.maximumLetterSpacing = the_text.maximumLetterSpacing; } else { the_difference = 1; } }
	if (the_text.maximumWordSpacing != the_style.maximumWordSpacing) { if(create_style != 0) { temporary_style.maximumWordSpacing = the_text.maximumWordSpacing; } else { the_difference = 1; } }
	if (the_text.minimumGlyphScaling != the_style.minimumGlyphScaling) { if(create_style != 0) { temporary_style.minimumGlyphScaling = the_text.minimumGlyphScaling; } else { the_difference = 1; } }
	if (the_text.minimumLetterSpacing != the_style.minimumLetterSpacing) { if(create_style != 0) { temporary_style.minimumLetterSpacing = the_text.minimumLetterSpacing; } else { the_difference = 1; } }
	if (the_text.minimumWordSpacing != the_style.minimumWordSpacing) { if(create_style != 0) { temporary_style.minimumWordSpacing = the_text.minimumWordSpacing; } else { the_difference = 1; } }
	if (the_text.noBreak != the_style.noBreak) { if(create_style != 0) { temporary_style.noBreak = the_text.noBreak; } else { the_difference = 1; } }
	if (the_text.numberingAlignment != the_style.numberingAlignment) { if(create_style != 0) { temporary_style.numberingAlignment = the_text.numberingAlignment; } else { the_difference = 1; } }
	if (the_text.numberingApplyRestartPolicy != the_style.numberingApplyRestartPolicy) { if(create_style != 0) { temporary_style.numberingApplyRestartPolicy = the_text.numberingApplyRestartPolicy; } else { the_difference = 1; } }
	if (the_text.numberingCharacterStyle != the_style.numberingCharacterStyle) { if(create_style != 0) { temporary_style.numberingCharacterStyle = the_text.numberingCharacterStyle; } else { the_difference = 1; } }
	if (the_text.numberingContinue != the_style.numberingContinue) { if(create_style != 0) { temporary_style.numberingContinue = the_text.numberingContinue; } else { the_difference = 1; } }
	if (the_text.numberingExpression != the_style.numberingExpression) { if(create_style != 0) { temporary_style.numberingExpression = the_text.numberingExpression; } else { the_difference = 1; } }
	if (the_text.numberingFormat != the_style.numberingFormat) { if(create_style != 0) { temporary_style.numberingFormat = the_text.numberingFormat; } else { the_difference = 1; } }
	if (the_text.numberingLevel != the_style.numberingLevel) { if(create_style != 0) { temporary_style.numberingLevel = the_text.numberingLevel; } else { the_difference = 1; } }
	if (the_text.numberingStartAt != the_style.numberingStartAt) { if(create_style != 0) { temporary_style.numberingStartAt = the_text.numberingStartAt; } else { the_difference = 1; } }
	if (the_text.otfContextualAlternate != the_style.otfContextualAlternate) { if(create_style != 0) { temporary_style.otfContextualAlternate = the_text.otfContextualAlternate; } else { the_difference = 1; } }
	if (the_text.otfDiscretionaryLigature != the_style.otfDiscretionaryLigature) { if(create_style != 0) { temporary_style.otfDiscretionaryLigature = the_text.otfDiscretionaryLigature; } else { the_difference = 1; } }
	if (the_text.otfFigureStyle != the_style.otfFigureStyle) { if(create_style != 0) { temporary_style.otfFigureStyle = the_text.otfFigureStyle; } else { the_difference = 1; } }
	if (the_text.otfFraction != the_style.otfFraction) { if(create_style != 0) { temporary_style.otfFraction = the_text.otfFraction; } else { the_difference = 1; } }
	if (the_text.otfHistorical != the_style.otfHistorical) { if(create_style != 0) { temporary_style.otfHistorical = the_text.otfHistorical; } else { the_difference = 1; } }
	if (the_text.otfLocale != the_style.otfLocale) { if(create_style != 0) { temporary_style.otfLocale = the_text.otfLocale; } else { the_difference = 1; } }
	if (the_text.otfMark != the_style.otfMark) { if(create_style != 0) { temporary_style.otfMark = the_text.otfMark; } else { the_difference = 1; } }
	if (the_text.otfOrdinal != the_style.otfOrdinal) { if(create_style != 0) { temporary_style.otfOrdinal = the_text.otfOrdinal; } else { the_difference = 1; } }
	if (the_text.otfSlashedZero != the_style.otfSlashedZero) { if(create_style != 0) { temporary_style.otfSlashedZero = the_text.otfSlashedZero; } else { the_difference = 1; } }
	if (the_text.otfStylisticSets != the_style.otfStylisticSets) { if(create_style != 0) { temporary_style.otfStylisticSets = the_text.otfStylisticSets; } else { the_difference = 1; } }
	if (the_text.otfSwash != the_style.otfSwash) { if(create_style != 0) { temporary_style.otfSwash = the_text.otfSwash; } else { the_difference = 1; } }
	if (the_text.otfTitling != the_style.otfTitling) { if(create_style != 0) { temporary_style.otfTitling = the_text.otfTitling; } else { the_difference = 1; } }
	if (the_text.overprintFill != the_style.overprintFill) { if(create_style != 0) { temporary_style.overprintFill = the_text.overprintFill; } else { the_difference = 1; } }
	if (the_text.overprintStroke != the_style.overprintStroke) { if(create_style != 0) { temporary_style.overprintStroke = the_text.overprintStroke; } else { the_difference = 1; } }
	if (the_text.pointSize != the_style.pointSize) { if(create_style != 0) { temporary_style.pointSize = the_text.pointSize; } else { the_difference = 1; } }
	if (the_text.position != the_style.position) { if(create_style != 0) { temporary_style.position = the_text.position; } else { the_difference = 1; } }
	if (the_text.positionalForm != the_style.positionalForm) { if(create_style != 0) { temporary_style.positionalForm = the_text.positionalForm; } else { the_difference = 1; } }
	if (the_text.rightIndent != the_style.rightIndent) { if(create_style != 0) { temporary_style.rightIndent = the_text.rightIndent; } else { the_difference = 1; } }
	if (the_text.ruleAbove != the_style.ruleAbove) { if(create_style != 0) { temporary_style.ruleAbove = the_text.ruleAbove; } else { the_difference = 1; } }
	if (the_text.ruleAboveColor != the_style.ruleAboveColor) { if(create_style != 0) { temporary_style.ruleAboveColor = the_text.ruleAboveColor; } else { the_difference = 1; } }
	if (the_text.ruleAboveGapColor != the_style.ruleAboveGapColor) { if(create_style != 0) { temporary_style.ruleAboveGapColor = the_text.ruleAboveGapColor; } else { the_difference = 1; } }
	if (the_text.ruleAboveGapOverprint != the_style.ruleAboveGapOverprint) { if(create_style != 0) { temporary_style.ruleAboveGapOverprint = the_text.ruleAboveGapOverprint; } else { the_difference = 1; } }
	if (the_text.ruleAboveGapTint != the_style.ruleAboveGapTint) { if(create_style != 0) { temporary_style.ruleAboveGapTint = the_text.ruleAboveGapTint; } else { the_difference = 1; } }
	if (the_text.ruleAboveLeftIndent != the_style.ruleAboveLeftIndent) { if(create_style != 0) { temporary_style.ruleAboveLeftIndent = the_text.ruleAboveLeftIndent; } else { the_difference = 1; } }
	if (the_text.ruleAboveLineWeight != the_style.ruleAboveLineWeight) { if(create_style != 0) { temporary_style.ruleAboveLineWeight = the_text.ruleAboveLineWeight; } else { the_difference = 1; } }
	if (the_text.ruleAboveOffset != the_style.ruleAboveOffset) { if(create_style != 0) { temporary_style.ruleAboveOffset = the_text.ruleAboveOffset; } else { the_difference = 1; } }
	if (the_text.ruleAboveOverprint != the_style.ruleAboveOverprint) { if(create_style != 0) { temporary_style.ruleAboveOverprint = the_text.ruleAboveOverprint; } else { the_difference = 1; } }
	if (the_text.ruleAboveRightIndent != the_style.ruleAboveRightIndent) { if(create_style != 0) { temporary_style.ruleAboveRightIndent = the_text.ruleAboveRightIndent; } else { the_difference = 1; } }
	if (the_text.ruleAboveTint != the_style.ruleAboveTint) { if(create_style != 0) { temporary_style.ruleAboveTint = the_text.ruleAboveTint; } else { the_difference = 1; } }
	if (the_text.ruleAboveType != the_style.ruleAboveType) { if(create_style != 0) { temporary_style.ruleAboveType = the_text.ruleAboveType; } else { the_difference = 1; } }
	if (the_text.ruleAboveWidth != the_style.ruleAboveWidth) { if(create_style != 0) { temporary_style.ruleAboveWidth = the_text.ruleAboveWidth; } else { the_difference = 1; } }
	if (the_text.ruleBelow != the_style.ruleBelow) { if(create_style != 0) { temporary_style.ruleBelow = the_text.ruleBelow; } else { the_difference = 1; } }
	if (the_text.ruleBelowColor != the_style.ruleBelowColor) { if(create_style != 0) { temporary_style.ruleBelowColor = the_text.ruleBelowColor; } else { the_difference = 1; } }
	if (the_text.ruleBelowGapColor != the_style.ruleBelowGapColor) { if(create_style != 0) { temporary_style.ruleBelowGapColor = the_text.ruleBelowGapColor; } else { the_difference = 1; } }
	if (the_text.ruleBelowGapOverprint != the_style.ruleBelowGapOverprint) { if(create_style != 0) { temporary_style.ruleBelowGapOverprint = the_text.ruleBelowGapOverprint; } else { the_difference = 1; } }
	if (the_text.ruleBelowGapTint != the_style.ruleBelowGapTint) { if(create_style != 0) { temporary_style.ruleBelowGapTint = the_text.ruleBelowGapTint; } else { the_difference = 1; } }
	if (the_text.ruleBelowLeftIndent != the_style.ruleBelowLeftIndent) { if(create_style != 0) { temporary_style.ruleBelowLeftIndent = the_text.ruleBelowLeftIndent; } else { the_difference = 1; } }
	if (the_text.ruleBelowLineWeight != the_style.ruleBelowLineWeight) { if(create_style != 0) { temporary_style.ruleBelowLineWeight = the_text.ruleBelowLineWeight; } else { the_difference = 1; } }
	if (the_text.ruleBelowOffset != the_style.ruleBelowOffset) { if(create_style != 0) { temporary_style.ruleBelowOffset = the_text.ruleBelowOffset; } else { the_difference = 1; } }
	if (the_text.ruleBelowOverprint != the_style.ruleBelowOverprint) { if(create_style != 0) { temporary_style.ruleBelowOverprint = the_text.ruleBelowOverprint; } else { the_difference = 1; } }
	if (the_text.ruleBelowRightIndent != the_style.ruleBelowRightIndent) { if(create_style != 0) { temporary_style.ruleBelowRightIndent = the_text.ruleBelowRightIndent; } else { the_difference = 1; } }
	if (the_text.ruleBelowTint != the_style.ruleBelowTint) { if(create_style != 0) { temporary_style.ruleBelowTint = the_text.ruleBelowTint; } else { the_difference = 1; } }
	if (the_text.ruleBelowType != the_style.ruleBelowType) { if(create_style != 0) { temporary_style.ruleBelowType = the_text.ruleBelowType; } else { the_difference = 1; } }
	if (the_text.ruleBelowWidth != the_style.ruleBelowWidth) { if(create_style != 0) { temporary_style.ruleBelowWidth = the_text.ruleBelowWidth; } else { the_difference = 1; } }
	if (the_text.singleWordJustification != the_style.singleWordJustification) { if(create_style != 0) { temporary_style.singleWordJustification = the_text.singleWordJustification; } else { the_difference = 1; } }
	if (the_text.skew != the_style.skew) { if(create_style != 0) { temporary_style.skew = the_text.skew; } else { the_difference = 1; } }
	if (the_text.spaceAfter != the_style.spaceAfter) { if(create_style != 0) { temporary_style.spaceAfter = the_text.spaceAfter; } else { the_difference = 1; } }
	if (the_text.spaceBefore != the_style.spaceBefore) { if(create_style != 0) { temporary_style.spaceBefore = the_text.spaceBefore; } else { the_difference = 1; } }
	if (the_text.startParagraph != the_style.startParagraph) { if(create_style != 0) { temporary_style.startParagraph = the_text.startParagraph; } else { the_difference = 1; } }
	if (the_text.strikeThroughColor != the_style.strikeThroughColor) { if(create_style != 0) { temporary_style.strikeThroughColor = the_text.strikeThroughColor; } else { the_difference = 1; } }
	if (the_text.strikeThroughGapColor != the_style.strikeThroughGapColor) { if(create_style != 0) { temporary_style.strikeThroughGapColor = the_text.strikeThroughGapColor; } else { the_difference = 1; } }
	if (the_text.strikeThroughGapOverprint != the_style.strikeThroughGapOverprint) { if(create_style != 0) { temporary_style.strikeThroughGapOverprint = the_text.strikeThroughGapOverprint; } else { the_difference = 1; } }
	if (the_text.strikeThroughGapTint != the_style.strikeThroughGapTint) { if(create_style != 0) { temporary_style.strikeThroughGapTint = the_text.strikeThroughGapTint; } else { the_difference = 1; } }
	if (the_text.strikeThroughOffset != the_style.strikeThroughOffset) { if(create_style != 0) { temporary_style.strikeThroughOffset = the_text.strikeThroughOffset; } else { the_difference = 1; } }
	if (the_text.strikeThroughOverprint != the_style.strikeThroughOverprint) { if(create_style != 0) { temporary_style.strikeThroughOverprint = the_text.strikeThroughOverprint; } else { the_difference = 1; } }
	if (the_text.strikeThroughTint != the_style.strikeThroughTint) { if(create_style != 0) { temporary_style.strikeThroughTint = the_text.strikeThroughTint; } else { the_difference = 1; } }
	if (the_text.strikeThroughType != the_style.strikeThroughType) { if(create_style != 0) { temporary_style.strikeThroughType = the_text.strikeThroughType; } else { the_difference = 1; } }
	if (the_text.strikeThroughWeight != the_style.strikeThroughWeight) { if(create_style != 0) { temporary_style.strikeThroughWeight = the_text.strikeThroughWeight; } else { the_difference = 1; } }
	if (the_text.strikeThru != the_style.strikeThru) { if(create_style != 0) { temporary_style.strikeThru = the_text.strikeThru; } else { the_difference = 1; } }
	if (the_text.strokeColor != the_style.strokeColor) { if(create_style != 0) { temporary_style.strokeColor = the_text.strokeColor; } else { the_difference = 1; } }
	if (the_text.strokeTint != the_style.strokeTint) { if(create_style != 0) { temporary_style.strokeTint = the_text.strokeTint; } else { the_difference = 1; } }
	if (the_text.strokeWeight != the_style.strokeWeight) { if(create_style != 0) { temporary_style.strokeWeight = the_text.strokeWeight; } else { the_difference = 1; } }
	if (the_text.tracking != the_style.tracking) { if(create_style != 0) { temporary_style.tracking = the_text.tracking; } else { the_difference = 1; } }
	if (the_text.underline != the_style.underline) { if(create_style != 0) { temporary_style.underline = the_text.underline; } else { the_difference = 1; } }
	if (the_text.underlineColor != the_style.underlineColor) { if(create_style != 0) { temporary_style.underlineColor = the_text.underlineColor; } else { the_difference = 1; } }
	if (the_text.underlineGapColor != the_style.underlineGapColor) { if(create_style != 0) { temporary_style.underlineGapColor = the_text.underlineGapColor; } else { the_difference = 1; } }
	if (the_text.underlineGapOverprint != the_style.underlineGapOverprint) { if(create_style != 0) { temporary_style.underlineGapOverprint = the_text.underlineGapOverprint; } else { the_difference = 1; } }
	if (the_text.underlineGapTint != the_style.underlineGapTint) { if(create_style != 0) { temporary_style.underlineGapTint = the_text.underlineGapTint; } else { the_difference = 1; } }
	if (the_text.underlineOffset != the_style.underlineOffset) { if(create_style != 0) { temporary_style.underlineOffset = the_text.underlineOffset; } else { the_difference = 1; } }
	if (the_text.underlineOverprint != the_style.underlineOverprint) { if(create_style != 0) { temporary_style.underlineOverprint = the_text.underlineOverprint; } else { the_difference = 1; } }
	if (the_text.underlineTint != the_style.underlineTint) { if(create_style != 0) { temporary_style.underlineTint = the_text.underlineTint; } else { the_difference = 1; } }
	if (the_text.underlineType != the_style.underlineType) { if(create_style != 0) { temporary_style.underlineType = the_text.underlineType; } else { the_difference = 1; } }
	if (the_text.underlineWeight != the_style.underlineWeight) { if(create_style != 0) { temporary_style.underlineWeight = the_text.underlineWeight; } else { the_difference = 1; } }
	if (the_text.verticalScale != the_style.verticalScale) { if(create_style != 0) { temporary_style.verticalScale = the_text.verticalScale; } else { the_difference = 1; } }

	if(create_style != 0) { 
		return temporary_style;
	} else { 
		return the_difference;
	}
}

function cstylePropertyDifferences(the_text,the_style,create_style){
	if(create_style == 1) { 
		var temporary_style = the_document.characterStyles.add({name:"TempStyle"});
	} else { 
		var the_difference = 0;
	}
	
	if (the_text.appliedFont != the_style.appliedFont) { if(create_style != 0) { temporary_style.appliedFont = the_text.appliedFont; } else { the_difference = 1; } }
	if (the_text.appliedLanguage != the_style.appliedLanguage) { if(create_style != 0) { temporary_style.appliedLanguage = the_text.appliedLanguage; } else { the_difference = 1; } }
	if (the_text.baselineShift != the_style.baselineShift) { if(create_style != 0) { temporary_style.baselineShift = the_text.baselineShift; } else { the_difference = 1; } }
	if (the_text.capitalization != the_style.capitalization) { if(create_style != 0) { temporary_style.capitalization = the_text.capitalization; } else { the_difference = 1; } }
	if (the_text.fillColor != the_style.fillColor) { if(create_style != 0) { temporary_style.fillColor = the_text.fillColor; } else { the_difference = 1; } }
	if (the_text.fillTint != the_style.fillTint) { if(create_style != 0) { temporary_style.fillTint = the_text.fillTint; } else { the_difference = 1; } }
	if (the_text.fontStyle != the_style.fontStyle) { if(create_style != 0) { temporary_style.fontStyle = the_text.fontStyle; } else { the_difference = 1; } }
	if (the_text.horizontalScale != the_style.horizontalScale) { if(create_style != 0) { temporary_style.horizontalScale = the_text.horizontalScale; } else { the_difference = 1; } }
	if (the_text.kerningMethod != the_style.kerningMethod) { if(create_style != 0) { temporary_style.kerningMethod = the_text.kerningMethod; } else { the_difference = 1; } }
	if (the_text.leading != the_style.leading) { if(create_style != 0) { temporary_style.leading = the_text.leading; } else { the_difference = 1; } }
	if (the_text.ligatures != the_style.ligatures) { if(create_style != 0) { temporary_style.ligatures = the_text.ligatures; } else { the_difference = 1; } }
	if (the_text.noBreak != the_style.noBreak) { if(create_style != 0) { temporary_style.noBreak = the_text.noBreak; } else { the_difference = 1; } }
	if (the_text.otfContextualAlternate != the_style.otfContextualAlternate) { if(create_style != 0) { temporary_style.otfContextualAlternate = the_text.otfContextualAlternate; } else { the_difference = 1; } }
	if (the_text.otfDiscretionaryLigature != the_style.otfDiscretionaryLigature) { if(create_style != 0) { temporary_style.otfDiscretionaryLigature = the_text.otfDiscretionaryLigature; } else { the_difference = 1; } }
	if (the_text.otfFigureStyle != the_style.otfFigureStyle) { if(create_style != 0) { temporary_style.otfFigureStyle = the_text.otfFigureStyle; } else { the_difference = 1; } }
	if (the_text.otfFraction != the_style.otfFraction) { if(create_style != 0) { temporary_style.otfFraction = the_text.otfFraction; } else { the_difference = 1; } }
	if (the_text.otfHistorical != the_style.otfHistorical) { if(create_style != 0) { temporary_style.otfHistorical = the_text.otfHistorical; } else { the_difference = 1; } }
	if (the_text.otfLocale != the_style.otfLocale) { if(create_style != 0) { temporary_style.otfLocale = the_text.otfLocale; } else { the_difference = 1; } }
	if (the_text.otfMark != the_style.otfMark) { if(create_style != 0) { temporary_style.otfMark = the_text.otfMark; } else { the_difference = 1; } }
	if (the_text.otfOrdinal != the_style.otfOrdinal) { if(create_style != 0) { temporary_style.otfOrdinal = the_text.otfOrdinal; } else { the_difference = 1; } }
	if (the_text.otfSlashedZero != the_style.otfSlashedZero) { if(create_style != 0) { temporary_style.otfSlashedZero = the_text.otfSlashedZero; } else { the_difference = 1; } }
	if (the_text.otfStylisticSets != the_style.otfStylisticSets) { if(create_style != 0) { temporary_style.otfStylisticSets = the_text.otfStylisticSets; } else { the_difference = 1; } }
	if (the_text.otfSwash != the_style.otfSwash) { if(create_style != 0) { temporary_style.otfSwash = the_text.otfSwash; } else { the_difference = 1; } }
	if (the_text.otfTitling != the_style.otfTitling) { if(create_style != 0) { temporary_style.otfTitling = the_text.otfTitling; } else { the_difference = 1; } }
	if (the_text.overprintFill != the_style.overprintFill) { if(create_style != 0) { temporary_style.overprintFill = the_text.overprintFill; } else { the_difference = 1; } }
	if (the_text.overprintStroke != the_style.overprintStroke) { if(create_style != 0) { temporary_style.overprintStroke = the_text.overprintStroke; } else { the_difference = 1; } }
	if (the_text.pointSize != the_style.pointSize) { if(create_style != 0) { temporary_style.pointSize = the_text.pointSize; } else { the_difference = 1; } }
	if (the_text.position != the_style.position) { if(create_style != 0) { temporary_style.position = the_text.position; } else { the_difference = 1; } }
	if (the_text.positionalForm != the_style.positionalForm) { if(create_style != 0) { temporary_style.positionalForm = the_text.positionalForm; } else { the_difference = 1; } }
	if (the_text.skew != the_style.skew) { if(create_style != 0) { temporary_style.skew = the_text.skew; } else { the_difference = 1; } }
	if (the_text.strikeThroughColor != the_style.strikeThroughColor) { if(create_style != 0) { temporary_style.strikeThroughColor = the_text.strikeThroughColor; } else { the_difference = 1; } }
	if (the_text.strikeThroughGapColor != the_style.strikeThroughGapColor) { if(create_style != 0) { temporary_style.strikeThroughGapColor = the_text.strikeThroughGapColor; } else { the_difference = 1; } }
	if (the_text.strikeThroughGapOverprint != the_style.strikeThroughGapOverprint) { if(create_style != 0) { temporary_style.strikeThroughGapOverprint = the_text.strikeThroughGapOverprint; } else { the_difference = 1; } }
	if (the_text.strikeThroughGapTint != the_style.strikeThroughGapTint) { if(create_style != 0) { temporary_style.strikeThroughGapTint = the_text.strikeThroughGapTint; } else { the_difference = 1; } }
	if (the_text.strikeThroughOffset != the_style.strikeThroughOffset) { if(create_style != 0) { temporary_style.strikeThroughOffset = the_text.strikeThroughOffset; } else { the_difference = 1; } }
	if (the_text.strikeThroughOverprint != the_style.strikeThroughOverprint) { if(create_style != 0) { temporary_style.strikeThroughOverprint = the_text.strikeThroughOverprint; } else { the_difference = 1; } }
	if (the_text.strikeThroughTint != the_style.strikeThroughTint) { if(create_style != 0) { temporary_style.strikeThroughTint = the_text.strikeThroughTint; } else { the_difference = 1; } }
	if (the_text.strikeThroughType != the_style.strikeThroughType) { if(create_style != 0) { temporary_style.strikeThroughType = the_text.strikeThroughType; } else { the_difference = 1; } }
	if (the_text.strikeThroughWeight != the_style.strikeThroughWeight) { if(create_style != 0) { temporary_style.strikeThroughWeight = the_text.strikeThroughWeight; } else { the_difference = 1; } }
	if (the_text.strikeThru != the_style.strikeThru) { if(create_style != 0) { temporary_style.strikeThru = the_text.strikeThru; } else { the_difference = 1; } }
	if (the_text.strokeColor != the_style.strokeColor) { if(create_style != 0) { temporary_style.strokeColor = the_text.strokeColor; } else { the_difference = 1; } }
	if (the_text.strokeTint != the_style.strokeTint) { if(create_style != 0) { temporary_style.strokeTint = the_text.strokeTint; } else { the_difference = 1; } }
	if (the_text.strokeWeight != the_style.strokeWeight) { if(create_style != 0) { temporary_style.strokeWeight = the_text.strokeWeight; } else { the_difference = 1; } }
	if (the_text.tracking != the_style.tracking) { if(create_style != 0) { temporary_style.tracking = the_text.tracking; } else { the_difference = 1; } }
	if (the_text.underline != the_style.underline) { if(create_style != 0) { temporary_style.underline = the_text.underline; } else { the_difference = 1; } }
	if (the_text.underlineColor != the_style.underlineColor) { if(create_style != 0) { temporary_style.underlineColor = the_text.underlineColor; } else { the_difference = 1; } }
	if (the_text.underlineGapColor != the_style.underlineGapColor) { if(create_style != 0) { temporary_style.underlineGapColor = the_text.underlineGapColor; } else { the_difference = 1; } }
	if (the_text.underlineGapOverprint != the_style.underlineGapOverprint) { if(create_style != 0) { temporary_style.underlineGapOverprint = the_text.underlineGapOverprint; } else { the_difference = 1; } }
	if (the_text.underlineGapTint != the_style.underlineGapTint) { if(create_style != 0) { temporary_style.underlineGapTint = the_text.underlineGapTint; } else { the_difference = 1; } }
	if (the_text.underlineOffset != the_style.underlineOffset) { if(create_style != 0) { temporary_style.underlineOffset = the_text.underlineOffset; } else { the_difference = 1; } }
	if (the_text.underlineOverprint != the_style.underlineOverprint) { if(create_style != 0) { temporary_style.underlineOverprint = the_text.underlineOverprint; } else { the_difference = 1; } }
	if (the_text.underlineTint != the_style.underlineTint) { if(create_style != 0) { temporary_style.underlineTint = the_text.underlineTint; } else { the_difference = 1; } }
	if (the_text.underlineType != the_style.underlineType) { if(create_style != 0) { temporary_style.underlineType = the_text.underlineType; } else { the_difference = 1; } }
	if (the_text.underlineWeight != the_style.underlineWeight) { if(create_style != 0) { temporary_style.underlineWeight = the_text.underlineWeight; } else { the_difference = 1; } }
	if (the_text.verticalScale != the_style.verticalScale) { if(create_style != 0) { temporary_style.verticalScale = the_text.verticalScale; } else { the_difference = 1; } }

	if(create_style != 0) { 
		return temporary_style;
	} else { 
		return the_difference;
	}
}

alert("Done!");