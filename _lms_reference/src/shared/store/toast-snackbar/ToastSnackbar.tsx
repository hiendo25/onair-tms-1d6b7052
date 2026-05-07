"use client";
import * as React from "react";
import MuiAlert, { AlertProps } from "@mui/material/Alert";
import Slide, { SlideProps } from "@mui/material/Slide";
import Snackbar from "@mui/material/Snackbar";

import { useToast } from "./toast-snackbar-context";

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

export default function ToastSnackbar() {
  const messsages = useToast((state) => state.messsages);
  const removeMessage = useToast((state) => state.removeMessage);
  const hideMessage = useToast((state) => state.hideMessage);

  const closeSnackbar = (_index: number) => {
    hideMessage(_index);
    removeMessage(_index);
  };

  return (
    <div className="onair-toast">
      {messsages.map(({ open, variant, message }, _index) => (
        <Snackbar
          key={_index}
          open={open}
          autoHideDuration={4000}
          onClose={() => closeSnackbar(_index)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          slotProps={{
            clickAwayListener: {
              onClickAway: (evt) => {
                evt.preventDefault();
                return;
              },
            },
          }}
          slots={{
            transition: (props) => <Slide {...props} direction="down" />,
          }}
        >
          <Alert
            severity={variant}
            variant="outlined"
            sx={{
              backgroundColor: "white",
              borderColor: "white",
            }}
          >
            {message}
          </Alert>
        </Snackbar>
      ))}
    </div>
  );
}
