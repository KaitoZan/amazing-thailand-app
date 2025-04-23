// src/views/AddPost.jsx (Updated to show image preview)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../css/AddPost.css'; // Import ไฟล์ CSS

const BASE_BACKEND_URL = 'https://amazing-thailand-server.vercel.app'; // <-- ใช้ URL จริงของคุณ

function AddPost() {
    const { currentUser, isLoggedIn, isLoading } = useAuth();
    const navigate = useNavigate();

    const [locationName, setLocationName] = useState('');
    const [description, setDescription] = useState('');
    const [photoFile, setPhotoFile] = useState(null);
    const [selectedFileName, setSelectedFileName] = useState('');
    // --- เพิ่ม State สำหรับ URL รูปภาพที่จะแสดง Preview ---
    const [previewImageUrl, setPreviewImageUrl] = useState(null);
    // ------------------------------------------------------

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!isLoading && !isLoggedIn) {
            alert('กรุณาเข้าสู่ระบบเพื่อเพิ่มโพสต์รูปภาพ');
            navigate('/login');
        }
    }, [isLoggedIn, isLoading, navigate]);

    if (isLoading || !isLoggedIn) {
        return (
            <div className="full-screen-bg">
                <div className="add-post-box" style={{ textAlign: 'center' }}>
                    <p>กำลังตรวจสอบสิทธิ์...</p>
                </div>
            </div>
        );
    }

    const handleGoBack = () => {
        navigate(-1);
    };

    // --- Handler สำหรับการเลือกไฟล์รูปภาพ (เพิ่มส่วน Preview) ---
    const handleFileChange = (event) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setPhotoFile(file);
            setSelectedFileName(file.name);

            // --- อ่านไฟล์เพื่อสร้าง URL สำหรับ Preview ---
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImageUrl(reader.result); // เก็บ Data URL ไว้ใน State
            };
            reader.readAsDataURL(file); // อ่านไฟล์เป็น Data URL
            // ------------------------------------------

            console.log("Selected file:", file);
        } else {
            setPhotoFile(null);
            setSelectedFileName('');
            setPreviewImageUrl(null); // ล้าง Preview Image URL ด้วย
            console.log("No file selected.");
        }
    };
    // ---------------------------------------------------------


    const handleSubmit = async (event) => {
        event.preventDefault();

        setError(null);
        setSuccess(false);

        if (!locationName || !photoFile) {
            setError({ message: 'กรุณากรอกชื่อสถานที่และเลือกรูปภาพ' });
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('location_name', locationName);
        if (description) {
            formData.append('description', description);
        }
        formData.append('user_id', currentUser.user_id);
        formData.append('photoImage', photoFile); // ตรวจสอบชื่อ field นี้กับ Backend Multer อีกครั้ง

        try {
            const response = await axios.post(`${BASE_BACKEND_URL}/api/photos`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess(true);
            // Redirect ไปหน้าหลักหลังจากสำเร็จ
            setTimeout(() => {
                navigate('/');
            }, 2000);


        } catch (err) {
            console.error("Add post failed:", err);
            const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการเพิ่มโพสต์';
            setError({ message: errorMessage });
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            <div className="full-screen-bg">

                {/* ชื่อแอป/รูปภาพประกอบ ด้านนอกกล่อง ถ้าต้องการ */ }

                <div className="add-post-box">

                    {/* ปุ่มย้อนกลับ (ถ้าต้องการ) */ }
                    <button onClick={handleGoBack} className="back-button top-left-button">
                        ย้อนกลับ
                    </button>

                    <h2 className="add-post-title">เพิ่มโพสต์รูปภาพใหม่</h2>

                    {error && <div style={{ color: 'red', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>{error.message}</div>}
                    {success && <div style={{ color: 'green', marginBottom: '15px', textAlign: 'center', fontSize: '14px' }}>เพิ่มโพสต์รูปภาพสำเร็จ! กำลังกลับหน้าหลัก...</div>}


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
                            disabled={loading}
                        />
                        {/* Input รายละเอียด (ใช้ textarea) */}
                        <textarea
                            placeholder="รายละเอียด (Optional)"
                            id="description"
                            rows="4"
                            className="input-field"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                        ></textarea>

                        {/* --- Input รูปภาพ + Preview --- */}
                        <div style={{ marginTop: '15px', marginBottom: '15px', color: '#fff', width: '100%' }}>
                            <label htmlFor="photoFile" style={{ display: 'block', marginBottom: '5px', cursor: 'pointer' }}>
                                เลือกรูปภาพ:
                            </label>
                            <input
                                type="file"
                                id="photoFile"
                                accept="image/*"
                                onChange={handleFileChange}
                                required
                                disabled={loading}
                                style={{ display: 'none' }} // ซ่อน Input File ตัวจริง
                            />
                             {/* แสดงชื่อไฟล์ที่เลือก */ }
                            {selectedFileName && <div style={{ fontSize: '12px', marginBottom: '10px' }}>ไฟล์ที่เลือก: {selectedFileName}</div>}

                            {/* --- แสดง Preview รูปภาพที่เลือก --- */}
                            {previewImageUrl && (
                                <img
                                    src={previewImageUrl}
                                    alt="Image preview"
                                    className="image-preview" // ใช้ Class เพื่อจัด Style รูป Preview
                                />
                            )}
                            {/* ----------------------------------- */}
                        </div>
                        {/* ------------------------------------- */}


                        {/* ปุ่ม เพิ่มโพสต์ */}
                        <button
                            type="submit"
                            disabled={loading || !photoFile || !locationName}
                            className="add-post-button"
                        >
                            {loading ? 'กำลังเพิ่มโพสต์...' : 'เพิ่มโพสต์'}
                        </button>
                    </form>

                </div> {/* สิ้นสุด .add-post-box */}
            </div> {/* สิ้นสุด .full-screen-bg */}
        </>
    );
}

export default AddPost;