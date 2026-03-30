import { useState, useEffect } from 'react';
import { Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (session) navigate('/dashboard');
  }, [session, navigate]);

  const handleLogin = async () => {
    if (!email || !password) { message.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      await signIn(email, password);
      message.success('Logged in successfully');
      navigate('/dashboard');
    } catch (err: any) {
      message.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #8B5CF6 100%)' }}>
      <div className="w-full max-w-md bg-card rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span style={{ color: '#818CF8' }}>Velo</span><span className="text-foreground">Track</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to your workspace</p>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" size="large" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" size="large"
              suffix={<button onClick={() => setShowPw(!showPw)} className="text-muted-foreground">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>}
            />
          </div>
          <div className="flex justify-end">
            <button className="text-sm text-primary hover:underline">Forgot Password?</button>
          </div>
          <Button type="primary" block size="large" loading={loading} onClick={handleLogin}>Sign In</Button>
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account? <button onClick={() => navigate('/register')} className="text-primary hover:underline">Create an organization →</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
