import React from 'react';
import { JibangData, RelationType } from '../types';
import { RELATION_HANJA, JIBANG_CONSTANTS } from '../constants';

interface JibangPreviewProps {
  slots: JibangData[];
  id?: string;
  forwardedRef?: React.RefObject<HTMLDivElement>;
  showOutlines?: boolean;
  charImages?: Record<string, string>; // Key: Char, Value: Base64
}

// Helper to get relation label for footer
const getFooterLabel = (data: JibangData) => {
    const baseLabel = RELATION_HANJA[data.relation].label.split('(')[0].trim();
    if (data.relation === RelationType.CUSTOM) return "직접 입력";
    
    // Add detail if available
    const isCouple = RELATION_HANJA[data.relation].gender === 'COUPLE';
    const isFemale = RELATION_HANJA[data.relation].gender === 'F';
    
    if (isCouple || isFemale) {
        let suffix = "";
        let details = "";

        if (isCouple) {
            suffix = "(합설)";
            const hasTertiary = !!data.hanjaFullTextTertiary;
            if (hasTertiary) suffix = "(삼위 합설)";
        }

        // Primary Wife (or Single Female) Details
        if (data.clan || data.familyName) {
             details = `${data.clan || ''} ${data.familyName || ''}씨`;
        }

        // Secondary Wife Details (if applicable)
        if (data.hanjaFullTextTertiary && (data.clanTertiary || data.familyNameTertiary)) {
             if (details) details += ", ";
             details += `${data.clanTertiary || ''} ${data.familyNameTertiary || ''}씨`;
        }
        
        if (details) {
            return `${baseLabel} (${details})${suffix}`;
        }
    }
    return baseLabel;
}

