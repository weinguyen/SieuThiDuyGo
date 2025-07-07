document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = ""
  let cartData = null
  let isLoggedIn = false
  let authToken = null

  // Initialize
  init()

  function init() {
    checkAuthStatus()
    setupEventListeners()
    if (isLoggedIn) {
      loadCart()
    } else {
      showLoginRequired()
    }
  }

  function checkAuthStatus() {
    authToken = localStorage.getItem("customerAuthToken")
    isLoggedIn = !!authToken

    const loginBtn = document.getElementById("loginBtn")
    const registerBtn = document.getElementById("registerBtn")
    const logoutBtn = document.getElementById("logoutBtn")

    if (isLoggedIn) {
      loginBtn.style.display = "none"
      registerBtn.style.display = "none"
      logoutBtn.style.display = "block"
    } else {
      loginBtn.style.display = "block"
      registerBtn.style.display = "block"
      logoutBtn.style.display = "none"
    }
  }

  function setupEventListeners() {
    // Login modal
    const loginBtn = document.getElementById("loginBtn")
    const loginModal = document.getElementById("loginModal")
    const closeModal = document.querySelector(".close")
    const loginForm = document.getElementById("loginForm")
    const logoutBtn = document.getElementById("logoutBtn")

    loginBtn.addEventListener("click", (e) => {
      e.preventDefault()
      loginModal.style.display = "block"
    })

    closeModal.addEventListener("click", () => {
      loginModal.style.display = "none"
    })

    window.addEventListener("click", (e) => {
      if (e.target === loginModal) {
        loginModal.style.display = "none"
      }
    })

    loginForm.addEventListener("submit", handleLogin)
    logoutBtn.addEventListener("click", handleLogout)

    // Cart actions
    const clearCartBtn = document.getElementById("clearCartBtn")
    const updateCartBtn = document.getElementById("updateCartBtn")
    const checkoutBtn = document.getElementById("checkoutBtn")

    if (clearCartBtn) {
      clearCartBtn.addEventListener("click", clearCart)
    }
    if (updateCartBtn) {
      updateCartBtn.addEventListener("click", updateCart)
    }
    if (checkoutBtn) {
      checkoutBtn.addEventListener("click", proceedToCheckout)
    }
  }

  async function handleLogin(e) {
    e.preventDefault()

    const username = document.getElementById("loginUsername").value
    const password = document.getElementById("loginPassword").value

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tenDangNhap: username,
          matKhau: password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        authToken = data.access_token
        localStorage.setItem("customerAuthToken", authToken)
        isLoggedIn = true

        document.getElementById("loginModal").style.display = "none"
        checkAuthStatus()
        loadCart()
        showNotification("Đăng nhập thành công!", "success")
      } else {
        showNotification("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!", "error")
      }
    } catch (error) {
      console.error("Login error:", error)
      showNotification("Có lỗi xảy ra khi đăng nhập!", "error")
    }
  }

  function handleLogout() {
    localStorage.removeItem("customerAuthToken")
    authToken = null
    isLoggedIn = false
    checkAuthStatus()
    showLoginRequired()
    showNotification("Đã đăng xuất thành công!", "success")
  }

  function showLoginRequired() {
    const cartContent = document.getElementById("cartContent")
    cartContent.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-user-lock"></i>
                <h2>Vui lòng đăng nhập</h2>
                <p>Bạn cần đăng nhập để xem giỏ hàng</p>
                <button class="continue-shopping-btn" onclick="document.getElementById('loginBtn').click()">
                    Đăng nhập ngay
                </button>
            </div>
        `
  }

  async function loadCart() {
    try {
      const response = await fetch(`${API_BASE_URL}/don-hang/cart`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        cartData = await response.json()
        renderCart()
        updateCartBadge()
      } else if (response.status === 404) {
        // No cart found - show empty cart
        showEmptyCart()
      } else {
        throw new Error("Failed to load cart")
      }
    } catch (error) {
      console.error("Error loading cart:", error)
      showNotification("Có lỗi xảy ra khi tải giỏ hàng!", "error")
      showEmptyCart()
    }
  }

  function renderCart() {
    const cartContent = document.getElementById("cartContent")
    const emptyCart = document.getElementById("emptyCart")
    const cartItems = document.getElementById("cartItems")

    if (!cartData || !cartData.chiTietDonHangs || cartData.chiTietDonHangs.length === 0) {
      showEmptyCart()
      return
    }

    cartContent.style.display = "none"
    emptyCart.style.display = "none"
    cartItems.style.display = "block"

    renderCartItems()
    updateCartSummary()
  }

  function renderCartItems() {
    const cartList = document.getElementById("cartList")
    cartList.innerHTML = ""

    cartData.chiTietDonHangs.forEach((item) => {
      const cartItem = createCartItemElement(item)
      cartList.appendChild(cartItem)
    })
  }

  function createCartItemElement(item) {
    const div = document.createElement("div")
    div.className = "cart-item"
    div.dataset.productId = item.sanPham.id

    const imageUrl =
      item.sanPham.hinhAnhs && item.sanPham.hinhAnhs.length > 0
        ? item.sanPham.hinhAnhs[0].hinhAnh
        : "/placeholder.svg?height=80&width=80"

    div.innerHTML = `
            <div class="item-info">
                <img src="${imageUrl}" alt="${item.sanPham.ten}" class="item-image">
                <div class="item-details">
                    <h4>${item.sanPham.ten}</h4>
                    <p>Mã SP: ${item.sanPham.id}</p>
                </div>
            </div>
            <div class="item-price">
                ${item.sanPham.gia.toLocaleString("vi-VN")} VNĐ
            </div>
            <div class="quantity-controls">
                <button class="qty-btn" onclick="updateQuantity(${item.sanPham.id}, ${item.soLuong - 1})">-</button>
                <input type="number" class="qty-input" value="${item.soLuong}" min="1" 
                       onchange="window.updateQuantity(${item.sanPham.id}, this.value)">
                <button class="qty-btn" onclick="window.updateQuantity(${item.sanPham.id}, ${item.soLuong + 1})">+</button>
            </div>
            <div class="item-total">
                ${(item.sanPham.gia * item.soLuong).toLocaleString("vi-VN")} VNĐ
            </div>
            <div class="item-actions">
                <button class="remove-btn" onclick="window.removeFromCart(${item.sanPham.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `

    return div
  }

  function updateCartSummary() {
    if (!cartData || !cartData.chiTietDonHangs) return

    const subtotal = cartData.chiTietDonHangs.reduce((sum, item) => {
      return sum + item.sanPham.gia * item.soLuong
    }, 0)

    document.getElementById("subtotal").textContent = `${subtotal.toLocaleString("vi-VN")} VNĐ`
    document.getElementById("total").textContent = `${subtotal.toLocaleString("vi-VN")} VNĐ`
  }

  function updateCartBadge() {
    const badge = document.getElementById("cartBadge")
    if (cartData && cartData.chiTietDonHangs) {
      const totalItems = cartData.chiTietDonHangs.reduce((sum, item) => sum + item.soLuong, 0)
      badge.textContent = totalItems
    } else {
      badge.textContent = "0"
    }
  }

  function showEmptyCart() {
    const cartContent = document.getElementById("cartContent")
    const emptyCart = document.getElementById("emptyCart")
    const cartItems = document.getElementById("cartItems")

    cartContent.style.display = "none"
    cartItems.style.display = "none"
    emptyCart.style.display = "block"

    updateCartBadge()
  }

  // Global functions for cart operations
  window.updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      window.removeFromCart(productId)
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/don-hang/cart/update/${productId}/${newQuantity}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        await loadCart()
        showNotification("Cập nhật số lượng thành công!", "success")
      } else {
        throw new Error("Failed to update quantity")
      }
    } catch (error) {
      console.error("Error updating quantity:", error)
      showNotification("Có lỗi xảy ra khi cập nhật số lượng!", "error")
    }
  }

  window.removeFromCart = async (productId) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?")) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/don-hang/cart/remove/${productId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        await loadCart()
        showNotification("Đã xóa sản phẩm khỏi giỏ hàng!", "success")
      } else {
        throw new Error("Failed to remove item")
      }
    } catch (error) {
      console.error("Error removing item:", error)
      showNotification("Có lỗi xảy ra khi xóa sản phẩm!", "error")
    }
  }

  async function clearCart() {
    if (!confirm("Bạn có chắc chắn muốn xóa tất cả sản phẩm trong giỏ hàng?")) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/don-hang/cart/clear`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        showEmptyCart()
        showNotification("Đã xóa tất cả sản phẩm trong giỏ hàng!", "success")
      } else {
        throw new Error("Failed to clear cart")
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
      showNotification("Có lỗi xảy ra khi xóa giỏ hàng!", "error")
    }
  }

  function updateCart() {
    loadCart()
    showNotification("Đã cập nhật giỏ hàng!", "success")
  }

  function proceedToCheckout() {
    if (!cartData || !cartData.chiTietDonHangs || cartData.chiTietDonHangs.length === 0) {
      showNotification("Giỏ hàng trống!", "error")
      return
    }

    window.location.href = "checkout.html"
  }

  function showNotification(message, type = "success") {
    // Remove existing notification
    const existingNotification = document.querySelector(".notification")
    if (existingNotification) {
      existingNotification.remove()
    }

    // Create notification element
    const notification = document.createElement("div")
    notification.className = `notification ${type}`
    notification.textContent = message

    document.body.appendChild(notification)

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.remove()
    }, 3000)
  }
})
