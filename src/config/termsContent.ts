/**
 * @file termsContent.ts
 * @description Tệp quản lý tập trung 100% nội dung pháp lý của 4 Tab Điều Khoản Dịch Vụ
 * (Credit Terms, Transportation, Appendix, Trade Compliance) hỗ trợ 2 ngôn ngữ Tiếng Việt (VI) & Tiếng Anh (EN).
 * 
 * Người dùng có thể dễ dàng bổ sung / chỉnh sửa văn bản tiếng Việt và tiếng Anh cho từng mục tại tệp này.
 */

export type TabType = "credit" | "transportation" | "appendix" | "trade";

export interface ClauseItem {
  /** Mã định danh mục (Tùy chọn) */
  id?: string;
  /** Tiêu đề chính của mục (VI & EN) */
  title?: {
    vi: string;
    en: string;
  };
  /** Đoạn văn bản mô tả (VI & EN) */
  content?: {
    vi: string;
    en: string;
  };
  /** 
   * Kiểu hiển thị danh sách: 
   * - "number": Đánh số tự động (1, 2, 3...)
   * - "subnumber" / "decimal": Đánh số phân cấp (2.1, 2.2, 2.3...)
   * - "alpha" / "letter": Đánh chữ cái thường a), b), c)... (giống ảnh mẫu)
   * - "bullet": Dấu chấm tròn (•)
   * - "none" / "plain": Dòng văn bản thường (không số, không dấu chấm)
   * Mặc định: "number"
   */
  listType?: "number" | "subnumber" | "decimal" | "alpha" | "letter" | "bullet" | "none" | "plain";
  /** Số phân cấp cha (Tùy chọn, ví dụ: 2 ➔ tự động sinh 2.1, 2.2, 2.3...) */
  parentNumber?: string | number;
  /**
   * Kiểu khung bao ngoài:
   * - "default": Hiển thị phẳng bình thường
   * - "boxed": Hiển thị trong khung bo tròn có viền và nền xám nhẹ (giống ảnh mẫu)
   */
  variant?: "default" | "boxed";
  /** Cờ bật khung xám có viền ngắn gọn: true | false */
  isBoxed?: boolean;
  /** Số thứ tự bắt đầu cho mục này (Tùy chọn, nếu muốn đặt lại số đếm) */
  startNumber?: number;
  /** Danh sách các điều khoản con (VI & EN) */
  list?: Array<{
    vi: string;
    en: string;
  }>;
}

export interface TermsSection {
  /** Mã phần (VI & EN, ví dụ: { vi: "PHẦN 01", en: "SECTION 01" }) */
  sectionCode: {
    vi: string;
    en: string;
  } | string;
  /** Tiêu đề phần (VI & EN) */
  title: {
    vi: string;
    en: string;
  };
  /** Đoạn văn bản mở đầu của cả phần (Tùy chọn) */
  description?: {
    vi: string;
    en: string;
  };
  /** Danh sách các điều khoản chi tiết */
  clauses: ClauseItem[];
}

