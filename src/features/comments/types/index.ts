export type Comment = {
  id: string;
  question_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string | null;
  } | null;
  votes_count: number;
  user_vote: 'good' | 'bad' | null;
};
