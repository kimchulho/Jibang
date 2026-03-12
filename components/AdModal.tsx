import React, { useEffect, useState, useRef } from 'react';
import { XMarkIcon, ArrowDownTrayIcon, PrinterIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface AdModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  actionType: 'PDF' | 'IMAGE' | 'PRINT' | null;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdModal: React.FC<AdModalProps> = ({ isOpen, onClose, onConfirm, actionType }) => {
  const [countdown, setCountdown] = useState(5); // 5 seconds wait time for better ad visibility
  const [canDownload, setCanDownload] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCountdown(5);
      setCanDownload(false);

      // Trigger AdSense
      try {
        if (window.adsbygoogle) {
           // We use a small timeout to ensure the DOM element is fully rendered before pushing
           setTimeout(() => {
               try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
               } catch (err) {
                   console.log("Ad push error (might be already loaded):", err);
               }
           }, 100);
        }
      } catch (e) {
        console.error("AdSense Init Error:", e);
      }

      // Countdown Timer
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanDownload(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getActionInfo = () => {
      switch (actionType) {
          case 'PDF': return { title: 'PDF 생성 중...', icon: <ArrowDownTrayIcon className="w-6 h-6"/>, btnText: 'PDF 다운로드' };
          case 'IMAGE': return { title: '이미지 변환 중...', icon: <PhotoIcon className="w-6 h-6"/>, btnText: '이미지 저장' };
          case 'PRINT': return { title: '인쇄 준비 중...', icon: <PrinterIcon className="w-6 h-6"/>, btnText: '인쇄하기' };
          default: return { title: '준비 중...', icon: <ArrowDownTrayIcon className="w-6 h-6"/>, btnText: '확인' };
      }
  };

  const info = getActionInfo();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[500px] flex flex-col overflow-hidden relative">
        
        {/* Progress Bar (Visual indicator for waiting) */}
        {!canDownload && (
            <div className="absolute top-0 left-0 h-1 bg-stone-900 transition-all duration-1000 ease-linear" style={{ width: `${((6 - countdown) / 5) * 100}%` }}></div>
        )}

        {/* Header */}
        <div className="p-5 border-b border-stone-100 flex justify-between items-center bg-stone-50">
          <div className="flex items-center gap-2 text-stone-800">
            {info.icon}
            <h3 className="font-bold text-lg">{info.title}</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-800 transition-colors p-1 rounded-full hover:bg-stone-200">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-0 bg-stone-100 min-h-[300px] flex flex-col items-center justify-center relative">
           
           {/* Message Overlay while counting down */}
           {!canDownload && (
               <div className="absolute top-4 z-10 bg-white/90 px-4 py-1 rounded-full shadow-sm text-xs font-medium text-stone-600 border border-stone-200 backdrop-blur">
                   잠시 후 다운로드가 가능합니다 ({countdown}초)
               </div>
           )}

           {/* === GOOGLE ADSENSE SLOT START === */}
           {/* Key prop ensures the ad component remounts cleanly when modal opens */}
           <div key={isOpen ? 'open' : 'closed'} className="w-full flex items-center justify-center overflow-hidden bg-white" ref={adRef}>
              {/* 
                  TODO: Replace 'YOUR_AD_SLOT_ID' with your actual AdSense Display Ad Unit ID.
                  Ensure you have created a "Display Ad" unit in your AdSense console.
              */}
              <ins className="adsbygoogle"
                   style={{ display: 'block', width: '100%', minHeight: '300px' }}
                   data-ad-client="ca-pub-9880062103386476" 
                   data-ad-slot="YOUR_AD_SLOT_ID"
                   data-ad-format="rectangle"
                   data-full-width-responsive="true"></ins>
           </div>
           {/* === GOOGLE ADSENSE SLOT END === */}
           
           <p className="absolute bottom-2 text-[10px] text-stone-400">
               광고 수익은 서버 운영과 서비스 개선에 사용됩니다.
           </p>
        </div>

        {/* Footer / Action Button */}
        <div className="p-5 bg-white border-t border-stone-100 flex flex-col gap-3">
           <button 
             onClick={onConfirm}
             disabled={!canDownload}
             className={`w-full py-4 rounded-xl font-bold text-lg transition-all shadow-md flex items-center justify-center gap-2
                ${canDownload 
                   ? 'bg-stone-900 text-white hover:bg-stone-800 hover:shadow-lg transform hover:-translate-y-0.5' 
                   : 'bg-stone-100 text-stone-400 cursor-wait'
                }
             `}
           >
             {canDownload ? info.btnText : `파일 생성 중... (${countdown})`}
           </button>
        </div>
      </div>
    </div>
  );
};

export default AdModal;