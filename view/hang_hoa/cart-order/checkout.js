document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = ""
  let cartData = null
  const authToken = localStorage.getItem("customerAuthToken")

  // Check if user is logged in
  if (!authToken) {
    alert("Vui lòng đăng nhập để tiếp tục!")
    window.location.href = "cart.html"
    return
  }

  // Initialize
  init()

  async function init() {
    await loadCart()
    setupEventListeners()
    setDefaultDates()
  }

  function setupEventListeners() {
    const placeOrderBtn = document.getElementById("placeOrderBtn")
    placeOrderBtn.addEventListener("click", placeOrder)
  }

  function setDefaultDates() {
    // Set default preparation and delivery dates
    const today = new Date()
    const prepDate = new Date(today)
    prepDate.setDate(today.getDate() + 1) // Tomorrow

    const deliveryDate = new Date(today)
    deliveryDate.setDate(today.getDate() + 3) // 3 days from now
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
        renderOrderSummary()
        updateCartBadge()
      } else if (response.status === 404) {
        alert("Giỏ hàng trống!")
        window.location.href = "cart.html"
      } else {
        throw new Error("Failed to load cart")
      }
    } catch (error) {
      console.error("Error loading cart:", error)
      alert("Có lỗi xảy ra khi tải giỏ hàng!")
      window.location.href = "cart.html"
    }
  }

  function renderOrderSummary() {
    if (!cartData || !cartData.chiTietDonHangs) return

    const orderItems = document.getElementById("orderItems")
    orderItems.innerHTML = ""

    let subtotal = 0

    cartData.chiTietDonHangs.forEach((item) => {
      const itemTotal = item.sanPham.gia * item.soLuong
      subtotal += itemTotal

      const imageUrl =
        item.sanPham.hinhAnhs && item.sanPham.hinhAnhs.length > 0
          ? item.sanPham.hinhAnhs[0].hinhAnh
          : "/placeholder.svg?height=60&width=60"

      const summaryItem = document.createElement("div")
      summaryItem.className = "summary-item"
      summaryItem.innerHTML = `
                <img src="${imageUrl}" alt="${item.sanPham.ten}">
                <div class="item-info">
                    <h4>${item.sanPham.ten}</h4>
                    <p>Số lượng: ${item.soLuong}</p>
                </div>
                <div class="item-price">
                    ${itemTotal.toLocaleString("vi-VN")} VNĐ
                </div>
            `
      orderItems.appendChild(summaryItem)
    })

    document.getElementById("subtotal").textContent = `${subtotal.toLocaleString("vi-VN")} VNĐ`
    document.getElementById("total").textContent = `${subtotal.toLocaleString("vi-VN")} VNĐ`
  }

  function updateCartBadge() {
    const badge = document.getElementById("cartBadge")
    if (cartData && cartData.chiTietDonHangs) {
      const totalItems = cartData.chiTietDonHangs.reduce((sum, item) => sum + item.soLuong, 0)
      badge.textContent = totalItems
    }
  }

  function selectPaymentMethod(method) {
    // Remove selected class from all payment methods
    document.querySelectorAll(".payment-method").forEach((pm) => {
      pm.classList.remove("selected")
    })

    // Add selected class to clicked method
    event.currentTarget.classList.add("selected")

    // Check the radio button
    document.querySelector(`input[value="${method}"]`).checked = true
  }

  // Make selectPaymentMethod global
  window.selectPaymentMethod = selectPaymentMethod

  async function placeOrder() {
    const form = document.getElementById("checkoutForm")
    const formData = new FormData(form)

    // Validate form
    const fullName = formData.get("fullName")
    const phone = formData.get("phone")
    const address = formData.get("address")
    const shippingMethod = formData.get("shippingMethod")
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value

    if (!fullName || !phone || !address || !shippingMethod || !paymentMethod) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!")
      return
    }

    // Prepare checkout data
    const today = new Date()
    const prepDate = new Date(today)
    prepDate.setDate(today.getDate() + 1)

    const deliveryDate = new Date(today)
    deliveryDate.setDate(today.getDate() + 3)

    const checkoutData = {
      tenDonHang: `Đơn hàng ${Date.now()}`,
      ngayChuanBiHang: prepDate.toISOString(),
      ngayNhanHang: deliveryDate.toISOString(),
      donViVanChuyen: shippingMethod,
      phuongThucThanhToan: paymentMethod,
      diaChiGiaoHang: address,
      sdtNguoiNhan: phone,
      tenNguoiNhan: fullName,
      ghiChu: formData.get("notes") || "",
    }

    // Disable button and show loading
    const placeOrderBtn = document.getElementById("placeOrderBtn")
    placeOrderBtn.disabled = true
    placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...'

    try {
      const response = await fetch(`${API_BASE_URL}/don-hang/cart/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(checkoutData),
      })

      if (response.ok) {
        const orderData = await response.json()

        // Show success message
        alert("Đặt hàng thành công! Cảm ơn bạn đã mua hàng.")

        // Redirect to order success page or orders page
        window.location.href = `orders.html?orderId=${orderData.id}`
      } else {
        const errorData = await response.text()
        throw new Error(errorData || "Failed to place order")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      alert("Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!")
    } finally {
      // Re-enable button
      placeOrderBtn.disabled = false
      placeOrderBtn.innerHTML = '<i class="fas fa-check"></i> Đặt hàng'
    }
  }
})
