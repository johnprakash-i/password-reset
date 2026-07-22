import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import { getErrorMessage, resetPassword, verifyResetToken } from '../services/api';

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState<string | undefined>();
  const [alert, setAlert] = useState<{
    variant: 'success' | 'danger' | 'warning';
    message: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function checkToken() {
      if (!token) {
        setVerifying(false);
        setTokenValid(false);
        setAlert({
          variant: 'danger',
          message: 'Reset token is missing from the link.',
        });
        return;
      }

      try {
        const response = await verifyResetToken(token);
        if (!active) return;
        setTokenValid(true);
        setEmail(response.data?.email);
      } catch (error) {
        if (!active) return;
        setTokenValid(false);
        // Alert users when the link is invalid or expired
        window.alert(getErrorMessage(error));
        setAlert({
          variant: 'warning',
          message: getErrorMessage(error),
        });
      } finally {
        if (active) {
          setVerifying(false);
        }
      }
    }

    void checkToken();

    return () => {
      active = false;
    };
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setAlert({ variant: 'danger', message: 'Reset token is missing.' });
      return;
    }

    if (password !== confirmPassword) {
      setAlert({ variant: 'danger', message: 'Passwords do not match.' });
      return;
    }

    setSubmitting(true);
    setAlert(null);

    try {
      const response = await resetPassword({ token, password });
      setAlert({ variant: 'success', message: response.message });
      setTimeout(() => navigate('/login'), 1200);
    } catch (error) {
      const message = getErrorMessage(error);
      window.alert(message);
      setAlert({ variant: 'danger', message });
      setTokenValid(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (verifying) {
    return (
      <AuthLayout title="Verifying link" subtitle="Please wait while we validate your reset token">
        <div className="text-center py-4">
          <Spinner animation="border" role="status" />
          <p className="mt-3 mb-0 text-secondary">Checking reset link...</p>
        </div>
      </AuthLayout>
    );
  }

  if (!tokenValid) {
    return (
      <AuthLayout
        title="Link expired"
        subtitle="This password reset link is no longer valid"
        alert={alert}
      >
        <Alert variant="warning" className="mb-4">
          For security, reset links expire after a short time. Request a new link to continue.
        </Alert>
        <div className="d-grid gap-2">
          <Link to="/forgot-password" className="btn btn-primary btn-lg">
            Request a new link
          </Link>
          <Link to="/login" className="btn btn-outline-secondary">
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset password"
      subtitle={email ? `Choose a new password for ${email}` : 'Choose a new secure password'}
      alert={alert}
    >
      <Form onSubmit={handleSubmit} noValidate>
        <Form.Group className="mb-3" controlId="newPassword">
          <Form.Label>New password</Form.Label>
          <Form.Control
            type="password"
            placeholder="At least 8 characters with a number"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </Form.Group>

        <Form.Group className="mb-4" controlId="confirmPassword">
          <Form.Label>Confirm password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
          />
        </Form.Group>

        <div className="d-grid">
          <Button type="submit" variant="primary" size="lg" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Updating password...
              </>
            ) : (
              'Update password'
            )}
          </Button>
        </div>
      </Form>
    </AuthLayout>
  );
}
