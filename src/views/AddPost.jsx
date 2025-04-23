// src/views/AddPost.jsx
import React, { useState, useEffect } from 'react'; // เพิ่ม useEffect
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // นำเข้า useAuth Hook
// อาจจะสร้างไฟล์ AddPost.css สำหรับ Style หน้า Add Post
// import './AddPost.css';

const BASE_BACKEND_URL = 'https://amazing-thailand-server.vercel.app'; // <-- ใช้ URL จริงของคุณ

function AddPost() {
  // --- ใช้ useAuth Hook เพื่อตรวจสอบสถานะ Login และดึงข้อมูลผู้ใช้ ---
  const { currentUser, isLoggedIn, isLoading } = useAuth();
  // --------------------------------------------------------------------

  const navigate = useNavigate();

  // --- State สำหรับเก็บค่าที่ผู้ใช้กรอกใน Form ---
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null); // State สำหรับเก็บไฟล์รูปภาพ
  // ---------------------------------------------

  // State สำหรับจัดการสถานะและข้อผิดพลาด/สำเร็จ
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // --- ตรวจสอบว่า Login อยู่หรือไม่ และ Redirect ถ้ายังไม่ได้ Login ---
  useEffect(() => {
      // รอจนกว่าสถานะ isLoading ของ AuthContext จะเสร็จ
      if (!isLoading && !isLoggedIn) {
          // ถ้าไม่ได้อยู่ในสถานะกำลังโหลด Auth และไม่ได้ Login
          alert('กรุณาเข้าสู่ระบบเพื่อเพิ่มโพสต์รูปภาพ'); // แจ้งเตือนผู้ใช้
          navigate('/login'); // Redirect ไปหน้า Login
      }
  }, [isLoggedIn, isLoading, navigate]); // ให้ Effect นี้ทำงานเมื่อ isLoggedIn หรือ isLoading หรือ navigate เปลี่ยน

  // ถ้ายังอยู่ในสถานะกำลังโหลด Auth หรือยังไม่ได้ Login (แต่ยังไม่เสร็จ useEffect)
  if (isLoading || !isLoggedIn) {
      // อาจแสดง Loading หรือข้อความแจ้งเตือนก่อน Redirect
      return <div>กำลังตรวจสอบสิทธิ์...</div>;
  }
  // ------------------------------------------------------------------


  // --- ฟังก์ชันจัดการเมื่อเลือกไฟล์รูป ---
  const handleFileChange = (event) => {
    setPhotoFile(event.target.files[0]); // เก็บไฟล์แรกที่เลือก
  };

  // --- ฟังก์ชันจัดการเมื่อ Form ถูก Submit ---
  const handleSubmit = async (event) => {
    event.preventDefault(); // ป้องกันการ Refresh หน้าเว็บ

    setError(null); // Clear error ก่อนลอง Submit ใหม่
    setSuccess(false); // Clear success message

    // ตรวจสอบข้อมูลที่จำเป็น
    if (!locationName || !photoFile) { // ตรวจสอบว่ามีชื่อสถานที่และไฟล์รูปหรือไม่
      setError({ message: 'กรุณากรอกชื่อสถานที่และเลือกรูปภาพ' });
      return;
    }

    setLoading(true); // ตั้งสถานะว่ากำลังโหลด

    try {
      // Backend API photos ต้องการ multipart/form-data เพราะมีไฟล์รูป
      const formData = new FormData();
      formData.append('location_name', locationName);
      // description เป็น optional field
      if (description) {
         formData.append('description', description);
      }
      // **สำคัญ:** ส่ง user_id ของผู้ใช้ที่ Login อยู่
      formData.append('user_id', currentUser.user_id); // ใช้ user_id จาก Context
      // เพิ่มไฟล์รูปภาพ (ชื่อ field 'photoImage' ต้องตรงกับที่ Backend ใช้ Multer)
      formData.append('photoImage', photoFile);

      // เรียก API เพิ่มโพสต์รูปภาพที่ Backend
      const response = await axios.post(`${BASE_BACKEND_URL}/api/photos`, formData, {
        // กำหนด Header สำคัญสำหรับ multipart/form-data
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // ถ้าโพสต์สำเร็จ (Status 201 Created)
      // Backend API Create Photo คืนค่า { message: ..., data: newPhoto }
      setSuccess(true); // ตั้งสถานะว่าสำเร็จ
      // อาจจะล้าง Form หรือ Redirect ไปหน้าหลัก
      // setLocationName('');
      // setDescription('');
      // setPhotoFile(null);
      // alert('เพิ่มโพสต์รูปภาพสำเร็จ!'); // แจ้งเตือน
      setTimeout(() => {
         navigate('/'); // Redirect ไปหน้าหลัก setelah 2 วินาที
      }, 2000);


    } catch (err) {
      console.error("Add post failed:", err);
      // จัดการ Error จาก Backend
      const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มโพสต์';
      setError({ message: errorMessage });

    } finally {
      setLoading(false); // หยุดสถานะโหลด
    }
  };
  // -----------------------------------------


  return (
    <div className="add-post-page">
      {/* อาจจะเพิ่ม AppBar ที่นี่ด้วย ถ้ายังไม่ได้ใส่ใน Layout หลัก */}
      {/* <AppBar /> */}

      <div className="add-post-container">
        <h2>เพิ่มโพสต์รูปภาพใหม่</h2>
        {/* แสดงข้อผิดพลาด */}
        {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error.message}</div>}
        {/* แสดงข้อความสำเร็จ */}
        {success && <div style={{ color: 'green', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>เพิ่มโพสต์รูปภาพสำเร็จ! กำลังกลับหน้าหลัก...</div>}


        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

           {/* Input ชื่อสถานที่ */}
          <div className="form-group"> {/* ใช้ className เดียวกับหน้า Login/Register ได้ ถ้า Style คล้ายกัน */}
            <label htmlFor="locationName">ชื่อสถานที่:</label>
            <input
              type="text"
              id="locationName"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          {/* Input รายละเอียด */}
          <div className="form-group">
            <label htmlFor="description">รายละเอียด:</label>
            <textarea
              id="description"
              rows="4" // กำหนดจำนวนแถวเริ่มต้น
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
            ></textarea>
          </div>
           {/* Input รูปภาพ */}
           <div className="form-group">
            <label htmlFor="photoFile">เลือกรูปภาพ:</label>
            <input
              type="file"
              id="photoFile"
              accept="image/*" // จำกัดเฉพาะไฟล์รูปภาพ
              onChange={handleFileChange}
              required // กำหนดให้ต้องเลือกรูปภาพ
              disabled={loading}
            />
            {/* แสดงชื่อไฟล์ที่เลือก (Optional) */}
            {photoFile && <p style={{ fontSize: '12px', marginTop: '5px' }}>ไฟล์ที่เลือก: {photoFile.name}</p>}
           </div>


          <button type="submit" disabled={loading || !photoFile || !locationName}>
            {loading ? 'กำลังเพิ่มโพสต์...' : 'เพิ่มโพสต์'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default AddPost;