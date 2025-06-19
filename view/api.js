const API_BASE_URL = "http://localhost:3000";

const getAuthToken = () => {
    return localStorage.getItem("authToken");
};

const fetchWithAuth = async (url, options = {}) => {
    const token = getAuthToken();
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
    }

    return response.json();
};

export const createSanPham = (createSanPhamDto) => {
    return fetchWithAuth(`${API_BASE_URL}/san-pham`, {
        method: "POST",
        body: JSON.stringify(createSanPhamDto),
    });
};

export const findAllSanPham = () => {
    return fetchWithAuth(`${API_BASE_URL}/san-pham`);
};

export const findSanPhamByPage = (stt) => {
    return fetchWithAuth(`${API_BASE_URL}/san-pham/page/${stt}`);
};

export const findSanPhamByName = (ten) => {
    return fetchWithAuth(`${API_BASE_URL}/san-pham/search?ten=${ten}`);
};

export const findSanPhamByDanhMuc = (danhMucId) => {
    return fetchWithAuth(`${API_BASE_URL}/san-pham/danh-muc/${danhMucId}`);
};

export const findOneSanPham = (id) => {
    return fetchWithAuth(`${API_BASE_URL}/san-pham/${id}`);
};

export const removeSanPham = (id) => {
    return fetchWithAuth(`${API_BASE_URL}/san-pham/${id}`, {
        method: "DELETE",
    });
};

export const login = (loginDto) => {
    return fetchWithAuth(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        body: JSON.stringify(loginDto),
    });
};

export const findAllTaiKhoan = () => {
    return fetchWithAuth(`${API_BASE_URL}/taikhoan`);
};

export const findOneTaiKhoan = (id) => {
    return fetchWithAuth(`${API_BASE_URL}/taikhoan/${id}`);
};

export const updateTaiKhoan = (id, updateTaiKhoanDto) => {
    return fetchWithAuth(`${API_BASE_URL}/taikhoan/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateTaiKhoanDto),
    });
};

export const removeTaiKhoan = (id) => {
    return fetchWithAuth(`${API_BASE_URL}/taikhoan/${id}`, {
        method: "DELETE",
    });
};

export const createDanhMuc = (createDanhMucDto) => {
    return fetchWithAuth(`${API_BASE_URL}/danh-muc`, {
        method: "POST",
        body: JSON.stringify(createDanhMucDto),
    });
};

export const findAllDanhMuc = () => {
    return fetchWithAuth(`${API_BASE_URL}/danh-muc`);
};

export const findOneDanhMuc = (tendanhmuc) => {
    return fetchWithAuth(`${API_BASE_URL}/danh-muc/${tendanhmuc}`);
};

export const updateDanhMuc = (id, updateDanhMucDto) => {
    return fetchWithAuth(`${API_BASE_URL}/danh-muc/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateDanhMucDto),
    });
};

export const removeDanhMuc = (id) => {
    return fetchWithAuth(`${API_BASE_URL}/danh-muc/${id}`, {
        method: "DELETE",
    });
};

export const createNhanVien = (createNhanVienDto) => {
    return fetchWithAuth(`${API_BASE_URL}/nhan-vien`, {
        method: "POST",
        body: JSON.stringify(createNhanVienDto),
    });
};

export const findAllNhanVien = () => {
    return fetchWithAuth(`${API_BASE_URL}/nhan-vien`);
};

export const findOneNhanVien = (id) => {
    return fetchWithAuth(`${API_BASE_URL}/nhan-vien/${id}`);
};

export const createDanhGia = (createDanhGiaDto) => {
    return fetchWithAuth(`${API_BASE_URL}/danh-gia`, {
        method: "POST",
        body: JSON.stringify(createDanhGiaDto),
    });
};

export const getDanhGiaBySanPham = (sanPhamId) => {
    return fetchWithAuth(`${API_BASE_URL}/danh-gia/san-pham/${sanPhamId}`);
};

export const getDanhGiaByKhachHang = (khachHangId) => {
    return fetchWithAuth(`${API_BASE_URL}/danh-gia/khach-hang/${khachHangId}`);
};

export const getSanPhamRating = (sanPhamId) => {
    return fetchWithAuth(`${API_BASE_URL}/danh-gia/rating/${sanPhamId}`);
};

export const findOneDanhGia = (id) => {
    return fetchWithAuth(`${API_BASE_URL}/danh-gia/${id}`);
};

export const removeDanhGia = (id) => {
    return fetchWithAuth(`${API_BASE_URL}/danh-gia/${id}`, {
        method: "DELETE",
    });
};

export const createThongTinLienHe = (createThongTinLienHeDto) => {
    return fetchWithAuth(`${API_BASE_URL}/thong-tin-lien-he`, {
        method: "POST",
        body: JSON.stringify(createThongTinLienHeDto),
    });
};

export const findAllThongTinLienHe = () => {
    return fetchWithAuth(`${API_BASE_URL}/thong-tin-lien-he`);
};

export const findOneThongTinLienHe = (id) => {
    return fetchWithAuth(`${API_BASE_URL}/thong-tin-lien-he/${id}`);
};

export const updateThongTinLienHe = (id, updateThongTinLienHeDto) => {
    return fetchWithAuth(`${API_BASE_URL}/thong-tin-lien-he/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updateThongTinLienHeDto),
    });
};

export const removeThongTinLienHe = (id) => {
    return fetchWithAuth(`${API_BASE_URL}/thong-tin-lien-he/${id}`, {
        method: "DELETE",
    });
};

export const registerKhachHang = (createKhachHangDto) => {
    return fetchWithAuth(`${API_BASE_URL}/khach-hang`, {
        method: "POST",
        body: JSON.stringify(createKhachHangDto),
    });
};

export const findAllKhachHang = () => {
    return fetchWithAuth(`${API_BASE_URL}/khach-hang`);
};

export const findOneKhachHang = (id) => {
    return fetchWithAuth(`${API_BASE_URL}/khach-hang/${id}`);
};

export const removeKhachHang = (id) => {
    return fetchWithAuth(`${API_BASE_URL}/khach-hang/${id}`, {
        method: "DELETE",
    });
};

export const addToCart = (addToCartDto) => {
    return fetchWithAuth(`${API_BASE_URL}/don-hang/cart/add`, {
        method: "POST",
        body: JSON.stringify(addToCartDto),
    });
};

export const getCart = () => {
    return fetchWithAuth(`${API_BASE_URL}/don-hang/cart`);
};

export const updateCartItem = (maSanPham, soLuong) => {
    return fetchWithAuth(`${API_BASE_URL}/don-hang/cart/update/${maSanPham}/${soLuong}`, {
        method: "PATCH",
    });
};

export const removeFromCart = (maSanPham) => {
    return fetchWithAuth(`${API_BASE_URL}/don-hang/cart/remove/${maSanPham}`, {
        method: "DELETE",
    });
};

export const clearCart = () => {
    return fetchWithAuth(`${API_BASE_URL}/don-hang/cart/clear`, {
        method: "DELETE",
    });
};

export const checkoutCart = (checkoutCartDto) => {
    return fetchWithAuth(`${API_BASE_URL}/don-hang/cart/checkout`, {
        method: "POST",
        body: JSON.stringify(checkoutCartDto),
    });
};