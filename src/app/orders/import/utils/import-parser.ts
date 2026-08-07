import { ShippingMethod, ShippingOrigin } from "@flash-ship/ecom-types";

export interface ExcelRow {
  [key: string]: unknown;
}

export interface OrderImportError {
  line: number;
  columnName: string;
  enteredValue: string;
  errorReason: string;
}

export interface ParsedProduct {
  excelLineNumber?: number;
  description: string;
  quantity: number;
  value: number;
  sku: string | null;
  hsCode: string | null;
  originCountry: string | null;
  weight: number | null;
}

export interface ParsedOrder {
  excelRowNumbers: number[];
  shippingMethod: ShippingMethod | string;
  shippingOrigin: ShippingOrigin | string;
  sellerOrderId: string;
  packagingCode: string;
  senderName: string | null;
  senderPhone: string | null;
  senderEmail: string | null;
  senderAddress: string | null;
  senderCity: string | null;
  senderState: string | null;
  senderWard: string | null;
  senderZipCode: string | null;
  senderCountry: string | null;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string | null;
  receiverAddress1: string;
  receiverAddress2: string | null;
  receiverCity: string;
  receiverState: string;
  receiverCountry: string;
  receiverZipCode: string;
  detailDescription: string;
  declaredWeight: number | null;
  dimensionLength: number | null;
  dimensionWidth: number | null;
  dimensionHeight: number | null;
  declaredValue: number | null;
  products: ParsedProduct[];
}

/**
 * Normalizes country strings (e.g. "United States", "USA", "Mỹ", "Pháp") to ISO 2-letter codes.
 */
export function normalizeCountryCode(countryStr: string | null | undefined): string | null {
  if (!countryStr) return null;
  const clean = countryStr.trim().toLowerCase();
  if (["us", "usa", "united states", "mỹ", "hoa kỳ", "united states of america"].includes(clean))
    return "US";
  if (["vn", "viet nam", "vietnam", "việt nam"].includes(clean)) return "VN";
  if (["gb", "uk", "united kingdom", "great britain", "anh", "nước anh"].includes(clean))
    return "GB";
  if (["ca", "canada"].includes(clean)) return "CA";
  if (["de", "germany", "deutschland", "đức"].includes(clean)) return "DE";
  if (["au", "australia", "úc"].includes(clean)) return "AU";
  if (["jp", "japan", "nhật bản", "nhat ban"].includes(clean)) return "JP";
  if (["kr", "korea", "south korea", "hàn quốc", "han quoc"].includes(clean)) return "KR";
  if (["fr", "france", "pháp"].includes(clean)) return "FR";
  if (["it", "italy", "ý"].includes(clean)) return "IT";
  if (["nl", "netherlands", "hà lan"].includes(clean)) return "NL";
  if (["es", "spain", "tây ban nha"].includes(clean)) return "ES";
  if (["se", "sweden", "thụy điển"].includes(clean)) return "SE";
  if (["tw", "taiwan", "đài loan"].includes(clean)) return "TW";
  return countryStr.trim().toUpperCase();
}

/**
 * Normalizes phone number strings by removing extra spaces, dots, dashes, parentheses.
 */
export function normalizePhoneNumber(phoneStr: string | null | undefined): string | null {
  if (!phoneStr) return null;
  const clean = phoneStr.trim().replace(/[\s\-.()]/g, "");
  return clean || null;
}

/**
 * Normalizes postal zipcode strings (trims, uppercase).
 */
export function normalizePostcode(zipStr: string | null | undefined): string | null {
  if (!zipStr) return null;
  const clean = zipStr.trim().toUpperCase();
  return clean || null;
}

/**
 * Parses numeric strings with support for Vietnamese decimal comma (e.g., "20,5" -> 20.5)
 * and strips common currency symbols ($ € £ ¥) and measurement units (kg, g, lbs, cm, mm).
 */
