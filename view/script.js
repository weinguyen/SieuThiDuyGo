// Base API URL
const API_BASE_URL = 'http://localhost:3000';

// Global variables
let currentPage = 1;
let categories = [];
let currentCategory = null;
let cart = [];
let authToken = localStorage.getItem('authToken');
let currentUser = null;

// DOM Elements
const productsGrid = document.getElementById('products-grid');
const categoriesList = document.getElementById('categories-list');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const currentPageSpan = document.getElementById('current-page');
const cartIcon = document.getElementById('cart-icon');
const cartCount = document.querySelector('.cart-count');
const cartModal = document.getElementById('cart-modal');
const cartItems = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const loginModal = document.getElementById('login-modal');
const registerModal = document.getElementById('register-modal');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');

// Initialize the application
function init() {
    loadCategories();
    loadProducts();
    loadCartFromLocalStorage();
    updateCartCount();
    checkAuthStatus();
    setupEventListeners();
}

// Load categories from API
async function loadCategories() {
    try {
        const response = await fetch(`${API_BASE_URL}/danh-muc`);
        if (!response.ok) throw new Error('Failed to load categories');
        
        categories = await response.json();
        renderCategories();
    } catch (error) {
        console.error('Error loading categories:', error);
        categoriesList.innerHTML = '<li class="error">Không thể tải danh mục</li>';
    }
}

// Render categories in the navigation
function renderCategories() {
    if (!categories.length) {
        categoriesList.innerHTML = '<li>Không có danh mục nào</li>';
        return;
    }

    categoriesList.innerHTML = `
        <li class="${!currentCategory ? 'active' : ''}" data-category="">Tất cả</li>
        ${categories.map(category => `
            <li class="${currentCategory === category.tenDanhMuc ? 'active' : ''}" 
                data-category="${category.tenDanhMuc}">
                ${category.tenDanhMuc}
            </li>
        `).join('')}
    `;

    // Add event listeners to category items
    document.querySelectorAll('#categories-list li').forEach(item => {
        item.addEventListener('click', () => {
            const category = item.getAttribute('data-category');
            currentCategory = category || null;
            currentPage = 1;
            
            // Update active class
            document.querySelectorAll('#categories-list li').forEach(li => {
                li.classList.remove('active');
            });
            item.classList.add('active');
            
            loadProducts();
        });
    });
}

// Load products from API
async function loadProducts() {
    productsGrid.innerHTML = '<div class="loading">Đang tải sản phẩm...</div>';
    
    try {
        let url = `${API_BASE_URL}/san-pham/page/${currentPage}`;
        
        // If we have a category filter, we would need to adjust the API call
        // Note: The API doesn't seem to have a category filter endpoint in the spec
        // This is a placeholder for how you might implement it
        
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to load products');
        
        const data = await response.json();
        console.log(data)
        renderProducts(data);
        
        // Update pagination
        updatePagination(5); // Assuming the API returns totalPages, otherwise default to 5
    } catch (error) {
        
        console.error('Error loading products:', error);
        productsGrid.innerHTML = '<div class="error">Không thể tải sản phẩm</div>';
    }
}

// Render products in the grid
function renderProducts(data) {
    if (!data || !data.length) {
        productsGrid.innerHTML = '<div class="no-products">Không có sản phẩm nào</div>';
        return;
    }
    console.log(data)
    productsGrid.innerHTML = data.map(product => `
        <div class="product-card" data-id="${product._id || product.id}">
            <div class="product-image">
                <img src="${product.hinhAnh || 'https://via.placeholder.com/300'}" alt="${product.ten}">
            </div>
            <div class="product-info">
                <h3 class="product-title">${product.ten}</h3>
                <p class="product-price">${formatCurrency(product.gia)}</p>
                <p class="product-description">${product.moTa || 'Không có mô tả'}</p>
                <button class="add-to-cart" data-id="${product._id || product.id}">
                    Thêm vào giỏ hàng
                </button>
            </div>
        </div>
    `).join('');
    console.log(data)
    // Add event listeners to add-to-cart buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', (e) => {
            const productId = e.target.getAttribute('data-id');
            const product = data.find(p => (p._id || p.id) === productId);
            
            if (product) {
                addToCart(product);
                showNotification('Đã thêm sản phẩm vào giỏ hàng!');
            }
        });
    });

}

// Update pagination controls
function updatePagination(totalPages) {
    currentPageSpan.textContent = currentPage;

    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;
}

// Add product to cart
function addToCart(product) {
    const existingItem = cart.find(item => (item._id || item.id) === (product._id || product.id));
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    updateCartCount();
    saveCartToLocalStorage();
}

// Update cart item count
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = count;
}

