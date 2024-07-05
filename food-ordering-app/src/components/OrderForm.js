import React, { useState } from 'react';
import axios from 'axios';
import './OrderForm.css';

const OrderForm = ({ order, resetOrder }) => {
    const [customerName, setCustomerName] = useState('');
    const [orderPlaced, setOrderPlaced] = useState(false);

    const handleSubmit = (e) => {
        e.preventDefault();

        const newOrder = { customerName, items: order, status: 'Pending' };

        axios.post('http://localhost:5000/orders', newOrder)
            .then(res => {
                console.log(res.data);
                resetOrder();
                setOrderPlaced(true);
                setTimeout(() => setOrderPlaced(false), 5000); // Reset orderPlaced after 5 seconds
            })
            .catch(err => console.error(err));
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
