import React, { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Menu from './components/Menu';
import Cart from './components/Cart';
import OrderStatus from './components/OrderStatus';
import Admin from './components/Admin';
import PrintReceipt from './components/PrintReceipt';
import './App.css';
import { IoHomeSharp, IoCallOutline } from 'react-icons/io5';
import * as Realm from "realm-web";

const REALM_APP_ID = "application-0-jlihamb"; // replace with your App ID
const app = new Realm.App({ id: REALM_APP_ID });

const App = () => {
    const [order, setOrder] = useState([]);
    const [viewingCart, setViewingCart] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const login = async () => {
            const user = await app.logIn(Realm.Credentials.anonymous());
            setUser(user);
        };
        login();
    }, []);

    const addToOrder = (item, quantity) => {
        setOrder(prevOrder => {
            const existingItem = prevOrder.find(orderItem => orderItem._id === item._id);
            if (existingItem) {
                return prevOrder.map(orderItem =>
                    orderItem._id === item._id ? { ...orderItem, quantity, modifier: item.modifier } : orderItem
                );
            } else {
                return [...prevOrder, { ...item, quantity }];
            }
        });
    };

    const updateOrder = (updatedOrder) => {
        setOrder(updatedOrder);
    };

    const viewCart = (quantities, modifiers) => {
        const cartItems = order.map(item => ({
            ...item,
            quantity: quantities[item._id],
            modifier: modifiers[item._id]
        })).filter(item => item.quantity > 0);
        setOrder(cartItems);
        setViewingCart(true);
    };

    const resetOrder = () => {
        setOrder([]);
        setViewingCart(false);
    };

    const goBackToMenu = () => {
        setViewingCart(false);
    };

    const viewOrderStatus = (navigate) => {
        navigate('/order-status');
    };

    const placeNewOrder = (navigate) => {
        navigate('/');
        resetOrder();
    };

    const clearCart = () => {
        setOrder([]);
    };

    return (
        <Router>
            <div className="App">
                <Header />
                <Routes>
                    <Route path="/" element={
                        viewingCart ? (
                            <Cart cartItems={order} resetOrder={resetOrder} goBackToMenu={goBackToMenu} viewOrderStatus={viewOrderStatus} updateOrder={updateOrder} />
                        ) : (
                            <Menu addToOrder={addToOrder} viewCart={viewCart} order={order} clearCart={clearCart} />
                        )
                    } />
                    <Route path="/order-status" element={<OrderStatus placeNewOrder={placeNewOrder} />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/print-receipt/:id" element={<PrintReceipt />} />
                </Routes>
            </div>
        </Router>
    );
};

const Header = () => {
    const navigate = useNavigate();

    return (
        <header className="header">
            <h1 onClick={() => navigate('/')}>
                Himalayan Food Corner <IoHomeSharp className="home-icon" />
            </h1>
            <p>
                <a href="https://g.co/kgs/4ctCRrR" target="_blank" rel="noopener noreferrer">143 Toi Toi Street, Nelson</a> | 
                <a href="tel:+642108101308"><IoCallOutline className="home-icon" />02108101308</a>
            </p>
        </header>
    );
};

export default App;
