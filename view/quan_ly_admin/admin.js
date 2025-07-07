import { updateSanPham, createSanPham, findAllSanPham, findOneSanPham, removeSanPham, findSanPhamByName, uploadImage, login, findAllTaiKhoan, updateTaiKhoan, removeTaiKhoan, createDanhMuc, findAllDanhMuc, findOneDanhMuc, updateDanhMuc, removeDanhMuc, createNhanVien, findAllNhanVien, findOneNhanVien, updateNhanVien, removeNhanVien, createDanhGia, getDanhGiaBySanPham, getDanhGiaByKhachHang, getSanPhamRating, findOneDanhGia, removeDanhGia, createThongTinLienHe, findAllThongTinLienHe, findOneThongTinLienHe, updateThongTinLienHe, removeThongTinLienHe, registerKhachHang, findAllKhachHang, findOneKhachHang, removeKhachHang, addToCart, getCart, updateCartItem, removeFromCart, clearCart, checkoutCart, createKhuyenMai, findAllKhuyenMai, findOneKhuyenMai, updateKhuyenMai, removeKhuyenMai, createHistoryKhoHang, findAllHistoryKhoHang, findOneHistoryKhoHangBySanPhamId, findOneHistoryKhoHangById, statisticsKhoHang, getDonHang, addDonHang } from './api.js';

console.log('API imported:', { updateSanPham, createSanPham });
console.log('updateSanPham available:', typeof updateSanPham);

class AdminDashboard {
    constructor() {
        this.currentPage = 'overview';
        this.currentEditId = null;
        this.productImages = []; // Array lưu trữ đường dẫn ảnh
        this.init();
    }

    init() {
        this.checkAuth();
        this.bindEvents();
        this.loadOverviewData();
        this.bindDonHangEvents();
    }

    checkAuth() {
        const token = localStorage.getItem('authToken');
        if (!token) {
            this.showLoginModal();
        } else {
            this.showDashboard();
        }
    }

    showLoginModal() {
        document.getElementById('loginModal').style.display = 'block';
        document.getElementById('dashboard').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('dashboard').style.display = 'flex';
    }

