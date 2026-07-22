import { Col, Container, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';

export default function HomePage() {
  return (
    <div className="app-shell">
      <AppNavbar />
      <main className="home-main">
        <Container>
          <Row className="align-items-center min-vh-75 gy-4">
            <Col lg={7}>
              <p className="eyebrow mb-3">Secure account recovery</p>
              <h1 className="display-5 fw-bold mb-3">
                Password reset with email verification
              </h1>
              <p className="lead text-secondary mb-4">
                Register an account, request a reset link, and update your password through a
                time-limited token stored securely in MongoDB.
              </p>
              <div className="d-flex flex-wrap gap-3">
                <Link to="/register" className="btn btn-primary btn-lg">
                  Get started
                </Link>
                <Link to="/forgot-password" className="btn btn-outline-light btn-lg">
                  Forgot password
                </Link>
              </div>
            </Col>
            <Col lg={5}>
              <div className="feature-panel">
                <h2 className="h5 fw-semibold mb-3">How it works</h2>
                <ol className="mb-0 ps-3">
                  <li className="mb-2">Enter your registered email on the forgot password page.</li>
                  <li className="mb-2">Receive a unique reset link by email.</li>
                  <li className="mb-2">Open the link before it expires.</li>
                  <li>Set a new password and sign in again.</li>
                </ol>
              </div>
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  );
}
