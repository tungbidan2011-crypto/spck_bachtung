
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// ==========================================
// 1. CẤU HÌNH FIREBASE
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyA6r4EjnxU-FpeVYH-fMXnrdO36iSIsenw",
    authDomain: "jsi17-coffee-mangament-v1.firebaseapp.com",
    projectId: "jsi17-coffee-mangament-v1",
    storageBucket: "jsi17-coffee-mangament-v1.firebasestorage.app",
    messagingSenderId: "774724197595",
    appId: "1:774724197595:web:1d3f7287836addc48040fe",
    measurementId: "G-VQ4SWQ39G1"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

let isLoginMode = true;

// ==========================================
// 2. DỮ LIỆU SẢN PHẨM & GIỎ HÀNG
// ==========================================
const products = [
    { id: 1, title: "VGA ASUS ROG Strix GeForce RTX 4090 24GB", category: "vga", price: 52990000, img: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=500&q=80" },
    { id: 2, title: "CPU Intel Core i9-14900K (Up To 6.0GHz)", category: "cpu", price: 15490000, img: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=500&q=80" },
    { id: 3, title: "RAM Corsair Dominator Platinum RGB 32GB DDR5", category: "ram", price: 4890000, img: "https://images.unsplash.com/photo-1562976540-1502c2145186?auto=format&fit=crop&w=500&q=80" },
    { id: 4, title: "SSD Samsung 990 PRO 2TB PCIe Gen 4.0 NVMe", category: "ssd", price: 4290000, img: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?auto=format&fit=crop&w=500&q=80" },
    { id: 5, title: "Nguồn ASUS ROG Thor 1200W Platinum II", category: "psu", price: 8990000, img: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?auto=format&fit=crop&w=500&q=80" },
    { id: 6, title: "CPU AMD Ryzen 9 7950X3D", category: "cpu", price: 16990000, img: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=500&q=80" }
];

let cart = [];
let currentCategory = "all";

// Trạng thái người dùng
let currentUser = null;

// ==========================================
// 3. XỬ LÝ ĐĂNG NHẬP / ĐĂNG KÝ
// ==========================================
const authModal = document.getElementById("authModal");
const authAlert = document.getElementById("authAlert");

function showAlert(msg, type = "error") {
    if (!authAlert) return;
    authAlert.innerText = msg;
    authAlert.className = `auth-alert ${type}`;
}

function clearAlert() {
    if (!authAlert) return;
    authAlert.innerText = "";
    authAlert.className = "auth-alert";
}

// Chuyển tab đăng nhập
document.getElementById("tabLogin")?.addEventListener("click", () => {
    isLoginMode = true;
    document.getElementById("tabLogin")?.classList.add("active");
    document.getElementById("tabRegister")?.classList.remove("active");

    const submitBtn = document.getElementById("authSubmitBtn");
    if (submitBtn) submitBtn.innerText = "ĐĂNG NHẬP";

    clearAlert();
});

// Chuyển tab đăng ký
document.getElementById("tabRegister")?.addEventListener("click", () => {
    isLoginMode = false;
    document.getElementById("tabRegister")?.classList.add("active");
    document.getElementById("tabLogin")?.classList.remove("active");

    const submitBtn = document.getElementById("authSubmitBtn");
    if (submitBtn) submitBtn.innerText = "ĐĂNG KÝ TÀI KHOẢN";

    clearAlert();
});

// Xử lý đăng nhập / đăng ký
document.getElementById("authForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearAlert();

    const email = document.getElementById("authEmail").value;
    const password = document.getElementById("authPassword").value;

    try {
        if (isLoginMode) {
            await signInWithEmailAndPassword(auth, email, password);
            showAlert("Đăng nhập thành công!", "success");
        } else {
            await createUserWithEmailAndPassword(auth, email, password);
            showAlert("Đăng ký tài khoản thành công!", "success");
        }

        setTimeout(() => {
            authModal?.classList.remove("active");
            clearAlert();
        }, 1000);

    } catch (err) {
        let msg = "Đã xảy ra lỗi, vui lòng thử lại.";

        if (err.code === "auth/email-already-in-use")
            msg = "Email này đã được sử dụng.";

        if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password")
            msg = "Mật khẩu hoặc email không chính xác.";

        if (err.code === "auth/user-not-found")
            msg = "Tài khoản không tồn tại.";

        if (err.code === "auth/weak-password")
            msg = "Mật khẩu phải từ 6 ký tự trở lên.";

        showAlert(msg, "error");
    }
});

// ==========================================
// 4. KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP
// ==========================================
onAuthStateChanged(auth, (user) => {

    // Cập nhật người dùng hiện tại
    currentUser = user;

    const userSection = document.getElementById("userSection");
    if (!userSection) return;

    if (user) {
        const displayName = user.displayName || user.email.split("@")[0];
        const avatar = user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`;

        userSection.innerHTML = `
            <div class="user-badge">
                <img src="${avatar}" alt="Avatar">
                <span>${displayName}</span>
                <button class="logout-btn" id="logoutBtn" title="Đăng xuất">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            </div>
        `;

        document.getElementById("logoutBtn")?.addEventListener("click", () => {
            signOut(auth);
        });

    } else {
        userSection.innerHTML = `
            <button class="btn-neon btn-pink" id="openAuthBtn">
                <i class="fa-solid fa-user-astronaut"></i> ĐĂNG NHẬP
            </button>
        `;

        document.getElementById("openAuthBtn")?.addEventListener("click", () => {
            authModal?.classList.add("active");
        });

        // Xóa giỏ hàng khi đăng xuất
        cart = [];
        updateCartUI();
    }
});

// Đóng cửa sổ đăng nhập
document.getElementById("closeAuthBtn")?.addEventListener("click", () => {
    authModal?.classList.remove("active");
});

// ==========================================
// 5. HIỂN THỊ SẢN PHẨM
// ==========================================
function renderProducts(items) {
    const productGrid = document.getElementById("productGrid");
    if (!productGrid) return;

    productGrid.innerHTML = "";

    if (items.length === 0) {
        productGrid.innerHTML = `<p style="grid-column: 1/-1; text-align: center;">Không tìm thấy sản phẩm phù hợp.</p>`;
        return;
    }

    items.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";

        card.innerHTML = `
            <span class="product-tag">${product.category.toUpperCase()}</span>
            <img src="${product.img}" alt="${product.title}" class="product-img">

            <div class="product-info">
                <div class="product-title">${product.title}</div>
                <div class="product-price">${product.price.toLocaleString("vi-VN")} ₫</div>

                <button class="btn-neon btn-cyan add-to-cart-btn" data-id="${product.id}">
                    <i class="fa-solid fa-cart-plus"></i> THÊM VÀO GIỎ
                </button>
            </div>
        `;

        productGrid.appendChild(card);
    });

    // Kiểm tra đăng nhập trước khi thêm vào giỏ
    document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const pid = parseInt(e.currentTarget.getAttribute("data-id"));
            addToCart(pid);
        });
    });
}

// ==========================================
// 6. TÌM KIẾM, LỌC VÀ SẮP XẾP
// ==========================================
function filterAndSortProducts() {
    let filtered = [...products];

    if (currentCategory !== "all") {
        filtered = filtered.filter(p => p.category === currentCategory);
    }

    const searchQuery = document.getElementById("searchInput")?.value.toLowerCase().trim();

    if (searchQuery) {
        filtered = filtered.filter(p => p.title.toLowerCase().includes(searchQuery));
    }

    const sortValue = document.getElementById("sortSelect")?.value;

    if (sortValue === "price-asc") {
        filtered.sort((a, b) => a.price - b.price);
    }

    if (sortValue === "price-desc") {
        filtered.sort((a, b) => b.price - a.price);
    }

    renderProducts(filtered);
}

// ==========================================
// 7. THÊM SẢN PHẨM VÀO GIỎ HÀNG
// ==========================================
function addToCart(id) {

    // Chặn người chưa đăng nhập
    if (!currentUser) {
        alert("Bạn cần đăng nhập để mua sản phẩm!");
        authModal?.classList.add("active");
        return;
    }

    const itemIndex = cart.findIndex(item => item.id === id);

    if (itemIndex > -1) {
        cart[itemIndex].qty += 1;
    } else {
        const product = products.find(p => p.id === id);

        if (!product) return;

        cart.push({ ...product, qty: 1 });
    }

    updateCartUI();

    document.getElementById("cartDrawer")?.classList.add("active");
    document.getElementById("cartOverlay")?.classList.add("active");
}

// ==========================================
// 8. CẬP NHẬT GIAO DIỆN GIỎ HÀNG
// ==========================================
function updateCartUI() {
    const cartCount = document.getElementById("cartCount");
    const cartItemsContainer = document.getElementById("cartItemsContainer");
    const cartTotalPrice = document.getElementById("cartTotalPrice");

    if (cartCount) {
        cartCount.innerText = cart.reduce((acc, item) => acc + item.qty, 0);
    }

    if (!cartItemsContainer) return;

    cartItemsContainer.innerHTML = "";
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.qty;

        const cartItemEl = document.createElement("div");
        cartItemEl.className = "cart-item";

        cartItemEl.innerHTML = `
            <img src="${item.img}" alt="${item.title}">

            <div class="cart-item-details">
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${(item.price * item.qty).toLocaleString("vi-VN")} ₫</div>

                <div class="cart-item-actions">
                    <button class="qty-btn dec-btn" data-id="${item.id}">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn inc-btn" data-id="${item.id}">+</button>
                </div>
            </div>
        `;

        cartItemsContainer.appendChild(cartItemEl);
    });

    if (cartTotalPrice) {
        cartTotalPrice.innerText = total.toLocaleString("vi-VN") + " ₫";
    }

    // Tăng số lượng
    document.querySelectorAll(".inc-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.currentTarget.getAttribute("data-id"));
            const item = cart.find(i => i.id === id);

            if (item && currentUser) {
                item.qty++;
                updateCartUI();
            }
        });
    });

    // Giảm số lượng
    document.querySelectorAll(".dec-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const id = parseInt(e.currentTarget.getAttribute("data-id"));
            const itemIndex = cart.findIndex(i => i.id === id);

            if (!currentUser || itemIndex === -1) return;

            if (cart[itemIndex].qty > 1) {
                cart[itemIndex].qty--;
            } else {
                cart.splice(itemIndex, 1);
            }

            updateCartUI();
        });
    });
}

// ==========================================
// 9. THANH TOÁN
// ==========================================
document.getElementById("checkoutBtn")?.addEventListener("click", () => {

    // Chặn thanh toán nếu chưa đăng nhập
    if (!currentUser) {
        alert("Bạn cần đăng nhập để thanh toán!");
        authModal?.classList.add("active");
        return;
    }

    if (cart.length === 0) {
        alert("Giỏ hàng của bạn đang trống!");
        return;
    }

    alert("Thanh toán thành công! Cảm ơn bạn đã đặt hàng.");

    cart = [];
    updateCartUI();

    document.getElementById("cartDrawer")?.classList.remove("active");
    document.getElementById("cartOverlay")?.classList.remove("active");
});

// ==========================================
// 10. KHỞI TẠO CÁC SỰ KIỆN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {

    renderProducts(products);

    // Lọc danh mục
    document.querySelectorAll(".cat-btn").forEach(btn => {
        btn.addEventListener("click", (e) => {
            document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));

            e.currentTarget.classList.add("active");

            currentCategory = e.currentTarget.getAttribute("data-category");

            filterAndSortProducts();
        });
    });

    // Tìm kiếm
    document.getElementById("searchBtn")?.addEventListener("click", filterAndSortProducts);
    document.getElementById("searchInput")?.addEventListener("keyup", filterAndSortProducts);

    // Sắp xếp giá
    document.getElementById("sortSelect")?.addEventListener("change", filterAndSortProducts);

    // Mở giỏ hàng
    document.getElementById("openCartBtn")?.addEventListener("click", () => {

        if (!currentUser) {
            alert("Bạn cần đăng nhập để xem giỏ hàng!");
            authModal?.classList.add("active");
            return;
        }

        document.getElementById("cartDrawer")?.classList.add("active");
        document.getElementById("cartOverlay")?.classList.add("active");
    });

    // Đóng giỏ hàng
    const closeCart = () => {
        document.getElementById("cartDrawer")?.classList.remove("active");
        document.getElementById("cartOverlay")?.classList.remove("active");
    };

    document.getElementById("closeCartBtn")?.addEventListener("click", closeCart);
    document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
});
