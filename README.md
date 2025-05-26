* Đăng ký tham gia
  + APP
    + khi đăng ký thông tin (masv, tên sv, lớp) -> submit
    + Đủ số lượng tối đa sv đăng ký, thì mờ thong báo đó, 1 cái bookmark -> Đủ số lượng
   
  + WEB 
    + Mục DS đăng ký hiện tt sv và ngày giờ đăng ký nào đã đăng ký và sl dk trên / tổng sv
    
- Luồng hoạt động của phần điểm danh 
  
   * Điểm danh
   + APP
     + Trước khi submit form điểm danh -> kiểm tra xem mã số sv này đã đăng ký chưa , chưa dk hiện tb (không cho submit) 
   + WEB
    
     
     + Ở mục điểm danh , cho lọc hoạt động theo date ( ngày là ngày hội thảo bắt đầu)
     + Trước cái bảng Bên trái ghi tên hoạt động , Bên phải mã QR điểm danh nhấn vô ( hỏi Bạn muốn bắt đầu điểm danh - Xác nhận - bắt đầu tính thời gian ) 
     + Mã QR hiện lên , sau 1 tiếng mã QR bị huỷ
     + Bảng có thông tin ( loại hd, mã sv, họ tên, time điểm danh, trạng thái là có hoặc không hoặc chờ xử lý(mặc định không), hành đọng là nút bật mở( mặc địnhh là tắt)
     => Nếu trước 15 kể từ thời điểm QR được tạo, mà sv checkin thì trạng thái là Có 
     => Sau 15 phút kể từ thời điểm QR được tạo, mà sv checkin thì trạng thái là Chờ xử lý, lúc này nút ơ mục hành động dc enable và người quản trị có thể bật , hoặc tắt => nếu bật thì trạng thái về Có, không bật là Không( nếu có 1 hành đọng tắt)
     => Sau 30 phút huỷ mã QR và có bất kỳ checkin nào cũng là Không -> tbaso quá thười gian rồi 
  
