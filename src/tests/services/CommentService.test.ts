import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CommentService } from '@/lib/services/CommentSevice';
import { createMockComment } from '../utils/mockData';
import {
  createMockQuerySnapshot,
  resetFirebaseMocks,
} from '../utils/firebase-mocks';

vi.mock('@/lib/firebase', () => ({
  db: {},
  auth: {},
  storage: {},
}));

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({})),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  onSnapshot: vi.fn(),
  Timestamp: {
    now: vi.fn(() => new Date()),
  },
}));

describe('CommentService', () => {
  let service: CommentService;
  const mockComment = createMockComment();

  beforeEach(() => {
    resetFirebaseMocks();
    service = new CommentService();
  });

  describe('create', () => {
    it('should create a comment successfully', async () => {
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockResolvedValue({ id: 'new-comment-id' } as any);

      const commentData = { ...mockComment };
      delete (commentData as any).id;

      const id = await service.create(commentData);

      expect(id).toBe('new-comment-id');
      expect(addDoc).toHaveBeenCalled();
    });

    it('should throw error on create failure', async () => {
      const { addDoc } = await import('firebase/firestore');
      vi.mocked(addDoc).mockRejectedValue(new Error('Firestore error'));

      const commentData = { ...mockComment };
      delete (commentData as any).id;

      await expect(service.create(commentData)).rejects.toThrow(
        'Failed to create comment'
      );
    });
  });

  describe('getByRecipe', () => {
    it('should get comments by recipe id', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockComments = [mockComment];
      const mockSnapshot = createMockQuerySnapshot(mockComments);

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const comments = await service.getByRecipe('recipe-1');

      expect(comments).toHaveLength(1);
      expect(comments[0].recipeId).toBe('recipe-1');
    });

    it('should throw error on fetch failure', async () => {
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(service.getByRecipe('recipe-1')).rejects.toThrow(
        'Failed to fetch comments'
      );
    });
  });

  describe('update', () => {
    it('should update comment successfully', async () => {
      const { updateDoc } = await import('firebase/firestore');
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await service.update('comment-1', { text: 'Updated comment' });

      expect(updateDoc).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete comment successfully', async () => {
      const { deleteDoc, getDocs } = await import('firebase/firestore');
      vi.mocked(deleteDoc).mockResolvedValue(undefined as any);
      vi.mocked(getDocs).mockResolvedValue(createMockQuerySnapshot([]) as any);

      await service.delete('comment-1');

      expect(deleteDoc).toHaveBeenCalled();
    });

    it('should delete comment with replies', async () => {
      const { deleteDoc, getDocs } = await import('firebase/firestore');
      const replies = [
        createMockComment({ id: 'reply-1', text: 'Reply 1' }),
        createMockComment({ id: 'reply-2', text: 'Reply 2' }),
      ];

      vi.mocked(getDocs).mockResolvedValue(
        createMockQuerySnapshot(replies) as any
      );
      vi.mocked(deleteDoc).mockResolvedValue(undefined as any);

      await service.delete('comment-1');

      expect(deleteDoc).toHaveBeenCalledTimes(3);
    });
  });

  describe('getTopLevelComments', () => {
    it('should filter top-level comments', () => {
      const comments = [
        createMockComment({ id: '1', text: 'Top level' }),
        createMockComment({
          id: '2',
          text: 'Reply',
          parentCommentId: '1',
        } as any),
        createMockComment({ id: '3', text: 'Another top level' }),
      ];

      const topLevel = service.getTopLevelComments(comments);

      expect(topLevel).toHaveLength(2);
      expect(topLevel.every((c) => !c.parentCommentId)).toBe(true);
    });
  });

  describe('getCommentReplies', () => {
    it('should get replies for a comment', () => {
      const comments = [
        createMockComment({ id: '1', text: 'Top level' }),
        createMockComment({
          id: '2',
          text: 'Reply 1',
          parentCommentId: '1',
        } as any),
        createMockComment({
          id: '3',
          text: 'Reply 2',
          parentCommentId: '1',
        } as any),
      ];

      const replies = service.getCommentReplies(comments, '1');

      expect(replies).toHaveLength(2);
      expect(replies.every((r) => r.parentCommentId === '1')).toBe(true);
    });
  });

  describe('groupCommentsWithReplies', () => {
    it('should group comments with their replies', () => {
      const comments = [
        createMockComment({ id: '1', text: 'Top level 1' }),
        createMockComment({
          id: '2',
          text: 'Reply to 1',
          parentCommentId: '1',
        } as any),
        createMockComment({ id: '3', text: 'Top level 2' }),
      ];

      const grouped = service.groupCommentsWithReplies(comments);

      expect(grouped).toHaveLength(2);
      expect(grouped[0].comment.id).toBe('1');
      expect(grouped[0].replies).toHaveLength(1);
      expect(grouped[1].comment.id).toBe('3');
      expect(grouped[1].replies).toHaveLength(0);
    });
  });

  describe('getCommentStats', () => {
    it('should calculate comment statistics', () => {
      const comments = [
        createMockComment({ id: '1', rating: 5 }),
        createMockComment({ id: '2', rating: 4 }),
        createMockComment({ id: '3', rating: 5 }),
        createMockComment({
          id: '4',
          text: 'Reply',
          parentCommentId: '1',
          rating: null,
        } as any),
      ];

      const stats = service.getCommentStats(comments);

      expect(stats.totalComments).toBe(3);
      expect(stats.totalReplies).toBe(1);
      expect(stats.avgRating).toBeCloseTo(4.67, 1);
      expect(stats.ratingDistribution[5]).toBe(2);
      expect(stats.ratingDistribution[4]).toBe(1);
    });

    it('should handle comments without ratings', () => {
      const comments = [
        createMockComment({ id: '1', rating: null }),
        createMockComment({ id: '2', rating: null }),
      ];

      const stats = service.getCommentStats(comments);

      expect(stats.avgRating).toBe(0);
      expect(stats.totalComments).toBe(2);
    });
  });

  describe('validateComment', () => {
    it('should validate valid comment', () => {
      const result = service.validateComment('Great recipe!', 5);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject empty comment', () => {
      const result = service.validateComment('', 5);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Comment text is required');
    });

    it('should reject too long comment', () => {
      const result = service.validateComment('a'.repeat(1001), 5);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain(
        'Comment must be less than 1000 characters'
      );
    });

    it('should reject invalid rating', () => {
      const result = service.validateComment('Great!', 6 as any);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Rating must be between 1 and 5');
    });

    it('should accept comment without rating', () => {
      const result = service.validateComment('Just a comment');

      expect(result.isValid).toBe(true);
    });
  });

  describe('hasUserRated', () => {
    it('should return true if user has rated', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockSnapshot = createMockQuerySnapshot([mockComment]);

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const hasRated = await service.hasUserRated('user-1', 'recipe-1');

      expect(hasRated).toBe(true);
    });

    it('should return false if user has not rated', async () => {
      const { getDocs } = await import('firebase/firestore');
      const mockSnapshot = createMockQuerySnapshot([]);

      vi.mocked(getDocs).mockResolvedValue(mockSnapshot as any);

      const hasRated = await service.hasUserRated('user-1', 'recipe-1');

      expect(hasRated).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      const { getDocs } = await import('firebase/firestore');
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      const hasRated = await service.hasUserRated('user-1', 'recipe-1');

      expect(hasRated).toBe(false);
    });
  });
});
