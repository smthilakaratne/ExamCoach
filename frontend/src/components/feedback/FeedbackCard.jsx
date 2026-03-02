// src/components/feedback/FeedbackCard.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { updateFeedback, deleteFeedback, reactToFeedback, addReply, deleteReply } from '../../services/feedbackService';
import toast from 'react-hot-toast';
import { ThumbsUp, MessageCircle, Trash2, Edit2, X } from 'lucide-react';
import ReactionButton from './ReactionButton';
import ReplySection from './ReplySection';

export default function FeedbackCard({ feedback, onUpdate }) {
  const { user } = useAuth();
  const isAuthor = user?._id === feedback.author?._id;
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(feedback.title);
  const [editedContent, setEditedContent] = useState(feedback.content);
  const [replyContent, setReplyContent] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this feedback?')) return;
    try {
      await deleteFeedback(feedback._id);
      toast.success('Feedback deleted');
      onUpdate(); // refresh list
    } catch (error) {}
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updateFeedback(feedback._id, { title: editedTitle, content: editedContent });
      toast.success('Feedback updated');
      setEditMode(false);
      onUpdate();
    } catch (error) {} finally {
      setSubmitting(false);
    }
  };

  const handleReact = async (type) => {
    try {
      await reactToFeedback(feedback._id, type);
      onUpdate(); // refresh to get new reaction summary
    } catch (error) {}
  };

  const handleAddReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setSubmitting(true);
    try {
      await addReply(feedback._id, { content: replyContent });
      setReplyContent('');
      setShowReply(false);
      onUpdate();
    } catch (error) {} finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReply = async (replyId) => {
    if (!confirm('Delete this reply?')) return;
    try {
      await deleteReply(feedback._id, replyId);
      onUpdate();
    } catch (error) {}
  };

  const statusColor = {
    pending: 'bg-yellow-100 text-yellow-800',
    reviewed: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  return (
    <div className="card-hover mb-4">
      {editMode ? (
        <form onSubmit={handleUpdate} className="space-y-3">
          <input
            type="text"
            className="input-field"
            value={editedTitle}
            onChange={(e) => setEditedTitle(e.target.value)}
            required
          />
          <textarea
            className="input-field"
            rows="4"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            required
          />
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="btn-primary">Save</button>
            <button type="button" onClick={() => setEditMode(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold">{feedback.title}</h3>
              <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                <span>by {feedback.author?.name}</span>
                <span>•</span>
                <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                <span className={`badge ${statusColor[feedback.status]}`}>{feedback.status}</span>
                {feedback.isEdited && <span className="badge bg-gray-100 text-gray-600">edited</span>}
              </div>
            </div>
            {(isAuthor || user?.role === 'admin') && (
              <div className="flex gap-1">
                {isAuthor && (
                  <button onClick={() => setEditMode(true)} className="p-1 text-gray-500 hover:text-indigo-600">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                <button onClick={handleDelete} className="p-1 text-gray-500 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <p className="mt-3 text-gray-700 whitespace-pre-wrap">{feedback.content}</p>

          {/* Reactions */}
          <div className="flex items-center gap-2 mt-4">
            {['like', 'helpful', 'agree', 'disagree'].map(type => (
              <ReactionButton
                key={type}
                type={type}
                count={feedback.reactionSummary?.[type] || 0}
                onClick={() => handleReact(type)}
              />
            ))}
          </div>

          {/* Admin note */}
          {feedback.adminNote && user?.role === 'admin' && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
              <span className="font-semibold">Admin note:</span> {feedback.adminNote}
            </div>
          )}

          {/* Replies */}
          <div className="mt-4">
            <button onClick={() => setShowReply(!showReply)} className="text-sm text-indigo-600 hover:underline flex items-center gap-1">
              <MessageCircle className="w-4 h-4" /> {feedback.replies?.length || 0} replies
            </button>
            {showReply && (
              <div className="mt-3 space-y-3">
                {feedback.replies?.map(reply => (
                  <ReplySection
                    key={reply._id}
                    reply={reply}
                    canDelete={user?.role === 'admin' || reply.author?._id === user?._id}
                    onDelete={() => handleDeleteReply(reply._id)}
                  />
                ))}
                <form onSubmit={handleAddReply} className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="input-field flex-1"
                    placeholder="Write a reply..."
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                  />
                  <button type="submit" disabled={submitting} className="btn-primary px-4">Send</button>
                </form>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}