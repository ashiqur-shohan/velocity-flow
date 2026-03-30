import { useNavigate } from 'react-router-dom';
import { Calendar, User, FolderOpen } from 'lucide-react';
import { PageHeader } from '@/components/shared';

const ReportsHub = () => {
  const navigate = useNavigate();
  const reports = [
    { key: 'sprint', title: 'Sprint Report', desc: "Analyze any sprint's performance", icon: <Calendar size={32} />, color: '#4F46E5' },
    { key: 'resource', title: 'Resource Report', desc: 'Track developer velocity over time', icon: <User size={32} />, color: '#10B981' },
    { key: 'project', title: 'Project Report', desc: 'Review project-wise delivery history', icon: <FolderOpen size={32} />, color: '#F59E0B' },
  ];
  return (
    <div>
      <PageHeader title="Reports" subtitle="Choose a report to analyze" />
      <div className="grid grid-cols-3 gap-6">
        {reports.map(r => (
          <div key={r.key} onClick={() => navigate(`/reports/${r.key}`)} className="p-8 rounded-lg border border-border bg-card shadow-sm hover:shadow-lg transition-all cursor-pointer text-center">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: r.color + '15' }}>
              <span style={{ color: r.color }}>{r.icon}</span>
            </div>
            <h3 className="text-lg font-semibold mb-2">{r.title}</h3>
            <p className="text-sm text-muted-foreground">{r.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsHub;
