// src/views/EditProfile.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // นำเข้า useParams
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext'; // นำเข้า useAuth Hook
// อาจจะสร้างไฟล์ EditProfile.css สำหรับ Style หน้า Edit Profile
// import './EditProfile.css';

const BASE_BACKEND_URL = 'https://amazing-thailand-server.vercel.app'; // <-- ใช้ URL จริงของคุณ

function EditProfile() {
  // --- ใช้ useAuth Hook เพื่อตรวจสอบสิทธิ์และดึงข้อมูลผู้ใช้ที่ Login อยู่ ---
  const { currentUser, isLoggedIn, isLoading: isAuthLoading, login: updateAuthUser } = useAuth(); // เพิ่ม updateAuthUser
  // --------------------------------------------------------------------

  const { userId } = useParams(); // ดึง userId จาก URL Parameter
  const navigate = useNavigate();

  // --- State สำหรับเก็บค่าใน Form และข้อมูล Profile เดิม ---
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState(''); // สำหรับเปลี่ยน Password ใหม่
  const [profilePictureFile, setProfilePictureFile] = useState(null); // ไฟล์รูป Profile ใหม่
  const [currentProfilePictureUrl, setCurrentProfilePictureUrl] = useState(''); // URL รูป Profile ปัจจุบัน
  // ------------------------------------------------------

  // State สำหรับจัดการสถานะและข้อผิดพลาด/สำเร็จ
  const [loading, setLoading] = useState(true); // ตั้งต้นเป็น true เพราะต้องโหลดข้อมูลเก่าก่อน
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // สถานะกำลังส่งข้อมูล Form

  // --- Effect สำหรับดึงข้อมูล Profile เก่าและตรวจสอบสิทธิ์ ---
  useEffect(() => {
    console.log("useEffect in EditProfile running..."); // Log เมื่อ Effect ทำงาน
    console.log("isAuthLoading:", isAuthLoading);
    console.log("isLoggedIn:", isLoggedIn);
    console.log("currentUser:", currentUser);
    console.log("userId from URL:", userId);
    console.log("Parsed userId:", parseInt(userId));
    console.log("Are IDs matching?", currentUser && currentUser.user_id === parseInt(userId));


    const fetchProfileData = async () => {
      console.log("Attempting to fetch profile data..."); // Log ก่อน fetch
      // ... fetch logic ...
      try {
        setLoading(true); // เริ่มโหลดข้อมูล Profile
        setError(null);

        // *** สมมติว่า Backend มี Endpoint GET /api/users/:userId สำหรับดึงข้อมูลผู้ใช้ ***
        // (ถ้า Backend คุณยังไม่มี ต้องเพิ่ม Endpoint นี้ใน user.route และ controller ครับ)
        const response = await axios.get(`${BASE_BACKEND_URL}/api/users/${userId}`);
        const userData = response.data.data;
        console.log("Fetch successful, user data:", userData); // Log เมื่อ fetch สำเร็จ

        // **ตรวจสอบสิทธิ์: ผู้ใช้ที่ Login ต้องเป็นเจ้าของ Profile ที่ดึงมา**
        if (currentUser.user_id !== userData.user_id) { // <--- แก้ไขตรงนี้
            console.log("User ID from currentUser does not match fetched user ID."); // Log ถ้า ID ไม่ตรง
            alert('คุณไม่มีสิทธิ์แก้ไข Profile นี้'); // แจ้งเตือนว่าไม่ใช่เจ้าของ
            navigate('/'); // Redirect ออกไปหน้าหลัก
            return; // หยุดการทำงานต่อ
        }

        // ถ้าเป็นเจ้าของ ให้กำหนดค่าเก่าลงใน State ของ Form
        setUsername(userData.username);
        setEmail(userData.email);
        // ไม่ต้องกำหนด Password เก่าลงใน State
        setCurrentProfilePictureUrl(userData.profile_picture_url); // เก็บ URL รูปภาพเก่า

      } catch (err) {
        console.error("Failed to fetch user data:", err); // Log เมื่อ fetch ล้มเหลว
        setError(err);
        const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการดึงข้อมูล Profile';
        // alert(`Error: ${errorMessage}`); // ปิด alert ซ้ำซ้อน ถ้า Error Message ถูกแสดงที่อื่นแล้ว
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
        setLoading(false); // โหลดข้อมูล Profile เสร็จสิ้น
        console.log("Fetch process finished."); // Log เมื่อ fetch process เสร็จ
      }
    };


    // รอตรวจสอบ Auth เสร็จก่อน
    if (isAuthLoading) {
        console.log("Auth is still loading, returning.");
        return; // ไม่ทำอะไรถ้า Auth ยังโหลดอยู่
    }

    // ตรวจสอบว่า userId จาก URL เป็นตัวเลขที่ถูกต้องหรือไม่
    const parsedUserId = parseInt(userId);
    if (isNaN(parsedUserId)) {
       console.log("Invalid userId in URL (not a number). Redirecting."); // Log ถ้า userId ใน URL ไม่ถูกต้อง
       navigate('/'); // Redirect ถ้า userId ไม่ถูกต้อง
       return;
    }

    // ถ้าไม่ได้ Login หรือ ID ใน URL ไม่ตรงกับผู้ใช้ที่ Login ให้ Redirect
    // ตรวจสอบ currentUser?.user_id เพื่อป้องกัน Error ถ้า currentUser เป็น null/undefined
    if (!isLoggedIn || !currentUser || currentUser.user_id !== parsedUserId) {
        console.log("Auth check failed or IDs do not match. Redirecting.");
        alert('คุณไม่มีสิทธิ์แก้ไข Profile นี้'); // แจ้งเตือนผู้ใช้
        // Redirect ไปหน้าหลัก ถ้า Login อยู่ แต่ ID ไม่ตรง หรือ Redirect ไป Login ถ้าไม่ได้ Login
        navigate(isLoggedIn ? '/' : '/login');
        return; // หยุดการทำงานต่อ
    }

    // ถ้าทุกอย่างถูกต้อง และ userId ใน URL เป็นตัวเลขที่ถูกต้อง และตรงกับผู้ใช้ที่ Login
    console.log("Conditions met. Calling fetchProfileData()."); // Log ก่อนเรียก fetch function
    fetchProfileData(); // เรียก function fetch API


  }, [userId, isLoggedIn, currentUser, isAuthLoading, navigate, updateAuthUser]); // Dependencies Array


  // ถ้ายังโหลด Auth หรือข้อมูล Profile อยู่ ให้แสดง Loading
  if (isAuthLoading || loading) {
      return <div>กำลังโหลดข้อมูล Profile...</div>; // แสดง Loading ถ้า Auth หรือ Data โหลดอยู่
  }

   // หากมาถึงตรงนี้ แสดงว่าโหลดเสร็จ, Login แล้ว, และ user id ตรงกับ URL
   // ส่วนใหญ่ Logic Redirect จะจัดการไปแล้ว แต่มี Return นี้เผื่อไว้
   // สามารถ Return JSX ของ Form ได้เลย ถ้าแน่ใจว่า Code มาถึงตรงนี้ได้จากการผ่านเงื่อนไขทั้งหมด

  // --- ฟังก์ชันจัดการเมื่อเลือกไฟล์รูป Profile ใหม่ ---
  const handleFileChange = (event) => {
    setProfilePictureFile(event.target.files[0]); // เก็บไฟล์ใหม่ที่เลือก
    // อาจจะแสดง Preview รูปใหม่ที่นี่ด้วย
  };

  // --- ฟังก์ชันจัดการเมื่อ Form ถูก Submit ---
  const handleSubmit = async (event) => {
    event.preventDefault(); // ป้องกันการ Refresh หน้าเว็บ

    setError(null); // Clear error ก่อนลอง Submit ใหม่
    setSuccess(false); // Clear success message
    setIsSubmitting(true); // ตั้งสถานะกำลังส่ง Form

    try {
      // Backend API users (PUT) ต้องการ multipart/form-data ถ้ามีการส่งไฟล์รูปใหม่
      // Backend Controller editUser รับ username, email, password, profilePicture จาก Body
      const formData = new FormData();
      let isDataChanged = false; // Flag เพื่อตรวจสอบว่ามีการแก้ไขข้อมูลหรือไม่

      // เช็คว่าผู้ใช้แก้ไข Field ไหนบ้าง แล้วค่อย append เฉพาะ Field นั้นๆ
      // เปรียบเทียบกับค่าเดิมที่อยู่ใน State (ซึ่งโหลดมาจาก Profile เดิม)
      // ต้องแน่ใจว่าค่าเดิมใน State ถูกโหลดมาถูกต้องแล้ว
      // เปรียบเทียบ username
      if (username !== (currentUser?.username || '')) { // เทียบกับ currentUser หรือ ค่าว่าง
         formData.append('username', username);
         isDataChanged = true;
      }
      // เปรียบเทียบ email
      if (email !== (currentUser?.email || '')) { // เทียบกับ currentUser หรือ ค่าว่าง
         formData.append('email', email);
         isDataChanged = true;
      }
      // ส่ง password ใหม่ก็ต่อเมื่อผู้ใช้กรอก password ในฟอร์มเท่านั้น
      if (password) {
         formData.append('password', password);
         isDataChanged = true;
      }
      // เพิ่มไฟล์รูปภาพใหม่ ถ้าผู้ใช้เลือกไฟล์ใหม่
      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile); // ชื่อ field 'profilePicture' ต้องตรงกับที่ Backend ใช้ Multer
        isDataChanged = true;
      }

      // ถ้าไม่มีการเปลี่ยนแปลงข้อมูลอะไรเลย ไม่ต้องเรียก API
      if (!isDataChanged) {
           console.log("No data changed, skipping API call.");
           setSuccess(true); // ถือว่าสำเร็จ (ไม่ต้องบันทึกอะไร)
           setIsSubmitting(false);
           // อาจจะหน่วงเวลาแล้ว Redirect เลย
            setTimeout(() => {
               navigate(`/editprofile/${currentUser.user_id}`); // Redirect กลับหน้าเดิม หรือหน้าหลัก
            }, 1000);
           return;
      }


      // **สำคัญ:** Backend PUT /api/users/:userId ต้องมีการตรวจสอบสิทธิ์ว่าผู้ที่เรียก API เป็นเจ้าของ userId ใน Path Parameter!
      // เราส่ง Request ไปที่ userId ใน Path Parameter
      const response = await axios.put(`${BASE_BACKEND_URL}/api/users/${userId}`, formData, {
        // กำหนด Header ถ้ามีการส่งไฟล์ (Backend ที่รับ multipart/form-data ตลอด ก็ระบุ header นี้)
        headers: {
          'Content-Type': 'multipart/form-data', // อาจปรับเป็น application/json ถ้าแก้ไขแค่ข้อความและ Backend รองรับ
        },
      });

      // ถ้าแก้ไขสำเร็จ (Status 200 OK)
      // Backend API Edit User คืนค่า { message: ..., data: updatedUser }
      const updatedUserData = response.data.data;
      console.log("Profile update successful:", updatedUserData);

      // **สำคัญ:** อัปเดตข้อมูลผู้ใช้ใน Auth Context ด้วยข้อมูลใหม่ที่ได้จาก Backend
      // เพื่อให้ UI ส่วนอื่นๆ (เช่น AppBar) แสดงข้อมูลที่อัปเดต
      updateAuthUser(updatedUserData); // ใช้ฟังก์ชัน updateAuthUser ที่ได้จาก Context

      setSuccess(true); // ตั้งสถานะว่าสำเร็จ
      // อาจจะหน่วงเวลาแล้ว Redirect กลับไปหน้าหลัก หรือหน้า Profile View (ถ้ามี)
      // alert('แก้ไข Profile สำเร็จ!'); // แจ้งเตือน
      setTimeout(() => {
         navigate(`/editprofile/${currentUser.user_id}`); // Redirect กลับหน้าเดิม หรือหน้าหลัก
      }, 2000);


    } catch (err) {
      setError(err);
      console.error("Edit profile failed:", err);
      // จัดการ Error จาก Backend
      const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไข Profile';
      alert(`Failed to edit profile: ${errorMessage}`);
      // อาจจะพิจารณา Redirect ในกรณี Error บางประเภท เช่น 401, 403
    } finally {
      setIsSubmitting(false); // หยุดสถานะกำลังส่ง Form
    }
  };
  // -----------------------------------------


  return (
    <div className="edit-profile-page"> {/* Outer wrapper for the page */}
      {/* AppBar ถูก Render ที่ App.jsx แล้ว */}

      {/* ส่วนเนื้อหาหลัก Container */}
      {/* .edit-profile-page-container สามารถใช้ Style ร่วมกับหน้าอื่นๆ ได้ เช่น จัดกึ่งกลาง, ความกว้างสูงสุด */}
      {/* หรืออาจจะใช้ className ที่เป็น Global Style ที่ทำไว้ เช่น .container */}
      <div className="edit-profile-container"> {/* Container สำหรับเนื้อหา Form และข้อความ */}

        <h2>แก้ไข Profile</h2>
        {/* แสดงข้อผิดพลาด */}
        {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error.message}</div>}
        {/* แสดงข้อความสำเร็จ */}
        {success && <div style={{ color: 'green', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>แก้ไข Profile สำเร็จ! กำลังกลับหน้าหลัก...</div>}


        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

           {/* Input Username */}
          <div className="form-group"> {/* ใช้ className เดียวกับหน้า Login/Register/AddPost ได้ */}
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={isSubmitting || loading}
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
              disabled={isSubmitting || loading}
            />
          </div>
          {/* Input Password (สำหรับเปลี่ยน Password) */}
          <div className="form-group">
            <label htmlFor="password">เปลี่ยน Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="เว้นว่างไว้หากไม่ต้องการเปลี่ยน Password" // บอกผู้ใช้ว่าถ้าไม่เปลี่ยนให้เว้นว่าง
              disabled={isSubmitting || loading}
            />
          </div>
           {/* แสดงรูป Profile ปัจจุบัน และ Input สำหรับเลือกไฟล์รูป Profile ใหม่ */}
           <div className="form-group" style={{ textAlign: 'center' }}>
             <label>รูป Profile ปัจจุบัน:</label>
             {currentProfilePictureUrl && <img src={currentProfilePictureUrl} alt="Current Profile Picture" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '50%', marginTop: '10px', marginBottom: '10px' }} />}
             <br />
             <label htmlFor="profilePictureFile">เลือกรูป Profile ใหม่ (Optional):</label>
             <input
               type="file"
               id="profilePictureFile"
               accept="image/*"
               onChange={handleFileChange}
               disabled={isSubmitting || loading}
             />
             {/* แสดงชื่อไฟล์ใหม่ที่เลือก (Optional) */}
             {profilePictureFile && <p style={{ fontSize: '12px', marginTop: '5px' }}>ไฟล์ใหม่ที่เลือก: {profilePictureFile.name}</p>}
           </div>


          <button type="submit" disabled={isSubmitting || loading || !username || !email}>
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก Profile'}
          </button>
        </form>

      </div> 
    </div> 
  );
}

export default EditProfile;