  const API_BASE_URL = "";

        // Global variables
    
        let cartCount = 0;
        let wishlistCount = 0;

        document.addEventListener('DOMContentLoaded', function () {
            initializeApp();
        });

        function initializeApp() {
            checkCustomerAuth();
            bindEvents();

            if (isCustomerAuthenticated()) {
                loadContent();
            }
        }

        function bindEvents() {
        
            document.getElementById('customerLoginBtn').addEventListener('click', showLoginModal);
            document.getElementById('customerRegisterBtn').addEventListener('click', showRegisterModal);
            document.getElementById('showLoginBtnMain').addEventListener('click', showLoginModal);
            document.getElementById('showLoginBtn').addEventListener('click', showLoginModal);
            document.getElementById('showRegisterBtn').addEventListener('click', showRegisterModal);
            document.getElementById('customerLogoutBtn').addEventListener('click', handleLogout);

            document.getElementById('customerLoginForm').addEventListener('submit', handleLogin);
            document.getElementById('customerRegisterForm').addEventListener('submit', handleRegister);

            document.querySelectorAll('.close').forEach(btn => {
                btn.addEventListener('click', closeModals);
            });

            window.addEventListener('click', function (event) {
                if (event.target.classList.contains('modal')) {
                    closeModals();
                }
            });

            // Search functionality
            document.getElementById('searchBtn').addEventListener('click', handleSearch);

            // Category header click
            document.querySelector('.category-header').addEventListener('click', loadAllProducts);
        }

        // Authentication functions
        function checkCustomerAuth() {
            const token = localStorage.getItem('customerAuthToken');
            if (!token) {
                showLoginRequired();
            } else {
                verifyToken(token);
            }
        }

        function isCustomerAuthenticated() {
            return localStorage.getItem('customerAuthToken') !== null;
        }

        function showLoginRequired() {
            document.getElementById('mainContent').style.display = 'none';
            document.getElementById('loginRequiredMessage').style.display = 'flex';
            updateAuthUI(false);
        }

        function showMainContent() {
            document.getElementById('mainContent').style.display = 'flex';
            document.getElementById('loginRequiredMessage').style.display = 'none';
            updateAuthUI(true);
        }

        function updateAuthUI(isLoggedIn) {
            const loginBtn = document.getElementById('customerLoginBtn');
            const registerBtn = document.getElementById('customerRegisterBtn');
            const customerInfo = document.getElementById('customerInfo');

            if (isLoggedIn) {
                loginBtn.style.display = 'none';
                registerBtn.style.display = 'none';
                customerInfo.style.display = 'flex';
                customerInfo.style.alignItems = 'center';

                const customerName = localStorage.getItem('customerName');
                document.getElementById('customerName').textContent = customerName || 'Khách hàng';
            } else {
                loginBtn.style.display = 'inline-block';
                registerBtn.style.display = 'inline-block';
                customerInfo.style.display = 'none';
            }
        }

        async function verifyToken(token) {
            try {
               

             
                const customerName = localStorage.getItem('customerName');
            
            
                showMainContent();
                loadContent();
            } catch (error) {
                console.error('Token verification failed:', error);
                localStorage.removeItem('customerAuthToken');
                localStorage.removeItem('customerName');
                showLoginRequired();
            }
        }

        // Modal functions
        function showLoginModal() {
            document.getElementById('customerLoginModal').style.display = 'block';
        }

        function showRegisterModal() {
            document.getElementById('customerRegisterModal').style.display = 'block';
        }

        function closeModals() {
            document.getElementById('customerLoginModal').style.display = 'none';
            document.getElementById('customerRegisterModal').style.display = 'none';
            document.getElementById('customerLoginForm').reset();
            document.getElementById('customerRegisterForm').reset();
        }

        // Auth handlers
        async function handleLogin(event) {
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

            
        




                localStorage.setItem('customerAuthToken', data.access_token);
                localStorage.setItem('customerName', username);
                
                showNotification('Đăng nhập thành công!', 'success');
                closeModals();
                showMainContent();
                loadContent();

            } catch (error) {
                console.error('Login error:', error);
                showNotification(error.message, 'error');
            }
        }

        async function handleRegister(event) {
            event.preventDefault();

            const tenKhachHang = document.getElementById('registerTenKhachHang').value;
            const sdt = document.getElementById('registerSdt').value;
            const tenDangNhap = document.getElementById('registerTenDangNhap').value;
            const matKhau = document.getElementById('registerMatKhau').value;

            if (!tenKhachHang || !sdt || !tenDangNhap || !matKhau) {
                showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/khach-hang`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        tenKhachHang,
                        sdt,
                        tenDangNhap,
                        matKhau
                    })
                });

                if (!response.ok) {
                    const errorData = await response.text();
                    throw new Error(errorData || 'Đăng ký thất bại');
                }

                showNotification('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
                closeModals();

                setTimeout(() => {
                    showLoginModal();
                }, 1500);

            } catch (error) {
                console.error('Registration error:', error);
                showNotification('Đăng ký thất bại: ' + error.message, 'error');
            }
        }

        function handleLogout() {
            localStorage.removeItem('customerAuthToken');
            localStorage.removeItem('customerName');
            showNotification('Đã đăng xuất!', 'success');
            showLoginRequired();
        }

        // Content loading functions
        async function loadContent() {
            await Promise.all([
                loadCategories(),
                loadProducts()
            ]);
            bindContentEvents();
        }

        async function loadCategories() {
            const categoryList = document.querySelector('.category-list');
            try {
                const response = await fetch(`${API_BASE_URL}/danh-muc`);
                const categories = await response.json();

                categoryList.innerHTML = '';
                categories.forEach(category => {
                    const li = document.createElement('li');
                    li.innerHTML = `<i class="fas fa-seedling"></i> ${category.tenDanhMuc}`;
                    li.setAttribute('data-id', category.id);
                    li.addEventListener('click', () => loadProductsByCategory(category.id, li));
                    categoryList.appendChild(li);
                });
            } catch (error) {
                console.error('Error loading categories:', error);
                categoryList.innerHTML = '<li>Không thể tải danh mục</li>';
            }
        }

        async function loadProducts() {
            const productsGrid = document.querySelector('.products-grid');
            try {
                const response = await fetch(`${API_BASE_URL}/san-pham`);
                const products = await response.json();
                renderProducts(products);
            } catch (error) {
                console.error('Error loading products:', error);
                productsGrid.innerHTML = '<div>Không thể tải sản phẩm</div>';
            }
        }

        async function loadProductsByCategory(categoryId, categoryElement) {
            // Update active category
            document.querySelectorAll('.category-list li').forEach(li => li.classList.remove('active'));
            categoryElement.classList.add('active');

            try {
                const response = await fetch(`${API_BASE_URL}/san-pham/danh-muc/${categoryId}`);
                const products = await response.json();
                renderProducts(products);
            } catch (error) {
                console.error('Error loading products by category:', error);
                document.querySelector('.products-grid').innerHTML = '<div>Không thể tải sản phẩm</div>';
            }
        }

        async function loadAllProducts() {
            document.querySelectorAll('.category-list li').forEach(li => li.classList.remove('active'));
            await loadProducts();
        }

        function renderProducts(products) {
            const productsGrid = document.querySelector('.products-grid');
            productsGrid.innerHTML = '';

            if (products.length === 0) {
                productsGrid.innerHTML = '<div style="text-align: center; color: #6b7280; grid-column: 1 / -1;">Không có sản phẩm nào</div>';
                return;
            }

            products.forEach(product => {
                const productElement = document.createElement('div');
                productElement.className = 'product';
                productElement.innerHTML = `
                    <img src="${product.hinhAnhs && product.hinhAnhs.length > 0 ? product.hinhAnhs[0].hinhAnh : 'https://vegina-store.myshopify.com/cdn/shop/products/25_525c2823-683a-445e-b187-6fe7ca3f5a8e.jpg?v=1620641853&width=720'}" 
                         alt="${product.ten}">
                    <div class="product-info">
                        <h4>${product.ten}</h4>
                        <p class="price">${product.gia?.toLocaleString('vi-VN') || 'Liên hệ'} VNĐ</p>
                        <div class="rating">
                            <span class="stars">★★★★★</span>
                            <span class="reviews">Chưa có đánh giá</span>
                        </div>
                    </div>
                `;

                productElement.addEventListener('click', () => {
                    window.location.href = `hang_hoa/index.html?product=${product.id}`;
                });

                productsGrid.appendChild(productElement);
            });
        }

        function bindContentEvents() {
            // Add hover effects to products
            document.querySelectorAll('.product').forEach(product => {
                product.addEventListener('mouseenter', function () {
                    this.style.transform = 'translateY(-8px)';
                });

                product.addEventListener('mouseleave', function () {
                    this.style.transform = 'translateY(0)';
                });
            });
        }

        function handleSearch() {
            const searchTerm = prompt('Tìm kiếm sản phẩm:');
            if (searchTerm) {
                console.log('Searching for:', searchTerm);
                showNotification('Tính năng tìm kiếm đang được phát triển', 'success');
            }
        }

        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
                ${message}
            `;

            document.body.appendChild(notification);

            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }

        // Add smooth scrolling
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