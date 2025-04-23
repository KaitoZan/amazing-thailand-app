// src/views/PhotoDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // นำเข้า Link เพิ่ม
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
// import CommentItem from '../components/CommentItem'; // ถ้าแยก Component Comment
// --- นำเข้าไฟล์ CSS ---
import '../css/PhotoDetailPage.css';
// ---------------------


const BASE_BACKEND_URL = 'https://amazing-thailand-server.vercel.app'; // <-- ใช้ URL จริงของคุณ

function PhotoDetailPage() {
  const { photoId } = useParams();
  const navigate = useNavigate();

  const { currentUser, isLoggedIn } = useAuth(); // ใช้ useAuth Hook

  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState(null);

  const [isDeleting, setIsDeleting] = useState(false); // สถานะกำลังลบโพสต์
  const [deleteError, setDeleteError] = useState(null); // Error ลบโพสต์

  // --- State สำหรับจัดการการแก้ไข Comment ---
  const [editingCommentId, setEditingCommentId] = useState(null); // เก็บ ID Comment ที่กำลังแก้ไข
  const [editedCommentText, setEditedCommentText] = useState(''); // เก็บข้อความ Comment ที่ถูกแก้ไข
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false); // สถานะกำลังส่งแก้ไข Comment
  const [editError, setEditError] = useState(null); // Error แก้ไข Comment
  // ---------------------------------------
  const handleGoBack = () => {
    navigate(-1); // กลับไปยังหน้าก่อนหน้าใน History Stack
    // หรือ navigate('/'); เพื่อกลับหน้าแรกเสมอ
  };

  // Effect เดิมสำหรับดึงรายละเอียดรูปภาพและ Comment
  useEffect(() => {
    const fetchPhotoDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${BASE_BACKEND_URL}/api/photos/${photoId}`);
        const photoData = response.data.data;
        setPhoto(photoData);
        // เมื่อโหลดข้อมูลโพสต์แล้ว อาจจะตั้งค่า State การแก้ไข Comment เป็นค่าเริ่มต้น (ถ้ามี)
        // setEditingCommentId(null);
        // setEditedCommentText('');

      } catch (err) {
        setError(err);
        console.error(`Failed to fetch photo details for ID ${photoId}:`, err);
        if (err.response && err.response.status === 404) {
             setError({ message: "ไม่พบรูปภาพนี้แล้ว" });
        }
      } finally {
        setLoading(false);
      }
    };

    if (photoId) {
        fetchPhotoDetails();
    }

  }, [photoId]); // Dependencies array

  // --- ตรวจสอบว่าเป็นเจ้าของโพสต์หรือไม่ ---
  // จะเป็น true ถ้า isLoggedIn และ currentUser.user_id ตรงกับ photo.user_id
  const isPhotoOwner = isLoggedIn && photo && currentUser && currentUser.user_id === photo.user_id;
  // ---------------------------------------


  // ฟังก์ชันจัดการเมื่อพิมพ์ Comment ใหม่
  const handleNewCommentChange = (event) => {
    setNewCommentText(event.target.value);
  };

  // ฟังก์ชันจัดการเมื่อ Submit Form Comment ใหม่
  const handleSubmitComment = async (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      alert('กรุณาเข้าสู่ระบบเพื่อแสดงความคิดเห็น');
      return;
    }

    if (!newCommentText.trim()) {
      alert('กรุณาพิมพ์ข้อความความคิดเห็น');
      return;
    }

    setIsSubmittingComment(true);
    setCommentError(null);

    try {
      const response = await axios.post(`${BASE_BACKEND_URL}/api/comments`, {
        photo_id: parseInt(photoId),
        user_id: currentUser.user_id, // ใช้ user_id จาก Context
        comment_text: newCommentText.trim(),
      });

      const newComment = response.data.data;

      // อัปเดตรายการ Comment ใน State โดยเพิ่ม Comment ใหม่
      setPhoto(prevPhoto => ({
        ...prevPhoto,
        comments: [...prevPhoto.comments, newComment],
      }));

      setNewCommentText(''); // ล้าง Form

    } catch (err) {
      setCommentError(err); console.error("Failed to create comment:", err);
      alert(`Failed to post comment: ${err.response?.data?.message || err.message}`);
    } finally { setIsSubmittingComment(false); }
  };


  const handleDeletePhoto = async () => {
    const isConfirmed = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?');
    if (!isConfirmed) { return; }
    setIsDeleting(true); setDeleteError(null);
    try {
      const response = await axios.delete(`${BASE_BACKEND_URL}/api/photos/${photoId}`);
      alert('โพสต์ถูกลบเรียบร้อยแล้ว'); navigate('/'); // Redirect ไปหน้าหลัก

    } catch (err) {
      setDeleteError(err); console.error("Failed to delete photo:", err);
       const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบโพสต์';
      alert(`Failed to delete photo: ${errorMessage}`);
    } finally { setIsDeleting(false); }
  };

  const handleEditPhoto = () => { navigate(`/editpost/${photoId}`); };


  const handleEditCommentClick = (comment) => {
    setEditingCommentId(comment.comment_id);
    setEditedCommentText(comment.comment_text);
    setEditError(null);
  };
  const handleCancelEditComment = () => {
    setEditingCommentId(null); setEditedCommentText('');
  };
  const handleSaveComment = async (commentId) => {
    if (!editedCommentText.trim()) { alert('กรุณาพิมพ์ข้อความความคิดเห็นที่แก้ไข'); return; }
    setIsSubmittingEdit(true); setEditError(null);
    try {
        const response = await axios.put(`${BASE_BACKEND_URL}/api/comments/${commentId}`, { comment_text: editedCommentText.trim(), });
        const updatedComment = response.data.data;
        setPhoto(prevPhoto => ({
            ...prevPhoto,
            comments: prevPhoto.comments.map(comment => comment.comment_id === commentId ? updatedComment : comment ),
        }));
        setEditingCommentId(null); setEditedCommentText('');
    } catch (err) {
        setEditError(err); console.error(`Failed to edit comment ${commentId}:`, err);
        const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการแก้ไขความคิดเห็น';
        alert(`Failed to edit comment: ${errorMessage}`);
    } finally { setIsSubmittingEdit(false); }
  };

  const handleDeleteComment = async (commentId) => {
    const isConfirmed = window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบความคิดเห็นนี้?');
    if (!isConfirmed) { return; }
    setEditError(null); // ใช้ Error State รวมกัน หรือสร้างแยกก็ได้
    try {
      const response = await axios.delete(`${BASE_BACKEND_URL}/api/comments/${commentId}`);
      alert('ความคิดเห็นถูกลบเรียบร้อยแล้ว');
      setPhoto(prevPhoto => ({ ...prevPhoto, comments: prevPhoto.comments.filter(comment => comment.comment_id !== commentId), }));
    } catch (err) {
        setEditError(err); console.error(`Failed to delete comment ${commentId}:`, err);
        const errorMessage = err.response?.data?.message || 'เกิดข้อผิดพลาดในการลบความคิดเห็น';
        alert(`Failed to delete comment: ${errorMessage}`);
    } finally { /* setIsDeletingComment(false); */ }
  };


  if (loading) { return <div>กำลังโหลดรายละเอียดรูปภาพ...</div>; }
  if (error) { return <div className="photo-detail-message error">เกิดข้อผิดพลาด: {error.message || 'ไม่สามารถดึงรายละเอียดรูปภาพได้'}</div>; }
  if (!photo) { return <div className="photo-detail-message">ไม่พบรูปภาพที่ระบุ</div>; }


  return (
    <div className="photo-detail-page">
      
    <div className="photo-detail-page-container">
      {/* AppBar ถูก Render ที่ App.jsx แล้ว */}
      <div className='back-button-container' style={{ marginTop: '15px', marginBottom: '0px', paddingLeft: '1030px', paddingRight: '20px' }}>
             <button onClick={handleGoBack} className="back-button" style={{ backgroundColor: '#007bff', color: 'black',transition: 'backgroundcolor 0.3s ease'}}> {/* ใช้ className back-button เพื่อ Style ปุ่ม */}
                ย้อนกลับ
            </button>
        </div>
        {/* h1 รายละเอียดรูปภาพ อาจจะอยู่เต็มความกว้างด้านบน */}
         {/* อาจปรับ Style h1 ใน CSS */ }
        
        {/* --- Container ใหม่สำหรับแบ่งเป็น 2 คอลัมน์ --- */}
        <div className="photo-and-comments-layout">
          
            {/* --- คอลัมน์ซ้าย: รูปภาพและรายละเอียด --- */}
            <div className="photo-info-section">
                {/* แสดงปุ่ม แก้ไข/ลบ โพสต์ ถ้าเป็นเจ้าของโพสต์ */}
                {isPhotoOwner && (
                    <div style={{ marginBottom: '15px' }}>
                        <button onClick={handleEditPhoto} disabled={isDeleting}>แก้ไขโพสต์</button>
                        {' '}
                        <button onClick={handleDeletePhoto} disabled={isDeleting}>
                            {isDeleting ? 'กำลังลบ...' : 'ลบโพสต์'}
                        </button>
                         {deleteError && <div className="photo-detail-message error" style={{ marginTop: '5px' }}>{deleteError.message || 'Error'}</div>}
                    </div>
                )}

                {/* แสดงรูปภาพขนาดใหญ่ - ใช้ className */}
                <img src={photo.image_url} alt={photo.location_name} className="photo-detail-image" />
                <h1 >รายละเอียดรูปภาพ</h1>
                
            
       
                {/* แสดงข้อมูลสถานที่และรายละเอียด - ใช้ className */}
                <h2 className="photo-detail-location">{photo.location_name}</h2>
                <p className="photo-detail-description">{photo.description}</p>
                {photo.user && <p className="photo-detail-user">โพสต์โดย: {photo.user.username}</p>}

                {/* เส้นคั่น อาจจะย้ายไปอยู่ในคอลัมน์ หรือใช้ gap แทน */}
                {/* <hr className="photo-detail-divider" /> */} {/* ย้าย หรือ ลบออก */}

            </div>
            {/* ------------------------------------------- */}

            {/* --- คอลัมน์ขวา: ส่วนแสดง Comment ทั้งหมด --- */}
            <div className="comments-section-container">
                {/* นำส่วนแสดง Comment ทั้งหมดมาไว้ที่นี่ */}
                {/* div.comments-section นี้รวม Comment List และ Add Comment Form อยู่แล้ว */}
                <div className="comments-section"> {/* ใช้ className เดิมสำหรับ Style เนื้อหา Comment */}

                    <h3>ความคิดเห็น ({photo.comments ? photo.comments.length : 0})</h3>
                    {editError && <div className="photo-detail-message error" style={{ marginBottom: '15px', fontSize: '14px' }}>เกิดข้อผิดพลาดในการจัดการความคิดเห็น: {editError.message || 'Unknown error'}</div>}

                    {photo.comments && photo.comments.length > 0 ? (
                        <ul className="comments-list"> {/* ใช้ className สำหรับ ul */}
                            {photo.comments.map(comment => (
                                <li key={comment.comment_id} className="comment-item"> {/* ใช้ className สำหรับ li แต่ละอัน */}
                                    {/* --- แสดง Form แก้ไข หรือ ข้อความ Comment ปกติ --- */}
                                    {editingCommentId === comment.comment_id ? (
                                        // ถ้า Comment นี้กำลังอยู่ในโหมดแก้ไข
                                        <div className="edit-comment-form"> {/* ใช้ className สำหรับ Form แก้ไข */}
                                            <textarea
                                                rows="2"
                                                cols="50"
                                                value={editedCommentText}
                                                onChange={(e) => setEditedCommentText(e.target.value)}
                                                disabled={isSubmittingEdit}
                                            ></textarea>
                                            <br />
                                            <button onClick={() => handleSaveComment(comment.comment_id)} disabled={isSubmittingEdit || !editedCommentText.trim()}>
                                                {isSubmittingEdit ? 'กำลังบันทึก...' : 'บันทึก'}
                                            </button>
                                            {' '}
                                            <button onClick={handleCancelEditComment} disabled={isSubmittingEdit}>ยกเลิก</button>
                                        </div>
                                    ) : (
                                        // แสดง Comment ปกติ
                                        <div>
                                            {/* ใช้ className สำหรับชื่อผู้ Comment และข้อความ */}
                                            <strong className="comment-author">{comment.user ? comment.user.username : 'ไม่ระบุผู้ใช้'}:</strong>
                                            <span className="comment-text">{comment.comment_text}</span> {/* ใช้ span เพื่อจัด Style ข้อความได้ง่ายขึ้น */}
                                            <div className="comment-meta"> {/* ใช้ div สำหรับ meta info */}
                                               ({new Date(comment.created_at).toLocaleDateString()})
                                            </div>


                                            {/* --- แสดงปุ่ม แก้ไข/ลบ Comment ถ้าเป็นเจ้าของ Comment และไม่ได้อยู่ในโหมดแก้ไข Comment อื่น --- */}
                                            {isLoggedIn && currentUser && currentUser.user_id === comment.user_id && !editingCommentId && (
                                                <div className="comment-actions"> {/* ใช้ className สำหรับกลุ่มปุ่ม */}
                                                    <button onClick={() => handleEditCommentClick(comment)} disabled={isSubmittingEdit}>แก้ไข</button>
                                                    {' '}
                                                    <button onClick={() => handleDeleteComment(comment.comment_id)} disabled={isSubmittingEdit}>ลบ</button>
                                                </div>
                                            )}
                                            {/* ------------------------------------------------------------------------------------ */}
                                        </div>
                                    )}
                                    {/* --------------------------------------------------------------- */}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>ยังไม่มีความคิดเห็น</p>
                    )}

                    {/* ส่วน Form สำหรับเพิ่ม Comment (แสดงเฉพาะเมื่อ isLoggedIn เป็น true) - ใช้ className */}
                    <div className="add-comment-form" style={{ marginTop: '20px' }}> {/* เพิ่ม margin-top เพื่อแยกจาก Comment List */}
                        {isLoggedIn ? (
                          <div>
                            <h4>เพิ่มความคิดเห็น</h4>
                            {commentError && <div className="photo-detail-message error" style={{ fontSize: '14px' }}>เกิดข้อผิดพลาดในการส่ง Comment: {commentError.message || 'Unknown error'}</div>}
                            <form onSubmit={handleSubmitComment}>
                              <textarea
                                rows="4"
                                cols="50"
                                placeholder="พิมพ์ความคิดเห็นของคุณที่นี่..."
                                value={newCommentText}
                                onChange={handleNewCommentChange}
                                disabled={isSubmittingComment || editingCommentId}
                              ></textarea>
                              <br />
                              <button type="submit" disabled={isSubmittingComment || !newCommentText.trim() || editingCommentId}>
                                {isSubmittingComment ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
                              </button>
                            </form>
                          </div>
                        ) : (
                          <div>
                            <p>กรุณา <Link to="/login">เข้าสู่ระบบ</Link> หรือ <Link to="/register">สมัครสมาชิก</Link> เพื่อแสดงความคิดเห็น</p>
                          </div>
                        )}
                    </div>

                </div> {/* สิ้นสุด div.comments-section */}
            </div>
            {/* ------------------------------------------- */}

        </div> {/* สิ้นสุด div.photo-and-comments-layout */}

        {/* เส้นคั่น อาจจะอยู่ตรงนี้ ถ้าต้องการคั่นเนื้อหาส่วนอื่นด้านล่าง */}
        {/* <hr className="photo-detail-divider" /> */}

    </div>
</div>
  );

}


export default PhotoDetailPage;