-- 再度実行する場合のために、既存のオブジェクトを削除するコードを含めることも可能
-- この SQL は Supabase の SQL Editor に貼り付けて実行してください

-- 1. profiles テーブル (ユーザー情報)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  reputation INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS 設定
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. questions テーブル (試験問題)
CREATE TABLE IF NOT EXISTS public.questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL, -- Markdown形式をサポート（画像など）
  choice_a TEXT NOT NULL,
  choice_b TEXT NOT NULL,
  choice_c TEXT NOT NULL,
  choice_d TEXT NOT NULL,
  correct_choice CHAR(1) CHECK (correct_choice IN ('A', 'B', 'C', 'D')) NOT NULL,
  explanation TEXT NOT NULL, -- Markdown形式をサポート
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Questions are viewable by everyone." ON public.questions;
CREATE POLICY "Questions are viewable by everyone." ON public.questions FOR SELECT USING (true);

-- シードデータ (PoCテスト用)
INSERT INTO public.questions (title, content, choice_a, choice_b, choice_c, choice_d, correct_choice, explanation) VALUES 
('問1: ネットワーク', 'OSI参照モデルにおいて、データリンク層で動作するデバイスはどれか。', 'リピータハブ', 'ブリッジ（スイッチングハブ）', 'ルータ', 'ゲートウェイ', 'B', 'データリンク層は第2層であり、MACアドレスに基づいてデータを転送するブリッジやスイッチングハブが動作します。'),
('問2: データベース', 'SQLにおいて、重複する行を除外して取得するためのキーワードはどれか。', 'GROUP BY', 'ORDER BY', 'DISTINCT', 'WHERE', 'C', 'SELECT DISTINCT カラム名 FROM テーブル名 と記述することで、重複を除外した結果を取得できます。'),
('問3: セキュリティ', '情報セキュリティの3要素（機密性、完全性、可用性）のうち、データが改ざんされていないことを保証するのはどれか。', '機密性', '完全性', '可用性', '真正性', 'B', '完全性 (Integrity) は、情報が正確で完全であること、また改ざんされていないことを保証する特性です。');

-- 3. comments テーブル (コメント)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES public.questions ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Comments are viewable by everyone." ON public.comments;
CREATE POLICY "Comments are viewable by everyone." ON public.comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can post comments." ON public.comments;
CREATE POLICY "Authenticated users can post comments." ON public.comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can update their own comments." ON public.comments;
CREATE POLICY "Users can update their own comments." ON public.comments FOR UPDATE USING (auth.uid() = user_id);

-- 4. votes テーブル (Good/Bad評価)
CREATE TABLE IF NOT EXISTS public.votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES public.comments ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles ON DELETE CASCADE NOT NULL,
  vote_type TEXT CHECK (vote_type IN ('good', 'bad')) NOT NULL,
  UNIQUE(comment_id, user_id)
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Votes are viewable by everyone." ON public.votes;
CREATE POLICY "Votes are viewable by everyone." ON public.votes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated users can vote." ON public.votes;
CREATE POLICY "Authenticated users can vote." ON public.votes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Users can update their own vote." ON public.votes;
CREATE POLICY "Users can update their own vote." ON public.votes FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own vote." ON public.votes;
CREATE POLICY "Users can delete their own vote." ON public.votes FOR DELETE USING (auth.uid() = user_id);

-- ユーザー作成時に自動的に profile を作成する関数とトリガー
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
