import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PrintReceipt.css';

const PrintReceipt = ({ match }) => {
    const [order, setOrder] = useState(null);

    useEffect(() => {
        const fetchOrder = async () => {
            const res = await axios.get(`http://localhost:5000/orders/${match.params.id}`);
            setOrder(res.data);
        };

        fetchOrder();
    }, [match.params.id]);

    return (
        order && (
            <div className="print-receipt">
                <h2>Himalayan Food Corner</h2>
                <p>123 Main St, Your City</p>
                <p>+1 234-567-890</p>
                <p>GST Number: XYZ1234567</p>
                <h3>Order Receipt</h3>
                <p><strong>Customer Name:</strong> {order.customerName}</p>
                <p><strong>Contact Number:</strong> {order.contactNumber}</p>
                <ul>
                    {order.items.map((item, index) => (
                        <li key={index}>{item.name} - Quantity: {item.quantity} - Price: ${item.price * item.quantity}</li>
                    ))}
                </ul>
                <p><strong>Total:</strong> ${order.items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2)}</p>
            </div>
        )
    );
};

export default PrintReceipt;
