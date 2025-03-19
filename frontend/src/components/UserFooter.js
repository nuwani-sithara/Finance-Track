import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram, FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa"; // Icons
import "../stylesheet/UserFooter.css";

export default function UserFooter() {
    return (
        <footer className="footer">
            <div className="footer-container">
                {/* About Section */}
                <div className="footer-section">
                    <h3>FinanceTrack</h3>
                    <p>Take control of your finances with our easy-to-use personal finance tracker. Manage your income, expenses, and savings effortlessly.</p>
                </div>

                {/* Quick Links Section */}
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="#home">Home</a></li>
                        <li><a href="#features">Features</a></li>
                        <li><a href="#about">About</a></li>
                        <li><a href="#contact">Contact</a></li>
                    </ul>
                </div>

                {/* Contact Section */}
                <div className="footer-section">
                    <h4>Contact Us</h4>
                    <ul>
                        <li>
                            <FaEnvelope className="footer-icon" /> support@financetrack.com
                        </li>
                        <li>
                            <FaPhone className="footer-icon" /> +94 (75) 400-9566
                        </li>
                        <li>
                            <FaMapMarkerAlt className="footer-icon" /> Malabe, Sri Lanka
                        </li>
                    </ul>
                </div>

                {/* Social Media Section */}
                <div className="footer-section">
                    <h4>Follow Us</h4>
                    <div className="social-links">
                        <a href="#facebook" className="social-link">
                            <FaFacebook className="social-icon" />
                        </a>
                        <a href="#twitter" className="social-link">
                            <FaTwitter className="social-icon" />
                        </a>
                        <a href="#linkedin" className="social-link">
                            <FaLinkedin className="social-icon" />
                        </a>
                        <a href="#instagram" className="social-link">
                            <FaInstagram className="social-icon" />
                        </a>
                    </div>
                </div>
            </div>

            {/* Footer Bottom */}
            <div className="footer-bottom">
                <p>&copy; 2025 FinanceTrack. All rights reserved.</p>
            </div>
        </footer>
    );
}