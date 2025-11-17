import PlusIcon from "@/shared/assets/icons/PlusIcon";
import { Button, FormControl, FormHelperText, FormLabel, OutlinedInput } from "@mui/material";
import { ChangeEventHandler, KeyboardEventHandler, useState } from "react";

export interface ButtonAddSectionProps {
  onOk: (title: string) => void;
}
const ButtonAddSection: React.FC<ButtonAddSectionProps> = ({ onOk }) => {
  const [openForm, setOpenForm] = useState(false);
  const [error, setError] = useState<{ message: string }>();
  const [title, setTitle] = useState("");
  const onChange: ChangeEventHandler<HTMLInputElement> = (evt) => {
    setTitle(evt.target.value);
  };
  const cancelAddSection = () => {
    setTitle("");
    setOpenForm(false);
    setError(undefined);
  };
  const clickOk = () => {
    if (!title.length) {
      setError({ message: "Không bỏ trống tiêu đề." });
      return;
    }
    onOk(title);
    setOpenForm(false);
    setTitle("");
    setError(undefined);
  };
  const handleKeyDown: KeyboardEventHandler<HTMLInputElement> = (evt) => {
    if (evt.key !== "Enter") return;
    onOk(title);
    setOpenForm(false);
    setTitle("");
    setError(undefined);
  };
  return (
    <>
      <Button startIcon={<PlusIcon />} variant="fill" fullWidth onClick={() => setOpenForm(true)} size="large">
        Tạo học phần
      </Button>
      {openForm ? (
        <div className="add-section-form mt-4">
          <div className="bg-white rounded-xl p-4">
            <FormControl className="mb-6" variant="outlined" error={!!error}>
              <FormLabel>Tiêu đề</FormLabel>
              <OutlinedInput
                value={title}
                onChange={onChange}
                onKeyDown={handleKeyDown}
                placeholder="Nhập tiêu đề học phần"
                size="small"
                fullWidth
                autoFocus
              />
              {error?.message ? <FormHelperText error>{error.message}</FormHelperText> : null}
            </FormControl>
            <div className="flex gap-2 justify-end">
              <Button variant="outlined" color="inherit" size="small" onClick={cancelAddSection}>
                Huỷ
              </Button>
              <Button variant="outlined" color="primary" size="small" onClick={clickOk}>
                Lưu
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
export default ButtonAddSection;
