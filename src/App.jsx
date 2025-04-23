// App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';

// --- นำเข้า AppBar Component ---
import AppBar from './components/AppBar';
// -----------------------------

import Login from './views/Login.jsx';
import Register from './views/Register.jsx';
import Home from './views/Home.jsx';
import EditProfile from './views/EditProfile.jsx';
import AddPost from './views/AddPost.jsx';
import EditPost from './views/EditPost.jsx';
import PhotoDetailPage from './components/PhotoDetailPage.jsx';


function App() {
  return (
    // BrowserRouter ถูกย้ายไปอยู่ใน main.jsx แล้ว
    <div> {/* ใช้ div เป็น Container หลัก */}
      {/* --- แสดง AppBar เหนือ Routes --- */}
      {/*AppBar ต้องรับ props ที่จำเป็นสำหรับ Search/Date Filter ถ้ายังใช้งานอยู่ */}
      {/* ในที่นี้จะส่ง props เปล่าไปก่อน คุณอาจจะต้องส่ง props ที่ถูกต้องมาจาก Component หลักที่ครอบ App*/}
      {/* หรือย้าย State searchTerm, startDate, endDate ไปไว้ใน Component ที่ครอบ App.jsx ถ้า AppBar อยู่ใน Layout นี้จริงๆ */}
      {/* หรือให้ Home Page จัดการ State เหล่านี้ แล้วส่ง Setter มาให้ AppBar ผ่าน props */}
      <AppBar searchTerm="" onSearchChange={() => {}} setStartDate={() => {}} setEndDate={() => {}} />
      {/* ------------------------------ */}

      {/* Routes จะกำหนดว่า Component ไหนจะแสดงตาม Path */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/photos/:photoId" element={<PhotoDetailPage />} />
        <Route path="/addpost" element={<AddPost />} />
        <Route path="/editpost/:photoId" element={<EditPost />} />
        <Route path="/editprofile/:userId" element={<EditProfile />} />
      </Routes>

      {/* อาจจะเพิ่ม Footer ที่นี่ในอนาคต */}
    </div>
  );
}

export default App;