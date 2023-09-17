import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import lambdatestImage from "../images/logo.png";
import "./loginmodal.css";
import { useUserAuth } from "../context"; // Import the useUserAuth hook

Modal.setAppElement("#root");

const LoginModal = ({ isOpen, onRequestClose }) => {
  const { logIn } = useUserAuth(); // Access the logIn function from the context
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Clear email and password fields when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setEmail("");
      setPassword("");
    }
  }, [isOpen]);

  const handleLogin = async () => {
    try {
      await logIn(email, password);

      // Clear email and password fields
      setEmail("");
      setPassword("");
      onRequestClose();
    } catch (error) {
      // Handle login errors here
      console.error("Error logging in:", error.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Login Modal"
      className="login-modal"
      overlayClassName="login-overlay"
    >
      <div className="modal-content">
        <img
          src={lambdatestImage}
          alt="LambdaTest"
          className="lambdatest-image"
        />
        <div className="modal-header">
          <h5 className="modal-title">Login Page</h5>
          <button
            type="button"
            className="btn-close"
            onClick={onRequestClose}
            aria-label="Close"
          ></button>
        </div>
        <form>
          <div className="form-group">
            <label>Email:</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Password:</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleLogin}
          >
            Login
          </button>
        </form>
      </div>
    </Modal>
  );
};

export default LoginModal;
