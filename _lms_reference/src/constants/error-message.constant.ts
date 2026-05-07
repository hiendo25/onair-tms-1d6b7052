const ERROR_MESSAGES: Record<string, string> = {
  "23505": "Lỗi trùng lặp nội dung.",
};
const errorMessages = (errorCode: string, defaultMessage: string) => {
  return ERROR_MESSAGES[errorCode] || defaultMessage;
};