export function parseNumberFlexible(numStr: string | null | undefined): number | null {
  if (!numStr) return null;
  let clean = numStr.trim();
  // Strip currency symbols and measurement units
  clean = clean.replace(/[$€£¥]/g, "").replace(/\s*(kg|g|lbs|cm|mm)$/i, "").trim();
  if (clean.includes(",") && !clean.includes(".")) {
    clean = clean.replace(",", ".");
  } else if (clean.includes(".") && clean.includes(",")) {
    clean = clean.replace(/\./g, "").replace(",", ".");
  }
  const parsed = parseFloat(clean);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Parses raw Excel rows into structured order and product models,
 * grouping items belonging to the same order based on duplicate Seller Order IDs.
 */
export function parseExcelRows(
  rawRows: ExcelRow[],
  _currentLocale: string,
  onSampleDataDetected?: () => void,
): ParsedOrder[] {
  const ordersMap = new Map<string, ParsedOrder>();
  let sampleDetected = false;

  // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: High complexity from validation and nested product grouping
  rawRows.forEach((row, idx) => {
    const lineNum = idx + 2; // Line 1 is the header row

    // Find column values matching any title variant regardless of case, spaces, or newline characters
    // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Column mapping helper searches multiple header alias variants
    const getVal = (...titles: string[]): string => {
      for (const [key, val] of Object.entries(row)) {
        const cleanKey = key.trim().toLowerCase().replace(/\s+/g, "");
        for (const title of titles) {
          const cleanTitle = title.trim().toLowerCase().replace(/\s+/g, "");
          if (
            cleanKey === cleanTitle ||
            cleanKey.includes(cleanTitle) ||
            key.toLowerCase().includes(title.toLowerCase())
          ) {
            if (val !== null && val !== undefined) {
              return String(val).trim();
            }
          }
        }
      }
      return "";
    };

    // Skip entirely empty rows
    const allVals = Object.values(row)
      .map((v) => String(v).trim())
      .filter((v) => v !== "");
    if (allVals.length === 0) return;

    const sellerOrderId =
      getVal("Mã đơn Seller", "sellerOrderId", "Seller Order ID") ||
      `EXCEL-TEMP-${Date.now()}-${idx}`;

    // Automatically filter out placeholder sample rows
    if (sellerOrderId === "SO-2026-001" || sellerOrderId === "SO-2026-002") {
      sampleDetected = true;
      return;
    }

    // Read item details with data sanitation
    const itemName = getVal("Sản phẩm chi tiết", "itemName", "Item Name");
    const itemQtyVal = getVal("Số lượng", "itemQty", "Item Qty", "quantity");
    const itemPriceVal = getVal("Đơn giá", "itemPrice", "Item Price", "price");
    const itemSku = getVal("SKU", "itemSku", "Item SKU");
    const itemHsCode = getVal("Mã HS Code SP", "itemHsCode", "Item HS Code", "HS Code");
    const itemOriginRaw = getVal("Xuất xứ SP", "itemOrigin", "Item Origin", "Xuất xứ");

    const itemQty = itemQtyVal ? parseInt(itemQtyVal, 10) : 1;
    const itemPrice = parseNumberFlexible(itemPriceVal) ?? 0;
    const itemOrigin = normalizeCountryCode(itemOriginRaw);

    const product: ParsedProduct = {
      excelLineNumber: lineNum,
      description: itemName || "",
      quantity: Number.isNaN(itemQty) ? 1 : itemQty,
      value: itemPrice,
      sku: itemSku || null,
      hsCode: itemHsCode || null,
      originCountry: itemOrigin,
      weight: null,
    };

    // Group products under the same sellerOrderId
    const existingOrder = ordersMap.get(sellerOrderId);
    if (existingOrder) {
      existingOrder.excelRowNumbers.push(lineNum);
      existingOrder.products.push(product);
    } else {
      const receiverName = getVal("Họ tên người nhận", "receiverName", "Receiver Name");
      const receiverPhoneRaw = getVal("SĐT nhận", "receiverPhone", "Receiver Phone");
      const receiverEmail = getVal("Email nhận", "receiverEmail", "Receiver Email");
      const receiverAddress1 = getVal("Địa chỉ nhận 1", "receiverAddress1", "Receiver Address 1");
      const receiverAddress2 = getVal("Địa chỉ nhận 2", "receiverAddress2", "Receiver Address 2");
      const receiverCity = getVal("Thành phố nhận", "receiverCity", "Receiver City");
      const receiverState = getVal("Bang/Tỉnh nhận", "receiverState", "Receiver State");
      const receiverCountryRaw = getVal("Quốc gia nhận", "receiverCountry", "Receiver Country");
      const receiverZipCodeRaw = getVal("Zip người nhận", "receiverZipCode", "Receiver Zip Code");

      const senderName = getVal("Tên người gửi", "senderName", "Sender Name");
      const senderPhoneRaw = getVal("SĐT gửi", "senderPhone", "Sender Phone");
      const senderEmail = getVal("Email gửi", "senderEmail", "Sender Email");
      const senderAddress = getVal("Địa chỉ gửi", "senderAddress", "Sender Address");
      const senderCity = getVal("Thành phố gửi", "senderCity", "Sender City");
      const senderState = getVal("Bang/Tỉnh gửi", "senderState", "Sender State");
      const senderWard = getVal("Phường/Xã gửi", "senderWard", "Sender Ward");
      const senderZipCodeRaw = getVal("Zip người gửi", "senderZipCode", "Sender Zip Code");
      const senderCountryRaw = getVal("Quốc gia gửi", "senderCountry", "Sender Country");

      const shippingMethodVal = getVal(
        "Dịch vụ",
        "shippingMethod",
        "Shipping Method",
      ).toUpperCase();
      const shippingOriginVal = getVal(
        "Kho gửi",
        "shippingOrigin",
        "Shipping Origin",
      ).toUpperCase();

      // Strict enum validation: do not default blank or invalid values silently
      let shippingMethod: ShippingMethod | string = shippingMethodVal;
      if (shippingMethodVal === "EPACKET") {
        shippingMethod = ShippingMethod.EPACKET;
      } else if (shippingMethodVal === "EXPRESS") {
        shippingMethod = ShippingMethod.EXPRESS;
      }

      let shippingOrigin: ShippingOrigin | string = shippingOriginVal;
      if (shippingOriginVal === "SGN") {
        shippingOrigin = ShippingOrigin.SGN;
      } else if (shippingOriginVal === "HAN" || !shippingOriginVal) {
        shippingOrigin = ShippingOrigin.HAN; // Default to HAN if blank
      }

      const packagingCode =
        getVal("Loại đóng gói", "packagingCode", "Package Packaging Code") || "cardboard_box";
      const detailDescription = getVal(
        "Mô tả kiện hàng",
        "Mô tả hàng hóa",
        "Package Description",
        "detailDescription",
      );
      const weightVal = getVal(
        "Cân nặng kiện hàng",
        "Cân nặng",
        "Trọng lượng",
        "Package Weight",
        "declaredWeight",
      );
      const lengthVal = getVal(
        "Dài kiện hàng",
        "Chiều dài",
        "Package Length",
        "dimensionLength",
        "length",
      );
      const widthVal = getVal(
        "Rộng kiện hàng",
        "Chiều rộng",
        "Package Width",
        "dimensionWidth",
        "width",
      );
      const heightVal = getVal(
        "Cao kiện hàng",
        "Chiều cao",
        "Package Height",
        "dimensionHeight",
        "height",
      );
      const declaredValueVal = getVal(
        "Khai giá kiện hàng",
        "Trị giá hàng",
        "Khai giá",
        "Package Declared Value",
        "declaredValue",
      );

      const declaredWeight = parseNumberFlexible(weightVal);
      const dimensionLength = parseNumberFlexible(lengthVal);
      const dimensionWidth = parseNumberFlexible(widthVal);
      const dimensionHeight = parseNumberFlexible(heightVal);
      const declaredValue = parseNumberFlexible(declaredValueVal);

      const receiverPhone = normalizePhoneNumber(receiverPhoneRaw) || receiverPhoneRaw;
      const senderPhone = normalizePhoneNumber(senderPhoneRaw) || senderPhoneRaw;
      const receiverZipCode = normalizePostcode(receiverZipCodeRaw) || receiverZipCodeRaw;
      const senderZipCode = normalizePostcode(senderZipCodeRaw) || senderZipCodeRaw;
      const receiverCountry = normalizeCountryCode(receiverCountryRaw) || receiverCountryRaw;
      const senderCountry = normalizeCountryCode(senderCountryRaw) || senderCountryRaw;

      ordersMap.set(sellerOrderId, {
        excelRowNumbers: [lineNum],
        shippingMethod,
        shippingOrigin,
        sellerOrderId,
        packagingCode,
        senderName: senderName || null,
        senderPhone: senderPhone || null,
        senderEmail: senderEmail || null,
        senderAddress: senderAddress || null,
        senderCity: senderCity || null,
        senderState: senderState || null,
        senderWard: senderWard || null,
        senderZipCode: senderZipCode || null,
        senderCountry: senderCountry || null,
        receiverName,
        receiverPhone,
        receiverEmail: receiverEmail || null,
        receiverAddress1,
        receiverAddress2: receiverAddress2 || null,
        receiverCity,
        receiverState,
        receiverCountry,
        receiverZipCode,
        detailDescription,
        declaredWeight: declaredWeight && !Number.isNaN(declaredWeight) ? declaredWeight : null,
        dimensionLength:
          dimensionLength !== null && !Number.isNaN(dimensionLength) ? dimensionLength : null,
        dimensionWidth:
          dimensionWidth !== null && !Number.isNaN(dimensionWidth) ? dimensionWidth : null,
        dimensionHeight:
          dimensionHeight !== null && !Number.isNaN(dimensionHeight) ? dimensionHeight : null,
        declaredValue:
          declaredValue !== null && !Number.isNaN(declaredValue) ? declaredValue : null,
        products: [product],
      });
    }
  });

  if (sampleDetected && onSampleDataDetected) {
    onSampleDataDetected();
  }

  return Array.from(ordersMap.values());
}

/**
 * Builds and downloads an Excel file containing list of validation errors
 * on the client-side using SheetJS.
 */
export async function exportErrorsToExcel(
  errors: OrderImportError[],
  fileName: string,
  sessionId: string | null,
  _currentLocale: string,
): Promise<void> {
  const XLSX = await import("xlsx");
  const dataRows = errors.map((e) => ({
    "Dòng (Row)": e.line,
    "Cột lỗi (Column)": e.columnName,
    "Giá trị đã nhập (Value)": e.enteredValue,
    "Chi tiết lỗi (Reason)": e.errorReason,
  }));

  const worksheet = XLSX.utils.json_to_sheet(dataRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Validation Errors");

  // Autofit column widths
  const maxColWidth = [{ wch: 12 }, { wch: 25 }, { wch: 25 }, { wch: 65 }];
  worksheet["!cols"] = maxColWidth;

  XLSX.writeFile(workbook, `Import_Errors_${fileName}_Session_${sessionId || Date.now()}.xlsx`);
}
