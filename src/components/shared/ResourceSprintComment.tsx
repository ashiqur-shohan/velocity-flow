import { useState, useEffect, useRef } from 'react';
import { Input, message, Tooltip, Spin } from 'antd';
import { Pencil, Check } from 'lucide-react';

interface ResourceSprintCommentProps {
  sprintId: string;
  resourceId: string;
  comment: string;
  onSave: (text: string) => Promise<void>;
}

export const ResourceSprintComment = ({ comment: initialComment, onSave }: ResourceSprintCommentProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(initialComment);
  const [loading, setLoading] = useState(false);
  const textAreaRef = useRef<any>(null);

  useEffect(() => {
    setLocalText(initialComment);
  }, [initialComment]);

  const handleSave = async () => {
    if (localText === initialComment) {
      setIsEditing(false);
      return;
    }
    setLoading(true);
    try {
      await onSave(localText);
      setIsEditing(false);
      message.success('Comment saved');
    } catch (error) {
      message.error('Failed to save');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setLocalText(initialComment);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (isEditing) {
    return (
      <div className="w-full px-1 min-h-[40px] flex flex-col gap-1 bg-white rounded shadow-sm border border-primary/20 p-1 z-10">
        <Input.TextArea
          ref={(ref) => {
             textAreaRef.current = ref;
             if (ref) ref.focus();
          }}
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onBlur={(e) => {
            // Prevent save if clicking the confirm button
            if (!e.relatedTarget?.closest('.confirm-save-btn')) {
              handleSave();
            }
          }}
          onKeyDown={handleKeyDown}
          autoSize={{ minRows: 1, maxRows: 3 }}
          className="text-xs !p-1"
          maxLength={150}
        />
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] text-gray-400">{localText.length}/150</span>
          <div className="flex gap-1">
            {loading ? <Spin size="small" /> : (
              <button 
                onMouseDown={(e) => e.preventDefault()} // Prevents blur before click
                onClick={handleSave} 
                className="confirm-save-btn text-primary hover:text-primary-focus p-0.5"
              >
                <Check size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full px-2 py-1 min-h-[40px] flex items-center justify-center cursor-pointer hover:bg-gray-50 rounded group relative transition-colors"
      onClick={() => setIsEditing(true)}
    >
      {initialComment ? (
        <Tooltip title={initialComment}>
          <p className="text-xs text-gray-500 leading-tight line-clamp-2 text-center w-full">
            {initialComment}
          </p>
        </Tooltip>
      ) : (
        <span className="text-xs text-gray-300 italic">+ add note</span>
      )}
      <div className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
        <Pencil size={10} />
      </div>
    </div>
  );
};
