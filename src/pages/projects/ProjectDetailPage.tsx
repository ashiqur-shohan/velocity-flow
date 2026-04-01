import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Button, Tag, Progress, Modal, Input, Row, Col, Card, Statistic,
  Table, Timeline, Empty, Drawer, Select, message, Skeleton, Result
} from 'antd';
import { ArrowLeftOutlined, EditOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import dayjs from 'dayjs';

import {
  getProjectById,
  getProjectAnalytics,
  getProjectPointsAuditLog,
  updateProject,
  updateProjectPoints,
} from '../../services/projectService';

const statusTagColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active': return 'blue';
    case 'completed': return 'green';
    case 'on_hold': return 'warning';
    case 'archived': return 'default';
    default: return 'default';
  }
};

const progressColor = (pct: number) => {
  if (pct >= 80) return '#10B981';   // green
  if (pct >= 50) return '#F59E0B';   // amber
  return '#F43F5E';                  // red
};

const COLOR_OPTIONS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EC4899',
  '#8B5CF6', '#06B6D4', '#F97316', '#6B7280',
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [editForm, setEditForm] = useState<any>({});
  
  const [pointsModalOpen, setPointsModalOpen] = useState(false);
  const [newPoints, setNewPoints] = useState<number>(0);
  const [pointsReason, setPointsReason] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [proj, anal, audit] = await Promise.all([
          getProjectById(id),
          getProjectAnalytics(id),
          getProjectPointsAuditLog(id),
        ]);
        setProject(proj);
        setAnalytics(anal);
        setAuditLog(audit);
      } catch (err: any) {
        message.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div><Skeleton active paragraph={{ rows: 10 }} /></div>;
  if (!project) return <Result status="404" title="Project not found" />;

  const handleUpdatePoints = async () => {
    if (newPoints < 1) return message.error('Points must be at least 1');
    if (!pointsReason.trim()) return message.error('Reason is required');

    try {
      // Current user mock
      const currentUser = { id: 'res-001', name: 'Tausif' };
      const result = await updateProjectPoints(project.id, newPoints, pointsReason, currentUser);
      
      setProject(result.project);
      setAuditLog([result.audit_entry, ...auditLog]);
      message.success('Points updated successfully');
      setPointsModalOpen(false);
      setNewPoints(0);
      setPointsReason('');
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const openEditDrawer = () => {
    setEditForm({
      name: project.name,
      description: project.description,
      status: project.status,
      color_tag: project.color_tag,
      manager_id: project.manager_id,
    });
    setEditDrawerOpen(true);
  };

  const handleSaveEdit = async () => {
    try {
      const updated = await updateProject(project.id, editForm);
      setProject(updated);
      message.success('Project updated');
      setEditDrawerOpen(false);
    } catch (err: any) {
      message.error(err.message);
    }
  };

  // Safe avg formula
  const avgProductivity = analytics.velocity_by_sprint && analytics.velocity_by_sprint.length > 0
    ? Math.round(analytics.velocity_by_sprint.reduce((s: number, curr: any) => s + curr.productivity_pct, 0) / analytics.velocity_by_sprint.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          icon={<ArrowLeftOutlined />}
          type="text"
          onClick={() => navigate('/projects')}
          className="mb-4"
        >
          Back to Projects
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: project.color_tag }}
            />
            <h1 className="text-2xl font-bold text-gray-800 m-0">{project.name}</h1>
            <Tag color={statusTagColor(project.status)}>
              {project.status.replace('_', ' ').toUpperCase()}
            </Tag>
          </div>
          <Button icon={<EditOutlined />} onClick={openEditDrawer}>
            Edit Project
          </Button>
        </div>

        <p className="text-gray-500 mt-2">{project.description}</p>
        <div className="flex gap-4 text-sm text-gray-400 mt-2">
          <span>👤 Manager: {project.manager?.name || '—'}</span>
          <span>📅 Created: {dayjs(project.created_at).format('MMM D, YYYY')}</span>
          <span>🔄 Updated: {dayjs(project.updated_at).format('MMM D, YYYY')}</span>
        </div>
      </div>

      {/* Progress Card */}
      <Card title="Project Points Progress" className="shadow-sm">
        <Row gutter={16} className="mb-6">
          <Col span={8}>
            <Statistic title="Total Points" value={project.total_points} />
          </Col>
          <Col span={8}>
            <Statistic title="Achieved" value={project.achieved_points} valueStyle={{ color: '#10B981' }} />
          </Col>
          <Col span={8}>
            <Statistic title="Remaining" value={Math.max(0, project.total_points - project.achieved_points)} valueStyle={{ color: '#F43F5E' }} />
          </Col>
        </Row>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Progress
              percent={project.progress_pct}
              strokeColor={progressColor(project.progress_pct)}
              status="active"
            />
          </div>
          <Button onClick={() => { setNewPoints(project.total_points); setPointsModalOpen(true); }}>
            ✏️ Update Points
          </Button>
        </div>
      </Card>

      {/* Analytics Row */}
      <Row gutter={16}>
        <Col span={6}>
          <Card className="shadow-sm"><Statistic title="Total Sprints" value={analytics.velocity_by_sprint.length} /></Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm"><Statistic title="Avg Productivity" value={avgProductivity} suffix="%" valueStyle={{ color: '#10B981' }} /></Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm"><Statistic title="Total Bugs" value={analytics.bug_summary.total} /></Card>
        </Col>
        <Col span={6}>
          <Card className="shadow-sm">
            <Statistic title="Goals Completed" value={`${analytics.goal_summary.complete} / ${analytics.goal_summary.total}`} />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Sprint Velocity" className="shadow-sm">
            <div className="flex justify-center -ml-6">
              <BarChart data={analytics.velocity_by_sprint} width={450} height={250}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sprint_name" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="planned" name="Planned" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="actual" name="Actual" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Resource Contribution" className="shadow-sm">
            <div className="flex justify-center -ml-6">
              <BarChart layout="vertical" data={analytics.resource_contribution} width={450} height={250}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="resource_name" width={80} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="total_actual" name="Points Delivered" fill="#4F46E5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </div>
          </Card>
        </Col>
      </Row>

      {/* History Tables and Log */}
      <Row gutter={16}>
        <Col span={16}>
          <Card title="Sprint History" className="shadow-sm">
            <Table
              dataSource={project.sprint_history}
              rowKey="sprint_id"
              pagination={false}
              onRow={(record: any) => ({
                onClick: () => navigate(`/sprints/${record.sprint_id}`),
                className: 'cursor-pointer hover:bg-gray-50'
              })}
              columns={[
                { title: 'Sprint', dataIndex: 'sprint_name', key: 'sprint_name' },
                { title: 'Dates', key: 'dates', render: (_, r: any) => `${dayjs(r.start_date).format('MMM D')} – ${dayjs(r.end_date).format('MMM D')}` },
                { title: 'Planned', dataIndex: 'planned_points', key: 'planned' },
                { title: 'Actual', dataIndex: 'actual_points', key: 'actual' },
                { 
                  title: 'Productivity', 
                  key: 'productivity',
                  render: (_, r: any) => (
                    <Tag color={progressColor(r.productivity_pct)}>{r.productivity_pct}%</Tag>
                  )
                },
                {
                  title: 'Status',
                  key: 'status',
                  render: (_, r: any) => <Tag color={statusTagColor(r.status || 'unknown')}>{r.status?.toUpperCase() || 'UNKNOWN'}</Tag>
                }
              ]}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card title="Points Audit Log" className="shadow-sm h-full">
            {auditLog.length === 0 ? (
              <Empty description="No points updates recorded yet" />
            ) : (
              <Timeline>
                {auditLog.map(entry => {
                  const increased = entry.new_total_points > entry.previous_total_points;
                  return (
                    <Timeline.Item
                      key={entry.id}
                      color={increased ? 'green' : 'red'}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-700">
                          Points changed: {entry.previous_total_points} → {entry.new_total_points}
                          <Tag className="ml-2" color={increased ? 'green' : 'red'}>
                            {increased ? '▲' : '▼'}
                            {Math.abs(entry.new_total_points - entry.previous_total_points)} pts
                          </Tag>
                        </span>
                        {entry.note && (
                          <span className="text-gray-500 text-sm mt-0.5">"{entry.note}"</span>
                        )}
                        <span className="text-gray-400 text-xs mt-0.5">
                          by {entry.changed_by_name} · {dayjs(entry.changed_at).format('MMM D, YYYY h:mm A')}
                        </span>
                      </div>
                    </Timeline.Item>
                  );
                })}
              </Timeline>
            )}
          </Card>
        </Col>
      </Row>

      {/* Editor Drawer */}
      <Drawer
        title="Edit Project"
        open={editDrawerOpen}
        onClose={() => setEditDrawerOpen(false)}
        width={480}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name *</label>
            <Input
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Input.TextArea
              rows={4}
              value={editForm.description}
              onChange={e => setEditForm({ ...editForm, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status *</label>
            <Select
              value={editForm.status}
              onChange={v => setEditForm({ ...editForm, status: v })}
              className="w-full"
              options={[
                { value: 'active', label: 'Active' },
                { value: 'on_hold', label: 'On Hold' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Color Tag</label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => setEditForm({ ...editForm, color_tag: c })}
                  className="w-8 h-8 rounded-full border-2 transition-all"
                  style={{ backgroundColor: c, borderColor: editForm.color_tag === c ? '#0F172A' : 'transparent' }}
                />
              ))}
            </div>
          </div>
          {/* We would fetch resources here for the real thing, leaving simple placeholder logic */}
          <div>
            <label className="block text-sm font-medium mb-1">Manager ID</label>
            <Input
              value={editForm.manager_id}
              onChange={e => setEditForm({ ...editForm, manager_id: e.target.value })}
            />
          </div>
          <Button type="primary" block onClick={handleSaveEdit}>
            Save Changes
          </Button>
        </div>
      </Drawer>

      {/* Update Points Modal */}
      <Modal
        title="Update Total Project Points"
        open={pointsModalOpen}
        onCancel={() => setPointsModalOpen(false)}
        onOk={handleUpdatePoints}
        okText="Save Changes"
      >
        <div className="space-y-4 mt-4">
          <div>
            <p className="mb-2">Current Total Points: <strong>{project.total_points}</strong></p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">New Total Points *</label>
            <Input
              type="number"
              min={1}
              value={newPoints}
              onChange={e => setNewPoints(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Reason for change *</label>
            <Input.TextArea
              rows={3}
              value={pointsReason}
              onChange={e => setPointsReason(e.target.value)}
              placeholder="Explain why the points are being updated..."
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
