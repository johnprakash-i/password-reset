import type { ReactNode } from 'react';
import { Alert, Card, Col, Container, Row } from 'react-bootstrap';
import AppNavbar from './AppNavbar';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  alert?: { variant: 'success' | 'danger' | 'warning' | 'info'; message: string } | null;
}

export default function AuthLayout({ title, subtitle, children, alert }: AuthLayoutProps) {
  return (
    <div className="app-shell">
      <AppNavbar />
      <main className="auth-main">
        <Container>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={7} lg={5}>
              <Card className="auth-card border-0 shadow-sm">
                <Card.Body className="p-4 p-md-5">
                  <div className="text-center mb-4">
                    <div className="auth-icon mb-3" aria-hidden="true">
                      <i className="bi bi-key" />
                    </div>
                    <h1 className="h3 fw-bold mb-2">{title}</h1>
                    <p className="text-secondary mb-0">{subtitle}</p>
                  </div>

                  {alert ? (
                    <Alert variant={alert.variant} className="mb-4">
                      {alert.message}
                    </Alert>
                  ) : null}

                  {children}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </main>
    </div>
  );
}
