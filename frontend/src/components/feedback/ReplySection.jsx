// src/components/feedback/ReplySection.jsx
import { Trash2 } from 'lucide-react';

export default function ReplySection({ reply, canDelete, onDelete }) {
  return (
    <div className="flex justify-between items-start bg-gray-50 p-3 rounded-lg">
      <div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold">{reply.author?.name}</span>
          <span className="text-gray-400 text-xs">{new Date(reply.createdAt).toLocaleString()}</span>
          {reply.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
        </div>
        <p className="text-sm mt-1">{reply.content}</p>
      </div>
      {canDelete && (
        <button onClick={onDelete} className="text-gray-400 hover:text-red-600">
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}