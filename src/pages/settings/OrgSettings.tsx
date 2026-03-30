import { useState } from 'react';
import { Input, Button, message } from 'antd';
import { PageHeader } from '@/components/shared';

const OrgSettings = () => {
  const [orgName, setOrgName] = useState('VeloTrack Organization');
  const [slug] = useState('velotrack-org');

  return (
    <div className="max-w-lg">
      <PageHeader title="Organization Settings" />
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Organization Name</label>
          <Input value={orgName} onChange={e => setOrgName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <Input value={slug} disabled />
        </div>
        <Button type="primary" onClick={() => message.success('Settings saved')}>Save</Button>
      </div>
    </div>
  );
};

export default OrgSettings;
