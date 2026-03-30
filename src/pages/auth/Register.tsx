import { useState } from 'react';
import { Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', org: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    if (!form.name || !form.email || !form.password || !form.org) { message.error('Fill all fields'); return; }
    if (form.password !== form.confirmPassword) { message.error('Passwords do not match'); return; }
    setLoading(true);
    setTimeout(() => { navigate('/dashboard'); setLoading(false); }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #8B5CF6 100%)' }}>
      <div className="w-full max-w-md bg-card rounded-xl shadow-2xl p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold"><span style={{ color: '#818CF8' }}>Velo</span><span className="text-foreground">Track</span></h1>
          <p className="text-sm text-muted-foreground mt-2">Create your organization</p>
        </div>
        <div className="space-y-3">
          <div><label className="block text-sm font-medium mb-1">Full Name</label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} size="large" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><Input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} size="large" /></div>
          <div><label className="block text-sm font-medium mb-1">Password</label><Input.Password value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} size="large" /></div>
          <div><label className="block text-sm font-medium mb-1">Confirm Password</label><Input.Password value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} size="large" /></div>
          <div><label className="block text-sm font-medium mb-1">Organization Name</label><Input value={form.org} onChange={e => setForm({ ...form, org: e.target.value })} size="large" /></div>
          <Button type="primary" block size="large" loading={loading} onClick={handleRegister}>Create Organization</Button>
          <p className="text-center text-sm text-muted-foreground">Already have an account? <button onClick={() => navigate('/login')} className="text-primary hover:underline">Sign in</button></p>
        </div>
      </div>
    </div>
  );
};

export default Register;
