import { ShippingMethod, ShippingOrigin } from "@flash-ship/ecom-types";
import { describe, expect, it } from "vitest";
import {
  normalizeCountryCode,
  parseExcelRows,
  parseNumberFlexible,
} from "../import-parser";

describe("import-parser utility", () => {
  describe("normalizeCountryCode", () => {
    it("should normalize common country names to ISO 2-letter codes", () => {
      expect(normalizeCountryCode("Mỹ")).toBe("US");
      expect(normalizeCountryCode("United States")).toBe("US");
      expect(normalizeCountryCode("Việt Nam")).toBe("VN");
      expect(normalizeCountryCode("Đức")).toBe("DE");
      expect(normalizeCountryCode("Pháp")).toBe("FR");
      expect(normalizeCountryCode("Đài Loan")).toBe("TW");
      expect(normalizeCountryCode("Hàn Quốc")).toBe("KR");
      expect(normalizeCountryCode("Nhật Bản")).toBe("JP");
    });

    it("should return uppercase string if unknown country is provided", () => {
      expect(normalizeCountryCode("xyz")).toBe("XYZ");
      expect(normalizeCountryCode(null)).toBeNull();
    });
  });

  describe("parseNumberFlexible", () => {
    it("should parse number strings with commas, currency signs, and units", () => {
      expect(parseNumberFlexible("20,5")).toBe(20.5);
      expect(parseNumberFlexible("$19.99")).toBe(19.99);
      expect(parseNumberFlexible("500g")).toBe(500);
      expect(parseNumberFlexible("2,5 kg")).toBe(2.5);
      expect(parseNumberFlexible("€ 100.50")).toBe(100.5);
    });

    it("should return null for invalid number strings", () => {
      expect(parseNumberFlexible("abc")).toBeNull();
      expect(parseNumberFlexible(null)).toBeNull();
    });
  });

  describe("parseExcelRows", () => {
    it("should parse valid row correctly", () => {
      const rawRows = [
        {
          "Mã đơn Seller": "SO-1001",
          "Dịch vụ": "EPACKET",
          "Kho gửi": "SGN",
          "Họ tên người nhận": "Nguyen Van A",
          "SĐT nhận": "0987654321",
          "Địa chỉ nhận 1": "123 Street",
          "Thành phố nhận": "New York",
          "Bang/Tỉnh nhận": "NY",
          "Quốc gia nhận": "US",
          "Zip người nhận": "10001",
          "Sản phẩm chi tiết": "T-Shirt",
          "Số lượng": "2",
          "Đơn giá": "15,5",
          "Mã HS Code SP": "6109.10",
          "Xuất xứ SP": "VN",
        },
      ];

      const parsed = parseExcelRows(rawRows, "vi");
      expect(parsed).toHaveLength(1);
      expect(parsed[0]?.shippingMethod).toBe(ShippingMethod.EPACKET);
      expect(parsed[0]?.shippingOrigin).toBe(ShippingOrigin.SGN);
      expect(parsed[0]?.products[0]?.excelLineNumber).toBe(2);
      expect(parsed[0]?.products[0]?.value).toBe(15.5);
    });

    it("should preserve empty or invalid shippingMethod without silent fallback", () => {
      const rawRows = [
        {
          "Mã đơn Seller": "SO-1002",
          "Dịch vụ": "", // Empty shipping method
          "Kho gửi": "INVALID_ORIGIN",
        },
      ];

      const parsed = parseExcelRows(rawRows, "vi");
      expect(parsed).toHaveLength(1);
      // Empty shippingMethod must NOT default silently to EXPRESS
      expect(parsed[0]?.shippingMethod).toBe("");
      // Invalid shippingOrigin must NOT default silently to HAN
      expect(parsed[0]?.shippingOrigin).toBe("INVALID_ORIGIN");
    });
  });
});
