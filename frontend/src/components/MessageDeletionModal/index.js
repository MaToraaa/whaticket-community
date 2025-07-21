import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Checkbox, FormControlLabel, Button, Typography, Box } from "@material-ui/core";
import api from "../../services/api";
import { toast } from "react-toastify";
import toastError from "../../errors/toastError";

const timeRanges = ["Last hour", "Last 24 hours", "Last 7 days", "Last 4 weeks", "All time"];

const ClearDataDialog = ({ open, onClose }) => {
  const [timeRange, setTimeRange] = React.useState("Last hour");
  const [options, setOptions] = React.useState({
    browsingHistory: true,
    downloadHistory: true,
    cookies: true,
    cachedFiles: true,
  });

  const handleCheckboxChange = (option) => {
    setOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const handleClear = async () => {
    console.log("Data cleared!", timeRange, options);

    const now = new Date();
    let fromDate;

    switch (timeRange) {
      case "Last hour":
        fromDate = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case "Last 24 hours":
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "Last 7 days":
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "Last 4 weeks":
        fromDate = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
        break;
      case "All time":
      default:
        fromDate = new Date(0);
    }

    const from = fromDate.toISOString();
    const to = now.toISOString();
    try {
      await api
        .delete(`/messages/clean/`, {
          params: {
            from,
            to,
          },
        })
        .then((d) => {
          toast.success(d.message);
        });
    } catch (err) {
      toastError(err);
    }
    onClose(); // Simulasi close
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>Delete Message</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Time range</InputLabel>
          <Select value={timeRange} label='Time range' onChange={(e) => setTimeRange(e.target.value)}>
            {timeRanges.map((range) => (
              <MenuItem key={range} value={range}>
                {range}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* <FormControlLabel
          control={
            <Checkbox
              checked={options.browsingHistory}
              onChange={() => handleCheckboxChange("browsingHistory")}
            />
          }
          label="Browsing history"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={options.downloadHistory}
              onChange={() => handleCheckboxChange("downloadHistory")}
            />
          }
          label="Download history"
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={options.cookies}
              onChange={() => handleCheckboxChange("cookies")}
            />
          }
          label="Cookies and other site data"
        /> */}
        <FormControlLabel control={<Checkbox checked={options.cachedFiles} onChange={() => handleCheckboxChange("cachedFiles")} />} label='Cached images and files' />

        <Box mt={2}>
          <Typography variant='caption' color='text.secondary'>
            This will clear your data across all your synced devices. To clear browsing data from this device only, sign out first.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant='contained' color='error' onClick={handleClear}>
          Clear now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ClearDataDialog;
