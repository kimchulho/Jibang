import React from 'react';

export const AboutPage: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
    <div className="text-center space-y-4 mb-12">
      <h1 className="text-3xl font-bold text-stone-900">지방(紙榜)이란 무엇인가요?</h1>
      <p className="text-stone-500">조상을 모시는 전통의 지혜, 지방에 대해 알아봅니다.</p>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 space-y-6">
      <section>
        <h2 className="text-xl font-semibold text-stone-800 mb-3">신주(神主)를 대신하는 종이</h2>
        <p className="text-stone-600 leading-relaxed">
          제사를 지낼 때는 조상의 위패인 신주(神主)를 모시고 지내야 합니다. 
          하지만 가정마다 사당을 짓고 신주를 모시는 것은 현실적으로 어렵기 때문에, 
          제사 등을 지낼 때 임시로 종이에 신주를 적어 사용하는 것이 바로 <strong>지방(紙榜)</strong>입니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-800 mb-3">지방의 유래와 의미</h2>
        <p className="text-stone-600 leading-relaxed">
          예로부터 관직에 나아가 품계를 받은 조상은 그 관직을 신주나 지방에 썼지만, 
          관직이 없는 조상은 '학생(學生)'이라 썼습니다. 이는 "배우는 사람"이라는 겸손한 뜻과 함께, 
          언젠가 벼슬길에 오르기를 바라는 후손의 마음이 담겨있기도 합니다.
          현대에는 고인의 직함이나 추모의 글을 덧붙이기도 하지만, 
          전통적인 서식인 <strong>현고학생부군신위</strong>가 가장 널리 쓰이고 있습니다.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-stone-800 mb-3">사용 후 처리</h2>
        <p className="text-stone-600 leading-relaxed">
          지방은 신주를 대신하는 신성한 물건이므로, 제사가 끝나면 조상님이 편안히 돌아가시길 기원하며 
          깨끗한 곳에서 불에 태워(소각) 하늘로 올려보내는 것이 예법입니다.
        </p>
      </section>
    </div>
  </div>
);

export const GuidePage: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
    <div className="text-center space-y-4 mb-12">
      <h1 className="text-3xl font-bold text-stone-900">지방 작성법 완전 정복</h1>
      <p className="text-stone-500">어려운 한자 용어, 하나씩 풀어서 설명해드립니다.</p>
    </div>

    <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-200 space-y-8">
      <section className="bg-stone-50 p-6 rounded-xl border border-stone-200">
        <h3 className="text-lg font-bold text-stone-900 mb-4 text-center">기본 서식 분해 (아버지 기준)</h3>
        <div className="flex justify-center gap-1.5 sm:gap-2 flex-wrap text-center">
            <div className="bg-white px-2 py-2 rounded shadow-sm border border-stone-200 min-w-[3.5rem]">
                <span className="block text-2xl font-serif font-bold text-stone-800">顯</span>
                <span className="text-xs text-stone-500">나타날 현</span>
            </div>
            <div className="bg-white px-2 py-2 rounded shadow-sm border border-stone-200 min-w-[3.5rem]">
                <span className="block text-2xl font-serif font-bold text-stone-800">考</span>
                <span className="text-xs text-stone-500">상고할 고</span>
            </div>
            <div className="bg-white px-2 py-2 rounded shadow-sm border border-stone-200 min-w-[3.5rem]">
                <span className="block text-2xl font-serif font-bold text-stone-800">學</span>
                <span className="text-xs text-stone-500">배울 학</span>
            </div>
            <div className="bg-white px-2 py-2 rounded shadow-sm border border-stone-200 min-w-[3.5rem]">
                <span className="block text-2xl font-serif font-bold text-stone-800">生</span>
                <span className="text-xs text-stone-500">날 생</span>
            </div>
            <div className="bg-white px-2 py-2 rounded shadow-sm border border-stone-200 min-w-[3.5rem]">
                <span className="block text-2xl font-serif font-bold text-stone-800">府</span>
                <span className="text-xs text-stone-500">마을 부</span>
            </div>
            <div className="bg-white px-2 py-2 rounded shadow-sm border border-stone-200 min-w-[3.5rem]">
                <span className="block text-2xl font-serif font-bold text-stone-800">君</span>
                <span className="text-xs text-stone-500">임금 군</span>
            </div>
            <div className="bg-white px-2 py-2 rounded shadow-sm border border-stone-200 min-w-[3.5rem]">
                <span className="block text-2xl font-serif font-bold text-stone-800">神</span>
                <span className="text-xs text-stone-500">귀신 신</span>
            </div>
            <div className="bg-white px-2 py-2 rounded shadow-sm border border-stone-200 min-w-[3.5rem]">
                <span className="block text-2xl font-serif font-bold text-stone-800">位</span>
                <span className="text-xs text-stone-500">자리 위</span>
            </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-stone-800">용어 상세 설명</h2>
        <ul className="space-y-4 text-stone-600">
          <li className="flex gap-3 items-start sm:items-center">
            <span className="font-bold text-stone-900 w-24 flex-shrink-0 whitespace-nowrap">현(顯)</span>
            <span>존경의 의미를 담아 '나타나십시오'라는 뜻으로 지방의 첫 글자에 씁니다.</span>
          </li>
          <li className="flex gap-3 items-start sm:items-center">
            <span className="font-bold text-stone-900 w-24 flex-shrink-0 whitespace-nowrap">고(考)</span>
            <span>돌아가신 아버지를 뜻합니다. 어머니는 <strong>비(妣)</strong>를 사용합니다.</span>
          </li>
          <li className="flex gap-3 items-start sm:items-center">
            <span className="font-bold text-stone-900 w-24 flex-shrink-0 whitespace-nowrap">학생(學生)</span>
            <span>관직이 없는 남성을 뜻합니다. 여성의 경우 <strong>유인(孺人)</strong>을 씁니다. 만약 고인이 공무원이었거나 직함이 있다면 직함을 쓰기도 합니다.</span>
          </li>
          <li className="flex gap-3 items-start sm:items-center">
            <span className="font-bold text-stone-900 w-24 flex-shrink-0 whitespace-nowrap">부군(府君)</span>
            <span>돌아가신 남성을 높여 부르는 말입니다. 여성은 본관과 성씨(예: 김해 김씨)를 씁니다.</span>
          </li>
          <li className="flex gap-3 items-start sm:items-center">
            <span className="font-bold text-stone-900 w-24 flex-shrink-0 whitespace-nowrap">신위(神位)</span>
            <span>조상님이 계시는 자리라는 뜻으로, 지방의 마지막에 씁니다.</span>
          </li>
        </ul>
      </section>
    </div>
  </div>
);

