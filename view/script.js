const API_BASE_URL = ""
document.addEventListener('DOMContentLoaded', function() {
    // Add smooth scrolling to all links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Category list interactions
    const categoryItems = document.querySelectorAll('.category-list li');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            categoryItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // You can add filtering logic here
            console.log('Selected category:', this.textContent.trim());
        });
    });

    // Product card hover effects
    const productCards = document.querySelectorAll('.product');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        });
    });

    // Shopping cart functionality
    let cartCount = 0;
    const cartBadge = document.querySelector('.fa-shopping-cart').nextElementSibling;
    
    // Add to cart buttons (you can add these to products)
    function addToCart() {
        cartCount++;
        cartBadge.textContent = cartCount;
        
        // Add animation
        cartBadge.style.transform = 'scale(1.3)';
        setTimeout(() => {
            cartBadge.style.transform = 'scale(1)';
        }, 200);
    }

    // Wishlist functionality
    let wishlistCount = 0;
    const wishlistBadge = document.querySelector('.fa-heart').nextElementSibling;
    
    function addToWishlist() {
        wishlistCount++;
        wishlistBadge.textContent = wishlistCount;
        
        // Add animation
        wishlistBadge.style.transform = 'scale(1.3)';
        setTimeout(() => {
            wishlistBadge.style.transform = 'scale(1)';
        }, 200);
    }

    // Search functionality
    const searchIcon = document.querySelector('.fa-search');
    searchIcon.addEventListener('click', function() {
        const searchTerm = prompt('What are you looking for?');
        if (searchTerm) {
            console.log('Searching for:', searchTerm);
            // Add your search logic here
        }
    });

    // Newsletter signup


    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.product, .card, .feature').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Add click handlers for shop now buttons
    document.querySelectorAll('.shop-btn, .card-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255,255,255,0.6)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 0.6s linear';
            ripple.style.left = '50%';
            ripple.style.top = '50%';
            ripple.style.width = '20px';
            ripple.style.height = '20px';
            ripple.style.marginLeft = '-10px';
            ripple.style.marginTop = '-10px';
            
            this.style.position = 'relative';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Customer Authentication
    checkCustomerAuth();
    bindCustomerAuthEvents();

    // Load categories and products only if authenticated
    if (isCustomerAuthenticated()) {
        loadCategories();
        loadProducts();
    }
});

// Customer Authentication Functions
function checkCustomerAuth() {
    const token = localStorage.getItem('customerAuthToken');
    if (!token) {
        showLoginRequired();
    } else {
        // Verify token and check if user has customer role
        verifyCustomerToken(token);
    }
}

function isCustomerAuthenticated() {
    const token = localStorage.getItem('customerAuthToken');
    return token !== null;
}

function showLoginRequired() {
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('loginRequiredMessage').style.display = 'block';
    document.getElementById('customerLoginBtn').style.display = 'inline-block';
    document.getElementById('customerInfo').style.display = 'none';
    
    // Ensure the login button is visible and styled
    const loginBtn = document.getElementById('customerLoginBtn');
    if (loginBtn) {
        loginBtn.style.display = 'inline-block';
        loginBtn.style.visibility = 'visible';
        loginBtn.style.opacity = '1';
    }
}

function showMainContent() {
    document.getElementById('mainContent').style.display = 'flex';
    document.getElementById('loginRequiredMessage').style.display = 'none';
    document.getElementById('customerLoginBtn').style.display = 'none';
    document.getElementById('customerInfo').style.display = 'block';
}

function bindCustomerAuthEvents() {
    // Login button
    document.getElementById('customerLoginBtn').addEventListener('click', showCustomerLoginModal);
    document.getElementById('showLoginBtn').addEventListener('click', showCustomerLoginModal);
    
    // Register button
    document.getElementById('customerRegisterBtn').addEventListener('click', showCustomerRegisterModal);
    document.getElementById('showRegisterBtn').addEventListener('click', showCustomerRegisterModal);
    
    // Logout button
    document.getElementById('customerLogoutBtn').addEventListener('click', handleCustomerLogout);
    
    // Login form
    document.getElementById('customerLoginForm').addEventListener('submit', handleCustomerLogin);
    
    // Register form
    document.getElementById('customerRegisterForm').addEventListener('submit', handleCustomerRegister);
    
    // Modal close buttons
    const loginCloseBtn = document.querySelector('#customerLoginModal .close');
    loginCloseBtn.addEventListener('click', closeCustomerLoginModal);
    
    const registerCloseBtn = document.querySelector('#customerRegisterModal .close');
    registerCloseBtn.addEventListener('click', closeCustomerRegisterModal);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        const loginModal = document.getElementById('customerLoginModal');
        const registerModal = document.getElementById('customerRegisterModal');
        
        if (event.target === loginModal) {
            closeCustomerLoginModal();
        }
        if (event.target === registerModal) {
            closeCustomerRegisterModal();
        }
    });
}

