import React, { useState } from 'react';
import './OrderForm.css';
import * as Realm from "realm-web";

const REALM_APP_ID = "application-0-jlihamb"; // replace with your App ID
const app = new Realm.App({ id: REALM_APP_ID });

const OrderForm = ({ order, resetOrder }) => {
    const [customerName, setCustomerName] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newOrder = { customerName, items: order, status: 'Pending' };

        const user = app.currentUser || await app.logIn(Realm.Credentials.anonymous());

        try {
            await user.functions.addOrder(newOrder);
            resetOrder();
            setOrderPlaced(true);
            setTimeout(() => setOrderPlaced(false), 5000); // Reset orderPlaced after 5 seconds
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div>
            {orderPlaced && <div className="order-confirmation">Order placed successfully! You can place another order if you wish.</div>}
            <form onSubmit={handleSubmit} className="order-form">
                <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                    required
                />
                <button type="submit" className="place-order-button">Place Order</button>
            </form>
        </div>
    );
};

export default OrderForm;
