import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Signup() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [city, setCity] = useState("");

  const validateForm = () => {

    const usernameRegex = /^[a-zA-Z0-9]{3,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;

    if (!username || !email || !password || !city) {
      toast.error("⚠️ Please fill all fields");
      return false;
    }

    if (!usernameRegex.test(username)) {
      toast.error("⚠️ Username must be 3+ chars (letters & numbers only)");
      return false;
    }

    if (!emailRegex.test(email)) {
      toast.error("⚠️ Enter a valid email");
      return false;
    }

    if (!passwordRegex.test(password)) {
      toast.error("⚠️ Password must be 6+ chars with letters & numbers");
      return false;
    }

    if (city.trim().length < 2) {
      toast.error("⚠️ Enter a valid city");
      return false;
    }

    return true;
  };

  const handleSignup = async () => {

    if (!validateForm()) return;

    try {

        const res = await fetch(`${process.env.REACT_APP_API_BASE}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role: "Public User",
          city
        }),
      });

      const data = await res.json();
      if (res.ok) {

        toast.success("Signup successful ");

        setTimeout(() => {
          navigate("/");
        }, 1500);

      } 
      else if (res.status === 409) {

        
        toast.error("User already exists ");

      } 
      else {

        toast.error(data.message || "Signup failed ");

      }

    } catch (error) {
      console.error(error);
      toast.error("Server not responding ");
    }
  };

  return (
    <>
      <style>{`
        .signup-container {
          height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #000000, #0f2027, #203a43);
          font-family: Arial, sans-serif;
        }

        .signup-box {
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

        .input-group input {
          width: 100%;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.2);
          background: rgba(0,0,0,0.6);
          color: #fff;
          outline: none;
          font-size: 14px;
        }

        .signup-btn {
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

        .signup-btn:hover {
          transform: scale(1.05);
        }

        .login-link {
          margin-top: 15px;
          font-size: 13px;
          color: #ccc;
        }

        .login-link span {
          color: #00c6ff;
          cursor: pointer;
          font-weight: bold;
        }
      `}</style>

      <div className="signup-container">
        <div className="signup-box">

          <h1 className="title">AI Health Risk System</h1>
          <p className="subtitle">Create New Account</p>

         
          <div className="input-group">
            <label>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

         
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

        
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>City</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          
          <button className="signup-btn" onClick={handleSignup}>
            Sign Up
          </button>

          <p className="login-link">
            Already have an account?{" "}
            <span onClick={() => navigate("/")}>Login</span>
          </p>

       
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="dark"
          />

        </div>
      </div>
    </>
  );
}

export default Signup;