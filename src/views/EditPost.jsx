// src/views/EditPost.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom'; // นำเข้า useParams
import { useAuth } from '../contexts/AuthContext';
// --- นำเข้าไฟล์ CSS ที่สร้างใหม่ ---
import '../css/EditPost.css';
// -------------------------------

const BASE_BACKEND_URL = 'https://amazing-thailand-server.vercel.app'; // <-- ใช้ URL จริงของคุณ

function EditPost() {
  // --- ใช้ Hook ที่จำเป็น ---
  const { currentUser, isLoggedIn, isLoading: isAuthLoading } = useAuth(); // ตรวจสอบสิทธิ์
  const { photoId } = useParams(); // ดึง photoId จาก URL
  const navigate = useNavigate(); // สำหรับ Redirect
  // ---------------------------

  // --- State สำหรับเก็บข้อมูลโพสต์และ Form ---
  const [postData, setPostData] = useState(null); // เก็บข้อมูลโพสต์เก่าที่ดึงมา
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null); // ไฟล์รูปภาพใหม่ที่ผู้ใช้เลือก
  const [newPhotoPreviewUrl, setNewPhotoPreviewUrl] = useState(null); // Preview รูปภาพใหม่
  // ----------------------------------------

  // State สำหรับจัดการสถานะและข้อผิดพลาด/สำเร็จ
  const [loading, setLoading] = useState(true); // ตั้งต้นเป็น true เพราะต้องโหลดข้อมูลโพสต์เก่า
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // สถานะกำลังส่งข้อมูล Form

  // --- Effect สำหรับดึงข้อมูลโพสต์เก่าและตรวจสอบสิทธิ์ ---
  useEffect(() => {
    console.log("useEffect in EditPost running...");
    console.log("isAuthLoading:", isAuthLoading);
    console.log("isLoggedIn:", isLoggedIn);
    console.log("currentUser:", currentUser);
    console.log("photoId from URL:", photoId);


    const fetchPostData = async (idToFetch) => { // รับ photo id ที่ต้องการ fetch
      console.log("Attempting to fetch post data for photo ID:", idToFetch);
      try {
        setLoading(true); // เริ่มโหลดข้อมูลโพสต์
        setError(null);

        // *** สมมติว่า Backend มี Endpoint GET /api/photos/:photoId สำหรับดึงข้อมูลโพสต์ ***
        // (ถ้า Backend คุณยังไม่มี ต้องเพิ่ม Endpoint นี้ใน photo.route และ controller ครับ)
        const response = await axios.get(`${BASE_BACKEND_URL}/api/photos/${idToFetch}`); // ใช้ idToFetch
        const fetchedPostData = response.data.data; // สมมติ Backend ส่งข้อมูลโพสต์ใน field 'data'
        console.log("Fetch successful, post data:", fetchedPostData);

        // **ตรวจสอบสิทธิ์: ผู้ใช้ที่ Login ต้องเป็นเจ้าของโพสต์นี้**
        // การตรวจสอบนี้ควรทำหลังจากโหลด Auth และ fetch data แล้ว
        if (!currentUser || currentUser.user_id !== fetchedPostData.user_id) {
            console.log("User is not the owner of this post. Redirecting.");
            alert('คุณไม่มีสิทธิ์แก้ไขโพสต์นี้'); // แจ้งเตือนว่าไม่ใช่เจ้าของ
            navigate('/'); // Redirect ออกไปหน้าหลัก
            return; // หยุดการทำงานต่อ
        }

        // ถ้าเป็นเจ้าของ ให้กำหนดข้อมูลเก่าลงใน State ของ Form
        setPostData(fetchedPostData); // เก็บข้อมูลโพสต์ทั้งหมด
        setLocationName(fetchedPostData.location_name || '');
        setDescription(fetchedPostData.description || '');
        // ไม่ต้องกำหนด photoFile หรือ Preview URL สำหรับรูปเก่า

      } catch (err) {
        console.error("Failed to fetch post data:", err);
        setError(err);
        const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูลโพสต์';

        // จัดการ Redirect ตาม Error Status (เช่น ถ้าโพสต์ไม่พบ หรือไม่มีสิทธิ์)
         if (err.response && err.response.status === 404) {
             console.log("Post not found (404). Redirecting.");
             navigate('/'); // Redirect ไปหน้าหลักถ้าไม่พบโพสต์
         } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
              console.log("Authorization error (401/403) while fetching post. Redirecting to login.");
             navigate('/login'); // Redirect ไปหน้า Login ถ้าไม่มีสิทธิ์
         } else {
             // จัดการ Error อื่นๆ
              alert(`Error: ${errorMessage}`); // แสดง Alert สำหรับ Error อื่นๆ
              navigate('/'); // Redirect ไปหน้าหลักสำหรับ Error อื่นๆ
         }

      } finally {
        setLoading(false); // โหลดข้อมูลโพสต์เสร็จสิ้น
        console.log("Fetch post process finished.");
      }
    };


    // Logic ตรวจสอบสิทธิ์และ Redirect ก่อนเริ่มดึงข้อมูล
    if (!isAuthLoading) { // รอจนกว่า Auth จะโหลดเสร็จ
        const parsedPhotoId = parseInt(photoId);

        if (isNaN(parsedPhotoId)) {
            console.log("Invalid photoId in URL (not a number). Redirecting.");
            navigate('/');
            return; // หยุด Effect
        }

        // ตรวจสอบว่า Login แล้วหรือไม่
        if (!isLoggedIn || !currentUser) {
            console.log("User not logged in. Redirecting to login.");
            alert('กรุณาเข้าสู่ระบบเพื่อแก้ไขโพสต์'); // แจ้งเตือนผู้ใช้
            navigate('/login');
            return; // หยุด Effect
        }

        // ถ้าผ่านการตรวจสอบ Login แล้ว ให้เริ่มดึงข้อมูลโพสต์
        // การตรวจสอบสิทธิ์ความเป็นเจ้าของโพสต์ จะทำหลังจาก fetchPostData ดึงข้อมูลมาได้แล้ว
        console.log("Auth check passed for EditPost. Fetching post data.");
        fetchPostData(parsedPhotoId); // เรียก fetch function ด้วย parsed photoId

    } // else: if isAuthLoading is true, Effect does nothing until it's false


  }, [photoId, isLoggedIn, currentUser, isAuthLoading, navigate]); // Dependencies Array

  // --- แสดง Loading ขณะโหลด Auth หรือ ข้อมูลโพสต์ ---
  if (isAuthLoading || loading) {
      return (
          <div className="full-screen-bg"> {/* ใช้ Style Background ขณะ Loading */}
             <div className="edit-post-box" style={{ textAlign: 'center' }}> {/* ใช้ Style Box ขณะ Loading */ }
                <p>{isAuthLoading ? 'กำลังตรวจสอบสิทธิ์...' : 'กำลังโหลดข้อมูลโพสต์...'}</p>
                {/* อาจเพิ่ม Loading Spinner ตรงนี้ได้ */}
             </div>
          </div>
      );
  }
  // ----------------------------------------------------

  // หากมาถึงตรงนี้ แสดงว่าโหลดเสร็จ, Login แล้ว, และเป็นเจ้าของโพสต์
  // สามารถ Render Form ได้เลย
  // หาก postData เป็น null แสดงว่าเกิด Error ในการ Fetch แต่ไม่ได้ Redirect (ไม่น่าเกิดขึ้นถ้า Logic ถูกต้อง)
  if (!postData) {
      console.log("Post data is null after loading. Showing error message if any.");
      return (
          <div className="full-screen-bg">
             <div className="edit-post-box" style={{ textAlign: 'center' }}>
                <p>ไม่สามารถโหลดข้อมูลโพสต์ได้</p>
                {error && <div style={{ color: 'red' }}>{error.message || 'เกิดข้อผิดพลาด'}</div>}
             </div>
          </div>
      );
  }


  // --- ฟังก์ชันจัดการเมื่อเลือกไฟล์รูปภาพใหม่ + Preview ---
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setPhotoFile(file); // เก็บไฟล์ใหม่

      // อ่านไฟล์เพื่อสร้าง URL สำหรับ Preview รูปใหม่
      const reader = new FileReader();
      reader.onloadend = () => {
         setNewPhotoPreviewUrl(reader.result); // เก็บ Data URL ไว้ใน State ใหม่
      };
      reader.readAsDataURL(file);

      console.log("Selected new file:", file);
    } else {
      setPhotoFile(null);
      setNewPhotoPreviewUrl(null); // ล้าง Preview URL
      console.log("No new file selected.");
    }
  };
  // ---------------------------------------------------------


  // --- ฟังก์ชันจัดการเมื่อ Form ถูก Submit ---
  const handleSubmit = async (event) => {
    event.preventDefault();

    setError(null);
    setSuccess(false);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      let isDataChanged = false;

      // เปรียบเทียบค่าใน Form กับข้อมูลเก่าที่โหลดมา (postData)
      // แล้วค่อย append เฉพาะ Field ที่มีการเปลี่ยนแปลง
      if (locationName !== (postData?.location_name || '')) {
         formData.append('location_name', locationName);
         isDataChanged = true;
      }
      if (description !== (postData?.description || '')) {
         formData.append('description', description);
         isDataChanged = true;
      }
      // ถ้าผู้ใช้เลือกรูปภาพใหม่
      if (photoFile) {
        formData.append('photoImage', photoFile); // ชื่อ field ต้องตรงกับ Backend
        isDataChanged = true;
      }

      // ถ้าไม่มีการเปลี่ยนแปลงข้อมูลอะไรเลย
      if (!isDataChanged) {
           console.log("No data changed, skipping API call.");
           setSuccess(true); // ถือว่าสำเร็จ
           setIsSubmitting(false);
            // อาจจะหน่วงเวลาแล้ว Redirect เลย
            setTimeout(() => {
               navigate('/'); // Redirect กลับหน้าหลัก
            }, 1000);
           return;
      }


      // **สำคัญ:** Backend PUT /api/photos/:photoId ต้องมีการตรวจสอบสิทธิ์ความเป็นเจ้าของ!
      // และ Backend ต้องจัดการลบรูปเก่าใน Cloudinary และอัปโหลดรูปใหม่ (ถ้ามี)
      const response = await axios.put(`${BASE_BACKEND_URL}/api/photos/${photoId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // ใช้เสมอเมื่อมีโอกาสส่งไฟล์
        },
      });

      // ถ้าแก้ไขสำเร็จ (Status 200 OK)
      // Backend API Edit Photo คืนค่า { message: ..., data: updatedPhoto }
      // const updatedPostData = response.data.data; // ถ้าต้องการนำข้อมูลที่อัปเดตมาใช้ต่อใน Frontend

      setSuccess(true);
      // alert('แก้ไขโพสต์สำเร็จ!'); // อาจจะลบ Alert ออก
      setTimeout(() => {
         navigate('/'); // Redirect ไปหน้าหลักหลังจากสำเร็จ
      }, 2000);


    } catch (err) {
      setError(err);
      console.error("Edit post failed:", err);
      // จัดการ Error จาก Backend
      const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขโพสต์';
      alert(`Failed to edit post: ${errorMessage}`);
      // อาจจะพิจารณา Redirect ในกรณี Error บางประเภท เช่น 401, 403, 404
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      {/* --- Div หลักที่มี Style Background เต็มจอ --- */}
      <div className="full-screen-bg">

            {/* ชื่อแอป/รูปภาพประกอบ ด้านนอกกล่อง ถ้าต้องการ */ }

        {/* --- กล่องสำหรับ Form แก้ไขโพสต์ (ใช้ Class edit-post-box) --- */}
        <div className="edit-post-box">

            {/* ปุ่มย้อนกลับ (ถ้าต้องการ) */ }
            <button onClick={() => navigate(-1)} className="back-button top-left-button">
                ย้อนกลับ
            </button>

          {/* หัวข้อหน้าแก้ไขโพสต์ */}
          <h2 className="edit-post-title">แก้ไขโพสต์รูปภาพ</h2>

          {/* แสดงข้อผิดพลาด */}
          {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error.message}</div>}
          {/* แสดงข้อความสำเร็จ */}
          {success && <div style={{ color: 'green', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>แก้ไขโพสต์สำเร็จ! กำลังกลับหน้าหลัก...</div>}


          {/* --- Form สำหรับ แก้ไขโพสต์ --- */}
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

             {/* Input ชื่อสถานที่ */}
            <input
              type="text"
              placeholder="ชื่อสถานที่"
              id="locationName"
              className="input-field"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              required
              disabled={isSubmitting || loading} // ปิดระหว่าง Submitting หรือ Loading ข้อมูลเก่า
            />
            {/* Input รายละเอียด (ใช้ textarea) */}
            <textarea
              placeholder="รายละเอียด (Optional)"
              id="description"
              rows="4"
              className="input-field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isSubmitting || loading}
            ></textarea>

            {/* --- แสดงรูปภาพเก่า + Input สำหรับเลือกรูปใหม่ + Preview รูปใหม่ --- */}
            <div className="post-photo-group"> {/* Grouping div for styling */}
                <label style={{ marginBottom: '10px' }}>รูปภาพปัจจุบัน:</label>
                {postData?.photo_url && ( // แสดงรูปเก่า ถ้ามี และข้อมูลโหลดแล้ว
                    <img
                        src={postData.photo_url}
                        alt="Current Post Photo"
                        className="current-post-photo" // ใช้ Class สำหรับ Style รูปปัจจุบัน
                    />
                )}
                <br /> {/* เว้นบรรทัด */ }

                 {/* Input File สำหรับเลือกรูปใหม่ */}
                <label htmlFor="newPhotoFile" className="custom-file-upload-button"> {/* ใช้ Label เป็นปุ่ม */ }
                    เลือกรูปภาพใหม่ (Optional)
                </label>
                <input
                    type="file"
                    id="newPhotoFile" // id ต้องตรงกับ htmlFor ของ Label
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isSubmitting || loading}
                    style={{ display: 'none' }} // ซ่อน Input File ตัวจริง
                />
                {/* แสดงชื่อไฟล์ใหม่ที่เลือก (Optional) */ }
                {photoFile && <p className="selected-file-name">ไฟล์ใหม่ที่เลือก: {photoFile.name}</p>}

                {/* --- แสดง Preview รูปภาพใหม่ที่เลือก --- */}
                {newPhotoPreviewUrl && (
                    <img
                        src={newPhotoPreviewUrl}
                        alt="New Post Photo Preview"
                        className="image-preview" // ใช้ Class สำหรับ Style รูป Preview
                         style={{ marginTop: '15px', borderRadius: '8px' }} // ปรับ margin และขอบ
                    />
                )}
                {/* ------------------------------------------------- */}

            </div> {/* End post-photo-group */}


          {/* ปุ่ม บันทึกโพสต์ */}
          <button
             type="submit"
             disabled={isSubmitting || loading || !locationName} // ปุ่ม Disabled ถ้ากำลังโหลด/บันทึก หรือชื่อสถานที่เป็นค่าว่าง
             className="save-post-button" // ใช้ Class save-post-button
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกโพสต์'}
          </button>
        </form>

        </div> {/* สิ้นสุด .edit-post-box */}
      </div> {/* สิ้นสุด .full-screen-bg */}
    </>
  );
}

export default EditPost;