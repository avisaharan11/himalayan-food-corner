import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './OrderStatus.css';

const OrderStatus = ({ placeNewOrder }) => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();
    const config = {
        headers: { 'api-key': process.env.REACT_APP_MONGO_API_KEY }
    };
    useEffect(() => {
        const fetchOrders = async () => {
            const res = await axios.get(`${process.env.REACT_APP_MONGO_BASE_URL}/orders`, config);
            setOrders(res.data);
        };

        fetchOrders();

        const intervalId = setInterval(() => {
            fetchOrders();
        }, 3000); // refresh every 3 seconds

        return () => clearInterval(intervalId);
    }, []);

    return (
        <div className="order-status">
            <h2>Order Status</h2>
            <div className="orders">
                {orders.filter(order => order.status !== 'Collected').slice(-5).map(order => (
                    <div key={order._id} className="order">
                        <p><strong>{order.customerName}</strong>: {order.status}</p>
                        <ul>
                            {order.items.map((item, index) => (
                                <li key={index}>{item.name} - Quantity: {item.quantity} - Price: ${item.price * item.quantity}</li>
                            ))}
                        </ul>
                        <p>Total: ${order.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <button onClick={() => placeNewOrder(navigate)} className="place-new-order-button">Place New Order</button>
        </div>
    );
};

export default OrderStatus;
