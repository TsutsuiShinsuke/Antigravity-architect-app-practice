-- 正解判定を行うための RPC 関数を追加
CREATE OR REPLACE FUNCTION public.validate_answer(
  p_question_id UUID,
  p_selected_choice TEXT
)
RETURNS JSON AS $$
DECLARE
  v_correct_choice TEXT;
  v_explanation TEXT;
  v_is_correct BOOLEAN;
BEGIN
  -- questions テーブルから正解と解説を取得
  -- SECURITY DEFINER なので、RLS に関係なくアクセス可能
  SELECT correct_choice, explanation 
  INTO v_correct_choice, v_explanation
  FROM public.questions 
  WHERE id = p_question_id;

  -- 判定
  v_is_correct := (v_correct_choice = p_selected_choice);

  -- 結果を JSON で返却
  RETURN json_build_object(
    'is_correct', v_is_correct,
    'correct_choice', v_correct_choice,
    'explanation', v_explanation
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 匿名ユーザーおよび認証済みユーザーに関数の実行権限を付与
GRANT EXECUTE ON FUNCTION public.validate_answer(UUID, TEXT) TO anon, authenticated;

-- セッション全体の回答を検証し、結果と解説をまとめて返す関数
CREATE OR REPLACE FUNCTION public.get_session_results(
  p_user_answers JSONB -- 例: [{"id": "uuid", "choice": "A"}, ...]
)
RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- 各回答について正誤判定と解説を結合
  WITH results AS (
    SELECT 
      ans->>'id' as q_id,
      ans->>'choice' as selected,
      q.correct_choice,
      q.explanation,
      (ans->>'choice' = q.correct_choice) as is_correct
    FROM jsonb_array_elements(p_user_answers) as ans
    JOIN public.questions q ON q.id = (ans->>'id')::UUID
  )
  SELECT jsonb_build_object(
    'questions', jsonb_agg(
      jsonb_build_object(
        'id', q_id,
        'is_correct', is_correct,
        'correct_choice', correct_choice,
        'explanation', explanation
      )
    ),
    'score', (SELECT count(*) FROM results WHERE is_correct)
  ) INTO v_result
  FROM results;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_session_results(JSONB) TO anon, authenticated;
