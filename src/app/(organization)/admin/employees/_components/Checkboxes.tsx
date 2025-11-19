import * as React from "react";
import { pink } from "@mui/material/colors";
import Checkbox from "@mui/material/Checkbox";
import { Box } from "@mui/material";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";

const label = { inputProps: { "aria-label": "Checkbox demo" } };

export default function ColorCheckboxes() {
  const [checked, setChecked] = React.useState([true, false]);

  const handleChange1 = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked([event.target.checked, event.target.checked]);
  };

  const handleChange2 = (event: React.ChangeEvent<HTMLInputElement>) => {
    //@ts-ignore
    setChecked([event.target.checked, checked?.[1]]);
  };

  const handleChange3 = (event: React.ChangeEvent<HTMLInputElement>) => {
    //@ts-ignore
    setChecked([checked[0], event.target.checked]);
  };

  const [selectedValue, setSelectedValue] = React.useState("a");
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedValue(event.target.value);
  };

  const controlProps = (item: string) => ({
    checked: selectedValue === item,
    onChange: handleChange,
    value: item,
    name: "size-radio-button-demo",
    inputProps: { "aria-label": item },
  });

  return (
    <div>
      <Checkbox {...label} defaultChecked />
      <Checkbox {...label} defaultChecked color="secondary" />
      <Checkbox {...label} defaultChecked color="success" />
      <Checkbox {...label} defaultChecked color="default" />
      <Checkbox {...label} defaultChecked color="error" />
      <Checkbox {...label} defaultChecked color="info" />
      <div>
        <FormControlLabel
          label="Parent"
          control={
            <Checkbox
              checked={checked[0] && checked[1]}
              indeterminate={checked[0] !== checked[1]}
              onChange={handleChange1}
            />
          }
        />
        <Box sx={{ display: "flex", flexDirection: "column", ml: 3 }}>
          <FormControlLabel
            label="Primary large"
            control={<Checkbox checked={checked[0]} onChange={handleChange2} color="primary" size="large" />}
          />
          <FormControlLabel
            label="Secondary small"
            control={<Checkbox checked={checked[0]} onChange={handleChange2} color="secondary" size="small" />}
          />
          <FormControlLabel
            label="Warning"
            control={<Checkbox checked={checked[0]} onChange={handleChange2} color="warning" />}
          />
          <FormControlLabel
            label="Success"
            control={<Checkbox checked={checked[0]} onChange={handleChange2} color="success" />}
          />
          <FormControlLabel
            label="Error"
            control={<Checkbox checked={checked[0]} onChange={handleChange2} color="error" />}
          />
          <FormControlLabel
            label="default"
            control={<Checkbox checked={checked[0]} onChange={handleChange2} color="default" />}
          />
          <FormControlLabel label="Child 2" control={<Checkbox checked={checked[1]} onChange={handleChange3} />} />
        </Box>
      </div>
      <div>
        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">Gender</FormLabel>
          <RadioGroup aria-labelledby="demo-radio-buttons-group-label" defaultValue="female" name="radio-buttons-group">
            <FormControlLabel value="male" control={<Radio color="primary" />} label="Primary" />
            <FormControlLabel value="male" control={<Radio color="error" />} label="error" />
            <FormControlLabel value="male" control={<Radio color="success" />} label="Success" />
            <FormControlLabel value="male" control={<Radio color="info" />} label="Info" />
            <FormControlLabel value="male" control={<Radio color="warning" />} label="warning" />
            <FormControlLabel value="male" control={<Radio color="secondary" />} label="Secondary" />
          </RadioGroup>
        </FormControl>
        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label"></FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            // defaultValue="female"
            name="radio-buttons-group"
          >
            <FormControlLabel value="male" control={<Radio color="primary" />} label="Primary" />
            <FormControlLabel value="male" control={<Radio color="error" />} label="error" />
            <FormControlLabel value="male" control={<Radio color="success" />} label="Success" />
            <FormControlLabel value="male" control={<Radio color="info" />} label="Info" />
            <FormControlLabel value="male" control={<Radio color="warning" />} label="warning" />
            <FormControlLabel value="male" control={<Radio color="secondary" />} label="Secondary" />
          </RadioGroup>
        </FormControl>
        <div>
          <FormControlLabel control={<Radio color="info" />} label="Info" />
          <Radio {...controlProps("a")} size="small" />
          <Radio {...controlProps("b")} />
          <Radio
            {...controlProps("c")}
            sx={{
              "& .MuiSvgIcon-root": {
                fontSize: 28,
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}
