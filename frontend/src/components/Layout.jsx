import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';
import { Navbar, Container, Button } from 'react-bootstrap';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
            {/* Mobile Header using Bootstrap */}
            <Navbar bg="white" expand={false} className="mobile-header border-bottom shadow-sm d-md-none fixed-top py-2 w-100" style={{ display: 'flex' }}>
                <Container fluid className="px-3">
                    <div className="d-flex align-items-center">
                        <Button 
                            variant="link"
                            className="p-0 border-0 text-dark me-3 shadow-none"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <Menu size={24} />
                        </Button>
                        <NavLink to="/home" className="d-flex align-items-center text-decoration-none text-dark">
                            <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: '1px' }}>TMS</span>
                        </NavLink>
                    </div>
                </Container>
            </Navbar>

            {/* Backdrop for mobile */}
            {isSidebarOpen && (
                <div 
                    className="sidebar-backdrop" 
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="main-content" style={{ flex: 1 }}>
                <Outlet />
            </div>
        </div>
    );
};

export default Layout;
