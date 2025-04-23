// src/views/Register.jsx (Updated to show image preview)
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import '../css/Register.css'; // Import ไฟล์ CSS สำหรับหน้า Register

// ใช้ URL Backend จริงของคุณ
const BASE_BACKEND_URL = 'https://amazing-thailand-server.vercel.app'; // <-- ตรวจสอบให้แน่ใจว่าเป็น URL ที่ถูกต้อง


function Register() {
    const navigate = useNavigate();

    // State สำหรับ Form สมัครสมาชิก: Username, Email, Password, Confirm Password
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirm] = useState('');
    // --- เพิ่ม State สำหรับเก็บไฟล์รูปภาพที่ผู้ใช้เลือก ---
    const [profileImage, setProfileImage] = useState(null);
    // --- เพิ่ม State สำหรับ URL รูปภาพที่จะแสดง Preview ---
    const [previewImageUrl, setPreviewImageUrl] = useState(null);
    // ------------------------------------------------------

    const [loading, setLoading] = useState(false); // สถานะ Loading ตอนส่งข้อมูล
    const [error, setError] = useState(null); // สถานะ Error Message
    const [success, setSuccess] = useState(null); // สถานะ Success Message

    // Handler สำหรับปุ่ม "ย้อนกลับ"
    const handleGoBack = () => {
        navigate(-1); // กลับไปยังหน้าก่อนหน้าใน History Stack
    };

    // --- Handler สำหรับการเลือกไฟล์รูปภาพ (เพิ่มส่วน Preview) ---
    const handleImageChange = (event) => {
        // ตรวจสอบว่ามีไฟล์ถูกเลือกหรือไม่
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            // คุณอาจเพิ่มการตรวจสอบชนิดไฟล์ (file.type) หรือขนาดไฟล์ (file.size) ตรงนี้ได้
            setProfileImage(file); // เก็บไฟล์ที่เลือกไว้ใน State
            console.log("Selected file:", file); // ดูข้อมูลไฟล์ใน Console

            // --- อ่านไฟล์เพื่อสร้าง URL สำหรับ Preview ---
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImageUrl(reader.result); // เก็บ Data URL ไว้ใน State
            };
            reader.readAsDataURL(file); // อ่านไฟล์เป็น Data URL
            // ------------------------------------------

        } else {
            setProfileImage(null); // ถ้าผู้ใช้ยกเลิกการเลือก ให้ตั้งค่าเป็น null
            setPreviewImageUrl(null); // ล้าง Preview Image URL ด้วย
            console.log("No file selected.");
        }
    };
    // ---------------------------------------------------------


    // Handler สำหรับการ Submit Form สมัครสมาชิก
    const handleSubmit = async (event) => {
        event.preventDefault(); // ป้องกันการ Refresh หน้าเว็บ

        // Clear ข้อความ Error/Success ก่อนลอง Submit ใหม่
        setError(null);
        setSuccess(null);

        // ตรวจสอบ Validation เบื้องต้น
        if (!username || !email || !password || !confirmPassword) {
            setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
            setLoading(false);
            return;
        }

        // **หมายเหตุ:** คุณอาจต้องการทำให้การอัปโหลดรูปภาพเป็น Optional หรือ Required
        // ถ้า Required: if (!profileImage) { setError('กรุณาเลือกรูปภาพ Profile'); setLoading(false); return; }


        setLoading(true); // ตั้งสถานะ Loading

        // --- เตรียมข้อมูลสำหรับส่งไปยัง Backend ในรูปแบบ FormData ---
        // จำเป็นเมื่อมีการส่งไฟล์พร้อมข้อมูล Form อื่นๆ
        const formData = new FormData();
        formData.append('username', username);
        formData.append('email', email);
        formData.append('password', password); // ส่ง password ไป Backend
        // formData.append('confirmPassword', confirmPassword); // ไม่จำเป็นต้องส่ง confirmPassword ไป Backend
          if (profileImage) { // เพิ่มไฟล์รูปภาพเฉพาะเมื่อมีการเลือก
          formData.append('profilePicture', profileImage); // ใช้ชื่อ field 'profilePicture' ให้ตรงกับ Backend Multer
                  }

        // --------------------------------------------------------

        try {
            // เรียก API Register ที่ Backend (ตรวจสอบ Endpoint ของคุณอีกครั้ง)
            // สมมติว่า Endpoint คือ /api/users/register ตามที่เราแก้ไขก่อนหน้านี้
            // **สำคัญ:** Backend ต้องรองรับการรับ FormData และประมวลผลไฟล์รูปภาพได้
            const response = await axios.post(`${BASE_BACKEND_URL}/api/users/register`, formData, {
                 headers: {
                     'Content-Type': 'multipart/form-data', // ระบุ Content-Type เป็น multipart/form-data
                 },
            });

            // ถ้าสมัครสำเร็จ (Status 200 หรือ 201)
            setSuccess(response.data.message || 'สมัครสมาชิกสำเร็จแล้ว! คุณสามารถเข้าสู่ระบบได้เลย');

            // อาจจะ clear Form และไฟล์หลังจากสมัครสำเร็จ
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirm('');
            setProfileImage(null); // Clear ไฟล์ที่เลือก
            setPreviewImageUrl(null); // Clear Preview URL ด้วย
            // ล้างค่าใน Input File ด้วย (ถ้าต้องการให้เลือกไฟล์ซ้ำได้หลังจากสมัครสำเร็จ)
            const imageInput = document.getElementById('profileImageInput'); // สมมติว่า Input File มี id="profileImageInput"
            if (imageInput) {
                 imageInput.value = '';
            }


            // Redirect ไปหน้า Login อัตโนมัติหลังจากสมัครสำเร็จ
             setTimeout(() => {
                 navigate('/login');
             }, 3000);


        } catch (err) {
            console.error("Registration failed:", err);
            // ดึง Error Message จาก Backend หรือใช้ Default Message
            const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการสมัครสมาชิก';
            // ตรวจสอบ Error Status Code เช่น 400 Bad Request, 409 Conflict (ถ้า Username/Email ซ้ำ)
            if (err.response && err.response.status === 409) {
                 setError(err.response.data.message || 'ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้แล้ว');
            } else {
                 setError(errorMessage);
            }


        } finally {
            setLoading(false); // หยุดสถานะ Loading
        }
    };


    return (
        <>
            {/* Div หลักที่มี Style Background เต็มจอ (ใช้ Style จาก Register.css) */}
            <div className="full-screen-bg">

                {/* ชื่อแอปด้านบน / รูปภาพประกอบ ด้านนอกกล่อง ถ้าต้องการ */ }
                {/* <h1 className="app-title">Amazing Thailand</h1> */}
                {/* <h1 className="app-title2">Picture</h1> */}
                <img src='./fw.gif' width="25%" className="my-fw-image" alt="Decoration" /> 
                <img src='./fw.gif' width="25%" className="my-fw-image2" alt="Decoration" /> 
                <img src='./fw.gif' width="25%" className="my-fw-image3" alt="Decoration" /> 


                {/* กล่องสมัครสมาชิก (ใช้ Class register-box) */}
                <div className="register-box">

                    {/* --- ปุ่มย้อนกลับ (อยู่ใน .register-box) --- */}
                    <button onClick={handleGoBack} className="back-button top-left-button">
                         ย้อนกลับ
                    </button>
                    {/* ------------------------------------- */}

                    {/* รูป profile.png (ถ้าต้องการแสดงในกล่อง Register - อาจใช้เป็น placeholder ก่อนอัปโหลดรูปจริง) */}
                     {/* <img src='./profile.png' width="25%" style={{ marginBottom: '20px' }} alt="Profile Icon" /> */}


                    {/* หัวข้อหน้าสมัครสมาชิก */}
                    <h2 className="register-title">Register</h2>

                    {/* แสดงข้อความ Error หรือ Success */}
                    {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error}</div>}
                    {success && <div style={{ color: 'green', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{success}</div>}


                    {/* --- Form สำหรับ สมัครสมาชิก --- */ }
                    <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        {/* Input Username */ }
                        <input
                            type="text"
                            placeholder="Username"
                            className="input-field" // Reuse input-field class for styling
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            disabled={loading}
                        />
                        {/* Input Email */ }
                        <input
                            type="email"
                            placeholder="Email"
                            className="input-field" // Reuse input-field class
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            disabled={loading}
                        />
                        {/* Input Password */ }
                        <input
                            type="password"
                            placeholder="Password"
                            className="input-field" // Reuse input-field class
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            disabled={loading}
                        />
                        {/* Input Confirm Password */ }
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            className="input-field" // Reuse input-field class
                            value={confirmPassword}
                            onChange={(e) => setConfirm(e.target.value)}
                            required
                            disabled={loading}
                        />

                        {/* --- Input สำหรับเลือกไฟล์รูปภาพ Profile + Preview --- */ }
                        {/* ใช้ Style คล้ายกับ Input File ใน AddPost */ }
                        <div style={{ marginTop: '15px', marginBottom: '15px', color: '#fff', width: '100%' }}>
                             <label htmlFor="profileImageInput" style={{ display: 'block', marginBottom: '5px', cursor: 'pointer' }}> รูปภาพ Profile (Optional): </label> {/* เพิ่ม Label ถ้าต้องการ */}
                             <input
                                 type="file" // ชนิด input เป็น file
                                 id="profileImageInput" // กำหนด ID เพื่อใช้อ้างอิง (เช่นใน Label หรือตอน Clear ค่า)
                                 accept="image/*" // กำหนดชนิดไฟล์ที่รับ เป็นรูปภาพทุกชนิด
                                 onChange={handleImageChange} // ใช้ Handler ที่สร้างไว้
                                 disabled={loading}
                                 style={{ display: 'none' }} // ซ่อน Input File ตัวจริง
                                 // คุณอาจเพิ่ม required ถ้าต้องการให้รูปภาพเป็น Required
                             />
                              {/* แสดงชื่อไฟล์ที่เลือก */ }
                              {profileImage && <div style={{ fontSize: '12px', marginBottom: '10px' }}>ไฟล์ที่เลือก: {profileImage.name}</div>}

                              {/* --- แสดง Preview รูปภาพที่เลือก --- */}
                              {previewImageUrl && (
                                  <img
                                      src={previewImageUrl}
                                      alt="Profile Picture Preview"
                                      className="image-preview" // ใช้ Class เพื่อจัด Style รูป Preview (ต้องเพิ่มใน Register.css)
                                  />
                              )}
                              {/* ----------------------------------- */}

                        </div>
                        {/* -------------------------------------------- */ }


                        {/* ลิงก์ไปหน้า Login */ }
                        <div className="links"> {/* ใช้ Class links */ }
                         <Link to="/login"> Already have an account? </Link>
                        </div>

                        <hr style={{ width: '100%', marginTop: '20px', marginBottom: '10px' }} />

                        {/* ปุ่ม สมัครสมาชิก */ }
                        <button
                            className="register-button" // ใช้ Class เฉพาะสำหรับปุ่มสมัครสมาชิก
                            type="submit" // กำหนด Type เป็น submit เพื่อให้ Form ทำงาน
                            disabled={loading} // ปิดการใช้งานระหว่างโหลด
                        >
                             {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'} {/* เปลี่ยน Text ตามสถานะ Loading */}
                        </button>
                    </form>
                    {/* --------------------------------- */ }

                    {/* ส่วนของ Popper หรือ Element อื่นๆ ที่ไม่เกี่ยวข้อง สามารถลบทิ้งได้ */ }

                </div> {/* สิ้นสุด .register-box */}
            </div> {/* สิ้นสุด .full-screen-bg */}
        </>
    );
}

export default Register;