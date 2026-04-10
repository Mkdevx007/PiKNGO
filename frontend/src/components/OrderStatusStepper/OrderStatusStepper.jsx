import React from 'react';
import { Check, Clock, Utensils, Package, Truck } from 'lucide-react';
import './OrderStatusStepper.css';

const OrderStatusStepper = ({ currentStatus }) => {
    const statuses = [
        { id: 'PENDING', label: 'Placed', icon: Clock },
        { id: 'PREPARING', label: 'Cooking', icon: Utensils },
        { id: 'READY', label: 'Ready', icon: Package },
        { id: 'DELIVERED', label: 'Delivered', icon: Truck }
    ];

    const getStatusIndex = (status) => {
        const index = statuses.findIndex(s => s.id === status?.toUpperCase());
        return index === -1 ? (status === 'CANCELLED' ? -1 : 0) : index;
    };

    const currentIndex = getStatusIndex(currentStatus);

    if (currentStatus === 'CANCELLED') {
        return (
            <div className="stepper-cancelled glass-modern">
                <span className="dot error"></span>
                <span>This order was cancelled</span>
            </div>
        );
    }

    return (
        <div className="order-stepper-container">
            <div className="stepper-track">
                {statuses.map((step, index) => {
                    const Icon = step.icon;
                    const isCompleted = index < currentIndex;
                    const isActive = index === currentIndex;
                    const isLast = index === statuses.length - 1;

                    return (
                        <React.Fragment key={step.id}>
                            <div className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                                <div className="step-node glass-pill">
                                    {isCompleted ? <Check size={14} /> : <Icon size={14} />}
                                    <span className="step-label">{step.label}</span>
                                </div>
                            </div>
                            {!isLast && (
                                <div className={`step-line ${isCompleted ? 'completed' : ''}`}></div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderStatusStepper;
