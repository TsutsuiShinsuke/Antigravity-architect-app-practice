import { supabase } from '@/lib/supabase';
import { Comment } from '../types';


export const commentService = {
  async getByQuestionId(questionId: string, userId?: string): Promise<Comment[]> {
    // 1. Fetch comments with profiles
    const { data: comments, error: commentError } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (username)
      `)
      .eq('question_id', questionId)
      .order('created_at', { ascending: true });

    if (commentError) throw commentError;

    // 2. Fetch votes and counts (doing it in a loop for simple PoC or use RPC for performance)
    const commentsWithVotes = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: votes, error: votesError } = await supabase
          .from('votes')
          .select('vote_type')
          .eq('comment_id', comment.id);

        if (votesError) throw votesError;

        const goodCount = votes.filter(v => v.vote_type === 'good').length;
        const badCount = votes.filter(v => v.vote_type === 'bad').length;

        let userVote: 'good' | 'bad' | null = null;
        if (userId) {
          const { data: myVote } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('comment_id', comment.id)
            .eq('user_id', userId)
            .single();
          
          if (myVote) userVote = myVote.vote_type as 'good' | 'bad';
        }

        return {
          ...comment,
          votes_count: goodCount - badCount,
          user_vote: userVote
        };
      })
    );

    return commentsWithVotes as Comment[];
  },

  async postComment(questionId: string, userId: string, content: string) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ question_id: questionId, user_id: userId, content })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async vote(commentId: string, userId: string, voteType: 'good' | 'bad') {
    // Use upsert for voting
    const { error } = await supabase
      .from('votes')
      .upsert(
        { comment_id: commentId, user_id: userId, vote_type: voteType },
        { onConflict: 'comment_id,user_id' }
      );

    if (error) throw error;
  },

  async removeVote(commentId: string, userId: string) {
    const { error } = await supabase
      .from('votes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId);

    if (error) throw error;
  }
};
