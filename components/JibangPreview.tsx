import React from 'react';
import { JibangData, RelationType } from '../types';
import { RELATION_HANJA } from '../constants';

interface JibangPreviewProps {
  slots: JibangData[];
  id?: string;
  forwardedRef?: React.RefObject<HTMLDivElement>;
  showOutlines?: boolean;
  showCropMarks?: boolean;
  isForCapture?: boolean;
}

const renderFooterLabel = (data: JibangData) => {
    const baseLabel = RELATION_HANJA[data.relation].label.split('(')[0].trim();
    
    // Style classes for Paperlogy font - Matching PDF sizes (14pt and 10pt)
    // PDF Title: 14pt, Desc: 10pt
    // PDF Spacing: Title baseline at 5mm from footer top, Desc baseline at 10mm (5mm gap)
    const containerClass = "flex flex-col items-center pt-[1mm]"; // pt-1mm to approximate baseline position
    const titleClass = "font-paperlogy font-bold text-[14pt] leading-none mb-[1.5mm]"; 
    const descClass = "font-paperlogy font-normal text-[10pt] leading-none mb-[1.5mm]";
    
    if (data.relation === RelationType.CUSTOM) {
        return (
            <div className={containerClass}>
                <span className={titleClass} style={{ color: '#1c1917' }}>직접 입력</span>
            </div>
        );
    }

    const isChild = data.relation === RelationType.SON || data.relation === RelationType.DAUGHTER;
    if (isChild) {
         return (
             <div className={containerClass}>
                 <span className={titleClass} style={{ color: '#1c1917' }}>{baseLabel}</span>
                 {data.familyName && <span className={descClass} style={{ color: '#57534e' }}>({data.familyName})</span>}
             </div>
         );
    }

    const isCouple = RELATION_HANJA[data.relation].gender === 'COUPLE';
    const isFemale = RELATION_HANJA[data.relation].gender === 'F';
    
    // Separate lines for rendering
    const title = baseLabel;
    const descriptions: string[] = [];

    if (isCouple || isFemale) {
        let details = "";
        if (data.clan || data.familyName) {
             details = `${data.clan || ''} ${data.familyName || ''}씨`;
        }

        if (details) {
            if (isCouple) {
                descriptions.push(`(비위 : ${details})`);
            } else {
                descriptions.push(`(${details})`);
            }
        }

        if (isCouple && data.hanjaFullTextTertiary && (data.clanTertiary || data.familyNameTertiary)) {
             const details2 = `${data.clanTertiary || ''} ${data.familyNameTertiary || ''}씨`;
             descriptions.push(`(재취비 : ${details2})`);
        }
    }

    return (
        <div className={containerClass}>
            <span className={titleClass} style={{ color: '#1c1917' }}>{title}</span>
            {descriptions.map((line, i) => (
                <span key={i} className={descClass} style={{ color: '#57534e' }}>{line}</span>
            ))}
        </div>
    );
};

