// src/views/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
// อาจจะสร้างไฟล์ Register.css สำหรับ Style หน้า Register
// import './Register.css';

const BASE_BACKEND_URL = 'https://amazing-thailand-server.vercel.app'; // <-- ใช้ URL จริงของคุณ

function Register() {
  // State สำหรับเก็บค่าที่ผู้ใช้กรอกใน Form
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // State สำหรับเก็บไฟล์รูป Profile
  const [profilePicture, setProfilePicture] = useState(null);
  // State สำหรับจัดการสถานะและข้อผิดพลาด
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false); // เพิ่ม State สำหรับข้อความสำเร็จ

  // Hook สำหรับ Redirect ผู้ใช้หลังจากสมัครสำเร็จ
  const navigate = useNavigate();

  // --- ฟังก์ชันจัดการเมื่อเลือกไฟล์รูป ---
  const handleFileChange = (event) => {
    setProfilePicture(event.target.files[0]); // เก็บไฟล์แรกที่เลือก
  };

  // --- ฟังก์ชันจัดการเมื่อ Form ถูก Submit ---
  const handleSubmit = async (event) => {
    event.preventDefault(); // ป้องกันการ Refresh หน้าเว็บ

    setError(null); // Clear error ก่อนลองสมัครใหม่
    setSuccess(false); // Clear success message

    // ตรวจสอบว่ากรอกข้อมูลที่จำเป็นครบหรือไม่
    if (!username || !email || !password) {
      setError({ message: 'กรุณากรอก Username, Email และ Password' });
      return;
    }

    setLoading(true); // ตั้งสถานะว่ากำลังโหลด

    try {
      // ข้อมูล Backend API users/register ต้องการ multipart/form-data
      // เพราะมีการรับไฟล์รูปด้วย
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      // เพิ่มไฟล์รูป ถ้าผู้ใช้เลือกไฟล์
      if (profilePicture) {
        formData.append('profilePicture', profilePicture); // ชื่อ field 'profilePicture' ต้องตรงกับที่ Backend ใช้ Multer
      }

      // เรียก API สมัครสมาชิกที่ Backend
      const response = await axios.post(`${BASE_BACKEND_URL}/api/users/register`, formData, {
        // กำหนด Header สำคัญสำหรับ multipart/form-data
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // ถ้าสมัครสำเร็จ (Status 201 Created)
      // Backend API Register คืนค่า { message: "User registered successfully", data: newUser }
      setSuccess(true); // ตั้งสถานะว่าสำเร็จ
      // อาจจะรอสักครู่แล้ว Redirect ไปหน้า Login
      setTimeout(() => {
         navigate('/login'); // Redirect ไปหน้า Login
      }, 2000); // หน่วงเวลา 2 วินาที ก่อน Redirect

    } catch (err) {
      console.error("Registration failed:", err);
      // จัดการ Error จาก Backend
      // Error 400 Missing fields (เราเช็คเบื้องต้นแล้ว)
      // Error 409 Conflict (P2002 - Duplicate entry)
      // Error 500 Internal Server Error
      const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
      setError({ message: errorMessage });

    } finally {
      setLoading(false); // หยุดสถานะโหลด
    }
  };
  // -----------------------------------------


  return (
    <div className="register-page">
      {/* อาจจะเพิ่ม AppBar ที่นี่ด้วย */}
      {/* <AppBar /> */}

      <div className="register-container">
        <h2>สมัครสมาชิก</h2>
        {/* แสดงข้อผิดพลาด */}
        {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error.message}</div>}
        {/* แสดงข้อความสำเร็จ */}
        {success && <div style={{ color: 'green', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>สมัครสมาชิกสำเร็จ! กำลังนำไปยังหน้า Login...</div>}


        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           {/* Input Username */}
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {/* Input Email */}
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {/* Input Password */}
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
           {/* Input รูป Profile (Optional) */}
           <div className="form-group">
            <label htmlFor="profilePicture">รูป Profile (Optional):</label>
            <input
              type="file"
              id="profilePicture"
              accept="image/*" // จำกัดเฉพาะไฟล์รูปภาพ
              onChange={handleFileChange}
              disabled={loading}
            />
           </div>


          <button type="submit" disabled={loading}>
            {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <p style={{ marginTop: '20px' }}>
          มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบที่นี่</Link> {/* ลิงก์กลับไปหน้า Login */}
        </p>
      </div>
    </div>
  );
}

export default Register;