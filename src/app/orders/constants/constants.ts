import { GroupOrderStatus, OrderStatus, ShippingMethod } from "@customer/app/orders/constants/enums";

/**
 * Maps raw DB OrderStatus (21 statuses) to GroupOrderStatus (8 group statuses).
 */
export const GetGroupOrderStatus = (status: OrderStatus | string): GroupOrderStatus | null => {
  if (!status) return null;

  switch (status) {
    // 1. Label Not Created
    case OrderStatus.LABEL_NOT_CREATED:
    case OrderStatus.PENDING_LABEL:
      return GroupOrderStatus.LABEL_NOT_CREATED;

    // 2. Label Created
    case OrderStatus.LABEL_CREATED:
    case OrderStatus.WAITING_FOR_PICKUP:
      return GroupOrderStatus.LABEL_CREATED;

    // 3. We Have Your Package
    case OrderStatus.PICKED_UP:
    case OrderStatus.RECEIVED_AT_ORIGIN_WAREHOUSE:
    case OrderStatus.PACKAGE_RECEIVED:
    case OrderStatus.PICK_UP:
      return GroupOrderStatus.WE_HAVE_YOUR_PACKAGE;

    // 4. On the Way
    case OrderStatus.EXPORT_CUSTOMS_CLEARANCE:
    case OrderStatus.DEPARTED_ORIGIN_COUNTRY:
    case OrderStatus.INTERNATIONAL_TRANSIT:
    case OrderStatus.ARRIVED_AT_DESTINATION_COUNTRY:
    case OrderStatus.IMPORT_CUSTOMS_CLEARANCE:
    case OrderStatus.ON_THE_WAY:
      return GroupOrderStatus.ON_THE_WAY;

    // 5. Out for Delivery
    case OrderStatus.RECEIVED_BY_LAST_MILE_CARRIER:
    case OrderStatus.OUT_FOR_DELIVERY:
    case OrderStatus.DELIVERY:
      return GroupOrderStatus.OUT_FOR_DELIVERY;

    // 6. Delivered
    case OrderStatus.DELIVERED:
      return GroupOrderStatus.DELIVERED;

    // 7. Cancelled
    case OrderStatus.CANCELLED:
      return GroupOrderStatus.CANCELLED;

    // 8. Exception
    case OrderStatus.EXCEPTION:
      return GroupOrderStatus.EXCEPTION;

    // Draft or Unmapped
    case OrderStatus.DRAFT:
    default:
      return null;
  }
};

/**
 * Returns human-readable label for GroupOrderStatus (or maps raw OrderStatus first).
 */
export const GetGroupOrderStatusTxt = (
  status: GroupOrderStatus | OrderStatus | string,
): string => {
  if (!status) return "";
  const group = GetGroupOrderStatus(status) || (status as GroupOrderStatus);

  switch (group) {
    case GroupOrderStatus.LABEL_NOT_CREATED:
      return "Label Not Created";
    case GroupOrderStatus.LABEL_CREATED:
      return "Label Created";
    case GroupOrderStatus.WE_HAVE_YOUR_PACKAGE:
      return "We Have Your Package";
    case GroupOrderStatus.ON_THE_WAY:
      return "On the Way";
    case GroupOrderStatus.OUT_FOR_DELIVERY:
      return "Out for Delivery";
    case GroupOrderStatus.DELIVERED:
      return "Delivered";
    case GroupOrderStatus.CANCELLED:
      return "Cancelled";
    case GroupOrderStatus.EXCEPTION:
      return "Exception";
    default:
      return String(status)
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
  }
};

// Backward-compatibility alias
export const GetOrderStatusTxt = GetGroupOrderStatusTxt;

/**
 * Maps GroupOrderStatus to all raw DB OrderStatuses for query filtering.
 */
export const getRawStatusesForGroup = (groupStatus: GroupOrderStatus | string): OrderStatus[] => {
  switch (groupStatus) {
    case GroupOrderStatus.LABEL_NOT_CREATED:
      return [OrderStatus.LABEL_NOT_CREATED, OrderStatus.PENDING_LABEL];

    case GroupOrderStatus.LABEL_CREATED:
      return [OrderStatus.LABEL_CREATED, OrderStatus.WAITING_FOR_PICKUP];

    case GroupOrderStatus.WE_HAVE_YOUR_PACKAGE:
      return [
        OrderStatus.PICKED_UP,
        OrderStatus.RECEIVED_AT_ORIGIN_WAREHOUSE,
        OrderStatus.PACKAGE_RECEIVED,
        OrderStatus.PICK_UP,
      ];

    case GroupOrderStatus.ON_THE_WAY:
      return [
        OrderStatus.EXPORT_CUSTOMS_CLEARANCE,
        OrderStatus.DEPARTED_ORIGIN_COUNTRY,
        OrderStatus.INTERNATIONAL_TRANSIT,
        OrderStatus.ARRIVED_AT_DESTINATION_COUNTRY,
        OrderStatus.IMPORT_CUSTOMS_CLEARANCE,
        OrderStatus.ON_THE_WAY,
      ];

    case GroupOrderStatus.OUT_FOR_DELIVERY:
      return [
        OrderStatus.RECEIVED_BY_LAST_MILE_CARRIER,
        OrderStatus.OUT_FOR_DELIVERY,
        OrderStatus.DELIVERY,
      ];

    case GroupOrderStatus.DELIVERED:
      return [OrderStatus.DELIVERED];

    case GroupOrderStatus.CANCELLED:
      return [OrderStatus.CANCELLED];

    case GroupOrderStatus.EXCEPTION:
      return [OrderStatus.EXCEPTION];

    default:
      return Object.values(OrderStatus).includes(groupStatus as OrderStatus)
        ? [(groupStatus as OrderStatus)]
        : [];
  }
};

