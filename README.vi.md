# ServerPulse

ServerPulse là ứng dụng web nhỏ gọn để theo dõi tình trạng máy chủ NAS hoặc VPS theo thời gian thực.

For the English guide, see [README.md](./README.md).

## Tính năng

- Theo dõi CPU usage
- Theo dõi RAM usage
- Theo dõi tốc độ download
- Theo dõi tốc độ upload
- Theo dõi dung lượng ổ cứng theo từng mount point hoặc phân vùng

## 1. Yêu cầu

Cần có sẵn trên máy chủ:
- Node.js 18 trở lên
- npm

Kiểm tra nhanh:

```bash
node -v
npm -v
```

## 2. Cài đặt trên máy chủ

### Cách 1: Upload source lên máy chủ

Chép toàn bộ thư mục dự án `ServerPulse` lên máy chủ, sau đó vào thư mục dự án:

```bash
cd /duong-dan-toi/ServerPulse
```

Cài dependency:

```bash
npm install
```

Chạy ứng dụng:

```bash
npm start
```

Mặc định app chạy ở cổng `3000`.

Mở trình duyệt:

```text
http://IP-MAY-CHU:3000
```

### Cách 2: Clone từ Git

Nếu bạn đưa dự án lên Git repository:

```bash
git clone <repo-url>
cd ServerPulse
npm install
npm start
```

## 3. Chạy với cổng tùy chỉnh

App hỗ trợ biến môi trường `PORT`.

Linux / macOS:

```bash
PORT=8080 npm start
```

Sau đó truy cập:

```text
http://IP-MAY-CHU:8080
```

## 4. Chạy nền trên VPS bằng PM2

Nếu muốn app tự khởi động lại khi lỗi hoặc sau reboot:

```bash
npm install -g pm2
cd /duong-dan-toi/ServerPulse
pm2 start server.js --name serverpulse
pm2 save
pm2 startup
```

Kiểm tra trạng thái:

```bash
pm2 status
pm2 logs serverpulse
```

## 5. Mở cổng firewall

Nếu máy chủ đang bật firewall, cần mở cổng đang dùng cho app.

Ví dụ với UFW nếu chạy cổng `3000`:

```bash
sudo ufw allow 3000/tcp
sudo ufw reload
```

## 6. Reverse proxy với Nginx

Nếu bạn muốn truy cập bằng domain và không hiện cổng `3000`, có thể đặt Nginx phía trước.

Ví dụ file config:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Sau khi lưu config:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Dữ liệu app hiển thị

ServerPulse đọc dữ liệu trực tiếp từ hệ thống hiện tại, bao gồm:
- CPU
- RAM
- Lưu lượng mạng download/upload
- Ổ cứng và mount point

Lưu ý:
- Tốc độ download/upload được tính dựa trên chênh lệch bytes nhận/gửi giữa các lần lấy mẫu.
- Ổ cứng sẽ hiển thị theo thông tin mà hệ điều hành cung cấp.
- Trên một số NAS, quyền hạn hoặc môi trường container có thể làm ẩn bớt interface mạng hoặc mount point.

## 8. Cấu trúc dự án

```text
ServerPulse/
├── public/
│   ├── app.js
│   ├── index.html
│   └── styles.css
├── server.js
├── package.json
├── README.md
└── README.vi.md
```

## 9. Lệnh dùng nhanh

```bash
npm install
npm start
```

Mở:

```text
http://localhost:3000
```

## 10. Hướng phát triển tiếp

- Biểu đồ lịch sử CPU, RAM, network
- Cảnh báo khi CPU, RAM, disk vượt ngưỡng
- Đăng nhập người dùng
- Lưu log metric vào database
- Docker hoặc docker-compose
