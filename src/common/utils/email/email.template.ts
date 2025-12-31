export const verifyEmail = ({title, otp}:{title:string, otp:string}):string => {
    return `<!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style type="text/css">
          body {
            margin: 0;
            padding: 0;
            background-color: #f4f6f8;
            font-family: Arial, sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
          .container {
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            padding: 0;
            border: 1px solid #e0e0e0;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
          }
          .header {
            background-color: #007BFF;
            padding: 25px;
            text-align: center;
            color: #fff;
          }
          .header img {
            width: 60px;
            margin-bottom: 10px;
          }
          .header h1 {
            margin: 0;
            text-align:center;
            font-size: 30px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          
          .content {
            padding: 40px 30px;
            text-align: center;
            color: #333;
          }
          .content h2 {
            color: #007BFF;
            margin-bottom: 15px;
            font-size: 20px;
          }
          .content p {
            font-size: 16px;
            margin-bottom: 20px;
            line-height: 1.6;
          }
          .otp {
            font-size: 32px;
            font-weight: bold;
            color: #007BFF;
            letter-spacing: 6px;
            margin: 25px 0;
          }
          .btn {
            display: inline-block;
            padding: 14px 28px;
            background: #007BFF;
            color: #fff !important;
            text-decoration: none;
            border-radius: 6px;
            font-size: 16px;
            font-weight: bold;
            margin-top: 15px;
          }
          .footer {
            background: #f9f9f9;
            padding: 20px;
            text-align: center;
            font-size: 14px;
            color: #777;
            border-top: 1px solid #eee;
          }
          .social a {
            margin: 0 8px;
            text-decoration: none;
            display: inline-block;
          }
          .social img {
            width: 28px;
            height: 28px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/ddajommsw/image/upload/v1670702280/Group_35052_icaysu.png" alt="Logo" />
            <h1> ${process.env.APP_NAME}</h1>
          </div>
          <div class="content">
            <h2>${title}</h2>
            <p>Thank you for signing up! Please confirm your email address using the code below:</p>
            <div class="otp">${otp}</div>
            <p>If you did not request this, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ${process.env.APPLICATION_NAME}. All rights reserved.</p>
            <div class="social">
              <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook"></a>
              <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" alt="Twitter"></a>
              <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="Instagram"></a>
            </div>
          </div>
        </div>
      </body>
    </html>`;
  };
  