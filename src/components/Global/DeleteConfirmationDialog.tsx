import { Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from "@mui/material";
import { FC } from "react";

export const DeleteConfirmationDialog: FC<{open: boolean, message: string, onConfirm: () => void, onCancel: () => void}> = ({open, message, onConfirm, onCancel}) => {
    return (
      <Dialog open={open} onClose={onCancel}>
        <DialogTitle>{message}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>Delete</Button>
        </DialogActions>
      </Dialog>
    )
  };