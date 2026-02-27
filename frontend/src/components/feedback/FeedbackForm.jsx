// src/components/feedback/FeedbackForm.jsx
import { useState } from 'react';
import { createFeedback } from '../../services/feedbackService';
import toast from 'react-hot-toast';

export default function FeedbackForm({ onSuccess }) {
  const [form, setForm] = useState({ title: '', content: '', category: 'general', isPublic: true });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await createFeedback(form);
      toast.success('Feedback submitted');
      setForm({ title: '', content: '', category: 'general', isPublic: true });
      onSuccess?.();
    } catch (error) {} finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card mb-8 space-y-4">
      <h2 className="text-xl font-bold">Submit Feedback</h2>
      <div>
        <label className="label">Title</label>
        <input
          type="text"
          className="input-field"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          minLength={5}
        />
      </div>
      <div>
        <label className="label">Content</label>
        <textarea
          className="input-field"
          rows="4"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
          minLength={10}
        />
      </div>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="label">Category</label>
          <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            <option value="general">General</option>
            <option value="course">Course</option>
            <option value="platform">Platform</option>
            <option value="suggestion">Suggestion</option>
            <option value="bug">Bug</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="flex items-end pb-2">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isPublic}
              onChange={(e) => setForm({ ...form, isPublic: e.target.checked })}
            />
            Public
          </label>
        </div>
      </div>
      <button type="submit" disabled={submitting} className="btn-primary">Submit Feedback</button>
    </form>
  );
}