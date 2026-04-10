import { useState, useCallback } from 'react';

export const useForm = (initialValues = {}, validate) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        
        setValues(prev => ({ ...prev, [name]: val }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    }, [errors]);

    const setFieldValue = useCallback((name, value) => {
        setValues(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    }, [errors]);

    const handleBlur = useCallback((e) => {
        if (!validate) return;
        const { name } = e.target;
        const validationErrors = validate(values);
        if (validationErrors[name]) {
            setErrors(prev => ({ ...prev, [name]: validationErrors[name] }));
        }
    }, [validate, values]);

    const resetForm = useCallback(() => {
        setValues(initialValues);
        setErrors({});
        setIsSubmitting(false);
    }, [initialValues]);

    return {
        values,
        errors,
        isSubmitting,
        setIsSubmitting,
        handleChange,
        setFieldValue,
        handleBlur,
        setValues,
        setErrors,
        resetForm
    };
};

export default useForm;
