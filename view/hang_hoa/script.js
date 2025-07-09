const API_BASE_URL = ""

document.addEventListener("DOMContentLoaded", () => {
  // Lấy productId từ URL
  const urlParams = new URLSearchParams(window.location.search)
  const productParam = urlParams.get("product")
  console.log("productParam:", productParam, typeof productParam)

  let productId = null
  if (productParam) {
    try {
      // Thử parse JSON trước (nếu là object)
      const product = JSON.parse(decodeURIComponent(productParam))
      if (product && typeof product === "object" && product.id) {
        productId = product.id
        console.log("productId from JSON object:", productId)
      } else {
        // Nếu không phải object hoặc không có id, thử parseInt
        productId = Number.parseInt(productParam)
        console.log("productId from parseInt:", productId)
      }
    } catch (error) {
      console.log("JSON parse failed, trying parseInt")
      productId = Number.parseInt(productParam)
      console.log("productId from parseInt:", productId)
    }
  }

  console.log("Final productId:", productId, typeof productId)
  if (!Number.isInteger(productId) || productId <= 0) {
    document.body.innerHTML = `<div style="text-align:center; margin-top:60px;"><i class="fas fa-exclamation-triangle" style="font-size:48px; color:#dc3545;"></i><h2>Không tìm thấy sản phẩm!</h2><a href="../index.html" style="color:#28a745; font-size:18px;">Quay về trang chủ</a></div>`
    return
  }

  // Lấy chi tiết sản phẩm từ API
  fetch(`${API_BASE_URL}/san-pham/${productId}`)
    .then((res) => res.json())
    .then((product) => {
      console.log("product from API:", product)
      if (!product || !product.id) {
        document.body.innerHTML = `<div style="text-align:center; margin-top:60px;"><i class="fas fa-exclamation-triangle" style="font-size:48px; color:#dc3545;"></i><h2>Sản phẩm không tồn tại!</h2><a href="../index.html" style="color:#28a745; font-size:18px;">Quay về trang chủ</a></div>`
        return
      }
      // Gọi các hàm render chi tiết sản phẩm, liên quan, v.v.
      updateProductDetails(product)
      if (product.danhMucId || (product.danhMuc && product.danhMuc.id)) {
        const danhMucId = product.danhMucId || (product.danhMuc && product.danhMuc.id)
        fetch(`${API_BASE_URL}/san-pham/danh-muc/${danhMucId}`)
          .then((res) => res.json())
          .then((products) => {
            renderRelatedProducts(products, product.id)
          })
      }
      // Tải đánh giá
      loadProductReviews(product.id)
    })
    .catch((err) => {
      document.body.innerHTML = `<div style="text-align:center; margin-top:60px;"><i class="fas fa-exclamation-triangle" style="font-size:48px; color:#dc3545;"></i><h2>Lỗi khi tải sản phẩm!</h2><p>${err.message}</p><a href="../index.html" style="color:#28a745; font-size:18px;">Quay về trang chủ</a></div>`
    })

  // Sửa lại loadProductReviews nhận productId
  async function loadProductReviews(productId) {
    const reviewsList = document.getElementById("reviewsList")
    if (!reviewsList) return
    reviewsList.innerHTML = '<div style="text-align: center; padding: 20px;">Đang tải đánh giá...</div>'
    try {
      // Đảm bảo productId là số
      const numericProductId = Number.parseInt(productId)
      const response = await fetch(`${API_BASE_URL}/danh-gia/san-pham/${numericProductId}`)
      if (!response.ok) throw new Error("Không thể tải đánh giá")
      const reviews = await response.json()
      updateAverageRating(reviews)
      renderReviews(reviews)
    } catch (error) {
      reviewsList.innerHTML = `<div class="no-reviews"><i class="fas fa-exclamation-triangle"></i><p>Có lỗi xảy ra khi tải đánh giá.</p><p>Vui lòng thử lại sau.</p></div>`
    }
  }

  // Tạo modal đánh giá
  createReviewModal()

  // Hàm cập nhật chi tiết sản phẩm
  function updateProductDetails(product) {
    // Cập nhật title
    document.title = `${product.ten} - Vegist`

    // Cập nhật breadcrumb
    const breadcrumbSpan = document.querySelector(".breadcrumb span")
    if (breadcrumbSpan) {
      breadcrumbSpan.textContent = product.ten
    }

    // Cập nhật ảnh chính
    const mainImage = document.getElementById("mainImage")
    if (mainImage && product.hinhAnhs && product.hinhAnhs.length > 0) {
      mainImage.src = product.hinhAnhs[0].hinhAnh
      mainImage.alt = product.ten
    }

    // Cập nhật thumbnail images
    const thumbnailContainer = document.querySelector(".thumbnail-images")
    if (thumbnailContainer && product.hinhAnhs && product.hinhAnhs.length > 0) {
      thumbnailContainer.innerHTML = ""
      product.hinhAnhs.forEach((image, index) => {
        const thumbnail = document.createElement("img")
        thumbnail.src = image.hinhAnh
        thumbnail.alt = `${product.ten} ${index + 1}`
        thumbnail.className = index === 0 ? "thumbnail active" : "thumbnail"
        thumbnail.onclick = function () {
          changeImage(this)
        }
        thumbnailContainer.appendChild(thumbnail)
      })
    }

    // Cập nhật tên sản phẩm
    const productTitle = document.querySelector(".product-title")
    if (productTitle) {
      productTitle.textContent = product.ten
    }

    // Cập nhật giá
    const currentPrice = document.querySelector(".current-price")
    if (currentPrice && product.gia) {
      currentPrice.textContent = `${product.gia.toLocaleString("vi-VN")} VNĐ`
    }

    // Cập nhật mô tả
    const productDescription = document.querySelector(".product-description p")
    if (productDescription && product.moTa) {
      productDescription.textContent = product.moTa
    }

    // Cập nhật số lượng trong kho
    const availability = document.querySelector(".in-stock")
    if (availability && product.soLuongHienCon !== undefined) {
      availability.textContent = `Còn ${product.soLuongHienCon} trong kho`
    }

    // Cập nhật mã sản phẩm
    const productId = document.querySelector(".product-id span")
    if (productId && product.id) {
      productId.textContent = product.id
    }
  }

  // Hiển thị sản phẩm cùng danh mục
  function renderRelatedProducts(products, currentProductId) {
    const grid = document.querySelector(".related-products .products-grid")
    if (!grid) return
    grid.innerHTML = ""
    const related = products.filter((p) => p.id !== currentProductId)
    if (related.length === 0) {
      grid.innerHTML = "<div>Không có sản phẩm liên quan.</div>"
      return
    }
    related.forEach((product) => {
      const div = document.createElement("div")
      div.className = "product-card"
      div.style.transform = "translateY(0px)"
      div.style.boxShadow = "rgba(0, 0, 0, 0.1) 0px 2px 10px"
      // Badge logic (example: always show SALE for now)
      const badge = '<div class="product-badge sale">SALE</div>'
      // Image
      const imgSrc =
        product.hinhAnhs && product.hinhAnhs.length > 0
          ? product.hinhAnhs[0].hinhAnh
          : "https://vegina-store.myshopify.com/cdn/shop/products/25_525c2823-683a-445e-b187-6fe7ca3f5a8e.jpg?v=1620641853&width=720"
      // Price logic (show original if product.giaGoc exists and is greater than gia)
      let priceHtml = `<span class="current">${product.gia?.toLocaleString("vi-VN") || ""} VNĐ</span>`
      if (product.giaGoc && product.giaGoc > product.gia) {
        priceHtml += ` <span class="original">${product.giaGoc.toLocaleString("vi-VN")} VNĐ</span>`
      }
      // Rating (static for now)
      const ratingHtml = `<div class="product-rating">
                <div class="stars">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                </div>
                <span>Không có đánh giá</span>
            </div>`
      div.innerHTML = `
                ${badge}
                <img src="${imgSrc}" alt="${product.ten}" style="opacity: 1; transition: opacity 0.3s;">
                <h4>${product.ten}</h4>
                <div class="product-price">
                    ${priceHtml}
                </div>
                ${ratingHtml}
            `
      div.addEventListener("click", () => {
        window.location.href = `index.html?product=${product.id}`
      })
      grid.appendChild(div)
    })
  }

  // Image gallery functionality
  window.changeImage = (thumbnail) => {
    const mainImage = document.getElementById("mainImage")
    const thumbnails = document.querySelectorAll(".thumbnail")

    // Remove active class from all thumbnails
    thumbnails.forEach((thumb) => thumb.classList.remove("active"))

    // Add active class to clicked thumbnail
    thumbnail.classList.add("active")

    // Change main image source
    mainImage.src = thumbnail.src
  }

  // Quantity controls
  window.increaseQty = () => {
    const qtyInput = document.getElementById("quantity")
    qtyInput.value = Number.parseInt(qtyInput.value) + 1
  }

  window.decreaseQty = () => {
    const qtyInput = document.getElementById("quantity")
    if (Number.parseInt(qtyInput.value) > 1) {
      qtyInput.value = Number.parseInt(qtyInput.value) - 1
    }
  }

  // Size selection
  const sizeButtons = document.querySelectorAll(".size-btn")
  sizeButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      sizeButtons.forEach((b) => b.classList.remove("active"))
      this.classList.add("active")
    })
  })

  // Tab functionality
  const tabButtons = document.querySelectorAll(".tab-btn")
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      tabButtons.forEach((b) => b.classList.remove("active"))
      this.classList.add("active")

      const tabName = this.getAttribute("data-tab")
      console.log("Switched to tab:", tabName)

      // Hide all tab panes
      document.querySelectorAll(".tab-pane").forEach((pane) => {
        pane.classList.remove("active")
      })

      // Show selected tab pane
      const selectedPane = document.getElementById(tabName)
      if (selectedPane) {
        selectedPane.classList.add("active")

        // Load reviews if reviews tab is selected
        if (tabName === "reviews") {
          loadProductReviews(productId)
        }
      }
    })
  })

  // Update average rating display
  function updateAverageRating(reviews) {
    if (reviews.length === 0) {
      const ratingText = document.querySelector(".average-rating .rating-text")
      if (ratingText) {
        ratingText.textContent = "Chưa có đánh giá"
      }
      return
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.soSao, 0)
    const averageRating = totalRating / reviews.length

    // Update stars display
    const starsContainer = document.querySelector(".average-rating .stars")
    const ratingText = document.querySelector(".average-rating .rating-text")

    if (starsContainer) {
      starsContainer.innerHTML = ""
      for (let i = 1; i <= 5; i++) {
        const star = document.createElement("i")
        star.className = i <= averageRating ? "fas fa-star" : "far fa-star"
        starsContainer.appendChild(star)
      }
    }

    if (ratingText) {
      ratingText.textContent = `${averageRating.toFixed(1)}/5 (${reviews.length} đánh giá)`
    }
  }

  // Render reviews list
  function renderReviews(reviews) {
    console.log("renderReviews called with:", reviews)
    const reviewsList = document.getElementById("reviewsList")

    if (!reviewsList) {
      console.error("reviewsList element not found in renderReviews")
      return
    }

    console.log("Reviews length:", reviews.length)

    if (reviews.length === 0) {
      console.log("No reviews, showing empty state")
      reviewsList.innerHTML = `
                <div class="no-reviews">
                    <i class="far fa-comment-alt"></i>
                    <p>Chưa có đánh giá nào cho sản phẩm này.</p>
                    <p>Hãy là người đầu tiên chia sẻ trải nghiệm của bạn!</p>
                </div>
            `
      return
    }

    console.log("Rendering", reviews.length, "reviews")
    reviewsList.innerHTML = ""

    reviews.forEach((review, index) => {
      console.log(`Rendering review ${index + 1}:`, review)
      const reviewElement = document.createElement("div")
      reviewElement.className = "review-item"

      // Format date
      const reviewDate = new Date(review.ngayDanhGia)
      const formattedDate = reviewDate.toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })

      // Generate stars
      const starsHTML = Array.from(
        { length: 5 },
        (_, i) => `<i class="fas fa-star" style="color: ${i < review.soSao ? "#ffc107" : "#ddd"}"></i>`,
      ).join("")

      // Get reviewer name
      const reviewerName = review.khachHang ? review.khachHang.tenKhachHang : "Khách hàng"
      const reviewerInitial = reviewerName.charAt(0).toUpperCase()

      reviewElement.innerHTML = `
                <div class="review-header">
                    <div class="reviewer-info">
                        <div class="reviewer-avatar">${reviewerInitial}</div>
                        <div>
                            <div class="reviewer-name">${reviewerName}</div>
                            <div class="review-date">${formattedDate}</div>
                        </div>
                    </div>
                    <div class="review-rating">
                        ${starsHTML}
                        <span style="margin-left: 5px; color: #666;">${review.soSao}/5</span>
                    </div>
                </div>
                <div class="review-content">
                    ${review.noiDung}
                </div>
            `

      reviewsList.appendChild(reviewElement)
    })

    console.log("Finished rendering reviews")
  }

  // Add to cart functionality
  const addToCartBtn = document.querySelector(".add-to-cart-btn")
  const cartBadge = document.querySelector(".fa-shopping-cart").nextElementSibling

  addToCartBtn.addEventListener("click", async () => {
    const quantity = Number.parseInt(document.getElementById("quantity").value)

    // Check if user is logged in
    const authToken = localStorage.getItem("customerAuthToken")
    if (!authToken) {
      showNotification("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!", "error")
      return
    }

    // Prepare cart data
    const cartData = {
      sanPhamId: productId,
      soLuong: quantity,
    }

    try {
      const response = await fetch(`${API_BASE_URL}/don-hang/cart/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(cartData),
      })

      if (response.ok) {
        // Update cart badge
        updateCartBadge()
        showNotification(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`, "success")
      } else {
        const errorData = await response.text()
        throw new Error(errorData || "Failed to add to cart")
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      showNotification("Có lỗi xảy ra khi thêm vào giỏ hàng: " + error.message, "error")
    }
  })

  // Update cart badge
  async function updateCartBadge() {
    const authToken = localStorage.getItem("customerAuthToken")
    if (!authToken) return

    try {
      const response = await fetch(`${API_BASE_URL}/don-hang/cart`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (response.ok) {
        const cartData = await response.json()
        if (cartData && cartData.chiTietDonHangs) {
          const totalItems = cartData.chiTietDonHangs.reduce((sum, item) => sum + item.soLuong, 0)
          cartBadge.textContent = totalItems
        }
      }
    } catch (error) {
      console.error("Error updating cart badge:", error)
    }
  }

  // Load cart badge on page load
  updateCartBadge()


  // Wishlist functionality
  const wishlistBtn = document.querySelector(".wishlist")
  const wishlistBadge = document.querySelector(".fa-heart").nextElementSibling
  let wishlistCount = 0
  let isInWishlist = false

  wishlistBtn.addEventListener("click", function () {
    const heartIcon = this.querySelector("i")
    const text = this.querySelector("span")

    if (!isInWishlist) {
      heartIcon.classList.remove("far")
      heartIcon.classList.add("fas")
      text.textContent = "Đã thêm vào danh sách yêu thích"
      wishlistCount++
      wishlistBadge.textContent = wishlistCount
      showNotification("Đã thêm vào danh sách yêu thích!")
    } else {
      heartIcon.classList.remove("fas")
      heartIcon.classList.add("far")
      text.textContent = "Danh sách mong muốn"
      wishlistCount--
      wishlistBadge.textContent = wishlistCount
      showNotification("Đã xóa khỏi danh sách yêu thích!")
    }

    isInWishlist = !isInWishlist

    // Add animation
    wishlistBadge.style.transform = "scale(1.3)"
    setTimeout(() => {
      wishlistBadge.style.transform = "scale(1)"
    }, 200)
  })

  // Social sharing
  const socialLinks = document.querySelectorAll(".social-share a")
  socialLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const platform = this.querySelector("i").classList[1].split("-")[1]
      showNotification(`Chia sẻ trên ${platform.charAt(0).toUpperCase() + platform.slice(1)}!`)
    })
  })

  // Write review button
  const writeReviewBtn = document.querySelector(".write-review-btn")
  if (writeReviewBtn) {
    writeReviewBtn.addEventListener("click", () => {
      showReviewModal()
    })
  }

  // Product card hover effects
  const productCards = document.querySelectorAll(".product-card")
  productCards.forEach((card) => {
    card.addEventListener("mouseenter", function () {
      this.style.transform = "translateY(-10px)"
      this.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)"
    })

    card.addEventListener("mouseleave", function () {
      this.style.transform = "translateY(0)"
      this.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)"
    })
  })

  // Search functionality
  const searchIcon = document.querySelector(".fa-search")
  searchIcon.addEventListener("click", () => {
    const searchTerm = prompt("Tìm kiếm sản phẩm:")
    if (searchTerm) {
      showNotification(`Đang tìm kiếm: ${searchTerm}`)
    }
  })

  // Notification system
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
    notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === "success" ? "#7cb342" : "#dc3545"};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `

    document.body.appendChild(notification)

    // Remove notification after 3 seconds
    setTimeout(() => {
      notification.style.animation = "slideOut 0.3s ease"
      setTimeout(() => {
        notification.remove()
      }, 300)
    }, 3000)
  }

  // Add CSS animations for notifications
  const style = document.createElement("style")
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
    `
  document.head.appendChild(style)

  // Smooth scroll for internal links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
        })
      }
    })
  })

  // Lazy loading for images
  const images = document.querySelectorAll("img")
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target
        img.style.opacity = "0"
        img.style.transition = "opacity 0.3s"

        setTimeout(() => {
          img.style.opacity = "1"
        }, 100)

        observer.unobserve(img)
      }
    })
  })

  images.forEach((img) => {
    imageObserver.observe(img)
  })

  // Sự kiện click cho breadcrumb Trang chủ
  const breadcrumbHome = document.querySelector(".breadcrumb a")
  if (breadcrumbHome) {
    breadcrumbHome.addEventListener("click", (e) => {
      e.preventDefault()
      window.location.href = "../index.html"
    })
  }
  // Sự kiện click cho logo header
  const logoHome = document.querySelector(".logo")
  if (logoHome) {
    logoHome.addEventListener("click", () => {
      window.location.href = "../index.html"
    })
  }

  // Sự kiện click cho link TRANG CHỦ trong nav
  const navLinks = document.querySelectorAll(".nav .nav-link")
  if (navLinks && navLinks.length > 0) {
    navLinks.forEach((link) => {
      if (link.textContent.trim().startsWith("TRANG CHỦ")) {
        link.addEventListener("click", (e) => {
          e.preventDefault()
          window.location.href = "../index.html"
        })
      }
    })
  }

  // Tạo modal đánh giá
  function createReviewModal() {
    const modal = document.createElement("div")
    modal.id = "reviewModal"
    modal.className = "modal"
    modal.style.cssText = `
            display: none;
            position: fixed;
            z-index: 1000;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
        `

    modal.innerHTML = `
            <div class="modal-content" style="
                background-color: #fefefe;
                margin: 15% auto;
                padding: 20px;
                border: 1px solid #888;
                width: 80%;
                max-width: 500px;
                border-radius: 8px;
                box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            ">
                <span class="close" style="
                    color: #aaa;
                    float: right;
                    font-size: 28px;
                    font-weight: bold;
                    cursor: pointer;
                    transition: color 0.3s;
                ">&times;</span>
                <h2 style="margin-top: 0; color: #333;">Viết đánh giá</h2>
                <form id="reviewForm">
                    <div style="margin-bottom: 20px;">
                        <label for="rating" style="display: block; margin-bottom: 8px; font-weight: bold; color: #555;">Đánh giá:</label>
                        <div class="star-rating" style="display: flex; gap: 5px; margin-bottom: 10px;">
                            <i class="far fa-star star" data-rating="1" style="font-size: 24px; color: #ddd; cursor: pointer; transition: color 0.2s;"></i>
                            <i class="far fa-star star" data-rating="2" style="font-size: 24px; color: #ddd; cursor: pointer; transition: color 0.2s;"></i>
                            <i class="far fa-star star" data-rating="3" style="font-size: 24px; color: #ddd; cursor: pointer; transition: color 0.2s;"></i>
                            <i class="far fa-star star" data-rating="4" style="font-size: 24px; color: #ddd; cursor: pointer; transition: color 0.2s;"></i>
                            <i class="far fa-star star" data-rating="5" style="font-size: 24px; color: #ddd; cursor: pointer; transition: color 0.2s;"></i>
                        </div>
                        <select id="rating" name="rating" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 14px;">
                            <option value="5">5 sao - Tuyệt vời</option>
                            <option value="4">4 sao - Rất tốt</option>
                            <option value="3">3 sao - Tốt</option>
                            <option value="2">2 sao - Trung bình</option>
                            <option value="1">1 sao - Kém</option>
                        </select>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label for="content" style="display: block; margin-bottom: 8px; font-weight: bold; color: #555;">Nội dung đánh giá:</label>
                        <textarea id="content" name="content" rows="4" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; resize: vertical; font-size: 14px; font-family: inherit;" placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này..."></textarea>
                        <div id="charCount" style="text-align: right; font-size: 12px; color: #666; margin-top: 5px;">0/500 ký tự</div>
                    </div>
                    <div style="text-align: right;">
                        <button type="button" onclick="closeReviewModal()" style="
                            background-color: #6c757d;
                            color: white;
                            padding: 10px 20px;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            margin-right: 10px;
                            transition: background-color 0.3s;
                        ">Hủy</button>
                        <button type="submit" id="submitReviewBtn" style="
                            background-color: #28a745;
                            color: white;
                            padding: 10px 20px;
                            border: none;
                            border-radius: 4px;
                            cursor: pointer;
                            transition: background-color 0.3s;
                        ">Gửi đánh giá</button>
                    </div>
                </form>
            </div>
        `

    document.body.appendChild(modal)

    // Close modal when clicking X or outside
    const closeBtn = modal.querySelector(".close")
    closeBtn.onclick = closeReviewModal
    modal.onclick = (event) => {
      if (event.target === modal) {
        closeReviewModal()
      }
    }

    // Handle form submission
    const form = modal.querySelector("#reviewForm")
    form.onsubmit = handleReviewSubmission

    // Star rating functionality
    const stars = modal.querySelectorAll(".star")
    const ratingSelect = modal.querySelector("#rating")

    stars.forEach((star) => {
      star.addEventListener("click", function () {
        const rating = this.getAttribute("data-rating")
        ratingSelect.value = rating
        updateStars(rating)
      })

      star.addEventListener("mouseenter", function () {
        const rating = this.getAttribute("data-rating")
        updateStars(rating)
      })
    })

    const starContainer = modal.querySelector(".star-rating")
    starContainer.addEventListener("mouseleave", () => {
      const currentRating = ratingSelect.value
      updateStars(currentRating)
    })

    // Character count for textarea
    const textarea = modal.querySelector("#content")
    const charCount = modal.querySelector("#charCount")
    textarea.addEventListener("input", function () {
      const count = this.value.length
      charCount.textContent = `${count}/500 ký tự`
      if (count > 500) {
        charCount.style.color = "#dc3545"
      } else {
        charCount.style.color = "#666"
      }
    })

    function updateStars(rating) {
      stars.forEach((star, index) => {
        if (index < rating) {
          star.className = "fas fa-star star"
          star.style.color = "#ffc107"
        } else {
          star.className = "far fa-star star"
          star.style.color = "#ddd"
        }
      })
    }

    // Initialize stars
    updateStars(5)
  }

  // Hiển thị modal đánh giá
  function showReviewModal() {
    const modal = document.getElementById("reviewModal")
    if (modal) {
      modal.style.display = "block"
      // Focus on textarea
      const textarea = modal.querySelector("#content")
      if (textarea) {
        textarea.focus()
      }
    }
  }

  // Đóng modal đánh giá
  function closeReviewModal() {
    const modal = document.getElementById("reviewModal")
    if (modal) {
      modal.style.display = "none"
      // Reset form
      const form = modal.querySelector("#reviewForm")
      if (form) {
        form.reset()
        const charCount = modal.querySelector("#charCount")
        if (charCount) {
          charCount.textContent = "0/500 ký tự"
          charCount.style.color = "#666"
        }
      }
    }
  }

  // Xử lý gửi đánh giá
  function handleReviewSubmission(event) {
    event.preventDefault()

    // Kiểm tra đăng nhập trước
    const customerToken = localStorage.getItem("customerAuthToken")
    if (!customerToken) {
      showNotification("Vui lòng đăng nhập để viết đánh giá!", "error")
      return
    }

    const rating = document.getElementById("rating").value
    const content = document.getElementById("content").value.trim()

    if (!content) {
      showNotification("Vui lòng nhập nội dung đánh giá!", "error")
      return
    }

    if (content.length > 500) {
      showNotification("Nội dung đánh giá không được vượt quá 500 ký tự!", "error")
      return
    }

    // Disable submit button to prevent double submission
    const submitBtn = document.getElementById("submitReviewBtn")
    const originalText = submitBtn.textContent
    submitBtn.disabled = true
    submitBtn.textContent = "Đang gửi..."

    // Sử dụng productId đã lấy được từ đầu file
    if (!productId) {
      showNotification("Không tìm thấy thông tin sản phẩm!", "error")
      submitBtn.disabled = false
      submitBtn.textContent = originalText
      return
    }

    const reviewData = {
      soSao: Number.parseInt(rating),
      noiDung: content,
      sanPhamId: productId,
    }

    console.log("Gửi đánh giá:", reviewData)

    // Gọi API tạo đánh giá
    fetch(`${API_BASE_URL}/danh-gia`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${customerToken}`,
      },
      body: JSON.stringify(reviewData),
    })
      .then((response) => {
        console.log("Response status:", response.status)

        if (!response.ok) {
          return response.text().then((text) => {
            console.log("Error response text:", text)
            throw new Error(`Lỗi khi gửi đánh giá: ${response.status} - ${text}`)
          })
        }
        return response.json()
      })
      .then((data) => {
        console.log("Đánh giá đã được gửi:", data)
        showNotification("Đánh giá đã được gửi thành công!", "success")
        closeReviewModal()

        // Reload reviews after a short delay
        setTimeout(() => {
          loadProductReviews(productId)
        }, 1000)
      })
      .catch((error) => {
        console.error("Lỗi chi tiết:", error)
        showNotification("Có lỗi xảy ra khi gửi đánh giá: " + error.message, "error")
      })
      .finally(() => {
        // Re-enable submit button
        submitBtn.disabled = false
        submitBtn.textContent = originalText
      })
  }

  // Thêm các hàm vào window để có thể gọi từ HTML
  window.showReviewModal = showReviewModal
  window.closeReviewModal = closeReviewModal

  // Test function for debugging
  window.testReviews = () => {
    console.log("Testing reviews functionality...")
    const reviewsList = document.getElementById("reviewsList")
    console.log("reviewsList element:", reviewsList)

    if (reviewsList) {
      reviewsList.innerHTML = `
                <div class="review-item">
                    <div class="review-header">
                        <div class="reviewer-info">
                            <div class="reviewer-avatar">T</div>
                            <div>
                                <div class="reviewer-name">Test User</div>
                                <div class="review-date">Hôm nay</div>
                            </div>
                        </div>
                        <div class="review-rating">
                            <i class="fas fa-star" style="color: #ffc107;"></i>
                            <i class="fas fa-star" style="color: #ffc107;"></i>
                            <i class="fas fa-star" style="color: #ffc107;"></i>
                            <i class="fas fa-star" style="color: #ffc107;"></i>
                            <i class="fas fa-star" style="color: #ddd;"></i>
                            <span style="margin-left: 5px; color: #666;">4/5</span>
                        </div>
                    </div>
                    <div class="review-content">
                        Đây là một đánh giá test để kiểm tra hiển thị.
                    </div>
                </div>
            `
      console.log("Test review added successfully")
    } else {
      console.error("reviewsList element not found")
    }
  }

  // Add cart link functionality
  const cartIcon = document.querySelector(".fa-shopping-cart").parentElement
  cartIcon.addEventListener("click", () => {
    window.location.href = "cart-order/cart.html"
  })
})
