import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {

  const navigate = useNavigate();

  const [role, setRole] = useState("Public User");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);


  const validateForm = () => {

    if (!email || !password) {
      toast.error("Please fill all fields");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Enter valid email");
      return false;
    }

    if (password.length < 4) {
      toast.error("Password too short");
      return false;
    }

    return true;
  };

  const handleLogin = async () => {

    if (!validateForm()) return;

    try {

      setLoading(true);

        const res = await fetch(`${process.env.REACT_APP_API_BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          role   
        }),
      });
      
      const data = await res.json();

      if (res.ok) {

        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("role", data.role);

        toast.success("Login successful");

        setTimeout(() => {

          if (data.role === "Admin") {
            navigate("/adminDashboard");
          } else {
            navigate("/dashboard");
          }

        }, 1200);

      } 
      else if (res.status === 401) {
        toast.error("Only Admins can access this portal ");
      } 
      else {
        toast.error(data.message || "Login failed ");
      }

    } catch (error) {
      console.error(error);
      toast.error("Server not responding ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      
      <style>{`

        .login-container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #000000, #0f2027, #203a43);
          font-family: Arial, sans-serif;
        }

        .login-box {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(12px);
          padding: 40px;
          width: 360px;
          border-radius: 12px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
          text-align: center;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .title {
          margin-bottom: 5px;
          color: #00c6ff;
          font-weight: bold;
        }

        .subtitle {
          margin-bottom: 20px;
          color: #ccc;
          font-size: 14px;
        }

        .input-group {
          text-align: left;
          margin-bottom: 15px;
        }

        .input-group label {
          font-size: 13px;
          color: #aaa;
          display: block;
          margin-bottom: 5px;
        }

        .input-group input,
        .input-group select {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(0,0,0,0.6);
          color: #fff;
          outline: none;
          font-size: 14px;
          transition: 0.3s;
        }

        .input-group input:focus,
        .input-group select:focus {
          border-color: #00c6ff;
          box-shadow: 0 0 8px rgba(0, 198, 255, 0.5);
        }

        .login-btn {
          width: 100%;
          padding: 12px;
          background: linear-gradient(90deg, #00c6ff, #0072ff);
          border: none;
          color: white;
          font-size: 16px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
        }

        .login-btn:hover {
          transform: scale(1.05);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .signup-text {
          margin-top: 15px;
          font-size: 13px;
          color: #ccc;
        }

        .signup-link {
          color: #00c6ff;
          cursor: pointer;
          font-weight: bold;
        }

      `}</style>

      <div className="login-container">

        <div className="login-box">

          <h1 className="title">AI Health Risk System</h1>
          <p className="subtitle">Secure Login Portal</p>

         
          <div className="input-group">
            <label>Email</label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter Email"
            />
          </div>

          
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Password"
            />
          </div>

         
          <div className="input-group">
            <label>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Admin">Admin</option>
              <option value="Public User">Public User</option>
            </select>
          </div>

         
          <button
            className="login-btn"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="signup-text">
            Don't have an account?
            <span
              className="signup-link"
              onClick={() => navigate("/signup")}
            >
              {" "}Sign Up
            </span>
          </p>

          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            theme="dark"
          />

        </div>

      </div>
    </>
  );
}

export default Login;