export const GetGroupOrderStatusColor = (
  status: GroupOrderStatus | OrderStatus | string,
): string => {
  const group = GetGroupOrderStatus(status) || (status as GroupOrderStatus);
  switch (group) {
    case GroupOrderStatus.LABEL_NOT_CREATED:
      return "#D32D20";
    case GroupOrderStatus.LABEL_CREATED:
      return "#0042D0";
    case GroupOrderStatus.WE_HAVE_YOUR_PACKAGE:
      return "#474747";
    case GroupOrderStatus.ON_THE_WAY:
      return "#0F798C";
    case GroupOrderStatus.OUT_FOR_DELIVERY:
      return "#C28108";
    case GroupOrderStatus.DELIVERED:
      return "#22843A";
    case GroupOrderStatus.CANCELLED:
      return "#71717A";
    case GroupOrderStatus.EXCEPTION:
      return "#EF4444";
    default:
      return "#474747";
  }
};

// Backward-compatibility alias
export const GetOrderStatusColor = GetGroupOrderStatusColor;

export const GetGroupOrderStatusBackground = (
  status: GroupOrderStatus | OrderStatus | string,
): string => {
  const group = GetGroupOrderStatus(status) || (status as GroupOrderStatus);
  switch (group) {
    case GroupOrderStatus.LABEL_NOT_CREATED:
      return "#FBCFCE";
    case GroupOrderStatus.LABEL_CREATED:
      return "#F2F7FF";
    case GroupOrderStatus.WE_HAVE_YOUR_PACKAGE:
      return "#E9E9E9";
    case GroupOrderStatus.ON_THE_WAY:
      return "#CFFEF9";
    case GroupOrderStatus.OUT_FOR_DELIVERY:
      return "#FFF6EA";
    case GroupOrderStatus.DELIVERED:
      return "#EBFAEF";
    case GroupOrderStatus.CANCELLED:
      return "#F4F4F5";
    case GroupOrderStatus.EXCEPTION:
      return "#FEE2E2";
    default:
      return "#E9E9E9";
  }
};

// Backward-compatibility alias
export const GetOrderStatusBackground = GetGroupOrderStatusBackground;

export const GetShippingMethodTxt = (method: ShippingMethod): string => {
  switch (method) {
    case ShippingMethod.EPACKET:
      return "ePacket";
    case ShippingMethod.EXPRESS:
      return "Express";
    default:
      if (!method) return "";
      return String(method);
  }
};

export interface GroupOrderStatusOption {
  value: GroupOrderStatus;
  label: string;
}

export interface OrderStatusOption {
  value: GroupOrderStatus;
  label: string;
}

export const getGroupOrderStatusOptions = (): GroupOrderStatusOption[] => {
  return [
    { value: GroupOrderStatus.LABEL_NOT_CREATED, label: "Label Not Created" },
    { value: GroupOrderStatus.LABEL_CREATED, label: "Label Created" },
    { value: GroupOrderStatus.WE_HAVE_YOUR_PACKAGE, label: "We Have Your Package" },
    { value: GroupOrderStatus.ON_THE_WAY, label: "On the Way" },
    { value: GroupOrderStatus.OUT_FOR_DELIVERY, label: "Out for Delivery" },
    { value: GroupOrderStatus.DELIVERED, label: "Delivered" },
    { value: GroupOrderStatus.CANCELLED, label: "Cancelled" },
    { value: GroupOrderStatus.EXCEPTION, label: "Exception" },
  ];
};

// Backward-compatibility alias
export const getOrderStatusOptions = getGroupOrderStatusOptions;

export interface ShippingMethodOption {
  value: ShippingMethod;
  label: string;
}

export const getShippingMethodOptions = (): ShippingMethodOption[] => {
  return Object.values(ShippingMethod)
    .map((method) => ({
      value: method,
      label: GetShippingMethodTxt(method),
    }))
    .filter((opt) => Boolean(opt.label && opt.label.trim().length > 0));
};
