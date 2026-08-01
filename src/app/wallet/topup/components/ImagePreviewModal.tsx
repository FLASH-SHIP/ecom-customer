"use client";

import {
  ImagePreviewModal as BaseImagePreviewModal,
  type ImagePreviewModalProps as BaseProps,
} from "@flash-ship/ecom-ui";

export interface ImagePreviewModalProps extends BaseProps {}

export function ImagePreviewModal(props: ImagePreviewModalProps) {
  return <BaseImagePreviewModal {...props} />;
}
