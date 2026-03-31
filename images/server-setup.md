# 🏗️ Server Setup Guide for Shree Krishna Traders

## 📋 Requirements
- Apache Server (XAMPP/WAMP/MAMP)
- MySQL Database
- PHP 7.4+
- eSewa API Key (NPR 50,000)
- Khalti API Key

## 🗄️ Database Setup

### Create MySQL Database:
```sql
CREATE DATABASE shree_krishna_traders;

USE shree_krishna_traders;

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    customer_city VARCHAR(50),
    customer_postal VARCHAR(20),
    order_notes TEXT,
    items JSON NOT NULL,
    subtotal VARCHAR(20),
    delivery_charge VARCHAR(20),
    total VARCHAR(20),
    payment_method VARCHAR(20),
    payment_status ENUM('pending', 'paid', 'failed', 'cod') DEFAULT 'pending',
    order_status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    price VARCHAR(50) NOT NULL,
    category VARCHAR(50),
    image VARCHAR(200),
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📁 File Structure
```
/your-project/
├── index.php          # Main order processing
├── config.php          # Database connection
├── esewa.php          # eSewa payment handler
├── khalti.php         # Khalti payment handler
├── success.php         # Payment success page
├── failed.php          # Payment failed page
├── email.php           # Email sending function
└── admin/
    ├── orders.php      # Order management
    ├── products.php    # Product management
    └── dashboard.php   # Admin dashboard
```

## 🔧 Apache Setup (XAMPP)

### 1. Install XAMPP
```bash
# Download XAMPP from https://www.apachefriends.org/
# Install and start Apache + MySQL
```

### 2. Configure Apache
```apache
# Enable mod_rewrite in httpd.conf
LoadModule rewrite_module modules/mod_rewrite.so

# Create .htaccess file
RewriteEngine On
RewriteRule ^order/([a-zA-Z0-9]+)$ success.php?order_id=$1 [L]
```

## 💳 Payment Integration

### eSewa API Integration
```php
<?php
// config.php
define('ESEWA_MERCHANT_ID', 'your_merchant_id');
define('ESEWA_API_KEY', 'your_api_key');
define('ESEWA_SUCCESS_URL', 'https://yoursite.com/success.php');
define('ESEWA_FAILURE_URL', 'https://yoursite.com/failed.php');

// esewa.php
function processEsewaPayment($order) {
    $amount = str_replace(',', '', $order['total']);
    $amount = str_replace('Rs.', '', $amount);
    
    $payload = [
        'merchant_code' => ESEWA_MERCHANT_ID,
        'amount' => $amount,
        'transaction_code' => uniqid(),
        'success_url' => ESEWA_SUCCESS_URL,
        'failure_url' => ESEWA_FAILURE_URL
    ];
    
    // Redirect to eSewa
    header('Location: https://esewa.com.np/epay/main?' . http_build_query($payload));
}
?>
```

### Khalti API Integration
```php
<?php
// khalti.php
function processKhaltiPayment($order) {
    $amount = str_replace(['Rs.', ','], '', $order['total']);
    
    $payload = [
        'public_key' => KHALTI_PUBLIC_KEY,
        'amount' => $amount * 100, // Convert to paisa
        'purchase_order_id' => $order['order_id'],
        'return_url' => 'https://yoursite.com/success.php',
        'website_url' => 'https://yoursite.com'
    ];
    
    // Initiate Khalti payment
    $response = file_get_contents('https://khalti.com/api/v2/epayment/initiate/', false, stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => 'Authorization: Key ' . KHALTI_SECRET_KEY,
            'content' => json_encode($payload)
        ]
    ]));
    
    $data = json_decode($response, true);
    header('Location: ' . $data['payment_url']);
}
?>
```

## 📧 Email System Setup

### PHP Mail Function
```php
<?php
// email.php
function sendOrderEmail($order) {
    $to = $order['customer_email'];
    $subject = 'Order Confirmation - Shree Krishna Traders';
    
    $message = "
    <h2>Order Confirmation</h2>
    <p><strong>Order ID:</strong> {$order['order_id']}</p>
    <p><strong>Name:</strong> {$order['customer_name']}</p>
    <p><strong>Total Amount:</strong> {$order['total']}</p>
    <p><strong>Payment Method:</strong> {$order['payment_method']}</p>
    <p><strong>Delivery Address:</strong> {$order['customer_address']}</p>
    
    <h3>Order Items:</h3>
    <table>
        <tr><th>Product</th><th>Quantity</th><th>Price</th></tr>
    ";
    
    foreach(json_decode($order['items'], true) as $item) {
        $message .= "<tr><td>{$item['name']}</td><td>{$item['quantity']}</td><td>{$item['price']}</td></tr>";
    }
    
    $message .= "</table>
    
    <p>Thank you for shopping with Shree Krishna Traders!</p>
    ";
    
    $headers = "MIME-Version: 1.0" . "\r\n";
    $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
    $headers .= 'From: orders@shreekrishnatraders.com' . "\r\n";
    
    return mail($to, $subject, $message, $headers);
}
?>
```

## 🚀 Deployment Steps

### 1. Local Development
```bash
# Start XAMPP
# Place files in htdocs/shree-krishna/
# Access: http://localhost/shree-krishna/
```

### 2. Production Deployment
```bash
# Upload files to hosting
# Set file permissions: chmod 755
# Configure domain DNS
# Install SSL certificate
```

## 🔒 Security Considerations

1. **API Keys**: Store securely, use environment variables
2. **Database**: Use prepared statements, prevent SQL injection
3. **Payments**: Verify webhook signatures
4. **SSL**: Force HTTPS on all pages
5. **Validation**: Server-side form validation

## 💰 Payment Gateway Costs

### eSewa
- **Setup Fee**: NPR 50,000 (one-time)
- **Transaction Fee**: 2% + NPR 10 per transaction
- **Daily Limit**: NPR 100,000

### Khalti  
- **Setup Fee**: NPR 25,000 (one-time)
- **Transaction Fee**: 1.5% + NPR 5
- **Daily Limit**: NPR 150,000

## 📞 Support Contacts

- **eSewa Merchant**: 16600155001
- **Khalti Business**: 01-4444444
- **Nepal Rastra Bank**: For business accounts

## 🎯 Next Steps

1. ✅ Get eSewa/Khalti API keys
2. ✅ Setup Apache + MySQL
3. ✅ Create database tables  
4. ✅ Implement payment handlers
5. ✅ Test with small amounts
6. ✅ Deploy to production
7. ✅ Monitor transactions

---

**Note**: This is a complete enterprise-level e-commerce setup. Start with basic functionality, then add advanced features gradually.
