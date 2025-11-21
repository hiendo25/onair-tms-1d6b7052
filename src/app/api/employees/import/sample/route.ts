import { NextRequest, NextResponse } from "next/server";
import { generateSampleEmployeeData } from "@/services/employees/employee-sample.service";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const countParam = searchParams.get("count");
    
    let count = 15;
    if (countParam) {
      const parsedCount = parseInt(countParam, 10);
      if (isNaN(parsedCount) || parsedCount < 1 || parsedCount > 100) {
        return NextResponse.json(
          { error: "Tham số count phải là số từ 1 đến 100" },
          { status: 400 }
        );
      }
      count = parsedCount;
    }

    const sampleData = await generateSampleEmployeeData(count);

    const XLSXModule = await import("xlsx");
    const XLSX = XLSXModule.default ?? XLSXModule;

    const headers = [
      "Mã nhân viên",
      "Họ và tên",
      "Email",
      "Số điện thoại",
      "Giới tính",
      "Ngày sinh",
      "Phòng ban",
      "Chi nhánh",
      "Ngày bắt đầu",
      "Vai trò"
    ];

    const rows = sampleData.map(employee => [
      employee.employee_code,
      employee.full_name,
      employee.email,
      employee.phone_number,
      employee.gender,
      employee.birthday,
      employee.department,
      employee.branch,
      employee.start_date,
      employee.employee_type
    ]);

    const worksheetData = [headers, ...rows];
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    worksheet['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 30 },
      { wch: 15 },
      { wch: 12 },
      { wch: 15 },
      { wch: 40 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 }
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Nhân viên");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `mau_import_nhan_vien_${count}_ban_ghi_${timestamp}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error generating sample employee file:", error);

    const errorMessage = error instanceof Error
      ? error.message
      : "Có lỗi xảy ra khi tạo file mẫu";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

