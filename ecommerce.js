// Global variables
let products = [];
let cart = [];
let currentCategory = 'all';
let searchTerm = '';
let productsToShow = 12;
let currentIndex = 0;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    setupEventListeners();
    loadCartFromStorage(); // Load cart from localStorage
    updateCartCount();
    initializeAnimations();
});

// Load cart from localStorage
function loadCartFromStorage() {
    const savedCart = localStorage.getItem('sktCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

// Load products from JSON file
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        const data = await response.json();
        products = data.products; // Extract the products array
        displayProducts();
    } catch (error) {
        console.error('Error loading products:', error);
        displayError('Failed to load products. Please try again later.');
    }
}

// Setup event listeners
function setupEventListeners() {
    // Category filter buttons
    document.querySelectorAll('[data-category]').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('[data-category]').forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            currentCategory = this.dataset.category;
            currentIndex = 0;
            displayProducts();
        });
    });

    // Search input
    document.getElementById('searchInput').addEventListener('input', function() {
        searchTerm = this.value.toLowerCase();
        currentIndex = 0;
        displayProducts();
    });

    // Load more button
    document.getElementById('loadMoreBtn').addEventListener('click', function() {
        currentIndex += productsToShow;
        displayProducts();
    });

    // Contact form
    document.getElementById('contactForm').addEventListener('submit', function(e) {
        e.preventDefault();
        handleContactForm();
    });
}

// Display products
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    
    // Filter products
    let filteredProducts = products.filter(product => {
        const matchesCategory = currentCategory === 'all' || product.category === currentCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        return matchesCategory && matchesSearch;
    });

    // Show all products (no pagination since we removed load more button)
    const productsToDisplay = filteredProducts;
    
    // Clear existing products
    productsGrid.innerHTML = '';
    
    // Display products
    productsToDisplay.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });

    // Hide load more button since we show all products
    if (loadMoreBtn) {
        loadMoreBtn.style.display = 'none';
    }
}

    // Add animations
    setTimeout(() => {
        document.querySelectorAll('.product-card').forEach((card, index) => {
            setTimeout(() => {
                card.classList.add('fade-in', 'visible');
            }, index * 100);
        });
    }, 100);
}

// Create product card
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6 mb-4';
    
    const isLatest = product.id >= 79; // Latest products
    
    col.innerHTML = `
        <div class="product-card">
            <div class="position-relative overflow-hidden">
                <img src="images/${product.image}" alt="${product.name}" class="product-image w-100">
                ${isLatest ? '<span class="product-badge">NEW</span>' : ''}
            </div>
            <div class="p-3">
                <h5 class="product-title">${product.name}</h5>
                <p class="product-price">${product.price}</p>
                <button class="btn btn-primary btn-add-cart w-100" onclick="addToCart(${product.id})">
                    <i class="fas fa-shopping-cart me-2"></i>Add to Cart
                </button>
            </div>
        </div>
    `;
    
    return col;
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    // Save cart to localStorage
    localStorage.setItem('sktCart', JSON.stringify(cart));
    
    updateCartCount();
    showNotification('Product added to cart!');
    
    // Add animation to cart icon
    const cartIcon = document.querySelector('.nav-link[href="#cart"]');
    cartIcon.classList.add('scale-in');
    setTimeout(() => cartIcon.classList.remove('scale-in'), 600);
}

// Update cart count
function updateCartCount() {
    const cartCount = document.querySelector('.cart-count');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    cartCount.style.display = totalItems > 0 ? 'flex' : 'none';
}

// Show cart modal
function showCart() {
    const cartModal = new bootstrap.Modal(document.getElementById('cartModal'));
    updateCartModal();
    cartModal.show();
}

// Update cart modal
function updateCartModal() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="text-center">Your cart is empty</p>';
        cartTotal.textContent = 'Rs.0';
        return;
    }
    
    let total = 0;
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        const itemPrice = parseInt(item.price.replace(/[^0-9]/g, ''));
        const itemTotal = itemPrice * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="images/${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">${item.price}</div>
                <div class="cart-item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    cartTotal.textContent = `Rs.${total.toLocaleString()}`;
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        removeFromCart(productId);
    } else {
        updateCartModal();
        updateCartCount();
    }
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartModal();
    updateCartCount();
    showNotification('Product removed from cart');
}

