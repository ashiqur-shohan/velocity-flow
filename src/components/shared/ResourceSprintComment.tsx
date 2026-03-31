import React, { useState, useEffect } from 'react';
import { Input, message, Spin, Tooltip } from 'antd';
import { Pencil } from 'lucide-react';

export const ResourceSprintComment = ({
  sprintId,
  resourceId,
  comment,
  onSave
}: {
  sprintId: string;
  resourceId: string;
  comment: string;
  onSave: (text: string) => Promise<void>;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(comment || '');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalText(comment || '');
  }, [comment]);

  const handleSave = async () => {
    const trimmedNewText = localText.trim();
    const trimmedOldText = (comment || '').trim();
    
    if (trimmedNewText === trimmedOldText) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await onSave(trimmedNewText);
      setIsEditing(false);
      message.success('Comment saved');
    } catch (error) {
      message.error('Failed to save comment');
      setLocalText(comment || ''); // reset on error
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    } else if (e.key === 'Escape') {
      setLocalText(comment || '');
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="w-full min-w-[140px] bg-white rounded-md shadow-lg border border-gray-200 p-1 relative z-50 mb-1"
           onBlur={(e) => {
             // Ensure we don't save if clicking inside the popover/textarea itself
             if (!e.currentTarget.contains(e.relatedTarget)) {
               handleSave();
             }
           }}
           tabIndex={-1}
      >
        <Input.TextArea
          autoFocus
          value={localText}
          onChange={(e) => setLocalText(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={150}
          showCount
          autoSize={{ minRows: 2, maxRows: 4 }}
          className="text-xs !px-2 !py-1 !pb-4 !border-none !shadow-none focus:!shadow-none resize-none font-normal w-full"
          placeholder="Ctrl+Enter to save"
          disabled={isSaving}
        />
        {isSaving && (
          <div className="absolute right-1 bottom-1 bg-white/80 p-0.5 rounded">
            <Spin size="small" />
          </div>
        )}
      </div>
    );
  }

  const isEmpty = !localText || localText.trim() === '';
  const content = isEmpty ? (
    <span className="text-xs text-gray-300 font-normal italic border-b border-dashed border-gray-200 flex-shrink-0">
      + add note
    </span>
  ) : (
    <Tooltip title={localText} placement="top">
      <div className="text-xs text-gray-500 font-normal leading-snug line-clamp-2 w-full text-center">
        {localText}
      </div>
    </Tooltip>
  );

  return (
    <div 
      className="group relative w-full mb-1 min-h-[40px] flex items-center justify-center p-1 rounded transition-colors cursor-pointer hover:bg-gray-50 overflow-hidden"
      onClick={() => setIsEditing(true)}
    >
      {content}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-50 rounded pl-1 pr-1 border-l border-white shadow-[-4px_0_4px_white]">
        <Pencil size={10} className="text-gray-400" />
      </div>
    </div>
  );
};
