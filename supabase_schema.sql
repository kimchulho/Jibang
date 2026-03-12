-- 여성의 본관성씨를 DB화하여 관리하는 테이블
CREATE TABLE IF NOT EXISTS jibang_bon_gwan (
    id BIGSERIAL PRIMARY KEY,
    surname TEXT NOT NULL, -- 성씨 (예: 김)
    bon_gwan TEXT NOT NULL, -- 본관 (예: 김해)
    hanja_surname TEXT NOT NULL, -- 성씨 한자 (예: 金)
    hanja_bon_gwan TEXT NOT NULL, -- 본관 한자 (예: 金海)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(surname, bon_gwan)
);

-- 지방 생성 이력을 저장하는 테이블
CREATE TABLE IF NOT EXISTS jibang_history (
    id BIGSERIAL PRIMARY KEY,
    target_name TEXT, -- 대상 (예: 조모)
    content_ko TEXT, -- 한글 내용
    content_hj TEXT, -- 한자 내용
    action_type TEXT, -- 이미지저장, PDF저장, 바로인쇄
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 인덱스 추가 (검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_jibang_bon_gwan_surname_bon_gwan ON jibang_bon_gwan(surname, bon_gwan);
