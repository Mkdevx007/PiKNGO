import React, { useState, useRef, useEffect } from 'react';
import './OtpInput.css';

const OtpInput = ({ length = 6, value, onChange, disabled = false }) => {
    const [otp, setOtp] = useState(new Array(length).fill(""));
    const inputs = useRef([]);

    useEffect(() => {
        // Sync external value if provided (e.g., for clearing)
        if (value === "") {
            setOtp(new Array(length).fill(""));
        }
    }, [value, length]);

    const handleChange = (e, index) => {
        const val = e.target.value;
        if (isNaN(val)) return;

        const newOtp = [...otp];
        // Only take the last character typed
        newOtp[index] = val.substring(val.length - 1);
        setOtp(newOtp);
        
        const combinedOtp = newOtp.join("");
        onChange(combinedOtp);

        // Move to next input if value is entered
        if (val && index < length - 1) {
            inputs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Move to previous input on backspace if current is empty
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const data = e.clipboardData.getData("text").slice(0, length);
        if (isNaN(data)) return;

        const newOtp = data.split("").concat(new Array(length - data.length).fill(""));
        setOtp(newOtp);
        onChange(newOtp.join(""));

        // Focus the last filled input or the last input
        const nextIndex = Math.min(data.length, length - 1);
        inputs.current[nextIndex].focus();
    };

    return (
        <div className="otp-container">
            {otp.map((data, index) => (
                <input
                    key={index}
                    type="text"
                    maxLength="1"
                    placeholder="·"
                    ref={(el) => (inputs.current[index] = el)}
                    value={data}
                    onChange={(e) => handleChange(e, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    onPaste={handlePaste}
                    className={`otp-field ${data ? 'active' : ''}`}
                    disabled={disabled}
                    autoFocus={index === 0}
                />
            ))}
        </div>
    );
};

export default OtpInput;
