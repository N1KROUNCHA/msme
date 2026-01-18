import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../features.css'; // We'll put specific styles here or use inline/module

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '', password: '', name: '', businessName: '', businessType: 'retail'
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isRegister ? 'http://localhost:5000/api/auth/register' : 'http://localhost:5000/api/auth/login';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (response.ok) {
                if (!isRegister) {
                    localStorage.setItem('userId', data.userId);
                    localStorage.setItem('userName', data.name || 'User');
                    localStorage.setItem('userEmail', data.email);
                    localStorage.setItem('businessName', data.businessName);
                    localStorage.setItem('businessType', data.businessType);
                    localStorage.setItem('userSector', data.sector);
                    localStorage.setItem('userLocation', data.location);
                    localStorage.setItem('userCategory', data.size);
                    localStorage.setItem('onboardingComplete', data.onboardingComplete);

                    if (!data.onboardingComplete) {
                        navigate('/onboarding');
                    } else {
                        navigate('/dashboard');
                    }
                } else {
                    alert('Registration successful! Please login.');
                    setIsRegister(false);
                }
            } else {
                alert(data.msg || 'Error');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Server error. Ensure backend is running.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>{isRegister ? 'Business Registration' : 'MSME Login'}</h2>
                <form onSubmit={handleSubmit}>
                    {isRegister && (
                        <>
                            <div className="form-group">
                                <label>Owner Name</label>
                                <input type="text" name="name" onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Business Name</label>
                                <input type="text" name="businessName" onChange={handleChange} required />
                            </div>
                            <div className="form-group">
                                <label>Business Type</label>
                                <select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                                    <option value="">Select Type</option>
                                    <option value="Fruits & Vegetables">Fruits & Vegetables</option>
                                    <option value="Grocery / Kirana">Grocery / Kirana</option>
                                    <option value="Super Mart">Super Mart</option>
                                    <option value="Pharmacy">Pharmacy</option>
                                    <option value="Textiles">Textiles</option>
                                    <option value="Electronics">Electronics</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </>
                    )}
                    <div className="form-group">
                        <label>Email</label>
                        <input type="email" name="email" onChange={handleChange} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" name="password" onChange={handleChange} required />
                    </div>
                    <button type="submit" className="primary-btn">
                        {isRegister ? 'Register Business' : 'Login to Dashboard'}
                    </button>
                </form>
                <p className="toggle-text" onClick={() => setIsRegister(!isRegister)}>
                    {isRegister ? 'Already have an account? Login' : 'New MSME? Register here'}
                </p>
            </div>
        </div>
    );
};

export default Login;
