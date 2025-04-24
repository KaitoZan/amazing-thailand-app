// src/views/EditProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // เพิ่ม Link และนำเข้า useParams
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
// --- นำเข้าไฟล์ CSS ที่สร้างใหม่ ---
import '../css/EditProfile.css';
// -------------------------------

const BASE_BACKEND_URL = 'https://amazing-thailand-server.vercel.app'; // <-- ใช้ URL จริงของคุณ

function EditProfile() {
  // --- ใช้ useAuth Hook เพื่อตรวจสอบสิทธิ์และดึงข้อมูลผู้ใช้ที่ Login อยู่ ---
  const { currentUser, isLoggedIn, isLoading: isAuthLoading, login: updateAuthUser } = useAuth();
  // --------------------------------------------------------------------

  const { userId } = useParams();
  const navigate = useNavigate();

  // --- State สำหรับเก็บค่าใน Form และข้อมูล Profile เดิม ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // สำหรับเปลี่ยน Password ใหม่
  const [profilePictureFile, setProfilePictureFile] = useState(null); // ไฟล์รูป Profile ใหม่
  const [currentProfilePictureUrl, setCurrentProfilePictureUrl] = useState(''); // URL รูป Profile ปัจจุบัน
  // --- เพิ่ม State สำหรับแสดง Preview รูปใหม่ ---
  const [newProfilePicturePreviewUrl, setNewProfilePicturePreviewUrl] = useState(null);
  // ------------------------------------------------------


  // State สำหรับจัดการสถานะและข้อผิดพลาด/สำเร็จ
  const [loading, setLoading] = useState(true); // ตั้งต้นเป็น true เพราะต้องโหลดข้อมูลเก่าก่อน
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  // --- Effect สำหรับดึงข้อมูล Profile เก่าและตรวจสอบสิทธิ์ ---
  useEffect(() => {
    console.log("useEffect in EditProfile running...");
    console.log("isAuthLoading:", isAuthLoading);
    console.log("isLoggedIn:", isLoggedIn);
    console.log("currentUser:", currentUser);
    console.log("userId from URL:", userId);


    const fetchProfileData = async (idToFetch) => { // รับ user id ที่ต้องการ fetch เป็น Parameter
      console.log("Attempting to fetch profile data for user ID:", idToFetch);
      try {
        setLoading(true);
        setError(null);

        // *** เรียก API ดึงข้อมูลผู้ใช้ตาม ID จาก URL ***
        const response = await axios.get(`${BASE_BACKEND_URL}/api/users/${idToFetch}`); // ใช้ idToFetch
        const userData = response.data.data;
        console.log("Fetch successful, user data:", userData);

        // **ตรวจสอบสิทธิ์: ผู้ใช้ที่ Login ต้องเป็นเจ้าของ Profile ที่ดึงมา**
        // การตรวจสอบนี้ควรทำหลังจากโหลด Auth และ fetch data แล้ว
        // แต่เรามี Logic Redirect ด้านล่างที่จัดการการตรวจสอบสิทธิ์เบื้องต้นแล้ว
        // ตรงนี้แค่กำหนดค่าเดิมลงใน State

        setUsername(userData.username || ''); // กำหนดค่าเดิม (ใช้ || '' เพื่อป้องกัน undefined)
        setEmail(userData.email || '');
        setCurrentProfilePictureUrl(userData.profile_picture_url || '');

      } catch (err) {
        console.error("Failed to fetch user data:", err);
        setError(err);
        const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล Profile';

        // จัดการ Redirect ตาม Error Status
        if (err.response && err.response.status === 404) {
            console.log("User not found (404). Redirecting.");
            navigate('/'); // Redirect ไปหน้าหลักถ้าไม่พบ User
        } else if (err.response && (err.response.status === 401 || err.response.status === 403)) {
            console.log("Authorization error (401/403). Redirecting to login.");
            navigate('/login'); // Redirect ไปหน้า Login ถ้าไม่มีสิทธิ์
        } else {
            // จัดการ Error อื่นๆ
            alert(`Error: ${errorMessage}`); // แสดง Alert สำหรับ Error อื่นๆ
            navigate('/'); // Redirect ไปหน้าหลักสำหรับ Error อื่นๆ
        }

      } finally {
        setLoading(false);
        console.log("Fetch process finished.");
      }
    };


    // Logic ตรวจสอบสิทธิ์และ Redirect
    if (!isAuthLoading) { // รอจนกว่า Auth จะโหลดเสร็จ
        const parsedUserId = parseInt(userId);

        if (isNaN(parsedUserId)) {
            console.log("Invalid userId in URL (not a number). Redirecting.");
            navigate('/');
            return; // หยุด Effect
        }

        // ตรวจสอบว่า Login แล้ว และ userId ใน URL ตรงกับผู้ใช้ที่ Login
        // ใช้ optional chaining ?. และ double equals == เพื่อเปรียบเทียบ string/number ได้ยืดหยุ่นขึ้น
        if (!isLoggedIn || currentUser?.user_id != parsedUserId) {
            console.log("Auth check failed or IDs do not match. Redirecting.");
            alert('คุณไม่มีสิทธิ์แก้ไข Profile นี้');
            navigate(isLoggedIn ? '/' : '/login'); // Redirect ไปหน้าหลัก หรือหน้า Login
            return; // หยุด Effect
        }

        // ถ้าผ่านการตรวจสอบทั้งหมด ให้เริ่มดึงข้อมูล Profile
        console.log("Auth check passed. Fetching profile data.");
        fetchProfileData(parsedUserId); // เรียก fetch function ด้วย parsed userId

    } // else: if isAuthLoading is true, Effect does nothing until it's false


  }, [userId, isLoggedIn, currentUser, isAuthLoading, navigate, updateAuthUser]); // Dependencies Array


  // --- แสดง Loading ขณะโหลด Auth หรือ ข้อมูล Profile ---
  if (isAuthLoading || loading) {
      return (
          <div className="full-screen-bg"> {/* ใช้ Style Background ขณะ Loading */}
             <div className="edit-profile-box" style={{ textAlign: 'center' }}> {/* ใช้ Style Box ขณะ Loading */ }
                <p>{isAuthLoading ? 'กำลังตรวจสอบสิทธิ์...' : 'กำลังโหลดข้อมูล Profile...'}</p>
                {/* อาจเพิ่ม Loading Spinner ตรงนี้ได้ */}
             </div>
          </div>
      );
  }
  // ----------------------------------------------------

  // --- ฟังก์ชันจัดการเมื่อเลือกไฟล์รูป Profile ใหม่ (เพิ่ม Preview) ---
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setProfilePictureFile(file); // เก็บไฟล์ใหม่

      // อ่านไฟล์เพื่อสร้าง URL สำหรับ Preview รูปใหม่
      const reader = new FileReader();
      reader.onloadend = () => {
         setNewProfilePicturePreviewUrl(reader.result); // เก็บ Data URL ไว้ใน State ใหม่
      };
      reader.readAsDataURL(file);

      console.log("Selected new file:", file);
    } else {
      setProfilePictureFile(null);
      setNewProfilePicturePreviewUrl(null); // ล้าง Preview URL
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

      // เปรียบเทียบค่าใน State (ซึ่งโหลดมาจาก Profile เดิม) กับค่าปัจจุบันใน Form
      // ต้องแน่ใจว่าค่าเดิมใน State ได้ถูกโหลดมาอย่างสมบูรณ์แล้ว ก่อนหน้านี้
      // ใช้ currentUser เป็นข้อมูลเปรียบเทียบเริ่มต้น ถ้า State ยังไม่โหลดค่าเดิม
      if (username !== (currentUser?.username || '')) {
         formData.append('username', username);
         isDataChanged = true;
      }
      if (email !== (currentUser?.email || '')) {
         formData.append('email', email);
         isDataChanged = true;
      }
      if (password) {
         formData.append('password', password);
         isDataChanged = true;
      }
      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile); // ชื่อ field ต้องตรงกับ Backend
        isDataChanged = true;
      }

      // ถ้าไม่มีการเปลี่ยนแปลงข้อมูลอะไรเลย
      if (!isDataChanged) {
           console.log("No data changed, skipping API call.");
           setSuccess(true); // ถือว่าสำเร็จ
           setIsSubmitting(false);
            setTimeout(() => {
               navigate('/'); // <--- เปลี่ยนตรงนี้เป็น '/'
            }, 1000);
           return;
      }


      // **สำคัญ:** Backend PUT /api/users/:userId ต้องมีการตรวจสอบสิทธิ์!
      const response = await axios.put(`${BASE_BACKEND_URL}/api/users/${userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // ใช้เสมอเมื่อมีโอกาสส่งไฟล์
        },
      });

      const updatedUserData = response.data.data;
      console.log("Profile update successful:", updatedUserData);

      // อัปเดตข้อมูลผู้ใช้ใน Auth Context
      updateAuthUser(updatedUserData);

      setSuccess(true);
      setTimeout(() => {
         navigate('/'); // <--- เปลี่ยนตรงนี้เป็น '/'
      }, 2000);


    } catch (err) {
      setError(err);
      console.error("Edit profile failed:", err);
      const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไข Profile';
      alert(`Failed to edit profile: ${errorMessage}`);
      // จัดการ Redirect ในกรณี Error บางประเภท (ตามที่คุณทำไว้ใน useEffect)
      // if (err.response && (err.response.status === 401 || err.response.status === 403)) { ... navigate('/login'); }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      {/* --- Div หลักที่มี Style Background เต็มจอ --- */}
      <div className="full-screen-bg">

            {/* ชื่อแอป/รูปภาพประกอบ ด้านนอกกล่อง ถ้าต้องการ */ }

        {/* --- กล่องสำหรับ Form แก้ไข Profile (ใช้ Class edit-profile-box) --- */}
        <div className="edit-profile-box">

            {/* ปุ่มย้อนกลับ (ถ้าต้องการ) */ }
            <button onClick={() => navigate(-1)} className="back-button top-left-button"> {/* ใช้ navigate(-1) หรือ Link */ }
                ย้อนกลับ
            </button>

          {/* หัวข้อหน้าแก้ไข Profile */}
          <h2 className="edit-profile-title">แก้ไข Profile</h2>

          {/* แสดงข้อผิดพลาด */}
          {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error.message}</div>}
          {/* แสดงข้อความสำเร็จ */}
          {success && <div style={{ color: 'green', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>แก้ไข Profile สำเร็จ!</div>}


          {/* --- Form สำหรับ แก้ไข Profile --- */}
          {/* ใช้ Style เดียวกับ Form ในหน้าอื่นๆ */ }
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

             {/* Input Username */}
            {/* ใช้ Class input-field แทน div.form-group และ Label */ }
            <input
              type="text"
              placeholder="Username" // ใช้ Placeholder
              id="username" // ยังคง id ไว้
              className="input-field" // ใช้ Class input-field
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isSubmitting || loading}
            />
            {/* Input Email */}
            {/* ใช้ Class input-field แทน div.form-group และ Label */ }
            <input
              type="email"
              placeholder="Email" // ใช้ Placeholder
              id="email" // ยังคง id ไว้
              className="input-field" // ใช้ Class input-field
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting || loading}
            />
            {/* Input Password (สำหรับเปลี่ยน Password) */}
            {/* ใช้ Class input-field แทน div.form-group และ Label */ }
            <input
              type="password"
              placeholder="เปลี่ยน Password (เว้นว่างหากไม่เปลี่ยน)" // ใช้ Placeholder
              id="password" // ยังคง id ไว้
              className="input-field" // ใช้ Class input-field
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting || loading}
            />

            {/* แสดงรูป Profile ปัจจุบัน และ Input สำหรับเลือกไฟล์รูป Profile ใหม่ (ปรับ Style) */}
            {/* ใช้ Class profile-picture-group และ Class สำหรับรูป/Label/input */ }
            <div className="profile-picture-group"> {/* Grouping div for styling */}
                <label style={{ marginBottom: '10px' }}>รูป Profile ปัจจุบัน:</label>
                {/* แสดงรูป Profile ปัจจุบัน โดยใช้ currentProfilePictureUrl */}
                {currentProfilePictureUrl ? (
                    <img
                        src={currentProfilePictureUrl}
                        alt="Current Profile Picture"
                        className="current-profile-picture" // ใช้ Class สำหรับ Style รูปปัจจุบัน
                    />
                ) : (
                    // แสดงรูป Default ถ้าไม่มีรูป Profile ปัจจุบัน
                    <img
                        src="/path/to/default/profile.png" // <-- ใส่ Path ไปยังรูป Default ของคุณที่นี่
                        alt="Default Profile Picture"
                        className="current-profile-picture"
                    />
                )}

                <br /> {/* เว้นบรรทัด */}
                <label htmlFor="profilePictureFile" className="custom-file-upload-button"> {/* ใช้ Label เป็นปุ่ม */}
                    เลือกรูป Profile ใหม่ (Optional)
                </label>
                <input
                    type="file"
                    id="profilePictureFile" // id ต้องตรงกับ htmlFor ของ Label
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isSubmitting || loading}
                />
                {/* แสดงชื่อไฟล์ใหม่ที่เลือก (Optional) */}
                {profilePictureFile && <p className="selected-file-name">ไฟล์ใหม่ที่เลือก: {profilePictureFile.name}</p>}

                {/* --- แสดง Preview รูป Profile ใหม่ที่เลือก --- */}
                {newProfilePicturePreviewUrl && (
                    <img
                        src={newProfilePicturePreviewUrl}
                        alt="New Profile Picture Preview"
                        className="image-preview" // ใช้ Class สำหรับ Style รูป Preview (อาจใช้ Style เดียวกับ AddPost หรือสร้างใหม่)
                         style={{ marginTop: '15px', borderRadius: '8px' }} // ปรับ margin และขอบ
                    />
                )}
                {/* ------------------------------------------------- */}

            </div> {/* End profile-picture-group */}


          {/* ปุ่ม บันทึก Profile */}
          <button
             type="submit"
             disabled={isSubmitting || loading || !username || !email}
             className="save-profile-button" // ใช้ Class save-profile-button
            >
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก Profile'}
          </button>
        </form>

        </div> {/* สิ้นสุด .edit-profile-box */}
      </div> {/* สิ้นสุด .full-screen-bg */}
    </>
  );
}

export default EditProfile;