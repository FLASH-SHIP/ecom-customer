/**
 * Tập hợp các biểu thức chính quy (Regular Expressions) dùng chung trong ecom-customer
 */

export const REGEX_PATTERNS = {
  /**
   * Họ và tên: Chỉ bao gồm chữ cái (bao gồm tiếng Việt có dấu) và khoảng trắng, không chứa ký tự đặc biệt.
   */
  NO_SPECIAL_CHARS_NAME: /^[\p{L}\s]+$/u,

  /**
   * Username: Chỉ bao gồm chữ cái, chữ số, dấu gạch dưới (_) và dấu chấm (.).
   */
  USERNAME: /^[a-zA-Z0-9_.]*$/,

  /**
   * Số điện thoại Việt Nam: Hỗ trợ các định dạng 0x..., 84x..., +84x... (với di động 3, 5, 7, 8, 9).
   */
  VN_PHONE: /^(?:\+84|84|0)(?:3|5|7|8|9)\d{8}$/,

  /**
   * Email hợp lệ cơ bản.
   */
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

  /**
   * Chỉ chứa các chữ số.
   */
  DIGITS_ONLY: /^\d+$/,

  /**
   * Định dạng ngày YYYY-MM-DD ISO.
   */
  DATE_ISO: /^\d{4}-\d{2}-\d{2}$/,
} as const;

// Aliases xuất bản ngắn gọn dễ sử dụng
export const noSpecialCharsNameRegex = REGEX_PATTERNS.NO_SPECIAL_CHARS_NAME;
export const usernameRegex = REGEX_PATTERNS.USERNAME;
export const vnPhoneRegex = REGEX_PATTERNS.VN_PHONE;
export const emailRegex = REGEX_PATTERNS.EMAIL;
export const digitsOnlyRegex = REGEX_PATTERNS.DIGITS_ONLY;
export const dateIsoRegex = REGEX_PATTERNS.DATE_ISO;
