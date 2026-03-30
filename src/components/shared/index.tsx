import { Tag, Progress, Avatar, Button, Modal, Typography } from 'antd';
import { getProductivityColor, getSprintStatusColor, getGoalStatusColor } from '@/constants';
import type { SprintStatus, GoalStatus } from '@/constants';
import { AlertTriangle } from 'lucide-react';
import { ReactNode, useState } from 'react';

export const ProductivityBadge = ({ value }: { value: number }) => {
  const color = getProductivityColor(value);
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-semibold" style={{ backgroundColor: color + '20', color }}>
      {value.toFixed(value % 1 === 0 ? 0 : 2)}%
    </span>
  );
};

export const SprintStatusTag = ({ status }: { status: SprintStatus }) => (
  <Tag color={getSprintStatusColor(status)} className="font-medium">{status}</Tag>
);

export const GoalStatusTag = ({ status }: { status: GoalStatus }) => (
  <Tag color={getGoalStatusColor(status)} className="font-medium">{status}</Tag>
);

export const PointCell = ({ planned, actual }: { planned: number; actual: number }) => {
  const pct = planned > 0 ? (actual / planned) * 100 : 0;
  const color = getProductivityColor(pct);
  return (
    <span className="font-mono text-sm" style={{ color: pct >= 80 ? undefined : color }}>
      {actual}<span className="text-muted-foreground">/{planned}</span>
    </span>
  );
};

export const ResourceAvatar = ({ name, size = 32 }: { name: string; size?: number }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const colors = ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#8B5CF6', '#06B6D4', '#EC4899'];
  const color = colors[name.length % colors.length];
  return <Avatar style={{ backgroundColor: color }} size={size}>{initials}</Avatar>;
};

export const EmptyState = ({ title, description, action }: { title: string; description: string; action?: ReactNode }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
      <AlertTriangle size={24} className="text-muted-foreground" />
    </div>
    <Typography.Title level={5} className="!mb-1">{title}</Typography.Title>
    <Typography.Text type="secondary" className="mb-4">{description}</Typography.Text>
    {action}
  </div>
);

export const PageHeader = ({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-2xl font-bold text-foreground">{title}</h1>
      {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2">{actions}</div>}
  </div>
);

export const ConfirmModal = ({ open, title, onOk, onCancel, loading }: { open: boolean; title: string; onOk: () => void; onCancel: () => void; loading?: boolean }) => (
  <Modal open={open} title="Confirm" onOk={onOk} onCancel={onCancel} confirmLoading={loading} okButtonProps={{ danger: true }} okText="Delete">
    <p>{title}</p>
  </Modal>
);

export const MiniProgress = ({ value }: { value: number }) => {
  const color = getProductivityColor(value);
  return <Progress percent={value} size="small" strokeColor={color} className="!mb-0" style={{ width: 100 }} />;
};
