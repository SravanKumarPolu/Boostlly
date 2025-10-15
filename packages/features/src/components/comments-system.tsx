import { useState, useEffect } from "react";
import { Button, Badge, Input } from "@boostlly/ui";
import {
  Comment,
  SocialEcosystemService,
  logError,
  logDebug,
  logWarning,
} from "@boostlly/core";
import {
  MessageCircle,
  Heart,
  Reply,
  Edit,
  Trash2,
  Send,
  User,
  Flag,
  Check,
  X,
} from "lucide-react";

interface CommentsSystemProps {
  quoteId: string;
  currentUserId?: string;
  onCommentAdded?: () => void;
}

export function CommentsSystem({
  quoteId,
  currentUserId,
  onCommentAdded,
}: CommentsSystemProps) {
  const [socialService] = useState(() => SocialEcosystemService.getInstance());
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);

  useEffect(() => {
    loadComments();
  }, [quoteId]);

  const loadComments = async () => {
    try {
      // Ensure the service is properly initialized
      await socialService.ensureInitialized();
      const commentsData = await socialService.getComments(
        quoteId,
        currentUserId,
      );
      setComments(commentsData);
    } catch (error) {
      logError("Failed to load comments:", { error: error });
    }
  };

  const handleAddComment = async () => {
    if (!currentUserId || !newComment.trim()) return;

    setIsLoading(true);
    try {
      // Ensure the service is properly initialized
      await socialService.ensureInitialized();
      await socialService.addComment(
        quoteId,
        currentUserId,
        newComment.trim(),
        replyingTo || undefined,
      );
      setNewComment("");
      setReplyingTo(null);
      await loadComments();
      onCommentAdded?.();
    } catch (error) {
      logError("Failed to add comment:", { error: error });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUserId) return;

    try {
      await socialService.likeComment(commentId, currentUserId);
      await loadComments();
    } catch (error) {
      logError("Failed to like comment:", { error: error });
    }
  };

  const handleEditComment = async (commentId: string) => {
    if (!currentUserId || !editContent.trim()) return;

    try {
      await socialService.editComment(
        commentId,
        currentUserId,
        editContent.trim(),
      );
      setEditingComment(null);
      setEditContent("");
      await loadComments();
    } catch (error) {
      logError("Failed to edit comment:", { error: error });
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUserId) return;

    try {
      await socialService.deleteComment(commentId, currentUserId);
      await loadComments();
    } catch (error) {
      logError("Failed to delete comment:", { error: error });
    }
  };

  const handleReportComment = async (commentId: string) => {
    if (!currentUserId) return;

    try {
      await socialService.reportComment(
        commentId,
        currentUserId,
        "Inappropriate content",
      );
      // Show feedback to user
      alert("Comment reported successfully");
    } catch (error) {
      logError("Failed to report comment:", { error: error });
    }
  };

  const formatTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const processCommentContent = (content: string) => {
    // Process mentions and hashtags
    return content
      .replace(/@(\w+)/g, '<span class="text-blue-400 font-medium">@$1</span>')
      .replace(
        /#(\w+)/g,
        '<span class="text-purple-400 font-medium">#$1</span>',
      );
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`space-y-3 ${isReply ? "ml-6 border-l-2 border-border pl-4" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center">
          {comment.userAvatar ? (
            <img
              src={comment.userAvatar}
              alt={comment.username}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <User className="w-4 h-4 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {comment.username}
            </span>
            <span className="text-xs text-muted-foreground/60">
              {formatTimeAgo(new Date(comment.createdAt || comment.timestamp))}
            </span>
            {comment.isEdited && (
              <Badge variant="glass" className="text-xs">
                edited
              </Badge>
            )}
            {comment.moderationStatus === "flagged" && (
              <Badge variant="destructive" className="text-xs">
                flagged
              </Badge>
            )}
          </div>

          {editingComment === comment.id ? (
            <div className="space-y-2">
              <Input
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                className="bg-background/5 border-border"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditComment(comment.id)}
                >
                  <Check className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingComment(null);
                    setEditContent("");
                  }}
                >
                  <X className="w-3 h-3 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div
              className="text-sm text-foreground/80 leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: processCommentContent(comment.content),
              }}
            />
          )}

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleLikeComment(comment.id)}
              className={`text-xs ${comment.isLiked ? "text-red-400" : "text-muted-foreground"}`}
            >
              <Heart
                className={`w-3 h-3 mr-1 ${comment.isLiked ? "fill-current" : ""}`}
              />
              {comment.likes}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setReplyingTo(replyingTo === comment.id ? null : comment.id)
              }
              className="text-xs text-muted-foreground"
            >
              <Reply className="w-3 h-3 mr-1" />
              Reply
            </Button>

            {currentUserId === comment.userId && (
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEditingComment(comment.id);
                    setEditContent(comment.content);
                  }}
                  className="text-xs text-muted-foreground"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-xs text-red-400"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            )}

            {currentUserId !== comment.userId && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReportComment(comment.id)}
                className="text-xs text-muted-foreground"
              >
                <Flag className="w-3 h-3" />
              </Button>
            )}
          </div>

          {/* Reply form */}
          {replyingTo === comment.id && (
            <div className="space-y-2">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={`Reply to ${comment.username}...`}
                className="bg-background/5 border-border"
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddComment}
                  disabled={isLoading}
                >
                  <Send className="w-3 h-3 mr-1" />
                  Reply
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setNewComment("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Show replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="space-y-3">
              {comment.replies.map((reply: Comment) =>
                renderComment(reply, true),
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const displayedComments = showAllComments ? comments : comments.slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Comments</h3>
          <Badge variant="glass" className="text-xs">
            {comments.length}
          </Badge>
        </div>
      </div>

      {/* Add Comment */}
      {currentUserId && (
        <div className="space-y-2">
          <Input
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={replyingTo ? "Write a reply..." : "Add a comment..."}
            className="bg-background/5 border-border"
            onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
          />
          <div className="flex justify-between items-center">
            <div className="text-xs text-muted-foreground/60">
              {newComment.length}/500 characters
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddComment}
              disabled={isLoading || !newComment.trim()}
            >
              <Send className="w-3 h-3 mr-1" />
              Comment
            </Button>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        {displayedComments.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground/60">
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          displayedComments.map((comment) => renderComment(comment))
        )}
      </div>

      {/* Show More Comments */}
      {comments.length > 3 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowAllComments(!showAllComments)}
          className="w-full text-muted-foreground"
        >
          {showAllComments
            ? "Show Less"
            : `Show ${comments.length - 3} More Comments`}
        </Button>
      )}
    </div>
  );
}
