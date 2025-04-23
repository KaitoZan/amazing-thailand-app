// src/views/Home.jsx
import React, { useEffect, useState } from 'react';
import AppBar from '../components/AppBar'; // นำเข้า AppBar
import axios from 'axios';
import PhotoCard from '../components/PhotoCard'; // นำเข้า PhotoCard
// --- ตรวจสอบ Import Path ของ CSS อีกครั้ง ---
import '../css/Home.css';
// ถ้าไฟล์ CSS อยู่ใน src/views/ :
// import './Home.css';
// -------------------------------------
import dayjs from 'dayjs'; // นำเข้า dayjs เพื่อใช้ format วันที่

const BASE_BACKEND_URL = 'https://amazing-thailand-server.vercel.app'; // <-- ใช้ URL จริงของคุณ

function Home() {
  // --- State สำหรับเก็บข้อมูลรูปภาพและสถานะการโหลด/ข้อผิดพลาด ---
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // ------------------------------------------------------------

  // --- State สำหรับเก็บค่าจาก Search Bar และ Date Pickers ---
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState(null); // dayjs object หรือ null
  const [endDate, setEndDate] = useState(null); // dayjs object หรือ null
  // ---------------------------------------------------------

  // --- Effect สำหรับ Fetch รูปภาพจาก Backend พร้อม Parameter การค้นหา/กรอง ---
  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      setError(null);

      try {
        const params = {}; // Object สำหรับเก็บ Query Parameter ที่จะส่งไป Backend
        
        // เพิ่ม parameter 'search' ถ้ามี searchTerm
        if (searchTerm) {
          params.search = searchTerm;
        }
        // เพิ่ม parameter 'startDate' ถ้ามี startDate และ format เป็น YYYY-MM-DD
        // ตรวจสอบว่าเป็น object dayjs ก่อนเรียก format
        if (startDate && dayjs.isDayjs(startDate)) {
          params.startDate = startDate.format('YYYY-MM-DD');
        }
        // เพิ่ม parameter 'endDate' ถ้ามี endDate และ format เป็น YYYY-MM-DD
        // ตรวจสอบว่าเป็น object dayjs ก่อนเรียก format
        if (endDate && dayjs.isDayjs(endDate)) {
           params.endDate = endDate.format('YYYY-MM-DD');
        }

         console.log("Fetching photos with params:", params); // Log Parameters ที่ส่งไป Backend


        // เรียก API GET /api/photos พร้อมส่ง parameters ไป
        const response = await axios.get(`${BASE_BACKEND_URL}/api/photos`, {
          params: params // ส่ง parameters ไปกับ request GET
        });

        // กำหนดข้อมูลรูปภาพที่ได้จาก Backend ลงใน State
        setPhotos(response.data.data);
         console.log("Fetched photos:", response.data.data); // Log ข้อมูลที่ได้กลับมา

      } catch (err) {
        setError(err);
        console.error("Failed to fetch photos:", err.response?.data || err.message); // Log รายละเอียด Error

      } finally {
        setLoading(false); // ตั้งสถานะโหลดเสร็จ
      }
    };

    // เรียก fetchPhotos เมื่อ searchTerm, startDate, หรือ endDate เปลี่ยน
    // นี่คือการ Trigger ให้ Fetch ข้อมูลใหม่จาก Backend ทุกครั้งที่มีการค้นหา/กรอง
    fetchPhotos();
  }, [searchTerm, startDate, endDate]); // Dependencies array

  // --- Handler สำหรับการเปลี่ยนแปลงในช่องค้นหา ---
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value); // อัปเดต State searchTerm
  };
  // ---------------------------------------------

   // ไม่ต้องทำ Frontend Filtering ตรงนี้ เพราะคาดหวังว่า Backend จะกรองมาให้แล้ว

  return (
    <div>
      {/* Render AppBar และส่ง props ที่จำเป็นสำหรับ Search/Date Filter */}
      <AppBar
        searchTerm={searchTerm}
        onSearchChange={handleSearchChange}
        setStartDate={setStartDate} // ส่ง setter function ไปให้ AppBar เพื่ออัปเดต startDate
        setEndDate={setEndDate} // ส่ง setter function ไปให้ AppBar เพื่ออัปเดต endDate
      />

      {/* Container หลักสำหรับเนื้อหาด้านล่าง AppBar */}
      {/* ใช้ className "container" หรือ className อื่นๆ ที่คุณกำหนดใน Home.css */}
      {/* และกำหนด padding-top ใน CSS class นี้ เพื่อเว้นระยะจาก AppBar */}
      <div className="container" /* ลบ style={{ paddingTop: '80px' }} ออก */ >
        {/* สามารถเพิ่ม h1 "รูปภาพสถานที่ท่องเที่ยว Amazing Thailand 2025" ตรงนี้ได้ ถ้าต้องการ */}
        {/* หรือใส่ไว้ใน AppBar หรือ Component อื่นๆ ตาม Layout ที่ต้องการ */}

        {/* แสดงข้อความ Loading */}
        {loading && <div>กำลังโหลดรูปภาพ...</div>}

        {/* แสดงข้อความ Error */}
        {error && <div>เกิดข้อผิดพลาดในการดึงรูปภาพ: {error.message || 'Unknown error'}</div>}

        {/* --- แสดงข้อความเมื่อไม่พบรูปภาพ (หลังจากโหลดเสร็จ ไม่มี error และ photos array ว่าง) --- */}
        {!loading && !error && photos.length === 0 && (
            // ตรวจสอบว่ามีการค้นหา หรือ กรองวันที่อยู่หรือไม่
            searchTerm || (startDate && dayjs.isDayjs(startDate)) || (endDate && dayjs.isDayjs(endDate)) ? (
                // ถ้ามีเงื่อนไขการค้นหา/กรองอยู่ --> แสดงว่าไม่พบรูปที่ตรงกับเงื่อนไข
                <div>ไม่พบรูปภาพที่ตรงกับคำค้นหาหรือเงื่อนไขที่ระบุ</div>
            ) : (
                // ถ้าไม่มีเงื่อนไขการค้นหา/กรองเลย --> แสดงว่าไม่พบรูปภาพในระบบทั้งหมด
                <div>ไม่พบรูปภาพในระบบ</div>
            )
        )}
        {/* ---------------------------------------------------------------------------- */}


         {/* แสดง Photo List Gallery เมื่อมีรูปภาพ (โหลดเสร็จ ไม่มี error และ photos array ไม่ว่าง) */}
        {!loading && !error && photos.length > 0 && (
             <div className="photo-list-gallery"> {/* ใช้ className นี้สำหรับจัด Layout Grid */}
              {/* Map ข้อมูลรูปภาพที่ได้จาก Backend เพื่อแสดง PhotoCard */}
              {photos.map(photo => (
                <PhotoCard key={photo.photo_id} photo={photo} />
              ))}
           </div>
        )}

      </div> {/* สิ้นสุด div.container หรือ div.home-content-container */}
    </div> // สิ้นสุด div root element ของ Component
  );
}

export default Home;