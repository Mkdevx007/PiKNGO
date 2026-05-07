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
        <div className="order-stepper-container glass-modern">
            <div className="stepper-progress-hub">
                <div className="main-track-line">
                    <div 
                        className="track-fill-stream" 
                        style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
                    ></div>
                </div>
                
                <div className="stepper-nodes-layer">
                    {statuses.map((step, index) => {
                        const Icon = step.icon;
                        const isCompleted = index < currentIndex;
                        const isActive = index === currentIndex;

                        return (
                            <div 
                                key={step.id} 
                                className={`step-node-wrapper ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}
                            >
                                <div className="step-node-core">
                                    <div className="node-icon-hub">
                                        {isCompleted ? <Check size={16} /> : <Icon size={16} />}
                                    </div>
                                    <div className="node-glow-ring"></div>
                                </div>
                                <div className="step-node-label-hub">
                                    <span className="label-text">{step.label}</span>
                                    {isActive && <div className="active-indicator-bar"></div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

};

export default OrderStatusStepper;