// Render cart items
function renderCartItems() {
    if (!cart.length) {
        cartItems.innerHTML = '<p class="empty-cart">Giỏ hàng trống</p>';
        cartTotalPrice.textContent = '0';
        return;
    }

    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item._id || item.id}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.ten}</div>
                <div class="cart-item-price">${formatCurrency(item.gia)}</div>
            </div>
            <div class="cart-item-quantity">
                <button class="quantity-btn decrease">-</button>
                <span class="quantity-value">${item.quantity}</span>
                <button class="quantity-btn increase">+</button>
                <span class="remove-item">
                    <i class="fas fa-trash"></i>
                </span>
            </div>
        </div>
    `).join('');

    // Calculate and display total price
    const total = cart.reduce((sum, item) => sum + (item.gia * item.quantity), 0);
    cartTotalPrice.textContent = formatCurrency(total).replace('đ', '');

    // Add event listeners to cart item buttons
    document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cartItem = e.target.closest('.cart-item');
            const id = cartItem.getAttribute('data-id');
            updateCartItemQuantity(id, -1);
        });
    });

    document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cartItem = e.target.closest('.cart-item');
            const id = cartItem.getAttribute('data-id');
            updateCartItemQuantity(id, 1);
        });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const cartItem = e.target.closest('.cart-item');
            const id = cartItem.getAttribute('data-id');
            removeCartItem(id);
        });
    });
}

// Update cart item quantity
function updateCartItemQuantity(id, change) {
    const item = cart.find(item => (item._id || item.id) === id);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            removeCartItem(id);
        } else {
            renderCartItems();
            updateCartCount();
            saveCartToLocalStorage();
        }
    }
}

// Remove item from cart
function removeCartItem(id) {
    cart = cart.filter(item => (item._id || item.id) !== id);
    renderCartItems();
    updateCartCount();
    saveCartToLocalStorage();
}

// Save cart to localStorage
function saveCartToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Load cart from localStorage
function loadCartFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            console.error('Error parsing cart from localStorage:', e);
            cart = [];
        }
    }
}

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0
    }).format(amount);
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Add styles
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#4CAF50';
    notification.style.color = 'white';
    notification.style.padding = '10px 20px';
    notification.style.borderRadius = '4px';
    notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    notification.style.zIndex = '1000';
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(20px)';
    notification.style.transition = 'opacity 0.3s, transform 0.3s';
    
    // Show the notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 10);
    
    // Remove the notification after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Check authentication status
function checkAuthStatus() {
    if (authToken) {
        // Show logout button, hide login/register buttons
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        
        // Try to get user info if we have a token
        fetchUserInfo();
    } else {
        // Show login/register buttons, hide logout button
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
    }
}

// Fetch user information
async function fetchUserInfo() {
    if (!authToken) return;
    
    try {
        // This is a placeholder - the actual endpoint would depend on your API
        // The API spec doesn't show a "get current user" endpoint
        const response = await fetch(`${API_BASE_URL}/khach-hang/me`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        
        if (response.ok) {
            currentUser = await response.json();
            // Update UI with user info if needed
        } else {
            // Token might be invalid
            logout();
        }
    } catch (error) {
        console.error('Error fetching user info:', error);
    }
}

// Login function
async function login(email, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        if (!response.ok) throw new Error('Login failed');
        
        const data = await response.json();
        authToken = data.access_token;
        
        // Save token to localStorage
        localStorage.setItem('authToken', authToken);
        
        // Update UI
        checkAuthStatus();
        closeModal(loginModal);
        showNotification('Đăng nhập thành công!');
        
        // Fetch user info
        fetchUserInfo();
    } catch (error) {
        console.error('Login error:', error);
        showNotification('Đăng nhập thất bại. Vui lòng thử lại.');
    }
}

// Register function
async function register(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/khach-hang`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });
        
        if (!response.ok) throw new Error('Registration failed');
        
        closeModal(registerModal);
        showNotification('Đăng ký thành công! Vui lòng đăng nhập.');
        openModal(loginModal);
    } catch (error) {
        console.error('Registration error:', error);
        showNotification('Đăng ký thất bại. Vui lòng thử lại.');
    }
}

// Logout function
function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('authToken');
    checkAuthStatus();
    showNotification('Đã đăng xuất!');
}

// Open modal
function openModal(modal) {
    modal.style.display = 'block';
}

// Close modal
function closeModal(modal) {
    modal.style.display = 'none';
}

// Search products
function searchProducts(query) {
    // This is a placeholder - the actual implementation would depend on your API
    // The API spec doesn't show a search endpoint
    
    // For now, we'll just filter the products on the client side
    // In a real application, you would send the search query to the server
    
    // Reset to first page and clear category filter
    currentPage = 1;
    currentCategory = null;
    
    // Update UI to show we're searching
    document.querySelectorAll('#categories-list li').forEach(li => {
        li.classList.remove('active');
    });
    document.querySelector('#categories-list li[data-category=""]').classList.add('active');
    
    // Load products (in a real app, you'd pass the search query to the API)
    loadProducts();
    
    // Show what we're searching for
    showNotification(`Tìm kiếm: ${query}`);
}

// Setup event listeners
function setupEventListeners() {
    // Pagination
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadProducts();
        }
    });
    
    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        loadProducts();
    });
    
    // Cart
    cartIcon.addEventListener('click', () => {
        renderCartItems();
        openModal(cartModal);
    });
    
    // Checkout
    checkoutBtn.addEventListener('click', () => {
        if (!authToken) {
            closeModal(cartModal);
            openModal(loginModal);
            showNotification('Vui lòng đăng nhập để thanh toán');
            return;
        }
        
        // Placeholder for checkout process
        showNotification('Chức năng thanh toán đang được phát triển');
    });
    
    // Auth
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(loginModal);
    });
    
    registerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(registerModal);
    });
    
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
    
    // Forms
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        login(email, password);
    });
    
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const userData = {
            ho: document.getElementById('register-ho').value,
            ten: document.getElementById('register-ten').value,
            email: document.getElementById('register-email').value,
            password: document.getElementById('register-password').value,
            SDT: document.getElementById('register-sdt').value
        };
        register(userData);
    });
    
    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            const modal = closeBtn.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
    
    // Search
    searchButton.addEventListener('click', () => {
        const query = searchInput.value.trim();
        if (query) {
            searchProducts(query);
        }
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchProducts(query);
            }
        }
    });
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);