export const FaqPage: React.FC = () => (
  <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
    <div className="text-center space-y-4 mb-12">
      <h1 className="text-3xl font-bold text-stone-900">자주 묻는 질문 (FAQ)</h1>
      <p className="text-stone-500">지방 작성과 관련해 자주 주시는 질문들을 모았습니다.</p>
    </div>

    <div className="grid gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:border-stone-400 transition-colors">
        <h3 className="text-lg font-bold text-stone-800 mb-2">Q. 지방의 규격(크기)이 어떻게 되나요?</h3>
        <p className="text-stone-600">
          전통적인 지방의 크기는 가로 6cm, 세로 22cm입니다. 
          저희 앱은 A4 용지에 이 규격에 맞춰 3장을 출력하도록 설정되어 있으니, 
          재단선에 맞춰 자르시면 정확한 규격이 됩니다.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:border-stone-400 transition-colors">
        <h3 className="text-lg font-bold text-stone-800 mb-2">Q. 꼭 한지를 사용해야 하나요?</h3>
        <p className="text-stone-600">
          깨끗한 한지를 사용하는 것이 좋으나, 구하기 어렵다면 깨끗한 A4 용지(백지)를 사용하셔도 무방합니다. 
          중요한 것은 조상을 모시는 정성입니다.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:border-stone-400 transition-colors">
        <h3 className="text-lg font-bold text-stone-800 mb-2">Q. 부모님 두 분 다 돌아가셨는데 어떻게 쓰나요?</h3>
        <p className="text-stone-600">
          두 분 다 돌아가신 경우, 한 장의 지방에 나란히 씁니다(합설). 
          이때 남성(아버지)을 왼쪽에, 여성(어머니)을 오른쪽에 씁니다. 
          저희 앱에서 '부모님 (부부 합설)'을 선택하시면 자동으로 양식에 맞춰 작성해드립니다.
        </p>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 hover:border-stone-400 transition-colors">
        <h3 className="text-lg font-bold text-stone-800 mb-2">Q. 할아버지 제사인데 할머니 지방도 써야 하나요?</h3>
        <p className="text-stone-600">
          가문의 전통에 따라 다르지만, 보통 제사는 두 분을 함께 모시는 합설이 일반적입니다. 
          따라서 할아버지 제사라도 할머니 지방을 함께 써서 모시는 것이 좋습니다.
        </p>
      </div>
    </div>
  </div>
);