    bindEvents() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.closest('.nav-link').dataset.page;
                this.navigateToPage(page);
                if (page === 'lich-su-kho-hang') {
                    this.loadHistoryKhoHang();
                }
            });
        });

        // Sidebar toggle
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('open');
            });
        }

        // Modal close buttons
        document.querySelectorAll('.close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Add buttons
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) addProductBtn.addEventListener('click', () => { this.showProductModal(); });
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) addCategoryBtn.addEventListener('click', () => { this.showCategoryModal(); });
        const addEmployeeBtn = document.getElementById('addEmployeeBtn');
        if (addEmployeeBtn) addEmployeeBtn.addEventListener('click', () => { this.showEmployeeModal(); });

        // Cancel buttons
        const cancelProductBtn = document.getElementById('cancelProductBtn');
        if (cancelProductBtn) cancelProductBtn.addEventListener('click', () => { document.getElementById('productModal').style.display = 'none'; });
        const cancelCategoryBtn = document.getElementById('cancelCategoryBtn');
        if (cancelCategoryBtn) cancelCategoryBtn.addEventListener('click', () => { document.getElementById('categoryModal').style.display = 'none'; });
        const cancelEmployeeBtn = document.getElementById('cancelEmployeeBtn');
        if (cancelEmployeeBtn) cancelEmployeeBtn.addEventListener('click', () => { document.getElementById('employeeModal').style.display = 'none'; });

        // Form submissions
        const productForm = document.getElementById('productForm');
        if (productForm) productForm.addEventListener('submit', (e) => { e.preventDefault(); this.handleProductSubmit(); });
        const categoryForm = document.getElementById('categoryForm');
        if (categoryForm) categoryForm.addEventListener('submit', (e) => { e.preventDefault(); this.handleCategorySubmit(); });
        const employeeForm = document.getElementById('employeeForm');
        if (employeeForm) employeeForm.addEventListener('submit', (e) => { e.preventDefault(); this.handleEmployeeSubmit(); });

        // Search
        const searchProductBtn = document.getElementById('searchProductBtn');
        if (searchProductBtn) searchProductBtn.addEventListener('click', () => { this.searchProducts(); });
        const productSearch = document.getElementById('productSearch');
        if (productSearch) productSearch.addEventListener('keypress', (e) => { if (e.key === 'Enter') { this.searchProducts(); } });

        // Tab khuyến mãi
        const promoTab = document.querySelector('[data-page="promotions"]');
        if (promoTab) promoTab.addEventListener('click', (e) => { e.preventDefault(); this.navigateToPage('promotions'); });
        // Nút thêm khuyến mãi
        const addPromotionBtn = document.getElementById('addPromotionBtn');
        if (addPromotionBtn) addPromotionBtn.addEventListener('click', () => { this.showAddPromotion(); });
        // Form modal khuyến mãi
        const promotionForm = document.getElementById('promotionForm');
        if (promotionForm) promotionForm.addEventListener('submit', (e) => { this.handlePromotionFormSubmit(e); });
        // Nút đóng modal
        const promoModalClose = document.querySelector('#promotionModal .close');
        if (promoModalClose) promoModalClose.addEventListener('click', () => { document.getElementById('promotionModal').style.display = 'none'; });

        // Nút mở modal
        const addHistoryBtn = document.getElementById('addHistoryBtn');
        if (addHistoryBtn) {
            addHistoryBtn.addEventListener('click', () => {
                document.getElementById('historyModal').style.display = 'block';
            });
        }

        // Nút đóng modal
        const closeHistoryModal = document.getElementById('closeHistoryModal');
        if (closeHistoryModal) {
            closeHistoryModal.addEventListener('click', () => {
                document.getElementById('historyModal').style.display = 'none';
            });
        }
        const cancelHistoryBtn = document.getElementById('cancelHistoryBtn');
        if (cancelHistoryBtn) {
            cancelHistoryBtn.addEventListener('click', () => {
                document.getElementById('historyModal').style.display = 'none';
            });
        }

        // Xử lý submit form
        const addHistoryForm = document.getElementById('addHistoryKhoHangForm');
        if (addHistoryForm) {
            addHistoryForm.addEventListener('submit', async (e) => {
                e.preventDefault();



                try {
                    await createHistoryKhoHang({
                        sanPhamId: Number(document.getElementById('historySanPhamId').value),
                        loaiGiaoDich: document.getElementById('historyLoaiGiaoDich').value,
                        soLuongThayDoi: Number(document.getElementById('historySoLuongThayDoi').value)
                        // nếu backend yêu cầu
                    });
                    document.getElementById('historyModal').style.display = 'none';
                    if (typeof adminDashboard?.loadHistoryKhoHang === 'function') {
                        adminDashboard.loadHistoryKhoHang();
                    }
                    addHistoryForm.reset();
                } catch (err) {
                    alert('Lỗi thêm lịch sử kho hàng: ' + err.message);
                }
            });
        }
        // Mở modal
        const addDonHangBtn = document.getElementById('addDonHangBtn');
        if (addDonHangBtn) {
            addDonHangBtn.addEventListener('click', () => {
                document.getElementById('donHangModal').style.display = 'block';
            });
        }

        // Đóng modal
        const closeDonHangModal = document.getElementById('closeDonHangModal');
        if (closeDonHangModal) {
            closeDonHangModal.addEventListener('click', () => {
                document.getElementById('donHangModal').style.display = 'none';
            });
        }
        const cancelDonHangBtn = document.getElementById('cancelDonHangBtn');
        if (cancelDonHangBtn) {
            cancelDonHangBtn.addEventListener('click', () => {
                document.getElementById('donHangModal').style.display = 'none';
            });
        }

        // Xử lý submit form
        const addDonHangForm = document.getElementById('addDonHangForm');
        if (addDonHangForm) {
            addDonHangForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                // Lấy dữ liệu chi tiết đơn hàng
                const chiTietRows = document.querySelectorAll('#chiTietDonHangList .chi-tiet-row');
                const chiTietDonHangs = Array.from(chiTietRows).map(row => ({
                    sanPhamId: Number(row.querySelector('.chiTietSanPhamId').value),
                    soLuong: Number(row.querySelector('.chiTietSoLuong').value)
                }));

                // Lấy dữ liệu từ các input
                const data = {
                    khachHangId: Number(document.getElementById('donHangKhachHangId').value),
                    tenDonHang: document.getElementById('donHangTen').value,
                    phuongThucThanhToan: document.getElementById('donHangPhuongThuc').value,
                    ngayChuanBiHang: document.getElementById('donHangNgayChuanBi').value,
                    ngayNhanHang: document.getElementById('donHangNgayNhan').value,
                    donViVanChuyen: document.getElementById('donHangDonViVC').value,
                    chiTietDonHangs,
                    tenNguoiNhan: document.getElementById('donHangTenNguoiNhan').value,
                    sdtNguoiNhan: document.getElementById('donHangSdtNguoiNhan').value,
                    diaChiGiaoHang: document.getElementById('donHangDiaChi').value,
                    ghiChu: document.getElementById('donHangGhiChu').value
                };

                try {
                    await addDonHang(data);
                    document.getElementById('donHangModal').style.display = 'none';
                    if (typeof adminDashboard?.loadDonHang === 'function') {
                        adminDashboard.loadDonHang();
                    }
                    addDonHangForm.reset();
                    // Xóa các dòng chi tiết ngoài dòng đầu tiên
                    const list = document.getElementById('chiTietDonHangList');
                    while (list.children.length > 1) list.lastChild.remove();
                } catch (err) {
                    alert('Lỗi thêm đơn hàng: ' + err.message);
                }
            });
        }

        document.querySelector('[data-page="Don-hang"]').addEventListener('click', async () => {
            await this.loadDonHang();
        });
    }

    async handleLogin() {
        const tenDangNhap = document.getElementById('username').value;
        const matKhau = document.getElementById('password').value;

        try {
            const response = await login({ tenDangNhap, matKhau });
            localStorage.setItem('authToken', response.access_token);
            this.showNotification('Đăng nhập thành công!', 'success');
            this.showDashboard();
            this.loadOverviewData();
        } catch (error) {
            this.showNotification('Đăng nhập thất bại: ' + error.message, 'error');
        }
    }

    handleLogout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('adminName');
        this.showLoginModal();
        this.showNotification('Đã đăng xuất!', 'success');
    }

    navigateToPage(page) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const nav = document.querySelector(`[data-page="${page}"]`);
        if (nav) nav.classList.add('active');

        // Update page content
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });
        const pageDiv = document.getElementById(`${page}Page`);
        if (pageDiv) pageDiv.classList.add('active');

        this.loadPageData(page);
    }

    async loadPageData(page) {
        try {
            switch (page) {
                case 'overview':
                    await this.loadOverviewData();
                    break;
                case 'products':
                    await this.loadProducts();
                    break;
                case 'categories':
                    await this.loadCategories();
                    break;
                case 'customers':
                    await this.loadCustomers();
                    break;
                case 'employees':
                    await this.loadEmployees();
                    break;
                case 'reviews':
                    await this.loadReviews();
                    break;
                case 'promotions':
                    await this.loadPromotions();
                    break;
                case 'accounts':
                    await this.loadAccounts();
                    break;
                case 'Don-hang':
                    await this.loadDonHang();
                    break;
            }
        } catch (error) {
            this.showNotification('Lỗi khi tải dữ liệu trang: ' + error.message, 'error');
        }
    }

    async loadOverviewData() {
        try {
            const [products, customers, categories] = await Promise.all([
                findAllSanPham().catch(() => []),
                findAllKhachHang().catch(() => []),
                findAllDanhMuc().catch(() => [])
            ]);

            document.getElementById('totalProducts').textContent = products.length || 0;
            document.getElementById('totalCustomers').textContent = customers.length || 0;
            document.getElementById('totalCategories').textContent = categories.length || 0;
            document.getElementById('totalReviews').textContent = '0'; // Will be updated when reviews are loaded
        } catch (error) {
            console.error('Error loading overview data:', error);
        }
    }

    async loadProducts() {
        try {
            const products = await findAllSanPham();
            const categories = await findAllDanhMuc();

            this.renderProductsTable(products);
            this.populateCategorySelect(categories);
        } catch (error) {
            this.showNotification('Lỗi tải danh sách sản phẩm: ' + error.message, 'error');
        }
    }

    renderProductsTable(products) {
        const tbody = document.querySelector('#productsTable tbody');
        tbody.innerHTML = '';

        products.forEach(product => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.ten}</td>
                <td>${product.danhMuc?.tenDanhMuc || 'N/A'}</td>
                <td>${product.gia?.toLocaleString('vi-VN')} VNĐ</td>
                <td><span class="status-badge status-active">Hoạt động</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="adminDashboard.editProduct(${product.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteProduct(${product.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadCategories() {
        try {
            const categories = await findAllDanhMuc();
            this.renderCategoriesTable(categories);
        } catch (error) {
            this.showNotification('Lỗi tải danh sách danh mục: ' + error.message, 'error');
        }
    }

    renderCategoriesTable(categories) {
        const tbody = document.querySelector('#categoriesTable tbody');
        tbody.innerHTML = '';

        categories.forEach(category => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${category.id}</td>
                <td>${category.tenDanhMuc}</td>
                <td>${category.moTa || 'N/A'}</td>
                
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="adminDashboard.editCategory(${category.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteCategory(${category.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadCustomers() {
        try {
            const customers = await findAllKhachHang();
            this.renderCustomersTable(customers);
        } catch (error) {
            this.showNotification('Lỗi tải danh sách khách hàng: ' + error.message, 'error');
        }
    }

    renderCustomersTable(customers) {
        const tbody = document.querySelector('#customersTable tbody');
        tbody.innerHTML = '';

        customers.forEach(customer => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${customer.id}</td>
                <td>${customer.tenKhachHang}</td>
                
                <td>${customer.sdt || 'N/A'}</td>
           
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteCustomer(${customer.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadEmployees() {
        try {
            const employees = await findAllNhanVien();
            this.renderEmployeesTable(employees);
        } catch (error) {
            this.showNotification('Lỗi tải danh sách nhân viên: ' + error.message, 'error');
        }
    }

    renderEmployeesTable(employees) {
        const tbody = document.querySelector('#employeesTable tbody');
        tbody.innerHTML = '';

        employees.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.tenNhanVien}</td>
                <td>${employee.vaiTro}</td>
                <td>${employee.diaChi}</td>
                <td>${employee.sdt || 'N/A'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="adminDashboard.editEmployee(${employee.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteEmployee(${employee.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async loadReviews() {
        // This would need to be implemented based on your API structure
        const tbody = document.querySelector('#reviewsTable tbody');
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Chưa có dữ liệu đánh giá</td></tr>';
    }

    async loadAccounts() {
        try {
            const accounts = await findAllTaiKhoan();
            this.renderAccountsTable(accounts);
        } catch (error) {
            this.showNotification('Lỗi tải danh sách tài khoản: ' + error.message, 'error');
        }
    }

    renderAccountsTable(accounts) {
        const tbody = document.querySelector('#accountsTable tbody');
        tbody.innerHTML = '';

        accounts.forEach(account => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${account.id}</td>
                <td>${account.tenDangNhap}</td>
                <td>${account.email}</td>
                <td>${account.loai}</td>
                <td><span class="status-badge status-active">Hoạt động</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-warning" onclick="adminDashboard.editAccount(${account.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="adminDashboard.deleteAccount(${account.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Modal functions
    showProductModal(product = null) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');

        if (product) {
            title.textContent = 'Sửa sản phẩm';
            document.getElementById('productName').value = product.ten || '';
            document.getElementById('productPrice').value = product.gia || '';
            document.getElementById('productDescription').value = product.moTa || '';
            document.getElementById('productQuantity').value = product.soLuongHienCon || 0;
            document.getElementById('productExpiry').value = product.hanSuDung || '';
            document.getElementById('productManufacture').value = product.ngaySanXuat || '';

            // Set category if available
            if (product.danhMucId) {
                document.getElementById('productCategory').value = product.danhMucId;
            }

            this.currentEditId = product.id;
        } else {
            title.textContent = 'Thêm sản phẩm';
            form.reset();
            this.currentEditId = null;
        }

        modal.style.display = 'block';
    }

    showCategoryModal(category = null) {
        const modal = document.getElementById('categoryModal');
        const title = document.getElementById('categoryModalTitle');
        const form = document.getElementById('categoryForm');

        if (category) {
            title.textContent = 'Sửa danh mục';
            document.getElementById('categoryName').value = category.ten;
            document.getElementById('categoryDescription').value = category.moTa || '';
            this.currentEditId = category.id;
        } else {
            title.textContent = 'Thêm danh mục';
            form.reset();
            this.currentEditId = null;
        }

        modal.style.display = 'block';
    }

    showEmployeeModal(employee = null) {
        const modal = document.getElementById('employeeModal');
        const title = document.getElementById('employeeModalTitle');
        const form = document.getElementById('employeeForm');

        if (employee) {
            title.textContent = 'Sửa nhân viên';
            document.getElementById('employeeName').value = employee.hoTen;
            document.getElementById('employeePosition').value = employee.chucVu;
            document.getElementById('employeeEmail').value = employee.email;
            document.getElementById('employeePhone').value = employee.soDienThoai || '';
            this.currentEditId = employee.id;
        } else {
            title.textContent = 'Thêm nhân viên';
            form.reset();
            this.currentEditId = null;
        }

        modal.style.display = 'block';
    }

    async populateCategorySelect(categories) {
        const select = document.getElementById('productCategory');
        select.innerHTML = '<option value="">Chọn danh mục</option>';

        categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.tenDanhMuc;
            select.appendChild(option);
        });
    }

    // Form handlers
    async handleProductSubmit() {
        const imageInput = document.getElementById('productImage');
        let imageUrls = [];
        if (imageInput && imageInput.files.length > 0) {
            const uploadPromises = Array.from(imageInput.files).map(file => {
                const formData = new FormData();
                formData.append('key', '5fd16c9768b32d05ff318d4826ef0712');
                formData.append('image', file);
                return uploadImage(formData);
            });
            try {
                const uploadResponses = await Promise.all(uploadPromises);
                imageUrls = uploadResponses.map(res => res.data.url);
            } catch (e) {
                this.showNotification('Lỗi upload ảnh: ' + e.message, 'error');
                return;
            }
        }
        const productData = {
            ten: document.getElementById('productName').value,
            gia: parseFloat(document.getElementById('productPrice').value),
            moTa: document.getElementById('productDescription').value,
            soLuongHienCon: parseInt(document.getElementById('productQuantity').value) || 0,
            hanSuDung: document.getElementById('productExpiry').value,
            ngaySanXuat: document.getElementById('productManufacture').value,
            danhMucId: parseInt(document.getElementById('productCategory').value),
            hinhAnhs: imageUrls
        };
        console.log('Product data:', productData);
        console.log('API object:', { updateSanPham, createSanPham });
        console.log('updateSanPham function:', updateSanPham);
        try {
            if (this.currentEditId) {
                console.log('Updating product with ID:', this.currentEditId);
                console.log('Product data being sent:', productData);
                console.log('Current edit ID type:', typeof this.currentEditId);

                // First check if the product exists
                try {
                    const existingProduct = await findOneSanPham(this.currentEditId);
                    console.log('Existing product found:', existingProduct);
                } catch (checkError) {
                    console.error('Product not found:', checkError);
                    this.showNotification('Sản phẩm không tồn tại!', 'error');
                    return;
                }

                await updateSanPham(this.currentEditId, productData);
                this.showNotification('Cập nhật sản phẩm thành công!', 'success');
            } else {
                console.log('Creating new product with data:', productData);
                await createSanPham(productData);
                this.showNotification('Thêm sản phẩm thành công!', 'success');
            }
            document.getElementById('productModal').style.display = 'none';
            this.loadProducts();
        } catch (error) {
            console.error('Error in handleProductSubmit:', error);
            console.error('Error details:', {
                currentEditId: this.currentEditId,
                productData: productData,
                errorMessage: error.message
            });
            this.showNotification('Lỗi: ' + error.message, 'error');
        }
    }

    async handleCategorySubmit() {
        const categoryData = {
            tenDanhMuc: document.getElementById('categoryName').value,
            moTa: document.getElementById('categoryDescription').value
        };

        try {
            if (this.currentEditId) {
                await updateDanhMuc(this.currentEditId, categoryData);
                this.showNotification('Cập nhật danh mục thành công!', 'success');
            } else {
                await createDanhMuc(categoryData);
                this.showNotification('Thêm danh mục thành công!', 'success');
            }

            document.getElementById('categoryModal').style.display = 'none';
            this.loadCategories();
        } catch (error) {
            this.showNotification('Lỗi: ' + error.message, 'error');
        }
    }

    async handleEmployeeSubmit() {
        const employeeData = {
            tenNhanVien: document.getElementById('employeeName').value,
            vaiTro: document.getElementById('employeePosition').value,
            sdt: document.getElementById('employeePhone').value,
            diaChi: document.getElementById('employeeAddress').value || '',
            tenDangNhap: document.getElementById('employeeUsername').value,
            matKhau: document.getElementById('employeePassword').value
        };

        try {
            if (this.currentEditId) {
                await updateNhanVien(this.currentEditId, employeeData);
                this.showNotification('Cập nhật nhân viên thành công!', 'success');
            } else {
                await createNhanVien(employeeData);
                this.showNotification('Thêm nhân viên thành công!', 'success');
            }

            document.getElementById('employeeModal').style.display = 'none';
            this.loadEmployees();
        } catch (error) {
            this.showNotification('Lỗi: ' + error.message, 'error');
        }
    }

    // Search function
    async searchProducts() {
        const searchTerm = document.getElementById('productSearch').value;
        if (!searchTerm.trim()) {
            this.loadProducts();
            return;
        }

        try {
            const products = await findSanPhamByName(searchTerm);
            this.renderProductsTable(products);
        } catch (error) {
            this.showNotification('Lỗi tìm kiếm: ' + error.message, 'error');
        }
    }

    // Delete functions
    async deleteProduct(id) {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            try {
                await removeSanPham(id);
                this.showNotification('Xóa sản phẩm thành công!', 'success');
                this.loadProducts();
            } catch (error) {
                this.showNotification('Lỗi xóa sản phẩm: ' + error.message, 'error');
            }
        }
    }

    async deleteCategory(id) {
        if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            try {
                await removeDanhMuc(id);
                this.showNotification('Xóa danh mục thành công!', 'success');
                this.loadCategories();
            } catch (error) {
                this.showNotification('Lỗi xóa danh mục: ' + error.message, 'error');
            }
        }
    }

    async deleteCustomer(id) {
        if (confirm('Bạn có chắc chắn muốn xóa khách hàng này?')) {
            try {
                await removeKhachHang(id);
                this.showNotification('Xóa khách hàng thành công!', 'success');
                this.loadCustomers();
            } catch (error) {
                this.showNotification('Lỗi xóa khách hàng: ' + error.message, 'error');
            }
        }
    }

    async deleteEmployee(id) {
        if (confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
            try {
                await removeNhanVien(id);
                this.showNotification('Xóa nhân viên thành công!', 'success');
                this.loadEmployees();
            } catch (error) {
                this.showNotification('Lỗi xóa nhân viên: ' + error.message, 'error');
            }
        }
    }

    async deleteAccount(id) {
        if (confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
            try {
                await removeTaiKhoan(id);
                this.showNotification('Xóa tài khoản thành công!', 'success');
                this.loadAccounts();
            } catch (error) {
                this.showNotification('Lỗi xóa tài khoản: ' + error.message, 'error');
            }
        }
    }

    // Edit functions
    async editProduct(id) {
        try {
            const product = await findOneSanPham(id);
            this.showProductModal(product);
        } catch (error) {
            this.showNotification('Lỗi tải thông tin sản phẩm: ' + error.message, 'error');
        }
    }

    async editCategory(id) {
        try {
            const category = await findOneDanhMuc(id);
            this.showCategoryModal(category);
        } catch (error) {
            this.showNotification('Lỗi tải thông tin danh mục: ' + error.message, 'error');
        }
    }

    async editEmployee(id) {
        try {
            const employee = await findOneNhanVien(id);
            this.showEmployeeModal(employee);
        } catch (error) {
            this.showNotification('Lỗi tải thông tin nhân viên: ' + error.message, 'error');
        }
    }

    async editAccount(id) {
        try {
            const account = await findOneTaiKhoan(id);
            // You can implement account editing modal here
            this.showNotification('Chức năng sửa tài khoản sẽ được triển khai sớm!', 'warning');
        } catch (error) {
            this.showNotification('Lỗi tải thông tin tài khoản: ' + error.message, 'error');
        }
    }

    // Notification system
    showNotification(message, type = 'success') {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }

    // --- Khuyến mãi ---
    async loadPromotions() {
        const promotions = await findAllKhuyenMai();
        this.renderPromotionsTable(promotions);
    }

    renderPromotionsTable(promotions) {
        const tbody = document.querySelector('#promotionsTable tbody');
        tbody.innerHTML = '';
        promotions.forEach(promo => {
            const productNames = (promo.sanPhams || []).map(p => p.ten).join(', ');
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${promo.id}</td>
               
                <td>${promo.moTa || ''}</td>
                <td>${promo.ngayBatDau ? new Date(promo.ngayBatDau).toLocaleDateString('vi-VN') : ''}</td>
                <td>${promo.ngayKetThuc ? new Date(promo.ngayKetThuc).toLocaleDateString('vi-VN') : ''}</td>
                <td>${promo.phanTramGiam || ''}%</td>
                <td>${productNames}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="adminDashboard.showEditPromotion(${promo.id})">Sửa</button>
                    <button class="btn btn-sm btn-danger" onclick="adminDashboard.deletePromotion(${promo.id})">Xóa</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    async loadProductOptions(selectedIds = []) {
        const products = await findAllSanPham();
        const select = document.getElementById('promotionProducts');
        select.innerHTML = '';
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.ten;
            if (selectedIds.includes(product.id)) option.selected = true;
            select.appendChild(option);
        });
    }

    showAddPromotion() {
        document.getElementById('promotionModalTitle').textContent = 'Thêm khuyến mãi';
        document.getElementById('promotionForm').reset();
        document.getElementById('promotionId').value = '';
        this.loadProductOptions();
        document.getElementById('promotionModal').style.display = 'block';
    }

    showEditPromotion(id) {
        findOneKhuyenMai(id).then(async promo => {
            document.getElementById('promotionModalTitle').textContent = 'Sửa khuyến mãi';
            document.getElementById('promotionId').value = promo.id;
            document.getElementById('promotionDesc').value = promo.moTa || '';
            document.getElementById('promotionStart').value = promo.ngayBatDau ? promo.ngayBatDau.substr(0, 10) : '';
            document.getElementById('promotionEnd').value = promo.ngayKetThuc ? promo.ngayKetThuc.substr(0, 10) : '';
            document.getElementById('promotionPercent').value = promo.phanTramGiam || '';
            const selectedIds = (promo.sanPhams || []).map(p => p.id);
            await this.loadProductOptions(selectedIds);
            document.getElementById('promotionModal').style.display = 'block';
        });
    }

    async deletePromotion(id) {
        if (confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
            await removeKhuyenMai(id);
            this.loadPromotions();
        }
    }

    async handlePromotionFormSubmit(event) {
        event.preventDefault();
        const id = document.getElementById('promotionId').value;
        const moTa = document.getElementById('promotionDesc').value;
        const ngayBatDau = document.getElementById('promotionStart').value;
        const ngayKetThuc = document.getElementById('promotionEnd').value;
        const phanTramGiam = document.getElementById('promotionPercent').value;
        const select = document.getElementById('promotionProducts');
        const sanPhamIds = Array.from(select.selectedOptions).map(opt => Number(opt.value));
        const data = { phanTramGiam: Number(phanTramGiam), moTa, ngayBatDau, ngayKetThuc, sanPhamIds };
        console.log(data)
        if (id) {
            await updateKhuyenMai(id, data);
        } else {
            await createKhuyenMai(data);
        }
        document.getElementById('promotionModal').style.display = 'none';
        this.loadPromotions();
    }

    async loadHistoryKhoHang() {
        const data = await findAllHistoryKhoHang();
        const tbody = document.querySelector('#lich-su-kho-hang-table tbody');
        tbody.innerHTML = '';
        data.forEach(item => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${item.id}</td>
                <td>${item.sanPhamId}</td>
                <td>${item.loaiGiaoDich}</td>
                <td>${item.soLuongThayDoi}</td>
                <td>${item.tonKhoSauCung}</td>
                <td>${new Date(item.ngayThucHien).toLocaleString()}</td>
                <td>${item.nhanVienId}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    async loadDonHang() {
        const donHangs = await getDonHang();
        const tbody = document.querySelector('#donHangTable tbody');
        tbody.innerHTML = '';
        donHangs.forEach(donHang => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${donHang.id}</td>
                <td>${donHang.khachHang?.tenKhachHang || ''}</td>
                <td>${donHang.ngayChuanBiHang ? new Date(donHang.ngayChuanBiHang).toLocaleDateString() : ''}</td>
                <td>${donHang.tongTien || ''}</td>
                <td>${donHang.trangThaiDonHang || ''}</td>
                <td>
                    <button class="btn btn-info btn-sm xemDonHangBtn" data-id="${donHang.id}">Xem</button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    renderChiTietDonHang(donHang) {
        const content = document.getElementById('chiTietDonHangContent');
        content.innerHTML = `
            <p><b>Mã đơn hàng:</b> ${donHang.id}</p>
            <p><b>Tên đơn hàng:</b> ${donHang.tenDonHang}</p>
            <p><b>Khách hàng:</b> ${donHang.khachHang?.tenKhachHang || ''} (ID: ${donHang.khachHang?.id || ''})</p>
            <p><b>SĐT:</b> ${donHang.khachHang?.sdt || ''}</p>
            <p><b>Ngày chuẩn bị:</b> ${donHang.ngayChuanBiHang ? new Date(donHang.ngayChuanBiHang).toLocaleDateString() : ''}</p>
            <p><b>Ngày nhận:</b> ${donHang.ngayNhanHang ? new Date(donHang.ngayNhanHang).toLocaleDateString() : ''}</p>
            <p><b>Đơn vị vận chuyển:</b> ${donHang.donViVanChuyen}</p>
            <p><b>Phương thức thanh toán:</b> ${donHang.phuongThucThanhToan}</p>
            <p><b>Trạng thái:</b> ${donHang.trangThaiDonHang}</p>
            <p><b>Tổng tiền:</b> ${donHang.tongTien}</p>
            <p><b>Người nhận:</b> ${donHang.thongTinLienHe?.tenNguoiNhan || ''}</p>
            <p><b>SĐT người nhận:</b> ${donHang.thongTinLienHe?.sdt || ''}</p>
            <p><b>Địa chỉ giao hàng:</b> ${donHang.thongTinLienHe?.diaChi || ''}</p>
            <p><b>Ghi chú:</b> ${donHang.thongTinLienHe?.ghiChu || ''}</p>
            <h4>Chi tiết sản phẩm:</h4>
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Mã SP</th>
                        <th>Đơn giá</th>
                        <th>Số lượng</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
                    ${donHang.chiTietDonHangs.map(ct => `
                        <tr>
                            <td>${ct.maSanPham}</td>
                            <td>${ct.donGia}</td>
                            <td>${ct.soLuong}</td>
                            <td>${ct.thanhTien}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    bindDonHangEvents = () => {
        // Sự kiện xem chi tiết đơn hàng
        document.addEventListener('click', async (e) => {
            if (e.target.classList.contains('xemDonHangBtn')) {
                console.log('Đã bấm nút Xem đơn hàng');
                const id = e.target.getAttribute('data-id');
                const donHangs = await getDonHang();
                const donHang = donHangs.find(dh => dh.id == id);
                if (donHang) {
                    this.renderChiTietDonHang(donHang);
                    document.getElementById('chiTietDonHangModal').style.display = 'block';
                }
            }
        });
        // Đóng modal chi tiết đơn hàng
        const closeBtn = document.getElementById('closeChiTietDonHangModal');
        if (closeBtn) {
            closeBtn.onclick = function () {
                document.getElementById('chiTietDonHangModal').style.display = 'none';
            };
        }
        // Thêm dòng chi tiết sản phẩm trong modal thêm đơn hàng
        const addChiTietBtn = document.getElementById('addChiTietBtn');
        if (addChiTietBtn) {
            addChiTietBtn.onclick = function () {
                const list = document.getElementById('chiTietDonHangList');
                const row = document.createElement('div');
                row.className = 'chi-tiet-row';
                row.innerHTML = `
                    <input type="number" class="chiTietSanPhamId" placeholder="Sản phẩm ID" required>
                    <input type="number" class="chiTietSoLuong" placeholder="Số lượng" required>
                    <button type="button" class="btn btn-danger btn-sm removeChiTietBtn">X</button>
                `;
                list.appendChild(row);
                row.querySelector('.removeChiTietBtn').onclick = function () {
                    row.remove();
                };
            };
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.adminDashboard = new AdminDashboard();
});

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);
