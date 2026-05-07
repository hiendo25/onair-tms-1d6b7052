import Link from "next/link";

export default function ForbiddenPage() {
    return (
        <div className="mx-auto flex min-h-[60vh] w-full max-w-3xl flex-col items-center justify-center px-6 text-center">
            <div className="rounded-full bg-red-50 px-3 py-1 text-sm font-semibold text-red-500">
                403 Forbidden
            </div>
            <h1 className="mt-6 text-3xl font-semibold text-gray-900">
                Bạn không có quyền truy cập trang này
            </h1>
            <p className="mt-4 text-sm text-gray-600">
                Vui lòng liên hệ quản trị viên để được cấp quyền hoặc kiểm tra xem bạn đã được gán vào lớp học hay chưa.
            </p>
            <Link
                href="/"
                className="mt-8 inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
                Quay về trang chủ
            </Link>
        </div>
    );
}