const JibangPreview: React.FC<JibangPreviewProps> = ({ slots, id, forwardedRef, showOutlines = false, charImages = {} }) => {
  // Define font stack constant to ensure consistency
  // GapyeongHanseokbongL is the primary font
  const fontStack = "'GapyeongHanseokbongL', 'ChosunGungseo', 'Gungseo', 'GungSeo', 'Batang', 'BatangChe', 'Nanum Myeongjo', serif";

  const renderTextWithImageReplacement = (text: string) => {
    return text.split('').map((char, index) => {
      // Check if we have a generated image for this character
      if (charImages[char]) {
         return (
           <img 
             key={index} 
             src={charImages[char]} 
             alt={char} 
             className="inline-block object-contain"
             style={{ 
                 width: '1em', 
                 height: '1em', 
                 // Multiply blend mode helps the white background of the generated image blend with paper
                 mixBlendMode: 'multiply' 
             }} 
           />
         );
      }
      
      // Default rendering
      return <span key={index}>{char}</span>;
    });
  };

  const renderColumn = (text: string, label: string) => (
      <div 
        className="gungseo text-black font-normal leading-tight select-none vertical-text flex items-center justify-center whitespace-nowrap"
        style={{
            fontSize: '36pt', 
            height: '100%', 
            fontFamily: fontStack 
        }}
    >
            {text ? renderTextWithImageReplacement(text) : (
            <span className="text-stone-300 text-sm font-sans tracking-normal rotate-90">
                ({label})
            </span>
        )}
    </div>
  );

  return (
    <div 
      id={id}
      ref={forwardedRef}
      className="bg-white shadow-2xl relative flex flex-col items-center overflow-hidden"
      style={{
        width: '210mm',
        height: '297mm',
        boxSizing: 'border-box',
        padding: '0', 
        fontFamily: fontStack
      }}
    >
        {/* Background Texture removed for colorless background */}

        {/* Crop Marks (Top Corners) */}
        <div className="absolute top-[5mm] left-[5mm] w-[3mm] h-[1px] bg-black"></div>
        <div className="absolute top-[5mm] left-[5mm] w-[1px] h-[3mm] bg-black"></div>
        <div className="absolute top-[5mm] right-[5mm] w-[3mm] h-[1px] bg-black"></div>
        <div className="absolute top-[5mm] right-[5mm] w-[1px] h-[3mm] bg-black"></div>

        {/* Crop Marks (Bottom Corners) */}
        <div className="absolute bottom-[5mm] left-[5mm] w-[3mm] h-[1px] bg-black"></div>
        <div className="absolute bottom-[5mm] left-[5mm] w-[1px] h-[3mm] bg-black"></div>
        <div className="absolute bottom-[5mm] right-[5mm] w-[3mm] h-[1px] bg-black"></div>
        <div className="absolute bottom-[5mm] right-[5mm] w-[1px] h-[3mm] bg-black"></div>
        
        {/* Main Content Area - Vertically Centered */}
        <div className="flex-1 flex items-center justify-center w-full">
            <div className="flex flex-row justify-center relative">
                
                {/* Crop Marks for separation (Top) */}
                <div className="absolute -top-4 left-[60mm] w-[1px] h-3 bg-stone-400"></div>
                <div className="absolute -top-4 left-[120mm] w-[1px] h-3 bg-stone-400"></div>

                {slots.map((slot, index) => {
                    const isCouple = !!slot.hanjaFullTextSecondary;
                    const hasTertiary = !!slot.hanjaFullTextTertiary;

                    return (
                        <div 
                            key={index}
                            className="relative flex flex-col items-center justify-start group"
                            style={{
                                width: '60mm',
                                height: '220mm',
                                border: showOutlines ? '1px solid black' : 'none',
                            }}
                        >
                            {/* Dashed Cut Lines (Visual Aid) - Only show if outlines are OFF */}
                            {index > 0 && !showOutlines && (
                                <div className="absolute left-0 top-0 bottom-0 w-[1px] border-l border-dashed border-stone-300 h-full"></div>
                            )}
                            
                            {/* The Actual Jibang Strip Area */}
                            <div className="w-full h-full flex items-center justify-center relative px-2">
                                {isCouple ? (
                                    hasTertiary ? (
                                        // Couple (Three People): Three Columns
                                        // Left: Male, Center: Wife 1, Right: Wife 2
                                        <div className="flex flex-row justify-center items-center w-full h-[80%] gap-2">
                                            {/* Male (Left) */}
                                            {renderColumn(slot.hanjaFullText, '남')}
                                            {/* Wife 1 (Center) */}
                                            {renderColumn(slot.hanjaFullTextSecondary || '', '본비')}
                                            {/* Wife 2 (Right) */}
                                            {renderColumn(slot.hanjaFullTextTertiary || '', '재취비')}
                                        </div>
                                    ) : (
                                        // Couple (Two People): Two Columns
                                        // Male Left, Female Right
                                        <div className="flex flex-row justify-center items-center w-full h-[80%] gap-4">
                                            {/* Male (Left) */}
                                            {renderColumn(slot.hanjaFullText, '남')}
                                            {/* Female (Right) */}
                                            {renderColumn(slot.hanjaFullTextSecondary || '', '여')}
                                        </div>
                                    )
                                ) : (
                                    // Single Column
                                    <div 
                                        className="gungseo text-black font-normal leading-tight select-none vertical-text flex items-center justify-center whitespace-nowrap"
                                        style={{
                                            fontSize: '36pt', 
                                            height: '80%', 
                                            fontFamily: fontStack 
                                        }}
                                    >
                                        {slot.hanjaFullText ? renderTextWithImageReplacement(slot.hanjaFullText) : (
                                            <span className="text-stone-300 text-sm font-sans tracking-normal rotate-90">
                                                (내용 없음)
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>

                        </div>
                    );
                })}
            </div>
        </div>

        {/* Footer Labels Area */}
        <div className="h-[30mm] w-full flex justify-center items-start pt-2">
            <div className="flex flex-row justify-center w-full">
                {slots.map((slot, index) => (
                     <div 
                        key={`footer-${index}`}
                        className="flex flex-col items-center justify-start text-center"
                        style={{ width: '60mm' }}
                     >
                        {!showOutlines && <div className="w-[1px] h-2 bg-stone-300 mb-1"></div>}
                        <span className="text-sm text-stone-900 font-sans font-medium">
                            {getFooterLabel(slot)}
                        </span>
                     </div>
                ))}
            </div>
        </div>

        {/* Crop Marks (Bottom Separators) */}
        <div className="absolute bottom-8 left-1/2 -ml-[30mm] w-[1px] h-2 bg-black"></div>
        <div className="absolute bottom-8 right-1/2 -mr-[30mm] w-[1px] h-2 bg-black"></div>

    </div>
  );
};

export default JibangPreview;