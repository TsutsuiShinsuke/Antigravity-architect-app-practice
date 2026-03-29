-- questions テーブルに 1級建築士試験用のカラムを追加
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS year INT,
ADD COLUMN IF NOT EXISTS subject INT CHECK (subject BETWEEN 1 AND 5),
ADD COLUMN IF NOT EXISTS question_number INT;

-- 既存のデータがある場合のためのデフォルト値設定（必要に応じて）
-- UPDATE public.questions SET year = 2024, subject = 1, question_number = 1 WHERE year IS NULL;

-- ユニーク制約の追加（年度・科目・問題番号の組み合わせをユニークに）
-- 注意: 既存データで重複がある場合は失敗するため、既存データがない場合やクリーンアップ後に実行することを推奨
ALTER TABLE public.questions
ADD CONSTRAINT unique_question_identity UNIQUE (year, subject, question_number);

-- 検索用インデックスの追加
CREATE INDEX IF NOT EXISTS idx_questions_year_subject ON public.questions (year, subject);

-- 既存のシードデータを更新（もし PoC 用データが残っているなら）
UPDATE public.questions SET year = 2024, subject = 1, question_number = 1 WHERE title = '問1: ネットワーク';
UPDATE public.questions SET year = 2024, subject = 1, question_number = 2 WHERE title = '問2: データベース';
UPDATE public.questions SET year = 2024, subject = 1, question_number = 3 WHERE title = '問3: セキュリティ';