function showCustomerLoginModal() {
    document.getElementById('customerLoginModal').style.display = 'block';
}

function closeCustomerLoginModal() {
    document.getElementById('customerLoginModal').style.display = 'none';
    document.getElementById('customerLoginForm').reset();
}

function showCustomerRegisterModal() {
    document.getElementById('customerRegisterModal').style.display = 'block';
}

function closeCustomerRegisterModal() {
    document.getElementById('customerRegisterModal').style.display = 'none';
    document.getElementById('customerRegisterForm').reset();
}

async function handleCustomerLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('customerUsername').value;
    const password = document.getElementById('customerPassword').value;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tenDangNhap: username,
                matKhau: password
            })
        });
        
        if (!response.ok) {
            throw new Error('Đăng nhập thất bại');
        }
        
        const data = await response.json();
        
        // Lưu token tạm thời
        localStorage.setItem('tempAuthToken', data.access_token);
        
        // Kiểm tra vai trò bằng cách lấy danh sách tài khoản
        const accountsResponse = await fetch(`${API_BASE_URL}/taikhoan`, {
            headers: {
                'Authorization': `Bearer ${data.access_token}`
            }
        });
        
        if (!accountsResponse.ok) {
            throw new Error('Không thể kiểm tra vai trò tài khoản');
        }
        
        const accounts = await accountsResponse.json();
        
        // Tìm tài khoản đã đăng nhập
        const currentAccount = accounts.find(account => account.tenDangNhap === username);
        
        if (!currentAccount) {
            throw new Error('Không tìm thấy thông tin tài khoản');
        }
        
        // Kiểm tra vai trò khách hàng (có thể là "khachhang" hoặc "khach_hang")
        const customerRoles = ['khachhang', 'khach_hang'];
        if (customerRoles.includes(currentAccount.loai)) {
            // Xóa token tạm và lưu token chính thức
            localStorage.removeItem('tempAuthToken');
            localStorage.setItem('customerAuthToken', data.access_token);
            localStorage.setItem('customerName', username);
            localStorage.setItem('customerRole', currentAccount.loai);
            
            showNotification('Đăng nhập thành công!', 'success');
            closeCustomerLoginModal();
            showMainContent();
            
            // Load content after successful login
            await loadCategories();
            await loadProducts();
            bindContentEvents();
            
            // Update customer info display
            // document.getElementById('customerName').textContent = username;
        } else {
            localStorage.removeItem('tempAuthToken');
            throw new Error(`Tài khoản này có vai trò "${currentAccount.loai}" - chỉ khách hàng mới có thể truy cập trang này`);
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Đăng nhập thất bại: ' + error.message, 'error');
    }
}

