import React, { useState } from 'react';
import { JibangData, RelationType } from '../types';
import { RELATION_HANJA, JIBANG_CONSTANTS } from '../constants';
import { convertJibangToHanja } from '../services/geminiService';
import { ArrowPathIcon, SparklesIcon, PlusCircleIcon, MinusCircleIcon } from '@heroicons/react/24/outline';

interface JibangFormProps {
  data: JibangData;
  onChange: (data: JibangData) => void;
  onOpenAiHelp: () => void;
}

const JibangForm: React.FC<JibangFormProps> = ({ data, onChange, onOpenAiHelp }) => {
  const relationInfo = RELATION_HANJA[data.relation];
  const isFemale = relationInfo.gender === 'F';
  const isCouple = relationInfo.gender === 'COUPLE';
  const isCustom = data.relation === RelationType.CUSTOM;
  const isChild = data.relation === RelationType.SON || data.relation === RelationType.DAUGHTER;
  const [isConverting, setIsConverting] = useState(false);

  // Check if tertiary data exists to determine if the "Second Wife" section is open
  const hasTertiary = !!data.koreanFullTextTertiary || !!data.hanjaFullTextTertiary;

  // Helper to remove text in parentheses for the final Jibang string
  const stripParens = (str: string) => str.replace(/\([^)]*\)/g, '').trim();

  // Helper to trigger update (Manual edit of Korean text)
  const updateKoreanText = (val: string, type: 'primary' | 'secondary' | 'tertiary') => {
    const updates: Partial<JibangData> = {};
    if (type === 'tertiary') updates.koreanFullTextTertiary = val;
    else if (type === 'secondary') updates.koreanFullTextSecondary = val;
    else updates.koreanFullText = val;
    
    onChange({ ...data, ...updates });
  }

  const toggleTertiary = () => {
    if (hasTertiary) {
        // Remove tertiary
        onChange({ 
            ...data, 
            koreanFullTextTertiary: '', 
            hanjaFullTextTertiary: '',
            clanTertiary: '',
            familyNameTertiary: ''
        });
    } else {
        // Add tertiary - copy secondary structure as default or generate new
        const genFemale = getFemaleGenerator(data.relation);
        const defaultText = genFemale(data.relation); // Default empty template
        onChange({ ...data, koreanFullTextTertiary: defaultText });
    }
  };

  const getFemaleGenerator = (relType: RelationType) => {
      return (type: RelationType) => {
          const suffix = JIBANG_CONSTANTS.SUFFIX;
          if (type === RelationType.MOTHER || type === RelationType.COUPLE_PARENTS) return `현비유인OOO씨${suffix}`;
          if (type === RelationType.GRANDMOTHER || type === RelationType.COUPLE_GRANDPARENTS) return `현조비유인OOO씨${suffix}`;
          if (type === RelationType.GREAT_GRANDMOTHER || type === RelationType.COUPLE_GREAT_GRANDPARENTS) return `현증조비유인OOO씨${suffix}`;
          if (type === RelationType.GREAT_GREAT_GRANDMOTHER || type === RelationType.COUPLE_GREAT_GREAT_GRANDPARENTS) return `현고조비유인OOO씨${suffix}`;
          return "";
      };
  };

  const handleRelationChange = (newRelation: RelationType) => {
      const info = RELATION_HANJA[newRelation];
      const isFem = info.gender === 'F';
      const isCpl = info.gender === 'COUPLE';
      
      let newKorean = "";
      let newKoreanSecondary = ""; // For couples (Wife)
      
      const prefix = JIBANG_CONSTANTS.PREFIX; // 현
      const student = JIBANG_CONSTANTS.DEFAULT_MALE_TITLE; // 학생
      const bugun = JIBANG_CONSTANTS.DEFAULT_MALE_NAME; // 부군
      const suffix = JIBANG_CONSTANTS.SUFFIX; // 신위
      
      // Standard Male Text Generator
      const genMale = (relType: RelationType) => {
          if (relType === RelationType.FATHER || relType === RelationType.COUPLE_PARENTS) return `현고${student}${bugun}${suffix}`;
          if (relType === RelationType.GRANDFATHER || relType === RelationType.COUPLE_GRANDPARENTS) return `현조고${student}${bugun}${suffix}`;
          if (relType === RelationType.GREAT_GRANDFATHER || relType === RelationType.COUPLE_GREAT_GRANDPARENTS) return `현증조고${student}${bugun}${suffix}`;
          if (relType === RelationType.GREAT_GREAT_GRANDFATHER || relType === RelationType.COUPLE_GREAT_GREAT_GRANDPARENTS) return `현고조고${student}${bugun}${suffix}`;
          return "";
      };

      const genFemale = getFemaleGenerator(newRelation);

      if (newRelation === RelationType.CUSTOM) {
          newKorean = "";
      } else if (isCpl) {
          // Couple Logic: Generate both Male and Female strings
          newKorean = genMale(newRelation);
          newKoreanSecondary = genFemale(newRelation);
      } else if (info.gender === 'M') {
          // Single Male
          if (newRelation === RelationType.HUSBAND) newKorean = `현벽${student}${bugun}${suffix}`;
          else if (newRelation === RelationType.SON) newKorean = `망자수재OO${suffix}`;
          else newKorean = genMale(newRelation) || `현O${student}${bugun}${suffix}`;
      } else {
          // Single Female
          if (newRelation === RelationType.WIFE) newKorean = `망실유인OOO씨${suffix}`;
          else if (newRelation === RelationType.DAUGHTER) newKorean = `망녀수재OO${suffix}`;
          else newKorean = genFemale(newRelation) || `현O유인OOO씨${suffix}`;
      }
      
      onChange({ 
          ...data, 
          relation: newRelation,
          clan: '', 
          familyName: '',
          clanTertiary: '',
          familyNameTertiary: '',
          koreanFullText: newKorean,
          hanjaFullText: "", 
          koreanFullTextSecondary: newKoreanSecondary, 
          hanjaFullTextSecondary: "",
          // Reset tertiary on relation change
          koreanFullTextTertiary: "",
          hanjaFullTextTertiary: ""
      });
  };

  const getFemalePrefix = (rel: RelationType) => {
      if (rel === RelationType.WIFE) return "망실유인";
      if (rel === RelationType.MOTHER || rel === RelationType.COUPLE_PARENTS) return "현비유인";
      if (rel === RelationType.GRANDMOTHER || rel === RelationType.COUPLE_GRANDPARENTS) return "현조비유인";
      if (rel === RelationType.GREAT_GRANDMOTHER || rel === RelationType.COUPLE_GREAT_GRANDPARENTS) return "현증조비유인";
      if (rel === RelationType.GREAT_GREAT_GRANDMOTHER || rel === RelationType.COUPLE_GREAT_GREAT_GRANDPARENTS) return "현고조비유인";
      return "현O유인";
  }

  const handleDetailChange = (field: 'clan' | 'familyName' | 'clanTertiary' | 'familyNameTertiary', val: string) => {
      const newData = { ...data, [field]: val };
      const suffix = JIBANG_CONSTANTS.SUFFIX;

      if (field === 'clanTertiary' || field === 'familyNameTertiary') {
          // Update Tertiary Text
          const prefixPart = getFemalePrefix(newData.relation);
          const clan = stripParens(newData.clanTertiary || 'OO');
          const fam = stripParens(newData.familyNameTertiary || 'O');
          newData.koreanFullTextTertiary = `${prefixPart}${clan}${fam}씨${suffix}`;
      } else {
          // Update Primary or Secondary Text based on gender/couple status
          // This logic matches previous implementation for Primary/Secondary
          const targetIsSecondary = isCouple; 
          const prefixPart = getFemalePrefix(newData.relation);

          if ((isFemale && !isChild) || isCouple) {
              const clan = stripParens(newData.clan || 'OO');
              const fam = stripParens(newData.familyName || 'O');
              const newStr = `${prefixPart}${clan}${fam}씨${suffix}`;

              if (targetIsSecondary) {
                  newData.koreanFullTextSecondary = newStr;
              } else {
                  newData.koreanFullText = newStr;
              }
          }
          
          // Child Logic (Primary only)
          if (isChild && field === 'familyName') {
              const cleanName = stripParens(val) || 'OO';
              if (newData.relation === RelationType.SON) {
                  newData.koreanFullText = `망자수재${cleanName}${suffix}`;
              } else if (newData.relation === RelationType.DAUGHTER) {
                  newData.koreanFullText = `망녀수재${cleanName}${suffix}`;
              }
          }
      }

      onChange(newData);
  };

  const handleConvert = async () => {
      if (!data.koreanFullText && !data.koreanFullTextSecondary && !data.koreanFullTextTertiary) return;
      setIsConverting(true);

      const hints: string[] = [];
      if (isChild) {
          if (data.clan) hints.push(`이름 한자 뜻/음: ${data.clan}`);
      } else {
          if (data.clan && data.clan.includes('(')) hints.push(`본관: ${data.clan}`);
          if (data.familyName && data.familyName.includes('(')) hints.push(`성씨: ${data.familyName}`);
          
          if (data.clanTertiary && data.clanTertiary.includes('(')) hints.push(`재취비 본관: ${data.clanTertiary}`);
          if (data.familyNameTertiary && data.familyNameTertiary.includes('(')) hints.push(`재취비 성씨: ${data.familyNameTertiary}`);
      }
      
      const hintStr = hints.length > 0 ? ` (참고 정보 - ${hints.join(', ')})` : "";

      // Convert Primary
      let convertedPrimary = "";
      if (data.koreanFullText) {
          convertedPrimary = await convertJibangToHanja(data.koreanFullText + hintStr);
      }

      // Convert Secondary (Wife 1)
      let convertedSecondary = "";
      if (data.koreanFullTextSecondary) {
          convertedSecondary = await convertJibangToHanja(data.koreanFullTextSecondary + hintStr);
      }

      // Convert Tertiary (Wife 2)
      let convertedTertiary = "";
      if (data.koreanFullTextTertiary) {
          convertedTertiary = await convertJibangToHanja(data.koreanFullTextTertiary + hintStr);
      }

      onChange({ 
          ...data, 
          hanjaFullText: convertedPrimary,
          hanjaFullTextSecondary: convertedSecondary,
          hanjaFullTextTertiary: convertedTertiary
      });
      setIsConverting(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <label className="block text-sm font-medium text-stone-600 mb-1">대상 선택</label>
        <select
          value={data.relation}
          onChange={(e) => handleRelationChange(e.target.value as RelationType)}
          className="w-full p-3 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 focus:border-stone-500 outline-none transition-all shadow-sm"
        >
          {Object.entries(RELATION_HANJA).map(([key, info]) => (
            <option key={key} value={key}>
              {info.label}
            </option>
          ))}
        </select>
      </div>

      {/* Helper Inputs for Females (Single or Couple - Main/First Wife) */}
      {(isFemale || isCouple) && !isCustom && !isChild && (
        <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded-lg border border-stone-200">
             <div className="col-span-2 flex justify-between items-center">
                <span className="text-xs font-semibold text-stone-500">
                    {isCouple ? "아내(비) 정보 입력 (본비 기준)" : "한글 지방 내용 생성을 위한 정보"}
                </span>
                {isCouple && (
                    <button 
                        onClick={toggleTertiary}
                        className="flex items-center gap-1 text-[11px] px-2 py-1 rounded bg-stone-200 hover:bg-stone-300 text-stone-700 transition-colors"
                    >
                        {hasTertiary ? (
                            <><MinusCircleIcon className="w-3 h-3"/>재취비 삭제</>
                        ) : (
                            <><PlusCircleIcon className="w-3 h-3"/>재취비(두번째 아내) 추가</>
                        )}
                    </button>
                )}
             </div>
            <div>
                <label className="block text-xs text-stone-400 mb-1">본관 (예: 김해)</label>
                <input
                    type="text"
                    value={data.clan}
                    onChange={(e) => handleDetailChange('clan', e.target.value)}
                    placeholder="김해"
                    className="w-full p-2 text-sm border border-stone-300 rounded focus:border-stone-800 outline-none bg-white"
                />
            </div>
            <div>
                <label className="block text-xs text-stone-400 mb-1">성씨 (예: 김)</label>
                <input
                    type="text"
                    value={data.familyName}
                    onChange={(e) => handleDetailChange('familyName', e.target.value)}
                    placeholder="김"
                    className="w-full p-2 text-sm border border-stone-300 rounded focus:border-stone-800 outline-none bg-white"
                />
            </div>
        </div>
      )}

      {/* Helper Inputs for Second Wife (Tertiary) - Only visible if hasTertiary is true */}
      {isCouple && hasTertiary && !isCustom && (
        <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded-lg border border-stone-200 animate-in fade-in slide-in-from-top-2">
             <div className="col-span-2 text-xs font-semibold text-stone-500">
                재취비(두번째 아내) 정보 입력
             </div>
            <div>
                <label className="block text-xs text-stone-400 mb-1">본관 (예: 밀양)</label>
                <input
                    type="text"
                    value={data.clanTertiary || ''}
                    onChange={(e) => handleDetailChange('clanTertiary', e.target.value)}
                    placeholder="밀양"
                    className="w-full p-2 text-sm border border-stone-300 rounded focus:border-stone-800 outline-none bg-white"
                />
            </div>
            <div>
                <label className="block text-xs text-stone-400 mb-1">성씨 (예: 박)</label>
                <input
                    type="text"
                    value={data.familyNameTertiary || ''}
                    onChange={(e) => handleDetailChange('familyNameTertiary', e.target.value)}
                    placeholder="박"
                    className="w-full p-2 text-sm border border-stone-300 rounded focus:border-stone-800 outline-none bg-white"
                />
            </div>
        </div>
      )}

      {/* Helper Inputs for Children */}
      {isChild && !isCustom && (
        <div className="grid grid-cols-2 gap-3 bg-stone-50 p-3 rounded-lg border border-stone-200">
            <div className="col-span-2 text-xs font-semibold text-stone-500">자녀 정보 입력</div>
            <div>
                <label className="block text-xs text-stone-400 mb-1">이름</label>
                <input
                    type="text"
                    value={data.familyName} 
                    onChange={(e) => handleDetailChange('familyName', e.target.value)}
                    placeholder="예: 길동"
                    className="w-full p-2 text-sm border border-stone-300 rounded focus:border-stone-800 outline-none bg-white"
                />
            </div>
            <div>
                <label className="block text-xs text-stone-400 mb-1">한자 뜻/음</label>
                <input
                    type="text"
                    value={data.clan} 
                    onChange={(e) => handleDetailChange('clan', e.target.value)}
                    placeholder="예: 길할 길, 아이 동"
                    className="w-full p-2 text-sm border border-stone-300 rounded focus:border-stone-800 outline-none bg-white"
                />
            </div>
            <div className="col-span-2">
                 <p className="text-[10px] text-stone-400">
                    * 이름 칸에는 이름만 입력하고, 뜻/음 칸에 상세 정보를 적어주세요. AI가 이를 참고하여 한자를 변환합니다.
                </p>
            </div>
        </div>
      )}

      {/* Main Conversion Flow */}
      <div className="space-y-4">
          
          {/* Primary Input (Male or Single) */}
          <div>
            <label className="block text-sm font-medium text-stone-800 mb-1">
                {isCouple ? "남편(고) 한글 내용 (왼쪽)" : "한글 지방 내용"}
            </label>
            <input
                type="text"
                value={data.koreanFullText || ''}
                onChange={(e) => updateKoreanText(e.target.value, 'primary')}
                placeholder="예: 현고학생부군신위"
                className="w-full p-3 text-lg bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 font-medium"
            />
          </div>

          {/* Secondary Input (Wife 1, Only for Couple) */}
          {isCouple && (
            <div>
                <label className="block text-sm font-medium text-stone-800 mb-1">
                    {hasTertiary ? "본비(첫번째 아내) 한글 내용 (가운데)" : "아내(비) 한글 내용 (오른쪽)"}
                </label>
                <input
                    type="text"
                    value={data.koreanFullTextSecondary || ''}
                    onChange={(e) => updateKoreanText(e.target.value, 'secondary')}
                    placeholder="예: 현비유인OOO씨신위"
                    className="w-full p-3 text-lg bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 font-medium"
                />
            </div>
          )}

          {/* Tertiary Input (Wife 2, Only if enabled) */}
          {isCouple && hasTertiary && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-sm font-medium text-stone-800 mb-1">
                    재취비(두번째 아내) 한글 내용 (오른쪽)
                </label>
                <input
                    type="text"
                    value={data.koreanFullTextTertiary || ''}
                    onChange={(e) => updateKoreanText(e.target.value, 'tertiary')}
                    placeholder="예: 현비유인OOO씨신위"
                    className="w-full p-3 text-lg bg-stone-50 border border-stone-300 rounded-lg focus:ring-2 focus:ring-stone-500 font-medium"
                />
            </div>
          )}

          {/* Convert Button */}
          <button
            onClick={handleConvert}
            disabled={isConverting || (!data.koreanFullText && !data.koreanFullTextSecondary && !data.koreanFullTextTertiary)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-stone-800 text-stone-50 rounded-lg hover:bg-stone-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
             {isConverting ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
             ) : (
                 <ArrowPathIcon className="w-5 h-5 text-green-400" />
             )}
             <span className="font-medium">
                 {isConverting ? "한자로 변환 중..." : "한자로 변환"}
             </span>
          </button>

          {/* Hanja Inputs (Result) */}
          <div className={`grid ${isCouple ? (hasTertiary ? 'grid-cols-3 gap-1' : 'grid-cols-2 gap-2') : 'grid-cols-1'}`}>
              <div>
                <label className="block text-sm font-medium text-stone-800 mb-1 truncate">
                    {isCouple ? "남편(좌)" : "한자 내용"}
                </label>
                <div className="relative">
                    <input
                        type="text"
                        value={data.hanjaFullText || ''}
                        onChange={(e) => onChange({...data, hanjaFullText: e.target.value})}
                        className="w-full p-2 text-xl font-serif bg-white border-2 border-stone-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-center"
                    />
                </div>
              </div>

              {isCouple && (
                <div>
                    <label className="block text-sm font-medium text-stone-800 mb-1 truncate">
                        {hasTertiary ? "본비(중)" : "아내(우)"}
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={data.hanjaFullTextSecondary || ''}
                            onChange={(e) => onChange({...data, hanjaFullTextSecondary: e.target.value})}
                            className="w-full p-2 text-xl font-serif bg-white border-2 border-stone-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-center"
                        />
                    </div>
                </div>
              )}

              {isCouple && hasTertiary && (
                <div>
                    <label className="block text-sm font-medium text-stone-800 mb-1 truncate">
                        재취비(우)
                    </label>
                    <div className="relative">
                        <input
                            type="text"
                            value={data.hanjaFullTextTertiary || ''}
                            onChange={(e) => onChange({...data, hanjaFullTextTertiary: e.target.value})}
                            className="w-full p-2 text-xl font-serif bg-white border-2 border-stone-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-stone-400 text-center"
                        />
                    </div>
                </div>
              )}
          </div>

      </div>

      {/* AI Assistant Trigger */}
      <div className="pt-4 border-t border-stone-200">
        <button
            onClick={onOpenAiHelp}
            className="w-full flex items-center justify-center gap-2 py-2 text-stone-500 hover:text-stone-800 transition-colors"
        >
            <SparklesIcon className="w-4 h-4" />
            <span className="text-xs">작성법이나 한자가 궁금하신가요? (AI 채팅)</span>
        </button>
      </div>
    </div>
  );
};

export default JibangForm;