'use client';

import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, Send, Loader2 } from 'lucide-react';
import { commentService } from '../services';
import { Comment } from '../types';
import { supabase } from '@/lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CommentSectionProps {
  questionId: string;
}

export default function CommentSection({ questionId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndComments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      
      try {
        const fetchedComments = await commentService.getByQuestionId(questionId, user?.id);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndComments();
  }, [questionId]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return;

    setSubmitting(true);
    try {
      await commentService.postComment(questionId, userId, newComment);
      const updatedComments = await commentService.getByQuestionId(questionId, userId);
      setComments(updatedComments);
      setNewComment('');
    } catch (error) {
      console.error('Failed to post comment:', error);
      alert('コメントの投稿に失敗しました。');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (commentId: string, voteType: 'good' | 'bad') => {
    if (!userId) {
      alert('評価するにはログインが必要です。');
      return;
    }

    const comment = comments.find(c => c.id === commentId);
    if (!comment) return;

    try {
      if (comment.user_vote === voteType) {
        await commentService.removeVote(commentId, userId);
      } else {
        await commentService.vote(commentId, userId, voteType);
      }
      const updatedComments = await commentService.getByQuestionId(questionId, userId);
      setComments(updatedComments);
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <h2 className="text-xl font-bold flex items-center gap-2 px-2">
        <MessageSquare size={20} />
        学習者の意見 ({comments.length})
      </h2>

      {/* Comment Form */}
      {userId ? (
        <form onSubmit={handlePostComment} className="glass p-6 rounded-3xl space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={submitting}
            className="w-full p-4 bg-white/50 border border-border rounded-2xl focus:ring-2 focus:ring-primary focus:outline-none min-h-[100px] transition-all"
            placeholder="解説への意見や、あなたの覚え方をシェアしましょう..."
          />
          <div className="flex justify-end">
            <button 
              type="submit"
              disabled={submitting || !newComment.trim()}
              className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />}
              投稿する
            </button>
          </div>
        </form>
      ) : (
        <div className="glass p-8 rounded-3xl text-center space-y-4 border-2 border-dashed border-primary/20">
          <p className="text-muted-foreground font-medium">コメントを投稿するにはログインが必要です。</p>
          <a href="/login" className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-full font-bold hover:opacity-90 transition-opacity">
            ログインページへ
          </a>
        </div>
      )}

      {/* Comment List */}
      <div className="space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="bg-white p-6 rounded-3xl border border-border flex gap-4 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center gap-2 pt-1">
              <button 
                onClick={() => handleVote(c.id, 'good')}
                className={cn(
                  "p-2 hover:bg-green-50 rounded-lg transition-colors",
                  c.user_vote === 'good' ? "text-green-600 bg-green-50" : "text-muted-foreground"
                )}
              >
                <ThumbsUp size={20} className={c.user_vote === 'good' ? "fill-current" : ""} />
              </button>
              <span className={cn(
                "font-bold text-sm",
                c.votes_count > 0 && "text-green-600",
                c.votes_count < 0 && "text-red-600"
              )}>
                {c.votes_count}
              </span>
              <button 
                onClick={() => handleVote(c.id, 'bad')}
                className={cn(
                  "p-2 hover:bg-red-50 rounded-lg transition-colors",
                  c.user_vote === 'bad' ? "text-red-600 bg-red-50" : "text-muted-foreground"
                )}
              >
                <ThumbsDown size={20} className={c.user_vote === 'bad' ? "fill-current" : ""} />
              </button>
            </div>
            
            <div className="flex-grow space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-bold">{c.profiles?.username || '名無しさん'}</span>
                <span className="text-xs text-muted-foreground italic">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {c.content}
              </p>
            </div>
          </div>
        ))}
        {comments.length === 0 && !loading && (
          <div className="text-center py-12 text-muted-foreground italic">
            まだコメントはありません。
          </div>
        )}
      </div>
    </section>
  );
}