const JibangPreview: React.FC<JibangPreviewProps> = ({ slots, id, forwardedRef, showOutlines = false, showCropMarks = true, isForCapture = false }) => {
  // Define font stack constant to ensure consistency
  // ZhenZongShengDianKaiShu-2 (Local uploaded font) should be FIRST to ensure it is used.
  const fontStack = "'ZhenZongShengDianKaiShu-2', 'Gungseo', 'GungSeo', 'Batang', 'BatangChe', 'Nanum Myeongjo', serif";

  // Configuration for matching PDF layout exactly during capture/print
  // PDF Font Size: 36pt
  const fontSize = '36pt';
  
  // PDF Text Column: 180mm center-to-center.
  // HTML justify-between distributes top-to-bottom.
  // To get 180mm center-to-center, Height = 180mm + CharHeight.
  // 36pt ~= 12.7mm. 180 + 12.7 = 192.7mm.
  const columnHeight = '192.7mm';
  
  // Adjusted: Removed translation to ensure vertical centering within the slot
  const transformStyle = 'none';

  const renderColumn = (text: string, label: string) => {
    const isSingle = text && text.length <= 1;
    
    return (
      <div 
        className={`gungseo font-normal leading-tight select-none flex flex-col items-center ${isSingle ? 'justify-center' : 'justify-between'}`}
        style={{
            color: '#000000',
            fontSize: fontSize, 
            height: columnHeight,
            width: '100%',
            fontFamily: fontStack,
            writingMode: 'horizontal-tb',
            transform: transformStyle
        }}
    >
        {text ? (
            text.split('').map((char, index) => (
                <span key={index} style={{ lineHeight: 1, display: 'block' }}>{char}</span>
            ))
        ) : (
             // Fallback for empty state needs vertical centering manually or just simple placement
             <div className="h-full flex items-center justify-center">
                <span className="text-sm font-sans tracking-normal vertical-text" style={{ color: '#d6d3d1' }}>
                    ({label})
                </span>
             </div>
        )}
    </div>
    );
  };

  // Layout Constants (in mm)
  // Matching PDF generation exactly
  const pageWidth = 210;
  const pageHeight = 297;
  const slotWidth = 60;
  const slotHeight = 220;
  const startX = (pageWidth - (slotWidth * 3)) / 2; // 15
  
  // Changed startY to fixed 20mm
  const startY = 20;
  
  const cropGap = 5;
  const cropLen = 5;

  return (
    <div 
      id={id}
      ref={forwardedRef}
      className={`relative overflow-hidden ${!isForCapture ? 'shadow-2xl' : ''}`}
      style={{
        backgroundColor: '#ffffff',
        width: `${pageWidth}mm`,
        height: `${pageHeight}mm`,
        boxSizing: 'border-box',
        fontFamily: fontStack
      }}
    >
        {/* === Registration Marks (Crop Marks) === */}
        {showCropMarks && (
          <>
            {/* Top Edge Verticals */}
            {[0, 1, 2, 3].map(i => {
               const x = startX + (i * slotWidth);
               // Line from Y = startY - 10 to startY - 5
               return (
                 <div 
                    key={`top-${i}`} 
                    className="absolute w-[0.1mm]"
                    style={{
                        backgroundColor: '#000000',
                        left: `${x}mm`,
                        top: `${startY - cropGap - cropLen}mm`,
                        height: `${cropLen}mm`
                    }}
                 />
               );
            })}

            {/* Bottom Edge Verticals */}
            {[0, 1, 2, 3].map(i => {
               const x = startX + (i * slotWidth);
               // Line from Y = startY + slotHeight + 5 to + 10
               return (
                 <div 
                    key={`bottom-${i}`} 
                    className="absolute w-[0.1mm]"
                    style={{
                        backgroundColor: '#000000',
                        left: `${x}mm`,
                        top: `${startY + slotHeight + cropGap}mm`,
                        height: `${cropLen}mm`
                    }}
                 />
               );
            })}

            {/* Left Edge Horizontals */}
            {[startY, startY + slotHeight].map((y, i) => (
                 <div 
                    key={`left-${i}`} 
                    className="absolute h-[0.1mm]"
                    style={{
                        backgroundColor: '#000000',
                        left: `${startX - cropGap - cropLen}mm`,
                        top: `${y}mm`,
                        width: `${cropLen}mm`
                    }}
                 />
            ))}

            {/* Right Edge Horizontals */}
            {[startY, startY + slotHeight].map((y, i) => (
                 <div 
                    key={`right-${i}`} 
                    className="absolute h-[0.1mm]"
                    style={{
                        backgroundColor: '#000000',
                        left: `${startX + (slotWidth * 3) + cropGap}mm`,
                        top: `${y}mm`,
                        width: `${cropLen}mm`
                    }}
                 />
            ))}
          </>
        )}

        {/* === Main Content Area (Absolute Positioned) === */}
        <div 
            className="absolute flex flex-row"
            style={{
                top: `${startY}mm`,
                left: `${startX}mm`,
                width: `${slotWidth * 3}mm`,
                height: `${slotHeight}mm`,
            }}
        >
            {slots.map((slot, index) => {
                const isCouple = !!slot.hanjaFullTextSecondary;
                const hasTertiary = !!slot.hanjaFullTextTertiary;

                return (
                    <div 
                        key={index}
                        className="relative flex flex-col items-center justify-start group"
                        style={{
                            width: `${slotWidth}mm`,
                            height: `${slotHeight}mm`,
                            border: showOutlines ? '0.1mm solid #b3b3b3' : 'none', // Thinner gray line
                            boxSizing: 'border-box'
                        }}
                    >
                        {/* The Actual Jibang Strip Area */}
                        <div className="w-full h-full flex items-center justify-center relative px-6">
                            {isCouple ? (
                                hasTertiary ? (
                                    // Couple (Three People): Three Columns
                                    // Left: Male, Center: Wife 1, Right: Wife 2
                                    <div className="flex flex-row justify-center items-center w-full h-full gap-0">
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
                                    <div className="flex flex-row justify-center items-center w-full h-full gap-0">
                                        {/* Male (Left) */}
                                        {renderColumn(slot.hanjaFullText, '남')}
                                        {/* Female (Right) */}
                                        {renderColumn(slot.hanjaFullTextSecondary || '', '여')}
                                    </div>
                                )
                            ) : (
                                // Single Column
                                <div className="flex flex-row justify-center items-center w-full h-full">
                                    {renderColumn(slot.hanjaFullText, '내용')}
                                </div>
                            )}
                        </div>

                    </div>
                );
            })}
        </div>

        {/* === Footer Labels Area === */}
        <div 
            className="absolute flex flex-row"
            style={{
                top: `${startY + slotHeight + 4.8}mm`,
                left: `${startX}mm`,
                width: `${slotWidth * 3}mm`,
            }}
        >
            {slots.map((slot, index) => (
                    <div 
                    key={`footer-${index}`}
                    className="flex flex-col items-center justify-start text-center"
                    style={{ width: `${slotWidth}mm` }}
                    >
                    {renderFooterLabel(slot)}
                    </div>
            ))}
        </div>

    </div>
  );
};

export default JibangPreview;