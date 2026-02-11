import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import { JibangData, RelationType } from './types';
import { RELATION_HANJA } from './constants';
import JibangForm from './components/JibangForm';
import JibangPreview from './components/JibangPreview';
import AiModal from './components/AiModal';
import { ArrowDownTrayIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const DEFAULT_DATA: JibangData = {
  relation: RelationType.FATHER,
  title: '',
  clan: '',
  familyName: '',
  customText: '',
  // Initial Default for Father
  koreanFullText: '현고학생부군신위',
  hanjaFullText: '顯考學生府君神位' 
};

const App: React.FC = () => {
  // Manage 3 slots.
  const [slots, setSlots] = useState<JibangData[]>([
    { ...DEFAULT_DATA },
    { ...DEFAULT_DATA },
    { ...DEFAULT_DATA }
  ]);
  
  // Track if slot 2 and 3 are custom. Slot 1 (index 0) is always custom/base.
  // Default: false (inherit from 1)
  const [isCustom, setIsCustom] = useState<boolean[]>([true, false, false]);
  const [showOutlines, setShowOutlines] = useState(false); // New state for outlines
  
  const [activeSlotIndex, setActiveSlotIndex] = useState(0); // 0, 1, 2
  
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Ref is kept for Preview UI only, not used for PDF generation anymore
  const previewRef = useRef<HTMLDivElement>(null);

  // Compute the data that will actually be displayed/printed
  const effectiveSlots = slots.map((slot, index) => {
    if (index === 0) return slot;
    return isCustom[index] ? slot : slots[0];
  });

  const handleSlotChange = (newData: JibangData) => {
    const newSlots = [...slots];
    newSlots[activeSlotIndex] = newData;
    setSlots(newSlots);
  };

  const toggleCustom = (index: number) => {
    if (index === 0) return; // Should not happen

    const willBeCustom = !isCustom[index];
    const newIsCustom = [...isCustom];
    newIsCustom[index] = willBeCustom;
    setIsCustom(newIsCustom);

    // If enabling custom mode, copy current data from slot 1 (index 0) as a starting point
    if (willBeCustom) {
        const newSlots = [...slots];
        newSlots[index] = { ...slots[0] };
        setSlots(newSlots);
    }
  };

  // Helper to generate label string for PDF footer
  const getLabelText = (data: JibangData) => {
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
             if (data.hanjaFullTextTertiary) suffix = "(삼위 합설)";
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
  };

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      // 1. Initialize jsPDF (A4 Portrait, mm)
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // 2. Fetch and embed the local font for Vector support
      // Use the local file path instead of the CDN
      const fontUrl = './ZhenZongShengDianKaiShu-2.woff';
      const response = await fetch(fontUrl);
      if (!response.ok) throw new Error('Font file not found');
      const fontBuffer = await response.arrayBuffer();
      
      const fontData = Array.from(new Uint8Array(fontBuffer))
        .map(b => String.fromCharCode(b))
        .join("");

      doc.addFileToVFS('ChosunGungseo.woff', fontData);
      doc.addFont('ChosunGungseo.woff', 'ChosunGungseo', 'normal');
      doc.setFont('ChosunGungseo');

      // 3. Layout Constants
      const pageWidth = 210;
      const pageHeight = 297;
      
      const slotWidth = 60;
      const slotHeight = 220;
      const totalWidth = slotWidth * 3; // 180mm
      const startX = (pageWidth - totalWidth) / 2; // Centered: 15mm
      const startY = (pageHeight - slotHeight) / 2; // Vertically Centered relative to slot area

      // 4. Draw Crop Marks & Layout
      doc.setLineWidth(0.1);
      doc.setDrawColor(0, 0, 0); // Black

      // Corner Crop Marks (5mm length)
      const cropLen = 5;
      const cropMargin = 5;
      
      // Marks drawing...
      doc.line(cropMargin, cropMargin, cropMargin + cropLen, cropMargin);
      doc.line(cropMargin, cropMargin, cropMargin, cropMargin + cropLen);
      doc.line(pageWidth - cropMargin - cropLen, cropMargin, pageWidth - cropMargin, cropMargin);
      doc.line(pageWidth - cropMargin, cropMargin, pageWidth - cropMargin, cropMargin + cropLen);
      doc.line(cropMargin, pageHeight - cropMargin, cropMargin + cropLen, pageHeight - cropMargin);
      doc.line(cropMargin, pageHeight - cropMargin, cropMargin, pageHeight - cropMargin - cropLen);
      doc.line(pageWidth - cropMargin - cropLen, pageHeight - cropMargin, pageWidth - cropMargin, pageHeight - cropMargin);
      doc.line(pageWidth - cropMargin, pageHeight - cropMargin, pageWidth - cropMargin, pageHeight - cropMargin - cropLen);

      // Separator Marks
      [startX + slotWidth, startX + slotWidth * 2].forEach(x => {
          doc.line(x, 10, x, 13); 
          doc.line(x, pageHeight - 10, x, pageHeight - 13);
      });

      // 5. Render Slots
      effectiveSlots.forEach((slot, i) => {
          const currentSlotX = startX + (i * slotWidth);
          const centerX = currentSlotX + (slotWidth / 2);
          
          if (i > 0 && !showOutlines) {
              doc.setLineDashPattern([2, 2], 0);
              doc.setDrawColor(200, 200, 200);
              doc.line(currentSlotX, startY, currentSlotX, startY + slotHeight);
              doc.setLineDashPattern([], 0);
              doc.setDrawColor(0, 0, 0);
          }

          if (showOutlines) {
              doc.setLineWidth(0.3);
              doc.setDrawColor(0, 0, 0);
              doc.rect(currentSlotX, startY, slotWidth, slotHeight);
          }

          // Render Hanja Text
          const renderVerticalLine = (text: string, xPos: number) => {
             if (!text) return;

             doc.setFontSize(36); // Approx 48px
             const charHeight = 16; // Height spacing per character in mm
             const totalTextHeight = text.length * charHeight;
             const slotCenterY = pageHeight / 2;
             let textCursorY = slotCenterY - (totalTextHeight / 2) + (charHeight / 2.5);

             for (let c = 0; c < text.length; c++) {
                 const char = text[c];
                 doc.text(char, xPos, textCursorY, { align: 'center', baseline: 'middle' });
                 textCursorY += charHeight;
             }
          };

          const isCouple = !!slot.hanjaFullTextSecondary;
          const hasTertiary = !!slot.hanjaFullTextTertiary;

          if (isCouple) {
             if (hasTertiary) {
                // 3 Columns: Left, Center, Right
                // Width 60mm. Center = 30mm. 
                // Spacing: 15mm per column?
                // Left(Male): -15mm, Center(Wife1): 0, Right(Wife2): +15mm
                const leftX = centerX - 15;
                const middleX = centerX;
                const rightX = centerX + 15;

                renderVerticalLine(slot.hanjaFullText, leftX);
                renderVerticalLine(slot.hanjaFullTextSecondary || "", middleX);
                renderVerticalLine(slot.hanjaFullTextTertiary || "", rightX);

             } else {
                // 2 Columns
                // Left: Male (hanjaFullText)
                // Right: Female (hanjaFullTextSecondary)
                // Offsets from CenterX +/- 11mm.
                const leftX = centerX - 11;
                const rightX = centerX + 11;

                renderVerticalLine(slot.hanjaFullText, leftX);
                renderVerticalLine(slot.hanjaFullTextSecondary || "", rightX);
             }
          } else {
             // Single Column
             renderVerticalLine(slot.hanjaFullText, centerX);
          }

          // Render Footer Label
          doc.setFontSize(10);
          const label = getLabelText(slot);
          const footerY = startY + slotHeight + 5;
          
          if (!showOutlines) {
            doc.setDrawColor(200, 200, 200);
            doc.line(centerX, footerY, centerX, footerY + 2);
          }
          
          doc.setTextColor(60, 60, 60);
          doc.text(label, centerX, footerY + 7, { align: 'center' });
          doc.setTextColor(0, 0, 0);
      });

      doc.save('jibang_a4.pdf');

    } catch (error) {
      console.error("PDF Generation failed", error);
      alert("PDF 생성 중 오류가 발생했습니다. (폰트 로드 실패 등)");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-900 bg-stone-100">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 bg-stone-900 text-stone-50 flex items-center justify-center rounded-lg serif font-bold text-lg">
                祭
             </div>
             <h1 className="text-xl font-bold tracking-tight text-stone-900">
               지방 메이커
             </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-xs text-stone-500 hidden sm:block">
                전통 제례 지방 생성 (A4 출력용)
             </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column: Controls */}
          <section className="w-full lg:w-[400px] flex-shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              
              {/* Slot Tabs */}
              <div className="flex p-1 bg-stone-100 rounded-lg mb-6">
                {['1', '2', '3'].map((label, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveSlotIndex(idx)}
                    className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                      activeSlotIndex === idx
                        ? 'bg-white text-stone-900 shadow-sm ring-1 ring-stone-200'
                        : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Custom Toggle for Slots 2 & 3 */}
              {activeSlotIndex > 0 && (
                 <div className="mb-6 flex items-center p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <div className="flex items-center h-5">
                        <input 
                            type="checkbox" 
                            id={`custom-check-${activeSlotIndex}`}
                            checked={isCustom[activeSlotIndex]}
                            onChange={() => toggleCustom(activeSlotIndex)}
                            className="w-5 h-5 text-stone-800 rounded focus:ring-stone-500 border-gray-300 transition-colors cursor-pointer"
                        />
                    </div>
                    <div className="ml-3 text-sm">
                        <label htmlFor={`custom-check-${activeSlotIndex}`} className="font-medium text-stone-900 cursor-pointer select-none">
                            별도 내용 작성
                        </label>
                        <p className="text-xs text-stone-500 mt-0.5">
                            체크 해제 시 1번 지방과 동일하게 적용됩니다.
                        </p>
                    </div>
                 </div>
              )}

              {/* Form Area */}
              {(activeSlotIndex === 0 || isCustom[activeSlotIndex]) ? (
                <JibangForm 
                    data={slots[activeSlotIndex]} 
                    onChange={handleSlotChange} 
                    onOpenAiHelp={() => setIsAiModalOpen(true)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-stone-50 rounded-xl border border-stone-100 border-dashed text-stone-400">
                     <CheckCircleIcon className="w-12 h-12 mb-3 text-stone-300" />
                     <p className="text-sm font-medium text-stone-500">1번 지방과 동일한 내용이 적용됩니다.</p>
                     <p className="text-xs mt-1">내용을 수정하려면 위의 '별도 내용 작성'을 체크하세요.</p>
                </div>
              )}

            </div>

            <div className="bg-stone-200 p-5 rounded-2xl text-stone-600 text-xs space-y-2">
               <p className="font-bold text-stone-800">📜 출력 안내</p>
               <ul className="list-disc list-inside space-y-1">
                 <li>A4 용지 한 장에 3개의 지방이 출력됩니다.</li>
                 <li>각 지방의 크기는 가로 6cm, 세로 22cm 입니다.</li>
                 <li>점선을 따라 오려서 사용하시면 됩니다.</li>
               </ul>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-3 px-1">
                 <input 
                    type="checkbox" 
                    id="show-outlines" 
                    checked={showOutlines} 
                    onChange={(e) => setShowOutlines(e.target.checked)}
                    className="w-5 h-5 text-stone-900 rounded border-gray-300 focus:ring-stone-500 cursor-pointer"
                 />
                 <label htmlFor="show-outlines" className="text-sm font-semibold text-stone-700 cursor-pointer select-none">
                    지방 테두리(오리기 가이드) 표시
                 </label>
              </div>

              <button
                onClick={generatePDF}
                disabled={isGenerating}
                className="w-full bg-stone-900 text-white py-4 px-6 rounded-xl hover:bg-stone-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                   <>
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                     PDF 생성 중...
                   </>
                ) : (
                   <>
                     <ArrowDownTrayIcon className="w-6 h-6" />
                     PDF 다운로드 (A4)
                   </>
                )}
              </button>
            </div>
          </section>

          {/* Right Column: Preview */}
          <section className="flex-1 w-full flex justify-center bg-stone-200/50 p-4 sm:p-8 rounded-2xl border border-stone-200/60 overflow-hidden">
            <div className="scale-[0.4] sm:scale-[0.6] lg:scale-[0.75] origin-top transition-transform duration-300">
                <JibangPreview 
                  slots={effectiveSlots}
                  forwardedRef={previewRef} 
                  id="jibang-preview-sheet"
                  showOutlines={showOutlines}
                />
            </div>
          </section>
        </div>
      </main>

      <AiModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} />
    </div>
  );
};

export default App;