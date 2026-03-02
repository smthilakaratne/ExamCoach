// src/components/feedback/ReactionButton.jsx
import { ThumbsUp, HelpCircle, CheckCircle, XCircle } from 'lucide-react';

const icons = {
  like: ThumbsUp,
  helpful: HelpCircle,
  agree: CheckCircle,
  disagree: XCircle,
};

export default function ReactionButton({ type, count, onClick }) {
  const Icon = icons[type];
  return (
    <button onClick={onClick} className="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 transition">
      <Icon className="w-4 h-4" />
      <span>{count}</span>
    </button>
  );
}