async function handleCustomerRegister(event) {
    event.preventDefault();
    
    const tenKhachHang = document.getElementById('registerTenKhachHang').value;
    const sdt = document.getElementById('registerSdt').value;
    const tenDangNhap = document.getElementById('registerTenDangNhap').value;
    const matKhau = document.getElementById('registerMatKhau').value;
    
    // Validate input
    if (!tenKhachHang || !sdt || !tenDangNhap || !matKhau) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }
    
    if (matKhau.length < 1) {
        showNotification('Mật khẩu phải có ít nhất 1 ký tự!', 'error');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/khach-hang`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                tenKhachHang: tenKhachHang,
                sdt: sdt,
                tenDangNhap: tenDangNhap,
                matKhau: matKhau
            })
        });
        
        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(errorData || 'Đăng ký thất bại');
        }
        
        const data = await response.json();
        console.log('Registration successful:', data);
        
        showNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
        closeCustomerRegisterModal();
        
        // Auto-switch to login modal
        setTimeout(() => {
            showCustomerLoginModal();
        }, 1500);
        
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Đăng ký thất bại: ' + error.message, 'error');
    }
}

function handleCustomerLogout() {
    localStorage.removeItem('customerAuthToken');
    localStorage.removeItem('customerName');
    localStorage.removeItem('customerRole');
    showNotification('Đã đăng xuất!', 'success');
    showLoginRequired();
}

async function verifyCustomerToken(token) {
    try {
        // Kiểm tra token bằng cách lấy danh sách tài khoản
        const accountsResponse = await fetch(`${API_BASE_URL}/taikhoan`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!accountsResponse.ok) {
            throw new Error('Token không hợp lệ');
        }
        
        const accounts = await accountsResponse.json();
        
        // Lấy thông tin tài khoản từ localStorage hoặc tìm trong danh sách
        const customerName = localStorage.getItem('customerName');
        const currentAccount = accounts.find(account => account.tenDangNhap === customerName);
        
        if (!currentAccount) {
            throw new Error('Không tìm thấy thông tin tài khoản');
        }
        
        // Kiểm tra vai trò khách hàng
        const customerRoles = ['khachhang', 'khach_hang'];
        if (customerRoles.includes(currentAccount.loai)) {
            showMainContent();
        
            
            // Load content and bind events
            await loadCategories();
            await loadProducts();
            bindContentEvents();
        } else {
            throw new Error(`Tài khoản có vai trò "${currentAccount.loai}" - không có quyền truy cập`);
        }
        
    } catch (error) {
        console.error('Token verification error:', error);
        localStorage.removeItem('customerAuthToken');
        localStorage.removeItem('customerName');
        localStorage.removeItem('customerRole');
        showLoginRequired();
    }
}

// Notification system
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : '#dc3545'};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Content Loading Functions
async function loadCategories() {
    const categoryList = document.querySelector('.category-list');
    if (categoryList) {
        try {
            const res = await fetch(`${API_BASE_URL}/danh-muc`);
            const categories = await res.json();
            categoryList.innerHTML = '';
            categories.forEach(cat => {
                const li = document.createElement('li');
                li.innerHTML = `<i class="fas fa-leaf"></i> ${cat.tenDanhMuc}`;
                li.setAttribute('data-id', cat.id);
                categoryList.appendChild(li);
            });

            // Thêm sự kiện click cho từng danh mục
            const productsGrid = document.querySelector('.products-grid');
            categoryList.querySelectorAll('li').forEach(li => {
                li.addEventListener('click', async function() {
                    // Active class
                    categoryList.querySelectorAll('li').forEach(i => i.classList.remove('active'));
                    this.classList.add('active');
                    const danhMucId = this.getAttribute('data-id');
                    if (productsGrid) {
                        try {
                            const res = await fetch(`${API_BASE_URL}/san-pham/danh-muc/${danhMucId}`);
                            const products = await res.json();
                            renderProducts(products);
                        } catch (e) {
                            productsGrid.innerHTML = '<div>Không tải được sản phẩm</div>';
                        }
                    }
                });
            });
        } catch (e) {
            categoryList.innerHTML = '<li>Không tải được danh mục</li>';
        }
    }
}

async function loadProducts() {
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
        try {
            const res = await fetch(`${API_BASE_URL}/san-pham`);
            const products = await res.json();
            renderProducts(products);
        } catch (e) {
            productsGrid.innerHTML = '<div>Không tải được sản phẩm</div>';
        }
    }
}

function renderProducts(products) {
    const productsGrid = document.querySelector('.products-grid');
    if (productsGrid) {
        productsGrid.innerHTML = '';
        products.forEach(product => {
            const div = document.createElement('div');
            div.className = 'product';
            div.style.cursor = 'pointer';
            div.innerHTML = `
                <img src="${product.hinhAnhs && product.hinhAnhs.length > 0 ? product.hinhAnhs[0].hinhAnh : 'https://vegina-store.myshopify.com/cdn/shop/products/25_525c2823-683a-445e-b187-6fe7ca3f5a8e.jpg?v=1620641853&width=720'}" alt="${product.ten}">
                <h4>${product.ten}</h4>
                <p class="price">${product.gia?.toLocaleString('vi-VN') || ''} VNĐ</p>
                <div class="rating">
                    <span class="stars">★★★★★</span>
                    <span class="reviews">Chưa có đánh giá</span>
                </div>
            `;
            
            div.addEventListener('click', () => {
                window.location.href = `hang_hoa/index.html?product=${product.id}`;
            });
            
            productsGrid.appendChild(div);
        });
    }
}

// Sau khi đã lấy được product từ URL
console.log('URL:', window.location.search);
const urlParams = new URLSearchParams(window.location.search);
const productParam = urlParams.get('product');
let currentProduct = null;
if (productParam) {
    try {
        currentProduct = JSON.parse(decodeURIComponent(productParam));
        console.log('Product param:', currentProduct);
    } catch (error) {
        console.error('Lỗi khi parse dữ liệu sản phẩm:', error);
    }
}

// Render danh mục chỉ cho sản phẩm hiện tại
const categoryList = document.querySelector('.category-list');
if (categoryList && currentProduct && currentProduct.danhMucId) {
    fetch(`${API_BASE_URL}/danh-muc/${currentProduct.danhMucId}`)
        .then(res => res.json())
        .then(category => {
            categoryList.innerHTML = '';
            const li = document.createElement('li');
            li.innerHTML = `<i class="fas fa-leaf"></i> ${category.tenDanhMuc || category.ten}`;
            li.classList.add('active');
            categoryList.appendChild(li);
        });
}

// Add CSS for ripple animation
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .category-list li.active {
        background: #f0f4e8;
        color: #7cb342;
        font-weight: bold;
    }
`;
document.head.appendChild(rippleStyle);

function renderRelatedProducts(products, currentProductId) {
    const grid = document.querySelector('.related-products .products-grid');
    if (!grid) return;
    grid.innerHTML = '';
    const related = products.filter(p => p.id !== currentProductId);
    if (related.length === 0) {
        grid.innerHTML = '<div>Không có sản phẩm liên quan.</div>';
        return;
    }
    related.forEach(product => {
        const div = document.createElement('div');
        div.className = 'product';
        div.style.cursor = 'pointer';
        div.innerHTML = `
            <img src="${product.hinhAnhs && product.hinhAnhs.length > 0 ? product.hinhAnhs[0].hinhAnh : 'https://vegina-store.myshopify.com/cdn/shop/products/25_525c2823-683a-445e-b187-6fe7ca3f5a8e.jpg?v=1620641853&width=720'}" alt="${product.ten}">
            <h4>${product.ten}</h4>
            <p class="price">${product.gia?.toLocaleString('vi-VN') || ''} VNĐ</p>
            <div class="rating">
                <span class="stars">★★★★★</span>
                <span class="reviews">Chưa có đánh giá</span>
            </div>
        `;
        div.addEventListener('click', () => {
            window.location.href = `hang_hoa/index.html?product=${product.id}`;
        });
        grid.appendChild(div);
    });
}

const danhMucId = currentProduct.danhMucId || (currentProduct.danhMuc && currentProduct.danhMuc.id);
if (danhMucId) {
    fetch(`${API_BASE_URL}/san-pham/danh-muc/${danhMucId}`)
        .then(res => res.json())
        .then(products => {
            renderRelatedProducts(products, currentProduct.id);
        });
}

// Bind additional events after content is loaded
function bindContentEvents() {
    // Thêm sự kiện click cho .category-header để hiển thị tất cả sản phẩm
    const categoryHeader = document.querySelector('.category-header');
    if (categoryHeader) {
        categoryHeader.addEventListener('click', async function() {
            // Bỏ active ở tất cả danh mục
            const categoryList = document.querySelector('.category-list');
            if (categoryList) {
                categoryList.querySelectorAll('li').forEach(i => i.classList.remove('active'));
            }
            // Hiển thị lại tất cả sản phẩm
            await loadProducts();
        });
    }

    // Product card hover effects
    const productCards = document.querySelectorAll('.product');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 20px rgba(0,0,0,0.1)';
        });
    });

    // Category list interactions
    const categoryItems = document.querySelectorAll('.category-list li');
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            categoryItems.forEach(i => i.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // You can add filtering logic here
            console.log('Selected category:', this.textContent.trim());
        });
    });
}