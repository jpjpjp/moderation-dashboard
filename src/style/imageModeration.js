import { makeStyles } from "@material-ui/core/styles";

export const useStyles = makeStyles((theme) => ({
  labelText: {
    color: "#606060",
  },
  card: {
    padding: "20px",
  },
  cancel: {
    width: "150px",
    margin: "3px",
    height: "37px",
    boxShadow: "0px 0px 0px white",
    backgroundColor: "white",
    border: "1px solid #707070",
    borderRadius: "8px",
    opacity: 1,
    font: "var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-normal) 13px/16px var(--unnamed-font-family-proxima-nova)",
    letterSpacing: "var(--unnamed-character-spacing-0)",
    color: "#707070",
    fontSize: "13px",
  },
  save: {
    background: "#6387ED 0% 0% no-repeat padding-box",
    borderRadius: "8px",
    opacity: 1,
    color: "white",
    width: "150px",
    margin: "8px",
    height: "37px",
    fontSize: "13px",
    "&:hover": {
      background: "#6387ED 0% 0% no-repeat padding-box",
      color: "white",
    },
  },

  testText: {
    font: "var(--unnamed-font-style-normal) normal var(--unnamed-font-weight-normal) var(--unnamed-font-size-16)/var(--unnamed-line-spacing-19) var(--unnamed-font-family-proxima-nova)",
    letterSpacing: "var(--unnamed-character-spacing-0)",
    textDecoration: "underline",
    color: "#6387ED",
    cursor: "pointer",
    opacity: 1,
    "&:hover": {
      background: "#E7EDFF",
      color: "#6387ED",
    },
  },
  loader: {
    marginRight: "5px",
    color: "white",
  },
  loaderLoading: {
    marginRight: "5px",
  },
  rerouteBtn: {
    textTransform: "none",
    marginLeft: "10px",
    backgroundColor: "#FCF0EF",
    color: "#FB6340",
    "&:hover": {
      textTransform: "none",
      marginLeft: "10px",
      backgroundColor: "#FCF0EF",
      color: "#FB6340",
    },
  },
  rerouteIcon: {
    marginRight: "5px",
  },
  infoIcon: {
    padding: "3px 0px 0px 5px",
  },
}));