// Test WhatsApp function
function testWhatsApp() {
    const testMessage = 'Hello! This is a test message from Shree Krishna Traders website.';
    const whatsappUrl = `https://wa.me/message/TWGZ7TGIUQ4QN1?text=${encodeURIComponent(testMessage)}`;
    window.open(whatsappUrl, '_blank');
}

// Send customer confirmation email
function sendCustomerConfirmationEmail(customerEmail, total, cartItems) {
    // Initialize EmailJS (you'll need to set this up)
    emailjs.init("YOUR_PUBLIC_KEY"); // Replace with your EmailJS public key
    
    // Prepare email content
    let itemsList = '';
    cartItems.forEach(item => {
        itemsList += `${item.quantity}x ${item.name} - ${item.price}\n`;
    });
    
    const emailParams = {
        customer_email: customerEmail,
        order_total: `Rs.${total.toLocaleString()}`,
        order_items: itemsList,
        order_date: new Date().toLocaleString(),
        business_name: "Shree Krishna Traders",
        contact_phone: "+9779864563255"
    };
    
    // Send email (you'll need to set up EmailJS service and template)
    emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', emailParams)
        .then(function(response) {
            console.log('Customer email sent successfully!', response.status);
        }, function(error) {
            console.log('Failed to send customer email:', error);
            // Fallback: show email content to user
            alert(`Order confirmation would be sent to: ${customerEmail}\n\nOrder Details:\n${itemsList}\nTotal: Rs.${total.toLocaleString()}`);
        });
}

// Checkout via WhatsApp
function checkout() {
    console.log('Cart items:', cart); // Debug log
    console.log('Cart length:', cart.length); // Debug log
    
    if (cart.length === 0) {
        showNotification('Your cart is empty - please add products first!');
        return;
    }
    
    // Get customer email
    const customerEmail = document.getElementById('customerEmail').value;
    if (!customerEmail) {
        showNotification('Please enter your email for order confirmation!');
        return;
    }
    
    let message = 'Hello! I would like to order the following items:\n\n';
    let total = 0;
    
    cart.forEach(item => {
        const itemPrice = parseInt(item.price.replace(/[^0-9]/g, ''));
        const itemTotal = itemPrice * item.quantity;
        total += itemTotal;
        message += `${item.quantity}x ${item.name} - ${item.price}\n`;
        console.log(`Adding to message: ${item.quantity}x ${item.name} - ${item.price}`); // Debug log
    });
    
    message += `\nTotal: Rs.${total.toLocaleString()}\n\nCustomer Email: ${customerEmail}\n\nPlease provide payment and delivery details.`;
    console.log('Final message:', message); // Debug log
    
    // Send WhatsApp message
    const whatsappUrl = `https://wa.me/9779864563255?text=${encodeURIComponent(message)}`;
    console.log('WhatsApp URL:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
    
    // Send customer confirmation email (using EmailJS)
    sendCustomerConfirmationEmail(customerEmail, total, cart);
    
    // Clear cart after order
    cart = [];
    localStorage.setItem('sktCart', JSON.stringify(cart));
    updateCartModal();
    showNotification('Order placed! Check your email for confirmation.');
}

// Handle contact form
function handleContactForm() {
    const form = document.getElementById('contactForm');
    const formData = new FormData(form);
    
    // Create WhatsApp message
    let message = 'New Contact Form Submission:\n\n';
    message += `Name: ${form.querySelector('input[type="text"]').value}\n`;
    message += `Email: ${form.querySelector('input[type="email"]').value}\n`;
    message += `Message: ${form.querySelector('textarea').value}`;
    
    const whatsappUrl = `https://wa.me/message/TWGZ7TGIUQ4QN1?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Reset form
    form.reset();
    showNotification('Message sent successfully!');
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'position-fixed top-0 start-50 translate-middle-x mt-3 alert alert-success alert-dismissible fade show';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Display error
function displayError(message) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = `
        <div class="col-12">
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
            </div>
        </div>
    `;
}

// Initialize animations
function initializeAnimations() {
    // Intersection Observer for fade-in animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.feature-card, .product-card').forEach(el => {
        observer.observe(el);
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Cart modal trigger
document.querySelector('a[href="#cart"]').addEventListener('click', function(e) {
    e.preventDefault();
    showCart();
});

// Navbar background on scroll
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Add scrolled class styling
const style = document.createElement('style');
style.textContent = `
    .navbar.scrolled {
        background-color: rgba(33, 37, 41, 0.95) !important;
        backdrop-filter: blur(10px);
        transition: all 0.3s ease;
    }
`;
document.head.appendChild(style);
