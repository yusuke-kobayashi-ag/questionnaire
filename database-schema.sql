-- アンケートシステム用のテーブル作成
-- SupabaseのSQL Editorで実行してください

-- 質問タイプのEnum
CREATE TYPE question_type AS ENUM (
  'SINGLE_CHOICE',
  'MULTIPLE_CHOICE', 
  'TEXT_INPUT',
  'NUMBER_INPUT',
  'SLIDER',
  'COMPARISON_SLIDER'
);

-- Surveysテーブル（アンケート）
CREATE TABLE surveys (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Questionsテーブル（質問）
CREATE TABLE questions (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type question_type NOT NULL,
  question_order INTEGER NOT NULL,
  min_value DECIMAL,
  max_value DECIMAL,
  step_value DECIMAL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Optionsテーブル（選択肢）
CREATE TABLE options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  option_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Respondentsテーブル（回答者）
CREATE TABLE respondents (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  gender TEXT,
  age INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Responsesテーブル（回答）
CREATE TABLE responses (
  id SERIAL PRIMARY KEY,
  survey_id INTEGER REFERENCES surveys(id) ON DELETE CASCADE,
  respondent_id INTEGER REFERENCES respondents(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  answer_text TEXT,
  option_id INTEGER REFERENCES options(id) ON DELETE SET NULL,
  attempt_number INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX idx_questions_survey_id ON questions(survey_id);
CREATE INDEX idx_questions_order ON questions(survey_id, question_order);
CREATE INDEX idx_options_question_id ON options(question_id);
CREATE INDEX idx_options_order ON options(question_id, option_order);
CREATE INDEX idx_responses_survey_id ON responses(survey_id);
CREATE INDEX idx_responses_respondent_id ON responses(respondent_id);
CREATE INDEX idx_responses_question_id ON responses(question_id);

-- Row Level Security (RLS) の設定
ALTER TABLE surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE respondents ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- 全てのテーブルに対して読み書き可能なポリシーを作成（開発用）
-- 本番環境では適切な権限設定に変更してください

CREATE POLICY "Allow all operations on surveys" ON surveys FOR ALL USING (true);
CREATE POLICY "Allow all operations on questions" ON questions FOR ALL USING (true);
CREATE POLICY "Allow all operations on options" ON options FOR ALL USING (true);
CREATE POLICY "Allow all operations on respondents" ON respondents FOR ALL USING (true);
CREATE POLICY "Allow all operations on responses" ON responses FOR ALL USING (true);

-- テストデータの挿入（オプション）
INSERT INTO surveys (title, description) VALUES 
('サンプルアンケート', 'これはテスト用のアンケートです。');

-- 作成されたテーブルの確認
SELECT 
  tablename,
  tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('surveys', 'questions', 'options', 'respondents', 'responses'); 