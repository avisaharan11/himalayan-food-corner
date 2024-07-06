import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Cart.css';
import * as Realm from "realm-web";

const REALM_APP_ID = "application-0-jlihamb"; // replace with your App ID
const app = new Realm.App({ id: REALM_APP_ID });

const Cart = ({ cartItems, resetOrder, goBackToMenu, viewOrderStatus, updateOrder }) => {
    const [customerName, setCustomerName] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [items, setItems] = useState(cartItems);
    const navigate = useNavigate();

    const handleQuantityChange = (id, delta) => {
        const updatedItems = items.map(item =>
            item._id === id ? { ...item, quantity: item.quantity + delta } : item
        ).filter(item => item.quantity > 0);
        setItems(updatedItems);
        updateOrder(updatedItems);
    };

    const calculateTotal = () => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newOrder = {
            customerName,
            contactNumber,
            items: items,
            status: 'Order Received'
        };

        const user = app.currentUser || await app.logIn(Realm.Credentials.anonymous());

        try {
            await user.functions.addOrder(newOrder);
            setOrderPlaced(true);
            setTimeout(() => {
                setOrderPlaced(false);
                resetOrder();
                viewOrderStatus(navigate);
            }, 3000);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="cart">
            {orderPlaced && <div className="order-confirmation">Order placed successfully!</div>}
            <h2>Your Cart</h2>
            <ul>
                {items.map((item, index) => (
                    <li key={index} className="cart-item">
                        <img src={item.photo} alt={item.name} />
                        <div>
                            <h4>{item.name}</h4>
                            <p>Price: ${item.price}</p>
                            <p>Modifier: {item.modifier || 'None'}</p>
                            <div className="quantity-controls">
                                <button onClick={() => handleQuantityChange(item._id, -1)} disabled={!item.quantity || orderPlaced}>-</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => handleQuantityChange(item._id, 1)} disabled={orderPlaced}>+</button>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="cart-total">
                <h3>Total: ${calculateTotal()}</h3>
            </div>
            {items.length > 0 && (
                <form onSubmit={handleSubmit} className="order-form">
                    <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Customer Name"
                        required
                        disabled={orderPlaced}
                    />
                    <input
                        type="text"
                        value={contactNumber}
                        onChange={(e) => setContactNumber(e.target.value.replace(/\D/, ''))}
                        placeholder="Contact Number"
                        required
                        disabled={orderPlaced}
                    />
                    <button type="submit" className="place-order-button" disabled={orderPlaced}>Place Order</button>
                    <button onClick={goBackToMenu} className="back-to-menu-button" disabled={orderPlaced}>Add More Items</button>
                </form>
            )}
        </div>
    );
};

export default Cart;
