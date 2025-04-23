// src/views/Logintest.jsx (หรือเปลี่ยนชื่อเป็น Login.jsx)
import React, { useState } from "react";
import "../css/Login.css"; // Import ไฟล์ CSS สำหรับ Style (คุณอาจเปลี่ยนชื่อเป็น Login.css)
// --- นำเข้า Hook และ Library ที่จำเป็นสำหรับ Login ---
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom'; // ใช้ Link แทน a tag
import { useAuth } from '../contexts/AuthContext';
// ---------------------------------------------------
import AppBar from "../components/AppBar"; // สมมติว่ามี Component AppBar หรืออาจนำไปใส่ใน Layout หลัก
import Popper from '@mui/material/Popper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import SubButton from '@mui/material/Button'; // ใช้ SubButton ใน Popper


const BASE_BACKEND_URL = 'https://amazing-thailand-server.vercel.app'; // <-- ใช้ URL จริงของคุณ

// เปลี่ยนชื่อ Component จาก Logintest เป็น Login เพื่อความชัดเจน
function Login() {
  // --- Hook และ State ที่จำเป็นสำหรับ Login ---
  const auth = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // -----------------------------------------

  // --- State และ Handler เดิมสำหรับควบคุมการเปิด/ปิด Popper (ปัจจุบันใช้กับปุ่ม Login ซึ่งอาจไม่ใช่การใช้งานที่ต้องการ) ---
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleLoginClickPopper = (event) => { // เปลี่ยนชื่อ Handler เพื่อความชัดเจน
    setOpen((previousOpen) => !previousOpen);
    setAnchorEl(event.currentTarget);
  };
  const handleDisagree = () => {
    console.log("Clicked Disagree");
    setOpen(false);
  };
const handleGoBack = () => {
  navigate(-1); // กลับไปยังหน้าก่อนหน้าใน History Stack
  // หรือ navigate('/'); เพื่อกลับหน้าแรกเสมอ
};

  const handleAgree = () => {
    console.log("Clicked Agree");
    // **หมายเหตุ:** Logic 'ตกลง' สำหรับ Popper ถามออกจากระบบ
    // ไม่ควรอยู่ที่ปุ่ม Login ครับ ควรย้ายไปอยู่ที่ปุ่ม Logout ใน AppBar หรือ Profile
    // ในที่นี้จะแค่ปิด Popper ไว้ก่อน
    setOpen(false);
  };
  // ----------------------------------------------------------------------------------------------------------

  // ฟังก์ชันจัดการเมื่อ Form ถูก Submit
  const handleSubmit = async (event) => {
    event.preventDefault(); // ป้องกันการ Refresh หน้าเว็บ

    setError(null); // Clear error ก่อนลอง Login ใหม่

    // ตรวจสอบว่ากรอกข้อมูลครบหรือไม่
    if (!email || !password) {
      setError({ message: 'กรุณากรอก Email และ Password' });
      return;
    }

    setLoading(true); // ตั้งสถานะว่ากำลังโหลด

    try {
      // เรียก API Login ที่ Backend
      const response = await axios.post(`${BASE_BACKEND_URL}/api/users/login`, {
        email: email,
        password: password,
      });

      // ถ้า Login สำเร็จ (Status 200) Backend จะคืนค่า { message: ..., data: userData }
      const userData = response.data.data;

      // เรียกฟังก์ชัน login จาก Auth Context เพื่ออัปเดตสถานะและเก็บข้อมูลผู้ใช้
      auth.login(userData);

      // Redirect ผู้ใช้ไปยังหน้าหลัก หรือหน้าที่ต้องการหลังจาก Login สำเร็จ
      navigate('/');

    } catch (err) {
      console.error("Login failed:", err);
      // จัดการ Error จาก Backend
      const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
      setError({ message: errorMessage });

    } finally {
      setLoading(false); // หยุดสถานะโหลด
    }
  };

  // ค่า ID สำหรับ Popper (สำหรับปุ่ม Login/Logout ในอนาคต)
  const id = open ? 'popper-login-logout' : undefined;


  return (
    <>
      {/* Div หลักที่มี Style Background */}
      <div className="full-screen-bg">

<h1 className="app-title">Amazing Thailand</h1> 
<h1 className="app-title2">Picture</h1> 
<img src='./fw.gif' width="25%" className="my-fw-image" />
<img src='./fw.gif' width="25%" className="my-fw-image2" />
        {/* กล่อง Login */}
        <div className="login-box">
<div className='back-button-container' style={{ marginTop: '0px', marginBottom: '-20px', paddingLeft: '290px',fontFamily: 'Charmonman' ,fontSize: '20px',width: '400px'}}>
             <button onClick={handleGoBack} className="back-button" style={{ backgroundColor: 'rgba(105, 71, 71, 0.2)', color: 'white',transition: 'backgroundcolor 0.3s ease'}}> {/* ใช้ className back-button เพื่อ Style ปุ่ม */}
                ย้อนกลับ
            </button>
        </div>
        <img src='./profile.png'width="25%"/>
          <h2 className="login-title">Login</h2>

          {/* แสดงข้อผิดพลาด */}
          {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error.message}</div>}

          {/* --- Form สำหรับ Login --- */}
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}> {/* กำหนด Style ให้ Form จัดเรียงสวยงาม */}
            {/* Icon ผู้ใช้ Placeholder ถ้าต้องการ */}
            {/* <div className="icon-placeholder" /> */}

            {/* Input Email/Username */}
            <input
              type="email" // Backend ใช้ email ในการ Login
              placeholder="Email" // แก้ Placeholder ให้ตรงกับ Backend
              className="input-field"
              value={email} // เชื่อมกับ State
              onChange={(e) => setEmail(e.target.value)} // อัปเดต State เมื่อมีคนพิมพ์
              required
              disabled={loading} // ปิดการใช้งานระหว่างโหลด
            />
            {/* Input Password */}
            <input
              type="password"
              placeholder="Password"
              className="input-field"
              value={password} // เชื่อมกับ State
              onChange={(e) => setPassword(e.target.value)} // อัปเดต State เมื่อมีคนพิมพ์
              required
              disabled={loading} // ปิดการใช้งานระหว่างโหลด
            />

            {/* Links ด้านล่าง Form */}
            <div className="links" style={{ width: '100%' ,paddingLeft: '235px', }}> {/* กำหนดความกว้างเพื่อให้จัดซ้ายขวาได้ */}
              {/* ใช้ Link Component จาก react-router-dom สำหรับ Navigate */}
              <Link to="/register"sty>Register</Link> {/* ลิงก์ไปหน้า Register */}


              
            </div>
