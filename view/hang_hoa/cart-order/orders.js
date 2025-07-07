document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = ""
  const authToken = localStorage.getItem("customerAuthToken")

  // Check if user is logged in
  if (!authToken) {
    alert("Vui lòng đăng nhập để xem đơn hàng!")
    window.location.href = "cart.html"
    return
  }

  init()

  function init() {
    setupEventListeners()
    checkForSuccessMessage()
    loadOrders()
  }

  function setupEventListeners() {
    const logoutBtn = document.getElementById("logoutBtn")
    if (logoutBtn) {
      logoutBtn.addEventListener("click", handleLogout)
    }
  }

  function checkForSuccessMessage() {
    const urlParams = new URLSearchParams(window.location.search)
    const orderId = urlParams.get("orderId")

    if (orderId) {
      const successMessage = document.getElementById("successMessage")
      successMessage.style.display = "block"

      // Remove orderId from URL without refreshing
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }

  function handleLogout() {
    localStorage.removeItem("customerAuthToken")
    alert("Đã đăng xuất thành công!")
    window.location.href = "../index.html"
  }

  async function loadOrders() {
    try {
      const response = await fetch(`${API_BASE_URL}/don-hang/khach-hang`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const orders = await response.json()
        renderOrders(orders)
      } else if (response.status === 404) {
        showEmptyOrders()
      } else {
        throw new Error("Failed to load orders")
      }
    } catch (error) {
      console.error("Error loading orders:", error)
      showNotification("Có lỗi xảy ra khi tải đơn hàng!", "error")
      showEmptyOrders()
    }
  }

  function renderOrders(orders) {
    const ordersContent = document.getElementById("ordersContent")
    const emptyOrders = document.getElementById("emptyOrders")
    const ordersList = document.getElementById("ordersList")

    if (!orders || orders.length === 0) {
      showEmptyOrders()
      return
    }

    ordersContent.style.display = "none"
    emptyOrders.style.display = "none"
    ordersList.style.display = "block"

    ordersList.innerHTML = ""

    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.ngayTao || b.ngayChuanBiHang) - new Date(a.ngayTao || a.ngayChuanBiHang))

    orders.forEach((order) => {
      const orderCard = createOrderCard(order)
      ordersList.appendChild(orderCard)
    })
  }

  function createOrderCard(order) {
    const div = document.createElement("div")
    div.className = "order-card"

    const orderDate = new Date(order.ngayTao || order.ngayChuanBiHang)
    const deliveryDate = new Date(order.ngayNhanHang)

    const statusClass = getStatusClass(order.trangThaiDonHang)
    const statusText = getStatusText(order.trangThaiDonHang)

    div.innerHTML = `
            <div class="order-header">
                <div class="order-info">
                    <label>Mã đơn hàng</label>
                    <span>#${order.id}</span>
                </div>
                <div class="order-info">
                    <label>Ngày đặt</label>
                    <span>${orderDate.toLocaleDateString("vi-VN")}</span>
                </div>
                <div class="order-info">
                    <label>Ngày giao dự kiến</label>
                    <span>${deliveryDate.toLocaleDateString("vi-VN")}</span>
                </div>
                <div class="order-info">
                    <label>Trạng thái</label>
                    <span class="order-status ${statusClass}">${statusText}</span>
                </div>
                <div class="order-info">
                    <label>Tổng tiền</label>
                    <span>${order.tongTien ? order.tongTien.toLocaleString("vi-VN") : "0"} VNĐ</span>
                </div>
            </div>
            
            <div class="order-items">
                ${renderOrderItems(order.chiTietDonHangs || [])}
            </div>
            
            <div class="order-total">
                <div class="total-amount">
                    Tổng: ${order.tongTien ? order.tongTien.toLocaleString("vi-VN") : "0"} VNĐ
                </div>
            </div>
            
            <div class="order-actions">
                ${renderOrderActions(order)}
            </div>
        `

    return div
  }

  function renderOrderItems(items) {
    if (!items || items.length === 0) {
      return '<p style="text-align: center; color: #6c757d;">Không có thông tin sản phẩm</p>'
    }

    return items
      .map((item) => {
        const imageUrl =
          item.sanPham && item.sanPham.hinhAnhs && item.sanPham.hinhAnhs.length > 0
            ? item.sanPham.hinhAnhs[0].hinhAnh
            : "/placeholder.svg?height=60&width=60"

        const productName = item.sanPham ? item.sanPham.ten : "Sản phẩm không xác định"
        const productPrice = item.sanPham ? item.sanPham.gia : 0
        const itemTotal = productPrice * item.soLuong

        return `
                <div class="order-item">
                   
                    <div class="item-details">
                        <h4>${productName}</h4>
                        <p>Số lượng: ${item.soLuong} | Đơn giá: ${productPrice.toLocaleString("vi-VN")} VNĐ</p>
                    </div>
                    <div class="item-price">
                        ${itemTotal.toLocaleString("vi-VN")} VNĐ
                    </div>
                </div>
            `
      })
      .join("")
  }

  function renderOrderActions(order) {
    const status = order.trangThaiDonHang
    let actions = ""

    // View details button (always available)
    actions += `<button class="btn btn-secondary" onclick="viewOrderDetails(${order.id})">
            <i class="fas fa-eye"></i> Xem chi tiết
        </button>`

    // Cancel button (only for pending orders)
    if (status === "Chờ xử lý" || status === "Đang xử lý") {
      actions += `<button class="btn btn-danger" onclick="cancelOrder(${order.id})">
                <i class="fas fa-times"></i> Hủy đơn
            </button>`
    }

    // Reorder button (for completed orders)
    if (status === "Đã giao" || status === "Hoàn thành") {
      actions += `<button class="btn btn-primary" onclick="reorder(${order.id})">
                <i class="fas fa-redo"></i> Đặt lại
            </button>`
    }

    return actions
  }

  function getStatusClass(status) {
    const statusMap = {
      "Chờ xử lý": "status-pending",
      "Đang xử lý": "status-processing",
      "Đang giao": "status-shipping",
      "Đã giao": "status-delivered",
      "Hoàn thành": "status-delivered",
      "Đã hủy": "status-cancelled",
    }
    return statusMap[status] || "status-pending"
  }

  function getStatusText(status) {
    const statusMap = {
      "Chờ xử lý": "Chờ xử lý",
      "Đang xử lý": "Đang xử lý",
      "Đang giao": "Đang giao hàng",
      "Đã giao": "Đã giao hàng",
      "Hoàn thành": "Hoàn thành",
      "Đã hủy": "Đã hủy",
    }
    return statusMap[status] || status
  }

  function showEmptyOrders() {
    const ordersContent = document.getElementById("ordersContent")
    const emptyOrders = document.getElementById("emptyOrders")
    const ordersList = document.getElementById("ordersList")

    ordersContent.style.display = "none"
    ordersList.style.display = "none"
    emptyOrders.style.display = "block"
  }

  // Global functions for order actions
  window.viewOrderDetails = (orderId) => {
    // For now, just show an alert. In a real app, this would open a detailed view
    alert(`Xem chi tiết đơn hàng #${orderId}`)
  }

  window.cancelOrder = async (orderId) => {
    if (!confirm("Bạn có chắc chắn muốn hủy đơn hàng này?")) {
      return
    }

    try {
      // Note: This endpoint might not exist in the API, but this is how it would work
      const response = await fetch(`${API_BASE_URL}/don-hang/${orderId}/cancel`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        showNotification("Đã hủy đơn hàng thành công!", "success")
        loadOrders() // Reload orders
      } else {
        throw new Error("Failed to cancel order")
      }
    } catch (error) {
      console.error("Error cancelling order:", error)
      showNotification("Có lỗi xảy ra khi hủy đơn hàng!", "error")
    }
  }

  window.reorder = (orderId) => {
    if (confirm("Bạn có muốn đặt lại đơn hàng này?")) {
      // Redirect to product pages or add items back to cart
      alert(`Chức năng đặt lại đơn hàng #${orderId} sẽ được phát triển trong tương lai.`)
    }
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
