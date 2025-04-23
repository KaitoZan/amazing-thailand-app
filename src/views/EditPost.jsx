// src/views/EditPost.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // นำเข้า useParams
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // นำเข้า useAuth Hook
// อาจจะสร้างไฟล์ EditPost.css สำหรับ Style หน้า Edit Post
// import './EditPost.css';

const BASE_BACKEND_URL = 'https://amazing-thailand-server.vercel.app'; // <-- ใช้ URL จริงของคุณ

function EditPost() {
  // --- ใช้ useAuth Hook เพื่อตรวจสอบสิทธิ์และดึงข้อมูลผู้ใช้ ---
  const { currentUser, isLoggedIn, isLoading: isAuthLoading } = useAuth(); // เปลี่ยนชื่อ isLoading เป็น isAuthLoading เพื่อไม่ให้ซ้ำกับ state loading ของหน้านี้
  // --------------------------------------------------------------------

  const { photoId } = useParams(); // ดึง photoId จาก URL Parameter
  const navigate = useNavigate();

  // --- State สำหรับเก็บค่าที่ผู้ใช้กรอกใน Form ---
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null); // State สำหรับเก็บไฟล์รูปภาพใหม่
  // State สำหรับเก็บ URL รูปภาพปัจจุบัน (เผื่อแสดง preview)
  const [currentImageUrl, setCurrentImageUrl] = useState('');
  // ---------------------------------------------

  // State สำหรับจัดการสถานะและข้อผิดพลาด/สำเร็จ
  const [loading, setLoading] = useState(true); // ตั้งต้นเป็น true เพราะต้องโหลดข้อมูลเก่าก่อน
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // สถานะกำลังส่งข้อมูล Form

  // --- Effect สำหรับดึงข้อมูลโพสต์เก่าและตรวจสอบสิทธิ์ ---
  useEffect(() => {
    const fetchPhotoData = async () => {
      // รอตรวจสอบ Auth เสร็จก่อน
      if (isAuthLoading) return;

      // ถ้าไม่ได้ Login หรือ ไม่มี currentUser หลัง Auth โหลดเสร็จ ให้ Redirect ออก
      if (!isLoggedIn || !currentUser) {
          alert('กรุณาเข้าสู่ระบบเพื่อแก้ไขโพสต์');
          navigate('/login');
          return;
      }

      // ถ้า Login แล้ว ให้ดึงข้อมูลโพสต์
      try {
        setLoading(true); // เริ่มโหลดข้อมูลโพสต์
        setError(null);

        const response = await axios.get(`${BASE_BACKEND_URL}/api/photos/${photoId}`);
        const photoData = response.data.data;

        // **ตรวจสอบสิทธิ์: ผู้ใช้ที่ Login ต้องเป็นเจ้าของโพสต์**
        if (currentUser.user_id !== photoData.user_id) {
            alert('คุณไม่มีสิทธิ์แก้ไขโพสต์นี้'); // แจ้งเตือนว่าไม่ใช่เจ้าของ
            navigate('/'); // Redirect ออกไปหน้าหลัก
            return; // หยุดการทำงานต่อ
        }

        // ถ้าเป็นเจ้าของ ให้กำหนดค่าเก่าลงใน State ของ Form
        setLocationName(photoData.location_name);
        setDescription(photoData.description || ''); // กำหนดเป็น string ว่าง ถ้า description เป็น null
        setCurrentImageUrl(photoData.image_url); // เก็บ URL รูปภาพเก่า

      } catch (err) {
        setError(err);
        console.error(`Failed to fetch photo details for ID ${photoId}:`, err);
        const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโพสต์';
        alert(`Error: ${errorMessage}`);
        // ถ้า Error 404 redirect ไปหน้าหลัก หรือหน้า Error
         if (err.response && err.response.status === 404) {
             navigate('/'); // Redirect ไปหน้าหลักถ้าไม่พบโพสต์
         }
      } finally {
        setLoading(false); // โหลดข้อมูลโพสต์เสร็จสิ้น
      }
    };

    // ดึงข้อมูลเมื่อ photoId หรือสถานะ Auth เปลี่ยน
    if (photoId) {
        fetchPhotoData();
    }

  }, [photoId, isLoggedIn, currentUser, isAuthLoading, navigate]); // Dependencies Array

  // ถ้ายังโหลด Auth หรือข้อมูลโพสต์อยู่ ให้แสดง Loading
  if (isAuthLoading || loading) {
      return <div>กำลังโหลดข้อมูล...</div>;
  }

  // ถ้าโหลดเสร็จแล้ว แต่ไม่ใช่เจ้าของ (Logic อยู่ใน useEffect แล้ว แต่เช็คซ้ำเพื่อความปลอดภัย)
   if (!isLoggedIn || !currentUser || (photoId && !error && !loading && currentUser.user_id !== parseInt(photoId))) {
      // ในทางปฏิบัติ useEffect ด้านบนจะจัดการ Redirect ไปแล้ว แต่มี check นี้เผื่อไว้
      return null; // หรือแสดงข้อความ "กำลัง Redirect..."
   }


  // --- ฟังก์ชันจัดการเมื่อเลือกไฟล์รูปใหม่ ---
  const handleFileChange = (event) => {
    setPhotoFile(event.target.files[0]); // เก็บไฟล์ใหม่ที่เลือก
    // อาจจะแสดง Preview รูปใหม่ที่นี่ด้วย
  };

  // --- ฟังก์ชันจัดการเมื่อ Form ถูก Submit ---
  const handleSubmit = async (event) => {
    event.preventDefault(); // ป้องกันการ Refresh หน้าเว็บ

    setError(null); // Clear error ก่อนลอง Submit ใหม่
    setSuccess(false); // Clear success message
    setIsSubmitting(true); // ตั้งสถานะกำลังส่ง Form

    try {
      // Backend API photos (PUT) ต้องการ multipart/form-data ถ้ามีการส่งไฟล์รูปใหม่
      // หรืออาจจะรับ JSON ถ้าแก้ไขแค่ข้อความ (ขึ้นอยู่กับการออกแบบ Backend)
      // ถ้า Backend รับ multipart/form-data ตลอด ก็ใช้ FormData ได้เลย
      const formData = new FormData();
      formData.append('location_name', locationName);
      formData.append('description', description || ''); // ส่ง description เป็น string ว่าง ถ้าไม่มีค่า
      // **สำคัญ:** Backend PUT /api/photos/:photoId คาดว่าจะมีการตรวจสอบ user_id ใน Backend ด้วย!
      // Frontend อาจจะส่ง user_id ไปด้วยเผื่อ Backend ต้องการ แต่ส่วนใหญ่ Backend จะดึง user_id จาก Token/Session
      // ใน Backend Controller ของคุณ มีการดึง user_id จาก Body
      // formData.append('user_id', currentUser.user_id); // ถ้า Backend ต้องการรับ user_id ใน Body ตอน PUT

      // เพิ่มไฟล์รูปภาพใหม่ ถ้าผู้ใช้เลือกไฟล์ใหม่
      if (photoFile) {
        formData.append('photoImage', photoFile); // ชื่อ field 'photoImage' ต้องตรงกับที่ Backend ใช้ Multer
      } else {
        // ถ้าไม่ได้เลือกไฟล์ใหม่ Backend อาจจะต้องการ Flag บางอย่าง หรือ Backend ฉลาดพอจะรู้ว่าไม่มีไฟล์ใหม่
        // ขึ้นอยู่กับการออกแบบ Backend API PUT
      }


      // เรียก API แก้ไขโพสต์รูปภาพที่ Backend (ใช้ PUT Method)
      // ถ้าไม่มีไฟล์ใหม่ส่งไป axios.put จะส่งเป็น application/json หรือ form-urlencoded ขึ้นอยู่กับ FormData
      const response = await axios.put(`${BASE_BACKEND_URL}/api/photos/${photoId}`, formData, {
        // กำหนด Header ถ้ามีการส่งไฟล์ (Backend ที่รับ multipart/form-data ตลอด ก็ระบุ header นี้)
        headers: {
          'Content-Type': 'multipart/form-data', // อาจปรับเป็น application/json ถ้าแก้ไขแค่ข้อความและ Backend รองรับ
        },
      });

      // ถ้าแก้ไขสำเร็จ (Status 200 OK)
      // Backend API Edit Photo คืนค่า { message: ..., data: updatedPhoto }
      setSuccess(true); // ตั้งสถานะว่าสำเร็จ
      // อาจจะหน่วงเวลาแล้ว Redirect กลับไปหน้าดูรายละเอียดโพสต์ หรือหน้าหลัก
      // alert('แก้ไขโพสต์รูปภาพสำเร็จ!'); // แจ้งเตือน
      setTimeout(() => {
         navigate(`/photos/${photoId}`); // Redirect กลับไปหน้ารายละเอียดโพสต์เดิม
      }, 2000);


    } catch (err) {
      console.error("Edit post failed:", err);
      // จัดการ Error จาก Backend
      const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขโพสต์';
      setError({ message: errorMessage });

    } finally {
      setIsSubmitting(false); // หยุดสถานะกำลังส่ง Form
    }
  };
  // -----------------------------------------


  return (
    <div className="edit-post-page">
      {/* อาจจะเพิ่ม AppBar ที่นี่ด้วย ถ้ายังไม่ได้ใส่ใน Layout หลัก */}
      {/* <AppBar /> */}

      <div className="edit-post-container">
        <h2>แก้ไขโพสต์รูปภาพ</h2>
        {/* แสดงข้อผิดพลาด */}
        {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error.message}</div>}
        {/* แสดงข้อความสำเร็จ */}
        {success && <div style={{ color: 'green', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>แก้ไขโพสต์รูปภาพสำเร็จ! กำลังกลับไปยังหน้ารายละเอียด...</div>}


        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

           {/* Input ชื่อสถานที่ */}
          <div className="form-group"> {/* ใช้ className เดียวกับหน้า Login/Register/AddPost ได้ */}
            <label htmlFor="locationName">ชื่อสถานที่:</label>
            <input
              type="text"
              id="locationName"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
              disabled={isSubmitting || loading} // ปิดการใช้งานระหว่างโหลดข้อมูลหรือกำลังส่ง
            />
          </div>
          {/* Input รายละเอียด */}
          <div className="form-group">
            <label htmlFor="description">รายละเอียด:</label>
            <textarea
              id="description"
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting || loading} // ปิดการใช้งานระหว่างโหลดข้อมูลหรือกำลังส่ง
            ></textarea>
          </div>
           {/* แสดงรูปภาพปัจจุบัน และ Input สำหรับเลือกไฟล์รูปใหม่ */}
           <div className="form-group" style={{ textAlign: 'center' }}>
             <label>รูปภาพปัจจุบัน:</label>
             {currentImageUrl && <img src={currentImageUrl} alt="Current Photo" style={{ maxWidth: '200px', height: 'auto', marginTop: '10px', marginBottom: '10px' }} />}
             <br />
             <label htmlFor="photoFile">เลือกรูปภาพใหม่ (Optional):</label>
             <input
               type="file"
               id="photoFile"
               accept="image/*"
               onChange={handleFileChange}
               disabled={isSubmitting || loading} // ปิดการใช้งานระหว่างโหลดข้อมูลหรือกำลังส่ง
             />
             {/* แสดงชื่อไฟล์ใหม่ที่เลือก (Optional) */}
             {photoFile && <p style={{ fontSize: '12px', marginTop: '5px' }}>ไฟล์ใหม่ที่เลือก: {photoFile.name}</p>}
           </div>


          <button type="submit" disabled={isSubmitting || loading || !locationName}>
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
          </button>
        </form>

      </div>
    </div>
  );
}

export default EditPost;