import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import jsPDF from 'jspdf';
import { domToPng } from 'modern-screenshot';
import { JibangData, RelationType } from '../types';
import { RELATION_HANJA } from '../constants';
import { saveJibangHistory, getClientIp, getTotalJibangCount } from '../services/jibangService';
import JibangForm from './JibangForm';
import JibangPreview from './JibangPreview';
import AdModal from './AdModal';
import { ArrowDownTrayIcon, CheckCircleIcon, PhotoIcon, PrinterIcon } from '@heroicons/react/24/solid';

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

const JibangGenerator: React.FC = () => {
  // Manage 3 slots.
  const [slots, setSlots] = useState<JibangData[]>([
    { ...DEFAULT_DATA },
    { ...DEFAULT_DATA },
    { ...DEFAULT_DATA }
  ]);
  
  // Track if slot 2 and 3 are custom. Slot 1 (index 0) is always custom/base.
  const [isCustom, setIsCustom] = useState<boolean[]>([true, false, false]);
  const [showOutlines, setShowOutlines] = useState(false);
  const [showCropMarks, setShowCropMarks] = useState(true);
  
  const [activeSlotIndex, setActiveSlotIndex] = useState(0);
  
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'PDF' | 'IMAGE' | 'PRINT' | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  
  const previewRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCount = async () => {
      const count = await getTotalJibangCount();
      setTotalCount(count);
    };
    fetchCount();
  }, []);

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
    if (index === 0) return;

    const willBeCustom = !isCustom[index];
    const newIsCustom = [...isCustom];
    newIsCustom[index] = willBeCustom;
    setIsCustom(newIsCustom);

    if (willBeCustom) {
        const newSlots = [...slots];
        newSlots[index] = { ...slots[0] };
        setSlots(newSlots);
    }
  };

  const getLabelData = (data: JibangData): { title: string, descriptions: string[] } => {
    const baseLabel = RELATION_HANJA[data.relation].label.split('(')[0].trim();
    if (data.relation === RelationType.CUSTOM) return { title: "직접 입력", descriptions: [] };

    const isChild = data.relation === RelationType.SON || data.relation === RelationType.DAUGHTER;
    if (isChild) {
        const descriptions = data.familyName ? [`(${data.familyName})`] : [];
        return { title: baseLabel, descriptions };
    }
    
    const isCouple = RELATION_HANJA[data.relation].gender === 'COUPLE';
    const isFemale = RELATION_HANJA[data.relation].gender === 'F';
    
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
    return { title, descriptions };
  };

  const handleDownloadRequest = (type: 'PDF' | 'IMAGE' | 'PRINT') => {
      setPendingAction(type);
      setIsAdModalOpen(true);
  };

  const handleAdConfirm = async () => {
      // 1. Close the modal first
      setIsAdModalOpen(false);
      
      // 2. Track history
      try {
          const ip = await getClientIp();
          const actionType = pendingAction === 'PDF' ? 'PDF' : pendingAction === 'IMAGE' ? 'IMG' : 'PRT';
          
          // Record all unique slots that are currently on the sheet to satisfy "differently made"
          const uniqueSlotsMap = new Map<string, JibangData>();
          effectiveSlots.forEach(slot => {
              // Create a unique key based on relation and full text to identify "different" ones
              const key = `${slot.relation}-${slot.hanjaFullText}-${slot.hanjaFullTextSecondary || ''}-${slot.hanjaFullTextTertiary || ''}`;
              if (!uniqueSlotsMap.has(key)) {
                  uniqueSlotsMap.set(key, slot);
              }
          });

          await Promise.all(Array.from(uniqueSlotsMap.values()).map(slot => {
              const koParts = [slot.koreanFullText, slot.koreanFullTextSecondary, slot.koreanFullTextTertiary].filter(Boolean);
              const hjParts = [slot.hanjaFullText, slot.hanjaFullTextSecondary, slot.hanjaFullTextTertiary].filter(Boolean);
              
              return saveJibangHistory({
                  target_name: RELATION_HANJA[slot.relation].label,
                  content_ko: koParts.join(', '),
                  content_hj: hjParts.join(', '),
                  action_type: actionType,
                  ip_address: ip
              });
          }));
      } catch (error) {
          console.error("History tracking failed", error);
      }

      // 3. Wait for the modal to visually disappear to prevent print overlay issues
      // and ensure smooth UX transition
      setTimeout(() => {
          if (pendingAction === 'PDF') {
              generatePDF();
          } else if (pendingAction === 'IMAGE') {
              generateImage();
          } else if (pendingAction === 'PRINT') {
              window.print();
          }
          setPendingAction(null);
      }, 300); // 300ms matches the fade-out duration roughly
  };

  const generateImage = async () => {
    if (!captureRef.current) return;
    setIsImageGenerating(true);

    try {
        const dataUrl = await domToPng(captureRef.current, {
            scale: 2,
            features: {
                // modern-screenshot handles oklch better by default, 
                // but we can ensure it works by using its modern rendering engine
            }
        });

        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'jibang_preview.png';
        link.click();

    } catch (error) {
        console.error("Image generation failed", error);
        alert("이미지 저장 중 오류가 발생했습니다. (oklch 관련 오류일 수 있습니다)");
    } finally {
        setIsImageGenerating(false);
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const hanjaFontUrl = 'https://ewbjogsolylcbfmpmyfa.supabase.co/storage/v1/object/public/jibang/ZhenZongShengDianKaiShu-2.ttf';
      const paperlogyBoldUrl = 'https://ewbjogsolylcbfmpmyfa.supabase.co/storage/v1/object/public/jibang/Paperlogy-7Bold.ttf?v=2';
      const paperlogyRegUrl = 'https://ewbjogsolylcbfmpmyfa.supabase.co/storage/v1/object/public/jibang/Paperlogy-4Regular.ttf?v=2';

      let hanjaData = '';
      let paperlogyBoldData = '';
      let paperlogyRegData = '';
      let hangulFontAvailable = false;

      const bufferToBinaryString = (buffer: ArrayBuffer) => {
          const bytes = new Uint8Array(buffer);
          const len = bytes.byteLength;
          const chars: string[] = [];
          const chunkSize = 0x8000; 
          
          for (let i = 0; i < len; i += chunkSize) {
              const chunk = bytes.subarray(i, Math.min(i + chunkSize, len));
              chars.push(String.fromCharCode.apply(null, Array.from(chunk)));
          }
          return chars.join('');
      };

      try {
         console.log("Fetching Hanja font from:", hanjaFontUrl);
         const hanjaRes = await fetch(hanjaFontUrl);
         if (!hanjaRes.ok) throw new Error(`Hanja Font Fetch Failed: ${hanjaRes.status}`);
         hanjaData = bufferToBinaryString(await hanjaRes.arrayBuffer());
         console.log("Hanja font fetched successfully, size:", hanjaData.length);
         
         doc.addFileToVFS('ZhenZongShengDianKaiShu-2.ttf', btoa(hanjaData));
         doc.addFont('ZhenZongShengDianKaiShu-2.ttf', 'ZhenZongShengDianKaiShu-2', 'normal');
      } catch (e) {
         console.error("Hanja font error:", e);
         throw new Error("필수 붓글씨 폰트(한자)를 불러오지 못했습니다. 네트워크를 확인해주세요.");
      }

      try {
         console.log("Fetching Paperlogy fonts...");
         const [boldRes, regRes] = await Promise.all([
             fetch(paperlogyBoldUrl),
             fetch(paperlogyRegUrl)
         ]);

         if (boldRes.ok && regRes.ok) {
             paperlogyBoldData = bufferToBinaryString(await boldRes.arrayBuffer());
             paperlogyRegData = bufferToBinaryString(await regRes.arrayBuffer());
             console.log("Paperlogy fonts fetched successfully");
             
             doc.addFileToVFS('Paperlogy-7Bold.ttf', btoa(paperlogyBoldData));
             doc.addFont('Paperlogy-7Bold.ttf', 'Paperlogy-7Bold', 'bold');
             
             doc.addFileToVFS('Paperlogy-4Regular.ttf', btoa(paperlogyRegData));
             doc.addFont('Paperlogy-4Regular.ttf', 'Paperlogy-4Regular', 'normal');
             
             hangulFontAvailable = true;
         } else {
             console.warn("Paperlogy font fetch failed", boldRes.status, regRes.status);
         }
      } catch (e) {
         console.warn("Paperlogy font fetch error", e);
      }

      const pageWidth = 210;
      const pageHeight = 297;
      const slotWidth = 60;
      const slotHeight = 220;
      const totalWidth = slotWidth * 3;
      const startX = (pageWidth - totalWidth) / 2;
      const startY = 20; 

      if (showCropMarks) {
          const cropGap = 5;
          const cropLen = 5;
          doc.setLineWidth(0.1);
          doc.setDrawColor(0, 0, 0);

          const xCoords = [startX, startX + slotWidth, startX + slotWidth * 2, startX + slotWidth * 3];
          const yCoords = [startY, startY + slotHeight];

          xCoords.forEach(x => {
            doc.line(x, startY - cropGap - cropLen, x, startY - cropGap);
            doc.line(x, startY + slotHeight + cropGap, x, startY + slotHeight + cropGap + cropLen);
          });
          yCoords.forEach(y => {
            doc.line(startX - cropGap - cropLen, y, startX - cropGap, y);
            doc.line(startX + totalWidth + cropGap, y, startX + totalWidth + cropGap + cropLen, y);
          });
      }

      effectiveSlots.forEach((slot, i) => {
          const currentSlotX = startX + (i * slotWidth);
          const centerX = currentSlotX + (slotWidth / 2);
          
          if (showOutlines) {
              doc.setLineWidth(0.1);
              doc.setDrawColor(180, 180, 180);
              doc.rect(currentSlotX, startY, slotWidth, slotHeight);
          }

          const renderVerticalLine = (text: string, xPos: number) => {
             if (!text) return;
             doc.setFont('ZhenZongShengDianKaiShu-2', 'normal');
             doc.setFontSize(36); 
             doc.setTextColor(0, 0, 0); 

             const textColumnHeight = 180; 
             const textStartY = startY + 20;
             const charCount = text.length;
             
             if (charCount === 1) {
                 doc.text(text, xPos, startY + (slotHeight / 2), { align: 'center', baseline: 'middle' });
             } else {
                 const step = textColumnHeight / (charCount - 1);
                 for (let c = 0; c < charCount; c++) {
                     const char = text[c];
                     const y = textStartY + (c * step);
                     doc.text(char, xPos, y, { align: 'center', baseline: 'middle' });
                 }
             }
          };

          const isCouple = !!slot.hanjaFullTextSecondary;
          const hasTertiary = !!slot.hanjaFullTextTertiary;

          if (isCouple) {
             if (hasTertiary) {
                const offset = 16;
                const leftX = centerX - offset;
                const middleX = centerX;
                const rightX = centerX + offset;

                renderVerticalLine(slot.hanjaFullText, leftX);
                renderVerticalLine(slot.hanjaFullTextSecondary || "", middleX);
                renderVerticalLine(slot.hanjaFullTextTertiary || "", rightX);

             } else {
                const offset = 12; 
                const leftX = centerX - offset;
                const rightX = centerX + offset;

                renderVerticalLine(slot.hanjaFullText, leftX);
                renderVerticalLine(slot.hanjaFullTextSecondary || "", rightX);
             }
          } else {
             renderVerticalLine(slot.hanjaFullText, centerX);
          }

          const { title, descriptions } = getLabelData(slot);
          const footerY = startY + slotHeight + 5;
          
          doc.setTextColor(0, 0, 0);

          if (hangulFontAvailable) {
              doc.setFont('Paperlogy-7Bold', 'bold');
              doc.setFontSize(14);
          } else {
              doc.setFont('ZhenZongShengDianKaiShu-2', 'normal');
              doc.setFontSize(12);
          }
          doc.text(title, centerX, footerY + 5, { align: 'center' });

          if (hangulFontAvailable) {
              doc.setFont('Paperlogy-4Regular', 'normal');
              doc.setFontSize(10);
              doc.setTextColor(60, 60, 60);
          } else {
              doc.setFont('ZhenZongShengDianKaiShu-2', 'normal');
              doc.setFontSize(10);
          }

          descriptions.forEach((line, lineIdx) => {
             doc.text(line, centerX, footerY + 10 + (lineIdx * 5), { align: 'center' });
          });
          
          doc.setTextColor(0, 0, 0);
      });

      doc.save('jibang_a4.pdf');

    } catch (error) {
      console.error("PDF Generation failed", error);
      alert(`PDF 생성 중 오류가 발생했습니다. (원인: ${error instanceof Error ? error.message : "알 수 없음"})\n네트워크 연결을 확인해주세요.`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      {/* 
        Using React Portal to render the printable area outside of the main app root (#root).
        This allows us to easily hide #root using CSS during print, leaving only #printable-root visible,
        solving layout issues and ensuring a single A4 page.
      */}
      {createPortal(
        <div 
          id="printable-root"
          className="fixed top-0 left-0 -z-50 opacity-0 pointer-events-none"
        >
           <JibangPreview 
              slots={effectiveSlots}
              forwardedRef={captureRef}
              showOutlines={showOutlines}
              showCropMarks={showCropMarks}
              isForCapture={true}
           />
        </div>,
        document.body
      )}

      <div className="flex flex-col lg:flex-row gap-8 items-start">
          <section className="w-full lg:w-[400px] flex-shrink-0 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
              
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

              {(activeSlotIndex === 0 || isCustom[activeSlotIndex]) ? (
                <JibangForm 
                    data={slots[activeSlotIndex]} 
                    onChange={handleSlotChange} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 bg-stone-50 rounded-xl border border-stone-100 border-dashed text-stone-400">
                     <CheckCircleIcon className="w-12 h-12 mb-3 text-stone-300" />
                     <p className="text-sm font-medium text-stone-500">1번 지방과 동일한 내용이 적용됩니다.</p>
                     <p className="text-xs mt-1">내용을 수정하려면 위의 '별도 내용 작성'을 체크하세요.</p>
                </div>
              )}

            </div>
            
            <div className="mt-6 flex flex-row gap-4 h-[240px]">
                <div className="w-[120px] flex-shrink-0 h-full rounded-xl overflow-hidden shadow-sm border border-stone-200 relative group bg-white">
                    <a href="https://link.coupang.com/a/dMU3im" target="_blank" rel="noreferrer" referrerPolicy="unsafe-url" className="block h-full w-full">
                        <img src="https://image12.coupangcdn.com/image/affiliate/banner/fe7b6fd75fce6c274e27f1d1b513eae6@2x.jpg" alt="온고을한지 순지 40g, 10개" className="w-full h-full object-cover" />
                    </a>
                </div>

                <div className="flex-1 flex flex-col gap-2 h-full">

                    <div className="flex items-center gap-4 px-1 h-6 flex-shrink-0">
                         <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="show-cropmarks" 
                                checked={showCropMarks} 
                                onChange={(e) => setShowCropMarks(e.target.checked)}
                                className="w-4 h-4 text-stone-900 rounded border-gray-300 focus:ring-stone-500 cursor-pointer"
                            />
                            <label htmlFor="show-cropmarks" className="text-xs font-semibold text-stone-700 cursor-pointer select-none">
                                재단선
                            </label>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <input 
                                type="checkbox" 
                                id="show-outlines" 
                                checked={showOutlines} 
                                onChange={(e) => setShowOutlines(e.target.checked)}
                                className="w-4 h-4 text-stone-900 rounded border-gray-300 focus:ring-stone-500 cursor-pointer"
                            />
                            <label htmlFor="show-outlines" className="text-xs font-semibold text-stone-700 cursor-pointer select-none">
                                테두리
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-2 h-12 flex-shrink-0">
                        <button
                            onClick={() => handleDownloadRequest('IMAGE')}
                            disabled={isGenerating || isImageGenerating}
                            className="flex-1 bg-white text-stone-800 border border-stone-300 rounded-lg hover:bg-stone-50 transition-all shadow-sm flex items-center justify-center gap-1 font-semibold text-xs disabled:opacity-70"
                        >
                            {isImageGenerating ? (
                                <div className="w-4 h-4 border-2 border-stone-300 border-t-stone-800 rounded-full animate-spin"></div>
                            ) : (
                                <PhotoIcon className="w-4 h-4" />
                            )}
                            이미지 저장
                        </button>

                        <button
                            onClick={() => handleDownloadRequest('PDF')}
                            disabled={isGenerating || isImageGenerating}
                            className="flex-1 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-all shadow flex items-center justify-center gap-1 font-semibold text-xs disabled:opacity-70"
                        >
                            {isGenerating ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <ArrowDownTrayIcon className="w-4 h-4" />
                            )}
                            PDF 저장
                        </button>
                    </div>

                     {/* PRINT BUTTON */}
                     <button
                        onClick={() => handleDownloadRequest('PRINT')}
                        disabled={isGenerating || isImageGenerating}
                        className="w-full h-12 bg-white text-stone-800 border border-stone-300 rounded-lg hover:bg-stone-50 transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 group flex-shrink-0 font-semibold text-sm"
                        title="바로 인쇄"
                    >
                        <PrinterIcon className="w-5 h-5 text-stone-600" />
                        <span>바로 인쇄하기</span>
                    </button>

                    <a 
                        href="https://smartstore.naver.com/finalpaper/products/4179023042" 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex-1 bg-stone-800 text-white border border-stone-700 rounded-xl flex items-center p-3 gap-3 hover:bg-stone-700 transition-all shadow-sm group relative overflow-hidden"
                    >
                         <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-white/5 rounded-full z-0"></div>

                        <div className="relative z-10 w-10 h-10 bg-stone-700 rounded-full flex-shrink-0 flex items-center justify-center text-white border border-stone-600">
                            <PrinterIcon className="w-5 h-5" />
                        </div>
                        <div className="relative z-10 flex-col min-w-0">
                           <div className="flex items-center gap-1.5 mb-0.5">
                                <span className="text-[10px] font-bold text-stone-900 bg-yellow-400 px-1.5 py-0.5 rounded leading-none">인쇄 대행</span>
                           </div>
                           <div className="font-bold text-sm truncate leading-tight">프리미엄 지방 출력</div>
                           <div className="text-[10px] text-stone-400 truncate mt-0.5">최고급 국산 한지 사용</div>
                        </div>
                    </a>
                </div>
            </div>
            {/*<p className="text-[10px] text-stone-400 mt-2 text-right">
                * 위 광고는 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.
            </p>*/}

            {totalCount !== null && (
                <div className="mt-4 p-3 bg-stone-50 rounded-xl border border-stone-200 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <p className="text-xs text-stone-500 font-medium">
                        지금까지 <span className="text-stone-900 font-bold">총 {totalCount.toLocaleString()}개</span> 지방을 만들어 드렸어요.
                    </p>
                </div>
            )}

          </section>

          <div className="flex-1 w-full flex flex-col gap-4 min-w-0">
             <section className="w-full flex justify-center bg-stone-200/50 p-4 sm:p-8 rounded-2xl border border-stone-200/60 overflow-hidden">
                <div className="scale-[0.4] sm:scale-[0.6] lg:scale-[0.75] origin-top transition-transform duration-300 h-[119mm] sm:h-[179mm] lg:h-[223mm]">
                    <JibangPreview 
                      slots={effectiveSlots}
                      forwardedRef={previewRef} 
                      id="jibang-preview-sheet"
                      showOutlines={showOutlines}
                      showCropMarks={showCropMarks}
                    />
                </div>
             </section>

             <div className="bg-stone-200 p-5 rounded-2xl text-stone-600 text-xs space-y-2">
                 <p className="font-bold text-stone-800">📜 출력 안내</p>
                 <ul className="list-disc list-inside space-y-1">
                     <li>A4 용지 한 장에 3개의 지방(6×22cm)이 출력됩니다.</li>
                     <li>상하 좌우 마크에 자를 대고 칼로 잘라서 사용하세요.</li>
                     <li>부부만 지방을 합설하여 쓰시고, 그 외는 따로 작성하세요.</li>
                     <li>AI로 변환된 한자는 틀릴 수 있으니 한번 더 확인해주세요.</li>
                 </ul>
             </div>
          </div>
          
      </div>

      <AdModal 
        isOpen={isAdModalOpen} 
        onClose={() => setIsAdModalOpen(false)} 
        onConfirm={handleAdConfirm}
        actionType={pendingAction}
      />
    </>
  );
};

export default JibangGenerator;