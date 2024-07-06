import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrderStatus.css';
import * as Realm from "realm-web";

const REALM_APP_ID = "application-0-jlihamb"; // replace with your App ID
const app = new Realm.App({ id: REALM_APP_ID });

const OrderStatus = ({ placeNewOrder }) => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            const user = app.currentUser || await app.logIn(Realm.Credentials.anonymous());
            const orders = await user.functions.fetchOrders();
            setOrders(orders);
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
