import type { Metadata } from "next";
import Image from "next/image";

/**
 * Metadata tiêu đề mặc định cho các trang xác thực (Auth Pages)
 */
export const metadata: Metadata = {
  title: "Xác thực tài khoản | Ecom Express",
  description: "Trang đăng nhập, đăng ký và quản lý tài khoản Ecom Express",
};

/**
 * Layout dùng chung (Shared Auth Layout) thiết kế chuẩn y hệt Figma:
 * - Nền toàn màn hình: Hình ảnh background dùng chung `/assets/images/auth/background.jpg` (Next.js Image priority).
 * - Khung Form bên phải: Card màu trắng nổi (Solid White Card `bg-white dark:bg-slate-900`), bo góc `rounded-2xl`, nổi lệch bên phải (`justify-end`, `pr-4 md:pr-16 lg:pr-24 xl:pr-32`).
 * 
 * 100% Code Comment & Ghi chú bằng Tiếng Việt.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center md:justify-end overflow-x-hidden bg-slate-100 dark:bg-slate-950 py-8 px-4 md:px-12 lg:pr-24 xl:pr-32 selection:bg-[#008094] selection:text-white">
      {/* Hình ảnh nền dùng chung phủ toàn bộ viewport phía sau */}
      <div className="fixed inset-0 z-0 pointer-events-none select-none">
        <Image
          src="/assets/images/auth/background.jpg"
          alt="Background Ecom Auth"
          fill
          priority
          sizes="100vw"
          quality={85}
          className="object-cover object-center"
        />
        {/* Lớp phủ dịu nhẹ giúp nổi bật Card giao diện */}
        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[0.5px]" />
      </div>

      {/* Cụm Container chứa Floating Card bên phải màn hình */}
      <main className="relative z-10 w-full max-w-[420px] sm:max-w-[440px] flex flex-col gap-3 my-auto animate-in fade-in-0 duration-300">
        {children}
      </main>
    </div>
  );
}
