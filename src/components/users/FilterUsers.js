import React from "react";
import { useStyles } from "../../style/drawer";
import Drawer from "@material-ui/core/Drawer";
import Button from "@material-ui/core/Button";
import {
  Avatar,
  Box,
  Checkbox,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@material-ui/core";

export default function FilterUsers(props) {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const [isBanChecked, setIsBanChecked] = React.useState(false);
  const [isFlagChecked, setIsFlagChecked] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    if (e.target.checked && e.target.value === "ban") {
      setIsFlagChecked(false);
      setIsBanChecked(true);
      props.isFiltered(e.target.value);
    } else if (e.target.checked && e.target.value === "flag") {
      setIsBanChecked(false);
      setIsFlagChecked(true);
      props.isFiltered(e.target.value);
    } else {
      props.isFiltered("all");
      setIsBanChecked(false);
      setIsFlagChecked(false);
    }
  };

  return (
    <>
      <Avatar id="openDrawer" variant="square" onClick={handleClickOpen} className={classes.avatar}>
        <IconButton>
          <img src={process.env.PUBLIC_URL + "/images/filter.svg"} alt="filter" />
        </IconButton>
      </Avatar>
      <Drawer anchor="right" open={open} onClose={handleClose}>
        <div className={classes.list}>
          <Box pl={3} pt={4} pr={1}>
            <Grid justify="space-between" container>
              <Grid item>
                <Typography className={classes.title}>Filters</Typography>
              </Grid>
              <Grid item>
                <Button id="drawer" onClick={handleClose}>
                  <img src={process.env.PUBLIC_URL + "/images/times.svg"} alt="filter" />
                </Button>
              </Grid>
            </Grid>
          </Box>
          <Box pl={3} pt={4}>
            <Typography testid="UserType" className={classes.userType}>
              User Type
            </Typography>
          </Box>
          <List>
            <ListItem>
              <ListItemIcon>
                <Checkbox
                  id="banCheck"
                  onChange={handleChange}
                  name="banned_users"
                  value="ban"
                  color="primary"
                  checked={isBanChecked}
                />
              </ListItemIcon>
              <ListItemText>
                <Typography testid="bannedUsers" className={classes.listText}>
                  Banned Users
                </Typography>
              </ListItemText>
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Checkbox
                  id="flagCheck"
                  onChange={handleChange}
                  name="flagged_users"
                  value="flag"
                  color="primary"
                  checked={isFlagChecked}
                />
              </ListItemIcon>
              <ListItemText>
                <Typography testid="flaggedUsers" className={classes.listText}>
                  Flagged Users
                </Typography>
              </ListItemText>
            </ListItem>
          </List>
        </div>
      </Drawer>
    </>
  );
}
