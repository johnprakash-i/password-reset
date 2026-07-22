import { useState, type FormEvent } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { getErrorMessage, registerUser } from '../services/api';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
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
      await registerUser({ name, email, password });
      setAlert({
        variant: 'success',
        message: 'Account created successfully. Redirecting to login...',
      });
      setTimeout(() => navigate('/login'), 1000);
    } catch (error) {
      setAlert({ variant: 'danger', message: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="Register to try the password reset flow"
      alert={alert}
    >
      <Form onSubmit={handleSubmit} noValidate>
        <Form.Group className="mb-3" controlId="registerName">
          <Form.Label>Full name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Jane Doe"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            minLength={2}
            autoComplete="name"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="registerEmail">
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

        <Form.Group className="mb-4" controlId="registerPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="At least 8 characters with a number"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
          <Form.Text muted>Must include letters and at least one number.</Form.Text>
        </Form.Group>

        <div className="d-grid">
          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating account...
              </>
            ) : (
              'Register'
            )}
          </Button>
        </div>
      </Form>

      <p className="text-center text-secondary mt-4 mb-0">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
