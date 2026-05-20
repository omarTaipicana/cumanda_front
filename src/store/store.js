import { configureStore } from "@reduxjs/toolkit";
import alert from "./states/alert.slice"

export default configureStore({
  reducer: {
    alert
  },
});
