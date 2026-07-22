import { useState, type FormEvent } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { forgotPassword, getErrorMessage } from '../services/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<{
    variant: 'success' | 'danger' | 'info';
    message: string;
  } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const response = await forgotPassword(email);
      const expiry = response.data?.expiresInMinutes;
      setAlert({
        variant: 'success',
        message: expiry
          ? `${response.message}. The link expires in ${expiry} minutes.`
          : response.message,
      });
      setEmail('');
    } catch (error) {
      setAlert({ variant: 'danger', message: getErrorMessage(error) });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email and we will send a secure reset link"
      alert={alert}
    >
      <Form onSubmit={handleSubmit} noValidate>
        <Form.Group className="mb-4" controlId="forgotEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="registered@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
          />
        </Form.Group>

        <div className="d-grid">
          <Button type="submit" variant="primary" size="lg" disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Sending link...
              </>
            ) : (
              'Send reset link'
            )}
          </Button>
        </div>
      </Form>

      <p className="text-center text-secondary mt-4 mb-0">
        Remembered your password? <Link to="/login">Back to login</Link>
      </p>
    </AuthLayout>
  );
}
