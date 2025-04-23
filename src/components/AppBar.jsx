// AppBar.jsx
import React, { useState } from "react";
import "../css/AppBar.css";
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import Popper from '@mui/material/Popper';
// --- นำเข้า useAuth และ Link/useNavigate ---
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom'; // นำเข้า Link และ useNavigate
// ------------------------------------------


export default function AppBar({ searchTerm, onSearchChange, setStartDate, setEndDate }) {
  const { currentUser, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate(); // Hook สำหรับ Redirect หลังจาก Logout (ถ้าต้องการ)

  // State สำหรับ Menu วันที่
  const [dateAnchorEl, setDateAnchorEl] = useState(null);
  const openDateMenu = Boolean(dateAnchorEl);
  const handleClickDate = (event) => { setDateAnchorEl(event.currentTarget); };
  const handleCloseDate = () => { setDateAnchorEl(null); };

  // Logic เลือกช่วงวันที่
  const handleSelectDate = (dateRangeKey) => {
    // ... (โค้ดเดิม)
    let start = null; let end = null; const now = dayjs();
    switch (dateRangeKey) {
        case 'all': start = null; end = null; break;
        case 'today': start = now.startOf('day'); end = now.endOf('day'); break;
        case 'yesterday': start = now.subtract(1, 'day').startOf('day'); end = now.subtract(1, 'day').endOf('day'); break;
        case 'last_week': start = now.subtract(1, 'week').startOf('week'); end = now.subtract(1, 'week').endOf('week'); break;
        case 'last_month': start = now.subtract(1, 'month').startOf('month'); end = now.subtract(1, 'month').endOf('month'); break;
        case 'last_year': start = now.subtract(1, 'year').startOf('year'); end = now.subtract(1, 'year').endOf('year'); break;
        default: start = null; end = null; break;
    }
    setStartDate(start);
    setEndDate(end);
    console.log('Selected Date Range (Dropdown):', dateRangeKey, '-> Start:', start ? start.format('YYYY-MM-DD') : null, 'End:', end ? end.format('YYYY-MM-DD') : null);
    handleCloseDate();
  };

  // Logic Date Picker
  const handleStartDateChange = (newValue) => { setStartDate(newValue); console.log('Start Date (Picker):', newValue ? newValue.format('YYYY-MM-DD') : null); };
  const handleEndDateChange = (newValue) => { setEndDate(newValue); console.log('End Date (Picker):', newValue ? newValue.format('YYYY-MM-DD') : null); };

  // State และ Handler สำหรับ Popper ยืนยัน Logout
  const [logoutPopperOpen, setLogoutPopperOpen] = useState(false);
  const [logoutAnchorEl, setLogoutAnchorEl] = useState(null);
  const handleLogoutClick = (event) => {
    setLogoutPopperOpen((previousOpen) => !previousOpen);
    setLogoutAnchorEl(event.currentTarget);
  };
  const handleCancelLogout = () => { setLogoutPopperOpen(false); };
  const handleConfirmLogout = () => {
    logout(); // เรียกฟังก์ชัน logout จาก Auth Context
    setLogoutPopperOpen(false); // ปิด Popper
    navigate('/'); // Redirect ไปหน้าหลัก หรือหน้า Login
  };
  const logoutPopperId = logoutPopperOpen ? 'logout-confirm-popper' : undefined;


  return (
    <div className="appbar">
      {/* Logo หรือ ชื่อแอป - ทำเป็น Link กลับหน้าแรก */}
      <Link to="/" className="appbar-left" style={{ textDecoration: 'none', color: 'inherit' }}>
          Amazing Thailand
      </Link>
      <div className="appbar-right">

        {/* ส่วน Filter วันที่ - อาจจะซ่อนถ้าไม่ได้อยู่หน้า Home */}
        {/* Box นี้ต้องรับ props searchTerm, onSearchChange, setStartDate, setEndDate มาจาก Parent */}
        <Box>
          <Button
            onClick={handleClickDate}
            endIcon={<ExpandMoreIcon />}
            disableRipple
            sx={{ color: 'gray' ,backgroundColor: 'white'}}
          >
            วันที่
          </Button>
          {/* Menu วันที่ */}
          <Menu anchorEl={dateAnchorEl} open={openDateMenu} onClose={handleCloseDate} MenuListProps={{ 'aria-labelledby': 'date-filter-button' }} >
             <MenuItem onClick={() => handleSelectDate('all')}>ทั้งหมด</MenuItem>
             <MenuItem onClick={() => handleSelectDate('today')}>วันนี้</MenuItem>
             <MenuItem onClick={() => handleSelectDate('yesterday')}>เมื่อวาน</MenuItem>
             <MenuItem onClick={() => handleSelectDate('last_week')}>อาทิตย์ที่แล้ว</MenuItem>
             <MenuItem onClick={() => handleSelectDate('last_month')}>เดือนที่แล้ว</MenuItem>
             <MenuItem onClick={() => handleSelectDate('last_year')}>ปีที่แล้ว</MenuItem>
          </Menu>
        </Box>

        {/* Date Pickers - อาจจะซ่อนถ้าไม่ได้อยู่หน้า Home */}
        {/* Box นี้ต้องรับ props setStartDate, setEndDate มาจาก Parent */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <DatePicker label="วันที่เริ่มต้น" onChange={handleStartDateChange} slotProps={{ textField: { size: 'small', sx: { width: 150, backgroundColor: 'white', borderRadius: '4px', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.3)' }, '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.6)' }, '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' }, '& .MuiInputBase-input': { color: '#000' }, '& .MuiInputLabel-root': { color: 'rgba(0, 0, 0, 0.6)' }, '& .MuiInputAdornment-root': { color: 'rgba(0, 0, 0, 0.54)' } } } }} />
          <DatePicker label="วันที่สิ้นสุด" onChange={handleEndDateChange} slotProps={{ textField: { size: 'small', sx: { width: 150, backgroundColor: 'white', borderRadius: '4px', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.3)' }, '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(0, 0, 0, 0.6)' }, '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: 'black' }, '& .MuiInputBase-input': { color: '#000' }, '& .MuiInputLabel-root': { color: 'rgba(0, 0, 0, 0.6)' }, '& .MuiInputAdornment-root': { color: 'rgba(0, 0, 0, 0.54)' } } } }} />
        </Box>

        {/* Search Input - อาจจะซ่อนถ้าไม่ได้อยู่หน้า Home */}
        {/* Input นี้ต้องรับ props searchTerm, onSearchChange มาจาก Parent */}
        <input type="text" placeholder="Search..." className="search-input" value={searchTerm} onChange={onSearchChange} />


        {/* --- ส่วนแสดงผลตามสถานะ Login/Logout --- */}
        {isLoggedIn ? (
          // ถ้า Login อยู่
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* Link ไปหน้าเพิ่มโพสต์ */}
            <Link to="/addpost" className="appbar-button" style={{ textDecoration: 'none' }}>เพิ่มโพสต์</Link>

            {/* แสดงชื่อผู้ใช้ (ทำเป็น Link ไปหน้า Profile) */}
            {/* ต้องตรวจสอบว่า currentUser และ user_id มีค่าก่อนสร้าง Link */}
            {currentUser?.user_id && (
                <Link to={`/editprofile/${currentUser.user_id}`} style={{ textDecoration: 'none', color: 'white' }}>
                  <Typography variant="body1" sx={{ color: 'white' }}>
                    สวัสดี, {currentUser.username || 'สมาชิก'}
                  </Typography>
                </Link>
            )}

            {/* ปุ่ม Logout - ใช้ onClick เปิด Popper ยืนยัน */}
            <button
              className="appbarlogin-button" // ใช้ Style เดิมของปุ่ม Login
              aria-describedby={logoutPopperId}
              onClick={handleLogoutClick} // เรียก Handler เพื่อเปิด Popper Logout
            >
              Logout
            </button>

          </Box>
        ) : (
          // ถ้ายังไม่ได้ Login
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {/* ปุ่ม Login - ใช้ Link ไปหน้า Login */}
            <Link to="/login" className="appbarlogin-button" style={{ textDecoration: 'none' }}>เข้าสู่ระบบ</Link>
            {/* ปุ่ม Register - ใช้ Link ไปหน้า Register */}
            <Link to="/register" className="appbarlogin-button" style={{ textDecoration: 'none' }}>สมัครสมาชิก</Link> {/* ใช้ Style เดียวกันหรือสร้างใหม่ */}
          </Box>
        )}
        {/* --------------------------------------------- */}

      </div>

      {/* Component Popper (สำหรับยืนยัน Logout) - อยู่ใน AppBar แต่ต้องอยู่นอก div.appbar */}
      <Popper
        id={logoutPopperId}
        open={logoutPopperOpen}
        anchorEl={logoutAnchorEl}
        placement="bottom"
        disablePortal={false}
        modifiers={[
          { name: 'flip', enabled: true, options: { altBoundary: true, rootBoundary: 'document', padding: 8 } },
          { name: 'preventOverflow', enabled: true, options: { altAxis: false, altBoundary: false, tether: false, rootBoundary: 'document', padding: 8 } },
          { name: 'arrow', enabled: false, options: { element: undefined } },
        ]}
      >
        {/* ใช้ Button จาก MUI ใน Popper */}
        <Box sx={{ border: '1px solid grey', p: 1, bgcolor: 'background.paper', mt: 1 ,color: 'black' ,borderRadius: '15px' ,fontFamily: 'Charmonman', }}>
          <Typography variant="subtitle1" component="h6" gutterBottom sx={{ fontFamily: 'Charmonman' }}>
            ยืนยันที่จะออกจากระบบใหม?
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: ' center', gap: 1 }}>
            <Button size="small" onClick={handleCancelLogout}> ยกเลิก </Button>
            <Button size="small" onClick={handleConfirmLogout}> ตกลง </Button>
          </Box>
        </Box>
      </Popper>

    </div>
  );
}