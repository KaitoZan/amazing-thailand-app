// src/components/PhotoCard.js
import React from 'react';
import { Link } from 'react-router-dom'; // ต้องใช้ Link จาก react-router-dom สำหรับการคลิกไปหน้ารายละเอียด

// อาจจะสร้างไฟล์ PhotoCard.css สำหรับ Style เฉพาะ Component นี้
import '../css/PhotoCard.css';

function PhotoCard({ photo }) {
  // Photo object ที่รับมาจะมีโครงสร้างประมาณนี้:
  // { photo_id: ..., location_name: ..., image_url: ..., description: ..., user_id: ..., user: { user_id: ..., username: ... } }

  return (
    // <Link> จะทำให้ทั้ง Card คลิกได้ และนำไปยัง URL ของหน้ารายละเอียดรูปภาพ
    // เราจะสร้าง Route สำหรับหน้ารายละเอียดทีหลัง ในที่นี้สมมติว่าเป็น /photos/:photoId
    <Link to={`/photos/${photo.photo_id}`} className="photo-card-link">
      <div className="photo-card">
        <img
          src={photo.image_url}
          alt={photo.location_name}
          className="photo-card-image"
        />
        <div className="photo-card-info">
          {/* แสดงชื่อสถานที่ */}
          <h3 className="photo-card-location">{photo.location_name}</h3>
          {/* แสดงชื่อผู้โพสต์ (ตรวจสอบว่ามีข้อมูล user ไหมก่อนแสดง) */}
          {photo.user && (
            <p className="photo-card-user">โดย: {photo.user.username}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

export default PhotoCard;