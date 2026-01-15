import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/provider/AuthProvider";

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
    <div style={{ padding: 40 }}>
      <h2>Kirish</h2>

      <input
        placeholder="Login"
        value={loginValue}
        onChange={(e) => setLoginValue(e.target.value)}
      />
      <br /><br />

      <input
        type="password"
        placeholder="Parol"
        value={passwordValue}
        onChange={(e) => setPasswordValue(e.target.value)}
      />
      <br /><br />

      {error && <p style={{ color: "red" }}>{error}</p>}

      <button onClick={handleSubmit}>Kirish</button>
    </div>
  );
}
