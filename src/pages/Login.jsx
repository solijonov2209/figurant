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

  const handleSubmit = async () => {
    setError("");
    const success = await login(loginValue, passwordValue);

    if (!success) {
      setError("Login yoki parol noto'g'ri");
      return;
    }

    navigate("/");
  };

  return (
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
