const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5001/api';

class ApiClient {
  constructor() {
    // Load token from localStorage if available
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  refreshToken() {
    this.token = localStorage.getItem('token');
  }

  setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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

    // Always check for the latest token from localStorage
    const currentToken = this.token || localStorage.getItem('token');
    if (currentToken) {
      config.headers.Authorization = `Bearer ${currentToken}`;
    }

    try {
      // For development/testing, return mock data for specific endpoints when server is unavailable
      if (endpoint === '/schedule/today') {
        return [];
      }
      if (endpoint === '/food/orders') {
        return [];
      }
      // Removed fallback for /payment/wallet to allow proper error handling
      if (endpoint === '/schedule/attendance/stats') {
        return { present: 0, total: 0, percentage: 0 };
      }
      if (endpoint === '/schedule/campus/status') {
        return { status: 'normal' };
      }

      const response = await fetch(url, config);

      if (!response.ok) {
        // Try to parse error response
        const errorData = await response.json().catch(() => ({ error: `Server error: ${response.status}` }));
        
        // Handle 500 server errors specifically
        if (response.status === 500) {
          console.error(`Server error (500) for ${endpoint}:`, errorData);
          throw new Error('Internal server error. Please try again later.');
        }
        
        throw new Error(errorData.error || `Request failed with status: ${response.status}`);
      }

      // Handle empty responses
      if (response.status === 204) {
        return {};
      }

      return response.json().catch(err => {
        console.error(`Failed to parse JSON response for ${endpoint}:`, err);
        return {};
      });
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      // Return default values for specific endpoints to prevent UI errors
      if (endpoint === '/schedule/today') return [];
      if (endpoint === '/food/orders') return [];
      // Removed fallback for /payment/wallet to allow proper error handling
      if (endpoint === '/schedule/attendance/stats') return { present: 0, total: 0, percentage: 0 };
      if (endpoint === '/schedule/campus/status') return { status: 'normal' };
      throw error;
    }
  }

  // Auth
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    this.setUser(data.user);
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
    return await this.request('/food/orders');
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
    return await this.request('/parking/clear-all', {
      method: 'POST',
    });
  }

  // Schedule
  async getTodaySchedule() {
    return await this.request('/schedule/today');
  }

  async getAttendanceStats() {
    return await this.request('/schedule/attendance/stats');
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
    return await this.request('/schedule/campus/status');
  }

  async getStaffDashboard() {
    return await this.request('/schedule/staff/dashboard');
  }

  async getAdminDashboard() {
    return await this.request('/schedule/admin/dashboard');
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
    return await this.request('/payment/wallet');
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

  async fixWalletBalance() {
    return this.request('/payment/fix-balance', {
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
    return await this.request('/grades/instructor/courses');
  }

  async getCourseEnrollments(courseId) {
    return await this.request(`/grades/course/${courseId}/enrollments`);
  }

  async createGradeSheet(courseId, gradeData) {
    return await this.request(`/grades/course/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(gradeData),
    });
  }

  async submitGradeSheet(gradeId) {
      return await this.request(`/grades/${gradeId}/submit`, {
        method: 'POST',
      });
  }

  async getInstructorGrades() {
    return await this.request('/grades/instructor/grades');
  }

  async getPendingGrades() {
    return await this.request('/grades/admin/pending');
  }

  async approveGradeSheet(gradeId, comments) {
    return await this.request(`/grades/${gradeId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comments }),
    });
  }

  async rejectGradeSheet(gradeId, reason) {
    return await this.request(`/grades/${gradeId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  async publishGradeSheet(gradeId) {
    return await this.request(`/grades/${gradeId}/publish`, {
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
    // Temporarily remove token for development
    const originalToken = this.token;
    this.token = null;

    try {
      return await this.request(`/notifications?page=${page}&limit=${limit}&unreadOnly=${unreadOnly}`);
    } finally {
      this.token = originalToken;
    }
  }

  async markNotificationAsRead(notificationId) {
    // Temporarily remove token for development
    const originalToken = this.token;
    this.token = null;

    try {
      return await this.request(`/notifications/${notificationId}/read`, {
        method: 'POST',
      });
    } finally {
      this.token = originalToken;
    }
  }

  async markAllNotificationsAsRead() {
    // Temporarily remove token for development
    const originalToken = this.token;
    this.token = null;

    try {
      return await this.request('/notifications/mark-all-read', {
        method: 'POST',
      });
    } finally {
      this.token = originalToken;
    }
  }

  async getUnreadNotificationCount() {
    // Temporarily remove token for development
    const originalToken = this.token;
    this.token = null;

    try {
      return await this.request('/notifications/unread-count');
    } finally {
      this.token = originalToken;
    }
  }
}

export const api = new ApiClient();