export const TERMS_CONTENT: Record<TabType, TermsSection> = {
  credit: {
    sectionCode: {
      vi: "PHẦN 01",
      en: "SECTION 01",
    },
    title: {
      vi: "Điều Khoản và Điều Kiện Tín Dụng",
      en: "Credit Terms and Conditions",
    },
    clauses: [
      {
        id: "invoicing-due-date",
        title: {
          vi: "I. HÓA ĐƠN VÀ THỜI HẠN THANH TOÁN",
          en: "I. INVOICING AND DUE DATE",
        },
        list: [
          {
            vi: "Đối với các lô hàng được sắp xếp theo dạng Thanh toán ở đầu nước ngoài hoặc do Người nhận Thanh toán (tuỳ thuộc vào sự đồng ý trước của EcomExpress), khách hàng cam kết thanh toán tất cả phí, chi phí hoặc dịch vụ khác do EcomExpress thực hiện nếu người nhận từ chối thanh toán hoặc nếu vì bất kỳ lý do gì khác mà EcomExpress không thể thu được khoản tiền thanh toán đó.",
            en: "For shipments arranged on a Freight Collect or Recipient Pays basis (subject to prior agreement by Ecom Express), the Customer undertakes to pay all fees, charges, or other services rendered by Ecom Express if the recipient refuses to pay or for any other reason Ecom Express is unable to collect such payment.",
          },
          {
            vi: "EcomExpress sẽ phát hành hoá đơn và gửi định kỳ đến cho khách hàng (hàng tuần, hàng ngày hay trong khoảng thời gian khác theo chủ ý của EcomExpress), thể hiện khoản tiền mà khách hàng phải trả cho EcomExpress.",
            en: "Ecom Express shall issue invoices and periodically send them to the Customer (weekly, daily, or at such other intervals as determined at Ecom Express's discretion), specifying the amounts payable by the Customer to Ecom Express.",
          },
          {
            vi: "Khách hàng sẽ phải thanh toán cho EcomExpress số tiền ghi trong hoá đơn vào hoặc trước Ngày đến hạn ghi trong hoá đơn (\"Ngày đến hạn\") mà không có sự khấu trừ hay trì hoãn vì bất kỳ sự khiếu nại, phản tố hay bù trừ nào.",
            en: "The Customer shall pay Ecom Express the amount specified in the invoice on or before the due date stated on the invoice (\"Due Date\") without any deduction, delay, set-off, counterclaim, or withholding whatsoever.",
          },
          {
            vi: "Hóa đơn sẽ được gửi cho Khách hàng qua email đến địa chỉ email mới nhất do Khách hàng cung cấp. Ecom Express sẽ không cung cấp hóa đơn bản giấy.",
            en: "Invoices shall be transmitted to the Customer via electronic mail to the latest email address provided by the Customer. Hard-copy paper invoices will not be provided.",
          },
          {
            vi: "Khách hàng phải lập tức thông báo bằng văn bản cho Ecom Express về mọi thay đổi đối với Tên doanh nghiệp, Địa chỉ và Người liên hệ.",
            en: "The Customer must notify Ecom Express immediately in writing of any changes to its Business Name, Address, and Contact Person.",
          },
          {
            vi: "Ngày làm việc (Business Days) được hiểu duy nhất là \"Thứ Hai đến Thứ Sáu\", không bao gồm các ngày nghỉ lễ thông thường hoặc ngày nghỉ lễ đặc biệt.",
            en: "Business Days are defined exclusively as \"Monday to Friday\", excluding regular or special public holidays.",
          },
          {
            vi: "Ecom Express có quyền phân bổ bất kỳ khoản thanh toán nào nhận được để thanh toán các hóa đơn đã phát hành trước đó nhưng còn tồn đọng.",
            en: "Ecom Express reserves the right to allocate any payment received to settle any previously outstanding invoices issued by Ecom Express.",
          },
        ],
      },
      {
        id: "late-payment-charges",
        title: {
          vi: "II. Phí thanh toán chậm",
          en: "II. Late Payment Charges",
        },
        list: [
          {
            vi: "Mức cước mà Khách hàng phải thanh toán được quy định trong Tariff/Price List đính kèm theo đây, và Ecom Express có quyền thực hiện các sửa đổi, bổ sung hoặc điều chỉnh mà Ecom Express xét thấy phù hợp theo từng thời điểm mà không cần thông báo trước.",
            en: "The rates payable by the Customer are set forth in the Tariff/Price List attached hereto, and Ecom Express reserves the right to make modifications, amendments, or adjustments deemed appropriate from time to time without prior notice.",
          },
          {
            vi: "Các khoản thanh toán chậm hoặc quá hạn sẽ chịu lãi và phí hành chính ở mức 1,5% mỗi tháng.",
            en: "Late or overdue payments shall be subject to interest and administrative charges at the rate of 1.5% per month.",
          },
        ],
      },
      {
        id: "invoice-queries",
        title: {
          vi: "III. Tra soát hóa đơn",
          en: "III. Invoice Queries",
        },
        list: [
          {
            vi: "Khách hàng phải kiểm tra và đối soát toàn bộ hóa đơn, đồng thời thông báo bằng văn bản cho Ecom Express về bất kỳ sai sót, tranh chấp hoặc bất thường nào trong hóa đơn. Nếu không có thông báo như vậy, hóa đơn sẽ được xem là chính xác, cuối cùng và có giá trị ràng buộc đối với Khách hàng mà không cần thêm bằng chứng, trừ khi Ecom Express nhận được phản đối bằng văn bản trong vòng bảy (7) ngày kể từ ngày Khách hàng nhận hóa đơn.",
            en: "The Customer must examine and audit all invoices and notify Ecom Express in writing of any error, dispute, or irregularity contained therein. In the absence of such notification, the invoice shall be deemed correct, final, and binding upon the Customer without further proof, unless written objection is received by Ecom Express within seven (7) days from the date of invoice receipt.",
          },
        ],
      },
      {
        id: "term-validity",
        title: {
          vi: "IV. Thời hạn và Hiệu lực",
          en: "IV. Term & Validity",
        },
        list: [
          {
            vi: "Nếu Đăng ký tài khoản được Ecom Express chấp thuận, tài khoản sẽ có hiệu lực đến hết năm dương lịch. Sau đó, tài khoản sẽ tự động gia hạn hàng năm, trừ khi được chấm dứt theo các Điều khoản 13–16 dưới đây.",
            en: "If the Account Registration is accepted by Ecom Express, the account shall remain valid until the end of the calendar year. Thereafter, the account shall automatically renew annually unless terminated in accordance with Clauses 13–16 below.",
          },
          {
            vi: "Shipper/Khách hàng phải duy trì sản lượng kinh doanh tối thiểu hàng tháng (Doanh thu/Số lượng Shipment/Trọng lượng) theo quy định của Ecom Express để tiếp tục đủ điều kiện sử dụng hạn mức tín dụng. Nếu không duy trì sản lượng tối thiểu này, Ecom Express có quyền hủy hạn mức tín dụng và tài khoản.",
            en: "The Shipper/Customer must maintain a minimum monthly business volume (Revenue/Shipment Count/Weight) as prescribed by Ecom Express to remain eligible for the credit facility. If such minimum volume is not maintained, Ecom Express reserves the right to cancel the credit facility and the account.",
          },
          {
            vi: "Ecom Express có thể chấm dứt Credit Account vào bất kỳ thời điểm nào mà không cần thông báo trước và theo toàn quyền quyết định của Ecom Express.",
            en: "Ecom Express may terminate the Credit Account at any time without prior notice and at its sole discretion.",
          },
          {
            vi: "Ecom Express có quyền chấm dứt Credit Account theo toàn quyền quyết định của mình nếu các hóa đơn vẫn chưa được thanh toán trong một khoảng thời gian kéo dài.",
            en: "Ecom Express reserves the right to terminate the Credit Account at its sole discretion if invoices remain unpaid for an extended period.",
          },
          {
            vi: "Khách hàng có thể chấm dứt Credit Account bằng cách gửi thông báo bằng văn bản cho Ecom Express trước ít nhất ba mươi (30) ngày.",
            en: "The Customer may terminate the Credit Account by giving at least thirty (30) days' prior written notice to Ecom Express.",
          },
          {
            vi: "Khi Credit Account bị chấm dứt, toàn bộ các khoản còn tồn đọng sẽ ngay lập tức đến hạn và phải thanh toán (bất kể các Due Date tiếp theo được ghi trên bất kỳ hóa đơn nào đã phát hành), và Khách hàng phải thanh toán cho Ecom Express toàn bộ số tiền còn nợ trong thời gian sớm nhất và trong mọi trường hợp không muộn hơn bảy (7) ngày kể từ ngày chấm dứt.",
            en: "Upon termination of the Credit Account, all outstanding amounts shall immediately become due and payable (regardless of any subsequent Due Dates stated on any issued invoices), and the Customer must pay Ecom Express all outstanding sums as soon as possible and in any event within seven (7) days from the date of termination.",
          },
          {
            vi: "Nếu một phần nào đó của hợp đồng bị coi là bất hợp pháp, vô hiệu hoặc không thể thực thi, thì chỉ phần đó bị loại bỏ, còn những phần còn lại của hợp đồng vẫn tiếp tục có hiệu lực.",
            en: "If any provision herein is or becomes illegal, invalid, or unenforceable in whole or in part under any enactment or rule of law, such provision shall be deemed severed to that extent, and the legality, validity, and enforceability of the remaining provisions shall not in any way be affected or impaired thereby.",
          },
          {
            vi: "Credit Account được cấp cho Khách hàng dựa trên các cam kết và thông tin được cung cấp bằng lời nói và bằng văn bản cho Ecom Express, và chỉ có giá trị cho việc sử dụng bởi chính Khách hàng đó.",
            en: "The Credit Account is granted to the Customer based on oral and written representations made to Ecom Express and is valid solely for use by that Customer.",
          },
          {
            vi: "Khách hàng luôn phải bồi thường, bảo vệ và đảm bảo Ecom Express không phải chịu trách nhiệm đối với mọi tổn thất, thiệt hại và/hoặc chi phí mà Ecom Express trực tiếp hoặc gián tiếp phát sinh do việc cấp Credit Account cho Khách hàng.",
            en: "The Customer shall always indemnify, defend, and hold harmless Ecom Express against any loss, damage, and/or expenses incurred directly or indirectly by Ecom Express because of granting the Credit Account to the Customer.",
          },
        ],
      },
      {
        id: "waiver",
        title: {
          vi: "V. Từ bỏ quyền",
          en: "V. Waiver",
        },
        list: [
          {
            vi: "Nếu Ecom không thực hiện một quyền nào đó, hoặc thực hiện quyền đó chậm, thì điều đó không có nghĩa là EcomExpress đã từ bỏ quyền đó.",
            en: "No failure or delay by Ecom Express in exercising any right hereunder shall operate as a waiver or variation thereof, nor shall any single or partial exercise of any right preclude any other or further exercise thereof or the exercise of any other right. No waiver, course of dealing, or negotiation by or on behalf of Ecom Express shall preclude Ecom Express from exercising any right hereunder or constitute a suspension or modification thereof.",
          },
        ],
      },
      {
        id: "amendments",
        title: {
          vi: "VI. Sửa đổi",
          en: "VI. Amendments",
        },
        list: [
          {
            vi: "Ecom Express có toàn quyền quyết định, thay đổi hoặc sửa đổi bất kỳ điều khoản nào tại đây. Việc thay đổi hoặc sửa đổi sẽ được thông báo cho Khách hàng bằng văn bản qua thư thông thường hoặc thông báo điện tử và có hiệu lực sau bốn mươi tám (48) giờ kể từ ngày gửi/thông báo. Mọi thay đổi hoặc sửa đổi của Ecom Express sẽ không ảnh hưởng đến các hóa đơn hiện hữu mà Khách hàng đã nhận trước khi có thông báo đó hoặc các giao dịch đã được Ecom Express chấp nhận trước khi nhận được thông báo.",
            en: "Ecom Express reserves the right at its sole discretion to alter or amend any terms herein, and such alteration or amendment shall be notified to the Customer in writing sent by regular mail or electronic notice, taking effect forty-eight (48) hours from the date of dispatch/notification. Any alteration or amendment by Ecom Express shall not affect existing invoices received by the Customer prior to such notice or transactions accepted by Ecom Express prior to receipt of such notice.",
          },
        ],
      },
      {
        id: "compensation-claims-policy",
        title: {
          vi: "VII. Chính sách Bồi thường & Khiếu nại",
          en: "VII. COMPENSATION & CLAIMS POLICY",
        },
        listType: 'bullet',
        list: [
          {
            vi: "Đơn hàng không được update trạng thái sau 20 ngày làm việc (không tính Thứ 7 và Chủ nhật) kể từ ngày update trạng thái cuối cùng (Không bao gồm thời gian kiểm hóa hải quan), Kho Ecom đã nhận hàng, chưa giao cho đơn vị vận chuyển và hàng bị thất lạc: Dịch vụ Epacket — bồi hoàn base cost (Giá khai báo) và cước vận chuyển tối đa $50/đơn; dịch vụ Express — tối đa $100/đơn.",
            en: "Orders with no status update for more than 20 business days (excluding Saturdays and Sundays) from the last status update date, where Ecom Express warehouse has received the goods but not yet handed them over to the carrier, and the shipment is lost: For Epacket service, Ecom Express will reimburse the base cost (declared value) plus freight charges, up to a maximum of $50 per order. For Express service, up to a maximum of $100 per order.",
          },
          {
            vi: "Hàng đã đóng gói theo đúng quy chuẩn vận chuyển hàng quốc tế, bị vỡ/hỏng trong quá trình vận chuyển bởi Ecom/Đối tác của Ecom Express (Có thông báo của đơn vị vận chuyển) do lỗi của Ecom hoặc đối tác của Ecom và có video quay lại quá trình mở hàng: Epacket — tối đa $50/đơn; Express — tối đa $100/đơn.",
            en: "Goods packaged in strict compliance with international shipping standards that are broken/damaged during transit by Ecom Express or its partner carriers (supported by official carrier notification) due to fault of Ecom Express or its partners, provided there is unboxing video evidence: Epacket — up to $50/order; Express — up to $100/order.",
          },
          {
            vi: "Hàng vỡ/hỏng do quy cách đóng gói hàng chưa đảm bảo tính chống va đập, hoặc bị vỡ/hỏng bởi bên thứ 3 không phải đối tác của Ecom Express; đối với hàng hóa dễ vỡ (đèn, màn hình, thủy tinh, gốm sứ, đá cẩm thạch, nội thất,...): Ecom Express không chịu trách nhiệm trong các trường hợp này.",
            en: "Goods broken/damaged due to inadequate packaging, or damaged during transit by a third party other than Ecom Express's designated partners; fragile items as specified in USPS shipping policy: Ecom Express assumes no liability in these cases."
          },
          {
            vi: "Đơn hàng được hiển thị đã giao thành công (Delivered) mà người nhận báo không nhận được hàng, hoặc ngược lại: Ecom Express không bồi hoàn trong các trường hợp này.",
            en: "Orders displayed as successfully delivered ('Delivered') where the recipient reports non-receipt, or orders not displayed as delivered where the recipient confirms receipt: Ecom Express provides no compensation."
          },
          {
            vi: "Nếu bị hải quan giữ lại hoặc gặp chiến tranh, thiên tai, dịch bệnh hoặc các trường hợp bất khả kháng: Ecom Express không bồi hoàn trong trường hợp này.",
            en: "In cases of seizure by Customs authorities, war, natural disasters, epidemics, or Force Majeure events: Ecom Express provides no compensation."
          },
          {
            vi: "Ecom Express không nhận vận chuyển mặt hàng thực phẩm, hạt giống, bột, chất lỏng, dược phẩm, hàng có pin và các hàng cấm theo quy định, hàng Fake, hàng Trade Mark, hàng cấm vận chuyển bởi các hãng hàng không. Khi bị hải quan thu giữ sẽ bị hủy theo quy định xuất nhập cảnh và Ecom Express không chịu trách nhiệm.",
            en: "Ecom Express does not accept shipments containing food items, seeds, powders, liquids, pharmaceuticals, battery-containing items, legally prohibited goods, counterfeit/fake items, trademark-infringing goods, or goods banned from air transport. If seized by Customs, they will be destroyed and Ecom Express disclaims all liability."
          }
        ],
      },
      {
        id: "deposit-bank-guarantee-and-security-measures",
        title: {
          vi: "VIII. Tiền đặt cọc, Bảo lãnh ngân hàng và Biện pháp bảo đảm",
          en: "VIII. Deposit, Bank Guarantee, and Security Measures",
        },
        startNumber: 22,
        list: [
          {
            vi: "EcomExpress có quyền, vào bất kỳ thời điểm nào và theo toàn quyền quyết định của mình (bao gồm trên cơ sở đánh giá tín dụng), yêu cầu Khách hàng cung cấp tiền đặt cọc bằng tiền mặt, bảo lãnh ngân hàng hoặc hình thức bảo đảm khác có lợi cho EcomExpress (\"Biện pháp bảo đảm\"). Trường hợp Khách hàng từ chối, EcomExpress có quyền đóng tài khoản sau khi thông báo trước 15 ngày. Biện pháp bảo đảm không phát sinh lãi.",
            en: "Ecom Express reserves the right, at any time and in its sole discretion, to require the Customer to provide a cash deposit, bank guarantee, or other security in favor of Ecom Express. Should the Customer refuse, Ecom Express reserves the right to close the Customer's account upon 15 days' advance notice. Security Measures shall not accrue interest."
          },
          {
            vi: "Trong trường hợp Khách hàng vi phạm bất kỳ nghĩa vụ nào, EcomExpress có quyền cấn trừ hoặc yêu cầu thanh toán từ bất kỳ khoản tiền nào mà Khách hàng đang nợ EcomExpress. EcomExpress sẽ thông báo cho Khách hàng về việc thực hiện quyền này.",
            en: "In the event the Customer breaches any obligation under these Credit Terms and Conditions, Ecom Express shall have the right to set off against or demand payment from any funds owed by the Customer to Ecom Express."
          },
          {
            vi: "Ngoài các quyền nêu trên, Ecom Express có quyền tiến hành các thủ tục pháp lý đối với Khách hàng trong trường hợp không thanh toán các hóa đơn đến hạn. Khách hàng phải chịu toàn bộ chi phí, khoản phí và án phí phát sinh trước và trong quá trình tố tụng.",
            en: "In addition to the rights above, Ecom Express reserves the right to initiate legal proceedings against the Customer in the event of non-payment of due invoices. In such cases, the Customer shall be liable for all costs, expenses, and legal/court fees incurred prior to and during litigation."
          }
        ],
      },
      {
        id: "e-commerce-integration",
        title: {
          vi: "IX. Tích hợp E-Commerce",
          en: "IX. E-Commerce Integration",
        },
        list: [
          {
            vi: "Khách hàng thừa nhận rằng các giá cước được căn cứ trên xác nhận của Khách hàng về chính sách vận chuyển của EcomExpress khi sử dụng giải pháp điện tử để gửi hàng. Khách hàng sẽ sử dụng dịch vụ của EcomExpress thông qua một hay nhiều công cụ Thương mại điện tử: Lên đơn trực tiếp, Import file CSV và Connect API. Khách hàng sẽ không yêu cầu xử lý thủ công khi chưa có sự đồng ý bằng văn bản của EcomExpress.",
            en: "The Customer acknowledges that the applicable rates are based on the Customer's confirmation of Ecom Express's shipping policy when utilizing electronic solutions to tender shipments to Ecom Express. The Customer shall utilize Ecom Express services through one or more E-Commerce tools: Direct Order Creation, CSV Import, and API Integration. The Customer shall not request manual processing, recording, labeling, or invoicing without the prior written consent of Ecom Express."
          },
        ],
      },
      {
        id: "governing-law-and-jurisdiction",
        title: {
          vi: "X. Luật áp dụng và Thẩm quyền tài phán",
          en: "X. Governing Law and Jurisdiction",
        },
        list: [
          {
            vi: "Bất kỳ tranh chấp nào phát sinh từ hoặc có liên quan đến Các Điều khoản và Điều kiện về Tín dụng này sẽ, vì quyền lợi của EcomExpress, lệ thuộc vào sự xét xử không độc quyền của toà án Việt Nam và chịu sự chi phối của pháp luật Việt Nam. Tại đây Khách hàng phục tùng sự xét xử đó theo cách thức không huỷ ngang, trừ khi điều đó trái với pháp luật hiện hành.",
            en: "Any dispute arising out of or in connection with these Credit Terms and Conditions shall, for the benefit of Ecom Express, be subject to the non-exclusive jurisdiction of the courts of Vietnam and governed by Vietnamese law. The Customer hereby irrevocably submits to such jurisdiction, unless contrary to applicable law."
          },
        ],
      },
    ],
  },
  transportation: {
    sectionCode: {
      vi: "PHẦN 02",
      en: "SECTION 02",
    },
    title: {
      vi: "Điều khoản và Điều kiện Vận chuyển của Ecom Express",
      en: "Ecom Express Transportation Terms and Conditions",
    },
    description: {
      vi: "Khi sử dụng dịch vụ EcomExpress, Quý vị với tư cách là \"Người gửi\", là đại diện cho Quý vị và đại diện cho người nhận hàng (\"Người nhận\") và bất kỳ ai có lợi trong Lô hàng, đồng ý rằng các điều khoản và điều kiện sau đây sẽ được áp dụng. Mỗi lô hàng được vận chuyển trên cơ sở giới hạn trách nhiệm được quy định dưới đây.",
      en: "When using Ecom Express services, you, as \"Shipper\", are agreeing on your behalf and on behalf of the consignee/recipient (\"Consignee\") and anyone else with an interest in the Shipment that these Terms and Conditions shall apply. Every Shipment is transported on a limited liability basis as provided herein.",
    },
    clauses: [
      {
        id: "customs-clearance",
        title: {
          vi: "I. Thông quan Hải quan (Customs Clearance)",
          en: "I. Customs Clearance",
        },
        content: {
          vi: "EcomExpress sẽ là đại diện cho Người gửi hoặc Người nhận để: (1) hoàn tất các giấy tờ, thay đổi các mã sản phẩm hoặc mã dịch vụ, và nộp các loại phí, thuế hoặc khoản phạt theo quy định pháp luật; (2) thực hiện vai trò là đại lý giao nhận của Người gửi cho mục đích thông quan và kiểm soát xuất khẩu; và (3) chuyển lô hàng đến bên môi giới hải quan của Người nhận hoặc địa chỉ khác theo yêu cầu hợp lý.",
          en: "Ecom Express may perform any of the following activities on Shipper's or Consignee's behalf: (1) complete any documents, amend product or service codes, and pay any duties, taxes, or penalties required under applicable laws and regulations; (2) act as Shipper's forwarding agent for customs clearance and export control purposes; and (3) redirect the Shipment to Consignee's customs broker or other address upon request by any authorized person.",
        },
      },
      {
        id: "unacceptable-shipments",
        title: {
          vi: "II. Đơn hàng không được chấp nhận",
          en: "II. Unacceptable Shipments",
        },
        content: {
          vi: "Một lô hàng được xem là không được chấp nhận nếu:",
          en: "A Shipment is deemed unacceptable if:",
        },
        listType: "bullet",
        list: [
          {
            vi: "Việc khai báo hải quan không được thực hiện mặc dù được yêu cầu theo những quy định hải quan được áp dụng.",
            en: "No customs declaration is made even though required by applicable customs regulations;",
          },
          {
            vi: "Bao gồm hàng giả, động vật, vàng/bạc thỏi, tiền tệ, đá quý; vũ khí, chất nổ và đạn dược; thi hài; những vật dụng bất hợp pháp như ngà voi và ma túy.",
            en: "It contains counterfeit goods, animals, bullion, currency, gemstones; weapons, explosives, and ammunition; human remains; illegal items such as ivory and narcotics;",
          },
          {
            vi: "Được phân loại là vật liệu nguy hại, hàng hóa nguy hiểm, bị cấm hoặc bị hạn chế bởi IATA, ICAO, ADR hay các tổ chức liên quan khác.",
            en: "It is classified as hazardous material, dangerous goods, prohibited or restricted articles by IATA, ICAO, ADR, or other relevant organizations;",
          },
          {
            vi: "Địa chỉ được ghi không chính xác hoặc không được đánh dấu đúng cách, hoặc bao bì bị lỗi hoặc không đủ để đảm bảo vận chuyển an toàn.",
            en: "Its address is incorrect or improperly marked, or its packaging is defective or inadequate to ensure safe transportation with ordinary care in handling;",
          },
          {
            vi: "Có chứa bất kỳ vật phẩm nào khác mà EcomExpress quyết định rằng không thể vận chuyển một cách an toàn hoặc hợp pháp.",
            en: "It contains any other item which Ecom Express decides cannot be transported safely or legally.",
          },
        ],
      },
      {
        id: "delivery-and-undeliverable-shipments",
        title: {
          vi: "III. Giao hàng và đơn hàng không thể giao",
          en: "III. Delivery and Undeliverable Shipments",
        },
        content: {
          vi: "Các lô hàng không thể được chuyển phát đến hộp thư hoặc mã bưu chính. Các lô hàng được chuyển phát đến địa chỉ của Người nhận do Người gửi cung cấp nhưng không nhất thiết phải được giao cho đích thân Người nhận. Nếu lô hàng không được chấp nhận, bị giảm giá trị vì mục đích hải quan, hoặc Người nhận không xác định được hay từ chối nhận hàng, EcomExpress sẽ nỗ lực hợp lý để hoàn trả lại lô hàng cho Người gửi bằng chi phí do Người gửi thanh toán. Nếu không thực hiện được, lô hàng có thể bị thanh lý hoặc bán.",
          en: "Shipments cannot be delivered to PO boxes or postal codes. Shipments are delivered to the Consignee's address given by Shipper but not necessarily to the named Consignee personally. If a Shipment is deemed unacceptable, undervalued for Customs, or the Consignee cannot be located or refuses delivery, Ecom Express shall use reasonable efforts to return the Shipment to Shipper at Shipper's cost, failing which the Shipment may be released, disposed of, or sold without incurring any liability whatsoever.",
        },
      },
      {
        id: "inspection",
        title: {
          vi: "IV. Kiểm tra (Inspection)",
          en: "IV. Inspection",
        },
        content: {
          vi: "Ecom Express có quyền mở và kiểm tra đơn hàng mà không cần thông báo trước vì lý do an toàn, an ninh, hải quan hoặc các yêu cầu quản lý khác.",
          en: "Ecom Express has the right to open and inspect a Shipment without notice for safety, security, customs, or other regulatory reasons.",
        },
      },
      {
        id: "shipment-charges",
        title: {
          vi: "V. Cước vận chuyển (Shipment Charges)",
          en: "V. Shipment Charges",
        },
        content: {
          vi: "Chi phí vận chuyển của EcomExpress được tính theo số lớn hơn của trọng lượng thực tế hoặc trọng lượng thể tích từng phần và bất cứ phần nào cũng có thể được cân và đo lại bởi EcomExpress để xác nhận lại. Người nhận, hoặc Người gửi khi EcomExpress thay mặt người nhận, phải thanh toán hoặc hoàn trả cho EcomExpress toàn bộ chi phí vận chuyển, các lệ phí đến hạn khác, hoặc nghĩa vụ hải quan còn nợ cho các dịch vụ mà EcomExpress cung cấp.",
          en: "Ecom Express's shipment charges are calculated according to the higher of actual or volumetric weight per piece and any piece may be re-weighed and re-measured by Ecom Express to confirm this calculation. Consignee, or Shipper when Ecom Express acts on Consignee's behalf, shall pay or reimburse Ecom Express for all shipment charges, other charges due, or Customs Duties owed for services provided by Ecom Express.",
        },
      },
      {
        id: "ecom-express-liability",
        title: {
          vi: "VI. Trách nhiệm của Ecom Express",
          en: "VI. Ecom Express's Liability",
        },
        listType: 'none',
        list: [
          {
            vi: "Trách nhiệm của EcomExpress về lô hàng vận chuyển bằng đường hàng không được giới hạn theo Công ước Montreal hoặc Warsaw, hoặc trong trường hợp không có công ước áp dụng, là giá trị thấp hơn của (i) giá thị trường hiện tại hoặc giá trị khai báo, hoặc (ii) 22 Quyền rút vốn đặc biệt/kg (xấp xỉ 30 USD/kg).",
            en: "Ecom Express's liability for a Shipment transported by air is limited by the Montreal Convention or the Warsaw Convention, or in the absence of such Convention, to the lower of (i) the current market value or declared value, or (ii) 22 Special Drawing Rights per kilogram (approximately USD 30.00/kg)."
          },
          {
            vi: "Đối với vận chuyển đường bộ qua biên giới, trách nhiệm bị giới hạn theo CMR với giá trị thấp hơn của (i) giá thị trường hoặc giá trị khai báo, hoặc (ii) 8,33 SDR/kg (xấp xỉ 11 USD/kg).",
            en: "For cross-border road transport, liability is limited by CMR to the lower of (i) market value or declared value, or (ii) 8.33 SDR per kilogram (approximately USD 11.00/kg)."
          },
          {
            vi: "Nghĩa vụ của EcomExpress chỉ giới hạn ở những mất mát và hư hại trực tiếp đối với lô hàng. Mọi hình thức mất mát hay hư hại khác đều bị loại trừ (bao gồm tổn thất về lợi nhuận, thu nhập, lãi suất, việc kinh doanh trong tương lai), cho dù là đặc biệt hay gián tiếp. EcomExpress sẽ nỗ lực hợp lý để vận chuyển lô hàng theo lịch trình thông thường, nhưng những lịch trình này không bắt buộc và không cấu thành nên một phần hợp đồng.",
            en: "Ecom Express's liability is strictly limited to direct loss and damage to a Shipment only. All other types of loss or damage are excluded (including but not limited to lost profits, income, interest, future business), whether such loss or damage is special or indirect. Ecom Express will make every reasonable effort to deliver the Shipment according to regular delivery schedules, but these schedules are not binding and do not form part of the contract."
          }
        ]
      },
      {
        id: "claims",
        title: {
          vi: "VII. Khiếu nại (Claims)",
          en: "VII. Claims",
        },
        content: {
          vi: "Tất cả khiếu nại phải được gửi bằng văn bản đến EcomExpress trong thời hạn bảy (7) ngày kể từ ngày lô hàng được cập nhật trạng thái giao hàng thành công trên hệ thống. EcomExpress sẽ không chịu bất cứ trách nhiệm nào ngoài thời hạn này. Các khiếu nại bị giới hạn ở một khiếu nại cho mỗi lô hàng.",
          en: "All claims must be submitted in writing to Ecom Express within seven (7) days from the date the shipment status is updated as successfully delivered on the system; Ecom Express shall bear no liability beyond this time limit. Claims are limited to one claim per Shipment, settlement of which shall be full and final settlement for all loss or damage in connection therewith."
        }
      },
      {
        id: "shipment-value-protection",
        title: {
          vi: "VIII. Bảo vệ Giá trị đơn hàng (Shipment Value Protection)",
          en: "VIII. Shipment Value Protection",
        },
        content: {
          vi: "EcomExpress có thể sắp xếp việc bảo vệ lô hàng đối với mất mát hoặc hư hỏng, với điều kiện là Người gửi yêu cầu EcomExpress làm như vậy bằng văn bản và thanh toán khoản phí áp dụng. Bảo vệ Giá trị Lô hàng không bao gồm mất mát hoặc hư hại gián tiếp, hoặc mất mát hoặc hư hại gây ra do sự chậm trễ.",
          en: "Ecom Express may arrange Shipment Value Protection covering loss of or damage to the Shipment, provided Shipper requests this in writing and pays the applicable premium. Shipment Value Protection does not cover indirect loss or damage, or loss or damage caused by delay."
        }
      },
      {
        id: "circumstances-beyond-ecom-express-control",
        title: {
          vi: "IX. Các trường hợp ngoài khả năng kiểm soát của Ecom Express",
          en: "IX. Circumstances Beyond Ecom Express's Control",
        },
        content: {
          vi: "EcomExpress không có trách nhiệm đối với bất kỳ mất mát hoặc hư hại phát sinh ngoài tầm kiểm soát của EcomExpress, bao gồm: hư hỏng điện tử hoặc từ trường; bất cứ khiếm khuyết liên quan đến bản chất của lô hàng; hành động hoặc sự bỏ sót của người không được tuyển dụng bởi EcomExpress; hoặc các trường hợp bất khả kháng như động đất, lốc xoáy, bão, lũ lụt, sương mù, chiến tranh, rơi máy bay, cấm vận, bạo loạn hay bạo động dân sự.",
          en: "Ecom Express is not liable for any loss or damage arising out of circumstances beyond Ecom Express's control, including electrical or magnetic damage to electronic or photographic images, data, or recordings; any defect or characteristic related to the nature of the Shipment; any act or omission by a person not employed or contracted by Ecom Express; or Force Majeure events — earthquake, cyclone, storm, flood, fog, war, plane crash, embargo, riot, civil commotion, or industrial action."
        }
      },
      {
        id: "shipper-warranties-and-indemnities",
        title: {
          vi: "X. Cam kết và Bồi hoàn của người gửi",
          en: "X. Shipper's Warranties and Indemnities",
        },
        content: {
          vi: "Người gửi sẽ phải bồi thường và giữ cho EcomExpress không bị thiệt hại bởi bất cứ mất mát hay hư hỏng nào phát sinh do không tuân thủ những cam kết dưới đây:",
          en: "Shippers shall indemnify and hold Ecom Express harmless for any loss or damage arising out of Shipper's failure to comply with the following warranties:"
        },
        listType: "bullet",
        list: [
          {
            vi: "Mọi thông tin được cung cấp bởi Người gửi hoặc các đại diện là đầy đủ và chính xác;",
            en: "All information provided by Shipper or its representatives is complete and accurate;"
          },
          {
            vi: "Lô hàng được chấp thuận vận chuyển theo Mục 2 trên đây;",
            en: "The Shipment was acceptable for transport under Section 2 above;"
          },
          {
            vi: "Lô hàng được chuẩn bị trên cơ sở an toàn bởi những người đáng tin cậy và được bảo vệ khỏi sự can thiệp trái phép trong suốt quá trình chuẩn bị, lưu kho và vận chuyển đến EcomExpress;",
            en: "The Shipment was prepared in secure premises by reliable persons and was protected against unauthorized interference during preparation, storage, and transport to Ecom Express;"
          },
          {
            vi: "Người gửi đã tuân thủ mọi luật lệ được áp dụng về hải quan, nhập khẩu, xuất khẩu, bảo vệ dữ liệu, các sắc lệnh, cấm vận và những luật lệ và quy định khác;",
            en: "Shipper has complied with all applicable customs, import, export, data protection laws, sanctions, embargoes, and other laws and regulations;"
          },
          {
            vi: "Người gửi đã nhận được mọi chấp nhận cần thiết liên quan đến thông tin cá nhân được cung cấp cho EcomExpress bao gồm thông tin của Người nhận cần thiết cho việc vận chuyển, thông quan và chuyển phát.",
            en: "Shipper has obtained all necessary consents in relation to personal data provided to Ecom Express including Consignee's data as may be required for transport, customs clearance, and delivery."
          }
        ]
      },
      {
        id: "routing",
        title: {
          vi: "XI. Lộ trình (Routing)",
          en: "XI. Routing",
        },
        content: {
          vi: "Người gửi đồng ý với tất cả các lộ trình và chuyển hướng, bao gồm cả khả năng Lô hàng có thể được chuyên chở qua các điểm trung chuyển.",
          en: "Shipper agrees to all routing and diversion, including the possibility that the Shipment may be carried through intermediate stopping places."
        }
      },
      {
        id: "governing-law",
        title: {
          vi: "XII. Luật áp dụng",
          en: "XII. Governing Law",
        },
        content: {
          vi: "Bất cứ tranh chấp nào phát sinh từ hoặc theo bất cứ phương thức nào liên quan đến các điều khoản và điều kiện này sẽ phụ thuộc vào, theo hướng có lợi cho EcomExpress, quyền tài phán không độc quyền của các tòa án tại, và chịu sự điều chỉnh của luật pháp của quốc gia xuất xứ của Lô hàng.",
          en: "Any dispute arising out of or in any way connected with these terms and conditions shall be subject, for the benefit of Ecom Express, to the non-exclusive jurisdiction of the courts of, and governed by the law of the country of origin of the Shipment and Shipper irrevocably submits to such jurisdiction, unless contrary to applicable law."
        }
      },
      {
        id: "severability",
        title: {
          vi: "XIII. Tính độc lập của các điều khoản",
          en: "XIII. Severability",
        },
        content: {
          vi: "Sự vô hiệu hoặc không thể thi hành của bất cứ điều khoản nào sẽ không ảnh hưởng đến bất cứ phần nào khác của Các điều khoản và điều kiện này.",
          en: "The invalidity or unenforceability of any provision shall not affect any other part of these Terms and Conditions."
        }
      },
    ],
  },
  appendix: {
    sectionCode: {
      vi: "PHẦN 03",
      en: "SECTION 03",
    },
    title: {
      vi: "Phụ lục Điều khoản và Điều kiện Vận chuyển Express",
      en: "Appendix to Express Transportation Terms and Conditions",
    },
    description: {
      vi: "Phụ lục này quy định các điều khoản và điều kiện cụ thể cho việc cung cấp dịch vụ chuyển phát nhanh/bưu chính của <b>CÔNG TY CỔ PHẦN ECOMEXPRESS</b>, địa chỉ số 3 ngõ 92 phố Đào Tấn, phường Giảng Võ, thành phố Hà Nội, Việt Nam, mã số thuế: 0105790517 (\"EcomExpress\") cho các khách hàng của EcomExpress tại Việt Nam.",
      en: "This Appendix sets forth specific terms and conditions for the provision of express courier / postal services by <b>ECOMEXPRESS JOINT STOCK COMPANY</b>, located at No. 3, Alley 92 Dao Tan Street, Giang Vo Ward, Hanoi City, Vietnam, Tax Code: 0105790517 (\"Ecom Express\") to Ecom Express customers in Vietnam.",
    },
    clauses: [
      {
        id: "amended-liability-limits",
        title: {
          vi: "1. Mức giới hạn trách nhiệm bồi thường (sửa đổi)",
          en: "1. Amended Liability Limits",
        },
        variant: "boxed",
        listType: "none",
        list: [
          {
            vi: "(i) Mức giới hạn trách nhiệm bồi thường đối với dịch vụ bưu chính quốc tế vận chuyển bằng đường hàng không: 09 SDR/kg (tính theo từng nấc khối lượng 500 gram, phần lẻ tính bằng 500 gram) nhưng không thấp hơn 30 SDR/bưu gửi, cộng với hoàn trả lại cước của dịch vụ đã sử dụng đối với bưu gửi bị mất, hư hỏng hoặc tráo đổi toàn bộ.",
            en: "(i) Liability compensation limit for international postal services transported by air: 09 SDR/kg (per 500-gram weight tier, fractional weight rounded up to 500 grams) but not lower than 30 SDR per postal item, plus refund of charges for the service used for items lost, damaged, or completely substituted.",
          },
          {
            vi: "(ii) Mức giới hạn trách nhiệm bồi thường đối với dịch vụ bưu chính quốc tế vận chuyển bằng phương thức khác: 05 SDR/kg (tính theo từng nấc khối lượng 500 gram, phần lẻ tính bằng 500 gram), cộng với hoàn trả lại cước của dịch vụ đã sử dụng đối với bưu gửi bị mất, hư hỏng hoặc tráo đổi toàn bộ.",
            en: "(ii) Liability compensation limit for international postal services transported by other modes: 05 SDR/kg (per 500-gram weight tier, fractional weight rounded up to 500 grams), plus refund of charges for the service used for items lost, damaged, or completely substituted."
          },
          {
            vi: "(iii) Nếu Người gửi cho rằng các mức giới hạn này chưa đủ, Người gửi cần thực hiện kê khai đặc biệt về giá trị và có yêu cầu về bảo vệ giá trị lô hàng được mô tả tại Mục 8 hoặc tự thu xếp bảo hiểm của riêng mình.",
            en: "(iii) If Shipper considers these limits insufficient, Shipper must make a special declaration of value and request Shipment Value Protection as described in Section 8 or arrange its own insurance coverage."
          }
        ],
      },
      {
        id: "precedence-and-applicability",
        title: {
          vi: "2. Thứ tự ưu tiên và Phạm vi áp dụng",
          en: "2. Precedence and Applicability",
        },
        listType: "none",
        list: [
          {
            vi: "2.1 Trong trường hợp có mâu thuẫn giữa Các Điều khoản và Điều kiện chuyên chở EcomExpress và Phụ lục này cho quan hệ với các khách hàng tại Việt Nam, Phụ lục này được áp dụng;",
            en: "2.1 In the event of any conflict between the Ecom Express Transportation Terms and Conditions and this Appendix for relationships with express/postal service customers in Vietnam, this Appendix shall prevail;"
          },
          {
            vi: "2.2 Trong trường hợp có mâu thuẫn giữa Các Điều khoản và Điều kiện chuyên chở EcomExpress và các yêu cầu bắt buộc của văn bản pháp luật Việt Nam, văn bản pháp luật Việt Nam được áp dụng;",
            en: "2.2 In the event of any conflict between the Ecom Express Transportation Terms and Conditions and mandatory provisions of Vietnamese law, Vietnamese law shall prevail;"
          },
          {
            vi: "2.3 Các Điều khoản và Điều kiện chuyên chở EcomExpress và Phụ lục này ràng buộc cả EcomExpress và khách hàng và tạo thành một phần không thể tách rời của thỏa thuận cụ thể giữa EcomExpress và khách hàng, nếu thỏa thuận đó được ký kết;",
            en: "2.3 The Ecom Express Transportation Terms and Conditions and this Appendix are binding upon both Ecom Express and the customer and constitute an integral part of any specific agreement between Ecom Express and the customer, if executed;"
          },
          {
            vi: "2.4 Bằng việc giao lô hàng của mình cho EcomExpress, người gửi hàng công bố thay mặt cho chính mình và thay mặt cho bất kỳ người nào liên quan đến lô hàng rằng người gửi hàng quen thuộc với và sẽ tuân thủ chặt chẽ Các Điều khoản và Điều kiện chuyên chở EcomExpress và Phụ lục này.",
            en: "2.4 By tendering a shipment to Ecom Express, the shipper declares on its own behalf and on behalf of any person with an interest in the shipment that the shipper is familiar with and shall strictly comply with the Ecom Express Transportation Terms and Conditions and this Appendix."
          }
        ],
      },
    ],
  },
  trade: {
    sectionCode: {
      vi: "PHẦN 04",
      en: "SECTION 04",
    },
    title: {
      vi: "Tuân thủ Quy định Thương mại",
      en: "Trade Compliance",
    },
    clauses: [
      {
        id: "general-warranties",
        title: {
          vi: "1. Cam kết chung của các Bên",
          en: "1. General Warranties",
        },
        content: {
          vi: "Mỗi Bên cam kết và bảo đảm rằng:",
          en: "Each Party undertakes and warrants that:",
        },
        listType: "none",
        list: [
          {
            vi: "a) Bên đó sẽ tuân thủ tất cả các Luật Thương mại hiện hành khi thực hiện Hợp đồng này. \"Luật Thương mại\" được hiểu là toàn bộ các luật, quy định và chính sách liên quan đến trừng phạt kinh tế, luật chống tẩy chay, danh sách các bên bị hạn chế, và kiểm soát thương mại đối với việc nhập khẩu, xuất khẩu, tái xuất khẩu, chuyển nhượng, quá cảnh dịch vụ, hàng hóa, công nghệ hoặc phần mềm.",
            en: "a) It shall comply with all applicable Trade Laws in performing this Agreement. \"Trade Laws\" means all laws, regulations, and policies relating to economic sanctions, anti-boycott laws, restricted party lists, and trade controls governing the import, export, re-export, transfer, or transit of services, goods, technology, or software."
          },
          {
            vi: "b) Bên đó không phải là Restricted Party và sẽ không trực tiếp hoặc gián tiếp đưa bất kỳ Restricted Party nào tham gia vào bất kỳ giao dịch hoặc Shipment nào theo Thỏa thuận này. \"Restricted Party\" là bất kỳ cá nhân hoặc tổ chức nào có tên trong Danh sách Trừng phạt Tài chính Hợp nhất của Liên minh Châu Âu, Danh sách SDN của OFAC, hoặc các danh sách hạn chế khác do cơ quan nhà nước có thẩm quyền ban hành.",
            en: "b) It is not a Restricted Party and will not directly or indirectly involve any Restricted Party in any transaction or shipment under this Agreement. A \"Restricted Party\" is any individual or entity named on the EU Consolidated Financial Sanctions List or the SDN List administered by OFAC, or named on other restricted or denied party lists issued by competent government authorities."
          },
          {
            vi: "c) Bên đó sẽ kịp thời thông báo bằng văn bản cho Bên còn lại ngay khi biết được bất kỳ vi phạm nào mà theo đó một giao dịch hoặc lô hàng theo Hợp Đồng này vi phạm Luật Thương mại.",
            en: "c) It shall promptly notify the other Party in writing upon becoming aware of any violation whereby a transaction or shipment under this Agreement violates Trade Laws."
          }
        ],
      },
      {
        id: "customer-obligations",
        title: {
          vi: "2. Nghĩa vụ của Khách hàng",
          en: "2. Customer Obligations",
        },
        listType: "none",
        list: [
          {
            vi: "a) Khách hàng sẽ không được gửi hoặc khiến bất kỳ bên nào gửi cho EcomExpress bất kỳ Hàng hóa Quân sự bị kiểm soát nào để vận chuyển.",
            en: "a) Customer shall not send or cause any party to send to Ecom Express any Controlled Military Goods for transport."
          },
          {
            vi: "b) Đối với các mặt hàng thuộc phạm vi điều chỉnh của Quy định Quản lý Xuất khẩu Hoa Kỳ (EAR), Khách hàng sẽ không giao các mặt hàng đó cho EcomExpress để vận chuyển đến các Đối tượng bị liệt kê bởi BIS, Bên bị hạn chế, hoặc các Khu vực bị hạn chế.",
            en: "b) For items subject to the U.S. Export Administration Regulations (EAR), Customer shall not tender such items to Ecom Express for transport to entities listed by BIS, Restricted Parties, or Restricted Regions."
          },
          {
            vi: "c) Khách hàng sẽ không yêu cầu hoặc khiến EcomExpress tham gia vào bất kỳ phần nào của lô hàng hoặc chuỗi cung ứng mà cấu thành giao dịch tổng thể có điểm xuất phát từ hoặc điểm đến là các Khu vực bị hạn chế.",
            en: "c) Customer shall not require or cause Ecom Express to participate in any part of a shipment or supply chain constituting an overall transaction originating from or having a destination in Restricted Regions."
          },
          {
            vi: "d) Khách hàng đã và sẽ có đầy đủ tất cả các giấy phép cần thiết, đồng thời cung cấp cho EcomExpress mọi thông tin cần thiết để xử lý các lô hàng phù hợp với Luật Thương mại hiện hành.",
            en: "d) Customer has obtained and will maintain all necessary licenses and provide Ecom Express with all requisite information for Ecom Express to process Customer's shipments in compliance with applicable Trade Laws."
          }
        ],
      },
      {
        id: "ecom-express-rights",
        title: {
          vi: "3. Quyền của Ecom Express",
          en: "3. Ecom Express's Rights",
        },
        content: {
          vi: "EcomExpress có quyền từ chối cung cấp dịch vụ nhằm tuân thủ các nghĩa vụ theo các điều khoản tuân thủ thương mại này và Luật Thương mại hiện hành. EcomExpress cũng có thể áp dụng các biện pháp thẩm tra tăng cường đối với các lô hàng liên quan đến Bên bị hạn chế hoặc Khu vực bị hạn chế, bao gồm việc yêu cầu Khách hàng ký Thư cam kết bồi thường hoặc tài liệu tương đương.",
          en: "Ecom Express reserves the right to refuse service to comply with obligations under these trade compliance terms and applicable Trade Laws. Ecom Express may also apply enhanced screening measures to shipments involving Restricted Parties or Restricted Regions, including requiring Customer to execute an Indemnity Letter or equivalent document."
        }
      },
      {
        id: "agency-disclaimer",
        title: {
          vi: "4. Tuyên bố miễn trừ đại lý",
          en: "4. Agency Disclaimer",
        },
        content: {
          vi: "EcomExpress không hành động cho hoặc thay mặt Khách hàng, các công ty liên kết của Khách hàng hoặc bất kỳ bên thứ ba nào với tư cách là: (i) Bên xuất khẩu cho mục đích kiểm soát xuất khẩu; hoặc (ii) Bên nộp đơn hoặc bên sở hữu bất kỳ chấp thuận, giấy phép hoặc cấp phép nào được yêu cầu theo Luật Thương mại hiện hành.",
          en: "Ecom Express does not act for or on behalf of Customer, Customer's affiliates, or any third party as: (i) an Exporter for export control purposes; or (ii) an applicant or holder of any license, permit, or authorization required under applicable Trade Laws."
        }
      },
      {
        id: "enforcement-and-indemnification",
        title: {
          vi: "5–7. Thực thi và Bồi hoàn",
          en: "5–7. Enforcement and Indemnification",
        },
        listType: "none",
        list: [
          {
            vi: "Bất kỳ lô hàng nào vi phạm các điều khoản của Hợp Đồng này đều được xem là không thể giao được. Mỗi Bên có quyền đình chỉ hoặc chấm dứt Thỏa thuận ngay lập tức mà không phải chịu trách nhiệm trong trường hợp bên kia vi phạm hoặc khi bất kỳ Luật Thương mại nào ngăn cản việc thực hiện nghĩa vụ theo Hợp Đồng này.",
            en: "Any shipment violating the provisions of this Agreement shall be deemed undeliverable. Each Party reserves the right to suspend or terminate the Agreement immediately, without liability, in cases of breach or failure to comply with Trade Laws, or when any Trade Law prevents either Party from performing its obligations."
          },
          {
            vi: "Trong phạm vi pháp luật cho phép, mỗi Bên (\"Bên Bồi hoàn\") đồng ý bồi hoàn và giữ cho Bên kia không bị thiệt hại trước mọi tổn thất, khiếu nại và chi phí, bao gồm chi phí luật sư hợp lý và mọi khoản tiền phạt hoặc chế tài của cơ quan nhà nước có thẩm quyền, phát sinh từ việc Bên Bồi hoàn vi phạm các điều khoản tuân thủ thương mại này.",
            en: "To the extent permitted by law, each Party (\"Indemnifying Party\") agrees to indemnify, defend, and hold harmless the other Party against all losses, claims, and expenses, including reasonable attorneys' fees and any fines or penalties imposed by competent government authorities, arising out of the Indemnifying Party's breach of these trade compliance terms."
          }
        ]
      },
    ],
  },
};
