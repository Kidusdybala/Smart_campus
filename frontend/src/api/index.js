const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async register(name, email, password, role) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    return data;
  }

  // QR
  async scanQR(qrCode, location) {
    return this.request('/qr/scan', {
      method: 'POST',
      body: JSON.stringify({ qrCode, location }),
    });
  }

  async getMyQR() {
    return this.request('/qr/my-qr');
  }

  async getScanHistory() {
    return this.request('/qr/history');
  }

  // Food
  async getMenu() {
    return this.request('/food/menu');
  }

  async placeOrder(items) {
    return this.request('/food/order', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  async getOrders() {
    return this.request('/food/orders');
  }

  // Parking
  async getParkingSlots() {
    return this.request('/parking');
  }

  async reserveSlot(slot, vehicleDetails) {
    return this.request(`/parking/reserve/${slot}`, {
      method: 'POST',
      body: JSON.stringify(vehicleDetails),
    });
  }

  async clearAllReservations() {
    return this.request('/parking/clear-all', {
      method: 'POST',
    });
  }

  // Schedule
  async getTodaySchedule() {
    return this.request('/schedule/today');
  }

  async getAttendanceStats() {
    return this.request('/schedule/attendance/stats');
  }

  async getSchedules() {
    return this.request('/schedule');
  }

  async createSchedule(scheduleData) {
    return this.request('/schedule', {
      method: 'POST',
      body: JSON.stringify(scheduleData),
    });
  }

  async getCampusStatus() {
    return this.request('/schedule/campus/status');
  }

  async getStaffDashboard() {
    // Temporarily remove token for development
    const originalToken = this.token;
    this.token = null;

    try {
      return await this.request('/schedule/staff/dashboard');
    } finally {
      this.token = originalToken;
    }
  }

  async getAdminDashboard() {
    return this.request('/schedule/admin/dashboard');
  }

  // Profile management
  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async changePassword(passwordData) {
    return this.request('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async updateVehicle(vehicleData) {
    return this.request('/auth/vehicle', {
      method: 'PUT',
      body: JSON.stringify(vehicleData),
    });
  }

  // Wallet and Payment
  async getWalletBalance() {
    return this.request('/payment/wallet');
  }

  async getPaymentHistory() {
    return this.request('/payment/history');
  }

  async topupWallet(amount) {
    return this.request('/payment/topup', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async completePayment(paymentId) {
    return this.request(`/payment/complete/${paymentId}`, {
      method: 'POST',
    });
  }

  async payForOrder(orderId) {
    return this.request(`/payment/food-order/${orderId}`, {
      method: 'POST',
    });
  }

  // Cafeteria functions
  async getAllOrders() {
    return this.request('/food/all-orders');
  }

  async updateOrderStatus(orderId, status) {
    return this.request(`/food/order/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Grade Management
  async getInstructorCourses() {
    // Temporarily remove token for development
    const originalToken = this.token;
    this.token = null;

    try {
      return await this.request('/grades/instructor/courses');
    } finally {
      this.token = originalToken;
    }
  }

  async getCourseEnrollments(courseId) {
    // Temporarily remove token for development
    const originalToken = this.token;
    this.token = null;

    try {
      return await this.request(`/grades/course/${courseId}/enrollments`);
    } finally {
      this.token = originalToken;
    }
  }

  async createGradeSheet(courseId, gradeData) {
    // Temporarily remove token for development
    const originalToken = this.token;
    this.token = null;

    try {
      const result = await this.request(`/grades/course/${courseId}`, {
        method: 'POST',
        body: JSON.stringify(gradeData),
      });
      return result;
    } finally {
      this.token = originalToken;
    }
  }

  async submitGradeSheet(gradeId) {
    // Temporarily remove token for development
    const originalToken = this.token;
    this.token = null;

    try {
      return await this.request(`/grades/${gradeId}/submit`, {
        method: 'POST',
      });
    } finally {
      this.token = originalToken;
    }
  }

  async getInstructorGrades() {
    // Temporarily remove token for development
    const originalToken = this.token;
    this.token = null;

    try {
      return await this.request('/grades/instructor/grades');
    } finally {
      this.token = originalToken;
    }
  }

  async getPendingGrades() {
    return this.request('/grades/admin/pending');
  }

  async approveGradeSheet(gradeId, comments) {
    return this.request(`/grades/${gradeId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  }

  async rejectGradeSheet(gradeId, reason) {
    return this.request(`/grades/${gradeId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async publishGradeSheet(gradeId) {
    return this.request(`/grades/${gradeId}/publish`, {
      method: 'POST',
    });
  }

  async getStudentGrades() {
    return this.request('/grades/student/grades');
  }

  async getStudentCourses() {
    return this.request('/grades/student/courses');
  }

  async getGradeHistory(gradeId) {
    return this.request(`/grades/${gradeId}/history`);
  }

  // Notifications
  async getNotifications(page = 1, limit = 20, unreadOnly = false) {
    return this.request(`/grades/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/grades/notifications/${notificationId}/read`, {
      method: 'POST',
    });
  }

  async markAllNotificationsAsRead() {
    return this.request('/grades/notifications/mark-all-read', {
      method: 'POST',
    });
  }

  async getUnreadNotificationCount() {
    return this.request('/grades/notifications/unread-count');
  }
}

export const api = new ApiClient();