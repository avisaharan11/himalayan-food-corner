import React from 'react';
import { Link } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
    return (
        <nav className="navigation">
            <Link to="/">Menu</Link>
            <Link to="/order-status">Order Status</Link>
            <Link to="/admin">Admin</Link>
        </nav>
    );
};

export default Navigation;
