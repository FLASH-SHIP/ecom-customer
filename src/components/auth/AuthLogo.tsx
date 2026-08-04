import Image from "next/image";
import NextLink from "next/link";

/**
 * @file AuthLogo.tsx
 * @description Component hiển thị Logo thương hiệu Ecom Express chuẩn trong toàn bộ luồng Auth.
 * Sử dụng hình ảnh SVG chính thức từ `/assets/images/logo/ecom-express-long.svg`.
 * 
 * 100% Code Comment & Ghi chú bằng Tiếng Việt.
 */

export function AuthLogo() {
  return (
    <NextLink href="/" className="inline-flex items-center select-none group focus:outline-none">
      <Image
        src="/assets/images/logo/ecom-express-long.svg"
        alt="Ecom Express Logo"
        width={180}
        height={44}
        priority
        className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
      />
    </NextLink>
  );
}
