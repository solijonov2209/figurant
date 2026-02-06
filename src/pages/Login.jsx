import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/provider/AuthProvider";
import "./Login.css";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const success = await login(loginValue, passwordValue);

    if (!success) {
      setError("Login yoki parol noto‘g‘ri");
      return;
    }

    navigate("/");
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (

    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Figurant Tizimi</h2>
          <p className="login-subtitle">Hisobingizga kiring</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login">Login</label>
            <input
              id="login"
              type="text"
              placeholder="Loginni kiriting"
              value={loginValue}
              onChange={(e) => setLoginValue(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Parol</label>
            <input
              id="password"
              type="password"
              placeholder="Parolni kiriting"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button">
            Kirish
          </button>
        </form>

    <div className="login-page">
      <div className="overlay"></div>

      <div className="login-wrapper">
        <div className="login-box">
          
          <div className="logo">
            <img src="/logo.png" alt="Logo" />
          </div>

          <input
            className="login-input"
            placeholder="Login"
            value={loginValue}
            onChange={(e) => setLoginValue(e.target.value)}
          />

          <input
            className="login-input"
            type="password"
            placeholder="Parol"
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
          />

          {error && <p className="error-text">{error}</p>}

          <button className="login-button" onClick={handleSubmit}>
            Kirish
          </button>
        </div>
      </div>
    </div>
    </div>
    </div>
  );
}
