import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, HomeIcon, BookOpenIcon, QuestionMarkCircleIcon, DocumentTextIcon, ShareIcon } from '@heroicons/react/24/outline';
import JibangGenerator from './components/JibangGenerator';
import { AboutPage, GuidePage, FaqPage } from './pages/StaticPages';
import { getTotalJibangCount } from './services/jibangService';

const AppContent: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const location = useLocation();

  useEffect(() => {
    const fetchCount = async () => {
      const count = await getTotalJibangCount();
      setTotalCount(count);
    };
    fetchCount();
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const isActive = (path: string) => location.pathname === path ? 'text-stone-900 bg-stone-100 font-semibold' : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50';

  const handleShare = async () => {
    const shareData = {
      title: '지방앱 - 스마트한 지방 만들기',
      text: '제사 지방, 이제 스마트하게 만드세요. 한자 변환부터 A4 출력까지 한 번에!',
      url: window.location.origin,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.origin);
        alert('링크가 복사되었습니다. 친구들에게 공유해보세요!');
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Share failed', err);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-900 bg-stone-100">
       {/* Header with Navigation */}
       <header className="bg-white border-b border-stone-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
             <div className="w-8 h-8 bg-stone-900 text-stone-50 flex items-center justify-center rounded-lg gungseo text-xl pt-0.5">
                祭
             </div>
             <h1 className="text-xl font-bold tracking-tight text-stone-900">
               지방앱
             </h1>
             {totalCount !== null && (
               <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-stone-100 rounded-full border border-stone-200">
                 <span className="relative flex h-2 w-2">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                 </span>
                 <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                   {totalCount.toLocaleString()}개 생성됨
                 </span>
               </div>
             )}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link to="/" className={`px-4 py-2 rounded-lg text-sm transition-colors ${isActive('/')}`}>
               지방 만들기
            </Link>
            <Link to="/about" className={`px-4 py-2 rounded-lg text-sm transition-colors ${isActive('/about')}`}>
               지방이란?
            </Link>
            <Link to="/guide" className={`px-4 py-2 rounded-lg text-sm transition-colors ${isActive('/guide')}`}>
               작성법 가이드
            </Link>
            <Link to="/faq" className={`px-4 py-2 rounded-lg text-sm transition-colors ${isActive('/faq')}`}>
               자주 묻는 질문
            </Link>
            <button 
              onClick={handleShare}
              className="ml-2 px-4 py-2 rounded-lg text-sm bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors font-semibold flex items-center gap-2"
            >
              <ShareIcon className="w-4 h-4" />
              공유하기
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-stone-200 shadow-lg animate-in slide-in-from-top-2 duration-200 z-50">
            <div className="p-2 space-y-1">
              <Link 
                to="/" 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${isActive('/')}`}
                onClick={closeMenu}
              >
                <HomeIcon className="w-5 h-5" />
                지방 만들기 (홈)
              </Link>
              <Link 
                to="/about" 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${isActive('/about')}`}
                onClick={closeMenu}
              >
                <BookOpenIcon className="w-5 h-5" />
                지방이란?
              </Link>
              <Link 
                to="/guide" 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${isActive('/guide')}`}
                onClick={closeMenu}
              >
                <DocumentTextIcon className="w-5 h-5" />
                작성법 가이드
              </Link>
              <Link 
                to="/faq" 
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm ${isActive('/faq')}`}
                onClick={closeMenu}
              >
                <QuestionMarkCircleIcon className="w-5 h-5" />
                자주 묻는 질문
              </Link>
              <button 
                onClick={() => {
                  handleShare();
                  closeMenu();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-emerald-700 bg-emerald-50 font-semibold"
              >
                <ShareIcon className="w-5 h-5" />
                친구에게 공유하기
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<JibangGenerator />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/guide" element={<GuidePage />} />
          <Route path="/faq" element={<FaqPage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 flex flex-col items-center gap-4 text-center">
           <div className="flex items-center gap-2 text-stone-900 font-bold">
              <div className="w-6 h-6 bg-stone-900 text-stone-50 flex items-center justify-center rounded gungseo text-sm pt-0.5">
                祭
             </div>
             지방앱
           </div>

           <p className="text-xs text-stone-400">
             © 2024 Jibang App. All rights reserved.
           </p>
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AppContent />
    </Router>
  );
};

export default App;