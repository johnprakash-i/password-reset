import { Container, Nav, Navbar } from 'react-bootstrap';
import { Link, NavLink } from 'react-router-dom';

export default function AppNavbar() {
  return (
    <Navbar expand="lg" className="app-navbar" variant="dark">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-semibold">
          <i className="bi bi-shield-lock me-2" aria-hidden="true" />
          SecureReset
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="ms-auto gap-lg-2">
            <Nav.Link as={NavLink} to="/login">
              Login
            </Nav.Link>
            <Nav.Link as={NavLink} to="/register">
              Register
            </Nav.Link>
            <Nav.Link as={NavLink} to="/forgot-password">
              Forgot Password
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
