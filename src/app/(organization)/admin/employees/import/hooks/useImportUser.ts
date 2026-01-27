const useImportUser = () => {
  const handleImport = async () => {
    if (!validationResult || validationResult.invalidCount > 0) {
      notifications.show("Vui lòng sửa các lỗi trước khi import", {
        severity: "error",
        autoHideDuration: 3000,
      });
      return;
    }

    if (validationResult.validRecords.length === 0) {
      notifications.show("Không có bản ghi hợp lệ để import", {
        severity: "warning",
        autoHideDuration: 3000,
      });
      return;
    }

    setIsImporting(true);

    try {
      const formData = new FormData();
      // formData.append("file", file);

      const response = await fetch("/api/employees/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to import employees");
      }

      const result = await response.json();

      if (result.failedCount === 0) {
        notifications.show(`Import thành công ${result.successCount} nhân viên!`, {
          severity: "success",
          autoHideDuration: 3000,
        });

        setTimeout(() => {
          router.push("/admin/employees");
        }, 2000);
      } else {
        notifications.show(`Import hoàn tất: ${result.successCount} thành công, ${result.failedCount} thất bại`, {
          severity: "warning",
          autoHideDuration: 5000,
        });
      }
    } catch (error) {
      console.error("Error importing employees:", error);
      const errorMessage = error instanceof Error ? error.message : "Có lỗi xảy ra khi import nhân viên";
      notifications.show(errorMessage, {
        severity: "error",
        autoHideDuration: 5000,
      });
    } finally {
      setIsImporting(false);
    }
  };
};
