// src/views/Login.jsx
import React, { useState } from "react";
import "../css/Login.css"; // Import ไฟล์ CSS สำหรับ Style
// --- นำเข้า Hook และ Library ที่จำเป็นสำหรับ Login ---
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
// ---------------------------------------------------
// ถ้าไม่ได้ใช้ใน Component นี้ ให้ลบ Imports เหล่านี้ออก
// import AppBar from "../components/AppBar";
// import Popper from '@mui/material/Popper';
// import Box from '@mui/material/Box';
// import Typography from '@mui/material/Typography';
// import SubButton from '@mui/material/Button';


const BASE_BACKEND_URL = 'https://amazing-thailand-server.vercel.app'; // <-- ใช้ URL จริงของคุณ

// Component Login
function Login() {
  // --- Hook และ State ที่จำเป็นสำหรับ Login ---
  const auth = useAuth();
  const navigate = useNavigate(); // ใช้ Hook useNavigate

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // -----------------------------------------

  // --- Handler สำหรับปุ่มย้อนกลับ ---
  const handleGoBack = () => {
navigate(-1); // กลับไปยังหน้าก่อนหน้าใน History Stack
  };
  // -----------------------------------

   // Handler และ State สำหรับ Popper ถ้าไม่ได้ใช้ใน Component นี้ สามารถลบทิ้งได้
   // const [open, setOpen] = useState(false);
   // const [anchorEl, setAnchorEl] = useState(null);

   // const handleLoginClickPopper = (event) => {
   //   setOpen((previousOpen) => !previousOpen);
   //   setAnchorEl(event.currentTarget);
   // };
   // const handleDisagree = () => {
   //   console.log("Clicked Disagree");
   //   setOpen(false);
   // };

   // const handleAgree = () => {
   //   console.log("Clicked Agree");
   //   setOpen(false); // แค่ปิด Popper
   // };
   // ---------------------------------------------


  // ฟังก์ชันจัดการเมื่อ Form ถูก Submit
  const handleSubmit = async (event) => {
event.preventDefault();

setError(null);

if (!email || !password) {
 setError({ message: 'กรุณากรอก Email และ Password' });
 return;
}

setLoading(true);

try {
 // ตรวจสอบ Endpoint Login ใน Backend ของคุณอีกครั้ง
 // ถ้าใช้ /api/auth/login ให้แก้ URL ตรงนี้ (ตามโค้ด Backend ก่อนหน้าคือ /api/auth/login)
 const response = await axios.post(`${BASE_BACKEND_URL}/api/users/login`, {
   email: email,
   password: password,
 });

 const userData = response.data.data;
 auth.login(userData); // เรียกฟังก์ชัน login จาก Auth Context

      navigate('/'); // Redirect ไปหน้าหลักหลังจาก Login สำเร็จ

} catch (err) {
 console.error("Login failed:", err);
 const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
 setError({ message: errorMessage });

} finally {
 setLoading(false);
}
  };

  // ค่า ID สำหรับ Popper (ถ้าใช้)
  // const id = open ? 'popper-login-logout' : undefined;


  return (
<>
 {/* Div หลักที่มี Style Background เต็มจอ */}
 <div className="full-screen-bg">

            {/* ชื่อแอปด้านบน (ใช้ Class ใน CSS จัดตำแหน่ง) */}
            {/* <h1 className="app-title">Amazing Thailand</h1> */}
            {/* <h1 className="app-title2">Picture</h1> */}

            {/* รูปภาพ fw.gif (ใช้ Class ใน CSS จัดตำแหน่ง) */}
            <img src='./fw.gif' width="25%" className="my-fw-image" alt="Decoration" />
            <img src='./fw.gif' width="25%" className="my-fw-image2" alt="Decoration" />
            <img src='./fw.gif' width="25%" className="my-fw-image3" alt="Decoration" />

   {/* กล่อง Login (ใช้ Class login-box) */}
   <div className="login-box">

            {/* --- ปุ่มย้อนกลับ (อยู่ใน .login-box) --- */}
            {/* ลบ div ที่ครอบปุ่มออก และใช้ className back-button top-left-button */}
            {/* ลบ inline style บนปุ่มออก และกำหนด style ใน CSS แทน */ }
            <button onClick={handleGoBack} className="back-button top-left-button">
                 ย้อนกลับ
            </button>
            {/* ------------------------------------- */}

            {/* รูป profile.png (ในกล่อง Login) */}
            {/* ใช้ style ผ่าน Class ใน CSS ถ้าต้องการ */ }
            <img src='./profile.png' width="25%" style={{ marginBottom: '20px' }} alt="Profile Icon" />


 <h2 className="login-title">Login</h2>

 {/* แสดงข้อผิดพลาด */}
 {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error.message}</div>}

 {/* --- Form สำหรับ Login --- */}
 {/* ลบ inline style ที่ซ้ำซ้อนออกถ้ากำหนดใน CSS แล้ว */}
 <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
  {/* Input Email */}
  <input
    type="email"
    placeholder="Email"
    className="input-field" // ใช้ Class input-field
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    disabled={loading}
  />
  {/* Input Password */}
  <input
    type="password"
    placeholder="Password"
    className="input-field" // ใช้ Class input-field
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    disabled={loading}
  />

  {/* ลิงก์ไปหน้า Register (ใช้ Class ใน CSS จัด Style) */}
  {/* ลบ inline style ออก */}
  <div className="links">
    <Link to="/register">Register</Link>
  </div>

            <hr style={{ width: '100%', marginTop: '20px', marginBottom: '10px' }} />

  {/* ปุ่ม Login (ใช้ Class login-button) */}
  <button
    className="login-button" // ใช้ Class login-button
    type="submit"
    disabled={loading}
  >
    {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
  </button>
 </form>
 {/* --------------------------------- */}

 {/* ส่วนของ Popper หรือ Element อื่นๆ ที่ไม่เกี่ยวข้อง สามารถลบทิ้งได้ */ }
 { /* ... โค้ด Popper ... */ }


   </div> {/* สิ้นสุด .login-box */}
 </div> {/* สิ้นสุด .full-screen-bg */}
</>
  );
}

export default Login;