<hr style={{ width: '100%', marginTop: '20px', marginBottom: '10px' }} />
            {/* Social Login Section (UI ที่มีอยู่แล้ว) */}
           

            {/* ปุ่ม Login ที่เป็น Submit Button ของ Form */}
            <button
              className="login-button"
              type="submit" // กำหนด Type เป็น submit เพื่อให้ Form ทำงาน
              disabled={loading} // ปิดการใช้งานระหว่างโหลด
              // onClick={handleLoginClickPopper} // **หมายเหตุ:** การคลิกปุ่ม Login ควร Submit Form ไม่ใช่เปิด Popper ถาม Logout
            >
              {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'} {/* เปลี่ยน Text ตามสถานะ Loading */}
            </button>
          </form>
          {/* --------------------------------- */}

          {/* Component Popper (น่าจะใช้สำหรับ Logout จาก AppBar หรือ Profile) */}
          {/* เก็บโค้ด Popper ไว้ แต่ควรย้ายไปใช้กับปุ่ม Logout ที่เหมาะสม */}
          <Popper
            id={id}
            open={open}
            anchorEl={anchorEl}
            placement="bottom"
            disablePortal={false}
            modifiers={[
              { name: 'flip', enabled: true, options: { altBoundary: true, rootBoundary: 'document', padding: 8 } },
              { name: 'preventOverflow', enabled: true, options: { altAxis: false, altBoundary: false, tether: false, rootBoundary: 'document', padding: 8 } },
              { name: 'arrow', enabled: false, options: { element: undefined } },
            ]}
          >
            <Box sx={{ border: '1px solid grey', p: 1, bgcolor: 'background.paper', mt: 1 ,color: 'black' ,borderRadius: '15px' ,fontFamily: 'Charmonman', }}>
              <Typography variant="subtitle1" component="h6" gutterBottom className="label">
                ยืนยันที่จะออกจากระบบใหม?
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: ' center', gap: 1 }}>
                <SubButton size="small" onClick={handleDisagree}> ยกเลิก </SubButton>
                <SubButton size="small" onClick={handleAgree}> ตกลง </SubButton>
              </Box>
            </Box>
          </Popper>

        </div>
      </div>
    </>
  );
}

export default Login;