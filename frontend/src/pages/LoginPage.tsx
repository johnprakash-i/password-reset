import { useState, type FormEvent } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { getErrorMessage, loginUser } from '../services/api';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    variant: 'success' | 'danger';
    message: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const response = await loginUser({ email, password });
      setAlert({ variant: 'success', message: `Welcome back, ${response.data.name}!` });
      setTimeout(() => navigate('/'), 800);
    } catch (error) {
      setAlert({ variant: 'danger', message: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in with your email and password"
      alert={alert}
    >
      <Form onSubmit={handleSubmit} noValidate>
        <Form.Group className="mb-3" controlId="loginEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </Form.Group>

        <Form.Group className="mb-4" controlId="loginPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
          />
        </Form.Group>

        <div className="d-grid gap-2">
          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </div>
      </Form>

      <div className="text-center mt-4">
        <p className="mb-2">
          <Link to="/forgot-password">Forgot your password?</Link>
        </p>
        <p className="mb-0 text-secondary">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </AuthLayout>
  );
}
